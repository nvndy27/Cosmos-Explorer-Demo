import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import sys
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('quota', Path(__file__).parents[1] / 'quota_guard.py')
quota = importlib.util.module_from_spec(spec)
spec.loader.exec_module(quota)


def snapshot(used=76, weekly=14):
    return {'ordinaryUsageAllowed': True, 'rateLimits': {
        'limitId': 'codex', 'primary': {'usedPercent': used, 'windowDurationMins': 300, 'resetsAt': 5000},
        'secondary': {'usedPercent': weekly, 'windowDurationMins': 10080, 'resetsAt': 9000}}}


class QuotaPolicy(unittest.TestCase):
    def test_ten_percent_is_reserved_inclusively(self):
        self.assertTrue(quota.assess(snapshot(89), now=1000)['allowed'])
        held = quota.assess(snapshot(90), now=1000)
        self.assertFalse(held['allowed'])
        self.assertEqual(held['five_hour']['remaining_percent'], 10)
        self.assertEqual(held['retry_at'], 5030)

    def test_five_hour_window_is_not_assumed_to_be_primary(self):
        data = snapshot(90)
        bucket = data['rateLimits']
        bucket['primary'], bucket['secondary'] = bucket['secondary'], bucket['primary']
        self.assertFalse(quota.assess(data, now=1000)['allowed'])

    def test_weekly_exhaustion_and_backend_blocks_hold_work(self):
        self.assertEqual(quota.assess(snapshot(5, 100), now=1000)['retry_at'], 9030)
        data = snapshot(5)
        data['ordinaryUsageAllowed'] = False
        self.assertFalse(quota.assess(data, now=1000)['allowed'])
        data = snapshot(5)
        data['rateLimits']['rateLimitReachedType'] = 'weekly'
        self.assertFalse(quota.assess(data, now=1000)['allowed'])

    def test_unknown_or_invalid_usage_is_not_assumed_available(self):
        for used in (None, True, -1, 101, float('nan')):
            with self.assertRaises(ValueError):
                quota.assess(snapshot(used))
        with self.assertRaises(ValueError):
            quota.assess({'rateLimits': {'limitId': 'codex'}})
        with patch.object(quota, 'fetch_limits', side_effect=TimeoutError('offline')):
            result = quota.check()
            self.assertFalse(result['allowed'])
            self.assertEqual(result['reason'], 'quota_unknown')

    def test_clock_passing_reset_is_not_proof_of_refill(self):
        held = quota.assess(snapshot(90), now=8000)
        self.assertFalse(held['allowed'])
        self.assertGreater(held['retry_at'], 8000)

    def test_resume_is_submitted_only_once_after_live_recovery(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(quota, 'LOCAL', Path(temporary)):
            held = quota.assess(snapshot(90), now=1000)
            available = quota.assess(snapshot(0), now=5100)
            with patch.object(quota, 'check', side_effect=[held, available, available]), \
                 patch.object(quota, 'resume_coordinator', return_value={'status': 'accepted', 'request_id': 'one'}) as resume, \
                 contextlib.redirect_stdout(io.StringIO()):
                quota.tick()
                self.assertTrue(json.loads((Path(temporary) / 'quota-state.json').read_text())['resume_pending'])
                quota.tick()
                quota.tick()
                self.assertEqual(resume.call_count, 1)

    def test_busy_coordinator_remains_pending_and_ambiguous_send_does_not_repeat(self):
        held = quota.assess(snapshot(90), now=1000)
        available = quota.assess(snapshot(0), now=5100)
        state = quota.transition({}, held)
        self.assertTrue(quota.transition(state, available)['resume_pending'])
        state.update(resume_submitting=True)
        recovered = quota.transition(state, available)
        self.assertFalse(recovered['resume_pending'])
        self.assertTrue(recovered['resume_needs_inspection'])

    def test_busy_session_is_rechecked_without_submitting_duplicate_work(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(quota, 'LOCAL', Path(temporary)):
            with patch.object(quota, 'check', side_effect=[quota.assess(snapshot(90)),
                                                         quota.assess(snapshot(0)), quota.assess(snapshot(0))]), \
                 patch.object(quota, 'resume_coordinator', side_effect=[{'status': 'coordinator_busy'},
                                                                       {'status': 'accepted'}]) as resume, \
                 contextlib.redirect_stdout(io.StringIO()):
                quota.tick()
                quota.tick()
                self.assertTrue(json.loads((Path(temporary) / 'quota-state.json').read_text())['resume_pending'])
                quota.tick()
                self.assertEqual(resume.call_count, 2)
                self.assertFalse(json.loads((Path(temporary) / 'quota-state.json').read_text())['resume_pending'])

    def test_ambiguous_transport_requires_inspection_instead_of_resending(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(quota, 'LOCAL', Path(temporary)):
            with patch.object(quota, 'check', side_effect=[quota.assess(snapshot(90)),
                                                         quota.assess(snapshot(0)), quota.assess(snapshot(0))]), \
                 patch.object(quota, 'resume_coordinator', side_effect=TimeoutError('send uncertain')) as resume, \
                 contextlib.redirect_stdout(io.StringIO()):
                quota.tick()
                quota.tick()
                quota.tick()
                self.assertEqual(resume.call_count, 1)
                self.assertTrue(json.loads((Path(temporary) / 'quota-state.json').read_text())['resume_needs_inspection'])

    def test_automation_holds_ready_work_without_launching_or_marking_it_failed(self):
        auto_spec = importlib.util.spec_from_file_location('quota_automation', Path(__file__).parents[1] / 'automation.py')
        auto = importlib.util.module_from_spec(auto_spec)
        auto_spec.loader.exec_module(auto)
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'automation').mkdir()
            task = {'id': 'A', 'lane': 'codex-1', 'status': 'ready', 'depends_on': [],
                    'allowed_paths': ['docs/example.md'], 'title': 'example', 'acceptance': 'example'}
            (root / 'automation/config.json').write_text(json.dumps({'agy_reviewers': 2, 'require_browser': False}))
            (root / 'automation/backlog.json').write_text(json.dumps({'tasks': [task]}))
            with patch.object(auto, 'ROOT', root), patch.object(auto, 'LOCAL', root / '.automation'), \
                 patch.object(auto, 'clean', return_value=True), \
                 patch.object(auto, 'git', side_effect=lambda *args, **kwargs: 'main' if args[0] == 'branch' else 'base'), \
                 patch.object(auto, 'gates'), patch.object(auto, 'worker') as worker, \
                 patch.dict(sys.modules, {'quota_guard': quota}), \
                 patch.object(quota, 'check', return_value=quota.assess(snapshot(90))), \
                 patch.object(quota, 'record_hold') as hold, contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(auto.cycle(), 0)
                worker.assert_not_called()
                hold.assert_called_once()
            self.assertEqual(json.loads((root / '.automation/latest.json').read_text())['status'], 'waiting_quota')
            self.assertFalse((root / '.automation/state.json').exists())
            self.assertEqual(json.loads((root / 'automation/backlog.json').read_text())['tasks'][0]['status'], 'ready')


if __name__ == '__main__':
    unittest.main()

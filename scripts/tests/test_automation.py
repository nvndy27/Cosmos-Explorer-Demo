import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('automation', Path(__file__).parents[1] / 'automation.py')
auto = importlib.util.module_from_spec(spec)
spec.loader.exec_module(auto)


class SafetyGates(unittest.TestCase):
    def task(self, **extra):
        return dict(id='A', lane='codex-1', status='ready', depends_on=[],
                    allowed_paths=['docs/example.md'], **extra)

    def test_dependencies_and_failed_tasks_do_not_run(self):
        tasks = [self.task()]
        self.assertEqual(auto.selected_tasks({'tasks': tasks}, {'blocked': {'A': {}}}), [])
        tasks[0]['depends_on'] = ['missing']
        self.assertEqual(auto.selected_tasks({'tasks': tasks}, {}), [])

    def test_scope_must_be_safe_and_unprotected(self):
        for path in ('../outside', '/etc/passwd', 'automation/config.json',
                     'cosmos-explorer/catalog-expanded.js', 'AGENTS.md'):
            task = self.task()
            task['allowed_paths'] = [path]
            with self.assertRaises(ValueError):
                auto.selected_tasks({'tasks': [task]}, {})

    def test_file_ownership_cannot_overlap(self):
        other = self.task()
        other.update(id='B', lane='codex-2')
        with self.assertRaises(ValueError):
            auto.selected_tasks({'tasks': [self.task(), other]}, {})

    def test_agy_envelope_and_contradictory_approval(self):
        review = dict(verdict='approve', summary='Đạt', issues=[])
        self.assertEqual(auto.parse_review(json.dumps({'status': 'SUCCESS',
                                                       'response': json.dumps(review)})), review)
        review['issues'] = ['blocking defect']
        with self.assertRaises(ValueError):
            auto.parse_review(json.dumps(review))
        for value in ('not json', '{}', '{"status":"ERROR","response":"quota"}'):
            with self.assertRaises(ValueError):
                auto.parse_review(value)


if __name__ == '__main__':
    unittest.main()

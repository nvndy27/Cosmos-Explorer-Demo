#!/usr/bin/env python3
"""Read Codex quota without model turns; hold new work and resume after reset."""
import argparse
import fcntl
import json
import math
import os
from pathlib import Path
import selectors
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / '.automation'


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temp.replace(path)


def load(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def fetch_limits(timeout=25):
    """Only initialize and account/rateLimits/read. Never redeem reset credits."""
    process = subprocess.Popen(['rtk', 'proxy', 'codex', 'app-server', '--listen', 'stdio://'],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                               stderr=subprocess.DEVNULL, start_new_session=True)
    selector = selectors.DefaultSelector()
    selector.register(process.stdout, selectors.EVENT_READ)
    buffer = b''
    deadline = time.monotonic() + timeout

    def send(value):
        process.stdin.write((json.dumps(value) + '\n').encode())
        process.stdin.flush()

    def receive(request_id):
        nonlocal buffer
        while time.monotonic() < deadline:
            while b'\n' in buffer:
                line, buffer = buffer.split(b'\n', 1)
                try:
                    value = json.loads(line)
                except ValueError:
                    continue
                if value.get('id') == request_id:
                    if 'error' in value:
                        raise RuntimeError('Codex quota RPC failed: ' + str(value['error'].get('code')))
                    return value['result']
            if not selector.select(max(0, deadline - time.monotonic())):
                break
            chunk = os.read(process.stdout.fileno(), 65536)
            if not chunk:
                raise RuntimeError('Codex quota connection closed')
            buffer += chunk
            if len(buffer) > 2_000_000:
                raise RuntimeError('Unexpectedly large quota response')
        raise TimeoutError('Codex quota read timed out')

    try:
        send({'id': 1, 'method': 'initialize', 'params': {
            'clientInfo': {'name': 'cosmos-quota-monitor', 'version': '1.0'}}})
        receive(1)
        send({'method': 'initialized'})
        send({'id': 2, 'method': 'account/rateLimits/read'})
        return receive(2)
    finally:
        selector.close()
        if process.poll() is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
        process.stdin.close()
        process.stdout.close()


def assess(payload, minimum=50, now=None):
    """A 300-minute window is identified by duration, never primary position."""
    now = time.time() if now is None else now
    if (isinstance(minimum, bool) or not isinstance(minimum, (int, float))
            or not math.isfinite(minimum) or not 0 < minimum < 100):
        raise ValueError('minimum remaining must be between 0 and 100')
    buckets = payload.get('rateLimitsByLimitId') or {}
    bucket = buckets.get('codex') or payload.get('rateLimits')
    if not isinstance(bucket, dict) or bucket.get('limitId') not in (None, 'codex'):
        raise ValueError('Codex quota bucket unavailable')
    windows = []
    for key in ('primary', 'secondary'):
        window = bucket.get(key)
        if window is None:
            continue
        if not isinstance(window, dict):
            raise ValueError('Invalid quota window')
        used = window.get('usedPercent')
        duration = window.get('windowDurationMins')
        reset = window.get('resetsAt')
        if (isinstance(used, bool) or not isinstance(used, (int, float))
                or not math.isfinite(used) or not 0 <= used <= 100
                or isinstance(duration, bool) or not isinstance(duration, int) or duration <= 0
                or isinstance(reset, bool) or not isinstance(reset, int) or reset <= 0):
            raise ValueError('Invalid quota window')
        windows.append({'minutes': duration, 'remaining_percent': 100 - used, 'resets_at': reset})
    short = [w for w in windows if w['minutes'] == 300]
    if len(short) != 1:
        raise ValueError('No unambiguous five-hour quota window')
    held = [w for w in windows if w['remaining_percent'] <= 0
            or (w['minutes'] == 300 and w['remaining_percent'] <= minimum)]
    backend_blocked = (payload.get('ordinaryUsageAllowed') is False
                       or bucket.get('spendControlReached') is True
                       or bucket.get('rateLimitReachedType') is not None)
    blocked = bool(held) or backend_blocked
    return {'checked_at': now, 'allowed': not blocked, 'minimum_remaining_percent': minimum,
            'five_hour': short[0], 'windows': windows,
            'reason': 'quota_reserve' if held else 'backend_blocked' if backend_blocked else 'available',
            'retry_at': max([w['resets_at'] + 30 for w in held] + [now + 120]) if blocked else None}


def check(minimum=50):
    try:
        return assess(fetch_limits(), minimum)
    except Exception as error:
        return {'allowed': False, 'checked_at': time.time(), 'reason': 'quota_unknown',
                'error': str(error), 'retry_at': time.time() + 120}


def transition(previous, current):
    value = dict(current)
    # Unknown quota also holds work; recovery is confirmed with another live read.
    value['resume_pending'] = bool(previous.get('resume_pending') or not current['allowed'])
    if not current['allowed']:
        value['held_since'] = previous.get('held_since', current['checked_at'])
    if previous.get('resume_needs_inspection') or previous.get('resume_submitting'):
        value['resume_needs_inspection'] = True
        value['resume_pending'] = False
    return value


def record_hold(decision):
    LOCAL.mkdir(exist_ok=True)
    with (LOCAL / 'quota.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        path = LOCAL / 'quota-state.json'
        save(path, transition(load(path, {}), decision))


def resume_coordinator(binding):
    LOCAL.mkdir(exist_ok=True)
    with (LOCAL / 'lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status': 'pipeline_busy'}
        return _resume_bound_coordinator(binding)


def _resume_bound_coordinator(binding):
    """Only address the bound, still-identical idle session; never guess a tab."""
    def cli(*args):
        result = subprocess.run(['rtk', 'proxy', 'orca-ide', *args, '--json'],
                                capture_output=True, text=True, timeout=20, check=True)
        value = json.loads(result.stdout)
        if not value.get('ok'):
            raise RuntimeError('Orca rejected resume operation')
        return value['result']

    try:
        terminals = cli('terminal', 'list')['terminals']
    except Exception as error:
        return {'status': 'coordinator_unavailable', 'error': str(error)}
    terminal = next((t for t in terminals
                     if t.get('handle') == binding.get('handle')
                     and t.get('incarnationId') == binding.get('incarnationId')
                     and t.get('worktreePath') == str(ROOT)
                     and t.get('agentIdentity') == 'codex'), None)
    if not terminal:
        return {'status': 'coordinator_unavailable'}
    try:
        wait = cli('terminal', 'wait', '--terminal', terminal['handle'], '--for', 'tui-idle',
                   '--timeout-ms', '1000')
    except Exception as error:
        return {'status': 'coordinator_unavailable', 'error': str(error)}
    if not wait.get('wait', {}).get('satisfied'):
        return {'status': 'coordinator_busy'}
    minimum = load(ROOT / 'automation/config.json', {}).get('minimum_remaining_5h_percent', 50)
    prompt = (f'Hạn mức Codex đã được kiểm tra lại và còn trên {minimum}% cửa sổ 5 giờ. '
              'Người dùng đã yêu cầu tự tiếp tục sau reset. Tiếp tục Cosmos Explorer từ '
              '.automation/quota-state.json, các checkpoint .automation/live-*/state.json '
              'và backlog đã duyệt. Dùng lại các terminal đúng dự án còn rảnh, giữ worktree '
              'riêng, review 2 AGY và kiểm tra trước tích hợp. Kiểm quota trước giao việc mới. '
              'Không deploy công khai, không liên hệ bên ngoài, không tự mở các cổng '
              'SCI-001/USER-001/PUB-001 cần người thật. Không dùng reset credit hay đổi tài khoản.')
    receipt = cli('terminal', 'send', '--terminal', terminal['handle'], '--text', prompt,
                  '--enter', '--wait-submit', '5')
    send = receipt.get('send', {})
    return {'status': 'accepted' if send.get('accepted') else 'not_accepted',
            'request_id': send.get('prompt', {}).get('requestId'),
            'stages': send.get('prompt', {}).get('stages', [])}


def tick():
    LOCAL.mkdir(exist_ok=True)
    with (LOCAL / 'quota.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        state_path = LOCAL / 'quota-state.json'
        previous = load(state_path, {})
        config = load(ROOT / 'automation/config.json', {})
        current = check(config.get('minimum_remaining_5h_percent', 50))
        state = transition(previous, current)
        # Persist before submitting; an ambiguous transport result must not cause duplicate input.
        if state['allowed'] and state['resume_pending']:
            binding = load(LOCAL / 'coordinator.json', {})
            state['resume_attempt_at'] = time.time()
            state['resume_submitting'] = True
            save(state_path, state)
            try:
                result = resume_coordinator(binding)
                state['resume_result'] = result
                state['resume_submitting'] = False
                if result['status'] == 'accepted':
                    state['resume_pending'] = False
            except Exception as error:
                state['resume_result'] = {'status': 'unverifiable', 'error': str(error)}
                # A send may have been accepted despite a transport failure. Require inspection.
                state['resume_pending'] = False
                state['resume_needs_inspection'] = True
        save(state_path, state)
        print(json.dumps(state, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'tick'])
    args = parser.parse_args()
    if args.command == 'tick':
        tick()
        return 0
    config = load(ROOT / 'automation/config.json', {})
    result = check(config.get('minimum_remaining_5h_percent', 50))
    if not result['allowed']:
        record_hold(result)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['allowed'] else 75


if __name__ == '__main__':
    raise SystemExit(main())

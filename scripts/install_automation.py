#!/usr/bin/env python3
"""Install the repository-specific systemd user timer (no root privileges)."""
import argparse
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--enable', action='store_true')
    parser.add_argument('--playwright-module', required=True)
    parser.add_argument('--chrome', default='/usr/bin/google-chrome')
    args = parser.parse_args()
    for value in (str(ROOT), args.playwright_module, args.chrome):
        if any(c in value for c in ('\n', '\r', '"', '%', '\\')):
            parser.error('Unsupported character in path')
    rtk = shutil.which('rtk')
    if not rtk:
        parser.error('rtk not found')
    units = Path.home() / '.config/systemd/user'
    units.mkdir(parents=True, exist_ok=True)
    local = ROOT / '.automation'
    local.mkdir(exist_ok=True)
    env = local / 'runtime.env'
    env.write_text(f'COSMOS_PLAYWRIGHT_MODULE="{args.playwright_module}"\nCOSMOS_CHROME="{args.chrome}"\n')
    env.chmod(0o600)
    (units / 'cosmos-explorer.service').write_text(f'''[Unit]
Description=Cosmos Explorer bounded CLI maintenance
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory={ROOT}
Environment=PATH={Path.home()}/.local/bin:/usr/local/bin:/usr/bin:/bin:/snap/bin
EnvironmentFile={env}
ExecStart="{rtk}" proxy /usr/bin/python3 "{ROOT}/scripts/automation.py" run
TimeoutStartSec=45min
KillMode=control-group
UMask=0077
''')
    (units / 'cosmos-explorer.timer').write_text('''[Unit]
Description=Daily Cosmos Explorer maintenance

[Timer]
OnCalendar=*-*-* 09:00:00 Asia/Ho_Chi_Minh
Persistent=true
Unit=cosmos-explorer.service

[Install]
WantedBy=timers.target
''')
    subprocess.run(['rtk', 'proxy', 'systemctl', '--user', 'daemon-reload'], check=True)
    if args.enable:
        subprocess.run(['rtk', 'proxy', 'systemctl', '--user', 'enable', '--now',
                        'cosmos-explorer.timer'], check=True)
    print('Installed user units at', units)

if __name__ == '__main__':
    main()

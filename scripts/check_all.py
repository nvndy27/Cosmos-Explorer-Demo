#!/usr/bin/env python3
"""Mandatory local gates, optionally including the real Chrome QA suite."""
import argparse
import os
import shutil
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def commands(browser=False):
    result = [["node", "--check", "cosmos-explorer/" + name + ".js"] for name in
              ("app", "catalog", "scene", "catalog-expanded", "explorer-model", "explorer-ui")]
    result += [["node", "--check", "scripts/check_http.cjs"],
               ["node", "--check", "scripts/check_storage.cjs"],
               ["node", "--check", "scripts/check_share.cjs"],
               ["node", "--check", "scripts/check_security.cjs"],
               ["node", "--check", "scripts/check_personas.cjs"],
               ["node", "--check", "scripts/check_privacy.cjs"],
               ["python3", "-m", "unittest", "discover", "-s", "scripts/tests"],
               ["node", "cosmos-explorer/tests/smoke.cjs"],
               ["node", "scripts/validate_catalog.cjs"]]
    if browser:
        result += [["node", "scripts/check_browser.cjs"],
                   ["node", "scripts/check_exoplanet_images.cjs"],
                   ["node", "scripts/check_http.cjs"],
                   ["node", "scripts/check_storage.cjs"],
                   ["node", "scripts/check_share.cjs"],
                   ["node", "scripts/check_security.cjs"],
                   ["node", "scripts/check_personas.cjs"],
                   ["node", "scripts/check_privacy.cjs"]]
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", action="store_true")
    args = parser.parse_args()
    for cmd in commands(args.browser):
        print("RUN " + " ".join(cmd), flush=True)
        subprocess.run((["rtk", "proxy"] if shutil.which("rtk") else []) + cmd, cwd=ROOT, check=True, timeout=240,
                       env=os.environ.copy())
    print("PASS mandatory gates" + (" including Chrome" if args.browser else "; browser NOT run"))

if __name__ == "__main__":
    main()

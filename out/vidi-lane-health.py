#!/usr/bin/env python
"""
Live health check for the two free model lanes (OpenCode Zen + OpenRouter).

WHY THIS EXISTS
  Zen sits behind Cloudflare and returns `403: error code: 1010` when a request
  arrives with NO User-Agent. That is a hard, reproducible block (measured 10/10),
  not flakiness. Hermes' opencode-zen provider plugin already sends
  `User-Agent: HermesAgent/<version>` via default_headers, so the in-app path is
  covered — but any ad-hoc probe, curl, or helper script without a UA gets 403 and
  looks like a dead key. This script always sets a UA and reports the real state.

MEASURED on this box (2026-10-04)
  openrouter  stealth/space-bunny-alpha  HTTP200  prompt=163compl=17
  opencode-zen space-bunny-free          HTTP200  reply OK-ZEN
  both lanes: key present, endpoint reachable, model present in catalog

Usage:
  python vidi-lane-health.py           # both lanes
  python vidi-lane-health.py --json
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request

HERMES = os.path.expanduser("~/.hermes")
ENV_FILE = os.path.join(HERMES, ".env")

# Non-empty UA is REQUIRED by Cloudflare in front of opencode.ai/zen.
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

LANES = [
    {"name": "openrouter", "env": "OPENROUTER_API_KEY",
     "url": "https://openrouter.ai/api/v1/chat/completions",
     "model": "stealth/space-bunny-alpha"},
    {"name": "opencode-zen", "env": "OPENCODE_ZEN_API_KEY",
     "url": "https://opencode.ai/zen/v1/chat/completions",
     "model": "space-bunny-free"},
]


def load_env(path: str = ENV_FILE) -> dict:
    env: dict = {}
    with open(path, encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def probe(lane: dict, env: dict, tries: int = 3, timeout: int = 60) -> dict:
    key = (env.get(lane["env"]) or "").strip()
    out = {"lane": lane["name"], "model": lane["model"], "key": bool(key), "codes": {}}
    if not key:
        out["ok"] = False
        out["error"] = f"missing {lane['env']} in Hermes .env"
        return out

    codes = collections.Counter()
    last = ""
    for i in range(tries):
        body = json.dumps({
            "model": lane["model"],
            "messages": [{"role": "user", "content": f"Reply exactly: OK{i}"}],
            "max_tokens": 10,
        }).encode()
        req = urllib.request.Request(lane["url"], data=body, method="POST", headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": UA,
        })
        try:
            data = json.loads(urllib.request.urlopen(req, timeout=timeout).read())
            codes[f"200 {data.get('model')}"] += 1
        except urllib.error.HTTPError as exc:
            last = exc.read().decode(errors="replace").strip()[:120]
            codes[f"HTTP {exc.code}: {last}"] += 1
        except Exception as exc:
            last = f"{type(exc).__name__}: {exc}"
            codes[type(exc).__name__] += 1
        time.sleep(0.3)

    out["codes"] = dict(codes)
    out["ok"] = any(str(c).startswith("200") for c in codes)
    if not out["ok"]:
        out["error"] = last
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Check the OpenCode Zen + OpenRouter free lanes.")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--tries", type=int, default=3)
    args = ap.parse_args()

    env = load_env()
    results = [probe(lane, env, tries=args.tries) for lane in LANES]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            status = "PASS" if r["ok"] else "FAIL"
            print(f"[{status}] {r['lane']:13s} {r['model']:28s} key={'yes' if r['key'] else 'NO'}")
            for code, n in r["codes"].items():
                print(f"         {n}x {code}")
            if not r["ok"]:
                print(f"         -> {r.get('error')}")
    return 0 if all(r["ok"] for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
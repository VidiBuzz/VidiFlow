#!/usr/bin/env python3
"""Sweep M:/code/VidiBot for new/changed docs; emit a per-bot routing report.
Run via Hermes cron (every 2h). State: vidibot-sweep-state.json next to this script.
"""
import os, json, time, hashlib

ROOT = r"M:\code\VidiBot"
HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "vidibot-sweep-state.json")
EXCLUDE = (".git", "node_modules", "_sync-backups", "__pycache__", ".pytest_cache")

ROUTES = [
 ("2x2", "equitygen"), ("equitygen", "equitygen"),
 ("viditwin", "viditwin"), ("vidicity", "vidicity"),
 ("vidismart", "vidismart"), ("vidimodels", "hermes_gateway"),
 ("vidiblast", "vidimail_vidiblast"), ("vidimail", "vidimail_vidiblast"),
 ("vidibio", "vidibio"), ("isovoice", "isovoice"),
 ("airpmd", "airpmd"), ("hydra", "mez"), ("mez", "mez"),
 ("vidiflow", "vidiflow"), ("vidi-news", "vidinews"),
 ("vidinews", "vidinews"),
 ("lex", "lex_lexicon"), ("grok", "vidibot"),
 ("comfyui", "mez"), ("qwen", "mez"), ("local-model", "mez"),
]

def route(relpath):
    low = relpath.lower()
    for key, bot in ROUTES:
        if key in low: return bot
    return "vidibot"

def scan():
    state = {"seen": {}}
    if os.path.exists(STATE):
        try: state = json.load(open(STATE, encoding="utf-8"))
        except Exception: pass
    seen = state.setdefault("seen", {})
    now = time.time(); fresh = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
        for f in filenames:
            if not f.lower().endswith((".md", ".txt", ".json")): continue
            p = os.path.join(dirpath, f)
            try: st = os.stat(p)
            except OSError: continue
            if now - st.st_mtime > 90*86400: continue
            rel = os.path.relpath(p, ROOT); key = rel.lower()
            _parts = p.split(os.sep)
            if any(x.startswith(".next") or x.startswith(".vite") for x in _parts): continue  # build artifacts (.next/.next-prod/.next-8091), not docs
            if any(x.startswith(".") for x in _parts[len(os.path.abspath(ROOT).split(os.sep)):]): continue  # hidden dirs
            sig = hashlib.md5(open(p,'rb').read()).hexdigest()[:8] if st.st_size < 5_000_000 else "big"
            if seen.get(key) != sig:
                fresh.append({"path": rel, "bot": route(rel), "bytes": st.st_size})
                seen[key] = sig
    state["last_run"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    json.dump(state, open(STATE, "w", encoding="utf-8"), indent=1)
    return fresh, state["last_run"]

if __name__ == "__main__":
    fresh, at = scan()
    bybot = {}
    for it in fresh: bybot.setdefault(it["bot"], []).append(it)
    out = {"new": len(fresh), "at": at,
           "by_bot": {b: {"count": len(v), "items": v[:30]} for b, v in sorted(bybot.items())}}
    print(json.dumps(out, indent=1))
    with open(os.path.join(HERE, "vidibot-sweep-latest.json"), "w") as fh: json.dump(out, fh, indent=1)

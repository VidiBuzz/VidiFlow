#!/usr/bin/env python3
r"""VidiBot periodic security audit (James, 2026-10-09). Silent when clean (cron no_agent delivers nothing); prints FINDINGS block only when something is wrong. Always appends to the log.

A. Known-exposed API_SERVER_KEY prefix in fleet/public/doc trees (not all of M:\code - bounded for speed)
B. Secret-shaped strings in publicly-served site trees
C. cdn.vidi.news/v20-peer-setup.txt must stay 404 (200 = re-exposed -> FINDING)
D. Our .env must keep its four API_SERVER_* lines (drift detection)
"""
import os, re, sys, urllib.request, urllib.error, datetime

EXPOSED_KEY = "ec9c0639577f9abca"
SCAN_TREES = [
    r"M:\code\vidismart\landing", r"M:\code\vidismart\lex-backup-20261001",
    r"M:\code\vidimodels", r"M:\code\vidicity\vidicity-v2\frontend",
    r"M:\code\EquityGen\site", r"M:\code\viditwin\landing",
    r"M:\code\VidiFlow\LEX", r"M:\code\VidiBot\vidiflow-hx\public",
    r"M:\code\VidiFlow\out", r"M:\code\VidiFlow\docs", r"M:\code\VidiFlow\tools",
    r"M:\code\vidimodels\vidibio",
]
SKIP_DIRS = {".git", "node_modules", "_raw", "_backup-20261009", "_shots", "cache",
             "build-logs", "target", "dist", "build", ".venv", "venv",
             "__pycache__", ".next", "out-jobs", "node_modules"}
TEXT_EXT = {".md", ".txt", ".env", ".json", ".js", ".html", ".yml", ".yaml",
            ".sh", ".py", ".cfg", ".ini", ".conf", ".ts", ".css", ".csv"}
SECRET_PAT = re.compile(r"""(API_SERVER_KEY['"]?\s*[=:\s]+['"]?[0-9a-f]{32,}|sk-[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9_\-\.]{40,})""")
ENV = r"C:\Users\James\AppData\Local\hermes\.env"
LEAK_URL = "https://cdn.vidi.news/v20-peer-setup.txt"
LOG = r"M:\code\VidiFlow\out\fleet\security-audit.log"

findings = []
# C first (fast, network)
try:
    req = urllib.request.Request(LEAK_URL, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        findings.append(f"C: LEAK URL LIVE AGAIN - HTTP {r.status} at {LEAK_URL}")
except urllib.error.HTTPError as e:
    if e.code != 404:
        findings.append(f"C: leak URL returned {e.code} (expected 404)")
except Exception:
    pass
# D
try:
    t = open(ENV, encoding="utf-8", errors="ignore").read()
    for name in ("API_SERVER_ENABLED", "API_SERVER_HOST", "API_SERVER_PORT", "API_SERVER_KEY"):
        if name + "=" not in t:
            findings.append(f"D: {name} missing from .env")
except Exception as e:
    findings.append(f"D: .env unreadable: {e}")
# A+B one pass over bounded trees
for base in SCAN_TREES:
    if not os.path.isdir(base):
        continue
    for dirpath, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if os.path.splitext(f)[1].lower() not in TEXT_EXT or f in ("security-audit.log", "security-audit.py"):
                continue
            p = os.path.join(dirpath, f)
            try:
                if os.path.getsize(p) > 1_000_000:
                    continue
                with open(p, encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
            except Exception:
                continue
            if EXPOSED_KEY in content:
                findings.append(f"A: exposed-key string in {p}")
            for m in SECRET_PAT.finditer(content):
                findings.append(f"B: secret-shaped in {p}: {m.group(0)[:24]}...")

ts = datetime.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
os.makedirs(os.path.dirname(LOG), exist_ok=True)
with open(LOG, "a", encoding="utf-8") as fh:
    fh.write(f"\n[{ts}] AUDIT run\n" + ("\n".join("  FINDING " + f for f in findings) if findings else "  AUDIT-OK (0 findings)\n"))
if findings:
    print(f"SECURITY AUDIT {ts}: {len(findings)} finding(s)")
    for f in findings:
        print("  -", f)
    sys.exit(0)   # stdout delivered by cron no_agent
else:
    sys.exit(0)   # clean = silent stdout = nothing delivered

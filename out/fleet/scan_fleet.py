"""Scan M:\\code\\VidiBot lanes + BOT-ROSTER.md bots and emit fleet.json.

Read-only. No network, no API calls — local file stats and markdown parsing only.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

VIDIBOT = Path(r"M:\code\VidiBot")
ROSTER = VIDIBOT / "BOT-ROSTER.md"
PROFILES = Path(os.path.expandvars(r"%LOCALAPPDATA%\hermes\profiles"))
OUT = Path(__file__).resolve().parent / "fleet.json"

SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".pytest_cache", "shots",
             "screenshots", "images", "fonts", "stack-shots", "bosa-cnbc-screenshots"}

# ── roster parsing ──────────────────────────────────────────────────
ROSTER_RE = re.compile(r"^###\s+(?:\d+\.\s+)?(.+?)\s*$")
ROLE_RE = re.compile(r"^-\s+\*\*role:\*\*\s*(.+?)\s*$")
ID_RE = re.compile(r"^-\s+\*\*id:\*\*\s*`([^`]+)`")
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$")


def parse_roster() -> list[dict]:
    if not ROSTER.is_file():
        return []
    text = ROSTER.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    # section headings by line number
    sections: list[tuple[int, str]] = []
    for i, ln in enumerate(lines):
        m = SECTION_RE.match(ln)
        if m:
            sections.append((i, m.group(1).strip()))

    def section_for(idx: int) -> str:
        cur = ""
        for i, name in sections:
            if i <= idx:
                cur = name
            else:
                break
        return cur

    bots: list[dict] = []
    cur: dict | None = None
    for i, ln in enumerate(lines):
        m = ROSTER_RE.match(ln)
        if m:
            if cur:
                bots.append(cur)
            name = m.group(1).strip()
            cur = {"name": name, "section": section_for(i), "id": None, "role": ""}
            continue
        if cur is None:
            continue
        mid = ID_RE.match(ln)
        if mid and not cur["id"]:
            cur["id"] = mid.group(1)
        mr = ROLE_RE.match(ln)
        if mr and not cur["role"]:
            cur["role"] = mr.group(1).strip()
    if cur:
        bots.append(cur)
    return bots


# ── live profile probing ───────────────────────────────────────────
def probe_profiles() -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not PROFILES.is_dir():
        return out
    for d in sorted(PROFILES.iterdir()):
        if not d.is_dir() or d.name.startswith("."):
            continue
        cfg = d / "config.yaml"
        model = provider = None
        if cfg.is_file():
            for ln in cfg.read_text(encoding="utf-8", errors="replace").splitlines():
                s = ln.strip()
                if s.startswith("default:") and model is None:
                    model = s.split(":", 1)[1].strip()
                elif s.startswith("provider:") and provider is None:
                    provider = s.split(":", 1)[1].strip()
        jobs = execs = 0
        cdir = d / "cron"
        jf = cdir / "jobs.json"
        if jf.is_file():
            try:
                data = json.loads(jf.read_text(encoding="utf-8"))
                jobs = len(data if isinstance(data, list) else data.get("jobs", [data]))
            except (OSError, ValueError):
                pass
        db = cdir / "executions.db"
        if db.is_file():
            try:
                import sqlite3
                con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
                execs = con.execute("select count(*) from executions").fetchone()[0]
                con.close()
            except sqlite3.Error:
                pass
        out[d.name] = {
            "model": model, "provider": provider,
            "auth": (d / "auth.json").is_file(),
            "jobs": jobs, "executions": execs,
        }
    return out


# ── lane scanning ──────────────────────────────────────────────────
def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", name.lower())


def build_matches(bots: list[dict], profiles: dict[str, dict]) -> dict[str, str]:
    """Map roster bot name -> live profile dir name, by slug containment."""
    hits: dict[str, str] = {}
    for b in bots:
        bs = slug(b["name"])
        if not bs:
            continue
        best = None
        for pname in profiles:
            ps = slug(pname)
            if bs == ps or (len(bs) >= 4 and bs in ps) or (len(ps) >= 4 and ps in bs):
                if best is None or len(ps) < len(slug(best)):
                    best = pname
        if best:
            hits[b["name"]] = best
    return hits


def scan_lanes() -> list[dict]:
    lanes: list[dict] = []
    if not VIDIBOT.is_dir():
        return lanes
    for d in sorted(VIDIBOT.iterdir()):
        if not d.is_dir() or d.name in SKIP_DIRS:
            continue
        files = md = 0
        newest = 0.0
        try:
            for p in d.rglob("*"):
                if p.is_file():
                    parts = set(p.parts)
                    if parts & SKIP_DIRS:
                        continue
                    files += 1
                    if p.suffix.lower() == ".md":
                        md += 1
                    try:
                        newest = max(newest, p.stat().st_mtime)
                    except OSError:
                        pass
        except OSError:
            pass
        lanes.append({
            "name": d.name,
            "files": files,
            "md": md,
            "modified": datetime.fromtimestamp(newest, timezone.utc).astimezone()
                         .strftime("%Y-%m-%d") if newest else None,
        })
    return lanes


def main() -> None:
    bots = parse_roster()
    profiles = probe_profiles()
    matches = build_matches(bots, profiles)
    lanes = scan_lanes()

    payload = {
        "generated_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "root": str(VIDIBOT),
        "totals": {
            "bots": len(bots),
            "lanes": len(lanes),
            "profiles": len(profiles),
            "matched": len(matches),
            "lane_files": sum(l["files"] for l in lanes),
            "empty_lanes": sum(1 for l in lanes if l["files"] == 0),
        },
        "bots": [
            {**b, "profile": matches.get(b["name"])} for b in bots
        ],
        "lanes": lanes,
        "profiles": profiles,
    }
    OUT.write_text(json.dumps(payload, indent=1), encoding="utf-8")
    print(json.dumps(payload["totals"], indent=1))
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""poller.py - VidiFlow Command Console real-feed poller.

Rewrites data.json in this folder every 60 seconds with REAL status:
  * this box's Hermes profiles + recent API sessions (127.0.0.1:8642)
  * Ubuntu 192.168.4.40:8642 and upstairs 192.168.4.67:8642 over the peer link
    (same shared key, from HERMES_PEER_VIDI_KEY)
  * per-machine online/offline heartbeat + last-seen time

READ-ONLY: only HTTP GET is ever issued. Keys are read from the Hermes .env at
runtime and are NEVER written to data.json, to logs, or to any served file.

Run:  C:/Python314/python.exe M:/code/VidiFlow/out/console/poller.py
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_JSON = os.path.join(HERE, "data.json")
HERMES_HOME = os.environ.get("HERMES_HOME") or os.path.join(
    os.environ.get("LOCALAPPDATA", r"C:\Users\James\AppData\Local"), "hermes"
)
ENV_PATH = os.path.join(HERMES_HOME, ".env")
STATE_PATH = os.path.join(
    os.environ.get("TMPDIR", os.path.join(os.environ.get("LOCALAPPDATA", "."), "Temp")),
    "vfc-lastseen.json",
)
INTERVAL = 60
HTTP_TIMEOUT = 6
RECENT_WINDOW = 600          # seconds: "running" if active this recently
SESSION_LIMIT = 12           # recent sessions pulled per machine

LOCAL = {"id": "v20", "url": "http://127.0.0.1:8642", "name": "Hermes on Lexi · V20",
         "host": "192.168.4.44 · this box"}
PEERS = [
    {"id": "downstairs", "url": "http://192.168.4.40:8642",
     "name": "Hermes on Max · Ubuntu", "host": "vidi 192.168.4.40"},
    {"id": "upstairs", "url": "http://192.168.4.67:8642",
     "name": "Upstairs", "host": "TheaterPC 192.168.4.67"},
]
CLOUD = {"id": "cloud", "name": "Grok Bot agents",
         "detail": "Cloud · every Grok Bot agent · no heartbeat source"}

# Placeholder rows that have no live source stay, marked source="mock".
MOCK_CLOUD_ROWS = [
    ("Vidi AI", "Hydra, the Vidi AI routing system offered by VidiSmart. Connects the "
                "servers, chooses the speed, and chooses what intelligence is passed to them."),
    ("Grok Bot Voice (Ara)", "Dedicated researcher for adding voice to Grok Bot — matching "
                             "grok.com's Ara voice."),
    ("Smart Media · Gen", "Shared Experts — images, video, and new media built from briefs "
                          "and references."),
    ("Agent Army", "VidiSmart client offer: reusable agent packs (Design / Debug / domain "
                   "experts) with their own pinned models."),
]


# --------------------------------------------------------------------------- env
def read_env_key(*names: str) -> str:
    """Return the first present value; never log it."""
    try:
        with open(ENV_PATH, "r", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.rstrip("\n")
                if line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                if k.strip() in names:
                    return v.strip().strip('"').strip("'")
    except OSError:
        pass
    return ""


def http_get(url: str, key: str = "") -> tuple[int, object]:
    req = urllib.request.Request(url, method="GET")
    if key:
        req.add_header("Authorization", "Bearer " + key)
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            body = resp.read()
            try:
                return resp.status, json.loads(body.decode("utf-8", "replace"))
            except ValueError:
                return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception:
        return 0, None


# ------------------------------------------------------------------------ helpers
def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def iso_from_epoch(ts) -> str:
    try:
        return dt.datetime.fromtimestamp(float(ts)).astimezone().isoformat(timespec="seconds")
    except (TypeError, ValueError, OSError):
        return now_iso()


def clock(iso: str) -> str:
    """Windows-safe 12-hour clock label (strftime %-I is not portable on Windows)."""
    try:
        t = dt.datetime.fromisoformat(iso)
        return f"{t.hour % 12 or 12}:{t.minute:02d}:{t.second:02d} " \
               f"{'AM' if t.hour < 12 else 'PM'} ET"
    except Exception:
        return iso


def clip(text, limit: int = 150) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return (cut or text[:limit]) + "…"


def profile_description(path: str) -> str:
    try:
        raw = open(path, "r", encoding="utf-8", errors="replace").read()
    except OSError:
        return ""
    m = re.search(r"^description:\s*(.*?)(?=^\S|\Z)", raw, re.S | re.M)
    if not m:
        return ""
    val = m.group(1)
    val = re.sub(r"^\s*['\"]", "", val).strip()
    val = re.sub(r"['\"]\s*$", "", val).strip()
    return clip(val, 190)


# --------------------------------------------------------------- local profiles
def profile_rows() -> list[dict]:
    rows: list[dict] = []
    profiles_dir = os.path.join(HERMES_HOME, "profiles")
    targets = [("default (api_server)", os.path.join(HERMES_HOME, "state.db"))]
    if os.path.isdir(profiles_dir):
        for name in sorted(os.listdir(profiles_dir)):
            db = os.path.join(profiles_dir, name, "state.db")
            if os.path.isfile(db):
                targets.append((name, db))

    now = time.time()
    for name, db in targets:
        desc = profile_description(os.path.join(os.path.dirname(db), "profile.yaml"))
        note_bits, last_iso, task, status = [], now_iso(), "No recorded session", "idle"
        try:  # read-only SQLite open
            con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
            con.row_factory = sqlite3.Row
            total = con.execute("select count(*) from sessions").fetchone()[0]
            r = con.execute(
                "select title, last_activity_at, last_activity_description, ended_at,"
                " started_at, message_count from sessions"
                " order by coalesce(last_activity_at, started_at) desc limit 1"
            ).fetchone()
            con.close()
            note_bits.append(f"{total} sessions")
            if r:
                stamp = r["last_activity_at"] or r["started_at"]
                last_iso = iso_from_epoch(stamp)
                delta = now - float(stamp or 0)
                task = clip(r["last_activity_description"] or r["title"] or "Bot Chat", 110)
                if r["ended_at"] is None and delta <= RECENT_WINDOW:
                    status = "running"
                elif r["ended_at"] is not None and delta <= RECENT_WINDOW:
                    status = "done"
                else:
                    status = "idle"
                note_bits.append(f"last seen {clock(last_iso)}")
        except sqlite3.Error as e:
            note_bits.append(f"state.db unreadable ({type(e).__name__})")
        rows.append({
            "agent": name, "title": desc, "machine": "v20", "task": task,
            "status": status, "updated": last_iso, "owner": "James", "source": "real",
            "note": "profile · " + " · ".join(note_bits),
        })
    return rows


# ------------------------------------------------------------------- api sessions
def session_rows(machine: str, host: str, key: str, limit: int = SESSION_LIMIT) -> list[dict]:
    code, payload = http_get(f"{host}/api/sessions?limit={limit}", key)
    if code != 200 or not isinstance(payload, dict):
        return []
    out: list[dict] = []
    now = time.time()
    for s in payload.get("data", [])[:limit]:
        last = s.get("last_active") or s.get("started_at")
        iso = iso_from_epoch(last)
        delta = now - float(last or 0)
        if s.get("ended_at") and delta <= RECENT_WINDOW:
            status = "done"
        elif not s.get("ended_at") and delta <= RECENT_WINDOW:
            status = "running"
        else:
            status = "idle"
        label = s.get("title") or s.get("id") or "session"
        out.append({
            "agent": f"{label}", "title": clip(s.get("preview") or "", 150),
            "machine": machine, "task": clip(s.get("preview") or "No preview recorded", 110),
            "status": status, "updated": iso, "owner": "James", "source": "real",
            "note": (f"session {s.get('id')} · {s.get('model')} · "
                     f"{s.get('message_count', 0)} msgs · {s.get('tool_call_count', 0)} tools"
                     f" · {s.get('source')}"),
        })
    return out


# ------------------------------------------------------------------ last-seen state
def load_state() -> dict:
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def save_state(state: dict) -> None:
    try:
        os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
        with open(STATE_PATH, "w", encoding="utf-8") as fh:
            json.dump(state, fh)
    except OSError:
        pass


# ----------------------------------------------------------------------- build
def build_feed(state: dict) -> dict:
    local_key = read_env_key("API_SERVER_KEY")
    peer_key = read_env_key("HERMES_PEER_VIDI_KEY", "HERMES_PEER_UBUNTU_KEY",
                            "HERMES_PEER_UPSTAIRS_KEY")

    machines, agents = [], []

    # --- v20 (this box): localhost, always pollable
    code, _ = http_get(f"{LOCAL['url']}/health")
    v20_up = code == 200
    if v20_up:
        state["v20"] = now_iso()
    machines.append({
        "id": "v20", "name": LOCAL["name"],
        "detail": f"{LOCAL['host']} · last seen {clock(state.get('v20', now_iso()))}",
        "status": "online" if v20_up else "offline",
        "heartbeat": "ok" if v20_up else "no response",
        "last_seen": state.get("v20"), "url": LOCAL["url"],
    })
    agents += profile_rows()
    agents += session_rows("v20", LOCAL["url"], local_key)

    # --- peers
    for p in PEERS:
        code, _ = http_get(f"{p['url']}/health")
        up = code == 200
        if up:
            state[p["id"]] = now_iso()
        seen = state.get(p["id"])
        machines.append({
            "id": p["id"], "name": p["name"],
            "detail": f"{p['host']} · last seen {clock(seen) if seen else 'never seen'}",
            "status": "online" if up else "offline",
            "heartbeat": "ok" if up else "no response",
            "last_seen": seen, "url": p["url"],
        })
        rows = session_rows(p["id"], p["url"], peer_key) if up else []
        if not rows:
            rows = [{
                "agent": f"Hermes ({p['name']})",
                "title": "Peer gateway on this machine.",
                "machine": p["id"],
                "task": ("Peer api_server responded normally; no sessions returned."
                         if up else "Machine offline to the poller."),
                "status": "idle" if up else "blocked",
                "updated": seen or now_iso(), "owner": "James", "source": "real",
                "note": f"heartbeat {'ok' if up else 'no response'}"
                        + (f" · last seen {clock(seen)}" if seen else ""),
            }]
        agents += rows

    # --- cloud: no live source, placeholders stay and are marked mock
    machines.append({
        "id": "cloud", "name": CLOUD["name"], "detail": CLOUD["detail"],
        "status": "unknown", "heartbeat": "not polled", "last_seen": None, "url": None,
    })
    for name, desc in MOCK_CLOUD_ROWS:
        agents.append({
            "agent": name, "title": desc, "machine": "cloud", "task": "unknown",
            "status": "idle", "updated": "2026-10-11T12:00:00-04:00", "owner": "James",
            "source": "mock", "note": "placeholder · no live source for cloud roster",
        })

    return {
        "feed": "live",
        "note": "VidiFlow Command Console · real feed from Hermes api_server "
                "(this box + LAN peers). source=real rows come from live GET /health "
                "and /api/sessions; source=mock rows are placeholders with no live source.",
        "generated": now_iso(),
        "poll_seconds": INTERVAL,
        "machines": machines,
        "waiting_on_james": load_waiting(),
        "agents": agents,
    }


WAITING_PATH = os.path.join(HERE, "waiting_on_james.json")


def load_waiting() -> list[dict]:
    """Human-queue items live in waiting_on_james.json (no live source exists)."""
    try:
        with open(WAITING_PATH, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            if isinstance(data, list):
                return data
    except (OSError, ValueError):
        pass
    return []


def write_feed(feed: dict) -> None:
    tmp = DATA_JSON + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(feed, fh, indent=1, ensure_ascii=False)
    os.replace(tmp, DATA_JSON)


def main() -> int:
    once = "--once" in sys.argv
    state = load_state()
    while True:
        started = time.time()
        try:
            feed = build_feed(state)
            write_feed(feed)
            save_state(state)
            real = sum(1 for a in feed["agents"] if a["source"] == "real")
            mock = sum(1 for a in feed["agents"] if a["source"] == "mock")
            ready = " ".join(
                f"{m['id']}={m['status']}" for m in feed["machines"]
            )
            print(f"[{now_iso()}] wrote data.json · {real} real / {mock} mock · {ready}",
                  flush=True)
        except Exception as e:  # never let the loop die
            print(f"[{now_iso()}] poll failed: {type(e).__name__}: {e}", flush=True)
        if once:
            return 0
        time.sleep(max(1, INTERVAL - (time.time() - started)))


if __name__ == "__main__":
    raise SystemExit(main())

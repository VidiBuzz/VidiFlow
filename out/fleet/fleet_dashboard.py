"""VidiSmart fleet dashboard — live status across Windows V20 + Ubuntu box.

Read-only by default. Launching projects is gated behind an explicit POST
with an approved project name; nothing starts on its own.

Run:  C:/Python314/python.exe M:/code/VidiFlow/out/fleet/fleet_dashboard.py
"""
from __future__ import annotations

import json
import os
import socket
import sqlite3
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
HERMES = Path(os.path.expandvars(r"%LOCALAPPDATA%\hermes"))
PROFILES = HERMES / "profiles"
UBUNTU_HOST = "192.168.4.40"
UBUNTU_SERVICES = [("vidiflow-hx", 8090), ("kumiho", 9190), ("neo4j", 7474)]

sys.path.insert(0, str(HERE))
import ag_quota  # noqa: E402  (Antigravity IDE quota poller)

SERVICES = [
    ("kumiho", "Kumiho CE", 9190),
    ("neo4j", "Neo4j", 7474),
    ("redis", "Redis", 6379),
    # cx is HTTP, not raw TCP: a bare connect() is satisfied by any listener,
    # including an unrelated python http.server. Probe a real route instead.
    ("cx", "Smart Channel CX", 8765, "http", "/", "smart channel"),
    ("revka", "Revka gateway", 42617),
    ("9miho", "9Miho", 9999),
]

PROFILE_ROLES = {
    "vidiflow_vidibio_hx": "VidiFlow HX / Vidi AI + Hydra",
    "hermes_gateway": "Hermes Gateway -> Vidi AI + Hydra",
    "lex_lexicon": "Lex Lexicon",
    "agent_army": "Agent Army",
    "coder": "Coder",
    "vidicity": "VidiCity",
    "vidismart_community": "VidiSmart Community",
}

_lane_cache: dict = {"at": 0.0, "data": {}, "primed": False}
_lane_lock = threading.Lock()

# The Kilo catalog retires Space Bunny Alpha on a fixed calendar date. That is a
# fact about the clock, not a fact about the network, so it must be computed and
# never deferred to a probe. `expires` was previously the string
# "Space Bunny Alpha retires <date> (Kilo catalog)" plus, on the cold path, the
# literal "probing…" — a placeholder that resolved only if the lane probe
# happened to win the race. Same class as a wedged port: an unresolved
# placeholder rendered as if it were live data.
def _stamp() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


RETIRE_DATE = date(2026, 10, 5)
RETIRE_SOURCE = "Kilo catalog"


def expires_info(now: datetime | None = None) -> dict:
    """Retirement of Space Bunny Alpha, resolved from the clock every call.

    Returns both the human string (kept for the existing pages) and the
    structured form HX needs: ISO date, days remaining (negative = overdue)
    and a state that is never a placeholder.
    """
    today = (now or datetime.now(timezone.utc).astimezone()).date()
    days = (RETIRE_DATE - today).days
    if days > 0:
        state = "upcoming"
        text = f"Space Bunny Alpha retires {RETIRE_DATE.isoformat()} ({RETIRE_SOURCE})"
    elif days == 0:
        state = "today"
        text = f"Space Bunny Alpha retires TODAY {RETIRE_DATE.isoformat()} ({RETIRE_SOURCE})"
    else:
        state = "retired"
        text = (f"Space Bunny Alpha retired {RETIRE_DATE.isoformat()}, "
                f"{-days}d ago ({RETIRE_SOURCE})")
    return {
        "text": text,
        "expires": text,
        "date": RETIRE_DATE.isoformat(),
        "days_remaining": days,
        "state": state,
        "source": RETIRE_SOURCE,
    }


def tcp_up(port: int, host: str = "127.0.0.1", timeout: float = 0.7) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def http_up(port: int, path: str, marker: str, host: str = "127.0.0.1",
            timeout: float = 1.5) -> bool:
    """True only if `port` serves HTTP AND the response body carries `marker`.

    Distinguishes the real service from any other listener on the same port.
    """
    req = urllib.request.Request(
        f"http://{host}:{port}{path}",
        headers={"User-Agent": "fleet-dashboard/health"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            ctype = (r.headers.get("Content-Type") or "").lower()
            body = r.read(4096).decode("utf-8", "replace").lower()
    except (urllib.error.URLError, OSError, ValueError):
        return False
    if "text/html" not in ctype:
        return False
    return marker.lower() in body


def services() -> list:
    out = []
    for entry in SERVICES:
        key, label, port = entry[0], entry[1], entry[2]
        if len(entry) > 3 and entry[3] == "http":
            up = http_up(port, entry[4], entry[5])
        else:
            up = tcp_up(port)
        out.append({"key": key, "label": label, "port": port, "up": up})
    return out


def profiles() -> list:
    out = []
    if not PROFILES.is_dir():
        return out
    for d in sorted(PROFILES.iterdir()):
        if not d.is_dir() or d.name.startswith("."):
            continue
        cfg = d / "config.yaml"
        model = provider = None
        if cfg.is_file():
            try:
                for line in cfg.read_text(encoding="utf-8", errors="replace").splitlines():
                    s = line.strip()
                    if s.startswith("default:") and model is None:
                        model = s.split(":", 1)[1].strip()
                    elif s.startswith("provider:") and provider is None:
                        provider = s.split(":", 1)[1].strip()
            except OSError:
                pass
        cron = d / "cron"
        execs = 0
        jobs = 0
        db = cron / "executions.db"
        if db.is_file():
            try:
                con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
                execs = con.execute("select count(*) from executions").fetchone()[0]
                con.close()
            except sqlite3.Error:
                pass
        jf = cron / "jobs.json"
        if jf.is_file():
            try:
                data = json.loads(jf.read_text(encoding="utf-8"))
                jobs = len(data if isinstance(data, list) else data.get("jobs", [data]))
            except (OSError, ValueError):
                pass
        hb = cron / "ticker_heartbeat"
        beat_age = None
        if hb.is_file():
            try:
                beat_age = round(time.time() - float(hb.read_text().split()[0]), 1)
            except (OSError, ValueError, IndexError):
                pass
        out.append(
            {
                "name": d.name,
                "role": PROFILE_ROLES.get(d.name, ""),
                "model": model,
                "provider": provider,
                "auth": (d / "auth.json").is_file(),
                "executions": execs,
                "jobs": jobs,
                "ticker_age_s": beat_age,
            }
        )
    return out


_ssh_cache: dict = {"at": 0.0, "auth": "unknown"}
_ssh_lock = threading.Lock()


def _ssh_auth() -> str:
    """SSH auth state, cached 60s. The BatchMode probe costs ~4s and would
    otherwise stall every dashboard render."""
    with _ssh_lock:
        if time.time() - _ssh_cache["at"] < 60 and _ssh_cache["auth"] != "unknown":
            return _ssh_cache["auth"]
    try:
        p = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=4",
             f"James@{UBUNTU_HOST}", "echo OK"],
            capture_output=True, text=True, timeout=8,
        )
        auth = "ok" if p.returncode == 0 else "denied"
    except (OSError, subprocess.SubprocessError):
        auth = "unreachable"
    _ssh_cache["at"] = time.time()
    _ssh_cache["auth"] = auth
    return auth


def ubuntu() -> dict:
    ssh = tcp_up(22, UBUNTU_HOST, 1.0)
    res = {"host": UBUNTU_HOST, "ssh": ssh, "auth": "unknown", "services": []}
    for name, port in UBUNTU_SERVICES:
        res["services"].append({"name": name, "port": port, "up": tcp_up(port, UBUNTU_HOST, 1.0)})
    if ssh:
        res["auth"] = _ssh_auth()
    return res


def lanes(force: bool = False) -> dict:
    """Live provider lane probe. Cached 120s, and never blocks a page render:
    the first call returns the probe-pending shape immediately while the real
    probe runs in the background.

    The pending state is labelled `probe_pending`/`pending`, never dressed up as
    a verdict: `ok` is null (unknown) rather than False, so a consumer cannot
    read "not probed yet" as "lane is down". The expiry is always resolved from
    the clock, on every path.
    """
    exp = expires_info()
    with _lane_lock:
        fresh = _lane_cache["data"] and time.time() - _lane_cache["at"] < 120
        primed = _lane_cache["primed"]
    if fresh and primed:
        return _lane_cache["data"]
    if not (force or primed):
        threading.Thread(target=lanes, args=(True,), daemon=True).start()
        return {
            "zen": {"label": "OpenCode Zen", "model": "space-bunny-free",
                    "ok": None, "state": "pending",
                    "note": "probe pending — first probe runs in background"},
            "openrouter": {"label": "OpenRouter", "model": "stealth/space-bunny-alpha",
                           "ok": None, "state": "pending",
                           "note": "probe pending — first probe runs in background"},
            "kilo": {"label": "Kilo Gateway", "model": "stealth/space-bunny-alpha",
                     "ok": None, "state": "pending",
                     "note": "probe pending — first probe runs in background"},
            "probe_pending": True,
            "expires": exp["text"],
            "expiry": exp,
        }
    if fresh and not force:
        return _lane_cache["data"]

    env = os.path.expandvars(r"%LOCALAPPDATA%\hermes\.env")
    e: dict = {}
    try:
        for line in Path(env).read_text(encoding="utf-8", errors="replace").splitlines():
            s = line.strip()
            if s and not s.startswith("#") and "=" in s:
                k, v = s.split("=", 1)
                e[k.strip()] = v.strip().strip('"').strip("'")
    except OSError:
        pass

    def probe(label, url, model, key=None):
        payload = json.dumps(
            {"model": model, "messages": [{"role": "user", "content": "ping"}], "max_tokens": 8}
        ).encode()
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        if key:
            req.add_header("Authorization", f"Bearer {key}")
        started = time.time()
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                body = r.read(400).decode("utf-8", "replace")
            ok = '"object":"chat.completion"' in body.replace(" ", "")
            return {"label": label, "model": model, "ok": ok,
                    "state": "up" if ok else "degraded",
                    "latency_ms": round((time.time() - started) * 1000),
                    "note": "" if ok else body[:120]}
        except urllib.error.HTTPError as ex:
            # 401/403 = credential problem, 404 = model not served. Both are real
            # verdicts, so they stay actionable rather than collapsing to "down".
            state = "auth" if ex.code in (401, 403) else (
                "missing" if ex.code == 404 else "down")
            return {"label": label, "model": model, "ok": False, "state": state,
                    "latency_ms": round((time.time() - started) * 1000),
                    "note": f"HTTP {ex.code}"}
        except Exception as ex:  # noqa: BLE001
            return {"label": label, "model": model, "ok": False, "state": "down",
                    "latency_ms": round((time.time() - started) * 1000),
                    "note": type(ex).__name__}

    zen = probe("OpenCode Zen", "https://opencode.ai/zen/v1/chat/completions",
                "space-bunny-free", e.get("OPENCODE_ZEN_API_KEY"))
    orr = probe("OpenRouter", "https://openrouter.ai/api/v1/chat/completions",
                "stealth/space-bunny-alpha", e.get("OPENROUTER_API_KEY"))
    kilo = probe("Kilo Gateway", "https://api.kilo.ai/api/gateway/chat/completions",
                 "stealth/space-bunny-alpha")
    exp = expires_info()
    data = {"zen": zen, "openrouter": orr, "kilo": kilo,
            "probe_pending": False, "probed_at": _stamp(),
            "expires": exp["text"], "expiry": exp}
    _lane_cache["at"] = time.time()
    _lane_cache["data"] = data
    _lane_cache["primed"] = True
    return data


_snap_cache: dict = {"at": 0.0, "data": None}


FLEET_JSON = HERE / "fleet.json"


def fleet_view() -> dict:
    """Roster bots + VidiBot lanes, refreshed by the background loop."""
    return _fleet_cache["data"] or {"bots": [], "lanes": [], "totals": {},
                                    "generated_at": "", "root": ""}


_fleet_cache: dict = {"data": None}


def refresh_fleet() -> None:
    try:
        import subprocess
        subprocess.run(
            [sys.executable, str(HERE / "scan_fleet.py")],
            capture_output=True, timeout=180, cwd=str(HERE),
        )
        _fleet_cache["data"] = json.loads(FLEET_JSON.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        pass


STACK_JSON = HERE / "stack.json"


def stack_view() -> dict:
    return _stack_cache["data"] or {"kernels": [], "projects": [], "spaces": [],
                                    "counts": {}, "reltypes": [], "kinds": [],
                                    "graph": {}, "embedding": {}}


_stack_cache: dict = {"data": None}


def refresh_stack() -> None:
    try:
        subprocess.run([sys.executable, str(HERE / "kumiho_stack.py")],
                       capture_output=True, timeout=60, cwd=str(HERE))
        _stack_cache["data"] = json.loads(STACK_JSON.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        pass


def routing_view() -> dict:
    """Live Vidi.Ai model + Hydra routing chain, read from config.yaml."""
    cfg = Path(os.path.expandvars(r"%LOCALAPPDATA%\hermes\config.yaml"))
    out: dict = {"primary": {}, "fallbacks": [], "custom": []}
    if not cfg.is_file():
        return out
    try:
        import yaml
        data = yaml.safe_load(cfg.read_text(encoding="utf-8")) or {}
    except Exception:  # noqa: BLE001
        return out
    m = data.get("model") or {}
    out["primary"] = {"model": m.get("default"), "provider": m.get("provider"),
                      "base_url": m.get("base_url"), "api_mode": m.get("api_mode")}
    for f in data.get("fallback_providers") or []:
        out["fallbacks"].append({"provider": f.get("provider"), "model": f.get("model")})
    for cp in data.get("custom_providers") or []:
        out["custom"].append({"name": cp.get("name"), "base_url": cp.get("base_url"),
                              "key_env": cp.get("key_env")})
    return out


def gateway_roster() -> dict:
    """The gateway's served_profiles list — the real fleet, not a guess.
    Falls back to the profiles dir when gateway_state.json is absent."""
    out: dict = {"served": [], "platforms": {}, "state": None, "updated_at": None}
    gs = HERMES / "gateway_state.json"
    if gs.is_file():
        try:
            d = json.loads(gs.read_text(encoding="utf-8"))
            out["served"] = d.get("served_profiles") or []
            out["state"] = d.get("gateway_state")
            out["updated_at"] = d.get("updated_at")
            plats = d.get("platforms") or {}
            out["platforms"] = {k: (v.get("state") if isinstance(v, dict) else v)
                                for k, v in plats.items()}
        except (OSError, ValueError):
            pass
    if not out["served"]:
        out["served"] = sorted(d.name for d in PROFILES.iterdir() if d.is_dir())
    return out


def stack_payload() -> dict:
    d = dict(stack_view())
    d["routing"] = routing_view()
    d["lanes"] = lanes()
    d["agents_profiles"] = profiles()
    d["gateway"] = gateway_roster()
    d["checked_at"] = _stamp()
    return d


def _refresh_loop() -> None:
    """Compute the snapshot off the request path so /api/health returns instantly."""
    first = True
    while True:
        try:
            if first:
                refresh_fleet()
                refresh_stack()
                first = False
            _snap_cache["data"] = snapshot()
            _snap_cache["at"] = time.time()
        except Exception:  # noqa: BLE001 - never kill the refresher
            pass
        time.sleep(5)


def fast_snapshot() -> dict:
    """Never blocks: returns the last computed snapshot, or a minimal stub while
    the first refresh is still running.

    The stub used to answer `"checked_at": ""` and `"expires": "probing…"`, so a
    caller during startup saw HTTP 200 carrying no data and no marker that data
    was missing — the dashboard's own `stale` class keyed off that empty string,
    and an empty expiry rendered as a real deadline. Now `checked_at` is always
    the real request time, `state` says whether a measurement exists, and the
    expiry resolves from the clock.
    """
    d = _snap_cache["data"]
    if d is None:
        exp = expires_info()
        return {
            "checked_at": _stamp(),
            "measured": False,
            "state": "warming",
            "detail": "first measurement in progress — service list is not yet read",
            "host": "V20 (Windows)",
            "services": [],
            "profiles": [],
            "ubuntu": {"host": UBUNTU_HOST, "ssh": False, "auth": "unknown", "services": []},
            "lanes": dict(lanes(), expiry=exp),
            "totals": {},
        }
    out = dict(d)
    out["measured"] = True
    out["state"] = "live"
    out["snapshot_age_s"] = round(time.time() - _snap_cache["at"], 1)
    return out


def snapshot() -> dict:
    svcs = services()
    profs = profiles()
    return {
        "checked_at": _stamp(),
        "host": "V20 (Windows)",
        "services": svcs,
        "profiles": profs,
        "ubuntu": ubuntu(),
        "lanes": lanes(),
        "totals": {
            "services_up": sum(1 for s in svcs if s["up"]),
            "services_total": len(svcs),
            "profiles": len(profs),
            "executions": sum(p["executions"] for p in profs),
            "jobs": sum(p["jobs"] for p in profs),
            "profiles_with_auth": sum(1 for p in profs if p["auth"]),
        },
    }


PAGE = (HERE / "hydra.html")


def serve(port: int = 8790) -> None:
    import http.server
    import socketserver

    class H(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"
        def _send(self, code: int, body: bytes, ctype: str) -> None:
            # Content-Length is mandatory here: protocol_version is HTTP/1.1 with
            # keep-alive, so without it the client cannot tell where the body
            # ends and waits for connection close that never comes. Browsers then
            # treat the response as still-loading and never execute the page's
            # <script>, which renders every table empty.
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:  # noqa: N802
            if self.path.startswith("/api/health"):
                self._send(200, json.dumps(fast_snapshot()).encode(), "application/json")
            elif self.path.startswith("/api/stack"):
                self._send(200, json.dumps(stack_payload()).encode(), "application/json")
            elif self.path.startswith("/api/fleet"):
                self._send(200, json.dumps(fleet_view()).encode(), "application/json")
            elif self.path.startswith("/api/lanes"):
                self._send(200, json.dumps(lanes(force=True)).encode(), "application/json")
            elif self.path.startswith("/api/ag"):
                # Antigravity IDE quota. The poller re-discovers port + CSRF on
                # every call, so the panel survives language-server restarts.
                try:
                    self._send(200, json.dumps(ag_quota.snapshot()).encode(),
                               "application/json")
                except Exception as exc:  # noqa: BLE001
                    self._send(200, json.dumps({"ok": False, "error": str(exc)}).encode(),
                               "application/json")
            elif self.path.startswith("/ai"):
                # Server-rendered: data inlined so the page cannot render blank
                # even if the browser blocks or fails to run the fetch.
                html = (HERE / "vidiai.html").read_text(encoding="utf-8")
                stamp = _stamp()
                try:
                    blob = json.dumps(stack_payload()).replace("</", "<\\/")
                except Exception:  # noqa: BLE001
                    blob = "{}"
                html = html.replace("/*__INLINE_DATA__*/null", blob)
                html = html.replace("<!--STAMP-->", stamp)
                self._send(200, html.encode("utf-8"), "text/html; charset=utf-8")
            elif self.path.startswith("/q"):
                self._send(200, (HERE / "quota.html").read_bytes(), "text/html; charset=utf-8")
            elif self.path.startswith("/f"):
                self._send(200, (HERE / "fleet.html").read_bytes(), "text/html; charset=utf-8")
            elif self.path in ("/", "/index.html"):
                self._send(200, PAGE.read_bytes(), "text/html; charset=utf-8")
            else:
                self._send(404, b"not found", "text/plain")

        def do_POST(self) -> None:  # noqa: N802
            # Gated: launching is never automatic. Requires an approved project name.
            self._send(403, json.dumps({
                "error": "launch_gated",
                "detail": "Dashboard is read-only. Approve a specific project with Hermes to launch it.",
            }).encode(), "application/json")

        def handle_one_request(self) -> None:
            try:
                super().handle_one_request()
            except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
                # Browser closed the tab mid-response; nothing to report.
                self.close_connection = True

        def log_message(self, *_a) -> None:
            pass

    class Server(socketserver.ThreadingTCPServer):
        daemon_threads = True
        allow_reuse_address = True

    with Server(("127.0.0.1", port), H) as httpd:
        threading.Thread(target=_refresh_loop, daemon=True).start()
        print(f"fleet dashboard on http://127.0.0.1:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    serve()
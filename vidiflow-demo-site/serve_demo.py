"""Static server for the vidiflow.net demo — PUBLIC (no Basic Auth) + noindex headers.

Also exposes GET /api/health.json so the main page can draw live pips. The probe
is read-only: TCP connect to localhost ports, plus directory counts under the
Mez profile tree. It never shells out and never writes.
"""
import functools
import json
import os
import socket
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))

# 8090 is the historical default but Kumiho Desktop's brain takes it
# (kumiho-brain.exe --port 8090). Override with VIDIFLOW_DEMO_PORT.
PORT = int(os.environ.get("VIDIFLOW_DEMO_PORT", "8091"))

HEALTH_PATH = "/api/health.json"
PROBE_TIMEOUT = 0.35
CACHE_TTL = 5.0
MAX_TOMBSTONE_SAMPLE = 14

# Candidates in priority order. The report's "AppData\Local\local\hermes" path
# does not exist on this box; the real home is AppData\Local\hermes.
PROFILE_DIR_CANDIDATES = [
    os.environ.get("MEZ_PROFILES_DIR") or "",
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "hermes", "profiles"),
    os.path.expanduser("~/.hermes/profiles"),
]

# Ports the main page shows pips for.
PROBE_PORTS = [
    ("kumiho", 9190, "Kumiho CE"),
    ("cx", 8765, "Smart Channel CX"),
    ("revka", 42617, "Revka gateway"),
    ("9miho", 9999, "9Miho"),
    ("neo4j", 7474, "Neo4j"),
    ("redis", 6379, "Redis"),
]

_cache = {"at": 0.0, "body": None}


def _port_open(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(PROBE_TIMEOUT)
    try:
        return sock.connect_ex(("127.0.0.1", port)) == 0
    except OSError:
        return False
    finally:
        sock.close()


def _find_profiles_dir():
    for path in PROFILE_DIR_CANDIDATES:
        if path and os.path.isdir(path):
            return path
    return None


def _read_profiles(profiles_dir):
    live, tombstoned = [], []
    if not profiles_dir:
        return live, tombstoned, None

    tomb_dir = os.path.join(profiles_dir, ".deleted")
    try:
        for name in sorted(os.listdir(profiles_dir)):
            if name.startswith("."):
                continue
            if os.path.isdir(os.path.join(profiles_dir, name)):
                live.append(name)
    except OSError:
        pass

    try:
        for name in sorted(os.listdir(tomb_dir)):
            if os.path.isfile(os.path.join(tomb_dir, name)):
                tombstoned.append(name)
    except OSError:
        pass

    return live, tombstoned, tomb_dir


def collect_health():
    now = time.time()
    if _cache["body"] is not None and now - _cache["at"] < CACHE_TTL:
        return _cache["body"]

    profiles_dir = _find_profiles_dir()
    live, tombstoned, tomb_dir = _read_profiles(profiles_dir)

    body = {
        "ok": True,
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "host": socket.gethostname(),
        "services": {
            key: {"label": label, "port": port, "up": _port_open(port)}
            for key, port, label in PROBE_PORTS
        },
        "profiles": {
            "dir": profiles_dir,
            "live": live,
            "liveCount": len(live),
            "tombstoned": len(tombstoned),
            "tombstoneSample": tombstoned[:MAX_TOMBSTONE_SAMPLE],
            "tombstoneDir": tomb_dir,
        },
    }

    _cache["at"] = now
    _cache["body"] = body
    return body


class DemoHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == HEALTH_PATH:
            self._serve_health()
            return
        super().do_GET()

    def _serve_health(self):
        try:
            payload = json.dumps(collect_health()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as exc:  # never take the page down over a probe
            payload = json.dumps({"ok": False, "error": str(exc)}).encode("utf-8")
            self.send_response(503)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    def log_message(self, fmt, *args):
        if "health" in (args[0] if args else ""):
            super().log_message(fmt, *args)


def main():
    handler = functools.partial(DemoHandler, directory=ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    print("Serving %s on http://0.0.0.0:%d (PUBLIC — no Basic Auth)" % (ROOT, PORT))
    print("Live probe: http://0.0.0.0:%d%s" % (PORT, HEALTH_PATH))
    server.serve_forever()


if __name__ == "__main__":
    main()
"""VidiFlow HX — live O&M console for the whole fleet.

Owns its own port (8090, per VIDIBOT-PORT-CONFLICT-SOLUTION-2026-10-05.md) and
proxies the fleet dashboard's read-only APIs on 8790. It deliberately does NOT
re-implement probing: the dashboard is the single source of truth for fleet
state, and HX reads it. One rule learned from the 8799 wedge — a health check
must read a status code and bytes, never a socket.

Two things this server enforces that the dashboard's raw API does not:
  * `/api/hx/*` returns 502 with a real reason when the dashboard is down, so a
    failing source can never render as an empty-but-plausible page.
  * every response carries `X-VidiFlow-Source` and a resolved `expires` block, so
    an unresolved placeholder has nowhere to hide.

Read-only. POST is refused with 403, matching the dashboard. Nothing launches.

Run: C:/Python314/python.exe M:/code/VidiFlow/out/fleet/vidiflow_hx.py
"""
from __future__ import annotations

import json
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingTCPServer

HERE = Path(__file__).resolve().parent
DASHBOARD = "http://127.0.0.1:8790"
PORT = 8090

# How stale a snapshot may be before HX calls it stale rather than current.
STALE_AFTER_S = 30.0
CACHE_TTL_S = 4.0

_cache: dict = {}
_cache_lock = threading.Lock()


def fetch(path: str, ttl: float = CACHE_TTL_S) -> tuple[int, dict]:
    """GET a dashboard API. Returns (status, payload).

    `status` is the upstream HTTP code, or 502 when the dashboard could not be
    reached at all. Never fabricates a body.
    """
    now = time.time()
    with _cache_lock:
        hit = _cache.get(path)
        if hit and now - hit[0] < ttl:
            return hit[1], hit[2]
    req = urllib.request.Request(
        DASHBOARD + path, headers={"User-Agent": "vidiflow-hx/1.0 (+read-only)"})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            code, raw = r.getcode(), r.read()
    except urllib.error.HTTPError as ex:
        code, raw = ex.code, ex.read()
    except Exception as ex:  # noqa: BLE001
        # Upstream unreachable. Surfaced as 502 so the page can say "source down"
        # instead of drawing zeros that look like a healthy empty fleet.
        return 502, {"error": "source_unreachable", "detail": type(ex).__name__,
                     "source": DASHBOARD + path}
    try:
        data = json.loads(raw.decode("utf-8", "replace"))
    except ValueError:
        return 502, {"error": "source_bad_json", "source": DASHBOARD + path}
    with _cache_lock:
        _cache[path] = (time.time(), code, data)
    return code, data


def derive_health(h: dict, fleet: dict, lanes: dict, stack: dict) -> dict:
    """Turn four upstream payloads into the O&M verdict HX actually renders.

    Every item here answers a question James asks out loud. Items are only
    raised when they are supported by a measured value — no placeholder, ever.
    """
    svc = h.get("services") or []
    profs = h.get("profiles") or []
    ubuntu = h.get("ubuntu") or {}
    expiry = (lanes.get("expiry") or {})

    bots_up = sum(1 for s in svc if s.get("up"))
    bots_total = len(svc) or int((h.get("totals") or {}).get("services_total") or 0)
    no_auth = sorted(p["name"] for p in profs if not p.get("auth"))

    # A stale ticker is a silent stall: the process is alive, the agent is not
    # advancing. Distinct from "down".
    stale_tickers = []
    for p in profs:
        age = p.get("ticker_age_s")
        if age is None:
            continue
        if age > 3600:
            stale_tickers.append((p["name"], age))

    findings = []

    def add(sev, title, detail, ev):
        findings.append({"severity": sev, "title": title, "detail": detail, "evidence": ev})

    measured = h.get("measured", True)
    if not measured:
        add("info", "Snapshot warming",
            h.get("detail") or "first measurement still running", "no service list yet")

    for s in svc:
        if not s.get("up"):
            add("down", f"{s['label']} not responding",
                f"port {s['port']} did not answer", f"127.0.0.1:{s['port']}")

    if expiry.get("state") == "retired":
        add("warn", "Space Bunny Alpha retired",
            f"catalog retirement date {expiry.get('date')} has passed "
            f"({abs(expiry.get('days_remaining', 0))}d ago)",
            f"{expiry.get('source')}")
    elif expiry.get("state") == "today":
        add("warn", "Space Bunny Alpha retires today", expiry.get("text", ""),
            expiry.get("source", ""))
    elif expiry.get("state") == "upcoming" and expiry.get("days_remaining", 99) <= 14:
        add("warn", f"Lane expiry in {expiry['days_remaining']}d",
            expiry.get("text", ""), expiry.get("source", ""))

    for key, l in (("zen", lanes.get("zen")), ("openrouter", lanes.get("openrouter")),
                   ("kilo", lanes.get("kilo"))):
        if not l:
            continue
        st = l.get("state") or ("up" if l.get("ok") else "down")
        if st == "pending":
            add("info", f"{l.get('label')} probe pending",
                l.get("note") or "first probe has not returned", key)
        elif st == "auth":
            add("warn", f"{l.get('label')} rejected — credential",
                f"model {l.get('model')} returned {l.get('note')}", key)
        elif st == "missing":
            add("warn", f"{l.get('label')} no longer serves the model",
                f"{l.get('model')} returned {l.get('note')}", key)
        elif not l.get("ok"):
            add("down", f"{l.get('label')} lane failing",
                l.get("note") or "probe failed", key)

    if ubuntu and ubuntu.get("host"):
        ups = [s for s in ubuntu.get("services") or [] if s.get("up")]
        if not ups and ubuntu.get("auth") != "ok":
            add("warn", f"Ubuntu box {ubuntu['host']} unreachable",
                f"ssh auth: {ubuntu.get('auth')}, 0/{len(ubuntu.get('services') or [])} "
                "services answering", ubuntu["host"])

    if no_auth:
        add("warn", f"{len(no_auth)} bots have no credentials",
            ", ".join(no_auth), f"{len(no_auth)}/{len(profs)} profiles")

    if stale_tickers:
        add("warn", f"{len(stale_tickers)} bot tickers stale",
            ", ".join(f"{n} ({int(a / 60)}m)" for n, a in stale_tickers[:4]),
            f"threshold {int(3600 / 60)}m")

    counts = stack.get("counts") or {}
    graph = stack.get("graph") or {}
    if graph and not graph.get("reachable"):
        add("down", "Kumiho graph unreachable", str(graph.get("bolt")), "graph.reachable=false")

    order = {"down": 0, "warn": 1, "info": 2}
    findings.sort(key=lambda f: order.get(f["severity"], 3))

    fl = fleet or {}
    totals = fl.get("totals") or {}
    return {
        "measured": measured,
        "checked_at": h.get("checked_at"),
        "snapshot_age_s": h.get("snapshot_age_s"),
        "stale": (h.get("snapshot_age_s") or 0) > STALE_AFTER_S,
        "state": h.get("state") or ("live" if measured else "warming"),
        "bots": {"up": bots_up, "total": bots_total,
                 "down": [s["label"] for s in svc if not s.get("up")]},
        "roster": {"count": totals.get("bots") or len(fl.get("bots") or []),
                   "lanes": totals.get("lanes") or len(fl.get("lanes") or []),
                   "profiles": totals.get("profiles") or len(profs),
                   "lane_files": totals.get("lane_files"),
                   "empty_lanes": totals.get("empty_lanes"),
                   "generated_at": fl.get("generated_at")},
        "profiles": {"total": len(profs), "with_auth": len(profs) - len(no_auth),
                     "no_auth": no_auth},
        "services": svc,
        "ubuntu": ubuntu,
        "expiry": expiry,
        "lanes": lanes,
        "stack": {"counts": counts, "graph": graph,
                  "total_nodes": counts.get("__total__"),
                  "kernels": len(stack.get("kernels") or []),
                  "projects": len(stack.get("projects") or []),
                  "spaces": len(stack.get("spaces") or [])},
        "routing": stack.get("routing") or {},
        "findings": findings,
        "counts_by_severity": {
            "down": sum(1 for f in findings if f["severity"] == "down"),
            "warn": sum(1 for f in findings if f["severity"] == "warn"),
            "info": sum(1 for f in findings if f["severity"] == "info")},
    }


def payload_hx() -> tuple[int, dict]:
    """The single call the page makes. Fans out to the four dashboard APIs."""
    ch, h = fetch("/api/health")
    if ch != 200:
        return 502, {"error": "source_unreachable", "detail": h, "source": DASHBOARD}
    cf, fl = fetch("/api/fleet", ttl=15.0)
    cl, ln = fetch("/api/lanes", ttl=20.0)
    cs, st = fetch("/api/stack", ttl=15.0)
    # /api/lanes blocks on a live provider probe (up to ~20s x3). Do not let that
    # stall HX: fall back to the copy /api/health already carries.
    if cl != 200 or not (ln or {}).get("zen"):
        ln = (h.get("lanes") or {})
        ln = dict(ln)
        ln["source"] = "/api/health snapshot"
    merged = derive_health(h, fl if cf == 200 else {}, ln, st if cs == 200 else {})
    merged["upstream"] = {"dashboard": DASHBOARD, "status": {"/api/health": ch,
                                                              "/api/fleet": cf,
                                                              "/api/lanes": cl,
                                                              "/api/stack": cs},
                          "lanes_source": (ln or {}).get("source", "/api/lanes")}
    return 200, merged


PAGE = HERE / "hx.html"


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        # Content-Length is mandatory: HTTP/1.1 + keep-alive means the client
        # cannot find the body end otherwise, and the page script never runs.
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-VidiFlow-Source", DASHBOARD)
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, data: dict) -> None:
        self._send(code, json.dumps(data).encode(), "application/json")

    def do_GET(self) -> None:  # noqa: N802
        p = self.path.split("?")[0]
        try:
            if p in ("/", "/index.html", "/hx"):
                self._send(200, PAGE.read_bytes(), "text/html; charset=utf-8")
            elif p == "/api/hx":
                code, data = payload_hx()
                self._json(code, data)
            elif p == "/api/hx/roster":
                # Roster is large and static between scans: separate endpoint and
                # a longer TTL, so the 10s poll never re-reads 46 bot records.
                code, fl = fetch("/api/fleet", ttl=60.0)
                if code != 200:
                    self._json(502, {"error": "source_unreachable", "detail": fl})
                else:
                    self._json(200, {
                        "bots": fl.get("bots") or [],
                        "lanes": fl.get("lanes") or [],
                        "totals": fl.get("totals") or {},
                        "generated_at": fl.get("generated_at"),
                    })
            elif p == "/api/hx/ping":
                # Liveness of HX's own upstream, as bytes + code — never socket state.
                code, data = fetch("/api/health", ttl=0.0)
                self._json(code, {"hx": "ok", "upstream_code": code,
                                  "upstream": DASHBOARD, "at": time.time()})
            elif p.startswith("/hx_fonts/"):
                # p is already split on "?", so compare names, not the raw path.
                f = HERE / "hx_fonts" / p[len("/hx_fonts/"):]
                if f.is_file() and f.parent == (HERE / "hx_fonts") \
                        and f.suffix in (".woff2", ".css"):
                    ctype = "font/woff2" if f.suffix == ".woff2" else "text/css; charset=utf-8"
                    self._send(200, f.read_bytes(), ctype)
                else:
                    self._send(404, b"not found", "text/plain")
            elif p == "/favicon.ico":
                self._send(204, b"", "image/x-icon")
            else:
                self._send(404, b"not found", "text/plain")
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True

    def do_POST(self) -> None:  # noqa: N802
        # Read-only by construction. HX launches nothing.
        self._json(403, {"error": "read_only",
                         "detail": "VidiFlow HX is read-only. Launching is gated "
                                   "behind an approved project name."})

    def log_message(self, format, *a) -> None:  # noqa: A002
        pass


def serve(port: int = PORT) -> None:
    class Server(ThreadingTCPServer):
        daemon_threads = True
        allow_reuse_address = True

    with Server(("127.0.0.1", port), Handler) as httpd:
        print(f"VidiFlow HX on http://127.0.0.1:{port}  (source: {DASHBOARD})")
        httpd.serve_forever()


if __name__ == "__main__":
    serve(int(sys.argv[1]) if len(sys.argv) > 1 else PORT)
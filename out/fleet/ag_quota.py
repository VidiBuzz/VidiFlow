"""Antigravity IDE quota poller for the VidiFlow Hydra dashboard.

Reverse-engineered from Henrik-3/AntigravityQuota v1.1.1 (MIT, VS Code extension):
it finds the Antigravity language server process, extracts --csrf_token from its
command line, walks the process's listening ports until GetUserStatus answers,
then returns plan + credits + per-model quotaInfo.

Usage (module):  python ag_quota.py            -> prints JSON snapshot
Import:          from ag_quota import snapshot -> dict (fresh each call)

Auth/flow notes:
- The CSRF token and listening port ROTATE every time the language server restarts,
  so this never caches: every snapshot() call re-discovers both.
- Get-Process commandline needs no elevation for the current user.
"""

from __future__ import annotations

import json
import re
import subprocess
import time

PROC = "language_server_windows_x64.exe"
ENDPOINT = "/exa.language_server_pb.LanguageServerService/GetUserStatus"

_cache: dict = {"data": None, "ts": 0.0}
CACHE_TTL = 20.0  # seconds; keeps dashboard requests cheap without lying


def _language_servers() -> list[dict]:
    """Return {pid, cmdline} for every running Antigravity language server."""
    ps = (
        "Get-CimInstance Win32_Process -Filter \"name='%s'\" "
        "| Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress" % PROC
    )
    r = subprocess.run(["powershell", "-NoProfile", "-Command", ps],
                       capture_output=True, text=True, timeout=15)
    if not r.stdout.strip():
        return []
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        return []
    if isinstance(data, dict):  # single result
        data = [data]
    return [{"pid": d.get("ProcessId"), "cmd": d.get("CommandLine") or ""}
            for d in data if d.get("ProcessId")]


def _csrf_ports(cmd: str) -> tuple[str, int | None]:
    """Extract --csrf_token and --extension_server_port from a command line."""
    tok = re.search(r"--csrf_token[= ]+([0-9a-fA-F-]{8,})", cmd)
    ext = re.search(r"--extension_server_port[= ]+(\d+)", cmd)
    return (tok.group(1) if tok else "", int(ext.group(1)) if ext else 0)


def _listening_ports(pid: int) -> list[int]:
    ns = subprocess.run(["netstat", "-ano", "-p", "TCP"], capture_output=True,
                        text=True, timeout=15).stdout
    ports = set()
    for line in ns.splitlines():
        parts = line.split()
        # Proto Local-addr Foreign-addr State PID
        if len(parts) >= 5 and parts[-1] == str(pid) and parts[3] == "LISTENING":
            m = re.match(r"127\.0\.0\.1:(\d+)$", parts[1]) or \
                re.match(r"0\.0\.0\.0:(\d+)$", parts[1])
            if m:
                ports.add(int(m.group(1)))
    return sorted(ports)


def _get_status(port: int, csrf: str, timeout: float = 6.0) -> dict | None:
    """POST GetUserStatus; returns parsed JSON or None."""
    # The language server speaks HTTPS with a self-signed cert on loopback.
    body = json.dumps({}).encode()
    try:
        import urllib.request
        import ssl
        req = urllib.request.Request(
            f"https://127.0.0.1:{port}{ENDPOINT}",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Connect-Protocol-Version": "1",
                "X-Codeium-Csrf-Token": csrf,
            },
            method="POST")
        ctx = ssl._create_unverified_context()  # noqa: SLF001 - self-signed loopback
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return json.loads(resp.read().decode("utf-8", "replace"))
    except Exception:
        return None


def snapshot(force: bool = False) -> dict:
    """Fresh quota snapshot. Never caches auth material; caches payload 20s."""
    now = time.time()
    if not force and _cache["data"] and now - _cache["ts"] < CACHE_TTL:
        _cache["data"]["cached_s"] = round(now - _cache["ts"], 1)
        return _cache["data"]

    result: dict = {
        "ok": False,
        "error": None,
        "plan": None,
        "credits": None,
        "models": [],
        "checked_at": now,
        "servers_seen": 0,
    }
    servers = _language_servers()
    result["servers_seen"] = len(servers)
    if not servers:
        result["error"] = "Antigravity language server not running"
        return result

    for s in servers:
        csrf, _ext_port = _csrf_ports(s["cmd"])
        if not csrf:
            continue
        for port in _listening_ports(s["pid"]):
            data = _get_status(port, csrf)
            if not data:
                continue
            us = data.get("userStatus") or {}
            plan = (us.get("planStatus") or {})
            pi = (plan.get("planInfo") or {})
            models = []
            for m in ((us.get("cascadeModelConfigData") or {}).get("clientModelConfigs") or []):
                qi = m.get("quotaInfo") or {}
                models.append({
                    "id": m.get("modelId") or m.get("label"),
                    "label": m.get("label"),
                    "remaining_pct": round(100 * float(qi.get("remainingFraction", 0)), 2),
                    "reset_utc": qi.get("resetTime"),
                })
            result.update({
                "ok": True,
                "error": None,
                "email": us.get("email"),
                "name": us.get("name"),
                "plan": pi.get("planName"),
                "tier": plan.get("teamsTier"),
                "credits": {
                    "prompt_remaining": plan.get("availablePromptCredits"),
                    "prompt_monthly": pi.get("monthlyPromptCredits"),
                    "flow_remaining": plan.get("availableFlowCredits"),
                    "flow_monthly": pi.get("monthlyFlowCredits"),
                },
                "models": models,
                "via_port": port,
            })
            break  # first responsive port for this server is enough
        if result["ok"]:
            break

    if not result["ok"]:
        result["error"] = result["error"] or "no language server answered GetUserStatus"
    _cache["data"] = result
    _cache["ts"] = now
    return result


if __name__ == "__main__":
    print(json.dumps(snapshot(), indent=2))
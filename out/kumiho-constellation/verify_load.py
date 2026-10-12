#!/usr/bin/env python3
"""Read-only verification of a constellation load in the real Kumiho.

Nothing here writes. It checks, in order:
  1. Kumiho CE REST liveness      http://127.0.0.1:9190/api/_live
  2. The Kumiho SDK view of the graph (items, revisions, edges)
  3. The 9Miho proxy surface (the UI's own view of the same graph)

Run with the Kumiho sidecar interpreter, which has the kumiho SDK:
    C:\\Users\\James\\.revka\\kumiho\\venv\\Scripts\\python.exe verify_load.py

Exit code 0 = every check passed, 1 = something failed.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

os.environ.pop("PYTHONPATH", None)

PROJECT = os.environ.get("CN_PROJECT", "EquityGen")
SPACE = os.environ.get("CN_SPACE", "/EquityGen/Constellation")
TAG_KEY = "constellation_id"        # stamped on every item by kumiho_load.py
EDGE_SOURCE = "vidibot.constellation"

failures: list[str] = []


def ok(msg: str) -> None:
    print(f"  PASS  {msg}")


def bad(msg: str) -> None:
    failures.append(msg)
    print(f"  FAIL  {msg}")


def meta(obj) -> dict:
    return {str(k): str(v) for k, v in dict(getattr(obj, "metadata", {}) or {}).items()}


def http_json(url: str, timeout: float = 5.0):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:  # noqa: S310
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, {"error": str(e)}
    except Exception as e:  # noqa: BLE001
        return None, {"error": f"{type(e).__name__}: {e}"}


print("1. Kumiho CE liveness (REST)")
st, body = http_json("http://127.0.0.1:9190/api/_live")
if st == 200 and str(body.get("status")) == "ok":
    ok(f"/api/_live -> status=ok version={body.get('version')} mode={body.get('deployment_mode')}")
else:
    bad(f"/api/_live unreachable or not ok ({st}): {body}. "
        "Bring the stack up first: powershell -File M:\\code\\vidismart\\tools\\recover-kumiho.ps1")

print("2. Kumiho graph contents (SDK, read-only)")
try:
    import kumiho
except Exception as exc:  # noqa: BLE001
    bad(f"kumiho SDK not importable ({exc}); run under "
        "C:\\Users\\James\\.revka\\kumiho\\venv\\Scripts\\python.exe")
    kumiho = None

if kumiho is not None:
    try:
        client = kumiho.client_from_local_ce()
        if client is None:
            bad("no local CE advertised on 127.0.0.1:9190 (the tokenless local-mode probe failed)")
        else:
            ok("tokenless local CE client obtained via kumiho.client_from_local_ce()")
            with kumiho.use_client(client):
                proj = kumiho.get_project(PROJECT)
                if proj is None:
                    bad(f"project {PROJECT!r} not found")
                else:
                    ok(f"project {PROJECT!r} exists")
                    space = proj.get_space(SPACE)
                    if space is None:
                        bad(f"space {SPACE!r} not found")
                    else:
                        ok(f"space {SPACE!r} exists")
                        items = space.get_items()
                        tagged = [i for i in items if meta(i).get(TAG_KEY)]
                        print(f"       items in space              : {len(items)}")
                        print(f"       items carrying {TAG_KEY}    : {len(tagged)}")
                        if not tagged:
                            bad("no item in the space carries the constellation_id property")
                        n_rev = 0
                        edge_counts: dict[str, int] = {}
                        for it in tagged:
                            revs = it.get_revisions()
                            n_rev += len(revs)
                            for rev in revs:
                                try:
                                    for e in rev.get_edges():
                                        if meta(e).get("source") == EDGE_SOURCE:
                                            t = getattr(e, "edge_type", "?")
                                            edge_counts[t] = edge_counts.get(t, 0) + 1
                                except Exception:  # noqa: BLE001
                                    pass
                        print(f"       revisions on those items    : {n_rev}")
                        print(f"       constellation edges         : {edge_counts}")
                        sample = [f"{getattr(i, 'item_name', '')} [{getattr(i, 'kind', '')}]"
                                  for i in tagged[:6]]
                        print(f"       sample items                : {sample}")
    except Exception as exc:  # noqa: BLE001
        bad(f"SDK graph read failed: {type(exc).__name__}: {exc}")

print("3. 9Miho proxy (the UI view of the same graph)")
st, body = http_json("http://127.0.0.1:9999/api/health")
if st == 200:
    ok(f"/api/health -> {body}")
    for url, label in (
        ("http://127.0.0.1:9999/api/kumiho/projects", "projects"),
        (f"http://127.0.0.1:9999/api/kumiho/spaces?project={PROJECT}", "spaces"),
        (f"http://127.0.0.1:9999/api/kumiho/items?project={PROJECT}&space=Constellation", "items"),
    ):
        st2, b2 = http_json(url)
        print(f"       {label:9s} {st2} {json.dumps(b2, default=str)[:200]}")
else:
    bad(f"9Miho not answering on 9999 ({st}); start it with --kumiho ce")

print("4. Open the Constellation view by hand")
print("       Kumiho Desktop -> Constellation (default 3D view mode)")
print("       9Miho UI      -> http://127.0.0.1:9999/")

if failures:
    print(f"\nVERIFY FAILED ({len(failures)} problem(s)): see FAIL lines above")
    sys.exit(1)
print("\nVERIFY PASSED - the constellation is in the real Kumiho graph")

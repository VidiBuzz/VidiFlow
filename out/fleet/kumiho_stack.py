"""Read Kumiho's Neo4j graph and emit stack.json for the Vidi.Ai smart stack page.

Read-only. Credentials come from Kumiho's own server.toml — never hardcoded.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from neo4j import GraphDatabase

TOML = Path.home() / ".kumiho" / "server.toml"
OUT = Path(__file__).resolve().parent / "stack.json"


def conf() -> dict:
    out = {}
    for line in TOML.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s and not s.startswith("#") and "=" in s:
            k, v = s.split("=", 1)
            out[k.strip()] = v.strip().strip('"')
    return out


def reach(url: str) -> bool:
    import socket
    host, _, port = url.rpartition(":")
    host = host.split("//")[-1]
    try:
        with socket.create_connection((host, int(port)), timeout=1.2):
            return True
    except OSError:
        return False


def main() -> int:
    c = conf()
    cfg = {}
    dpath = Path.home() / ".kumiho" / "desktop.json"
    if dpath.is_file():
        try:
            cfg = json.loads(dpath.read_text(encoding="utf-8"))
        except ValueError:
            cfg = {}

    payload: dict = {"kernels": [], "projects": [], "spaces": [], "graph": {},
                     "counts": {}, "reltypes": [], "embedding": cfg}

    # ── kernel apps (9miho, revka) ───────────────────────────────────
    apps_root = Path.home() / ".kumiho" / "apps"
    if apps_root.is_dir():
        for d in sorted(apps_root.iterdir()):
            mf = d / "manifest.json"
            entry = {"name": d.name, "dir": str(d),
                     "has_manifest": mf.is_file(), "has_bin": (d / "bin").is_dir(),
                     "has_logs": (d / "logs").is_dir()}
            if mf.is_file():
                try:
                    m = json.loads(mf.read_text(encoding="utf-8"))
                    entry["manifest"] = {k: str(v)[:120] for k, v in m.items()
                                         if isinstance(v, (str, int, float, bool))}
                except ValueError:
                    entry["manifest_error"] = "unparseable"
            rt = d / "runtime.json"
            if rt.is_file():
                try:
                    r = json.loads(rt.read_text(encoding="utf-8"))
                    entry["runtime"] = {k: str(v)[:120] for k, v in r.items()
                                        if isinstance(v, (str, int, float, bool))}
                except ValueError:
                    pass
            payload["kernels"].append(entry)

    # ── neo4j graph ─────────────────────────────────────────────────
    uri = f"bolt://127.0.0.1:{c.get('neo4j_port', '7687')}"
    payload["graph"]["bolt"] = uri
    payload["graph"]["reachable"] = False
    try:
        drv = GraphDatabase.driver(uri, auth=(c.get("db_user"), c.get("db_pass")))
        drv.verify_connectivity()
        payload["graph"]["reachable"] = True
        with drv.session(database=c.get("db_name", "neo4j")) as s:
            payload["projects"] = [
                {"name": r["n"], "description": r["d"] or "",
                 "project_id": r["i"], "updated_at": str(r["u"])}
                for r in s.run(
                    "MATCH (p:Project) RETURN p.name AS n, p.description AS d, "
                    "p.project_id AS i, coalesce(p.updated_at,'') AS u ORDER BY p.name")
            ]
            payload["spaces"] = [r["p"] for r in s.run(
                "MATCH (s:Space) RETURN s.path AS p ORDER BY s.path")]
            labels = s.run("CALL db.labels() YIELD label RETURN label").value()
            counts = {}
            for lab in labels:
                counts[lab] = s.run(f"MATCH (n:`{lab}`) RETURN count(n) AS c").single()["c"]
            payload["counts"] = counts
            payload["counts"]["__total__"] = sum(counts.values())
            payload["reltypes"] = s.run(
                "CALL db.relationshipTypes() YIELD relationshipType "
                "RETURN relationshipType ORDER BY relationshipType").value()
            payload["kinds"] = [
                {"kind": r["k"], "n": r["c"]}
                for r in s.run("MATCH (i:Item) RETURN i.kind AS k, count(*) AS c "
                               "ORDER BY c DESC")]
        drv.close()
    except Exception as ex:  # noqa: BLE001
        payload["graph"]["error"] = f"{type(ex).__name__}: {ex}"[:200]

    OUT.write_text(json.dumps(payload, indent=1), encoding="utf-8")
    print(json.dumps({
        "kernels": [k["name"] for k in payload["kernels"]],
        "projects": [p["name"] for p in payload["projects"]],
        "spaces": len(payload["spaces"]),
        "nodes": payload["counts"].get("__total__", 0),
        "graph": payload["graph"]["reachable"],
    }, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
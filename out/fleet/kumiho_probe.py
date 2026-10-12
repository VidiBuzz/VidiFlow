"""Probe Kumiho's backing Neo4j: labels, counts, and a write/read round-trip.

Read-only unless --write is passed. Credentials come from Kumiho's own
server.toml so this never hardcodes a password.
"""
from __future__ import annotations

import sys
from pathlib import Path

from neo4j import GraphDatabase

TOML = Path.home() / ".kumiho" / "server.toml"


def conf() -> dict:
    out = {}
    for line in TOML.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s and not s.startswith("#") and "=" in s:
            k, v = s.split("=", 1)
            out[k.strip()] = v.strip().strip('"')
    return out


def main(write: bool = False) -> int:
    c = conf()
    uri = f"bolt://127.0.0.1:{c.get('neo4j_port', '7687')}"
    print(f"connecting {uri} as {c.get('db_user')}")
    drv = GraphDatabase.driver(uri, auth=(c.get("db_user"), c.get("db_pass")))
    try:
        drv.verify_connectivity()
        print("connectivity: OK")
        with drv.session(database=c.get("db_name", "neo4j")) as s:
            names = s.run(
                "CALL db.labels() YIELD label RETURN label ORDER BY label"
            ).value()
            print(f"labels ({len(names)}): {names}")
            total = 0
            for lab in names:
                n = s.run(f"MATCH (n:`{lab}`) RETURN count(n) AS c").single()["c"]
                total += n
                print(f"  {lab:28s} {n}")
            print(f"total nodes: {total}")

            rels = s.run(
                "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType"
            ).value()
            print(f"relationship types: {rels}")

            if write:
                tag = "hydra-probe"
                s.run("MERGE (n:`HydraProbe` {tag:$tag}) "
                      "SET n.ts=datetime(), n.note=$note", tag=tag,
                      note="kumiho write test")
                got = s.run("MATCH (n:`HydraProbe` {tag:$tag}) RETURN n.note AS note",
                            tag=tag).single()
                print(f"write round-trip: {'OK' if got and got['note'] else 'FAILED'}")
                s.run("MATCH (n:`HydraProbe` {tag:$tag}) DELETE n", tag=tag)
                print("probe node cleaned up")
            else:
                print("(read-only — pass --write to test a round-trip)")
    finally:
        drv.close()
    return 0


if __name__ == "__main__":
    sys.exit(main(write="--write" in sys.argv))
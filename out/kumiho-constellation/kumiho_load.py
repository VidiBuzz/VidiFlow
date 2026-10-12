#!/usr/bin/env python3
"""Load a VidiBot constellation (nodes.json + edges.json) into Kumiho CE.

SAFE BY DEFAULT. Without --commit this script ONLY reads the two JSON files,
validates them, and prints the exact Kumiho SDK calls that a live load would
make. It never opens a graph connection in dry-run mode.

A live write needs THREE gates at once, so it cannot happen by accident:

    --commit                         (explicit flag)
    KUMIHO_CONSTELLATION_GO=1        (env var, set by James only)
    --project <name>                 (the target project must be named)

Run it with the Kumiho sidecar interpreter, which is where the kumiho SDK
(kumiho 0.14.0) is installed:

    C:\\Users\\James\\.revka\\kumiho\\venv\\Scripts\\python.exe kumiho_load.py --dry-run

The SDK is imported lazily, so --dry-run also works under any Python 3.

Mapping (see LOAD-INTO-KUMIHO.md for the reasoning):
    node  ->  :Item (+ :Revision carrying the node's text/metadata)
    edge  ->  Revision -[EDGE_TYPE]-> Revision
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_NODES = HERE / "nodes.json"
DEFAULT_EDGES = HERE / "edges.json"

# Kumiho rule, mirrored from kumiho/edge.py: ^[A-Z][A-Z0-9_]{0,49}$
_EDGE_RE = re.compile(r"^[A-Z][A-Z0-9_]{0,49}$")
# Kumiho rule, mirrored from kumiho/kref.py: path segments are \w plus . and -
_SLUG_RE = re.compile(r"[^0-9a-zA-Z_.-]+")
RESERVED_KINDS = {"bundle"}  # kumiho.bundle.RESERVED_KINDS

NODE_ID_KEYS = ("id", "key", "node_id", "nid", "uid")
NODE_NAME_KEYS = ("name", "label", "title", "caption", "display")
NODE_KIND_KEYS = ("kind", "type", "node_type", "category", "class")
EDGE_FROM_KEYS = ("source", "from", "s", "src", "source_id", "from_id")
EDGE_TO_KEYS = ("target", "to", "t", "dst", "target_id", "to_id")
EDGE_TYPE_KEYS = ("type", "edge_type", "rel", "relation", "label", "kind")


def _pick(d: dict, keys, default=None):
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return default


def slug(text: str, limit: int = 60) -> str:
    s = _SLUG_RE.sub("-", str(text).strip().lower()).strip("-.")
    s = re.sub(r"-{2,}", "-", s)
    return (s or "unnamed")[:limit]


def edge_type(text: str) -> str:
    t = re.sub(r"[^A-Za-z0-9]+", "_", str(text or "RELATED_TO")).strip("_").upper()
    if not t or not t[0].isalpha():
        t = "RELATED_TO"
    return t[:50]


def stable_key(prefix: str, *parts) -> str:
    raw = "|".join(str(p) for p in parts)
    return f"{prefix}-{hashlib.sha1(raw.encode('utf-8')).hexdigest()[:16]}"


def load_json(path: Path, what: str):
    if not path.exists():
        sys.exit(f"FAIL: {what} not found at {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as exc:
        sys.exit(f"FAIL: {what} is not valid JSON ({exc})")
    if isinstance(data, dict):
        for k in ("nodes", "items", "data", "vertices", "edges", "links", "records"):
            if isinstance(data.get(k), list):
                data = data[k]
                break
        else:
            data = [data]
    if not isinstance(data, list) or not data:
        sys.exit(f"FAIL: {what} has no records")
    return data


def normalise_nodes(raw_nodes) -> tuple[list[dict], list[str]]:
    out, problems = [], []
    seen = {}
    for i, n in enumerate(raw_nodes):
        if not isinstance(n, dict):
            problems.append(f"node[{i}] is not an object")
            continue
        nid = _pick(n, NODE_ID_KEYS)
        if nid in (None, ""):
            problems.append(f"node[{i}] has no id (looked for {NODE_ID_KEYS})")
            continue
        nid = str(nid)
        if nid in seen:
            problems.append(f"duplicate node id {nid!r} (index {i})")
            continue
        seen[nid] = i
        name = str(_pick(n, NODE_NAME_KEYS, nid))
        kind = slug(_pick(n, NODE_KIND_KEYS, "constellation_node"), 40)
        if kind in RESERVED_KINDS:
            problems.append(f"node {nid!r}: kind {kind!r} is reserved by Kumiho, renamed")
            kind = "constellation_node"
        props = n.get("props") if isinstance(n.get("props"), dict) else {}
        for k, v in n.items():
            if k in props or k in NODE_ID_KEYS + NODE_NAME_KEYS + NODE_KIND_KEYS:
                continue
            props.setdefault(k, v)
        meta = {f"cn_{k}": (v if isinstance(v, str) else json.dumps(v, default=str))
                for k, v in props.items() if v is not None}
        meta["constellation_id"] = nid
        meta["source"] = "vidibot.constellation"
        text = str(props.get("summary") or props.get("description") or props.get("text")
                   or f"{name} ({kind})")
        out.append({
            "id": nid, "name": name, "kind": kind, "item_name": slug(nid),
            "text": text[:2000], "meta": meta,
            "idem_item": stable_key("cn-item", nid, kind),
            "idem_rev": stable_key("cn-rev", nid, kind),
        })
    return out, problems


def normalise_edges(raw_edges, node_ids) -> tuple[list[dict], list[str]]:
    out, problems = [], []
    for i, e in enumerate(raw_edges):
        if not isinstance(e, dict):
            problems.append(f"edge[{i}] is not an object")
            continue
        src = _pick(e, EDGE_FROM_KEYS)
        dst = _pick(e, EDGE_TO_KEYS)
        if src in (None, "") or dst in (None, ""):
            problems.append(f"edge[{i}] missing source/target (looked for {EDGE_FROM_KEYS}/{EDGE_TO_KEYS})")
            continue
        src, dst = str(src), str(dst)
        for side, val in (("source", src), ("target", dst)):
            if val not in node_ids:
                problems.append(f"edge[{i}] {side} {val!r} is not a known node id")
        et = edge_type(_pick(e, EDGE_TYPE_KEYS, "RELATED_TO"))
        if not _EDGE_RE.match(et):
            problems.append(f"edge[{i}] type {et!r} fails the Kumiho pattern {_EDGE_RE.pattern}")
            continue
        props = e.get("props") if isinstance(e.get("props"), dict) else {}
        for k, v in e.items():
            if k in props or k in EDGE_FROM_KEYS + EDGE_TO_KEYS + EDGE_TYPE_KEYS:
                continue
            props.setdefault(k, v)
        meta = {f"ce_{k}": (v if isinstance(v, str) else json.dumps(v, default=str))
                for k, v in props.items() if v is not None}
        meta.setdefault("source", "vidibot.constellation")
        out.append({"source": src, "target": dst, "type": et, "meta": meta,
                    "idem_edge": stable_key("cn-edge", src, dst, et)})
    return out, problems


def build_plan(nodes, edges, project, space):
    plan = {
        "project": project,
        "space_path": space,
        "counts": {"nodes": len(nodes), "edges": len(edges),
                   "kinds": {}, "edge_types": {}},
        "calls": [],
    }
    for n in nodes:
        plan["counts"]["kinds"][n["kind"]] = plan["counts"]["kinds"].get(n["kind"], 0) + 1
        plan["calls"].append({
            "step": "space.create_item",
            "args": {"item_name": n["item_name"], "kind": n["kind"]},
            "then": [{"step": "item.set_metadata", "args": {"metadata": n["meta"]}},
                     {"step": "item.create_revision",
                      "args": {"metadata": n["meta"], "embedding_text": n["text"],
                               "idempotency_key": n["idem_rev"]}}],
            # idempotency_key is only honoured by create_revision; item identity
            # is the (space_path, item_name, kind) triple Kumiho MERGEs on.
            "idempotency_key": n["idem_item"],
        })
    for e in edges:
        plan["counts"]["edge_types"][e["type"]] = plan["counts"]["edge_types"].get(e["type"], 0) + 1
        plan["calls"].append({
            "step": "source_revision.create_edge",
            "args": {"target_revision": f"<latest revision of node {e['target']}>",
                     "edge_type": e["type"], "metadata": e["meta"],
                     "idempotency_key": e["idem_edge"]},
            "source_kref_of": e["source"],
        })
    return plan


def commit(plan, nodes, edges, project, space):
    """Live load. Only reached when all three gates are satisfied."""
    os.environ.pop("PYTHONPATH", None)  # Hermes injects one that shadows the sidecar venv
    try:
        import kumiho  # noqa: F401
    except Exception as exc:  # noqa: BLE001
        sys.exit(f"FAIL: kumiho SDK not importable ({exc}). Use the sidecar venv python.")

    client = kumiho.client_from_local_ce()
    if client is None:
        sys.exit("FAIL: no local Kumiho CE advertised at 127.0.0.1:9190 "
                 "(is kumiho_server.exe up? see LOAD-INTO-KUMIHO.md step 0)")

    by_id = {}
    with kumiho.use_client(client):
        try:
            proj = kumiho.get_project(project)
        except Exception:  # noqa: BLE001
            proj = None
        if proj is None:
            proj = kumiho.create_project(project, "VidiBot constellation load (EquityGen view)")
            print(f"created project {project!r}")

        # project.get_space raises when the space is missing; create_space(name)
        # puts the new space at the project root, i.e. /<project>/<name>.
        try:
            target_space = proj.get_space(space)
        except Exception:  # noqa: BLE001
            target_space = None
        if target_space is None:
            leaf = [p for p in space.strip("/").split("/") if p][-1]
            target_space = proj.create_space(leaf)
            print(f"created space {target_space.path}")

        for n in nodes:
            try:
                item = target_space.get_item(n["item_name"], n["kind"])
            except Exception:  # noqa: BLE001
                item = None
            if item is None:
                item = target_space.create_item(n["item_name"], n["kind"])
                print(f"item  {item.kref}")
            item.set_metadata(n["meta"])
            rev = item.create_revision(metadata=n["meta"], embedding_text=n["text"],
                                       idempotency_key=n["idem_rev"])
            by_id[n["id"]] = rev.kref

        for e in edges:
            src = kumiho.get_revision(by_id[e["source"]])
            dst = kumiho.get_revision(by_id[e["target"]])
            edge = src.create_edge(dst, e["type"], metadata=e["meta"],
                                   idempotency_key=e["idem_edge"])
            print(f"edge  {e['source']} -[{e['type']}]-> {e['target']}")
    print(f"LOAD COMPLETE: {len(nodes)} items, {len(edges)} edges")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--nodes", default=str(DEFAULT_NODES))
    ap.add_argument("--edges", default=str(DEFAULT_EDGES))
    ap.add_argument("--project", default="EquityGen")
    ap.add_argument("--space", default="/EquityGen/Constellation")
    ap.add_argument("--commit", action="store_true", help="write to the live graph (needs GO env)")
    ap.add_argument("--plan-out", default=str(HERE / "kumiho-load-plan.json"))
    args = ap.parse_args()

    raw_nodes = load_json(Path(args.nodes), "nodes.json")
    raw_edges = load_json(Path(args.edges), "edges.json")
    nodes, nprob = normalise_nodes(raw_nodes)
    edges, eprob = normalise_edges(raw_edges, {n["id"] for n in nodes})
    problems = nprob + eprob

    plan = build_plan(nodes, edges, args.project, args.space)
    Path(args.plan_out).write_text(json.dumps(plan, indent=1, default=str), encoding="utf-8")

    print(f"nodes parsed : {len(nodes)}   edges parsed: {len(edges)}")
    print(f"kinds        : {plan['counts']['kinds']}")
    print(f"edge types   : {plan['counts']['edge_types']}")
    print(f"target       : project={plan['project']} space={plan['space_path']}")
    print(f"SDK calls    : {len(plan['calls'])}  -> plan written to {args.plan_out}")
    for c in plan["calls"][:6]:
        print(f"  would call {c['step']}({json.dumps(c['args'], default=str)[:140]})")
    if len(plan["calls"]) > 6:
        print(f"  ... {len(plan['calls']) - 6} more (see the plan file)")
    if problems:
        print(f"\n{len(problems)} PROBLEM(S):")
        for p in problems[:25]:
            print(f"  - {p}")
        print("Fix these before any live load.")

    go = os.environ.get("KUMIHO_CONSTELLATION_GO") == "1"
    if not args.commit:
        print("\nDRY RUN ONLY - no connection to Kumiho was opened. "
              "Add --commit AND KUMIHO_CONSTELLATION_GO=1 (James's GO) to write.")
        return 1 if problems else 0
    if not go:
        sys.exit("\nREFUSED: --commit given but KUMIHO_CONSTELLATION_GO is not 1. "
                 "Nothing was written. James must say go.")
    if problems:
        sys.exit(f"\nREFUSED: {len(problems)} validation problem(s) unresolved. Nothing was written.")
    commit(plan, nodes, edges, args.project, args.space)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Per-term OpenGloss v1.1 -> LEX ETL (plan §4, corrections §2b).

Usage:
  C:\\Python314\\python.exe lexi-pipeline\\etl_term.py <word> [<word> ...]
  C:\\Python314\\python.exe lexi-pipeline\\etl_term.py --rebuild-graph
  C:\\Python314\\python.exe lexi-pipeline\\etl_term.py --rebuild-index

Per word:
  1. DuckDB-filter senses (case-insensitive), assert count vs word_idx.
  2. Normalize -> out/sql/<word>.sql with ON CONFLICT upserts (senses keyed on
     source_id; edges keyed on (sense_id, lower(src), lower(tgt), rel_type)).
     derivation_* -> derivation; inflection kept; other 5 pass through;
     self-loops dropped; edge domain = sense's first domain:* tag; word-level
     list fields unioned in as matching edge types.
  3. term_acr link when the word matches a curated seed acr (seed-unified.json).
  4. Static artifacts: vidiflow/public/lex/terms/<word>.json + index.json update.
     graph.json is rebuilt only after batch sweeps (--rebuild-graph / etl_batch).
"""
import argparse
import datetime
import json
import os
import sys

import duckdb

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # M:/code/vidismart
DB_PATH = os.path.join(HERE, "data", "opengloss", "word_index.duckdb")
SEED_PATH = os.path.join(HERE, "seed-unified.json")
SQL_DIR = os.path.join(HERE, "out", "sql")
PUBLIC_LEX = os.path.join(ROOT, "vidiflow", "public", "lex")
TERMS_DIR = os.path.join(PUBLIC_LEX, "terms")
SOURCE_NAME = "opengloss-v1.1"

SENSE_COLS = [
    "id", "word", "pos", "sense_index", "definition", "examples",
    "synonyms", "antonyms", "hypernyms", "hyponyms", "collocations",
    "derivations", "inflections", "sense_edges", "tags", "reading_level",
    "wiki_frequency", "wiki_frequency_rank", "total_edges",
]

VALID_RELS = {"synonym", "antonym", "hypernym", "hyponym",
              "collocation", "derivation", "inflection"}
REL_MAP = {
    "derivation_noun": "derivation",
    "derivation_verb": "derivation",
    "derivation_adjective": "derivation",
    "derivation_adverb": "derivation",
}
LIST_FIELD_REL = {
    "synonyms": "synonym",
    "antonyms": "antonym",
    "hypernyms": "hypernym",
    "hyponyms": "hyponym",
    "collocations": "collocation",
}
DERIV_KEYS = ("noun_forms", "verb_forms", "adjective_forms", "adverb_forms")
INFLECT_KEYS = ("plural", "past_tense", "past_participle", "present_participle",
                "third_person_singular", "comparative", "superlative")

FEATURED_TOP = 150          # non-curated featured nodes in graph.json
MAX_GRAPH_BYTES = 2_000_000  # plan §8 hard cap


# ---------------------------------------------------------------- helpers

def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect(read_only=True):
    return duckdb.connect(DB_PATH, read_only=read_only)


def qs(v):
    """SQL text literal (standard_conforming_strings on: quote-doubling only)."""
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def qj(v):
    """SQL text literal carrying JSON (for jsonb columns)."""
    return qs(json.dumps(v if v is not None else [], ensure_ascii=False))


def qi(v):
    return "NULL" if v is None else str(int(v))


def load_curated():
    """{lower(acr): curated term dict} from seed-unified.json."""
    if not os.path.exists(SEED_PATH):
        return {}
    with open(SEED_PATH, encoding="utf-8") as f:
        seed = json.load(f)
    return {t["acr"].lower(): t for t in seed.get("terms", [])}


def primary_domain(tags):
    """First domain:* tag value, else None (plan §2b: NOT metadata.domain)."""
    for t in tags or []:
        if isinstance(t, str) and t.startswith("domain:"):
            return t.split(":", 1)[1]
    return None


def default_sense(senses):
    """Highest wiki_frequency; tie -> lowest sense_index (adp rank tie, handover)."""
    return min(senses, key=lambda s: (-(s.get("wiki_frequency") or 0),
                                      s.get("sense_index") or 0))


def fetch_senses(con, word):
    sel = ", ".join(f'"{c}"' for c in SENSE_COLS)
    rows = con.execute(
        f"SELECT {sel} FROM senses WHERE lower(word) = lower(?) "
        "ORDER BY sense_index, pos", [word]).fetchall()
    out = [dict(zip(SENSE_COLS, r)) for r in rows]
    # row-count assertion vs word_idx (plan §8)
    n_idx = con.execute(
        "SELECT n_senses FROM word_idx WHERE w = lower(?)", [word]).fetchone()
    expected = n_idx[0] if n_idx else 0
    assert len(out) == expected, f"{word}: fetched {len(out)} senses, word_idx says {expected}"
    return out


def extract_edges(row):
    """Normalized, self-loop-free, de-duped edges for one sense row.

    Returns list of (source_word, target_word, rel_type). sense_edges first,
    then word-level list fields unioned in (dedupe drops pairs already present).
    """
    out = []
    seen = set()

    def add(src, tgt, rel):
        if not src or not tgt:
            return
        src, tgt = str(src).strip(), str(tgt).strip()
        if not src or not tgt:
            return
        if src.lower() == tgt.lower():
            return  # self-loop (plan §2b)
        rel = REL_MAP.get(rel, rel)
        if rel not in VALID_RELS:
            return
        key = (src.lower(), tgt.lower(), rel)
        if key in seen:
            return
        seen.add(key)
        out.append((src, tgt, rel))

    for e in row.get("sense_edges") or []:
        add(e.get("source_word") or row["word"], e.get("target_word"),
            e.get("relationship_type"))
    word = row["word"]
    for field, rel in LIST_FIELD_REL.items():
        for tgt in row.get(field) or []:
            add(word, tgt, rel)
    deriv = row.get("derivations") or {}
    for k in DERIV_KEYS:
        for tgt in deriv.get(k) or []:
            add(word, tgt, "derivation")
    infl = row.get("inflections") or {}
    for k in INFLECT_KEYS:
        for tgt in infl.get(k) or []:
            add(word, tgt, "inflection")
    return out


# ---------------------------------------------------------------- SQL build

SENSE_INSERT_COLS = ("source_id, word, pos, sense_index, definition, synonyms, "
                     "antonyms, hypernyms, hyponyms, collocations, derivations, "
                     "examples, domain, reading_level, wiki_frequency, "
                     "wiki_frequency_rank, term_acr, source")
SENSE_UPDATE_COLS = ("word", "pos", "sense_index", "definition", "synonyms",
                     "antonyms", "hypernyms", "hyponyms", "collocations",
                     "derivations", "examples", "domain", "reading_level",
                     "wiki_frequency", "wiki_frequency_rank", "term_acr", "source")


def build_word_sql(word, senses, term_acr, header=True):
    """One BEGIN/COMMIT block upserting all senses + edges of a word."""
    lines = []
    if header:
        lines.append(f"-- lexi ETL: {word} ({now_iso()}) — {SOURCE_NAME}")
    lines.append("BEGIN;")

    # senses
    vals = []
    for r in senses:
        dom = primary_domain(r.get("tags"))
        vals.append("({})".format(", ".join([
            qs(r["id"]), qs(r["word"]), qs(r["pos"]), str(int(r["sense_index"])),
            qs(r.get("definition") or ""),
            qj(r.get("synonyms")), qj(r.get("antonyms")), qj(r.get("hypernyms")),
            qj(r.get("hyponyms")), qj(r.get("collocations")),
            qs(json.dumps(r.get("derivations") or {}, ensure_ascii=False)),
            qj(r.get("examples")),
            qs(dom), qs(r.get("reading_level")),
            qi(r.get("wiki_frequency")), qi(r.get("wiki_frequency_rank")),
            qs(term_acr), qs(SOURCE_NAME),
        ])))
    update = ", ".join(f"{c} = EXCLUDED.{c}" for c in SENSE_UPDATE_COLS)
    lines.append(f"INSERT INTO lexi_senses ({SENSE_INSERT_COLS}) VALUES")
    lines.append(",\n".join(vals))
    lines.append(f"ON CONFLICT (source_id) DO UPDATE SET {update};")

    # edges (JOIN back to lexi_senses via source_id -> sense_id)
    edge_rows = []
    for r in senses:
        dom = primary_domain(r.get("tags"))
        for src, tgt, rel in extract_edges(r):
            edge_rows.append(f"({qs(src)}, {qs(tgt)}, {qs(rel)}, {qs(r['id'])}, {qs(dom)})")
    if edge_rows:
        lines.append("INSERT INTO lexi_edges (source_word, target_word, relationship_type, sense_id, domain)")
        lines.append("SELECT v.sw, v.tw, v.rt, s.id, v.dom")
        lines.append("FROM (VALUES")
        lines.append(",\n".join(edge_rows))
        lines.append(") AS v(sw, tw, rt, sid, dom)")
        lines.append("JOIN lexi_senses s ON s.source_id = v.sid")
        lines.append("ON CONFLICT (sense_id, lower(source_word), lower(target_word), relationship_type) DO NOTHING;")

    lines.append("COMMIT;")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------- static artifacts

def term_json_payload(word, senses, curated):
    payload = {
        "word": senses[0]["word"] if senses else word,
        "w": word.lower(),
        "acr": curated["acr"] if curated else None,
        "curated": curated,
        "generated_at": now_iso(),
        "source": SOURCE_NAME,
        "senses": [],
    }
    for r in senses:
        payload["senses"].append({
            "source_id": r["id"],
            "pos": r["pos"],
            "sense_index": int(r["sense_index"]),
            "definition": r.get("definition") or "",
            "examples": r.get("examples") or [],
            "synonyms": r.get("synonyms") or [],
            "antonyms": r.get("antonyms") or [],
            "hypernyms": r.get("hypernyms") or [],
            "hyponyms": r.get("hyponyms") or [],
            "collocations": r.get("collocations") or [],
            "derivations": r.get("derivations") or {},
            "inflections": r.get("inflections") or {},
            "domain": primary_domain(r.get("tags")),
            "tags": r.get("tags") or [],
            "reading_level": r.get("reading_level"),
            "wiki_frequency": r.get("wiki_frequency"),
            "wiki_frequency_rank": r.get("wiki_frequency_rank"),
            "edges": [{"t": t, "r": rel} for _s, t, rel in extract_edges(r)],
        })
    return payload


def write_term_json(word, payload):
    os.makedirs(TERMS_DIR, exist_ok=True)
    path = os.path.join(TERMS_DIR, word.lower() + ".json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    with open(path, encoding="utf-8") as f:
        json.load(f)  # validation gate (plan §8)
    return path


def load_all_terms():
    """{lower word: term payload} from public/lex/terms/*.json."""
    out = {}
    if not os.path.isdir(TERMS_DIR):
        return out
    for fn in os.listdir(TERMS_DIR):
        if not fn.endswith(".json"):
            continue
        with open(os.path.join(TERMS_DIR, fn), encoding="utf-8") as f:
            t = json.load(f)
        out[fn[:-5].lower()] = t
    return out


def best_rank(term):
    ranks = [s.get("wiki_frequency_rank") for s in term.get("senses", [])
             if s.get("wiki_frequency_rank") is not None]
    return min(ranks) if ranks else None


def max_freq(term):
    freqs = [s.get("wiki_frequency") for s in term.get("senses", [])
             if s.get("wiki_frequency") is not None]
    return max(freqs) if freqs else None


def index_entry(w, term):
    curated = term.get("curated")
    senses = term.get("senses") or []
    e = {
        "w": w,
        "acr": curated["acr"] if curated else None,
        "c": bool(curated),
        "n": len(senses),
        "rank": best_rank(term),
        "freq": max_freq(term),
        "d": None,
        "s": "",
    }
    if senses:
        ds = default_sense(senses)
        e["d"] = ds.get("domain")
        e["s"] = (ds.get("definition") or "")[:140]
    if curated:
        e["full"] = curated.get("full", "")
        e["ol"] = curated.get("oneLiner", "")
        if not e["s"]:
            e["s"] = (curated.get("oneLiner") or "")[:140]
    return e


def rebuild_index(curated_map=None):
    """Rewrite public/lex/index.json from terms/*.json + curated-only seeds."""
    if curated_map is None:
        curated_map = load_curated()
    terms = load_all_terms()
    entries = {w: index_entry(w, t) for w, t in terms.items()}
    # curated seeds without OpenGloss senses still appear (e.g. crm)
    for low, curated in curated_map.items():
        if low not in entries:
            entries[low] = index_entry(low, {"curated": curated, "senses": []})
    ordered = sorted(entries.values(),
                     key=lambda e: (not e["c"], e["rank"] is None,
                                    e["rank"] or 0, e["w"]))
    payload = {
        "generated_at": now_iso(),
        "source": SOURCE_NAME,
        "total": len(ordered),
        "terms": ordered,
    }
    os.makedirs(PUBLIC_LEX, exist_ok=True)
    path = os.path.join(PUBLIC_LEX, "index.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    with open(path, encoding="utf-8") as f:
        json.load(f)
    size = os.path.getsize(path)
    print(f"index.json: {len(ordered)} terms, {size/1024:.1f} KB")
    return path


def rebuild_graph(featured_top=FEATURED_TOP, max_bytes=MAX_GRAPH_BYTES):
    """graph.json = featured terms + internal edges + 1-hop neighbors, <= cap.

    Must run AFTER a batch sweep: internal-vs-external classification needs
    the full lexi_senses word set (handover). Internal = has terms/<w>.json.
    """
    terms = load_all_terms()
    if not terms:
        print("graph: no term files yet; skipping", file=sys.stderr)
        return None
    internal = set(terms.keys())
    curated_words = sorted(w for w, t in terms.items() if t.get("curated"))
    others = sorted((w for w in terms if w not in set(curated_words)),
                    key=lambda w: (best_rank(terms[w]) is None,
                                   best_rank(terms[w]) or 0, w))
    featured = curated_words + others[:featured_top]

    def node(w):
        t = terms[w]
        curated = t.get("curated")
        n = {
            "id": w,
            "label": curated["acr"] if curated else (t.get("word") or w),
            "c": bool(curated),
            "d": None,
            "rank": best_rank(t),
            "n": len(t.get("senses") or []),
        }
        senses = t.get("senses") or []
        if senses:
            n["d"] = default_sense(senses).get("domain")
        if curated:
            n["label"] = curated["acr"]
        return n

    def build(feat, neighbor_ws):
        node_ids = set(feat) | set(neighbor_ws)
        nodes = [node(w) for w in feat]
        nodes += [node(w) for w in sorted(neighbor_ws)]
        edges, seen = [], set()
        for w in feat:
            for s in terms[w].get("senses") or []:
                for e in s.get("edges") or []:
                    t = (e.get("t") or "").strip().lower()
                    r = e.get("r")
                    if not t or t not in node_ids or t == w:
                        continue
                    key = (w, t, r)
                    if key in seen:
                        continue
                    seen.add(key)
                    edges.append({"s": w, "t": t, "r": r})
        return nodes, edges

    # 1-hop internal neighbors of featured terms
    neighbor_rank = {}
    for w in featured:
        for s in terms[w].get("senses") or []:
            for e in s.get("edges") or []:
                t = (e.get("t") or "").strip().lower()
                if t in internal and t not in set(featured):
                    br = best_rank(terms[t])
                    if t not in neighbor_rank or (br is not None and
                                                  (neighbor_rank[t] is None or br < neighbor_rank[t])):
                        neighbor_rank[t] = br
    neighbors = sorted(neighbor_rank, key=lambda w: (neighbor_rank[w] is None,
                                                     neighbor_rank[w] or 0, w))

    feat = list(featured)
    while True:
        nodes, edges = build(feat, neighbors)
        payload = {
            "generated_at": now_iso(),
            "source": SOURCE_NAME,
            "node_count": len(nodes),
            "edge_count": len(edges),
            "nodes": nodes,
            "edges": edges,
        }
        blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        if len(blob.encode("utf-8")) <= max_bytes:
            break
        # over cap -> drop worst-rank external neighbors first (plan §8)
        if neighbors:
            keep = max(0, len(neighbors) - max(1, len(neighbors) // 10))
            neighbors = neighbors[:keep]
            continue
        non_curated = [w for w in feat if w not in set(curated_words)]
        if len(non_curated) > 10:
            drop = set(non_curated[max(10, len(non_curated) - max(1, len(non_curated) // 10)):])
            feat = [w for w in feat if w not in drop]
            continue
        print(f"graph: WARNING still {len(blob.encode('utf-8'))} bytes at minimal set",
              file=sys.stderr)
        break

    os.makedirs(PUBLIC_LEX, exist_ok=True)
    path = os.path.join(PUBLIC_LEX, "graph.json")
    with open(path, "w", encoding="utf-8") as f:
        f.write(blob)
    with open(path, encoding="utf-8") as f:
        json.load(f)
    print(f"graph.json: {len(nodes)} nodes, {len(edges)} edges, "
          f"{len(blob.encode('utf-8'))/1024:.1f} KB")
    return path


# ---------------------------------------------------------------- per-term driver

def etl_word(con, word, curated_map, dry_run=False, sql_out=None):
    """Run the per-term pipeline. Returns stats dict or None on total miss."""
    low = word.lower()
    curated = curated_map.get(low)
    senses = fetch_senses(con, word)
    if not senses and not curated:
        print(f"{word}: MISS (no OpenGloss senses, not a curated seed)")
        return None

    stats = {"word": low, "acr": curated["acr"] if curated else None,
             "senses": len(senses), "edges": 0, "rel_counts": {},
             "domains": sorted({primary_domain(r.get("tags")) for r in senses} - {None}),
             "sql": None, "json": None}

    edge_keys = set()
    for r in senses:
        for src, tgt, rel in extract_edges(r):
            assert rel in VALID_RELS, f"bad rel {rel}"
            assert src.lower() != tgt.lower(), f"self-loop leaked: {src}"
            edge_keys.add((r["id"], src.lower(), tgt.lower(), rel))
    stats["edges"] = len(edge_keys)
    for _sid, _s, _t, rel in edge_keys:
        stats["rel_counts"][rel] = stats["rel_counts"].get(rel, 0) + 1

    if dry_run:
        print(f"{low}: {stats['senses']} senses, {stats['edges']} edges, "
              f"domains={stats['domains']}, acr={stats['acr']}, "
              f"rels={stats['rel_counts']}")
        return stats

    if senses:
        sql = build_word_sql(low, senses, stats["acr"])
        if sql_out:
            with open(sql_out, "a", encoding="utf-8") as f:
                f.write(sql + "\n")
            stats["sql"] = sql_out
        else:
            os.makedirs(SQL_DIR, exist_ok=True)
            path = os.path.join(SQL_DIR, low + ".sql")
            with open(path, "w", encoding="utf-8") as f:
                f.write(sql)
            stats["sql"] = path

    payload = term_json_payload(low, senses, curated)
    stats["json"] = write_term_json(low, payload)
    print(f"{low}: {stats['senses']} senses, {stats['edges']} edges, "
          f"domains={stats['domains']}, acr={stats['acr']} -> "
          f"{os.path.basename(stats['sql'] or '-')}, terms/{low}.json")
    return stats


def main(argv=None):
    ap = argparse.ArgumentParser(description="Per-term OpenGloss -> LEX ETL")
    ap.add_argument("words", nargs="*", help="word(s) or acr(s) to ETL")
    ap.add_argument("--dry-run", action="store_true",
                    help="stats only, no SQL/JSON writes")
    ap.add_argument("--rebuild-graph", action="store_true",
                    help="rebuild public/lex/graph.json from terms/*.json")
    ap.add_argument("--rebuild-index", action="store_true",
                    help="rebuild public/lex/index.json from terms/*.json")
    args = ap.parse_args(argv)

    if args.rebuild_graph:
        rebuild_graph()
        return 0
    if args.rebuild_index:
        rebuild_index()
        return 0
    if not args.words:
        ap.error("give at least one word, or --rebuild-graph/--rebuild-index")

    curated_map = load_curated()
    con = connect()
    misses = 0
    try:
        for w in args.words:
            if etl_word(con, w, curated_map, dry_run=args.dry_run) is None:
                misses += 1
    finally:
        con.close()

    if not args.dry_run:
        rebuild_index(curated_map)
    return 2 if misses and misses == len(args.words) else 0


if __name__ == "__main__":
    sys.exit(main())

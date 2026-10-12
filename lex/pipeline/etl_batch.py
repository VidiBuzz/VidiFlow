"""Batch sweep: tech-domain top-N senses -> one importable .sql + static artifacts.

Usage:
  C:\\Python314\\python.exe lexi-pipeline\\etl_batch.py
  C:\\Python314\\python.exe lexi-pipeline\\etl_batch.py --domains domain:technology --top 2000
  C:\\Python314\\python.exe lexi-pipeline\\etl_batch.py --dry-run

Selects the top --top senses by wiki_frequency_rank carrying any of --domains
tags, takes their distinct words, and ETLs ALL senses of those words (polysemes
stay split). The 15 curated seed terms are always included as featured nodes
(plan §7 step 4). Outputs:
  - lexi-pipeline/out/sql/seed_sweep.sql  (per-word BEGIN/COMMIT blocks)
  - vidiflow/public/lex/terms/<word>.json (per word)
  - vidiflow/public/lex/index.json + graph.json (rebuilt AFTER the sweep —
    internal-vs-external edge classification needs the full word set)
"""
import argparse
import os
import sys

import etl_term as E

DEFAULT_SQL_OUT = os.path.join(E.SQL_DIR, "seed_sweep.sql")


def select_words(con, domains, top):
    """Distinct words of the top-N domain-tagged senses, ordered by best rank."""
    rows = con.execute("""
        WITH top_senses AS (
            SELECT lower(word) AS w
            FROM senses
            WHERE list_has_any(tags, ?::VARCHAR[])
            ORDER BY wiki_frequency_rank ASC NULLS LAST, sense_index ASC
            LIMIT ?
        ),
        words AS (SELECT DISTINCT w FROM top_senses)
        SELECT lower(s.word) AS w, min(s.wiki_frequency_rank) AS best
        FROM senses s
        WHERE lower(s.word) IN (SELECT w FROM words)
        GROUP BY 1
        ORDER BY best ASC NULLS LAST, w ASC
    """, [domains, int(top)]).fetchall()
    return [(r[0], r[1]) for r in rows]


def main(argv=None):
    ap = argparse.ArgumentParser(description="OpenGloss batch sweep -> LEX")
    ap.add_argument("--domains", nargs="+", default=["domain:technology"],
                    help="senses.tags domain filter (default: domain:technology)")
    ap.add_argument("--top", type=int, default=2000,
                    help="top-N senses by wiki_frequency_rank (default 2000)")
    ap.add_argument("--out", default=DEFAULT_SQL_OUT, help="output .sql path")
    ap.add_argument("--dry-run", action="store_true",
                    help="selection stats only, no writes")
    args = ap.parse_args(argv)

    curated_map = E.load_curated()
    con = E.connect()
    try:
        selected = select_words(con, args.domains, args.top)
        print(f"selected {len(selected)} words from top {args.top} "
              f"{args.domains} senses")
        if selected:
            print(f"  best rank: {selected[0][0]} ({selected[0][1]}), "
                  f"worst: {selected[-1][0]} ({selected[-1][1]})")

        # curated seeds always ride along (featured nodes; crm-style misses
        # still get a curated-only term file)
        words = [w for w, _ in selected]
        for low in curated_map:
            if low not in set(words):
                words.append(low)
        print(f"total words incl. {len(curated_map)} curated seeds: {len(words)}")

        if args.dry_run:
            n_senses = con.execute(
                "SELECT count(*) FROM senses WHERE lower(word) IN "
                "(SELECT unnest(?::VARCHAR[]))", [words]).fetchone()[0]
            print(f"dry-run: would ETL {len(words)} words / {n_senses} senses")
            return 0

        os.makedirs(os.path.dirname(args.out), exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(f"-- lexi batch sweep {E.now_iso()} — {E.SOURCE_NAME}\n")
            f.write(f"-- domains: {' '.join(args.domains)}  top: {args.top}  "
                    f"words: {len(words)}\n\n")

        total_senses = total_edges = misses = 0
        for i, w in enumerate(words, 1):
            stats = E.etl_word(con, w, curated_map, sql_out=args.out)
            if stats is None:
                misses += 1
                continue
            total_senses += stats["senses"]
            total_edges += stats["edges"]
            if i % 200 == 0:
                print(f"  ...{i}/{len(words)} words, {total_senses} senses, "
                      f"{total_edges} edges")
    finally:
        con.close()

    print(f"sweep done: {len(words) - misses} words, {total_senses} senses, "
          f"{total_edges} edges, {misses} misses")
    print(f"sql: {args.out} ({os.path.getsize(args.out)/1024/1024:.1f} MB)")

    # index + graph rebuild belong AFTER the sweep (handover)
    E.rebuild_index(curated_map)
    E.rebuild_graph()
    return 0


if __name__ == "__main__":
    sys.exit(main())

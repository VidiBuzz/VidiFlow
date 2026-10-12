"""Bootstrap: build word_index.duckdb from OpenGloss v1.1 parquet (via hf://).

Creates M:\\code\\vidismart\\lexi-pipeline\\data\\opengloss\\word_index.duckdb with:
  - senses: all rows, needed columns only
  - word_idx: lower(word) -> row list for O(1) per-term lookup
"""
import os
import sys
import time

import duckdb

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data", "opengloss")
DB_PATH = os.path.join(DATA_DIR, "word_index.duckdb")
HF_GLOB = os.path.join(DATA_DIR, "*.parquet").replace("\\", "/")

COLS = [
    "id", "word", "base_form", '"part_of_speech" AS pos', "sense_index", "definition", "examples",
    "synonyms", "antonyms", "hypernyms", "hyponyms", "collocations",
    "derivations", "inflections", "sense_edges", "tags", "reading_level",
    "wiki_frequency", "wiki_frequency_rank", "total_edges",
]

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    con = duckdb.connect(DB_PATH)
    con.execute("INSTALL httpfs; LOAD httpfs;")
    t0 = time.time()
    sel = ", ".join(c if " AS " in c else f'"{c}"' for c in COLS)
    con.execute(f"DROP TABLE IF EXISTS senses")
    con.execute(f"""
        CREATE TABLE senses AS
        SELECT {sel}
        FROM read_parquet('{HF_GLOB}', union_by_name=true, hive_partitioning=false)
    """)
    n = con.execute("SELECT count(*) FROM senses").fetchone()[0]
    print(f"senses rows: {n} in {time.time()-t0:.1f}s")
    con.execute("DROP TABLE IF EXISTS word_idx")
    con.execute("""
        CREATE TABLE word_idx AS
        SELECT lower(word) AS w, count(*) AS n_senses,
               min(wiki_frequency_rank) AS best_rank,
               max(wiki_frequency) AS max_freq
        FROM senses GROUP BY 1
    """)
    con.execute("CREATE INDEX IF NOT EXISTS idx_senses_word ON senses(word)")
    nw = con.execute("SELECT count(*) FROM word_idx").fetchone()[0]
    print(f"word_idx entries: {nw} in {time.time()-t0:.1f}s")
    # sanity sample
    for row in con.execute("SELECT w, n_senses FROM word_idx WHERE w IN ('crm','rag','adp')").fetchall():
        print("sample:", row)
    con.close()
    print("OK ->", DB_PATH)

if __name__ == "__main__":
    sys.exit(main())

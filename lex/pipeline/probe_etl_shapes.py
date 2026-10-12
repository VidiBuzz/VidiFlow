"""Probe nested field shapes in word_index.duckdb for the ETL (plan §2b)."""
import duckdb
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "data", "opengloss", "word_index.duckdb")

con = duckdb.connect(DB, read_only=True)

print("== word_idx presence for dry-run words ==")
for r in con.execute(
    "SELECT w, n_senses, best_rank, max_freq FROM word_idx "
    "WHERE w IN ('crm','rag','adp','api','saas','llm','kafka') ORDER BY w"
).fetchall():
    print(" ", r)

print("\n== column types ==")
for r in con.execute("DESCRIBE senses").fetchall():
    print(f"  {r[0]:<22} {r[1]}")

print("\n== sample row (api, sense 0) nested shapes ==")
row = con.execute(
    "SELECT id, word, pos, sense_index, synonyms, antonyms, hypernyms, hyponyms, "
    "collocations, derivations, inflections, sense_edges, tags, reading_level, "
    "wiki_frequency, wiki_frequency_rank, total_edges "
    "FROM senses WHERE lower(word)='api' ORDER BY sense_index LIMIT 1"
).fetchone()
names = ["id","word","pos","sense_index","synonyms","antonyms","hypernyms","hyponyms",
         "collocations","derivations","inflections","sense_edges","tags","reading_level",
         "wiki_frequency","wiki_frequency_rank","total_edges"]
for n, v in zip(names, row):
    s = repr(v)
    print(f"  {n}: {s[:400]}")

print("\n== adp senses (polysemy check) ==")
for r in con.execute(
    "SELECT sense_index, pos, left(definition, 80), tags, wiki_frequency, wiki_frequency_rank "
    "FROM senses WHERE lower(word)='adp' ORDER BY sense_index"
).fetchall():
    print(" ", r)

print("\n== derivations/inflections struct keys (non-empty sample) ==")
r = con.execute(
    "SELECT derivations, inflections FROM senses "
    "WHERE len(map_keys(derivations)) > 0 AND len(map_keys(inflections)) > 0 LIMIT 1"
).fetchone()
if r:
    print("  derivations:", repr(r[0])[:300])
    print("  inflections:", repr(r[1])[:300])
else:
    # maybe they are STRUCTs with fixed keys, not MAPs
    r = con.execute("SELECT derivations, inflections FROM senses WHERE derivations IS NOT NULL LIMIT 2").fetchall()
    for x in r:
        print("  derivations:", repr(x[0])[:300])
        print("  inflections:", repr(x[1])[:300])

print("\n== sense_edges element sample ==")
r = con.execute(
    "SELECT sense_edges[1] FROM senses WHERE len(sense_edges) > 0 LIMIT 1"
).fetchone()
print(" ", repr(r[0])[:400] if r else "none")

con.close()
print("OK")

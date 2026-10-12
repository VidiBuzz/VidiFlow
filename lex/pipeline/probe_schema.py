import duckdb
con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs;")
G = "hf://datasets/mjbommar/opengloss-v1.1-definitions@~parquet/default/train/*.parquet"
for r in con.execute(f"DESCRIBE SELECT * FROM read_parquet('{G}') LIMIT 1").fetchall():
    print(r[0], "|", r[1])
print("---count---")
print(con.execute(f"SELECT count(*) FROM read_parquet('{G}')").fetchone())

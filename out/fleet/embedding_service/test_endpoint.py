"""
In-process endpoint test for the VidiFlow embedding service.

Exercises POST /v1/embeddings with FastAPI's TestClient, which runs the ASGI
app in-process and binds NO socket -- so this does not start a server.

Run:
    ./.venv/Scripts/python.exe test_endpoint.py
"""

from __future__ import annotations

import sys

from fastapi.testclient import TestClient

from service import MODEL_ID, app

client = TestClient(app)

print("=" * 68)
print("VidiFlow embedding service - endpoint test (no socket bound)")
print("=" * 68)

# 1. Health must answer instantly WITHOUT loading the model.
r = client.get("/health")
print(f"\n[1] GET /health -> {r.status_code}")
body = r.json()
print(f"    status={body['status']}  model={body['model']}")
print(f"    model_source={body['model_source']}")
print(f"    loaded_before_first_request={body['loaded']}")
assert r.status_code == 200
assert body["loaded"] is False, "health probe must not trigger a model load"

# 2. Single string input.
r = client.post("/v1/embeddings", json={"input": "hello world", "model": MODEL_ID})
print(f"\n[2] POST /v1/embeddings (single string) -> {r.status_code}")
b = r.json()
assert r.status_code == 200, b
assert b["object"] == "list"
assert len(b["data"]) == 1
emb = b["data"][0]["embedding"]
print(f"    object={b['object']}  model={b['model']}")
print(f"    data[0].index={b['data'][0]['index']}  embedding_len={len(emb)}")
print(f"    usage={b['usage']}")
print(f"    first_5={emb[:5]}")

# 3. Batch input -> indexes must be 0..n-1 and in order.
texts = [
    "Kubernetes pod scheduling failed due to insufficient memory.",
    "A recipe for chocolate chip cookies.",
    "Semantic search uses embeddings to find related documents.",
]
r = client.post("/v1/embeddings", json={"input": texts, "model": MODEL_ID})
print(f"\n[3] POST /v1/embeddings (batch of {len(texts)}) -> {r.status_code}")
b = r.json()
assert r.status_code == 200, b
assert len(b["data"]) == len(texts)
assert [d["index"] for d in b["data"]] == list(range(len(texts)))
print(f"    indexes={[d['index'] for d in b['data']]}  (ordered 0..n-1)")
print(f"    embedding_len={len(b['data'][0]['embedding'])}")
print(f"    usage={b['usage']}")

# 4. Cosine sanity through the HTTP-shaped response.
def cos(a, bv):
    return sum(x * y for x, y in zip(a, bv)) ** 0.5 and (
        sum(x * y for x, y in zip(a, bv))
        / ((sum(x * x for x in a) ** 0.5) * (sum(y * y for y in bv) ** 0.5))
    )

e0 = b["data"][0]["embedding"]
e2 = b["data"][2]["embedding"]
print(f"    cosine(batch[0] 'Kubernetes', batch[2] 'semantic search') = {cos(e0, e2):.4f}")
print(f"    cosine(batch[0] 'Kubernetes', batch[1] 'cookies')          = {cos(e0, b['data'][1]['embedding']):.4f}")

# 5. Invalid input must 400, not 500.
r = client.post("/v1/embeddings", json={"input": []})
print(f"\n[4] POST with empty input -> {r.status_code} (expect 400)")
assert r.status_code == 400

print("\n[5] GET /health after requests -> loaded =", client.get("/health").json()["loaded"])
print("\nRESULT: PASS - endpoint contract satisfied (no server was started)")
print("=" * 68)
sys.exit(0)
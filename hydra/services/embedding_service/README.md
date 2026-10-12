# VidiFlow — Local Embedding Service

Standalone, OpenAI-compatible embedding service for indexing Hermes artifacts
(466 files, 361 links, 91 images — 918 total). Runs entirely on the local
RTX 4090; no data leaves the machine.

> Note: this is a **separate** indexing service for the VidiFlow artifact
> corpus. It is unrelated to Kumiho's internal capture embedding.

## What it does

Serves `POST /v1/embeddings` backed by a local `sentence-transformers` model
(**Qwen/Qwen3-Embedding-0.6B**, Apache-2.0, 1024-dim, 32K context). Vectors
are L2-normalized on the way out, so cosine similarity is a plain dot product.

The model is loaded **lazily on the first request**, so process start is
instant and a health probe works before the model is resident. It binds to
**127.0.0.1 only**.

## Files

| File | Purpose |
| --- | --- |
| `service.py` | The FastAPI service (`/v1/embeddings`, `/health`) |
| `verify_embeddings.py` | Loads the model and prints dim / shape / cosine sims / VRAM |
| `test_endpoint.py` | In-process endpoint contract test (binds **no** socket) |
| `requirements.txt` | Pinned, verified-working versions |
| `install_deps.sh` | Idempotent one-shot setup (~3.4 GB download) |
| `models/` | Local model snapshot (1.2 GB) |
| `.venv/` | Python 3.14 venv with the CUDA torch build (3.1 GB) |

## Install

```bash
cd M:/code/VidiFlow/out/fleet/embedding_service
./install_deps.sh
```

Or manually:

```bash
C:/Python314/python.exe -m venv .venv

# torch must come from the CUDA index -- the PyPI cp314 wheel is CPU-only!
./.venv/Scripts/python.exe -m pip install torch==2.14.1+cu130 \
    --index-url https://download.pytorch.org/whl/cu130

./.venv/Scripts/python.exe -m pip install -r requirements.txt

hf download Qwen/Qwen3-Embedding-0.6B --local-dir models/Qwen3-Embedding-0.6B
```

> **Gotcha:** if a `PYTHONPATH` is set in your shell (Hermes sets one to its
> own venv), `pip` will report dependencies as "already satisfied" and skip
> installing them into this venv, leaving it broken. `unset PYTHONPATH` first —
> `install_deps.sh` does this automatically.

## Start

```bash
./.venv/Scripts/python.exe service.py
# -> http://127.0.0.1:8799/v1/embeddings   (override with EMBED_PORT)
```

First request pays a one-time ~12.5 s model load (measured, see below).

### Health check

```bash
curl http://127.0.0.1:8799/health
# {"status":"ok","model":"Qwen/Qwen3-Embedding-0.6B","loaded":false,...}
```

## curl example (exact)

Single string:

```bash
curl -X POST http://127.0.0.1:8799/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input": "How does semantic search work?", "model": "Qwen/Qwen3-Embedding-0.6B"}'
```

Batch:

```bash
curl -X POST http://127.0.0.1:8799/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input": ["Kubernetes pod scheduling failed.", "A recipe for cookies."],
       "model": "Qwen/Qwen3-Embedding-0.6B"}'
```

Response shape (abridged):

```json
{
  "object": "list",
  "data": [{"object": "embedding", "index": 0, "embedding": [-0.0140380859375, 0.0177001953125, ...]}],
  "model": "Qwen/Qwen3-Embedding-0.6B",
  "usage": {"prompt_tokens": 26, "total_tokens": 26},
  "dimensions": 1024
}
```

Drop-in `base_url` for the OpenAI SDK:

```python
from openai import OpenAI
client = OpenAI(base_url="http://127.0.0.1:8799/v1", api_key="not-needed")
```

### Request extensions

Beyond the OpenAI fields, `instruction` prefixes the text (for query-side
encoding). Qwen3-Embedding is instruction-tuned and expects a task
description on the query side but a bare passage on the document side:

```json
{"input": "cuda out of memory", "instruction": "Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: "}
```

`dimensions` is accepted but **rejected with HTTP 400** if it disagrees with
the model's real 1024 — silently truncating would corrupt the index.

## Config (env vars)

| Var | Default | Meaning |
| --- | --- | --- |
| `EMBEDDING_MODEL_ID` | `Qwen/Qwen3-Embedding-0.6B` | Model to serve |
| `EMBEDDING_DIM` | `1024` | Expected dim (checked, not enforced by truncation) |
| `EMBED_PORT` | `8799` | Bind port (host is hardcoded 127.0.0.1) |
| `EMBED_BATCH_SIZE` | `8` | Encode batch size |
| `EMBED_MAX_TOKENS` | `8192` | Reserved for truncation |

## Verified output — ACTUAL run

`./.venv/Scripts/python.exe verify_embeddings.py` on the RTX 4090, verbatim:

```
====================================================================
VidiFlow embedding service - verification (no server)
====================================================================
torch              : 2.14.1+cu130
torch.cuda.is_available(): True
device (named)     : NVIDIA GeForce RTX 4090
model id           : Qwen/Qwen3-Embedding-0.6B
model source       : M:\code\VidiFlow\out\fleet\embedding_service\models\Qwen3-Embedding-0.6B

device (actual)    : cuda
embedding dimension: 1024
output array shape : (4, 1024)  (4 texts, numpy)
output dtype       : float32
norm of vector[0]  : 0.999627 (normalized)
tokens (usage)     : 133

--------------------------------------------------------------------
Cosine similarity - RELATED pairs (expect HIGH)
--------------------------------------------------------------------
  [0] 0.6782  The deployment pipeline builds the container image a...
  [1] 0.9236  Vector embeddings power semantic search over a docum...
  [2] 0.7358  The GPU has twenty three gigabytes of video memory a...
  [3] 0.8549  How do I fix a CUDA out of memory error during infer...

--------------------------------------------------------------------
Cosine similarity - UNRELATED pairs (expect LOW)
--------------------------------------------------------------------
  [0] 0.2143  The deployment pipeline builds the container image a...
  [1] 0.3295  Vector embeddings power semantic search over a docum...
  [2] 0.3020  The GPU has twenty three gigabytes of video memory a...
  [3] 0.2851  How do I fix a CUDA out of memory error during infer...

--------------------------------------------------------------------
Summary
--------------------------------------------------------------------
  related   : min=0.6782  mean=0.7981  max=0.9236
  unrelated : min=0.2143  mean=0.2827  max=0.3295
  separation margin (min related - max unrelated) = +0.3487
  peak VRAM allocated : 1203.1 MB
  peak VRAM reserved  : 1222.0 MB

RESULT: PASS - every related pair beats every unrelated pair
====================================================================
```

**Key verified numbers**

- Embedding dimension: **1024** (shape `(4, 1024)`, `float32`)
- Related pairs: **min 0.6782**, mean 0.7981, max 0.9236
- Unrelated pairs: **min 0.2143**, mean 0.2827, max 0.3295
- Separation margin: **+0.3487** — the *worst* related pair still beats the
  *best* unrelated pair, so the ranking is unambiguous
- Device: **cuda** (`torch.cuda.is_available()` → `True`)
- Peak VRAM: **1203.1 MB** allocated / 1222.0 MB reserved
- Lazy load confirmed: **12.5 s** on first request, `loaded=false` before it

The script exits non-zero if any related pair fails to beat every unrelated
pair, so it doubles as a regression gate after any model swap.

## Endpoint contract test

`./.venv/Scripts/python.exe test_endpoint.py` — runs the ASGI app through
FastAPI's `TestClient`, which **binds no socket and starts no server**:

```
[1] GET /health -> 200
    loaded_before_first_request=False
[embedding_service] loaded ...\Qwen3-Embedding-0.6B in 12.5s
[2] POST /v1/embeddings (single string) -> 200
    embedding_len=1024   usage={'prompt_tokens': 2, 'total_tokens': 2}
[3] POST /v1/embeddings (batch of 3) -> 200
    indexes=[0, 1, 2]  (ordered 0..n-1)   embedding_len=1024
    cosine(batch[0] 'Kubernetes', batch[2] 'semantic search') = 0.3678
    cosine(batch[0] 'Kubernetes', batch[1] 'cookies')          = 0.3186
[4] POST with empty input -> 400 (expect 400)
[5] GET /health after requests -> loaded = True

RESULT: PASS - endpoint contract satisfied (no server was started)
```

## Installation notes / issues hit

1. **Python 3.14 wheels.** torch 2.14.1 and sentence-transformers do ship
   cp314 wheels, so the Python 3.14 requirement was satisfiable.
2. **PyPI torch is CPU-only.** The default `pip install torch` for cp314 is a
   124 MB build with no CUDA. The real CUDA wheel is 2.0 GB and lives at
   `download.pytorch.org/whl/cu130`. Installing from PyPI alone would have
   silently produced a CPU-only service.
3. **CUDA 13.0 index.** `cu126`/`cu128`/`cu129` only carry torch ≤ 2.11 for
   cp314; `cu130` has 2.14.1, which matches driver 610.88.
4. **`PYTHONPATH` leakage.** With Hermes' site-packages on `PYTHONPATH`, pip
   skipped several deps as "already satisfied" and the venv was incomplete.
   Fixed by `unset PYTHONPATH` before every install/run.
5. **`padding_side` kwarg.** Passing it via `model_kwargs` raises
   `TypeError: Qwen3Model.__init__() got an unexpected keyword argument
   'padding_side'`. It must be `tokenizer_kwargs={"padding_side": "left"}`,
   because Qwen3-Embedding pools the last token and needs left padding in
   mixed-length batches. The direct-load script missed this because it built
   the model with different kwargs; the endpoint test caught it.
6. **`2_Normalize` folder absent.** `modules.json` references a `2_Normalize`
   module directory that the snapshot does not ship (it is stateless, so
   loading is unaffected — confirmed by the runs above).

## Next step (not done here)

The service is verified but nothing has been indexed yet. The artifact
indexer for the 918 Hermes artifacts is separate work: chunk the text,
embed via this service, and store vectors in a vector index. Note the
`tencent/WeMM-2B` option for the 91 images is **not** installed — this
service is text-only for now.
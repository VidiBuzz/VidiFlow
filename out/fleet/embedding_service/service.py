"""
VidiFlow local embedding service.

OpenAI-compatible POST /v1/embeddings backed by a local sentence-transformers
model (default: Qwen/Qwen3-Embedding-0.6B). Binds to 127.0.0.1 only.

The model is loaded LAZILY on first request so process startup is instant;
a health probe can report readiness without paying the ~5-15s model load.

Run:
    python service.py
    # -> http://127.0.0.1:8799/v1/embeddings
"""

from __future__ import annotations

import os
import pathlib
import threading
import time
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
HERE = pathlib.Path(__file__).resolve().parent

MODEL_ID = os.environ.get(
    "EMBEDDING_MODEL_ID", "Qwen/Qwen3-Embedding-0.6B"
)
# Resolve a bare model id to the local models/ snapshot dir if we have it,
# so the service runs fully offline once the download has happened.
LOCAL_MODEL_DIR = HERE / "models" / MODEL_ID.split("/")[-1]

EMBEDDING_DIM = int(os.environ.get("EMBEDDING_DIM", "1024"))
MAX_BATCH_TOKENS = int(os.environ.get("EMBED_MAX_TOKENS", "8192"))
BATCH_SIZE = int(os.environ.get("EMBED_BATCH_SIZE", "8"))

# Qwen3-Embedding is an instruction-tuned model: prefix the query side with
# an instruction, leave the passage side bare. This measurably improves
# retrieval quality. Callers can override per-request.
DEFAULT_QUERY_INSTRUCTION = (
    "Instruct: Given a web search query, retrieve relevant passages "
    "that answer the query\nQuery: "
)

# --------------------------------------------------------------------------
# Lazy model loading
# --------------------------------------------------------------------------
_model: Any = None
_model_lock = threading.Lock()
_load_error: str | None = None


def _resolve_model_source() -> str:
    if LOCAL_MODEL_DIR.is_dir():
        return str(LOCAL_MODEL_DIR)
    return MODEL_ID


def _build_model():
    """Construct the model + tokenizer. Runs once, guarded by a lock."""
    source = _resolve_model_source()
    from sentence_transformers import SentenceTransformer

    kwargs: dict[str, Any] = {}
    try:
        import torch

        if torch.cuda.is_available():
            kwargs["device"] = "cuda"
    except Exception:  # torch missing / broken -> stay on CPU
        pass

    # Qwen3-Embedding-0.6B pools the LAST token, so left padding is required
    # for correct results when a batch mixes short and long texts. This is a
    # TOKENIZER setting -- passing it as model_kwargs raises TypeError.
    kwargs["tokenizer_kwargs"] = {"padding_side": "left"}

    return SentenceTransformer(source, **kwargs)


def get_model():
    """Return the loaded model, loading it on first access."""
    global _model, _load_error
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        t0 = time.time()
        try:
            _model = _build_model()
            _load_error = None
            print(
                f"[embedding_service] loaded {_resolve_model_source()} "
                f"in {time.time() - t0:.1f}s",
                flush=True,
            )
        except Exception as exc:  # surface the reason on every later request
            _load_error = f"{type(exc).__name__}: {exc}"
            raise
    return _model


def load_error() -> str | None:
    return _load_error


# --------------------------------------------------------------------------
# Request / response schemas (OpenAI wire format)
# --------------------------------------------------------------------------
class EmbeddingRequest(BaseModel):
    input: str | list[str]
    model: str | None = None
    encoding_format: Literal["float", "base64"] = "float"
    dimensions: int | None = None
    # VidiFlow extensions (ignored by strict OpenAI clients).
    instruction: str | None = Field(
        default=None,
        description="Optional instruction prefix, e.g. for query-side encoding.",
    )


def _usage(tokens: int) -> dict[str, int]:
    return {"prompt_tokens": tokens, "total_tokens": tokens}


# --------------------------------------------------------------------------
# App
# --------------------------------------------------------------------------
app = FastAPI(
    title="VidiFlow Embedding Service",
    version="1.0.0",
    description="Local OpenAI-compatible embeddings on Qwen3-Embedding-0.6B.",
)


@app.get("/health")
@app.get("/v1/health")
def health() -> dict[str, Any]:
    """Readiness probe. Does NOT force a model load."""
    return {
        "status": "ok",
        "model": MODEL_ID,
        "model_source": _resolve_model_source(),
        "loaded": _model is not None,
        "expected_dim": EMBEDDING_DIM,
        "load_error": _load_error,
    }


@app.post("/v1/embeddings")
def create_embeddings(req: EmbeddingRequest) -> dict[str, Any]:
    """OpenAI-compatible embeddings endpoint."""
    texts = [req.input] if isinstance(req.input, str) else list(req.input)
    if not texts:
        raise HTTPException(status_code=400, detail="input must not be empty")
    if any(not isinstance(t, str) for t in texts):
        raise HTTPException(status_code=400, detail="input items must be strings")

    # Optional instruction prefix (query-side encoding).
    if req.instruction:
        texts = [req.instruction + t for t in texts]

    dim = req.dimensions or EMBEDDING_DIM

    try:
        model = get_model()
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail=f"model load failed: {load_error()}"
        ) from exc

    try:
        vecs = model.encode(
            texts,
            batch_size=BATCH_SIZE,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"encode failed: {exc}") from exc

    actual_dim = int(vecs.shape[1])
    if req.dimensions and req.dimensions != actual_dim:
        # Truncation is not semantically safe; report instead of faking it.
        raise HTTPException(
            status_code=400,
            detail=(
                f"model produces {actual_dim}-dim embeddings; "
                f"dimensions={req.dimensions} cannot be satisfied"
            ),
        )

    try:
        import torch

        n_tokens = sum(
            len(model.tokenizer.encode(t, add_special_tokens=False)) for t in texts
        )
    except Exception:
        n_tokens = 0

    return {
        "object": "list",
        "data": [
            {"object": "embedding", "index": i, "embedding": vec.tolist()}
            for i, vec in enumerate(vecs)
        ],
        "model": req.model or MODEL_ID,
        "usage": _usage(n_tokens),
        "dimensions": actual_dim,
    }


if __name__ == "__main__":
    import uvicorn

    # 127.0.0.1 only -- this service is not meant to be reachable off-host.
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=int(os.environ.get("EMBED_PORT", "8799")),
        log_level="info",
    )
"""
Offline verification for the VidiFlow embedding service.

Loads the model directly (NO server), embeds test sentences, and reports:
  - model name
  - embedding dimension
  - output array shape
  - cosine similarity for RELATED vs UNRELATED pairs
  - CUDA device actually used + peak VRAM

The related pairs MUST score strictly higher than the unrelated pairs; the
script exits non-zero if that invariant fails, so it is safe to use as a gate.

Run:
    ./.venv/Scripts/python.exe verify_embeddings.py
"""

from __future__ import annotations

import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
MODEL_DIR = HERE / "models" / "Qwen3-Embedding-0.6B"
MODEL_ID = "Qwen/Qwen3-Embedding-0.6B"

RELATED = [
    ("The deployment pipeline builds the container image and pushes it to the registry.",
     "Our CI publishes a Docker image to the container registry on every merge."),
    ("Vector embeddings power semantic search over a document collection.",
     "Semantic search retrieves documents by embedding similarity rather than keywords."),
    ("The GPU has twenty three gigabytes of video memory available.",
     "This graphics card offers 23 GB of VRAM for model inference."),
    ("How do I fix a CUDA out of memory error during inference?",
     "An out of memory CUDA error can be resolved by reducing the batch size."),
]

UNRELATED = [
    ("The deployment pipeline builds the container image and pushes it to the registry.",
     "I baked sourdough bread this morning and it rose nicely."),
    ("Vector embeddings power semantic search over a document collection.",
     "The city council approved a new bike lane on the east side of town."),
    ("The GPU has twenty three gigabytes of video memory available.",
     "She is studying for a proficiency exam in conversational French."),
    ("How do I fix a CUDA out of memory error during inference?",
     "A documentary about migratory birds was nominated for an award."),
]

SHORT = [
    "Kubernetes pod scheduling failed due to insufficient memory.",
    "Postgres query plans improve with the right indexes.",
    "A recipe for chocolate chip cookies.",
]

LONG_PARAGRAPH = (
    "Semantic search differs from keyword search because it reasons about meaning "
    "rather than exact token overlap. An embedding model converts each document and "
    "each query into a fixed-length vector, and retrieval becomes a nearest-neighbour "
    "search in that vector space. Modern instruction-tuned embedding models accept a "
    "task description alongside the query, which measurably improves recall on "
    "heterogeneous corpora. The main practical costs are model memory footprint, "
    "index build time, and the need to re-embed the corpus whenever the model "
    "changes, because vectors from different models are not comparable."
)


def cosine(a, b) -> float:
    import numpy as np

    a = np.asarray(a, dtype="float64")
    b = np.asarray(b, dtype="float64")
    denom = float((a * a).sum()) ** 0.5 * float((b * b).sum()) ** 0.5
    if denom == 0.0:
        return 0.0
    return float((a * b).sum() / denom)


def main() -> int:
    import numpy as np
    import torch
    from sentence_transformers import SentenceTransformer

    cuda_ok = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_ok else "cpu"

    print("=" * 68)
    print("VidiFlow embedding service - verification (no server)")
    print("=" * 68)
    print(f"torch              : {torch.__version__}")
    print(f"torch.cuda.is_available(): {cuda_ok}")
    print(f"device (named)     : {device_name}")

    src = str(MODEL_DIR) if MODEL_DIR.is_dir() else MODEL_ID
    print(f"model id           : {MODEL_ID}")
    print(f"model source       : {src}")

    model = SentenceTransformer(src, device="cuda" if cuda_ok else "cpu")

    # Where did the tensors actually land?
    actual_device = next(model.parameters()).device.type
    print(f"device (actual)    : {actual_device}")
    if actual_device != ("cuda" if cuda_ok else "cpu"):
        print("  !! WARNING: parameters are not on the expected device")

    texts = SHORT + [LONG_PARAGRAPH]
    vecs = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    dim = int(vecs.shape[1])
    print(f"embedding dimension: {dim}")
    print(f"output array shape : {tuple(vecs.shape)}  ({len(texts)} texts, numpy)")
    print(f"output dtype       : {vecs.dtype}")
    print(f"norm of vector[0]  : {float(np.linalg.norm(vecs[0])):.6f} (normalized)")

    n_tokens = sum(
        len(model.tokenizer.encode(t, add_special_tokens=False)) for t in texts
    )
    print(f"tokens (usage)     : {n_tokens}")

    print()
    print("-" * 68)
    print("Cosine similarity - RELATED pairs (expect HIGH)")
    print("-" * 68)
    rel_scores = []
    for i, (x, y) in enumerate(RELATED):
        s = cosine(model.encode(x, normalize_embeddings=True, show_progress_bar=False),
                   model.encode(y, normalize_embeddings=True, show_progress_bar=False))
        rel_scores.append(s)
        print(f"  [{i}] {s:.4f}  {x[:52]}...")

    print()
    print("-" * 68)
    print("Cosine similarity - UNRELATED pairs (expect LOW)")
    print("-" * 68)
    unr_scores = []
    for i, (x, y) in enumerate(UNRELATED):
        s = cosine(model.encode(x, normalize_embeddings=True, show_progress_bar=False),
                   model.encode(y, normalize_embeddings=True, show_progress_bar=False))
        unr_scores.append(s)
        print(f"  [{i}] {s:.4f}  {x[:52]}...")

    rel_min = min(rel_scores)
    unr_max = max(unr_scores)
    rel_mean = sum(rel_scores) / len(rel_scores)
    unr_mean = sum(unr_scores) / len(unr_scores)

    print()
    print("-" * 68)
    print("Summary")
    print("-" * 68)
    print(f"  related   : min={rel_min:.4f}  mean={rel_mean:.4f}  max={max(rel_scores):.4f}")
    print(f"  unrelated : min={min(unr_scores):.4f}  mean={unr_mean:.4f}  max={unr_max:.4f}")
    print(f"  separation margin (min related - max unrelated) = {rel_min - unr_max:+.4f}")

    if cuda_ok:
        peak_mb = torch.cuda.max_memory_allocated() / (1024 * 1024)
        reserved_mb = torch.cuda.max_memory_reserved() / (1024 * 1024)
        print(f"  peak VRAM allocated : {peak_mb:.1f} MB")
        print(f"  peak VRAM reserved  : {reserved_mb:.1f} MB")
    else:
        print("  peak VRAM: n/a (CPU run)")

    ok = rel_min > unr_max
    print()
    print(f"RESULT: {'PASS' if ok else 'FAIL'} - "
          f"every related pair {'beats' if ok else 'does NOT beat'} every unrelated pair")
    print("=" * 68)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
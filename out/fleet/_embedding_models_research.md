# Best Embedding Models — October 2026

*Research date: 2026-10-05. Scores are as published on model cards / leaderboards at the dates noted. Leaderboard variants differ (MTEB English v2, MTEB Multilingual v2, RTEB, MMTEB) — don't compare across them.*

## TOP PICKS

1. **`nvidia/Nemotron-3-Embed-8B-BF16` (2026-07-16, NEW)** — #1 on multilingual RTEB (78.5), 75.5 MMTEB Retrieval. Fits in 23GB at 8-bit; top open retrieval model right now.
2. **`Qwen/Qwen3-Embedding-0.6B` (2025-06, Apache-2.0)** — 1024-dim, 32K ctx, MRL-truncatable to 32. Best quality-per-second ratio; the pragmatic default. (8B is better but heavy.)
3. **`microsoft/harrier-oss-v1-27b` (2026-03, NEW, MIT)** — MTEB v2 multilingual #1 (74.3), 5376-dim. 27B: needs quantization to fit 23GB. The 0.6B sibling (69.0, 1024-dim) fits trivially.
4. **`jinaai/jina-embeddings-v5-omni-small` (2026-05-07, NEW)** — 1.74B, one 1024-dim space for text+image+audio+video. Best open omni model under 5B (avg 53.93 across MMTEB/MIEB/MMEB/MAEB). **License is CC-BY-NC-4.0 — non-commercial.**
5. **`BAAI/bge-m3` (2024-01, MIT)** — still the most-downloaded open embedder; dense + sparse + ColBERT multi-vector in one model. Not the top scorer, but unbeatable operational simplicity.

## TEXT MODELS

| Model | dim | max ctx | size | license | 24GB GPU | notes |
|---|---|---|---|---|---|---|
| Nemotron-3-Embed-8B-BF16 (2026-07) | 4096 | 32K | 8B | NVIDIA OpenMDW (commercial OK) | yes @8-bit (bf16 ~16GB) | RTEB multilingual #1 (78.5) |
| harrier-oss-v1-27b (2026-03) | 5376 | 32,768 | 27B | MIT | only quantized | MTEB v2 multilingual #1 (74.3), Gemma3 backbone |
| harrier-oss-v1-0.6b (2026-03) | 1024 | 32,768 | 0.6B | MIT | yes | MTEB v2 69.0 |
| Qwen3-Embedding-8B (2025-06) | 4096 (MRL 32–4096) | 32K | 8B | Apache-2.0 | yes @8-bit | MTEB multilingual 70.58 (Jun 2025 card) |
| Qwen3-Embedding-0.6B (2025-06) | 1024 (MRL) | 32K | 0.6B | Apache-2.0 | yes | MTEB Eng v2 ~#27, Multi v2 ~#20 |
| jina-embeddings-v5-text-small (2026-02-18) | 1024 (MRL→32) | 32K | 677M | CC-BY-NC-4.0 | yes | MTEB English v2 71.7, MMTEB 67.7 |
| jina-embeddings-v5-text-nano (2026-02) | 768 (MRL) | 8K | 239M | CC-BY-NC-4.0 | yes | fast/cheap |
| BAAI/bge-m3 (2024-01) | 1024 | 8192 | 568M | MIT | yes | 100+ langs; dense+sparse+ColBERT |
| nvidia/NV-Embed-v2 (2024-08) | 4096 | 32K | 7B | NVIDIA (commercial) | yes @8-bit | MTEB 72.31 (Aug 2024) — dated now |
| intfloat/multilingual-e5-large-v2 (2024) | 1024 | 512 | 560M | MIT | yes | no meaningful 2025/26 successor found |
| bge-small-en-v1.5 (current) | 384 | 512 | 33M | MIT | yes | English-only, 2023-era — replace |

**BGE 2026 status:** no confirmed new BAAI release. Claims of a "BGE-3" / "BGE-en-ICL" appear only on SEO blogs, not HF model cards — treat as **unverified**. BGE-M3 remains the BAAI flagship.

## IMAGE MODELS

| Model | dim | max ctx | size | license | 24GB GPU | notes |
|---|---|---|---|---|---|---|
| tencent/WeMM-Embedding-2B (2026-08-25, NEW) | 2048 (MRL→64) | 262K | 2.2B | Apache-2.0 | yes (~4.1GB) | MMEB-v2 SOTA for open; 2B beats prior 8B open baselines |
| tencent/WeMM-Embedding-4B / 9B (2026-08) | 2560 / 4096 (MRL) | 262K | 4.2B / 9B | Apache-2.0 | 4B yes; 9B tight | 9B MMEB-v2 80.6 |
| Qwen3-VL-Embedding-2B (2026-04, NEW) | 2048 (MRL) | 32K | 2B | Apache-2.0 | yes | text/image/screenshot/video, 30+ langs; MMTEB 67.88 |
| jina-v5-omni-small / nano (2026-05) | 1024 / 768 | 32K / 8K | 1.74B / 1.04B | CC-BY-NC-4.0 | yes | unified text+image+audio+video |
| google/siglip2-so400m-patch16-384 (2025-02) | 1152 | 384px | ~1B | Apache-2.0 | yes | **still the open default**; 109 langs |

**SigLIP 2026 status:** no confirmed SigLIP3. SigLIP 2 (Feb 2025) remains the current Google release; the frontier has moved to omni/multimodal models above (WeMM, Qwen3-VL).

## VIDEO MODELS

| Model | dim | ctx | size | license | 24GB GPU | notes |
|---|---|---|---|---|---|---|
| Qwen3-VL-Embedding-2B (2026-04) | 2048 MRL | 32K | 2B | Apache-2.0 | yes | handles video frames natively; MMEB-V2 77.9 (8B) |
| jina-v5-omni-small (2026-05) | 1024 MRL | 32K | 1.74B | CC-BY-NC-4.0 | yes | Charades-STA moment retrieval 55.57 |
| WeMM-Embedding-2B (2026-08) | 2048 MRL | 262K | 2.2B | Apache-2.0 | yes | top open MMEB-v2 incl. video tasks |
| SigLIP2 / OpenCLIP + frame sampling | 768–1152 | — | <1B | Apache-2.0 / MIT | yes | cheapest; mean-pool N frames per clip |
| InternVideo2 / V-JEPA 2 / VideoPrism | unknown | unknown | unknown | mixed | varies | video-native temporal; not retrieval-specialised |
| TwelveLabs Marengo 3.0 (2025-12) | 512 | 4hr video | closed | API | n/a | best video-native quality; API only |

## LATE-INTERACTION MODELS

ColBERT-style MaxSim, PLAID, ColPali, Jina-ColBERT-v2 remain the standard; 2026 work is incremental (ColBERT-Zero, SmallReason-ColBERT, FastPlaid Rust engine), no disruptive successor found. `sentence-transformers` v6 added a `MultiVectorEncoder` type, so late-interaction is now first-class in the mainstream stack.

**Verdict for a 918-doc corpus: not worth it.** Multi-vector storage is ~tokens×128 floats — orders of magnitude more than single-vector, and MaxSim only clearly wins for long chunks (500+ tokens) with precise entity/code queries. Your artifacts are short docs and links. Instead, **use hybrid dense + BM25** (which BGE-M3 or Qwen3 give you sparse outputs for free) plus a **reranker** — Qwen3-Reranker-0.6B or jina-reranker-v3.5 (2026-08-03) — which buys most of the accuracy at a fraction of the complexity.

## RECOMMENDED STACK FOR THIS MACHINE

**Primary text embedder: `Qwen/Qwen3-Embedding-0.6B`** (Apache-2.0, 1024-dim, 32K ctx, MRL down to 32). It runs at bf16 in ~2GB, indexes all 918 artifacts in seconds, is instruction-aware (important — your queries need the query prefix), handles code screenshots' OCR text, and covers 100+ languages so the English-only bge-small-en-v1.5 gap closes. Upgrade path to 4B/8B later if eval shows it's needed.

*Alternative if you want maximum retrieval quality and can afford ~10GB:* `nvidia/Nemotron-3-Embed-8B-BF16` at 8-bit — current RTEB #1. Or `harrier-oss-v1-0.6b` (MIT) if you'd rather avoid the Qwen lineage.

**Image embedder: `tencent/WeMM-Embedding-2B`** (Apache-2.0, ~4.1GB, 2048-dim → drop to 256 MRL dims and retain ~98.7% of MMEB-v2 performance). It handles your 91 images *and* code screenshots in the same space as text, so a text query like "CUDA OOM error" can hit a screenshot of one. `Qwen3-VL-Embedding-2B` is the alternate if you prefer a single Qwen-family stack.

**Optional reranker: `Qwen3-Reranker-0.6B`** — top-20 rerank on every query. Biggest single quality win per byte on a corpus this size.

**Video embedder: skip.** At 918 artifacts with no stated video content, a video-native model (Marengo 3.0, InternVideo2) pays for nothing. If video does land later, WeMM-2B or Qwen3-VL-2B already covers it in the same index — no new model needed.

**Migration note:** your current bge-small-en-v1.5 index is 384-dim and incompatible. Full re-embed of 918 items is trivial (minutes).

## SOURCES

- https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- https://huggingface.co/microsoft/harrier-oss-v1-27b
- https://huggingface.co/Qwen/Qwen3-Embedding-8B · https://github.com/QwenLM/Qwen3-Embedding
- https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- https://huggingface.co/jinaai/jina-embeddings-v5-text-small · https://jina.ai/models/llms.txt · https://arxiv.org/abs/2602.15547
- https://arxiv.org/abs/2605.08384 (jina-v5-omni)
- https://huggingface.co/tencent/WeMM-Embedding-2B · https://github.com/Tencent/WeMM-Embedding · https://arxiv.org/pdf/2608.24053
- https://huggingface.co/google/siglip2-so400m-patch16-384 · https://arxiv.org/abs/2502.14786
- https://huggingface.co/BAAI/bge-m3 · https://huggingface.co/nvidia/NV-Embed-v2
- https://huggingface.co/blog/multi-vector-encoder

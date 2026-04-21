# Vidi AI Embedding Model Research

## Vespa AI Embedding Compatibility

Vespa AI has **native support** for embedding models through its `embedding` field type and `embed` transformer. It supports:

1. **Hugging Face Transformer Models** - Direct integration via `hugging-face-embedder`
2. **OpenAI API** - Via `openai-embedder`
3. **Cohere API** - Via `cohere-embedder`
4. **Custom ONNX Models** - Any model exported to ONNX format

## Vespa's Native Embedding Support

Vespa does NOT have its own proprietary embedding models. Instead, it integrates with:

| Integration | Models Supported | Deployment |
|-------------|-----------------|------------|
| **Hugging Face** | Any transformer model (BERT, MiniLM, E5, etc.) | Self-hosted in Vespa containers |
| **OpenAI** | text-embedding-3-small, text-embedding-3-large | API call to OpenAI |
| **Cohere** | embed-english-v3.0, embed-multilingual-v3.0 | API call to Cohere |
| **ONNX** | Any ONNX-exported model | Self-hosted in Vespa containers |

## Top 3 Recommended Embedding Models for Vidi AI (ONNX-Optimized)

**All models below have native ONNX support** for real-time inference in both Vespa AI and Qdrant.

### 1. Text Embeddings: **BAAI/bge-small-en-v1.5** (Primary) + **BAAI/bge-base-en-v1.5** (High-Quality)

**Why:** Excellent ONNX support, proven performance, reasonable dimensions, fast inference for real-time.

| Property | bge-small | bge-base |
|----------|-----------|----------|
| Dimensions | 384 | 768 |
| Model Size | 130MB | 430MB |
| License | MIT |
| ONNX Support | ✅ Official ONNX export | ✅ Official ONNX export |
| Inference Time | ~5ms per doc | ~15ms per doc |
| MTEB Score | 63.5 | 66.4 |
| Vespa Integration | ONNX runtime (native) | ONNX runtime (native) |
| Qdrant Integration | fastembed library | fastembed library |

**Why NOT e5-mistral-7b:** 7B parameters = ~14GB VRAM, 4096 dimensions is overkill for most use cases, slow inference (~200ms+), not practical for real-time.

### 2. Image Embeddings: **openai/clip-vit-base-patch32** (ONNX)

**Why:** Official ONNX export available, 512 dimensions (manageable), fast inference (~10ms).

| Property | Value |
|----------|-------|
| Dimensions | 512 |
| Model Size | 340MB |
| License | MIT |
| ONNX Support | ✅ Official ONNX export (optimum-cli) |
| Inference Time | ~10ms per image |
| Vespa Integration | ONNX runtime (native) |
| Qdrant Integration | fastembed library |

### 3. Video Embeddings: **Frame-level CLIP + Temporal Pooling**

**Why:** No good ONNX video models exist yet. Best approach: extract key frames, run through CLIP, pool embeddings.

| Property | Value |
|----------|-------|
| Dimensions | 512 (same as CLIP) |
| Approach | Extract 1 frame/sec → CLIP → mean pool |
| ONNX Support | ✅ Uses same CLIP ONNX model |
| Inference Time | ~50ms per 10sec video |
| Vespa Integration | ONNX runtime (reuses CLIP) |
| Qdrant Integration | fastembed library |

## Recommended Architecture for Vidi AI

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIDI AI EMBEDDING PIPELINE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CONTENT TYPE    →  MODEL                    →  DIMENSIONS      │
│  ──────────────     ──────────────────────     ──────────       │
│  Text            →  BGE-base-en-v1.5 (ONNX)  →  768            │
│  Images          →  CLIP-ViT-B/32 (ONNX)     →  512            │
│  Video           →  CLIP frame pool (ONNX)   →  512            │
│  Audio           →  Whisper-base (ONNX)      →  512            │
│                                                                 │
│  All models: ONNX format → Vespa AI + Qdrant compatible        │
│  Real-time inference: <20ms per document                       │
│  All embeddings stored in Qdrant for fast similarity search    │
│  Vespa AI handles hybrid ranking (BM25 + vector + graph)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Vespa ONNX Configuration Example

```json
{
    "schemas": [{
        "name": "content",
        "fields": [
            {
                "name": "text_embedding",
                "type": "tensor<float>(x[768])",
                "indexing": ["input text", "embed bge-base"]
            },
            {
                "name": "image_embedding",
                "type": "tensor<float>(x[512])",
                "indexing": ["input image_url", "embed clip"]
            },
            {
                "name": "video_embedding",
                "type": "tensor<float>(x[512])",
                "indexing": ["input video_url", "embed clip-frames"]
            }
        ],
        "rank-profiles": [{
            "name": "hybrid-search",
            "first-phase": {
                "expression": "cosine_similarity(text_embedding, query_embedding, x) + bm25(text)"
            }
        }]
    }],
    "onnx-models": {
        "bge-base": {
            "model-file": "models/bge-base-en-v1.5.onnx",
            "inputs": {"input_ids": "input_ids", "attention_mask": "attention_mask"},
            "outputs": {"last_hidden_state": "output"}
        },
        "clip": {
            "model-file": "models/clip-vit-base-patch32.onnx",
            "inputs": {"pixel_values": "pixel_values"},
            "outputs": {"image_embeds": "output"}
        }
    }
}
```

## ONNX Export Commands

```bash
# Install optimum for ONNX export
pip install optimum[onnxruntime]

# Export BGE text embedding model
optimum-cli export onnx \
    --model BAAI/bge-base-en-v1.5 \
    --task feature-extraction \
    models/bge-base-en-v1.5.onnx

# Export CLIP image embedding model
optimum-cli export onnx \
    --model openai/clip-vit-base-patch32 \
    --task feature-extraction \
    models/clip-vit-base-patch32.onnx
```

## Qdrant Integration (fastembed)

```python
from fastembed import TextEmbedding, ImageEmbedding

# Text embeddings (uses BGE under the hood)
text_embedder = TextEmbedding(model_name="BAAI/bge-base-en-v1.5")
embeddings = list(text_embedder.embed(["document text here"]))

# Image embeddings (uses CLIP under the hood)
image_embedder = ImageEmbedding(model_name="Qdrant/clip-ViT-B-32-vision")
image_embeddings = list(image_embedder.embed(["image_url"]))
```

## Cost Comparison (1M embeddings/month)

| Model | Self-Hosted (ONNX) | API Cost |
|-------|-------------------|----------|
| BGE-base (text) | ~$50/mo (CPU instance) | N/A |
| CLIP (images) | ~$80/mo (CPU instance) | N/A |
| OpenAI text-embedding-3-small | N/A | $60 |

---

## LLM Model Strategy for Vidi AI

### Critical: Model Consistency Principle

**Once you choose and train a model, you cannot switch mid-stream.** Embedding spaces are model-specific. If you switch models, all existing embeddings become incompatible with new ones. This is why model selection is a foundational decision.

### Open-Source Models (Self-Hosted, Private AI)

| Model | Parameters | Use Case | ONNX | License | Notes |
|-------|------------|----------|------|---------|-------|
| **Qwen3.5** | 7B/72B | Vision-Language, multimodal (native) | ✅ | Apache 2.0 | Best for image+text understanding, video analysis |
| **MiniMax-M1-2.7B** | 2.7B | Text generation, reasoning | ✅ | Apache 2.0 | Lightweight, fast inference, good for real-time |
| **Llama 4 Maverick** | 17B | General purpose, reasoning | ✅ | Custom | Strong all-around, good tool use |
| **Qwen3-235B-A22B** | 235B (22B active) | Heavy reasoning, analysis | ⚠️ Large | Apache 2.0 | MoE architecture, powerful but resource-heavy |
| **DeepSeek-R1** | 671B (37B active) | Complex reasoning, math | ⚠️ Large | MIT | Best for analytical tasks, MoE |

### Cloud Models (Money No Object - Best Performance)

| Model | Provider | Use Case | API Cost | Notes |
|-------|----------|----------|----------|-------|
| **Claude Opus 4.6** | Anthropic | Complex reasoning, analysis | $15/1M input | Best for deep analysis, long context |
| **GPT-5.3-Codex** | OpenAI | Code generation, tool use | $10/1M input | Best for code, function calling |
| **Gemini 3 Pro** | Google | Multimodal, video understanding | $7/1M input | Best native video understanding |
| **o4-mini** | OpenAI | Fast reasoning, cost-effective | $1.10/1M input | Best price/performance ratio |

### Recommended Model Stack for Vidi AI

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIDI AI MODEL STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER 1: Real-Time Processing (Self-Hosted ONNX)               │
│  ─────────────────────────────────────────────────              │
│  • MiniMax-M1-2.7B → Fast text analysis, content tagging       │
│  • Qwen3.5-7B → Image/video understanding, OCR (native vision) │
│  • BGE-base → Text embeddings (384/768 dim)                    │
│  • CLIP-ViT-B/32 → Image embeddings (512 dim)                  │
│                                                                 │
│  TIER 2: Complex Analysis (Cloud API - On-Demand)              │
│  ─────────────────────────────────────────────────              │
│  • Claude Opus 4.6 → Deep content analysis, summarization      │
│  • Gemini 3 Pro → Video understanding, multimodal reasoning    │
│  • GPT-5.3-Codex → Code generation, tool integration           │
│                                                                 │
│  TIER 3: Training & Fine-Tuning (Self-Hosted)                  │
│  ─────────────────────────────────────────────────              │
│  • Qwen3.5-7B → Fine-tune on VidiSmart content (native vision) │
│  • MiniMax-M1-2.7B → Fine-tune on brand voice, style           │
│  • Custom embedding model → Train on domain-specific data      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Model Training Strategy

**Why Custom Training Matters:**
- Generic models don't understand your domain-specific terminology
- Fine-tuned models produce better embeddings for your content
- Brand voice consistency requires training on your style guide
- Once trained, the embedding space is locked to that model version

**Training Pipeline:**
```
1. Collect domain-specific data (VidiSmart content, tech docs, etc.)
2. Choose base model (Qwen3.5-VL-7B recommended for multimodal)
3. Fine-tune on your data (LoRA/QLoRA for efficiency)
4. Export to ONNX for production deployment
5. Generate embeddings with trained model → store in Qdrant
6. NEVER switch the embedding model without re-embedding everything
```

### Model Compatibility Matrix

| Task | Best Open-Source | Best Cloud | ONNX Export |
|------|-----------------|------------|-------------|
| Text Embeddings | BGE-base-en-v1.5 | OpenAI text-embedding-3-large | ✅ |
| Image Embeddings | CLIP-ViT-B/32 | OpenAI CLIP API | ✅ |
| Video Understanding | Qwen3.5-7B (native vision) | Gemini 3 Pro | ⚠️ Complex |
| Text Generation | MiniMax-M1-2.7B | Claude Opus 4.6 | ✅ (small models) |
| Code Generation | Qwen3-2.5-Coder | GPT-5.3-Codex | ✅ (small models) |
| Reasoning | DeepSeek-R1 | Claude Opus 4.6 | ❌ Too large |

### Next Steps

1. **Set up Vespa AI fork** with ONNX embedder support
2. **Choose primary embedding model** (BGE-base recommended for consistency)
3. **Export all models to ONNX** for Vespa + Qdrant compatibility
4. **Fine-tune Qwen3.5** on VidiSmart domain content (native vision)
5. **Configure Qdrant** to receive embeddings from Vespa processing pipeline
6. **Lock model versions** - document all model hashes for reproducibility

---
*Research Date: April 14, 2026*
*Prepared for: VidiSmart Vidi AI Development Team*

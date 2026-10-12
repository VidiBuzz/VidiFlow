# LTX-2.5 on the RTX 4090 (24 GB) — Definitive Feasibility Assessment

**Date:** 2026-10-05
**Node:** Windows dev/media/draft node — RTX 4090, 23,028 MiB VRAM (22.488 GiB usable), 63.7 GB RAM
**Question:** Can this machine run LTX-2.5 via ComfyUI, and can it feed Smart Channel CX?
**Verdict:** **PARTIAL FIT.** It runs — but only via GGUF quant on a *second* ComfyUI checkout, not the
Desktop build, and only with a strict serialize/free discipline. Production quality on the 4090
is **not** achieved; Miami (2x B70 / 64 GB) remains the production inference host per ops manual.

---

## 0. Executive summary — the five findings that decide this

| # | Finding | Evidence |
|---|---------|----------|
| 1 | The ComfyUI **Desktop** build on this box (0.18.1) **cannot run LTX-2.5 at all** | Zero `gemma4` references, zero `convrot` references in the whole tree; 9 LTX-2.5 nodes absent |
| 2 | A **second, newer ComfyUI 0.38.0** already exists at `M:\comfyui-qwen21\` and **is LTX-2.5 ready** | 33 LTX nodes live on port 8199; `gemma4.py` present; 27 `convrot` hits in `ops.py` |
| 3 | 0.38.0 **empirically detects the real LTX-2.5 checkpoint as `LTXAV`** | Ran `model_config_from_unet()` with the actual 7,229 header keys -> `class: LTXAV`, 48 layers, `cross_attention_dim: 4096` |
| 4 | The **official INT8-ConvRot transformer (20.03 GiB) does NOT fit** alongside activations | 20.027 + 2.0 + 1.5 = 25.37 GiB > 22.488 GiB -> **-2.883 GiB over budget** |
| 5 | The **GGUF route does fit** and the arch gate passes | GGUF header says `general.architecture = ltxv`; `ltxv` IS in ComfyUI-GGUF's `IMG_ARCH_LIST` |

**Bottom line:** FIT = *partial*. Use ComfyUI 0.38.0 at `M:\comfyui-qwen21\`, transformer from GGUF
(Q6_K if quality matters, Q5_K_M for margin), text encoder from the INT8-ConvRot safetensors,
and **one job at a time with the text encoder evicted before sampling**.

---

## 1. Hardware as measured (not as assumed)

```
$ nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,driver_version --format=csv
NVIDIA GeForce RTX 4090, 23028 MiB, 2545 MiB, 20064 MiB, 617.14
```

- Total VRAM: **23,028 MiB = 22.488 GiB**
- Free at assessment time: 20,064–21,153 MiB (varies with desktop compositing)
- ComfyUI's own view via `/system_stats`: `vram_total: 24146083840` (24.146 GB), `vram_free: 22550675456`
- Driver: **617.14**
- Disk: `M:` 654 GB free · `C:` 767 GB free · RAM 68,388,204,544 B (63.7 GB), 43.2 GB free at test time

**Not verified:** nothing in this document is a throughput or latency number. See §7.

---

## 2. The blocker you did not ask about: ComfyUI Desktop 0.18.1 is too old

The Desktop app at `C:\Users\James\AppData\Local\Programs\ComfyUI\resources\ComfyUI\` is
`__version__ = "0.18.1"`. It has the *LTX-2.3-era* stack only:

```
comfy/text_encoders/lt.py          -> LTXAVGemmaTokenizer  (gemma3_12b), Gemma3_12BModel
comfy/supported_models.py:866      -> class LTXAV(LTXV)
grep -rn "GEMMA_4|Gemma4|gemma4"  -> (no matches)
grep -rni "convrot"                -> (no matches)
```

LTX-2.5's own checkpoint header demands a **Gemma 4** encoder
(`gemma_source_checkpoint: {"ltx_version": "2.5.0", "gemma_version": "gemma4-12b-ltx-v1"}`),
and ComfyUI discriminates it by this exact key (present in the real file — I verified it):

```
text_embedding_projection.video_aggregate_embed.weight
```

Missing LTX-2.5 nodes in 0.18.1 (diffed against upstream master):

```
GetICLoRAParameters          LTXVDualCFGGuider          LTXVLatentUpsamplerExtension
Guider_LTXAVDualCFG          LTXVDurationPredictor      LTXVModalityGuidance
LTXVAddLatentGuide           LTXVReferenceAudio         LTXVSpatioTemporalGuidance
```

**Conclusion: weights alone will not fix Desktop 0.18.1. It must be updated or bypassed.**

---

## 3. The good news: ComfyUI 0.38.0 is already on this machine

`M:\comfyui-qwen21\` — a git checkout (`local-git` deploy), which nobody flagged as the real media node.

```
version      : 0.38.0
git HEAD     : 5c460d8172fe30761ff67c0df3d5643bb74e0d70 (2026-10-04 18:20:55)
python       : 3.12.11   torch 2.11.0+cu128   cuda 12.8
device       : cuda:0 NVIDIA GeForce RTX 4090 : cudaMallocAsync
custom_nodes : ComfyUI-GGUF (373048b, 2026-09-25)
gguf pkg     : installed
```

Live-verified by booting it on a spare port (**8199**, so nothing existing was disturbed):

```
$ curl -s http://127.0.0.1:8199/system_stats
{"comfyui_version":"0.38.0", "pytorch_version":"2.11.0+cu128",
 "devices":[{"name":"cuda:0 NVIDIA GeForce RTX 4090 : cudaMallocAsync",
             "vram_total":24146083840,"vram_free":22550675456}]}
```

`/object_info` (976 node classes) exposes **33 LTX nodes**, including the LTX-2.5-specific set:
`LTXVDurationPredictor`, `LTXVSpatioTemporalGuidance`, `LTXVModalityGuidance`,
`LTXVAddGeneratedKeyframes`, `LTXVReferenceAudio`, `GetICLoRAParameters`,
plus the cloud partner nodes `LtxApi25TextToVideo` / `LtxApi25ImageToVideo` / `LtxApi25AudioToVideo`.

**Caveat, honestly reported:** 0.38.0 prints
`WARNING: You need pytorch with cu130 or higher to use optimized CUDA operations.` on this
cu128 build. It runs; it may not use the fastest kernels. Not benchmarked.

---

## 4. Component files — exact byte counts

All sizes below are **measured**, not copied from a blog: safetensors payload/dtype/param counts were
read from each file's own header via HTTP range requests; GGUF totals came from the CDN `Content-Range`.

### 4a. Official `Lightricks/LTX-2.5` — **GATED (HTTP 401 without a token)**

| File | Bytes | GiB |
|---|---|---|
| `diffusion_models/ltx-2.5-22b-distilled-transformer-bf16.safetensors` | 42,018,190,584 | 39.132 |
| `diffusion_models/ltx-2.5-22b-dev-transformer-bf16.safetensors` | 42,018,190,584 | 39.132 |
| `text_encoders/gemma4-12b-with-proj-ltx-2.5-bf16.safetensors` | 26,263,858,182 | 24.460 |
| `diffusion_models/ltx-2.5-22b-dev-transformer-comfy-int8-convrot.safetensors` | 21,504,034,224 | 20.027 |
| **`diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors`** | **21,504,034,224** | **20.027** |
| `diffusion_models/ltx-2.5-22b-distilled-transformer-nvfp4.safetensors` | 18,721,548,408 | 17.436 |
| **`text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors`** | **15,372,971,786** | **14.317** |
| `loras/ltx-2.5-22b-distilled-lora-450-bf16.safetensors` | 8,899,889,568 | 8.289 |
| `vae/ltx-2.5-video-vae-bf16.safetensors` | 1,472,223,346 | 1.371 |
| **`vae/ltx-2.5-video-vae-conv-bf16.safetensors`** | **1,452,269,922** | **1.353** |
| `latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | 995,778,752 | 0.927 |
| **`vae/ltx-2.5-audio-vae-bf16.safetensors`** | **364,866,540** | **0.340** |
| `latent_upscale_models/ltx-2.5-latent-temporal-upscaler-x2-bf16-1.0.safetensors` | 261,944,000 | 0.244 |
| `model_patches/ltx-2.5-duration-head-bf16.safetensors` | 3,843,690 | 0.004 |

Verified: `gated: "auto"`, 1,645,444 downloads.
`curl -IL` on the gated URL returned **HTTP 401**; the mirror returned **HTTP 302**.

### 4b. Ungated mirror `comfyicu/LTX-2.5` — **USE THIS** (identical filenames, open access)

283,218 downloads, `gated: false`. Byte counts differ from the gated repo only in the low bytes
(the mirror re-serialized headers). Same set of components:

| Purpose | File | Bytes |
|---|---|---|
| DiT, lower-VRAM | `diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors` | 21,504,034,224 |
| Text encoder | `text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` | 15,372,971,786 |
| Video VAE | `vae/ltx-2.5-video-vae-conv-bf16.safetensors` | 1,452,269,922 |
| Audio VAE | `vae/ltx-2.5-audio-vae-bf16.safetensors` | 364,866,540 |
| Spatial upscaler | `latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | 995,778,752 |
| Temporal upscaler | `latent_upscale_models/ltx-2.5-latent-temporal-upscaler-x2-bf16-1.0.safetensors` | 261,944,000 |
| Duration head | `model_patches/ltx-2.5-duration-head-bf16.safetensors` | 3,843,690 |

### 4c. GGUF transformer options (ComfyUI-GGUF)

Measured via GGUF header (`magic=GGUF v3`, `4349 tensors`):

| Repo | File | Bytes | GiB |
|---|---|---|---|
| `realrebelai/LTX-2.5_GGUFs` | `LTX-2.5-Distilled-Q8_0.gguf` | 23,632,744,448 | 22.010 |
| `realrebelai/LTX-2.5_GGUFs` | `LTX-2.5-Distilled-Q6_K.gguf` | 18,659,348,480 | 17.378 |
| `realrebelai/LTX-2.5_GGUFs` | `LTX-2.5-Distilled-Q5_K_M.gguf` | 16,818,835,456 | 15.664 |
| `realrebelai/LTX-2.5_GGUFs` | `LTX-2.5-Distilled-Q4_K_M.gguf` | 15,086,587,904 | 14.050 |
| `agosh/LTX-2.5-Comfy-GGUF` | `...bf16-Q4_K_M.gguf` | 12,220,864,608 | 11.382 |
| `agosh/LTX-2.5-Comfy-GGUF` | `...bf16-Q5_K_M.gguf` | 14,831,573,088 | 13.813 |

**Measured arch string: `general.architecture = ltxv`.** `courageaihub/LTX-2.5-Comfy-GGUF` ships
byte-identical Q4_K_M files to `agosh` plus a ready-made workflow JSON
(`comfyui_ltx_25_director_gguf_workflow.json`, 47,927 B) — useful as a starting graph.

### 4d. Minimum download total

| Stack | Bytes | GiB | GB |
|---|---|---|---|
| GGUF Q5_K_M + INT8 TE + conv VAE + audio VAE | **38,110,644,912** | **35.492** | 38.111 |
| INT8-ConvRot DiT + INT8 TE + VAEs (official low-VRAM set) | **38,694,142,472** | **36.037** | 38.694 |
| + spatial & temporal upscalers (two-stage) | **39,951,865,224** | **37.208** | 39.952 |

Docs ask for **100 GB free disk** including ComfyUI cache — satisfied (654 GB free on `M:`).

---

## 5. VRAM math — the actual decision

**Measured** parameter count, by instantiating `comfy.ldm.lightricks.av_model.LTXAVModel` with the
*exact* config string from the LTX-2.5 checkpoint header:

```
LTXAVModel CONSTRUCTED OK with the real LTX-2.5 checkpoint config
total params: 21004025600  (21.0040 B)
```

The BF16 checkpoint header independently reports **21,004,025,600 params / 4,349 tensors** — exact match.

Card capacity: **22.488 GiB**.

### Route A — Official INT8-ConvRot safetensors (Lightricks' own "lower-VRAM" set)

| Item | GiB | Status |
|---|---|---|
| INT8-ConvRot DiT resident (measured payload) | 20.027 | measured |
| Activations for the sampled latent | ~2.0 | **ASSUMED** |
| CUDA context + node buffers | ~1.5 | **ASSUMED** |
| **Total during sampling** | **~25.4** | **OVER by ~2.9 GiB** |

The INT8 file is 21,504,034,224 B = **20.027 GiB** — it alone eats 89% of the card. Add the
text encoder and it is hopeless:

```
INT8 DiT + INT8 Gemma4 TE = 34.344 GiB   -> DOES NOT FIT
```

**This is the single most important finding:** Lightricks' documented "lower-VRAM" INT8-ConvRot set
does **not** fit a 24 GB 4090. The 32 GB floor in the LTX docs is real and load-bearing.

### Route B — GGUF quant (the one that fits)

| Variant | Weights GiB | + act + ctx | Headroom |
|---|---|---|---|
| Q8_0 | 22.010 | ~25.5 | **no** |
| Q6_K | 17.378 | ~20.9 | ~1.6 GiB |
| **Q5_K_M** | **15.664** | **~19.2** | **~3.3 GiB** |
| Q4_K_M | 14.050 | ~17.6 | ~4.9 GiB |

Only the activation/context figures are assumptions (2.0 + 1.5 GiB). They are engineering
estimates, **not measurements** — no generation was run.

### The text-encoder trap

The Gemma4 encoder is **14.317 GiB**. It must be **off the card before sampling** or the DiT cannot
load. Consequences:

1. `LTXAVTextEncoderLoader` has a `device` input — set it to **`cpu`**. Then conditioning runs on CPU
   (slow prefill) but never occupies VRAM. This is the single highest-leverage setting.
2. Alternatively free VRAM between stages (`POST /free` with `{"unload_models":true,"free_memory":true}`).
3. Never run LTX-2.5 concurrently with Ollama/LM Studio. **Ollama is currently not running**
   (no `ollama.exe`, nothing on :11434, `curl` exit 7) — I did not stop it; it was already down.
   When it runs, budget its VRAM separately.

---

## 6. Recommended configuration + Smart Channel CX wiring plan

### 6a. Model set to download (recommended: GGUF Q5_K_M route)

```bash
D="M:/comfyui-qwen21/models"
M="https://huggingface.co/comfyicu/LTX-2.5/resolve/main"

# 1) Transformer as GGUF  -> put in diffusion_models/
curl -L -o "$D/diffusion_models/LTX-2.5-Distilled-Q5_K_M.gguf" \
  "https://huggingface.co/realrebelai/LTX-2.5_GGUFs/resolve/main/LTX-2.5-Distilled-Q5_K_M.gguf"
#   expected 16818835456 bytes

# 2) Gemma4 text encoder (INT8-ConvRot) -> text_encoders/
curl -L -o "$D/text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors" \
  "$M/text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors"
#   expected 15372971786 bytes

# 3) VAEs -> vae/
curl -L -o "$D/vae/ltx-2.5-video-vae-conv-bf16.safetensors" \
  "$M/vae/ltx-2.5-video-vae-conv-bf16.safetensors"          # 1452269922 bytes
curl -L -o "$D/vae/ltx-2.5-audio-vae-bf16.safetensors" \
  "$M/vae/ltx-2.5-audio-vae-bf16.safetensors"              # 364866540 bytes

# 4) Optional, two-stage only
curl -L -o "$D/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors" \
  "$M/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors"  # 995778752
curl -L -o "$D/latent_upscale_models/ltx-2.5-latent-temporal-upscaler-x2-bf16-1.0.safetensors" \
  "$M/latent_upscale_models/ltx-2.5-latent-temporal-upscaler-x2-bf16-1.0.safetensors"  # 261944000
```

Verify after download — sizes must match exactly:

```bash
stat -c '%n %s' M:/comfyui-qwen21/models/diffusion_models/LTX-2.5-Distilled-Q5_K_M.gguf   # 16818835456
stat -c '%n %s' M:/comfyui-qwen21/models/text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors  # 15372971786
```

**Licensing — read this before shipping.** LTX-2.x Community License, embedded verbatim in every
checkpoint header. Entities with **≥ $10,000,000 annual revenue require a paid Commercial Use
Agreement** (`ltxv-licensing@lightricks.com`) for any non-Non-Commercial use. Free use covers
personal/hobby and *"testing, evaluation, or non-commercial research and development in a
non-production or development environment."* **A revenue-generating CX media lane is outside the
free grant.** Also: don't strip watermarking/content provenance (restriction 19), and end-user
output must be labelled machine-generated (restriction 5). Outputs themselves carry no IP claim.

### 6b. Launch settings

```bash
cd M:/comfyui-qwen21
env -u PYTHONPATH .venv/Scripts/python.exe main.py --port 8188 --listen 127.0.0.1 --highvram
```

- `--highvram` is what the FP8 community card calls for on 24 GB; with GGUF you likely want the
  default instead. **Try default first**, escalate to `--highvram` only if you see PCIe thrash.
- Optional: torch cu130 to clear the kernel warning.
- Do **not** use ComfyUI Desktop 0.18.1 for LTX-2.5.

### 6c. CX integration (concrete)

CX's media surface today is `POST /process/image-gen`, currently a **deliberate 501** per
`VidiBot/docs/HERMES-AGENT-CAPABILITY-REPORT-2026-10-04.md` (CX lane :8765). Add a sibling:

```
POST /process/video-gen     { prompt, seconds, width, height, fps, seed, steps, mode }
  -> ComfyUI 0.38.0 :8188  POST /api/prompt   (API-format workflow)
  -> poll /history/<prompt_id>
  -> GET /api/view  -> mp4 (muxed A/V)
  -> upload to R2 -> return URL to CX
```

Rules that make this survive the 4090:

1. **Single-flight queue.** One LTX job at a time, ever. No parallel media requests.
2. **`LTXAVTextEncoderLoader` device = `cpu`.** Non-negotiable on 24 GB.
3. **Free VRAM between stages:** `POST /free {"unload_models":true,"free_memory":true}` before load.
4. **Single-stage first.** Skip the upscalers until a two-stage run fits and times out cleanly.
5. **Draft lane, not production.** Per ops manual the 4090 is dev/media/draft; Miami 2x B70 (64 GB)
   is the production host. On Miami: BF16 DiT (39.13 GiB) + BF16 Gemma4 (24.46 GiB) = 63.6 GiB,
   which is exactly why the B70 pair exists. **Route customer-facing renders to Miami; keep the 4090
   for drafts, thumbnails, previews.**
6. Use the existing pattern from `M:/comfyui-qwen21/qwen21_api_workflow.json` (read-only reference,
   md5 `521843c05733289e2be17bff4c3a62df`, **unmodified**) — same API-format shape:
   `UnetLoaderGGUF` -> `CLIPLoader`/`LTXAVTextEncoderLoader` -> `VAELoader` -> `KSampler` -> save.

---

## 7. What is NOT verified (be skeptical of these numbers)

- **No video was generated.** No frame was produced. No throughput, no seconds-per-clip, no
  quality judgement. Every "FITS" in §5 depends on the assumed 2.0 GiB activations + 1.5 GiB
  context — plausible, not measured.
- **No weights were downloaded.** Only ~1–20 MB of headers were pulled, via HTTP range requests.
- **Text-encoder full load did not complete in my harness.** It resolved correctly
  (`TEModel.GEMMA_4_12B`, `ltxav_te`, `ltxav_gemma4_tokenizer`, `Gemma4_12B` all present; the real
  32,169,626-byte `tokenizer_json` parsed) and then failed with
  `json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)` from
  `comfy/text_encoders/bpe_tokenizer.py:262` — because I fed zero-filled placeholder tensors instead
  of real weights. **That is my stub's fault, not evidence of an incompatibility.** It remains
  unproven end-to-end.
- **GGUF `ltxav` mapping untested.** The file declares `ltxv`, which is accepted by the arch gate;
  whether the loader then routes to `LTXAV` rather than `LTXV` is *unverified*.
- Vendor speed claims (~99 s on a 4090 for FP8, 6.8 s on 2x GB200) are **the authors' own numbers**
  and were not reproduced. Treat as marketing.
- **`M:\code\ComfyUI` is 0.6.0** with empty model dirs — legacy, ignore it.
- Miami was not contacted. Its 2x B70 capacity is taken from ops manual, not measured.

---

## 8. Sources

Primary (fetched live): `docs.ltx.io/open-source-model/integration-tools/comfy-ui`,
`docs.ltx.io/open-source-model/reference/workflow-asset-compatibility`,
`docs.comfy.org/tutorials/video/ltx/ltx-2-5`,
`huggingface.co/api/models/{Lightricks/LTX-2.5, comfyicu/LTX-2.5, realrebelai/LTX-2.5_GGUFs,
agosh/LTX-2.5-Comfy-GGUF, courageaihub/LTX-2.5-Comfy-GGUF, guillaume127/LTX-2.5-FP8}`,
`raw.githubusercontent.com/comfyanonymous/ComfyUI/master/*` (for the local-vs-upstream diff),
GitHub API for tags (`v0.38.2` is current; local 0.38.0 is one release behind).

Secondary / lower confidence: `guillaume127/LTX-2.5-FP8` (23,485,111,216 B, `gated: false`,
0 downloads — treat as experimental), `courageaihub`/`agosh`/`realrebelai` GGUF repos.

---

VERDICT: FITS_4090=partial | TOTAL_GB=38.111 | MIN_VRAM_GB=22.488 | BLOCKERS=ComfyUI Desktop 0.18.1 lacks Gemma-4/ConvRot (use existing 0.38.0 at M:\comfyui-qwen21); official INT8-ConvRot DiT is 20.03GiB and overflows 24GB by ~2.9GiB so GGUF Q5_K_M/Q6_K required; Gemma4 TE 14.32GiB must stay on CPU/offloaded during sampling; no generation executed so speed unverified; LTX-2.x license needs paid agreement above $10M ARR for a revenue CX lane

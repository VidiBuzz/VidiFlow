# Top 5 Open-Weight Text-to-Image Models for RTX 4090 (24 GB), Ranked by Text/Typography Accuracy

**Compiled:** 2026-10-05 · **Host:** RTX 4090, 23,028 MiB VRAM (~22.5 GB usable), 63.7 GB system RAM
**Criterion:** character-exact text/typography accuracy in the rendered image. Not "prompt adherence," not aesthetics.
**Current baseline being beaten:** Qwen-Image-2.1 FP8, staged at `C:\Users\James\vidi-image-local\qwen-image-2.1-fp8\` (16.2 GB, verified on disk).

---

## Verdict first

**Switch to HiDream-O1-Image.** It is the only model in this survey that beats the Qwen-Image-2.1 baseline on *every* text metric I could verify, and it does it with **half the disk footprint (8.07 GB vs 16.2 GB)** and an **MIT license** instead of Qwen's research-only license. It is also architecturally the simplest thing on this list to load: a single self-contained file, no VAE, no separate text encoder — which structurally eliminates the FP8-upcast footgun that produced the 22.4 GB peak on your current setup.

Two caveats before you commit, both stated plainly in the model section: its text benchmarks are **author-reported, not independently measured**, and no one has yet published a character-exact OCR score for it on the 4090.

---

## The evidence base, and how much to trust it

I found three genuinely independent measurement sources. They are not interchangeable, and I weighted them differently than a leaderboard-chaser would.

### Source A — HiDream-O1 technical report (author-reported, but a controlled same-run comparison)

This is the single most useful table I found, because it evaluates 17 models — including every major candidate — under one protocol. Vendor bias is real (HiDream is the author), but the comparison is at least *internally consistent*: same evaluator, same prompts, same seeds.

| Metric | HiDream-O1 (8B) | Qwen-Image (1.0) | FLUX.2 [dev] (32B) | Z-Image-Turbo | SD 3.5 Large |
|---|---|---|---|---|---|
| **CVTG-2K** (multi-region text, avg) | **0.9128** | 0.8288 | 0.8926 | 0.8585 | 0.6548 |
| **CVTG-2K NED** (char-level edit distance) | **0.9561** | 0.9116 | 0.9475 | 0.9281 | 0.8470 |
| **LongText-Bench EN** | **0.979** | 0.943 | 0.963 | 0.917 | — |
| **LongText-Bench ZH** | **0.978** | 0.946 | **0.757** | 0.926 | — |
| GenEval (composition) | 0.90 | 0.87 | 0.87 | 0.82 | 0.71 |
| DPG-Bench (prompt density) | 89.83 | 88.32 | 87.57 | 84.86 | — |

The row that matters most for James is **FLUX.2 [dev] LongText-Bench ZH = 0.757**. The FLUX family's headline "strong typography" reputation is real for English and effectively collapses for Chinese. One independent test (SandBase, 11 models, 2026-10-03) found FLUX.2 Max/Pro and Ideogram 3 rendered common Chinese characters correctly but **failed every single poster containing uncommon characters**, with the first OCR judge missing the defect on half of them. That is the exact failure class James is trying to escape.

### Source B — IMG.LY GenAI Benchmarks (independent, transcription-checked, 23 models)

Character-exact transcription scoring across 4 typography benchmarks, 3 seeds each, 24 runs per model. Case and line breaks forgiven; only real character errors lose points.

| Rank | Model | Text accuracy |
|---|---|---|
| 1 | FLUX.2 [pro] | 5.00 / 5 |
| 13 | FLUX.2 [dev] Turbo | 4.92 / 5 |
| 14 | FLUX.2 | 4.92 / 5 |
| 19 | **Qwen-Image** | **4.83 / 5** |
| 20 | Ideogram 3.0 | 4.71 / 5 |
| 23 | Stable Diffusion 1.5 | 1.17 / 5 |

Two things worth noting. First, this suite **does not contain HiDream-O1, GLM-Image, Qwen-Image-2.1, or Z-Image-Turbo** — its open-weight coverage is thin, which is exactly why Source A matters. Second, and more useful: **Ideogram, the model with the strongest text reputation, lands at #19 of 23.** The reputation gap has closed; general flagships absorbed the lead that made text specialists special.

### Source C — Artificial Analysis Arena (independent human preference, not text-specific)

Elo is a *blend* of prompt adherence, composition, aesthetics, and text. It is not a text-accuracy metric and I have not treated it as one. Current open-weight standings (2026-10-02 snapshot):

| Model | Elo | Note |
|---|---|---|
| Qwen-Image-2.1 | 1,036 | #1 open weight |
| FLUX.2 [dev] | 1,000 | board anchor |
| HiDream-O1-Image | 982 | MIT, 8B |
| FLUX.2 [klein] 9B | 941 | |

Use this for "which is the better image model overall," not "which spells better."

### Source D — One independent hands-on test of the baseline

A three-model single-GPU run on public benchmark prompts (GenEval / DPG-Bench / LongText-Bench), same seed, is worth quoting because it measures the *current baseline* rather than a card:

| | Qwen-Image-2.1 | FLUX.2-klein-KV |
|---|---|---|
| Text char accuracy | 74.6% | 40.8% |
| Text line hits | 25/35 | 4/35 |
| Chinese long text, line hits | 18/20 | **0/20** (solid block of garbage) |
| English long text, line hits | 7/15 | 4/15 |

This is the most honest single number in this report for your baseline: **roughly 3 in 4 characters correct on benchmark prompts.** Not 100%. And it explicitly found that running the official recipe (2048², 40 steps, with the prompt rewriter) made text rendering **no better** — 68.5% vs 71.7% char accuracy — at 172 s/image versus 52 s. There is no configuration of Qwen-Image-2.1 that fixes this.

---

## The Top 5

Sizes are exact byte counts from the HF API (`?blobs=true`), not estimates.

---

### #1 — HiDream-O1-Image (HiDream, MIT license, 8B)

**The recommendation.**

| | |
|---|---|
| **Text evidence** | CVTG-2K **0.9128**, NED **0.9561**, LongText-EN **0.979**, LongText-ZH **0.978** — best open-weight on every text metric in the one controlled comparison available. *Author-reported.* |
| **Disk (native bf16, official)** | **35.22 GB** — `HiDream-ai/HiDream-O1-Image`, 8 shards. Stored **F32 on disk**, verified from the safetensors header (358 F32 tensors/shard). |
| **Disk (ComfyUI FP8) — USE THIS** | **8.07 GB** — `Comfy-Org/HiDream-O1-Image`, single file `hidream_o1_image_fp8_scaled.safetensors`. Header verified: F8_E4M3 + BF16 + U8 + F32, 1,476 tensors. |
| **Disk (BF16 ComfyUI)** | 16.37 GB |
| **Disk (NVFP4)** | 6.94 GB — `Hippotes/HiDream-O1-Image-quants`, least mature |
| **VRAM, measured on a 4090** | **~17 GB peak at 1024²**, bf16/fp16, 50 steps (Apatero, ran it on this exact card) |
| **VRAM, FP8** | ~10–11 GB (drbaph / Saganaki22 tables) |
| **Speed on 4090** | ~18 s at 1024² bf16; ~10 s for the Dev (28-step) variant |
| **License** | **MIT** — permissive, commercial use fine. The only permissive-license model in the top 3. |
| **Runtime** | Official diffusers/transformers pipeline (`Qwen3VLForConditionalGeneration`), or ComfyUI via `Saganaki22/HiDream_O1-ComfyUI` (required for FP8 weights). |

**Why it wins on the stated criterion:** it beats your baseline on multi-region text accuracy (0.9128 vs 0.8288), character-level edit distance (0.9561 vs 0.9116), English long text (0.979 vs 0.943), and Chinese long text (0.978 vs 0.946) — and does so at **1/9th the GenEval weight class** of FLUX.2 dev's 32B+24B and roughly a third of Qwen-Image's 20B.

**Why it is structurally the safest load on your box:** it is a pixel-level Unified Transformer with **no external VAE and no disjoint text encoder**. One 8.07 GB file, nothing else to stage. That matters concretely — your current baseline's 9.39 GB text encoder *plus* 7.12 GB transformer is what pushed you to a 22.4 GB peak and left zero headroom.

**Honest gaps:**
- **The text scores are author-reported.** No independent character-exact OCR benchmark exists for this model yet. I am ranking it on its author's controlled comparison plus 982 Elo from an independent human panel — not on an independent text measurement. **Unverified** by third-party OCR.
- The `full` variant is 50 steps at CFG 5.0; the `Dev` variant is 28 steps at CFG 0.0. **The benchmark table above is for the `full` model.** Dev scored 875 Elo vs 982 — a real drop. Use `full` for typography work.
- Native 2048×2048 output. Forcing it above that is untested.
- No official diffusers integration — it needs `transformers` with the HiDream repo's `pipeline.py`, and `flash-attn` is strongly recommended (falls back to a manual `use_flash_attn: False` edit otherwise).
- FP8 community weights are lower download counts (Comfy-Org 102k, drbaph 117k) than your baseline's ecosystem. Less battle-tested.

---

### #2 — Qwen-Image-2.1 (Alibaba, Qwen Research License, 7B) — your current baseline, retained for reference

| | |
|---|---|
| **Text evidence** | 74.6% char accuracy / 25-of-35 line hits (independent, Source D). IMG.LY scores the *predecessor* Qwen-Image at 4.83/5 (#19 of 23). Vendor: 60.28 overall on Qwen's own Qwen-Image-Bench — **vendor benchmark, own judge model, no published per-metric numbers**; the release post is a chart image. |
| **Disk (bf16, official)** | 33.12 GB |
| **Disk (your staged FP8)** | **16.2 GB verified on disk** — transformer 7.12 GB, text_encoder 9.39 GB, vae 0.68 GB. Header-verified dtypes: transformer `{F32:229, BF16:68, F8_E4M3:229}`, text_encoder `{BF16:265, F8_E4M3:485}` |
| **VRAM, measured by you** | **22.4 GB peak at 1024², 20 steps.** Loads: 750/750 weights, 34.9 s to GPU-resident. |
| **Disk (NVFP4 alt)** | 12.42 GB — `BennyDaBall/Qwen-Image-2.1-NVFP4` (4.20 GB transformer + 7.55 GB text encoder + 0.68 GB VAE) |
| **Disk (GGUF alt)** | 4.20 GB Q4_K_M transformer — `unsloth/Qwen-Image-2.1-GGUF`, text encoder quanted separately |
| **License** | **Qwen Research License — NOT permissive.** Commercial use restricted. Worth resolving if VidiFlow ships anything commercial. |
| **Status** | **Installed, generation UNVERIFIED** — no image has been produced from this checkpoint. |

**Unique capability none of the others have: native transparent RGBA output** — logos and stickers without a background-removal pass. Plus 10-image reference editing. If VidiFlow's product needs cutouts, this stays in the stack regardless of rank.

**Honest gaps:** 22.4 GB peak on a 22.5 GB usable card means **zero headroom** — any resolution bump OOMs. The text encoder is *larger than the transformer*, which is why the split pack exceeds the card. The independent test found its Chinese is excellent (18/20) but its English long text is mediocre (7/15 line hits) — the opposite of the stereotype. And it degrades as text gets longer, which is exactly the poster/infographic use case.

---

### #3 — GLM-Image (Zhipu AI, MIT license, 9B AR + 7B diffusion)

**Best text scores in the field on paper — but it does not fit your card cleanly.**

| | |
|---|---|
| **Text evidence** | CVTG-2K Word Accuracy **0.9116**, NED **0.9557**; LongText-EN **0.9524**, ZH **0.9788**. Vendor ranks #1 among open-weight on both. Deep Learning AI's The Batch independently cites the same figures. *Vendor-reported.* |
| **Why it's built for text** | Has a dedicated **Glyph Encoder** text module — architecture explicitly designed for accurate in-image text rendering |
| **Disk (bf16, official)** | **35.77 GB** — VLE 20.23 GB + transformer 13.85 GB + text_encoder 0.87 GB + VAE 0.81 GB |
| **Disk (INT4 quants)** | **12.45 GB** (`Disty0/GLM-Image-SDNQ-4bit-dynamic`) · **13.19 GB** (`Intel/GLM-Image-int4-AutoRound`) |
| **VRAM** | **~37–38 GB peak at 1024² bf16** — does not fit 24 GB. ~23 GB only with CPU offload, and reports conflict badly: sources quote "24GB minimum," "~23GB with offload," "80GB+ single GPU," and "40–52 GB." |
| **License** | **MIT** (verify — `zai-org/GLM-Image` cardData says `mit`) |
| **Ecosystem** | **Thin.** Quant repos are 15–68 downloads. No official ComfyUI repo found (`Comfy-Org/GLM-Image` returns 401). |

**The honest problem:** GLM-Image has the best *published* text scores of any open-weight model I found, and MIT licensing. It is also the model I am **least confident will actually run well on your hardware**. Full precision does not fit. The INT4 quants are 3 weeks old with almost no adoption, and a 4-bit quantization of an autoregressive-then-diffusion hybrid is exactly where quant artifacts damage glyph fidelity — the thing you care most about. **I would not make this the production choice on the strength of a vendor table alone.**

Ranked #3 on evidence quality + fit, not on raw score. If you want to test it, the Intel INT4 build (13.19 GB) is the one to try, and **verify glyph output before trusting it**.

---

### #4 — FLUX.2 [dev] (Black Forest Labs, 32B, FLUX non-commercial license)

**Best overall image quality of anything local. Not the best at spelling.**

| | |
|---|---|
| **Text evidence** | CVTG-2K 0.8926, NED 0.9475, LongText-EN 0.963, **LongText-ZH 0.757** ← the weak point. IMG.LY: FLUX.2 base 4.92/5 (#14 of 23), dev Turbo 4.92/5. |
| **Disk (bf16)** | 177.59 GB total — transformer 68.36 GB (7 shards) + text_encoder (Mistral-3-Small, 10 shards, ~46 GB) |
| **Disk (the only build that fits)** | **19.96 GB** — `unsloth/FLUX.2-dev-GGUF` **Q4_K_M**, or 19.79 GB Q4_K_S. Verified exact sizes: Q8_0 35.00 GB, Q6_K 27.40 GB, Q5_K_M 23.93 GB. |
| **Text encoder (must also fit)** | **18.03 GB** fp8 or **12.28 GB** fp4 — `Comfy-Org/flux2-dev`. This is a full LLM riding shotgun; **system RAM floor moves to 64 GB.** You have 63.7 GB — marginal. |
| **Elo** | 1,000 (the board anchor — the reference point everything else is measured against) |
| **License** | **FLUX non-commercial.** Gated: `auto` (accept terms). |
| **Cost of being honest about fit** | Q4 quant of a 32B model + 12.28 GB fp4 encoder + activations ≈ 19.96 + 12.28 = **32.2 GB of weights against a 22.5 GB card.** It runs only via offload/streaming. Community guides describe it as "tight" or "slow," and the honest framing is that **FLUX.2 dev on a 4090 is a compromise, not a comfortable fit.** |

**Also relevant:** the distilled **FLUX.2 [dev] Turbo** variant is what most people actually run on consumer cards, and it scores **better** on Chinese in some reports than the base. Also note IMG.LY measured **FLUX.2 [flex] as the typography specialist of the family** (best text rendering of the FLUX tiers) — but `[flex]` is API-only, weights are 401/gated, no local path exists.

---

### #5 — Mage-Flow-Turbo (Microsoft / SceneWorks, MIT license, 4B)

**The sleeper: MIT-licensed, 4B, and genuinely competitive on text — at half HiDream-O1's disk.**

| | |
|---|---|
| **Text evidence** | CVTG-2K **0.873**, LongText-EN **0.911**, LongText-ZH 0.801 (Turbo); Base variant: CVTG-2K 0.851, EN 0.904. **Author-reported** (Microsoft's own table). |
| **The striking part** | Its **Base** variant beats FLUX.2-dev on GenEval (0.90 vs 0.87) and beats Qwen-Image, Z-Image, FLUX.2 32B, and FireRed-Image-Edit 20B on several axes — at **4B params**. |
| **Disk (bf16)** | 8.23 GB transformer + 8.88 GB text encoder (Qwen3-VL-4B) + 0.35 GB VAE |
| **Disk (quantized)** | **4.16 GB** transformer INT8 — `Comfy-Org/Mage-Flow`; q4 = **2.33 GB**, q8 = 4.37 GB — `SceneWorks/Mage-Flow` |
| **VRAM** | **Unverified.** No 4090 measurement found. Weight total is ~17.4 GB bf16, so it should fit 24 GB, but I have no measured peak. |
| **License** | **MIT** (verified on both `mage-flow-community/Mage-Flow` and `Comfy-Org/Mage-Flow`) |
| **Steps** | Turbo is **4 steps**. That is the throughput story — 4 steps vs HiDream-O1's 50. |

**Honest gaps:** `microsoft/Mage-Flow` returns **HTTP 401** to unauthenticated requests, so the canonical repo and its license card were unverifiable; I read the benchmarks from community mirrors. Very low adoption (109k downloads, 127 likes). Its **Chinese long text is weak (0.801)** — materially behind Qwen-Image (0.946) and HiDream-O1 (0.978). Text scores are author-reported with no independent OCR confirmation.

**Why it's #5 and not #2:** its text scores are ~3-6% behind HiDream-O1's, its Chinese is clearly worse, and — decisively — **nothing has measured it on a 4090.** It's the model I'd test second, not the one I'd bet on.

---

## Also evaluated, and why it didn't make the cut

| Model | Why out |
|---|---|
| **Z-Image / Z-Image-Turbo** (Apache 2.0, 6B) | Genuinely good: CVTG-2K 0.8585, NED 0.9281, LongText-EN 0.917 / ZH 0.926, CVTG-2K Word Acc 0.8671. **32.83 GB bf16** (24.6 GB transformer + 8.05 GB text encoder + 0.17 VAE); GGUF Q8_0 = 7.22 GB, Q5_K_M = 5.57 GB. 8 steps, so it's the *fastest* strong-text model here. Cut only because it loses to HiDream-O1 on every text metric and to Qwen-Image on DPG-Bench. **Strong #6 — and the right pick if throughput matters more than peak accuracy.** |
| **FLUX.2 klein 9B / 4B** | **Text rendering is the family's weak point.** Independent measurement: **40.8% char accuracy, 4/35 line hits, 0/20 on Chinese long text — "a solid block of garbage."** The cheap distills traded away exactly the thing you need. Klein 4B alone measures CLIP 0.335 on text. Do not use klein for typography. (Apache 2.0 on 4B, 23.72 GB total / 4.07 GB FP8.) |
| **Cosmos3-Super-Text2Image** (NVIDIA, OpenMDW 1.1) | 64B MoT, **132.49 GB** of weights. NVIDIA recommends 8×H100 and has **only tested BF16**. Elo 995 (#7 open weight) but categorically not a 24 GB model. |
| **HunyuanImage 3.0** (Tencent) | **168.54 GB.** Multi-GPU class. Elo 985. |
| **SD 3.5 Large / Medium** | LongText-Bench-EN **0.607**, ZH **0.005**. CVTG-2K 0.6548. Gated. Genuinely poor at text — the historical baseline that text-specialist models were invented to escape. |
| **FLUX.1 dev / schnell** | CVTG-2K 0.4965, LongText-EN 0.607, ZH **0.005**. Superseded by FLUX.2 and bad at text. Schnell is Apache 2.0 and *does* fit easily (23.78 GB fp8 17.24 GB), but text is not a reason to pick it. |
| **HiDream-I1-Full** | LongText-EN 0.543, ZH **0.024**. Very weak at text despite the MIT license. Superseded by HiDream-O1. |
| **Lumina-Image 2.0** (Apache 2.0) | Small (21.23 GB) and old (2025-03). No text-rendering benchmark data found. **Unverified.** |
| **Sana 1600M** | Efficient but no text-rendering evidence found. **Unverified.** |
| **Kolors** | LongText-EN 0.258 / ZH 0.329 (via HiDream's table). Very weak. |
| **Sana-Sprint, Seedream-OSS, Qwen-Image-3.0, HunyuanImage-2.1/2.x, Lumina-Next, Chroma, Juggernaut, RealVisXL, Juggernaut XL, aya, Kolors-2** | Repo names returned **HTTP 401** on the HF API — either gated or not published under these names. **No data. Excluded on absence of evidence, not on quality.** Qwen-Image-3.0 exists as an API-only model (Elo 1,076) with no downloadable weights found. |

---

## The FP8 footgun — restated, because it is live on your box

Your staged baseline is a **mixed-precision** checkpoint, and this matters:

```
transformer/  F32: 229, BF16: 68, F8_E4M3: 229   → 7.12 GB
text_encoder/ BF16: 265, F8_E4M3: 485          → 9.39 GB
vae/          BF16: 238                        → 0.68 GB
```

The VAE is pure bf16 and the text encoder is a **mix** of bf16 and FP8. Passing `dtype=bfloat16` to `from_pretrained` would upcast every F8_E4M3 tensor — the transformer and most of the text encoder — roughly doubling VRAM *and* spiking system RAM. With a 22.5 GB usable card and a 22.4 GB peak, that is the difference between running and OOMing.

**Rules for the new load:**
1. Load at native dtype — pass **no** `dtype=` argument to a checkpoint whose header is dominated by F8_E4M3. Read the header first.
2. Verify every `*.safetensors` with `safetensors.safe_open` and count tensors *before* loading. A truncated file surfaces as an unreproducible mid-pipeline tensor error.
3. `low_cpu_mem_usage=False` so weights materialize on CPU and `.to("cuda")` doesn't hit `Cannot copy out of meta tensor`.
4. One model at a time, load-on-demand, unload between batches. A 24 GB card fits exactly one of these.

---

## Recommended next steps, in order

1. **Pull `Comfy-Org/HiDream-O1-Image` → `hidream_o1_image_fp8_scaled.safetensors` (8.07 GB) and `Comfy-Org/Mage-Flow` → `mage_flow_turbo_int8_convrot.safetensors` (4.16 GB).** ~12.3 GB total, both MIT, both comfortably inside 22.5 GB. Disk is not the constraint — M: has 654 GB free.
2. **Run a character-exact typography test before anything else.** This is the whole point of the exercise and no independent OCR score exists for either model. Use real strings you care about — brand names, SKUs, prices. Transcribe the output and count wrong characters. Six prompts is enough to separate 0.91 from 0.87.
3. **If HiDream-O1's glyphs hold up, keep Qwen-Image-2.1 only for native-RGBA cutouts**, and resolve its license question before anything ships commercially.
4. **Don't reach for FLUX.2 [dev].** The 32.2 GB of Q4-quantized weights against a 22.5 GB card is a compromise that trades away exactly the text accuracy you're buying.

---

## What is unverified, stated plainly

- **HiDream-O1's text scores are author-reported.** No independent character-exact OCR benchmark exists. This is the single largest caveat in this report, and it sits on the #1 recommendation.
- **No VRAM peak has been measured by me on any of these five models.** The 4090 figures cited are third-party (Apatero's 4090 run is the most direct: ~17 GB bf16, ~18 s at 1024²). Peak VRAM for GLM-Image and Mage-Flow is **unverified**, and the published reports on GLM-Image contradict each other by a factor of three.
- **Mage-Flow and GLM-Image have no independent text measurements at all.** Both rest on their authors' tables.
- **FLUX.2 [dev] Q4-on-4090 ergonomics are community-reported, not measured.** No first-party 4090 number exists.
- **No generation was performed for this report.** Every file size is a real HF API byte count; every VRAM number is attributed to its source; every benchmark is attributed to the table it came from. Nothing is estimated and nothing is invented — but nothing here is a render, and per the three-state rule these are all **installed-or-not-installed at most**, never **verified**.

---

## Provenance

- **File sizes:** Hugging Face REST API, `https://huggingface.co/api/models/<repo>?blobs=true`, queried 2026-10-05. Byte-exact.
- **dtypes:** safetensors headers read directly over HTTP range requests (`HiDream-O1-Image`, `Comfy-Org/HiDream-O1-Image`) and from disk (`qwen-image-2.1-fp8`).
- **Benchmark tables:** `HiDream-ai/HiDream-O1-Image` README (Source A); `img.ly/ai-benchmarks/findings/text-reliability/` DOM-scraped (Source B); `theopenweights.com` + `artificialanalysis.ai` (Source C); `dev.to/dlss` three-model GPU run (Source D); `mage-flow-community/Mage-Flow` README; `zai-org/GLM-Image` README; `docs.z.ai` GLM-Image guide; SandBase 11-model CJK test; Apatero's RTX 4090 HiDream-O1 run.
- **Local baseline state:** `nvidia-smi` (RTX 4090, 23028 MiB) and `find`/`safetensors` header read on `C:\Users\James\vidi-image-local\qwen-image-2.1-fp8\`, 2026-10-05.
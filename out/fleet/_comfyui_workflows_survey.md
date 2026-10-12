# ComfyUI Workflow Survey — `fahdmirza/comfyuiworkflows`

**Prepared for:** Smart Channel CX (personalized video: text → image → video → edit → assemble timeline → render (Remotion) → deliver (VidiBlast email))
**Survey date:** 2026-10-05
**Source repo:** https://github.com/fahdmirza/comfyuiworkflows

---

## 0. Headline finding (read this first)

**The repo is not a 2024 fossil.** The brief assumed a Nov-2024 archive; it is actually a
**living, actively-curated repo whose newest workflow was committed 2026-09-18**.

Verified via GitHub API (`/repos/fahdmirza/comfyuiworkflows`):

| Field | Value |
|---|---|
| stars | 165 |
| forks | 48 |
| open issues | 1 (`#1 "Unknown model"`, opened 2026-02-01) |
| created | 2024-11-23 |
| **last push** | **2026-09-18** |
| commits | 38 (+1 since, by one author) |
| default branch | `main` |

Of the 14 workflow JSONs, **9 were touched in 2025–2026** and only 5 date from 2024. The
practical consequence flips the usual assumption: **the majority of these workflows are
already on native ComfyUI nodes and will load and run today with zero custom nodes.** The
genuinely broken ones are not the 2024 files — they are the two 2024 *framework-dependent*
files (`hairstyle.json`, `virtual-tryon-flux-redux-workflow.json`) and the two LTXV-0.9 files.

### How I verified (method + confidence)

- **Read the actual files:** all 14 workflow JSONs downloaded from `raw.githubusercontent.com`
  and parsed programmatically. Node types extracted from every `nodes[]` array and every
  `definitions.subgraphs[]` entry; per-file last-commit dates from the GitHub commits API.
- **Read current ComfyUI source, not a blog post:** all **923 Python files** of
  `Comfy-Org/ComfyUI@master` (`nodes.py` + `comfy_extras/**` + `comfy/**`) downloaded and
  scanned for each node type as `node_id="X"`, `"X":`, or `class X`. **This is the authoritative
  native-vs-custom determination in this report.**
- **Model existence:** Hugging Face API on `Comfy-Org`, `Wan-AI`, `Kijai`, `HiDream-ai`.
- **Custom node health:** GitHub API on each dependency repo + tarball downloads to confirm
  the exact node-name strings still exist in the repo's `NODE_CLASS_MAPPINGS`.
- Marked **UNVERIFIED** where I could not establish provenance. I did not guess.

**Global node census:** the 14 workflows use **72 distinct node types. 49 (68%) are native
ComfyUI core. 23 require custom packs.** Every custom pack is listed in §1.

---

## 1. Workflow-by-workflow assessment

Verdict key: **CURRENT** (native, modern model) · **STILL-VALID-BUT-DATED** (runs, model behind) ·
**SUPERSEDED** (first-party replacement exists, strictly better) · **BROKEN** (dependency gone).

| # | Workflow | File (last commit) | What it does | Model family | Verdict | Specific reason |
|---|---|---|---|---|---|---|
| 1 | Qwen-Image 2512 (subgraphed) | `image_qwen_Image_2512.json` (2026-01-01) | Qwen-Image 2512 text→image, twice (20-step + Lightning 4-step), as **subgraphs** with a text input node | Qwen-Image 2512 | **CURRENT** | 100% native (`EmptySD3LatentImage`→`nodes_sd3.py`, `ModelSamplingAuraFlow`→`nodes_model_advanced.py`). Models confirmed on HF: `Comfy-Org/Qwen-Image_ComfyUI` ships `qwen_image_2512_fp8_e4m3fn`. Closest first-party peer: `templates/image_qwen_Image_2512.json`. |
| 2 | Flux.2 multi-reference | `flux2_example.json` (2025-11-25) | FLUX.2-dev text→image with **2 reference images** via chained `ReferenceLatent` nodes; bypassable refs | FLUX.2-dev | **CURRENT** (structure) / **STILL-VALID-BUT-DATED** (text-encoder precision) | Fully native: `EmptyFlux2LatentImage`, `Flux2Scheduler`, `ReferenceLatent` (→`comfy_extras/nodes_edit_model.py`), `ImageScaleToTotalPixels`. First-party `templates/image_flux2_text_to_image.json` supersedes it structurally (adds `ComfySwitchNode`, `LoraLoaderModelOnly`, Primitive nodes) and loads `flux2_dev_fp8mixed` instead of `mistral_3_small_flux2_fp8` + a Turbo LoRA. |
| 3 | Wan 2.2 TI2V 5B — image→video | `image_to_video_wan22_5B.json` (2025-07-28) | Wan 2.2 TI2V 5B, start image → ~2.8 s clip | Wan 2.2 TI2V 5B | **STILL-VALID-BUT-DATED** | Native and correct (`Wan22ImageToVideoLatent`→`nodes_wan.py`); exact same model trio as first-party `templates/video_wan2_2_5B_ti2v.json`. Dated only in its **output nodes**: `SaveAnimatedWEBP`/`SaveWEBM` vs current native `CreateVideo`+`SaveVideo` (`comfy_extras/nodes_video.py`). Resolutions are deliberately shrunk for a fast demo (node note: optimal 1280×704, len 121). |
| 4 | Wan 2.2 TI2V 5B — text→video | `text_to_video_wan22_5B.json` (2025-07-28) | Same graph minus `LoadImage` | Wan 2.2 TI2V 5B | **STILL-VALID-BUT-DATED** | Identical verdict to #3. First-party template also covers both modes in one file with a `LoadImage` that you simply leave unconnected — **prefer the first-party file over both of these.** |
| 5 | WAN-T2V-Rapid AIO | `WAN-T2V-Rapid-AIO.json` (2025-09-03) | Wan 2.2 T2V "Rapid AIO" all-in-one checkpoint, **4 steps**, `sa_solver` | Wan 2.2 T2V AIO (Rapid) | **UNVERIFIED / avoid** | **Model provenance unverified.** `wan2.2-t2v-rapid-aio.safetensors` returns **no results on the Hugging Face API**; only a third-party re-upload (`Osrivers/wan2.2-t2v-rapid-aio-v10`) exists. Node-wise it is native (`EmptyHunyuanLatentVideo`, `ModelSamplingSD3`), but `sa_solver` sampling at shift 8 in 4 steps is a community distill preset, not a first-party path. Also still uses `VHS_VideoCombine` (custom pack) instead of native `SaveVideo`. **Do not adopt.** |
| 6 | HiDream-O1 full/dev | `hidream_o1_workflow.json` (2026-05-17) | HiDream-O1 image editing with **reference images**, full + dev variants, LCM sampler, patch-seam workaround | HiDream-O1 | **CURRENT** | All native: `EmptyHiDreamO1LatentImage`, `HiDreamO1ReferenceImages`, `HiDreamO1PatchSeamSmoothing`, `ModelNoiseScale`, `SamplerLCM` → `comfy_extras/nodes_hidream_o1.py` / `nodes_advanced_samplers.py`. Models confirmed on HF (`Comfy-Org/HiDream-O1-Image`, incl. `mxfp8`). Newest video-relevant file in the repo. |
| 7 | Flux.1-dev + LoRA | `Flux-Lora-Workflow.json` (2024-11-24) | FLUX.1-dev text→image with a product/outfit LoRA | FLUX.1-dev | **SUPERSEDED** | Fully native, runs fine — but FLUX.1-dev is two generations behind. Every 2024-era model here has a Flux.2 / Qwen-Image-Edit / Z-Image replacement in `Comfy-Org/workflow_templates`. Keep only as a LoRA-loader pattern reference. |
| 8 | Qwen-Image (base, 20-step) | `Qwen-Image-Workflow.json` (2025-08-05) | Original Qwen-Image text→image | Qwen-Image (2025) | **SUPERSEDED** | Native, but base Qwen-Image is superseded by 2512 (see #1) and 2.1. Use `templates/image_qwen_image_2512.json`. |
| 9 | HunyuanVideo I2V | `hunyuanvideoi2v.json` (2025-03-07) | HunyuanVideo 1.0 720p image→video, native `UNETLoader` + `SamplerCustomAdvanced` + **tiled VAE decode** | HunyuanVideo 1.0 | **STILL-VALID-BUT-DATED** | Notable: **this file already uses 100% native nodes** — it is the repo's own migration off Kijai's wrapper. Nodes verified native (`HunyuanImageToVideo`, `TextEncodeHunyuanVideo_ImageToVideo`→`nodes_hunyuan.py`). Model `hunyuan_video_image_to_video_720p_bf16` confirmed on HF. Now behind HunyuanVideo 1.5 (`HunyuanVideo15` + `HunyuanVideo15ImageToVideo` in core). Its "use tiled decode by default" note is still sound practice. |
| 10 | HunyuanVideo T2V + LoRA (wrapper) | `hunyuanVideo_t2v_Lora_01.json` (2024-12-18) | HunyuanVideo 720p CFG-distill T2V + character LoRA, 30 steps | HunyuanVideo 1.0 | **BROKEN (dependency)** / **SUPERSEDED (model)** | **Hard-depends on Kijai/ComfyUI-HunyuanVideoWrapper** for all 7 `HyVideo*` nodes incl. `DownloadAndLoadHyVideoTextEncoder` (pulls text encoders straight from HF at runtime — a network dependency in your render path). That wrapper's last commit is **2025-08-20** (13 months stale) and its README is 404. HunyuanVideo is fully native in core now, and 1.5 supersedes 1.0. **Do not adopt; would need a full rewrite.** |
| 11 | LTX-Video text→video | `LTX_Video_text_to_video.json` (2024-11-23) | LTX-Video **0.9** 2B text→video, euler, 97 frames | LTX-Video 2B v0.9 | **SUPERSEDED** | Nodes are native (`EmptyLTXVLatentVideo`, `LTXVConditioning`, `LTXVScheduler`→`nodes_lt.py`) — no custom nodes needed. But `ltx-video-2b-v0.9.safetensors` is ~2 years behind; LTX is at **2.5** (22B distilled). Core now exposes a much larger LTX surface (`LTXVDualCFGGuider`, `LTXVLatentUpsampler`, `LTXVConcatAVLatent`, `LTXVReferenceAudio`, `LTXVAddLatentGuide`, …) plus **native audio-video generation**. Only 5 node types overlap with `templates/video_ltx2_5_t2v.json`. |
| 12 | LTX-Video image→video | `LTX_Video_image_to_video.json` (2024-11-23) | LTX-Video 0.9 2B image→video (`LTXVImgToVideo`) | LTX-Video 2B v0.9 | **SUPERSEDED** | Same as #11. `LTXVImgToVideo` still native, model 2 generations behind. |
| 13 | Hairstyle transfer/removal | `hairstyle.json` (2024-12-14) | Bald-cap a portrait, then transfer a new hairstyle via reference encoder + ControlNet | SD 1.x-era hair adapter stack | **BROKEN (partial)** | 4 of 8 node types are confirmed-custom: `ApplyHairRemover`, `ApplyHairTransfer`, `LoadStableHairRemoverModel`, `LoadStableHairTransferModel` → I read `lldacing/ComfyUI_StableHair_ll@main` and confirmed all four still exist in its `NODE_CLASS_MAPPINGS`. **But that repo's last push is 2025-03-31 (~18 months stale) and it is not in the Comfy-Manager registry.** Plus `CropFace` and `ImageResize+`: `ImageResize+` **confirmed alive** in `cubiq/ComfyUI_essentials` (also stale, 2025-04-14); **`CropFace` — UNVERIFIED.** It is absent from ComfyUI core, absent from the Manager registry, absent from the comfy.org registry (API returns `{"message":"Node not found"}`), and not in `cubiq/ComfyUI_FaceAnalysis`. Also pins `dreamshaper_8.safetensors` + retinaface. **Do not adopt.** |
| 14 | Virtual try-on (FLUX Redux) | `virtual-tryon-flux-redux-workflow.json` (2024-12-24) | Garment/person swap using FLUX **Redux** style-model nodes + inpainting | FLUX.1 + Redux | **BROKEN** | Two unresolvable custom nodes: **`INPAINT_ExpandMask` and `AddMaskForICLora` — provenance UNVERIFIED, no repo found** (searched huchenlei, M1kep, mit-han-lab, osunlp, the Manager registry, the comfy.org registry, and several plausible packs; nothing). Also `StyleModelApplySimple` is **UNVERIFIED**: it does *not* exist in current core (core ships `StyleModelApply` in `nodes.py`, and `StyleModelApplySimple` appears in **zero** of 5 historical ComfyUI tags I checked, `v0.0.2`→`v0.3.40`) — so it was always third-party and I cannot identify the pack. Note all LoRA/checkpoint slots are saved as `null` (unshipped). FLUX Redux is legacy anyway. **Do not adopt.** |

### Custom-node dependency census (the only 23 non-native node types)

| Node type | Providing pack | Verified status |
|---|---|---|
| `VHS_VideoCombine` | Kosinkadink/ComfyUI-VideoHelperSuite | **Alive** — last commit 2026-09-02. But **unnecessary**: native `CreateVideo`/`SaveVideo` now replace it |
| `HyVideoModelLoader`, `HyVideoSampler`, `HyVideoTextEncode`, `HyVideoDecode`, `HyVideoVAELoader`, `HyVideoLoraSelect`, `DownloadAndLoadHyVideoTextEncoder` | Kijai/ComfyUI-HunyuanVideoWrapper | **Stale** — last commit 2025-08-20; README 404; superseded by native `nodes_hunyuan.py` |
| `UnetLoaderGGUF`, `DualCLIPLoaderGGUF` | city96/ComfyUI-GGUF | **Alive** — both names confirmed in current `main` |
| `ImageResize+`, `ImageCrop+` | cubiq/ComfyUI_essentials | Names **confirmed present**; repo last push 2025-04-14 |
| `ApplyHairRemover`, `ApplyHairTransfer`, `LoadStableHairRemoverModel`, `LoadStableHairTransferModel` | lldacing/ComfyUI_StableHair_ll | Names **confirmed present**; last push 2025-03-31 |
| `CropFace` | — | **UNVERIFIED** (not in core, Manager registry, or comfy.org registry) |
| `INPAINT_ExpandMask`, `AddMaskForICLora` | — | **UNVERIFIED** (no repo found) |
| `StyleModelApplySimple` | — | **UNVERIFIED** (never in core across 5 tags; source pack unidentified) |
| `PrimitiveNode`, `MarkdownNote`, `Note` | ComfyUI frontend | UI-only nodes; harmless, not required in API prompts |

---

## 2. WHAT IS WORTH BORROWING

1. **`image_qwen_Image_2512.json` — the single best file in the repo.**
   It is the only workflow that uses **subgraphs** (`definitions.subgraphs`) to expose a
   reusable *text→image* primitive twice — once at 20 steps, once with the 4-step Lightning
   LoRA — behind a clean input interface. That is structurally the same trick our pipeline
   needs: a reusable "render this customer brief to a hero frame" unit that the video stage
   calls. Verified fully native. **Adopt the architecture, swap Qwen-Image 2512 for Mage-Flow
   (see §5).** Its aspect-ratio note (1328×1328 / 1664×928 / 928×1664 …) is the correct
   Qwen-Image resolution ladder — useful reference regardless of model.

2. **`flux2_example.json` — the multi-reference chaining pattern.**
   The `ReferenceLatent` chain (`Note`: *"Unbypass (CTRL-B) the ReferenceLatent nodes to give
   ref images. Chain more of them to give more images"*) is exactly the
   **identity-preserving personalization** primitive: a customer's face/product photo plus a
   branded style image, both natively encoded. Confirmed native (`comfy_extras/nodes_edit_model.py`).
   Keep the pattern; take the node graph from the first-party template.

3. **`hidream_o1_workflow.json` — reference-image editing at scale, done natively.**
   `HiDreamO1ReferenceImages` gives multi-reference editing with **zero custom nodes**, and the
   dev/full + LCM + `HiDreamO1PatchSeamSmoothing` variants show the cost/quality knobs. Also
   the newest file here (2026-05), so its conventions are current.

4. **`hunyuanvideoi2v.json` — the tiled-decode pattern (the repo's best engineering idea).**
   Its `Note` — *"Use the tiled decode node by default because most people will need it. Lower
   the tile_size and overlap if you run out of memory"* — plus `VAEDecodeTiled(256, 64, 64, 8)`
   is the right way to make video decode survive batch/VRAM pressure. This is a
   **throughput technique we should copy into our own templates**, independent of model choice.
   It is also proof the author migrates to native: this file already uses zero custom nodes.

5. **`image_to_video_wan22_5B.json` / `text_to_video_wan22_5B.json` — the cheapest viable
   image→video baseline.** Wan 2.2 TI2V **5B** at 4-class `uni_pc`, ~30 steps, 848×480×41
   frames is by far the smallest VRAM-risky video model here with native nodes and confirmed
   weights. Good **fallback/queue-drain model** for at-scale personalized rendering, where cost
   per customer dominates. One graph does both modes.

6. **Two negative-space lessons worth keeping:** the Wan notes record *optimal* 1280×704 × 121
   frames while shipping a deliberately smaller demo setting, and both Wan files carry the same
   Chinese negative prompt. Useful operating discipline: ship demo settings, document production
   settings, and keep one curated negative-prompt constant per model family.

---

## 3. WHAT IS DATED (skip; replacement exists)

| Skip | Why | Replacement |
|---|---|---|
| `LTX_Video_text_to_video.json`, `LTX_Video_image_to_video.json` | LTX-Video **2B v0.9** (~Nov 2024); LTX is at **2.5 / 22B distilled** with native A/V, upscaler, reference-audio nodes. Only 5 node types overlap with the current template | `Comfy-Org/workflow_templates` → `templates/video_ltx2_5_t2v.json`, `video_ltx2_5_i2v.json`, `video_ltx2_5_flf2v.json`, `video_ltx2_3_i2v.json` |
| `hunyuanVideo_t2v_Lora_01.json` | Hard dependency on a **13-month-stale** wrapper; also downloads text encoders from HF at runtime (bad for reproducible batch renders). Model is HunyuanVideo 1.0 | Native `comfy_extras/nodes_hunyuan.py` + `templates/video_hunyuan_video_1.5_720p_t2v.json` / `_i2v.json` |
| `hunyuanvideoi2v.json` (model, not structure) | HunyuanVideo **1.0**; 1.5 is native and has SR-distilled variants | `templates/video_hunyuan_video_1.5_720p_i2v.json` — keep only the tiled-decode trick |
| `Flux-Lora-Workflow.json`, `Qwen-Image-Workflow.json` | FLUX.1-dev and base Qwen-Image are two generations behind | `templates/text_to_image_flux_2_dev.json`, `image_qwen_Image_2512.json`, `text_to_image_z_image_turbo.json` |
| `hairstyle.json`, `virtual-tryon-flux-redux-workflow.json` | **Broken dependencies** (see §1 #13/#14); unidentifiable packs; SD 1.x-era models; null model slots | Native `Mage-Flow-Edit` / `Qwen-Image-Edit` for editing; `templates/image_edit_mage_flow_edit.json`, `image_edit_qwen_2511.json` |
| `WAN-T2V-Rapid-AIO.json` | Model not on HF under that name; community 4-step `sa_solver` distill; still uses VHS instead of native save | `templates/video_wan2_2_5B_ti2v.json` (verified-identical graph) |
| `SaveAnimatedWEBP` / `SaveWEBM` / `VHS_VideoCombine` **output stages** (all video files) | Superseded by native video I/O | `CreateVideo` + `SaveVideo` (`comfy_extras/nodes_video.py`) — verified native |
| `CLIPLoader(…, "ltxv")` + `CheckpointLoaderSimple(ltx-video-2b)` | Monolithic-checkpoint loading | `UNETLoader` + separate `VAELoader`/`CLIPLoader` (what current templates do) |

---

## 4. GAP ANALYSIS FOR SMART CHANNEL CX

**Our pipeline:** `text → image → video → edit → assemble timeline → render (Remotion) → deliver (VidiBlast)`

This repo covers stages 1–3 and part of 4. **It covers nothing of 5–7.** ComfyUI is a
*generation* engine; it is the wrong tool for a timeline.

### Covered (borrow): text → image → video → edit
- Text→image: `image_qwen_Image_2512.json`, `flux2_example.json`, `hidream_o1_workflow.json`
- Image→video / text→video: Wan 2.2 TI2V 5B (both), HunyuanVideo I2V, LTXV 0.9 I2V
- Image→video edit: HiDream-O1 references, FLUX.2 `ReferenceLatent`

### NOT covered — stage 5, timeline assembly
ComfyUI **has no timeline, no scene concept, no clip sequencing, no template binding.** The
closest primitives are all frame/video-container level, not editorial:
- `ConcatenateVideo`, `VideoTrim`, `LoadVideo`, `CreateVideo`, `SaveVideo`
  (verified native, `comfy_extras/nodes_video.py`)
- `AudioConcat`, `AudioMerge`, `TrimAudioDuration`
- `blueprints/video_stitch.json`, `blueprints/merge_videos.json`,
  `templates/templates-stitched_vid_contact_sheet.json`

Note the naming: **`video_stitch` is contact-sheet/tiling, not editorial sequencing** — it is an
image-grid op. There is **no** first-party template for "concatenate N clips with titles,
transitions, and a music bed into a 30 s deliverable."

**Verdict: keep the timeline in Remotion.** That is the correct boundary. ComfyUI emits
**individual clips**; Remotion owns ordering, captions, lower-thirds, brand overlays, music,
CTA, and the final encode. Concretely: have ComfyUI write PNG-frame sequences or
`SaveVideo` mp4s to a deterministic path per `customer_id`/`scene_id`, then hand a JSON
manifest to Remotion. Do **not** try to build the timeline in ComfyUI.

### NOT covered — stage 6, render + delivery
Zero coverage. No ffmpeg composition, no caption burn-in, no audio mix, no MP4 normalization,
no e-mail/VidiBlast handoff, no per-recipient asset URLs. (Remotion owns render; VidiBlast owns
delivery — the repo is irrelevant here by design.)

### NOT covered — per-customer personalization **at scale** (the real gap)
This is the most important finding. **All 14 workflows are single-shot, hand-authored, and
GPU-local.** Nothing here addresses:
- **Batch/queue execution.** No `POST /prompt` batching, no concurrency control, no per-job
  retry or failure isolation. You will be running hundreds of customers through one GPU — none
  of these files help.
- **Parameterization.** No API-format (headless) export. Several workflows are pure-UI files:
  `image_qwen_Image_2512.json`'s top level is `[PrimitiveStringMultiline, subgraph, subgraph,
  MarkdownNote, SaveImage]` with the prompt *inside* the graph, and `hairstyle.json` /
  `virtual-tryon-flux-redux-workflow.json` have hardcoded filenames (`Claire.png`, `G2.png`,
  `island.jpg`) and `null` model slots. For headless use you need
  **UI JSON → API format conversion** (the `/prompt` endpoint expects a different shape) or
  rebuild as Python prompt dicts. Nothing in this repo does that.
- **Determinism / reproducibility.** Mostly `RandomNoise(..., "fixed")` with hardcoded seed
  integers. Per-customer variety needs an explicit seed policy (`seed = hash(customer_id)`) —
  `comfy_extras/nodes_seed.py` (`SeedNode`) now exists natively for this.
- **GPU budgeting.** No resolution/VRAM policy. For a fleet you want a tier ladder
  (cheap 5B → quality 14B → premium API partner node), which the repo implicitly offers but never
  codifies.
- **Asset provenance / caching.** Nothing about content-addressed caching of per-customer
  inputs, which is where the real cost is at N customers.

### Current-generation ComfyUI that fills the generation-side gaps

**First-party `Comfy-Org/workflow_templates` — the modern replacement. 1,187 template JSONs;
690 under `templates/`, of which 390 are local diffusion models and 300 are `api_*` partner
nodes. Actively maintained: last push 2026-10-05, 1,246 stars.** This single repo supersedes
essentially all 14 files in the survey repo.

Text→video (local):
- `templates/text_to_video_wan_2_2.json` + `blueprints/text_to_video_wan_2_2.json`
- `templates/video_wan2_2_5B_ti2v.json` ← **direct replacement for repo files #3/#4**
- `templates/video_ltx2_5_t2v.json`, `video_ltx2_5_i2v.json`, `video_ltx2_5_flf2v.json`
- `templates/video_wan2_2_14B_t2v.json`, `video_wan2_2_14B_i2v.json`
- `templates/video_hunyuan_video_1.5_720p_t2v.json`, `_i2v.json`
- `templates/video_ltx_2_audio_to_video.json` ← audio-driven video, relevant to personalized VO
- `templates/template_image_speech_to_video.json`

Image→video (local): `video_wan2_2_14B_i2v.json`, `video_ltx2_5_i2v.json`,
`video_capybara_v0_1_image_to_video.json`, `video_minimax_h3_i2v.json`,
`video_kandinsky5_i2v.json`

Editing (our stage 4): `image_edit_mage_flow_edit.json`, `image_edit_mage_flow_edit_turbo.json`,
`image_edit_qwen_2511.json`, `image_edit_flux_2_dev.json`, `video_edit_bernini_r.json`,
`video_inpaint_wan2_1_vace.json`, `video_inpainting_wan2_1_vace.json`,
`video_inpaint_void.json`

Utility / gap-filling: `utility_video_frame_interpolation.json`,
`utility_seedvr2_video_upscale.json`, `utility_video_upscale.json`,
`upscale_video_seedvr2_3b_int8.json`, `templates/api_sync_so_lip_sync_video.json`,
`templates/utility_hitpaw_video_enhance.json`, `blueprints/video_stitch.json`

API/partner nodes — **relevant if you want to trade GPU cost for latency at fleet scale** (300
available): Seedance / Seedance 2.5, Kling v3 + O3, Veo 3, Runway Gen-4 Turbo + Aleph 2,
Vidu, Pixverse, Luma Ray3.2, HeyGen (avatar + TTS + lip-sync + **video translate** — directly
relevant to per-customer personalization), Sync.so, Bria (video background replace / green
screen), Topaz enhance, ElevenLabs & Chatterbox TTS.

**Practical recommendation for stage 1–2:** run the first-party *blueprints* (subgraph-based),
not the individual `templates/`. They are already factored into reusable subgraphs with
`PrimitiveStringMultiline` / `PrimitiveInt` / `ResolutionSelector` inputs — i.e. **already
parameterized for headless use**, which is exactly what the survey repo's files are not. Note
`ResolutionSelector` is a first-party node the survey repo never uses; it is the clean way to
drive aspect ratio from a customer record.

---

## 5. Mage-Flow — explicit note

**Is Mage-Flow touched by any workflow in `fahdmirza/comfyuiworkflows`? NO.** I checked every
node type and every model filename in all 14 JSONs: zero Mage-Flow references, and no
Mage node types. Mage-Flow postdates most of this repo's video content.

**But the repo is still directly relevant to your Mage-Flow install, in two ways:**

1. **`flux2_example.json` is the closest structural sibling to Mage-Flow** and is worth reading
   side by side. Both are reference-image-conditioned FLUX2-latent-format editors:
   - `flux2_example.json`: `EmptyFlux2LatentImage` → `Flux2Scheduler` → `FluxGuidance` →
     `VAEEncode` → chained `ReferenceLatent` nodes, `flux2-dev` + `flux2-vae` + Mistral-3-Small.
   - Mage-Flow: `image_model: "mage_flow"`, and I verified `class MageFlow(BASE)` in
     `comfy/supported_models.py:2016` with `latent_format = latent_formats.Flux2` —
     **the same Flux2 latent space.** So the reference-latent chaining technique transfers
     directly.
2. **`image_qwen_Image_2512.json` is the subgraph pattern to port.** Swap the Qwen subgraph body
   for Mage-Flow and you get a parameterized, reusable "text + refs → image" unit.

**Verified Mage-Flow facts (so you don't have to re-derive them):**
- **Mage-Flow is NATIVE ComfyUI — not a custom node pack.** `comfy_extras/nodes_mage.py`
  defines `TextEncodeMageFlowEdit` (edit-instruction + up to **16 reference images**
  `image_1..image_16`, auto-resized to output resolution because Mage's RoPE aligns reference
  and target *by position*).
- `comfy/supported_models.py:2016` → `class MageFlow`, `memory_usage_factor = 6.5`,
  dtypes `bfloat16`/`float32`, `shift: 6.0`.
- Text encoder: **Qwen3-VL 4B** (`llama_detect(..., "qwen3vl_4b.transformer.")`), tokenizer
  `MageFlowTokenizer` (`comfy/text_encoders/mage_flow.py`).
- Detection (`comfy/model_detection.py:963`): `txt_norm.weight` shape `[2560, …]` +
  `proj_out.weight` shape `[128, …]`, with the source comment noting **Qwen Image is 3584/64**
  — i.e. the check exists specifically to disambiguate Mage-Flow from Qwen-Image. Good news:
  you cannot accidentally load the wrong family.
- **Weights: `Comfy-Org/Mage-Flow`** (HF, ~110k downloads) ships `mage_flow_bf16.safetensors`,
  `mage_flow_base_bf16`, `mage_flow_edit_bf16`, `mage_flow_edit_turbo_bf16`,
  `mage_flow_edit_int8_convrot`, `mage_flow_edit_base_bf16`, plus a VAE. The supported-models
  page lists `mage-flow-vae-bf16` with 4 workflows.
- **First-party templates (use these, not hand-built graphs):**
  `templates/image_mage_flow_t2i_int8.json`, `image_mage_flow_turbo_t2i_int8.json`,
  `image_mage_flow_edit_int8.json`, `image_mage_flow_edit_turbo_int8.json`, and the
  parameterized blueprints `blueprints/text_to_image_mage_flow.json`,
  `text_to_image_mage_flow_turbo.json`, `image_edit_mage_flow_edit.json`,
  `image_edit_mage_flow_edit_turbo.json`.
- **Turbo vs Edit:** the repo `Comfy-Org/Mage-Flow` on GitHub returns **404** — it is an HF weights
  repo, not a GitHub one. The Turbo variant is the **4-step distilled** path (matching
  `blueprints/text_to_image_mage_flow_turbo.json`); **Edit** is the reference-image
  instruction-following variant. Both are in `templates/`.
- ⚠️ **UNVERIFIED:** your brief calls it "4B". I confirmed the **text encoder** is Qwen3-VL-4B;
  I did **not** verify the transformer's parameter count from the weights. `memory_usage_factor =
  6.5` is a VRAM sizing signal, not a parameter count. Check the HF repo config before you plan
  VRAM.

**Recommended for Smart Channel CX:** Mage-Flow-**Turbo** as the high-volume text→image
generator (distilled, cheap, fast) and Mage-Flow-**Edit** for the personalization edit step —
both native, both with first-party templates, and both using the same Flux2 latent space as
`flux2_example.json`'s reference-latent pattern.

---

## 6. Recommended set to adopt

**Tier 1 — adopt (adapt + rewire for headless):**
1. `image_qwen_Image_2512.json` — **subgraph architecture**, retargeted to Mage-Flow-Turbo.
2. `flux2_example.json` — **multi-`ReferenceLatent` chaining**, retargeted to Mage-Flow-Edit.
3. `image_to_video_wan22_5B.json` — image→video baseline (use the first-party
   `templates/video_wan2_2_5B_ti2v.json`; they are the same graph).
4. `hunyuanvideoi2v.json` — **tiled-VAE-decode pattern only**, ported to your video templates.
5. `hidream_o1_workflow.json` — native multi-reference editing reference.

**Tier 2 — mine for technique, don't adopt the file:** `WAN-T2V-Rapid-AIO.json`
(negative-prompt + production-resolution notes only; model unverified).

**Tier 3 — do not adopt:** all LTXV-0.9, HunyuanVideo-wrapper, Flux.1-dev, base-Qwen-Image,
`hairstyle.json`, `virtual-tryon-flux-redux-workflow.json`, and `hunyuanVideo_t2v_Lora_01.json`.

**Alongside the adoption, three engineering prerequisites this repo will NOT give you:**
- **Headless prompt format.** Convert to API-format / Python dicts. `Primitive*` + subgraphs +
  `ResolutionSelector` from `workflow_templates` blueprints are your friend; the survey repo's
  hardcoded filenames and `null` model slots will not survive unattended batch runs.
- **Seeding & caching.** Explicit per-customer seed (`SeedNode` is native) plus
  content-addressed caching of inputs and outputs.
- **A hard stage boundary at the timeline.** ComfyUI produces scene clips; Remotion assembles
  and renders; VidiBlast delivers. Do not let ComfyUI grow a timeline.

---

## 7. Honesty notes / explicit uncertainty

- **Verified by reading files:** all node-type→native/custom determinations (923-file core scan),
  all 14 workflows' contents, per-file commit dates, repo metadata, model file existence on HF,
  `city96/ComfyUI-GGUF` and `cubiq/ComfyUI_essentials` and `lldacing/ComfyUI_StableHair_ll` node
  names, VHS and HunyuanVideoWrapper last-commit dates, Mage-Flow core implementation details.
- **Inferred, not directly verified:** that `save_metadata: true` on `VHS_VideoCombine` embeds
  workflow prompts (I read the widget dict, not the VHS writer code) — do not rely on it.
- **UNVERIFIED — flagged rather than guessed:**
  - `CropFace`, `INPAINT_ExpandMask`, `AddMaskForICLora`, `StyleModelApplySimple` — provenance
    not established. (For `StyleModelApplySimple` I did establish it is **not** in core today
    and was **not** in `v0.0.2`/`v0.1.0`/`v0.2.0`/`v0.3.0`/`v0.3.40` — so it was third-party,
    but I could not identify which pack.)
  - `wan2.2-t2v-rapid-aio.safetensors` — no HF match under that name.
  - Mage-Flow "4B" parameter count (see §5).
- **Not tested by execution:** I performed no inference. These are static-read and
  source-inspection verdicts; a workflow could still fail on a specific GPU/quantization combo.
- **Snapshot date:** ComfyUI `master` @ 2026-10-05 (HEAD `7ddf9a4f`),
  `workflow_templates` @ 2026-10-05, `comfy.org/p/supported-models` @ 2026-10-05. ComfyUI moves
  fast; re-run the core node scan before acting on anything marked BROKEN.

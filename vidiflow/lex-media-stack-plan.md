# LEX Media Stack — starter build plan (2026-09-16)

Goal: every LEX term gets a visual demonstration — `conceptImg` now, `conceptVideo` for top terms.
Two tracks: cloud now (Grok Imagine 1.5), local full-time later (Miami B70).

## 0. Reality check (verified today on 192.168.4.40)
- This box: Intel UHD 630 iGPU, 14 GB RAM, 12 CPU. No NVIDIA/AMD dGPU (`nvidia-smi` absent, `/dev/dri` Intel only).
  Local LTX/FLUX/video generation HERE is not viable. Do not install heavy models here.
- ComfyUI source exists at `/mnt/m/code/ComfyUI` but `models/checkpoints/` is empty, nothing running, HF cache empty.
- GPU home = Miami B70 box (Ryan): 2× Intel Arc Pro B70 (32 GB ECC each, 64 GB VRAM), Threadripper, 256 GB RAM.
  Status: design + compose ready, NOT applied — no SSH until authorized (see `Miami-B70-Private-AI-Server-Summary.pdf`).
- Existing images: `/mnt/m/code/vidismart/images/` = 786 files (~1.5 GB), incl. AAFES logo + photo. `images/lexi/` = 8 scene SVGs only.
  Zero per-term concept jpgs/mp4s. Referenced `assets/images/lexi/*.jpg` does not exist anywhere. Prior model research exists:
  `ai-image-generation-comparison-2026.html` (FLUX family focus), `ai-video-generation-comparison-2026.html`.
- No `XAI_/GROK_` keys in env. SuperGrok is linked (Grok Bot) but no API key on file here.

## 1. Track A — now: Grok Imagine 1.5 (cloud)
Use for all 15 current terms immediately. User states Imagine 1.5 does 1080p video.
- Step A1 (verify, 30 min): confirm xAI API access from this box — image endpoint (`grok-2-image` pattern) + Imagine video endpoint
  + SuperGrok quota. If no key, generate from Grok web/X app manually with the prompt pack below and drop files in
  `/mnt/m/code/vidismart/images/lexi-new/`.
- Step A2: prompt pack per term = its `conceptDesc` + style suffix:
  `", holographic explainer art, deep-navy background #0b0f1e, cyan/magenta glow, no text, 16:9, 1920x1080"`.
  15 prompts are derivable from `lexi-pipeline/seed-unified.json` (scriptable).
- Step A3: naming + upload: `images/lexi/<ACR>.jpg` and `videos/lexi/<ACR>.mp4` → R2 bucket `vidismart`
  (verified writable) → set `concept_img`/`concept_video` in `lexi_terms` → flip term to published.
- Video: top terms first (CRM, RAG, LLM, SaaS). Image-to-video from the concept jpg + `flow[4]` as shot list.

## 2. Track B — local full-time stack on Miami B70 (needs SSH authorize)
Target: ComfyUI API + workers, serving LEX 24/7. Intel Arc Pro MTL — plan for IPEX/XPU from day one.
- Models (download once, ~100–150 GB): FLUX.1-dev (or Schnell for speed) + T5/CLIP encoders + VAE (~30 GB);
  LTX-Video 13B (~30 GB) for fast video; MiniMax/Hailuo via API (verify what "H3" maps to — Hailuo-02?)
  since MiniMax is API-first, not local weights; upscale model (ESRGAN/DAT) for 1080p finish.
- Services (compose): `comfyui` (IPEX image, API port), `lex-worker` (Redis queue on 6379: prompt jobs from Directus
  webhook on `lexi_terms` insert/update where `concept_img=''`), `r2-uploader` (writes back Directus URLs),
  reuse existing Postgres/Redis/Directus patterns from `/opt/vidismart/repo/infra/`.
- VRAM split (64 GB): FLUX gen ~24 GB / LTX gen ~20 GB / spare for queue overlap. INT8/GGUF fallbacks if XPU OOMs.
- Caveats (honest): LTX + Comfy custom nodes on Intel Arc/XPU are experimental — expect a porting week.
  FLUX on Arc via IPEX works but slower than CUDA. If Arc fights us, fallback: run FLUX API (BFL) + keep video local.
- Gate: Ryan authorizes SSH → apply compose → smoke test (1 image + 5s clip) → point LEX worker at it → retire Track A
  to overflow duty.

## 3. Per-term definition of done
- `concept_img` 200 OK on `cdn.vidi.news`, 16:9, matches `conceptDesc`, no gibberish text.
- `concept_video` (top terms): ≤30s, 1080p, follows `flow[4]` beats, <15 MB via H.265.
- `brands[]` logos: LogoDet-3K or vendor press-kit SVG, stored R2, never hotlinked.
- Directus term → published only when image + embedding both present.

## 4. Decisions needed from you
1. xAI key or manual-drop for Track A? (15 images ≈ 1 Grok session.)
2. Authorize Miami B70 SSH? (Track B can't start without it.)
3. "MiniMax H3" = Hailuo-02 API, or a local MiniMax weight? (Changes Track B model list.)
4. 1080p mandatory for all, or 720p acceptable for long-tail terms? (4× render cost.)

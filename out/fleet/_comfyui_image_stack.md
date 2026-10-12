# ComfyUI image generation stack — Smart Channel CX

Date: 2026-10-05
Verified on: RTX 4090 (23 GB), Windows 11, ComfyUI 0.39.0, torch 2.11.0+cu128

## Environment

| Item | Value |
|---|---|
| ComfyUI | `M:\code\ComfyUI` @ `b0b74356` (v0.39.0), upgraded from v0.6.0 `d7111e42` |
| Python env | `M:\code\ComfyUI\.venv-win` (py3.12.11) — **NOT** `venv/` (that is a Linux/WSL venv from `/mnt/m`, unusable) |
| Launch | `./.venv-win/Scripts/python.exe main.py --listen 127.0.0.1 --port 8188 --disable-auto-launch` |
| Disk used | ~50 GB of weights |

Do not run `pip install` into the global Python. Use
`uv pip install --python .venv-win/Scripts/python.exe`.

## Verified models (all four rendered successfully)

| Model | File | VRAM | Steps | Time @1024² | License |
|---|---|---|---|---|---|
| Mage-Flow Turbo INT8 | `diffusion_models/mage_flow_turbo_int8_convrot.safetensors` | 13.4 GB | 4 | 12.5 s | MIT |
| **Mage-Flow Edit Turbo INT8** | `diffusion_models/mage_flow_edit_turbo_int8_convrot.safetensors` | 4.2 GB + shared encoder | 4 | 83.5 s | MIT |
| Z-Image-Turbo INT8 | `diffusion_models/z_image_turbo_int8_convrot.safetensors` | 12.2 GB | 8 | 18.3 s | Apache-2.0 |
| FLUX.2 klein 4B | `diffusion_models/flux-2-klein-4b.safetensors` | 11.9 GB | 20 | 52.5 s | Apache-2.0 |
| HiDream-O1 dev FP8 | `checkpoints/hidream_o1_image_dev_fp8_scaled.safetensors` | ~9 GB | 28 | 36.2 s | MIT |

**All five render successfully.** Mage-Flow Edit Turbo has a real caveat, see below.

Supporting files:
- `text_encoders/qwen3vl_4b_bf16.safetensors` (Mage-Flow, type `mage`)
- `text_encoders/qwen_3_4b_fp8_mixed.safetensors` (Z-Image, type `lumina2`)
- `text_encoders/qwen_3_4b_fp4_flux2.safetensors` (FLUX.2, type `flux2`)
- `vae/mage_flow_vae_bf16.safetensors`, `vae/ae.safetensors`, `vae/flux2-vae.safetensors`

All four are **native ComfyUI** — no custom nodes. Mage-Flow lives at
`comfy_extras/nodes_mage.py` + `comfy/supported_models.py::MageFlow`.

Working API-format graphs, all verified end-to-end:
- `M:\code\ComfyUI\mageflow_smoke_api.json`
- `M:\code\ComfyUI\zimage_smoke_api.json`
- `M:\code\ComfyUI\flux2klein_smoke_api.json`
- `M:\code\ComfyUI\hidream_smoke_api.json`

## INT8 ConvRot vs BF16 — what you actually see

Practically **no visible difference**. The VRAM difference is total:

| | BF16 | INT8 ConvRot |
|---|---|---|
| Mage-Flow Turbo VRAM | ~33 GB (will not fit) | 13.4 GB |
| Disk per file | 8.2 GB | 4.2 GB |
| Detail | reference | ~equal |
| Speed | baseline | ~1.05–1.15× (VRAM-bound, not compute-bound) |

Ordinary INT8 destroys fine detail (text, hair, hands). **ConvRot** is a rotation-based
scheme that keeps quality near BF16 while running 8-bit matmuls. Use INT8 ConvRot as the
production default. Pull BF16 only for hero stills that might be printed.

Note the licenses differ from what marketing suggests: FLUX.2 klein **9B** is licensed
"other", the **4B** is Apache-2.0. Prefer the 4B.

## Graph gotchas that cost time

1. **`TextEncodeMageFlowEdit` owns latent creation.** It has no `text` input — it takes
   `prompt`, `negative_prompt`, `width`, `height`, `batch_size` and emits three outputs:
   `[0]=positive, [1]=negative, [2]=latent`. Do **not** attach `EmptyLatentImage`;
   wire `negative` to output index **1**.
2. **FLUX.2 needs the full custom-sampler chain**, not `KSampler`:
   `EmptyFlux2LatentImage` → `Flux2Scheduler` → `RandomNoise` + `KSamplerSelect` →
   `BasicGuider` → `SamplerCustomAdvanced`. `FluxGuidance` (3.5) sits between encode
   and guider. CLIPLoader `type` must be `flux2`.
3. **Z-Image-Turbo** needs `ModelSamplingAuraFlow` with `shift=3`, `EmptySD3LatentImage`,
   sampler `res_multistep`, `cfg=1.0`, and negative via `ConditioningZeroOut`.
4. **HiDream-O1** uses `CheckpointLoaderSimple` (self-contained), `ModelNoiseScale`
   (7.6 dev), `SamplerLCM`, `BasicScheduler` 28 steps. The full first-party template is a
   30-node graph that adds an LLM prompt-enhancer stage — not needed for plain T2I.
5. The `/prompt` endpoint needs the payload wrapped: `{"prompt": {...}, "client_id": "..."}`.
   Sending the bare node dict returns `no_prompt`.

## Mage-Flow Edit Turbo — subject fidelity caveat (tested 2026-10-05)

Test: took the Z-Image portrait (B&W blonde bust shot) as a reference image and asked
Mage-Flow Edit Turbo to *"keep the subject, pose, framing and black and white film grain
unchanged, replace the background with a neon city street at night"*. Graph:
`mageflow_edit_smoke_api.json`, 4 steps, 83.5 s.

**What worked:** the background edit is excellent. Rain-slicked pavement with magenta and
cyan reflections, signage, bokeh, correct night-street structure. Full tonal adoption of the
new scene.

**What failed: the subject was NOT preserved.** The reference was a blonde woman in a tight
bust framing; the output is a *different person* — brunette with bangs, long dark coat,
full-body shot at a much wider framing. Identity, hair colour, pose and scale all drifted.
Tone-transfer did survive (the monochrome palette carried over).

**Conclusion — do not assume "edit" means "preserve the subject".** At 4 steps with
`denoise=1.0` the model regenerates the whole frame and treats the reference as *style and
content guidance*, not a locked subject. This is fine for background/scene swaps and wrong
for per-customer identity personalization.

Before relying on this for personalization, test the levers:
- lower `denoise` on the KSampler (0.3–0.5) so the reference latent survives;
- use the **non-Turbo Edit** (`mage_flow_edit_int8_convrot`, 30 steps, cfg 5) — the
  first-party template for it is explicitly a subject-preserving instruction ("Keep the
  woman, pose, pink dress, chair, and reading unchanged"), which is what Turbo did not honour;
- widen the instruction wording and confirm by re-reading the output each time.

That non-Turbo Edit file is **not yet downloaded** (4.16 GB). It is the one to test next if
identity preservation is required.

## Edit Turbo retry-loop viability — measured (2026-10-05)

Question: can a retry loop rescue identity drift? Measured rather than assumed.

**Seed sweep, 6 seeds, same prompt/reference:** 6/6 rendered `success`. But *every one*
produced a different person. The reference was a blonde woman in a tight bust portrait; the
outputs were full-body figures on a neon street — varying apparent gender, hair, clothing and
framing. Same failure mode as the original single test, every time.

**So the "6/6 success" is the trap.** Retry logic that keys on *render success* would accept
all six and ship six wrong subjects. A checker must judge **identity match**, not exit status.

**Denoise sweep (the lever most likely to help) — it destroys the image instead:**

| denoise | Result |
|---|---|
| 1.0 | coherent image, subject NOT preserved |
| 0.7 | coherent image, different scene again (rear-view crowd, not the ref) |
| 0.5 | **abstract mosaic noise — total failure** |
| 0.4 | abstract mosaic noise — total failure |
| 0.3 | abstract mosaic noise — total failure |

Denoise below ~0.7 does not "preserve the subject better"; it destroys the latent entirely and
outputs visual garbage. There is no middle setting that locks identity. The lever does not exist.

**Conclusion: a retry loop cannot rescue this model for identity work.** Reseeding explores the
same distribution — the subject is never drawn from the reference, it is regenerated from
scratch. Retry would need to converge on a success probability > 0, and here it is effectively 0
for subject preservation, while producing clean-looking images that fail inspection.

**What would work instead:**
1. **Mage-Flow Edit non-Turbo** (30 steps, cfg 5) — not yet downloaded. Its first-party
   template is an explicit subject-preservation instruction, which is the exact behaviour Turbo
   failed to honour. This is the one genuinely untested option.
2. **Don't regenerate the subject at all.** Generate backgrounds/scenes with Mage-Flow Turbo,
   and composite the customer in the timeline layer (Remotion) or via a dedicated
   face/identity-conditioning node (InstantID / PuLID-FLUX style). Keeps identity bit-exact.

## Open items

- **Mage-Flow Edit (non-Turbo) INT8** — `mage_flow_edit_int8_convrot.safetensors`, 4.16 GB,
  not downloaded. This is the variant to test for **identity-preserving** edits; see the
  caveat section above. Edit *Turbo* is tested and does background swaps well but does not
  hold the subject.
- **kumiho_server.exe restart** still pending user approval (Ollama embedding fix inert
  until then).
- 9Miho is currently stopped; port 9999 is down.

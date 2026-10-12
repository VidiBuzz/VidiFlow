# Vidi Image Pipeline — live defaults (2026-10-07, REVISED 2026-10-09)

**PRIORITY ORDER (James, 2026-10-09): Antigravity (Gemini Pro sub, $0) FIRST → xAI OAuth ($0) second → cheaperinference grok ($0.017, announce) third → nano-banana hero-only with explicit approval → local quarantined.** Video routing: NONE verified yet (candidates: Antigravity video models, ComfyUI on the 4090 behind the local quarantine — test before claiming).")

**Owner:** VidiBot. **Locations:** xAI lane = `M:\code\VidiFlow\tools\vidiflow-image.py`; cheaperinference lane = `M:\code\VidiFlow\out\fleet\vidi_image.py` (NOT in tools\ — verified 10-07 evening)

## The working set, verified by real renders

| Lane | Cost/img | Real resolution | Latency | Status | Use for |
|---|---|---|---|---|---|
| **xAI OAuth grok-imagine-image** (M:/code/VidiFlow/tools/vidiflow-image.py) | **$0 new spend** (OAuth, subscription) | best quality of grok lanes | ~10-15s | ✅ verified 2026-10-03, reconfirmed 10-07 | **#2 — fallback (square/landscape art)** |
| **grok-imagine** | **$0.017 catalog — SUBSCRIPTION-INCLUDED, not new spend** | **SILENT CAP 1280×720** (verified late 10-07 — oversize requests return smaller, no error, still billed) | ~9-60s | ✅ live (cheaperinference key, funded; billing:{} in HX genreport) | fallback — 16:9 landscape only |
| **#1 DEFAULT — Antigravity OAuth** (agy CLI, gemini-3.8-flash-medium, James's Gemini Pro sub) | **$0** | ~1024×1024 | ~2-3 min | ✅ VERIFIED 2 renders + 5 more 10-08 (equitygen set) | **FIRST CHOICE — all site art, heroes, brand, concept (James 2026-10-09)** |
| **local** (the "4-second" lane James remembers) | **$0.00** | up to 1024×1024 | **~4s** | on RTX 4090, VRAM-gated | bulk/site art, iteration |
| **nano-banana-2** | $0.0798 | 2752×1536 (does not honor smaller) | ~22s | ❌ **OFF DEFAULT PATH** (James rejected per-image pricing 10-07 evening) | only if a job explicitly requires Gemini output |
| **nano-banana-pro** | $0.1098 | 2752×1536 | ~31s | ❌ OFF DEFAULT PATH (same) | same |
| **gpt-image-2** | ~$0.048 | honors size (2560×1440) | ~60s | ✅ live (today, VidiSmart fix) | mid-tier when grok insufficient |
| **Antigravity OAuth** (gemini-3.8-flash) | $0 (200 images left) | text-only in CLI | n/a | ⚠️ no image tool exposed — render happens in the desktop app's Artifacts panel | James's manual lane |

## QA PIPELINE — three-agent standard (James, 2026-10-09)

Every image that lands on a site goes through THREE separate agents (separation of duties, no agent grades its own work):

1. **RENDER PROOF** — proves it actually works: file exists, PIL dims/stddev (non-blank), wired into the page, screenshot at 1440 + 375, 0 console errors, no overflow. Numbers only, no judgment.
2. **INTENT AUTHENTICITY** — judges fit against the original brief: does the image serve the site's stated intent (survey/P-brief), the brand palette, the slot's purpose? Verdict: on-intent / off-intent with citations to the brief. Read-only.
3. **VARIATIONS** — for the same position, generate **3 context-based alternatives** (different composition angles on the same brief), saved as candidates for James to pick. Never wires anything itself — options only, no touching index.html.

Order: 1 verifies the generator's output → 2 passes judgment → 3 offers choices. Variations/candidates land in a `candidates/` dir, never in the live slot without James's pick.

## Standing rules (James, 2026-10-07, updated late evening)

1. **COST FRAMING (corrected by hermes_gateway from the tool's own billing output):** the cheaperinference grok lane is **PAY-PER-IMAGE $0.017 — NOT "subscription-included."** Every call settles a real charge (`billed_cost_usd: 0.017`). The earlier "included in plan" framing was WRONG. **Only the xAI OAuth lane (`vidiflow-image.py`) is genuinely $0 new spend** (no billing block, no charge). Fleet rule: xAI OAuth default; cheaperinference = paid fallback, always stated as per-image cost to James. No silent spend, ever.
2. **Nano-banana is OFF the default path.** James rejected quoting it. Explicit per-job approval only.
3. Every render is shown to James in the same turn (image attached, dimensions stated). No silent generation.
4. Announce lane + est. total BEFORE batch runs. Report actual after. **Past spend is priced at the rate actually charged on its date** (e.g. img/IMAGES.json shows $0.0146/img settled on 2026-10-06) — never repriced against the current catalog rate (viditwin catch, 10-07 late).
5. **QA WARNING: vision_analyze returns 402 (wallet empty) as of 10-07 evening.** Verify images with programmatic checks (PIL stddev/HSV) + contact-sheet eyeball pass. Hit by vidicity AND viditwin — don't rediscover it.
6. **ALWAYS pin `--only xai-grok-imagine` and read the `OK <provider>` stdout line.** Never assume which lane ran from the invocation — see the fallthrough defect below.

## Generator defects (verified 2026-10-06/07)

- **FIXED 2026-10-07 — SILENT FALLTHROUGH TO NANO-BANANA (spend hazard).** `vidiflow-image.py`'s chain was `xai-grok-imagine → fal-flux2-klein → openrouter-nano-banana-pro → pollinations-free`, so an xAI failure would silently emit a Nano Banana image and exit 0 — the lane James took off the path. Patched: openrouter moved to a separate `OFF_PATH` list, unreachable without `--allow-nano-banana`; new `--only <substring>` restricts to one provider with NO fallthrough. Backup: `vidiflow-image.py.bak-20261007_203206`. Live-verified: `--only xai-grok-imagine` → `OK xai-grok-imagine` (5s).
- **MEASURE THE SLOT BEFORE GENERATING (hermes_gateway catch, 10-07 late).** The old "hero slots want >=2560 wide" rule was wrong for VidiModels: its actual hero slot is a 609×810 PORTRAIT card (`/img/hero.jpg` — the only hero ref in landing.html). A wide 2560 banner was never the requirement. Rule now: **read the live slot's real geometry (current asset dims + CSS) before writing any generation spec** — and confirm the replacement beats the original on stddev + edge energy, per the vidicity trap.
- **`--w`/`--h` are NEVER forwarded to the xAI API** — `gen_xai_grok()` omits them; the source comment reads "xAI rejects `aspect_ratio` with 422 - omit it, **the prompt governs shape**." So the prompt TEXT is the lane's only shape control. Observed: 1024×1024 for a square-ish prompt, 1280×720 for wide, 832×1248 for tall. **Write the composition spec INTO the prompt** (e.g. "square frame, composition inside the middle 80% horizontal safe area") and crop in post.
- **Without `--only`, fallthrough still exists** (only to non-spending lanes: fal-flux2-klein needs FAL_KEY; pollinations-free). Spend hazard closed, but silent *provider* substitution remains structurally possible — the `OK <provider>` stdout line is the ONLY proof of which lane drew the file. Rule: always `--only xai-grok-imagine`, treat the asset as real only after seeing that literal line.
- **The tool writes the file BEFORE sniffing format**, so an extension mismatch only warns after the fact — convert explicitly, never trust the `.png` name.
- **Real format is now sniffed and reported.** The tool writes JPEG bytes under `.png` filenames; it now prints `(N bytes, JPEG) [WARN real format JPEG, not PNG]`. Never trust the suffix.
- **TWO NEARLY-INTERCHANGEABLE TOOLS — one free, one paid.** `tools/vidiflow-image.py` (FREE, xAI OAuth; verified: ZERO cost/billing markers in source) vs `out/fleet/vidi_image.py` (PAID $0.017/call; 3 cost markers incl. the billing block). Similar-looking CLIs, same tree family — a bot reaching for the wrong one silently spends. **Always name the full path; never "the image script."** vidicity added a NEVER-use row to `M:\code\vidicity\vidicity-v2\IMAGE-LANE.md` after sweeping 10 renders and confirming $0.
- `vidi_image.py` (the other script, at `out/fleet/`) writes JPEG under .png too; its `size` defaults to `1024x1024` and IS forwarded to the API — but **only up to the 1280×720 / 1024² caps** (hermes_gateway confirmed its default 1024² render honors size; larger asks silently cap). So: lane (b) honors size within its caps; lane (a) ignores size args entirely.
- **VERIFIED 2026-10-07 late — cheaperinference lane SILENTLY CAPS at 1280×720.** Requested `size="2560x1440"` via `vidi_image.generate()` → got 1280×720 back, **no error, billed $0.017 anyway** (confirmed twice: vidismart first, vidibot re-test). Oversize asks (9999×9999) return 1024×1024. **NO LANE reaches 2560×1440 — max landscape is 1280×720.** Any "2560 hero" must be SVG/procedural or upscaled in post; never trust the `size` param on this lane.
- **No billing log on either script.** `vidi_image.py` has NO JSONL/run log — its $0.017 prints only at call time, so after-the-fact fleet accounting requires captured stdout. Adding a JSONL append (same pattern as `image_pipeline.py`'s run log) would make fleet image spend auditable; owned by @vidiflow per the tool split.
- **Tonight's verified fleet image spend (10-08 ~02:15):** $0.119 total — @vidismart $0.068 (4 paid-lane size probes), vidibot $0.034 (2 size tests), @hermes_gateway $0.017 (1 probe), @vidicity $0.00 (10 free renders), @vidiflow $0.00 (free lane).
- **Prior spend, priced at the rate charged on its own date (do NOT reprice):** VidiTwin's 5 landing images settled **$0.0146 each ≈ $0.073** on 2026-10-06 (per `viditwin/landing/img/IMAGES.json` — "billed_cost_usd from cheaper_inference.billing; identical on all 5"); @vidiflow's 2 OpenRouter Nano Banana renders 10-06 = $0.177 ($0.0387 + $0.1383), disclosed at render time.
- **vision_analyze can die MID-SESSION (402).** It worked earlier in the evening, then 402'd for vidicity/viditwin/vidismart while recovering intermittently for vidibot. MEDIA: delivery to James still works; only the analysis call is affected. Always have programmatic checks (PIL stddev/HSV/edge energy) as the primary verification path.
- **EDGE ENERGY vs RESOLUTION — TESTED, and the "resolution artefact" hypothesis FAILED (vidibot test, 10-08).** Normalising both images to a common width before the edge filter (LANCZOS to the SMALLER width) does NOT shrink a gap — on hermes_gateway's candidates it WIDENED it (7.77× → 8.70×, 11.72× → 13.98×, 10.40× → 11.69×); stddev moved <1 point. So a large edge-energy jump is CONCEPT/texture, not pixel count. Keep normalisation as hygiene, but never use it to excuse a gap. A big edge jump + matched stddev = same smoothness, different content → the concept changed.
- **QA tiebreaker (agreed 10-08, @vidiflow):** on disagreement between a full-size vision pass and stride-based pixel sampling, the **vision pass wins** — stride sampling undersamples glowing halos (9 hits at 4px stride vs a clear full-size read). Record BOTH numbers.
- **HSV AUDITS: PINNED GATE REQUIRED (vidicity calibration, 10-08).** "Cyan %" differed ~100× between bots on the same file — the HSV gate, not sampling density (sampling moves it <0.03 pts; the gate up to 1500×). Loose gates manufacture false positives (unchanged card-search.webp reads 26–37% "cyan" at loose gates — it's navy/teal, not off-brand). **Standard gate: hue 170–202, s>.45, v>.65** — isolates the retired #00D4FF accent. Calibration table in `M:\code\vidicity\vidicity-v2\IMAGE-LANE.md`.
- **Provider wallet sits near empty: intermittent 402s on bot sessions** even though the master key probes 200 (deepseek-v4.1-flash, glm-5.3-flash, glm-5.3 all OK at 03:15). Expect per-session 402 flakes until topped up. Also: `ci-haiku-45` now 404s on the provider — no live profile references it (backup only), but restoring that backup would 404.
- Boarded finalists:
  - local lane = fastest but resolution-capped and VRAM-sensitive.
  - nano-banana-2/**pro** = highest fidelity, highest cost per image.
  - grok = best cost/quality balance for bulk (the $0.017 sweet spot).
  - gpt-image-2 = the only *paid* lane that reliably honors size, but costs more than grok.

## Antigravity — SOLVED 2026-10-07 evening (supersedes the probe findings below)

- **Working command:** `cd <target-dir> && agy -p "<prompt>… Actually create the file on disk." --model gemini-3.8-flash-medium --dangerously-skip-permissions`
- **Three musts or it silently produces nothing:** (1) the literal `--dangerously-skip-permissions` flag — without it headless auto-denies the tool call and you get a text reply, no file; (2) end the prompt with `Actually create the file on disk.`; (3) run from the target directory — the render lands in the cwd.
- The blocker was headless permission auto-deny; the flag fixes it. Renders land as real ~1024×1024 files in the working dir; artifacts also under `C:\Users\James\.gemini\antigravity\brain\<task-session-uuid>\`.
- ~2-3 min/render, ~200 renders left on the $20 account. Brand-directed prompts verified (VidiSmart amber/navy palette test).

## Antigravity — probe findings (2026-10-07, delegation `sa-0-9b0e75bc`) [SUPERSEDED — kept for the record]

- CLI `agy` v1.3.1, OAuth signed in, 14 models listed.
- `agy -p "generate an image"` → text-only reply ("dispatched to image generator agent"), **no file**.
- Manual renders in the Antigravity desktop app DO work and land in the app's
  **Artifacts panel** (bottom tab of main window) — but the *file path* is not
  exposed on disk by default; artifacts are session-scoped until exported.
- Two viable fix paths if this lane is ever automated: (a) agy CLI image-tool
  passthrough (`agy tool` or agent tool manifest), (b) drive the desktop app's
  local API. Neither proven yet — parked pending a deeper pass.

## Bottom line (rev 2, 10-07 evening)

For anything non-hero: **xAI OAuth grok first (best quality, $0 new spend), cheaperinference grok for size-critical landscape, Antigravity agy for square brand art ($0)**.
Local SDXL-Turbo when VRAM is approved. Nano-banana only on explicit per-job request.

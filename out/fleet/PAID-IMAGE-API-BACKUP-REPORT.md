# Paid Image API Backup Report — VidiSmart / VidiFlow

**Purpose:** choose paid hosted image-generation APIs to keep as fallback for a local-first
RTX 4090 pipeline. Screening criterion #1 is **in-image text spelling accuracy**.
Secondary criteria: has a real callable API, real published pricing, batch/async support,
cost per image.

**Report date:** 2026-10-05
**Pricing provenance:** every figure below is either read from the vendor's own live pricing page
or their official docs (marked **[primary]**), or is a third-party measurement (marked
**[third-party]**). Anything I could not verify from a primary source is explicitly written
**unverified**. Vendor marketing claims are labelled as such and are NOT treated as evidence.

---

## 1. Headline finding

Two independent 2026 text-accuracy benchmarks were located and they agree on the top tier.
Both were run by third parties with different methods and different language mixes.

**IMG.LY GenAI Benchmark — "AI text rendering"** ([third-party], 23 models, 8 benchmarks,
3 seeds, 24 scored runs each; case and line breaks forgiven, points lost only to real character
errors): <https://img.ly/ai-benchmarks/findings/text-reliability/>

| # | Model | Text accuracy | IMG.LY $/img |
|---|-------|---------------|--------------|
| — | FLUX.2 [pro] | 5.00 / 5 | $0.030 |
| — | GPT Image 1.5 | 5.00 / 5 | $0.140 |
| — | GPT Image 2.5 Flare | 5.00 / 5 | $0.042 |
| — | GPT Image 2 | 5.00 / 5 | $0.155 |
| — | Grok Imagine Image 2.0 | 5.00 / 5 | $0.060 |
| — | Muse Image | 5.00 / 5 | $0.010 |
| — | Nano Banana Pro | 5.00 / 5 | $0.150 |
| — | Qwen Image 3.0 | 5.00 / 5 | $0.040 |
| — | Recraft V4.1 | 5.00 / 5 | $0.035 |
| 10 | Gemini 2.5 Flash Image | 4.96 / 5 | $0.040 |
| 11 | GPT Image 2.5 Sunburst | 4.96 / 5 | $0.036 |
| 12 | Nano Banana 2 | 4.96 / 5 | $0.080 |
| 20 | **Ideogram 3.0** | 4.71 / 5 | $0.060 |
| 23 | Stable Diffusion 1.5 | 1.17 / 5 | $0.002 |

Nine of 23 models rendered every required string in all 24 runs.

**SandBase — e-commerce poster exact-string test** ([third-party], 11 models, 5 prompts,
2 images each = 110 images, run 2026-10-03, graded by `gpt-6.1-sol` transcription then
human-checked): <https://blog.sandbase.ai/ai-image-text-rendering-benchmark-ecommerce-2026/>

| Model | Posters passing /10 | Strings /32 | Billed $/img | Median latency |
|---|---|---|---|---|
| GPT Image 2 | 10 | 32 | $0.15 | 106.9 s |
| GPT Image 2.5 Flare | 10 | 32 | $0.15 | 20.0 s |
| Nano Banana Pro | 10 | 32 | $0.078 | 24.0 s |
| Nano Banana 2 | 10 | 32 | $0.039 | 18.7 s |
| Seedream 5.0 Pro | 10 | 32 | $0.0675 | 30.3 s |
| **Qwen Image 3** | 10 | 32 | **$0.04** | 52.7 s |
| Wan 2.7 Pro | 10 | 32 | $0.075 | 16.2 s |
| FLUX.2 [max] | 6 | 24 | $0.07 | 21.4 s |
| FLUX.2 [pro] | 6 | 24 | $0.03 | 13.5 s |
| Midjourney v8.1 | 5 | 25 | $0.10 / request | 44.8 s |
| Ideogram 3 | 3 | 24 | $0.06 | — |

Three findings from SandBase that matter operationally:

- **Qwen Image 3 was the only model whose 10 transcriptions contained zero unrequested text.**
  For page/poster generation where invented copy is a defect, this is the single most useful
  behavioural signal in the whole report.
- FLUX.2 pro/max scored **0/4 on Chinese posters** — they scored English headlines, SKUs and
  prices at 6/6 but every Chinese poster failed on a malformed glyph. FLUX is an English-only
  text lane.
- Their vision-LLM grader agreed with human eyes on only 75 of 83 images; 13 of the 14 strings
  it wrongly passed were **Chinese text it silently "corrected"**. If you auto-verify CJK copy
  with a vision LLM, it will lie to you. Have a human check CJK.

### The headline caveat you should not skip

**Latin-script headline text is close to solved. CJK glyphs, small print and dense
infographic labels are not.** SandBase says this in plain words. So:

- If your VidiSmart pages are **English/Latin** → pay for accuracy at the top of the table and
  the problem largely disappears.
- If any page needs **CJK or diacritics** → the top tier still fails intermittently, and a
  human/OCR check is mandatory regardless of vendor. Budget for the review queue, not for the model.

---

## 2. Ranked shortlist — API-available options, by text accuracy

Ranked on the union of both benchmarks plus Artificial Analysis' dedicated Text Rendering
capability index.

### Rank 1 — OpenAI `gpt-image-2` (and `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`)

**Type (a): real API.** Images API + Responses API.
Source: <https://developers.openai.com/api/docs/pricing> and
<https://developers.openai.com/api/docs/guides/image-generation> **[primary, read live]**

Model ids currently published by OpenAI: `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`
(Sunburst = editing precision, Flare = fast high-quality everyday generation). `gpt-image-2`
is still listed and is the only image model listed under the Batch tab.

Token pricing per 1M tokens **[primary]**:

| Model | Modality | Standard input | Standard cached | Standard output | Batch input | Batch cached | Batch output |
|---|---|---|---|---|---|---|---|
| gpt-image-2.5-sunburst | Image | $8.00 | $2.00 | $30.00 | $4.00 | $1.00 | $15.00 |
| gpt-image-2.5-sunburst | Text | $5.00 | $1.25 | — | $2.50 | $0.625 | — |
| gpt-image-2.5-flare | Image | $8.00 | $2.00 | $30.00 | $4.00 | $1.00 | $15.00 |
| gpt-image-2.5-flare | Text | $5.00 | $1.25 | — | $2.50 | $0.625 | — |
| gpt-image-2 | Image | $8.00 | $2.00 | $30.00 | $4.00 | $1.00 | $15.00 |
| gpt-image-2 | Text | $5.00 | $1.25 | — | $2.50 | $0.625 | — |
| gpt-image-1.5 | Image | $8.00 | $2.00 | $32.00 | $4.00 | $1.00 | $16.00 |
| gpt-image-1-mini | Image | $2.50 | $0.25 | $8.00 | $1.25 | $0.13 | $4.00 |
| gpt-image-1 | Image | $10.00 | $2.50 | $40.00 | $5.00 | $1.25 | $20.00 |

**Batch is exactly 50% off** for the image models — confirmed on the live pricing page, which
carries an explicit `Batch` tab for the image generation section. That is the best bulk discount
in this entire report. OpenAI's own docs say "For image generation cost estimates, use the
calculator in the image generation guide" — i.e. **OpenAI does not publish a per-image price for
gpt-image-2**. Any per-image number below is derived.

Derived per-image figures (not OpenAI-published) — treat as planning estimates:
- Artificial Analysis lists GPT Image 2 (high) at **$211.0 / 1k images** and GPT Image 2.5 at
  **$210.7 / 1k** [third-party] <https://artificialanalysis.ai/image/leaderboard/text-to-image>
- IMG.LY measured **$0.155/img** for GPT Image 2 and **$0.042/img** for GPT Image 2.5 Flare
  [third-party] at their gateway rates.
- Legacy `gpt-image-1` did have a published per-image table (Low $0.011–$0.016, Medium
  $0.042–$0.063, High $0.167–$0.25 depending on size) on the legacy model page. Not current.

**Text accuracy:** #1 on Artificial Analysis' dedicated Text Rendering capability index —
"GPT Image 2 ranks #1 and Reve 2.1 is #2" — and AA notes text rendering has "one of the widest
quality gaps of any capability we measure, 178 Elo across the ten models."
[third-party, AA statement] 5.00/5 at IMG.LY. 10/10 including Chinese at SandBase.

**Batch/async:** ✅ Batch API, 50% discount, 24-hour window. Also supports streaming
(`partial_images`, 0–3 partials) and `n` images per request.

**Caveats:** org verification required before production on GPT Image models (OpenAI states this
in the guide). High-quality square is ~$0.15–0.21/image, the most expensive in the report. Cached
input rates for gpt-image-2/2.5 apply only to Responses-API-generated images.

---

### Rank 2 — Qwen Image 3.0 (`alibaba/qwen-image-3/text-to-image` on fal)

**Type (a): real API.** Best reached through fal.ai or Replicate; also listed by Together as
`Qwen/Qwen-Image-2.0` (different, older version).
Source: <https://fal.ai/models/alibaba/qwen-image-3/text-to-image> **[primary, read live]**

> "Your request will cost $0.04 per generated image at 1K resolution, and $0.075 per generated
> image at 2K resolution."

Together AI lists `Qwen/Qwen-Image-2.0` at $0.035+ **[primary]**,
<https://docs.together.ai/docs/serverless/models>. Note Together states prices for models billed
by `image` "are estimates, not rates. These models pass through the provider's own per-request
charge" — so Together's number is a pass-through estimate, not a Together rate.

**Text accuracy:** 5.00/5 at IMG.LY. 10/10 at SandBase. **Only model with zero invented extra
text.** AA overall Elo 1076 (`Qwen-Image-3.0`, $30/1k) and 1090 (`Qwen-Image-3.0-Pro`, $40/1k)
[third-party] — mid-table on *overall* quality, top-table on *text*.

**Batch/async:** ✅ fal's queue API (`fal.queue.submit` with webhook) is the documented
production pattern for long-running batches. SandBase's own model page notes "async execution."
Native output up to 2048×2048.

**Caveats:** Alibaba model, non-US vendor. Medians 52.7 s in SandBase — second slowest tested.
Qwen 3.0-Pro and Qwen 3.0 are distinct models/prices; Qwen-Image-2.1 has **no API available**
per AA.

---

### Rank 3 — Meta Muse Image (`muse-image-1.0`)

**Type (a): real API.** Meta Model API, public preview.
Source: <https://dev.meta.ai/docs/image-generation> and
<https://dev.meta.ai/products/meta-model-api> **[primary]**

> "Muse Image is billed at a flat **$0.01 per generated image**. The price is the same whether
> you set `reasoning_strength` to high or the model uses tools during generation, and a request
> that returns n images is billed for n images. You're billed only for images the model
> successfully generates and returns."

API shape: base URL `https://api.meta.ai/v1`, model `muse-image-1.0`,
`POST /v1/images/generations` and `/v1/images/edits` (OpenAI Images-API-compatible, so an
existing OpenAI SDK client works by pointing `base_url` at Meta), plus the Responses API for
multi-turn refinement. Search grounding is **included** in the $0.01 — no separate tool charge.
Output high-quality up to 1600 px.

**Text accuracy:** 5.00/5 at IMG.LY. AA overall Elo 1115 at **$10.0 / 1k images** [third-party] —
on the quality-vs-price Pareto frontier.

**Rate limit:** 150 requests/minute, per Meta docs. **No batch endpoint is documented** — use
concurrency, not batch. AA shows no "no API available" flag for Muse, so it is API-backed.

**Caveats:** Meta Model API is public preview; output caps at 1600 px, so it cannot cover
oversized jobs — which is exactly one of your stated fallback triggers. Least battle-tested of
the top three. This is the highest-upside / lowest-certainty pick in the report.

---

### Rank 4 — Grok Imagine Image 2.0 (`grok-imagine-image-2.0`) and `grok-imagine-image`

**Type (a): real API.** You already run this via `M:\code\VidiFlow\tools\vidiflow-image.py`.
Source: <https://docs.x.ai/developers/pricing> and
<https://docs.x.ai/developers/model-capabilities/imagine> **[primary, read live]**

Imagine pricing **[primary]**:

| Model | Cost |
|---|---|
| `grok-imagine-image` (1.0) | $0.02 / image |
| `grok-imagine-image-2.0` | $0.04 / image |
| `grok-imagine-image-quality` | $0.05 / image — **retires 2026-11-02** |

xAI's own pricing page also breaks `grok-imagine-image-2.0` down by resolution and quality
**[primary]**: media input $0.01/img for all rows; output — 1K Low $0.04, 1.5K Low $0.05,
2K Low $0.06, 1K Medium $0.06, 1.5K Medium $0.07, 2K Medium $0.08. `grok-imagine-image`
(1.0) is $0.02 at both 1K and 2K.

**Text accuracy:** 5.00/5 at IMG.LY. AA overall Elo 1155 — **#4 overall**, the highest-ranked
model in this report that is not GPT/Gemini, at $60.0/1k [third-party]. fal's hands-on review
found Grok Imagine "accurately rendered the menu and the shop sign" while "fail[ing] at text
rendering across the book stack" — i.e. good on headline/signage copy, weaker on dense book-spine
micro-text [third-party].

**Batch/async:** ⚠️ Partial. xAI has a Batch API, and its docs state image and video generation
**are supported but billed at standard rates — no discount** [primary]. Priority processing is
explicitly *not* supported for image generation. Up to 10 images per request; editing takes up to
5 reference images.

**Action item for your pipeline:** `grok-imagine-image-quality` retires **2026-11-02** and will be
served by `grok-imagine-image-2.0` with `quality=low` at a lower price. If your tool hardcodes
that slug, pin `grok-imagine-image-2.0` now. Separately, xAI's 1.0 model dropped to Elo 1019
($20/1k) — 2.0 is the better value despite costing 2×.

---

### Rank 5 — Google Nano Banana Pro (`gemini-3-pro-image`) / Nano Banana 2 (`gemini-3.1-flash-image`)

**Type (a): real API.** Gemini Developer API.
Source: <https://ai.google.dev/gemini-api/docs/pricing> **[primary, read live]**

| Model | Input /1M | Text+thinking out /1M | Image out /1M | Per image (Standard) | Per image (Batch) |
|---|---|---|---|---|---|
| Gemini 3 Pro Image (Nano Banana Pro) | $2.00 | $12.00 | $120.00 | **$0.134** per 1K/2K; **$0.24** per 4K | half |
| Gemini 3.1 Flash Image (Nano Banana 2) | $0.50 | $3.00 | $60.00 | **$0.067** per 1K; $0.101 per 2K; $0.151 per 4K; $0.045 per 0.5K | **$0.034** per 1K; $0.050 per 2K; $0.076 per 4K; $0.022 per 0.5K |
| Gemini 3.1 Flash Lite Image (NB2 Lite) | $0.25 | $1.50 | $30.00 | **$0.0336** per 1K | $0.0168 per 1K |
| Gemini 2.5 Flash Image (Nano Banana) | $0.30 | — | $30.00 | **$0.039** (1K) | — |

**No free tier exists for any Gemini image model** — Google's pricing page shows
"Not available" across the Free Tier column [primary].

**Batch/async:** ✅ Batch API at **50% off** standard, 24-hour target turnaround, JSONL input up
to 2 GB, and Google's docs explicitly document "Generating images in batch" for Nano Banana
[<https://ai.google.dev/gemini-api/docs/batch-api> **[primary]**]. Note: on Vertex/Gemini Enterprise,
batch inference "is limited to the default 1K resolution. 2K and 4K outputs are not supported"
**[primary]** — check which surface you're on.

**Text accuracy — read this carefully.** Both benchmarks put Nano Banana in the passing tier
(10/10 at SandBase, 4.96–5.00 at IMG.LY), and AA ranks Nano Banana 2 #6 overall and the "best
value in the top 3" on text rendering at $67/1k vs GPT Image 2's $211.

**But your reported experience is the opposite**, and the honest reading is that the two things
can both be true. Both SandBase prompts were short, quoted, single-string headlines with an
explicit "Render the text exactly as written" instruction. Real page copy is longer,
multi-line, mixed-weight and unquoted — the failure mode the benchmarks did not test. SandBase
also notes Nano Banana 2 "drew both P2 posters as framed mockups on a gray background, not flat
artwork," which is a layout-compliance miss you would hit constantly on page generation. So:
keep Nano Banana as a **creative/illustration fallback**, not as your typography lane, until you
have run your own prompts through it.

---

### Rank 6 — Black Forest Labs FLUX.2 (pro / max / flex) and FLUX 3 Image

**Type (a): real API.** Async submit-then-poll.
Source: <https://bfl.ai/pricing> **[primary, read live]** and
<https://docs.bfl.ml/quick_start/pricing.md> **[primary]**

1 credit = $0.01 USD. FLUX.2 uses megapixel-based pricing; cost scales with output resolution.

FLUX.2, from-price per image **[primary]**:

| Model | Text-to-image | Image editing | BFL's stated best-for |
|---|---|---|---|
| FLUX.2 [klein] 4B | from $0.014 | from $0.014 | Real-time, high volume |
| FLUX.2 [klein] 9B | from $0.015 | from $0.015 | Balanced quality/speed |
| FLUX.2 [pro] | from $0.03 | from $0.045 | Production workflows |
| FLUX.2 [max] | from $0.07 | from $0.07 | Highest quality, grounding search |
| FLUX.2 [flex] | from $0.05 | from $0.05 | "Fine-grained control, **typography**" |
| FLUX.2 [dev] | **local only** | local only | Open weights, non-commercial, **no hosted API** |

Klein detail **[primary]**: first megapixel is a flat rate, each additional MP adds.
A 2 MP image on Klein 4B = $0.014 + $0.001 = $0.015.

FLUX 3 Image, per image by resolution tier — **currently 50% off list** under a launch offer
running 2026-10-01 08:00 PT to **2026-10-08 08:00 PT**, after which list prices apply **[primary]**:

| Tier | List | Through 2026-10-08 |
|---|---|---|
| 768×768 (~0.6 MP) | $0.041 | $0.0205 |
| 1K (~1 MP) | $0.048 | $0.024 |
| 1.5K (~2 MP) | $0.07 | $0.035 |
| 2K (~4 MP) | $0.10 | $0.05 |
| 4K (~16 MP) | $0.607 | $0.3035 |

Rejected/failed/moderation-withheld generations are **not charged** [primary]. Reference images
and prompts are included at no extra charge, up to 16 MP of references.

**Batch:** ⚠️ BFL's "Batch Pricing" docs say batch requests **multiply the base cost by the number
of images — i.e. no discount** [primary]. Useful for throughput, useless for unit economics.
Concurrency cap: **24 active tasks** [primary]. Async design: POST returns `id` + `polling_url`;
must poll the returned `polling_url` when using `api.bfl.ai` [primary].

**Text accuracy — and a contradiction you should know about.** BFL's own help centre markets
FLUX.2 [flex] as "Best text rendering" [primary, **vendor claim**]. The independent evidence does
not support using FLUX for typography: SandBase gave FLUX.2 pro and max **6/10 posters and 0/4
on Chinese**, with malformed glyphs in every failing case. IMG.LY ranked FLUX.2 [pro] #1 of 23 —
but that suite forgives case and line breaks and its composition is Latin-focused. **Resolve it
yourself: treat FLUX as an English-only text lane and validate on your own copy before trusting it.**

---

### Rank 7 — Ideogram 4.0 / 4.5 (`/v2/image/generate/ideogram-4-5`)

**Type (a): real API**, v2 REST at `POST /v2/{content}/{action}/{model}`.

⚠️ **Official Ideogram API pricing could not be verified.** <https://ideogram.ai/pricing/?pricing_tab=api>
loads its price table via a client-side fetch that stayed on "Loading current pricing." in a live
browser session with fetch/XHR hooked — the table is not in the served HTML and the data call did
not fire. I am not going to guess it.

Reported figures, all **[unverified — third-party]**:
- ideogram.ai pricing page (plans tab, which did load): Plus $15/mo annual, Pro $42/mo annual,
  Team $20/user/mo annual — these are **app subscriptions, separate from API billing**.
- Third-party: v3/v4.0 tiers at $0.03 (Turbo) / $0.06 (Default) / $0.09–0.10 (Quality) per image;
  4.5 launch (2026-09-30) reported at four quality modes spanning **$0.008–$0.22** per image,
  text-to-image $0.10 at the High tier.
- fal's Ideogram v4 endpoint: sources **conflict** — fal's own `/models/ideogram/v4` page states
  $0.0075/MP Turbo, $0.015/MP Balanced, $0.025/MP Quality, but fal's marketing pages state
  $0.03/$0.06/$0.10 **per MP**. I could not load the live model page to adjudicate (fal gates
  model pricing behind sign-in). **Unverified.**

**Text accuracy — the regression is the story.** Ideogram's own model card claims **0.97 on the
X-Omni English OCR benchmark** and ~97% on large English text, ~90% on small English text, with
the rule to keep each quoted string to 5–7 words [vendor marketing claim]. Against that:
IMG.LY put **Ideogram 3.0 at #20 of 23** (4.71/5) — "the reputation check: Ideogram, the model
known for text rendering, lands at #20 of 23 here. The general flagships have absorbed the lead
that made text specialists special." SandBase put **Ideogram 3 at 3/10**, the worst of the eleven
tested, failing every Chinese poster. AA overall Elo: Ideogram 4.5 (High) 1013, Ideogram 4.0
(Quality) 1011, Ideogram 4.0 1004 — all below FLUX.2 [pro] at 1004 and far below GPT Image 2.5
at 1197. Independent typography analysis also flags Ideogram 4 as **weak on diacritics and
non-Latin scripts** [third-party].

**Verdict:** Ideogram's typography moat is gone in 2026. Its real remaining differentiators are
JSON layout control with bounding boxes and hex palettes, and a `layerize` endpoint that splits
graphics into editable text layers. That last one is genuinely interesting for your use case —
but at $0.09–0.10/image you can composite real text layers yourself for free. **Do not keep
Ideogram as a paid backup on text-accuracy grounds.**

---

### Rank 8 — Microsoft MAI-Image-2.6 / 2.6-Flash

**Type (a): real API** (Azure AI Foundry, public preview).

Token pricing **[primary]**, from the Azure AI Foundry blog:
MAI-Image-2.6 — $5/1M text input, $8/1M image input, **$38/1M image output**.
MAI-Image-2.6-Flash — $1.75 / $2.50 / **$19** per 1M.
AA representative API prices [third-party]: $38.9/1k and $19.5/1k respectively.

**Text accuracy:** AA overall Elo 1151 (#5) for 2.6, 1106 (#9) for Flash — genuinely competitive.
Not present in either text-specific benchmark I found. Note: **MAI models require the raw REST
call against Foundry's `/mai/v1/images/generations` endpoint — they are not compatible with the
`Azure.AI.OpenAI` SDK's `ImageClient`** [third-party], and documented constraints include
**English only** and a max of 1,048,576 pixels [third-party].

**Verdict:** strong Elo, cheap Flash tier, real API — but zero independent text-accuracy evidence
and awkward SDK integration. Worth one probe if you want a fourth lane, not worth a standing
subscription.

---

## 3. Type (b): subscription-only, no usable API — do not plan around these

| Provider | Status |
|---|---|
| **Midjourney v8.1/v8.2** | **No official API.** No developer console, no SDK, no published per-image rate card; subscription only (Basic/Standard/Pro/Mega). Anything sold as a "Midjourney API" is a third party automating Discord/web accounts, which Midjourney's terms prohibit, with real ban risk. Multiple independent 2026 sources agree. |
| ChatGPT / Gemini web apps | Not APIs. Free-tier image generation in the Gemini *app* does not exist on the *API* — Google explicitly requires paid Cloud billing. |
| Ideogram/Recraft app plans | App credit subscriptions are billed **separately** from the API; using the API from a free app account is explicitly allowed by Ideogram, but the credits don't transfer. |

**Midjourney's text, for the record:** 5/10 at SandBase (failed the mixed list, SKU hyphens and
one price label); AA describes v8.1 text rendering as "improved much from v7 but doesn't approach
GPT Image 2 or Ideogram 3.0." AA lists no API price for it. Not viable for you.

## 4. Type (c): require your own GPU — out of scope for paid backup

FLUX.2 [dev] is **not hosted by BFL** ("Local only… open weights, non-commercial, no hosted API"
**[primary]**) — BFL will sell you weights and a licence, not inference. FLUX.1 [schnell] and
FLUX.2 [klein] 4B (Apache 2.0, 4B) are genuinely runnable on your 4090 and are the obvious
local tier. Everything else in this report is cloud.

## 5. Aggregators — what they actually change

Aggregators do not improve text accuracy; they change **billing shape, failover and queueing**.
Two are worth your attention, and both list `image`-billed models as **pass-through estimates
rather than their own rates** (Together says so explicitly [primary]) — so your invoice follows
the upstream model, and you are paying the aggregator's endpoint markup on top.

**fal.ai** — <https://fal.ai/pricing> **[primary, read live]**. Live image-model table:

| Model (endpoint) | Unit | Price |
|---|---|---|
| `fal-ai/nano-banana-2` | images | $0.08 |
| `fal-ai/nano-banana-2/edit` | images | $0.08 |
| `openai/gpt-image-2` | units | $1 (placeholder — real cost is per-token upstream) |
| `fal-ai/nano-banana-pro` | images | $0.15 |
| `fal-ai/nano-banana` | images | $0.0398 |
| `fal-ai/z-image/turbo` | megapixels | $0.005 |
| `fal-ai/flux/schnell` | megapixels | $0.003 |

Documented production pattern for long-running batches is `fal.queue.submit` + webhook. Also
offers BYOK (pass your own `openai_api_key`) so GPT Image 2 traffic bills to your OpenAI account
rather than through fal.

**Together AI** — <https://docs.together.ai/docs/serverless/models> **[primary]**. Live image
table: `google/flash-image-2.5` $0.039+, `google/gemini-3-pro-image` $0.134 at 1K/2K,
`openai/gpt-image-2` $0.053+, `openai/gpt-image-1.5` $0.034+, `Qwen/Qwen-Image-2.0` $0.035+,
`ideogram/ideogram-4.0` $0.06+, `ideogram/ideogram-3.0` $0.06+,
`black-forest-labs/FLUX.1.1-pro` $0.04/megapixel, `prunaai/p-image-ideogram` $0.00225+.
Together's per-megapixel formula: at $0.04/MP a 1024×1024 (1.05 MP) image ≈ $0.042, a
4096×4096 (16.8 MP) ≈ $0.67.

**Replicate** — <https://replicate.com/pricing> **[primary, via search snippet]**:
`black-forest-labs/flux-1.1-pro` $0.04/image, `black-forest-labs/flux-dev` $0.025/image,
`black-forest-labs/flux-schnell` $3.00/1k output images. Hardware-time billing for most models.
Good cheap drafts; its FLUX text accuracy is the weak link, not its price.

**Segmind / Stability API** — not evaluated; Stability's SDXL-class models are not
typography-grade and did not place in either text benchmark. Treat as irrelevant to this
decision unless you need an on-prem licence.

---

## 6. Recommendation — the 2–3 to keep

Your constraints, restated: local 4090 is the default lane; paid APIs are the fallback when
local fails or the job exceeds 24 GB; **in-image spelling accuracy is the #1 screen**; you want
real APIs; you are already spending on xAI.

### 1. `gpt-image-2` via OpenAI Batch — the correctness lane ✅ KEEP

**Why:** the only model that is #1 on a dedicated text-rendering leaderboard *and* 10/10 on a
test that included Chinese *and* has a real, documented 50% batch discount. Artificial Analysis:
"GPT Image 2 is #1 on every use case and capability leaderboard." AA also measured text rendering
as the widest capability spread of anything they test (178 Elo across 10 models) — this is
precisely the axis you care about, and OpenAI owns the top of it.

**How to wire it:** route all bulk page rendering through `/v1/batch` on `gpt-image-2` at $15/1M
image output tokens — half the standard rate. Use `gpt-image-2.5-flare` interactively for
single images when you need speed (IMG.LY measured it at 5.00/5 with a 20 s median vs GPT
Image 2's 107 s). Keep Sunburst in reserve for edits where pixel preservation matters.

**Cost reality:** ~$0.15–0.21/image at high quality standard, **~$0.08–0.11 on Batch**. This is
the expensive one. It is expensive *because* it is the one that doesn't make you check the
spelling twice.

### 2. `alibaba/qwen-image-3/text-to-image` via fal — the value lane ✅ KEEP

**Why:** 5.00/5 on text accuracy and 10/10 on the poster test at **$0.04/image at 1K**, roughly
4× cheaper than GPT Image 2. And the behavioural differentiator: **it was the only model that
invented zero extra text.** On generated pages, unsolicited copy is a defect you will have to
detect and delete; Qwen makes that structurally less likely. It also natively does 2K at
$0.075.

**How to wire it:** fal queue API with webhook for async fan-out, so a 200-page batch doesn't
sit in a request timeout. This should be your *default* paid lane — spend GPT Image tokens only
on pages where a typo would actually ship.

### 3. `muse-image-1.0` via Meta Model API — the cheap lane, on a short leash ✅ KEEP, PROVE IT FIRST

**Why:** **$0.01 per image** — a tenth of Qwen, a fiftieth of GPT Image 2 — and it still scored
5.00/5 on IMG.LY and sits on AA's quality-vs-price Pareto at $10/1k. Search grounding is
included at no extra cost. The endpoint is OpenAI Images-API-compatible, so it drops into an
existing client with a changed `base_url`.

**Why it's third and conditional:** no documented batch endpoint (150 req/min instead), output
caps at 1600 px so it **cannot** cover your oversized-job trigger, and Meta Model API is still
public preview. Run your own VidiSmart copy through it before you trust it.

### Also keep, but demote

- **`grok-imagine-image-2.0` ($0.04–$0.08)** — you already pay xAI, it's AA #4 overall, and it's
  5.00/5 on text. Keep it as a fast/creative lane and as vendor diversity (you then have three
  unrelated suppliers: OpenAI, Alibaba-via-fal, xAI). **Two concrete actions:** pin
  `grok-imagine-image-2.0` in `vidiflow-image.py` before `grok-imagine-image-quality` retires on
  **2026-11-02**; and note xAI gives **no batch discount on images**, so it is not your bulk lane.
- **Nano Banana Pro ($0.134) / Nano Banana 2 ($0.067)** — keep a key, route non-typography and
  illustration work there, and use the 50% Batch discount for bulk. Do **not** route your headline
  copy through it until you have measured your own prompts — the benchmarks used short quoted
  strings and your complaint is about longer page copy.

### Do not keep

- **FLUX.2** — 0/4 on Chinese, 6/10 overall on the poster test, and BFL's batch gives no discount.
  Cheap ($0.03/MP) and great for English-only *illustration*, but it fails the screen.
- **Ideogram** — #20/23 and 3/10 on text despite the 0.97 marketing number; official API price
  unverifiable; $0.09–0.10/image. The `layerize` idea is worth reimplementing locally, the API is not
  worth buying.
- **Midjourney** — no API. Full stop.

---

## 7. Suggested routing logic

```
local 4090 (default, $0)
  ├─ success + OCR/text check passes → ship
  └─ fail / >24 GB / text check fails
        ├─ non-typography, fast draft ........ muse-image-1.0        $0.010
        ├─ page with Latin-script copy ...... Qwen Image 3 (fal)     $0.040 @1K
        ├─ page with CJK / high-stakes copy . gpt-image-2 (Batch)   ~$0.08–0.11
        └─ creative / art-directed .......... Nano Banana Pro         $0.134  (or grok-imagine-image-2.0 $0.04)
```

Add a **human/OCR verification gate before any page with text ships.** Both benchmarks make the
same point: the models are close, and the errors that remain are exactly the ones that are
invisible unless someone looks. SandBase's vision-LLM grader silently "corrected" 14 Chinese
strings. If your pages are English-only you can automate the check; if any page carries CJK, a
person has to read it.

## 8. What I could not verify

- **Ideogram's official API price table** — client-side loaded, never rendered in a live browser
  session with fetch/XHR instrumented. All Ideogram API prices in this report are **unverified
  third-party**, and fal's own figures for Ideogram v4 conflict by ~4× depending on page.
- **OpenAI does not publish per-image pricing** for `gpt-image-2`; every per-image number for it
  here is derived from token rates (mine or third-party's).
- **Azure AI Foundry's own pricing page** for MAI-Image-2.6 lists the meters as unavailable (`$`);
  the token rates above come from Microsoft's Foundry blog post, and the per-image figures are
  Artificial Analysis's.
- **No independent text-accuracy benchmark** was found covering MAI-Image-2.6, Reve 2.1, Krea 2 or
  Seedream 5.0 Pro beyond SandBase. Their Elo is overall quality, which is not the same axis.
- **2026 Elo figures drift.** The AA leaderboard read on 2026-10-05 has GPT Image 2 (high) at 1172;
  fal's guide quotes 1,339 "as of June 2nd, 2026" against an older board version. Re-check
  before you commit spend.

## 9. Sources

Primary, read live on 2026-10-05:
- <https://bfl.ai/pricing>, <https://docs.bfl.ml/quick_start/pricing.md>, <https://docs.bfl.ml/quick_start/generating_images>, <https://help.bfl.ai/articles/7424166364-wip-welcome-to-the-forest>
- <https://developers.openai.com/api/docs/pricing>, <https://developers.openai.com/api/docs/guides/image-generation>
- <https://ai.google.dev/gemini-api/docs/pricing>, <https://ai.google.dev/gemini-api/docs/batch-api>, <https://ai.google.dev/gemini-api/docs/optimization>
- <https://docs.x.ai/developers/pricing>, <https://docs.x.ai/developers/model-capabilities/imagine>, <https://docs.x.ai/developers/release-notes>
- <https://fal.ai/pricing>, <https://fal.ai/models/alibaba/qwen-image-3/text-to-image>
- <https://docs.together.ai/docs/serverless/models>
- <https://dev.meta.ai/docs/image-generation>, <https://dev.meta.ai/docs/pricing-rate-limits>, <https://dev.meta.ai/products/meta-model-api>
- <https://replicate.com/pricing>
- <https://developer.ideogram.ai/ideogram-api/api-overview>, <https://ideogram.ai/pricing/>
- <https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/mai-image-2-6-and-mai-image-2-6-flash-quality-and-speed-at-production-scale/4550970>

Third-party benchmarks and analysis:
- <https://img.ly/ai-benchmarks/findings/text-reliability/>
- <https://blog.sandbase.ai/ai-image-text-rendering-benchmark-ecommerce-2026/>
- <https://artificialanalysis.ai/image/leaderboard/text-to-image>
- Artificial Analysis on X, Text Rendering capability announcement: <https://x.com/ArtificialAnlys/status/2085774173599912194>
- <https://fal.ai/learn/tools/best-text-to-image-apis-2026>
- Midjourney API status (no official API): <https://www.aifreeapi.com/en/posts/midjourney-api-guide>

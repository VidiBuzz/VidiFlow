# Video Editor Assessment for Smart Channel CX

**Assessed:** 2026-10-05 · **Author:** research subagent · **For:** James (Smart Channel CX)

> **Headline answer:** Use **Remotion** (or its Apache-2.0 clone **HyperFrames**) as the
> timeline/render layer, and keep **video generation completely separate** — a generation
> service (9Miho or ComfyUI/hosted) that emits *media files*, which the timeline layer
> composes. Of your three named candidates, **9Miho is genuinely usable as a generation
> layer today but is the wrong tool as the timeline/render layer**; **OpenShot is a poor
> fit**; **"Emotion" does not appear to exist** as a live product.
>
> One important correction to your prior notes: 9Miho **is** a real video editor with a
> real ffmpeg renderer — but **it cannot render on this machine as currently installed**,
> and the cause is fixable. Details below, with the fix.

---

## 1. Executive summary (the decision)

| Layer | What it does | Winner | Why |
|---|---|---|---|
| **Generation** (make raw clips/assets) | text→video, image→video, TTS, stills | **9Miho** (now) → ComfyUI/Wan when GPU-bound | You already run it; it has provider plumbing + spend tracking |
| **Timeline + assembly + render** (the "editor") | compose N personalised variants on an editable timeline, render per customer | **Remotion** (primary) / **HyperFrames** (Apache-2.0 alternative) | Only real per-recipient batch story: React/HTML composition + `inputProps` + headless render |
| **Delivery** | hand MP4 + thumbnail to VidiBlast | VidiBlast | Email is not a video container — see §4 |

**Do NOT use one tool for both.** Generation models are stochastic, slow, and change
under you; the timeline must be deterministic, versioned, and re-renderable 10,000 times
without re-prompting anything. See §2.

---

## 2. Architecture recommendation — and the core answer to "same tool or different tools?"

### They should be **different tools**. Decisively.

A generation tool and a timeline are solving opposite problems:

- **Generation is stochastic and expensive.** Wan/LTX/Hunyuan take 30s–minutes per clip on
  GPU. Re-prompting per customer is unscalable and non-reproducible — the same customer
  could get a different video if you re-ran the job.
- **A timeline is deterministic and cheap.** You render the *same* composition N times with
  different `inputProps` (name, offer, city, CTA). Cost is CPU/encode, not inference.
- **Blurring them couples your render loop to model drift.** If Wan 2.2 gets superseded,
  every "video" you ever sent becomes unreproducible, and your bug reports become
  "the model changed."
- **Blurring them wrecks caching.** 95%+ of a personalised video is identical. You want to
  render the shared 95% once and swap only the per-recipient 10%.

### Recommended split

```
┌─ GENERATION (slow, stochastic, cacheable) ──────────────────┐
│  9Miho /api/storyteller/projects/{slug}/compile/{image,video,dialogue-audio}
│  ComfyUI + Wan 2.2 (Apache-2.0) for bulk T2V/I2V          │
│  → emits MP4/WebP/WAV files + a manifest                   │
└───────────────────────────┬────────────────────────────────┘
                            │  media files on disk/S3
                            ▼
┌─ TIMELINE + RENDER (fast, deterministic, pure function) ───┐
│  Remotion composition  <CustomerVideo/>                    │
│    inputProps = { name, city, offer, headline, cta, bg }   │
│  renderMedia({ composition, inputProps, codec:'h264' })    │
│  → out.mp4  +  poster.jpg (first frame)                   │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌─ DELIVERY ────────────────────────────────────────────────┐
│  VidiBlast: sends email w/ <video poster + play overlay>  │
│            hyperlinked to hosted MP4 landing page           │
└────────────────────────────────────────────────────────────┘
```

**Where Remotion's role sits:** Remotion *is* the timeline layer. It is not an editor UI
you drop in — it is a React component you author. The "editable timeline" is your React
tree + props; `npx remotion studio` gives your team a live preview/preview-UI to tweak it.
Per-customer variation is `inputProps`, which is exactly the feature Shotstack-style APIs
sell, except Remotion gives you full React, real keyframes, and `OffthreadVideo`/`Audio`
against arbitrary sources instead of a constrained JSON schema.

**Why generation stays outside:** Remotion can *embed* generated video, but it must never
*generate* it. Keep generation behind a caching asset service so the render layer can be
re-run on a laptop for a QA check.

### Cost of this design (the honest number)

- Remotion license: free up to 3 people; **Remotion for Automators = $0.01/render,
  $100/mo minimum** — this is *exactly* your "build video editors / prompt-to-video apps"
  case, so budget from the first render, not the fourth employee.
  - 10,000 personalised videos/mo = **$100/mo** license + AWS.
  - A 30s video at ~15x realtime on this box renders in ~2s; at Lambda scale Remotion
    quotes **from $0.01/min of video** compute (excluding S3/egress).
- Generation is your dominant variable cost, and it is why caching generated clips matters
  more than shaving render milliseconds.

---

## 3. Comparison table

Verified 2026-10-05. "Headless" = real programmatic render without a GUI. "Per-customer"
= designed for many renders differing only by data.

| Product | Category | Open? | License | Real API? | Headless / scriptable | Per-customer batch | Cost model | Maintenance (verified date) |
|---|---|---|---|---|---|---|---|---|
| **Remotion** | Timeline/assembly (code) | Source-available, **not** OSI OSS | Remotion License (Free ≤3 people; Automators **$0.01/render, $100/mo min**; Enterprise $500/mo min) | Yes — HTTP API + `@remotion/renderer` Node API + CLI | **Yes** — `renderMedia()`, `bundle()`, `selectComposition()` | **Yes — the reference implementation** (`inputProps`) | Per-render + AWS | **Active.** v4.0.533 (2026-10-05); 62,040★; pushed 2026-10-05 |
| **HyperFrames** (HeyGen) | Timeline/assembly (HTML/CSS) | **Yes** | **Apache-2.0** | Yes — CLI + packages + Studio editor | **Yes** — `hyperframes render`; Puppeteer+FFmpeg engine | Yes (HTML attrs + vars) | **Free at any headcount** (local render free) | **Very active.** v0.8.134 (2026-10-05); 57,313★; pushed 2026-10-05 |
| **9Miho** (Kumiho) | **Both**: generation graph + timeline + ffmpeg render | **Proprietary/closed** binary (Nuitka onefile, v0.22.6) | Proprietary EULA (`/api/settings/eula`, v1.0, unaccepted on this install) | **Yes — 158 OpenAPI paths**, full FastAPI | Yes — `POST /api/timelines/movie-exports` | **Yes in principle** — measured **15.3× realtime**, 0.26s per 4s vertical clip | EULA + provider API spend (`/api/spend/*`, `/api/spend/estimate`) | Active but **pre-release-ish**: v0.22.6, closed binary, no public 9Miho page (404) |
| **OpenShot** | NLE (desktop GUI) | **Yes** | openshot-qt GPL-ish repo (NOASSERTION); **libopenshot-audio LGPL-3.0** | **Weak** — no HTTP API; only SWIG bindings (Python/C++/Ruby) | **Awkward** — Python bindings exist but you drive a Qt app's object model; `openshot-qt` CLI is not a render API | Not designed for it; no `inputProps` concept | Free (donateware) | **Active.** v4.0.1 (2026-09-27); daily builds 2026-10-04; 6,594★ |
| **Shotstack** | Timeline assembly (JSON API) | Closed SaaS | Proprietary | **Yes — REST, first-class** | **Yes — hosted** | **Yes — designed for it** | ~$0.20–0.30/min 1080p; $39/mo for 200 credits | Active commercial vendor |
| **Creatomate** | Template + timeline (JSON API) | Closed SaaS | Proprietary | **Yes — REST** | Yes — hosted | Yes (template slots) | ~$0.84/min 1080p (pixel-metered); $54/mo Essential | Active commercial vendor |
| **JSON2Video** | Scene assembly (JSON API) | Closed SaaS | Proprietary | Yes — REST (Node/PHP SDKs) | Yes — hosted | Yes | ~$0.25/min; Hobby $16.95/mo | Active |
| **FFmpeg + timeline lib** (raw) | Timeline assembly (DIY) | Yes | LGPL/GPL per lib | n/a (you write it) | **Yes — fully** | Yes, but **you own every bug** | Free; CPU cost only | Depends on your code |
| **Motion Canvas / Revideo** | Timeline (TS animation) | **Yes** | **MIT** | Library API | Yes | Yes | Free | Active; Motion Canvas 19,133★ (last commit 2026-07-02) |
| **ComfyUI + Wan 2.2 / LTX-2 / HunyuanVideo 1.5** | **Generation only** | Yes | **Wan 2.2 = Apache-2.0**; LTX-2 = revenue gate at **$10M**; HunyuanVideo = Tencent licence, **void in EU/UK/South Korea** | Yes — local HTTP/WS API | Yes | Generation is *slow*; needs your own cache | Free; GPU-time | Very active; ComfyUI 136,203★, pushed 2026-10-05 |

### Sources for the above
- Remotion license text: `raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md` (read 2026-10-05) + `remotion.dev/docs/terms`, `/docs/license/pricing`, `/docs/license/faq` (page "Last updated Oct 5, 2026").
- HyperFrames: `github.com/heygen-com/hyperframes` — `LICENSE` = Apache 2.0; `@hyperframes/cli` 0.8.134.
- OpenShot: `openshot.org/blog` (4.0.1, 2026-09-27), `/files/user-guide/developers.html`, `/download/` (daily builds 2026-10-04).
- Pricing for the three SaaS APIs: Renderly's 2026 comparison (data checked August 2026) cross-referenced with Plainly's 2026 API roundup.
- Model licences: ComfyUI/Wan docs, `Wan-Video/Wan2.2`, `Lightricks/LTX-2` LICENSE, `Tencent-Hunyuan/HunyuanVideo-1.5`.

---

## 4. Your three named candidates, ranked — with the honest verdict

### 1st place: **Remotion** (not on your list, but it's the answer)

The only option here where "make 10,000 videos that differ by a few fields" is a
*designed-in* feature rather than a workaround. `inputProps` → `renderMedia()` is a
one-liner. Mature, enormous ecosystem, 62k stars, released today.

**The catch you must price in:** it is **not open source**. `LICENSE.md` is explicit, and
at 4+ people a Company License is mandatory. For an automation product that is
**"Remotion for Automators", $0.01 per render, $100/mo minimum** — cheap and predictable,
but it is a real line item and it is triggered by *your* volume, not your headcount.

### 2nd place: **HyperFrames** — the licence escape hatch

Same category as Remotion, **Apache-2.0**, zero per-render fee, zero headcount threshold,
released by HeyGen (who use it as their own render core), 57k stars, commits today.
Compositions are plain HTML with `data-start` / `data-duration` / `data-track-index`, which
is arguably a *better* authoring surface for per-recipient templating than JSX. Ships
`@hyperframes/aws-lambda` for distributed renders.

**Why it is 2nd and not 1st:** it is younger (repo created 2026-03-10), the ecosystem and
talent pool are thinner, and Remotion's `OffthreadVideo` + Lambda story is more battle-tested.

**But:** if licensing is a procurement problem for you, HyperFrames beats Remotion outright.
Keep both in the bake-off.

### 3rd place: **9Miho** — real, and *not* what you assumed, but wrong for this job

This is the most interesting result of the assessment, so here is the evidence.

**What it actually is** (from the local install — the public site has no 9Miho page:
`kumiho.io/en/9miho` returns **404**; kumiho.io describes it only as "coming"). Per
`manifest.json`: `io.kumiho.9miho.prebuild/v1`, **v0.22.6**, Nuitka onefile 79 MB,
proprietary packages `miho_server/engine/compiler/providers/mcp/localsvc`, API on port 9999,
commit `89bde136`. It is a **closed-source creative-production suite** from Kumiho: a
graph/catalog engine, an assets system, "storyteller" agents, and — contradicting prior
notes — **a genuine video timeline and renderer**.

**It is a real video editor.** Verified live against `http://127.0.0.1:9999/openapi.json`
(**158 paths**):
- `POST /api/timelines` — *Save Cut*
- `GET /api/timelines/{kref}` — *Load Cut*
- `POST /api/timelines/export` — *Export Cut* → writes **OpenTimelineIO** `timeline.otio`
  (+ `manifest.json`, ASC CDL `.ccc`, CMX3600 `.edl` when graded)
- `POST /api/timelines/movie-exports` — *Export Movie* → real flattened ffmpeg render
- `GET /api/timelines/movie-exports/support` returned, on this machine:
  `{"ffmpeg":"n9.0.1-...","ocio":true,"ocio_mode":"client_lut_bake_v1","presets":["h264_review","prores_422_hq","dnxhr_hqx"]}`

**I rendered a real video with it, headlessly, via HTTP.** Two 2s vertical clips registered
as Kumiho assets (`kref://9miho/assets/clip_a.video_ref?r=1`), then:

```
POST /api/timelines/movie-exports
→ 200 {"path":"...\\.miho\\movie-exports\\smcx_probe_ff8_ok-1.mp4","preset":"h264_review",
       "colour_mode":"bypass","frame_count":100,"width":480,"height":854,"fps_num":25}
```
`ffprobe` on that file: **h264 / aac, 480×854, 25 fps, 4.000 s, 9,142 bytes**. And OTIO
export returned a 4,144-byte `timeline.otio` plus manifest. So: multi-track assembly,
reel bundling, OCIO colour pipeline, ProRes/DNxHR mezzanines — all real.

**Throughput:** 5 sequential renders averaged **0.26 s for a 4 s 480×854 clip = 15.3×
realtime**. Batch-per-customer is genuinely viable.

#### 🔴 The blocker you must know about

**9Miho cannot render video on this machine as installed today.** Every render 422s with:

```
ffmpeg exited 2880417800 ... Unrecognized option 'filter_complex_script'.
```

Root cause, confirmed independently: **9Miho v0.22.6 emits `-filter_complex_script`, which
FFmpeg 9.0 hard-removed** (removed along with `-vsync`, `-top`, `-qphist`,
`-adrift_threshold` in the 9.0 "Lei" release, 2026-08-03; the replacement is the generic
`-/filter_complex file.txt`). The ffmpeg on PATH here is
`n9.0.1-11-ge47273f4d9-20260831` — and I reproduced the exact error by hand.

**Fix, verified:** I put FFmpeg **8.1.2** first on the 9Miho process's PATH. `/api/timelines/export/support`
switched to `{"ffmpeg":"8.1.2-essentials_build-www.gyan.dev"}` and the identical request
returned **200** with a valid MP4. Note MSYS/bash `PATH` tricks do **not** work here
(9Miho ignores the mangled MSYS path) — you must launch it with a Windows-style PATH from
Python/Node/Codex, or better, pin the ffmpeg it resolves.

> **This is the single most important operational finding.** 9Miho's *renderer* is fine; its
> *ffmpeg dependency pin is stale by one major version*. Until the vendor ships an FFmpeg 9
> fix (or you pin 8.x for it), **do not put a production render path on 9Miho**.

**Why it's still the wrong timeline layer even when fixed:**
1. **Proprietary, closed binary.** No source, version-locked to a vendor, ~79 MB Nuitka
   bundle with no public product page. For a platform you intend to sell, that is a
   single-vendor dependency on an unversioned private roadmap.
2. **Its data model is Kumiho's, not yours.** Renders require **revision-pinned krefs**
   (`kref://9miho/assets/x.video_ref?r=N`) — I could not render from raw paths or upload
   refs at all; every attempt was refused with *"the kref is floating; pin the revision
   you cut with (?r=N)"*. Media must be ingested into the Kumiho graph first. That is a
   hard coupling to Kumiho's storage/lineage model.
3. **It is an AI-generation suite first.** The bulk of those 158 paths are generation,
   spend, and storyteller-agent endpoints. You would be adopting a whole creative platform
   to use its cutting room.
4. **Its presets are finishing presets** (ProRes 422, DNxHR HQX) — mezzanine/broadcast
   targets, not "web MP4 for an email", though `h264_review` does exist and worked.

**Verdict: keep 9Miho as your GENERATION layer** (it already has provider plumbing —
Google Veo/Gemini, OpenAI GPT Image — plus `/api/spend/estimate`, approval queues, and
asset lineage). **Do not make it your timeline.** Use it to make media; let the timeline
layer compose.

### 4th place: **OpenShot** — poor fit, plainly

Not a bad tool; the wrong shape for a server-side batch product.

- **No real API.** `openshot-qt` is a **PyQt5 desktop app**. There is no HTTP service and
  no `openshot-qt render` CLI. The only programmatic surface is `libopenshot`'s
  **SWIG bindings** (Python/C++/Ruby) — you construct `Timeline`, `Clip`, `Track` objects
  yourself and call `Timeline.render()`. That works, but it means you own project-file
  generation, threading, frame pacing, and every libopenshot regression.
- **GPL-family licensing cuts the wrong way.** `libopenshot-audio` is **LGPL-3.0**
  (fine for dynamic linking, but it constrains redistribution), while `openshot-qt` is
  `NOASSERTION` on GitHub — you would need your own review before shipping anything
  derived from it.
- **Fork risk.** Its own docs warn of LibreOffice/ffmpeg-driven export fragility — exactly
  the class of problem that already bit 9Miho.
- **No per-customer primitive.** There is no `inputProps` equivalent. You would template
  JSON project files and diff-substitute, which is strictly worse than Remotion's
  props-driven model.

**Still worth keeping:** as a *human* review station. Let a marketing person open the final
MP4 in the desktop GUI to sanity-check output, and use `libopenshot`'s Python bindings only
if you ever need a one-off conformance render. **Not** the platform's editor.

### 5th place: **"Emotion"** — I could not find a real product; treat as unverified

- `emotion.app` and `www.emotion.app` both resolve, but the body is a redirect stub and
  `/lander` returns **GoDaddy "for sale" parking HTML** (`forsale.godaddy.com`). DNS for
  `emotion.app` and `ai.emotion.app` both points at the same **13.248.169.48 / 76.223.54.146**
  — GoDaddy parking IPs.
- `ai.emotion.app` fails the TLS handshake entirely (`SEC_E_ILLEGAL_MESSAGE`).
- Searching turns up only unrelated things: the **Emotion CSS-in-JS library**, BeEmotion.ai
  (emotion *analysis* of video, not editing), EMOS/audeering (voice-emotion APIs), Mootion
  (emotion *changing* — generation, not assembly), and Imentiv AI.
- Nothing credible offers "Emotion" as an AI video *editor* with an API.

**If you have a specific URL or a screenshot, send it and I'll re-assess** — but I would
not put it in an architecture decision on the current evidence. The nearest real products
by that description are **invideo Editor** (agentic, real multitrack timeline, 2026-09-01,
no public API), **Story.com**, and the SaaS render APIs in §3.

---

## 5. VidiBlast compatibility — the constraint that reshapes the design

**This is the finding most likely to surprise you, so read it before optimising render speed.**

Personalized video **email** does not mean embedding video in email. As of 2026:

- **Gmail, Outlook and Yahoo do not support inline HTML5 video playback at all.** Apple Mail
  does. "Design for Apple Mail, break everywhere else" is not a strategy.
- **Never attach the MP4.** Gmail caps at **25 MB**, Outlook at **20 MB** (Exchange default
  **10 MB**), and Microsoft's cap *includes the whole message body*. MIME base64 inflates the
  file ~33% on the wire. Most ESP-native templates **strip or reject** video attachments
  outright, and attachments spike spam scores. A 30s 1080p clip is typically **8–15 MB**, so
  the arithmetic never works.
- **Gmail clips the message at ~102 KB of HTML.** A heavy email can be truncated before the
  recipient ever sees the thumbnail.

### Therefore VidiBlast requires this shape

1. **A hosted MP4** at a per-recipient URL (your landing page, or object storage + CDN).
2. **A hyperlinked poster image** in the email — static JPEG under ~200 KB, or an animated
   GIF under 500 KB (1 MB absolute ceiling; GIFs fail in some Outlook versions).
3. **A play-button overlay** on the poster. One cited test put a play overlay at **+31.2%
   video clicks**; animated-GIF previews roughly **+21% CTR**.
4. **Mobile-first.** Most video email is opened on phones, where autoplay is restricted,
   codec support is inconsistent, and the browser throttles inline playback.

### What this means for the editor

- **Render the poster in the same pass as the video.** Remotion makes this trivial:
  `renderStill()` for the poster, `renderMedia()` for the MP4, same composition, same
  `inputProps`. You get a *matching* thumbnail per customer for free — that is a real
  personalisation win, and it is a strong practical argument for the props-driven model.
- **Target 720×1280 / 1080×1920 vertical, H.264 + AAC, ~1.5–3 Mbps, and cap at ~10 MB.**
  Anything heavier is being trimmed by the mail client anyway. Keep `fastStart`/`+faststart`
  on so playback begins before the whole file lands.
- **Per-recipient rendering is efficient precisely because the email holds no video.** The
  MP4 is fetched on click from your CDN — so per-customer cost is render + storage + egress,
  not per-recipient bandwidth through your email sending path.
- **Deduplicate aggressively.** If two customers share an identical timeline except the
  name, that is still two renders — but because generation is cached, renders are cheap
  (~2s locally, ~$0.01 at Lambda). Render on demand or on a short debounce, not eagerly
  for the whole list.

---

## 6. Integration sketch (Remotion as the timeline layer)

### 6.1 The composition — one component, all variation via props

```tsx
// src/CustomerVideo.tsx
import {
  AbsoluteFill, OffthreadVideo, Audio, Img, Sequence, interpolate, useVideoConfig,
} from 'remotion';

export type CustomerProps = {
  customerId: string;
  firstName: string;
  city: string;
  offer: string;        // e.g. "20% off"
  headline: string;
  ctaLabel: string;
  // media resolved by the GENERATION layer; these are URLs/paths, never prompts
  heroClip: string;     // file:/// or https:// to a generated MP4
  voiceOver: string;    // path to generated WAV
  musicBed: string;
};

export const CustomerVideo: React.FC<CustomerProps> = (p) => {
  const { fps, durationInFrames } = useVideoConfig();
  // text-timing is derived, so every language/length lands correctly
  const words = p.headline.trim().split(/\s+/).length;
  const headlineEnd = Math.min(durationInFrames - 1, Math.round(words * 0.38 * fps));

  return (
    <AbsoluteFill style={{ background: '#0b1020', fontFamily: 'Inter, sans-serif' }}>
      {/* hook: first 1.2s carries the personalisation */}
      <Sequence from={0} durationInFrames={Math.round(fps * 1.2)}>
        <OffthreadVideo src={p.heroClip} muted volume={0} />
        <AbsoluteFill style={{ justifyContent: 'center', padding: 80 }}>
          <h1 style={{ color: '#fff', fontSize: 84, lineHeight: 1.05 }}>
            {p.firstName}, {p.city} 🎯
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* body + VO */}
      <Sequence from={Math.round(fps * 1.2)} durationInFrames={headlineEnd}>
        <OffthreadVideo src={p.heroClip} muted volume={0}
                        startFrom={Math.round(fps * 1.2)} />
        <Audio src={p.voiceOver} />
        <Audio src={p.musicBed} volume={0.12} />
        <h2 style={{ color: '#fff' }}>{p.headline}</h2>
      </Sequence>

      {/* offer + CTA */}
      <Sequence from={headlineEnd}>
        <h2 style={{ color: '#7dd3fc' }}>{p.offer}</h2>
        <h3 style={{ color: '#fff' }}>{p.ctaLabel}</h3>
      </Sequence>
    </AbsoluteFill>
  );
};
```

Register it (`src/Root.tsx`) at **vertical 1080×1920 @ 30fps, 30s duration** — vertical is
the only sensible default for email/mobile.

### 6.2 The render worker

```ts
// src/render.ts  — run as a queue worker, one render per customer
import { bundle, selectComposition, renderMedia, renderStill } from '@remotion/renderer';

const serveUrl = await bundle({ entryPoint: './src/index.ts' });   // cache this once
const composition = await selectComposition({
  serveUrl, id: 'CustomerVideo',
  inputProps: {},                       // defaults; real props passed per render
  width: 1080, height: 1920,
});

export async function renderForCustomer(job: CustomerJob) {
  const inputProps = await resolveAssets(job);   // ← GENERATION layer, cached
  const base = `/out/${job.customerId}`;

  await renderMedia({
    composition, serveUrl,
    codec: 'h264',
    // email budget: 1080x1920 @ ~1.8Mbps for 30s ≈ 6-7 MB, well inside the 10 MB target
    outputLocation: `${base}.mp4`,
    inputProps,
    // `fastStart` puts the moov atom up front so playback starts before full download
    // (Remotion sets this by default for h264; verify per codec when you tune bitrate)
  });

  // matching poster for the email thumbnail — SAME props, guaranteed consistent
  await renderStill({ composition, serveUrl, output: `${base}.jpg`, inputProps });

  return {
    videoKey: `${job.customerId}.mp4`,
    posterKey: `${job.customerId}.jpg`,
  };
}
```

### 6.3 Handing off to VidiBlast

```jsonc
{
  "to": "jane@example.com",
  "customerId": "cust_8842",
  "videoUrl":  "https://cdn.smartchannel.cx/v/cust_8842.mp4",
  "posterUrl": "https://cdn.smartchannel.cx/v/cust_8842.jpg",
  "clickUrl":  "https://smartchannel.cx/v/cust_8842",   // landing page that autoplays muted
  "render":    { "engine": "remotion", "version": "4.0.533", "ms": 2140 }
}
```

VidiBlast then sends an email whose body is: **`<a href=clickUrl><img src=posterUrl></a>`**
with a play-button overlay burned into (or layered over) the poster. No `<video>` tag, no
attachment. That is the only shape that survives Gmail and Outlook.

### 6.4 The generation layer feeding it (9Miho, cached)

```python
# One-time per reusable asset — NOT per customer.
# POST /api/assets (multipart) returns a pinned kref; the timeline wants a file path.
POST http://127.0.0.1:9999/api/assets
  file=@hero_scene.mp4, name=hero_scene, workspace=smcx,
  creative_project=9miho, creative_space=assets
→ 201 {"kref":"kref://9miho/assets/hero_scene.video_ref?r=1",
       "location":"file:///.../hero_scene.mp4",
       "thumb":"/api/assets/kref%3A%2F%2F...%2Ffile?variant=thumb"}
```

Then `/api/storyteller/projects/{slug}/compile/{video,image,dialogue-audio}` (or ComfyUI +
Wan 2.2) produces the clips, the VO, and the stills, and the render worker consumes the
resulting **file paths**, not krefs. Kumiho's kref/revision model stays inside the generation
boundary — that decoupling is what keeps the render layer portable and replayable.

### 6.5 Operational guardrails (learned the hard way today)

1. **Pin ffmpeg explicitly for every render worker.** Two independent tools on this box
   already disagree about what "ffmpeg" means. `9.0.1` breaks 9Miho; Remotion bundles its
   own FFmpeg and is unaffected. Verify with `ffmpeg -version` *from the renderer's
   environment*, not from your shell.
2. **Assert output size before handing off.** Hard-fail if `videoUrl` > ~10 MB; you cannot
   detect this after the email has been sent.
3. **Render `renderStill` in the same job** as `renderMedia` — never separately, or the
   poster and video drift apart and you ship a mismatched thumbnail.
4. **Cache the `bundle()` result** across renders; it is the slowest part of a short video.
5. **Queue renders** (SQS/Redis/BullMQ). Do not render inside a request handler.

---

## 7. Direct answers to James's questions

**Q: What do I use for the video editor part of Smart Channel CX?**
**Remotion**, with **HyperFrames** as the Apache-2.0 alternative you should evaluate in the
same sprint. Everything personalised is `inputProps`; everything generated is a cached file
produced by a separate generation service. Full reasoning in §2.

**Q: Are your three candidates any good?**
- **9Miho — keep it, but not for this.** It *is* a real video editor (158 endpoints, real
  ffmpeg render, OTIO export, 15.3× realtime — all verified by me, not by docs), which
  contradicts the earlier note that it only did image/asset generation. But it is
  **proprietary**, it **cannot render on this box as installed** (stale FFmpeg-9-incompatible
  flag, fix identified and proven), its renders **require revision-pinned Kumiho krefs**,
  and it is a whole AI creative platform rather than an editor. **Use it for generation.**
- **Emotion — cannot substantiate.** `emotion.app` is a **GoDaddy parked domain**;
  `ai.emotion.app` fails TLS. Nothing credible by that name is an AI video editor with an
  API. Send me the real URL if you have one.
- **OpenShot — poor fit.** No HTTP API and no render CLI; only `libopenshot` SWIG bindings
  driven through a PyQt app; LGPL/GPL-family licensing to review; no per-customer props
  primitive. Fine as a human review station.

**Q: Should generation and assembly be the same tool?**
**No.** Generation is stochastic, slow, cacheable, and drifts with model versions; assembly
is deterministic, cheap, and must be re-runnable thousands of times without re-prompting.
Coupling them means your render loop inherits your model churn, and you lose the 95%-shared
cache that makes per-customer video affordable.

**Q: What is the single biggest risk in this plan?**
Not the editor choice — the **delivery channel**. Gmail/Outlook will not play inline video,
so the entire value of VidiBlast rests on a poster thumbnail, a click, and a landing page.
If VidiBlast's current design assumes `<video>` in the body or attachments, **fix that
before optimising anything else** — no renderer choice rescues an email that renders as a
blank box in Outlook.

---

## Appendix: what I verified vs. what I'm taking on trust

**Verified directly (this machine / these APIs):**
- 9Miho v0.22.6 manifest, CLI flags, live OpenAPI spec (158 paths), `export/support`
  capability probe, OTIO export (4,144-byte `timeline.otio`), **successful headless MP4
  render** (`ffprobe`-verified: h264+aac, 480×854, 25 fps, 4.000 s), **15.3× realtime over
  5 sequential renders**, and the **FFmpeg 9 `filter_complex_script` incompatibility plus its
  verified fix** (FFmpeg 8.1.2 → render returns 200).
- `emotion.app` = GoDaddy parking; `ai.emotion.app` = TLS failure; shared parking IPs.
- Remotion `LICENSE.md` and `hyperframes` `LICENSE` read as raw text.
- GitHub API for stars/pushed-at/license on Remotion, HyperFrames, OpenShot, libopenshot, ComfyUI.
- Latest release tags: Remotion **v4.0.533** (2026-10-05), HyperFrames **v0.8.134** (2026-10-05).

**Taken from vendor/secondary sources (not independently tested):**
- SaaS render-API pricing (Shotstack/Creatomate/JSON2Video) — Renderly + Plainly
  comparisons, data checked August 2026. Prices move; re-check before contracting.
- FFmpeg 9.0 removal list — corroborated by jbkempf.com (FFmpeg author) + the FFmpeg
  changelog. Directly reproduced the failure, so this one is solid regardless.
- Email client limits/blocking — multiple vendor blogs. Directionally consistent and
  consistent with long-standing platform behaviour, but **verify against your actual
  ESP** (Mailchimp/Klaviyo/Braze) and against real Gmail/Outlook renders before launch.
- Model licences (Wan Apache-2.0, LTX-2 $10M revenue gate, HunyuanVideo EU/UK/KR exclusion)
  — read from upstream repos/docs, not legal advice. Get counsel if the HunyuanVideo
  territory carve-out or the LTX revenue gate binds you.
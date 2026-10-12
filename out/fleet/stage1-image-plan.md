# STAGE 1 — IMAGE SPECIFICATION
### Five Vidi landing pages: brand profiles, card inventories, ready-to-paste prompts, mount points

**Plan file:** `M:\code\VidiFlow\out\fleet\stage1-image-plan.md`
**Prepared:** 2026-10-05 · Windows 11 · RTX 4090 · **Stage 1 only — no images generated, no website file modified**

---

## 0. HOW TO USE THIS DOCUMENT

Stage 2 (generate) and Stage 3 (verify) should need to open **this file and nothing else**. Every
brand hex below was read out of a real file on disk — the source path and line are quoted with each
one. No page HTML needs re-reading.

Section order per page: **(a) brand profile → (b) card inventory → (c) prompts → (d) filename +
mount point → (e) count.**

### 0.1 Generator (already built and verified)

```
C:/Python314/python.exe vidi_image.py "<prompt>" <outfile.png> [model]
```
Script: `M:\code\VidiFlow\out\fleet\vidi_image.py`
Endpoint: `POST https://api.cheaperinference.com/v1/images/generations` — bills **per image**, not per token.

| Model | Verified price/image | Role |
|---|---|---|
| `grok-imagine` | **$0.017** | default for everything in this plan |
| `nano-banana` | $0.0312 | optional A/B only (see §6.3) |

Prices re-read live from the `/v1/models` catalog during this planning pass: `grok-imagine`
`media_unit_price 0.017000`, 15% off list $0.020; `nano-banana` `media_unit_price 0.031200`, 20% off.
**No image was generated to obtain these figures.**

### 0.2 Sizes — use only these two

`1024x1024` (square) and `1280x720` (wide). Both are **proven to work in this exact environment** —
every file in `M:\code\VidiFlow\out\fleet\images\` is 1024×1024 and every file in
`M:\code\VidiFlow\out\fleet\measure\` is 1280×720. Nothing else has been exercised.

> **Stage 2 step 0 — size probe (do this before the batch).** Send one throwaway request with
> `size: "1536x640"` and a deliberately nonsense prompt. If it returns a 4xx size error, no wider
> ratio is available and every "very wide band" below must be generated at `1280x720` and
> cover-cropped by CSS. **Do not assume a 21:9 or 3:1 size works — it is unverified.**
> Cost of the probe if it unexpectedly succeeds: $0.017. Write it to the scratch dir, not to a page.

### 0.3 The icon-vs-image heuristic used throughout

**SVG icon** when *any* of these is true:
- rendered size is under ~200px in its longest dimension
- it is a feature tile, trust tick, nav item, stat, step number, or card chrome
- it must match a brand colour exactly and inherit hover/focus state
- it sits inside a grid where 4–12 identical-role items repeat

**Generated image** only when it is a **large visual moment**: hero backdrop, full-bleed section
band, or a showcase panel over ~600px wide. Generated art at icon size is unsharp, off-palette, and
costs money. This plan generates **5 images across 5 pages** and reuses **43 SVG icons**.

### 0.4 Prompt template — every prompt in this file follows it

Two different agents given the same prompt must land on the same image. So every prompt fixes, in this
order: **subject → explicit palette hexes → lighting → aspect ratio + size → mood → negatives.**

The negative clause is **verbatim and mandatory** in every single prompt:
`no text, no words, no logos, no watermarks, no letters`

Two further rules that came out of the failed test image (§6.1):
- **Name the hexes, do not name the mood first.** "Futuristic dark tech" alone is what produced the
  off-brand result. Every prompt below leads the palette with literal hex codes.
- **Say what the image must NOT contain visually**, not just in words — e.g. "no people, no faces,
  no UI screenshots, no charts with numbers" — because a photo-real model will otherwise supply them.

### 0.5 Brand spelling (machine-checked downstream)

VidiSmart · VidiFlow · Vidi AI · VidiCity · VidiTwin · 9Miho · VidiMail · VidiBlast · EquityGen ·
Smart Channel CX · Hydra · Revka · Kumiho. Fleet units are **bots**, never "agents".
Never: Viddybot, VidySmart, ViddySmart, "Vidi City", "9 Miho", "Equity Gen".

---

# 1. VidiSmart — `M:\code\vidismart\landing\index.html`

Single self-contained HTML file, 723 lines, inline `<style>` in `<head>`. Light theme.

## (a) BRAND PROFILE

Tokens lifted verbatim into `:root` at lines 22–35. Quoted exactly:

```css
--primary:        #2563eb;   /* brand blue */
--primary-light:  #3b82f6;
--primary-dark:   #1d4ed8;
--accent:         #10b981;   /* emerald */
--text-primary:   #0f172a;
--text-secondary: #475569;
--text-muted:     #94a3b8;
--bg-primary:     #ffffff;
--bg-secondary:   #f8fafc;
--bg-tertiary:    #f1f5f9;
--border:         #e2e8f0;
--border-light:   #f1f5f9;
```

| Property | Value | Source |
|---|---|---|
| Theme | **Light** — white page, slate text | `--bg-primary: #ffffff`, lines 30–32 |
| Accent pair | **`#2563eb` blue + `#10b981` emerald** | lines 23, 26 |
| Secondary accents | purple `#7c3aed`, amber `#d97706`, slate `#334155`, pink `#db2777` | lines 366–371 |
| Hero gradient | `linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 48%, #0f172a 100%)` + radial blooms `rgba(96,165,250,0.22)` and `rgba(52,211,153,0.16)` | lines 162–165 |
| Fonts | body **Inter**; headings **Plus Jakarta Sans** (weights 400–800) | lines 15, 41–54 |
| Container | `max-width: 1200px` | line 57 |

**This is the only light-theme page with a saturated blue hero.** A generated image for it must be
blue-and-white, not the dark cyan/black look the other four pages need. Getting this wrong is the
most likely cross-page clashing error.

## (b) CARD INVENTORY

| # | Element | Selector / lines | Decision | Reason |
|---|---|---|---|---|
| 1 | Nav logo mark | `.nav-logo svg` L494–497, 26×26 | **SVG** | 26px, inline already |
| 2 | Nav links (2) + CTA | `.nav-link`, L501–503 | **SVG n/a** | text only, no art |
| 3 | Hero badge dot | `.hero-badge .dot` L193–198, 8px | **SVG/CSS n/a** | 8px CSS circle, cheaper than any asset |
| 4 | Hero trust ticks (3) | `.hero-trust-item svg` L530/534/538, 16×16 | **SVG** | 16px trust glyphs; already inline, all the same check polyline |
| 5 | Check-list ticks (4) | `.check-list svg` L558/562/566/570, 20×20 | **SVG** | 20px, colour is `--accent`; must inherit exactly |
| 6 | Stat panel (4 rows) | `.stat-panel` L576–596 | **SVG n/a** | numerals in `.stat-num`, no art slot exists |
| 7 | Feature card **VidiFlow** | `.feature-card` L612–619, `.feature-icon-blue` | **SVG** | 3rem (48px) tile, eye glyph; inside `repeat(auto-fit,minmax(320px,1fr))` |
| 8 | Feature card **Vidi AI** | L621–628, `.feature-icon-green` | **SVG** | 48px star glyph |
| 9 | Feature card **9Miho** | L630–637, `.feature-icon-purple` | **SVG** | 48px monitor glyph |
| 10 | Feature card **VidiCity** | L639–646, `.feature-icon-amber` | **SVG** | 48px users glyph |
| 11 | Feature card **VidiTwin** | L648–655, `.feature-icon-slate` | **SVG** | 48px clock glyph |
| 12 | Feature card **VidiModels** | L657–664, `.feature-icon-pink` | **SVG** | 48px trend glyph |
| 13 | CTA section | `.cta-section` L670–681 | **SVG n/a** | text + one button |
| 14 | Footer | `.footer` L684–693 | **SVG n/a** | text links |

**Six feature cards, each 48px icon, all six already have hand-written inline SVG with per-card
brand tints. Generating art here would replace crisp, exactly-on-palette vectors with blurry
off-brand squares. Verdict: SVG for all 13 graphic slots. One generated image only — the hero.**

## (c) PROMPT — IMG-01, the only generated image on this page

### IMG-01 · VidiSmart hero backdrop — **VARIANT A**

Placement is a **full-bleed hero**, `padding: 9rem 0 5.5rem`, `overflow: hidden`, `min-height` ≈ 560–700px
at 1200px container. So the aspect must be **wide**.

**Size:** `1280x720` (verified). If §0.2's probe proves a 21:9 size works, use that instead — a wide
strip crops better than a 16:9 into a 9rem-padded hero.

```
Wide cinematic abstract backdrop for a technology company hero, colour locked to a specific
three-colour palette. Background is a deep navy-to-blue field running from #1e3a8a at the upper
left through #1d4ed8 at centre to #0f172a at the lower right. Over that, a single soft
light-blue radial bloom in the colour #60a5fa glowing from the upper left at roughly twenty
percent strength, and one soft emerald radial bloom in the colour #34d399 glowing from the
upper right at roughly sixteen percent strength. The subject is a calm, wide field of
translucent geometric planes and soft glass-like sheets of light, arranged in wide horizontal
bands with generous empty space through the middle third of the frame so headline text can
sit over it. Surfaces are smooth, matte and slightly frosted. Lighting is soft, even and
ambient with no hard shadows and no single light source, bright enough to read as optimistic
and clean rather than moody. Mood: confident, precise, professional, optimistic. Aspect ratio
16:9 widescreen, composition weighted to the left with the right third calm and uncluttered.
No text, no words, no logos, no watermarks, no letters. No people, no faces, no user interface
screenshots, no charts, no graphs, no numbers, no icons, no logos, no signage, no watermarks.
```

**Why this shape of prompt:** it restates the page's own CSS gradient stops as hex, so the art cannot
land on a different palette than the CSS already paints behind it. Naming the light-blue and emerald
blooms reproduces `.hero-section`'s two `radial-gradient` washes exactly.

## (d) FILENAME + MOUNT POINT

| | |
|---|---|
| **Filename** | `vidismart-hero-variant-a.png` |
| **Write to** | `M:\code\vidismart\landing\vidismart-hero-variant-a.png` |
| **Relative path** | `vidismart-hero-variant-a.png` (same dir as `index.html`) |
| **Mount** | `.hero-section` (L158–166) — as a `background-image` layer *underneath* the existing gradients |
| **How** | `background-image: url("vidismart-hero-variant-a.png"); background-size: cover; background-position: center;` added as the **first** layer of the existing `background` shorthand so the two `radial-gradient`s and the `linear-gradient` still paint over it |
| **Overlay needed** | **Yes — required.** This art is a *backdrop*, not the hero content. Text sits directly on top. Ship with `opacity` baked into a semi-transparent overlay or an extra `linear-gradient(rgba(15,23,42,.35), rgba(15,23,42,.35))` layer between art and text, or contrast checking is Stage 3's job |
| **Do not touch** | `.hero-grid-pattern` (L168–176) stays on top — the 60px grid lines are part of the identity |

**Stage 2 caution:** this page's `index.html` was deliberately written with **zero external asset
requests** — the favicon is a data URI (L10) specifically so nothing can 404. Adding one `<img>` or
one `url()` is the first network request this page will ever make. Path it relatively, confirm it
loads from `file://` as well as over HTTP, and never leave the `url()` pointing at a path that does
not exist or the hero silently renders empty.

## (e) COUNT — VidiSmart

| | |
|---|---|
| SVG icons | **14** — 1 nav logo + 3 hero trust ticks + 4 check-list ticks + 6 feature-card icons |
| Generated images | **1** (IMG-01, Variant A) |
| Cost | **$0.017** |
| Note | If Stage 2 also runs Variant B (§6.4) for the measurement, this page becomes **2 images / $0.034** |

---

# 2. VidiSmart Community — `M:\code\vidismart\vidismart-community\apps\web\src\features\landing\LandingPage.tsx`

154 lines of JSX. **Zero artwork in the file** — it is pure text, links and numbers. Styling lives
in two external files that must be read to get the palette, both already located:
- `M:\code\vidismart\vidismart-community\apps\web\src\features\landing\landing.css` (415 lines)
- `M:\code\vidismart\vidismart-community\apps\web\src\genui\spec.ts` (the `--vs-*` source of truth)

## (a) BRAND PROFILE

The page has **no `:root` of its own**. Colour comes from `--vs-*` custom properties, written onto
`document.documentElement` at runtime by `applyCssVars()` (spec.ts L91–95) from a `ThemeProvider`.
The default palette is `midnight` (spec.ts L28), quoted verbatim L6–10:

```ts
midnight: {
  bg: "#05070e", card: "#0b0f1a", border: "#1a2035", borderLight: "#253050",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  cyan: "#38bdf8", purple: "#a78bfa", emerald: "#34d399", rose: "#fb7185", amber: "#fbbf24",
}
```

| Property | Value | Source |
|---|---|---|
| Theme | **Dark** — near-black blue | `bg #05070e`, card `#0b0f1a` |
| Accent | **`#38bdf8` cyan, spent with extreme restraint** | landing.css L69–77: "The single most sparing use of the accent: one small dot" |
| Where cyan is allowed | live dot, `.lp-accent` word, primary CTA, `.lp-cardAction`, card hover border, focus ring | landing.css L74, L92, L118, L317, L283, L171 |
| Secondary accents | `#a78bfa` purple, `#34d399` emerald, `#fb7185` rose, `#fbbf24` amber | spec.ts L9 |
| Type | Inter (`--vs-font: "Inter, system-ui, sans-serif"`, spec.ts L87) | |
| Font scale | 1.25 ratio, `--lp-t-3xl` = `clamp(2.25rem, 1.7rem + 2.6vw, 3.75rem)` | landing.css L37 |
| Layout | 1120px, widening to 1200px at 90rem | landing.css L45, L368–371 |

**Critical caveat for Stage 2 — this palette is runtime-swappable.** `ThemeProvider` can replace every
`--vs-*` value; `void`, `dusk` and `carbon` (spec.ts L11–25) are green-on-black, violet-on-black and
amber-on-black respectively. **The prompts below are written for `midnight`, the default, because that
is what a first-time visitor sees.** Stage 3 must judge against `midnight`. If the theme ever ships
switchable, generated images do not follow it — that is a known limitation to record, not solve here.

**Second caveat:** the design standard says one accent used sparingly. The `--lp-close` panel is the
only element with a gradient (`landing.css` L326–330, 6% cyan over card). A generated image anywhere
on this page risks spending the accent across a whole viewport and violating the restraint that makes
it look expensive.

## (b) CARD INVENTORY

| # | Element | Selector / lines | Decision | Reason |
|---|---|---|---|---|
| 1 | Hero eyebrow dot | `.lp-dot` L68–71 of TSX, 6px | **SVG/CSS n/a** | 6px CSS circle with a ring; an asset here is absurd |
| 2 | Hero CTA arrows (2) | `.lp-ctaArrow` TSX L88, L147 | **SVG/CSS n/a** | the glyph is `→`, a text character that already shifts 3px on hover |
| 3 | Stat band (4 stats) | `.lp-statBand` TSX L101–108 | **SVG n/a** | `240 / 61 / 8 / 4` are numerals; there is no art slot in the markup |
| 4 | Card **Watch and follow** | `.lp-cardItem` TSX L12–18 | **SVG icon** | feature tile, text-only by design — but if an icon is ever wanted it must be a 20px vector |
| 5 | Card **Find it the way you remember it** | TSX L19–26 | **SVG icon** | same |
| 6 | Card **240 vetted consultants** | TSX L27–34 | **SVG icon** | same |
| 7 | Card **Publish in minutes** | TSX L35–42 | **SVG icon** | same |
| 8 | Card **Talk about the work** | TSX L43–50 | **SVG icon** | same |
| 9 | Card **Sell and license** | TSX L51–53 | **SVG icon** | same |
| 10 | Closing CTA panel | `.lp-close` TSX L140–151 | **SVG n/a** | gradient panel, text + one button |

**All six cards currently render no art at all.** That is the honest state: they are link tiles, not
product tiles. Each is ~330×200px at the 3-up breakpoint.

**Recommendation: do not add generated art to these six cards.** They are navigable text tiles, the
grid is 3-up and uniform, and a photographic band at 330px wide is exactly the failure mode the
heuristic warns about. If Stage 3 wants visual richness here, the right move is **six 20px inline SVG
glyphs** — matching `.lp-ctaArrow` and `.lp-cardAction`, which are already cyan — **not** six paid
generations.

**Therefore this page gets ONE generated image: the hero backdrop.**

## (c) PROMPT — IMG-02, hero backdrop — **VARIANT A**

The hero is `.lp-hero`, `max-width: 46rem`, left-aligned, with no background of its own — the page's
`.lp` wrapper is 1120px and inherits `body`. The art therefore sits behind a ~736px-wide text column
on a near-black page. **Aspect: wide.**

**Size:** `1280x720`.

```
Wide cinematic abstract backdrop for a dark technology product page, colour locked to an
almost-black and single-cyan palette. Background is an extremely dark blue-black, reading
#05070e in the corners and lifting only to #0b0f1a near the centre. From the upper centre a
single restrained cyan bloom in the colour #38bdf8 descends into the frame at roughly twelve
percent strength, fading out completely before it reaches the lower third; nothing else in the
frame emits light. The subject is a very sparse scatter of small softly glowing cyan particles
suspended in dark empty space, thinning out toward the bottom, with faint thin thread-like
filaments connecting a few of them. Everything is matte and unhurried; large areas of pure dark
negative space are intentional and must remain dark. Lighting is low-key, single soft source
from above, deep unlit shadows, no reflections on any surface. Mood: quiet, restrained,
understated, expensive, mostly empty. Aspect ratio 16:9 widescreen. Cyan #38bdf8 is the only
saturated colour allowed anywhere in the frame. No text, no words, no logos, no watermarks, no
letters. No people, no faces, no user interface screenshots, no charts, no graphs, no numbers,
no icons, no logos, no signage, no cityscapes, no rain.
```

**Two design constraints this prompt encodes, both from `landing.css`:**
1. "The single most sparing use of the accent" (L69) → the cyan bloom is capped at ~12% and there is
   exactly one of them. A brighter, busier hero would contradict the file's own stated intent.
2. `--lp-title` is up to 60px and `--lp-lede` up to 20px, both light-on-dark, sitting on the **left**.
   So the composition is weighted left-to-right and the lower third stays empty.

## (d) FILENAME + MOUNT POINT

| | |
|---|---|
| **Filename** | `vidismart-community-hero.png` |
| **Write to** | `M:\code\vidismart\vidismart-community\apps\web\public\vidismart-community-hero.png` |
| **Relative path** | `public/vidismart-community-hero.png` (Vite serves `public/` at the site root) |
| **Referenced as** | `/vidismart-community-hero.png` |
| **Mount** | `.lp-hero` — the `<section className="lp-hero">` at TSX L67 |
| **How** | Add to `landing.css`: `.lp-hero { position: relative; background-image: url('/vidismart-community-hero.png'); background-size: cover; background-position: center top; }` — **plus** a darkening scrim `linear-gradient(90deg, rgba(5,7,14,.88) 0%, rgba(5,7,14,.72) 55%, rgba(5,7,14,.55) 100%)` so the left-hand text column keeps contrast |
| **Why `public/`** | Vite only serves `public/` at the root. Writing into `src/features/landing/` would make the asset unaddressable without a bundler import, and the file already imports no assets |
| **Note** | `public/` currently holds only `fonts/` — verified empty of images |

## (e) COUNT — VidiSmart Community

| | |
|---|---|
| SVG icons | **6** (optional 20px glyphs for the six `.lp-cardItem` tiles) — plus 2 text `→` arrows and 1 CSS dot that need no asset |
| Generated images | **1** (IMG-02) |
| Cost | **$0.017** |

---

# 3. VidiBlast — `M:\code\vidismart\vidimail-app\src\pages\VidiBlastLanding.tsx`

> **Path correction — the brief's path does not exist.** `M:\code\vidimail_vidiblast\` is not on disk
> (no such directory anywhere under `M:\code`). The real file, found by walking the tree, is
> **`M:\code\vidismart\vidimail-app\src\pages\VidiBlastLanding.tsx`** — 617 lines. Its sibling
> `landing.html` (17 lines) mounts it via `/src/landing-main.tsx`, so this page is live. Stage 2/3
> should use this path. Supporting files: `M:\code\vidismart\vidimail-app\tailwind.config.js`,
> `M:\code\vidismart\vidimail-app\src\index.css`.

## (a) BRAND PROFILE

Tokens are Tailwind theme entries, quoted verbatim from `tailwind.config.js` L10–27:

```js
primary: { 50:'#f0f4ff', 100:'#e0e9ff', 200:'#c7d7ff', 300:'#a5b8ff', 400:'#8191ff',
           500:'#667eea', 600:'#5a67d8', 700:'#4c51bf', 800:'#434190', 900:'#3730a3' },
dark:    { bg:'#0f0f1a', card:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' }
```

| Property | Value | Source |
|---|---|---|
| Theme | **Dark** | `dark.bg '#0f0f1a'`; also hard-coded `background:#0f0f1a` in index.css L15 |
| Accent | **`#667eea` periwinkle** (`primary-500`) | tailwind L15 |
| Gradient | **`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`** — this is `.gradient-text` and `.btn-primary` | index.css L62–73 |
| Support | `#a5b8ff` `primary-300` for labels and glyphs; `#8191ff` `primary-400` for the dot | TSX L109, L335, L396 |
| Surfaces | `.glass` = `rgba(255,255,255,0.05)` + `blur(10px)` + `rgba(255,255,255,0.1)` border | index.css L55–59 |
| Type | Inter 300–800 | tailwind L29 |
| Type scale | `TYPE.display = clamp(2.5rem, 6.2vw, 4.5rem)` — up to 72px | TSX L26 |
| Layout | `max-w-7xl` (1280px) | TSX L193 |

**This is the only page whose accent is violet-purple and whose gradient ends in `#764ba2`.** Do not
reuse any other page's palette here. `#667eea` alone is not enough — the page reads as periwinkle
*into violet*, and Stage 3 should judge the gradient endpoints, not the mid-tone.

## (b) CARD INVENTORY

| # | Element | Selector / lines | Decision | Reason |
|---|---|---|---|---|
| 1 | Header logo mark | TSX L540–552, 18×18 | **SVG** | already inline, camcorder glyph |
| 2 | Header CTA + 2 nav links | TSX L564–575 | **SVG n/a** | text only |
| 3 | Hero eyebrow dot | TSX L202, 6px | **SVG/CSS n/a** | 6px `bg-primary-400` circle |
| 4 | Hero CTA buttons (2) | TSX L248–259 | **SVG n/a** | `.btn-primary` gradient, no art |
| 5 | WhatItDoes step rows (4) | `.glass` `<li>` TSX L320–350 | **SVG n/a** | each carries a `font-mono` "01"–"04" numeral (L335–339), not an icon — numerals are correct here, they are a sequence |
| 6 | Feature card **Per-recipient personalization** | `<article>` TSX L43–45 | **SVG** | 44×44 `.inline-flex h-11 w-11` tile (L394), `Glyph` L129–135 |
| 7 | Feature card **Content, visual, and audio facets** | TSX L46–51 | **SVG** | 44px tile, `Glyph` L136–141 |
| 8 | Feature card **Hosted landing page per contact** | TSX L52–56 (`accent: true`) | **SVG** | 44px tile, `Glyph` L142–147; this one gets the accent-tinted border `rgba(102,126,234,0.42)` |
| 9 | Feature card **Vidi AI voice cloning** | TSX L57–62 | **SVG** | 44px tile, `Glyph` L148–153 |
| 10 | Feature card **Pipeline and analytics** | TSX L63–68 | **SVG** | 44px tile, `Glyph` L154–160 |
| 11 | Feature card **Built to send at scale** | TSX L69–72 | **SVG** | 44px tile, `Glyph` L161–166 |
| 12 | HowItWorks steps (4) | TSX L444–467 | **SVG n/a** | mono "01"–"04" + a 1px `.h-px` rule per step |
| 13 | Closing CTA glow | TSX L486–492 | **SVG/CSS n/a** | pure CSS radial `rgba(102,126,234,0.20)`, already atmospheric |
| 14 | Footer | TSX L583–599 | **SVG n/a** | text |

**Every graphic slot is already a hand-written inline SVG or a mono numeral, and the file says so
explicitly at L116: "Inline SVG only — no external asset requests, nothing to 404."** Six feature
cards at 44px each is squarely icon territory. Verdict: **SVG for all 6, one generated image.**

## (c) PROMPT — IMG-03, hero backdrop — **VARIANT A**

`Hero()` TSX L177–264. The section is `relative overflow-hidden`, and its ambient layer is already a
CSS radial (L186–191): `radial-gradient(120% 80% at 50% -10%, rgba(102,126,234,0.22) 0%, …0 62%)`.
Text is **centred**, `max-w-3xl`. Aspect: **wide.**

**Size:** `1280x720`.

```
Wide cinematic abstract backdrop for a dark software product hero, colour locked to a periwinkle
into violet gradient on near-black. Background is a very dark blue-black reading #0f0f1a across
the whole frame. From the top centre a broad soft radial wash of periwinkle #667eea descends and
fades to nothing by roughly sixty percent of the frame height, at about twenty-two percent
strength, with the deepest violet #764ba2 concentrated right at the top edge and fading fastest.
The subject is a smooth flowing field of soft light, like a wide silk or liquid gradient ribbon,
sweeping horizontally across the middle third of the frame and thinning at both ends, with gentle
smooth folds and no hard edges. Surfaces are glossy and soft-focus with a shallow depth of field;
the lower third of the frame is plain dark and must stay plain. Lighting is soft ambient glow from
above only, no visible light source, no shadows, no reflections. Mood: polished, premium,
forward-moving, calm. Aspect ratio 16:9 widescreen, symmetrical composition centred horizontally,
the entire top and bottom edges kept dark and uncluttered. The only colours permitted are #0f0f1a,
#667eea and #764ba2 and blends of them. No text, no words, no logos, no watermarks, no letters.
No people, no faces, no user interface screenshots, no charts, no graphs, no numbers, no icons, no
logos, no signage, no devices, no screens, no envelopes, no paper.
```

**Encoded constraints:** the page's own radial is `at 50% -10%` and fades by 62% — the prompt mirrors
that geometry so the art and the CSS wash reinforce instead of fighting. Centred `max-w-3xl` text
means the composition is symmetric. `#764ba2` is named explicitly because leaving it out is what
produces a generic blue hero.

### IMG-03 **VARIANT B** — "hard geometric slab stack" (for the §6.2 A/B measurement)

Same slot, same palette, deliberately opposite visual language to Variant A.

```
Wide cinematic abstract backdrop for a dark software product hero, colour locked to periwinkle into
violet on near-black. Background is a very dark blue-black reading #0f0f1a. The subject is a
receding stack of wide flat horizontal slabs or plates, arranged in perspective so they get smaller
and closer together toward the centre of the frame, each slab a flat plate with a crisp hard edge
and a glowing rim along its front face; the rims glow periwinkle #667eea on the outer slabs and
deepen to violet #764ba2 toward the back of the stack. The gaps between slabs are pure black
#0f0f1a. Lighting is a single dramatic source from directly above, producing a bright rim on every
slab edge and hard falloff into black between them; no fill light, no reflections, no soft glow and
nothing hazy. Mood: engineered, structural, serious, precise. Aspect ratio 16:9 widescreen,
symmetrical composition with a dead-centre vanishing point, the top quarter and bottom quarter of
the frame left completely empty and black so centred headline text can sit over it. The only
colours allowed are #0f0f1a, #667eea and #764ba2 and blends of them. No text, no words, no logos,
no watermarks, no letters. No people, no faces, no user interface screenshots, no charts, no
graphs, no numbers, no icons, no logos, no signage, no devices, no screens, no envelopes, no paper,
no cityscapes, no rain, no lens flare.
```

## (d) FILENAME + MOUNT POINT

| | |
|---|---|
| **Filename A** | `vidiblast-hero-a.png` |
| **Filename B** | `vidiblast-hero-b.png` |
| **Write to** | `M:\code\vidismart\vidimail-app\public\` |
| **Relative path** | `public/vidiblast-hero.png` (Vite serves `public/` at root) |
| **Referenced as** | `/vidiblast-hero.png` |
| **Mount** | `Hero()`'s `<section>` at TSX L178–182 — add `className="relative overflow-hidden bg-[url('/vidiblast-hero.png')] bg-cover bg-center"`, **or** set the art on that section and demote the existing inline-styled radial div to sit on top |
| **Layer order** | art (bottom) → existing radial div (L185–191, already `pointer-events-none absolute inset-0`) → content (L193+) |
| **Contrast** | `.btn-primary` is a `#667eea`→`#764ba2` gradient. On a `#667eea`-lit hero the primary CTA can lose edge separation — keep the radial scrim between art and content |

## (e) COUNT — VidiBlast

| | |
|---|---|
| SVG icons | **7** — 1 header mark + 6 `Glyph` feature icons |
| Generated images | **1** (IMG-03 Variant A) — **2** in the A/B run, with Variant B |
| Cost | **$0.017** shipping one · **$0.034** for the A/B measurement run |

---

# 4. VidiCity — `M:\code\vidicity\vidicity-v2\frontend\app\landing.html`

241 lines. Styling split across `page.css` (516 lines) and **`tokens.css` (73 lines)**, which
`page.css` imports at L1. Tokens are the real source of truth — read from
`M:\code\vidicity\vidicity-v2\frontend\app\tokens.css`.

## (a) BRAND PROFILE

Quoted verbatim from `tokens.css` L6–55 (dark palette, the `:root` default):

```css
--vc-bg-primary:   #0A0E1A;   /* near-black navy */
--vc-bg-secondary: #121929;
--vc-bg-card:      #1A2342;   /* navy card surface */
--vc-bg-hover:     #232D52;
--vc-border:       #2A3566;
--vc-border-light: #3A4576;
--vc-text-primary: #FFFFFF;
--vc-text-secondary:#A0AEC0;
--vc-text-muted:   #94A3B8;
--vc-primary:      #00D4FF;   /* CYAN — the one accent */
--vc-primary-dark: #00A8CC;
--vc-secondary:    #FF6B6B;  --vc-success: #4ECDC4;  --vc-accent: #FFE66D;
--vc-gradient-hero:   linear-gradient(135deg, #0A0E1A 0%, #1A2342 50%, #0A0E1A 100%);
--vc-gradient-primary:linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
--vc-gradient-glow:   radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%);
--vc-shadow-glow:  0 0 40px rgba(0,212,255,0.3);
```

| Property | Value | Source |
|---|---|---|
| Theme | **Dark**, and the tokens file has a real light-mode block under `prefers-color-scheme: light` | tokens.css L57–72 |
| Accent | **`#00D4FF` electric cyan**, gradient to `#0099CC` | tokens.css L21–22, L50 |
| Glow | `0 0 40px rgba(0,212,255,0.3)` on the brand dot | tokens.css L46, page.css L95–102 |
| Type | display **Space Grotesk**; body **Inter** | tokens.css L8–9 |
| Rhythm | 4px base; radii `0.375 / 0.75 / 1 / 1.5rem / 9999px`; type scale 1.25 ratio; `maxw 1200px` | tokens.css L28–40, L54 |

> **Do not confuse VidiCity cyan `#00D4FF` with VidiSmart Community cyan `#38BDF8`.** They are
> different brands, different pages, and the difference is exactly the kind of brand-identity detail
> a Stage 3 judge should catch. VidiCity's is a pure saturated electric cyan; the Community's is a
> lighter sky blue.

## (b) CARD INVENTORY

This page uses **emoji, not SVG or images** — `.card__icon` contains raw emoji characters.

| # | Element | Selector / lines | Decision | Reason |
|---|---|---|---|---|
| 1 | Brand dot | `.brand__dot` L18, 10px | **SVG/CSS n/a** | 10px CSS circle with `--vc-shadow-glow` |
| 2 | Hero eyebrow dot | `.eyebrow b` L34 | **SVG/CSS n/a** | text `●`, styled `--vc-primary` |
| 3 | **Hero panel — "Fleet activity · live"** | `.hero__visual > .panel` L52–85 | **GENERATED IMAGE — IMG-04** | **the one true visual moment on this page**: a large product frame in the right hero column, ~46% of a 1200px layout ≈ 500–560px wide. This is a showcase panel, not a tile |
| 4 | Panel row badges (4) 🎬🧠👤⚡ | `.row__badge` L60/66/72/78, 32×32 | **SVG** | 32px emoji badges — at this size emoji render inconsistently across platforms and read as cheap. **Recommend replacing all emoji with 18px inline SVG** styled `--vc-primary`, matching `.row__badge`'s own `background: var(--vc-bg-hover)` |
| 5 | Proof strip (3 stats) | `.proof` L45–49 | **SVG n/a** | `57/57`, `20/20`, `1,099` numerals |
| 6 | Feature card **Semantic search** 🔍 | `.card__icon` L100, 44×44 | **SVG** | 44px — same emoji problem, same fix |
| 7 | Feature card **Video reviews** 🎬 | L107 | **SVG** | 44px |
| 8 | Feature card **Tiered profiles** 👤 | L114 | **SVG** | 44px |
| 9 | Feature card **Fleet bots** 🧩 | L121 | **SVG** | 44px |
| 10 | Feature card **FastAPI backend** ⚡ | L128 | **SVG** | 44px |
| 11 | Feature card **Ship with confidence** 🛡️ | L135 | **SVG** | 44px |
| 12 | Fleet card **VidiFlow** 🎥 | L155 | **SVG** | 44px |
| 13 | Fleet card **VidiSmart** 💡 | L162 | **SVG** | 44px |
| 14 | Fleet card **Vidi AI** 🤖 | L167 | **SVG** | 44px |
| 15 | Fleet card **VidiTwin** 🪞 | L174 | **SVG** | 44px |
| 16 | `.chip` status pills (10) | `.chip` L442–451 | **SVG n/a** | text pills, `color-mix(--vc-primary 12%)` |
| 17 | CTA band | `.cta` L185–190 | **SVG n/a** | text + one button, already has a radial |
| 18 | Footer | L196–205 | **SVG n/a** | text links |

**Ten feature/fleet cards, every one a 44px emoji.** Ten cards in two grids of 6 and 4, all uniform —
this is the strongest "use SVG, not generated images" case in the whole audit. The one exception is
the hero panel.

## (c) PROMPTS — IMG-04, hero showcase panel — **VARIANT A** and **VARIANT B**

This is one of the two A/B measurement pages (§6). Both variants target the same slot.

**Placement:** `.hero__visual`, ~500–560px wide × ~380–460px tall in a `1.05fr 0.95fr` grid
(page.css L194). The panel has `--vc-shadow-lg`, `--vc-radius-xl`, `--vc-bg-card #1A2342`, and a
title bar with three dots. **Aspect: squarish-to-landscape, NOT widescreen.**

**Size:** `1280x720` for both — generate landscape and `object-fit: cover` into the panel box. Do
**not** generate 16:9-and-stretch; the panel is closer to 4:3.

### IMG-04 **VARIANT A** — "abstract vector field" (safe, low-variance)

```
Abstract dark data-visualisation backdrop for a software product panel, colour locked to navy and
electric cyan. Background is a deep navy #1A2342 filling the frame. Over it, a precise geometric
mesh of thin glowing cyan #00D4FF lines at roughly twenty percent strength, forming a regular
isometric lattice that fades to plain navy toward the edges and corners. Scattered across the
lattice are small solid cyan nodes, each with a soft cyan glow, denser at the centre of the frame
and absent at the edges; a handful of brighter cyan points act as focal highlights. Depth comes
from three layers of parallax blur, the rear layer softest. Lighting is entirely self-emissive from
the cyan lines and nodes against unlit navy, no external light source, no reflections, no shadows.
Mood: precise, engineered, calm, technical. Aspect ratio 4:3 landscape, suited to a product panel
rather than a full-width hero; composition centred and symmetric, with the outer fifteen percent on
every edge kept as flat empty navy. The only colours allowed are #1A2342, #0A0E1A, #00D4FF, #0099CC
and blends of them. No text, no words, no logos, no watermarks, no letters. No people, no faces, no
user interface screenshots, no charts, no graphs, no numbers, no axes, no legend, no icons, no logos,
no signage, no panels, no windows, no buttons, no cityscapes, no rain.
```

### IMG-04 **VARIANT B** — "cinematic depth corridor" (higher variance, richer)

```
Cinematic abstract backdrop for a software product panel, colour locked to navy and electric cyan,
with real photographic depth. Background is near-black navy #0A0E1A at the edges opening into a
deeper navy #1A2342 toward the centre. The subject is a wide corridor of translucent glass-like
vertical panels receding into darkness on both the left and right sides, each panel edge traced with
a thin electric cyan #00D4FF rim light; the panels grow dimmer and hazier with distance until they
dissolve into the black centre, which stays empty and uncluttered. A faint cool haze fills the
lower half and catches the cyan edge light. Lighting is low-key with the cyan rim lights as the only
visible source, producing soft volumetric glow and gentle falloff; deep unlit shadows in the middle.
Mood: atmospheric, deep, futuristic, quiet. Aspect ratio 4:3 landscape, suited to a product panel
rather than a full-width hero; composition symmetric, vanishing point dead centre, the top and
bottom edges dark. The only colours allowed are #0A0E1A, #1A2342, #00D4FF, #0099CC and blends of
them. No text, no words, no logos, no watermarks, no letters. No people, no faces, no user
interface screenshots, no charts, no graphs, no numbers, no icons, no logos, no signage, no panels,
no windows, no buttons, no cityscapes, no rain, no lens flare.
```

**A vs B is a genuine style fork, not a reword:** A is flat geometric/vector with hard rules and even
lighting; B is atmospheric photographic depth with volumetric haze and strong vignetting. If B wins
on brand identity but loses on legibility behind the `.panel__title` bar, that is a real finding. Run
both at n=1, judge independently.

## (d) FILENAME + MOUNT POINT

Both variants ship to the **same mount**. Only the winner is kept.

| | |
|---|---|
| **Filename A** | `vidicity-hero-panel-a.png` |
| **Filename B** | `vidicity-hero-panel-b.png` |
| **Write to** | `M:\code\vidicity\vidicity-v2\frontend\app\` — beside `landing.html`, `page.css`, `tokens.css` |
| **Relative path** | `./vidicity-hero-panel-a.png` (same dir; `landing.html` already loads `./page.css` this way at L12, so the convention is established) |
| **Mount** | `.panel__body` — the div at `landing.html` L58 that currently holds the four `.row` elements |
| **How** | `.panel__body { background-image: url('./vidicity-hero-panel-a.png'); background-size: cover; background-position: center; }` |
| **Keep the rows** | **Yes — keep the four `.row` blocks on top.** They carry VidiFlow / Vidi AI / VidiTwin / 9Miho names and status text. The generated image is the *substrate*; the rows are the data. Add `position: relative; z-index: 1` to `.row` if stacking needs it |
| **Legibility** | `.row` has `background: color-mix(in srgb, var(--vc-bg-secondary) 55%, transparent)` — that 55% scrim is what keeps `--vc-text-primary #FFFFFF` readable over generated art. Do not remove it |

## (e) COUNT — VidiCity

| | |
|---|---|
| SVG icons | **14** — 4 `.row__badge` (32px) + 6 `.card__icon` feature (44px) + 4 fleet `.card__icon` (44px). **All ten card icons are currently emoji and should be replaced with inline SVG** |
| Generated images | **1** (IMG-04) — but **2 in the A/B run**: Variant A + Variant B |
| Cost | **$0.017** shipping one · **$0.034** for the A/B measurement run |

---

# 5. EquityGen — `M:\code\EquityGen\site\index.html`

262 lines, fully self-contained, `<style>` inline L10–125, `data-theme="linear"` on `<html>` (L2).
**This is the best-engineered icon set of the five pages** — a `<defs>` sprite of five `<symbol>`s
at L128–151, referenced by `<use href="#i-N">`.

## (a) BRAND PROFILE

Quoted verbatim from `:root`, L10–23:

```css
--bg:   #08090a;    /* near-black, NOT navy */
--alt:  #0f1011;    /* band surface */
--text: #f7f8f8;    --muted: #8a8f98;
--accent: #5e6ad2;  /* indigo / periwinkle-blue */
--on-accent: #ffffff;
--border: rgba(255,255,255,0.08);
--rc: 10px;  --rb: 6px;
--font: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06);
--hl: rgba(94,106,210,0.1);
```

| Property | Value | Source |
|---|---|---|
| Theme | **Dark, neutral-black** — `#08090a` is a desaturated near-black, not a blue-black | L11–12 |
| Accent | **`#5e6ad2` indigo**, used on buttons, `.eyebrow`, `h1 .em`, `.seat.self`, icon tiles | L16 |
| Icon tile | `.ico { 40×40, radius 10px, background var(--hl), color var(--accent) }`, `.ico svg { 20×20, fill: currentColor }` | L105–107 |
| Type | Inter 400–700 only, no display face | L8 |
| Weight | `h1 { 56px, 600 }`, `h2 { 31px, 600 }` — Linear-derived, tighter and heavier than the other four pages | L62, L93 |
| Radius | `10px` cards, `6px` buttons — the smallest radii here; deliberately Linear-like | L19–20 |
| Board glow | `radial-gradient(80% 60% at 50% 0%, rgba(94,106,210,0.16) 0%, transparent 70%)` | L76 |

**Watch the accent collision.** EquityGen's `#5e6ad2` and VidiBlast's `#667eea` are both periwinkle
indigo and a Stage 3 judge could accept either on the wrong page. **EquityGen is neutral-black + a
single flat indigo. VidiBlast is blue-black + a periwinkle→violet gradient.** EquityGen's art must
contain **no violet and no gradient** — flat `#5e6ad2` only.

## (b) CARD INVENTORY

| # | Element | Selector / lines | Decision | Reason |
|---|---|---|---|---|
| 1 | Brand mark "E" | `.brand .mark` L156, 26px | **SVG/CSS n/a** | a styled letter in an indigo rounded square — correct as-is |
| 2 | Hero eyebrow | `.eyebrow` L169 | **SVG n/a** | text pill |
| 3 | Hero 2×2 board | `.board-card` L180–193 | **SVG/CSS n/a** | **this is live data** — "You" plus Seat 1–5, `.seat.self` styled indigo. It is the product demonstration. Any generated art behind it must stay under a `.seat` that has `background: var(--bg)` (L84), i.e. fully opaque |
| 4 | Proof/board tag | `.board-top .tag` L181 | **SVG n/a** | text pill "6 seats" |
| 5 | Card **Take a package seat** | `.ico` + `#i-0` L205, 20px | **SVG** | 20px star sprite, already exists |
| 6 | Card **Paid as seats fill** | `#i-1` L210, 20px | **SVG** | 20px card-with-play sprite |
| 7 | Card **Profile image and video bio** | `#i-2` L215, 20px | **SVG** | 20px person sprite |
| 8 | Card **Share list ready to blast** | `#i-3` L220, 20px | **SVG** | 20px clock sprite |
| 9 | Card **Gamified 2×2 calculator** | `#i-4` L225, 20px | **SVG** | 20px trend-arrow sprite |
| 10 | Card **Teach it in one screen** | `#i-2` L230, 20px | **SVG** | reuses `#i-2`; note the duplication |
| 11 | Legal band | `.legal` L244–250 | **SVG n/a** | dense small print, no art |
| 12 | Footer | `.frow` L254–260 | **SVG n/a** | text |

**Six cards at 20px, all five symbols already drawn and shipped.** This page needs the least work of
the five — zero new icons required. **One generated image: the hero backdrop behind the 2×2 board.**

> **Legal note, not a design note.** L244–250 disclaims figures, and L247 states EquityGen "is not
> Salarium, earnbtc, or any Roman-rank program." Do not let any generated art imply rank tiers,
> medals, crowns, trophies or leaderboards. The prompt below forbids them explicitly.

## (c) PROMPT — IMG-05, hero backdrop

`.hero` L55–56: `grid-template-columns: 1.05fr .95fr`, `padding-top: 96px`. Text column left, board
card right. **Aspect: wide.**

**Size:** `1280x720`.

```
Wide minimal abstract backdrop for a dark finance-tech product hero, colour locked to neutral black
and a single flat indigo. Background is a flat near-black #08090a with a barely-there lift to
#0f1011 toward the upper centre, plus one soft indigo radial bloom in the colour #5e6ad2 at about
sixteen percent strength spreading from the top edge and fading to nothing by forty percent of the
frame height. The subject is a sparse regular grid of very small dim indigo squares set on the
black, evenly spaced and fading out toward the bottom and the outer edges, suggesting structure and
order without depicting anything specific. Everything is flat and matte with no gloss, no bevel, no
texture, no three-dimensional objects. Lighting is uniform and shadowless, purely graphic, no
light source, no reflections, no highlights. Mood: disciplined, restrained, precise, understated,
utilitarian. Aspect ratio 16:9 widescreen, flat even graphic composition, no focal point, the lower
sixty percent kept plain and empty. The only colours allowed are #08090a, #0f1011 and #5e6ad2 and
blends of them; indigo must appear as one flat hue with no violet and no purple. No text, no words,
no logos, no watermarks, no letters. No people, no faces, no user interface screenshots, no charts,
no graphs, no numbers, no currency symbols, no icons, no logos, no signage, no medals, no trophies,
no crowns, no leaderboards, no ranks, no ribbons, no gold, no luxury styling.
```

**Encoded constraints:** "no gradient / no violet" keeps it distinct from VidiBlast. "No medals,
trophies, crowns, ranks" protects the legal posture at L247. "Flat graphic, no gloss, no 3D" matches
Linear's flat aesthetic that `--rc: 10px` and `h1 { 600 }` are clearly borrowing from.

## (d) FILENAME + MOUNT POINT

| | |
|---|---|
| **Filename** | `equitygen-hero.png` |
| **Write to** | `M:\code\EquityGen\site\equitygen-hero.png` |
| **Relative path** | `equitygen-hero.png` (same dir as `index.html`) |
| **Mount** | `.hero` (L55) — `background-image` layer underneath |
| **How** | `.hero { position: relative; background-image: url("equitygen-hero.png"); background-size: cover; background-position: center top; }` |
| **Board safety** | `.board-card` already has `background: var(--alt)` = `#0f1011`, fully opaque (L72). It will cover the art cleanly — **do not make it translucent** |
| **Its own glow** | `.board-card::after` (L74–77) paints `rgba(94,106,210,0.16)` on top. That is the accent bloom; the generated art must not double it or the board will look blown out |

## (e) COUNT — EquityGen

| | |
|---|---|
| SVG icons | **6 card icons** (5 unique `#i-0`…`#i-4`, `#i-2` reused once) — **already implemented, zero new work** |
| Generated images | **1** (IMG-05) |
| Cost | **$0.017** |

---

# 6. ROLL-UP, COST, AND THE BRAND-IDENTITY MEASUREMENT

## 6.1 What the failed test image actually was

The single prior test image, `M:\code\VidiFlow\out\fleet\images\equitygen-hero.png` (1024×1024,
technically a valid JPEG despite the `.png` name — **Stage 2 must be told this**), was inspected
during this planning pass. It is a dark world map with a glowing connectivity network.

**Verdict: brand identity failed, and the reason is measurable, not mysterious.** EquityGen's accent
is `#5e6ad2` — a *flat indigo*. The image contains **no indigo at all**: its accents are turquoise-cyan
`#49E2E2` and warm gold `#F6C66D`. Its background `#020D16` is close to `#08090a`, so the base read
as on-brand and masked the failure. **It looked like a plausible dark-tech hero; it just wasn't this
brand's.**

Three lessons, now encoded into every prompt in this plan:
1. **Name the exact hex, and forbid the near-misses.** The three prior failures' colours
   (cyan `#49E2E2`, gold `#F6C66D`, orange `#D98A36`) are what a model reaches for when a prompt
   says "dark tech" without hexes. Every prompt here closes the allowed palette with
   *"The only colours allowed are … and blends of them."*
2. **Judge on the accent, not the background.** A near-black background is trivially easy to hit and
   proves nothing.
3. **One sample tells you nothing about 10% vs 100% failure rate.** Hence the A/B requirement below.

The 12 files in `M:\code\VidiFlow\out\fleet\measure\` (all 1280×720) appear to be an earlier
12-run measurement sweep. `run-03.png` was checked: near-black `#071116` with cyan `#27D1CC` **and
orange `#D98A36`** nodes — the same cyan+gold drift, at 16:9. **The failure mode repeats.** Treat it
as at least 2 independent observations, not 1.

## 6.2 A/B MEASUREMENT DESIGN — VARIANT A vs VARIANT B

Two pages get two hero prompts each, deliberately on **opposite ends of the style spectrum** so the
comparison is informative rather than a reword:

| Page | Variant A style | Variant B style | Tests |
|---|---|---|---|
| **VidiCity** (IMG-04) | Flat geometric vector lattice, even lighting, low variance | Cinematic photographic corridor, volumetric haze, heavy vignette | Does **abstract-geometric** or **atmospheric-photographic** hold brand identity better? |
| **VidiBlast** (IMG-03) | Soft flowing "silk/liquid gradient ribbon", glossy, centred | Hard-edged isometric stack of glowing stacked slabs, dramatic single top light | Does **soft-focus organic** or **hard geometric** hold brand identity better? |

Also vary the model, because that is the other confound: **run VidiCity A on `grok-imagine` and
VidiCity B on `nano-banana`.** Prompt style and model are then crossed, not confounded. Cost:
VidiCity A/B + VidiBlast A/B = 4 images × 2 models is 8 generations = **$0.272**; keep it tighter if
needed by running grok-imagine for all four (**$0.068**) and adding nano-banana only for the VidiCity
pair (**+$0.062**).

### The measurement protocol

1. Generate each variant **n=1**. Do not cherry-pick from n=4 — that measures the best case, not the
   hit rate.
2. Stage 3 scores each image blind against **three** criteria, 0–2 each:
   - **Accent fidelity** — is the accent hex actually present, and is the disallowed near-miss absent?
   - **Theme fidelity** — dark/light as specified; base colour within tolerance of the token.
   - **Composition fitness** — is the specified negative space actually there for the text to sit in?
3. A variant wins only if it passes all three. Record the raw verdict per image, including failures.
4. **Report the hit rate, not a verdict.** 2 wins / 4 tells you more than "A is better".
5. Then extrapolate: with a 50%-per-image failure rate, 5 shipping images ≈ 2–3 wasted generations
   ($0.034–0.051). With 100%, the whole approach is wrong and the hero art should be CSS-only. **This
   measurement is what decides between spending $0.085 and spending $0.**

## 6.3 CONSOLIDATED TABLE — all five pages

| # | Page | File | Theme | Accent | Icons (SVG) | Generated | Cost |
|---|---|---|---|---|---|---|---|
| 1 | VidiSmart | `vidismart/landing/index.html` | light | `#2563eb` + `#10b981` | 14 | 1 | $0.017 |
| 2 | VidiSmart Community | `…/landing/LandingPage.tsx` | dark | `#38bdf8` | 6 | 1 | $0.017 |
| 3 | VidiBlast | `…/vidimail-app/src/pages/VidiBlastLanding.tsx` | dark | `#667eea`→`#764ba2` | 7 | 1 | $0.017 |
| 4 | VidiCity | `vidicity-v2/frontend/app/landing.html` | dark | `#00D4FF` | 14 | 1 (2 for A/B) | $0.017 (A/B $0.034) |
| 5 | EquityGen | `EquityGen/site/index.html` | dark | `#5e6ad2` | 6 | 1 | $0.017 |
| | | | | **TOTAL** | **47** | **5** | **$0.085** |

- **With the full A/B measurement run (add VidiCity B + VidiBlast B): 7 images, $0.119.**
- **With the cross-model addition (nano-banana on the VidiCity pair): 8 generations, $0.272.**
- If every A/B loser is discarded: **5 shipping images, $0.085.**

**Where the money goes, and why it is only 5 images:** 47 graphic slots resolve to inline SVG and
**5** resolve to generated art. The three densest card sets — VidiCity's ten 44px emoji, VidiSmart's
six 48px tiles, EquityGen's six 20px sprites — are all icon-scale, all already drawn as vectors, and
all would have cost $0.017 *each* to generate badly ($0.374 for 22 images) for worse-looking results.
That is the whole point of the heuristic.

## 6.4 Stage 2 execution checklist

```
C:/Python314/python.exe M:/code/VidiFlow/out/fleet/vidi_image.py "<prompt>" <outfile> grok-imagine
```

- [ ] Run the **size probe** from §0.2 first, to scratch — determines whether "very wide" is achievable.
- [ ] Run **VidiCity Variant A** and **Variant B** first. They are the measurement; everything else
      can wait for the result.
- [ ] Prompt is pasted as a **single argument**. No shell line breaks inside it, no unescaped
      double-quotes. The prompts above contain no `"` characters — keep it that way.
- [ ] Confirm the written file is a real image and check its **actual** dimensions. The existing
      `.png` files in `fleet/images/` are **JPEG data with a `.png` extension**; the generator returns
      whatever the API sends. If a downstream tool is strict about the container, convert on write.
- [ ] `nano-banana` costs $0.0312 — nearly 2×. Only use it for the deliberate model-cross test.
- [ ] Log every generation with its prompt, model, and dimensions **as you go**. Stage 3 cannot
      reconstruct which prompt produced which file if you only keep the winners.

## 6.5 Stage 3 verification checklist

Per image:
- [ ] Accent hex **present** in the frame (sample it — do not eyeball).
- [ ] The **disallowed near-miss absent**: no cyan+gold drift on EquityGen, no violet on EquityGen,
      no teal-cityscape on VidiSmart, no `#764ba2` missing from VidiBlast, no sky-blue `#38BDF8`
      substituted for VidiCity's `#00D4FF`.
- [ ] **No text of any kind.** Image models hallucinate signage even when told not to. This is the
      single most common objective failure and it is easy to check.
- [ ] Theme matches: light for VidiSmart, dark for the other four.
- [ ] Named negative space is actually present and large enough for the headline.
- [ ] No people/faces unless the prompt wanted them (none of these five prompts do).
- [ ] File mounts at the documented path and loads — including VidiSmart, whose page currently makes
      zero network requests.

Per page:
- [ ] Icon-scale slots are **SVG**, not raster.
- [ ] Brand spellings in any new copy: VidiSmart · VidiFlow · Vidi AI · VidiCity · VidiTwin · 9Miho ·
      VidiMail · VidiBlast · EquityGen · Smart Channel CX. No "Viddybot", no "VidySmart", no
      "Vidi City", no "9 Miho". Units are **bots**.
- [ ] No console errors; nothing 404s; no layout shift from a late-loading image
      (always ship `background-size: cover` on a fixed-size container, never a bare `<img>` in flow).
- [ ] Checked at **375 / 768 / 1440**.

---

## 6.6 WHAT WAS AND WAS NOT VERIFIED IN THIS PASS

**Verified by reading real files:** every hex, font, gradient, line number, selector, JSX prop and
image dimensions quoted above. Every "line N" reference points at a real line in a real file.
Existence of `page.css`, `tokens.css`, `landing.css`, `spec.ts`, `tailwind.config.js`, `index.css`
and each `public/` directory was confirmed by directory walk.

**Verified live:** `grok-imagine` `$0.017/image` and `nano-banana` `$0.0312/image`, re-read from
`GET /v1/models` on the Cheaper Inference endpoint during this pass. Both listed as `type: image`,
`endpoint: /v1/images/generations`, with `image_pricing_unit: "image"`.

**Deliberately NOT done, per the Stage 1 brief:** no image generated, no website file created,
modified or deleted. The only file written is this plan.

**Unverified — do not assume:**
- Whether a non-1:1, non-16:9 `size` value is accepted. Only `1024x1024` and `1280x720` are proven.
- Whether `n>1` is honoured per request by this endpoint.
- Whether the returned image is PNG or JPEG. The existing files say JPEG-in-a-`.png`-name.
- Any claim about brand-identity hit rate. **That is precisely what §6.2 exists to measure.**

---

*Stage 1 complete. Hand to Stage 2 with §6.2 as the first action.*


# Vidi Site Design Review — 2026-10-07

Seven independent reviewers, one per site, all measured against the live pages at 127.0.0.1:8831–8836.
Method: headless Chromium (Playwright), viewports 375 / 768 / 1440, computed styles read from the DOM,
contrast computed in sRGB, images inspected at full resolution. Nothing was edited — this is review only.

**Universal good news:** every one of the 8 pages has **zero horizontal overflow** at all three widths,
**zero JS console errors**, and every referenced image resolves and decodes. The foundation is sound.

---

## Severity 1 — False or broken promises (fix first)

### 1. VidiTwin claims a capability it does not have
The hero and body claim a **"full-duplex speech-to-speech brain"** (4 occurrences on the page) that
"listens while it speaks." The actual code at `apps/agent/agent.py` is an OpenAI **cascade** —
`openai.stt` → `openai.LLM(gpt-4o-mini)` → `openai.tts`, with PersonaPlex literally marked
`"reserved: load PersonaPlex-7B weights here"`. A cascade cannot listen while it speaks.

Also on this page: a capability tagged **"Built in"** for transcripts/replay/latency traces that has no
code behind it, and a CTA loop where the final "Start a session" button points at `#top` (back to the hero).

**Fix:** re-word the hero to "runs a cascade brain today (STT → LLM → TTS), with a full-duplex
speech-to-speech brain as the next lane." Change the `Built in` tag to `Planned`. Point the dead CTA at
a real destination.

### 2. Lex light mode is unreadable
`@media (prefers-color-scheme: light)` remaps the tokens (line 59), but `body { color: #f1f5f9 }` at line 90
and `h1..h5 { color: #ffffff }` at line 101 come **after** it and win. Result on a light OS:
body text **1.04:1**, headings **1.05:1** — invisible. Every light-mode user sees a broken page.

**Fix:** drop the light block (dark is the stated product look) or neutralize the two late rules.

### 3. VidiCity header CTA is unreadable
`.nav a` (page.css:162, specificity 0,1,1) sets `color: var(--vc-text-secondary)` and beats `.btn--primary`
(0,1,0). The "Get started free" button renders grey-on-cyan at **1.27:1**.

**Fix:** `.nav a {` → `.nav a:not(.btn) {`.

### 4. VidiCity lost the brand palette
`tokens.css` claims the palette is "lifted verbatim from the WordPress theme." Measured against
live `vidicity.net` it is not: the rebuild uses cyan `#00D4FF` on `#0A0E1A`, while the live site uses
blue `#3498db` on navy `#2c3e50` (the live site has **zero** occurrences of the cyan). The rebuild holds
0% of the brand's blue identity.

**Fix:** `--vc-primary: #00D4FF → #3498db`, gradient endpoints to `#3498db/#2980b9`, anchor the surface
on `#2c3e50`.

---

## Severity 2 — Accessibility failures (measured)

Contrast failures under the 4.5:1 body-text floor, all from a **muted token used for label text** —
the same mistake on five different sites:

| Site | Element | Measured | Fix |
|---|---|---|---|
| VidiSmart | `.feature-tag` (11px) | **2.34:1** | → `--text-secondary` `#475569` |
| VidiSmart | `.media-caption` (13px) | **2.56:1** | → `#475569` |
| VidiModels | `.kicker--ink`, `.roster__tag` | **2.52:1** | → `#8A6533` |
| VidiModels | `.principle__num` | **2.78:1** | → `#8A6533` |
| VidiBio | `.step__n` (timeline numerals) | **2.11:1** | → `--vm-pillar-icon` |
| VidiBio | `.about__n` (01–06 numerals) | **2.78:1** | → `--vm-pillar-icon` |
| VidiTwin | `--ink-faint` (9 elements) | **2.56:1** | → `#7d97af` |
| HX mobile | `--dim` token (7 elements) | **2.94–3.23:1** | `#5c636e → #8a929e` |

**HX mobile also has a colourblind fault:** simulated for deuteranopia, the amber "warn" and red "down"
status colours collapse to nearly the same yellow (**1.06:1 apart**), and the fleet meter is colour-only
with no legend — a colourblind operator cannot read fleet state from it.

**Tap targets:** on HX mobile every control except the bottom nav is under the 44px floor —
the quick-command chips are **27px tall**. On VidiCity, nav links are 22px and CTA buttons 41px.

---

## Severity 3 — Structure and content

| Site | Finding |
|---|---|
| **VidiModels** | The funnel is inverted. "Browse the roster" is the *solid* CTA (twice, incl. sticky nav); "Request access" — the actual conversion — is a ghost outline and a `mailto:`. Both "Browse" targets land on a 6-row teaser, not a roster. The four product cards are structurally identical and read as one card repeated 4×. |
| **VidiBio** | The profile page is **orphaned** — `index.html` has zero links to it. No image is above the fold at any width (hero plate starts at y=1061 at 1440). The profile reuses all four homepage images and adds no new photography; it has no face, no slate, no named title, no credits. |
| **VidiCity** | It is a platform pitch, not a marketplace: no search, no listings, no prices, no map, no ratings. Dev copy leaks into user-facing copy ("pgvector + Vespa", "57 checks · 20 tests"). The hero fleet panel and the fleet section list *different* product rosters. |
| **VidiSmart** | `cta-light.jpg` is functionally invisible (renders at `rgb(240,248,248)` in both schemes — a 1280×720 asset contributing nothing). The mobile nav (≤640px) hides both links with no hamburger. The primary CTA points at `#top`. Page mentions neither Hydra nor VidiMail. |
| **HX mobile** | The hero leads with "46 bots" at 30px while the actual health signal ("1 running · 13 configured · 32 no profile") is 11.5px. 66 lanes are claimed but only **12 render** (+54 more unreachable). A filter is read in code but no filter input exists. `#botCard` is 2488px tall on a 747px viewport. |
| **Lex** | Unknown search terms return a **fake result**: typing "Kubernetes" shows a CRM sales-funnel image under a "Custom Generated Term" heading. The modal has no keyboard contract (Esc does not close, no focus trap, no `role="dialog"`). The mobile sidebar drawer exists but nothing ever opens it — nav is unreachable at 375px. |

---

## Cross-cutting: brand rule violations

Fleet units must be called **bots** or **sub-agents**, never "agents." Found on:

- **VidiSmart** — the hero image has `agent_id` / `agent_ids` generated into its glass panels (illegible AI text on top of a banned word)
- **HX mobile** — `#cmdBox` placeholder reads "agent name + command"
- **VidiTwin** — an SVG label "AGENTS", plus "the same agent process"
- **Lex** — lines 1483 and 1828

---

## Cross-cutting: imagery

- **Resolution:** every generated asset is 1280×720. As a full-bleed hero at 1440 that is a 1.125× upscale
  (2.25× on a retina display). Re-export heroes at 2560×1440.
- **VidiCity `card-reviews.webp`** is 5.9KB and measurably flatter than its siblings (edge-energy 5.39 vs
  18.71) — replace it.
- **Lex** ships **3.9MB** of images on load, and browsing the 8 topic pills adds **8.4MB more** — including
  two avatars at **1.5MB each** rendered at 44×44. Downscale to WebP; ~12.3MB → under 0.5MB.
- **VidiTwin** `avatar-lane.jpg` is a flat translucent mask in the largest card, under copy claiming
  "real-time photoreal face rendering" — the image contradicts the claim.

---

## Recommended execution order

1. **VidiTwin truthfulness** — reword the overclaim, fix the dead CTA. (Worst defect: it is a false claim.)
2. **Lex light mode** — one edit, restores an entire broken mode.
3. **VidiCity** — `.nav a:not(.btn)` fix + palette restoration to `#3498db`.
4. **The contrast table** — token swaps, 8 edits across 5 sites.
5. **HX mobile** — tap targets, lead with health not inventory, surface all lanes, colourblind-safe status.
6. **VidiModels funnel** — flip the CTA hierarchy, add roster metrics.
7. **VidiBio** — link the orphaned profile, add a real slate/credits block, get an image above the fold.
8. **Lex** — wire the mobile drawer, compress imagery, modal keyboard contract, honest empty state.

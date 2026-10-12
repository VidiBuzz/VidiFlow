# Image integration report — IMAGE-REPORTS-2026-10-05.html

Scope: integrate the three approved illustrations into the existing dark report, place each
next to the claim it illustrates, then verify in a real browser and fix what was weak.

## Placement — what went where and why

| Figure | Image (file) | Placed | Why |
|---|---|---|---|
| A | `img/imperfect-baseline-field-v2_00001_.png` (1024²) | directly after the note **"Your baseline is ~3 characters in 4 correct"** (top-5 section) | The tile grid *is* that note: a regular field where ~1 tile in 4 is defective. It sits before the HiDream card, so the eye reads claim → picture before moving on. |
| B | `img/vram-headroom-tray-v2_00001_.png` (1344×768) | directly after the **"HiDream-O1 needs one file, not three"** card | The card's first paragraph makes the 22.4 GB / 22.5 GB "zero headroom" claim; the overhanging stack vs. the single cube with clear floor is that exact contrast. Rendered full content width (1000px). |
| C | `img/evidence-grade-plates-v2_00001_.png` (1024²) | after figure B, same section | The card's second paragraph is the caveat "No independent OCR benchmark exists yet" — the three graded plates + empty slot. Ordered after B to follow the card's own paragraph order (VRAM first, evidence caveat second). |

**Squares: stacked individually, not side by side.** The two square images support claims in two
*different* zones of the page — the baseline note (top-5 section) and the evidence caveat (inside
the HiDream card). Putting them in one side-by-side row would have pulled one of them away from
its claim to satisfy a purely visual pairing, so each is placed as its own figure next to its
own claim. Cost of that choice: both squares are left-aligned at 420px inside a 1000px column,
which leaves whitespace on the right (noted under weaknesses).

Wide image spans the content width; both squares are capped at `max-width:420px` so they don't
dominate. All images are `max-width:100%; height:auto` and inherited into a `figure.fig` with a
1px `#1e2a38` border and 8px radius — flat, no shadow/glow/overlay, matching the existing cards.

CSS added (only what was needed):
```css
.fig{margin:14px 0 18px}
.fig img{display:block;width:100%;max-width:100%;height:auto;
 border:1px solid var(--line);border-radius:8px;background:var(--panel)}
.fig figcaption{color:var(--dim);font-size:12.5px;line-height:1.5;margin-top:8px}
.fig.sq{max-width:420px}
.tscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
```
All existing custom properties, colours and card rules were left untouched. Semantic colour
(green/amber/red) was not extended to the figures. Src paths are relative (`img/<file>`).

## Measured verification (real browser, file:// URL)

Loaded `file:///M:/code/VidiFlow/out/fleet/IMAGE-REPORTS-2026-10-05.html` in the browser tool.
An `error` + `unhandledrejection` listener was installed via `Page.addScriptToEvaluateOnNewDocument`
*before* navigation so load-time errors would be captured.

- **Images load** — every `<img>` has `complete === true` and `naturalWidth > 0`:
  - `imperfect-baseline-field` naturalWidth×height = **1024 × 1024** (displayed 420 × 420)
  - `vram-headroom-tray` = **1344 × 768** (displayed 1000 × 572)
  - `evidence-grade-plates` = **1024 × 1024** (displayed 420 × 420)
- **No horizontal scroll / overflow**, measured `documentElement.scrollWidth` vs `clientWidth`:
  - default window (1241px viewport): clientWidth **1241**, scrollWidth **1241** → no overflow
  - narrow (375px, emulated mobile): clientWidth **375**, scrollWidth **375** → no overflow
- **Console / load errors:** `window.__err` = **[]** (empty) — no JS or resource errors.
- **Captions and alt text present**, spelled as intended (3 `figcaption`, 3 non-empty `alt`).
- **Original content intact** — all 10 original blocks still present: 3 `a.card` + 3 `div.card`
  + 2 `table.tbl` + 2 `.note` (1 of which is `.note.warn`), plus h1 ×1 and the 4 `h2` headings.
  Source tag balance: 20 `<div>` / 20 `</div>`, 3 `<img>`, 3 `<figure>` / 3 `</figure>`.
- **Palette intact:** visual check of the full-page render confirms the figures are dark and
  low-saturation against `#0a0e14`/`#111823`; no glare, no added colour.

(Nothing here is estimated — all values are read from the live DOM. I did not measure a second
browser engine or OS high-contrast mode; see weaknesses.)

## Fixes applied during self-review

- Narrow-viewport overflow at 375px: `scrollWidth` was **438** vs `clientWidth` **375**.
  Diagnosed as the top-5 `<table class="tbl">` whose intrinsic min-content width is 415px
  (from `.num{white-space:nowrap}` + long cells) — **not** the images (they render at 331px,
  inside the 331px content box). Fixed by wrapping each `.tbl` in `<div class="tscroll">`
  (`overflow-x:auto`), so on a narrow screen the table scrolls inside its own box instead of
  pushing the page. On desktop the table still fills 100% width with no internal scrollbar, so
  the design is unchanged. Re-measured: 375/375, no page overflow.

## Compromises / things that didn't fit

- **Evidence-plates figure is one step removed from its sentence.** The caveat it illustrates
  lives *inside* the HiDream card; a figure cannot sit inside that card without restructuring it.
  Placing the figure immediately after the card (and after figure B) keeps it in the right
  section but relies on the caption to tie it to the "no independent benchmark" line.
- **Table-scroll wrapper is slightly out of scope.** The 375px overflow was a pre-existing defect
  of the original page, unrelated to the images. I fixed it because the verification bar is "the
  page is not horizontally scrolling". It adds a structural `<div class="tscroll">` around the two
  tables but no desktop visual change.

## Remaining weaknesses I did NOT fix

1. **The baseline tile image is nearly featureless at a glance.** It is very dark and the
   "~1 tile in 4 defective" cue is deliberately subtle; on a dim screen it can read as a plain
   dark rectangle. This is faithful to the approved asset's intent, so I did not brighten or
   annotate it (that would also violate the no-overlay rule).
2. **Whitespace beside the two square figures.** At 420px in a 1000px column they leave a wide
   empty gutter on the right. I judged this better than detaching them from their claims, but it
   is a real aesthetic cost.
3. **The hairline border is almost invisible on these images** because the image edges are close
   to the panel colour. Acceptable per the brief, but the border is doing little visual work.
4. **Single-browser verification only.** All measurements are from the one Chromium instance the
   tool drives; I did not test Firefox/Safari, OS zoom, or Windows High Contrast mode.
5. **No automated HTML validator run.** Tag balance and DOM parse cleanly in the browser and all
   blocks are present, but I did not run an external W3C validator pass.

## Deliverable
- Edited page: `M:/code/VidiFlow/out/fleet/IMAGE-REPORTS-2026-10-05.html` (154 → 182 lines)
- This report: `M:/code/vidiflow/out/fleet/_imgreport_assembly_report.md`

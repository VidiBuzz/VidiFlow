# Lex redesign — changes (2026-10-11)

Working copy only: `M:\code\VidiFlow\lex\app-redesign-20261011` (`index.html` edited).
Nothing outside this folder was touched. No deploy / push. Live `M:\code\VidiFlow\lex\app`
and the port 8041 preview server were left alone.

## What changed (all in `index.html`; JS engine + term data untouched)

- **Top bar replaces the persistent 288px sidebar.** Brand, six short pane
  buttons (Search / Dictionary / My Stack / Hover Lab / Graph / Swarm) and
  page links (Builder / Manifesto / Privacy). The old sidebar still exists
  with all its controls (search, term list, footer) but is now a slide-in
  drawer at every width, opened by the hamburger (same `#navToggleBtn` id,
  same handler). Content is full-width and centered (max 1240px).
- **First screen features Lexi.** New hero row: the required
  `<img src="https://cdn.vidi.news/images/viditwin_lexi_avatar.png" referrerpolicy="no-referrer" alt="Lexi">`
  (verified loading, 1024×1024) + "Meet Lexi" eyebrow + existing headline,
  above the prominent search box (`#cmdTermInput` / `#cmdGenerateBtn`, ids kept).
- **Quick picks trimmed 16 → 8** (CRM, Dragonfly, RAG, LLM, MCP, SaaS, API, KPI).
- **Clean term cards.** Same `#disp*` ids and keyword/stack actions; fixed a
  real bug where `.not-found-notice{display:flex}` overrode the `hidden`
  attribute, leaving an empty amber bar under every known term
  (now `.not-found-notice[hidden]{display:none}`).
- **Dictionary browse.** `#pane-glossary` kept (filter box, Create button,
  `#glossaryTableBody`, Studio/Edit actions) plus a new **A–Z bar**
  (All + A–Z, additive helper script, first-letter filtering with live count,
  e.g. R → "3 of 40 terms"). Drawer section relabeled BROWSE TERMS.
- **Secondary panels collapsed, not deleted.** "Lexi for Chrome" install bar
  → collapsed `<details>` (ids kept). Flowchart + brands/ecosystem → one open
  "Deeper dive" `<details>` (all render-target ids kept; redundant inner title
  bar hidden). Broadcast ticker still defaults to collapsed; REC/sync pills
  kept but de-pulsed and subdued.
- **Duplicate nav/badges removed.** Deleted the duplicate VidiTwins LIVE link
  (a second Manifesto link remains in drawer + new header/footer);
  "Live Data Pipeline" badge hidden; labels shortened
  (Search / My Stack / Dictionary / Graph / Swarm).
- **Responsive.** Sticky topbar compresses on phones (brand text + page links
  hide, pane buttons scroll-x); hero stacks centered; search box goes full
  width; dictionary table rows stack into cards; grids collapse to one column.
  Verified 0px horizontal overflow at 390×844 and no overlapping/clipped text
  at 1440×900.
- **Footer added** with Search / Builder / Manifesto / Privacy links
  (`builder.html` previously had no inbound link from `index.html`).

## Removed / moved

- Removed: VidiTwins LIVE sidebar link, 8 quick-pick pills, persistent-sidebar
  layout, pulse animations on REC/sync, flowchart inner title bar.
- Moved: nav toggle + sidebar → drawer; install bar → collapsed disclosure;
  flowchart/ecosystem → "Deeper dive" disclosure.
- Renamed (labels only): Lex Lab→Search, Build Smart Stack→My Stack,
  Lex Library→Dictionary, Flow State Graph→Graph, 80-Bot Swarm→Swarm.

## Could not keep / known issues

- **FIXED 2026-10-11 (QA follow-up): mobile ecosystem brand names no longer
  clip.** `.brand-rank-item` collapsed at 390px so `.b-name`
  (`white-space:nowrap`) truncated to ~1 character. Fix, CSS-only in
  `index.html`, no content or ids removed: `.b-name` now wraps at all widths
  (no ellipsis cutoff), and at ≤640px each row is rank+name on line 1 with
  the tag below (bar hidden). Programmatic re-verify (leaf-text elements
  only, 5 scroll positions per viewport): zero clipped, zero truncated,
  zero overlapping text at 390×844 and 1440×900, zero page errors.
  `screens/05-first-screen-mobile-390x844.png` re-shot after the fix.

- **Missing local media 404s (pre-existing, not from this redesign):**
  term data references `images/lexi/<TERM>.jpg` and `videos/lexi/<TERM>.mp4`
  (e.g. CRM, RAG) but the working copy ships no `images/` or `videos/`
  folders and `data/` is empty — the page falls back to bundled concept art
  and works, but the console shows 404s. Copying those folders from the live
  source was out of scope (hard rule: don't touch it).
- Dictionary dept badges for long departments (e.g. "DATA & INTEGRATION
  (SMART STACK)") wrap to 2–3 lines in the narrow first column — readable,
  no overlap, left as-is.
- **FIXED 2026-10-11 (QA follow-up): mobile ecosystem brand names no longer
  clip.** `.brand-rank-item` collapsed at 390px leaving the name ~16px wide
  (e.g. "Pinecone / pgvector" cut to one letter). Fix, CSS-only in
  `index.html`, no content/ids removed: `.b-name` now wraps instead of
  `nowrap+ellipsis` at all widths, and at ≤640px each row is rank+name on
  line 1 with the tag below (bar hidden). Re-verified programmatically at
  390×844 and 1440×900: zero clipped text, zero ellipsis truncation, zero
  leaf-text overlaps, zero page errors; `screens/05-…` re-shot.
- `ai-engine.js` is a Node/Express backend (needs `npm i express cors
  @supabase/supabase-js` + env keys); untouched, still not wired to the
  static page — same as before.

## How to view

```powershell
python -m http.server 8042 --bind 127.0.0.1 --directory M:\code\VidiFlow\lex\app-redesign-20261011
# then open http://127.0.0.1:8042/index.html
```

Stop the server when done (leave any port-8041 server running).

## Verification (this session)

- Playwright (system Chrome, headless): all required ids present, no
  duplicate ids, 40/40 terms render in drawer + dictionary, search "RAG"
  decodes, A–Z "R" → 3 of 40, drawer opens (`left:0`) and navigates,
  avatar natural size 1024×1024 desktop + mobile, 0px mobile h-overflow,
  zero page errors (only the pre-existing media 404s above).
- Screenshots in `screens\` (all opened and inspected):
  `01-first-screen-1440x900.png`, `02-search-1440x900.png`,
  `03-term-card-1440x900.png`, `04-dictionary-1440x900.png`,
  `05-first-screen-mobile-390x844.png`.

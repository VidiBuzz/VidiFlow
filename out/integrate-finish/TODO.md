# TODO — VidiFlow `/integrate` ("Agent Army") finish

Verified live on **https://vidiflow.net/integrate**, 2026-10-11 ~19:15–19:22 ET, by Hermes (default profile, @hermes).
Live page: title `Integrate runtimes`, BUILD_ID mP7G2PU_yPBANqcm6TDWS (deployed 3:12 PM ET today).
Source of truth: `M:\code\VidiBot\vidiflow-hx`.

Page identity check: **/integrate is the page with the new content** (hero + 8-engine release timeline + harness cards).
`/swarm` = `SwarmBoard` (agent swarm board) and `/org` = `OrgWall` (employee wall) are separate, older pages — neither carries the new harness content.

---

## A. Unfinished on the live page

### 1. Top bar / primary nav never updated — the whole point of the task
- Live `header nav` links are only: `/hx` Mission · `/briefing` Briefing · `/hydra` Hydra · `/swarm` Swarm · `/org` Org · `/meeting` Meeting · `/hx/log` Daily Log.
- `/integrate` is reachable **only** as the item "Integrate" inside the Product dropdown. Nothing in the nav is labelled to match the page, and no individual harness is reachable from the nav.
- `document.body.innerText.includes("Agent Army")` → **false**. The phrase the page is now about does not appear anywhere on the site.

### 2. Logo strip under the H2 shows 5 of 8 harnesses
- `RuntimeMarks compact` renders Claude, Grok Bot, Hermes Agent, OpenClaw, NVIDIA NAT only.
- Missing: **Gemini, OpenAI Codex, OpenAI dots** — the three that were added as cards.

### 3. Placeholder status text (5 cards)
- `Stub ready` ×4 → Claude, Grok Bot, Hermes Agent, NVIDIA NeMo Agent Toolkit
- `Gateway stub` ×1 → OpenClaw 2.0
- Third-party names these are placeholders for are not real product statuses.

### 4. Unfinished intro copy
- "These stubs show the contract — wire real EventSource / webhooks later." — a build note left in customer-facing copy.

### 5. Broken links: 3 endpoints 404
| Endpoint on the NVIDIA NeMo Agent Toolkit card | Live result |
|---|---|
| `POST /adapters/nvidia-nat/events` | **404** |
| `GET /adapters/nvidia-nat/entities` | **404** |
| `GET /adapters/nvidia-nat/graphs` | **404** |
- Contrast — every other listed endpoint returns 200: `/adapters/claude/events` 200, `/adapters/grok/events` 200, `/adapters/hermes/events` 200, `/adapters/openclaw/events` 200.
- No nav item or link in the current source points to `/space-bunny`, `/inbox`, or `/v1/*` (all 404), so those are stale URLs from an older nav — nothing to fix there.

### 6. Stale / mismatched copy
- NVIDIA card calls itself "the fifth harness" — an ordinal that breaks the moment the list is reordered.
- Card title says **"OpenClaw 2.0"**; the timeline says **"OpenClaw"**. Two names for one harness on one page.

### 7. Cards in arbitrary order, and no in-page navigation
- Live card order: Claude · Grok Bot · Hermes · OpenClaw 2.0 · NVIDIA NAT · OpenAI Codex · OpenAI dots · Gemini — which does **not** match the release-order timeline directly above it.
- No anchors and no section bar: the Timeline, Adapters, Dashboards, and At-work areas are not linkable.

### 8. Dashboard gallery is 5 of 8
- Only 5 screenshots (`what the dashboard looks like`): Claude Code, Grok Bot, Hermes, NVIDIA NAT, OpenClaw. No shot for Codex, dots or Gemini.

### 9. Layout defects at 390 px
- Card title truncated: "NVIDIA NeMo Agent Toolkit" is cut off by `truncate`.
- Widows (one or two words stranded on the last line): timeline label "2026)", timeline label "GA", the card maker line "(MIT)", and the Grok Bot description ending on "approval.".
- Horizontal overflow itself is already fixed on today's live build (`scrollWidth 390 == innerWidth 390`) — the earlier 11 px card overflow is gone; the two defects above remain.

### 10. Accessibility / semantics
- Each harness card is an `<h2>`, so the page has 8 H2s competing with the real section headings.

---

## B. Not in scope (recorded so nothing is claimed falsely)
- The site-wide fixed `DEMO DATA · mock tick` badge (`DemoDataBadgeGate`) can sit over content while scrolling on phones. Global, pre-existing, unchanged — James's call.
- The `RuntimeMarks` strip on home/HX (`/` and `/hx`) still shows 5 harnesses. Only the strip on this page is being replaced.
- `/showcase`'s nine films are fine — the "empty" Smart Channel tile is its dark opening frame, not a missing asset.

---

## C. Resolution (applied in this job)
Implementation is based on the Grok Bot patch already on disk (`M:\code\VidiBot\docs\agent-army-page-2026-10-11\agent-army-page.patch`), applied to `M:\code\VidiBot\vidiflow-hx` and then built + verified locally.

| # | Item | How it is resolved |
|---|---|---|
| 1 | Nav | New primary link **Agent Army → /integrate** between Meeting and Product; Product dropdown gains an "Agent Army · all 8 harnesses" section with a deep link to each card; mobile menu gets the same section |
| 2 | Logo strip | Replaced on this page by an "8 harnesses, one mission board" index (logo + maker + status per harness), each linking to its card |
| 3 | Placeholders | Replaced with honest statuses: **Demo endpoints** (5) / **Adapter planned** (3, in violet) |
| 4 | Intro copy | Rewritten to state what is real today and what is planned |
| 5 | 404s | Three `nvidia-nat` demo stubs added, matching the other stubs (`stub:true, demo:true`) |
| 6 | Stale copy | "fifth harness" removed; names now come from `engines.ts` — **OpenClaw** everywhere, with "OpenClaw 2.0 (v2026.8.1)" kept as a feature chip |
| 7 | Order + nav | Cards follow release order; each has an anchor id; new section bar (Harnesses · Timeline · Adapters · Dashboards · At work) |
| 8 | Gallery | Sixth shot added (Gemini API home); grid is 3×2; each shot links to its card |
| 9 | Layout | Titles wrap instead of truncating; `[text-wrap:balance]` / `pretty` added; timeline labels reworded to kill one-word last lines |
| 10 | Semantics | Card headings dropped to `<h3>`; sections keep `<h2>` with `aria-labelledby` |

**Still open for James (not fixable from the source alone):** real screenshots for OpenAI Codex and OpenAI dots (no local source exists); CDN upload of `gemini.png`, `openai.png` and the dashboard shots; and the "Agent Army" naming sign-off.

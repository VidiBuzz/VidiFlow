# SmartStack Builder — Initial Stages Documentation

Status as reviewed: Sept 11, 2026. Documents how the builder works today (initial/MVP stage), what is real vs. stubbed, and what each stage needs before it can go live.

## File inventory

| File | Role | State |
|---|---|---|
| `smartstack-builder.html` | **Primary builder UI** — "VidiSmart SmartStack Builder \| AI-Powered Enterprise Tech Stack Assembly". 611 lines, self-contained SPA. | Runs, but depends on unconfigured Supabase; falls back to hardcoded data |
| `smartstack-schema.sql` | Supabase/Postgres schema: 8 tables, 2 views, 2 RPC functions, seed data | Complete and runnable in Supabase SQL editor |
| `smartstack-ai-engine.js` | Express backend service (port 3001) — intended real AI recommendation engine with Gemini/OpenAI key support | Not wired to the HTML builder (not referenced anywhere) |
| `smart_stack_builder.html` | Older variant — "Smart Stack Builder \| Nano Banana 2.0" (14 KB) | Superseded by `smartstack-builder.html` |
| `smartstack.html` | Marketing/landing page — "AI Tech Stack Planner" | Static |
| `smart-stack-preview.html` | Preview page | Static |

## The builder's stages, as implemented today

### Stage 0 — Initialization & data load
`loadInitialData()` (smartstack-builder.html:255) on `DOMContentLoaded`:
1. Creates a Supabase client from **empty constants** (`SUPABASE_URL = ''`, `SUPABASE_ANON_KEY = ''` at line 235) — client creation with empty strings fails silently.
2. Queries three tables in order: `categories` (ordered by `display_order`) → `use_cases` (ordered by `complexity_level`) → `technologies` (ordered by `name`).
3. Populates: category filter dropdown, use-case sidebar cards, tech library cards (favicon pulled from `google.com/s2/favicons` per tech's `website_url`).
4. **On any error**: `showNotification` (an `alert()`) + `loadFallbackData()` — which only seeds 3 use cases (AI Video Pipeline, E-commerce, AI Chatbot) and **zero technologies and zero categories**. This is the de-facto state when opened from disk today.

### Stage 1 — Use case selection
`selectUseCase()` (line 387): clicking a sidebar card sets `currentUseCase`, toggles the `.active` style, and updates the AI status pill. No generation happens yet.

### Stage 2 — Stack generation ("Generate Stack" button)
Handler at line 401, two paths:
1. **Database path**: calls Supabase RPC `recommend_stack_for_use_case` (defined in smartstack-schema.sql:203) — returns top-10 verified public stacks matching the use-case slug within budget. If a result exists → `loadStackFromDatabase(data[0].stack_id)` — **note: this function is never defined**, so the DB path would throw even on success.
2. **"AI" path** (`generateStackWithAI()`, line 430): a simulated 5-step thinking sequence (800 ms each: analyze → select → compatibility → cost → diagram), then `getRecommendedTechnologies()` (line 453) returns from a **hardcoded 3-entry lookup table** keyed by slug — e.g. `ai-video-pipeline → [YOLO v11, FastAPI, PostgreSQL, Redis, AWS]` — filtered against `allTechnologies` (so in fallback mode, with an empty library, it returns nothing and the flowchart renders empty).

### Stage 3 — Architecture visualization
`buildFlowchartFromTechnologies()` (line 470) **ignores React Flow entirely** (the UMD bundle is loaded at line 9 but never instantiated; `#flowchart-canvas` is plain HTML). It renders a simple vertical list of tech cards separated by arrow icons. Drag-and-drop from the Tech Library only sets `dataTransfer` in `handleDragStart()` — there is **no drop handler on the canvas**, so manual assembly doesn't work. "Clear" resets canvas + state.

### Stage 4 — AI analysis panel
`showAIAnalysis()` (line 497) renders:
- **Est. Monthly Cost: random** (`sum + Math.random()*100` per tech — not real pricing).
- Setup time from the use case record (real).
- Three hardcoded green checkmarks ("compatible", "optimized", "budget in range") — not computed from the `integrations` table.

### Stage 5 — Export
Export button (line 588) downloads `smartstack-<slug>-<timestamp>.json` containing `{use_case, stack, timestamp}`. `currentStack.technologies/nodes/edges` are **never populated** by any code path, so exports are effectively empty except the use case and timestamp.

## Data layer (smartstack-schema.sql) — designed but unused

- **Tables**: `technologies` (pricing, deployment, maturity, scored 0–10, `use_cases` keyword array), `categories` (21 seeded), `use_cases` (10 seeded, budget + complexity), `smart_stacks` (generated solutions + `ai_confidence_score`), `stack_components` (join table with `layer`, flowchart x/y, config), `integrations` (tech↔tech compatibility: native/plugin/api/custom + difficulty), `user_preferences`, `stack_ratings`.
- **RPCs**: `find_compatible_technologies()` (compatibility walk, ordered easy→hard then performance) and `recommend_stack_for_use_case()` (budget-filtered, confidence-ranked) — both fully implemented in SQL, both unused by the frontend beyond the broken RPC call.
- **Views**: `popular_stacks` (rating aggregates over public stacks).
- Schema's own "next steps" note: import tech data from `vidismart.masterlist.html`, create integration mappings, build AI engine, deploy frontend.

## Initial-stage verdict (what's real vs. stub)

| Component | Status |
|---|---|
| Layout, styling, three-panel UX | ✅ Complete |
| Use-case selection | ✅ Works (after data loads) |
| Supabase integration | ⚠️ Wired but unconfigured (empty keys); schema exists but no evidence it was ever run/seeded |
| Stack recommendation | ❌ Hardcoded 3-pattern lookup + fake thinking delay |
| Flowchart | ❌ Static vertical list; React Flow loaded but unused; no drop target |
| Cost analysis | ❌ `Math.random()` |
| Compatibility claims | ❌ Hardcoded, `integrations` table ignored |
| Export | ⚠️ Works mechanically but exports empty stack |
| `smartstack-ai-engine.js` | ⚠️ Orphaned backend with real Gemini/OpenAI plumbing, never called |

## Recommended next stages (order of attack)

1. **Fix Stage 0**: run `smartstack-schema.sql` in Supabase, wire real URL/anon key, import the technology masterlist. This alone makes Stages 1, 2 (DB path) and the Tech Library live.
2. **Define `loadStackFromDatabase()`** so the RPC path renders instead of throwing.
3. **Wire the real AI engine**: point "Generate Stack" at `smartstack-ai-engine.js` (already has layer patterns, budget tiers, Gemini/OpenAI support) instead of the inline stub — one fetch call replaces `generateStackWithAI()`.
4. **Make the canvas real**: register the React Flow drop target so Tech Library drag-and-drop builds `currentStack.nodes/edges`; compute layout from `stack_components.layer`.
5. **Honest analysis**: replace random cost with per-tech pricing fields; drive compatibility checks from the `integrations` table via `find_compatible_technologies()`.
6. Then the export becomes meaningful (full stack JSON), and ratings/personalization tables activate naturally.

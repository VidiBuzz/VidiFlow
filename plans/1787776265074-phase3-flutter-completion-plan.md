# Phase 3 — React frontend + Smart Search (pgvector + fastembed)

**Date:** 2026-08-29 (supersedes the Flutter-completion plan)
**Parent plan:** `plans/1787616142189-vidismart-launch-smart-channel-plan.md` (source of truth)
**Repo:** `M:\code\vidismart\vidismart-community` (own git repo; last commit `ba49baa`)

## Context

User pivot 2026-08-29: **frontend is React, not Flutter**. The uncommitted `apps/flutter` scaffold (22 Dart files, untracked) is discarded. Separately, the master plan's placeholder "Neo4j/Vespa for AI search (phase 3)" (line 89) is resolved now: smart search ships on **pgvector in the existing Postgres** with **ONNX embeddings via fastembed-rs inside the Rust backbone** — fully open-source and self-hosted (hard constraint), zero new services, compatible with the fixed "Ubuntu fully native, no Docker" production decision (Vespa has no supported native Ubuntu install).

Phases 0–2 remain done: migrations 0001–0006 on staging (PG :5434, Redis :6390, Directus :8056), backbone :8060 with feed cache, GenUI publish + WS broadcast, moderation, enrichment on Stream `state.ready`; 49 Rust tests green. Uncommitted in monorepo: `apps/backend/src/routes/channels.rs` (+ `routes/mod.rs` wiring) — carry into the Phase 3 commit.

## Locked decisions

| Decision | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript SPA at `apps/web`; served by existing nginx (`infra/nginx/vidismart.conf`); no SSR/Next (self-hosted, no Vercel) |
| Flutter scaffold | Delete `apps/flutter` (untracked, never committed) |
| Smart database | **pgvector** on Postgres 15; staging image `postgis/postgis:15-3.3` → `pgvector/pgvector:pg15` (PostGIS unused — migration 0001 only guards the extension); prod box: `postgresql-15-pgvector` via apt |
| Embeddings | **fastembed-rs** (Apache-2.0, ONNX Runtime) in the backbone; model `BAAI/bge-small-en-v1.5`, **384 dims**; model dir `VSC_EMBEDDINGS_DIR` (default `./models`), one-time HF download, pre-seedable for offline boxes |
| Fallback | Model load fails / no model dir → search degrades to keyword-only (FTS + trigram); enrichment skips embedding; never a 500 |
| Search | Hybrid: `tsvector` FTS over title/desc/tags/ai_summary + `pg_trgm` typo tolerance + cosine on `videos.embedding`; **RRF fusion (k=60)** in the backbone; `GET /api/v1/search?q=&channel=&tag=&limit=&cursor=` |
| Embed when | enrichment job (after `ai_summary`), Stream `state.ready` path, plus one-shot backfill binary for existing rows |
| WASM | `vidismart-native` stays; binds from JS via wasm-pack output, lazy-loaded, optional in v1 (JS fallbacks for hashing/AV sniff) |
| Mobile | Out of scope at launch; revisit as PWA or React Native post-launch |

## Ordered tasks

1. **Amend master plan** (`plans/1787616142189-...md`, root repo): badges/stack table rows 7/34/35, mermaid CLIENTS (Flutter → React SPA), line 89 (`Neo4j/Vespa` → `pgvector + fastembed (ONNX)`), §7 rewrite as React build order, Phase 3 checklist, §11 validation (flutter test → vitest/Playwright), risk row 281 (playerBackend flag now iframe-vs-hls.js), open items 2/4. Commit root repo (docs-only).
2. **Delete** `vidismart-community/apps/flutter/` entirely.
3. **Migration `database/migrations/0007_smart_search.sql`:** `CREATE EXTENSION IF NOT EXISTS vector;` + `pg_trgm`; `ALTER TABLE videos ADD COLUMN embedding vector(384)`; HNSW index `vector_cosine_ops`; generated `search_doc tsvector` (title A, tags B, desc+ai_summary C) + GIN; GIN trigram on title. Apply via `scripts/migrate.sh` to staging.
4. **Staging Postgres image swap:** `infra/docker-compose.yml` postgres → `pgvector/pgvector:pg15` (same PG major 15, volume persists); `docker compose up -d postgres`; verify `SELECT extname FROM pg_extension` shows `vector`.
5. **Backend search core** (`apps/backend`): add `fastembed` dep; `src/embed.rs` — `OnceLock<TextEmbedding>` lazy init, `embed_text`/`embed_batch`, `is_available()`; config `VSC_EMBEDDINGS_DIR`, `VSC_EMBEDDING_MODEL` (+ `.env.example`); `jobs.rs` — embed `title + ai_summary + tags` after summary, `UPDATE videos SET embedding`; `routes/search.rs` — hybrid query, RRF fusion, visibility-aware (respect `visibility=members/paid` via entitlements like feed does); register in `routes/mod.rs` alongside the pending `channels.rs`.
6. **Backfill binary:** `apps/backend/src/bin/backfill_embeddings.rs` — batches rows where `embedding IS NULL`, idempotent, logs progress.
7. **Rust tests:** RRF fusion unit tests; embedder fallback (no model → `None`, search still 200 keyword-only); search route validation (empty `q` → 400); `cargo test` (49 existing stay green) + clippy clean. Commit: `Phase 3: React pivot + smart search (pgvector, fastembed, hybrid /search)` including `channels.rs`.
8. **Staging smoke:** run backfill for seed video `77e62283-...`; `curl /api/v1/search?q=keynote` returns it; typo query (`keynot`) still hits via trigram; no-key/keyword-only mode verified by stopping model dir availability.
9. **React scaffold** `apps/web` (`npm create vite@latest -- --template react-ts`): deps `react-router-dom`, `tus-js-client`; `src/core/{config,api,ws,auth}.ts` (port the Dart clients 1:1 — Directus auth, backbone feed/search, WS `genui_spec`/`video:*` events), `src/genui/{spec.ts,ThemeProvider.tsx}` (spec → CSS custom properties, live re-skin on WS event, palettes midnight/void/dusk/carbon), `src/features/{auth,feed,watch,search,channel,profile,threads,shop,upload}/`. Player: Stream iframe (`https://iframe.videodelivery.net/{uid}`) behind `playerBackend` flag. Search UI: debounced input + results page calling `/api/v1/search`.
10. **Serve + wire:** `npm run build` → dist mounted/served by staging nginx with SPA fallback at `/` (verify `/api` proxy + `/ws` upgrade already in `vidismart.conf`); dev server 5173 documented in `.PORT_ASSIGNMENTS.md`.
11. **React tests:** vitest + @testing-library — api client (fetch mock), genui spec→theme mapping, auth persistence (localStorage mock); `npm run test` green, `npm run build` clean.
12. **Close out:** flip master plan Phase 3 checkboxes (scaffold/theming/auth/feed/watch/search end-to-end on staging; channel/profile/threads/marketplace/pricing pages; GenUI renderer + live spec subscription); commit root repo.

## Deferred (explicit)

- Playwright E2E suite on the web build (lands after task 12 as its own pass).
- `vidismart-native` WASM wiring in React (JS fallbacks ship first).
- Search typeahead/autocomplete, personalization of results, query analytics.
- Multimodal CLIP-over-frames search (Phase 6 material).
- Mobile (PWA/React Native) post-launch.

## Validation plan

- `scripts/migrate.sh` applies 0007 cleanly; `pg_extension` shows `vector`, `pg_trgm`.
- `cargo test` green (existing 49 + new search/embed tests); clippy 0 warnings.
- Backfill logs N rows updated; `videos.embedding` populated for seed video.
- `curl` smoke: exact, typo, and filtered (`channel=`) queries return sane RRF-ordered results; keyword-only fallback returns 200 without model.
- `npm run test` + `npm run build` green in `apps/web`; staging nginx serves the SPA; login → feed → watch → search walk-through.
- Master plan diff: Flutter references gone, line 89 resolved, Phase 3 checkboxes flipped.

## Risks

- **fastembed model download** needs HuggingFace egress on first run — pre-seed `VSC_EMBEDDINGS_DIR` on the launch box; startup must not block on download (lazy init + fallback).
- **`ort`/ONNX build time** inflates backbone compile — pin fastembed default features, keep it out of the WASM crate.
- **Image swap on staging PG** — same major version (15→15) so the data volume is compatible; snapshot `infra/staging/database` before `up -d`.
- **React scope creep** — v1 pages are functional parity with the master plan §7 table, minimal styling beyond GenUI palettes; no component-library dependency.
- **384-dim lock-in** — changing model later means re-embedding; backfill binary makes that a maintenance task, not a migration crisis.

## Open items

- DNS cutover `community.vidismart.com` (Phase 4).
- Stripe keys (Phase 5), Cloudflare Stream prod creds (Phase 4).
- Waitlist alpha import from Railway prod source.

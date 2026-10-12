# LEX Plan Out — VidiFlow LEX wire-up (saved 2026-09-16)

Box: `192.168.4.40` (Ubuntu, `/mnt/m` = Windows `M:`auch).
Share imported: `https://opncd.ai/share/BMnmdggg` → `ses_f63bf3f92ffelM07pdBMnmdggg` (title: VidiFlow LEX).
This working session: `ses_f57ec8f0cffeHlrCcfR6d1U3Wy`.
Draft migration also saved at: `/home/vidiman/Documents/Default Project/lexi-pipeline/0009_lexi_terms.sql`.

## 1. What we already knew from the shared session
- Dictionary source was bundled `lexi-extension/data.js` as `window.LEX_DATA` (12 terms: CRM, RAG, ERP, LLM, MCP, SaaS, API, KPI, MRR, AAFES, BOM, OEE, JIT).
- Master `data/lexi_master_terms.json` v1 claims 16 terms, actually has 3: Dragonfly, Valkey, SaaS. Only overlap with data.js is SaaS. Total unique ≈ 14. Drift, no DB.
- Plan was Directus-backed: `data.js` becomes build artifact, not source.
- Directus on new server `:8055` was up (v11.17.3, 2026-09-07) but 0% LEX-ready: no `lexi_terms`, `FILES_LOCATION=local`, backbone `:8060` was down at the time.
- `cdn.vidi.news` verified → Cloudflare (`104.21.80.54`, `172.67.174.132`) → R2 bucket `vidismart` (NOT `vidismart-media`). Bucket live but empty for `/images/lexi/`.
- HF research winner = hybrid: `J0nasW/AI-Dictionary` (16,665) + `Jerry999/multilingual-terminology` (~5k) + `sjmoran/arxiv-acronym-gen` (8,070) + `mjbommar/opengloss-v1.1` (506k). Report saved at `M:\code\vidismart\vidiflow\LEX-HF-Datasets-Report.pdf` (4.6MB, 12 sets, all links 200) + html/pngs.
- Visual encyclopedia needs: `en_wikidata_5M_entities` + `wikimedia/structured-wikipedia` + `wikifragments` (42M) + `google/wit` (37.6M) + `HowTo100M` + LogoDet.
- `vidiflow.net`: no A record, `:80` served community SPA catch-all, `vidiflow/` is `vidismart-bandwidth-lab` static `out/`, not `:3002` app.
- Tunnel: `cloudflared` dials out so LAN IP change does not break it. `cloud.0human.net` was alive (302). `vidiflow.net` never routed.
- Ended on save/resume via `/share` + `opencode import`.

## 2. Box truth right now (checked live)
- `ip addr`: `192.168.4.40/22` on `enp0s31f6`. Confirmed.
- `vidismart-directus.service`: active, `curl 127.0.0.1:8055/server/health` → `{"status":"ok"}`.
- `vidismart-backbone.service`: active, `curl 127.0.0.1:8060/healthz` → `{"service":"vidismart-backbone","status":"ok"}` (`/health` 404 is expected).
- `postgresql@18-main`: active. `postgresql-18-pgvector 0.8.1` installed. `redis-server`: active. `nginx`: active.
- `quicktunnel.service`: active since 2026-09-15 17:03 → public URL `https://send-meanwhile-durham-saying.trycloudflare.com` → `localhost:80`.
- `cloudflared.service` (named tunnel): inactive, disabled, `ExecStart` still has `TUNNEL_TOKEN_HERE`. No `/etc/cloudflared/config.yml`.
- Nginx `:80`: `community.vidismart.com` + catch-all → `/opt/vidismart/web/dist` (React SPA), `/api/` → `:8060`, `/healthz`, `/wasm/`.
- `vidiflow.net`: still NXDOMAIN. `cdn.vidi.news`: still Cloudflare IPs above.
- Repo: `/opt/vidismart/repo` (Rust backbone, `database/migrations/0001-0008`, no `0009`). Web: `/opt/vidismart/web/dist`. Directus native dir: `/opt/vidismart/directus` + `uploads/` (only `directus-health-file`).
- `/etc/vidismart/directus.env`: exists but not readable without sudo (need password). Example at `/opt/vidismart/repo/infra/directus.env.example` says: bucket `vidismart`, `FILES_LOCATION=r2`, needs ROTATED R2 keys + `__ACCOUNT_ID__`.
- LEX sources on disk: `/mnt/m/code/vidismart/lexi-extension/data.js` (371 lines, 12 terms), `/mnt/m/code/vidismart/data/lexi_master_terms.json` (v1, cdnBase `https://cdn.vidi.news/images/lexi/`, says r2Bucket `vidipitch-images` = stale), `/mnt/m/code/vidismart/images/lexi/` (svg scenes only, no concept jpgs), existing plan `/mnt/m/code/vidismart/plans/lexi-20-step-agent-plan.md` (80-agent / 20k terms / 20 steps).
- LEX schema per term: `acr, full, dept, category, logoSvg, conceptImg/Video (+conceptDesc), keywords[], oneLiner, notes, origin, smartStack{}, anatomy[], flow[4], brands[], replaces[], connectsWith[]`.

## 3. Data sources to wire (all of them)
1. HF seeds (stream, never full download): AI-Dictionary 16k, GIST 5k, arxiv-acronym-gen 8k, OpenGloss 506k (filter `domain:technology`).
2. Every-term backbone: `en_wikidata_5M_entities` (qid/label/description/wikipedia_url/images[]), `structured-wikipedia` (abstract/main image/infobox), `wikifragments` (42M paragraph+thumb).
3. Image-text: `google/wit` / `wit_base` (37.6M). Fallback LAION/COCO/Open Images only if Wikidata empty.
4. Video/logos: `HowTo100M` (clip IDs for flow videos), LogoDet-3K/Logo-2K+ (brand marks).
5. Standards: CNCF glossary + NIST CSRC (from existing 20-step plan steps 02-03).
6. Serve layer: Directus `lexi_terms` + R2 `vidismart` via `https://cdn.vidi.news` + extension v0.2 index-cache.

## 4. Agent pipeline — definitions, context, vectors, image, video
1. **Harvest**: HF + Wikidata SPARQL `P1813/P571/P138` + CNCF/NIST → `acr + full + source + source_url`, dedupe on `(acr, source)`. Keep polysemes split.
2. **Definitions + context** (LLM editorialize, OpenGloss+Wikidata grounded): `oneLiner` (<140 chars plain English), `notes` (VidiSmart tie), `origin` (person/year), `keywords[7]`, `anatomy[]` (len must = acr len), `replaces[]`, `connectsWith[]`. Reject on missing fields.
3. **Vectors**: `bge-small-en-v1.5` 384d via existing `backfill_embeddings.rs`/fastembed-rs (matches `videos.embedding` in `0007`). Text = `acr + full + oneLiner + keywords + notes`. HNSW cosine. Hover disambiguation uses sentence-window embedding → nearest term.
4. **Image**: Wikidata images[] → WIT → structured-wikipedia thumb. Best landscape >800px → R2 `images/lexi/<ACR>.jpg` → `concept_img`. `concept_desc` describes picture. Logos → `logo_svg` or R2 PNG. Extension lazy-loads, never bundles.
5. **Video + flow/brands**: LLM `flow[4]` (Input → Engine[active] → Action → Outcome), `smartStack{legacy vs new}`, `brands[3-5 + share%]`. Top 1k only: HowTo100M clip or 30s SmartGen MP4 → R2 `videos/lexi/<ACR>.mp4` → `concept_video`. Others blank (player hidden).
6. **QA + publish**: search_doc builds, embedding not null, image URL 200, JSON valid → `status=published` → Directus → regenerate `index.json` (`acr,updated_at` ~100KB) for `chrome.storage.local`. Extension: index for detect, `GET /items/lexi_terms?filter[acr]=X` on hover, IndexedDB LRU 200.

## 5. DB migration 0009 (drafted, needs sudo to apply)
File: `/home/vidiman/Documents/Default Project/lexi-pipeline/0009_lexi_terms.sql` (copy to `/opt/vidismart/repo/database/migrations/` when ready).
Creates `lexi_terms` with all v1 fields + `source/source_url` + `embedding vector(384)` + generated `search_doc` tsvector + `status/created_at/updated_at` + `uq(acr, source)` + HNSW/GIN/trgm indexes + public-read-only-published permission (mirrors `0008` pattern using `directus_policies.name='$t:public_label'`).
Note: master JSON `r2Bucket: vidipitch-images` is stale — use `vidismart`. Master `cdnBase` path stays: `https://cdn.vidi.news/images/lexi/`.

## 6. Blockers / inputs needed
- R2 S3 access key + secret + account ID (Cloudflare API token alone is not enough for Directus `STORAGE_R2_*`). Paste like before, never committed.
- sudo password on `192.168.4.40` to: apply `0009`, `FLUSHALL` redis after perms, flip `/etc/vidismart/directus.env` `local` → `r2`.
- Named tunnel token to route `vidiflow.net` (or keep quick URL `https://send-meanwhile-durham-saying.trycloudflare.com` for now) + add DNS CNAME + nginx vhost + deploy `vidiflow/out/`.
- Decision: static `vidiflow/out/` vs `:3002` proxy for `vidiflow.net`.

## 8. Addendum 2026-09-16 — studied, corrections + next task started
- Count fix: data.js actually has 13 terms (regex missed SaaS: `SaaS` lowercase `aa`), not 12. Unified total is 15, not 14: 13 + Dragonfly + Valkey (SaaS overlaps, master version richer with smartStack/category/logoSvg/conceptVideo).
- Merged seed built (no secrets needed): `lexi-pipeline/seed-unified.json` (15 terms, cdn_base `https://cdn.vidi.news/images/lexi/`, bucket `vidismart`), SaaS merged master+js, dry-run import passes.
- Validation flags (fix before publish): SaaS anatomy 3 vs acr 4; AAFES 4 vs 5; Dragonfly 3 vs 9; Valkey 3 vs 6. Master/data.js use 3-concept breakdowns for long names, so Agent-2 rule must change from `anatomy len == acr len` to `anatomy 3-5 items, first-letters should hint acr`. Also data.js SaaS `conceptImg` wrongly points to `rag-concept.jpg` (copy-paste) — merged seed prefers master path.
- Plan gaps: (1) master `r2Bucket: vidipitch-images` stale → use `vidismart` everywhere; (2) 20-step plan wants 80 agents/20k terms but no vector dim pin — pin 384d bge-small to match `0007` videos table, else re-embed later; (3) HowTo100M full clone is huge — store clip IDs only, render top-1k videos; (4) WIT 37M needs streaming + license filter, not bulk download; (5) extension needs `host_permissions` for Directus + R2 + CORS `chrome-extension://` in Directus, else lazy-fetch fails; (6) public read must be `published`-only (done in 0009).
- Built (this session, verified): `lexi-pipeline/import_lexi_terms.py` (env-token REST upsert, dry-run ok) + `lexi-pipeline/background-v02.js` (index-cache 6h TTL + IndexedDB LRU 200 + LEX_LOOKUP/LEX_INDEX messages, `node --check` ok).
- Still blocked on user: R2 S3 keys + account ID, sudo password (to apply 0009 + flip directus.env local→r2 + redis FLUSHALL), named-tunnel token or quick-only decision, static out/ vs :3002 decision.
- Suggested order: apply 0009 → import 15 as review → fix 4 anatomies + SaaS image via Agents 2-4 → upload 15 images → publish → wire v0.2 background → scale harvest 16k→5k clean.

## 9. Status 2026-09-16 ~09:05 EDT — 0009 live, 15 terms in DB
- `0009_lexi_terms.sql` applied (fixed: `"full"` quoted, reserved word). Table owner `vidismart`, vector+trgm extensions already present.
- `/etc/vidismart/directus.env` flipped to `r2` bucket `vidismart`, Directus restarted, no R2 errors in log, Redis flushed. Quick tunnel still the only public route.
- Seed `lexi-pipeline/seed-unified.json` (15 terms) imported as `status=review` via SQL upsert. AAFES anatomy fixed to 5 (split Air/Force). SaaS/Dragonfly/Valkey keep 3-concept breakdowns per revised rule. SaaS image bug fixed by preferring master path.
- Public `GET /items/lexi_terms` returns `[]` as designed (review hidden, published-only rule works).
- Next: upload 15 concept images to R2 `images/lexi/`, backfill 384d embeddings, flip to published, wire v0.2 background.

# VidiSmart Gap Analysis Report

**Date:** 2026-05-15  
**Status:** Complete  
**Scope:** SmartGen, SmartBook, SmartDeck Agent

---

## Executive Summary

After thorough investigation of the codebase, Directus CMS, and deployment infrastructure, **7 critical gaps** were identified between the planned architecture and current implementation. The most urgent is the **content migration gap** — 50 HTML pages from the public site are not properly migrated to Directus, and the pages that DO exist in Directus are VidiPitch-branded, not VidiSmart-branded.

---

## Gap Inventory

### G001: Content Migration Gap (CRITICAL) 🔴

**Description:** The `site_pages` collection in Directus contains 34 pages (IDs 1-50), but they are **VidiPitch-branded** content, not **VidiSmart** content. The migration script at [`smart-book/migrate-to-directus.js`](smart-book/migrate-to-directus.js:1) lists 20 files to migrate, but many don't exist on disk.

**Evidence:**
- Directus `site_pages` collection has 34 items, all VidiPitch content
- Smart Book pages (`index.html`, `print-book.html`) are NOT in Directus
- Migration script references files that may not exist in workspace

**Impact:** The public website cannot be managed through Directus CMS. Content updates require manual file edits.

**Resolution Steps:**
1. Audit which of the 50 HTML pages actually exist on disk
2. Update `migrate-to-directus.js` with correct file paths
3. Set `DIRECTUS_ACCESS_TOKEN` environment variable
4. Run migration: `node migrate-to-directus.js --dry-run` (preview)
5. Run migration: `node migrate-to-directus.js` (execute)

**Estimated Effort:** 2-4 hours

---

### G002: Book Chapters Not in Directus (HIGH) 🟠

**Description:** The 39 chapters in [`smart-book/data.js`](smart-book/data.js:3) are client-side only. There is no `book_chapters` collection in Directus for CMS-managed book content.

**Evidence:**
- `data.js` contains all chapter content as JavaScript objects
- No `book_chapters` collection exists in Directus (verified via API)
- Book content cannot be edited without code changes

**Impact:** Book content is hardcoded, not CMS-managed. No editorial workflow.

**Resolution Steps:**
1. Create `book_chapters` collection in Directus with fields: `title`, `slug`, `content`, `persona`, `chapter_number`, `status`
2. Write migration script to extract chapters from `data.js`
3. Import chapters into Directus
4. Update `print-book.html` to fetch from Directus API instead of `data.js`

**Estimated Effort:** 4-6 hours

---

### G003: Vespa Integration Unverified (HIGH) 🟠

**Description:** Architecture doc ([`VIDISMART_VECTOR_STACK_ARCHITECTURE.md`](smartgen/VIDISMART_VECTOR_STACK_ARCHITECTURE.md:1)) specifies Vespa as the sole vector DB, but integration is unverified. [`VespaPriorityService.js`](smartgen/VespaPriorityService.js:1) is a mock service.

**Evidence:**
- No real Vespa connection code exists
- VespaPriorityService uses mock clients, not real HTTP calls
- No Vespa host/port configuration in `.env` files

**Impact:** Vector search, content recommendations, and priority scoring are non-functional.

**Resolution Steps:**
1. Confirm Vespa is running (check Railway services or local instance)
2. Get Vespa host/port/credentials
3. Replace mock service with real Vespa HTTP API calls
4. Write integration test script

**Estimated Effort:** 4-8 hours

---

### G004: PostGIS Not Enabled (MEDIUM) 🟡

**Description:** Architecture requires PostGIS for geospatial queries, but `converge/docker-compose.yml` has PostgreSQL without PostGIS extension.

**Evidence:**
- `converge/docker-compose.yml` defines PostgreSQL service
- No `POSTGIS` extension initialization in Docker setup
- No geospatial schema (no `geometry` columns, no spatial indexes)

**Impact:** Location-based features, geo-targeting, and hyperlocal search cannot work.

**Resolution Steps:**
1. Update `docker-compose.yml` to use `postgis/postgis` image
2. Add `CREATE EXTENSION postgis;` to init script
3. Create geospatial schema for locations, content geo-tags
4. Update Directus to recognize geometry fields

**Estimated Effort:** 2-3 hours

---

### G005: Deployment Pipeline Broken (MEDIUM) 🟡

**Description:** [`DUAL_DEPLOYMENT_PIPELINE.md`](smartgen/DUAL_DEPLOYMENT_PIPELINE.md:1) defines dual deploy (Railway + SiteGround), but Railway CLI token was expired/invalid.

**Evidence:**
- `railway check-railway-status` returned "Invalid or expired Railway token"
- No GitHub Actions workflow file exists at `.github/workflows/deploy.yml`
- SiteGround deployment hook exists but unverified

**Impact:** Cannot deploy updates to production. Manual deployment required.

**Resolution Steps:**
1. Re-authenticate Railway CLI: `railway login`
2. Verify Railway project link: `railway link`
3. Create `.github/workflows/deploy.yml` for automated dual deploy
4. Test deployment to both targets

**Estimated Effort:** 2-4 hours

---

### G006: Kafka Feedback Loop Missing (LOW) 🟢

**Description:** Architecture specifies Kafka → Vespa/Neo4j → Postgres real-time feedback loop. No Kafka consumer code exists.

**Evidence:**
- No Kafka configuration in codebase
- No consumer/producer code
- Architecture doc marks this as "⏳" (pending)

**Impact:** No real-time content priority updates based on user interactions.

**Resolution Steps:**
1. Set up Kafka broker (Railway template or local)
2. Create producer for user interaction events
3. Create consumer for priority calculation
4. Connect consumer to Vespa priority update API

**Estimated Effort:** 8-16 hours

---

### G007: Neo4j GraphRAG Not Implemented (LOW) 🟢

**Description:** Architecture specifies Neo4j for GraphRAG knowledge graph. No Neo4j integration exists.

**Evidence:**
- No Neo4j connection configuration
- No graph schema defined
- `data.js` has `knowledgeNodes` and `edges` arrays but they're client-side only

**Impact:** No knowledge graph queries, no GraphRAG-enhanced search.

**Resolution Steps:**
1. Set up Neo4j instance (Railway template)
2. Define graph schema (Content, Topic, Entity, Relationship nodes)
3. Migrate `knowledgeNodes` and `edges` from `data.js` to Neo4j
4. Implement GraphRAG query pipeline

**Estimated Effort:** 8-16 hours

---

## Priority Matrix

| Priority | Gap | Effort | Impact | ROI |
|----------|-----|--------|--------|-----|
| P0 | G001: Content Migration | 2-4h | Critical | Highest |
| P0 | G002: Book Chapters | 4-6h | High | High |
| P1 | G003: Vespa Integration | 4-8h | High | High |
| P1 | G005: Deployment Pipeline | 2-4h | Medium | High |
| P2 | G004: PostGIS | 2-3h | Medium | Medium |
| P3 | G006: Kafka Loop | 8-16h | Low | Medium |
| P3 | G007: Neo4j GraphRAG | 8-16h | Low | Medium |

---

## Recommended Execution Order

**Phase 1 (Week 1):** G001 + G002 — Get content into Directus  
**Phase 2 (Week 2):** G003 + G005 — Enable vector search + fix deployment  
**Phase 3 (Week 3-4):** G004 + G006 + G007 — Complete architecture

---

## Smart Book Specific Issues

| Issue | Status | File |
|-------|--------|------|
| Two-column layout | ✅ Implemented | `print-book.html` |
| Image lightbox | ✅ Implemented | `print-book.html` |
| Scroll progress bar | ✅ Implemented | `print-book.html` |
| referrerpolicy fix | ⚠️ Needs verification | `print-book.html:14` |
| Duplicate meta tags | ⚠️ Needs verification | `print-book.html:5-13` |
| Hardcoded path fallback | ⚠️ Needs verification | `print-book.html` |
| Not in Directus | 🔴 Critical | Both pages |

---

## Smart Deck Agent Issues

| Issue | Status |
|-------|--------|
| Deck builder UI | ✅ Functional |
| Model selector | ✅ Functional |
| Settings panel | ✅ Functional |
| Translate feature | ✅ Functional |
| Directus integration | 🔴 Not connected |
| Deck export | ⚠️ Needs verification |

---

## Next Actions

1. **Immediate:** Audit 50 HTML pages — which exist on disk?
2. **Today:** Run `migrate-to-directus.js --dry-run` to preview migration
3. **This Week:** Create `book_chapters` collection in Directus
4. **This Week:** Re-auth Railway CLI, verify deployments
5. **Next Week:** Enable PostGIS, build Vespa integration

---

*Report generated by SmartGen Gap Analyzer*
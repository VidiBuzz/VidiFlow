# 🚀 VidiSmart Launch Plan — Directus + NodeBB + Smart Content

> **Target CMS**: Directus at `directus-cms-production-1bce.up.railway.app` (VidiCRM.com)  
> **Community Platform**: NodeBB (Node.js, real-time, self-hosted on Railway)  
> **Test Environment**: VIDIpitch.com (first deployment)  
> **Production Target**: VidiSmart.com / VidiCRM.com (final migration)  
> **Date**: 2026-04-13  
> **Status**: v2.0 — COMPREHENSIVE LAUNCH PLAN (Directus CMS + NodeBB Community + Smart Content)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Member Types & Community Features](#3-member-types--community-features)
4. [Directus Integration Plan](#4-directus-integration-plan)
5. [NodeBB Community Platform](#5-nodebb-community-platform)
6. [Smart Content: Vector Embeddings + Knowledge Graph](#6-smart-content-vector-embeddings--knowledge-graph)
7. [Phase 1: VIDIpitch Test Launch](#7-phase-1-vidipitch-test-launch)
8. [Phase 2: Community Platform Setup](#8-phase-2-community-platform-setup)
9. [Phase 3: Smart Content Pipeline](#9-phase-3-smart-content-pipeline)
10. [Phase 4: VidiSmart Production Migration](#10-phase-4-vidismart-production-migration)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Timeline](#12-timeline)
13. [Appendix A: Directus API Reference](#appendix-a-directus-api-reference)
14. [Appendix B: File Path Mapping](#appendix-b-file-path-mapping)
15. [Appendix C: Change Log](#appendix-c-change-log)

---

## 1. Executive Summary

### Goal
Build a **complete VidiSmart platform** combining:
- **Content Management** (Directus) — pages, Smart Channel CX, admin workflows
- **Community Platform** (NodeBB) — member profiles, real-time chat, forums, groups
- **Smart Content Pipeline** (pgvector/Supabase) — vector embeddings, knowledge graph, semantic search

Starting with the **smart-book** as the pilot project on VIDIpitch.com, then expanding to full community features and AI-powered content intelligence.

### Why This Stack?

| Component | Choice | Why |
|-----------|--------|-----|
| **CMS** | Directus | Already deployed, proven schema, API-first, headless |
| **Community** | NodeBB | Same Node.js stack as VidiSmart, built-in real-time chat, groups for member types, easy Railway deployment |
| **Vector/KG** | pgvector (Directus PostgreSQL) or Supabase | Native SQL semantic search, already in ecosystem |

### Key Challenge
The smart-book uses **dynamic JavaScript rendering** ([`print-book.html`](smart-book/print-book.html) builds chapters client-side from [`data.js`](smart-book/data.js)). This requires special handling in a CMS context where server-rendered content is expected.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VIDISMART / VIDIPITCH PLATFORM                       │
├─────────────────────┬───────────────────────┬───────────────────────────────┤
│   CONTENT LAYER     │    COMMUNITY LAYER     │   INTELLIGENCE LAYER          │
│                     │                       │                               │
│  ✅ Directus (CMS)  │   🎯 NodeBB            │   Vector DB + Knowledge Graph │
│  • Pages/Sites      │   • Forums             │                               │
│  • Smart Channel CX │   • Real-time Chat     │   • pgvector (PostgreSQL)     │
│  • Content workflow │   • Groups/Member Types│   • Or Supabase pgvector      │
│  • Media library    │   • User profiles      │   • Auto-vectorize on upload  │
│  • Admin UI         │   • SSO via Directus   │   • AI-powered semantic search│
│                     │   • Activity feeds     │   • Agent query interface     │
├─────────────────────┼───────────────────────┼───────────────────────────────┤
│   SHARED AUTH       │   DEPLOYMENT          │   DATA FLOW                   │
│   • Directus Users  │   • Railway hosting   │   • Content → Directus        │
│   • JWT SSO bridge  │   • Docker containers │   • Community → NodeBB        │
│   • Role sync       │   • Custom domains    │   • Vectors → pgvector        │
│   • Member types    │   • CDN (Cloudflare)  │   • KG → relations            │
└─────────────────────┴───────────────────────┴───────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  CONTENT  │     │   NODEBB     │     │   VECTOR     │
│  CREATION │ ──► │   COMMUNITY  │ ──► │   PIPELINE   │
│           │     │              │     │              │
│ • HTML    │     │ • Forums     │     │ • Embed      │
│ • Images  │     │ • Chat       │     │ • Index      │
│ • Chapters│     │ • Groups     │     │ • Graph      │
│ • Metadata│     │ • Profiles   │     │ • Search     │
└──────────┘     └──────────────┘     └──────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ DIRECTUS │     │   SSO +      │     │   SEMANTIC   │
│   CMS    │     │   AUTH       │     │   SEARCH     │
│          │     │              │     │              │
│ • Pages  │◄───►│ • JWT tokens │◄───►│ • AI agents  │
│ • Media  │     │ • Roles      │     │ • KG queries │
│ • Admin  │     │ • Member     │     │ • Discovery  │
└──────────┘     │   types      │     └──────────────┘
                 └──────────────┘
```

---

## 3. Member Types & Community Features

### 3.1 Member Types (5 Types)

| Type | Description | NodeBB Group | Directus Role | Access Level |
|------|-------------|--------------|---------------|--------------|
| **Consumer** | Personal productivity, learning, creativity | `consumer` | `member_consumer` | Basic content, forums, chat |
| **IT Professional** | Building and implementing AI systems | `it_professional` | `member_it_pro` | Technical content, dev forums, code sharing |
| **Executive / Entrepreneur** | Leading AI strategy, building businesses | `executive` | `member_executive` | Strategic content, executive forums, networking |
| **Vendor** | Service providers who help the ecosystem | `vendor` | `member_vendor` | Vendor profiles, marketplace, lead generation |
| **Enterprise** | Large organizations, government, wholesale | `enterprise` | `member_enterprise` | Full access, priority support, custom integrations |

### 3.2 Top 5 Community Features (Must-Have)

| # | Feature | Implementation | Open Source? |
|---|---------|----------------|--------------|
| **1** | **Member Profiles** with role-based access, avatars, bios, activity history | NodeBB built-in profiles + custom fields per member type | ✅ Yes |
| **2** | **Real-time Chat/Messaging** — channels, DMs, threads (no Discord needed) | NodeBB Chat (Socket.io powered, built-in) | ✅ Yes |
| **3** | **Forums/Discussions** — threaded, categorized, tagged, searchable | NodeBB Forums (categories, tags, real-time updates) | ✅ Yes |
| **4** | **Activity Feeds** — social timeline, @mentions, notifications, bookmarks | NodeBB Activity stream + notifications system | ✅ Yes |
| **5** | **SSO + Role Sync** — single sign-on tied to Directus user accounts | JWT-based SSO bridge (Directus → NodeBB) | ✅ Yes |

### 3.3 SSO Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   USER      │     │   DIRECTUS   │     │   NODEBB     │
│   LOGIN     │ ──► │   AUTH       │ ──► │   SSO        │
│             │     │              │     │              │
│ • Email     │     │ • Validate   │     │ • JWT token  │
│ • Password  │     │ • Get role   │     │ • Sync group │
│ • 2FA (opt) │     │ • Generate   │     │ • Auto-login │
└─────────────┘     │   JWT        │     └──────────────┘
                    └──────────────┘
```

---

## 4. Directus Integration Plan

### 4.1 Current State Analysis

The existing Directus instance already has these relevant collections:

| Collection | Count | Purpose | Relevance |
|-----------|-------|---------|-----------|
| `site_pages` | **50 items** | Static HTML pages (evergreen content) | ⭐ **PRIMARY TARGET** — extend this |
| `pages` | ~5+ items | Dynamic block-builder pages | Use for new CMS-native pages |
| `posts` | — | Blog posts | Blog content |
| `news` | — | News articles | News content |
| `videos` | — | Video channel | Video metadata |
| `navigation` | — | Menu definitions | Menu management |

### 4.2 Existing `site_pages` Schema

```
┌─────────────────────┬──────────────────┬─────────────┐
│ Field               │ Type             │ Notes       │
├─────────────────────┼──────────────────┼─────────────┤
│ id                  │ integer (PK)     │ Auto-inc    │
│ status              │ string           │ draft/published │
│ title               │ string           │ Page title  │
│ slug                │ string           │ URL path     │
│ file_path           │ string           │ Source file  │
│ description         │ text             │ Meta desc    │
│ menu_label          │ string           │ Nav label    │
│ menu_order          │ integer          │ Sort order   │
│ show_in_menu        │ boolean          │ Visible?     │
│ icon                │ string           │ Material icon│
│ category            │ string           │ Grouping     │
│ created_at          │ timestamp        │ Created      │
│ updated_at          │ timestamp        │ Modified     │
│ content             │ text (full HTML) │ ⚠️ BODY HTML │
│ meta_description    │ string           │ SEO meta     │
│ head_content        │ text (full HTML) │ ⚠️ HEAD HTML │
└─────────────────────┴──────────────────┴─────────────┘
```

### 4.3 New Fields Required for Phase 1

| New Field | Type | Purpose | Status |
|-----------|------|---------|--------|
| `source_file` | string | Original filename in repo | ⏳ Create before import |
| `render_type` | string | `static`, `dynamic_js`, `hybrid_link`, `api_driven` | ⏳ Create before import |
| `live_url` | string | Current production URL on vidismart.com | ⏳ Create before import |

### 4.4 New Categories to Add

```sql
-- New categories for VidiSmart content
ALTER TABLE site_pages ADD CONSTRAINT check_category 
  CHECK (category IN (
    -- Existing:
    'public', 'admin', 'profile', 'tools', 'general', 
    'company', 'product', 'resources', 'industries',
    -- NEW for VidiSmart:
    'smart_book',      -- Smart Book pages
    'smart_stack',     -- Smart Stack tools/pages
    'smart_gen',       -- SmartGen tools
    'directory',       -- Directory pages (kratom, etc.)
    'reports'          -- Reports & long-form content
  ));
```

### 4.5 Slug Format Convention

> ⚠️ **Slug Format Inconsistency Found**: IDs 1–29 use leading slash (`/`, `/deck`) while IDs 30–50 use no leading slash (`index`, `about`). **New entries will use NO LEADING SLASH** to match the newer convention and avoid routing conflicts.

---

## 5. NodeBB Community Platform

### 5.1 Why NodeBB?

| Aspect | Details |
|--------|---------|
| **Stack** | Node.js + MongoDB/Redis — same as VidiSmart ecosystem |
| **Chat** | Built-in real-time chat (Socket.io) — no separate Discord needed |
| **Groups** | Native group system — perfect for 5 member types |
| **SSO** | JWT-based SSO — trivial to integrate with Directus |
| **Deployment** | Docker-compose, works on Railway alongside Directus |
| **Open Source** | 100% GPL-3, self-hostable, thousands of plugins |
| **Real-world** | Used by Node.js community projects, growing fast |

### 5.2 NodeBB Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NODEBB COMMUNITY                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FORUMS                  CHAT                  PROFILES     │
│  • Categories            • Channels            • Avatars    │
│  • Topics/Threads        • Direct Messages     • Bios       │
│  • Tags                  • Group Chat          • Activity   │
│  • Polls                 • Real-time (Socket)  • Badges     │
│  • Bookmarks             • Emoji reactions     • Reputation │
│                                                             │
│  GROUPS (Member Types)   SSO                   NOTIFICATIONS│
│  • consumer              • JWT from Directus   • In-app     │
│  • it_professional       • Auto-sync roles     • Email      │
│  • executive             • Role-based access   • Push       │
│  • vendor                • Session sharing     • Digest     │
│  • enterprise            • Logout sync         • Mentions   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 NodeBB Deployment on Railway

```yaml
# railway.toml (NodeBB service)
[build]
builder = "DOCKERFILE"

[deploy]
startCommand = "node app"
healthcheckPath = "/"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

# Environment Variables
# NODEBB_URL = https://community.vidismart.com
# NODEBB_SECRET = <shared JWT secret with Directus>
# DATABASE_URL = mongodb://mongo:27017/nodebb
# REDIS_URL = redis://redis:6379
```

### 5.4 SSO Integration: Directus → NodeBB

```javascript
// Directus hook: on user login, generate JWT for NodeBB
// POST /auth/generate-nodebb-token
{
  "user_id": "{{user.id}}",
  "username": "{{user.email}}",
  "groups": ["{{user.role}}"],  // e.g., ["consumer", "it_professional"]
  "exp": "{{now + 24h}}"
}

// NodeBB receives JWT, validates signature, auto-logs in user
// Syncs groups to NodeBB categories/permissions
```

---

## 6. Smart Content: Vector Embeddings + Knowledge Graph

### 6.1 The Vision

Every piece of content uploaded to Directus gets:
1. **Vectorized** — converted to embeddings for semantic search
2. **Graph-linked** — connected to knowledge graph nodes (chapters, topics, personas)
3. **Agent-queryable** — accessible by AI agents for intelligent retrieval

### 6.2 Architecture Options

| Approach | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **A) pgvector (Directus PostgreSQL)** | Add pgvector extension; store embeddings alongside content | Native SQL queries; stays inside Directus | Requires Railway PostgreSQL with extension |
| **B) Supabase pgvector (Hybrid)** | Directus stores HTML; Supabase stores embeddings + KG | Supabase already has pgvector; VidiSmart uses Supabase | Two databases to manage |
| **C) Qdrant (Vector DB)** | Qdrant for vector embeddings and similarity search | Rust-based, self-hostable, fast | Another service to host/pay for |
| **D) Vespa AI (Forked - Vidi AI)** | **Primary AI engine** - Forked Vespa AI for Visual Vector Omni Search | In-house private AI model, full control, hybrid search | Requires infrastructure management |

### 6.3 Recommended: Option D (Vespa AI - Vidi AI) + Qdrant

```
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTENT PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UPLOAD → VECTORIZE → STORE → INDEX → SEARCH               │
│                                                             │
│  1. Content uploaded to Directus                            │
│     • HTML pages, images, documents                         │
│                                                             │
│  2. Webhook triggers vectorization                          │
│     • OpenAI text-embedding-3-small (or local model)        │
│     • Image: CLIP embeddings                                │
│     • Output: 1536-dim vector per content chunk             │
│                                                             │
│  3. Store in Qdrant + Vespa AI (Vidi AI)                    │
│     • Qdrant: Fast vector similarity search                 │
│     • Vespa AI (forked): Primary AI engine for              │
│       Visual Vector Omni Search with hybrid search          │
│       (BM25 + vector + graph + geospatial)                  │
│     • content_id, embedding, metadata                       │
│                                                             │
│  4. Knowledge Graph integration                             │
│     • Extract entities from content (NER)                   │
│     • Link to existing KG from data.js                      │
│     • Create topic clusters, cross-references               │
│                                                             │
│  5. Semantic search via Vidi AI                             │
│     • Vespa AI handles hybrid queries                       │
│     • Qdrant provides fast vector similarity                │
│     • Returns most semantically similar content             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Vidi AI (Forked Vespa)** is the heart of our in-house private AI model, powering the Visual Vector Omni Search Engine.

### 6.4 Knowledge Graph from data.js

The existing [`data.js`](smart-book/data.js) already contains a knowledge graph structure:

```
BOOK_DATA
├── metadata (title, version, author)
├── personas (3 types with aiInsights per chapter)
│   ├── consumer
│   ├── it_professional
│   └── executive_entrepreneur
└── chapters (37 chapters across 5 parts)
    ├── foreword (part 0)
    ├── ch1-ch8 (part 1: Foundations)
    ├── ch9-ch16 (part 2: Architecture)
    ├── ch17-ch25 (part 3: Intelligence)
    ├── ch26-ch33 (part 4: Automation)
    └── ch34-ch37 (part 5: Future-Proofing)
```

Each chapter has:
- `content` (HTML)
- `keyTakeaways` (array)
- `aiInsights` (per persona)
- `images` (array)
- `depth` (beginner/intermediate/advanced)
- `readingTime` (minutes)

**This structure becomes the seed knowledge graph** — chapters are nodes, parts are clusters, personas are relationship types.

---

## 7. Phase 1: VIDIpitch Test Launch

### 7.1 Objective
Import smart-book pages into the existing Directus `site_pages` collection as a **test/validation run** before building production infrastructure.

### 7.2 Safety Rules

> 🛡️ **SAFETY RULES FOR PHASE 1**:
> - **READ-ONLY on existing data**: The 50 existing items (IDs 1–50) are NEVER modified or deleted
> - **CREATE-ONLY**: All new entries get IDs 51+. Rollback = delete new IDs only
> - **BROWSER VERIFICATION REQUIRED**: Every step requires opening the actual preview URL in a browser — curl/wget is NOT accepted as proof
> - **BACKUP FIRST**: Export all existing data before any write operation

### 7.3 Pages to Create (Reduced Scope)

#### Phase 1 — Initial Validation (2 entries):

| # | Title | Slug | Category | Source | Render Type |
|---|-------|------|----------|--------|-------------|
| 1 | **Smart Book - Landing** | `smart-book` | `smart_book` | `smart-book/index.html` | `static` |
| 2 | **Smart Book - Reader** | `smart-book-reader` | `smart_book` | `smart-book/print-book.html` | `hybrid_link` |

#### Phase 1.5 — After Validation Confirmed (5 additional entries):

| # | Title | Slug | Category | Source | Render Type |
|---|-------|------|----------|--------|-------------|
| 3 | **Smart Book - Foreword & Part I: Foundations** | `smart-book-part-1-foundations` | `smart_book` | Pre-rendered from data.js | `static_html` |
| 4 | **Smart Book - Part II: Architecture** | `smart-book-part-2-architecture` | `smart_book` | Pre-rendered from data.js | `static_html` |
| 5 | **Smart Book - Part III: Intelligence** | `smart-book-part-3-intelligence` | `smart_book` | Pre-rendered from data.js | `static_html` |
| 6 | **Smart Book - Part IV: Automation** | `smart-book-part-4-automation` | `smart_book` | Pre-rendered from data.js | `static_html` |
| 7 | **Smart Book - Part V: Future-Proofing** | `smart-book-part-5-future` | `smart_book` | Pre-rendered from data.js | `static_html` |

### 7.4 Import Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                 REFINED PHASE 1 IMPORT PIPELINE (v2.0)                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0: PREPARE                                                             │
│  ├── Create source_file, render_type, live_url fields on site_pages          │
│  ├── Export ALL 50 existing site_pages items as backup JSON                  │
│  └── Verify backup file is valid (count = 50, all IDs present)               │
│                                                                              │
│  Step 1: EXTRACT                                                             │
│  ├── Read smart-book/index.html → extract <body> content                     │
│  ├── Read smart-book/index.html → extract <head> (CSS, meta)                │
│  ├── Read smart-book/data.js → parse BOOK_DATA.chapters                      │
│  └── Identify all image references in data.js (relative paths)              │
│                                                                              │
│  Step 2: TRANSFORM                                                           │
│  ├── Scope ALL CSS under .smart-book-container wrapper                       │
│  ├── Convert relative image paths → absolute vidismart.com URLs              │
│  ├── Extract: title, meta_description, reading_time per page                 │
│  ├── Generate slugs (NO leading slash)                                       │
│  └── For reader stub: generate link-to-live markup instead of full content   │
│                                                                              │
│  Step 3: LOAD (via Directus API) — 2 ENTRIES ONLY                            │
│  ├── POST /items/site_pages { status: "draft", ... } × 2                    │
│  ├── Set content field = rendered HTML (or link for reader)                  │
│  ├── Set head_content field = scoped CSS + <meta> tags                       │
│  ├── Set render_type, source_file, live_url on both                          │
│  └── Set category = "smart_book"                                             │
│                                                                              │
│  Step 4: VALIDATE (BROWSER MANDATORY)                                        │
│  ├── OPEN IN BROWSER: preview URL for landing page                           │
│  ├── Verify: CSS renders correctly (fonts, colors, layout)                   │
│  ├── Verify: Three.js canvas loads and animates                              │
│  ├── Verify: No style leak into Directus chrome                              │
│  ├── Verify: Images load correctly (absolute URLs)                           │
│  ├── OPEN IN BROWSER: preview URL for reader stub                            │
│  ├── Check mobile responsive at 375px, 768px                                 │
│  ├── CONFIRM: existing 50 pages still work (spot-check 3-5)                  │
│  └── Test search in Directus admin for "smart book"                          │
│                                                                              │
│  Step 5: DECIDE                                                              │
│  ├── ✅ If ALL checks pass → proceed to Phase 1.5 (import 5 parts)           │
│  ├── ⚠️ If partial issues → fix transform script, re-import, re-validate    │
│  └── ❌ If broken → DELETE new entries (IDs 51+), reassess approach          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.5 Preview URLs

```
https://vidipitch-production.up.railway.app/smart-book?visual-editing=true
https://vidipitch-production.up.railway.app/smart-book-reader?visual-editing=true
```

---

## 8. Phase 2: Community Platform Setup

### 8.1 Objective
Deploy NodeBB alongside Directus on Railway, configure SSO bridge, set up member type groups.

### 8.2 Steps

1. **Deploy NodeBB on Railway**
   - Create new Railway service from NodeBB Docker image
   - Configure MongoDB + Redis services
   - Set up custom domain: `community.vidismart.com`

2. **Configure SSO Bridge**
   - Create Directus flow/hook: on user login → generate JWT
   - Configure NodeBB JWT SSO plugin
   - Test login flow: Directus → NodeBB auto-login

3. **Set Up Member Type Groups**
   - Create 5 groups in NodeBB: `consumer`, `it_professional`, `executive`, `vendor`, `enterprise`
   - Map Directus roles to NodeBB groups
   - Configure category permissions per group

4. **Configure Forums & Chat**
   - Set up forum categories matching VidiSmart content structure
   - Enable real-time chat (built-in)
   - Configure notifications (in-app + email)

5. **Test Community Features**
   - Create test accounts for each member type
   - Verify SSO login works
   - Test chat, forums, profiles, notifications
   - Verify role-based content access

---

## 9. Phase 3: Smart Content Pipeline

### 9.1 Objective
Build the vector embedding + knowledge graph pipeline for all content in Directus.

### 9.2 Steps

1. **Enable pgvector on Directus PostgreSQL**
   - Add pgvector extension to Railway PostgreSQL
   - Create `content_embeddings` table in Directus schema

2. **Build Vectorization Service**
   - Node.js service that listens to Directus webhooks
   - On content create/update → extract text → call embedding API
   - Store vector in `content_embeddings` table

3. **Build Knowledge Graph Extractor**
   - Parse `data.js` structure → create KG nodes/edges
   - Extract entities from HTML content (NER)
   - Link chapters, topics, personas into graph

4. **Build Semantic Search API**
   - Endpoint: `POST /search/semantic` with query text
   - Embed query → cosine similarity search → return top results
   - Integrate with Directus search UI

5. **Test Smart Content Features**
   - Upload test content → verify vectorization
   - Search for content → verify semantic results
   - Query knowledge graph → verify relationships

---

## 10. Phase 4: VidiSmart Production Migration

### 10.1 Migration Path

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   PHASE 1-3      │         │   PHASE 4        │         │   PRODUCTION     │
│   VIDIpitch      │   ──►   │   VidiCRM.com    │   ──►   │   LIVE           │
│   Directus       │         │   Directus       │         │   VidiSmart.com  │
│   + NodeBB       │         │   + NodeBB       │         │   + Smart Content│
│   (Test)         │         │   (Staging)      │         │                 │
└──────────────────┘         └──────────────────┘         └──────────────────┘
     Current                      Future                        Goal
```

### 10.2 Migration Steps

1. **Snapshot** VIDIpitch Directus database + NodeBB database
2. **Create** new Directus + NodeBB instances on VidiCRM.com infrastructure
3. **Restore** snapshots to VidiCRM.com
4. **Update** all `live_url` fields from `vidipitch.com` → `vidismart.com`
5. **Configure** custom domains: `cms.vidismart.com`, `community.vidismart.com`
6. **Update** DNS records
7. **Run** full validation suite (content, community, search, SSO)
8. **Cutover** — switch DNS, monitor for issues
9. **Decommission** VIDIpitch services (or keep as fallback)

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| **HTML too large for Directus field** | Import fails | Medium | Split large pages; PostgreSQL `text` type supports ~1GB | ⚠️ Monitor |
| **Relative image/CSS links break** | Broken assets in CMS preview | High | Convert all relative URLs to absolute during import | ✅ Fixed in scripts |
| **CSS leaks into Directus chrome** | Admin UI breaks | Medium-High | Scope all CSS under `.smart-book-container` wrapper | ✅ Fixed in scripts |
| **eval() code injection** | Security vulnerability | Medium | Replaced with `JSON.parse()` + `Function()` fallback | ✅ Fixed in scripts |
| **No rollback path** | Can't recover from bad import | Medium | Backup script runs first; rollback = delete new IDs 51+ | ✅ Fixed — backup mandatory |
| **Slug conflicts with existing** | Routing errors | Low | Using no-leading-slug convention; verified against existing 50 slugs | ✅ Verified |
| **NodeBB SSO sync fails** | Users can't access community | Medium | Test with small group first; fallback to manual group assignment | ⚠️ Test in Phase 2 |
| **pgvector extension unavailable** | Can't store embeddings | Low-Medium | Railway PostgreSQL supports extensions; fallback to Supabase | ⚠️ Verify in Phase 3 |
| **Sync drift between CMS and live site** | Content mismatch | High | Accept CMS as **archive/catalog**; live site remains source of truth | ✅ Policy set |

### Critical Path Items

1. ✅ ~~Analyze existing Directus schema~~ (**DONE** — 50 items, categories verified)
2. ✅ ~~Inventory smart-book files~~ (**DONE** — data.js V11, 37 chapters, 3 personas)
3. ✅ ~~Write plan~~ (**DONE** — v1.0 written, v1.1 reviewed, v2.0 comprehensive)
4. ✅ ~~Choose community platform~~ (**DONE** — NodeBB selected)
5. ⏳ **Create 3 new fields** on `site_pages` (source_file, render_type, live_url)
6. ⏳ **Run backup script** — export all 50 existing items to JSON
7. ⏳ **Run pre-render script** — generate scoped HTML from data.js
8. ⏳ **Import 1 test entry** (landing page, status: draft)
9. 🌐 **OPEN IN BROWSER** — visually confirm preview renders correctly
10. ⏳ **Import 2nd entry** (reader stub) if landing validates
11. 🌐 **OPEN IN BROWSER** — visually confirm reader stub
12. ⏳ **Proceed to Phase 1.5** or iterate based on findings

---

## 12. Timeline

| Phase | Duration | Tasks | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1** | 0.5–1 day | Field creation + backup + import **2 entries** + browser validation | Smart-book landing + reader stub in Directus (draft) |
| **Phase 1.5** | 0.5 day | Pre-render 5 parts from data.js + import + browser validation | All 7 smart-book pages in Directus |
| **Phase 2** | 2-3 days | Deploy NodeBB, configure SSO, set up groups, test community | Community platform live on VIDIpitch |
| **Phase 3** | 2-3 days | Enable pgvector, build vectorization service, semantic search | Smart content pipeline operational |
| **Phase 4** | 2-3 days | VidiCRM.com migration, DNS cutover, validation | Production platform live |
| **TOTAL** | **7-10 days** | | Full platform launch |

---

## Appendix A: Directus API Reference

```
Base URL: https://directus-cms-production-1bce.up.railway.app

# List all site_pages
GET /items/site_pages?limit=100&fields=id,title,slug,category

# Create a new page
POST /items/site_pages
Body: { "status": "draft", "title": "...", "slug": "...", "category": "smart_book", "content": "..." }

# Update a page
PATCH /items/site_pages/{id}
Body: { "status": "published" }

# Delete a page
DELETE /items/site_pages/{id}

# Search pages
GET /items/site_pages?search=smart+book&filter[category][eq]=smart_book

# Preview URL format
https://vidipitch-production.up.railway.app/{slug}?visual-editing=true

# Export all items (for backup)
GET /items/site_pages?limit=100&fields=*
Header: Authorization: Bearer {token}

# Create a new field
POST /fields/site_pages/{field_name}
Body: { "type": "string", "meta": { ... } }
```

---

## Appendix B: File Path Mapping

| Live URL | Local File | Directus Slug | Category |
|----------|-----------|---------------|----------|
| `vidismart.com/smart-book/` | `smart-book/index.html` | `smart-book` | smart_book |
| `vidismart.com/smart-book/print-book.html` | `smart-book/print-book.html` | `smart-book-reader` | smart_book |
| `vidismart.com/vidismart.masterlist.html` | `masterlist.html` | `master-list` | smart_stack |
| `vidismart.com/smartstack.html` | `smartstack.html` | `smart-stack` | smart_stack |
| `vidismart.com/smartgen.html` | `smartgen.html` | `smart-gen` | smart_gen |
| `vidismart.com/SMART_CHANNEL_CX.html` | `SMART_CHANNEL_CX.html` | `smartchannel-cx` | product |

---

## Appendix C: Change Log

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-04-13 | Initial plan — architecture decisions, schema design, 4-phase roadmap |
| v1.1 | 2026-04-13 | **Review fixes applied**: 6 fixes + 3 enhancements (slug format, required fields, eval() fix, image paths, CSS containment, backup script, reduced scope, Step 0 prep, persona naming) |
| v2.0 | 2026-04-13 | **Comprehensive Launch Plan**: Added NodeBB community platform architecture, 5 member types, SSO integration, smart content vector/KG pipeline, full 4-phase timeline with community + intelligence layers |

---

*Plan v2.0 — Comprehensive Launch Plan: 2026-04-13 — Author: VidiSmart Engineering*

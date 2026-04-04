# VCRM - VidiCRM.com Master Plan
## Full Business Suite CRM + AI-Powered Client Management Platform

**Document Version:** 1.1
**Date:** 2026-02-16
**Stack:** Directus 10 + PostgreSQL 16 + Redis 7 + Neo4j 5 + Vespa 8
**Domain:** vidicrm.com
**Local Dev:** http://localhost:8055

---

## PRIORITY #1: VidiAI "Ask Vidi" Search Engine (Vespa)

**The Vespa-powered VidiAI search engine is the core differentiator and must be perfected FIRST.**
Everything else in this CRM is built around it. Vespa is not a supporting service - it IS the product intelligence layer. Every collection, every client profile, every piece of content gets indexed into Vespa and becomes searchable through the "Ask Vidi" interface.

**Existing Code (already built):**
- `vidiflow/frontend/components/AskVidiAI.tsx` - Floating chat widget
- `vidiflow/frontend/components/VidiAiAdmin.tsx` - Admin panel (416 lines)
- `vidiflow/frontend/app/api/ask-vidi-ai/route.ts` - RAG endpoint (Vespa + Grok 4.1 Fast)
- `vidiflow/frontend/app/api/search/route.ts` - Hybrid search (vector + BM25 + hybrid)
- `vidiflow/frontend/app/api/admin/vespa/documents/route.ts` - Document CRUD
- `vidiflow/frontend/lib/vespa.ts` - TypeScript client library
- `vidiflow/backend/vespa-schemas.sd` - Schemas (ai_news, companies, tools)

**What needs to happen NOW:**
1. Deploy Vespa application package with CRM-specific schemas (see Section 2)
2. Build real embedding pipeline (replace placeholder `embedQuery()`)
3. Index all CRM data into Vespa on create/update via Directus Flows
4. Expand Ask Vidi to search across clients, contacts, deals, projects, content
5. Build the standalone search UI for vidicrm.com

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [VidiAI Search Engine Architecture (PRIORITY)](#2-vidiai-search-engine-architecture-priority)
3. [System Architecture](#3-system-architecture)
4. [Core Data Model - Collections](#4-core-data-model---collections)
5. [Client Profiles Schema (Deep Dive)](#5-client-profiles-schema-deep-dive)
6. [Contacts & Relationships](#6-contacts--relationships)
7. [Deals & Pipeline Management](#7-deals--pipeline-management)
8. [Projects & Deliverables](#8-projects--deliverables)
9. [Content Proposals & Media Planning](#9-content-proposals--media-planning)
10. [Invoicing & Payments](#10-invoicing--payments)
11. [Client Portal (Client-Facing)](#11-client-portal-client-facing)
12. [AI Features - Neo4j + Vespa Integration](#12-ai-features---neo4j--vespa-integration)
13. [Roles & Permissions](#13-roles--permissions)
14. [API & Frontend Strategy](#14-api--frontend-strategy)
15. [Launch Plan - Week of 2026-02-23](#15-launch-plan---week-of-2026-02-23)
16. [Infrastructure & Deployment](#16-infrastructure--deployment)

---

## 1. Executive Summary

VidiCRM is a full business suite combining:

- **Sales CRM** - Pipeline management, deals, lead tracking (HubSpot/Pipedrive class)
- **Client Portal** - Client-facing profiles with project tracking, approvals, communication
- **Project Management** - Deliverables, milestones, task tracking per client
- **Content Management** - Content proposals, media assets, social media planning
- **Invoicing** - Estimates, invoices, payment tracking
- **AI Intelligence** - Knowledge graph relationships (Neo4j), semantic search (Vespa), smart recommendations

**The core differentiator:** Every client profile includes their full digital footprint - website, social accounts, content strategy, proposed deliverables - making VidiCRM a creative agency CRM, not just a contacts database.

---

## 2. VidiAI Search Engine Architecture (PRIORITY)

This is the brain of VidiCRM. Every piece of data in the system flows into Vespa and becomes instantly searchable via natural language through the "Ask Vidi" interface.

### 2.1 What VidiAI Does

VidiAI is a **Retrieval-Augmented Generation (RAG) search engine** that:

1. **Indexes everything** - Every client profile, contact, deal, project, deliverable, content proposal, media asset, activity, invoice, and message gets embedded and stored in Vespa
2. **Semantic search** - Users type natural language ("show me all health industry clients with active video projects") and get ranked results
3. **Hybrid ranking** - Combines keyword matching (BM25) with vector similarity (embeddings) for the best results
4. **AI-powered answers** - The Ask Vidi chat interface sends search results as context to an LLM (Grok 4.1 Fast via OpenRouter) which generates conversational answers
5. **Cross-collection search** - One search bar searches across ALL data types simultaneously
6. **Client-facing search** - Clients in the portal can search their own data (scoped to their account)

### 2.2 Vespa Application Package - CRM Schemas

The following schemas will be deployed to Vespa for VidiCRM. Each maps to a Directus collection.

**Location:** `/mnt/m/code/vidismart/converge/vespa-app/`

#### Schema: `crm_client` (Client Profiles)
```
Fields indexed for search:
- company_name (text, BM25)
- display_name (text, BM25)
- description (text, BM25)
- industry + sub_industry (filterable attributes)
- status (filterable: lead, prospect, active, paused, churned)
- source (filterable)
- all_social_accounts (text, aggregated from client_social_accounts)
- all_websites (text, aggregated from client_websites)
- content_strategy_summary (text, from client_content_strategy)
- brand_voice (text)
- tags (array<string>, filterable)
- assigned_to (filterable)
- embedding (tensor<float>(x[1024]), angular distance)

Rank profiles:
- hybrid: 0.4 * nativeRank(company_name, description) + 0.3 * nativeRank(display_name) + 0.3 * closeness(embedding)
- semantic: closeness(embedding)
- keyword: nativeRank(company_name, description, all_websites, all_social_accounts)
- by_revenue: attribute(annual_revenue_rank) + closeness(embedding)
```

#### Schema: `crm_contact` (People)
```
Fields:
- full_name (text, BM25) - first_name + last_name combined
- email (attribute, exact match)
- job_title (text, BM25)
- company_name (text, BM25) - denormalized from client
- role_at_client (filterable)
- notes (text, BM25)
- tags (array<string>)
- lead_score (attribute, for ranking)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(full_name, job_title, company_name) + closeness(embedding)
- by_lead_score: attribute(lead_score) + 0.5 * closeness(embedding)
```

#### Schema: `crm_deal` (Sales Opportunities)
```
Fields:
- title (text, BM25)
- client_name (text, BM25) - denormalized
- contact_name (text, BM25) - denormalized
- pipeline_name (attribute, filterable)
- stage_name (attribute, filterable)
- value (attribute, for ranking)
- status (filterable: open, won, lost)
- source (filterable)
- notes (text, BM25)
- tags (array<string>)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(title, client_name) + closeness(embedding)
- by_value: attribute(value) + 0.3 * closeness(embedding)
- pipeline_view: freshness(created_at) + attribute(stage_sort)
```

#### Schema: `crm_project` (Projects & Deliverables)
```
Fields:
- title (text, BM25)
- description (text, BM25)
- client_name (text) - denormalized
- status (filterable)
- priority (filterable)
- deliverable_titles (text, BM25) - aggregated
- milestone_titles (text, BM25) - aggregated
- tags (array<string>)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(title, description, deliverable_titles) + closeness(embedding)
- active_first: freshness(updated_at) * (status == "in_progress" ? 2.0 : 1.0)
```

#### Schema: `crm_content` (Content Proposals + Media Assets)
```
Fields:
- title (text, BM25)
- description (text, BM25)
- content_type (attribute: video, image, graphic, blog, social, etc.)
- platform (attribute: instagram, youtube, tiktok, etc.)
- client_name (text) - denormalized
- status (filterable)
- caption (text, BM25) - for social posts
- hashtags (array<string>)
- ai_tags (array<string>) - auto-generated
- ai_description (text, BM25) - AI-generated for media
- performance_score (attribute) - engagement metrics
- tags (array<string>)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(title, description, ai_description) + closeness(embedding)
- by_performance: attribute(performance_score) + 0.3 * closeness(embedding)
- by_platform: (platform matches filter ? 2.0 : 1.0) * closeness(embedding)
```

#### Schema: `crm_activity` (Activity Log - calls, emails, meetings, notes)
```
Fields:
- subject (text, BM25)
- description (text, BM25)
- type (attribute: call, email, meeting, note, task)
- client_name (text) - denormalized
- contact_name (text) - denormalized
- outcome (attribute)
- created_at (attribute, for freshness)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(subject, description) + closeness(embedding)
- recent_first: freshness(created_at) + 0.3 * closeness(embedding)
```

#### Schema: `crm_invoice` (Financial Records)
```
Fields:
- invoice_number (attribute, exact match)
- client_name (text) - denormalized
- status (filterable: draft, sent, paid, overdue)
- total (attribute)
- items_description (text, BM25) - concatenated line items
- notes (text, BM25)
- created_at (attribute)
- embedding (tensor<float>(x[1024]))

Rank profiles:
- hybrid: nativeRank(client_name, items_description) + closeness(embedding)
- by_amount: attribute(total) + freshness(created_at)
- overdue_first: (status == "overdue" ? 3.0 : 1.0) * freshness(created_at)
```

### 2.3 Embedding Pipeline

**Current state:** The search API has a placeholder `embedQuery()` that uses character codes - NOT real embeddings.

**Production embedding strategy:**

```
Option A (Recommended): mxbai-embed-large (1024 dims)
- Model: mixedbread-ai/mxbai-embed-large-v1
- Run locally via Ollama: ollama pull mxbai-embed-large
- Fast, free, no API costs
- Endpoint: http://localhost:11434/api/embeddings

Option B: OpenAI text-embedding-3-large (3072 dims, truncate to 1024)
- $0.13 per 1M tokens
- Higher quality but costs money

Option C: BGE-M3 (1024 dims)
- Already referenced in schema_v1.sql
- Run via Hugging Face TEI or Ollama
```

**Embedding flow:**
```
1. CRM data created/updated in Directus
2. Directus Flow triggers webhook
3. Webhook hits embedding service:
   a. Concatenates searchable text fields into single string
   b. Generates 1024-dim embedding via mxbai-embed-large
   c. Writes document to Vespa via Document API
4. Document is now searchable in < 1 second
```

### 2.4 Ask Vidi Chat Flow (RAG)

```
User types: "Which clients need their Instagram content refreshed?"
                    │
                    ▼
         ┌──────────────────┐
         │  Embed the query  │  (mxbai-embed-large → 1024 dims)
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Vespa Hybrid    │  Search across ALL crm_* schemas
         │  Search          │  BM25 + Vector + Freshness
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Top 10 results  │  Ranked, deduplicated, type-labeled
         │  as context      │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  LLM (Grok 4.1)  │  System prompt + context + user question
         │  via OpenRouter   │  Generates conversational answer
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Response with   │  Answer text + source cards
         │  citations       │  (clickable links to CRM records)
         └──────────────────┘
```

### 2.5 Search UI Variants

VidiAI appears in **3 forms** across VidiCRM:

#### A. Ask Vidi Chat Widget (Floating)
- Already built: `AskVidiAI.tsx`
- Floating button bottom-right on every page
- Opens chat panel, conversational interface
- Returns AI-generated answers with source cards

#### B. Global Search Bar (Command Palette)
- `Ctrl+K` / `Cmd+K` to open
- Instant search-as-you-type across all collections
- Results grouped by type: Clients | Contacts | Deals | Projects | Content
- Click result → navigate to that record
- Similar to Slack/Linear/Notion command palette

#### C. Advanced Search Page (`/search`)
- Full-page search with filters
- Filter by: collection type, date range, status, tags, assigned_to, client
- Sort by: relevance, date, value, lead score
- Saved searches (persist filter combos)
- Export results to CSV

#### D. Client Portal Search (Scoped)
- Same search but restricted to the client's own data
- Clients can search their projects, deliverables, invoices, content
- "Show me all my approved deliverables from January"

### 2.6 VidiAI Admin Panel

Already built: `VidiAiAdmin.tsx` - needs to be expanded for CRM:

**Dashboard Metrics:**
- Total documents indexed (per schema)
- Queries per second / per day
- Average query latency
- Embedding queue depth
- Failed indexing operations
- Most popular search queries
- Search result click-through rate

**Management:**
- Reindex all data (full rebuild)
- Reindex single collection
- Test search queries
- View/edit individual documents
- Schema management
- Embedding model configuration

### 2.7 Vespa Deployment Steps (DO FIRST)

```bash
# 1. Create application package directory
mkdir -p /mnt/m/code/vidismart/converge/vespa-app/schemas

# 2. Create services.xml (defines cluster topology)
# 3. Create schema files (one .sd per document type)
# 4. Deploy to running Vespa instance:
curl --header "Content-Type: application/zip" \
  --data-binary @vespa-app.zip \
  http://localhost:19071/application/v2/tenant/default/prepareandactivate

# 5. Verify deployment:
curl http://localhost:8089/ApplicationStatus

# 6. Start indexing documents
```

### 2.8 Embedding Service Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Directus   │────▶│  Embedding   │────▶│  Vespa   │
│  Webhook    │     │  Service     │     │  Index   │
│  (on CRUD)  │     │  (Node.js)   │     │          │
└─────────────┘     └──────────────┘     └──────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │   Ollama     │
                    │  mxbai-embed │
                    │  :11434      │
                    └──────────────┘
```

The embedding service:
1. Receives webhook from Directus with collection name + item ID
2. Fetches full item from Directus API (with related data)
3. Builds searchable text blob (concatenates relevant fields)
4. Calls Ollama for embedding generation
5. Constructs Vespa document with all indexed fields + embedding
6. PUT to Vespa Document API
7. Logs success/failure for admin dashboard

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    vidicrm.com                           │
│              (Nginx reverse proxy + SSL)                 │
├──────────────┬──────────────┬───────────────────────────┤
│              │              │                           │
│  Client      │  Admin       │   API Layer              │
│  Portal UI   │  Dashboard   │   (Directus REST/GraphQL)│
│  (Next.js)   │  (Directus)  │   Port 8055              │
│              │              │                           │
├──────────────┴──────────────┴───────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │PostgreSQL│  │  Redis   │  │  Neo4j   │  │  Vespa  │ │
│  │  :5433   │  │  :6379   │  │  :7474   │  │  :8089  │ │
│  │  Main DB │  │  Cache   │  │  Graph   │  │ Vector  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │          Cloudflare R2 (Media Storage)               ││
│  │          cdn.vidicrm.com                             ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Service | Role | Why |
|---------|------|-----|
| **Directus** | CMS + Admin UI + REST/GraphQL API | Zero-code schema builder, auto-generates APIs, built-in auth & permissions |
| **PostgreSQL** | Primary data store | JSONB for flexible fields, pgvector for embeddings, relational integrity |
| **Redis** | Session cache, API cache | Sub-millisecond response for hot data, Directus cache layer |
| **Neo4j** | Relationship graph | Map client→contacts→deals→projects→content relationships, referral chains, cross-sell intelligence |
| **Vespa** | Vector search + ranking | Semantic search across clients, content similarity, AI-powered recommendations |

---

## 3. Core Data Model - Collections

### Directus Collections Overview

```
CORE CRM
├── clients              (Company/Brand accounts)
├── contacts             (People - linked to clients)
├── deals                (Sales opportunities)
├── pipelines            (Pipeline definitions)
├── pipeline_stages      (Stage definitions per pipeline)
├── activities           (Calls, emails, meetings, notes)
├── tags                 (Universal tagging system)

CLIENT PROFILES (DEEP)
├── client_websites      (Website details per client)
├── client_social_accounts (Social media accounts)
├── client_brand_assets  (Logos, colors, fonts, guidelines)
├── client_content_strategy (Content plans & calendars)

PROJECTS & DELIVERABLES
├── projects             (Client projects)
├── project_milestones   (Key milestones per project)
├── tasks                (Individual tasks)
├── deliverables         (Files/assets delivered to client)

CONTENT & MEDIA
├── content_proposals    (Proposed content for clients)
├── media_assets         (Videos, images, graphics)
├── social_posts         (Scheduled/published social content)
├── content_calendar     (Calendar entries)

FINANCIAL
├── invoices             (Client invoices)
├── invoice_items        (Line items)
├── estimates            (Quotes/proposals)
├── payments             (Payment records)
├── packages             (Service packages/tiers)

COMMUNICATION
├── messages             (Internal + client messages)
├── email_templates      (Reusable email templates)
├── notifications        (System notifications)
```

---

## 4. Client Profiles Schema (Deep Dive)

This is the most complex schema in the system. A client profile is NOT just a name and email - it's a complete digital identity and content strategy record.

### 4.1 `clients` Collection (Master Record)

```
clients
├── id                    UUID (PK)
├── status                enum: lead | prospect | active | paused | churned | archived
├── company_name          string (required)
├── display_name          string (short name / brand name)
├── slug                  string (URL-safe, auto-generated)
├── industry              string (dropdown: tech, health, finance, creative, retail, etc.)
├── sub_industry          string (niche detail)
├── company_size          enum: solo | 2-10 | 11-50 | 51-200 | 201-1000 | 1000+
├── annual_revenue        string (range bracket, not exact)
├── description           text (about the business)
├── logo                  file (Directus file reference)
├── cover_image           file
├── primary_color         string (#hex)
├── secondary_color       string (#hex)
├── timezone              string (IANA timezone)
├── currency              string (USD, EUR, etc.)
├── language              string (en, es, fr, etc.)
├── source                enum: website | referral | cold_outreach | social | advertising | partner | event
├── referred_by           UUID → clients (self-referral tracking)
├── assigned_to           UUID → directus_users (account manager)
├── tags                  M2M → tags
├── notes                 text (internal notes)
├── metadata              JSON (extensible custom fields)
├── portal_enabled        boolean (client portal access)
├── portal_password       string (hashed, for client login)
├── created_at            timestamp
├── updated_at            timestamp
├── last_activity_at      timestamp (auto-updated)
```

### 4.2 `client_websites` Collection

```
client_websites
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── url                   string (required, full URL)
├── type                  enum: primary | secondary | landing_page | blog | ecommerce | portfolio
├── platform              enum: wordpress | shopify | wix | squarespace | custom | webflow | other
├── cms                   string (specific CMS if known)
├── hosting               string (hosting provider)
├── domain_registrar      string
├── domain_expiry         date
├── ssl_status            enum: valid | expired | none
├── analytics_id          string (GA4 measurement ID)
├── search_console        boolean (verified in GSC?)
├── monthly_traffic       integer (estimated)
├── page_speed_score      integer (0-100)
├── seo_notes             text
├── tech_stack            JSON (detected technologies)
├── login_url             string (admin login URL)
├── credentials_note      string (reference to secure vault, NEVER store passwords)
├── screenshots           M2M → media_assets
├── status                enum: live | staging | development | parked | expired
├── notes                 text
```

### 4.3 `client_social_accounts` Collection

```
client_social_accounts
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── platform              enum: facebook | instagram | twitter_x | linkedin | youtube |
│                               tiktok | pinterest | snapchat | threads | bluesky |
│                               reddit | discord | twitch | telegram | whatsapp
├── account_url           string (full profile URL)
├── username              string (@handle)
├── account_id            string (platform-specific ID)
├── followers             integer
├── following             integer
├── posts_count           integer
├── engagement_rate       decimal (percentage)
├── verified              boolean
├── business_account      boolean
├── connected_api         boolean (do we have API access?)
├── api_token_ref         string (reference to secure vault)
├── content_frequency     enum: daily | few_per_week | weekly | biweekly | monthly | irregular | inactive
├── primary_content_type  enum: video | image | text | mixed | stories | reels | live
├── audience_demo         JSON (age ranges, gender split, top locations)
├── top_performing_posts  JSON (array of post references)
├── notes                 text
├── last_synced           timestamp
├── status                enum: active | inactive | suspended | not_created
```

### 4.4 `client_brand_assets` Collection

```
client_brand_assets
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── asset_type            enum: logo_primary | logo_secondary | logo_icon | favicon |
│                               color_palette | typography | brand_guidelines |
│                               letterhead | business_card | social_banner |
│                               email_signature | watermark | intro_video | outro_video
├── file                  file (Directus file reference → R2 storage)
├── name                  string
├── description           text
├── version               string (v1, v2, etc.)
├── is_current            boolean (active version?)
├── format                string (PNG, SVG, AI, PSD, MP4, etc.)
├── dimensions            string (1920x1080, etc.)
├── file_size             integer (bytes)
├── color_codes           JSON (array of hex/rgb values)
├── font_families         JSON (array of font names + weights)
├── usage_notes           text (where/how to use this asset)
├── approved              boolean
├── approved_by           UUID → contacts
├── approved_at           timestamp
```

### 4.5 `client_content_strategy` Collection

```
client_content_strategy
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── strategy_name         string ("Q1 2026 Content Plan")
├── status                enum: draft | proposed | approved | active | completed | archived
├── start_date            date
├── end_date              date
├── goals                 JSON (array of goal objects with metric + target)
│                         e.g. [{"metric": "followers", "platform": "instagram", "target": 10000, "current": 5200}]
├── target_audience       JSON (personas, demographics, interests)
├── brand_voice           text (tone, style guidelines)
├── content_pillars       JSON (array of topic themes)
│                         e.g. ["behind the scenes", "tutorials", "testimonials", "product showcases"]
├── posting_schedule      JSON (per-platform schedule)
│                         e.g. {"instagram": {"reels": 3, "stories": 7, "posts": 2, "per": "week"}}
├── hashtag_strategy      JSON (primary, secondary, branded hashtags)
├── competitor_accounts   JSON (array of competitor profile URLs)
├── kpis                  JSON (key performance indicators + targets)
├── monthly_budget        decimal
├── tools_used            JSON (scheduling tools, analytics tools)
├── notes                 text
├── approved_by           UUID → contacts
├── approved_at           timestamp
```

---

## 5. Contacts & Relationships

### 5.1 `contacts` Collection

```
contacts
├── id                    UUID (PK)
├── client_id             UUID → clients (FK, nullable - for independent contacts)
├── type                  enum: client_contact | lead | partner | vendor | press | other
├── salutation            enum: Mr | Mrs | Ms | Dr | Prof | (blank)
├── first_name            string (required)
├── last_name             string (required)
├── email                 string (unique)
├── phone                 string
├── mobile                string
├── job_title             string
├── department            string
├── role_at_client        enum: decision_maker | influencer | champion | end_user | billing | technical
├── linkedin_url          string
├── twitter_url           string
├── avatar                file
├── address_line1         string
├── address_line2         string
├── city                  string
├── state                 string
├── zip                   string
├── country               string
├── preferred_contact     enum: email | phone | text | linkedin | whatsapp
├── do_not_contact        boolean
├── birthday              date
├── notes                 text
├── tags                  M2M → tags
├── source                enum: website | referral | linkedin | cold_email | event | other
├── portal_access         boolean (can log into client portal?)
├── portal_role           enum: admin | editor | viewer
├── last_contacted        timestamp
├── lead_score            integer (0-100, AI-calculated)
├── metadata              JSON
├── created_at            timestamp
├── updated_at            timestamp
```

### 5.2 `activities` Collection (Unified Activity Log)

```
activities
├── id                    UUID (PK)
├── type                  enum: call | email | meeting | note | task | sms | social_interaction | file_shared
├── subject               string
├── description           text
├── client_id             UUID → clients (FK)
├── contact_id            UUID → contacts (FK)
├── deal_id               UUID → deals (FK, nullable)
├── project_id            UUID → projects (FK, nullable)
├── user_id               UUID → directus_users (who logged it)
├── scheduled_at          timestamp (for future activities)
├── completed_at          timestamp
├── duration_minutes      integer
├── outcome               enum: completed | no_answer | rescheduled | cancelled | pending
├── follow_up_date        date
├── follow_up_notes       text
├── attachments           M2M → directus_files
├── metadata              JSON (call recording URL, email thread ID, etc.)
├── created_at            timestamp
```

---

## 6. Deals & Pipeline Management

### 6.1 `pipelines` Collection

```
pipelines
├── id                    UUID (PK)
├── name                  string ("Sales Pipeline", "Onboarding Pipeline", "Upsell Pipeline")
├── description           text
├── type                  enum: sales | onboarding | renewal | upsell | custom
├── is_default            boolean
├── is_active             boolean
├── sort_order            integer
├── created_at            timestamp
```

### 6.2 `pipeline_stages` Collection

```
pipeline_stages
├── id                    UUID (PK)
├── pipeline_id           UUID → pipelines (FK)
├── name                  string ("Lead In", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost")
├── description           text
├── color                 string (#hex)
├── probability           integer (0-100, win probability at this stage)
├── sort_order            integer
├── is_won                boolean (marks the "won" stage)
├── is_lost               boolean (marks the "lost" stage)
├── auto_actions          JSON (automations triggered on entry)
│                         e.g. {"send_email_template": "welcome-proposal", "create_task": "schedule-discovery-call"}
├── required_fields       JSON (fields that must be filled before advancing)
├── sla_days              integer (max days a deal should stay here)
```

### 6.3 `deals` Collection

```
deals
├── id                    UUID (PK)
├── title                 string (required)
├── client_id             UUID → clients (FK)
├── contact_id            UUID → contacts (FK, primary contact for this deal)
├── pipeline_id           UUID → pipelines (FK)
├── stage_id              UUID → pipeline_stages (FK)
├── assigned_to           UUID → directus_users
├── value                 decimal (deal monetary value)
├── currency              string (USD default)
├── recurring             boolean (is this a recurring deal?)
├── recurring_interval    enum: monthly | quarterly | annually
├── probability           integer (0-100, can override stage default)
├── expected_close_date   date
├── actual_close_date     date
├── won_at                timestamp
├── lost_at               timestamp
├── lost_reason           enum: budget | timing | competitor | no_need | no_response | other
├── lost_notes            text
├── package_id            UUID → packages (FK, which service package)
├── source                enum: inbound | outbound | referral | upsell | renewal
├── tags                  M2M → tags
├── notes                 text
├── metadata              JSON (custom deal fields)
├── stage_entered_at      timestamp (when deal entered current stage)
├── stage_history         JSON (array of {stage, entered_at, exited_at})
├── created_at            timestamp
├── updated_at            timestamp
```

---

## 7. Projects & Deliverables

### 7.1 `projects` Collection

```
projects
├── id                    UUID (PK)
├── title                 string (required)
├── description           text
├── client_id             UUID → clients (FK)
├── deal_id               UUID → deals (FK, originating deal)
├── package_id            UUID → packages (FK)
├── status                enum: planning | in_progress | review | revision | completed | on_hold | cancelled
├── priority              enum: low | medium | high | urgent
├── assigned_to           UUID → directus_users (project manager)
├── team_members          M2M → directus_users
├── start_date            date
├── due_date              date
├── completed_at          timestamp
├── budget                decimal
├── budget_used           decimal (tracked from invoice_items)
├── client_visible        boolean (show in client portal?)
├── progress_percent      integer (0-100)
├── tags                  M2M → tags
├── notes                 text
├── created_at            timestamp
├── updated_at            timestamp
```

### 7.2 `project_milestones` Collection

```
project_milestones
├── id                    UUID (PK)
├── project_id            UUID → projects (FK)
├── title                 string
├── description           text
├── due_date              date
├── completed_at          timestamp
├── status                enum: pending | in_progress | completed | overdue
├── sort_order            integer
├── requires_approval     boolean (client must approve?)
├── approved_by           UUID → contacts
├── approved_at           timestamp
├── deliverables          M2M → deliverables
```

### 7.3 `tasks` Collection

```
tasks
├── id                    UUID (PK)
├── project_id            UUID → projects (FK)
├── milestone_id          UUID → project_milestones (FK, nullable)
├── title                 string (required)
├── description           text
├── assigned_to           UUID → directus_users
├── status                enum: todo | in_progress | review | done | blocked
├── priority              enum: low | medium | high | urgent
├── due_date              date
├── estimated_hours       decimal
├── actual_hours          decimal
├── sort_order            integer
├── parent_task_id        UUID → tasks (self-reference for subtasks)
├── tags                  M2M → tags
├── attachments           M2M → directus_files
├── created_at            timestamp
├── updated_at            timestamp
```

### 7.4 `deliverables` Collection

```
deliverables
├── id                    UUID (PK)
├── project_id            UUID → projects (FK)
├── milestone_id          UUID → project_milestones (FK, nullable)
├── title                 string
├── description           text
├── type                  enum: website | landing_page | video | graphic | social_content |
│                               blog_post | email_campaign | seo_report | brand_asset |
│                               photography | animation | document | other
├── file                  file (Directus file → R2)
├── preview_url           string (live preview link)
├── version               integer (auto-increment per deliverable)
├── status                enum: draft | internal_review | client_review | revision | approved | delivered
├── revision_notes        text (client feedback)
├── revision_count        integer
├── client_visible        boolean
├── approved_by           UUID → contacts
├── approved_at           timestamp
├── delivered_at          timestamp
├── created_at            timestamp
```

---

## 8. Content Proposals & Media Planning

### 8.1 `content_proposals` Collection

```
content_proposals
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── project_id            UUID → projects (FK, nullable)
├── title                 string ("February 2026 Instagram Reels Package")
├── description           text
├── type                  enum: social_media | blog | video | email | website | mixed
├── status                enum: draft | proposed | revision | approved | in_production | delivered
├── platforms             JSON (array of target platforms)
├── content_items         JSON (array of proposed content pieces)
│                         e.g. [
│                           {"type": "reel", "topic": "Behind the scenes", "caption_draft": "...", "hashtags": [...], "estimated_reach": 5000},
│                           {"type": "carousel", "topic": "Product showcase", "slides": 5, "caption_draft": "..."}
│                         ]
├── total_pieces          integer
├── estimated_reach       integer
├── estimated_engagement  decimal (percentage)
├── budget                decimal
├── start_date            date
├── end_date              date
├── presented_at          timestamp
├── approved_by           UUID → contacts
├── approved_at           timestamp
├── notes                 text
├── attachments           M2M → directus_files (mood boards, references)
├── created_at            timestamp
├── updated_at            timestamp
```

### 8.2 `media_assets` Collection

```
media_assets
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── project_id            UUID → projects (FK, nullable)
├── proposal_id           UUID → content_proposals (FK, nullable)
├── title                 string
├── description           text
├── type                  enum: video | image | graphic | animation | audio | document | 3d_model
├── file                  file (Directus file → R2)
├── thumbnail             file
├── url                   string (external URL if hosted elsewhere)
├── platform              string (where this was published)
├── published_url         string (live URL on social/web)
├── duration_seconds      integer (for video/audio)
├── dimensions            string
├── file_size             integer
├── format                string
├── status                enum: raw | editing | review | final | published | archived
├── performance           JSON (views, likes, shares, comments, saves, reach)
├── ai_tags               JSON (auto-generated tags from content analysis)
├── ai_description        text (AI-generated description for search)
├── embedding_id          string (Vespa document ID for vector search)
├── tags                  M2M → tags
├── created_at            timestamp
├── updated_at            timestamp
```

### 8.3 `content_calendar` Collection

```
content_calendar
├── id                    UUID (PK)
├── client_id             UUID → clients (FK)
├── proposal_id           UUID → content_proposals (FK, nullable)
├── media_asset_id        UUID → media_assets (FK, nullable)
├── title                 string
├── platform              enum: instagram | facebook | twitter_x | linkedin | youtube | tiktok | blog | email | other
├── content_type          enum: post | story | reel | video | carousel | live | blog | newsletter
├── scheduled_date        date
├── scheduled_time        time
├── timezone              string
├── caption               text
├── hashtags              JSON (array of strings)
├── status                enum: planned | created | scheduled | published | failed
├── published_url         string
├── published_at          timestamp
├── performance           JSON (metrics after publishing)
├── notes                 text
```

---

## 9. Invoicing & Payments

### 9.1 `packages` Collection (Service Tiers)

```
packages
├── id                    UUID (PK)
├── name                  string ("Starter", "Growth", "Enterprise", "Custom")
├── description           text
├── type                  enum: one_time | monthly | quarterly | annual
├── price                 decimal
├── currency              string
├── features              JSON (array of included features/deliverables)
│                         e.g. [
│                           {"name": "Social Media Management", "platforms": 3, "posts_per_month": 12},
│                           {"name": "Video Production", "videos_per_month": 2, "max_duration": "60s"},
│                           {"name": "Website Maintenance", "hours_per_month": 5}
│                         ]
├── is_active             boolean
├── is_featured           boolean (highlight on pricing page)
├── sort_order            integer
├── landing_page_url      string (link to package detail page)
├── stripe_price_id       string (for payment integration)
├── metadata              JSON
```

### 9.2 `invoices` Collection

```
invoices
├── id                    UUID (PK)
├── invoice_number        string (auto-generated: VCRM-2026-0001)
├── client_id             UUID → clients (FK)
├── contact_id            UUID → contacts (FK, billing contact)
├── deal_id               UUID → deals (FK, nullable)
├── project_id            UUID → projects (FK, nullable)
├── status                enum: draft | sent | viewed | paid | partial | overdue | cancelled | refunded
├── issue_date            date
├── due_date              date
├── paid_date             date
├── subtotal              decimal
├── tax_rate              decimal
├── tax_amount            decimal
├── discount_amount       decimal
├── discount_type         enum: percentage | fixed
├── total                 decimal
├── amount_paid           decimal
├── amount_due            decimal (calculated: total - amount_paid)
├── currency              string
├── payment_terms         text ("Net 30", "Due on receipt")
├── notes                 text (appears on invoice)
├── internal_notes        text (not visible to client)
├── pdf_file              file (generated PDF)
├── sent_at               timestamp
├── viewed_at             timestamp
├── stripe_invoice_id     string
├── metadata              JSON
├── created_at            timestamp
├── updated_at            timestamp
```

### 9.3 `invoice_items` Collection

```
invoice_items
├── id                    UUID (PK)
├── invoice_id            UUID → invoices (FK)
├── description           string
├── quantity              decimal
├── unit_price            decimal
├── amount                decimal (quantity × unit_price)
├── tax_rate              decimal (item-level override)
├── sort_order            integer
├── deliverable_id        UUID → deliverables (FK, nullable - links to what was delivered)
├── package_id            UUID → packages (FK, nullable)
```

### 9.4 `estimates` Collection

```
estimates
├── id                    UUID (PK)
├── estimate_number       string (auto: VCRM-EST-2026-0001)
├── client_id             UUID → clients (FK)
├── contact_id            UUID → contacts (FK)
├── deal_id               UUID → deals (FK, nullable)
├── status                enum: draft | sent | viewed | accepted | declined | expired
├── valid_until           date
├── subtotal              decimal
├── tax_rate              decimal
├── total                 decimal
├── items                 JSON (same structure as invoice_items)
├── notes                 text
├── accepted_at           timestamp
├── converted_to_invoice  UUID → invoices (FK, nullable)
├── pdf_file              file
├── created_at            timestamp
```

### 9.5 `payments` Collection

```
payments
├── id                    UUID (PK)
├── invoice_id            UUID → invoices (FK)
├── client_id             UUID → clients (FK)
├── amount                decimal
├── currency              string
├── method                enum: stripe | bank_transfer | check | cash | paypal | crypto | other
├── reference             string (transaction ID, check number)
├── stripe_payment_id     string
├── status                enum: pending | completed | failed | refunded
├── paid_at               timestamp
├── notes                 text
├── created_at            timestamp
```

---

## 10. Client Portal (Client-Facing)

### 10.1 Portal Features

The client portal is a **separate Next.js frontend** that consumes the Directus API with role-based access.

**What clients can see/do:**

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of active projects, upcoming deliverables, recent activity |
| **Projects** | View project progress, milestones, timeline |
| **Deliverables** | Review deliverables, leave feedback, approve/request revisions |
| **Content Calendar** | See scheduled content, approve posts before publishing |
| **Content Proposals** | Review and approve proposed content strategies |
| **Invoices** | View invoices, payment history, download PDFs |
| **Brand Assets** | Access their brand asset library |
| **Messages** | Communicate with their account team |
| **Files** | Shared file library for the account |
| **Profile** | Edit their company info, contacts, social accounts |

### 10.2 Portal Authentication

```
Client Portal Auth Flow:
1. Client receives invite email with magic link
2. Magic link sets up their portal account
3. Future logins via email + password OR magic link
4. JWT tokens stored in httpOnly cookies
5. Directus handles auth - portal uses Directus Auth API
6. Role-based: each contact has portal_role (admin | editor | viewer)
   - admin: approve deliverables, manage contacts, view invoices
   - editor: review content, leave feedback
   - viewer: read-only access to everything
```

### 10.3 Portal URL Structure

```
portal.vidicrm.com/
├── /login
├── /dashboard
├── /projects
├── /projects/:id
├── /deliverables
├── /deliverables/:id (review + approve UI)
├── /content
├── /content/calendar
├── /content/proposals/:id
├── /invoices
├── /invoices/:id
├── /brand-assets
├── /files
├── /messages
├── /settings (company profile, contacts, social accounts)
```

---

## 12. AI Features - Neo4j + Vespa Integration

### 12.1 Neo4j Knowledge Graph

**Node Types:**
```
(:Client)
(:Contact)
(:Deal)
(:Project)
(:Deliverable)
(:ContentProposal)
(:MediaAsset)
(:Tag)
(:Industry)
(:Platform)  -- social platforms
(:Package)
```

**Relationship Types:**
```
(:Contact)-[:WORKS_AT]->(:Client)
(:Contact)-[:DECISION_MAKER_FOR]->(:Deal)
(:Client)-[:HAS_DEAL]->(:Deal)
(:Deal)-[:RESULTED_IN]->(:Project)
(:Project)-[:PRODUCED]->(:Deliverable)
(:Client)-[:REFERRED]->(:Client)
(:Client)-[:IN_INDUSTRY]->(:Industry)
(:Client)-[:ACTIVE_ON]->(:Platform)
(:Client)-[:SUBSCRIBED_TO]->(:Package)
(:MediaAsset)-[:SIMILAR_TO]->(:MediaAsset)
(:Client)-[:SIMILAR_PROFILE]->(:Client)
(:Tag)-[:APPLIED_TO]->(:Client|Deal|Project|MediaAsset)
```

**Use Cases:**
- "Show me all clients referred by Client X and their total deal value"
- "Find clients in the same industry who might need similar content"
- "Map the relationship chain: who introduced this lead?"
- "Which content types perform best for clients in [industry]?"

### 11.2 Vespa Vector Search

**Document Types:**
```
client_profile     → client description + industry + content strategy embeddings
contact_profile    → contact bio + role + notes embeddings
media_asset        → AI-generated description + visual feature embeddings
content_proposal   → proposal text + content items embeddings
deliverable        → description + feedback embeddings
activity_log       → notes + outcomes embeddings
```

**Use Cases:**
- "Find clients similar to [this client]" (profile matching)
- "Search all content across all clients for [topic]"
- "Find media assets visually similar to [this image]"
- "Smart recommendations: clients who bought X also needed Y"
- Semantic search across all CRM data from a single search bar

### 11.3 AI-Powered Features (Future)

| Feature | How | Stack |
|---------|-----|-------|
| **Lead Scoring** | Analyze activity patterns, engagement, profile completeness | PostgreSQL + Neo4j |
| **Smart Recommendations** | "Clients like X usually need Y service" | Vespa + Neo4j |
| **Content Performance Prediction** | Compare proposed content to historical performance data | Vespa embeddings |
| **Churn Risk Detection** | Activity drop-off, milestone delays, communication gaps | Neo4j temporal analysis |
| **Auto-Tagging** | AI analyzes media assets and generates tags | Vespa + LLM API |
| **Semantic Search** | Natural language search across entire CRM | Vespa |
| **Relationship Intelligence** | "You should reach out to X - connected through Y" | Neo4j path queries |

---

## 12. Roles & Permissions

### Directus Roles

| Role | Access | Who |
|------|--------|-----|
| **Administrator** | Full access to everything | System admin |
| **Account Manager** | Full CRM access, assigned clients only (or all) | Sales/account team |
| **Content Creator** | Projects, deliverables, media, content calendar | Creative team |
| **Finance** | Invoices, payments, estimates, packages | Billing team |
| **Client Admin** | Portal access: their client data only, approve, manage contacts | Client decision maker |
| **Client Editor** | Portal access: review content, leave feedback | Client team member |
| **Client Viewer** | Portal access: read-only | Client stakeholder |

### Permission Matrix (Key Collections)

| Collection | Admin | Acct Mgr | Creator | Finance | Client Admin | Client Viewer |
|------------|-------|----------|---------|---------|-------------|---------------|
| clients | CRUD | CRUD (own) | R | R | R (own) | R (own) |
| contacts | CRUD | CRUD | R | R | CRUD (own) | R (own) |
| deals | CRUD | CRUD | R | R | - | - |
| projects | CRUD | CRUD | CRUD (assigned) | R | R (own) | R (own) |
| deliverables | CRUD | CRUD | CRUD | R | R + approve | R |
| invoices | CRUD | R | - | CRUD | R (own) | R (own) |
| media_assets | CRUD | CRUD | CRUD | - | R (own) | R (own) |
| content_calendar | CRUD | CRUD | CRUD | - | R + approve | R |

---

## 13. API & Frontend Strategy

### 13.1 API Endpoints (Auto-generated by Directus)

```
REST:  https://api.vidicrm.com/items/{collection}
GraphQL: https://api.vidicrm.com/graphql

Authentication:
POST   /auth/login          → get access/refresh tokens
POST   /auth/refresh         → refresh token
POST   /auth/password/request → magic link / reset

Key Custom Endpoints (Directus Flows):
POST   /flows/trigger/lead-score-calculate
POST   /flows/trigger/invoice-generate-pdf
POST   /flows/trigger/sync-neo4j
POST   /flows/trigger/sync-vespa
POST   /flows/trigger/portal-invite
```

### 13.2 Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Admin CRM** | Directus built-in UI | Internal team uses Directus admin |
| **Client Portal** | Next.js 15 + Tailwind CSS | Client-facing portal at portal.vidicrm.com |
| **Landing Pages** | Astro or static HTML | Marketing pages at vidicrm.com |
| **Package Pages** | Integrated with landing | Customer package selection & signup |

### 13.3 Domain Structure

```
vidicrm.com              → Marketing site / landing pages / package pages
app.vidicrm.com          → Directus admin (internal CRM)
portal.vidicrm.com       → Client portal (Next.js)
api.vidicrm.com          → Directus API (REST + GraphQL)
cdn.vidicrm.com          → Cloudflare R2 media storage
```

---

## 15. Launch Plan - Week of 2026-02-23

### Phase 0: VidiAI / Vespa Search Engine (PRIORITY - Days 1-2)

- [ ] Create Vespa application package with all 7 CRM schemas
- [ ] Deploy application package to running Vespa instance
- [ ] Verify Vespa ApplicationStatus returns healthy
- [ ] Install Ollama + pull mxbai-embed-large model for embeddings
- [ ] Build embedding service (Node.js) that accepts webhooks and writes to Vespa
- [ ] Replace placeholder `embedQuery()` with real Ollama embedding calls
- [ ] Test: manually index 5 sample documents per schema
- [ ] Test: hybrid search returns correct results
- [ ] Test: Ask Vidi chat returns AI answers grounded in Vespa results
- [ ] Build Ctrl+K command palette search component
- [ ] Set up VidiAI admin dashboard with live metrics
- [ ] Configure Directus Flows to trigger embedding service on item create/update/delete

### Phase 1: Foundation (Days 2-3)

- [ ] Change default admin password and generate secure keys
- [ ] Set up Directus collections (all schemas from sections 5-10)
- [ ] Configure relationships between collections
- [ ] Set up roles and permissions
- [ ] Configure Directus Flows for auto-numbering (invoices, estimates)
- [ ] Import/seed initial data (packages, pipeline stages, tags)
- [ ] Set up R2 storage connection for media
- [ ] Verify all CRUD operations auto-index into Vespa

### Phase 2: Core CRM (Days 3-4)

- [ ] Create default sales pipeline with stages
- [ ] Create onboarding pipeline
- [ ] Set up deal stage automations (email triggers, task creation)
- [ ] Configure activity logging flows
- [ ] Test full deal lifecycle: lead → contact → deal → won → project → invoice
- [ ] Set up dashboard panels in Directus (deal values, pipeline overview, activity feed)
- [ ] Verify all deal/pipeline data is searchable in VidiAI

### Phase 3: Landing Pages (Days 4-5)

- [ ] Design vidicrm.com landing page (package showcase)
- [ ] Build package comparison page with VidiAI search demo
- [ ] Build "Get Started" / signup flow
- [ ] Connect to deal creation (new signup → new lead → new deal)

### Phase 4: Client Portal MVP (Week 2)

- [ ] Scaffold Next.js app for portal.vidicrm.com
- [ ] Implement auth flow (Directus auth API)
- [ ] Build dashboard page
- [ ] Build project view page
- [ ] Build deliverable review/approve page
- [ ] Build invoice view page
- [ ] Build basic messaging
- [ ] Add scoped VidiAI search (client can only search their own data)

### Phase 5: AI Intelligence (Week 2-3)

- [ ] Neo4j sync flow: mirror key relationships from PostgreSQL
- [ ] Build relationship graph visualization
- [ ] Build recommendation engine ("clients like X need Y")
- [ ] Add lead scoring algorithm (based on activity + engagement)
- [ ] Content performance prediction (compare proposed content to historical data)
- [ ] Churn risk detection (activity drop-off analysis)

---

## 15. Infrastructure & Deployment

### Current Local Development

```
Location: /mnt/m/code/vidismart/converge/
Docker:   docker compose up -d
Access:   http://localhost:8055
Database: localhost:5433 (converge/converge_secret)
Neo4j:    http://localhost:7474 (neo4j/converge_password)
Vespa:    http://localhost:8089
Redis:    localhost:6379
```

### Production Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **Railway** | Easy Docker deploy, auto-SSL, good for Directus | Cost scales with usage |
| **Hetzner VPS** | Cheap, powerful, full control | Manual setup/maintenance |
| **DigitalOcean Droplet** | Good Docker support, managed DB available | Mid-range pricing |
| **Cloudflare Workers + D1** | Edge performance, integrated with R2 | Complex migration from Directus |

### Recommended Production Stack

```
Hosting:        Railway or Hetzner VPS (Docker Compose)
Database:       Railway PostgreSQL or managed (Supabase/Neon)
CDN/Storage:    Cloudflare R2 (already have infrastructure)
DNS:            Cloudflare (already managing)
SSL:            Cloudflare or Let's Encrypt
Email:          Resend or Postmark (transactional)
Payments:       Stripe
Monitoring:     Uptime Robot + Directus Flows for alerts
Backups:        Automated pg_dump to R2 daily
```

### DNS Records Needed

```
A     vidicrm.com         → server IP
A     app.vidicrm.com     → server IP (Directus)
A     portal.vidicrm.com  → server IP (Next.js)
A     api.vidicrm.com     → server IP (Directus API)
CNAME cdn.vidicrm.com     → R2 custom domain
```

---

## Appendix A: Tags System

```
tags
├── id                    UUID (PK)
├── name                  string (unique)
├── slug                  string (unique, auto-generated)
├── color                 string (#hex)
├── category              enum: general | industry | service | content_type | priority | custom
├── description           text
├── usage_count           integer (auto-calculated)
```

Junction tables for M2M relationships:
- `clients_tags`
- `contacts_tags`
- `deals_tags`
- `projects_tags`
- `media_assets_tags`
- `tasks_tags`

---

## Appendix B: Notification & Communication

```
messages
├── id                    UUID (PK)
├── thread_id             UUID (group messages into threads)
├── client_id             UUID → clients
├── sender_type           enum: team | client
├── sender_user_id        UUID → directus_users (nullable)
├── sender_contact_id     UUID → contacts (nullable)
├── subject               string
├── body                  text (markdown supported)
├── attachments           M2M → directus_files
├── read_at               timestamp
├── created_at            timestamp

email_templates
├── id                    UUID (PK)
├── name                  string ("Welcome Email", "Invoice Sent", "Deliverable Ready")
├── subject               string (supports {{variables}})
├── body                  text (HTML, supports {{variables}})
├── type                  enum: transactional | marketing | notification
├── variables             JSON (list of available merge variables)
├── is_active             boolean

notifications
├── id                    UUID (PK)
├── user_id               UUID → directus_users (internal) OR contact_id (portal)
├── contact_id            UUID → contacts (nullable)
├── type                  enum: deal_update | project_update | deliverable_ready |
│                               invoice_sent | message_received | approval_needed |
│                               milestone_completed | payment_received
├── title                 string
├── body                  text
├── link                  string (deep link to relevant item)
├── read                  boolean
├── created_at            timestamp
```

---

## Appendix C: Quick Reference - Collection Count

| Category | Collections | Purpose |
|----------|------------|---------|
| Core CRM | 7 | clients, contacts, deals, pipelines, stages, activities, tags |
| Client Profiles | 4 | websites, social accounts, brand assets, content strategy |
| Projects | 4 | projects, milestones, tasks, deliverables |
| Content | 4 | proposals, media assets, social posts, content calendar |
| Financial | 5 | packages, invoices, invoice items, estimates, payments |
| Communication | 3 | messages, email templates, notifications |
| **Total** | **27 collections** | + junction tables for M2M |

---

*This document serves as the definitive schema and architecture reference for VidiCRM. All Directus collections should be created to match these schemas. No code should be written until this plan is approved.*

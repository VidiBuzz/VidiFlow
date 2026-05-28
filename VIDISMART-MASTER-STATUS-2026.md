# VidiSmart Master Status & Project Overview

**Last Updated:** 2026-04-22  
**Workspace:** `m:/code/vidismart`  
**Author:** James May, VidiSmart · Savage Digital Solutions

---

## Table of Contents

1. [Active Projects](#1-active-projects)
2. [Infrastructure & Architecture](#2-infrastructure--architecture)
3. [AI Agents & Superpowers](#3-ai-agents--superpowers)
4. [MCP Servers & Skills](#4-mcp-servers--skills)
5. [Deployment Status](#5-deployment-status)
6. [Documentation & Plans](#6-documentation--plans)
7. [Quick Start Guide](#7-quick-start-guide)

---

## 1. Active Projects

### 1.1 Smart Book - "The Speed of Agentic Visual AI"
| Detail | Value |
|--------|-------|
| **Status** | ✅ LIVE & OPERATIONAL |
| **Landing Page** | https://vidismart.com/smart-book/index.html |
| **Book Reader** | https://vidismart.com/smart-book/print-book.html |
| **Content** | 37 chapters, 5 parts, 3 personas |
| **Tech Stack** | HTML5/CSS3, Vanilla JS, Three.js, Cloudflare R2 CDN |
| **Hosting** | SiteGround (git push deployment) |

**Features:**
- Three.js neural network background animation
- Hero image slideshow (10 images, auto-rotate)
- Persona-based content filtering
- Two-column reading layout with sticky sidebar
- Image lightbox with keyboard navigation
- Dark mode toggle
- Scroll progress bar and scroll-spy navigation

**Related Files:**
- [`smart-book/index.html`](smart-book/index.html)
- [`smart-book/print-book.html`](smart-book/print-book.html)
- [`smart-book/data.js`](smart-book/data.js)
- [`smart-book/STATUS.md`](smart-book/STATUS.md)

---

### 1.2 Directus CMS (VidiCRM)
| Detail | Value |
|--------|-------|
| **Status** | ✅ RUNNING (Local Docker + Railway) |
| **Local URL** | http://localhost:8055 |
| **Production URL** | https://vidicrm.com/admin |
| **Database** | PostgreSQL (vidismart_community) |
| **Storage** | Cloudflare R2 (vidismart-media bucket) |
| **Cache** | Redis |

**Collections:** 40+ collections including `site_pages` (50 items), `waitlist_leads`, `posts`, `news`, `videos`, `navigation`

**Related Files:**
- [`DIRECTUS-COMPLETE-STATUS.md`](DIRECTUS-COMPLETE-STATUS.md)
- [`DIRECTUS-INTEGRATION-PLAN.md`](DIRECTUS-INTEGRATION-PLAN.md)
- [`converge/docker-compose.yml`](converge/docker-compose.yml)

---

### 1.3 VidiFlow - AI Knowledge Base & Workflow Platform
| Detail | Value |
|--------|-------|
| **Status** | 🔄 In Development |
| **Framework** | Next.js 15 (App Router) |
| **Location** | `vidiflow/frontend/` |
| **Target Deploy** | Vercel |

**Related Files:**
- [`vidiflow/frontend/`](vidiflow/frontend/)

---

### 1.4 Vidi.News
| Detail | Value |
|--------|-------|
| **Status** | 🔄 In Development |
| **Framework** | Next.js 15 (App Router) |
| **Location** | `m:/code/vidi.news/` |
| **Target Deploy** | Vercel |

---

### 1.5 SmartGen - AI Media Generation
| Detail | Value |
|--------|-------|
| **Status** | 🔄 In Development |
| **Location** | `smartgen/` |
| **Database** | smartgen_db (PostgreSQL) |
| **Integration** | Directus API for media storage |

---

### 1.6 VidiPitch - Federal Contracting Intelligence
| Detail | Value |
|--------|-------|
| **Status** | 🔄 In Development |
| **Location** | `vidipitch/` |
| **Database** | vidipitch_db (PostgreSQL) |
| **Target Deploy** | Vercel + Railway |

---

### 1.7 FortunaTrade
| Detail | Value |
|--------|-------|
| **Status** | ✅ Built |
| **Files** | [`FortunaTrade.html`](FortunaTrade.html), [`FortunaTrade-unified.html`](FortunaTrade-unified.html) |

---

### 1.8 AI Consultants Directory
| Detail | Value |
|--------|-------|
| **Status** | ✅ Built |
| **Files** | [`ai_consultants_directory_v3_fresh.html`](ai_consultants_directory_v3_fresh.html), [`vidismart.consultants.html`](vidismart.consultants.html) |

---

### 1.9 VidiShop / SmartGen UI
| Detail | Value |
|--------|-------|
| **Status** | ✅ Built |
| **Files** | [`VidiShop.Gen2.UI.html`](VidiShop.Gen2.UI.html), [`VidiShop.SmartGenUi.html`](VidiShop.SmartGenUi.html) |

---

## 2. Infrastructure & Architecture

### 2.1 Database Architecture
**Single PostgreSQL Instance** with multiple databases:

```
PostgreSQL Instance (Port 5432)
├── directus_db      ← Directus CMS (users, content, collections)
├── vidipitch_db     ← VidiPitch data (contracts, bids, agencies)
├── smartgen_db      ← SmartGen media generation data
└── vidicrm_db       ← VidiCRM customer/sales data
```

**Related Files:**
- [`DATABASE_ARCHITECTURE.md`](DATABASE_ARCHITECTURE.md)

### 2.2 Docker Containers (converge stack)
| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `vidismart-postgres` | postgis/postgis:15-3.3 | 5432 | PostgreSQL + PostGIS |
| `vidismart-redis` | redis:6 | 6379 | Cache layer |
| `vidismart-directus` | directus/directus:latest | 8055 | Headless CMS |

**Related Files:**
- [`converge/docker-compose.yml`](converge/docker-compose.yml)

### 2.3 Storage
- **Cloudflare R2**: `vidismart-media` bucket for all media assets
- **CDN**: https://cdn.vidi.news/images/

---

## 3. AI Agents & Superpowers

### 3.1 Agent Definitions (`/agents` directory)

| Agent | Description | File |
|-------|-------------|------|
| **Research Agent** | Web research, data extraction, source verification | [`agents/research-agent.md`](agents/research-agent.md) |
| **Content Creation Agent** | Article generation, SEO optimization, brand voice adaptation | [`agents/content-creation-agent.md`](agents/content-creation-agent.md) |
| **Visual Design Agent** | Logo creation, infographics, presentation design | [`agents/visual-design-agent.md`](agents/visual-design-agent.md) |
| **Base Agent** | TypeScript base agent implementation | [`agents/base-agent.ts`](agents/base-agent.ts) |
| **Text Rebranding Agent** | Text content rebranding | [`agents/text-rebranding-agent.ts`](agents/text-rebranding-agent.ts) |
| **Verification Agent** | Content verification | [`agents/verification-agent.ts`](agents/verification-agent.ts) |

### 3.2 Agent Execution Plan
**Related Files:**
- [`AGENT_EXECUTION_PLAN.md`](AGENT_EXECUTION_PLAN.md)

**Planned Agents:**
- Agent Alpha: VidiFlow Repo + Vercel
- Agent Bravo: Vidi.NEWS Repo + Vercel
- Agent Charlie: VidiSmart Repo + Railway
- Agent Delta: Cleanup & verification

### 3.3 AI Agents Book
**Title:** "Accelerating at the Speed of AI: 2026 Edition"

**Chapters:**
- Chapter 1: AI Agents & Automation - The New Workforce Paradigm ✅
- Chapter 2: Multi-Agent Systems & Orchestration (Coming Soon)
- Chapter 3: Integration Strategies for Enterprise Deployment (Coming Soon)
- Chapter 4: Economic Impact & ROI Frameworks (Coming Soon)
- Chapter 5: Ethical Considerations & Governance (Coming Soon)

**Related Files:**
- [`agents/README.md`](agents/README.md)
- [`agents/chapter-1-ai-agents-and-automation.md`](agents/chapter-1-ai-agents-and-automation.md)

---

## 4. MCP Servers & Skills

### 4.1 MCP Servers Available

| Server | Location | Purpose |
|--------|----------|---------|
| **Playwright** | `mcp-servers/playwright-server/` | Browser automation, testing, screenshots |
| **Railway** | Built-in | Railway deployment, logs, environment management |
| **Directus** | Built-in | CMS content management, CRUD operations |

### 4.2 How to Use MCP Skills

#### Playwright MCP (Browser Automation)
Use for:
- Opening and navigating to web pages
- Taking screenshots to verify UI changes
- Testing interactive elements
- Form filling and submission
- Browser console debugging

**Example Usage:**
```
1. Navigate: browser_navigate → url: "https://vidismart.com"
2. Snapshot: browser_snapshot → get page accessibility tree
3. Screenshot: browser_take_screenshot → type: "png"
4. Click: browser_click → ref: "element-ref"
5. Type: browser_type → text: "search query"
```

#### Railway MCP (Deployment)
Use for:
- Deploying applications to Railway
- Checking deployment logs
- Managing environments (staging/production)
- Setting environment variables
- Listing services and deployments

**Example Usage:**
```
1. Check status: check-railway-status
2. List services: list-services → workspacePath: "."
3. Deploy: deploy → workspacePath: "."
4. Get logs: get-logs → workspacePath: ".", logType: "deploy"
```

#### Directus MCP (CMS)
Use for:
- Managing content collections
- Creating/updating/deleting items
- Searching across collections
- Retrieving specific items

**Example Usage:**
```
1. List collections: list_collections
2. Get items: get_collection_items → collection: "site_pages"
3. Create item: create_item → collection: "site_pages", data: {...}
4. Update item: update_item → collection: "site_pages", id: "123", data: {...}
```

### 4.3 Roo Skills & Modes

| Mode | Slug | Use Case |
|------|------|----------|
| 🏗️ Architect | `architect` | Planning, design, architecture, documentation |
| 💻 Code | `code` | Writing, modifying, refactoring code |
| ❓ Ask | `ask` | Explanations, documentation, questions |
| 🪲 Debug | `debug` | Troubleshooting, debugging, logging |
| 🪃 Orchestrator | `orchestrator` | Multi-step projects, task coordination |

---

## 5. Deployment Status

### 5.1 Platform Assignments

| Project | Platform | URL | Status |
|---------|----------|-----|--------|
| VidiSmart (Static) | SiteGround | https://vidismart.com | ✅ Live |
| Smart Book | SiteGround | https://vidismart.com/smart-book/ | ✅ Live |
| Directus CMS | Railway + Local Docker | https://vidicrm.com/admin | ✅ Live |
| VidiFlow | Vercel | vidiflow-eta.vercel.app | 🔄 Pending |
| Vidi.News | Vercel | vidi.news | 🔄 Pending |
| SmartGen | Railway | TBD | 🔄 Pending |
| VidiPitch | Vercel + Railway | TBD | 🔄 Pending |

### 5.2 Launch Plan
**Related Files:**
- [`VIDISMART-LAUNCH-PLAN.md`](VIDISMART-LAUNCH-PLAN.md)

**Phases:**
1. Phase 1: VIDIpitch Test Launch (Directus + Smart Content)
2. Phase 2: Community Platform Setup (NodeBB)
3. Phase 3: Smart Content Pipeline (Vector Embeddings + Knowledge Graph)
4. Phase 4: VidiSmart Production Migration

---

## 6. Documentation & Plans

### 6.1 Key Documentation Files

| File | Purpose |
|------|---------|
| [`VIDISMART-LAUNCH-PLAN.md`](VIDISMART-LAUNCH-PLAN.md) | Complete launch plan with Directus + NodeBB + Smart Content |
| [`DATABASE_ARCHITECTURE.md`](DATABASE_ARCHITECTURE.md) | PostgreSQL architecture with multiple databases |
| [`DIRECTUS-COMPLETE-STATUS.md`](DIRECTUS-COMPLETE-STATUS.md) | Directus infrastructure assessment |
| [`DIRECTUS-INTEGRATION-PLAN.md`](DIRECTUS-INTEGRATION-PLAN.md) | Migration plan for HTML pages to Directus CMS |
| [`AGENT_EXECUTION_PLAN.md`](AGENT_EXECUTION_PLAN.md) | Repo separation and deployment plan |
| [`smart-book/STATUS.md`](smart-book/STATUS.md) | Smart book project status |

### 6.2 Plans & Strategies

| Plan | Status |
|------|--------|
| Repo Separation (3 GitHub repos) | 📋 Planned |
| Directus Content Migration | 📋 Planned |
| NodeBB Community Platform | 📋 Planned |
| Vector Embeddings + Knowledge Graph | 📋 Planned |
| SSO + Role Sync (Directus → NodeBB) | 📋 Planned |

---

## 7. Quick Start Guide

### 7.1 How to Use Superpowers/Skills

#### For Browser Testing (Playwright MCP):
1. Ask me to "open the page in browser"
2. I'll navigate to the URL, take a screenshot, and verify changes
3. This is MANDATORY for any visual/CSS/HTML work

#### For Railway Deployment:
1. Ensure Railway CLI is authenticated: `railway login`
2. Link your project: `railway link`
3. Deploy: `railway up`
4. Or ask me to deploy using the Railway MCP tools

#### For Directus Content Management:
1. Access admin at https://vidicrm.com/admin
2. Use Directus MCP tools to programmatically manage content
3. Collections available: `site_pages`, `posts`, `news`, `videos`, etc.

### 7.2 Common Commands

```bash
# Start Docker containers (Directus stack)
cd converge && docker-compose up -d

# Deploy to SiteGround
git push siteground fresh-start:master

# Railway deployment
railway login
railway link
railway up

# Vercel deployment
vercel --prod
```

### 7.3 Project Structure Overview

```
m:/code/vidismart/
├── agents/                    # AI agent definitions and implementations
├── api/                       # Backend API (Node.js)
├── assets/                    # CSS, JS, images
├── converge/                  # Docker stack (Directus, PostgreSQL, Redis)
├── database/                  # Database migrations
├── frontend/                  # Frontend pages
├── mcp-servers/               # MCP server configurations
├── scripts/                   # Utility scripts
├── smart-book/                # Interactive digital book
├── *.html                     # Various built pages
├── *.md                       # Documentation and plans
└── *.png                      # Screenshots and assets
```

---

## 8. Next Steps & Priorities

### High Priority
1. [ ] Complete Railway authentication for deployments
2. [ ] Configure SMTP for Directus (VidiMail)
3. [ ] Create GitHub repos for repo separation
4. [ ] Set up NodeBB community platform

### Medium Priority
1. [ ] Migrate smart-book content to Directus
2. [ ] Implement SSO bridge (Directus → NodeBB)
3. [ ] Set up vector embeddings pipeline
4. [ ] Deploy VidiFlow to Vercel

### Low Priority
1. [ ] Install Directus extensions
2. [ ] Add analytics to smart-book
3. [ ] Implement offline reading (service worker)
4. [ ] Create ePub export for smart-book

---

*This document serves as the master reference for all VidiSmart projects and capabilities.*

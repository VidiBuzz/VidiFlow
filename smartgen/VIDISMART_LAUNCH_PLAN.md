# VidiSmart Launch Plan - Agentic Execution Blueprint

**Generated:** 2026-04-17  
**Status:** Ready for Agentic Execution  
**Priority:** 🔴 CRITICAL

---

## Executive Summary

VidiSmart is an AI-powered business transformation platform that analyzes tech stacks and delivers personalized AI solutions. This plan consolidates 15+ existing planning documents into a unified, executable roadmap using multi-agent orchestration.

### Current State Assessment

| Component | Status | Location | Priority |
|-----------|--------|----------|----------|
| **Frontend** (index.html) | ✅ Live | SiteGround / Vercel | - |
| **Directus CMS** (VidiCRM) | ✅ Running | localhost:8055 | - |
| **PostgreSQL + PostGIS** | ✅ Running | localhost:5432 | - |
| **Cloudflare R2 Storage** | ✅ Connected | vidismart-media bucket | - |
| **AI Models Stack** | ✅ Ready | Ollama + OpenRouter | HIGH |
| **Vector Search (Vespa)** | ⚠️ Needs config | Port 8089 | HIGH |
| **Neo4j Knowledge Graph** | ⚠️ Needs config | Port 7474 | MEDIUM |
| **SmartChannel CX** | 📋 Planned | Frame.io-style editor | HIGH |
| **VidiMail (Email)** | ❌ Not configured | SMTP missing | HIGH |

---

## 1. VISION & SUCCESS METRICS

### 1.1 North Star
> **"10,000 businesses transforming their tech stacks with AI-powered Smart Stacks within 90 days of launch"**

### 1.2 Key Results (OKRs)
| Objective | Key Result | Target |
|-----------|-----------|--------|
| **Launch Ready** | All critical paths functional | 2 weeks |
| **Waitlist Conversion** | Waitlist → Email subscribers | 50% conversion |
| **Content Discoverability** | Pages indexed in vector DB | 100% |
| **Community Growth** | Active Directus users | 100/ month |

---

## 2. AGENTIC ORCHESTRATION ARCHITECTURE

### 2.1 Multi-Agent Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT                         │
│                    (Qwen3-Max / Claude)                      │
│         Task decomposition, routing, verification           │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  CODER AGENT  │    │ RESEARCH AGENT│    │  VISION AGENT │
│   (GLM-5)     │    │ (DeepSeek R1) │    │  (Qwen3-VL)   │
│               │    │               │    │               │
│ • Frontend    │    │ • Plans docs  │    │ • UI review   │
│ • API server  │    │ • Strategy    │    │ • Graphics QC │
│ • Directus ext│    │ • Content     │    │ • Mockups     │
└───────────────┘    └───────────────┘    └───────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  MCP: Postgres│    │ MCP: Brave    │    │ MCP: Browser  │
│  MCP: Filesys │    │ MCP: GitHub   │    │ MCP: Playwright│
│  MCP: Directus│    │ MCP: WebFetch │    │ MCP: Kapture  │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 2.2 Agent Definitions

| Agent | Model | Responsibilities | MCP Tools |
|-------|-------|------------------|-----------|
| **Coordinator** | Qwen3-Max | Task decomposition, routing, orchestration | All tools |
| **Coder** | GLM-5 | Code generation, Directus extensions, API development | Postgres, Filesystem, Directus |
| **Research** | DeepSeek R1 | Plan analysis, content strategy, documentation | Brave Search, GitHub, WebFetch |
| **Vision** | Qwen3-VL | UI/UX review, graphics QC, visual consistency | Browser, Playwright, Kapture |

---

## 3. LAUNCH PHASES

### Phase 1: Foundation (Week 1-2)
**Goal:** Get all infrastructure components operational

#### 1.1 Directus Completion 🔴
**Owner:** Coder Agent  
**Priority:** CRITICAL

- [ ] **Email SMTP Setup**
  - Configure Resend API for transactional email
  - Create waitlist confirmation flow
  - Set up VidiMail sender identity

- [ ] **CORS Configuration**
  - Configure allowed origins for API access
  - Set up proper auth headers

- [ ] **Custom Branding**
  - Upload VidiSmart logo
  - Set project name and colors
  - Create custom Directus login page

- [ ] **Collections Audit**
  - Verify 40+ collections are properly indexed
  - Create missing collections for new content types
  - Set up relationships between collections

**Verification:**
```bash
# Test Directus health
curl http://localhost:8055/server/health

# Test email flow
curl -X POST http://localhost:8055/flows/trigger/webhook-id \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vidismart.com"}'
```

#### 1.2 Vector Search Setup 🔴
**Owner:** Coder Agent  
**Priority:** HIGH

- [ ] **Vespa Configuration**
  - Deploy Vespa container on port 8089
  - Create content schema with vector fields
  - Set up HNSW index for semantic search

- [ ] **Embedding Pipeline**
  - Configure Qwen3 embeddings via Ollama
  - Create batch embedding job for existing content
  - Set up real-time indexing webhook

- [ ] **Hybrid Search**
  - Implement BM25 + vector hybrid ranking
  - Add geo-spatial filtering (PostGIS integration)
  - Set up query API endpoint

**Verification:**
```bash
# Test Vespa
curl http://localhost:8080/ApplicationStatus

# Test vector search
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"yql":"select * from content where vector_nearest(ae)", "hits":10}'
```

#### 1.3 Frontend Polish 🟠
**Owner:** Vision Agent + Coder Agent  
**Priority:** MEDIUM-HIGH

- [ ] **Homepage Graphics Overhaul**
  - Apply BrandSwap 3D card patterns
  - Add animated gradient backgrounds
  - Implement glass morphism nav

- [ ] **Mobile Responsiveness**
  - Test on all breakpoints
  - Fix any layout issues
  - Optimize for touch

- [ ] **Performance Audit**
  - Lighthouse score > 90
  - Image optimization
  - Lazy loading implementation

**Verification:**
```bash
# Run Playwright tests
npx playwright test --project=chromium

# Check Lighthouse
npx lighthouse https://vidismart.com --output=json --output-path=./lighthouse-report.json
```

---

### Phase 2: Content & AI (Week 3-4)
**Goal:** Populate vector DB, configure AI agents

#### 2.1 Content Migration 🟠
**Owner:** Coder Agent  
**Priority:** HIGH

- [ ] **HTML → Directus Migration**
  - Run existing migration scripts
  - Migrate 100+ HTML pages to Directus collections
  - Set up CMS workflow for content editors

- [ ] **Media Asset Indexing**
  - Upload existing images to R2
  - Generate embeddings for all media
  - Index in Vespa vector store

- [ ] **Metadata Enrichment**
  - Add structured metadata to all content
  - Set up geo-tags for local content
  - Create content relationships

**Verification:**
```bash
# Run migration
npm run migrate:dry-run
npm run migrate

# Verify counts
curl http://localhost:8055/items/site_pages?limit=1
```

#### 2.2 AI Agent Training 🟡
**Owner:** Research Agent  
**Priority:** MEDIUM

- [ ] **Prompt Engineering**
  - Create system prompts for each agent role
  - Test and iterate on response quality
  - Document prompt library

- [ ] **Knowledge Base**
  - Ingest all plans into vector DB
  - Create RAG retrieval pipelines
  - Set up knowledge graph (Neo4j)

- [ ] **Model Fine-tuning**
  - Evaluate open-source models
  - Select best model per task
  - Set up model routing

**Verification:**
```bash
# Test agent response
curl -X POST http://localhost:8000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"task":"Analyze my tech stack","context":{"url":"example.com"}}'
```

---

### Phase 3: SmartChannel CX (Week 5-6)
**Goal:** Launch collaborative video editing platform

#### 3.1 Core Video Editor 🟡
**Owner:** Coder Agent  
**Priority:** HIGH

- [ ] **Browser-Based Editor**
  - Implement Remotion video editing
  - Set up timeline UI
  - Add cut/trim/split operations

- [ ] **Media Pool Integration**
  - Connect to R2 storage
  - Implement media browser
  - Set up upload pipeline

- [ ] **Collaboration Features**
  - Time-stamped comments (Frame.io-style)
  - Version control
  - Real-time sync (WebSocket)

**Verification:**
```bash
# Test video processing
curl -X POST http://localhost:8188/prompt \
  -d '{"prompt": "edit video clip"}'

# Test collaboration
open http://localhost:3000/project/test-project
```

#### 3.2 AI Effects Pipeline 🟡
**Owner:** Vision Agent  
**Priority:** MEDIUM

- [ ] **ComfyUI Integration**
  - Deploy ComfyUI server
  - Create video effect workflows
  - Set up render queue

- [ ] **AI Graphics Generation**
  - Integrate Gemini API
  - Create thumbnail generator
  - Build auto-captioning

- [ ] **Video Intelligence**
  - Implement content analysis
  - Create smart tag extraction
  - Set up auto-chaptering

---

### Phase 4: Launch (Week 7-8)
**Goal:** Public launch and community building

#### 4.1 Deployment 🔴
**Owner:** Coder Agent  
**Priority:** CRITICAL

- [ ] **Production Infrastructure**
  - Set up Railway/Vercel deployment
  - Configure environment variables
  - Set up CI/CD pipeline

- [ ] **Domain & SSL**
  - Configure DNS for vidismart.com
  - Set up SSL certificates
  - Enable Cloudflare proxy

- [ ] **Monitoring & Alerts**
  - Set up error tracking (Sentry)
  - Configure uptime monitoring
  - Create dashboards

#### 4.2 Marketing 🚀
**Owner:** Research Agent  
**Priority:** HIGH

- [ ] **Launch Campaign**
  - Create landing pages
  - Set up email sequences
  - Configure analytics

- [ ] **SEO Optimization**
  - Meta tags for all pages
  - Structured data markup
  - Sitemap generation

- [ ] **Community Setup**
  - Create Discord/Slack community
  - Set up feedback channels
  - Launch beta program

---

## 4. CRITICAL DEPENDENCIES & BLOCKERS

### 4.1 Hard Blockers (Must fix before launch)
| Blocker | Impact | Solution | Owner |
|---------|---------|----------|-------|
| Email SMTP not configured | No user communication | Set up Resend API | Coder |
| CORS not configured | API failures | Configure Directus CORS | Coder |
| Vector search not operational | No AI search | Deploy/config Vespa | Coder |

### 4.2 Soft Blockers (Should fix before launch)
| Blocker | Impact | Solution | Priority |
|---------|---------|----------|----------|
| No custom Directus branding | Brand perception | Upload logo, set colors | MEDIUM |
| Homepage needs polish | Conversion rate | Apply BrandSwap patterns | MEDIUM |
| Knowledge graph empty | Poor RAG | Ingest plans into Neo4j | LOW |

### 4.3 External Dependencies
| Dependency | Status | Contact |
|------------|--------|---------|
| SiteGround hosting | Active | - |
| Cloudflare R2 | Active | - |
| Resend API | Needs key | james@vidismart.com |
| Railway deployment | Needs setup | - |

---

## 5. MCP SERVER CONFIGURATION

### 5.1 Current MCP Servers
```json
{
  "mcpServers": {
    "vidismart-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "connection": "postgresql://postgres:password@localhost:5432/vidismart_community"
    },
    "vidismart-filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "paths": ["m:/code/vidismart"]
    },
    "vidismart-brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {"BRAVE_API_KEY": "${BRAVE_API_KEY}"}
    },
    "vidismart-github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"}
    },
    "vidismart-playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "vidismart-fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### 5.2 Required Environment Variables
```bash
# API Keys
BRAVE_API_KEY=tvly-dev-xxx        # Get from brave.com
GITHUB_TOKEN=ghp_xxx              # Generate in GitHub settings
RESEND_API_KEY=re_xxx              # Get from resend.com

# Service Connections
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=xxx                 # From Directus admin

# Cloudflare R2
R2_ACCOUNT_ID=5830508745fd2ac063426ebf9429c22d
R2_ACCESS_KEY_ID=e9c7b7eb9ea570cc59e413cfdf580deb
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=vidismart-media

# AI Services
OLLAMA_HOST=http://localhost:11434
VESPA_ENDPOINT=http://localhost:8080
```

---

## 6. VERIFICATION COMMANDS

### 6.1 Health Check Script
```bash
#!/bin/bash
echo "=== VidiSmart Health Check ==="

# Directus
curl -s http://localhost:8055/server/health && echo " Directus OK" || echo " Directus FAIL"

# PostgreSQL
docker exec vidismart-postgres pg_isready -U directus && echo " Postgres OK" || echo " Postgres FAIL"

# Redis
docker exec vidismart-redis redis-cli ping && echo " Redis OK" || echo " Redis FAIL"

# Vespa (if running)
curl -s http://localhost:8080/ApplicationStatus && echo " Vespa OK" || echo " Vespa NOT RUNNING"

echo "=== End Health Check ==="
```

### 6.2 Agent Test Commands
```bash
# Test Coordinator
node agents/run-coordinator.js --task "Analyze vidismart.com and suggest improvements"

# Test Coder
node agents/run-coder.js --task "Add email SMTP configuration to docker-compose.yml"

# Test Research
node agents/run-research.js --task "Research latest AI trends for small businesses"

# Test Vision
node agents/run-vision.js --task "Review homepage UI and identify issues"
```

---

## 7. RISK MITIGATION

### 7.1 Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Vespa deployment complexity | HIGH | HIGH | Use Docker Compose, document steps |
| Ollama model compatibility | MEDIUM | MEDIUM | Test all models before use |
| R2 storage costs | LOW | MEDIUM | Set up usage monitoring |
| Directus performance at scale | MEDIUM | MEDIUM | Add Redis caching, optimize queries |

### 7.2 Launch Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Waitlist email deliverability | HIGH | HIGH | Use Resend (proven deliverability) |
| SEO indexing issues | MEDIUM | HIGH | Pre-submit sitemaps, use structured data |
| Competition from alternatives | LOW | MEDIUM | Focus on unique "Smart Stack" positioning |

---

## 8. NEXT ACTIONS (48-HOUR SPRINT)

### Day 1-2: Critical Path
1. **Coder Agent:** Configure Resend SMTP, test email flow
2. **Coder Agent:** Configure Directus CORS
3. **Coder Agent:** Deploy and configure Vespa
4. **All Agents:** Run full health check

### Day 3-4: Content & AI
5. **Coder Agent:** Run HTML migration scripts
6. **Research Agent:** Ingest plans into vector DB
7. **Vision Agent:** Review and fix homepage graphics

### Day 5-6: Polish & Test
8. **Coder Agent:** Set up monitoring dashboards
9. **All Agents:** Run Playwright E2E tests
10. **Coordinator:** Generate launch readiness report

---

## 9. DOCUMENT LINKS

### Planning Documents
| Document | Purpose |
|----------|---------|
| [`plans/VIDISMART_COMMUNITY_REFINED_PLAN.md`](plans/VIDISMART_COMMUNITY_REFINED_PLAN.md) | Community platform architecture |
| [`plans/VIDISMART_VECTOR_STACK_ARCHITECTURE.md`](plans/VIDISMART_VECTOR_STACK_ARCHITECTURE.md) | Vector DB & GraphRAG design |
| [`plans/vidicity-architecture-plan.md`](plans/vidicity-architecture-plan.md) | VidiCity hyperlocal platform |
| [`plans/SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html`](plans/SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html) | Video editing platform |
| [`plans/Graphics.VidiSmart.md`](plans/Graphics.VidiSmart.md) | UI/Graphics enhancement tasks |

### Status Documents
| Document | Purpose |
|----------|---------|
| [`DIRECTUS-COMPLETE-STATUS.md`](DIRECTUS-COMPLETE-STATUS.md) | Directus configuration status |
| [`MIGRATION-README.md`](MIGRATION-README.md) | HTML-to-Directus migration |

### Key Files
| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Main homepage |
| [`frontend/index.html`](frontend/index.html) | Next.js frontend |
| [`converge/`](converge/) | Backend services |

---

**Agentic Execution Ready.** Awaiting approval to begin Phase 1 tasks.

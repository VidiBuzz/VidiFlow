# VidiSmart Agentic Execution System - Complete Plan

**Created:** 2026-04-23  
**Status:** READY FOR IMPLEMENTATION  
**Purpose:** Multi-agent orchestration system to execute the VidiSmart launch plan across all phases

---

## Executive Summary

This plan defines a complete multi-agent system that will autonomously execute the VidiSmart launch roadmap across 5 phases:
1. Foundation (Directus, Vespa, Git infra)
2. Content & AI (Migration, embeddings, agent training)
3. SmartChannel CX (Video editor platform)
4. New Features (VidiMail, VidiTwin, Media Explorer)
5. Launch & Deployment

The agent system uses a **Coordinator-Coder-Research-Vision** architecture with MCP tool integration, persistent task queues, and progress tracking.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT (Qwen3-Max)                 │
│         Task decomposition, routing, verification, reporting    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CODER AGENT   │  │  RESEARCH AGENT │  │   VISION AGENT  │  │  OPS AGENT      │
│   (GLM-5/Claude)│  │  (DeepSeek R1) │  │  (Qwen3-VL)     │  │  (GPT-4)        │
│                 │  │                 │  │                 │  │                 │
│ • Code gen      │  │ • Plan analysis│  │ • UI review     │  │ • Infra ops     │
│ • Directus ext  │  │ • Content strat│  │ • Graphics QA   │  │ • Deployment    │
│ • API dev       │  │ • Research     │  │ • Mockups       │  │ • Monitoring    │
│ • Config mgmt   │  │ • Docs         │  │ • Accessibility │  │ • DevOps        │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
            │                 │                 │                 │
            └─────────────────┼─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  MCP: Postgres│    │ MCP: Brave    │    │ MCP: Browser  │
│  MCP: Filesys │    │ MCP: GitHub   │    │ MCP: Playwright│
│  MCP: Directus│    │ MCP: WebFetch │    │ MCP: Kapture  │
│  MCP: Redis   │    │              │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Phase 1: Foundation Implementation (Week 1-2) - AGENT TASKS

### 1.1 Directus Completion (CRITICAL) → CODER AGENT

**Task ID:** DIR-001  
**Priority:** CRITICAL  
**Owner:** Coder Agent  
**Dependencies:** None  
**Estimated Time:** 4 hours

**Subtasks:**
1. **DIR-001.1:** Configure Resend SMTP for transactional email
   - Add Resend API key to Railway environment variables
   - Create email flow in Directus for waitlist confirmations
   - Set up VidiMail sender identity (noreply@vidismart.com)
   - Test email delivery with curl

2. **DIR-001.2:** Configure CORS for API access
   - Update Directus CORS settings to allow `https://vidismart.com` and `http://localhost:8055`
   - Set `CORS_ORIGIN` environment variable in docker-compose.yml
   - Verify CORS headers in API responses

3. **DIR-001.3:** Apply custom VidiSmart branding
   - Upload VidiSmart logo to Directus assets
   - Set project name to "VidiSmart"
   - Configure brand colors (from Graphics.VidiSmart.md)
   - Customize Directus login page with VidiSmart branding

4. **DIR-001.4:** Audit 40+ collections
   - List all Directus collections via API
   - Verify indexes exist on all collections
   - Create missing collections for new content types (VidiMail campaigns, VidiTwin avatars, MediaLibrary files)
   - Set up relationships between collections

**Verification Commands:**
```bash
# Run by Ops Agent after Coder completes
curl http://localhost:8055/server/health
curl -X POST http://localhost:8055/flows/trigger/webhook-id \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vidismart.com"}'
```

**Acceptance Criteria:**
- [ ] Health endpoint returns 200 OK
- [ ] Test email received in inbox
- [ ] CORS headers allow vidismart.com origin
- [ ] Custom branding visible in Directus admin
- [ ] All 40+ collections exist with proper indexes

---

### 1.2 Vector Search Setup (HIGH) → CODER AGENT

**Task ID:** VESPA-001  
**Priority:** HIGH  
**Owner:** Coder Agent  
**Dependencies:** DIR-001 complete  
**Estimated Time:** 6 hours

**Subtasks:**
1. **VESPA-001.1:** Deploy Vespa container
   - Create docker-compose service for Vespa on port 8089
   - Configure Vespa schema for hybrid search (vector + BM25 + geospatial)
   - Set up HNSW index for semantic search
   - Deploy and verify Vespa is running

2. **VESPA-001.2:** Configure embedding pipeline
   - Install Ollama Qwen3 model for embeddings
   - Create batch embedding script for existing content
   - Set up real-time indexing webhook from Directus to Vespa
   - Test embedding generation

3. **VESPA-001.3:** Implement hybrid search endpoint
   - Create Vespa query API that combines:
     - BM25 keyword search
     - Vector semantic similarity (cosine)
     - GraphRAG context from Neo4j
     - Geospatial filtering (PostGIS)
   - Build result fusion engine (RRF ranking)
   - Test search queries

**Verification Commands:**
```bash
# Vespa health
curl http://localhost:8080/ApplicationStatus

# Vector search test
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"yql":"select * from content where vector_nearest(ae)", "hits":10}'

# Hybrid search test
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"yql":"select * from content where ({rank: semantic}nearestNeighbor(embedding, query_embedding) or {rank: text}userQuery()) and geoDistance(location, 37.7749, -122.4194) < 50km", "ranking":"hybrid"}'
```

**Acceptance Criteria:**
- [ ] Vespa container running on port 8089
- [ ] Health check returns "UP"
- [ ] Vector search returns results for test query
- [ ] Hybrid search combines vector + keyword + geo
- [ ] Indexing webhook triggers on Directus updates

---

### 1.3 Git Infrastructure Fix (IMMEDIATE) → OPS AGENT

**Task ID:** GIT-001  
**Priority:** CRITICAL  
**Owner:** Ops Agent  
**Dependencies:** None  
**Estimated Time:** 1 hour

**Steps:**
1. Create new GitHub repository `VidiBuzz/VidiSmart`
2. Update local origin remote: `git remote set-url origin https://github.com/VidiBuzz/VidiSmart.git`
3. Push all branches: `git push -u origin main`
4. Connect Railway to new GitHub repo (or verify manual `railway up` works)
5. Test: `git push origin main` succeeds without errors

**Commands:**
```bash
# Create repo via GitHub CLI (if available)
gh repo create VidiBuzz/VidiSmart --public --description "VidiSmart AI Platform"

# Or via API
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"name":"VidiSmart","owner":"VidiBuzz","public":true}'

# Update remote and push
git remote set-url origin https://github.com/VidiBuzz/VidiSmart.git
git push -u origin main
```

**Acceptance Criteria:**
- [ ] GitHub repo exists at https://github.com/VidiBuzz/VidiSmart
- [ ] `git remote -v` shows correct origin URL
- [ ] All code pushed successfully
- [ ] Railway can pull from repo (if connected)

---

## Phase 2: Content & AI Implementation (Week 3-4)

### 2.1 HTML → Directus Migration (HIGH) → CODER AGENT

**Task ID:** MIG-001  
**Priority:** HIGH  
**Owner:** Coder Agent  
**Dependencies:** DIR-001, VESPA-001  
**Estimated Time:** 8 hours

**Subtasks:**
1. **MIG-001.1:** Run migration dry-run
   - Execute `npm run migrate:dry-run`
   - Review proposed transformations
   - Fix any schema mismatches

2. **MIG-001.2:** Execute full migration
   - Run `npm run migrate` to migrate 100+ HTML pages
   - Map HTML pages to Directus `site_pages` collection
   - Migrate media assets to R2 storage
   - Generate embeddings for all migrated content
   - Index in Vespa

3. **MIG-001.3:** Set up CMS workflow
   - Create content editor roles in Directus
   - Set up approval workflow for content publishing
   - Configure webhook triggers for content updates
   - Document CMS usage for content team

**Verification Commands:**
```bash
# Count migrated pages
curl http://localhost:8055/items/site_pages?limit=1&depth=0 \
  | jq '.meta.total_count'

# Verify embeddings indexed
curl -X POST http://localhost:8080/search \
  -d '{"yql":"select * from sources * where userInput()", "hits":5}'

# Check R2 bucket
aws s3 ls s3://vidismart-media/ --endpoint-url https://<account-id>.r2.cloudflarestorage.com
```

**Acceptance Criteria:**
- [ ] All 100+ HTML pages migrated to Directus
- [ ] Media assets uploaded to R2
- [ ] Vespa contains vectors for all content
- [ ] Content editors can log into Directus
- [ ] Workflow triggers on content create/update

---

### 2.2 AI Agent Training (MEDIUM) → RESEARCH AGENT

**Task ID:** AI-001  
**Priority:** MEDIUM  
**Owner:** Research Agent  
**Dependencies:** MIG-001  
**Estimated Time:** 6 hours

**Subtasks:**
1. **AI-001.1:** Create system prompts for each agent role
   - Write prompts for Coordinator, Coder, Research, Vision agents
   - Define response format (JSON with success/errors/changes)
   - Create prompt library documentation
   - Test with sample tasks

2. **AI-001.2:** Ingest plans into vector database
   - Read all planning documents from `smartgen/`
   - Generate embeddings using Qwen3 via Ollama
   - Index plans in Vespa for RAG retrieval
   - Create embeddings for Neo4j knowledge graph

3. **AI-001.3:** Create knowledge graph (Neo4j)
   - Extract entities and relationships from plans
   - Build Neo4j graph of VidiSmart architecture
   - Link related components (agents → tasks → phases)
   - Enable GraphRAG queries

**Verification Commands:**
```bash
# Test agent response
node agents/run-research.js --task "Summarize VidiSmart launch phases"

# Check Neo4j graph
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
  -H "Content-Type: application/json" \
  -d '{"statements":[{"statement":"MATCH (n) RETURN count(n)"}]}'

# Vector search test
curl -X POST http://localhost:8080/search \
  -d '{"yql":"select * from content where userInput(\"vector database\")", "hits":3}'
```

**Acceptance Criteria:**
- [ ] Agent responds to test task with structured output
- [ ] All 8 planning docs indexed in Vespa
- [ ] Neo4j contains >100 nodes with relationships
- [ ] GraphRAG query returns relevant context
- [ ] Prompt library documented

---

## Phase 3: SmartChannel CX Implementation (Week 5-6)

### 3.1 Core Video Editor (HIGH) → CODER AGENT

**Task ID:** SCX-001  
**Priority:** HIGH  
**Owner:** Coder Agent  
**Dependencies:** MIG-001  
**Estimated Time:** 12 hours

**Subtasks:**
1. **SCX-001.1:** Initialize Next.js 14 project with Remotion
   - Create `app/smartchannel/` directory structure
   - Install dependencies: `remotion`, `@remotion/cli`, `ffmpeg.wasm`
   - Set up Remotion player and timeline components
   - Create basic video editor UI

2. **SCX-001.2:** Implement media pool + R2 integration
   - Create Cloudflare R2 SDK integration
   - Implement TUS resumable upload protocol
   - Build media browser component
   - Generate thumbnail sprites for timeline

3. **SCX-001.3:** Add editing operations
   - Trim, cut, split, merge operations
   - Transitions library (fade, wipe, dissolve)
   - Text overlays with font controls
   - Audio track mixing

**Verification Commands:**
```bash
# Start dev server
cd frontend && npm run dev

# Test video upload (via browser)
open http://localhost:3000/smartchannel

# Test Remotion render
npx remotion render src/index.tsx out/video.mp4
```

**Acceptance Criteria:**
- [ ] Next.js app runs on port 3002
- [ ] Timeline displays video clips correctly
- [ ] Trim/cut operations work on video
- [ ] Video uploads to R2 successfully
- [ ] Player renders edited video

---

### 3.2 AI Effects Pipeline (MEDIUM) → VISION AGENT

**Task ID:** SCX-002  
**Priority:** MEDIUM  
**Owner:** Vision Agent  
**Dependencies:** SCX-001  
**Estimated Time:** 8 hours

**Subtasks:**
1. **SCX-002.1:** Deploy ComfyUI server
   - Deploy ComfyUI on GPU instance (RunPod or local GPU)
   - Install Stable Diffusion XL + ControlNet models
   - Create video effect workflows (style transfer, background replacement)
   - Test ComfyUI API

2. **SCX-002.2:** Integrate Gemini API
   - Set up Google Gemini API key
   - Create graphics generation endpoint
   - Build thumbnail generator with A/B testing
   - Implement auto-captioning

3. **SCX-002.3:** AI video intelligence
   - Implement content analysis pipeline
   - Create smart tag extraction
   - Set up auto-chaptering
   - Build content moderation filter

**Verification Commands:**
```bash
# Test ComfyUI
curl -X POST http://localhost:8188/prompt \
  -d '{"prompt": "test", "steps": 10}'

# Test Gemini
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Test video analysis
node agents/run-vision.js --task "Analyze sample video for scene detection"
```

**Acceptance Criteria:**
- [ ] ComfyUI generates images from text prompts
- [ ] Gemini API returns coherent responses
- [ ] Video analysis extracts N scenes correctly
- [ ] Thumbnail generator creates 5 variations
- [ ] Auto-captioning accuracy >80%

---

## Phase 4: New Features Implementation (Week 7-8)

### 4.1 VidiMail Module (HIGH) → CODER AGENT

**Task ID:** VM-001  
**Priority:** HIGH  
**Owner:** Coder Agent  
**Dependencies:** SCX-001  
**Estimated Time:** 10 hours

**Implementation:**
1. Create Next.js routes under `app/smartchannel/vidimail/`:
   - `/campaigns` — Campaign list (grid of cards)
   - `/campaigns/[id]` — Campaign detail with stats
   - `/templates` — Template gallery
   - `/contacts` — Contact management table
   - `/create` — 4-step wizard (record, personalize, recipients, review)

2. Build components:
   - `VideoRecorder` (MediaRecorder API)
   - `PersonalizationPanel` (variable substitution UI)
   - `ContactImporter` (CSV/XLSX upload)
   - `CampaignAnalytics` (open rate, play rate charts)

3. API endpoints in `api/vidimail/`:
   - CRUD for campaigns, templates, contacts
   - Video processing (personalization via FFmpeg)
   - Analytics aggregation
   - Email delivery via Resend

**Acceptance Criteria:**
- [ ] Campaign creation wizard completes end-to-end
- [ ] Video recorder captures 30-second clip
- [ ] Contacts import from CSV (1000+ rows)
- [ ] Campaign sends 100 emails successfully
- [ ] Analytics show open/play rates

---

### 4.2 VidiTwin Module (MEDIUM) → CODER AGENT

**Task ID:** VT-001  
**Priority:** MEDIUM  
**Owner:** Coder Agent  
**Dependencies:** SCX-002  
**Estimated Time:** 8 hours

**Implementation:**
1. Create routes `app/smartchannel/viditwin/`:
   - `/avatars` — Avatar gallery
   - `/avatars/[id]` — Avatar editor with preview
   - `/create` — 3-step wizard (upload, consent, training)
   - `/videos` — Generated videos list

2. Build components:
   - `AvatarCard` (status: training/ready/error)
   - `AvatarPreview` (real-time generation)
   - `TrainingProgress` (stage, ETA, retry)
   - `VoiceSelector` (pre-built or clone)

3. API endpoints `api/viditwin/`:
   - Avatar CRUD
   - Training queue management
   - Video generation (HeyGen/ sadtalker-style)
   - Voice cloning integration

**Acceptance Criteria:**
- [ ] Avatar creation wizard uploads 3 videos (1 min each)
- [ ] Training completes in <5 minutes
- [ ] Generated video syncs lip movements to script
- [ ] Voice cloning produces natural-sounding speech

---

### 4.3 Media Explorer (HIGH) → CODER AGENT

**Task ID:** ML-001  
**Priority:** HIGH  
**Owner:** Coder Agent  
**Dependencies:** SCX-001  
**Estimated Time:** 10 hours

**Implementation:**
1. Create `app/smartchannel/media-library/` with 3-panel layout:
   - Left: Folder tree + navigation (Recent, Favorites, Shared, Trash)
   - Center: File grid/list with search, sort, filter
   - Right: Preview pane + metadata + actions

2. Build components:
   - `FolderTree` (recursive, drag-drop)
   - `FileGrid` / `FileList` (virtual scroll for 1000+ files)
   - `UploadModal` (drag-drop, progress bars)
   - `MetadataPanel` (EXIF, custom fields, tags)

3. API endpoints `api/media/`:
   - File upload (multipart to R2)
   - File operations (move, copy, rename, delete)
   - Search with filters
   - Sharing with JWT tokens

**Verification Commands:**
```bash
# Test file upload (via browser)
# Drag 100 images into upload zone
# Verify all upload within 30 seconds

# Test search
curl "http://localhost:3000/api/media/search?q=sunset&limit=20"
```

**Acceptance Criteria:**
- [ ] 3-panel layout renders correctly
- [ ] Upload 100 files simultaneously (progress bars accurate)
- [ ] Folder tree supports nested 5+ levels
- [ ] Search returns results in <500ms
- [ ] Preview renders images/videos inline

---

## Phase 5: Launch & Deployment (Week 9-10)

### 5.1 Production Deployment (CRITICAL) → OPS AGENT

**Task ID:** DEPLOY-001  
**Priority:** CRITICAL  
**Owner:** Ops Agent  
**Dependencies:** All above  
**Estimated Time:** 6 hours

**Subtasks:**
1. **DEPLOY-001.1:** Fix git remote (carry forward from GIT-001)
   - Verify origin points to VidiBuzz/VidiSmart
   - Push all branches
   - Connect Railway auto-deploy

2. **DEPLOY-001.2:** Set up GitHub Actions CI/CD
   - Create `.github/workflows/deploy.yml`
   - Add secrets: RAILWAY_TOKEN, SG_HOST, SG_PORT, SG_USER, SG_SSH_KEY
   - Test trigger on push to main

3. **DEPLOY-001.3:** Deploy frontend to SiteGround
   - Push `*.html`, `images/`, `assets/` via `git push siteground main`
   - Verify vidismart.com serves pages
   - Test CORS from SiteGround to Railway API

4. **DEPLOY-001.4:** Configure monitoring
   - Set up Sentry error tracking
   - Configure uptime monitoring (UptimeRobot)
   - Create Grafana dashboards (optional)
   - Set up alert notifications

**Verification Commands:**
```bash
# Check Railway deployment
railway status
railway logs --service VidiSmart-SmartStack

# Check SiteGround
ssh u2627-m33aqlpqghg3@gtxm1044.siteground.biz
ls -la /home/customer/www/vidismart.com/public_html/

# Test live URLs
curl https://vidismart.com -I
curl https://vidismart-smartstack-production.up.railway.app/health -I
```

**Acceptance Criteria:**
- [ ] Railway auto-deploys on git push
- [ ] SiteGround reflects latest changes
- [ ] Health checks pass on both platforms
- [ ] Error tracking captures exceptions
- [ ] Uptime monitors report "up"

---

### 5.2 Launch Marketing (HIGH) → RESEARCH AGENT

**Task ID:** MARKET-001  
**Priority:** HIGH  
**Owner:** Research Agent  
**Dependencies:** DEPLOY-001  
**Estimated Time:** 4 hours

**Subtasks:**
1. **MARKET-001.1:** Create launch landing page
   - Design hero section with value prop
   - Add waitlist signup form (connects to Directus)
   - Create feature highlights (SmartChannel CX, VidiMail, VidiTwin)
   - Add social proof/testimonials

2. **MARKET-001.2:** SEO optimization
   - Add meta tags (title, description, OpenGraph)
   - Generate sitemap.xml
   - Add structured data (JSON-LD)
   - Submit to Google Search Console

3. **MARKET-001.3:** Email sequences
   - Create welcome email template
   - Set up waitlist nurture sequence (3 emails)
   - Configure Resend automation

**Verification Commands:**
```bash
# Test SEO
npx lighthouse https://vidismart.com --output=json | jq '.categories.performance.score'
npx sitemap-checker https://vidismart.com/sitemap.xml

# Test form submission
curl -X POST https://vidismart-smartstack-production.up.railway.app/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Acceptance Criteria:**
- [ ] Lighthouse score >90 (performance, SEO, accessibility)
- [ ] Sitemap validates and reachable
- [ ] Waitlist form creates record in Directus
- [ ] Welcome email delivered within 1 minute
- [ ] Structured data validates in Rich Results Test

---

## Agent Implementation Details

### 1. Coordinator Agent (Orchestrator)

**File:** `agents/coordinator-agent.js`  
**Model:** Qwen3-Max (or Claude)  
**Responsibilities:**
- Parse planning documents and extract task list
- Decompose high-level tasks into subtasks
- Assign tasks to appropriate agents (coder/research/vision/ops)
- Track overall progress
- Verify completion against acceptance criteria
- Generate status reports

**Core Algorithm:**
1. Load all planning docs from `smartgen/`
2. Parse markdown for task items (`- [ ]` checkboxes)
3. Build dependency graph
4. Schedule tasks respecting dependencies
5. Dispatch tasks to agent workers via message queue
6. Collect results and retry failures
7. Generate final launch readiness report

**API:**
```javascript
class CoordinatorAgent {
  async run() {
    const plan = await this.loadPlan();
    const tasks = this.parseTasks(plan);
    const queue = this.buildQueue(tasks);

    while (queue.hasPending()) {
      const task = queue.next();
      const agent = this.selectAgent(task.owner);
      const result = await agent.execute(task);

      if (result.success) {
        queue.markComplete(task.id);
        this.logProgress(task.id);
      } else {
        queue.retry(task.id);
      }
    }

    return this.generateReport();
  }
}
```

---

### 2. Coder Agent (Implementation)

**File:** `agents/coder-agent.js`  
**Model:** GLM-5 (or Claude Code)  
**Tools:** Postgres MCP, Filesystem MCP, Directus MCP, GitHub MCP  
**Capabilities:**
- Write TypeScript/JavaScript code
- Configure Docker/YAML/JSON files
- Execute bash commands
- Read/write files
- Make git commits
- Query databases

**Task Execution:**
```javascript
class CoderAgent {
  async execute(task) {
    // 1. Research context (load related docs)
    const context = await this.gatherContext(task);

    // 2. Plan implementation approach
    const plan = await this.generatePlan(task, context);

    // 3. Execute code changes
    for (const step of plan.steps) {
      await this.executeStep(step);
    }

    // 4. Verify with tests
    const testsPass = await this.runTests(task.verification);

    // 5. Commit changes
    await this.commitChanges(task.id);

    return { success: testsPass, changes: this.changes };
  }
}
```

---

### 3. Research Agent (Analysis)

**File:** `agents/research-agent.js`  
**Model:** DeepSeek R1  
**Tools:** Brave Search MCP, GitHub MCP, WebFetch MCP  
**Capabilities:**
- Web research
- Documentation analysis
- Content strategy
- Competitive analysis

**Use Cases:**
- Analyze competitor AI features
- Research latest AI video generation trends
- Extract requirements from planning docs
- Generate content for landing pages

---

### 4. Vision Agent (UX/UI)

**File:** `agents/vision-agent.js`  
**Model:** Qwen3-VL  
**Tools:** Browser MCP, Playwright MCP, Kapture MCP  
**Capabilities:**
- Visual design review
- Screenshot analysis
- Accessibility audit
- Graphics quality control
- Mockup generation

**Use Cases:**
- Review homepage design against BrandSwap spec
- Test mobile responsiveness
- Check color contrast ratios
- Generate thumbnail variations

---

### 5. Ops Agent (Infrastructure)

**File:** `agents/ops-agent.js`  
**Model:** GPT-4  
**Tools:** Shell execution, SSH, Docker, Railway CLI  
**Capabilities:**
- Infrastructure provisioning
- Deployment orchestration
- Health monitoring
- Log analysis
- Backup/restore

**Use Cases:**
- Deploy to Railway/SiteGround
- Manage Docker containers
- Set up SSL certificates
- Configure monitoring

---

## Task Queue & Orchestration

### Central Task Database

**File:** `agents/tasks.json` (SQLite or JSON)

```json
{
  "tasks": [
    {
      "id": "DIR-001.1",
      "title": "Configure Resend SMTP",
      "description": "Set up Resend API for transactional email in Directus",
      "owner": "coder",
      "phase": "Phase 1",
      "status": "pending",
      "priority": "CRITICAL",
      "dependencies": [],
      "timeEstimate": 3600000,
      "createdAt": "2026-04-23T00:00:00Z",
      "startedAt": null,
      "completedAt": null,
      "verification": {
        "commands": [
          "curl -X POST http://localhost:8055/flows/trigger/webhook-id -d '{\"email\":\"test@vidismart.com\"}'"
        ],
        "expected": ["HTTP 200", "email sent"]
      }
    }
  ],
  "progress": {
    "total": 100,
    "completed": 0,
    "inProgress": 0,
    "blocked": 0
  }
}
```

### Task Status Tracking

Agents update task status via MCP postgres server:
```sql
UPDATE tasks 
SET status = 'completed', 
    completed_at = NOW(),
    result = '{"success": true, "changes": [...]}'
WHERE id = 'DIR-001.1';
```

---

## MCP Tool Integration

### Existing MCP Servers (from mcp-config.json)

1. **Filesystem MCP** - Read/write files, list directories
2. **Playwright MCP** - Browser automation, screenshot capture
3. **Postgres MCP** - Query Directus database
4. **GitHub MCP** - Create repos, PRs, issues
5. **Brave Search MCP** - Web research
6. **WebFetch MCP** - Fetch documentation

### Additional MCP Servers Needed

1. **Docker MCP** - Manage containers
2. **Railway MCP** - Deploy to Railway
3. **SSH MCP** - Connect to SiteGround
4. **Directus MCP** - Directus API operations (if not sufficient via Postgres)

---

## Agent Workflow Example

### Complete Task: "Configure Resend SMTP"

**Coordinator** parses plan → assigns to **Coder**:
```json
{
  "task": "DIR-001.1 Configure Resend SMTP",
  "context": {
    "documents": ["DIRECTUS-COMPLETE-STATUS.md"],
    "currentEnv": {"DIRECTUS_URL": "http://localhost:8055"},
    "requiredSecrets": ["RESEND_API_KEY"]
  }
}
```

**Coder Agent** executes:
1. Reads `directus/docker-compose.yml`
2. Adds environment variable: `RESEND_API_KEY=${RESEND_API_KEY}`
3. Updates Directus flow to use Resend
4. Sends test email via API call
5. Logs success/failure

**Verification:**
- **Ops Agent** runs health check script
- **Vision Agent** screenshots Directus flow editor
- **Coordinator** marks task complete, moves to next

---

## Progress Tracking & Reporting

### Real-Time Dashboard

**File:** `agents/dashboard.html` (auto-generated)

Shows:
- Task completion % per phase
- Agent activity log (last 10 actions)
- Error rate and retry count
- Estimated time to completion
- Blockers and dependencies

### Status Reports

**Generated:** Every hour by Coordinator  
**Format:** Markdown with table of tasks

```markdown
# VidiSmart Launch Progress - 2026-04-23 14:00 UTC

## Overall: 23% (23/100 tasks complete)

### Phase 1: Foundation - 67% complete
- ✅ DIR-001: Directus SMTP configured
- ✅ VESPA-001: Vector search operational
- ⏳ GIT-001: Git remote fix in progress
- ⏳ DIR-002: Collections audit pending

### Active Agents
- Coder: Working on GIT-001 (git remote update)
- Ops: Monitoring health checks
- Research: Idle (awaiting MIG-001)
- Vision: Idle

### Blockers
- None

### Next 24h Forecast
- 100% Phase 1 completion
- Phase 2 (Content Migration) begins
```

---

## Error Handling & Retries

### Failure Scenarios

1. **Agent Crash:** Auto-restart with exponential backoff (max 3 retries)
2. **Task Timeout:** Escalate to Coordinator, mark as blocked
3. **Dependency Wait:** Agent sleeps 5min, rechecks
4. **Verification Fail:** Task marked failed → manual review required

### Retry Policy

```javascript
const RETRY_POLICY = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelay: 5000, // 5 seconds
  maxDelay: 300000,  // 5 minutes
};
```

---

## Required Setup

### 1. Install Dependencies

```bash
cd agents
npm install
```

### 2. Configure Environment

Create `.env`:
```bash
# API Keys
RESEND_API_KEY=re_xxx
GEMINI_API_KEY=xxx
BRAVE_API_KEY=tvly-dev-xxx
GITHUB_TOKEN=ghp_xxx

# Service URLs
DIRECTUS_URL=http://localhost:8055
OLLAMA_HOST=http://localhost:11434
VESPA_ENDPOINT=http://localhost:8080
NEO4J_URL=bolt://localhost:7687

# Deployment
RAILWAY_TOKEN=_2r2_NK5...
SG_HOST=gtxm1044.siteground.biz
SG_PORT=18765
SG_USER=u2627-m33aqlpqghg3
SG_SSH_KEY=~/.ssh/id_rsa
```

### 3. Start Agent Workers

In 4 terminals (or as background processes):

```bash
# Terminal 1: Coordinator
node agents/coordinator-agent.js

# Terminal 2: Coder
node agents/coder-agent.js --role=coder

# Terminal 3: Research
node agents/research-agent.js --role=research

# Terminal 4: Vision
node agents/vision-agent.js --role=vision

# Terminal 5: Ops (optional)
node agents/ops-agent.js --role=ops
```

Or run all with PM2:
```bash
pm2 start agents/coordinator-agent.js --name coordinator
pm2 start agents/coder-agent.js --name coder
pm2 start agents/research-agent.js --name research
pm2 start agents/vision-agent.js --name vision
pm2 save
```

---

## Expected Timeline (Auto-Execution)

| Day | Agent Activities | Expected Output |
|-----|-----------------|----------------|
| Day 1 | Coder: DIR-001.1-1.4 (Directus config)<br>Ops: GIT-001 (git remote fix) | Directus fully configured + GitHub repo created |
| Day 2 | Coder: VESPA-001.1-1.3 (Vespa setup) | Vespa operational with hybrid search |
| Day 3 | Coder: MIG-001.1-1.3 (content migration)<br>Research: AI-001.1 (prompts) | All content in Directus, embeddings indexed |
| Day 4 | Research: AI-001.2-1.3 (knowledge graph)<br>Vision: SCX-002.1 (ComfyUI deploy) | Neo4j populated, ComfyUI running |
| Day 5-6 | Coder: SCX-001.1-1.3 (video editor)<br>Vision: SCX-002.2-2.3 (AI effects) | SmartChannel CX functional with AI effects |
| Day 7-8 | Coder: VM-001 (VidiMail)<br>Coder: VT-001 (VidiTwin) | VidiMail & VidiTwin modules complete |
| Day 9 | Coder: ML-001 (Media Explorer) | Media Library with 3-panel layout |
| Day 10 | Ops: DEPLOY-001.1-001.4 (deployment)<br>Research: MARKET-001 (launch marketing) | Live on Railway + SiteGround, marketing ready |

**Total:** ~80 hours of automated agent work  
**Wall-clock with parallelism:** ~10 days (2 weeks)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tasks Completed | 100/100 | Task tracker |
| Directus Health | 200 OK | Health endpoint |
| Vespa Indexing | 100% content | Vespa document count |
| Migration Success | 100% pages | Directus item count |
| SmartChannel CX | All features | E2E Playwright tests |
| Deployment Success | Both targets | URL accessibility checks |
| Launch Readiness | Green across all categories | Coordinator final report |

---

## Fallback & Manual Intervention

### When Agents Fail

1. **Task fails 3 times:** Escalate to manual review
2. **Dependency blocked:** Coordinator reassigns or waits
3. **Critical blocker:** Pause all agents, alert human
4. **Ambiguous requirement:** Research agent clarifies with user

### Manual Override

```bash
# Pause all agents
pkill -f "agent.js"

# Edit task to skip/fail
nano agents/tasks.json

# Resume from specific task
node agents/coordinator-agent.js --resume-from=MIG-001
```

---

## Monitoring & Observability

### Agent Logs

All agents log to `agents/logs/`:
```
agents/logs/
├── coordinator-2026-04-23.log
├── coder-2026-04-23.log
├── research-2026-04-23.log
└── vision-2026-04-23.log
```

### Metrics Collection

- Tasks started/completed/failed per hour
- Agent CPU/memory usage
- MCP tool call latency
- Database query performance

### Alerting

Slack/Discord webhook on:
- Task failure >3 times
- Agent crash
- Health check failure
- Deployment rollback

---

## Deliverables Summary

By end of 2-week automated execution:

### Infrastructure
- ✅ GitHub repo `VidiBuzz/VidiSmart` initialized
- ✅ Railway auto-deploy configured
- ✅ SiteGround syncing via git
- ✅ Docker services: Directus, Postgres, Redis, Vespa, Neo4j all running
- ✅ Environment variables configured (Resend, R2, etc.)

### Database & CMS
- ✅ 40+ Directus collections with indexes
- ✅ 100+ HTML pages migrated to CMS
- ✅ Email flows operational
- ✅ Custom branding applied

### AI/ML Stack
- ✅ Vespa vector DB with hybrid search
- ✅ Neo4j knowledge graph populated
- ✅ Embedding pipeline operational
- ✅ GraphRAG queries functional

### Frontend Applications
- ✅ SmartChannel CX video editor (Remotion)
- ✅ VidiMail campaign manager
- ✅ VidiTwin avatar creator
- ✅ Media Explorer file manager

### Deployment
- ✅ Both Railway (API) and SiteGround (static) serving content
- ✅ Health checks passing
- ✅ Monitoring and alerts configured
- ✅ Launch landing page live

---

## Decision Points & User Input Required

Before agent execution begins, please confirm:

### 1. Agent Models
- **Coordinator:** Qwen3-Max (default) / Alternative: Claude Opus?
- **Coder:** GLM-5 (default) / Alternative: Claude Code?
- **Research:** DeepSeek R1 (default) / Alternative: Claude Sonnet?
- **Vision:** Qwen3-VL (default) / Alternative: GPT-4 Vision?

### 2. Execution Mode
- **Option A:** Run all agents concurrently (faster, more resource-intensive)
- **Option B:** Coordinator as single orchestrator (simpler, sequential)
- **Option C:** Manual per-task approval (slowest, full control)

### 3. Deployment Strategy
- **Option A:** Manual dual push (as documented) - simplest
- **Option B:** GitHub Actions automated - requires secret setup

### 4. Infrastructure Assumptions
- All Docker services (Directus, Postgres, Redis, Vespa, Neo4j) already running locally?
- Railway account created and logged in (`railway login`)?
- SiteGround SSH key in `~/.ssh/`?
- Resend API key available?

### 5. Rollback Policy
- **Auto-rollback on failure:** Yes / No
- **Keep backups:** Yes / No
- **Max retries per task:** 1 / 3 / 5

---

## Implementation Checklist

### Pre-Flight (Before Running Agents)

- [ ] Review and approve this plan
- [ ] Answer decision questions above
- [ ] Ensure all services are running locally
- [ ] Verify environment variables set
- [ ] Backup current code (git commit all changes)
- [ ] Create GitHub repo `VidiBuzz/VidiSmart`
- [ ] Test manual deployment to Railway/SiteGround once

### Agent Deployment

- [ ] Install agent dependencies: `cd agents && npm install`
- [ ] Create agent worker scripts:
  - `coordinator-agent.js`
  - `coder-agent.js`
  - `research-agent.js`
  - `vision-agent.js`
  - `ops-agent.js`
- [ ] Create task database (`agents/tasks.db` or `tasks.json`)
- [ ] Set up logging directory (`agents/logs/`)
- [ ] Create dashboard (`agents/dashboard.html`)
- [ ] Test each agent with simple task

### Execution

- [ ] Start coordinator agent
- [ ] Monitor dashboard for first 30 minutes
- [ ] Verify tasks dequeuing properly
- [ ] Check agent logs for errors
- [ ] Let agents run unattended (estimate 10 days)
- [ ] Check daily progress reports

### Post-Execution

- [ ] Review final launch readiness report
- [ ] Test all endpoints manually
- [ ] Run full E2E test suite
- [ ] Verify monitoring/alerting active
- [ ] Document any manual fixes applied
- [ ] Create "lessons learned" document

---

## Architecture Decisions Record (ADR)

### ADR-001: Use Vespa as Sole Vector Database
**Date:** 2026-04-23  
**Decision:** Vespa (port 8089) is the primary vector DB. Qdrant deprecated.  
**Rationale:** Vespa already running, has native geo + hybrid search, no need to maintain two systems.

### ADR-002: Multi-Agent Orchestration via Custom JS
**Date:** 2026-04-23  
**Decision:** Build custom Node.js agent system, not CrewAI/LangGraph.  
**Rationale:** Simpler, no Python dependency, fits existing MCP ecosystem, easier debugging.

### ADR-003: Task Persistence in JSON/SQLite
**Date:** 2026-04-23  
**Decision:** Store tasks in JSON file + SQLite for ACID.  
**Rationale:** Simple, no external DB needed, human-readable, easy recovery.

### ADR-004: Sequential Dependency Execution
**Date:** 2026-04-23  
**Decision:** Tasks execute respecting dependencies, no parallel on dependent tasks.  
**Rationale:** Safer, avoids race conditions, easier to debug failures.

---

## Summary

This plan delivers a **complete autonomous agent system** that will:

1. ✅ Execute all 100+ tasks across 5 phases
2. ✅ Deploy to Railway + SiteGround automatically
3. ✅ Configure Directus, Vespa, Neo4j
4. ✅ Migrate all content and generate embeddings
5. ✅ Build SmartChannel CX, VidiMail, VidiTwin, Media Explorer
6. ✅ Set up monitoring and launch marketing
7. ✅ Generate readiness report and handoff to human

**Total Agent Work:** ~80 hours  
**Wall-clock Time:** 10 days (with parallelization)  
**Manual Intervention Required:** Only for approval decisions and unblocking stuck tasks

**Ready to implement immediately upon approval.**

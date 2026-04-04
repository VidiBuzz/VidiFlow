# Repository Separation Plan: VidiFlow, Vidi.NEWS, and VidiSmart

## Current State Analysis

### The Problem
All three projects (VidiFlow, Vidi.NEWS, and VidiSmart) are currently mixed together in a single monorepo at `m:/code/vidismart`. This creates:
- **Deployment confusion**: `vercel.json` points to `vidiflow/frontend/` but the root `.gitignore` excludes `vidiflow/`
- **No git history**: None of the sub-projects have their own git repositories
- **Shared credentials**: Environment variables and configurations are intermingled
- **Unclear ownership**: No separation of concerns between projects

### Current Architecture

| Project | Location | Frontend | Backend | Database | Deployment |
|---------|----------|----------|-------|----------|------------|
| **VidiFlow** | `vidismart/vidiflow/` | Next.js (frontend/) | Node.js (backend/) | Supabase | Vercel (vidiflow-eta.vercel.app) |
| **Vidi.NEWS** | `m:/code/vidi.news/` | Next.js 15 | API routes | Supabase | Vercel (vidi.news) |
| **VidiSmart** | `vidismart/` (root) | Static HTML | Directus (converge/) | PostgreSQL + Redis + Neo4j + Vespa | SiteGround (vidismart.com) + Railway |

### Current Vercel Projects
1. **vidiflow** → `https://vidiflow-eta.vercel.app` (deployed from `vidiflow/frontend/`)
2. **vidi.news** → `https://vidi.news` (deployed from `m:/code/vidi.news/`)

### Current Railway Projects
- Directus CMS (converge/) running locally, needs Railway deployment for VidiSmart

---

## Target Architecture

### Three Separate GitHub Repositories

```
github.com/vidismart/
├── vidiflow/           # VidiFlow - AI Knowledge Base & Workflow Platform
├── vidi-news/          # Vidi.NEWS - News & Content Platform  
└── vidismart/          # VidiSmart - Community Site & Smart Stack
```

### Deployment Targets

| Repo | GitHub | Vercel | Railway | Other |
|------|--------|--------|---------|-------|
| **vidiflow** | github.com/vidismart/vidiflow | VidiFlow Frontend | - | Supabase |
| **vidi-news** | github.com/vidismart/vidi-news | Vidi.NEWS Frontend | - | Supabase |
| **vidismart** | github.com/vidismart/vidismart | - | Smart Stack (Directus + API) | SiteGround (static HTML) |

---

## Step-by-Step Separation Plan

### Phase 1: Create VidiFlow Repository

**Agent: Code Agent**

#### 1.1 Extract VidiFlow Files
Source: `m:/code/vidismart/vidiflow/`
```
vidiflow/
├── frontend/           # Next.js app (Vercel deployment target)
├── backend/            # Node.js API
├── supabase/           # Database migrations
├── components/
├── hooks/
├── lib/
├── scripts/
├── sites/
├── types/
├── workflows/
├── .env.example
├── .gitignore
├── README.md
├── TECH_STACK.md
├── VIDIFLOW_PLAN.md
└── vercel.json         # Vercel config for this repo only
```

#### 1.2 Create New Repository
```bash
# Create the new repo
cd m:/code/vidismart/vidiflow
git init
git remote add origin git@github.com:vidismart/vidiflow.git

# Create proper .gitignore for Next.js project
# (remove the root vidismart .gitignore references)

# Commit and push
git add -A
git commit -m "Initial commit: VidiFlow - AI Knowledge Base & Workflow Platform"
git branch -M main
git push -u origin main
```

#### 1.3 Configure Vercel for New Repo
1. Go to Vercel Dashboard → Import Git Repository
2. Select `github.com/vidismart/vidiflow`
3. Set root directory to `frontend`
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://vidi.news`
5. Deploy to production

#### 1.4 Update Vercel CLI (if using CLI)
```bash
cd m:/code/vidismart/vidiflow
vercel link --project=vidiflow --yes
vercel --prod
```

---

### Phase 2: Create Vidi.NEWS Repository

**Agent: Code Agent**

#### 2.1 Extract Vidi.NEWS Files
Source: `m:/code/vidi.news/`
```
vidi-news/
├── app/                # Next.js 15 App Router
├── components/
├── fonts/
├── hooks/
├── lib/
├── public/
├── supabase/
├── .env.local
├── .env.r2.example
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

#### 2.2 Create New Repository
```bash
cd m:/code/vidi.news
git init
git remote add origin git@github.com:vidismart/vidi-news.git

git add -A
git commit -m "Initial commit: Vidi.NEWS - News & Content Platform"
git branch -M main
git push -u origin main
```

#### 2.3 Configure Vercel for New Repo
1. Go to Vercel Dashboard → Import Git Repository
2. Select `github.com/vidismart/vidi-news`
3. Framework preset: Next.js
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Cloudflare R2 credentials (if used)
5. Add custom domain: `vidi.news`
6. Deploy to production

---

### Phase 3: Create VidiSmart Repository (Smart Stack for Railway)

**Agent: Code Agent**

#### 3.1 Define VidiSmart Repository Contents
Source: `m:/code/vidismart/` (filtered)
```
vidismart/
├── converge/           # Directus CMS + Docker Compose (Railway deployment)
│   ├── docker-compose.yml
│   ├── .env
│   └── ...
├── api/                # Node.js API for Railway
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/           # Static HTML for SiteGround
│   ├── *.html
│   ├── *.css
│   └── *.js
├── assets/             # Shared assets
├── scripts/            # Deployment scripts
├── railway.json        # Railway deployment config
├── .gitignore
└── README.md
```

#### 3.2 Create New Repository
```bash
# Create a new directory for the clean repo
mkdir m:/code/vidismart-clean
cd m:/code/vidismart-clean
git init

# Copy only the necessary files
# (exclude node_modules, .env, converged local data, etc.)

git remote add origin git@github.com:vidismart/vidismart.git
git add -A
git commit -m "Initial commit: VidiSmart - Community Site & Smart Stack"
git branch -M main
git push -u origin main
```

#### 3.3 Configure Railway Smart Stack
1. Go to Railway Dashboard → New Project → Deploy from GitHub
2. Select `github.com/vidismart/vidismart`
3. Configure services:
   - **Directus Service**: From `converge/docker-compose.yml`
   - **PostgreSQL Database**: Add via Railway database
   - **Redis Cache**: Add via Railway database
   - **API Service**: From `api/` directory
4. Set environment variables:
   - `KEY`, `SECRET`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `DB_CLIENT=pg`
   - `DB_HOST` (Railway PostgreSQL internal URL)
   - `DB_PORT=5432`
   - `DB_DATABASE`
   - `DB_USER`, `DB_PASSWORD`
   - `STORAGE_R2_*` (Cloudflare R2 credentials)
   - `PUBLIC_URL=https://admin.vidismart.com`
5. Deploy

#### 3.4 Configure SiteGround for Static HTML
```bash
# Static HTML files deployed to vidismart.com
# Use Git-based deployment to SiteGround
cd m:/code/vidismart-clean
git remote add siteground ssh://user@gtxm1044.siteground.biz:18765/home/customer/www/vidismart.com/public_html
```

---

### Phase 4: Clean Up Original Monorepo

**Agent: Code Agent**

#### 4.1 Update Root .gitignore
After extraction, update the original `vidismart/.gitignore` to properly exclude sub-projects that now have their own repos.

#### 4.2 Remove Old Vercel Config
Delete or update the root `vercel.json` since each project now has its own.

#### 4.3 Archive or Delete
- Option A: Archive the monorepo as historical reference
- Option B: Delete and work only from the new separated repos

---

## Agent Assignment Summary

| Agent | Task | Deliverable |
|-------|------|-------------|
| **Code Agent 1** | Phase 1: VidiFlow Repo | `github.com/vidismart/vidiflow` + Vercel deployment |
| **Code Agent 2** | Phase 2: Vidi.NEWS Repo | `github.com/vidismart/vidi-news` + Vercel deployment |
| **Code Agent 3** | Phase 3: VidiSmart Repo | `github.com/vidismart/vidismart` + Railway Smart Stack |
| **Code Agent 4** | Phase 4: Cleanup | Updated monorepo or archive |

---

## Environment Variables Reference

### VidiFlow (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://bxhoiaagvmngiibanqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://vidi.news
```

### Vidi.NEWS (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://jeasmwbberfgztkxfjwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://vidi.news
```

### VidiSmart Smart Stack (Railway)
```
KEY=vidismart-community-secret-key
SECRET=vidismart-community-secret-secret
ADMIN_EMAIL=admin@vidismart.com
ADMIN_PASSWORD=secure_password
DB_CLIENT=pg
DB_HOST=vidismart-postgres.railway.internal
DB_PORT=5432
DB_DATABASE=vidismart
DB_USER=postgres
DB_PASSWORD=railway_postgres_password
STORAGE_R2_ACCESS_KEY=your_r2_access_key
STORAGE_R2_SECRET=your_r2_secret
STORAGE_R2_BUCKET=vidismart-media
STORAGE_R2_ENDPOINT=https://your_account.r2.cloudflarestorage.com
PUBLIC_URL=https://admin.vidismart.com
```

---

## DNS Configuration

### Vidi.NEWS Domain
- **Domain**: vidi.news
- **Current Nameservers**: Cloudflare (ada.ns.cloudflare.com, jerry.ns.cloudflare.com)
- **Vercel Expected**: ns1.vercel-dns.com, ns2.vercel-dns.com
- **Option**: Use Cloudflare proxy with A record → 76.76.21.21 (Vercel IP)

### VidiSmart Domains
- **vidismart.com** → SiteGround (static HTML)
- **admin.vidismart.com** → Railway (Directus)
- **api.vidismart.com** → Railway (API - future)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lost git history | Medium | Use `git filter-repo` to preserve history if needed |
| Environment variable mismatch | High | Document all vars before migration |
| DNS propagation delay | Medium | Plan DNS changes during low-traffic periods |
| Railway deployment issues | Medium | Test with staging project first |
| Broken cross-project references | Low | Update all URLs and API endpoints |

---

## Success Criteria

- [ ] `github.com/vidismart/vidiflow` exists with clean Next.js project
- [ ] VidiFlow deploys successfully to Vercel from new repo
- [ ] `github.com/vidismart/vidi-news` exists with clean Next.js project
- [ ] Vidi.NEWS deploys successfully to Vercel from new repo (vidi.news domain)
- [ ] `github.com/vidismart/vidismart` exists with Smart Stack configuration
- [ ] VidiSmart Smart Stack deploys to Railway (Directus + PostgreSQL + API)
- [ ] vidismart.com static HTML deploys to SiteGround
- [ ] All environment variables configured in respective platforms
- [ ] No cross-repo dependencies broken

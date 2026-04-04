# VidiFlow Deployment Plan

## Current Architecture

### 1. vidi.news (Vidiflow Frontend)
- **Location**: `/mnt/m/code/vidi.news/`
- **Type**: Next.js 15 + TypeScript + Tailwind
- **Port**: 3002 (dev), 3001 (production)
- **Database**: Supabase (PostgreSQL)
- **Status**: Build failing due to missing config

### 2. vidi-mograph (Remotion Video)
- **Location**: `/mnt/m/code/vidi-mograph/`
- **Type**: Next.js + Remotion
- **Purpose**: AI-powered motion graphics generation
- **Status**: Separate app, already has vercel.json

### 3. vidiflow (Backend & Full Stack)
- **Location**: `/mnt/m/code/vidismart/vidiflow/`
- **Components**: Frontend + Backend API + ComfyUI + Agents
- **Status**: Complex multi-service architecture

## Deployment Strategy

### Option A: Deploy vidi.news Only (Recommended)
**Goal**: Deploy just the news frontend to Vercel

**Steps**:
1. Fix build configuration (tsconfig.json, missing deps)
2. Set up environment variables (Supabase)
3. Deploy to Vercel production
4. Update vidi.news.html with live URL

**Pros**:
- Simplest deployment
- No backend dependencies for basic functionality
- Fastest time to live

**Cons**:
- API routes won't work without backend
- Some features require full vidiflow stack

### Option B: Full Vidiflow Stack
**Goal**: Deploy complete multi-agent platform

**Requirements**:
- Backend API (FastAPI/Python)
- Database (Supabase/PostgreSQL)
- Vector search (Vespa)
- Knowledge graph (Neo4j)
- ComfyUI (GPU server)

**Deployment**:
- Frontend → Vercel
- Backend → Railway/Render/Fly.io
- Database → Supabase managed
- GPU services → RunPod/Vast.ai

### Option C: Static Export
**Goal**: Export as static HTML for vidismart.com

**Steps**:
1. Configure Next.js for static export
2. Build and export to `dist/`
3. Copy to vidismart.com server
4. Serve as static files

**Pros**:
- Works on any static host
- No server runtime needed
- Can host on vidismart.com directly

**Cons**:
- API routes become non-functional
- Dynamic features disabled

## Recommended Approach: Option A (Vercel) + Supabase

### Phase 1: Fix Build Issues
1. Copy tsconfig.json with proper path aliases
2. Verify all imports resolve
3. Install missing dependencies
4. Test build locally

### Phase 2: Database Setup
1. Create Supabase project (free tier)
2. Run schema migrations
3. Add environment variables to Vercel

### Phase 3: Deploy
1. Push to GitHub (optional but recommended)
2. Deploy to Vercel
3. Configure custom domain (vidi.news)

### Phase 4: Integration
1. Update vidi.news.html navigation
2. Test all links
3. Verify functionality

## Current Blockers

### Build Errors to Fix:
- [ ] Missing tsconfig.json
- [ ] Path alias resolution (@/components, @/lib)
- [ ] Missing VideoPlayer component import
- [ ] Environment variables not set

### Next Steps:
1. Choose deployment option
2. Fix build configuration
3. Set up database
4. Deploy

## Files Status

✅ **Ready**:
- Source code (app/, components/, lib/)
- package.json
- next.config.ts
- tailwind.config.ts
- postcss.config.mjs

❌ **Missing/Issues**:
- tsconfig.json (path aliases)
- .env (Supabase credentials)
- Build verification

Would you like me to proceed with Option A (Vercel deployment with Supabase)?

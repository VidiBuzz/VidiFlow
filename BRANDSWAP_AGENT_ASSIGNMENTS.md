# BrandSwap Agent Assignments

**Date:** 2026-03-21  
**Purpose:** Assign all next steps to agents manageable by Mimo  
**Status:** Ready for agent assignment

---

## Agent Task Breakdown

### Agent 1: Security & Environment Setup
**Priority:** Critical  
**Estimated Time:** 30 minutes  
**Dependencies:** None

#### Tasks:
1. **Create Environment File**
   - Location: `brandswap-backend/.env`
   - Action: Create file with R2 credentials
   - Variables needed:
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY`
     - `R2_SECRET_KEY`
     - `R2_BUCKET=vidismart`
     - `CDN_URL=https://cdn.vidi.news`

2. **Update Frontend Environment**
   - Location: `vidiflow/frontend/.env.local`
   - Action: Add BRANDSWAP_API variable
   - Variable: `NEXT_PUBLIC_BRANDSWAP_API=http://localhost:8080`

3. **Update Server Code**
   - Location: `brandswap-backend/server.py`
   - Action: Replace hardcoded credentials with environment variables
   - Lines to modify: 48-51
   - Add: `import os` and `load_dotenv()`

**Deliverables:**
- ✅ `.env` file created with credentials
- ✅ `.env.local` updated
- ✅ Server code updated to use environment variables

---

### Agent 2: Backend Server Management
**Priority:** High  
**Estimated Time:** 15 minutes  
**Dependencies:** Agent 1 (Security & Environment Setup)

#### Tasks:
1. **Install Dependencies**
   - Location: `brandswap-backend/`
   - Action: Verify all dependencies are installed
   - Command: `python -m pip install -r requirements.txt`

2. **Start Backend Server**
   - Location: `brandswap-backend/`
   - Action: Start FastAPI server
   - Command: `python server.py`
   - Expected: Server runs on http://localhost:8080

3. **Verify Server Health**
   - Action: Test health endpoint
   - Command: `curl http://localhost:8080/health`
   - Expected: `{"status": "healthy"}`

4. **Verify API Docs**
   - Action: Check API documentation
   - URL: http://localhost:8080/docs
   - Expected: Swagger UI loads

**Deliverables:**
- ✅ Backend server running on port 8080
- ✅ Health endpoint responding
- ✅ API docs accessible

---

### Agent 3: Cloudflare Tunnel Setup
**Priority:** High  
**Estimated Time:** 10 minutes  
**Dependencies:** Agent 2 (Backend Server Management)

#### Tasks:
1. **Start Cloudflare Tunnel**
   - Location: Any directory
   - Action: Expose local server to internet
   - Command: `cloudflared tunnel --url http://localhost:8080`
   - Expected: Public URL generated (e.g., `https://random-words.trycloudflare.com`)

2. **Copy Public URL**
   - Action: Capture the tunnel URL from output
   - Format: `https://[random-words].trycloudflare.com`

3. **Test Public Access**
   - Action: Verify tunnel is accessible
   - Command: `curl https://[random-words].trycloudflare.com/health`
   - Expected: `{"status": "healthy"}`

**Deliverables:**
- ✅ Cloudflare Tunnel running
- ✅ Public URL captured
- ✅ Public access verified

---

### Agent 4: Vercel Environment Update
**Priority:** High  
**Estimated Time:** 10 minutes  
**Dependencies:** Agent 3 (Cloudflare Tunnel Setup)

#### Tasks:
1. **Access Vercel Dashboard**
   - URL: https://vercel.com/team_aQMTdWqc4B3Wntnac0xKMCLq/frontend/settings/environment-variables

2. **Update Environment Variable**
   - Variable Name: `NEXT_PUBLIC_BRANDSWAP_API`
   - Value: Public tunnel URL from Agent 3
   - Environment: Production

3. **Redeploy Frontend**
   - Action: Trigger new deployment
   - Command: `cd vidiflow/frontend && vercel --prod`
   - Or use Vercel dashboard

4. **Verify Deployment**
   - URL: https://vidi.news/smartchannel/brandswap
   - Expected: Page loads successfully

**Deliverables:**
- ✅ Vercel environment variable updated
- ✅ Frontend redeployed
- ✅ Page accessible at vidi.news

---

### Agent 5: End-to-End Testing
**Priority:** Medium  
**Estimated Time:** 45 minutes  
**Dependencies:** Agent 4 (Vercel Environment Update)

#### Tasks:
1. **Test 1: Image Logo Replacement**
   - Action: Upload logo template and test images
   - Steps:
     1. Open https://vidi.news/smartchannel/brandswap
     2. Upload NotebookLM logo template
     3. Upload 2-3 test images with logo
     4. Set threshold to 0.55
     5. Click "Process"
   - Expected: Files processed, results shown, downloads work

2. **Test 2: Video Logo Replacement**
   - Action: Upload and process video
   - Steps:
     1. Upload logo template
     2. Upload short video (10-30 seconds)
     3. Click "Process"
   - Expected: Longer processing, video uploaded, downloadable

3. **Test 3: No Logo Found**
   - Action: Test skipped files
   - Steps:
     1. Upload logo template
     2. Upload images WITHOUT that logo
     3. Click "Process"
   - Expected: Status shows "skipped", no output files

4. **Test 4: Batch Processing**
   - Action: Test multiple files
   - Steps:
     1. Upload logo template
     2. Upload 10+ files (mix images/videos)
     3. Click "Process"
   - Expected: All processed, results mixed, download all works

5. **Test 5: CDN Upload Verification**
   - Action: Verify files uploaded to R2
   - Steps:
     1. Process files
     2. Check storage folders
     3. Verify CDN URLs accessible
   - Expected: Files in `storage/output/`, accessible via CDN

**Deliverables:**
- ✅ All 5 tests completed successfully
- ✅ Test results documented
- ✅ Issues identified and reported

---

### Agent 6: Monitoring & Optimization
**Priority:** Low  
**Estimated Time:** 30 minutes  
**Dependencies:** Agent 5 (End-to-End Testing)

#### Tasks:
1. **Monitor Server Logs**
   - Action: Check backend server logs
   - Location: Terminal where server is running
   - Look for: Errors, warnings, performance issues

2. **Monitor Frontend Logs**
   - Action: Check Vercel logs
   - URL: https://vercel.com/team_aQMTdWqc4B3Wntnac0xKMCLq/frontend/logs
   - Look for: API errors, performance issues

3. **Test CDN Performance**
   - Action: Verify CDN upload/download speeds
   - Steps:
     1. Process large file
     2. Measure upload time
     3. Measure download time
   - Expected: Reasonable performance

4. **Document Performance**
   - Action: Record metrics
   - Metrics to track:
     - Processing time per file
     - CDN upload time
     - Download speed
     - Error rate

**Deliverables:**
- ✅ Performance metrics documented
- ✅ Issues identified
- ✅ Optimization recommendations

---

## Agent Assignment Matrix

| Agent | Task | Priority | Dependencies | Time |
|-------|------|----------|--------------|------|
| Agent 1 | Security & Environment Setup | Critical | None | 30 min |
| Agent 2 | Backend Server Management | High | Agent 1 | 15 min |
| Agent 3 | Cloudflare Tunnel Setup | High | Agent 2 | 10 min |
| Agent 4 | Vercel Environment Update | High | Agent 3 | 10 min |
| Agent 5 | End-to-End Testing | Medium | Agent 4 | 45 min |
| Agent 6 | Monitoring & Optimization | Low | Agent 5 | 30 min |

**Total Estimated Time:** 2 hours 20 minutes

---

## Execution Order

```
Agent 1 (Security & Environment)
    ↓
Agent 2 (Backend Server)
    ↓
Agent 3 (Cloudflare Tunnel)
    ↓
Agent 4 (Vercel Update)
    ↓
Agent 5 (End-to-End Testing)
    ↓
Agent 6 (Monitoring & Optimization)
```

---

## Success Criteria

### Agent 1 Success:
- ✅ `.env` file created with all credentials
- ✅ `.env.local` updated with API URL
- ✅ Server code uses environment variables

### Agent 2 Success:
- ✅ Backend server running on port 8080
- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ API docs accessible at `/docs`

### Agent 3 Success:
- ✅ Cloudflare Tunnel running
- ✅ Public URL captured
- ✅ Public access verified

### Agent 4 Success:
- ✅ Vercel environment variable updated
- ✅ Frontend redeployed
- ✅ Page accessible at vidi.news

### Agent 5 Success:
- ✅ All 5 tests pass
- ✅ Files processed correctly
- ✅ CDN uploads work
- ✅ Downloads work

### Agent 6 Success:
- ✅ Performance metrics documented
- ✅ Issues identified
- ✅ Optimization recommendations provided

---

## Reporting

Each agent should report:
1. Tasks completed
2. Time taken
3. Issues encountered
4. Resolution applied
5. Success criteria met

---

## Rollback Plan

If any agent fails:
1. **Agent 1 fails**: Fix environment variables manually
2. **Agent 2 fails**: Check Python installation, dependencies
3. **Agent 3 fails**: Check cloudflared installation, network
4. **Agent 4 fails**: Update Vercel manually via dashboard
5. **Agent 5 fails**: Document issues, fix code, retry
6. **Agent 6 fails**: Continue monitoring manually

---

**Status:** Ready for agent assignment  
**Last Updated:** 2026-03-21

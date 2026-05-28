# VidiSmart Implementation Roadmap — Approved Plan

**Decisions Confirmed:**
- ✅ Create new `VidiBuzz/VidiSmart` GitHub repo
- ✅ Manual dual push deployment (Option B)
- ✅ Keep Railway default URL (no custom domain yet)
- ✅ Priority: Connect `frontend/` pages to Directus (vidicrm.com)

---

## Execution Steps (In Order)

### Step 1: Fix Git Remote & Create New Repo
1. Create new GitHub repo: `VidiBuzz/VidiSmart` (via GitHub API or CLI)
2. Update local origin remote:
   ```bash
   git remote set-url origin https://github.com/VidiBuzz/VidiSmart.git
   ```
3. Push all local branches to new origin
4. Verify Railway is connected (or keep manual `railway up`)
5. Test: `git push origin main` succeeds

### Step 2: Verify Railway App is Working
1. Check current deployment status via Railway API
2. Test the Railway URL: `https://vidismart-smartstack-production.up.railway.app`
3. Verify API endpoints respond (health check, static HTML serving)
4. Confirm PostgreSQL-VS and Redis-VS are healthy

### Step 3: Connect Frontend to Directus (Priority Task)
This is the main focus. The `frontend/` directory has Directus-connected pages that need to talk to the local Docker instance at `vidicrm.com` (port 8055).

**Files involved:**
| File | Current State | Action Needed |
|------|--------------|---------------|
| [`frontend/assets/js/directus-service.js`](../frontend/assets/js/directus-service.js) | Exists | Verify/update Directus URL to `vidicrm.com` |
| [`frontend/index.html`](../frontend/index.html) | Static page | Ensure it loads directus-service.js |
| [`frontend/about.html`](../frontend/about.html) | Static page | Connect to Directus collections |
| [`frontend/community.html`](../frontend/community.html) | Static page | Connect to Directus collections |
| [`frontend/directory.html`](../frontend/directory.html) | Static page | Connect to Directus collections |
| [`frontend/resources.html`](../frontend/resources.html) | Static page | Connect to Directus collections |

**Directus CORS Configuration needed:**
- Add `vidismart.com` and `localhost` to allowed origins in Directus settings or docker-compose.yml
- Set `CORS_ORIGIN` environment variable on Directus container

**Directus Collections to expose:**
- `site_pages` — For dynamic page content
- `waitlist_leads` — For waitlist form data
- Any other collections defined in the migration scripts

### Step 4: Configure Directus SMTP (from DIRECTUS-COMPLETE-STATUS.md)
- Set up Resend API key for transactional email
- Create email flow for waitlist confirmations
- Configure sender identity

### Step 5: Deploy Updated Frontend to SiteGround
- After frontend→Directus connection works locally
- Push updated files via `git push siteground main`
- Verify pages load correctly on vidismart.com

---

## Manual Dual Push Workflow (Daily Use)

```bash
# After making changes locally:
git add .
git commit -m "description of changes"

# Push to both targets:
git push origin main       # → GitHub → can deploy to Railway manually with railway up
git push siteground main   # → SiteGround → immediate static file update
```

For Railway deploys (when api/ changes):
```bash
npx @railway/cli up --service VidiSmart-SmartStack
```

---

## Architecture Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    VIDISMART PLATFORM                        │
├──────────────┬──────────────────┬───────────────────────────┤
│   TIER 1     │     TIER 2        │        TIER 3             │
│   Railway    │   SiteGround      │    Local Docker           │
│              │                   │                           │
│  API Server  │  Static HTML      │  Directus CMS (vidicrm.com)│
│  Express.js  │  Landing Pages    │  PostgreSQL + PostGIS      │
│  :3000       │  images/assets    │  Redis :6379               │
│              │                   │  Vespa Vector DB :8089     │
│  Auto-scale  │  Fast CDN         │  Neo4j Graph :7474         │
└──────────────┴──────────────────┴───────────────────────────┘
```

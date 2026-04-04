# BrandSwap Quick Start Guide

**Date:** 2026-03-21  
**Purpose:** Quick reference for starting and testing BrandSwap

---

## ⚠️ Critical: Fix These First

### 1. Add R2 Credentials to Environment
**File:** `brandswap-backend/.env`

Create this file if it doesn't exist:
```bash
# Cloudflare R2 Credentials
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY=your_access_key_here
R2_SECRET_KEY=your_secret_key_here
R2_BUCKET=vidismart
CDN_URL=https://cdn.vidi.news
```

### 2. Add API URL to Frontend
**File:** `vidiflow/frontend/.env.local`

Add this line:
```bash
NEXT_PUBLIC_BRANDSWAP_API=http://localhost:8080
```

---

## Start the System

### Step 1: Start Backend Server
```bash
cd m:\code\vidismart\brandswap-backend
python server.py
```

**Expected Output:**
```
Starting BrandSwap Backend Server...
Local: http://localhost:8080
API Docs: http://localhost:8080/docs
```

### Step 2: Start Cloudflare Tunnel (Optional - for public access)
```bash
cloudflared tunnel --url http://localhost:8080
```

**Expected Output:**
```
https://random-words-123.trycloudflare.com
```

### Step 3: Test Backend Health
Open in browser or use curl:
```
http://localhost:8080/health
```

**Expected Response:**
```json
{"status": "healthy"}
```

### Step 4: Test API Docs
Open in browser:
```
http://localhost:8080/docs
```

---

## Test the System

### Test 1: Quick Health Check
```bash
curl http://localhost:8080/health
```

### Test 2: API Documentation
Open http://localhost:8080/docs in browser

### Test 3: Frontend Access
Open https://vidi.news/smartchannel/brandswap in browser

### Test 4: End-to-End Workflow
1. Upload logo template (NotebookLM logo)
2. Upload test images with logo
3. Click "Process"
4. Check results and download

---

## File Locations

### Backend
- **Server:** `brandswap-backend/server.py`
- **Storage:** `brandswap-backend/storage/`
  - `uploads/` - Original files
  - `output/` - Processed files
  - `archive/` - Completed sessions

### Frontend
- **UI:** `vidiflow/frontend/app/smartchannel/brandswap/page.tsx`
- **Environment:** `vidiflow/frontend/.env.local`
- **Production Env:** `vidiflow/frontend/.env.production`

### Test Images
- `images/brandswap_step_*.png`
- `images/velocis_replaces_slocum.png`

---

## Common Issues & Solutions

### Issue: "Connection refused" when accessing frontend
**Solution:** Start backend server first
```bash
cd brandswap-backend
python server.py
```

### Issue: "CORS error" in browser console
**Solution:** Check Cloudflare Tunnel is running and URL is correct in Vercel

### Issue: "Logo not detected"
**Solution:** 
1. Lower threshold (0.3-0.5)
2. Ensure logo template is clear/high-res
3. Logo must be in bottom-right corner

### Issue: "ffmpeg not found"
**Solution:** Verify ffmpeg is installed and in PATH
```bash
ffmpeg -version
```

### Issue: "R2 upload failed"
**Solution:** Check R2 credentials in .env file

---

## API Endpoints

### POST /api/brandswap/process
Process files with logo replacement

**Form Data:**
- `logo` (file): Logo template to find
- `files` (files): Media files to process
- `overlayText` (string): Replacement text
- `threshold` (float): Detection threshold (0.3-0.9)
- `position` (string): Logo position
- `fontName` (string): Font name
- `fontSize` (float): Font size percentage
- `textColor` (string): Text color hex
- `bgColor` (string): Background color hex
- `borderColor` (string): Border color hex
- `enableShadow` (bool): Enable text shadow
- `shadowOffset` (int): Shadow offset in pixels

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "results": [
    {
      "filename": "image.jpg",
      "status": "processed",
      "confidence": 0.87,
      "cdnUrl": "https://cdn.vidi.news/brandswap/uuid/image.jpg"
    }
  ]
}
```

### GET /health
Health check endpoint

**Response:**
```json
{"status": "healthy"}
```

---

## Monitoring

### Backend Logs
Check the terminal where you started `python server.py`

### Frontend Logs
Check Vercel dashboard: https://vercel.com/team_aQMTdWqc4B3Wntnac0xKMCLq/frontend

### CDN Access
Check uploaded files at: `https://cdn.vidi.news/brandswap/{session_id}/`

---

## Next Steps After Testing

1. ✅ Fix critical issues (credentials, environment variables)
2. ✅ Start backend server
3. ✅ Test end-to-end workflow
4. ✅ Deploy to production
5. ✅ Monitor and iterate

---

## Support

- **Documentation:** `BRANDSWAP_ANALYSIS.md` (detailed analysis)
- **Deployment:** `BRANDSWAP_DEPLOYMENT.md`
- **Testing:** `BRANDSWAP_TEST_STATUS.md`
- **Changes:** `BRANDSWAP_CHANGES.md`

---

**Status:** Ready for testing after fixing critical issues

**Last Updated:** 2026-03-21

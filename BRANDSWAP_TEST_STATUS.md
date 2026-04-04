# BrandSwap Test Status

## ✅ Deployment Status (Verified)

### Frontend (Vercel)
- **URL:** https://vidi.news/smartchannel/brandswap
- **Status:** ✅ LIVE - Page loads successfully
- **Environment:** `NEXT_PUBLIC_BRANDSWAP_API` configured
- **Tested:** Page renders with upload UI, settings, and process button

### Backend (Local + Cloudflare Tunnel)
- **Local:** http://localhost:8080
- **Public:** https://acquired-actively-robot-forth.trycloudflare.com
- **Status:** ✅ RUNNING - Health endpoint responds
- **Storage:** Permanent folders at `m:\code\vidismart\brandswap-backend\storage\`

### Landing Page (SiteGround)
- **URL:** https://vidismart.com/brand-swap.html
- **Status:** ✅ LIVE - Links point to vidi.news app
- **CTAs:** All buttons link to https://vidi.news/smartchannel/brandswap

## 🧪 What's Been Tested

### Infrastructure Tests
✅ Frontend page loads (HTML rendered correctly)
✅ Backend health endpoint responds
✅ Cloudflare Tunnel accessible publicly
✅ Environment variables configured in Vercel
✅ Storage folders created (`storage/uploads/`, `storage/output/`, `storage/archive/`)

### NOT Yet Tested End-to-End
⚠️ Actual file upload
⚠️ Logo detection with OpenCV
⚠️ Image processing and replacement
⚠️ Video processing with ffmpeg
⚠️ R2 CDN upload
⚠️ File download from CDN
⚠️ Error handling

## 📋 Manual Test Plan

### Test 1: Image Logo Replacement
1. Open https://vidi.news/smartchannel/brandswap in Chrome
2. Upload logo template (e.g., NotebookLM logo from images folder)
3. Upload 2-3 test images containing that logo
4. Set threshold to 0.55
5. Click "Process"
6. **Expected:**
   - Processing indicator shows
   - Results appear with "processed" status
   - Download buttons work
   - Files appear in `storage/uploads/{session}/` and `storage/output/{session}/`
   - Files upload to `https://cdn.vidi.news/brandswap/{session}/`

### Test 2: Video Logo Replacement
1. Upload logo template
2. Upload a short video (10-30 seconds) containing the logo
3. Set threshold to 0.55
4. Click "Process"
5. **Expected:**
   - Longer processing time (ffmpeg frame extraction)
   - Temp frames appear in `storage/output/frames_{id}/`
   - Final video saved to `storage/output/{session}/`
   - Video uploaded to R2 CDN
   - Video downloadable and playable

### Test 3: No Logo Found
1. Upload logo template
2. Upload images WITHOUT that logo
3. Click "Process"
4. **Expected:**
   - Status shows "skipped" - "Logo not detected"
   - No output files created

### Test 4: Batch Processing
1. Upload logo template
2. Upload 10+ files (mix of images and videos)
3. Click "Process"
4. **Expected:**
   - All files processed sequentially
   - Results show mix of "processed" and "skipped"
   - Download all button downloads processed files only

## 🐛 Known Issues to Watch For

1. **CORS Errors:** If frontend can't reach backend
   - Check Cloudflare Tunnel is running
   - Verify `NEXT_PUBLIC_BRANDSWAP_API` matches tunnel URL

2. **OpenCV Detection Fails:** If logos not detected
   - Try lowering threshold (0.3-0.5)
   - Ensure logo template is clear/high-res
   - Logo must be in bottom-right corner

3. **ffmpeg Not Found:** If video processing fails
   - Verify ffmpeg in PATH: `ffmpeg -version`
   - Check server logs for ffmpeg errors

4. **R2 Upload Fails:** If CDN upload doesn't work
   - Check R2 credentials in server.py
   - Verify bucket name is correct
   - Check boto3 is installed

5. **Port Already in Use:** If server won't start
   - Kill process: `taskkill //F //PID {pid}`
   - Or use different port

## 📊 Test Images Location

Sample test images with NotebookLM logo:
- `m:\code\vidismart\images\brandswap_step_*.png`
- `m:\code\vidismart\images\velocis_replaces_slocum.png`

## 🚀 Next Steps for Testing

1. **Manual Browser Test:** Open Chrome and test upload workflow
2. **Check Storage Folders:** Verify files appear in correct locations
3. **Monitor Server Logs:** Watch for processing errors
4. **Test CDN Links:** Verify uploaded files are accessible
5. **Test Edge Cases:** Large files, unsupported formats, concurrent uploads

## 📝 Test Results (To Be Completed)

### Test Run #1: ___/___/___ at __:__
- [ ] Frontend loads
- [ ] Can upload logo template
- [ ] Can upload media files
- [ ] Process button triggers API call
- [ ] Files appear in storage folders
- [ ] Logo detection works
- [ ] Results uploaded to R2
- [ ] Download works

**Notes:**
_Record any issues, errors, or observations here_

---

**Last Updated:** 2026-03-18
**Status:** Infrastructure deployed, awaiting end-to-end functional testing

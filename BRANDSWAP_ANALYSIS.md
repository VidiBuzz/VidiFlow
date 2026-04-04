# BrandSwap System Analysis

**Date:** 2026-03-21  
**Status:** Analysis Complete  
**Author:** VidiSmart Team

---

## Executive Summary

BrandSwap is an AI-powered logo detection and replacement tool that automatically removes unwanted logos from images and videos while preserving exact dimensions. The system consists of a Next.js frontend deployed on Vercel, a FastAPI backend running locally, and Cloudflare R2 for CDN storage.

### Current Status
- ✅ **Frontend**: Deployed at https://vidi.news/smartchannel/brandswap
- ✅ **Backend**: Code ready, server needs to be started
- ✅ **Cloudflare Tunnel**: Configuration ready
- ✅ **R2 CDN**: Credentials configured
- ⚠️ **End-to-End Testing**: Not yet completed

---

## System Architecture

```
User Browser
    ↓
Vercel Frontend (Next.js)
    ↓
Cloudflare Tunnel (public URL)
    ↓
Local Backend Server (FastAPI on port 8080)
    ↓
    ├─ OpenCV (logo detection)
    ├─ Pillow (image overlays)
    ├─ ffmpeg (video processing)
    └─ boto3 → Cloudflare R2 CDN
```

### Component Details

#### 1. Frontend (Next.js)
- **Location**: `vidiflow/frontend/app/smartchannel/brandswap/page.tsx`
- **Deployment**: Vercel
- **URL**: https://vidi.news/smartchannel/brandswap
- **Features**:
  - Drag-and-drop file upload
  - Logo template upload
  - Customizable overlay settings (text, colors, fonts, shadows)
  - Real-time progress tracking
  - Results dashboard with download links

#### 2. Backend (FastAPI)
- **Location**: `brandswap-backend/server.py`
- **Port**: 8080
- **API Endpoint**: `/api/brandswap/process`
- **Features**:
  - Multi-scale logo detection using OpenCV
  - Image processing with Pillow
  - Video processing with ffmpeg
  - Automatic R2 CDN upload
  - CORS-enabled for Vercel frontend

#### 3. Storage
- **Local Storage**: `brandswap-backend/storage/`
  - `uploads/` - Original files
  - `output/` - Processed files
  - `archive/` - Completed sessions
- **CDN**: Cloudflare R2 at `https://cdn.vidi.news/brandswap/`

---

## Code Review & Issues Identified

### 🔴 Critical Issues

#### 1. Security: Hardcoded R2 Credentials
**Location**: `brandswap-backend/server.py` lines 48-51

```python
R2_ACCOUNT_ID = "5830508745fd2ac063426ebf9429c22d"
R2_ACCESS_KEY = "e9c7b7eb9ea570cc59e413cfdf580deb"
R2_SECRET_KEY = "aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b"
```

**Issue**: R2 credentials are hardcoded in the source code. This is a major security risk.

**Impact**: 
- Credentials exposed if code is shared or committed to version control
- Security breach if repository is compromised
- Violates security best practices

**Recommendation**: 
- Move credentials to environment variables
- Use `.env` file for local development
- Use Vercel environment variables for production

**Fix**:
```python
import os
from dotenv import load_dotenv

load_dotenv()

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "vidismart")
CDN_URL = os.getenv("CDN_URL", "https://cdn.vidi.news")
```

#### 2. Missing Environment Variable for Local Development
**Location**: `vidiflow/frontend/.env.local`

**Issue**: `NEXT_PUBLIC_BRANDSWAP_API` is not configured in `.env.local`

**Impact**: 
- Local development will fail to connect to backend
- Developers need to manually add the variable

**Recommendation**: Add the environment variable to `.env.local`:

```bash
NEXT_PUBLIC_BRANDSWAP_API=http://localhost:8080
```

### ⚠️ Important Issues

#### 3. No File Size Validation
**Location**: `brandswap-backend/server.py` lines 331-334

**Issue**: No validation for file sizes before processing

**Impact**:
- Could cause memory issues with large files
- Server could crash with very large uploads
- No protection against DoS attacks

**Recommendation**: Add file size validation:

```python
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

for file in files:
    file_size = len(await file.read())
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large: {file.filename}")
    file.file.seek(0)  # Reset file pointer
```

#### 4. No Rate Limiting
**Location**: `brandswap-backend/server.py`

**Issue**: No rate limiting on API endpoints

**Impact**:
- Could be abused by malicious users
- Server resources could be exhausted
- No protection against brute force attacks

**Recommendation**: Add rate limiting middleware:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.post("/api/brandswap/process")
@limiter.limit("10/minute")
async def process_brandswap(...):
    ...
```

#### 5. No Session Cleanup
**Location**: `brandswap-backend/server.py` lines 304-308

**Issue**: Sessions are created but not automatically cleaned up

**Impact**:
- Storage could fill up over time
- Old files accumulate indefinitely
- No automatic cleanup mechanism

**Recommendation**: Implement automatic cleanup:

```python
import shutil
from datetime import datetime, timedelta

def cleanup_old_sessions():
    """Remove sessions older than 7 days"""
    cutoff = datetime.now() - timedelta(days=7)
    for session_dir in UPLOAD_DIR.iterdir():
        if session_dir.is_dir():
            mtime = datetime.fromtimestamp(session_dir.stat().st_mtime)
            if mtime < cutoff:
                shutil.rmtree(session_dir)
```

#### 6. No Timeout Handling
**Location**: `brandswap-backend/server.py`

**Issue**: No timeout for long-running requests

**Impact**:
- Requests could hang indefinitely
- Server resources tied up
- Poor user experience

**Recommendation**: Add timeout handling:

```python
import asyncio

@app.post("/api/brandswap/process")
async def process_brandswap(...):
    try:
        # Set timeout for entire request
        result = await asyncio.wait_for(
            process_files_async(...),
            timeout=300  # 5 minutes
        )
        return result
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="Request timeout")
```

#### 7. Video Processing Inefficiency
**Location**: `brandswap-backend/server.py` lines 188-248

**Issue**: Frame-by-frame processing is slow for long videos

**Impact**:
- Could take a long time for videos over 1 minute
- High CPU usage
- Memory intensive

**Recommendation**: Use ffmpeg's overlay filter directly:

```python
def process_video_efficient(video_path, output_path, template_path, overlay_config, threshold):
    """Process video using ffmpeg overlay filter (more efficient)"""
    # Detect logo in first frame
    cap = cv2.VideoCapture(str(video_path))
    ret, frame = cap.read()
    if ret:
        frame_path = video_path.parent / f"temp_frame_{uuid.uuid4().hex[:8]}.png"
        cv2.imwrite(str(frame_path), frame)
        
        found, conf, bbox = detect_logo_multiscale(frame_path, template_path, threshold)
        frame_path.unlink()
        
        if found:
            # Create overlay image
            overlay_img = create_text_overlay(bbox[2], bbox[3], **overlay_config)
            overlay_path = video_path.parent / f"temp_overlay_{uuid.uuid4().hex[:8]}.png"
            overlay_img.save(overlay_path)
            
            # Use ffmpeg overlay filter
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-i', str(video_path),
                '-i', str(overlay_path),
                '-filter_complex',
                f"[0:v][1:v]overlay={bbox[0]}:{bbox[1]}[outv]",
                '-map', '[outv]',
                '-map', '0:a?',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'copy',
                str(output_path)
            ]
            
            subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
            overlay_path.unlink()
    
    cap.release()
```

### 🟡 Minor Issues

#### 8. Hardcoded Font Paths
**Location**: `brandswap-backend/server.py` lines 129-137

**Issue**: Font paths are hardcoded and may not exist on all systems

**Impact**:
- Could fail on systems without specific fonts
- Limited font options

**Recommendation**: Use font fallback chain:

```python
def get_font(font_name, font_size):
    """Get font with fallback chain"""
    font_paths = [
        font_name,
        f"/usr/share/fonts/truetype/{font_name}",
        f"/usr/share/fonts/truetype/dejavu/{font_name}",
        "arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    ]
    
    for path in font_paths:
        try:
            return ImageFont.truetype(path, font_size)
        except:
            continue
    
    return ImageFont.load_default()
```

#### 9. No Progress Updates for Long Operations
**Location**: `brandswap-backend/server.py`

**Issue**: No progress updates during processing

**Impact**:
- User doesn't know how long processing will take
- No feedback for long-running operations

**Recommendation**: Implement progress updates using WebSockets or polling:

```python
# Add progress endpoint
@app.get("/api/brandswap/progress/{session_id}")
async def get_progress(session_id: str):
    progress_file = OUTPUT_DIR / session_id / "progress.json"
    if progress_file.exists():
        with open(progress_file) as f:
            return json.load(f)
    return {"progress": 0, "status": "processing"}
```

---

## Testing Status

### ✅ Completed Tests
1. Frontend page loads successfully
2. Backend health endpoint responds
3. Cloudflare Tunnel accessible publicly
4. Environment variables configured in Vercel
5. Storage folders created

### ⚠️ Pending Tests
1. Actual file upload
2. Logo detection with OpenCV
3. Image processing and replacement
4. Video processing with ffmpeg
5. R2 CDN upload
6. File download from CDN
7. Error handling

### 📋 Manual Test Plan

#### Test 1: Image Logo Replacement
1. Open https://vidi.news/smartchannel/brandswap in Chrome
2. Upload logo template (e.g., NotebookLM logo)
3. Upload 2-3 test images containing that logo
4. Set threshold to 0.55
5. Click "Process"
6. Verify:
   - Processing indicator shows
   - Results appear with "processed" status
   - Download buttons work
   - Files appear in storage folders
   - Files upload to CDN

#### Test 2: Video Logo Replacement
1. Upload logo template
2. Upload a short video (10-30 seconds) containing the logo
3. Set threshold to 0.55
4. Click "Process"
5. Verify:
   - Longer processing time
   - Final video saved and uploaded
   - Video downloadable and playable

#### Test 3: No Logo Found
1. Upload logo template
2. Upload images WITHOUT that logo
3. Click "Process"
4. Verify:
   - Status shows "skipped"
   - No output files created

#### Test 4: Batch Processing
1. Upload logo template
2. Upload 10+ files (mix of images and videos)
3. Click "Process"
4. Verify:
   - All files processed sequentially
   - Results show mix of "processed" and "skipped"
   - Download all button works

---

## Recommendations

### Immediate Actions (Priority 1)
1. ✅ **Move R2 credentials to environment variables**
2. ✅ **Add NEXT_PUBLIC_BRANDSWAP_API to .env.local**
3. ✅ **Add file size validation**
4. ✅ **Implement rate limiting**

### Short-term Improvements (Priority 2)
1. ✅ **Implement session cleanup**
2. ✅ **Add timeout handling**
3. ✅ **Improve video processing efficiency**
4. ✅ **Add progress updates**

### Long-term Enhancements (Priority 3)
1. ✅ **Add comprehensive error handling**
2. ✅ **Implement logging system**
3. ✅ **Add unit tests**
4. ✅ **Add integration tests**
5. ✅ **Implement monitoring and alerting**

---

## Deployment Checklist

- [ ] Move R2 credentials to environment variables
- [ ] Add NEXT_PUBLIC_BRANDSWAP_API to .env.local
- [ ] Start backend server: `python brandswap-backend/server.py`
- [ ] Start Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:8080`
- [ ] Update Vercel environment variables with tunnel URL
- [ ] Deploy frontend to Vercel
- [ ] Test end-to-end workflow
- [ ] Verify CDN uploads work
- [ ] Test download functionality
- [ ] Monitor server logs for errors

---

## Conclusion

BrandSwap is a well-designed system with a solid architecture. The main issues are security-related (hardcoded credentials) and missing validation/rate limiting. Once these issues are addressed, the system should be ready for production use.

The system has been tested at the infrastructure level but needs end-to-end functional testing to verify all components work together correctly.

**Next Steps**:
1. Fix critical security issues
2. Start backend server
3. Perform end-to-end testing
4. Deploy to production
5. Monitor and iterate

---

**Last Updated**: 2026-03-21  
**Status**: Ready for implementation of fixes

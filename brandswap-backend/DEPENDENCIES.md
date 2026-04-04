# BrandSwap Backend Dependencies

## ✅ All Required Libraries (Verified Installed)

### Python Libraries (via pip)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| **fastapi** | 0.115.12 | Web framework for API | ✅ Installed |
| **uvicorn[standard]** | 0.36.3 | ASGI server | ✅ Installed |
| **python-multipart** | 0.0.20 | File upload handling | ✅ Installed |
| **opencv-python** | 4.11.0 (actual: 4.13.0) | Image processing & logo detection | ✅ Installed |
| **numpy** | auto (2.3.5) | Array operations for OpenCV | ✅ Installed |
| **pillow** | 11.1.0 (actual: 12.0.0) | Image manipulation & text overlays | ✅ Installed |
| **boto3** | 1.36.44 | AWS/R2 upload client | ✅ Installed |

### System Requirements

| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| **Python** | 3.13.5 | Runtime | ✅ Installed |
| **ffmpeg** | N-123369 (2026-03-10) | Video processing | ✅ Installed |

## What Each Library Does

### 1. **OpenCV (cv2)**
- Multi-scale template matching for logo detection
- Image color space conversions
- Video frame extraction (`cv2.VideoCapture`)
- Bounding box detection

**Code Usage:**
```python
cv2.imread()           # Load images
cv2.matchTemplate()    # Detect logos
cv2.VideoCapture()     # Extract video frames
```

### 2. **NumPy**
- Required by OpenCV for array operations
- Image array manipulation
- No direct usage in our code (OpenCV dependency)

### 3. **Pillow (PIL)**
- Create text overlays for logo replacement
- Draw rectangles and borders
- Font rendering for custom branding text
- Save processed images with quality control

**Code Usage:**
```python
Image.open()           # Load images
ImageDraw.Draw()       # Draw text/shapes
ImageFont.truetype()   # Load fonts
overlay.save()         # Save processed images
```

### 4. **FastAPI + Uvicorn**
- HTTP API server
- File upload handling
- CORS middleware for Vercel
- Async request handling

**Code Usage:**
```python
@app.post("/api/brandswap/process")  # API endpoint
UploadFile                            # Handle uploads
```

### 5. **boto3**
- Upload processed files to Cloudflare R2
- S3-compatible API client
- Automatic CDN distribution

**Code Usage:**
```python
s3_client.upload_fileobj()  # Upload to R2
```

### 6. **ffmpeg (System Binary)**
- Extract frames from videos
- Reassemble frames into video
- Copy audio streams
- Video encoding (H.264)

**Code Usage:**
```python
subprocess.run([
    'ffmpeg', '-i', video_path,
    # ... frame extraction/reassembly
])
```

## Additional Optional Libraries (NOT Required)

These are NOT needed for BrandSwap but could enhance it:

| Library | Purpose | Use Case |
|---------|---------|----------|
| `opencv-contrib-python` | Advanced CV features | Better logo detection algorithms |
| `scikit-image` | Image processing | More robust template matching |
| `moviepy` | Video editing | Easier video manipulation |
| `torch` + `torchvision` | Deep learning | AI-based logo detection |
| `easyocr` | Text detection | Detect text-based logos |

## Installation Commands

### Fresh Install (All at Once)
```bash
cd m:\code\vidismart\brandswap-backend
python -m pip install -r requirements.txt
```

### Individual Install
```bash
python -m pip install fastapi uvicorn[standard]
python -m pip install opencv-python pillow
python -m pip install boto3 python-multipart
```

### Verify Installation
```bash
python -c "import cv2, PIL, fastapi, boto3; print('All OK')"
```

### ffmpeg Installation (Already Done)
- Already installed at: `C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe`
- In PATH: ✅
- Version: Latest GPL build with full codec support

## Dependency Resolution

No conflicts detected:
- OpenCV and Pillow work together (different use cases)
- NumPy automatically installed with OpenCV
- Boto3 has no conflicts with other libraries

## Future Enhancements (Optional)

If you want to improve BrandSwap later:

### Better Logo Detection
```bash
pip install opencv-contrib-python
```
Enables: SIFT, SURF, ORB feature matching

### GPU Acceleration
```bash
pip install opencv-python-headless  # Remove GUI
pip install torch torchvision       # GPU processing
```
Enables: CUDA-accelerated processing

### Advanced Video Processing
```bash
pip install moviepy
```
Enables: Easier video editing, effects

## System Resources

**Minimum Requirements:**
- RAM: 4GB (8GB recommended for video)
- Disk: 10GB free (for temp video frames)
- CPU: Multi-core (video processing uses all cores)

**Current Setup:**
- ✅ ffmpeg compiled with multi-threading
- ✅ OpenCV built with optimizations
- ✅ All dependencies compatible

## License Notes

- **OpenCV**: Apache 2.0 (free for commercial use)
- **Pillow**: HPND License (free)
- **FastAPI**: MIT (free)
- **boto3**: Apache 2.0 (free)
- **ffmpeg**: GPL (free, with restrictions on redistribution)

**For BrandSwap:** All libraries are free for use in this application.

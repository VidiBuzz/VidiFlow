# BrandSwap - Logo Replacement Tool

## Overview
BrandSwap is a tool that replaces logos in images (JPG, PNG) and videos (MP4) with custom branding. It uses computer vision to detect existing logos and overlays new ones.

---

## Installation Status

### ✅ Python Dependencies Installed

| Package | Version | Purpose |
|---------|---------|---------|
| opencv-python | 4.13.0.92 | Logo detection in videos |
| numpy | 2.4.3 | Image processing |
| Pillow | 12.1.1 | Image overlay for JPG/PNG |

### ✅ FFmpeg Installed

| Component | Details |
|-----------|---------|
| Version | N-123369-g0afa879a69-20260310 |
| Location | `C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin` |
| Added to PATH | ✅ Yes |

---

## File Locations

### Frontend UI
- **Main Page:** `vidiflow/frontend/app/smartchannel/brandswap/page.tsx`
- **Tools Page:** `vidiflow/frontend/app/smartchannel/tools/brandswap/page.tsx`

### API Route
- `vidiflow/frontend/app/api/brandswap/route.ts`

### Python Processor
- `vidiflow/frontend/scripts/brandswap-processor.py`

### Dependencies List
- `vidiflow/frontend/scripts/requirements.txt`

---

## How It Works

```
User uploads media (JPG/PNG/MP4)
            ↓
    UI (page.tsx)
            ↓
    API Route (route.ts)
            ↓
    Python Script (brandswap-processor.py)
            ↓
    ┌────────┴────────┐
    ↓                ↓
OpenCV          Pillow
(Video)         (Image)
    ↓                ↓
    └────────┬────────┘
             ↓
    Output: Logo-replaced media
```

---

## Usage

### Via Web UI
1. Navigate to: `http://localhost:3002/smartchannel/brandswap`
2. Upload an image or video
3. Specify the new logo/text to overlay
4. Download the processed result

### Via Python Script
```bash
cd vidiflow/frontend/scripts
python brandswap-processor.py --input video.mp4 --output output.mp4
```

---

## Technical Details

### Logo Detection (OpenCV)
- Uses template matching to find logos
- Configurable search region (default: bottom-right corner)
- Match threshold: 0.55 (55% confidence)

### Image Overlay (Pillow)
- Creates RGBA overlays with transparency
- Custom font support for text overlays
- Maintains aspect ratio

### Video Processing (FFmpeg)
- Frame-by-frame logo replacement
- Supports MP4, MOV, AVI formats
- Maintains original video quality

---

## Requirements

### System
- Windows 10/11
- Python 3.8+
- ~500MB disk space

### Python Packages
```
opencv-python>=4.8.0
numpy>=1.24.0
Pillow>=10.0.0
```

### System Tools
- FFmpeg (for video processing)

---

## Troubleshooting

### FFmpeg not found
Ensure FFmpeg is in your PATH:
```powershell
$env:PATH += ";C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin"
```

### OpenCV import error
Reinstall:
```bash
pip uninstall opencv-python
pip install opencv-python
```

### Video processing slow
- Use smaller resolution videos for testing
- Ensure GPU is available (OpenCV can leverage CUDA)

---

## Status: ✅ READY

All dependencies installed and verified. BrandSwap is ready to use!

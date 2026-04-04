# BrandSwap Quick Start Guide

## Quick Commands

### 1. Prepare a Logo Template
```bash
python fix_logo_alignment.py prepare ../images/your_logo.png ../images/your_logo_template.png
```

### 2. Test Detection on Single Image
```bash
python fix_logo_alignment.py test ../images/logo_template.png "../images/test_image.jpg" output.jpg --threshold 0.4
```

### 3. Process One Folder
```bash
python batch_process_to_images.py ../images/logo_template.png "input/folder" "output/folder" --threshold 0.4
```

### 4. Process ALL Rebranded Folders
```bash
python batch_process_to_images.py all ../images/notebooklm_template.png ../images --threshold 0.4
```

## For NotebookLM Logo (Current Setup)

### Already Prepared
✅ Template ready: `../images/notebooklm_template.png`

### Process Everything
```bash
cd m:/code/vidismart/brandswap-backend
python batch_process_to_images.py all ../images/notebooklm_template.png ../images --threshold 0.4
```

**Output Location**: `m:/code/vidismart/images/out_brandswap/`

## API Server (For Video Processing)

### Start Server
```bash
cd m:/code/vidismart/brandswap-backend
python server.py
```

**Server URL**: http://localhost:8080
**API Docs**: http://localhost:8080/docs

### API Endpoint
```
POST http://localhost:8080/api/brandswap/process
```

**Parameters**:
- `logo`: Template file (notebooklm_template.png)
- `files`: Image/video files to process
- `overlayText`: "VidiSmart™" (default)
- `threshold`: 0.45 (default)

## File Locations

```
m:/code/vidismart/
├── images/
│   ├── notebooklm_template.png      # Template (prepared)
│   ├── rebranded/                    # Input folders
│   └── out_brandswap/               # Output folders
└── brandswap-backend/
    ├── fix_logo_alignment.py        # Detection tool
    ├── batch_process_to_images.py   # Batch processor
    └── server.py                    # API server
```

## Success Criteria

✅ **Confidence > 0.85** = Excellent detection
✅ **Confidence > 0.70** = Good detection
⚠️  **Confidence < 0.45** = May need lower threshold

## Troubleshooting

### Logo Not Detected?
1. Lower threshold: `--threshold 0.3`
2. Prepare template: Clean logo with transparent background
3. Check logo location: Should be in bottom 15% of image

### Poor Alignment?
- Logo should be consistently positioned across all images
- Template should match the logo size/style in target images

### Processing Errors?
1. Check Python dependencies: `pip install -r requirements.txt`
2. Verify input files exist
3. Check OpenCV installation: `python -c "import cv2; print(cv2.__version__)"`

## Current Status (March 27, 2026)

✅ **142 images processed** across 12 folders
✅ **100% success rate**
✅ **0.87-0.90 average confidence**

**All NotebookLM logos successfully replaced with VidiSmart™ branding!**

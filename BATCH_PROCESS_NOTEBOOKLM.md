# Batch Process NotebookLM Images - Replace with VidiSmart

## Goal
Process all 289 images/videos in `m:\code\vidismart\images\` to replace NotebookLM logos with VidiSmart™ branding.

## Prerequisites

✅ Backend server running at http://localhost:8080
✅ 289 files found in images folder
✅ Storage folders ready at `brandswap-backend/storage/`

## Step 1: Create NotebookLM Logo Template

You need to extract the NotebookLM logo from one of your existing images to use as the detection template.

### Option A: Use the Interactive Extractor (Recommended)

```bash
cd m:\code\vidismart\brandswap-backend

# Pick an image that has the NotebookLM logo visible
# Example:
python create_logo_template.py ../images/some_image_with_notebooklm.png
```

This will:
1. Open the image in a window
2. Let you click and drag to select the NotebookLM logo
3. Save it as `../images/notebooklm_logo_template.png`

### Option B: Manually Crop the Logo

1. Open any image with NotebookLM logo in Paint/Photoshop
2. Crop JUST the logo (including text and icon)
3. Save as: `m:\code\vidismart\images\notebooklm_logo_template.png`
4. Make it at least 100x100 pixels for best detection

**Important:** The logo template should be:
- Clear and high resolution
- Just the logo itself (no background)
- Saved as PNG

## Step 2: Batch Process All Images

### Option A: Using the Batch Script (Fastest)

```bash
cd m:\code\vidismart\brandswap-backend

# Process all images in the images folder
python batch_process_folder.py
```

This will:
- Find all 289 images/videos
- Process them in batches of 20 files
- Replace NotebookLM logos with "VidiSmart™"
- Upload results to R2 CDN automatically
- Save locally to `storage/output/{session-id}/`

### Option B: Using the Web App (Better UI)

1. Open: https://vidi.news/smartchannel/brandswap
2. Upload logo template: `notebooklm_logo_template.png`
3. Select multiple files (Ctrl+Click or Shift+Click in file browser)
4. Upload in batches of 20-50 files
5. Click "Process"
6. Download all when done

**Note:** Web browser may have upload size limits, so batch script is recommended for 289 files.

## Step 3: Verify Results

### Check Local Storage
```bash
# List processed files
ls -lh brandswap-backend/storage/output/

# Check a specific session
ls -lh brandswap-backend/storage/output/{session-uuid}/
```

### Check R2 CDN
Files are uploaded to:
```
https://cdn.vidi.news/brandswap/{session-uuid}/filename.jpg
https://cdn.vidi.news/brandswap/{session-uuid}/filename.mp4
```

## Configuration Options

Edit `batch_process_folder.py` to customize:

```python
OVERLAY_TEXT = "VidiSmart™"     # Change replacement text
THRESHOLD = 0.55                 # Detection sensitivity (0.3-0.9)
                                 # Lower = more sensitive
                                 # Higher = stricter matching
```

## Expected Results

### For Images with NotebookLM Logo:
- ✅ Logo detected and replaced with "VidiSmart™"
- ✅ File saved to `storage/output/`
- ✅ Uploaded to R2 CDN
- ✅ Dimensions preserved exactly

### For Images WITHOUT NotebookLM Logo:
- ⚠️ Skipped (no logo detected)
- ⚠️ Not in output folder
- ⚠️ Not uploaded to CDN

### For Videos:
- ✅ Frames extracted
- ✅ Logo replaced in each frame
- ✅ Reassembled with ffmpeg
- ✅ Audio preserved
- ⏱️ Takes longer (1-2 minutes per video)

## Troubleshooting

### Logo Not Detected
**Problem:** Files showing as "skipped - logo not detected"

**Solutions:**
1. Lower the threshold: `THRESHOLD = 0.3`
2. Make logo template larger/clearer
3. Ensure logo is in bottom-right corner (default search area)

### Script Fails/Timeouts
**Problem:** Request timeout or connection error

**Solutions:**
1. Process smaller batches (change `batch_size = 10`)
2. Check server is running: `curl http://localhost:8080/health`
3. Increase timeout: `timeout=1200` in script

### Out of Disk Space
**Problem:** Processing videos fills up disk

**Solutions:**
1. Process videos separately
2. Clean up old sessions: `rm -rf brandswap-backend/storage/output/old_session_id/`
3. Files are on R2 CDN anyway

## File Locations

### Input Files
```
m:\code\vidismart\images\
├── *.jpg, *.png (images)
└── *.mp4, *.mov (videos)
```

### Logo Template
```
m:\code\vidismart\images\notebooklm_logo_template.png
```

### Output Files (Local)
```
m:\code\vidismart\brandswap-backend\storage\output\
└── {session-uuid}\
    ├── file1.jpg (with VidiSmart branding)
    ├── file2.png (with VidiSmart branding)
    └── video1.mp4 (with VidiSmart branding)
```

### Output Files (CDN)
```
https://cdn.vidi.news/brandswap/{session-uuid}/
├── file1.jpg
├── file2.png
└── video1.mp4
```

## Performance Estimates

- **Images:** ~1-2 seconds each
- **Videos:** ~60-120 seconds each (depends on length)
- **Total 289 files:** ~20-60 minutes (mostly images)

## Next Steps After Processing

1. **Review Results:** Check a few files to ensure logos were replaced correctly
2. **Bulk Download:** Use R2 dashboard or AWS CLI to download all processed files
3. **Replace Originals:** Copy processed files back to images folder (backup originals first!)
4. **Cleanup:** Archive old sessions to save disk space

## Quick Start (TL;DR)

```bash
# 1. Extract logo template (one time)
cd brandswap-backend
python create_logo_template.py ../images/sample_image.png

# 2. Process all files
python batch_process_folder.py

# 3. Check results
ls storage/output/
```

Done! All NotebookLM logos replaced with VidiSmart™

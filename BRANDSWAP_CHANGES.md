# BrandSwap Updates - Logo Overlay Fix

**Date:** 2026-03-01  
**Status:** Ready for Testing

---

## Summary

Fixed the logo overlay alignment issue in `rebrand_notebooklm.py`. The overlay was previously too small and didn't fully cover the original NotebookLM logo.

---

## Changes Made to `rebrand_notebooklm.py`

### 1. Expanded Search Region (Lines 23-28)
```python
SEARCH_REGION = {
    "x_start": 0.65,  # Changed from 0.70 (started searching earlier from left)
    "y_start": 0.88,  # Changed from 0.85 (adjusted vertical position)
    "width": 0.35,    # Changed from 0.30 (expanded search width)
    "height": 0.12,   # Changed from 0.15 (tightened vertical search)
}
```

### 2. Added Padding Configuration (Lines 30-36)
```python
OVERLAY_PADDING = {
    "left": 10,      # pixels to extend left
    "right": 20,     # pixels to extend right (to edge)
    "top": 8,        # pixels to extend up
    "bottom": 8,     # pixels to extend down
}
```

### 3. Updated Image Processing (Lines 163-185)
- Overlay now extends beyond detected bounds with padding
- Automatically extends to right edge when logo is near edge (>90% of image width)
- Prevents overlay from exceeding image boundaries

### 4. Updated Video Processing

#### A. Added Duration Detection (Lines 241-252)
```python
# Get video duration for end-tag overlay
duration_cmd = [
    "ffprobe",
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    str(video_path),
]
```

#### B. Increased Logo Size Estimate (Lines 254-268)
```python
# Estimate logo size with padding for full coverage
logo_w = int(original_w * 0.18)  # Increased from 15% to 18%
```

#### C. End-Tag Only Overlay (Lines 270-275)
- Overlay now only appears during the last 5 seconds of videos
- Changed from `between(t,0,99999)` to `between(t,{video_duration-5},{video_duration})`

#### D. Updated Dry-Run Message (Lines 270-275)
- Now shows end-tag timing: `end-tag: 343.0s-348.0s`

---

## Files Modified

1. **`/mnt/m/code/vidismart/rebrand_notebooklm.py`** - Main script with all fixes
2. **`/mnt/m/code/vidismart/vidiflow/frontend/scripts/brandswap-processor.py`** - Copy (needs same updates)

---

## How to Test

### Dry Run (Preview Only)
```bash
cd /mnt/m/code/vidismart
.venv/bin/python rebrand_notebooklm.py --dry-run
```

### Process Specific Folder
```bash
.venv/bin/python rebrand_notebooklm.py \
  --input "images/Agent_Architectures_2026_Review conv" \
  --output "images/test_output"
```

### Process All Images
```bash
.venv/bin/python rebrand_notebooklm.py
```

---

## Expected Behavior

### Images
- Overlay will be larger than detected logo bounds
- Padding extends 10px left, 20px right, 8px top/bottom
- Right edge extension when logo is near image edge
- Full coverage of original NotebookLM logo

### Videos
- Overlay only appears in last 5 seconds (end-tag)
- Same padding applied as images
- Logo size estimate increased to 18% of video width

---

## Output Locations

- **Images:** `images/rebranded/` (maintains subdirectory structure)
- **Videos:** `images/rebranded/` (maintains subdirectory structure)

---

## Supported Formats

- **Images:** JPG, JPEG, PNG, WebP, BMP
- **Videos:** MP4, MOV, AVI

---

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input, -i` | Input directory | `images/` |
| `--output, -o` | Output directory | `images/rebranded/` |
| `--template, -t` | Template image | `NotebookLM.jpg` |
| `--threshold` | Detection threshold | 0.55 |
| `--text` | Overlay text | `VidiSmart™` |
| `--dry-run, -d` | Preview only | False |
| `--json` | Output JSON format | False |

---

## Next Steps

1. Run dry-run to verify detection: `.venv/bin/python rebrand_notebooklm.py --dry-run`
2. Process test folder: `.venv/bin/python rebrand_notebooklm.py --input "images/TEST_FOLDER"`
3. Check output images to verify overlay covers full logo
4. Run full batch processing when satisfied

---

## Notes

- The script processes folders recursively
- Original dimensions are preserved
- Videos: Overlay only covers last 5 seconds (end-tag)
- Images: Overlay covers entire detected logo area with padding

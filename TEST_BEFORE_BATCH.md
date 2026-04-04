# ⚠️ TEST FIRST - Don't Repeat the Old Failure!

## The Problem

The `images/rebranded/` folder has videos that **STILL have NotebookLM logos** - the old processing clearly failed.

## Don't Make the Same Mistake

**DO NOT** run the batch processor on 465 files until you verify the NEW backend actually works!

## Proper Testing Workflow

### Step 1: Extract Logo Template

```bash
cd m:\code\vidismart\brandswap-backend

# Pick ONE image with visible NotebookLM logo
python create_logo_template.py ../images/YOUR_IMAGE.png
```

This creates: `../images/notebooklm_logo_template.png`

### Step 2: Test with ONE File First

```bash
# Test with a single image
python test_single_file.py ../images/notebooklm_logo_template.png ../images/test_image.jpg
```

**Expected Output if it Works:**
```
✅ TEST PASSED!
Session ID: abc-123
File: test_image.jpg
Status: processed
✅ Logo detected and replaced!
Confidence: 0.87
CDN URL: https://cdn.vidi.news/brandswap/abc-123/test_image.jpg

✅ BACKEND IS WORKING!
Safe to process all 465 files.
```

**If it Fails:**
```
⚠️  Logo NOT detected
Reason: Logo not detected

❌ DETECTION FAILED
Try:
  1. Lower threshold (0.3-0.4)
  2. Use clearer logo template
  3. Check logo is in bottom-right corner
```

### Step 3: Verify the Output

1. **Check local file:**
   ```bash
   ls -lh storage/output/{session-id}/test_image.jpg
   ```

2. **Open the file** - Visually confirm NotebookLM logo is GONE and VidiSmart™ is there

3. **Check CDN:** Open the CDN URL in browser - file should load

### Step 4: Test with ONE Video

```bash
# Videos are harder - test one first!
python test_single_file.py ../images/notebooklm_logo_template.png ../images/test_video.mp4
```

This will take 1-2 minutes for video processing.

**Verify:**
- Download processed video from CDN
- Play it and check logo is replaced in ALL frames
- Audio is still there

### Step 5: Only THEN Run Batch

If all tests pass:

```bash
python batch_process_folder.py
```

## Why the Old Script Failed

Possible reasons:
1. **Logo template was bad** - Not clear enough for detection
2. **Threshold too high** - Missed logos (should be 0.3-0.5)
3. **Search region wrong** - Logo not in bottom-right corner
4. **Video processing broken** - ffmpeg not working
5. **Script crashed** - Errors not handled

## Our New Backend Fixes

✅ Better multi-scale template matching
✅ Adjustable threshold
✅ Proper error handling
✅ Cloudflare Tunnel for testing
✅ Progress tracking
✅ Session-based storage

## Debugging If Test Fails

### Logo Not Detected

**Problem:** Test shows "skipped - logo not detected"

**Solutions:**

1. **Lower threshold** - Edit `test_single_file.py`:
   ```python
   'threshold': (None, '0.3'),  # Try 0.3, 0.4, 0.5
   ```

2. **Better logo template** - Make sure:
   - Logo is clear and high-res
   - Just the logo itself (no extra background)
   - At least 100x100 pixels
   - From a similar image (same resolution/quality)

3. **Check server logs:**
   ```bash
   # In another terminal
   curl http://localhost:8080/health
   ```

### Backend Not Responding

**Problem:** Request times out or fails

**Check:**

1. Server running?
   ```bash
   curl http://localhost:8080/health
   # Should return: {"status":"healthy"}
   ```

2. Cloudflare Tunnel working?
   ```bash
   curl https://acquired-actively-robot-forth.trycloudflare.com/health
   ```

3. Check server process:
   ```bash
   netstat -ano | findstr :8080
   ```

### Video Processing Fails

**Problem:** Images work but videos fail

**Check:**

1. ffmpeg installed?
   ```bash
   ffmpeg -version
   ```

2. Enough disk space?
   ```bash
   df -h  # or check C:\ drive
   ```

3. Video too large?
   - Try shorter video (10-30 seconds)
   - Or smaller resolution

## Test Checklist

Before running batch processor on 465 files:

- [ ] Backend server is running
- [ ] Logo template extracted and looks good
- [ ] Single image test PASSES
- [ ] Output file visually confirmed (logo replaced)
- [ ] CDN download works
- [ ] Single video test PASSES (if processing videos)
- [ ] Video plays correctly with logo replaced
- [ ] You're confident it will work at scale

## Don't Waste Time on 465 Files Until Tests Pass!

One failed batch run = hours wasted. Test properly first!

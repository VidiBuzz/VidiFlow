# BrandSwap Deployment & Testing Guide

## Live Application URLs

### Production (Vercel)
**Primary URL**: https://vidi.news/smartchannel/brandswap
**Project Name**: vidi.news
**Vercel Project ID**: prj_EBlpzCoMyw8IUbFIQU5RO9yqh1x1

### Local Development
**Frontend**: http://localhost:3002/smartchannel/brandswap
**Backend API**: http://localhost:8080
**API Docs**: http://localhost:8080/docs

## Testing Checklist

### ✅ Frontend Interface Testing

#### 1. Page Load & Navigation
- [ ] Page loads without errors at `/smartchannel/brandswap`
- [ ] "Back to Create Media" button works
- [ ] Header displays correctly with credits (1,250)
- [ ] Settings and help icons are visible
- [ ] User avatar displays in top right

#### 2. File Upload Controls
- [ ] **Logo Upload Section**:
  - [ ] Click to upload logo template works
  - [ ] Drag and drop logo file works
  - [ ] Preview of uploaded logo appears
  - [ ] Can remove uploaded logo

- [ ] **Media Files Upload**:
  - [ ] Click to upload images/videos works
  - [ ] Drag and drop multiple files works
  - [ ] File list displays correctly
  - [ ] Can remove individual files from list
  - [ ] File type validation (JPG, PNG, MP4, MOV)

#### 3. Configuration Controls
- [ ] **Threshold Slider**: Default is 0.45 (updated from 0.55)
- [ ] **Overlay Text**: Default "VidiSmart™" is editable
- [ ] **Position**: Dropdown shows "bottom-right"
- [ ] **Advanced Settings**:
  - [ ] Font selection
  - [ ] Font size slider (default 0.35)
  - [ ] Text color picker (default #FFFFFF)
  - [ ] Background color picker (default #0F172A)
  - [ ] Border color picker (default #3B82F6)
  - [ ] Shadow toggle (default enabled)
  - [ ] Shadow offset slider (default 2)

#### 4. Process Button & Results
- [ ] "Start BrandSwap" button is disabled when no files
- [ ] Button becomes enabled when logo + files uploaded
- [ ] Processing spinner/progress appears
- [ ] Results section displays:
  - [ ] Session ID
  - [ ] File name
  - [ ] Status (processed/skipped/error)
  - [ ] Confidence score
  - [ ] CDN URL (clickable)
  - [ ] Download button for each file
  - [ ] Preview of processed file

#### 5. Credits Display
- [ ] Shows "35 credits per image"
- [ ] Shows "100 credits per video"
- [ ] Shows "20% batch discount"
- [ ] Current balance: 1,250 credits

### ✅ Backend API Testing

#### Start Backend Server
```bash
cd m:/code/vidismart/brandswap-backend
python server.py
```

**Expected Output**:
```
Starting BrandSwap Backend Server...
Local: http://localhost:8080
API Docs: http://localhost:8080/docs
```

#### API Endpoints to Test

1. **Health Check**
   ```bash
   curl http://localhost:8080/health
   ```
   Expected: `{"status": "healthy"}`

2. **Process Endpoint** (via frontend or curl)
   - POST to `/api/brandswap/process`
   - With multipart form data:
     - `logo`: Template file
     - `files`: Image/video files
     - `threshold`: 0.45
     - Other customization params

3. **Interactive API Docs**
   - Open http://localhost:8080/docs
   - Try the "Try it out" feature
   - Upload test files
   - Verify response format

### ✅ End-to-End Test Workflow

#### Test Case 1: Single Image Processing
1. Go to https://vidi.news/smartchannel/brandswap
2. Upload logo template: `m:/code/vidismart/images/notebooklm_template.png`
3. Upload test image: Any image from `m:/code/vidismart/images/rebranded/Agent_Orch_2026_Review conv/`
4. Leave default settings (threshold 0.45)
5. Click "Start BrandSwap"
6. **Expected Results**:
   - Processing completes within 10-30 seconds
   - Status shows "processed"
   - Confidence score: 0.85-0.90
   - CDN URL is generated
   - Preview shows VidiSmart™ logo replacing NotebookLM logo
   - Download button works

#### Test Case 2: Batch Processing (Multiple Images)
1. Upload logo template
2. Upload 5-10 images from same folder
3. Set threshold to 0.40 (lower for more detections)
4. Click "Start BrandSwap"
5. **Expected Results**:
   - All files processed successfully
   - Consistent confidence scores across images
   - All CDN URLs valid
   - Batch discount applies to credits

#### Test Case 3: Video Processing
1. Upload logo template
2. Upload test video (MP4 or MOV)
3. Set threshold to 0.45
4. Click "Start BrandSwap"
5. **Expected Results**:
   - Longer processing time (depends on video length)
   - Logo detected and replaced across frames
   - Output video has audio preserved
   - CDN URL provides downloadable video

#### Test Case 4: Customization
1. Upload logo + test image
2. Change settings:
   - Overlay text: "TestBrand™"
   - Text color: #FF0000 (red)
   - Background: #000000 (black)
   - Border: #00FF00 (green)
3. Process file
4. **Expected Results**:
   - Custom colors applied correctly
   - Custom text appears
   - Logo maintains readability

### ✅ Error Handling Tests

#### Test Case 5: Logo Not Detected
1. Upload logo template
2. Upload image WITHOUT the logo
3. Process file
4. **Expected Results**:
   - Status: "skipped"
   - Reason: "Logo not detected"
   - No CDN URL generated
   - Suggestion to lower threshold

#### Test Case 6: Invalid File Types
1. Try uploading .txt, .pdf, or other non-media files
2. **Expected Results**:
   - File type validation prevents upload
   - Error message displayed

#### Test Case 7: No Logo Template
1. Upload media files without logo template
2. Try to process
3. **Expected Results**:
   - Button disabled or error message
   - "Please upload logo template first"

### ✅ Performance Testing

- [ ] Single image: < 10 seconds
- [ ] 10 images: < 60 seconds
- [ ] 1-minute video: < 2 minutes
- [ ] No memory leaks during batch processing
- [ ] Progress indicator updates smoothly

## Known Issues & Fixes

### Issue: Backend Not Connected
**Symptom**: API calls fail with CORS or connection errors
**Fix**:
1. Start local backend: `python server.py`
2. Set environment variable: `NEXT_PUBLIC_BRANDSWAP_API=http://localhost:8080`
3. Or deploy backend to production server

### Issue: Logo Detection Fails
**Symptom**: All files show "skipped" status
**Fix**:
1. Lower threshold to 0.30-0.40
2. Use prepared template (notebooklm_template.png)
3. Check logo is in bottom 15% of image
4. Verify template matches logo style in target images

### Issue: Slow Processing
**Symptom**: Processing takes very long
**Fix**:
1. Check server resources (CPU, memory)
2. Reduce number of files processed at once
3. For videos, consider shorter clips for testing

## Deployment Steps

### Deploy Frontend to Vercel
```bash
cd m:/code/vidismart/vidiflow/frontend
vercel --prod
```

### Deploy Backend (Options)

**Option 1: Railway**
```bash
cd m:/code/vidismart/brandswap-backend
railway up
```

**Option 2: Docker + Cloud Run**
```bash
docker build -t brandswap-backend .
docker push gcr.io/your-project/brandswap-backend
gcloud run deploy brandswap-backend --image gcr.io/your-project/brandswap-backend
```

**Option 3: Local + Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:8080
```

### Environment Variables

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_BRANDSWAP_API=https://your-backend-url.com
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.vidi.news
```

**Backend (.env)**:
```env
R2_ACCOUNT_ID=5830508745fd2ac063426ebf9429c22d
R2_ACCESS_KEY=e9c7b7eb9ea570cc59e413cfdf580deb
R2_SECRET_KEY=aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b
R2_BUCKET=vidismart
CDN_URL=https://cdn.vidi.news
```

## Success Metrics

### Baseline Performance (Achieved)
✅ **Detection Rate**: 100% (142/142 images in test)
✅ **Confidence**: 0.87-0.90 average
✅ **Processing Speed**: ~3 seconds per image
✅ **Error Rate**: 0% in batch tests

### User Experience Goals
- [ ] < 5 second first paint
- [ ] < 10 second average processing per image
- [ ] Clear error messages with solutions
- [ ] Mobile responsive design
- [ ] Accessible (keyboard navigation, screen readers)

## Support & Documentation

**Quick Start**: See [QUICK_START.md](m:\code\vidismart\brandswap-backend\QUICK_START.md)
**Technical Details**: See [BRANDSWAP_LOGO_ALIGNMENT_FIXED.md](m:\code\vidismart\BRANDSWAP_LOGO_ALIGNMENT_FIXED.md)
**API Documentation**: http://localhost:8080/docs (when running)

## Contact

For issues or questions:
- Check GitHub Issues: https://github.com/your-repo/issues
- Review API logs: Check server console output
- Test with sample data: Use provided test images in `/images/rebranded/`

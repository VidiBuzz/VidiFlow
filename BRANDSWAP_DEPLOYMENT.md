# BrandSwap Deployment Guide

## Current Status

✅ **Backend:** Running locally at http://localhost:8080
✅ **Tunnel:** https://acquired-actively-robot-forth.trycloudflare.com
✅ **Frontend:** Deployed at https://vidi.news
✅ **BrandSwap URL:** https://vidi.news/smartchannel/brandswap

## Setup Steps

### 1. Add Environment Variable to Vercel

Go to: https://vercel.com/team_aQMTdWqc4B3Wntnac0xKMCLq/frontend/settings/environment-variables

Add this variable:
```
Name: NEXT_PUBLIC_BRANDSWAP_API
Value: https://acquired-actively-robot-forth.trycloudflare.com
```

**OR** use Vercel CLI:
```bash
cd m:\code\vidismart\vidiflow\frontend
vercel env add NEXT_PUBLIC_BRANDSWAP_API production
# Then paste: https://acquired-actively-robot-forth.trycloudflare.com
```

### 2. Deploy to Vercel

```bash
cd m:\code\vidismart\vidiflow\frontend
vercel --prod
```

### 3. Keep Backend Running

Make sure these are running:
- Backend: `python m:\code\vidismart\brandswap-backend\server.py`
- Tunnel: `cloudflared tunnel --url http://localhost:8080`

Or just run: `m:\code\vidismart\brandswap-backend\start.bat`

### 4. Test in Chrome

Open: https://vidi.news/smartchannel/brandswap

1. Upload a logo template (e.g., NotebookLM logo)
2. Upload images/videos
3. Click "Process"
4. Download results from CDN

## Important Notes

⚠️ **Tunnel URL Changes:** Every time you restart `cloudflared`, the URL changes. You must update the environment variable in Vercel and redeploy.

💡 **Permanent Solution:** Create a named Cloudflare Tunnel:
```bash
cloudflared tunnel create brandswap
cloudflared tunnel route dns brandswap brandswap.vidi.news
```

Then use `brandswap.vidi.news` as your permanent API URL.

## Troubleshooting

### "Failed to process files"
- Check backend is running: `curl http://localhost:8080/health`
- Check tunnel is accessible: `curl https://acquired-actively-robot-forth.trycloudflare.com/health`

### CORS errors
- Verify tunnel URL in Vercel environment variables
- Check browser console for actual error

### Logo not detected
- Lower threshold (0.3-0.5)
- Ensure logo template is clear/high quality
- Logo must be in bottom-right corner of images

## File Locations

- **Backend Code:** `m:\code\vidismart\brandswap-backend\`
- **Frontend Code:** `m:\code\vidismart\vidiflow\frontend\app\smartchannel\brandswap\`
- **Landing Page:** `m:\code\vidismart\brand-swap.html` (deployed to vidismart.com)

## Architecture

```
User (Chrome)
    ↓
vidi.news (Vercel)
    ↓
Cloudflare Tunnel (acquired-actively-robot-forth.trycloudflare.com)
    ↓
Local Server (localhost:8080)
    ↓
    ├─ Python/FastAPI
    ├─ OpenCV (logo detection)
    ├─ ffmpeg (video processing)
    └─ Boto3 → Cloudflare R2 CDN
```

## Monitoring

- **Backend Logs:** Check Python terminal
- **Tunnel Status:** Check cloudflared terminal
- **Frontend Logs:** Vercel dashboard
- **API Health:** https://acquired-actively-robot-forth.trycloudflare.com/health

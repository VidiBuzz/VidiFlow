# BrandSwap Backend

Local FastAPI server for BrandSwap logo replacement processing.

## Features

- 🎯 Multi-scale logo detection with OpenCV
- 🎬 Video processing with ffmpeg
- ☁️ Auto-upload results to Cloudflare R2
- ⚡ Fast local processing (no cloud compute costs)
- 🌐 CORS-enabled for Vercel frontend

## Setup

1. Install dependencies:
```bash
python -m pip install -r requirements.txt
```

2. Create storage directories (automatic on first run):
```bash
mkdir -p storage/uploads storage/output storage/archive
```

3. Start server:
```bash
python server.py
```

4. Server runs at: `http://localhost:8080`
5. API Docs: `http://localhost:8080/docs`

## Storage

Files are stored permanently in `./storage/`:
- `storage/uploads/` - Uploaded files (logo templates + media)
- `storage/output/` - Processed files (logo replaced)
- `storage/archive/` - Completed sessions (optional cleanup)

All processed files are automatically uploaded to R2 CDN.

## Expose to Internet

### Using Cloudflare Tunnel (Recommended):
```bash
cloudflared tunnel --url http://localhost:8080
```

This gives you a public URL like: `https://random-words-123.trycloudflare.com`

### Or using ngrok:
```bash
ngrok http 8080
```

## API Endpoints

### POST `/api/brandswap/process`

Process files with logo replacement.

**Form Data:**
- `logo` (file): Logo template to find
- `files` (files): Media files to process
- `overlayText` (string): Replacement text (default: "VidiSmart™")
- `threshold` (float): Detection threshold 0.3-0.9 (default: 0.55)
- `position` (string): Logo position (default: "bottom-right")

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "results": [
    {
      "filename": "image.jpg",
      "status": "processed",
      "confidence": 0.87,
      "cdnUrl": "https://cdn.vidi.news/brandswap/uuid/image.jpg"
    }
  ]
}
```

## Frontend Integration

Update your Vercel frontend to use the tunnel URL:

```typescript
// In vidiflow/frontend/app/smartchannel/brandswap/page.tsx
const API_URL = "https://your-tunnel-url.trycloudflare.com";

const response = await fetch(`${API_URL}/api/brandswap/process`, {
  method: "POST",
  body: formData,
});
```

## Architecture

```
User Browser → Vercel Frontend → Cloudflare Tunnel → Local Server → ffmpeg
                                                          ↓
                                                    Cloudflare R2 CDN
```

## Requirements

- Python 3.13+
- ffmpeg (for video processing)
- Cloudflare Tunnel (for public access)

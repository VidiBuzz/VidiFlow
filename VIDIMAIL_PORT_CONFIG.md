# VidiMail Port Configuration

## ✅ CONFIRMED PORT ASSIGNMENT

**VidiMail Server:** Port **5307**
**VidiMail Frontend:** TBD (needs configuration)

---

## 📋 VidiMail Project Structure

```
/mnt/m/code/vidismart/
├── vidimail-server/          # Backend API (Node.js/Express)
│   └── Port: 5307 (CONFIRMED)
├── vidimail-app/              # Frontend (React + Vite)
│   └── Port: TBD (default would be 5173 for Vite)
└── VIDIMAIL_*.md files        # Documentation
```

---

## 🎯 VidiMail Overview

**Product:** Personalized video email platform (Sendspark competitor)
**Stack:**
- **Backend:** Node.js + Express + TypeScript (Port 5307)
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2
- **AI:** NVIDIA Personaplex for video personalization

**Core Features:**
- AI video personalization (one video → thousands of personalized versions)
- Bulk contact import (CSV/CRM)
- Video landing pages
- Email delivery system
- Dynamic backgrounds (LinkedIn/website scraping)
- AI voice cloning (ElevenLabs)
- Analytics dashboard

---

## 🔧 Port Configuration Fix

### Backend Server (vidimail-server/)

The server docs say port 3001, but you're running on **5307**.

**Update required in:**
```bash
# File: vidimail-server/.env
PORT=5307  # Changed from 3001

# Or when starting:
PORT=5307 npm run dev
```

### Frontend App (vidimail-app/)

Vite default is 5173. Should stay separate from backend.

**Configuration:**
```bash
# File: vidimail-app/vite.config.ts
export default defineConfig({
  server: {
    port: 5173  # Or any available port (5174, 5175, etc.)
  }
})
```

---

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **VidiMail API** | http://localhost:5307 | ✅ ACTIVE |
| **VidiMail Frontend** | http://localhost:5173 | ❓ Check if running |

---

## 📊 Complete Port Map Including VidiMail

| Port | Service | Type | Project |
|------|---------|------|---------|
| 3000 | AppFlowy | ⚠️ CRITICAL | Main app |
| 3001 | VidiCity Frontend | Frontend | VidiFlow |
| **5307** | **VidiMail API** | **Backend** | **VidiMail** |
| 5173 | VidiMail Frontend | Frontend | VidiMail (if running) |
| 8055 | VidiCRM (Directus) | Backend | VidiFlow |
| 8080 | OpenWebUI | Web UI | LM Studio interface |
| 1234 | LM Studio | API | Local LLM server |

---

## 🚀 Starting VidiMail

### Backend Server (Port 5307)
```bash
cd /mnt/m/code/vidismart/vidimail-server

# Set environment variables (if .env not configured)
PORT=5307 npm run dev
```

### Frontend App (Port 5173)
```bash
cd /mnt/m/code/vidismart/vidimail-app

# Configure backend API URL
# File: vidimail-app/.env or src/config
VITE_API_URL=http://localhost:5307

npm run dev  # Runs on port 5173 by default
```

---

## 🔧 Environment Configuration

### Backend (.env)
```env
# Server
PORT=5307  # ← CORRECTED FROM 3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vidimail

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=vidimail-videos

# Email (Resend)
RESEND_API_KEY=your_key

# AI (NVIDIA Personaplex)
PERSONAPLEX_API_KEY=your_key

# JWT
JWT_SECRET=your_secret

# CORS
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5307  # Backend API
VITE_APP_NAME=VidiMail
```

---

## ✅ Verification

### Check Backend is Running (Port 5307)
```bash
curl http://localhost:5307/api/health
# Should return: {"status":"ok"}
```

### Check Frontend is Running (Port 5173)
```bash
curl http://localhost:5173
# Should return HTML
```

### Check Cross-Origin (CORS)
```bash
# Backend must allow frontend origin
# In vidimail-server .env:
CORS_ORIGIN=http://localhost:5173
```

---

## 📝 Documentation Files

| File | Description |
|------|-------------|
| VIDIMAIL_BUILD_PLAN.md | Full feature plan & architecture |
| VIDIMAIL_AGENTIC_ARCHITECTURE.md | AI agent system design |
| VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.md | Sendspark analysis |
| VIDIMAIL_IMPLEMENTATION_ROADMAP.md | Development timeline |
| vidimail-server/VIDIMAIL.md | Backend API documentation |
| vidimail-app/VIDIMAIL.README.md | Frontend setup |

---

## 🎯 Status Summary

✅ **Port 5307 = VidiMail Backend** (Confirmed)
✅ **Backend Server Structure** (Created but needs setup)
✅ **Frontend App Structure** (Created but needs setup)
❓ **Are services actually running?** (Needs verification)
❓ **Database setup?** (PostgreSQL required)
❓ **Environment variables configured?** (Check .env files)

---

**Last Updated:** February 3, 2026
**Port Assignment:** 5307 for VidiMail Server
**Status:** Port documented, services need verification

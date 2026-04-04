# AppFlowy Cloud - Fixes & Results

## Date: March 7, 2026

---

## Summary

This document details the emergency fixes applied to AppFlowy Cloud to restore functionality and enable PDF export.

---

## Issues Found & Fixed

### 1. Docker Desktop Not Running
**Problem:** AppFlowy Cloud was completely inaccessible because Docker Desktop was not running.

**Solution:**
- Started Docker Desktop
- Restarted all AppFlowy containers:
  ```powershell
  docker start appflowy-cloud-nginx-1
  docker start appflowy-cloud-appflowy_web-1
  docker start appflowy-cloud-appflowy_cloud-1
  docker start appflowy-cloud-appflowy_worker-1
  ```

### 2. PDF Export Not Working
**Problem:** PDF export was failing because Gotenberg service was missing.

**Solution:**
- Added Gotenberg service to docker-compose.yml:
  ```yaml
  gotenberg:
    image: gotenberg/gotenberg:7
    container_name: appflowy-cloud-gotenberg
    ports:
      - "3000:80"
    restart: unless-stopped
  ```
- Added GOTENBERG_URL environment variable to appflowy_cloud service:
  ```yaml
  GOTENBERG_URL=http://gotenberg:80
  ```

---

## Current Status

| Service | Status | Port |
|---------|--------|------|
| Docker Desktop | ✅ Running | - |
| Nginx (HTTP) | ✅ Running | 4000 |
| Nginx (HTTPS) | ✅ Running | 4443 |
| AppFlowy Cloud API | ✅ Running | 8000 |
| AppFlowy Web | ✅ Running | 80 |
| AppFlowy Worker | ✅ Running | 4001 |
| AppFlowy AI | ✅ Running | 5001 |
| Gotenberg (PDF) | ✅ Running | 3000 |
| PostgreSQL | ✅ Running | 5432 |
| Redis | ✅ Running | 6379 |
| MinIO | ✅ Running | 9000/9001 |

---

## Access URLs

- **HTTP:** http://localhost:4000
- **HTTPS:** https://localhost:4443
- **PDF Service:** http://localhost:3000

---

## Running Containers

```
appflowy-cloud-nginx-1          # Reverse proxy (ports 4000, 4443)
appflowy-cloud-appflowy_cloud-1  # Core API (port 8000)
appflowy-cloud-appflowy_web-1    # Web frontend (port 80)
appflowy-cloud-appflowy_worker-1 # Background worker (port 4001)
appflowy-cloud-appflowy_ai-1    # AI service (port 5001)
appflowy-cloud-gotrue-1          # Authentication (port 9999)
appflowy-cloud-redis-1           # Cache (port 6379)
appflowy-cloud-postgres-1        # Database (port 5432)
appflowy-cloud-minio-1           # S3 storage (ports 9000, 9001)
appflowy-cloud-admin_frontend-1  # Admin panel (port 3000)
appflowy-cloud-gotenberg-1       # PDF export (port 3000)
```

---

## How to Restart AppFlowy Cloud

If AppFlowy Cloud goes down again:

1. **Start Docker Desktop** (from Start Menu)
2. **Wait for green icon** in system tray
3. **Run:**
   ```powershell
   docker start appflowy-cloud-nginx-1
   docker start appflowy-cloud-appflowy_web-1
   docker start appflowy-cloud-appflowy_cloud-1
   docker start appflowy-cloud-appflowy_worker-1
   docker start appflowy-cloud-gotenberg-1
   ```

---

## Additional Services Fixed

### VidiCRM (Directus/Converge)

**Problem:** VidiCRM was not running - containers were stopped.

**Solution:**
- Started all VidiCRM containers
- Fixed Redis cache connection issue (was causing blank blue screen)
- Reset admin password

**Login:**
- **URL:** http://localhost:8055
- **Email:** admin@vidismart.com
- **Password:** VidiCRM2026!

**Docker Compose Location:** `m:/code/vidismart/docker-compose.yml`

**To Start/Restart:**
```bash
docker compose -f "m:/code/vidismart/docker-compose.yml" up -d
```

---

## Previous Issues (Investigated but working)

- **Port 4000 Web Errors** - Actually working, "unhealthy" status was false positive
- **AI/LM Studio** - Using OpenAI API, working correctly
- **CDN (cdn.vidi.news)** - Already configured and working
- **R2 Storage** - Already configured with 642+ files uploaded

---

## Notes

- The "unhealthy" status on appflowy_web container is a false positive - curl is not installed in the container, but it works fine
- AppFlowy is configured to use OpenAI API (gpt-4.1-mini), not LM Studio
- CDN is cdn.vidi.news (not cdn.video.news)

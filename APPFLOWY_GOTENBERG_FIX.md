# AppFlowy Cloud - Add Gotenberg for PDF Export

## The Problem
PDF export is failing because Gotenberg service is missing from AppFlowy Cloud deployment.

## The Fix
Add this service to your AppFlowy Cloud docker-compose.yml:

```yaml
  # --------------------------------------------------------------------------------------------------
  # GOTENBERG - PDF Export Service
  # --------------------------------------------------------------------------------------------------
  gotenberg:
    image: gotenberg/gotenberg:7
    container_name: appflowy-cloud-gotenberg
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - GOTENBERG_GLOBALURLSPACELESSING=enabled
      - GOTENBERG_DROPGCOPTIMIZATIONS=enabled
```

## Also Update the Cloud Service
Add this environment variable to your `appflowy_cloud` service to point to Gotenberg:

```yaml
appflowy_cloud:
  # ... existing config ...
  environment:
    # ... existing env vars ...
    - GOTENBERG_URL=http://gotenberg:80
```

## After Adding
1. Run: `docker compose up -d gotenberg`
2. Or: `docker compose down && docker compose up -d` (full restart)
3. Test PDF export in AppFlowy

## Verification
```bash
docker ps | grep gotenberg
curl http://localhost:3000/health
```

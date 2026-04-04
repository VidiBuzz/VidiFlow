# Paperless-ngx + AnythingLLM + Qwen 3.5 + LMStudio Setup Guide

## Overview
This setup integrates Paperless-ngx (document management with OCR) with AnythingLLM for RAG-based document chat, using Qwen 3.5 as the LLM served via LMStudio.

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Paperless-ngx  │────▶│   AnythingLLM    │────▶│    LMStudio     │
│  (OCR + Docs)   │     │  (RAG + Chat)    │     │ (Qwen 3.5 LLM) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Part 1: Paperless-ngx Setup (Docker)

### docker-compose.paperless.yml
```yaml
version: '3.8'

services:
  paperless:
    container_name: vidismart-paperless
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    ports:
      - '8090:8000'
    volumes:
      - paperless_data:/data
      - paperless_media:/media
      # Map your document folders here
      - ./documents:/documents
    environment:
      PAPERLESS_URL: http://localhost:8090
      PAPERLESS_SECRET_KEY: change_this_to_a_random_secret
      
      # OCR Settings
      OCR_LANGUAGE: eng+spa+fra+deu
      OCR_MODE: skip
      OCR_OUTPUT_FORMAT: pdfa
      PAPERLESS_OCR_USER_ARGS: '{"skip_text": false}'
      
      # Database (use existing PostgreSQL or default SQLite)
      # PAPERLESS_DBHOST: database
      # PAPERLESS_DBPORT: 5432
      # PAPERLESS_DBNAME: paperless
      # PAPERLESS_DBUSER: paperless
      # PAPERLESS_DBPASS: paperless_password
      
      # Redis Cache
      PAPERLESS_REDIS: redis://cache:6379
      
      # Enable Tika for document parsing
      PAPERLESS_TIKA_ENABLED: 1
      PAPERLESS_TIKA_ENDPOINT: http://tika:9998
      
      # OCR my PDF for search
      PAPERLESS_OCR_CONTAINER_MEMORY: 2048
      
    depends_on:
      - cache
      - tika
      - gotenberg

  # Redis for task queue
  cache:
    container_name: paperless-redis
    image: redis:7
    volumes:
      - paperless_redis:/data

  # Tika for document parsing
  tika:
    container_name: paperless-tika
    image: apache/tika:2.9.1.0
    ports:
      - '9998:9998'

  # Gotenberg for PDF conversion
  gotenberg:
    container_name: paperless-gotenberg
    image: gotenberg/gotenberg:8.0
    ports:
      - '8091:3000'

volumes:
  paperless_data:
  paperless_media:
  paperless_redis:

networks:
  default:
    name: vidismart-network
```

---

## Part 2: LMStudio + Qwen 3.5 Setup

### Step 2.1: Install LMStudio
1. Download LMStudio from https://lmstudio.ai/
2. Install and launch the application
3. Download Qwen 2.5 7B or 14B model (Qwen 3.5 may not be available yet - use latest available)

### Step 2.2: Configure LMStudio
1. Open LMStudio and go to Settings
2. Configure the local server:
   - Port: 1234 (default)
   - Model: Qwen 2.5 (or latest available)
   - Context Length: 8192+
   - GPU Offload: Adjust based on your VRAM

### Step 2.3: Start the Server
1. Click "Start Server" in LMStudio
2. The server will run at http://localhost:1234/v1
3. Keep LMStudio running while using AnythingLLM

---

## Part 3: AnythingLLM Setup

### Step 3.1: Install AnythingLLM
1. Download from https://useanything.com/
2. Install and launch

### Step 3.2: Configure LLM Provider
1. Open AnythingLLM Settings
2. Go to "LLM Preference"
3. Select "LM Studio" as the provider
4. Configure:
   - Base URL: http://localhost:1234/v1
   - Model Name: qwen2.5 (or whatever model you loaded)
   - API Key: any value (LMStudio doesn't require one)
   - Context Length: 8192

### Step 3.3: Embed Paperless Documents
1. In AnythingLLM, click "Add Documents" or "Import"
2. Select documents from Paperless-ngx:
   - Access Paperless at http://localhost:8090
   - Download documents to a local folder
   - Import that folder into AnythingLLM
3. Click "Process" to create embeddings

---

## Part 4: Connecting Everything

### Option A: Direct Integration (Recommended)
1. Paperless-ngx handles OCR and stores searchable PDFs
2. Export documents from Paperless to a shared folder
3. AnythingLLM indexes that folder
4. Chat with documents using Qwen 3.5 via LMStudio

### Option B: API Integration
For programmatic access:
```javascript
// Example: Query AnythingLLM with documents
const response = await fetch('http://localhost:3001/api/v1/document/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is in these documents?",
    mode: "chat"
  })
});
```

---

## Part 5: Running the Stack

### Start Everything
```bash
# 1. Start Paperless-ngx
docker-compose -f docker-compose.paperless.yml up -d

# 2. Wait for Paperless to be ready (2-3 minutes)
# Access at http://localhost:8090

# 3. Start LMStudio and load Qwen model
# Click "Start Server" in LMStudio GUI

# 4. Start AnythingLLM
# Launch the desktop app
```

### Verify Setup
1. **Paperless-ngx**: http://localhost:8090 - Login and upload a document
2. **LMStudio**: Check server status at http://localhost:1234/v1/models
3. **AnythingLLM**: Add documents and test chat

---

## Environment Variables (.env)

Create a `.env.paperless` file:
```env
PAPERLESS_URL=http://localhost:8090
PAPERLESS_SECRET_KEY=your_secret_key_here
PAPERLESS_ADMIN_USER=admin
PAPERLESS_ADMIN_PASSWORD=admin123
PAPERLESS_OCR_LANGUAGE=eng+spa+fra+deu
```

---

## Troubleshooting

### OCR Not Working
- Ensure Tika and Gotenberg containers are running
- Check Paperless logs: `docker logs vidismart-paperless`

### LMStudio Connection Failed
- Verify LMStudio server is running
- Check port 1234 is not blocked
- Ensure model is fully loaded

### AnythingLLM Not Finding Documents
- Re-process embeddings after adding documents
- Check document folder permissions
- Verify Paperless export folder is accessible

---

## Ports Used
- 8090: Paperless-ngx
- 8091: Gotenberg
- 9998: Apache Tika
- 1234: LMStudio API
- 3001: AnythingLLM (default)

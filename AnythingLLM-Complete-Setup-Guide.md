# AnythingLLM Complete Setup Guide
*Compiled: March 9, 2026*

## Table of Contents
1. [Quick Start for Qwen 3.5](#quick-start-for-qwen-35)
2. [Agent Skills & Plugins](#agent-skills--plugins)
3. [File Manager Deep Dive](#file-manager-deep-dive)
4. [Learning Resources & Videos](#learning-resources--videos)
5. [Team Sharing & Multi-User Setup](#team-sharing--multi-user-setup)
6. [AppFlowy Integration](#appflowy-integration)

---

## Quick Start for Qwen 3.5

### Setting Up Qwen 3.5 in AnythingLLM

1. **For Local Ollama Setup:**
   ```bash
   # Install Qwen 3.5 (latest version)
   ollama pull qwen3:8b
   # or for larger model
   ollama pull qwen3:14b
   # or for the massive model
   ollama pull qwen3:32b
   ```

2. **In AnythingLLM UI:**
   - Go to Settings → LLM Preferences
   - Select "Ollama" as provider
   - Set Base URL: `http://localhost:11434`
   - Select Model: `qwen3:8b` (or your chosen version)
   - Test Connection → Save

3. **For OpenRouter (Cloud):**
   - Select "OpenRouter" as provider
   - Get API key from https://openrouter.ai
   - Use model ID: `qwen/qwen3-8b-instruct` (or appropriate Qwen 3 model)

### Setting Up Qwen3-Embedding-2B

1. **Pull the embedding model:**
   ```bash
   ollama pull qwen3-embedding:2b
   ```

2. **In AnythingLLM UI:**
   - Go to Settings → Embedding Preferences
   - Select "Ollama" as provider
   - Set Base URL: `http://localhost:11434`
   - Select Model: `qwen3-embedding:2b`
   - Test Connection → Save

3. **Alternative: Use with Qdrant**
   - Settings → Vector Database → Select Qdrant
   - Qdrant URL: `http://localhost:6333`
   - The embedding model will generate vectors stored in Qdrant

---

## Agent Skills & Plugins

### Built-in Agent Skills (@agent)

Trigger agents by typing `@agent` in chat.

| Skill | Description | Activation |
|-------|-------------|------------|
| **Web Search** | Live Google/Tavily search | Built-in |
| **File System** | Read/write local files | Built-in |
| **Code Execution** | Run Python/JS/shell | Built-in |
| **Document Processing** | OCR, PDF parsing | Built-in |
| **RAG Query** | Search embedded documents | Built-in |

### MCP (Model Context Protocol) Servers

**What is MCP?** An open protocol that connects AI models to external tools.

#### Available MCP Servers to Install:

| Server | Purpose | Install Command |
|--------|---------|-----------------|
| **Filesystem** | Local file operations | `npx -y @modelcontextprotocol/server-filesystem /path/to/allow` |
| **Brave Search** | Privacy web search | Set `BRAVE_API_KEY` env var |
| **Tavily Search** | Deep AI search | Set `TAVILY_API_KEY` env var |
| **GitHub** | Repo/Issue access | Set `GITHUB_TOKEN` env var |
| **PostgreSQL** | Database queries | Set `POSTGRES_URL` env var |
| **Google Drive** | Drive file access | OAuth setup required |
| **Playwright** | Browser automation | `npx -y @modelcontextprotocol/server-playwright` |

#### Setting Up MCP Servers:

1. Click Settings → MCP Servers
2. Add Server → Fill in:
   - Name: `brave-search`
   - Transport: `stdio`
   - Command: `env BRAVE_API_KEY=your_key npx -y @modelcontextprotocol/server-brave-search`
3. Save → Restart AnythingLLM

### Custom Agent Skills

Create skills in `.agent/skills/` folder:

```yaml
---
# .agent/skills/my-skill/SKILL.md
name: web-researcher
description: Deep web research agent
model: kimi-k2.5
tools:
  - browser
  - websearch
  - fetch
---
```

---

## File Manager Deep Dive

### Making the File Manager Usable - Required Plugins/Integrations

The built-in AnythingLLM file manager is bare bones. Here's how to make it actually useful:

#### Option 1: Paperless-ngx Integration (RECOMMENDED)

**Why:** Paperless-ngx provides proper document management with OCR, tagging, search, and automatic ingestion.

**Setup:**
```yaml
# docker-compose.paperless.yml
version: '3.8'
services:
  paperless:
    container_name: paperless-ngx
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    ports:
      - '8090:8000'
    volumes:
      - paperless_data:/data
      - paperless_media:/media
      - ./documents:/documents  # Your document intake folder
    environment:
      PAPERLESS_URL: http://localhost:8090
      PAPERLESS_SECRET_KEY: your_random_secret_key
      OCR_LANGUAGE: eng
      PAPERLESS_CONSUMER_RECURSIVE: "true"
      PAPERLESS_CONSUMER_SUBDIRS_AS_TAGS: "true"
    restart: unless-stopped

volumes:
  paperless_data:
  paperless_media:
```

**Integration Workflow:**
1. Drop documents into Paperless-ngx intake folder
2. Paperless OCRs and tags them automatically
3. Export from Paperless to AnythingLLM using the API
4. Documents are now searchable in AnythingLLM with full RAG

**Export Script (Paperless → AnythingLLM):**
```bash
#!/bin/bash
# export-paperless-to-anythingllm.sh
PAPERLESS_URL="http://localhost:8090"
PAPERLESS_TOKEN="your_api_token"
EXPORT_DIR="./anythingllm-imports"

mkdir -p "$EXPORT_DIR"

# Get all documents and download
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "$PAPERLESS_URL/api/documents/" | jq -r '.results[] | .id' | \
  while read doc_id; do
    curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
      "$PAPERLESS_URL/api/documents/$doc_id/download/" \
      -o "$EXPORT_DIR/doc_${doc_id}.pdf"
  done

echo "Documents exported to $EXPORT_DIR - upload to AnythingLLM"
```

#### Option 2: File System MCP Server (PRIMARY FILE MANAGER)

**This is your main file manager interface** - use this to browse, search, and manage local files.

**Step 1: Install Filesystem MCP**
1. Settings → MCP Servers → Add Server
2. Configure:
   - **Name:** `local-filesystem`
   - **Transport:** `stdio`
   - **Command:** 
     ```
     npx -y @modelcontextprotocol/server-filesystem C:\Users\YourUsername\Documents C:\Users\YourUsername\Projects C:\Users\YourUsername\Downloads
     ```
     *(Add as many folders as you want access to)*
3. Save → Restart AnythingLLM

**Step 2: Using the File Manager**
Once connected, use these @agent commands:
```
@agent List all files in my Documents folder
@agent Search for files containing "contract" in Projects folder
@agent Read the file at C:\Users\You\Documents\report.pdf
@agent Show me the folder structure of Downloads
```

**Step 3: Auto-Upload to AnythingLLM (Optional)**
```python
# auto-upload-watchdog.py
import os
import time
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCH_FOLDERS = [
    "C:\\Users\\YourUsername\\Documents\\Scan-Inbox",
    "C:\\Users\\YourUsername\\Downloads\\To-Process"
]
ANYTHINGLLM_API = "http://localhost:3001/api/v1/document/upload"
API_KEY = "your_anythingllm_api_key"

class DocumentHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f"📄 New file: {event.src_path}")
            upload_to_anythingllm(event.src_path)

def upload_to_anythingllm(filepath):
    with open(filepath, 'rb') as f:
        response = requests.post(
            ANYTHINGLLM_API,
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"file": f}
        )
        if response.status_code == 200:
            print(f"✅ Uploaded: {filepath}")
        else:
            print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    observer = Observer()
    for folder in WATCH_FOLDERS:
        if os.path.exists(folder):
            observer.schedule(DocumentHandler(), folder, recursive=True)
            print(f"👁️  Watching: {folder}")
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
```

**Install:** `pip install watchdog requests`

#### Option 3: Google Drive MCP (CLOUD FILE MANAGER)

**Use this for cloud-based file management and team collaboration.**

**Step 1: Google Cloud Console Setup**
1. Go to https://console.cloud.google.com
2. Create new project → "AnythingLLM-Integration"
3. Enable Google Drive API:
   - APIs & Services → Library → Search "Google Drive API" → Enable
4. Create OAuth Credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: "Desktop app"
   - Name: "AnythingLLM Drive"
   - Download the `client_secret.json` file

**Step 2: Install Google Drive MCP in AnythingLLM**
1. Settings → MCP Servers → Add Server
2. Configure:
   - **Name:** `google-drive`
   - **Transport:** `stdio`
   - **Command:** 
     ```
     npx -y @modelcontextprotocol/server-gdrive
     ```
3. On first run, it will prompt you to authenticate with Google
4. Follow the OAuth flow and grant Drive access
5. Save → Restart AnythingLLM

**Step 3: Using Google Drive as File Manager**
```
@agent List files in my Google Drive root
@agent Search Drive for "budget spreadsheet"
@agent Read the document "Q4 Report" from Google Drive
@agent Show me files in Drive folder "Projects/Active"
@agent Download "contract.pdf" from Drive to local
```

**Pro Tip:** Combine both File System and Google Drive MCPs for maximum flexibility:
```
@agent Copy "local-report.pdf" from my Documents to Google Drive
@agent Move "Q4-Report.docx" from Drive to local Downloads folder
```

#### Recommended Workflow: The Complete Document Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT MANAGEMENT PIPELINE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STEP 1: INTAKE                      STEP 2: ORGANIZE               │
│  ┌──────────────┐                   ┌──────────────────┐            │
│  │ Paperless    │  ──OCR & Tag──▶  │ Google Drive     │            │
│  │ (Scan docs)  │                   │ (Cloud filing)   │            │
│  └──────────────┘                   └──────────────────┘            │
│                                              │                      │
│                                              ▼                      │
│  STEP 4: CHAT/SEARCH                STEP 3: LOCAL SYNC              │
│  ┌──────────────────┐              ┌──────────────────┐             │
│  │ AnythingLLM      │  ◀─────────  │ File System MCP  │             │
│  │ (RAG + Qwen 3.5) │   Vectors    │ (Local cache)    │             │
│  └──────────────────┘              └──────────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**How it works:**
1. **Paperless-ngx**: Scans and OCRs incoming documents
2. **Google Drive**: Main filing system with folders, sharing, search
3. **File System MCP**: Local sync for offline access and fast retrieval
4. **AnythingLLM**: RAG chat with Qwen 3.5 using Qdrant vectors

#### Option 4: WebDAV/Nextcloud Integration

If you use Nextcloud or WebDAV storage:

```yaml
# Add to docker-compose for WebDAV bridge
services:
  webdav-bridge:
    image: rclone/rclone:latest
    volumes:
      - ./rclone.conf:/config/rclone/rclone.conf
      - anythingllm-storage:/data
    command: mount nextcloud:Documents /data/documents --vfs-cache-mode writes
```

### File Manager Comparison

| Solution | Best For | Complexity | OCR | Auto-tagging |
|----------|----------|------------|-----|--------------|
| **Paperless-ngx** | Document-heavy workflows | Medium | ✅ Yes | ✅ Yes |
| **Filesystem MCP** | Simple folder watching | Low | ❌ No | ❌ No |
| **Google Drive MCP** | Cloud collaboration | Medium | ❌ No | ❌ No |
| **Built-in Only** | Quick tests only | Low | ❌ No | ❌ No |

### Where Files Are Stored

| Platform | Path |
|----------|------|
| **Windows** | `C:\Users\<user>\AppData\Roaming\anythingllm-desktop\storage` |
| **Mac** | `/Users/<user>/Library/Application Support/anythingllm-desktop/storage` |
| **Linux** | `~/.config/anythingllm-desktop/storage/` |
| **Docker** | Configurable via `STORAGE_DIR` env variable |

### Storage Structure

```
storage/
├── lancedb/          # Vector database (LanceDB default)
├── documents/        # Parsed document content
├── vector-cache/     # Cached embeddings (hashed filenames)
├── models/           # Local LLMs/Embedder models
├── anythingllm.db    # SQLite metadata database
├── plugins/          # Custom agent skills
└── direct-uploads/   # Chat attachments
```

### File Manager Limitations & Workarounds

| Limitation | Workaround |
|------------|------------|
| **3GB file size limit** | Split documents, use external refs |
| **No folder sync** | Use API + automation scripts |
| **Single-user LanceDB** | Switch to Qdrant/Chroma for teams |
| **No auto-watching** | Use API polling or webhooks |

### Qdrant Integration (You Have This!)

You mentioned Qdrant is installed. Here's how to connect it:

```yaml
# docker-compose.yml for Qdrant
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage
```

**In AnythingLLM:**
1. Settings → Vector Database
2. Select "Qdrant"
3. Set URL: `http://localhost:6333`
4. Test Connection → Save

### Document Processing Pipeline

```
Upload → Parse (Tika/OCR) → Chunk → Embed → Store → Query
```

- **Chunking**: Configurable size/overlap in settings
- **Embedding**: Uses selected embedder model
- **Retrieval**: Cosine similarity on query vector

---

## Learning Resources & Videos

### Official Resources

| Resource | Link |
|----------|------|
| **Documentation** | https://useanything.com/docs |
| **GitHub** | https://github.com/Mintplex-Labs/anything-llm |
| **Discord** | https://useanything.com/discord |
| **Download** | https://useanything.com/download |

### Top YouTube Channels

| Channel | Focus | Why Watch |
|---------|-------|-----------|
| **All About AI (Jordan Wilson)** | Lead Tech Reviewer | Best source for AnythingLLM updates |
| **NetworkChuck** | Infrastructure | Docker deployment, home servers |
| **Onoma** | Agent Workflows | MCP implementation tutorials |

### Key Videos

- **Mastering @agent & MCP**: https://www.youtube.com/watch?v=Wjrdr0NU4Sk
- **Private Vector DBs**: https://www.youtube.com/watch?v=Mv9N6Yn_R-o
- **Search**: `anythingllm mcp tutorial` on YouTube

---

## Team Sharing & Multi-User Setup

### Docker Deployment for Teams

```yaml
version: '3.8'
services:
  anythingllm:
    image: mintplexlabs/anythingllm:latest
    container_name: anythingllm-team
    ports:
      - "3001:3001"
    volumes:
      - anythingllm-storage:/app/server/storage
    environment:
      - SERVER_PORT=3001
      - STORAGE_DIR=/app/server/storage
      - JWT_SECRET=change-this-to-32-char-random-string
      - AUTH_TOKEN=change-this-to-32-char-random-string
      - LLM_PROVIDER=ollama
      - OLLAMA_BASE_PATH=http://host.docker.internal:11434
      - OLLAMA_MODEL_PREF=qwen2.5:7b
      - VECTOR_DB=qdrant
      - QDRANT_ENDPOINT=http://qdrant:6333
    restart: unless-stopped
    
  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant-storage:/qdrant/storage
    ports:
      - "6333:6333"

volumes:
  anythingllm-storage:
  qdrant-storage:
```

### Network Access

| Setup | URL |
|-------|-----|
| Local | `http://localhost:3001` |
| Network | `http://<server-ip>:3001` |
| With Domain | Use Nginx reverse proxy |

### Security Checklist

- [ ] Change JWT_SECRET (32+ chars)
- [ ] Set AUTH_TOKEN
- [ ] Disable signups after setup: `DISABLE_SIGNUPS=true`
- [ ] Use HTTPS in production
- [ ] Regular backups of storage folder

### API Endpoints for Integration

```bash
# Upload document
curl -X POST http://localhost:3001/api/v1/document/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"

# Chat with workspace
curl -X POST http://localhost:3001/api/v1/workspace/my-workspace/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize documents"}'
```

---

## AppFlowy Integration

### Current Limitations

- AppFlowy does NOT have a public REST API for document creation
- No native webhooks for automatic triggers
- Requires workarounds for LLM integration

### Recommended Integration Pattern

```
AnythingLLM Chat → Export Markdown → Import to AppFlowy
```

### Option 1: Manual Export (Simplest)

1. In AnythingLLM: Copy chat output
2. Paste into markdown file
3. Drag into AppFlowy

### Option 2: File-Based Automation

```python
# save_chat_to_appflowy.py
import os
import json
from datetime import datetime

CHAT_EXPORT_DIR = "C:/Users/You/AppFlowy/Chat-Imports"

def save_chat(chat_content, title="Chat Session"):
    filename = f"{datetime.now().strftime('%Y-%m-%d_%H-%M')}_{title}.md"
    filepath = os.path.join(CHAT_EXPORT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"# {title}\n\n{chat_content}")
    
    print(f"Saved to: {filepath}")
    # Drag this file into AppFlowy
```

### Option 3: Advanced (Database Integration)

AppFlowy stores data in:
- SQLite database (`collab_db_path`)
- Collab/Yrs CRDT format

**Warning**: Requires modifying AppFlowy's Rust codebase (advanced).

Reference files in your workspace:
- `appflowy-date-integration.py` - Template pattern
- `APPFLOWY-WEBSEARCH-COMPLETE.md` - Modification guide

---

## Quick Reference Commands

### Start Qdrant
```bash
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
```

### Start AnythingLLM (Docker)
```bash
docker run -d --name anythingllm \
  -p 3001:3001 \
  -v anythingllm-storage:/app/server/storage \
  -e JWT_SECRET="your-secret-key-32-chars-long" \
  mintplexlabs/anythingllm:latest
```

### Backup Storage
```bash
# Windows
tar -czf anythingllm-backup-%date%.tar.gz "C:\Users\%USERNAME%\AppData\Roaming\anythingllm-desktop\storage"

# Linux/Mac
tar -czf anythingllm-backup-$(date +%Y%m%d).tar.gz ~/.config/anythingllm-desktop/storage/
```

---

## Next Steps

1. ✅ Set up Qwen 3.5 with Ollama or OpenRouter
2. ✅ Enable @agent and test web search
3. ✅ Connect your Qdrant instance
4. ✅ Configure MCP servers (Brave/Tavily search recommended)
5. ✅ Set up team Docker deployment if needed
6. ✅ Create AppFlowy export workflow

---

*Generated from workspace research - March 9, 2026*

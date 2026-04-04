# NotebookLM ↔ AnythingLLM Integration Guide

Complete guide for integrating Google NotebookLM with AnythingLLM for seamless knowledge management and AI-powered workflows.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [MCP Server Setup](#mcp-server-setup)
7. [Workflow Examples](#workflow-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This integration enables bi-directional data flow between:

- **Google NotebookLM**: AI-powered research assistant for documents, YouTube videos, and web content
- **AnythingLLM**: Self-hosted document chat platform with RAG capabilities

### Key Features

✅ **Export NotebookLM sources** to AnythingLLM workspaces  
✅ **Generate content** (audio, video, quizzes) and sync to AnythingLLM  
✅ **Chat with notebooks** via AnythingLLM's interface  
✅ **MCP Server** for native AnythingLLM agent integration  
✅ **Batch operations** for syncing multiple notebooks  

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Google         │◄───────►│  notebooklm-py   │◄───────►│  AnythingLLM    │
│  NotebookLM     │  API    │  (Python Client) │  Files  │  (Workspace)    │
│                 │         │                  │         │                 │
│ • Notebooks     │         │ • Export sources │         │ • Documents     │
│ • Sources       │         │ • Generate audio │         │ • Chat          │
│ • Audio/Video   │         │ • MCP server     │         │ • RAG queries   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  MCP Protocol    │
                            │  (Agent Tools)   │
                            └──────────────────┘
```

---

## Installation

### Prerequisites

- Python 3.9+
- WSL (Windows) or Linux/macOS
- AnythingLLM instance (local or cloud)

### Quick Install

```bash
# Clone or navigate to vidismart directory
cd /mnt/m/code/vidismart

# Run the setup script
chmod +x notebooklm-setup.sh
./notebooklm-setup.sh
```

### Manual Installation

```bash
# 1. Create virtual environment
python3 -m venv venv-notebooklm
source venv-notebooklm/bin/activate

# 2. Install notebooklm-py with browser support
pip install "notebooklm-py[browser]" playwright

# 3. Install browser
playwright install chromium

# 4. Authenticate with NotebookLM
notebooklm login

# 5. Make scripts executable
chmod +x notebooklm-anythingllm-bridge.py notebooklm-mcp-server.py
```

---

## Configuration

### 1. NotebookLM Authentication

The first time you use the integration, you need to authenticate:

```bash
source venv-notebooklm/bin/activate
notebooklm login
```

This opens a browser for Google authentication. Credentials are stored securely in `~/.notebooklm/credentials.json`.

### 2. Bridge Configuration

Edit `~/.notebooklm-anythingllm-config.json`:

```json
{
  "anythingllm": {
    "api_url": "http://localhost:3001",
    "api_key": "your-api-key-here",
    "default_workspace": "notebooklm-imports"
  },
  "notebooklm": {
    "default_notebook": null,
    "auto_sync": false,
    "sync_interval": 3600
  },
  "sync": {
    "include_audio": true,
    "include_sources": true,
    "include_chat": false,
    "export_format": "markdown"
  }
}
```

### 3. Environment Variables

Add to your `.bashrc` or `.env`:

```bash
export ANYTHINGLLM_URL="http://localhost:3001"
export ANYTHINGLLM_API_KEY="your-key-here"
export NOTEBOOKLM_STORAGE_PATH="~/.notebooklm"
```

---

## Usage

### Command-Line Interface

#### List Notebooks
```bash
./notebooklm-bridge list
```

**Output:**
```
ID                                       Title                                    Sources
----------------------------------------------------------------------------------------------------------
cd055581-6124-4999-ae44-af6289aabe99    AI Research 2026                         15
abc123...                                Project Documentation                    8
```

#### Export a Notebook
```bash
./notebooklm-bridge export <notebook_id> --workspace "my-workspace"
```

This exports:
- All source documents (as Markdown)
- Notebook metadata (JSON)
- Summary document

#### Sync All Notebooks
```bash
./notebooklm-bridge sync
```

Exports all notebooks to `/tmp/notebooklm_export_*` directories.

#### Chat with Notebook
```bash
./notebooklm-bridge chat <notebook_id> "What are the key findings?"
```

#### Generate Audio Overview
```bash
./notebooklm-bridge audio <notebook_id> --instructions "make it engaging"
```

Downloads the generated MP3 to `/tmp/`.

---

## MCP Server Setup

### Add MCP Server to AnythingLLM

1. **Open AnythingLLM Settings**
   - Navigate to Settings → MCP Servers

2. **Add New Server**
   ```json
   {
     "mcpServers": {
       "notebooklm": {
         "command": "bash",
         "args": [
           "-c",
           "cd /mnt/m/code/vidismart && source venv-notebooklm/bin/activate && python3 notebooklm-mcp-server.py"
         ],
         "description": "NotebookLM integration for AnythingLLM",
         "env": {
           "PYTHONUNBUFFERED": "1"
         }
       }
     }
   }
   ```

3. **Save and Restart** AnythingLLM

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `notebooklm_list_notebooks` | List all your NotebookLM notebooks |
| `notebooklm_get_sources` | Get sources from a specific notebook |
| `notebooklm_add_source` | Add a URL to a notebook |
| `notebooklm_chat` | Ask questions to a notebook |
| `notebooklm_generate_audio` | Create Audio Overview (podcast) |
| `notebooklm_generate_video` | Create Video Overview |
| `notebooklm_generate_quiz` | Generate quiz from content |
| `notebooklm_create_notebook` | Create a new notebook |
| `notebooklm_export_to_anythingllm` | Export to AnythingLLM format |

### Using MCP Tools in AnythingLLM

Once configured, use natural language:

```
"List my NotebookLM notebooks"
"Export my AI Research notebook to AnythingLLM"
"Generate an audio overview of the quantum computing notebook"
"Create a quiz from my project documentation"
```

---

## Workflow Examples

### Workflow 1: Research → Audio → Chat

1. **Add sources to NotebookLM** (web, PDFs, YouTube)
2. **Generate Audio Overview** via MCP:
   ```
   @agent Generate audio overview of notebook abc123 with "engaging and casual tone"
   ```
3. **Export to AnythingLLM**:
   ```
   @agent Export notebook abc123 to workspace "research-2026"
   ```
4. **Chat with documents** in AnythingLLM

### Workflow 2: Batch Content Creation

```bash
# Sync all notebooks
./notebooklm-bridge sync

# Generate audio for specific notebooks
for notebook_id in "id1" "id2" "id3"; do
    ./notebooklm-bridge audio "$notebook_id"
done

# Import into AnythingLLM workspace
```

### Workflow 3: Automated Research Pipeline

```python
# research_pipeline.py
import asyncio
from notebooklm_anythingllm_bridge import NotebookLMAnythingLLMBridge

async def research_pipeline(topic: str):
    bridge = NotebookLMAnythingLLMBridge()
    
    # Create notebook
    client = await bridge.get_client()
    notebook = await client.notebooks.create(f"Research: {topic}")
    
    # Add sources
    urls = [
        f"https://en.wikipedia.org/wiki/{topic}",
        f"https://scholar.google.com/scholar?q={topic}",
        # ... more sources
    ]
    for url in urls:
        await client.sources.add_url(notebook.id, url)
    
    # Generate content
    await client.artifacts.generate_audio(notebook.id)
    await client.artifacts.generate_quiz(notebook.id)
    
    # Export to AnythingLLM
    await bridge.export_notebook_to_anythingllm(notebook.id)
    
    return notebook.id

asyncio.run(research_pipeline("Quantum Computing"))
```

---

## Troubleshooting

### Authentication Issues

**Problem:** `Failed to initialize NotebookLM client`

**Solution:**
```bash
source venv-notebooklm/bin/activate
notebooklm login
# Follow browser authentication
```

### Playwright Browser Not Found

**Problem:** `Executable doesn't exist` error

**Solution:**
```bash
source venv-notebooklm/bin/activate
playwright install chromium
```

### MCP Server Not Connecting

**Problem:** AnythingLLM can't connect to MCP server

**Solutions:**
1. Check Python path: `which python3`
2. Verify virtual environment activation
3. Check logs: `tail -f ~/.anythingllm/logs/mcp.log`
4. Test manually: `./notebooklm-mcp`

### Rate Limiting

**Problem:** `429 Too Many Requests`

**Solution:**
- Add delays between requests
- Use batch operations sparingly
- Consider upgrading NotebookLM plan

### Export Directory Issues

**Problem:** Permission denied on `/tmp/`

**Solution:**
```bash
# Change export directory in config
mkdir -p ~/notebooklm-exports
# Update config.json export_path
```

---

## Advanced Configuration

### Custom Export Templates

Modify export format by editing `notebooklm-anythingllm-bridge.py`:

```python
# In export_notebook_to_anythingllm()
summary = f"""# Custom Header

## {notebook.title}

Exported: {datetime.now().isoformat()}

<!-- Your custom template here -->
"""
```

### Webhook Integration

For automatic syncing, add webhook endpoint:

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook/notebooklm', methods=['POST'])
async def webhook():
    data = request.json
    notebook_id = data['notebook_id']
    
    bridge = NotebookLMAnythingLLMBridge()
    await bridge.export_notebook_to_anythingllm(notebook_id)
    
    return {'status': 'exported'}
```

---

## API Reference

### Python API

```python
from notebooklm_anythingllm_bridge import NotebookLMAnythingLLMBridge

bridge = NotebookLMAnythingLLMBridge()

# List notebooks
notebooks = await bridge.list_notebooks()

# Export
path = await bridge.export_notebook_to_anythingllm("notebook_id")

# Chat
answer = await bridge.chat_with_notebook("notebook_id", "question")

# Generate audio
audio_path = await bridge.generate_and_export_audio("notebook_id")
```

### CLI Reference

| Command | Description |
|---------|-------------|
| `list` | List all notebooks |
| `export <id>` | Export notebook |
| `sync [--notebook <id>]` | Sync notebooks |
| `chat <id> <question>` | Ask question |
| `audio <id> [--instructions]` | Generate audio |
| `setup` | Configuration help |

---

## Resources

- [notebooklm-py Documentation](https://github.com/teng-lin/notebooklm-py)
- [AnythingLLM MCP Guide](https://docs.anythingllm.com/mcp)
- [NotebookLM Help](https://support.google.com/notebooklm)

---

**Last Updated:** March 10, 2026  
**Version:** 1.0.0  
**Maintainer:** VidiSmart AI Team

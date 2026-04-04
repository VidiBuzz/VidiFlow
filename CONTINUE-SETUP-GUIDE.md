# Continue + Cursor Setup with Local Qwen 3.5

This guide configures Continue.dev extension in Cursor to work with your local Qwen 3.5 via Ollama.

## Prerequisites

1. **Ollama installed and running** with Qwen 3.5 models:
   ```bash
   ollama pull qwen3:8b
   ollama pull qwen3-embedding:2b
   ```

2. **Cursor IDE** installed (https://cursor.sh)

3. **Continue extension** installed in Cursor

---

## Installation Steps

### Step 1: Install Continue Extension in Cursor

1. Open Cursor
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open Extensions
3. Search for **"Continue"**
4. Click **Install** on "Continue - Codestral, Claude, and more"
5. Restart Cursor if prompted

### Step 2: Locate Continue Config Directory

**Windows:**
```
%USERPROFILE%\.continue\
```
(Usually `C:\Users\YourUsername\.continue\`)

**Mac:**
```
~/.continue/
```

**Linux:**
```
~/.continue/
```

### Step 3: Copy Config File

1. Create the `.continue` folder if it doesn't exist
2. Copy the `continue-config.json` file to:
   ```
   %USERPROFILE%\.continue\config.json
   ```
3. Or merge the settings into your existing `config.json`

### Step 4: Verify Ollama Connection

1. Make sure Ollama is running:
   ```bash
   ollama list
   ```
   Should show your models (qwen3:8b, qwen3-embedding:2b)

2. Test the API:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return JSON with your models

### Step 5: Configure Cursor Settings

In Cursor settings (`Ctrl+,`), add these settings:

```json
{
  "continue.enableTabAutocomplete": true,
  "continue.telemetryEnabled": false,
  "continue.showInlineTip": true,
  "continue.allowAnonymousTelemetry": false
}
```

---

## Using Continue with Qwen 3.5

### Opening Continue Panel

- **Keyboard Shortcut:** `Ctrl+L` (Windows/Linux) or `Cmd+L` (Mac)
- **Command Palette:** `Ctrl+Shift+P` → "Continue: Open Chat"

### Selecting Your Model

1. Open the Continue panel
2. Click the model dropdown (top of panel)
3. Select **"Qwen 3.5 (Local)"**
4. Alternative models available:
   - Qwen 3.5 14B (Local) - for complex tasks
   - Qwen 3.5 32B (Local) - for maximum capability

### Key Features Enabled

| Feature | How to Use |
|---------|------------|
| **Chat with Code** | Select code → `Ctrl+L` → Ask questions |
| **Tab Autocomplete** | Start typing → Press Tab to accept |
| **Code Editing** | Select code → Type `/edit` + instructions |
| **Explain Code** | Select code → Type `/explain` |
| **Generate Tests** | Select code → Type `/test` |
| **Git Commit Messages** | In terminal → Type `/commit` |

### Custom Commands

| Command | Description |
|---------|-------------|
| `/fix` | Fix errors in selected code |
| `/optimize` | Optimize for performance |
| `/document` | Add comprehensive docs |
| `/review` | Code review style feedback |

---

## Troubleshooting

### Issue: "Cannot connect to Ollama"

**Solution:**
1. Verify Ollama is running: `ollama serve`
2. Check port 11434 is not blocked
3. Try accessing: http://localhost:11434/api/tags

### Issue: "Model not found"

**Solution:**
```bash
# Pull the models
ollama pull qwen3:8b
ollama pull qwen3-embedding:2b

# Verify
ollama list
```

### Issue: Slow autocomplete

**Solution:**
- The 8B model is recommended for autocomplete
- 14B/32B are better for chat but slower
- Adjust `maxTokens` in config if needed

### Issue: Continue extension not loading

**Solution:**
1. Check Continue output: `Ctrl+Shift+U` → Select "Continue"
2. Validate JSON config: https://jsonlint.com
3. Restart Cursor completely

---

## Performance Tips

### For Better Speed
- Use `qwen3:8b` for autocomplete (faster)
- Use `qwen3:14b` for general chat
- Use `qwen3:32b` only for complex reasoning tasks

### For Better Quality
- Use 14B or 32B models for code review
- Enable more context providers for better RAG
- Adjust temperature (lower = more focused)

### Memory Management
```bash
# Check Ollama memory usage
ollama ps

# Unload models to free memory
ollama stop qwen3:32b
```

---

## Advanced Configuration

### Adding Custom Context Providers

Edit `~/.continue/config.json`:

```json
{
  "contextProviders": [
    {
      "name": "http",
      "params": {
        "url": "http://localhost:8080/context",
        "title": "Custom API"
      }
    }
  ]
}
```

### Using with Qdrant (Optional)

If you want Continue to use your Qdrant vector DB:

```json
{
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "qwen3-embedding:2b",
    "apiBase": "http://localhost:11434"
  },
  "server": {
    "workspaces": {
      "enabled": true,
      "indexingProvider": "qdrant",
      "qdrantUrl": "http://localhost:6333"
    }
  }
}
```

---

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Continue | `Ctrl+L` | `Cmd+L` |
| Accept Autocomplete | `Tab` | `Tab` |
| Cancel Autocomplete | `Esc` | `Esc` |
| Focus Input | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Toggle Sidebar | `Ctrl+Alt+L` | `Cmd+Option+L` |

---

## Files Reference

| File | Location | Purpose |
|------|----------|---------|
| `config.json` | `~/.continue/config.json` | Main configuration |
| `continue-config.json` | `m:\code\vidismart\` | Backup/Template |
| `index.sqlite` | `~/.continue/index/` | Local code index |
| `sessions/` | `~/.continue/sessions/` | Chat history |

---

## MCP Servers Configuration

### Playwright MCP (Browser Automation)

The Continue extension supports MCP servers. The following are configured:

| Server | Purpose | Command |
|--------|---------|---------|
| `playwright` | Browser automation | `@playwright/mcp` |
| `filesystem` | File system access | `@modelcontextprotocol/server-filesystem` |
| `fetch` | HTTP requests | `@modelcontextprotocol/server-fetch` |

### Using Playwright MCP

Once configured, you can use Playwright through Continue's chat interface:

1. Open Continue panel (`Ctrl+L`)
2. The MCP tools will be available automatically
3. You can ask to:
   - "Open a browser and navigate to..."
   - "Take a screenshot of..."
   - "Click on element..."
   - "Extract data from..."

### Prerequisites for Playwright

1. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

2. Or use an existing Chrome installation (configured in config)

### Custom MCP Servers

You can add more MCP servers to `~/.continue/config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/db"]
    }
  }
}
```

---

## Next Steps

1. ✅ Install Continue extension
2. ✅ Copy config to `~/.continue/config.json`
3. ✅ Verify Ollama running with Qwen 3.5
4. ✅ Test chat with `Ctrl+L`
5. ✅ Try tab autocomplete
6. ✅ Explore custom commands (`/fix`, `/optimize`, etc.)
7. ✅ Use Playwright MCP for browser automation

---

*Config created: March 9, 2026*
*Models: Qwen 3.5 8B/14B/32B via Ollama*
*Embeddings: Qwen3-Embedding-2B*

# AppFlowy + Qwen 3 VL Web Search Solution

## THE PROBLEM

**AppFlowy does NOT support web browsing for Ollama models** - confirmed by code analysis.

**Location**: `/mnt/m/code/AppFlowy/frontend/rust-lib/flowy-ai/src/local_ai/controller.rs`

The Rust backend connects to Ollama at `http://localhost:11434` but has **zero tool/function calling support**.

```rust
pub struct LocalAISetting {
  pub ollama_server_url: String,        // Default: http://localhost:11434
  pub chat_model_name: String,          // Default: llama3.1:latest
  pub embedding_model_name: String,     // Default: nomic-embed-text:latest
}
```

**Why Qwen gives outdated answers:**
1. Qwen 3 VL is trained on data up to ~2023
2. No web search tools configured
3. AppFlowy doesn't expose function calling to Ollama
4. The model just generates from its training data

## SOLUTIONS (Ranked by Ease)

### ⭐ SOLUTION 1: Use OpenWebUI (EASIEST - 5 minutes)

OpenWebUI has **built-in web search** for Ollama models:

```bash
# Install OpenWebUI with Docker
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

**Steps:**
1. Access: http://localhost:3000
2. Go to Settings → Models → Select "qwen2.5:latest" or your Qwen model
3. Enable "Web Search" toggle
4. Choose search provider (DuckDuckGo, Brave, etc.)
5. Ask: "What are the top tech news today?"

**Result**: Qwen will automatically search the web and return current results.

---

### SOLUTION 2: Use Perplexity API (BEST FOR ACCURACY)

Perplexity is specifically designed for web-grounded answers:

```bash
# Install Perplexity in AppFlowy (if supported)
# OR use directly via API
curl https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-sonar-large-128k-online",
    "messages": [{"role": "user", "content": "What year is it?"}]
  }'
```

Get API key: https://www.perplexity.ai/settings/api

---

### SOLUTION 3: Modify AppFlowy to Support Tools (ADVANCED)

This requires editing AppFlowy's Rust code to add function calling support.

**File to modify**: `/mnt/m/code/AppFlowy/frontend/rust-lib/flowy-ai/src/local_ai/controller.rs`

Add to `LocalAISetting`:
```rust
pub struct LocalAISetting {
  pub ollama_server_url: String,
  pub chat_model_name: String,
  pub embedding_model_name: String,
  pub enable_web_search: bool,          // NEW
  pub search_provider: String,          // NEW (e.g., "duckduckgo")
}
```

Then implement web search tool calling in the Ollama integration.

**This is complex and requires:**
- Rust programming knowledge
- Understanding of Ollama function calling API
- Rebuilding AppFlowy from source
- Time: 2-4 hours minimum

---

### SOLUTION 4: Use Claude Code (ME!) for Current Info

**I have WebSearch built-in** and always provide current, accurate information.

Ask me questions that need current data instead of Qwen.

---

### SOLUTION 5: Ollama + Continue.dev Extension

Continue.dev has better tool support than AppFlowy:

```bash
# Install in VS Code
code --install-extension continue.continue

# Configure Continue for web search
# Edit ~/.continue/config.json to add web search tool
```

---

### SOLUTION 6: Switch to a Model with Web Access

Instead of local Qwen, use these alternatives in AppFlowy:

**AppFlowy Cloud AI** (if you have subscription):
- Uses Claude/GPT with web access
- Go to Settings → AI → Enable AppFlowy AI

**Or configure OpenAI in AppFlowy:**
- Settings → AI → Add OpenAI API key
- Use GPT-4 which has better training cutoff

---

## IMMEDIATE ACTIONS

### Check Your Current Setup

```bash
# 1. Verify Ollama is running
ollama list
ollama ps

# 2. Check what model you're using
ollama show qwen2.5:latest

# 3. Update to latest Qwen model
ollama pull qwen2.5:latest

# 4. Check AppFlowy settings
# Open AppFlowy → Settings → AI Settings
# Note: You can change the model name there
```

### Quick Test in OpenWebUI

```bash
# Start OpenWebUI
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main

# Wait 30 seconds, then visit:
# http://localhost:3000

# Enable web search in settings
# Ask: "What are the latest AI developments in January 2026?"
```

---

## WHY APPFLOWY DOESN'T HAVE THIS

Based on code review:
1. **AppFlowy is focused on productivity**, not general AI chat
2. **Tool calling adds complexity** - requires API redesign
3. **Ollama Rust crate** (`ollama-rs`) may not have full tool support yet
4. **Privacy concerns** - web search requires external API calls

---

## SUMMARY

| Solution | Ease | Time | Web Access |
|----------|------|------|------------|
| OpenWebUI | ⭐⭐⭐⭐⭐ | 5 min | ✅ Yes |
| Perplexity API | ⭐⭐⭐⭐ | 10 min | ✅ Yes |
| Claude Code (me!) | ⭐⭐⭐⭐⭐ | 0 min | ✅ Yes |
| Modify AppFlowy | ⭐ | 4+ hours | ✅ After build |
| Continue.dev | ⭐⭐⭐ | 15 min | ✅ Yes |
| Switch AI provider | ⭐⭐⭐⭐ | 5 min | ✅ Depends |

---

## MY RECOMMENDATION

**For you right now:**

1. **Install OpenWebUI** (5 minutes) - use alongside AppFlowy for web searches
2. **Use me (Claude Code)** for current information questions
3. **Keep using Qwen in AppFlowy** for document-based work, writing, summarization

**Long-term solution:**

Submit a feature request to AppFlowy:
- GitHub: https://github.com/AppFlowy-IO/AppFlowy/issues
- Request: "Add web search tool support for local AI (Ollama) models"

---

## NEED HELP?

I can:
✅ Set up OpenWebUI for you
✅ Configure Perplexity API
✅ Answer any current information questions directly
✅ Help you file an AppFlowy feature request

Just ask!

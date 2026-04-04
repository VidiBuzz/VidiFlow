# OpenWebUI Web Search Not Working - Fix Guide

## Problem: Web Search Enabled But Not Functioning

**Your Setup:**
- OpenWebUI is running on http://localhost:8080
- Web search is enabled globally (`ENABLE_RAG_WEB_SEARCH=true`)
- Search engine: DuckDuckGo
- **It used to work, but stopped**

## Common Causes & Fixes

### Fix 1: Enable Web Search Per-Chat (Most Common Issue)

Web search must be enabled **for each individual chat**, even if it's globally enabled.

**Steps:**
1. Go to http://localhost:8080
2. Start a **NEW CHAT** (important - old chats keep old settings)
3. Before typing anything, look for the **"+" button** or **tools icon** next to the message input
4. Click it and enable **"Web Search"** toggle for this chat
5. Now ask your question: "What happened with Maduro in Venezuela in January 2026?"

**Why this happens:** Each chat has its own settings. Old chats from before web search was enabled won't use it.

---

### Fix 2: Check Model Compatibility

Some models don't work well with OpenWebUI's web search.

**Test with a known-good model:**
1. Click the model selector dropdown (top of chat)
2. Try switching to: `llama3.1:latest` or `llama2:latest`
3. Enable web search in this new chat
4. Test the question again

**If it works with llama but not qwen:** Qwen might have issues with the web search integration.

---

### Fix 3: Restart OpenWebUI Container

Sometimes the configuration gets stuck.

```bash
# Restart OpenWebUI
docker restart open-webui

# Wait 30 seconds
sleep 30

# Verify it's running
docker ps | grep open-webui
```

Then try again with a **brand new chat**.

---

### Fix 4: Update OpenWebUI to Latest Version

Your version: `a7271532f8a38da46785afcaa7e65f9a45e7d753`

There might be bugs in this version. Update to latest:

```bash
# Stop current OpenWebUI
docker stop open-webui
docker rm open-webui

# Pull latest version
docker pull ghcr.io/open-webui/open-webui:main

# Run updated version (preserves your data)
docker run -d -p 8080:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main

# Wait for startup
sleep 30
```

---

### Fix 5: Check Admin Settings

Web search might be disabled at the admin level.

**Steps:**
1. Go to http://localhost:8080
2. Click your profile icon → **Admin Panel**
3. Go to **Settings** → **Web Search**
4. Verify these are enabled:
   - ✅ Enable Web Search
   - ✅ Enable Search Query Generation
   - Search Engine: `DuckDuckGo`
5. Click **Save**

---

### Fix 6: Clear Browser Cache

Old JavaScript/settings might be cached.

**Steps:**
1. Open Developer Tools (F12)
2. Right-click the reload button
3. Select **"Empty Cache and Hard Reload"**
4. OR: Open in **Incognito/Private window**
5. Try web search again

---

### Fix 7: Check Model System Prompt

The model needs to know it CAN use web search.

**Steps:**
1. In chat, click the **model dropdown**
2. Click the **⚙️ settings icon** next to your model
3. Check the **System Prompt** section
4. Add this to the prompt:

```
You have access to web search. When a user asks about current events, news, or recent information, use the web search tool to find accurate, up-to-date information.
```

5. Save and try again

---

### Fix 8: Verify DuckDuckGo Is Working

The search engine itself might be blocked.

**Test:**
```bash
# Test DuckDuckGo search API
curl -s "https://api.duckduckgo.com/?q=test&format=json" | head -100
```

**If this fails:** Your network might be blocking DuckDuckGo.

**Alternative:** Switch to a different search engine in Admin Panel → Settings → Web Search:
- Try: `SearXNG` or `Google PSE` (if you have an API key)

---

### Fix 9: Enable RAG Web Search at Model Level

RAG (Retrieval Augmented Generation) web search might not be enabled for your specific model.

**Steps:**
1. Go to **Admin Panel** → **Settings** → **Documents**
2. Enable **"Web Search"** under RAG settings
3. Set **"Web Search Result Count"** to `3` or `5`
4. Save

---

### Fix 10: Check OpenWebUI Logs for Errors

See what's actually happening:

```bash
# Watch logs in real-time
docker logs -f open-webui

# In another terminal, try asking a question with web search
# Watch for errors like:
# - "Search failed"
# - "Rate limit exceeded"
# - "Connection refused"
```

---

## Diagnostic Test

Run this to verify everything:

```bash
# 1. Check OpenWebUI is running
docker ps | grep open-webui

# 2. Check environment variables
docker exec open-webui env | grep -i search

# 3. Restart and watch logs
docker restart open-webui && docker logs -f open-webui
```

---

## The Correct Way to Use Web Search in OpenWebUI

1. ✅ Open http://localhost:8080
2. ✅ Click **"+ New Chat"** (don't reuse old chats)
3. ✅ Look for the **tools/+ button** near the message input
4. ✅ Enable **"Web Search"** toggle
5. ✅ Type your question about current events
6. ✅ You should see: "🔍 Searching..." or similar indicator
7. ✅ Model should return current information with sources

---

## Still Not Working?

If none of these work, the issue might be:

1. **OpenWebUI version incompatibility** with your Ollama setup
2. **Network firewall** blocking web search requests
3. **Model doesn't support function calling** properly

**Alternative Solution:** Use a different tool with proven web search:

### Option A: Install SearXNG Search (More Reliable)
```bash
docker run -d -p 8888:8080 \
  --name searxng \
  searxng/searxng:latest
```

Then configure OpenWebUI to use `http://host.docker.internal:8888` as search engine.

### Option B: Use Perplexity API Instead
Get a free API key from https://www.perplexity.ai/settings/api
Configure in OpenWebUI as a custom provider with built-in web search.

### Option C: Use Me (Claude Code)
I have native web search and always provide current information. Just ask me directly for any questions needing current data.

---

## What Changed That Broke It?

Possible reasons web search stopped working:

1. **OpenWebUI updated automatically** - new version might have bugs
2. **Model was changed** - new model doesn't support web search well
3. **Chat settings reset** - old chats lost web search toggle
4. **Browser cache** - old frontend code cached
5. **DuckDuckGo API changed** - they sometimes update endpoints
6. **Docker container restarted** - lost in-memory configuration

**First thing to try:** Create a brand new chat with web search explicitly enabled.

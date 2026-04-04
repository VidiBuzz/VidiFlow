# LM Studio + VS Code Setup Guide

Fix Continue context filling too fast by using LM Studio instead of Ollama.

## The Problem

Continue with Ollama fills context quickly because:
1. Ollama's API isn't optimized for chat context management
2. Default context providers load too much context
3. Indexing can cause repeated context injection

## The Solution

Use LM Studio which provides:
- Better OpenAI-compatible API
- More efficient context handling
- Built-in server mode for IDE integration

---

## Step 1: Setup LM Studio

### 1.1 Download and Install LM Studio

1. Download from: https://lmstudio.ai/
2. Install and launch LM Studio
3. Download Qwen 3.5 model (look for `qwen3-8b-q4_k_m` or similar)

### 1.2 Start LM Studio Server

**Option A: Built-in Server (Recommended)**

1. In LM Studio, click the **"Server"** tab (or look for server icon)
2. Select your model from the dropdown
3. Click **"Start Server"**
4. Should show: `Server running at http://localhost:1234/v1`

**Option B: Manual CLI**

```bash
# In LM Studio, click the chat tab, load your model
# Then in a terminal:
curl http://localhost:1234/v1/models
```

### 1.3 Verify LM Studio is Running

```bash
curl http://localhost:1234/v1/models
```

Should return JSON with your loaded model.

---

## Step 2: Configure Continue for LM Studio

### 2.1 Copy the Config File

The new config `lm-studio-continue-config.json` in this folder uses:
- **Provider**: OpenAI (LM Studio compatible)
- **Port**: 1234 (LM Studio default)
- **Reduced context**: `nRetrieve: 15` → `3` (fixes context bloat)

**Copy to your Continue config location:**

```
Windows: %USERPROFILE%\.continue\config.json
Mac/Linux: ~/.continue/config.json
```

### 2.2 Key Changes from Ollama Config

| Setting | Ollama (Old) | LM Studio (New) |
|---------|--------------|-----------------|
| provider | `ollama` | `openai` |
| apiBase | `http://localhost:11434` | `http://localhost:1234/v1` |
| apiKey | (none) | `not-needed` |
| context retrieval | 25→5 | 15→3 |

### 2.3 Restart Continue

1. Close and reopen VS Code
2. Or press `Ctrl+Shift+P` → "Continue: Restart Core"

---

## Step 3: Test the Connection

1. Open Continue panel: `Ctrl+L`
2. Click the model dropdown
3. Select "Qwen 3.5 (Local - LM Studio)"
4. Ask a simple question

**If it doesn't connect:**
- Make sure LM Studio server is running
- Check port 1234 is not blocked
- Verify with: `curl http://localhost:1234/v1/models`

---

## Step 4: If Continue Still Has Issues

### Option A: Disable Auto-Indexing (Recommended)

Add to your `config.json`:

```json
"server": {
  "workspaces": {
    "enabled": false,
    "autoIndex": false
  }
}
```

### Option B: Use Continue with Reduced Context

Edit the context providers:

```json
"contextProviders": [
  {
    "name": "codebase",
    "params": {
      "nRetrieve": 5,
      "nFinal": 1,
      "useReranking": false
    }
  }
]
```

### Option C: Switch to a Different Extension

If Continue still doesn't work, try these alternatives:

#### 1. CodeGPT (Recommended Alternative)

1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search "CodeGPT: AI Assistant"
3. Install it
4. Go to Settings → CodeGPT → API Configuration
5. Use "Custom Provider" with:
   - **API URL**: `http://localhost:1234/v1`
   - **Model**: `qwen3-8b-q4_k_m`
   - **API Key**: `not-needed`

#### 2. Tabby (Open Source)

1. Install "Tabby" extension from VS Code
2. Download Tabby from: https://tabby.tabbyml.com/
3. Run: `tabby serve --port 8080`
4. Configure VS Code extension to connect to port 8080

#### 3. Aider (CLI-Based)

```bash
# Install aider
pip install aider

# Run with LM Studio
aider --model openai/qwen3-8b-q4_k_m \
      --openai-api-base http://localhost:1234/v1 \
      --openai-api-key not-needed
```

#### 4. VS Code + OpenAI API (No Extension)

Use VS Code's built-in chat with a custom prompt:

1. Install "Prompt Labs" extension
2. Or use VS Code's built-in `Ctrl+K` for inline AI
3. Configure to call LM Studio via curl in settings

---

## Step 5: LM Studio Tips

### Maximize Performance

1. **Use the right model size:**
   - 8B: Fastest, good for autocomplete
   - 14B: Balanced for chat
   - 32B: Best quality, slowest

2. **Adjust context window:**
   - In LM Studio server settings, set `context length` lower
   - This forces the model to focus on recent messages

3. **GPU Acceleration:**
   - Make sure "GPU" is selected in LM Studio
   - Check Task Manager → GPU usage to confirm

### Troubleshooting LM Studio

| Issue | Solution |
|-------|----------|
| Port 1234 busy | Change in LM Studio settings |
| Model too slow | Use 8B model or enable GPU |
| No response | Check firewall, restart server |
| Context still fills | Reduce `maxTokens` in config |

---

## Quick Commands Reference

```bash
# Test LM Studio connection
curl http://localhost:1234/v1/models

# Test chat completion (replace model name)
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-8b-q4_k_m",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

---

## Files in This Setup

| File | Purpose |
|------|---------|
| `lm-studio-continue-config.json` | Updated Continue config for LM Studio |
| `LM-STUDIO-VSCODE-SETUP.md` | This guide |

---

## Summary

1. ✅ Start LM Studio and load Qwen 3.5
2. ✅ Click "Start Server" in LM Studio (port 1234)
3. ✅ Copy `lm-studio-continue-config.json` to `~/.continue/config.json`
4. ✅ Reduce context retrieval in Continue settings
5. ✅ Test and adjust as needed
6. ✅ If still failing, try CodeGPT or Tabby instead

---

*Created: March 10, 2026*
*For: Qwen 3.5 + LM Studio + VS Code*

# NVIDIA NIM Developer Cloud Configuration for VS Code

## Quick Setup Guide

### Option 1: VS Code with Continue Extension (Recommended for AI Coding)

1. **Install Continue Extension** in VS Code:
   - Open VS Code → Extensions → Search "Continue" → Install

2. **Configure Continue**:
   - Click Continue icon in sidebar → Config (JSON)
   - Add this configuration:

```json
{
  "models": [
    {
      "model": "moonshotai/kimi-k2.5",
      "provider": "openai",
      "api_key": "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",
      "base_url": "https://integrate.api.nvidia.com/v1"
    },
    {
      "model": "meta/llama-3.1-8b-instruct",
      "provider": "openai",
      "api_key": "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",
      "base_url": "https://integrate.api.nvidia.com/v1"
    }
  ]
}
```

3. **Set Environment Variable**:
   ```bash
   # Windows (PowerShell)
   $env:NVIDIA_API_KEY="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"
   
   # Windows (CMD)
   set NVIDIA_API_KEY=your-nvidia-api-key-here
   
   # Add to system permanently:
   [System.Environment]::SetEnvironmentVariable("NVIDIA_API_KEY", "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", "User")
   ```

---

### Option 2: VS Code with Cursor Settings

1. **Cursor** → **Settings** (gear) → **Cursor Settings** → **Models**
2. **OpenAI API Key:** paste your **NVIDIA API key**
3. **Override OpenAI Base URL:** **ON**
4. **Base URL:** `https://integrate.api.nvidia.com/v1`
5. **Add Model:** `moonshotai/kimi-k2.5` (or other NIM models)
6. Select it in the chat dropdown

---

### Option 3: Jan.ai (Local + Cloud Hybrid)

1. **Download Jan.ai**: https://jan.ai
2. **Add NVIDIA NIM as Remote Provider**:
   - Settings → Models → Add Model
   - API URL: `https://integrate.api.nvidia.com/v1`
   - Model ID: `moonshotai/kimi-k2.5` (or your preferred model)
   - API Key: Your NVIDIA API key

---

## Available NVIDIA NIM Models

Use these model IDs with the base URL `https://integrate.api.nvidia.com/v1`:

| Model ID | Description |
|----------|-------------|
| `moonshotai/kimi-k2.5` | Kimi K2.5 - State-of-the-art coding |
| `nvidia/nemotron-3-mini-nemotron-3-mini-4b-hf` | Nemotron 3 Nano - Efficient coding |
| `mistralai/mixtral-8x7b-instruct-v0.1` | Mixtral - General purpose |
| `meta/llama-3.1-70b-instruct` | Llama 3.1 - General purpose |
| `google/gemma-2-27b-it` | Gemma 2 - Efficient |
| `deepseek-ai/deepseek-coder-v2-instruct` | DeepSeek Coder V2 |

---

## Environment Variables Setup

Create a `.env` file in your project:

```bash
# NVIDIA NIM Configuration
NVIDIA_API_KEY=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

# For multiple providers (optional)
OPENAI_API_KEY=sk-your-openai-key  # Fallback
OPENROUTER_API_KEY=sk-or-your-key  # Alternative
```

---

## Testing Your Setup

Run this in your terminal to verify:

```bash
# Test NVIDIA NIM API
curl https://integrate.api.nvidia.com/v1/models \
  -H "Authorization: Bearer $NVIDIA_API_KEY"
```

Or test with a chat request:

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.5",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns 401 | Check API key is correct, no extra spaces |
| No model found | Verify your NIM account has quota for that model |
| Region not supported | NVIDIA NIM may not be available in all regions |
| "Did nothing" | Make sure Base URL is set to `https://integrate.api.nvidia.com/v1` (not OpenAI default) |

---

## Get Your API Key

If you need a new key:
1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new key with NIM access
5. Copy it (won't be shown again!)

---

## Base URL Reference

- **NVIDIA NIM Cloud**: `https://integrate.api.nvidia.com/v1`
- **NVIDIA NIM (Local)**: `http://localhost:8000` (if running NIM containers)

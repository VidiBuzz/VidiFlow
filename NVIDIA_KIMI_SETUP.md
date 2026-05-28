# NVIDIA NIM + Kimi K2.6 Integration Setup Guide

## 🚀 Quick Start

### Prerequisites
1. **NVIDIA RTX 4090** - Your GPU is ready ✅
2. **Get NVIDIA NIM API Key**: Visit https://build.llmmodel.nvidia.com/discovery/models/kimi-k2.6-17b/
3. **Install dependencies**:
   ```bash
   npm install --prefix api
   ```

### Step 1: Add Your API Key
Edit `M:\code\vidismart\.env`:
```bash
NVIDIA_NIM_API_KEY=your_actual_api_key_here
```

### Step 2: Deploy with Docker
```bash
cd M:\code\vidismart
./scripts/deploy.sh  # This builds and starts the API service
```

### Step 3: Access via API
Test the chat endpoint:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is Qwen 3.5?"}
    ]
  }'
```

---

## 📦 Architecture Overview

```
┌─────────────────────────────────────────┐
│        Client (Browser/Postman)         │
└──────────────┬──────────────────────────┘
               │ HTTP POST /api/chat
               ▼
┌─────────────────────────────────────────┐
│    converge-api:3001 (Node.js Express)  │
│                                          │
│   Uses NVIDIA NIM Inference API         │
│   Endpoint: integrate.api.nvidia.com    │
│   Model: Kimi K2.6                       │
└──────────────┬──────────────────────────┘
               │ gRPC/HTTPS
               ▼
┌─────────────────────────────────────────┐
│   NVIDIA NIM Cloud Inference Service    │
│   (Managed inference with your GPU)     │
└─────────────────────────────────────────┘
```

---

## 🔑 Configuration Reference

### `.env` Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `NVIDIA_NIM_API_KEY` | Your NVIDIA API key | `nvapi-xyz123...` |
| `KIMI_K2_6_MODEL_ID` | Model identifier | `meta-llama/Llama-3.3-NI` |

---

## 🧪 Testing Without API Key (Development Mode)

The system runs in mock mode without credentials:
```bash
curl http://localhost:3001/api/chat -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

Returns mock response until API key is configured.

---

## 📖 Documentation Links
- NVIDIA NIM Docs: https://docs.nvidia.com/nim/
- Kimi K2.6 Model: https://build.llmmodel.nvidia.com/discovery/models/kimi-k2.6-17b/
- Qwen 3.5 Info: https://kilo.ai/docs

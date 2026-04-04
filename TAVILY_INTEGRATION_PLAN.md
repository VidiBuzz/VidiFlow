# Tavily Web Search Integration for AppFlowy AI

## Current Status

**AppFlowy Cloud AI Service**: Running on port 5001 (Rust binary)
- Only supports `openai` and `azure_openai` providers
- No built-in MCP or tool support
- Container: `appflowy-cloud-ai-1`

**Tavily API Key**: `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`

## Problem

AppFlowy AI is a compiled Rust binary with no native MCP (Model Context Protocol) support. Cannot directly add Tavily web search capability to the containerized service.

## Solution: Proxy Middleware Pattern

Create an Express.js proxy server that sits between AppFlowy frontend and AI backend, intercepting requests to inject web search context.

### Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Frontend  │─────▶│ MCP Proxy (5002) │─────▶│ AppFlowy AI │
│             │◀─────│                  │◀─────│  (5001)     │
└─────────────┘      └──────────────────┘      └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Tavily API   │
                    │              │
                    └──────────────┘
```

### Implementation Steps

#### 1. Create Proxy Server (DONE)
File: `appflowy-ai-mcp-proxy.js`

Features:
- `/api/v1/ai/chat` - Enhanced chat endpoint with automatic web search injection
- `/api/v1/tools/tavily-search` - Direct Tavily search API
- Detects queries needing web search (keywords: news, latest, current, today, recent)
- Injects search results as system context before forwarding to AppFlowy AI

#### 2. Update Frontend Configuration

Modify AppFlowy Cloud frontend to route AI requests through proxy:

```javascript
// In frontend config or environment variables
AI_API_URL = "http://localhost:5002/api/v1/ai"
```

Or update docker-compose to set upstream proxy.

#### 3. Docker Compose Integration (TODO)

Add proxy service to `docker-compose.yml`:

```yaml
services:
  appflowy-ai-proxy:
    build:
      context: .
      dockerfile: Dockerfile.appflowy-ai-proxy
    ports:
      - "5002:5002"
    environment:
      - TAVILY_API_KEY=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
      - APPFLOWY_AI_URL=http://appflowy-cloud-ai-1:5001
    depends_on:
      - appflowy-cloud-ai-1
```

#### 4. Create Dockerfile (TODO)

File: `Dockerfile.appflowy-ai-proxy`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY appflowy-ai-mcp-proxy.js .
EXPOSE 5002
CMD ["node", "appflowy-ai-mcp-proxy.js"]
```

#### 5. Update package.json (TODO)

Add dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.7.0"
  }
}
```

## Testing Plan

### Test 1: Direct Tavily Search
```bash
curl http://localhost:5002/api/v1/tools/tavily-search \
  -H "Content-Type: application/json" \
  -d '{"query":"latest AI news"}'
```

Expected: JSON with search results from Tavily.

### Test 2: Enhanced Chat with Web Search
```bash
curl http://localhost:5002/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is the latest news about AI?"}],
    "use_web_search": true
  }'
```

Expected: Response includes web search context.

### Test 3: Chat Without Web Search
Same as above but `"use_web_search": false` or query without trigger keywords.

Expected: Direct response from AppFlowy AI, no Tavily call.

## Environment Variables Required

| Variable | Value | Description |
|----------|-------|-------------|
| `TAVILY_API_KEY` | `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` | Tavily API key |
| `APPFLOWY_AI_URL` | `http://localhost:5001` or container URL | AppFlowy AI backend |
| `PROXY_PORT` | `5002` (default) | Proxy server port |

## Next Steps

1. ✅ Create proxy server code (`appflowy-ai-mcp-proxy.js`)
2. ⏳ Fix path issues with Git Bash vs WSL
3. ⏳ Test proxy server locally
4. ⏳ Create Dockerfile for proxy container
5. ⏳ Update docker-compose.yml to include proxy service
6. ⏳ Configure AppFlowy frontend to use proxy endpoint
7. ⏳ End-to-end testing with real queries

## Notes

- **Shell Issue**: Current environment is Git Bash (MSYS2), not WSL. Path resolution differs:
  - Windows path: `M:/code/vidismart/`
  - Git Bash path: `/c/Program Files/Git/code/vidismart/` or `/mnt/m/code/vidismart/`
  
- **Alternative Approach**: If proxy pattern is too complex, consider:
  - Modifying AppFlowy AI prompts to include web search instructions
  - Using a separate "research" workflow that calls Tavily first, then passes results to AI

## References

- Tavily API: https://docs.tavily.com/
- AppFlowy Cloud: https://github.com/AppFlowy-IO/appflowy-cloud
- MCP Protocol: https://modelcontextprotocol.io/

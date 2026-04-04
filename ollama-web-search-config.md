# Enable Web Search for Qwen 3 VL in Ollama

## Problem
Qwen 3 VL through Ollama gives outdated information because it has no internet access.

## Solution: Configure Function Calling with Web Search

### Step 1: Verify Ollama is Running
```bash
ollama list  # Check if qwen model is installed
ollama ps    # Check running models
```

### Step 2: Install a Web Search Tool

#### Option A: Use MCP Server (Best Integration)
AppFlowy should support MCP servers. Configure a web search MCP server:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY"
      }
    }
  }
}
```

#### Option B: Use OpenWebUI with Ollama
OpenWebUI has built-in web search for Ollama models:

```bash
# Install OpenWebUI
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data --name open-webui \
  --restart always ghcr.io/open-webui/open-webui:main
```

Then access at http://localhost:3000 and enable web search in settings.

#### Option C: Custom Function Calling Script
Create a Python script that Ollama can use:

```python
import requests
import json

def web_search(query):
    """Search DuckDuckGo and return results"""
    url = f"https://api.duckduckgo.com/?q={query}&format=json"
    response = requests.get(url)
    return response.json()

# Configure this as a tool for Ollama
tools = [{
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "Search the internet for current information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                }
            },
            "required": ["query"]
        }
    }
}]
```

### Step 3: Configure AppFlowy

In AppFlowy settings, you need to:
1. Enable "Function Calling" or "Tool Use" for the Ollama connection
2. Add web search as an available tool
3. Set Qwen 3 VL to use tools when needed

### Step 4: Test the Configuration

Ask Qwen 3 VL: "What are the top news stories today?"

If configured correctly, it should:
1. Recognize it needs current info
2. Call the web search function
3. Return current results

## Alternative: Use a Model with Built-in Web Access

Instead of Qwen 3 VL, consider using:
- **Perplexity API** (has built-in web search)
- **Claude Code** (has WebSearch tool - what you're using now)
- **GPT-4 with Bing** (through OpenAI API)

## Debugging

If web search still doesn't work:

```bash
# Check Ollama logs
journalctl -u ollama -f

# Verify model supports function calling
ollama show qwen:latest

# Test direct API call with tools
curl http://localhost:11434/api/chat -d '{
  "model": "qwen:latest",
  "messages": [{"role": "user", "content": "What year is it?"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_date",
        "description": "Get the current date and time"
      }
    }
  ],
  "stream": false
}'
```

## Current Date Issue Specifically

For the "2026 is current year" issue, you may also need to:
1. Update Ollama: `ollama pull qwen:latest`
2. Check system date: `date`
3. Verify model wasn't trained on incorrect data

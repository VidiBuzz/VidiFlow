# VidiFlow AI Proxy Plan

**Goal:** Enable Web Search and Tool Calling in AppFlowy/VidiFlow WITHOUT recompiling the source code.

## The Problem
The user has spent days trying to compile AppFlowy from source to add Rust-based tool calling, but it fails due to environment issues. Modifying the binary release of AppFlowy to inject implementation logic is not feasible.

## The Solution: Middleware Proxy
Instead of modifying AppFlowy, we will create a lightweight "Middleman" server (Python) that sits between AppFlowy and the Local AI (Ollama).

**Architecture:**
1. **AppFlowy Nightly Build** points to `http://localhost:11435` (Proxy) instead of the default Ollama port (`11434`).
2. **The Proxy** receives the chat message: "What is the weather?"
3. **The Proxy** inspects the message and decides if it needs tools (Web Search).
4. **The Proxy** calls the *real* Ollama model with tool definitions.
5. **Ollama** says "I need to search web for 'weather'".
6. **The Proxy** executes the search (DuckDuckGo).
7. **The Proxy** feeds the search results back to Ollama.
8. **Ollama** generates the final answer.
9. **The Proxy** sends the text answer back to AppFlowy.

**Result:** AppFlowy thinks it's just chatting, but gets smart, web-aware answers.

## Implementation Steps
1. Create `proxy_server.py` (Python) within `AppFlowy-Proxy` folder.
2. Implement Ollama API compatibility (`/api/chat` and `/api/tags` endpoints).
3. Implement DuckDuckGo search logic.
4. User configures AppFlowy to point to this proxy.

## Requirements
- Python 3.8+
- `pip install flask requests duckduckgo-search`
- AppFlowy (Nightly or Standard Build)
- Ollama running locally on port 11434

#!/usr/bin/env python3
"""
Simple NotebookLM MCP Server
Compatible with AnythingLLM MCP interface
"""

import sys
import json
import os

# Ensure we can find notebooklm-py
venv_site_packages = os.path.join(os.path.dirname(__file__), 'venv-notebooklm', 'lib', 'python3.12', 'site-packages')
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

def log(msg):
    """Log to stderr so it doesn't interfere with JSON-RPC"""
    print(msg, file=sys.stderr, flush=True)

def send(msg):
    """Send JSON-RPC message"""
    print(json.dumps(msg), flush=True)

def main():
    log("NotebookLM MCP Server starting...")
    
    # Initialize NotebookLM client lazily
    client = None
    
    # Define tools
    tools = [
        {
            "name": "notebooklm_list",
            "description": "List all NotebookLM notebooks",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "notebooklm_sources",
            "description": "Get sources from a notebook",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string"}
                },
                "required": ["notebook_id"]
            }
        },
        {
            "name": "notebooklm_chat",
            "description": "Ask a question to a notebook",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string"},
                    "question": {"type": "string"}
                },
                "required": ["notebook_id", "question"]
            }
        },
        {
            "name": "notebooklm_create",
            "description": "Create a new notebook",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"}
                },
                "required": ["title"]
            }
        }
    ]
    
    def get_client():
        nonlocal client
        if client is None:
            try:
                import asyncio
                from notebooklm import NotebookLMClient
                # Create new event loop if needed
                try:
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                client = loop.run_until_complete(NotebookLMClient.from_storage())
                log("NotebookLM client initialized")
            except Exception as e:
                log(f"Failed to initialize client: {e}")
                raise
        return client
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            line = line.strip()
            if not line:
                continue
            
            try:
                request = json.loads(line)
            except json.JSONDecodeError:
                continue
            
            method = request.get("method", "")
            req_id = request.get("id")
            params = request.get("params", {})
            
            # Handle initialize
            if method == "initialize":
                send({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {"name": "notebooklm-mcp", "version": "1.0.0"}
                    }
                })
            
            # Handle tools/list
            elif method == "tools/list":
                send({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"tools": tools}
                })
            
            # Handle tools/call
            elif method == "tools/call":
                tool_name = params.get("name", "")
                args = params.get("arguments", {})
                
                try:
                    import asyncio
                    
                    if tool_name == "notebooklm_list":
                        c = get_client()
                        loop = asyncio.get_event_loop()
                        notebooks = loop.run_until_complete(c.notebooks.list())
                        text = "## Notebooks\n\n" + "\n".join([f"- **{nb.title}** (`{nb.id}`)" for nb in notebooks])
                        send({
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {"content": [{"type": "text", "text": text}]}
                        })
                    
                    elif tool_name == "notebooklm_sources":
                        c = get_client()
                        notebook_id = args.get("notebook_id", "")
                        loop = asyncio.get_event_loop()
                        sources = loop.run_until_complete(c.sources.list(notebook_id))
                        text = "## Sources\n\n" + "\n".join([f"- {src.title} ({src.type})" for src in sources])
                        send({
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {"content": [{"type": "text", "text": text}]}
                        })
                    
                    elif tool_name == "notebooklm_chat":
                        c = get_client()
                        notebook_id = args.get("notebook_id", "")
                        question = args.get("question", "")
                        loop = asyncio.get_event_loop()
                        response = loop.run_until_complete(c.chat.ask(notebook_id, question))
                        send({
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {"content": [{"type": "text", "text": response.answer}]}
                        })
                    
                    elif tool_name == "notebooklm_create":
                        c = get_client()
                        title = args.get("title", "")
                        loop = asyncio.get_event_loop()
                        notebook = loop.run_until_complete(c.notebooks.create(title))
                        text = f"Created notebook: **{notebook.title}**\nID: `{notebook.id}`"
                        send({
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {"content": [{"type": "text", "text": text}]}
                        })
                    
                    else:
                        send({
                            "jsonrpc": "2.0",
                            "id": req_id,
                            "result": {
                                "content": [{"type": "text", "text": f"Unknown tool: {tool_name}"}],
                                "isError": True
                            }
                        })
                
                except Exception as e:
                    log(f"Error: {e}")
                    send({
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [{"type": "text", "text": f"Error: {str(e)}"}],
                            "isError": True
                        }
                    })
        
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"Server error: {e}")

if __name__ == "__main__":
    main()

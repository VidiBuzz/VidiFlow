#!/usr/bin/env python3
"""
NotebookLM MCP HTTP Server
Run this as a background service, connect via HTTP
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Add venv to path
venv_path = str(Path(__file__).parent / "venv-notebooklm" / "lib" / "python3.12" / "site-packages")
if venv_path not in sys.path:
    sys.path.insert(0, venv_path)

client = None

def get_client():
    global client
    if client is None:
        import asyncio
        from notebooklm import NotebookLMClient
        loop = asyncio.new_event_loop()
        client = loop.run_until_complete(NotebookLMClient.from_storage())
    return client

class MCPHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        request = json.loads(body)
        
        method = request.get("method", "")
        req_id = request.get("id")
        params = request.get("params", {})
        
        response = {"jsonrpc": "2.0", "id": req_id}
        
        if method == "initialize":
            response["result"] = {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "notebooklm-mcp", "version": "1.0.0"}
            }
        
        elif method == "tools/list":
            response["result"] = {
                "tools": [
                    {"name": "notebooklm_list", "description": "List notebooks", "inputSchema": {"type": "object"}},
                    {"name": "notebooklm_chat", "description": "Chat with notebook", "inputSchema": {"type": "object", "properties": {"notebook_id": {"type": "string"}, "question": {"type": "string"}}}},
                    {"name": "notebooklm_sources", "description": "Get sources", "inputSchema": {"type": "object", "properties": {"notebook_id": {"type": "string"}}}}
                ]
            }
        
        elif method == "tools/call":
            tool_name = params.get("name", "")
            args = params.get("arguments", {})
            
            try:
                c = get_client()
                loop = asyncio.new_event_loop()
                
                if tool_name == "notebooklm_list":
                    notebooks = loop.run_until_complete(c.notebooks.list())
                    text = "\n".join([f"- {nb.title} ({nb.id})" for nb in notebooks])
                    response["result"] = {"content": [{"type": "text", "text": text}]}
                
                elif tool_name == "notebooklm_chat":
                    result = loop.run_until_complete(c.chat.ask(args["notebook_id"], args["question"]))
                    response["result"] = {"content": [{"type": "text", "text": result.answer}]}
                
                elif tool_name == "notebooklm_sources":
                    sources = loop.run_until_complete(c.sources.list(args["notebook_id"]))
                    text = "\n".join([f"- {s.title}" for s in sources])
                    response["result"] = {"content": [{"type": "text", "text": text}]}
            
            except Exception as e:
                response["result"] = {"content": [{"type": "text", "text": str(e)}], "isError": True}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        pass

def run_server(port=8765):
    server = HTTPServer(('localhost', port), MCPHandler)
    print(f"NotebookLM MCP HTTP Server running on port {port}")
    server.serve_forever()

if __name__ == "__main__":
    run_server()

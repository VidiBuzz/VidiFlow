#!/usr/bin/env python3
"""
NotebookLM MCP Server for AnythingLLM
Simple stdio-based MCP server following the Model Context Protocol.
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from typing import Any, Dict, List

# Add virtual environment path
venv_path = Path(__file__).parent / "venv-notebooklm" / "lib" / "python3.12" / "site-packages"
if str(venv_path) not in sys.path:
    sys.path.insert(0, str(venv_path))


class NotebookLMMCPServer:
    """MCP Server for NotebookLM integration."""
    
    def __init__(self):
        self.client = None
        self.tools = self._define_tools()
    
    def _define_tools(self) -> List[Dict]:
        """Define available MCP tools."""
        return [
            {
                "name": "notebooklm_list",
                "description": "List all NotebookLM notebooks",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "notebooklm_sources",
                "description": "Get sources from a notebook",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "notebook_id": {"type": "string", "description": "Notebook ID"}
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
                        "notebook_id": {"type": "string", "description": "Notebook ID"},
                        "question": {"type": "string", "description": "Question to ask"}
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
                        "title": {"type": "string", "description": "Notebook title"}
                    },
                    "required": ["title"]
                }
            }
        ]
    
    async def get_client(self):
        """Initialize NotebookLM client."""
        if self.client is None:
            try:
                from notebooklm import NotebookLMClient
                self.client = await NotebookLMClient.from_storage()
            except Exception as e:
                return None
        return self.client
    
    def send(self, message: Dict):
        """Send JSON-RPC message to stdout."""
        print(json.dumps(message), flush=True)
    
    async def handle_initialize(self, request_id: Any):
        """Handle initialize request."""
        self.send({
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "notebooklm-mcp", "version": "1.0.0"}
            }
        })
    
    async def handle_tools_list(self, request_id: Any):
        """Handle tools/list request."""
        self.send({
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"tools": self.tools}
        })
    
    async def handle_tools_call(self, request_id: Any, params: Dict):
        """Handle tools/call request."""
        tool_name = params.get("name", "")
        arguments = params.get("arguments", {})
        
        client = await self.get_client()
        
        if not client:
            self.send({
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "content": [{"type": "text", "text": "Error: NotebookLM not authenticated. Run 'notebooklm login' first."}],
                    "isError": True
                }
            })
            return
        
        try:
            if tool_name == "notebooklm_list":
                notebooks = await client.notebooks.list()
                result = {
                    "content": [{
                        "type": "text",
                        "text": "## Notebooks\n\n" + "\n".join([f"- **{nb.title}** (`{nb.id}`)" for nb in notebooks])
                    }]
                }
            
            elif tool_name == "notebooklm_sources":
                notebook_id = arguments.get("notebook_id", "")
                sources = await client.sources.list(notebook_id)
                result = {
                    "content": [{
                        "type": "text",
                        "text": "## Sources\n\n" + "\n".join([f"- {src.title} ({src.type})" for src in sources])
                    }]
                }
            
            elif tool_name == "notebooklm_chat":
                notebook_id = arguments.get("notebook_id", "")
                question = arguments.get("question", "")
                response = await client.chat.ask(notebook_id, question)
                result = {
                    "content": [{"type": "text", "text": response.answer}]
                }
            
            elif tool_name == "notebooklm_create":
                title = arguments.get("title", "")
                notebook = await client.notebooks.create(title)
                result = {
                    "content": [{
                        "type": "text",
                        "text": f"Created notebook: **{notebook.title}**\nID: `{notebook.id}`"
                    }]
                }
            
            else:
                result = {
                    "content": [{"type": "text", "text": f"Unknown tool: {tool_name}"}],
                    "isError": True
                }
            
            self.send({"jsonrpc": "2.0", "id": request_id, "result": result})
        
        except Exception as e:
            self.send({
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "content": [{"type": "text", "text": f"Error: {str(e)}"}],
                    "isError": True
                }
            })
    
    async def run(self):
        """Main server loop."""
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
                
                if not line:
                    break
                
                line = line.strip()
                if not line:
                    continue
                
                request = json.loads(line)
                method = request.get("method", "")
                request_id = request.get("id")
                params = request.get("params", {})
                
                if method == "initialize":
                    await self.handle_initialize(request_id)
                elif method == "tools/list":
                    await self.handle_tools_list(request_id)
                elif method == "tools/call":
                    await self.handle_tools_call(request_id, params)
            
            except json.JSONDecodeError:
                pass
            except Exception as e:
                if request_id:
                    self.send({
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -32603, "message": str(e)}
                    })


def main():
    server = NotebookLMMCPServer()
    asyncio.run(server.run())


if __name__ == "__main__":
    main()

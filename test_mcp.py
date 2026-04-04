#!/usr/bin/env python3
"""Simple test for MCP server"""
import subprocess
import json
import sys
import os

# Add venv to path
venv_path = os.path.join(os.path.dirname(__file__), 'venv-notebooklm', 'lib', 'python3.12', 'site-packages')
if os.path.exists(venv_path) and venv_path not in sys.path:
    sys.path.insert(0, venv_path)

def test_mcp_server():
    """Test the MCP server directly"""
    # Test initialize
    test_input = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize"}) + "\n"
    
    env = os.environ.copy()
    env['PYTHONPATH'] = venv_path
    
    proc = subprocess.Popen(
        ['python3', 'notebooklm-mcp-simple.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    stdout, stderr = proc.communicate(input=test_input, timeout=5)
    
    print("=== STDOUT ===")
    print(stdout)
    print("=== STDERR ===")
    print(stderr)
    
    # Parse response
    try:
        response = json.loads(stdout.strip())
        print("\n=== PARSED RESPONSE ===")
        print(json.dumps(response, indent=2))
        
        if response.get("result", {}).get("protocolVersion"):
            print("\n✅ MCP Server is working!")
        else:
            print("\n❌ Unexpected response")
    except:
        print("\n❌ Failed to parse response")

if __name__ == "__main__":
    test_mcp_server()

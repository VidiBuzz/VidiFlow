#!/usr/bin/env node
/**
 * Node.js wrapper for NotebookLM MCP Server
 * This provides a Windows-compatible interface for AnythingLLM
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = path.dirname(require.main.filename);

// Spawn the Python MCP server through WSL
const proc = spawn('wsl.exe', [
    'bash', '-c',
    `cd /mnt/m/code/vidismart && source venv-notebooklm/bin/activate && exec python3 notebooklm-mcp-simple.py`
], {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true
});

// Forward stdin to the Python process
process.stdin.on('data', (data) => {
    proc.stdin.write(data);
});

process.stdin.on('end', () => {
    proc.stdin.end();
});

// Forward stdout from Python to our stdout
proc.stdout.on('data', (data) => {
    process.stdout.write(data);
});

// Forward stderr to stderr (for logging)
proc.stderr.on('data', (data) => {
    process.stderr.write(data);
});

// Handle process exit
proc.on('exit', (code) => {
    process.exit(code);
});

// Handle errors
proc.on('error', (err) => {
    console.error('Failed to start NotebookLM MCP server:', err.message);
    process.exit(1);
});

# MCP Server Configuration Guide

## For VSCode (Windows)
The VSCode configuration has been saved to: `.vscode/mcp.json`

To use it:
1. Copy the `.vscode/mcp.json` file to your project workspace
2. Restart VSCode or reload the window

## For LMStudio (Windows)
The LMStudio configuration has been saved to: `lmstudio-mcp-config.json`

To use it:
1. Locate LMStudio's config folder:
   - Windows: `%APPDATA%\LMStudio\`
   - Linux: `~/.config/lmstudio/`
   - macOS: `~/Library/Application Support/LMStudio/`

2. Copy the contents of `lmstudio-mcp-config.json` to the `mcp.json` file in that folder
   (or create the file if it doesn't exist)

3. Restart LMStudio

## For OpenCode
The OpenCode configuration has been saved to: `opencode.json`

To use it:
1. The configuration is already in the project root directory
2. OpenCode will automatically detect and use the `opencode.json` file
3. No additional setup needed

## Available MCP Servers Added:
1. **BrowserMCP** - Requires Chrome Extension installation
   - Install the Chrome Extension
   - Click extension icon → "Connect" to activate

2. **Playwright MCP** - Headless browser automation
   - Works without additional setup

## Quick Usage Examples:
- "Use Playwright MCP to navigate to a website and fill out a form"
- "Use BrowserMCP to interact with a webpage" (after Chrome extension is connected)
- For OpenCode: The servers are available as tools, use them in prompts with "use browser-mcp tool" or "use playwright-mcp tool"
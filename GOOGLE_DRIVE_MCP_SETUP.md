# Google Drive MCP Setup Guide

## Overview
This guide helps you set up the Google Drive MCP server to access your Google Docs directly from Cursor/Continue AI.

## Step 1: Add MCP Server Configuration

### For Continue (VS Code Extension)
Add this to your `.continue/config.json` or `config.ts`:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gdrive@latest"
      ]
    }
  }
}
```

### For Cursor AI
1. Open Cursor Settings (Cmd+, or Ctrl+,)
2. Go to Features → MCP Servers
3. Click "Add New Server"
4. Enter the configuration above

## Step 2: Authenticate with Google

When you first use the MCP server, it will prompt you for OAuth authentication:

1. A browser window will open
2. Sign in with your Google account
3. Grant permissions to access your Drive
4. You'll receive an authorization code
5. Enter the code when prompted

## Step 3: Use the MCP Server

Once authenticated, you can ask questions like:
- "Read my document at [URL]"
- "Summarize the content of..."
- "Extract sections from..."

## Alternative: Direct Document Access

If MCP setup is complex, here are simpler alternatives:

### Option A: Export and Share
1. In Google Docs: File → Download → PDF or DOCX
2. Save to `m:\code\vidismart\documents\`
3. I can read it directly from the workspace

### Option B: Copy/Paste Content
Share the document content in sections via chat

### Option C: Browser Automation
I can navigate to the doc and scroll through it section by section (requires you to be logged into Google)

## Next Steps

Let me know which approach works best for you, or if you'd like me to help with any specific step of the MCP setup.

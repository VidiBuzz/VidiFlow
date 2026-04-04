# Design Tools Setup Report
**Date:** 2026-02-21

---

## 1. Penpot MCP Server (Official)

**What it is:** Open-source design platform with MCP integration, allowing Claude Code to inspect and manipulate Penpot design files directly.

### Installation
- **Repo:** `/mnt/m/code/penpot-mcp/`
- **Source:** https://github.com/penpot/penpot-mcp
- **Node requirement:** v22+ recommended (running on v18 with warnings but functional)

### Running Endpoints
| Service | URL |
|---------|-----|
| HTTP MCP endpoint | `http://localhost:4401/mcp` |
| Legacy SSE endpoint | `http://localhost:4401/sse` |
| WebSocket | `ws://localhost:4402` |
| Plugin UI | `http://localhost:4400/` |
| REPL interface | `http://localhost:4403` |

### MCP Tools Registered
- `execute_code` - Run code in Penpot context
- `high_level_overview` - Get overview of design file
- `penpot_api_info` - Query Penpot API
- `export_shape` - Export shapes from designs
- `import_image` - Import images into designs

### Claude Code Config
Added to `~/.claude.json` global `mcpServers`:
```json
"penpot": {
  "type": "http",
  "url": "http://localhost:4401/mcp"
}
```

### How to Start
```bash
cd /mnt/m/code/penpot-mcp && npm run bootstrap
```

### How to Connect Penpot
1. Open https://design.penpot.app (free account)
2. Open a design file
3. Go to Plugins menu
4. Load plugin from `http://localhost:4400/manifest.json`
5. Click "Connect to MCP server" in plugin UI

### Environment Variables (Optional)
| Variable | Purpose | Default |
|----------|---------|---------|
| `PENPOT_MCP_SERVER_LISTEN_ADDRESS` | Server bind address | localhost |
| `PENPOT_MCP_SERVER_PORT` | HTTP/SSE port | 4401 |
| `PENPOT_MCP_WEBSOCKET_PORT` | WebSocket port | 4402 |
| `PENPOT_MCP_LOG_LEVEL` | Log verbosity | info |
| `PENPOT_MCP_REMOTE_MODE` | Remote deployment | false |

---

## 2. Pencil.dev

**What it is:** AI-powered design canvas that works like Figma but layered on Claude Code. Creates `.pen` files that AI can read/modify via its built-in MCP server.

### Installation
- **Location:** `/home/vidiman/.local/bin/Pencil.AppImage`
- **Size:** 238MB
- **Format:** AppImage (no system install needed)
- **Source:** https://www.pencil.dev/downloads

### How to Launch
```bash
Pencil.AppImage
# or full path:
/home/vidiman/.local/bin/Pencil.AppImage
```

### Key Features
- MCP server starts automatically when Pencil opens (no manual config needed)
- Creates `.pen` files in your project directory
- Claude Code can read and manipulate `.pen` files through MCP
- Works with Cursor, VS Code, and Claude Code CLI
- No cloud dependency for design operations

### Requirements
- Claude Code subscription (for AI features)
- Authentication via `claude` CLI

---

## 3. Also Installed (Dependencies)

| Tool | Version | Location |
|------|---------|----------|
| OpenCode | v0.0.55 | `~/.opencode/bin/opencode` |
| ripgrep | v14.1.1 | `~/.local/bin/rg` |
| fzf | v0.60.3 | `~/.local/bin/fzf` |

---

## 4. Cost Comparison

| Tool | Cost |
|------|------|
| Penpot | Free (open-source, self-hosted or cloud) |
| Pencil.dev | Free (early access, no feature limits) |
| Figma Full Seat | ~$20/month (for comparison) |
| Figma Dev Seat | ~$12-15/month |
| Figma Starter | Free (limited) |

---

## 5. Recommended Workflow

1. **Start Penpot MCP:** `cd /mnt/m/code/penpot-mcp && npm run bootstrap`
2. **Open Penpot** at https://design.penpot.app, load the MCP plugin
3. **Launch Pencil:** `Pencil.AppImage` for quick canvas-to-code work
4. **Use Claude Code** — both MCP servers feed design context into the AI
5. **Upgrade Node to v22+** when convenient for full Penpot MCP compatibility

---

## 6. Next Steps

- [ ] Restart Claude Code to activate Penpot MCP server
- [ ] Create Penpot account at https://design.penpot.app
- [ ] Test Pencil.dev by creating a `.pen` file
- [ ] Consider upgrading Node.js to v22+ for full compatibility
- [ ] Optionally self-host Penpot via Docker for offline use

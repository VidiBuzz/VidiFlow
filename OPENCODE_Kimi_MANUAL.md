# OpenCode AI - Complete Instruction Manual
## For Cursor, VS Code, and Terminal Usage

**Version:** 1.0  
**Date:** February 2026  
**Applies to:** OpenCode CLI (opencode)

---

## TABLE OF CONTENTS

1. [OpenCode CLI Commands](#1-opencode-cli-commands)
2. [Slash Commands & Shortcuts](#2-slash-commands--shortcuts)
3. [Adding New Skills](#3-adding-new-skills)
4. [Modifying Existing Skills](#4-modifying-existing-skills)
5. [Adding MCP Servers](#5-adding-mcp-servers)
6. [Cursor Integration](#6-cursor-integration)
7. [VS Code Integration](#7-vs-code-integration)
8. [Terminal/Editor Differences](#8-terminaleditor-differences)
9. [Configuration Files Reference](#9-configuration-files-reference)

---

## 1. OpenCode CLI Commands

### Core Commands

```bash
# Start OpenCode TUI (default)
opencode                    # Start in current directory
opencode /path/to/project   # Start in specific project

# Model Management
opencode models             # List all available models
opencode models anthropic   # List models for specific provider
opencode -m openai/gpt-4    # Use specific model
opencode --model anthropic/claude-sonnet-4-20250514

# Session Management
opencode -c                 # Continue last session
opencode -s <session-id>    # Continue specific session
opencode session            # Manage sessions
opencode export             # Export session as JSON
opencode export <sessionID> # Export specific session
opencode import <file>      # Import session from JSON

# MCP Server Management
opencode mcp                # Manage MCP servers
opencode mcp list           # List configured MCP servers
opencode mcp add <name>     # Add new MCP server
opencode mcp remove <name>  # Remove MCP server
opencode mcp start <name>   # Start specific MCP server

# Agent Management
opencode agent              # Manage agents
opencode agent list         # List available agents
opencode --agent <name>     # Use specific agent

# GitHub Integration
opencode github             # Manage GitHub agent
opencode pr <number>        # Fetch and checkout PR branch

# Web Interface
opencode web                # Start server and open web UI
opencode serve              # Start headless server
opencode attach <url>       # Attach to running server

# Utilities
opencode stats              # Show token usage and costs
opencode debug              # Debugging tools
opencode upgrade            # Upgrade to latest version
opencode uninstall          # Remove OpenCode completely
opencode completion         # Generate shell completion
```

### Command Options

```bash
# General Options
-h, --help                  # Show help
-v, --version               # Show version
--print-logs                # Print logs to stderr
--log-level DEBUG|INFO|WARN|ERROR

# Network Options
--port <number>             # Port to listen on (default: 0)
--hostname <host>           # Hostname (default: 127.0.0.1)
--mdns                      # Enable mDNS discovery
--mdns-domain <domain>      # Custom mDNS domain
--cors <domains>            # Additional CORS domains

# Session Options
-p, --prompt <text>         # Initial prompt
--agent <name>              # Specify agent to use
```

---

## 2. Slash Commands & Shortcuts

### Natural Language Commands (No Slash Needed)

OpenCode primarily uses **natural language** instead of slash commands. Just type what you want:

```
✅ "Create a new React component"
✅ "Debug this Python script"
✅ "Research https://example.com"
✅ "Start deep research on wedding photography websites"
```

### Context-Aware Commands

```
/help                       # Get help with OpenCode
/status                     # Check current status
/settings                   # View current configuration
/model                      # Show current model
/models                     # List available models
/cost                       # Show session costs
/export                     # Export current session
```

### Skill Activation Commands

```
"Activate deep research mode"
"Start superpowers plan"
"Enable brainstorm mode"
"Run research agent"
```

---

## 3. Adding New Skills

### Step-by-Step Process

**Location:** `.agent/skills/[skill-name]/`

#### Step 1: Create Skill Directory

```bash
mkdir -p .agent/skills/my-new-skill
```

#### Step 2: Create SKILL.md File

```yaml
---
name: my-new-skill
description: Description of what this skill does
model: kimi-k2.5              # or auto, gpt-4, claude-sonnet
tools:
  - filesystem
  - browser
  - websearch
  - bash
allowed_commands:
  - npm
  - node
  - python3
  - git
---

# My New Skill

## Activation
To activate: "Use my-new-skill" or "Activate my-new-skill"

## Capabilities
- Capability 1
- Capability 2
- Capability 3

## Usage Examples

### Example 1: Do Something
"Use my-new-skill to process this data"

### Example 2: Complex Task
"Activate my-new-skill and analyze the codebase"

## Workflow
1. Step one
2. Step two
3. Step three

## Best Practices
1. Practice one
2. Practice two
```

#### Step 3: Add Supporting Files (Optional)

```
.agent/skills/my-new-skill/
├── SKILL.md              # Required: Skill configuration
├── script.js             # Optional: Custom scripts
├── helpers.py            # Optional: Python utilities
├── templates/            # Optional: Template files
└── README.md             # Optional: Documentation
```

#### Step 4: Test the Skill

```bash
# Start OpenCode
opencode

# In the chat:
"Activate my-new-skill"
"Use my-new-skill to help me with..."
```

---

## 4. Modifying Existing Skills

### Option A: Edit SKILL.md Directly

```bash
# Edit the skill configuration
nano .agent/skills/deep-research-agent/SKILL.md
```

**Common Modifications:**

1. **Add New Tools:**
```yaml
tools:
  - filesystem
  - browser
  - websearch
  - NEW_TOOL_HERE
```

2. **Add Allowed Commands:**
```yaml
allowed_commands:
  - npx
  - node
  - playwright
  - NEW_COMMAND_HERE
```

3. **Change Model:**
```yaml
model: claude-sonnet-4-20250514  # or gpt-4, kimi-k2.5, etc.
```

### Option B: Modify Scripts

```bash
# Edit JavaScript automation
nano .agent/skills/deep-research-agent/research-agent.js

# Edit Python utilities
nano .agent/skills/deep-research-agent/helpers.py
```

### Option C: Update Workflows

```bash
# Edit workflow files
nano .agent/workflows/my-workflow.yaml
```

---

## 5. Adding MCP Servers

### Method 1: Using CLI

```bash
# Add new MCP server
opencode mcp add my-server

# Follow prompts to configure:
# - Server name
# - Command to run
# - Arguments
# - Environment variables
```

### Method 2: Manual Configuration

**Edit:** `vidiflow/mcp-config.json`

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-example"]
    },
    "my-new-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-new"],
      "env": {
        "API_KEY": "${ENV_VAR_NAME}",
        "OTHER_CONFIG": "value"
      }
    }
  }
}
```

### Method 3: Using npm Packages

```bash
# Install MCP server globally
npm install -g @modelcontextprotocol/server-postgres

# Add to config
cat >> vidiflow/mcp-config.json << 'EOF'
    "my-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    }
EOF
```

### Available MCP Servers

| Server | Package | Purpose |
|--------|---------|---------|
| **Browser** | `@modelcontextprotocol/server-puppeteer` | Browser automation |
| **Playwright** | `@playwright/mcp` | Modern browser automation |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | Database access |
| **SQLite** | `@modelcontextprotocol/server-sqlite` | SQLite database |
| **GitHub** | `@modelcontextprotocol/server-github` | GitHub integration |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | File operations |
| **Fetch** | `@modelcontextprotocol/server-fetch` | HTTP requests |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | Web search |
| **Figma** | `figma-mcp` | Design integration |
| **Gmail** | `@chinchillaenterprises/mcp-gmail` | Email operations |
| **Google Drive** | `@chinchillaenterprises/mcp-google-drive` | File storage |
| **YouTube** | `@anaisbetts/mcp-youtube` | Video management |

---

## 6. Cursor Integration

### Setup in Cursor

1. **Install OpenCode in Cursor Terminal:**
```bash
# Open Cursor terminal (Ctrl+`)
npm install -g opencode
```

2. **Start OpenCode:**
```bash
# In Cursor terminal
opencode
```

3. **Use OpenCode Alongside Cursor:**
- Cursor: Use for inline editing, autocomplete, quick fixes
- OpenCode: Use for complex tasks, multi-file operations, research

### Cursor-Specific Tips

```bash
# Run OpenCode in split terminal
# Terminal 1: opencode
# Terminal 2: regular commands

# Use OpenCode for:
- "Research all photography websites in Denver"
- "Create 8 CSV files for WordPress import"
- "Debug this complex API integration"

# Use Cursor for:
- Quick code edits
- Autocomplete
- Inline suggestions
- Refactoring
```

### Configuration in Cursor

**File:** `.cursor/settings.json`

```json
{
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.profiles.linux": {
    "opencode": {
      "path": "opencode",
      "args": ["${workspaceFolder}"]
    }
  }
}
```

---

## 7. VS Code Integration

### Setup in VS Code

1. **Install OpenCode:**
```bash
npm install -g opencode
```

2. **Create VS Code Task:**

**File:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start OpenCode",
      "type": "shell",
      "command": "opencode",
      "args": ["${workspaceFolder}"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "new"
      }
    }
  ]
}
```

3. **Create Keyboard Shortcut:**

**File:** `.vscode/keybindings.json`

```json
[
  {
    "key": "ctrl+alt+o",
    "command": "workbench.action.terminal.sendSequence",
    "args": { "text": "opencode\r\n" }
  }
]
```

### VS Code Extension (Optional)

While there's no official OpenCode VS Code extension yet, you can:

1. Use **Terminal Profiles**
2. Use **Tasks** (as shown above)
3. Use **Keybindings** for quick access

### VS Code Workflow

```bash
# Open integrated terminal (Ctrl+`)
# Run OpenCode
opencode

# Switch between:
# - VS Code for editing
# - OpenCode terminal for AI assistance
```

---

## 8. Terminal/Editor Differences

### Pure Terminal Usage

**Best for:**
- Full-screen AI assistance
- Complex multi-step tasks
- Long-running processes
- Research and data processing

**Commands:**
```bash
# Basic start
opencode

# With specific model
opencode -m anthropic/claude-sonnet-4-20250514

# Continue session
opencode -c

# Web interface
opencode web
```

### Cursor Usage

**Best for:**
- Code-heavy projects
- Inline editing
- Quick AI assistance alongside coding
- IDE integration

**Workflow:**
1. Use Cursor for coding
2. Open integrated terminal (Ctrl+`)
3. Run `opencode` for complex tasks
4. Switch between editor and terminal

### VS Code Usage

**Best for:**
- Multi-language projects
- Debugging integration
- Extension ecosystem
- Tasks and automation

**Workflow:**
1. Use VS Code for development
2. OpenCode in integrated terminal
3. Use VS Code tasks for automation
4. Leverage both tools' strengths

### Comparison Table

| Feature | Terminal | Cursor | VS Code |
|---------|----------|--------|---------|
| AI Assistance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Code Editing | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| IDE Features | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Research Mode | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Multi-file Ops | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Debugging | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Extensions | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 9. Configuration Files Reference

### Primary Config Files

```
/mnt/m/code/vidismart/
├── .agent/
│   ├── skills/                 # Skill definitions
│   │   ├── deep-research-agent/
│   │   │   ├── SKILL.md        # Skill configuration
│   │   │   ├── research-agent.js
│   │   │   └── kb-import.js
│   │   └── superpowers-*/      # Other skills
│   ├── workflows/              # Workflow definitions
│   └── rules/                  # Agent rules
│
├── vidiflow/
│   ├── mcp-config.json         # MCP server configuration
│   └── opencode-browser-mcp.json  # Browser-specific MCP
│
├── CLAUDE.md                   # Project context and instructions
└── .opencode/                  # OpenCode-specific files
    ├── system-prompt.md
    └── config.ini
```

### User-Level Config

```bash
# Global OpenCode config
~/.opencode/config.json

# Shell completion
~/.bashrc or ~/.zshrc

# Environment variables
~/.bash_profile or ~/.zshenv
```

### Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc

# API Keys
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export BRAVE_API_KEY="your-key"
export GITHUB_TOKEN="your-token"

# Model Preferences
export OPENCODE_DEFAULT_MODEL="anthropic/claude-sonnet-4-20250514"

# MCP Configuration
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Database URLs
export DATABASE_URL="postgresql://localhost:5432/mydb"
```

---

## 10. Quick Reference Card

### Essential Commands

```bash
# Start
opencode                    # Start TUI
opencode -m <model>         # With specific model
opencode -c                 # Continue session

# MCP
opencode mcp list           # List servers
opencode mcp add <name>     # Add server

# Models
opencode models             # List models
opencode stats              # Show usage

# Session
opencode export             # Export session
opencode import <file>      # Import session
```

### Essential Files

```
.agent/skills/              # Add/modify skills here
vidiflow/mcp-config.json    # Add MCP servers here
CLAUDE.md                   # Project context
~/.opencode/config.json     # Global settings
```

### Skill Template

```yaml
---
name: skill-name
description: What it does
model: kimi-k2.5
tools:
  - filesystem
  - browser
allowed_commands:
  - node
  - npm
---

# Instructions here
```

---

## 11. Troubleshooting

### MCP Server Not Working

```bash
# Check if server is configured
opencode mcp list

# Restart MCP server
opencode mcp restart <name>

# Check logs
opencode debug
```

### Skill Not Activating

```bash
# Check skill syntax
cat .agent/skills/my-skill/SKILL.md

# Verify directory structure
ls -la .agent/skills/my-skill/

# Restart OpenCode
exit
opencode
```

### Model Not Available

```bash
# List available models
opencode models

# Check API keys
env | grep -i api_key

# Set default model
opencode -m anthropic/claude-sonnet-4-20250514
```

---

## 12. Next Steps

1. **Create Your First Skill:**
   ```bash
   mkdir -p .agent/skills/my-custom-skill
   # Create SKILL.md
   # Test with: "Activate my-custom-skill"
   ```

2. **Add an MCP Server:**
   ```bash
   opencode mcp add my-database
   # Configure connection
   # Use in chat: "Query the database"
   ```

3. **Set Up Your Environment:**
   ```bash
   # Add to ~/.bashrc
   export OPENCODE_DEFAULT_MODEL="anthropic/claude-sonnet-4-20250514"
   ```

---

**END OF MANUAL**

For updates and more information:
- GitHub: https://github.com/opencode-ai/opencode
- Documentation: https://opencode.ai/docs
- Support: Use `/help` in OpenCode

# Playwright MCP Server for Kilo Code and Cline

A Model Context Protocol (MCP) server that provides Playwright browser automation capabilities to AI assistants like Kilo Code and Cline.

## Features

- **Navigate**: Open any URL in a headless browser
- **Screenshot**: Capture screenshots of web pages
- **Click**: Click elements on the page
- **Fill**: Fill input fields with text
- **Select**: Select options from dropdown menus
- **Hover**: Hover over elements
- **Evaluate**: Execute JavaScript on the page
- **Get Content**: Retrieve HTML, text, URL, or title
- **Wait**: Wait for specified time or elements

## Installation

1. Navigate to the mcp-playwright-server directory:
```bash
cd mcp-playwright-server
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Configuration

### For Cline

1. Open Cline settings in VS Code
2. Go to MCP Settings
3. Add the following configuration or copy `cline_mcp_settings.json` content:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": [
        "mcp-playwright-server/index.js"
      ],
      "cwd": "${workspaceFolder}",
      "env": {}
    }
  }
}
```

### For Kilo Code

1. Open Kilo Code settings in VS Code
2. Go to MCP Settings
3. Add the following configuration or copy `kilocode_mcp_settings.json` content:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": [
        "${workspaceFolder}/mcp-playwright-server/index.js"
      ],
      "cwd": "${workspaceFolder}",
      "env": {}
    }
  }
}
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `playwright_navigate` | Navigate to a URL | `url` (string) |
| `playwright_screenshot` | Take a screenshot | `name` (string), `savePng` (boolean), `path` (string) |
| `playwright_click` | Click an element | `selector` (CSS selector) |
| `playwright_fill` | Fill an input field | `selector`, `value` |
| `playwright_select` | Select from dropdown | `selector`, `value` |
| `playwright_hover` | Hover over element | `selector` |
| `playwright_evaluate` | Execute JavaScript | `script` |
| `playwright_get` | Get page content | `action` (html/text/url/title) |
| `playwright_wait` | Wait for time | `ms` (number) |
| `playwright_wait_for_selector` | Wait for element | `selector`, `state` |
| `playwright_close` | Close browser | none |

## Example Usage

Ask Kilo Code or Cline to:

- "Navigate to https://example.com and take a screenshot"
- "Fill in the search box with 'test' and click search"
- "Get the title of the current page"
- "Click on the first link and wait 2 seconds"

## Troubleshooting

1. **Server not starting**: Make sure Node.js is installed and dependencies are installed with `npm install`

2. **Browser errors**: Run `npx playwright install` to ensure all browser binaries are installed

3. **Connection issues**: Check that the MCP server path is correct in your settings

## License

MIT

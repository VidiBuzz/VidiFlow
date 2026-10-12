#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';

let browser;
let page;
let context;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

async function getPage() {
  const browser = await getBrowser();
  if (!context) {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }
  if (!page) {
    page = await context.newPage();
  }
  return page;
}

const server = new Server(
  {
    name: 'mcp-playwright-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'playwright_navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to navigate to',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'playwright_screenshot',
        description: 'Take a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name for the screenshot',
            },
            savePng: {
              type: 'boolean',
              description: 'Whether to save screenshot as PNG file',
            },
            path: {
              type: 'string',
              description: 'Path to save the screenshot (if savePng is true)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'playwright_click',
        description: 'Click an element on the page',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for element to click',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'playwright_fill',
        description: 'Fill out an input field',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for input field',
            },
            value: {
              type: 'string',
              description: 'Value to fill',
            },
          },
          required: ['selector', 'value'],
        },
      },
      {
        name: 'playwright_select',
        description: 'Select an element on the page with Select tag',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for element to select',
            },
            value: {
              type: 'string',
              description: 'Value to select',
            },
          },
          required: ['selector', 'value'],
        },
      },
      {
        name: 'playwright_hover',
        description: 'Hover an element on the page',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for element to hover',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'playwright_evaluate',
        description: 'Execute JavaScript on the page',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'JavaScript code to execute',
            },
          },
          required: ['script'],
        },
      },
      {
        name: 'playwright_get',
        description: 'Get the page HTML content or perform actions',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              description: 'Action to perform: html, text, url, title',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'playwright_wait',
        description: 'Wait for a specified time in milliseconds',
        inputSchema: {
          type: 'object',
          properties: {
            ms: {
              type: 'number',
              description: 'Milliseconds to wait',
            },
          },
          required: ['ms'],
        },
      },
      {
        name: 'playwright_wait_for_selector',
        description: 'Wait for a selector to appear on the page',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector to wait for',
            },
            state: {
              type: 'string',
              description: 'Wait state: visible, hidden, attached, detached',
              enum: ['visible', 'hidden', 'attached', 'detached'],
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'playwright_close',
        description: 'Close the browser',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'playwright_navigate': {
        const page = await getPage();
        await page.goto(args.url, { waitUntil: 'networkidle' });
        return {
          content: [
            {
              type: 'text',
              text: `Navigated to ${args.url}`,
            },
          ],
        };
      }

      case 'playwright_screenshot': {
        const page = await getPage();
        const options = {
          fullPage: true,
          type: args.savePng ? 'png' : 'jpeg',
          quality: args.savePng ? undefined : 80,
        };
        
        const screenshot = await page.screenshot(options);
        
        if (args.savePng && args.path) {
          await page.screenshot({ ...options, path: args.path });
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot taken: ${args.name}`,
            },
            {
              type: 'image',
              data: screenshot.toString('base64'),
              mimeType: args.savePng ? 'image/png' : 'image/jpeg',
            },
          ],
        };
      }

      case 'playwright_click': {
        const page = await getPage();
        await page.click(args.selector);
        return {
          content: [
            {
              type: 'text',
              text: `Clicked on ${args.selector}`,
            },
          ],
        };
      }

      case 'playwright_fill': {
        const page = await getPage();
        await page.fill(args.selector, args.value);
        return {
          content: [
            {
              type: 'text',
              text: `Filled ${args.selector} with value`,
            },
          ],
        };
      }

      case 'playwright_select': {
        const page = await getPage();
        await page.selectOption(args.selector, args.value);
        return {
          content: [
            {
              type: 'text',
              text: `Selected ${args.selector} with value ${args.value}`,
            },
          ],
        };
      }

      case 'playwright_hover': {
        const page = await getPage();
        await page.hover(args.selector);
        return {
          content: [
            {
              type: 'text',
              text: `Hovered over ${args.selector}`,
            },
          ],
        };
      }

      case 'playwright_evaluate': {
        const page = await getPage();
        const result = await page.evaluate(args.script);
        return {
          content: [
            {
              type: 'text',
              text: `JavaScript execution result: ${JSON.stringify(result)}`,
            },
          ],
        };
      }

      case 'playwright_get': {
        const page = await getPage();
        let result;
        switch (args.action) {
          case 'html':
            result = await page.content();
            break;
          case 'text':
            result = await page.textContent('body');
            break;
          case 'url':
            result = page.url();
            break;
          case 'title':
            result = await page.title();
            break;
          default:
            result = await page.content();
        }
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result),
            },
          ],
        };
      }

      case 'playwright_wait': {
        await new Promise(resolve => setTimeout(resolve, args.ms));
        return {
          content: [
            {
              type: 'text',
              text: `Waited for ${args.ms}ms`,
            },
          ],
        };
      }

      case 'playwright_wait_for_selector': {
        const page = await getPage();
        await page.waitForSelector(args.selector, { state: args.state || 'visible' });
        return {
          content: [
            {
              type: 'text',
              text: `Waited for selector ${args.selector}`,
            },
          ],
        };
      }

      case 'playwright_close': {
        if (page) {
          await page.close();
          page = null;
        }
        if (context) {
          await context.close();
          context = null;
        }
        if (browser) {
          await browser.close();
          browser = null;
        }
        return {
          content: [
            {
              type: 'text',
              text: 'Browser closed',
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Playwright MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

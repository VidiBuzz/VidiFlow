#!/usr/bin/env python3
"""
MCP Server: Date/Time Provider
Provides current date/time to LLMs through MCP protocol
"""

import asyncio
import json
import datetime
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
)

app = Server("date-time-server")


async def get_current_date_time() -> list[TextContent]:
    """
    Returns current date and time with full details
    """
    now = datetime.datetime.now()

    response = f"""
CURRENT DATE AND TIME INFORMATION:

Date: {now.strftime("%A, %B %d, %Y")}
Time: {now.strftime("%I:%M:%S %p")}
Day of week: {now.strftime("%A")}
Week number: {now.isocalendar()[1]}
Quarter: {(now.month - 1) // 3 + 1}
ISO Year: {now.isocalendar()[0]}

Unix Timestamp: {int(now.timestamp())}

IMPORTANT FOR LLM:
- This is the ACTUAL current time
- Your knowledge cutoff is IRRELEVANT
- For time-sensitive queries: SEARCH THE WEB FIRST
- Never assume information from 2023 or earlier is still current
- For tech, APIs, libraries, pricing, news: VERIFY with current data
"""

    return [TextContent(type="text", text=response.strip())]


async def get_date_warning() -> list[TextContent]:
    """
    Returns a warning prompt for time-sensitive queries
    """
    now = datetime.datetime.now()

    warning = f"""
⚠️ TIME-SENSITIVE QUERY WARNING ⚠️
Current Date: {now.strftime("%B %d, %Y")}
Current Time: {now.strftime("%I:%M %p on %A")}

YOU ARE RESPONDING IN REAL-TIME. YOUR KNOWLEDGE CUTOFF IS IRRELEVANT.

For the following query types, YOU MUST SEARCH THE WEB FIRST:
- News, events, company status
- Prices, rates, stock prices
- API endpoints that might have changed
- Installation methods (npm, pip, etc)
- Library versions and features
- Product availability or status
- Anything that could have changed in the last 2 years

If you don't have web search access: EXPLICITLY STATE "I cannot verify current information without web search"

Your default behavior: Verify time-sensitive information. Don't guess.
"""

    return [TextContent(type="text", text=warning.strip())]


async def get_formatted_date() -> list[TextContent]:
    """
    Returns date in multiple formats
    """
    now = datetime.datetime.now()

    formats = {
        "Date Only": now.strftime("%B %d, %Y"),
        "Date & Time": now.strftime("%B %d, %Y at %I:%M %p"),
        "Full": now.strftime("%A, %B %d, %Y at %I:%M:%S %p"),
        "ISO": now.isoformat(),
        "Unix": str(int(now.timestamp())),
        "Short": now.strftime("%m/%d/%Y"),
        "European": now.strftime("%d/%m/%Y"),
    }

    result = "CURRENT DATE IN MULTIPLE FORMATS:\n\n"
    for name, formatted in formats.items():
        result += f"{name}: {formatted}\n"

    return [TextContent(type="text", text=result.strip())]


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="get_current_date_time",
            description="Get the current date, time, and timezone information. Use this for any time-sensitive queries.",
        ),
        Tool(
            name="get_date_warning",
            description="Get a warning prompt about time-sensitive queries that should be included in responses",
        ),
        Tool(
            name="get_formatted_date",
            description="Get the current date in various formats for use in prompts or system messages",
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls"""
    if name == "get_current_date_time":
        return await get_current_date_time()
    elif name == "get_date_warning":
        return await get_date_warning()
    elif name == "get_formatted_date":
        return await get_formatted_date()
    else:
        return [TextContent(type="text", text=f"Error: Unknown tool '{name}'")]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())

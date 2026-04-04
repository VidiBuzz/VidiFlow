#!/usr/bin/env python3
"""
LM Studio + Tavily - Tool Call Interceptor
Catches and fixes broken tool calls from GLM/Qwen models
"""

import requests
import json
import os
import re
from datetime import datetime

# ===== CONFIGURATION =====
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "YOUR_TAVILY_API_KEY_HERE")
TAVILY_API_URL = "https://api.tavily.com/search"


def extract_tool_call(text: str) -> dict:
    """
    Extract tool call parameters from malformed model output
    Handles formats like:
    <tool_call>tavily_search <arg_key>query</arg_key> <arg_value>search term</arg_value>...
    """
    tool_call = {
        "detected": False,
        "tool": None,
        "args": {}
    }

    # Check if it's a tool call attempt
    if "<tool_call>" in text or "tavily_search" in text.lower():
        tool_call["detected"] = True
        tool_call["tool"] = "tavily_search"

        # Extract query
        query_patterns = [
            r'<arg_key>query</arg_key>\s*<arg_value>([^<]+)</arg_value>',
            r'query["\']?\s*[:=]\s*["\']([^"\']+)["\']',
            r'tavily_search\s+["\']?([^"\'<]+)["\']?',
        ]

        for pattern in query_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                tool_call["args"]["query"] = match.group(1).strip()
                break

        # Extract max_results
        max_results_match = re.search(r'<arg_key>max_results</arg_key>\s*<arg_value>(\d+)</arg_value>', text)
        if max_results_match:
            tool_call["args"]["max_results"] = int(max_results_match.group(1))
        else:
            tool_call["args"]["max_results"] = 5

        # Extract search_depth
        depth_match = re.search(r'<arg_key>search_depth</arg_key>\s*<arg_value>(\w+)</arg_value>', text)
        if depth_match:
            depth = depth_match.group(1).lower()
            tool_call["args"]["search_depth"] = "basic" if depth == "fast" else depth
        else:
            tool_call["args"]["search_depth"] = "basic"

    return tool_call


def tavily_search(query: str, max_results: int = 5, search_depth: str = "basic") -> dict:
    """Execute real Tavily search"""

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "max_results": max_results,
        "search_depth": search_depth,
        "include_answer": True,
        "include_raw_content": False,
        "include_images": False
    }

    print(f"\n🔍 EXECUTING TAVILY SEARCH")
    print(f"   Query: {query}")
    print(f"   Max results: {max_results}")
    print(f"   Depth: {search_depth}")

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=15)

        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Got {len(data.get('results', []))} results\n")
            return data
        else:
            print(f"   ❌ Error: {response.status_code}\n")
            return {"error": f"API Error {response.status_code}"}

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}\n")
        return {"error": str(e)}


def format_search_results(results: dict) -> str:
    """Format Tavily results for model consumption"""

    if "error" in results:
        return f"Search Error: {results['error']}"

    output = "\n" + "=" * 70 + "\n"
    output += "TAVILY SEARCH RESULTS\n"
    output += "=" * 70 + "\n\n"

    # Quick answer
    if "answer" in results and results["answer"]:
        output += f"Quick Answer: {results['answer']}\n\n"

    # Sources
    if "results" in results and results["results"]:
        output += f"Sources ({len(results['results'])} found):\n\n"

        for idx, result in enumerate(results["results"], 1):
            output += f"[{idx}] {result.get('title', 'No title')}\n"
            output += f"URL: {result.get('url', 'N/A')}\n"
            output += f"Content: {result.get('content', '')[:400]}\n"
            if idx < len(results["results"]):
                output += "\n"

    output += "\n" + "=" * 70 + "\n"
    return output


def chat_with_tools(user_message: str, conversation_history: list) -> tuple:
    """
    Chat with LM Studio with tool call interception
    Returns: (response_text, tool_was_called)
    """

    current_time = datetime.now()

    # System prompt with tool instructions
    system_prompt = f"""CURRENT DATE & TIME: {current_time.strftime("%B %d, %Y at %I:%M %p")}

You are an AI assistant with access to the Tavily search tool.

WHEN TO USE TAVILY:
- For current events, news, prices, weather
- For recent information after your knowledge cutoff
- For fact-checking time-sensitive information
- For research on specific topics

TOOL FORMAT:
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>your search query here</arg_value>
<arg_key>max_results</arg_key>
<arg_value>5</arg_value>
<arg_key>search_depth</arg_key>
<arg_value>basic</arg_value>
</tool_call>

If you need to search, output ONLY the tool call, nothing else.
If search results are provided, answer using them and cite sources.
"""

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    # First request to LLM
    try:
        print("\n💬 Sending to LM Studio...\n")

        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": "local-model",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stop": ["</tool_call>", "\n\n\n"]  # Stop at tool call end
            },
            timeout=60
        )

        if response.status_code != 200:
            return f"❌ LM Studio Error: {response.status_code}", False

        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]

        print(f"🤖 Model output:\n{ai_response[:200]}...\n")

        # Check for tool call
        tool_call = extract_tool_call(ai_response)

        if tool_call["detected"] and "query" in tool_call["args"]:
            print("🔧 TOOL CALL DETECTED!\n")

            # Execute the search
            search_results = tavily_search(
                query=tool_call["args"]["query"],
                max_results=tool_call["args"].get("max_results", 5),
                search_depth=tool_call["args"].get("search_depth", "basic")
            )

            # Format results
            formatted_results = format_search_results(search_results)

            print(formatted_results)

            # Send results back to model
            messages.append({"role": "assistant", "content": ai_response})
            messages.append({
                "role": "system",
                "content": f"Tool execution results:\n{formatted_results}\n\nNow answer the user's original question using these search results."
            })

            # Get final response
            print("\n💬 Getting final response from LM Studio...\n")

            response2 = requests.post(
                LM_STUDIO_URL,
                json={
                    "model": "local-model",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2000
                },
                timeout=60
            )

            if response2.status_code == 200:
                final_result = response2.json()
                return final_result["choices"][0]["message"]["content"], True
            else:
                return formatted_results + "\n\n(Model failed to generate final response)", True

        else:
            # No tool call, return response as-is
            return ai_response, False

    except Exception as e:
        return f"❌ Error: {str(e)}", False


def main():
    print("=" * 70)
    print("🚀 LM Studio + Tavily - Tool Call Interceptor")
    print("=" * 70)
    print()
    print("This intercepts and fixes broken tool calls from GLM/Qwen models")
    print()

    # Check API key
    if TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
        print("❌ ERROR: Set TAVILY_API_KEY first!")
        print("   export TAVILY_API_KEY='tvly-your-key'")
        print()
        print("Get a key from: https://tavily.com")
        return

    print("✅ Tavily API key found")
    print()
    print("📋 Commands:")
    print("   /clear  - Clear conversation history")
    print("   /exit   - Quit")
    print()
    print("💡 Just ask questions normally - the model will call Tavily when needed")
    print()
    print("=" * 70)

    conversation_history = []

    while True:
        try:
            user_input = input("\n\nYou: ").strip()

            if not user_input:
                continue

            # Handle commands
            if user_input.lower() in ["/exit", "/quit"]:
                print("\n👋 Goodbye!")
                break

            elif user_input.lower() == "/clear":
                conversation_history = []
                print("\n🧹 Conversation cleared")
                continue

            # Get response with tool support
            response, tool_used = chat_with_tools(user_input, conversation_history)

            # Display response
            print(f"\n{'🔍' if tool_used else '🤖'} AI:\n{response}")

            # Update history
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})

            # Keep last 10 messages
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()

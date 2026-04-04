#!/usr/bin/env python3
"""
LM Studio + Tavily - ChatML Format
Optimized for GLM 4.7, GLM 4.6v, Qwen 3 VL with ChatML template
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

# ChatML template markers
CHATML_SYSTEM_START = "<|im_start|>system"
CHATML_SYSTEM_END = "<|im_end|>"
CHATML_USER_START = "<|im_start|>user"
CHATML_USER_END = "<|im_end|>"
CHATML_ASSISTANT_START = "<|im_start|>assistant"
CHATML_ASSISTANT_END = "<|im_end|>"


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

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=15)

        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Got {len(data.get('results', []))} results\n")
            return data
        elif response.status_code == 401:
            print(f"   ❌ Authentication failed - check API key\n")
            return {"error": "Invalid Tavily API key"}
        elif response.status_code == 429:
            print(f"   ❌ Rate limit exceeded\n")
            return {"error": "Rate limit exceeded - try again later"}
        else:
            print(f"   ❌ Error: {response.status_code}\n")
            return {"error": f"API Error {response.status_code}"}

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}\n")
        return {"error": str(e)}


def format_search_results(results: dict) -> str:
    """Format Tavily results for ChatML models"""

    if "error" in results:
        return f"❌ Search Error: {results['error']}"

    output = "\n" + "=" * 70 + "\n"
    output += "TAVILY SEARCH RESULTS\n"
    output += "=" * 70 + "\n\n"

    # Quick answer
    if "answer" in results and results["answer"]:
        output += f"📝 QUICK ANSWER:\n{results['answer']}\n\n"

    # Sources
    if "results" in results and results["results"]:
        output += f"🔗 SOURCES ({len(results['results'])} found):\n\n"

        for idx, result in enumerate(results["results"], 1):
            output += f"[{idx}] {result.get('title', 'No title')}\n"
            output += f"    URL: {result.get('url', 'N/A')}\n"

            content = result.get('content', '')
            if content:
                # Truncate long content
                if len(content) > 500:
                    content = content[:500] + "..."
                output += f"    Summary: {content}\n"

            output += "\n"

    output += "=" * 70 + "\n"
    output += "Use the above search results to answer the question. Cite sources by number [1], [2], etc.\n"
    output += "=" * 70 + "\n"
    return output


def extract_tool_call_chatml(text: str) -> dict:
    """
    Extract tool call from ChatML-formatted model output
    Handles various formats that GLM/Qwen models might use
    """
    tool_call = {
        "detected": False,
        "tool": None,
        "query": None
    }

    text_lower = text.lower()

    # Check for explicit tool call markers
    if "tavily" in text_lower or "<tool" in text_lower or "search(" in text_lower:
        tool_call["detected"] = True
        tool_call["tool"] = "tavily_search"

        # Try multiple extraction patterns
        patterns = [
            # XML-style: <tool_call>tavily_search <arg_key>query</arg_key> <arg_value>text</arg_value>
            r'<arg_key>query</arg_key>\s*<arg_value>([^<]+)</arg_value>',
            # Function style: tavily_search(query="text")
            r'tavily_search\s*\(\s*query\s*=\s*["\']([^"\']+)["\']',
            # JSON style: {"query": "text"}
            r'"query"\s*:\s*"([^"]+)"',
            # Simple: tavily_search "text"
            r'tavily_search\s+["\']([^"\']+)["\']',
            # After colon: query: text
            r'query\s*:\s*([^\n<]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                tool_call["query"] = match.group(1).strip()
                break

    return tool_call


def chat_with_tavily(user_message: str, conversation_history: list, auto_search: bool = True) -> tuple:
    """
    Chat with LM Studio using ChatML format with Tavily integration
    Returns: (response_text, search_was_used)
    """

    current_time = datetime.now()

    # Build ChatML-formatted system prompt with tool instructions
    system_content = f"""You are a helpful AI assistant with access to real-time web search via Tavily.

CURRENT DATE & TIME: {current_time.strftime("%B %d, %Y at %I:%M %p")}

TOOL AVAILABLE: tavily_search
When you need current information, recent events, or facts beyond your knowledge, use:
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>your search query here</arg_value>
</tool_call>

IMPORTANT:
- Use search for: current events, recent news, prices, weather, latest information
- Don't use search for: general knowledge, coding help, explanations of concepts
- When you call the tool, output ONLY the tool call, nothing else
- After receiving search results, answer the question and cite sources [1], [2], etc.
"""

    # Build messages array for LM Studio API
    messages = [{"role": "system", "content": system_content}]

    # Add conversation history
    messages.extend(conversation_history)

    # Add current user message
    messages.append({"role": "user", "content": user_message})

    # Make initial request to LM Studio
    try:
        print("\n💬 Sending to LM Studio (ChatML format)...\n")

        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": "local-model",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stop": ["<|im_end|>", "</tool_call>"]
            },
            timeout=60
        )

        if response.status_code != 200:
            error_msg = f"❌ LM Studio Error: {response.status_code}\n{response.text}"
            print(error_msg)
            return error_msg, False

        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]

        # Show what the model said
        print(f"🤖 Model initial output:\n{ai_response[:300]}{'...' if len(ai_response) > 300 else ''}\n")

        # Check if model is trying to call a tool
        tool_call = extract_tool_call_chatml(ai_response)

        if tool_call["detected"] and tool_call["query"] and auto_search:
            print("🔧 TOOL CALL DETECTED!\n")

            # Execute Tavily search
            search_results = tavily_search(query=tool_call["query"], max_results=5)
            formatted_results = format_search_results(search_results)

            print(formatted_results)

            # Send results back to model for final answer
            messages.append({"role": "assistant", "content": ai_response})
            messages.append({
                "role": "user",
                "content": f"Here are the search results:\n\n{formatted_results}\n\nNow please answer my original question using these results."
            })

            print("\n💬 Getting final answer from model...\n")

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
                final_answer = final_result["choices"][0]["message"]["content"]
                return final_answer, True
            else:
                # Return search results even if final generation fails
                return formatted_results + "\n\n(Model failed to generate final answer)", True

        else:
            # No tool call needed or detected
            return ai_response, False

    except requests.exceptions.Timeout:
        return "❌ Request timeout - LM Studio took too long to respond", False
    except requests.exceptions.ConnectionError:
        return "❌ Cannot connect to LM Studio. Is the server running on http://localhost:1234?", False
    except Exception as e:
        return f"❌ Error: {str(e)}", False


def main():
    print("=" * 70)
    print("🚀 LM Studio + Tavily - ChatML Format")
    print("=" * 70)
    print()
    print("Optimized for GLM 4.7, GLM 4.6v, Qwen 3 VL")
    print()

    # Check API key
    if TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
        print("⚠️  WARNING: Tavily API key not set!")
        print()
        print("Set it with:")
        print("  export TAVILY_API_KEY='tvly-your-key-here'")
        print()
        print("Get free key from: https://tavily.com")
        print()
        response = input("Continue without search capability? (y/n): ")
        if response.lower() != 'y':
            return
        print()

    print("✅ Ready to chat with Tavily search support")
    print()
    print("📋 IMPORTANT - LM Studio Settings:")
    print("   1. Load your GLM or Qwen model")
    print("   2. Go to 'Developer' tab → 'Server' → 'Start Server'")
    print("   3. In model settings, set 'Prompt Format' to: ChatML")
    print("      (or auto-detect if available)")
    print()
    print("💬 Commands:")
    print("   /search <query>  - Force search for specific query")
    print("   /clear           - Clear conversation history")
    print("   /exit            - Quit")
    print()
    print("Just ask questions normally - model will call Tavily when needed!")
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
                print("\n🧹 Conversation history cleared")
                continue

            elif user_input.lower().startswith("/search "):
                # Manual search command
                query = user_input[8:].strip()
                if not query:
                    print("❌ Usage: /search <your query>")
                    continue

                print(f"\n🔍 Forcing search for: {query}")
                results = tavily_search(query, max_results=5)
                formatted = format_search_results(results)
                print(formatted)

                # Ask model to summarize
                response, _ = chat_with_tavily(
                    f"Summarize these search results about '{query}':\n{formatted}",
                    conversation_history,
                    auto_search=False
                )
                print(f"\n🤖 AI:\n{response}")

                conversation_history.append({"role": "user", "content": query})
                conversation_history.append({"role": "assistant", "content": response})
                continue

            # Normal chat with auto-search
            response, search_used = chat_with_tavily(user_input, conversation_history)

            # Display response
            icon = "🔍" if search_used else "🤖"
            print(f"\n{icon} AI:\n{response}")

            # Update conversation history
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})

            # Keep last 20 messages (10 exchanges)
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
LM Studio + Tavily Integration - EXPLICIT MODE
Forces real Tavily searches, prevents model hallucination
"""

import requests
import json
import os
from datetime import datetime

# ===== CONFIGURATION =====
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "YOUR_TAVILY_API_KEY_HERE")
TAVILY_API_URL = "https://api.tavily.com/search"


def tavily_search(query: str, max_results: int = 5) -> dict:
    """
    REAL Tavily search - actually calls the API
    """
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "max_results": max_results,
        "search_depth": "basic",
        "include_answer": True,
        "include_raw_content": False,
        "include_images": False
    }

    print(f"\n🔍 CALLING REAL TAVILY API...")
    print(f"   Query: {query}")

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=10)

        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Got {len(data.get('results', []))} results")
            return data
        else:
            print(f"   ❌ Error: {response.text}")
            return {"error": f"API Error {response.status_code}: {response.text}"}

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return {"error": f"Connection failed: {str(e)}"}


def format_search_results(results: dict) -> str:
    """Format Tavily results for the LLM"""

    if "error" in results:
        return f"❌ SEARCH FAILED: {results['error']}"

    output = "=" * 60 + "\n"
    output += "ACTUAL TAVILY SEARCH RESULTS (from real API call)\n"
    output += "=" * 60 + "\n\n"

    # Quick answer
    if "answer" in results and results["answer"]:
        output += f"📝 QUICK ANSWER:\n{results['answer']}\n\n"

    # Individual results
    if "results" in results and results["results"]:
        output += f"🔗 SOURCES ({len(results['results'])} found):\n\n"

        for idx, result in enumerate(results["results"], 1):
            output += f"[{idx}] {result.get('title', 'No title')}\n"
            output += f"    URL: {result.get('url', 'N/A')}\n"
            output += f"    Content: {result.get('content', 'No content')[:300]}...\n"
            output += f"    Score: {result.get('score', 'N/A')}\n\n"

    output += "=" * 60 + "\n"
    output += "END OF REAL SEARCH RESULTS\n"
    output += "=" * 60 + "\n"

    return output


def chat_with_lmstudio(user_message: str, search_results: str = None) -> str:
    """
    Send message to LM Studio with optional search results
    """

    current_time = datetime.now()

    # Build system prompt
    system_prompt = f"""CURRENT DATE & TIME: {current_time.strftime("%B %d, %Y at %I:%M %p")}

YOU ARE AN AI ASSISTANT WITH WEB SEARCH CAPABILITIES.

CRITICAL RULES:
1. When search results are shown below, they are REAL data from Tavily API
2. You MUST use the actual search results provided, not your imagination
3. NEVER say "Tavily is working" or "I can search" - just answer using the results
4. If search results are provided, cite the sources by number [1], [2], etc.
5. If NO search results provided, say you don't have current information

REMEMBER: The search results below (if any) are REAL API responses, not hypothetical.
"""

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]

    # Add search results if available
    if search_results:
        messages.append({
            "role": "system",
            "content": f"\n{search_results}\n\nNow answer the user's question using ONLY the above search results."
        })

    # Add user message
    messages.append({"role": "user", "content": user_message})

    # Call LM Studio
    try:
        print("\n💬 Sending to LM Studio...")

        response = requests.post(
            LM_STUDIO_URL,
            json={
                "model": "local-model",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000
            },
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"❌ LM Studio Error: {response.status_code}\n{response.text}"

    except Exception as e:
        return f"❌ Connection error: {str(e)}\n\nIs LM Studio server running?"


def main():
    print("=" * 70)
    print("🚀 LM Studio + Tavily - EXPLICIT MODE")
    print("=" * 70)
    print()
    print("This version makes REAL Tavily API calls (no hallucination)")
    print()

    # Check API key
    if TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
        print("❌ ERROR: No Tavily API key set!")
        print()
        print("Set it with:")
        print("  export TAVILY_API_KEY='tvly-your-key'")
        print()
        print("Get a key from: https://tavily.com")
        return

    print("✅ Tavily API key found")
    print()
    print("Commands:")
    print("  /search <query>  - Search and answer")
    print("  /test            - Test Tavily connection")
    print("  /exit            - Quit")
    print()
    print("=" * 70)
    print()

    while True:
        try:
            user_input = input("\nYou: ").strip()

            if not user_input:
                continue

            # Handle commands
            if user_input.lower() in ["/exit", "/quit"]:
                print("\n👋 Goodbye!")
                break

            elif user_input.lower() == "/test":
                print("\n🧪 Testing Tavily connection...")
                test_results = tavily_search("test query", max_results=2)
                if "error" not in test_results:
                    print("✅ Tavily is working correctly!")
                    print(f"   Got {len(test_results.get('results', []))} results")
                else:
                    print("❌ Tavily test failed!")
                    print(f"   {test_results['error']}")
                continue

            elif user_input.lower().startswith("/search "):
                query = user_input[8:].strip()
                if not query:
                    print("❌ Usage: /search <your question>")
                    continue

                # Perform REAL search
                search_data = tavily_search(query, max_results=5)
                formatted_results = format_search_results(search_data)

                print("\n" + formatted_results)
                print()

                # Send to LM Studio with results
                response = chat_with_lmstudio(query, formatted_results)

                print(f"\n🤖 AI Response:\n{response}\n")

            else:
                # Regular chat without search
                response = chat_with_lmstudio(user_input)
                print(f"\n🤖 AI: {response}\n")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")


if __name__ == "__main__":
    main()

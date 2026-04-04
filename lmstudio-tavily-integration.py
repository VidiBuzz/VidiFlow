#!/usr/bin/env python3
"""
LM Studio + Tavily Search Integration
Enables web search capabilities for LM Studio models (GLM 4.7, GLM 4.6v)
"""

import requests
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

# ===== CONFIGURATION =====
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "local-model"  # Will auto-detect from LM Studio

# Get Tavily API key from environment or set it here
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "YOUR_TAVILY_API_KEY_HERE")
TAVILY_API_URL = "https://api.tavily.com/search"


class TavilySearch:
    """Tavily Search API wrapper"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = TAVILY_API_URL

    def search(self, query: str, max_results: int = 5, search_depth: str = "basic") -> Dict:
        """
        Perform Tavily search

        Args:
            query: Search query
            max_results: Number of results to return (1-10)
            search_depth: "basic" or "advanced"

        Returns:
            Dictionary with search results
        """
        payload = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": search_depth,
            "include_answer": True,  # Get AI-generated answer
            "include_raw_content": False,  # Set to True if you need full content
            "include_images": False
        }

        try:
            response = requests.post(self.api_url, json=payload)

            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"Tavily API error: {response.status_code}",
                    "details": response.text
                }
        except Exception as e:
            return {
                "error": f"Connection error: {str(e)}"
            }

    def format_results(self, results: Dict) -> str:
        """Format Tavily results for LLM consumption"""
        if "error" in results:
            return f"Search Error: {results['error']}"

        formatted = "SEARCH RESULTS:\n\n"

        # Include AI-generated answer if available
        if "answer" in results and results["answer"]:
            formatted += f"Quick Answer: {results['answer']}\n\n"

        # Include individual results
        if "results" in results:
            formatted += "Sources:\n"
            for idx, result in enumerate(results["results"], 1):
                formatted += f"{idx}. {result.get('title', 'No title')}\n"
                formatted += f"   URL: {result.get('url', 'N/A')}\n"
                formatted += f"   {result.get('content', 'No content')}\n\n"

        return formatted


class LMStudioWithSearch:
    """LM Studio client with Tavily search integration"""

    def __init__(self, lm_studio_url: str, tavily_api_key: str):
        self.lm_studio_url = lm_studio_url
        self.tavily = TavilySearch(tavily_api_key)
        self.conversation_history = []

    def detect_search_need(self, message: str) -> bool:
        """
        Detect if message requires web search
        Simple heuristic - can be improved with LLM classification
        """
        search_keywords = [
            "search", "look up", "find", "latest", "current", "news",
            "today", "recent", "what is", "who is", "when did",
            "price", "stock", "weather", "happening now"
        ]

        message_lower = message.lower()
        return any(keyword in message_lower for keyword in search_keywords)

    def chat(self, message: str, use_search: Optional[bool] = None) -> str:
        """
        Send message to LM Studio with optional search

        Args:
            message: User message
            use_search: Force search on/off, or None for auto-detection

        Returns:
            AI response
        """
        # Determine if search is needed
        should_search = use_search if use_search is not None else self.detect_search_need(message)

        # Perform search if needed
        search_context = ""
        if should_search:
            print("🔍 Searching the web...")
            search_results = self.tavily.search(message)
            search_context = self.tavily.format_results(search_results)
            print(f"✅ Found {len(search_results.get('results', []))} results\n")

        # Build system prompt
        current_time = datetime.now()
        system_prompt = f"""CURRENT DATE & TIME: {current_time.strftime("%B %d, %Y at %I:%M %p")}

You are an AI assistant with access to current web information via Tavily search.

IMPORTANT INSTRUCTIONS:
- When search results are provided, use them to answer accurately
- Always cite sources when using search results
- If search results are insufficient, acknowledge what's missing
- For time-sensitive queries, prioritize recent information
- Be honest about your knowledge cutoff when search isn't available

Search is {'ENABLED' if should_search else 'DISABLED'} for this query.
"""

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add search context if available
        if search_context:
            messages.append({
                "role": "system",
                "content": f"Web Search Results for your reference:\n\n{search_context}"
            })

        # Add conversation history
        messages.extend(self.conversation_history)

        # Add current message
        messages.append({"role": "user", "content": message})

        # Call LM Studio
        try:
            response = requests.post(
                self.lm_studio_url,
                json={
                    "model": MODEL_NAME,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )

            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]

                # Update conversation history
                self.conversation_history.append({"role": "user", "content": message})
                self.conversation_history.append({"role": "assistant", "content": ai_response})

                # Limit history to last 10 messages
                if len(self.conversation_history) > 10:
                    self.conversation_history = self.conversation_history[-10:]

                return ai_response
            else:
                return f"❌ LM Studio Error: {response.status_code} - {response.text}"

        except Exception as e:
            return f"❌ Connection error: {str(e)}\n\nMake sure LM Studio is running with server enabled."

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        print("🧹 Conversation history cleared")


def main():
    """Interactive chat with LM Studio + Tavily"""

    print("=" * 60)
    print("🚀 LM Studio + Tavily Search Integration")
    print("=" * 60)
    print()

    # Check Tavily API key
    if TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
        print("⚠️  WARNING: Tavily API key not set!")
        print()
        print("To enable search:")
        print("1. Get API key from: https://tavily.com")
        print("2. Set environment variable:")
        print("   export TAVILY_API_KEY='your-key-here'")
        print("   OR")
        print("3. Edit this script and set TAVILY_API_KEY")
        print()
        response = input("Continue without search? (y/n): ")
        if response.lower() != 'y':
            return
        print()

    print("📋 Setup Instructions:")
    print("1. Make sure LM Studio is running")
    print("2. Load your GLM 4.7 or GLM 4.6v model")
    print("3. Enable 'Local Server' in LM Studio")
    print()
    print("💬 Commands:")
    print("  /search <query>  - Force web search")
    print("  /nosearch        - Disable search for next message")
    print("  /clear           - Clear conversation history")
    print("  /exit or /quit   - Exit chat")
    print()
    print("=" * 60)
    print()

    # Initialize chat
    chat = LMStudioWithSearch(LM_STUDIO_URL, TAVILY_API_KEY)
    force_search = None

    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            # Handle commands
            if user_input.startswith("/"):
                if user_input.lower() in ["/exit", "/quit"]:
                    print("\n👋 Goodbye!")
                    break

                elif user_input.lower() == "/clear":
                    chat.clear_history()
                    continue

                elif user_input.lower() == "/nosearch":
                    force_search = False
                    print("🔇 Search disabled for next message")
                    continue

                elif user_input.lower().startswith("/search "):
                    query = user_input[8:].strip()
                    if query:
                        force_search = True
                        user_input = query
                    else:
                        print("❌ Usage: /search <your query>")
                        continue

                else:
                    print(f"❌ Unknown command: {user_input}")
                    continue

            # Process message
            print()
            response = chat.chat(user_input, use_search=force_search)
            print(f"\n🤖 AI: {response}\n")

            # Reset search override
            force_search = None

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")


if __name__ == "__main__":
    main()

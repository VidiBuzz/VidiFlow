#!/usr/bin/env python3
"""
Quick Tavily API Test - Verify it's working
"""

import requests
import os
import json

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "YOUR_TAVILY_API_KEY_HERE")
TAVILY_API_URL = "https://api.tavily.com/search"

def test_tavily():
    print("=" * 60)
    print("🧪 TAVILY API TEST")
    print("=" * 60)
    print()

    # Check API key
    if TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
        print("❌ No API key set!")
        print()
        print("Set it with:")
        print("  export TAVILY_API_KEY='tvly-your-key-here'")
        print()
        print("Get a key from: https://tavily.com")
        return

    print(f"✅ API Key: {TAVILY_API_KEY[:10]}...{TAVILY_API_KEY[-4:]}")
    print()

    # Test search
    print("🔍 Testing search: 'What is artificial intelligence?'")
    print()

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": "What is artificial intelligence?",
        "max_results": 3,
        "search_depth": "basic",
        "include_answer": True
    }

    try:
        print("📡 Calling Tavily API...")
        response = requests.post(TAVILY_API_URL, json=payload, timeout=10)

        print(f"📊 Status Code: {response.status_code}")
        print()

        if response.status_code == 200:
            data = response.json()

            print("✅ SUCCESS! Tavily is working correctly.")
            print()
            print("=" * 60)
            print("RESPONSE:")
            print("=" * 60)

            # Show answer
            if "answer" in data:
                print(f"\n📝 Quick Answer:\n{data['answer']}\n")

            # Show results
            if "results" in data:
                print(f"🔗 Found {len(data['results'])} results:\n")
                for idx, result in enumerate(data['results'], 1):
                    print(f"[{idx}] {result.get('title', 'No title')}")
                    print(f"    URL: {result.get('url', 'N/A')}")
                    print(f"    Content: {result.get('content', 'N/A')[:150]}...")
                    print()

            print("=" * 60)
            print()
            print("✅ Tavily is ready to use!")
            print()
            print("Next steps:")
            print("1. Run: python3 lmstudio-tavily-explicit.py")
            print("2. Use: /search <your question>")

        elif response.status_code == 401:
            print("❌ AUTHENTICATION FAILED")
            print()
            print("Your API key is invalid. Please check:")
            print("1. Key starts with 'tvly-'")
            print("2. Key is copied correctly from https://tavily.com/dashboard")
            print("3. No extra spaces or quotes")

        elif response.status_code == 429:
            print("❌ RATE LIMIT EXCEEDED")
            print()
            print("You've used all your free searches this month.")
            print("Check usage at: https://tavily.com/dashboard")

        else:
            print(f"❌ ERROR: {response.status_code}")
            print()
            print("Response:")
            print(response.text)

    except requests.exceptions.Timeout:
        print("❌ REQUEST TIMEOUT")
        print("Tavily API took too long to respond. Try again.")

    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR")
        print("Cannot reach Tavily API. Check your internet connection.")

    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

    print()
    print("=" * 60)


if __name__ == "__main__":
    test_tavily()

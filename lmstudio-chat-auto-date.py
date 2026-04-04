#!/usr/bin/env python3
import requests
import json
import datetime
import subprocess

# LM Studio API Configuration
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "local-model"  # This should match your loaded model name


def get_auto_updated_prompt():
    """Read the auto-updated prompt file"""
    try:
        with open("/tmp/lm-studio-auto-date-prompt.txt", "r") as f:
            return f.read()
    except FileNotFoundError:
        # Fallback to current date if file doesn't exist
        now = datetime.datetime.now()
        return f"""
CURRENT DATE: {now.strftime("%B %d, %Y")}
CURRENT TIME: {now.strftime("%I:%M %p on %A")}

YOU ARE RUNNING IN REAL-TIME. YOUR KNOWLEDGE CUTOFF IS IRRELEVANT.

MANDATORY RULES FOR TIME-SENSITIVE QUERIES:

1. ALWAYS acknowledge the current date and time
2. For ANY question about news, events, prices, tech, APIs, libraries: YOU MUST SEARCH THE WEB FIRST
3. NEVER assume anything from 2023 or earlier is still current
4. If you don't have search access: EXPLICITLY STATE "I cannot verify current information without web search"
5. Coding questions, installation guides: CHECK if it's changed since 2023

CRITICAL: When unsure if information might be outdated → SEARCH OR STATE UNCERTAINTY

Your default behavior: Verify time-sensitive information. Don't guess.
"""


def chat_with_lmstudio(message, history=[]):
    """Send message to LM Studio with auto-date system prompt"""
    system_prompt = get_auto_updated_prompt()

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        response = requests.post(
            LM_STUDIO_URL,
            json={"model": MODEL_NAME, "messages": messages, "temperature": 0.7},
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Connection error: {str(e)}"


def main():
    print("=== LM Studio Chat with Auto-Date ===")
    print("Make sure LM Studio is running with Server mode enabled")
    print("Run './auto-date-updater.sh' in another terminal for live date updates")
    print("Type 'exit' to quit\n")

    conversation_history = []

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        print("\nThinking...")
        response = chat_with_lmstudio(user_input, conversation_history)

        print(f"\nAI: {response}\n")

        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": response})


if __name__ == "__main__":
    main()

import argparse
import json
import logging
import os
import requests
from flask import Flask, request, jsonify

# --- Configuration ---
OLLAMA_URL = "http://127.0.0.1:11434"
PROXY_PORT = 11435

# 🔑 SET YOUR TAVILY API KEY HERE
# Use environment variable if available, otherwise use this string
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "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")

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - VidiFlowProxy - %(message)s')
logger = logging.getLogger(__name__)

# --- Tavily Search Implementation ---
# --- Tavily Search Implementation (Bulletproof) ---
def perform_tavily_search(query):
    # 1. Validation Clean-up
    if not query or not query.strip():
        return "⚠️ Error: The model tried to search with an empty query."
    
    # 2. Safety Truncate (Tavily hates >400 chars)
    clean_query = query.strip()[:300]
    
    logger.info(f"VidiFlow Search: {clean_query}")
    
    if "YOUR_KEY_HERE" in TAVILY_API_KEY:
        return "❌ Error: VidiFlow Proxy needs your Tavily API Key."

    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": clean_query,
            "include_answer": True,
            "include_images": True,
            "max_results": 5
        }
        
        # 3. Robust Request
        resp = requests.post(url, json=payload, timeout=10) # 10s timeout preventing hangs
        resp.raise_for_status()
        data = resp.json()
        
        answer = data.get("answer", "")
        images = data.get("images", [])
        results = data.get("results", [])
        
        output = [f"### 💡 Quick Answer\n{answer}\n"]
        
        if images:
            output.append("### 🖼️ Visuals")
            for img in images[:3]:
                output.append(f"[![]({img})]({img})")
        
        if results:
            output.append("\n### 🌐 Sources")
            for r in results:
                title = r.get('title', 'Unknown')
                url = r.get('url', '#')
                output.append(f"- [{title}]({url})")
                
        return "\n".join(output)
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"❌ Tavily API Error: {e}")
        return f"Search Engine Error ({e.response.status_code}): Please try a different query."
    except Exception as e:
        logger.error(f"❌ Search Failed: {e}")
        return f"Search Error: {str(e)}"

@app.route('/', methods=['GET'])
def index():
    return "VidiFlow AI Proxy Running"

@app.route('/api/version', methods=['GET'])
def version():
    try:
        return jsonify(requests.get(f"{OLLAMA_URL}/api/version").json())
    except:
        return jsonify({"version": "0.1.0"})

@app.route('/api/tags', methods=['GET'])
def tags():
    try:
        return jsonify(requests.get(f"{OLLAMA_URL}/api/tags").json())
    except:
        return jsonify({"models": []})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    
    # --- SPY MODE: ANALYZE INTENT ---
    print(f"\n📨 INCOMING REQUEST ({len(messages)} msgs)")
    
    # Check for Vision/Images
    has_images = False
    for m in messages:
        if 'images' in m and m['images']:
            has_images = True
            print(f"   IMAGE DETECTED in message role: {m['role']}")
            
    # Check for Function/Task signatures
    if messages:
        last_msg = messages[-1].get('content', '')
        print(f"   User/App asks: {last_msg[:100]}...") # Print first 100 chars
        
    if has_images:
        print("   VISION MODE: Should bypass text injection.")
    else:
        print("   TEXT MODE: Standard injection active.")
    # --------------------------------
    
    # 1. Clean payload (Classic Fix)
    payload = data.copy()
    payload["stream"] = False
    # FIXED FOR KILO: Tools are now passed through to the model
    
    # 2. ReAct Injection (Simpler but with DATE)
    from datetime import datetime
    current_time = datetime.now().strftime("%A, %B %d, %Y")
    
    # --- VIDIFLOW INTELLIGENCE LAYER ---
    from datetime import datetime
    current_time = datetime.now().strftime("%A, %B %d, %Y")
    
    # 1. THE IDENTITY (System Prompt)
    # We must be aggressive here. AppFlowy sends its own system prompt ("You are a helpful assistant...").
    # We need to OVERRIDE or EXTEND it.
    
    identity_prompt = (
        f"\n\nIMPORTANT SYSTEM OVERRIDE:\n"
        f"1. YOUR IDENTITY: You are VidiFlow AI, a specialized intelligence for the VidiSmart ecosystem.\n"
        f"2. YOUR CONTEXT: The current date is {current_time}.\n"
        f"3. YOUR TOOLS: You have a Search Engine. To use it, reply ONLY: SEARCH_ACTION: <query>\n"
        f"4. BEHAVIOR: Do not mention being an AI model. Be concise and helpful."
    )
    
    # Inject into System Message (The "Brain" Context)
    system_found = False
    for m in messages:
        if m['role'] == 'system':
            m['content'] += identity_prompt
            system_found = True
            break
            
    if not system_found:
        # If AppFlowy didn't send one, we make one.
        messages.insert(0, {"role": "system", "content": identity_prompt})

    # 2. THE REMINDER (User Prompt)
    # Models sometimes forget the system prompt. We remind them in the latest user message.
    reminder_prefix = f"[System: You are VidiFlow AI. Date: {current_time}.] "
    
    if messages and messages[-1]['role'] == 'user':
        # Only touch the very last message
        messages[-1]['content'] = reminder_prefix + messages[-1]['content']
        
    payload["messages"] = messages
    
    # DEBUGGING: Print System Prompt to Console so we can SEE it
    print("\n--- DEBUG: PROMPT SENT TO OLLAMA ---")
    for m in payload["messages"]:
        if m['role'] == 'system':
            print(f"SYSTEM: {m['content']}")
    print("------------------------------------\n")

    try:
        # Call 1
        resp = requests.post(f"{OLLAMA_URL}/api/chat", json=payload)
        print("✅ Response received from Ollama.")
        if resp.status_code != 200: return jsonify(resp.json()), resp.status_code
        
        ai_msg = resp.json().get("message", {})
        content = ai_msg.get("content", "")
        
        # Check Search
        if "SEARCH_ACTION:" in content:
            query = content.split("SEARCH_ACTION:", 1)[1].strip()
            result = perform_tavily_search(query)
            
            # Feed back
            messages.append(ai_msg)
            messages.append({"role": "system", "content": f"SEARCH RESULTS:\n{result}\n\nAnswer the user."})
            payload["messages"] = messages
            
            # Call 2
            final = requests.post(f"{OLLAMA_URL}/api/chat", json=payload)
            return jsonify(final.json())
            
        return jsonify(resp.json())
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    # Pass-through for everything else
    url = f"{OLLAMA_URL}/{path}"
    try:
        if request.method == 'POST':
            resp = requests.post(url, json=request.json)
        else:
            resp = requests.get(url, params=request.args)
        return jsonify(resp.json())
    except:
        return jsonify({"error": "check ollama"}), 500

if __name__ == '__main__':
    print(f"VidiFlow Proxy Running (Port {PROXY_PORT})")
    app.run(host='127.0.0.1', port=PROXY_PORT)

# Tavily + LM Studio Integration Guide

## 🎯 What This Does

Adds **web search capabilities** to your LM Studio models (GLM 4.7, GLM 4.6v) using the Tavily AI search API.

- Automatically detects when web search is needed
- Searches the web in real-time for current information
- Provides sources and citations to your LLM
- Works with any LM Studio compatible model

---

## ⚡ Quick Start (5 minutes)

### Step 1: Get Tavily API Key

1. Go to: **https://tavily.com**
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 1,000 searches/month

### Step 2: Set API Key

**Option A - Environment Variable (Recommended):**
```bash
export TAVILY_API_KEY='tvly-your-api-key-here'
```

**Option B - Edit Script:**
Open `lmstudio-tavily-integration.py` and change line 16:
```python
TAVILY_API_KEY = "tvly-your-actual-key-here"
```

### Step 3: Start LM Studio

1. Open LM Studio
2. Load your GLM 4.7 or GLM 4.6v model
3. Click **"Start Server"** (Local Server tab)
4. Verify server is running on `http://localhost:1234`

### Step 4: Run the Integration

```bash
cd /mnt/m/code/vidismart
python3 lmstudio-tavily-integration.py
```

**✅ Done!** Your LM Studio now has web search capabilities.

---

## 💬 How to Use

### Basic Chat
Just ask questions normally:
```
You: What's the weather in New York today?
🔍 Searching the web...
✅ Found 5 results

🤖 AI: Based on current weather data, New York City is...
```

### Force Web Search
Use `/search` command:
```
You: /search latest AI news
```

### Disable Search for One Message
```
You: /nosearch
You: Explain quantum computing
```

### Clear Conversation
```
You: /clear
```

### Exit
```
You: /exit
```

---

## 🔧 Configuration

### Change LM Studio URL
Edit line 15 in `lmstudio-tavily-integration.py`:
```python
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
```

### Adjust Search Results Count
In the `TavilySearch.search()` method, change `max_results`:
```python
"max_results": 5,  # Change to 3-10
```

### Change Search Depth
```python
"search_depth": "basic",  # or "advanced"
```

**Note:** Advanced search uses more API credits but provides better results.

---

## 🎯 Features

### Auto-Detection
Script automatically detects when search is needed based on keywords:
- "search", "look up", "find"
- "latest", "current", "news", "today"
- "what is", "who is", "when did"
- "price", "stock", "weather"

### Search Results Format
Tavily provides:
- ✅ **AI-generated answer** (quick summary)
- ✅ **Multiple sources** with URLs
- ✅ **Relevant content snippets**
- ✅ **Real-time information**

### Conversation Memory
- Keeps last 10 messages in context
- Use `/clear` to reset conversation

---

## 🐛 Troubleshooting

### "Connection error" when running script

**Problem:** LM Studio server not running

**Solution:**
1. Open LM Studio
2. Go to "Local Server" tab
3. Click "Start Server"
4. Verify port is 1234

### "Tavily API error: 401"

**Problem:** Invalid or missing API key

**Solution:**
1. Check your API key at https://tavily.com/dashboard
2. Make sure it starts with `tvly-`
3. Set it properly: `export TAVILY_API_KEY='your-key'`

### "No search results found"

**Problem:** Tavily couldn't find relevant information

**Solution:**
- Try rephrasing your query
- Use more specific search terms
- Check if you have API credits remaining

### Search not activating automatically

**Problem:** Query doesn't contain trigger keywords

**Solution:**
- Use `/search` command to force search
- Or add keywords like "latest", "current", "find"

---

## 📊 Comparison with Other Solutions

| Feature | Tavily | Brave Search | Google Search API |
|---------|--------|--------------|-------------------|
| Free Tier | ✅ 1,000/mo | ✅ 2,000/mo | ❌ Paid only |
| AI-Optimized | ✅ Yes | ⚠️ No | ⚠️ No |
| Setup Difficulty | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| Answer Quality | ✅ Excellent | ⚠️ Good | ✅ Excellent |
| Speed | ⚡ Fast | ⚡ Fast | ⚠️ Slower |

**Tavily is designed specifically for LLMs** - results are pre-processed for AI consumption.

---

## 🚀 Advanced Usage

### Use with OpenAI-Compatible Apps

Since this runs through LM Studio's OpenAI-compatible API, you can:

1. Point any OpenAI-compatible app to LM Studio
2. Search capabilities work automatically
3. No app modifications needed

### Integration with Other Scripts

You can import the classes:

```python
from lmstudio_tavily_integration import LMStudioWithSearch

chat = LMStudioWithSearch(
    lm_studio_url="http://localhost:1234/v1/chat/completions",
    tavily_api_key="your-key"
)

response = chat.chat("What's the latest AI news?", use_search=True)
print(response)
```

### Customize Search Behavior

Edit the `detect_search_need()` method to add your own keywords:

```python
def detect_search_need(self, message: str) -> bool:
    search_keywords = [
        "search", "find", "latest",
        # Add your custom keywords here
        "crypto", "stock", "news about"
    ]
    # ... rest of method
```

---

## 📝 Example Queries That Trigger Search

**✅ Will auto-search:**
- "What's the latest news about AI?"
- "Find me information about quantum computing"
- "Current weather in London"
- "What happened today in tech?"
- "Bitcoin price now"

**❌ Won't auto-search:**
- "Explain how neural networks work"
- "Write me a Python function"
- "What is machine learning?"
- "Help me debug this code"

**💡 Tip:** Use `/search` to force search for any query.

---

## 🔒 Privacy & Security

- All searches go through Tavily's API
- Tavily doesn't store search queries by default
- LM Studio runs locally (your conversations stay on your machine)
- Only search queries are sent externally

---

## 📈 API Usage Tips

### Free Tier Optimization
- 1,000 searches/month = ~33 searches/day
- Use auto-detection to avoid unnecessary searches
- Use `/nosearch` for general knowledge questions

### Monitoring Usage
Check your usage at: https://tavily.com/dashboard

### Upgrading
If you need more searches:
- **Starter:** $29/mo - 10,000 searches
- **Pro:** $99/mo - 50,000 searches

---

## 🎓 Learning Resources

**Tavily Documentation:**
- API Docs: https://docs.tavily.com
- Python SDK: https://github.com/tavily-ai/tavily-python

**LM Studio:**
- Official Site: https://lmstudio.ai
- Server API: https://lmstudio.ai/docs/api

**GLM Models:**
- GLM-4 Series: https://github.com/THUDM/GLM-4

---

## ✅ What You've Accomplished

After setup, your local LLM can now:
- ✅ Search the web in real-time
- ✅ Access current information beyond training data
- ✅ Provide sources and citations
- ✅ Answer time-sensitive questions accurately
- ✅ All while running completely locally (except search API)

---

## 🆘 Need Help?

**Common Issues:**
1. LM Studio not connecting → Check server is running
2. No search results → Verify Tavily API key
3. Slow responses → Try reducing max_results
4. Out of searches → Upgrade Tavily plan or wait for monthly reset

**Still stuck?** Check:
- LM Studio logs
- Python error messages
- Tavily dashboard for API issues

---

**Last Updated:** February 3, 2026
**Status:** ✅ Ready to use with GLM 4.7 and GLM 4.6v models

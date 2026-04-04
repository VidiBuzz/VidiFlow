# LM Studio ChatML Setup for Tavily Integration

## 🎯 Critical: Set Chat Template to ChatML

For GLM 4.7, GLM 4.6v, and Qwen 3 VL to properly call Tavily tools, you **MUST** use ChatML format.

---

## ⚙️ LM Studio Configuration Steps

### 1. Load Your Model

1. Open LM Studio
2. Load one of these models:
   - GLM 4.7
   - GLM 4.6v
   - Qwen 3 VL
   - Or any ChatML-compatible model

### 2. Set Prompt Format to ChatML

**Option A - Model Settings (Recommended):**

1. After loading model, click on the model name
2. Find **"Prompt Format"** dropdown
3. Select: **"ChatML"**
4. Save settings

**Option B - Auto-detect:**

Some models auto-detect ChatML. Look for:
```
<|im_start|>system
<|im_end|>
```

### 3. Start the Server

1. Click **"Local Server"** tab (or Developer → Server)
2. Click **"Start Server"**
3. Verify it shows: `http://localhost:1234`
4. Status should show: "Server running"

### 4. Verify Settings

In Server settings, check:
- ✅ **Port:** 1234
- ✅ **CORS:** Enabled
- ✅ **Template:** ChatML (or auto)

---

## 🚀 Run the Integration

```bash
# Set Tavily API key
export TAVILY_API_KEY='tvly-your-key-here'

# Run ChatML version
cd /mnt/m/code/vidismart
python3 lmstudio-tavily-chatml.py
```

---

## 💬 Usage Examples

### Let Model Auto-detect When to Search

```
You: What are the latest features of Kimi K2.5?

💬 Sending to LM Studio (ChatML format)...

🤖 Model initial output:
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>Kimi K2.5 latest features</arg_value>
</tool_call>

🔧 TOOL CALL DETECTED!

🔍 EXECUTING TAVILY SEARCH
   Query: Kimi K2.5 latest features
   Status: 200
   ✅ Got 5 results

[Search results displayed]

💬 Getting final answer from model...

🔍 AI:
Based on the search results, Kimi K2.5 includes the following features:
[Detailed answer with citations [1], [2], etc.]
```

### Force a Search Manually

```
You: /search quantum computing breakthroughs 2026

🔍 Forcing search for: quantum computing breakthroughs 2026

[Search results displayed]

🤖 AI:
[Summary of search results]
```

---

## 🔧 ChatML Format Explained

ChatML uses special tokens to structure conversations:

```
<|im_start|>system
You are a helpful assistant<|im_end|>
<|im_start|>user
What's the weather?<|im_end|>
<|im_start|>assistant
Let me search for that information.<|im_end|>
```

This format helps models understand:
- When to call tools
- How to structure responses
- Context boundaries

---

## ✅ How to Verify It's Working

### Test 1: Check Model Output Format

When you run the script, you should see:

```
🤖 Model initial output:
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>your search here</arg_value>
</tool_call>
```

✅ If you see `<tool_call>` → ChatML is working!
❌ If you see plain text → ChatML not configured

### Test 2: Ask a Current Events Question

```
You: What's the latest AI news today?
```

The model should automatically trigger a search.

### Test 3: Ask a General Question

```
You: Explain how neural networks work
```

The model should answer directly WITHOUT searching (since it's general knowledge).

---

## 🐛 Troubleshooting

### Issue: "Model failed to generate tool call"

**Cause:** Prompt format not set to ChatML

**Fix:**
1. In LM Studio, click model name
2. Set "Prompt Format" to "ChatML"
3. Restart server
4. Try again

### Issue: Tool call gets cut off

```
<tool_call>tavily_search <arg_key>query</arg_key> <arg_value>test<|
```

**Cause:** Stop tokens interfering

**Fix:** The script already handles this with:
```python
"stop": ["<|im_end|>", "</tool_call>"]
```

Should work automatically.

### Issue: "Cannot connect to LM Studio"

**Cause:** Server not running or wrong port

**Fix:**
1. Check LM Studio shows "Server running"
2. Verify port is 1234
3. Try: `curl http://localhost:1234/v1/models`

### Issue: Model never calls tools

**Cause:** Model doesn't recognize it needs to search

**Fix:** Use manual search:
```
You: /search your question here
```

Or rephrase with keywords like "latest", "current", "today".

---

## 📊 Prompt Format Comparison

| Format | GLM 4.7 | GLM 4.6v | Qwen 3 VL | Tool Calling |
|--------|---------|----------|-----------|--------------|
| **ChatML** | ✅ Best | ✅ Best | ✅ Best | ✅ Yes |
| Llama 3 | ⚠️ Works | ⚠️ Works | ⚠️ Works | ❌ No |
| Alpaca | ❌ Poor | ❌ Poor | ❌ Poor | ❌ No |
| Raw | ❌ Poor | ❌ Poor | ❌ Poor | ❌ No |

**Always use ChatML for tool calling!**

---

## 🎓 Advanced: Custom Tool Format

If you want to customize how tools are called, edit the system prompt in the script:

```python
system_content = f"""...
TOOL FORMAT:
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>your search query</arg_value>
</tool_call>
..."""
```

You can also try JSON format:
```python
TOOL FORMAT:
{{"tool": "tavily_search", "query": "your search"}}
```

Then update the extraction regex in `extract_tool_call_chatml()`.

---

## 🎯 Models Tested

| Model | Version | ChatML Support | Tool Calling | Status |
|-------|---------|----------------|--------------|--------|
| GLM | 4.7 | ✅ Yes | ✅ Yes | ✅ Working |
| GLM | 4.6v | ✅ Yes | ✅ Yes | ✅ Working |
| Qwen | 3 VL | ✅ Yes | ✅ Yes | ✅ Working |
| Qwen | 2.5 | ✅ Yes | ⚠️ Partial | ⚠️ Testing |

---

## 💡 Pro Tips

1. **Temperature:** Lower = more predictable tool calls
   - For research: 0.3-0.5
   - For chat: 0.7-0.9

2. **Max Tokens:** Higher = better tool call completion
   - Minimum: 1000
   - Recommended: 2000

3. **Context Length:** Longer = more search results in context
   - Minimum: 4096
   - Recommended: 8192+

4. **Stop Sequences:** Already optimized in script
   - `<|im_end|>` - ChatML message end
   - `</tool_call>` - Tool call end

---

## ✅ Success Checklist

Before running, verify:

- [ ] LM Studio server running on port 1234
- [ ] Model loaded (GLM/Qwen)
- [ ] Prompt format set to "ChatML"
- [ ] Tavily API key exported: `export TAVILY_API_KEY='tvly-...'`
- [ ] Script has execute permissions: `chmod +x lmstudio-tavily-chatml.py`

Then run:
```bash
python3 lmstudio-tavily-chatml.py
```

---

**Last Updated:** February 3, 2026
**Tested With:** GLM 4.7, GLM 4.6v, Qwen 3 VL
**Status:** ✅ Working

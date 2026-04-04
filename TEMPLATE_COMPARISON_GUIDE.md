# LM Studio Template Comparison for Tool Calling

## 🎯 Which Template for Your Models?

Quick answer for **GLM 4.7, GLM 4.6v, Qwen 3 VL**:

| Model | Best Template | 2nd Best | Tool Calling |
|-------|--------------|----------|--------------|
| **GLM 4.7** | ChatML | GLM-4 (if available) | ✅ Excellent |
| **GLM 4.6v** | ChatML | GLM-4 | ✅ Excellent |
| **Qwen 3 VL** | ChatML | Qwen | ✅ Excellent |

---

## 📋 All 10+ LM Studio Templates Explained

### 1. ⭐ ChatML (RECOMMENDED for GLM/Qwen)

**Format:**
```
<|im_start|>system
You are a helpful assistant<|im_end|>
<|im_start|>user
Hello<|im_end|>
<|im_start|>assistant
```

**Best for:**
- ✅ GLM 4.x series
- ✅ Qwen 2.5/3.x series
- ✅ Tool calling / function calling
- ✅ Structured outputs

**Tool Calling:** ⭐⭐⭐⭐⭐ (5/5)

---

### 2. Llama 3 / Llama 3.1

**Format:**
```
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a helpful assistant<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Hello<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
```

**Best for:**
- Llama 3 / 3.1 / 3.2 models
- Meta models

**Tool Calling:** ⭐⭐⭐ (3/5) - Works but not optimized for GLM/Qwen

---

### 3. Alpaca

**Format:**
```
### Instruction:
You are a helpful assistant

### Input:
Hello

### Response:
```

**Best for:**
- Older fine-tuned models
- Alpaca-format models

**Tool Calling:** ⭐ (1/5) - Poor for tool calling

---

### 4. Vicuna / Vicuna 1.1

**Format:**
```
USER: Hello
ASSISTANT:
```

**Best for:**
- Vicuna models
- Simple conversational models

**Tool Calling:** ⭐⭐ (2/5) - Basic, not recommended

---

### 5. Mistral / Mistral Instruct

**Format:**
```
<s>[INST] You are a helpful assistant

Hello [/INST]
```

**Best for:**
- Mistral models (7B, Mixtral, etc.)
- Mistral-based fine-tunes

**Tool Calling:** ⭐⭐⭐⭐ (4/5) - Good, but use Mistral models

---

### 6. Gemma

**Format:**
```
<start_of_turn>user
Hello<end_of_turn>
<start_of_turn>model
```

**Best for:**
- Google Gemma models
- Gemma-based fine-tunes

**Tool Calling:** ⭐⭐⭐ (3/5) - Decent

---

### 7. Command-R / Command-R+

**Format:**
```
<|START_OF_TURN_TOKEN|><|USER_TOKEN|>Hello<|END_OF_TURN_TOKEN|>
<|START_OF_TURN_TOKEN|><|CHATBOT_TOKEN|>
```

**Best for:**
- Cohere Command-R models
- Tool-use optimized models

**Tool Calling:** ⭐⭐⭐⭐⭐ (5/5) - Excellent for Command-R, not for GLM

---

### 8. Phi / Phi-3

**Format:**
```
<|user|>
Hello<|end|>
<|assistant|>
```

**Best for:**
- Microsoft Phi-3 models
- Phi-based fine-tunes

**Tool Calling:** ⭐⭐⭐ (3/5)

---

### 9. Zephyr

**Format:**
```
<|system|>
You are a helpful assistant</s>
<|user|>
Hello</s>
<|assistant|>
```

**Best for:**
- Zephyr models
- HuggingFaceH4 models

**Tool Calling:** ⭐⭐⭐ (3/5)

---

### 10. GLM-4 / GLM-4-Chat (if available)

**Format:**
```
[gMASK]<sop><|system|>
You are a helpful assistant<|user|>
Hello<|assistant|>
```

**Best for:**
- ✅ GLM 4.x models specifically
- Native format for GLM

**Tool Calling:** ⭐⭐⭐⭐⭐ (5/5) - Perfect for GLM

**Note:** This might appear as "GLM-4" or "GLM-4-Chat" in LM Studio dropdown.

---

### 11. Qwen / Qwen2

**Format:**
```
<|im_start|>system
You are a helpful assistant<|im_end|>
<|im_start|>user
Hello<|im_end|>
<|im_start|>assistant
```

**Best for:**
- ✅ Qwen models
- Same as ChatML (Qwen uses ChatML)

**Tool Calling:** ⭐⭐⭐⭐⭐ (5/5)

**Note:** Qwen template IS ChatML, just branded differently.

---

### 12. None / Raw

**Format:**
```
[No special formatting]
```

**Best for:**
- Base models (not instruct-tuned)
- Testing

**Tool Calling:** ❌ (0/5) - Don't use for tool calling

---

## 🎯 RECOMMENDATION FOR YOUR MODELS

### For GLM 4.7 and GLM 4.6v:

**Option 1:** Look for **"GLM-4"** or **"GLM-4-Chat"** template
- This is the native format
- Best compatibility

**Option 2:** Use **"ChatML"**
- Nearly identical to GLM format
- Widely supported
- ✅ Confirmed working for tool calling

### For Qwen 3 VL:

**Option 1:** Look for **"Qwen"** or **"Qwen2"** template
- Native format

**Option 2:** Use **"ChatML"**
- Qwen uses ChatML natively
- Fully compatible

---

## 🔍 How to Check Which Templates You Have

In LM Studio:

1. Load your model (GLM 4.7, GLM 4.6v, or Qwen 3 VL)
2. Click on model name/settings
3. Find **"Prompt Format"** dropdown
4. Look through the list

You should see something like:
```
- Auto-detect
- ChatML
- Llama 3
- Mistral
- GLM-4 (or GLM-4-Chat)  ← Use this if available!
- Qwen                   ← Or this for Qwen!
- Alpaca
- Vicuna
- [more...]
```

---

## ✅ Testing Each Template

Want to test which works best? Use this script:

```bash
# Test current template
python3 lmstudio-tavily-chatml.py

# Try asking:
You: What are the latest AI developments?

# If it generates:
<tool_call>tavily_search...
✅ Template is working!

# If it just answers without searching:
❌ Try a different template
```

---

## 🎯 Priority Order to Try

### For GLM 4.7 / 4.6v:

1. **GLM-4** or **GLM-4-Chat** (if in dropdown) ← Try first!
2. **ChatML** ← Use this if #1 not available
3. **Qwen** (similar to ChatML) ← Backup
4. ❌ Don't use: Llama 3, Alpaca, Vicuna, Raw

### For Qwen 3 VL:

1. **Qwen** or **Qwen2** (if in dropdown) ← Try first!
2. **ChatML** (identical to Qwen) ← Use this if #1 not available
3. ❌ Don't use: Llama 3, Alpaca, Vicuna, Raw

---

## 🐛 What Happens with Wrong Template?

### Wrong template symptoms:

❌ **Model output looks weird:**
```
USER: Hello
<|im_start|>assistant
I can help you...
```

❌ **Tool calls malformed:**
```
### Instruction:
<tool_call>tavily...
[gibberish]
```

❌ **Model repeats prompt:**
```
USER: What's the weather?
USER: What's the weather?
USER: What's the weather?
```

### Right template output:

✅ **Clean responses:**
```
Based on the search results...
```

✅ **Proper tool calls:**
```
<tool_call>tavily_search
<arg_key>query</arg_key>
<arg_value>weather forecast</arg_value>
</tool_call>
```

---

## 💡 Pro Tip: Auto-detect

Many models work with **"Auto-detect"** in the dropdown:

1. LM Studio reads the model's metadata
2. Selects the correct template automatically
3. Usually works perfectly

**Try Auto-detect first!** If tool calling doesn't work, manually select ChatML/GLM-4/Qwen.

---

## 📊 Template Compatibility Matrix

| Template | GLM 4.7 | GLM 4.6v | Qwen 3 VL | Tool Calling |
|----------|---------|----------|-----------|--------------|
| **GLM-4** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Best |
| **Qwen** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Best |
| **ChatML** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Excellent |
| **Auto-detect** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Usually works |
| Llama 3 | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⚠️ Poor |
| Mistral | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⚠️ Poor |
| Alpaca | ⭐ | ⭐ | ⭐ | ❌ Bad |
| Vicuna | ⭐ | ⭐ | ⭐ | ❌ Bad |
| Raw/None | ❌ | ❌ | ❌ | ❌ Don't use |

---

## ✅ Final Recommendation

### Best to Worst for Your Models:

**Tier 1 - Use These:**
1. Model-specific (GLM-4 for GLM, Qwen for Qwen)
2. ChatML (works for all)
3. Auto-detect (usually picks #1 or #2)

**Tier 2 - Might Work:**
4. Similar formats (Qwen ↔ GLM can sometimes work)

**Tier 3 - Don't Use:**
❌ Llama 3, Mistral, Alpaca, Vicuna, Raw

---

## 🚀 Quick Start Command

After selecting template:

```bash
# Set API key
export TAVILY_API_KEY='tvly-your-key-here'

# Run the ChatML version (works with ChatML, GLM-4, Qwen templates)
python3 lmstudio-tavily-chatml.py

# Test with:
You: What are the features of Kimi K2.5?
```

If tool calls work → ✅ Template is correct!

---

**Last Updated:** February 3, 2026
**Models Tested:** GLM 4.7, GLM 4.6v, Qwen 3 VL

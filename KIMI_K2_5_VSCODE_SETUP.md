# Kimi K2.5 Setup for VS Code / Cursor via NVIDIA NIM

## Quick Config

### For Cursor IDE:
1. **Settings** → **Cursor Settings** → **Models**
2. **OpenAI API Key:** Your NVIDIA API key (from build.nvidia.com)
3. **Override OpenAI Base URL:** **ON**
4. **Base URL:** `https://integrate.api.nvidia.com/v1`
5. **Add Model:** `moonshotai/kimi-k2.5`
6. Select it in the chat dropdown

---

### For Continue Extension (VS Code):
Add to your `~/.continue/config.json` or in extension settings:

```json
{
  "models": [
    {
      "model": "moonshotai/kimi-k2.5",
      "provider": "openai",
      "api_key": "${NVIDIA_API_KEY}",
      "base_url": "https://integrate.api.nvidia.com/v1"
    }
  ]
}
```

---

## Test Your Setup

Run this in your terminal:

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.5",
    "messages": [{"role": "user", "content": "Say hello in 3 words"}],
    "max_tokens": 50
  }'
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "Did nothing" / No response | **Must** set Base URL to `https://integrate.api.nvidia.com/v1` (not OpenAI default!) |
| 401 Error | Check API key has no extra spaces |
| Model not found | Verify your NVIDIA account has Kimi K2.5 quota enabled |

---

## API Reference

| Setting | Value |
|---------|-------|
| **Endpoint** | `https://integrate.api.nvidia.com/v1/chat/completions` |
| **Model ID** | `moonshotai/kimi-k2.5` |
| **Auth** | `Authorization: Bearer YOUR_NVIDIA_API_KEY` |

Request format:
```json
{
  "model": "moonshotai/kimi-k2.5",
  "messages": [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "Write a hello world function in Python"}
  ],
  "max_tokens": 1024,
  "temperature": 0.7
}
```

---

## Get Your API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up / Login
3. Go to **API Keys** section
4. Create new key
5. Copy it (shown only once!)

---

## Node.js Example

```javascript
const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'moonshotai/kimi-k2.5',
    messages: [{ role: 'user', content: 'Hello!' }],
    max_tokens: 512
  })
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

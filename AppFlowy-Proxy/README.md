# How to Run VidiFlow AI Proxy

This proxy gives your standard AppFlowy (Nightly or Stable) the ability to search the web using Local AI (Ollama).

## 1. Prerequisites
- **Python 3.8+** installed.
- **Ollama** installed and running (`ollama serve`).
- **AppFlowy** installed (any version).

## 2. Setup
Open a terminal in this folder and run:

```powershell
pip install flask requests
```

**CRITICAL STEP:**
Open `proxy_server.py` in a text editor.
Find line 14:
`TAVILY_API_KEY = "tvly-YOUR_KEY_HERE"`
**Replace `"tvly-YOUR_KEY_HERE"` with your actual Tavily API key.** (Starts with `tvly-`).

## 3. Run VidiFlow Proxy
Right-click `VidiFlow-Proxy.ps1` and select **"Run with PowerShell"**.

Or runs from terminal:
```powershell
.\VidiFlow-Proxy.ps1
```

## Features
- **Visual RAG:** Automatically fetches images and displays them in chat.
- **Deep Search:** Uses Tavily 'Advanced' depth for high-quality answers.
- **Media Aware:** Identifies Videos (YouTube) and PDFs with special icons.
- **Direct Answers:** Gets straight answers to questions like "What is the stock price of Apple?".

You should see:
> 🌟 VidiFlow AI Proxy running on port 11435
> 👉 Configure AppFlowy Local AI URL to: http://localhost:11435

## 4. Configure AppFlowy
1. Open AppFlowy.
2. Go to **Settings** -> **AI** (or Local AI).
3. Change the **Ollama URL** (or Base URL) from `http://localhost:11434` to:
   **`http://localhost:11435`**
4. Save and close settings.

## 5. Test It
Open a new page in AppFlowy and use the AI:
> "What is the latest news on OpenAI today?"

The proxy will intercept this, ask Ollama to use the `web_search` tool, perform the search, and give the answer back to AppFlowy.

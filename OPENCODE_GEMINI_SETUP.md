# Gemini 3.1 Pro on OpenCode

Use **Gemini 3.1 Pro Preview** with OpenCode. This doc describes what actually works as of 2026.

## Reality check

- **`opencode auth login` → Google** currently shows **only one option: API key**. There is no second “OAuth with Google (Gemini CLI)” option in the menu for many users, even with the `opencode-gemini-auth` plugin in config. So subscription-based OAuth via that plugin is **not reliably available** in OpenCode right now.
- The **only option that works** is to add a **Google AI / Gemini API key**. That uses **API billing** (pay-as-you-go or free-tier limits at [Google AI Studio](https://aistudio.google.com)), not your consumer “Gemini subscription” from the app. If you care about cost, check [Google AI pricing](https://ai.google.dev/pricing).

## What actually works: API key

1. **Get an API key**  
   [Google AI Studio](https://aistudio.google.com/apikey) → Create API key.

2. **Give it to OpenCode** (one of these):
   - **Env (WSL/Linux/macOS):**  
     `export GOOGLE_GENERATIVE_AI_API_KEY=your_key_here`  
     (or add that line to `~/.bashrc` / `~/.zshrc`.)
   - **Windows PowerShell (current session):**  
     `$env:GOOGLE_GENERATIVE_AI_API_KEY="your_key_here"`
   - **Project:** create a `.env` in the project root with:  
     `GOOGLE_GENERATIVE_AI_API_KEY=your_key_here`

3. **Optional: “login” in OpenCode**  
   You can run `opencode auth login`, choose Google, and paste the same API key when asked. That stores it in OpenCode’s credentials. Alternatively, the env var or `.env` is enough; OpenCode reads it.

4. **Run with Gemini 3.1 Pro**  
   ```bash
   opencode -m google/gemini-3.1-pro-preview
   ```
   Or start the TUI and pick the Google model:
   ```bash
   opencode
   ```
   Then use `/models` and select the Google Gemini model.

## Model reference

- **ID:** `gemini-3.1-pro-preview`
- **Docs:** [Gemini 3.1 Pro Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview)
- **Context:** 1M input tokens, 65,536 output tokens; supports thinking, function calling, code execution, search grounding.

## If OAuth ever appears again

If a future OpenCode version or plugin again shows **two** Google options (e.g. “API key” and “OAuth with Google (Gemini CLI)”), then the OAuth option would be the one that uses your **subscription** instead of API billing. Until then, the only supported path is the API key above.

# CodeGPT Installation Walkthrough - Step by Step

## Step 1: Install CodeGPT Extension

1. Open **VS Code**
2. Press `Ctrl + Shift + X` (opens Extensions panel)
3. In the search box, type: **"CodeGPT"**
4. Look for **"CodeGPT: AI Assistant"** (by Daniel San - it's the popular one with millions of downloads)
5. Click **Install** button
6. Wait for installation to complete
7. **Restart VS Code** completely (close and reopen)

---

## Step 2: Start LM Studio FIRST

**Before** you configure CodeGPT, get LM Studio running:

1. Open **LM Studio**
2. On the left side, click **"Chat"** tab
3. In the model dropdown, search for **"qwen3"** or **"qwen"**
4. Select a Qwen 3.5 model (8B is fastest)
5. Wait for it to load (shows "Ready" or "Loaded")
6. **IMPORTANT:** Look for the **"Server"** tab (or server icon) on the left
7. Click **"Start Server"**
8. It should say: `Server running at http://localhost:1234/v1`

**Keep LM Studio running while you use CodeGPT.**

---

## Step 3: Configure CodeGPT

After VS Code restarts and LM Studio is running:

### Option A: Through VS Code Settings

1. Press `Ctrl + ,` (opens Settings)
2. In the search bar, type: **"CodeGPT"**
3. Click on **"CodeGPT: Extension Settings"** (not workspace)
4. You'll see these fields - fill them in:

| Setting | What to Enter |
|---------|---------------|
| **API Provider** | Type: `Custom` (or select from dropdown) |
| **API URL** | `http://localhost:1234/v1` |
| **API Key** | `not-needed` (type exactly this) |
| **Model** | `qwen3-8b-q4_k_m` (or whatever model name LM Studio shows) |

### Option B: Through CodeGPT Panel

1. In VS Code, look for the **CodeGPT** icon in the left sidebar (looks like a robot or chat icon)
2. Click it to open the CodeGPT panel
3. Look for a **gear icon** or **settings** button
4. Find **"API Configuration"** or **"Provider"**
5. Change it to: **"Custom"** or **"OpenAI Compatible"**
6. Enter:
   - Base URL: `http://localhost:1234/v1`
   - API Key: `not-needed`
   - Model: `qwen3-8b-q4_k_m`

---

## Step 4: Test It Works

1. Press `Ctrl + Shift + G` (opens CodeGPT chat)
2. Or: Click the CodeGPT icon in the sidebar
3. Type: **"Hello, are you working?"**
4. Press **Enter** or click **Send**
5. You should get a response from Qwen 3.5!

---

## If You're Stuck in a Screen/Modal

### Problem: "Can't exit out of the screen"

**Solution - Close VS Code Completely:**

1. Don't just click the X - force close:
   - Press `Alt + F4` (Windows)
   - Or right-click VS Code in taskbar → "Close Window"
2. Reopen VS Code
3. Try again

### Problem: "No Local option / Can't find LM Studio"

The CodeGPT free version sometimes doesn't show local options. Here's what to do:

1. Look for a **"Provider"** dropdown
2. Try options one by one:
   - `Custom`
   - `OpenAI Compatible`
   - `Local`
   - If none work, try adding in Settings JSON

### Problem: Still Stuck - Edit Settings JSON Directly

1. Press `Ctrl + ,` 
2. Click the **"{}"** icon in top right (Open Settings JSON)
3. Add this at the bottom (before the final curly brace):

```json
"codegpt.apiProvider": "Custom",
"codegpt.apiUrl": "http://localhost:1234/v1", 
"codegpt.apiKey": "not-needed",
"codegpt.model": "qwen3-8b-q4_k_m",
```

4. Save (Ctrl+S)
5. Restart VS Code

---

## If CodeGPT Still Doesn't Work - Try This Alternative

### Alternative: Use "Roo Code" Instead

1. Extensions → Search: **"Roo Code"** or **"Roo Cline"**
2. Install it
3. It's similar to Cursor/Claude Code - works great with local models

### Alternative: Just Use Aider (CLI - No Setup Issues)

1. Open a **regular terminal** (cmd.exe or PowerShell)
2. Run:
```bash
pip install aider
```

3. Then run:
```bash
aider --model openai/qwen3-8b-q4_k_m --openai-api-base http://localhost:1234/v1 --openai-api-key not-needed
```

4. It will open an interactive session where you can:
   - Paste code
   - Ask it to edit files
   - It understands git diffs perfectly

---

## Quick Checklist

- [ ] CodeGPT installed in VS Code
- [ ] VS Code restarted
- [ ] LM Studio opened
- [ ] Qwen 3.5 model loaded
- [ ] LM Studio "Start Server" clicked (port 1234)
- [ ] CodeGPT settings configured with localhost:1234
- [ ] Test with "Hello"

---

## Still Stuck?

Tell me exactly:
1. What screen/modal is stuck open?
2. What options do you see?
3. Can you take a screenshot?

Or try **Aider** instead - it's a simple terminal command and has zero configuration issues.

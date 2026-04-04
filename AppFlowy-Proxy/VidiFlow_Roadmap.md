# VidiFlow Proxy & White-Labeling Roadmap

## 1. Current Architecture (The "Gold Standard")
As of **Feb 6, 2026**, the system is stable and operational with the following configuration.

### 1.1 Components & Ports
| Component | Local Address | Port | Role |
| :--- | :--- | :--- | :--- |
| **AppFlowy (Client)** | `localhost` | Variable | The Windows App Interface (White-label target). |
| **VidiFlow Proxy** | `127.0.0.1` | **11435** | The Python "Intelligence Bridge" with Identity & ReAct logic. |
| **Ollama (Engine)** | `127.0.0.1` | **11434** | The raw AI inference backend (e.g., Llama 3, Qwen). |

### 1.2 Data Flow
1.  **AppFlowy** sends chat payload to `http://127.0.0.1:11435/api/chat`.
2.  **Proxy** intercepts:
    *   **Injects Identity:** "You are VidiFlow AI... Current Date is [DATE]."
    *   **Modifies System Prompt:** Aggressively overrides default prompts.
3.  **Proxy** forwards modified load to **Ollama** (`11434`).
4.  **Ollama** responds.
5.  **Proxy** checks for Tool Trigger (`SEARCH_ACTION: <query>`).
    *   **If Found:** Calls Tavily API, gets results, re-prompts Ollama with context.
    *   **If Not:** Returns standard response to AppFlowy.

### 1.3 Key Files (Do Not Break)
*   `m:\code\vidismart\AppFlowy-Proxy\proxy_server.py`: The Brain logic.
*   `m:\code\vidismart\AppFlowy-Proxy\Force-Start-VidiFlow.bat`: The reliable launcher (Kills Python/Ollama -> Restarts).

---

## 2. Roadmap: Visual I/O (Vision & Generation)

The next step is turning VidiFlow into a Multimodal system (Text + Image In + Image Out).

### 2.1 Image Input (Vision)
**Goal:** Allow users to drag-and-drop images into AppFlowy chat, and have the model "see" them.
**Current Constraint:** AppFlowy filters `images` out of the standard OpenAI-compatible JSON payload or handles them separately.
**Implementation Plan:**
1.  **Switch Model:** Ensure the User is running a VLM (Vision Language Model) in Ollama (e.g., `llava`, `qwen-vl`, `moondream`).
2.  **Payload Passthrough:** Modify `proxy_server.py` to stop deleting/ignoring image fields.
    *   *Action:* Check if AppFlowy sends base64 strings in the `messages[].images` array.
    *   *Action:* Forward this array strictly to Ollama's `/api/chat`.
3.  **Validation:** Test with `llava:latest`.

### 2.2 Image Generation (Output)
**Goal:** User asks "Generate a logo for VidiFlow", and the system returns an actual image file.
**Implementation Plan:**
1.  **New Tool Trigger:** Add detection for `GENERATE_IMAGE: <prompt>` in the Proxy (alongside `SEARCH_ACTION`).
2.  **Generation Provider:**
    *   *Option A (Local):* Connect to Stable Diffusion WebUI (Automatic1111) API on Port 7860.
    *   *Option B (Cloud):* Connect to DALL-E or Midjourney API.
3.  **Rendering:** The Proxy will receive the image blob/URL. It must format it as Markdown compatible with AppFlowy: `![Generated Image](http://127.0.0.1:11435/images/cache/logo.png)`.
4.  **Local Serving:** The Proxy will need a new Flask route `/images/<path>` to serve these generated files locally so AppFlowy can render them.

---

## 3. Roadmap: White-Labeling AppFlowy (Windows)

**Goal:** Rebrand "AppFlowy" to "VidiFlow" on the Windows native app.

### 3.1 Tools Required
*   **Rust Toolchain:** For compiling the connection/backend logic.
*   **Flutter SDK:** For compiling the UI.
*   **Visual Studio C++ Build Tools:** For linking the Windows .exe.

### 3.2 Key Locations to Change
#### A. Application Name (The Window Title & Process)
*   **Flutter:** `windows/runner/main.cpp` -> Search for `CreateTopLevelWindow`. Change title string to "VidiFlow".
*   **CMake:** `windows/CMakeLists.txt` -> Change `BINARY_NAME` to `VidiFlow`.
*   **Dart:** `lib/main.dart` -> `MaterialApp(title: 'VidiFlow')`.

#### B. Icons & Visuals
*   **Exe Icon:** `windows/runner/resources/app_icon.ico`. Replace this file with the VidiFlow logo (.ico format).
*   **Assets:** `assets/images/` -> Replace `logo.png` / `appflowy_logo.png`.
*   **Boot Screen:** Check `lib/startup/startup_screen.dart` (or similar) for the splash entry point.

#### C. Text Constants
*   **Global Search:** Grep for "AppFlowy" in `lib/` directory.
    *   *Note:* Be careful not to rename package imports like `import 'package:appflowy_board/...'` or it will break the build. Only rename **User Interface Strings** (inside single quotes `'AppFlowy'`).
*   **Localization:** Check `assets/translations/` (en.json) for "appName" keys.

### 3.3 Build Usage
To produce the re-branded `.exe`:
```powershell
flutter build windows --release
```
The output will be in `build/windows/runner/Release/VidiFlow.exe`.

---

## 4. Immediate Next Actions

1.  **Testing Models:**
    *   Run `ollama pull qwen:14b` or `ollama pull mistral`.
    *   In AppFlowy Settings -> AI Local -> Custom Model Name -> Type `qwen:14b`.
    *   *Verify:* Ask "Who are you?". It should still say "VidiFlow AI" (proving the Proxy works generally).

2.  **Vision Prep:**
    *   Run `ollama pull llava`.
    *   We will need to debug *exactly* what JSON AppFlowy sends when an image is attached to verify if we can simply forward it.

3.  **White-Labeling:**
    *   Verify we can build the *unmodified* source first (`flutter build windows`).
    *   Once confirmed, do the `main.cpp` and `app_icon.ico` swap first.

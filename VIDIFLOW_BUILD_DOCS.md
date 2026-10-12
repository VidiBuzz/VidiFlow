# VidiFlow Build & Environment Documentation

## Core Identity
**Application Name:** VidiFlow
**Repo Location:** `m:\code\vidiflow`
**Binary Name:** `VidiFlow.exe`

## Technical Stack
*   **Frontend:** Flutter (Windows Desktop)
*   **Backend:** Rust (compiles to library linked by Flutter)
*   **AI Engine:** Local Ollama (Port 11434) + Internal Web Search Module

## Environment Configuration
The build environment requires the following tools to be in %PATH%. If build fails, ensure these are installed:

1.  **Visual Studio 2022** (Workload: Desktop development with C++)
2.  **CMake**
3.  **Rust Toolchain** (via `rustup`)
4.  **Flutter SDK**

## Web Search Implementation
**Location:** `frontend/rust-lib/flowy-ai/src/web_search/`
**Mechanism:** 
*   Rust-native implementation (No Python scripts).
*   Uses `DuckDuckGo` trait for search.
*   Triggered via keywords (news, weather, today) in `llm_chat.rs`.
*   Injects results into System Prompt before LLM inference.

## Build Commands
Run from `m:\code\vidiflow\frontend\appflowy_flutter`:

```powershell
# 1. Update Rust deps
cargo build --release -p flowy-ai

# 2. Build Windows Application
flutter pub get
flutter build windows --release
```

## Troubleshooting
**"rustup not found":** Restart terminal or check `%USERPROFILE%\.cargo\bin`.
**"AppFlowyMutex":** Changed to `VidiFlowMutex` in `main.cpp` to allow side-by-side run.

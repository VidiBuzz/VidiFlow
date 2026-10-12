# Build Requirements & Instructions

## 1. Prerequisites (Status Check)
| Tool | Status | Note |
|------|--------|------|
| **LLVM** | **INSTALLED** | `set LIBCLANG_PATH=C:\Program Files\LLVM\bin` |
| **ImageMagick** | **INSTALLED** | `C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe` |
| **Visual Studio** | **INSTALLED** | C++ Build Tools |
| **Flutter SDK** | **INSTALLED** | `pubspec.yaml` patched for `leak_tracker` |
| **Rust** | **INSTALLED** | `rustup target add x86_64-pc-windows-msvc` (DONE) |

## 2. Build Commands (Run in Order)
1. **Rust Backend:**
   ```cmd
   cd m:\code\VidiFlow\frontend
   set LIBCLANG_PATH=C:\Program Files\LLVM\bin
   cd rust-lib
   cargo build --release --package=dart-ffi --target x86_64-pc-windows-msvc --features dart
   ```
2. **Code Code Generation:**
   ```cmd
   cd m:\code\VidiFlow\frontend
   scripts\code_generation\generate.cmd
   ```
3. **Flutter Build:**
   ```cmd
   cd m:\code\VidiFlow\frontend\appflowy_flutter
   flutter build windows --release
   ```

---
Next 5 Steps
To make this feature user-facing, the following steps are needed:

Regenerate Dart Protobufs:
Run the project's build tools (e.g., cargo make flowy_sdk_protobuf or similar) to regenerate the Dart code from the updated Rust 
entities.rs
. This is required for the Flutter app to "see" the new 
web_search_enabled
 field.
Update 
ChatSettingsManager
 (Dart):
Modify 
lib/plugins/ai_chat/application/chat_settings_manager.dart
 to read and write the webSearchEnabled field from the updated protobuf classes.
Add UI Toggle:
Update the Chat Settings widget (likely in lib/plugins/ai_chat/presentation/) to include a "Search Web" toggle switch that calls the updated manager.
Run & Verify:
Launch the app, enable the toggle, and ask a question like "What is the stock price of Apple today?" to verify the tool triggers and returns current data.
Polish:
(Optional) Expose the max_results configuration to the UI (backend defaults to 5) or add a visible "Searching web..." indicator in the chat UI.


Based on my analysis of the codebase and the changes required, here are the answers to your questions:

⏱️ Time Estimate
It will take approximately 1.5 to 2 hours to complete the remaining steps.

Coding & Configuration: ~45 minutes (Regenerating protobufs, updating Dart logic, and building the UI toggle).
Compilation: ~45-60 minutes. Because we modified the Rust backend (flowy-ai), a full recompilation of the Windows backend library is mandatory.
🏗️ Compilation & "VidiFlow" App
Compilation Required: Yes. The changes we made are in the deep backend (Rust). The new Windows executable must be compiled to include the new "Web Search" capability.
App Name: The app is configured as VidiFlow.
The configuration explicitly states: "VidiFlow: The AI collaborative workspace for the VidiSmart community."
You are running a custom fork, so the built 
.exe
 will effectively be VidiFlow.
☁️ Backend Cloud
Same Cloud: Yes.
The app is using the standard appflowy_backend package. Unless you have explicitly changed the server URL in the .env or build configuration to point somewhere else, it will continue to connect to your existing AppFlowy Cloud / Supabase backend.
The Web Search feature itself runs locally on your machine (using the flowy-ai Rust crate), so it doesn't add any new load to your cloud backend.
🛠️ Flutter SDK
SDK Status: Yes, it is present.
I confirmed that m:\code\dev\flutter exists.
The project requires Flutter >=3.27.4, so as long as the version in that folder matches, we are good to go.
🚀 Next Step
I am ready to start the Protobuf Regeneration step. This is the bridge that connects our Rust backend changes to the Flutter frontend.

Shall I proceed with regenerating the protobufs?

Good
Bad
Review Changes

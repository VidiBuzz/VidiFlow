# VidiFlow Windows Build Instructions & Requirements

This document outlines the specific requirements and steps to build VidiFlow on Windows. Use this as a reference to ensure your environment is correctly configured.

## 1. Prerequisites & Status

| Tool | Requirement | Status / Configuration Note |
|------|-------------|----------------------------|
| **LLVM** | Required for `libclang.dll` (used by `dart-ffi` / `bindgen`). | **Installed.** Must set environment variable: `set LIBCLANG_PATH=C:\Program Files\LLVM\bin` |
| **ImageMagick** | Required for icon conversion (`.svg` -> `.ico`). | **Installed.** Ensure `magick` is in PATH or use full path: `C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe` |
| **Visual Studio** | C++ Build Tools (VS 2019 or newer). | **Installed.** Required for compiling Rust and C++ artifacts. |
| **Flutter SDK** | Version 3.27.4 or compatible. | **Installed.** *Note:* `pubspec.yaml` patched to override `leak_tracker` dependency conflict. |
| **Rust** | Stable toolchain. | **Installed.** Configured via `rust-toolchain.toml`. |
| **Build Tools** | `cargo-make`, `duckscript`. | **Installed.** Used by `Makefile.toml` for orchestration. |

---

## 2. Build Instructions

If the build process hangs or fails, clear your terminal and run these three steps in order.

### Step 1: Build the Backend (Rust)
This compiles the high-performance core logic into a DLL.

```cmd
cd m:\code\VidiFlow\frontend
set LIBCLANG_PATH=C:\Program Files\LLVM\bin
cd rust-lib
cargo build --release --package=dart-ffi --target x86_64-pc-windows-msvc --features dart
```

### Step 2: Run Code Generation (Dart)
This generates the necessary Flutter files (`.freezed.dart`, `.g.dart`, etc.) that are often missing.

```cmd
cd m:\code\VidiFlow\frontend
scripts\code_generation\generate.cmd
```

### Step 3: Build the Application (Flutter)
This compiles the frontend and bundles everything into the final executable.

```cmd
cd m:\code\VidiFlow\frontend\appflowy_flutter
flutter build windows --release
```

## 3. Output

Once Step 3 completes successfully, your VidiFlow executable will be located at:
`m:\code\VidiFlow\frontend\appflowy_flutter\build\windows\runner\Release\VidiFlow.exe`

# VidiFlow Android (scaffold)

- **Package:** `com.vidismart.vidiflow`
- **Product spelling:** VidiFlow / VidiSmart
- **Emulator backend baseUrl:** `http://10.0.2.2:8080`
- **Physical device:** replace with host LAN IP, e.g. `http://192.168.x.x:8080`

## Layout

```
android/
  data/ChatMessage.kt
  data/ChatRepository.kt
  ui/VidiFlowViewModel.kt
  ui/VidiFlowChatScreen.kt
  gradle-deps.md
```

Copy these into an Android Studio project source set after James greenlights build. Keep the Zhipu key on the FastAPI host only — never in the APK.

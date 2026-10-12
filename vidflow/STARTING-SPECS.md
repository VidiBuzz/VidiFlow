# VidiFlow Android — Starting Specs

**Status:** Blueprint / starting scaffold (not a shipping APK)  
**Owner:** VidiFlow Android agent  
**Canon paths:** `/code/vidismart/vidflow/` · `M:\code\vidismart\vidflow\` · box `/workspace/vidflow-android/`  
**Related (do not overwrite):** web tree `vidiflow/`  

---

## 1. Goal

Ship a thin **Jetpack Compose** Android chat client for **VidiFlow** that streams model replies over **SSE** from a small **FastAPI** gateway. The gateway holds the **Zhipu / Z.AI** key and proxies to **GLM-5.3-Flash** (or current GLM flash SKU). The phone never sees `ZHIPU_API_KEY`.

---

## 2. Architecture

```
[ Compose UI ]
     │  StateFlow / ViewModel
     ▼
[ ChatRepository ] ── HTTP POST + SSE read ──► [ FastAPI backend :8080 ]
                                                    │
                                                    │  OpenAI-compatible chat/completions
                                                    ▼
                                              [ Zhipu / Z.AI API ]
```

- **Emulator → host:** `http://10.0.2.2:8080` (Android emulator loopback to host machine).
- **Physical device:** use LAN IP of the machine running uvicorn (document in android/README).
- **Package name:** `com.vidismart.vidiflow` (product spelling remains VidiFlow).

---

## 3. Backend (FastAPI SSE proxy)

Exact starter lives in `backend/app.py`:

- `POST /chat/stream` accepts `{ "messages": [ { "role", "content" }, ... ] }`.
- Upstream call uses env **`ZHIPU_API_KEY`** (see `.env.example`). Placeholder empty string is OK in examples; real runs require a key.
- Upstream streams OpenAI-compatible chunks; proxy re-emits as **SSE** `data:` lines (token text), then a terminal event.
- CORS open enough for local Compose / emulator testing.
- Deps: `fastapi`, `uvicorn`, `httpx`, `pydantic` (`requirements.txt`).
- Run (James / agent later — **do not auto-start in this task**):  
  `uvicorn app:app --host 0.0.0.0 --port 8080` from `backend/`.

---

## 4. Android (Compose + MVVM)

Scaffold under `android/`:

| File | Responsibility |
| --- | --- |
| `data/ChatMessage.kt` | Simple role/content message model |
| `data/ChatRepository.kt` | OkHttp call to `/chat/stream`, parse SSE, emit tokens |
| `ui/VidiFlowViewModel.kt` | Holds message list + input; launches stream collect |
| `ui/VidiFlowChatScreen.kt` | Compose chat UI (list + text field + send) |
| `gradle-deps.md` | Dependencies block to paste into module `build.gradle.kts` |
| `README.md` | Package, emulator baseUrl, key safety |

Flow:

1. User sends text → ViewModel appends user `ChatMessage`, clears input.
2. Repository opens streaming POST; as tokens arrive, ViewModel appends/updates assistant bubble.
3. Errors surface as a short assistant/system error line (no crash).

---

## 5. Security

- **Never** embed Zhipu keys in BuildConfig, resources, or APK.
- `.env` is gitignored in real repos; only `.env.example` is committed.
- Production later: auth between app ↔ gateway; this scaffold is local-dev only.

---

## 6. Next steps (for VidiFlow Android agent)

1. Expand `ANDROID-MOBILE-PLAN.md` into phased milestones (project create → wire deps → run backend → emulator chat → harden).
2. After James **GO**: create Android Studio project with package `com.vidismart.vidiflow`, copy scaffold sources into proper source sets.
3. Remirror plans to `M:\code\VidiBot\vidiflow-android\` when VidiBot asks (separate from this `vidflow/` canon).
4. Keep web `vidiflow/` and mobile `vidflow/` trees distinct.

---

## 7. Spelling

- Product: **VidiFlow** / **VidiSmart**
- Folder: `vidflow/` (mobile lane)
- Package may stay `com.vidismart.vidiflow` as in this spec


---

## 8. James locks (2026-10-01) — Mez + branding

- Fleet priority for Android: ~3–4 after main VidiFlow works.
- Settings must cover **Mez** (Hermes fork) gateway/config so the phone talks to our stack.
- Never rely on unofficial Play Store Hermes Agent apps for real keys.
- Client UI brand: **VidiFlow** / **Mez** only — never “Hermes” on-screen.
- Full phased plan: `ANDROID-MOBILE-PLAN.md` (DRAFT v1.1).


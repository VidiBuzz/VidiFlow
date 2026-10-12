# VidiFlow Android — Mobile Plan

**Status:** DRAFT v1.1 (2026-10-01) — plan + scaffold only  
**Owner:** VidiFlow Android agent  
**Fleet priority:** ~3–4 after main VidiFlow works (James lock 2026-10-01)  
**Canon:** `M:\code\vidismart\vidflow\` (= box `/workspace/vidflow-android/`)  
**Remirror:** `M:\code\VidiBot\vidiflow-android\`  
**Do not merge into:** `vidismart/vidiflow/` (web / Next / AppFlowy)

**Gate:** No APK build · no `docker up` · no API credit spend until James + VidiBot greenlight.  
**On GO (VidiBot):** Phase 1 `assembleDebug` first; stretch = health / backend-online tile.

---

## Locked stack

| Layer | Choice |
| --- | --- |
| Client | Jetpack Compose + MVVM + OkHttp SSE |
| Package | `com.vidismart.vidiflow` (product spelling: **VidiFlow**) |
| Gateway | FastAPI SSE proxy (`backend/app.py`) on `:8080` |
| Model | **GLM-5.3-Flash** — API id `glm-5.3-flash` (confirmed live 2026-09-16 via [docs.z.ai](https://docs.z.ai/guides/vlm/glm-5.3-flash)) |
| Upstream base (default in scaffold) | `https://api.z.ai/api/paas/v4` → `POST …/chat/completions` |
| Alt bases | Coding Plan keys often need `https://api.z.ai/api/coding/paas/v4`; CN mainland often `https://open.bigmodel.cn/api/paas/v4` — pin via `ZHIPU_BASE_URL` |
| Secrets | `ZHIPU_API_KEY` **server env only** — never in APK / BuildConfig / resources |
| Emulator URL | `http://10.0.2.2:8080` |
| Prod URL (later) | TLS gateway e.g. Cloudflare Tunnel → `api.vidismart.com` |

---

## James locks (2026-10-01)

| Lock | Rule |
| --- | --- |
| Priority | After main VidiFlow works, Android is roughly **priority 3–4** |
| Mez settings | App must encompass **settings from Mez** (Hermes fork) — gateway/config so the phone talks to **our** stack |
| Keys | **Do not** rely on unofficial Play Store “Hermes Agent” apps for real keys — keys stay on our gateway / Mez stack |
| Branding (client UI) | **VidiFlow** / **Mez** only — **never** show “Hermes” on client UI |
| Product brand | VidiFlow / VidiSmart (folder still `vidflow/`) |

### Mez / gateway settings (scope add)

Phase 1+ must include a **Settings** surface (Compose) that configures how the phone reaches our stack, aligned with Mez gateway/config concepts:

- Gateway base URL (debug emulator `10.0.2.2:8080` / LAN / prod TLS)
- Optional app auth token (not Zhipu key)
- Model / endpoint display name for humans (e.g. GLM flash) — no provider marketing Chrome that says Hermes
- Connection status (stretch on GO: health / backend-online tile)

Internal docs may mention Mez’s Hermes lineage for engineers; **user-visible strings = VidiFlow / Mez only**.


## Starting inventory (what exists today)

| Path | Notes |
| --- | --- |
| `STARTING-SPECS.md` | Blueprint + architecture |
| `backend/app.py` | SSE proxy; CORS `*`; model env `VIDIFLOW_MODEL` default `glm-5.3-flash` |
| `backend/.env.example` | Empty `ZHIPU_API_KEY=` |
| `android/data|ui/*.kt` | Compose chat stubs (not a Gradle project yet) |
| `android/gradle-deps.md` | Deps paste block |

### Scaffold bugs to fix at GO (do not “build” yet — track only)

1. **Role type mismatch:** `ChatMessage.role` is `MessageRole` enum, but `VidiFlowViewModel` / `VidiFlowChatScreen` pass/compare `"user"` / `"assistant"` strings — will not compile as written.
2. **JSON role serialization:** `ChatRepository` does `.put("role", m.role)` — must send lowercase OpenAI roles (`user`/`assistant`/`system`), not enum `name`/`toString` blindly.
3. **Cleartext HTTP:** emulator uses `http://` — needs `android:usesCleartextTraffic` or network-security-config for debug; **never** ship cleartext in release.
4. **CORS `allow_origins=["*"]` + `allow_credentials=True`:** fine for local throwaway; invalid/unsafe for prod.
5. **No auth** on `/chat/stream` — anyone who can reach the host burns Zhipu credits.
6. **No cancel** of in-flight OkHttp call when user navigates away / sends again.
7. **Health service name** says `vidiflow-proxy` (product ok; keep folder `vidflow`).

---

## Phase 0 — Spec freeze & model id (DONE in this draft)

- [x] Read `STARTING-SPECS.md`, `backend/`, `android/`
- [x] Live-lookup GLM-5.3-Flash model code → **`glm-5.3-flash`**
- [x] Confirm OpenAI-compatible path `/chat/completions` under paas v4
- [x] Document Coding Plan vs paas base URL pitfall
- [ ] James confirms which Z.ai product key (paas vs coding) we will use at GO

**Exit:** This plan remirrored; VidiBot status packet sent.

---

## Phase 1 — Android project scaffold (after James GO)

**Goal:** Real Android Studio / Gradle project that compiles the stubs (no live API required for compile).

**Order on GO (VidiBot):** `./gradlew :app:assembleDebug` first. Stretch: health / backend-online tile.

1. Create empty Compose project, package `com.vidismart.vidiflow`, minSdk ≥ 26, target/compile current stable.
2. Apply Compose BOM + deps from `android/gradle-deps.md` (bump BOM to current stable at GO).
3. Map stubs into `app/src/main/java/com/vidismart/vidiflow/{data,ui}/`.
4. Fix role enum ↔ string mapping (single source of truth: enum + `.apiRole` helper).
5. `AndroidManifest`: `INTERNET`; debug-only cleartext to `10.0.2.2` / LAN.
6. `BuildConfig` / flavors: `DEBUG_BASE_URL=http://10.0.2.2:8080`, `RELEASE_BASE_URL=https://api.vidismart.com` (or tunnel URL) — **no keys**.
7. Wire `MainActivity` → `VidiFlowChatScreen` + **Settings** (Mez-aligned gateway/config: base URL, app token; UI strings **VidiFlow / Mez only** — never Hermes).
8. Stretch: call `GET /health` and show a backend-online tile / chip.

**Exit:** `./gradlew :app:assembleDebug` succeeds offline (no Zhipu call).

**Non-goals:** Play Store listing, signing beyond debug keystore; third-party Hermes Agent apps.

---

## Phase 2 — Gateway harden (before any shared/prod URL)

**Goal:** Local-dev safe → “roommates can’t drain credits” safe.

1. **Auth:** require `Authorization: Bearer <VIDIFLOW_APP_TOKEN>` (or mTLS later) on `/chat/stream`; Android stores token in EncryptedSharedPreferences / DataStore — still **not** the Zhipu key.
2. **CORS:** replace `*` with explicit emulator/dev origins; drop credentials-with-wildcard.
3. **Rate limit:** per-IP + per-token sliding window (e.g. slowapi / custom middleware).
4. **Payload caps:** max messages, max chars, reject huge bodies.
5. **Timeouts:** upstream httpx timeouts (connect/read); map 429/5xx to clean SSE error events.
6. **Structured SSE:** optional JSON events `{type:token|error|done}` instead of bare text (keep backward compat during migrate).
7. **Logging:** no prompt/response bodies in prod logs by default; redact `Authorization`.
8. **`.env`:** document `ZHIPU_API_KEY`, `ZHIPU_BASE_URL`, `VIDIFLOW_MODEL`, `VIDIFLOW_APP_TOKEN`; never commit `.env`.

**Exit:** Unauthenticated request rejected; authenticated local stream works with key set (only when James allows a spend test).

---

## Phase 3 — SSE chat E2E (emulator)

**Goal:** Type in Compose → tokens stream into assistant bubble.

1. Run uvicorn on host `0.0.0.0:8080` (manual / James-approved only).
2. Emulator hits `http://10.0.2.2:8080/health` then `/chat/stream`.
3. ViewModel: append user msg → placeholder assistant → collect Flow tokens → finalize; surface errors without crash.
4. Cancel prior job on new send; OkHttp `Call.cancel()`.
5. Physical device path: document LAN IP + firewall note in `android/README.md`.

**Exit:** One successful streamed reply on emulator **after** greenlighted spend (or dry-run path with empty key showing placeholder SSE).

---

## Phase 4 — Compose polish

1. Message bubbles (user right / assistant left), streaming cursor, failed-state retry.
2. System theme + VidiSmart-adjacent colors (no full brand system required for v0).
3. Scroll-to-bottom; disable send while streaming; optional stop button.
4. Empty state + connection error banner (gateway down vs upstream error).
5. Accessibility: content descriptions, large-text friendly.

**Exit:** Usable chat UX on phone/emulator screenshots for James review.

---

## Phase 5 — Multimodal (image → GLM-5.3-Flash)

GLM-5.3-Flash is **natively multimodal** (image / video / file in; text out). Docs: content parts with `type: image_url` (URL or base64 data URL).

1. Photo picker / camera permission flow.
2. Client: attach image as data-URL or upload to gateway temp store (prefer gateway upload to avoid giant SSE request bodies).
3. Gateway: translate to OpenAI-compatible multimodal `messages[].content[]`.
4. Caps: max resolution / bytes; strip EXIF as needed.
5. UI: thumbnail in bubble; fail soft if model/endpoint rejects.

**Exit:** One image+text turn streams a coherent reply (post-greenlight).

---

## Phase 6 — Room persistence

1. Room DB: conversations + messages (role, content, createdAt, optional local image URI).
2. Repository loads history into ViewModel; stream appends persist on DONE.
3. Conversation list screen (simple).
4. Export/clear chat (privacy).

**Exit:** Kill app → reopen → last thread intact.

---

## Phase 7 — Deploy / tunnel + release

1. Host gateway (Fly / Railway / VPS / existing Vidi infra — James picks).
2. Cloudflare Tunnel (or equiv) → hostname e.g. `api.vidismart.com` with TLS.
3. Release `baseUrl` = HTTPS only; cleartext disabled.
4. App signing (upload key); Play internal testing track optional.
5. Secrets via host secret store / `.env` on server — rotate runbook.
6. Observability: `/health`, uptime check, basic error rate.

**Exit:** Physical device on cellular reaches TLS gateway; chat works.

---

## Phase 8 — QA checklist

### Security
- [ ] No `ZHIPU_API_KEY` in APK (`strings`, decompile smoke)
- [ ] Release has cleartext disabled
- [ ] Prod CORS not `*`
- [ ] App token required; Zhipu key never leaves server
- [ ] Rate limits verified

### Functional
- [ ] `/health` OK
- [ ] Stream tokens + `[DONE]`
- [ ] Empty key dry-run message (dev)
- [ ] Error paths (4xx/5xx/timeout) show inline, no crash
- [ ] Cancel in-flight works
- [ ] Multimodal (if enabled) 
- [ ] Room restore

### Model / config
- [ ] `VIDIFLOW_MODEL=glm-5.3-flash`
- [ ] `ZHIPU_BASE_URL` matches key type (paas vs coding)
- [ ] Live-lookup re-check model id if Z.ai renames

### Process
- [ ] Plans remirrored to `M:\code\VidiBot\vidiflow-android\`
- [ ] Web `vidiflow/` untouched
- [ ] No spend without James GO

---

## Risks (tracked)

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Key leakage in APK** | Critical | Keys only in server env; CI grep / APK string scan in QA |
| **Open CORS `*`** | High | Phase 2 lockdown before any public URL |
| **Unauthenticated `/chat/stream`** | Critical | App token + rate limit before tunnel |
| **Cleartext HTTP in release** | High | Debug-only network security config; release HTTPS |
| **Wrong base URL for key type** (paas vs coding) | High | Document both; pin `ZHIPU_BASE_URL`; one smoke call at GO |
| **Model id drift** | Medium | Canonical id today: `glm-5.3-flash`; re-lookup at GO |
| **Scaffold won’t compile** (role types) | Medium | Fix in Phase 1 before assemble |
| **SSE read timeout / proxy buffers** | Medium | OkHttp readTimeout 0; disable proxy buffering on tunnel |
| **Credit burn from loops / bugs** | High | No auto-start uvicorn; no spend until GO; rate limits |
| **Accidental merge into web `vidiflow/`** | High | Separate folder `vidflow/`; remirror only to VidiBot lane |
| **Hermes branding on client UI** | High | James lock: user-facing = VidiFlow / Mez only; strip Hermes strings in QA |
| **Unofficial Play Store Hermes Agent for keys** | Critical | Forbidden for real keys — use our Mez/gateway settings + server secrets only |
| **Huge multimodal payloads** | Medium | Gateway upload + size caps |
| **Enum/API role mismatch upstream** | Medium | Normalize to `user`/`assistant`/`system` |

---

## Decision log (open)

1. Which Z.ai key product at GO — **paas** vs **Coding Plan**? (sets default `ZHIPU_BASE_URL`)
2. Prod hostname — confirm `api.vidismart.com` vs another.
3. Auth scheme v0 — static app token vs device-bound vs user login (VidiSmart accounts)?
4. When multimodal / Room land relative to first internal dogfood.
5. Mez settings field parity — which Mez gateway/config knobs are in-scope for v0 Settings (URL + token only vs full Mez panel)?
6. Exact Mez display name / iconography for Settings (still never Hermes).

---

## Remirror rule

After every plan edit:

1. Write canon: `M:\code\vidismart\vidflow\ANDROID-MOBILE-PLAN.md` (+ box `/workspace/vidflow-android/`)
2. Copy same file to `M:\code\VidiBot\vidiflow-android\ANDROID-MOBILE-PLAN.md`
3. Status packet → VidiBot (informational) when draft or major revision lands

---

## Immediate next ask for James / VidiBot

**Greenlight scope:** approve this DRAFT plan (v1.1 includes Mez settings + branding locks). Still **no** Android Studio project create, **no** uvicorn, **no** API calls until an explicit **GO**. On GO: Phase 1 `assembleDebug` first; stretch health tile.

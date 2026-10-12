# VidiFlow Android (mobile)

**Product:** VidiFlow · **Owner agent:** VidiFlow Android  
**Status:** Specs + plan lane — no APK build until James greenlights.

This folder is `vidflow` (James path), **not** the existing web tree `vidismart/vidiflow/`. Do not merge into the Next.js/AppFlowy web app without an explicit decision.

## Layout
- `STARTING-SPECS.md` — blueprint (FastAPI SSE gateway + Jetpack Compose MVVM)
- `ANDROID-MOBILE-PLAN.md` — phased plan (owned by VidiFlow Android agent)
- `backend/` — FastAPI proxy (keys via env only)
- `android/` — Compose/Kotlin source stubs from starting specs

## Hard rules
- Never embed `ZHIPU_API_KEY` or provider keys in the APK
- Emulator → host: `http://10.0.2.2:8080`
- Prod: point `baseUrl` at a TLS gateway (tunnel/domain), not cleartext

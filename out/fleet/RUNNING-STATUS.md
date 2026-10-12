# RUNNING STATUS & FAILURES BOARD — VidiBot
Every open failure lives here. Updated 2026-10-10 01:20 EDT. No item leaves this list without being DONE or being reported honestly as blocked (with the exact thing needed to unblock it).

## OPEN FAILURES / STALLED ITEMS
1. **Google Drive MCP** — NOT CONNECTED. James logged in via browser 4× on Oct 9; plugin dir `plugins\gdrive-sa\` is EMPTY (zero files) — whatever creds were granted were never persisted to the plugin. Agent dispatched 01:20 to find any stored Google creds on disk and finish the connection without re-asking James.
2. **OpenCode CLI free models** — CLI installed (WSL `opencode` 1.14.48 + Windows `opencode-cli.exe`); auth/free-lane wiring NOT verified end-to-end. Agent dispatched 01:20 to prove a real free-model call and write the recipe.
3. **Peer link upstairs (.67) + vidi (.40)** — our side done/proven; their gates still 401 with shared key. Background agent polling every 45s (deleg_d2ead4ca). Human step when convenient: `findstr API_SERVER_ %LOCALAPPDATA%\hermes\.env` on the upstairs box.
4. **Artcraft: deckcraft** — build failed exit=101 after 1417s. **artcraftx** — failed exit=101 in 4s. Queued for diagnosis.
5. **EquityGen compliance** — 4 questions open with James/Stu. No copy/deploy/funnel until answered.
6. **VidiTwin pick sheet** — awaiting James's per-slot choice (`landing\_compare.html`).
7. **Go-live queue** — VidiModels CF deploy (token on disk, auth-gated), VidiSmart publish (live root = stale June page), (A)/(B) catalogue decision, Tavus lock lift, cheaperinference top-up.
8. **Fleet dashboard 8790** — needs restart for EquityGen lane (was awaiting approval).

## CLOSED TONIGHT (so the list stays honest about what's done)
- Peer: our api_server LAN bind + key applied + proven 200 (three-day item — closed on our side)
- Images: all six sites wired, $0, with proof screenshots
- Artcraft: 9/11 apps built (20 binaries), FilmCraft + PhotoCraft launched on James's desktop
- Security audit: running every 6h (cron 1324da7b27a5), first pass clean; cdn.vidi.news leak URL confirmed 404-down
- Memory: hostname .67 discovered + full-/24 scan rule saved; proactive-show-work rule saved

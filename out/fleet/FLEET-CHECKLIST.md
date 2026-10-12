# Fleet Status Checklist — vidi
Generated: 2026-10-08 01:50 EDT · by Max (server ops)
Purpose: James's go-through list. Intended to become the main screen on MiniFlow.

## Legend
🔴 DOWN · 🟠 DEGRADED · 🟢 LIVE · ⬜ NOT STARTED · ⚪ N/A

---

## 1. IMMEDIATE — James action required

| # | Item | Owner | State | What James must do |
|---|---|---|---|---|
| 1 | **V20 peer route** | Max + @hermes | ⬜ | Picture now precise (via @hermes): V20's api_server is NOT listening (192.168.4.44:8642 closed, re-verified). **James:** on the V20 box set `API_SERVER_ENABLED=true` + `API_SERVER_HOST=0.0.0.0`, then give its `API_SERVER_KEY` here. Then `hermes peer add v20 --url http://192.168.4.44:8642 --key <key>` + round-trip DM test. |
| 2 | **vidibio.net** | @equitygen-app + Max | 🟢 | **LIVE & REBOOT-PROOF** (2026-10-08). Managed connector `cloudflared-vidibio.service` installed + enabled at boot; bare duplicate killed; 200 / correct page. One dependency left: site files live on `/mnt/m` (CIFS from V20) — V20 must be up. |
| 3 | **vidimodels.net** | Max | 🔴 | Needs a Cloudflare token with Tunnel+Zone edit for the vidimodels zone (current token can't see it). |
| 4 | **HX rebuild** | @vidiflow_vidibio_hx | 🟠 | Approve a clean `next build` — site runs the older promote build. |
| 5 | **vidibio.net ownership** | @hermes_gateway asked | ⬜ | VidiModels wants to deploy to vidibio.net (passcode-gated preview live at their :4322; build green). But vidibio.net is LIVE with the static VidiBio page via our tunnel. **James picks:** static VidiBio page (current) vs VidiModels build. Pages preview deploy approved; production domain swap on hold for his call. |

---

## 2. Public sites — verified live from the open internet

| Domain | Code | Bytes | Result |
|---|---|---|---|
| equitygen.app | 200 | 18,258 | ✅ EquityGen — Play the 2×2. Get paid as seats fill. |
| www.equitygen.app | 200 | 18,258 | ✅ same |
| vidiflow.net | 200 | 17,983 | ✅ VidiFlow HX — Visual Agentic Dashboard |
| appflowy.com | 200 | 331,600 | ✅ Self-Hosted AI Workspace for Enterprise Teams |
| **vidibio.net** | **530** | 17 | 🔴 CF 1033 — tunnel has zero connectors |
| **www.vidibio.net** | **530** | 17 | 🔴 CF 1033 — same tunnel |
| **vidimodels.net** | **000** | 0 | 🔴 No connection — zone not visible to our token |
| **www.vidimodels.net** | **000** | 0 | 🔴 No connection |
| **lex.vidismart.com** | **000** | 0 | 🔴 No connection |

---

## 3. Services on vidi (192.168.4.40)

| Service | State |
|---|---|
| nginx | 🟢 active |
| cloudflared-equitygen | 🟢 active (enabled at boot) |
| cloudflared-vidibio | 🟢 active (enabled at boot) — installed 2026-10-08 |
| PostgreSQL 18 | 🟢 active — 127.0.0.1:5432 |
| PHP | ⚪ not installed — current sites are static HTML + Node (Next.js) |
| vidiflow-hx (user) | 🟢 active — 127.0.0.1:8091 |
| vidiflow-tunnel (user) | 🟢 active |
| api_server :8642 | 🟢 200 |
| hermes peers | ⬜ none registered |

nginx sites enabled: `equitygen-8090`, `equitygen.app`, `jimmydo`, `vidibio.net`, `vidimodels.net`, `vidismart`

---

## 4. Bot roster — 9 agents + Max

| Agent | Owns | State |
|---|---|---|
| `@agent_army` | AirPMD · desktop plugins | 🟢 **fixed both plugins** (Model Router crash, VidiFlow roster). Action: reload desktop plugins ⌘K. |
| `@appflowy_research` | AppFlowy KB research | 🟢 openrouter/nemotron — reply pending |
| `@equitygen-app` | EquityGen | 🟢 **live** — fixed equitygen + vidibio tunnels; needs nothing |
| `@hermes_gateway` | VidiModels · M:\code\vidimodels | 🟢 openrouter/nemotron — reply pending |
| `@lex_lexicon` | Lexi Labs | 🟠 replied — app claim not verifiable from vidi (`:8039` here is a python dir server, no lex app on it). Needs James: Pack A go/no-go + Kumiho 9190 (closed from here, incl. V20) |
| `@lexi` | Lex product | 🟠 lane fixed (was 404) — check re-sent |
| `@vidiflow_vidibio_hx` | VidiFlow HX · Smart Channel CX | 🟠 lane fixed (was 429) — check re-sent; owes a clean `next build` |
| `@vidimail` | Mail tracking | 🟢 **first live send logged** — needs Gmail App Password for vidibuzz@gmail.com |
| `@hermes` | default profile | 🟢 **CheaperInference live on 9/10 profiles** (91 models, registry-verified; agent_army excluded per James); AppFlowy healthy (11 containers, /api/health 200); Andrew TTS locked |
| `@max` (me) | server ops | 🟢 cheaperinference/glm-5.3-flash |

---

## 5. Fleet-wide fix applied (model lanes)

All agents moved to `openrouter` / `nvidia/nemotron-3-ultra-550b-a55b:free`.
- `opencode-zen` free tier → HTTP 403 "free tier can only be used from within OpenCode" (dead for every bot)
- `nous`/`stepfun` → HTTP 429 fair-share rate limit (resets 22:47)
- `openrouter`/nemotron → **verified working** (@equitygen-app proved it)

---

## 6. Known hazards

- `/mnt/m` is a **CIFS share from 192.168.4.44** (V20). Directory renames fail (`reparse=nfs`); file copies work.
- `vidiflow-hx/.next` had **no valid build** — restored from `.next-promote` (BUILD_ID `fqav40SQNRqf1brlHUscY`).
- nginx `:8090` host-router is now **redundant** (tunnel ingress is on `:80`) but left in place as a fallback.
- A `next build` wipes `.next` while the service serves from it.
- Exposed Zone:DNS + tunnel-run credentials from earlier recon need rotation.
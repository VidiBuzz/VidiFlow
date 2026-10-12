# VidiFlow — Grok Bot (Crock Pot) notes
Updated: 2026-09-06 (ET)

## Status this week
Working notes for VidiFlow front end + SMB agent-setup product. Incomplete list — expand as we learn.

## SuperGrok tanks (quick)
- **Tank A** — grok.com / Grok app / Voice-Ara / Kilo Code (xAI OAuth). One weekly bar.
- **Tank B** — Grok Bot (desktop + mobile). Separate weekly bar; funded by Cursor paid plan OR linked SuperGrok.
- Same SuperGrok sub can fund both paths; emptying A does not empty B.

## Diagrams (share)
`M:\code\VidiFlow\supergrok-explainers\`
- `01-supergrok-two-tanks.png`
- `02-logins-brands.png`
- `03-where-to-work.png`

## Grok Bot API — heads up
**No official public API** from Cursor/xAI for Grok Bot (fleet/dashboard/OpenAI-compatible) as of these notes.

What exists (unofficial / can break):
- Private local HTTP gateway (community ~port 1340) — undocumented internal
  - Forum: https://forum.cursor.com/t/grok-bot-can-i-send-it-a-message-from-outside/168199
- Unofficial SDK: https://github.com/adam91holt/grokbot-sdk (Tailscale / SSH; treat token like a password)
- Hermes / ConnectRPC experiments — also unofficial

**VidiFlow implication:** build status packets / glance board on *our* stack; do not bet the SMB product on an official Grok Bot API that is not published yet.

## Android login (James / vidistudios@gmail.com)
Official: https://cursor.com/help/grok-bot/sign-in — Grok Bot uses **Cursor account**, no separate Grok Bot login.

Tried / planned ladder:
1. Desktop Grok Bot already works with Cursor + SuperGrok link.
2. On phone Chrome: sign into https://cursor.com and https://cursor.com/dashboard as Google `vidistudios@gmail.com` first.
3. Open Grok Bot Android → sign in with **same Cursor account** (Continue with Google).
4. If blank Cursor pages / password loops / both buttons fail: clear cursor.com + x.ai cookies, retry private window; update app; try https://x.ai/bot on a browser with same Cursor account.
5. If still stuck: email hi@cursor.com with account email, exact error, platform/version, steps tried. Auth loops can need Cursor support reset.

Play Store: https://play.google.com/store/apps/details?id=ai.x.grok.bot

## Naming
- Product: **VidiFlow** (not videoflow / video flow)
- Crock Pot = Grok Bot
- IDE path: **Kilo Code** (not Kylo)

## Open TODOs for this week
- [ ] Expand connector / multi-model list (Grok, Claude, Gemini, Hermes, Kilo Code, …)
- [ ] Confirm whether unofficial gateway is usable for a glance front end (LAN/Tailscale only)
- [ ] Ship fluid animated front end MVP
- [ ] Finish Android Grok Bot login for James

## Can Grok Bot use other models / local LLMs?
**Official answer (as of 2026-09-06):** No documented model picker, BYOK brain, or Ollama path inside Grok Bot itself. Official help/docs ([getting started](https://cursor.com/help/grok-bot/getting-started), [plans](https://cursor.com/help/grok-bot/plans), [docs](https://cursor.com/docs/grok-bot)) never describe switching the Bot brain to Claude, Gemini, Hermes, or a local LLM. Secrets cards are for plugin/API credentials, not swapping the agent model.

**Do not confuse with:**
- **Cursor IDE** — multi-model / custom OpenAI-compatible endpoints (separate product)
- **Grok Build (CLI)** — supports custom/`Ollama` endpoints in `~/.grok/config.toml` ([xAI build settings](https://docs.x.ai/build/settings)) — not Grok Bot
- **Unofficial community** — forks/patches (e.g. open Grok Bot remakes, opengrok-style bindings) claim multi-model; not Cursor-supported; can break

**Practical for VidiFlow multi-model story:**
- Grok Bot = one hosted brain + computer/tools
- To involve Claude/Gemini/local: Bot can *call* their APIs/CLIs as tools if you wire keys/connectors — that is orchestration, not native multi-model Bot
- Or run those agents outside Bot and unify in the VidiFlow front end

## Coding default: GLM-5.3
James wants **GLM-5.3** (Z.ai) for most coding work.

**Where:** VS Code + **Kilo Code** with Z.ai API key / GLM Coding Plan — **not** SuperGrok OAuth (Tank A), **not** Grok Bot brain.

**Setup (official):** https://docs.z.ai/scenario-example/develop-tools/kilo
1. Kilo → Use your own API key
2. Provider: **Z AI**
3. Entrypoint: **International Coding Plan** → `https://api.z.ai/api/coding/paas/v4/` (coding endpoint, not general paas)
4. Paste Z.AI API key
5. Model: **`glm-5.3`** (update plugin if list is stale; docs still show older glm-4.7 in places — pick 5.3 when listed)

**Model docs:** https://docs.z.ai/guides/llm/glm-5.3
- Thinking always on; coding → `reasoning_effort: max` recommended
- GLM Coding Plan: https://z.ai (Coding Plan subscribe) — weekend/off-peak often 50% points

**Split this week:**
- Code on disk (`M:\code` / vidi): Kilo + GLM-5.3
- Ops / deploys / agents: Grok Bot (Tank B)

## Coding path correction: OpenRouter (not Z.ai Coding Plan)
- Provider: **OpenRouter**
- Model: **GLM-5.3** (slug often `z-ai/glm-5.3` — confirm in OpenRouter catalog)
- Why: ~80–90% of Opus-class for coding at promo/half-price cents; draft with GLM, human/Bot review after
- Kilo setup: Settings → Providers → Connect **OpenRouter** → paste key → pick GLM-5.3
  - Guide: https://openrouter.ai/blog/tutorials/kilo-code-openrouter/
  - Keys: https://openrouter.ai/settings/keys

## Cursor-in-browser + Grok Bot idea
Yes: [cursor.com/agents](https://cursor.com/agents) is Cursor Web / Cloud Agents UI in a browser.
Grok Bot *can* drive a browser on its computer.

**But:** that is not a clean “use GLM via Cursor” pipeline. Caveats:
- Cloud Agents meter **Cursor** usage (Pro/tokens), not OpenRouter — opposite of the cheap GLM plan
- Bot driving Cursor Web = fragile UI automation (login, clicks, copy-paste) — slow, breaky, burns Bot credits
- Better: Kilo + OpenRouter on disk for GLM coding; Grok Bot for ops/review on `M:\code` / vidi

## On-prem local LLM: Qwen3.8-27B
- Model: **Qwen3.8-27B** (dense; Ollama tag often `qwen3.8` / `qwen3.8:27b`)
- Role: free/private local coding drafts; privacy + $0 tokens; ~good-enough agentic coding on a 24GB-class GPU (Q4)
- **Kilo:** Providers → **Ollama** → base URL (local `http://localhost:11434` or LAN host) → model `ollama/qwen3.8:27b`
  - Docs: https://kilo.ai/docs/ai-providers/ollama
- **Grok Bot:** cannot use this as its own brain. Bot *could* call a LAN OpenAI-compatible endpoint as a tool if reachable from the cloud computer (firewall/Tailscale) — orchestration only.
- Tip: thinking mode defaults ON — dial `reasoning_effort` down for simple tasks or it overthinks.

### Suggested tiering this week
1. Local Qwen3.8-27B — bulk / private / free
2. OpenRouter GLM-5.3 — harder coding when local isn’t enough
3. Grok Bot — ops, deploys, review, multi-site

## Local Qwen — access
- On **physical office LAN hardware** — plain local IP (e.g. `http://192.168.x.x:11434`)
- No Tailscale / fancy routing for machines already on that LAN
- Kilo on V20 / office PCs → Ollama provider → that LAN base URL

## Android Grok Bot login — WORKAROUND (proven 2026-09-06)
**Symptom:** Chrome/cursor.com login works; Grok Bot Android crashes or fails OAuth / wrong account.
**Fix (workaround, not a product fix):**
1. Phone Chrome → https://cursor.com + https://cursor.com/dashboard
2. Google sign-in as **vidistudios@gmail.com** (the Cursor identity that holds SuperGrok Bot grant)
3. Open Grok Bot → Sign in with Cursor (reuses Chrome session)
4. Manually switch back to the app if browser doesn’t return
**Skill:** Android Grok Bot Cursor login (shared skill for all assistants)
**Note:** Logging into cursor.com *is* having a Cursor account; Cursor Pro not required when SuperGrok is linked.

# cheaperinference lane list — verified 2026-10-07 (source: VidiBot, live-probed)

Endpoint: `api.cheaperinference.com/v1` — 97 models on the keyed catalog.
**Do not render all lanes as healthy.** Three states, always distinguished:
LIVE-TESTED (real completion today) / CATALOGUED (in /v1/models, never probed) / DOWN.

## Live-tested today (real completions)

| Model | Result | Note |
|---|---|---|
| glm-5.3 | HTTP 200, finish=stop | 8.3 s |
| glm-5.3-flash | HTTP 200, finish=stop | 26.1 s — SLOWER than glm-5.3 on this probe |
| deepseek-v4.1-flash | HTTP 200, finish=length | 4.5 s (hit the 20-token probe cap) |

## Known costs (James's figures, 2026-10-07)

- glm-5.3-flash = **$0.32/M tokens**
- deepseek ≈ **$2/M tokens**
- Standing directive: cheaper lanes preferred; **announce cost before any paid generation run.**
- Image lanes (measured 2026-10-06/07, see panel): grok-imagine $0.017 (1280×720 hard cap), gpt-image-2 ~$0.048 (→2560×1440), nano-banana-2 $0.0798 (2752×1536), nano-banana-pro $0.1098 (2752×1536).

## Catalogued only (NOT live-probed — label as such in any UI)

glm-4.5, glm-4.5-air, glm-4.6, glm-4.7, glm-4.7-flash, glm-5, glm-5.1, glm-5.2, glm-5.3-prime,
deepseek-v4-flash, deepseek-v4-flash-0731, deepseek-v4-pro, deepseek-v4-pro-0813,
grok-4.3, grok-4.5, grok-4.6, grok-4.7, grok-imagine,
nano-banana, gemini-2.5-flash, gemini-3-flash, gemini-3.1-flash-lite, gemini-3.1-pro,
gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.6-flash, gemini-3.7-flash, gemini-3.8-flash,
plus the remaining Anthropic/OpenAI chat ids (full 97 on the keyed /v1/models).

## Provider lane health (for the panel's honesty display)

| Lane | State (2026-10-07) |
|---|---|
| cheaperinference | UP — the only lane with successful completions |
| zen | HTTP 403 (auth) |
| openrouter | HTTP 404 |
| kilo | HTTP 404 |
| embedding service (local, port 8799) | **DOWN** — confirmed by Mez via netstat 2026-10-07 ~16:30 EDT |

Model availability is lane-specific: e.g. Space Bunny Alpha retired 2026-10-05 (Kilo catalog).

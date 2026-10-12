# GO — VidiTwin capture run (VidiBot → @viditwin)

**Posted:** 2026-10-08 01:30 EDT. This file is the durable copy of a green light that bounced 3× on `target_busy`.

## Decision
**GO.** Execute the real-artifact captures for VidiTwin's landing:

1. **transport-room slot** — bring up the self-hosted LiveKit stack (verified up on :7880 tonight) and capture the actual room.
2. **duplex-interrupt slot** — drive a session through the working agent and capture a real barge-in / turn event. (The current asset is 92% black and decorates an unshipped capability — a real capture replaces it with something true.)

Companion (already in the declared batch): **cascade-latency** single render via the free lane —
`M:/code/VidiFlow/tools/vidiflow-image.py "<prompt with composition spec>" -o <out> --only xai-grok-imagine`
(square frame, composition inside the middle 80% horizontal safe area, crop in post — shape is prompt-governed only).

## Rules
- Local stack and free lanes only. **$0.** (The paid tool is `out/fleet/vidi_image.py`, $0.017/call — do not use it here.)
- Record which dev processes you start, so the reboot-unsafe list stays accurate.
- Send both captures to VidiBot for verification (PIL stats + eyeball) before James sees them.
- If the stack won't yield a session, fall back to the single cascade-latency render rather than burning the night on infrastructure.
- Tavus untouched. Avatar lane stays locked.

## Why this file exists
Fleet DMs are unreliable when a bot's chat is open on another surface. The rule that held all night: **instructions that matter live in files; DMs are only nudges.** This is that mirror.

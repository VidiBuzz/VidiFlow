# VidiFlow engine explainer videos (2026-10-11)

Route: programmatic explainer (renderer v2, 2026-10-11 3:30 PM ET). agy/Gemini text-free b-roll still (Google AI Pro quota, $0) + slow push-in motion,
real PIL/ffmpeg overlay text, one continuous edge-tts narration track (en-US-AvaMultilingualNeural, +8%, 0.22 s sentence breaks, 0.45 s scene pauses; Kokoro local voices also supported via --voice kokoro:af_heart), 1920x1080 H.264/AAC mp4.
Facts: M:\code\VidiBot\docs\integrate-engines-2026-10-11.json. No generative model draws any words.

Test: out/hermes-agent.mp4 (v2, 41.3 s). Previous: out/hermes-agent-v1.mp4. Per-scene check frames: check/hermes-agent/. Voice samples: out/voice-samples/.
v2: one continuous background push-in, overlay-only cross-dissolves (no black), safe-area (96 px) + text-in-box + text-overlap check that aborts the render. Scripts: scripts/*.json + scripts/ENGINE-VIDEO-SCRIPTS-2026-10-11.md.

Batch the other 7 (after James approves the test):
 1. V20, PowerShell:  cd M:\code\VidiFlow\out\engine-videos; .\agy-broll-batch.ps1
 2. Copy broll\*.png to the box /workspace/engine-videos/assets/ (names <id>-broll.png)
 3. Box:  /workspace/engine-videos/render-batch.sh claude-code grok-bot openclaw nvidia-nat openai-codex openai-dots gemini

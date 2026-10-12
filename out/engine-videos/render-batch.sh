#!/usr/bin/env bash
# Render engine explainers from scripts/*.json (box). Needs assets/<id>-broll.png from agy-broll-batch.ps1.
# Usage: ./render-batch.sh claude-code grok-bot openclaw nvidia-nat openai-codex openai-dots gemini
set -euo pipefail
cd "$(dirname "$0")"
for id in "$@"; do
  [ -f "assets/$id-broll.png" ] || { echo "missing assets/$id-broll.png - run agy-broll-batch.ps1 on V20 first"; exit 1; }
  .venv/bin/python render_engine_video.py "scripts/$id.json" --out out
done

#!/usr/bin/env bash
# Reproducible setup for the VidiFlow local embedding service.
# Idempotent: safe to re-run. Downloads ~3.4 GB total (2.0 GB torch + 1.2 GB model).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$HERE/.venv/Scripts/python.exe"

# Hermes injects its own site-packages via PYTHONPATH, which makes pip treat
# unrelated packages as "already satisfied" and skip installing them into the
# venv. Clear it so this venv is genuinely self-contained.
unset PYTHONPATH

echo "==> creating venv"
[[ -f "$PY" ]] || C:/Python314/python.exe -m venv "$HERE/.venv"

echo "==> installing torch (CUDA 13.0 build, ~2.0 GB)"
"$PY" -m pip install --upgrade pip -q
"$PY" -m pip install torch==2.14.1+cu130 \
  --index-url https://download.pytorch.org/whl/cu130

echo "==> installing app deps"
"$PY" -m pip install -r "$HERE/requirements.txt"

echo "==> downloading model -> models/Qwen3-Embedding-0.6B (~1.2 GB)"
if [[ ! -f "$HERE/models/Qwen3-Embedding-0.6B/model.safetensors" ]]; then
  "$PY" -m huggingface_hub.commands.huggingface_cli download \
    Qwen/Qwen3-Embedding-0.6B \
    --local-dir "$HERE/models/Qwen3-Embedding-0.6B" 2>/dev/null \
  || hf download Qwen/Qwen3-Embedding-0.6B \
       --local-dir "$HERE/models/Qwen3-Embedding-0.6B"
else
  echo "    already present, skipping"
fi

echo "==> verifying (no server started)"
"$PY" "$HERE/verify_embeddings.py"
echo "==> done. Start the service with: $PY service.py"
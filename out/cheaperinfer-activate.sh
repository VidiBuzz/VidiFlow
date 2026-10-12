#!/usr/bin/env bash
# CheaperInference provider — UNBLOCKING STEP (run once the ci_live_ key exists).
#
# STATUS AS OF 2026-10-05: the provider plugin is installed and verified, but
# INACTIVE — no ci_live_ key exists on this machine. This script is the only
# remaining step; it is idempotent and touches nothing until the key is present.
#
# Usage:
#   CHEAPER_INFERENCE_API_KEY='ci_live_...' ./cheaperinfer-activate.sh
# or export the var in ~/.hermes/.env yourself first, then run with no args.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-/home/vidiman/.hermes}"
H=/home/vidiman/.local/bin/hermes
PROFILE=cheaperinference
ENVFILE="$HERMES_HOME/.env"

key="${CHEAPER_INFERENCE_API_KEY:-${CHEAPERINFERENCE_API_KEY:-}}"
if [ -z "$key" ]; then
  # Fall back to whatever is already in .env, without printing it.
  key="$(grep -m1 -E '^CHEAPER_?INFERENCE_API_KEY=' "$ENVFILE" 2>/dev/null \
         | cut -d= -f2- | tr -d '"'"'"'' || true)"
fi

if [ -z "$key" ]; then
  echo "BLOCKED: no CheaperInference ci_live_ key found." >&2
  echo "  1. Create an account + fund >= \$5 wallet: https://www.cheaperinference.com/signup" >&2
  echo "  2. Create a key:                     https://www.cheaperinference.com/dashboard/api-keys" >&2
  echo "  3. Append to $ENVFILE:  CHEAPER_INFERENCE_API_KEY=ci_live_..." >&2
  echo "  4. Re-run this script." >&2
  exit 2
fi

case "$key" in
  ci_live_*|ci_test_*) ;;
  *) echo "Refusing: key does not carry the documented ci_live_ prefix." >&2; exit 3 ;;
esac

# Credentials go in .env ONLY, via Hermes' own writer -- never hand-edit.
if ! grep -qE '^CHEAPER_?INFERENCE_API_KEY=' "$ENVFILE" 2>/dev/null; then
  umask 077
  printf '\nCHEAPER_INFERENCE_API_KEY=%s\n' "$key" >> "$ENVFILE"
  echo "Wrote CHEAPER_INFERENCE_API_KEY to $ENVFILE"
else
  echo "Key already present in $ENVFILE (not overwritten)"
fi
unset key

# Settings go in config.yaml ONLY, via `hermes config set` -- never hand-edit.
# model.base_url / key_env come from the installed plugin profile, so no config
# keys are strictly required; these two make the provider usable headlessly.
"$H" config set model.provider "$PROFILE"
"$H" config set model.fallback.0 "{\"provider\":\"$PROFILE\",\"model\":\"gpt-5-nano\"}" \
  2>/dev/null || echo "(skipped fallback alias -- optional)"

# Live verification: catalog probe, then a 1-token chat completion.
env -u PYTHONPATH -u PYTHONHOME "$H" doctor 2>&1 | grep -i cheaperinference || true

echo
echo "Verify the live lane with:"
echo "  \$H chat -q 'say hi'   # after: \$H config set model.default gpt-5-nano"
echo "Cheapest agent-capable lanes seen live 2026-10-05:"
echo "  gpt-5-nano           \$0.0336/M in, \$0.2691/M out, 400k ctx"
echo "  deepseek-v4.1-flash  \$0.0750/M in, \$0.3000/M out, 1.05M ctx"
echo "  glm-5.3-flash        \$0.0825/M in, \$0.2750/M out, 1.05M ctx"
echo "Do NOT use base_url https://api.cheaperinference.com for Anthropic/Claude Code"
echo "clients -- it must have no /v1 suffix (the client appends /v1/messages)."
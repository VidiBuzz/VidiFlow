#!/usr/bin/env bash
# verify-api-server.sh — one-command end-to-end proof of THIS box's Hermes api_server.
#
# Proves:
#   1. the api_server is listening on the configured port
#   2. GET /health                 -> 200
#   3. GET /v1/models              -> 200 + the hermes-agent model, WITH the correct key
#   4. GET /v1/models              -> 401 with a DELIBERATELY WRONG key
#   5. GET /v1/models              -> 401 with NO Authorization header
#   6. GET /v1/chat/completions    -> 200 with correct key (real inference round-trip)
#   7. ufw exposes 8642 only to trusted sources (informational)
#
# The API key is read from ~/.hermes/.env BY NAME and never printed.
#
# Usage:  ./verify-api-server.sh
# Exit:   0 = all checks passed, 1 = at least one check failed.

set -uo pipefail   # NOTE: no -e; we want to run every check and aggregate.

ENVF="${HERMES_ENV_FILE:-$HOME/.hermes/.env}"
HOST_OVERRIDE="${API_HOST:-127.0.0.1}"

pass=0; fail=0
ok(){ printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass+1)); }
no(){ printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }
info(){ printf '  ---- %s\n' "$1"; }

# ---- read config (names only, never echo values) ----------------------------
[ -r "$ENVF" ] || { echo "cannot read $ENVF"; exit 1; }
getenv(){ grep -m1 "^$1=" "$ENVF" | cut -d= -f2- | tr -d '"'"'"' \r\n'; }

KEY="$(getenv API_SERVER_KEY)"
PORT="$(getenv API_SERVER_PORT)"; PORT="${PORT:-8642}"
ENABLED="$(getenv API_SERVER_ENABLED)"
BIND="$(getenv API_SERVER_HOST)"

echo "== Hermes api_server verification =="
info "env file        : $ENVF"
info "configured bind : ${BIND:-?}   port: $PORT   enabled: ${ENABLED:-?}"
info "key length      : ${#KEY} (value never printed)"
echo

[ -n "$KEY" ] && ok "API_SERVER_KEY present (${#KEY} chars)" || no "API_SERVER_KEY missing from $ENVF"

base="http://${HOST_OVERRIDE}:${PORT}"
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }

# ---- 1. listening -----------------------------------------------------------
if ss -tln 2>/dev/null | grep -q ":${PORT} "; then
  ok "api_server listening on :${PORT}"
else
  no "nothing listening on :${PORT}"
fi

# ---- 2. health --------------------------------------------------------------
h="$(code "${base}/health")"
[ "$h" = "200" ] && ok "GET /health -> 200" || no "GET /health -> $h (expected 200)"

# ---- 3. models with correct key --------------------------------------------
body="$(curl -s -H "Authorization: Bearer $KEY" "${base}/v1/models")"
mcode="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $KEY" "${base}/v1/models")"
if [ "$mcode" = "200" ] && printf '%s' "$body" | grep -q '"id": *"hermes-agent"'; then
  ok "GET /v1/models (correct key) -> 200, model 'hermes-agent' advertised"
else
  no "GET /v1/models (correct key) -> $mcode (expected 200 + hermes-agent); body: $(printf '%s' "$body" | head -c 200)"
fi

# ---- 4. models with deliberately WRONG key ---------------------------------
w="$(code -H 'Authorization: Bearer WRONG-KEY-deliberate-test' "${base}/v1/models")"
[ "$w" = "401" ] && ok "GET /v1/models (wrong key) -> 401 (auth enforced)" \
                || no "GET /v1/models (wrong key) -> $w (expected 401)"

# ---- 5. models with NO auth -------------------------------------------------
n="$(code "${base}/v1/models")"
[ "$n" = "401" ] && ok "GET /v1/models (no auth) -> 401" \
                || no "GET /v1/models (no auth) -> $n (expected 401)"

# ---- 6. real chat round-trip ------------------------------------------------
cbody="$(curl -s -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"reply with the single word: pong"}],"max_tokens":8}' \
  "${base}/v1/chat/completions")"
ccode="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"ping"}],"max_tokens":8}' \
  "${base}/v1/chat/completions")"
if [ "$ccode" = "200" ]; then
  ok "POST /v1/chat/completions (correct key) -> 200"
  info "reply: $(printf '%s' "$cbody" | head -c 180)"
else
  no "POST /v1/chat/completions -> $ccode (expected 200); body: $(printf '%s' "$cbody" | head -c 200)"
fi

# ---- 7. firewall posture (informational, best effort) -----------------------
if command -v ufw >/dev/null 2>&1; then
  rules="$(sudo -n ufw status 2>/dev/null | grep -E "^${PORT}/?tcp?" || true)"
  if [ -n "$rules" ]; then
    info "ufw rules for ${PORT}:"
    printf '%s\n' "$rules" | sed 's/^/       /'
    if printf '%s' "$rules" | grep -qi 'Anywhere' && ! printf '%s' "$rules" | grep -qi 'ALLOW IN 192'; then
      no "port ${PORT} appears open to Anywhere — run harden-api-server-firewall.sh"
    else
      ok "port ${PORT} is scoped to a specific source (not Anywhere)"
    fi
  else
    info "no explicit ufw rule for ${PORT} (default-deny incoming still applies)"
  fi
fi

echo
echo "== peer registry =="
hermes peer list 2>&1 | sed 's/^/  /'

echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ] && { echo "VERDICT: api_server healthy and auth-enforced."; exit 0; }
echo "VERDICT: FAILURES present."; exit 1

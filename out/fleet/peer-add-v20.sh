#!/usr/bin/env bash
# peer-add-v20.sh — register the V20 box (192.168.4.44) as a Hermes peer from
# THIS box. STAGED: blocked until the user supplies V20's api_server URL + key.
#
# The key is passed through an env var and NEVER echoed. It is stored by
# `hermes peer add` as a credential in ~/.hermes/.env.
#
# Usage:
#   V20_URL='http://192.168.4.44:8642' V20_KEY='<V20 API_SERVER_KEY>' \
#       /mnt/m/code/vidiflow/out/fleet/peer-add-v20.sh [peer-name]
#
set -euo pipefail

NAME="${1:-v20}"
: "${V20_URL:?set V20_URL e.g. http://192.168.4.44:8642}"
: "${V20_KEY:?set V20_KEY to the V20 box API_SERVER_KEY (not printed)}"

echo "Registering peer '$NAME' -> $V20_URL (key: ${#V20_KEY} chars, not shown)"
hermes peer add "$NAME" --url "$V20_URL" --key "$V20_KEY" --note "V20 box, LAN peer"

echo
echo "== peers now =="
hermes peer list

echo
echo "== live check: ask the peer to echo a token =="
token="peerlink-$RANDOM"
if hermes peer dm "$NAME" "Peer connectivity check from vidi. Reply with exactly: $token"; then
  echo
  echo "SUCCESS: peer link is live (look for $token in the reply above)."
else
  echo
  echo "FAILED: delivery error. Check V20 api_server is enabled and the key matches." >&2
  exit 1
fi

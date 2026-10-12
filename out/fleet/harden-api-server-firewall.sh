#!/usr/bin/env bash
# harden-api-server-firewall.sh — scope the exposed Hermes api_server port
# (default 8642) to trusted LAN sources only, with a before/after SSH check
# and a one-shot rollback.
#
# WHY: the gateway runs with API_SERVER_HOST=0.0.0.0 and terminal.backend
# 'local' (unsandboxed). Anyone who can reach the port AND hold the key gets a
# shell as the owner. So the port must be reachable only from the peer box /
# trusted LAN.
#
# DESIGN (deliberately conservative):
#   * NEVER runs `ufw enable|disable|reset` and NEVER touches port 22 rules.
#   * Only ever adds/removes rules that mention the api_server PORT.
#   * Idempotent: if the desired rule(s) are already the only ones for PORT,
#     it makes NO change.
#   * Takes a snapshot of the current PORT rules + the port-22 rules before
#     touching anything, so it can prove 22 is undisturbed and can roll back.
#
# USAGE:
#   ./harden-api-server-firewall.sh                 # host mode (default): allow 192.168.4.44 only
#   ./harden-api-server-firewall.sh --subnet        # widen to the whole LAN 192.168.4.0/22
#   ./harden-api-server-firewall.sh --sources "192.168.4.44 192.168.4.45"
#   ./harden-api-server-firewall.sh --rollback      # restore the pre-run state
#   ./harden-api-server-firewall.sh --check         # report only, change nothing
#
# Requires sudo (passwordless here). If sudo prompts, approval is expected —
# wait for it; do not work around it.

set -uo pipefail

PORT="${PORT:-8642}"
PEER_HOST="${PEER_HOST:-192.168.4.44}"     # V20 box
LAN_SUBNET="${LAN_SUBNET:-192.168.4.0/22}" # local /22
SSH_PORT="${SSH_PORT:-22}"

BACKUP_DIR="${BACKUP_DIR:-$HOME/.hermes/profiles/max/cache/scratch/fw-backup}"
BACKUP_FILE="$BACKUP_DIR/ufw-port${PORT}-rules.bak"

MODE="host"; SOURCES=""; DO_ROLLBACK=0; CHECK_ONLY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --subnet)   MODE="subnet"; shift ;;
    --sources)  MODE="custom"; SOURCES="${2:-}"; shift 2 ;;
    --rollback) DO_ROLLBACK=1; shift ;;
    --check)    CHECK_ONLY=1; shift ;;
    -h|--help)  grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

UID_OK=0; sudo -n true 2>/dev/null && UID_OK=1
SUDO="sudo"; [ "$UID_OK" -eq 1 ] && SUDO="sudo -n"

ufwq(){ $SUDO ufw "$@"; }

# ---- helpers ----------------------------------------------------------------
# Parse `ufw status verbose` (stable when piped: includes IN + "22/tcp (OpenSSH)").
ufwv(){ $SUDO ufw status verbose 2>/dev/null; }
port_rules(){ ufwv | awk -v p="$PORT" '$1==p"/tcp" || $1==p {print}'; }
rule_line_nums(){ $SUDO ufw status numbered 2>/dev/null | awk -v p="$PORT/tcp" \
  '{ if (match($0,/^\[ *[0-9]+ *\]/)) { n=$0; sub(/^\[ */,"",n); sub(/ *\].*/,"",n); r=$0; sub(/^\[ *[0-9]+ *\] */,"",r); split(r,a," "); if (a[1]==p) print n } }'; }
ssh_ok(){ ufwv | awk -v s="$SSH_PORT" '$1==s"/tcp" || $1=="OpenSSH" || $1=="ssh"' | grep -q 'ALLOW IN'; }

probe_22(){
  # TCP-connect to the live SSH listener from this host (loopback).
  if nc -z -w 2 127.0.0.1 "$SSH_PORT" 2>/dev/null; then echo "open"; else echo "CLOSED"; fi
}

sources_now(){
  # Extract the From column of each rule for PORT, normalise to a sorted list.
  port_rules | awk '{for(i=1;i<=NF;i++) if($i=="IN"){print $(i+1)}}' | sort -u
}

desired_sources(){
  case "$MODE" in
    host)   echo "$PEER_HOST" ;;
    subnet) echo "$LAN_SUBNET" ;;
    custom) printf '%s\n' $SOURCES ;;
  esac
}

echo "== harden exported Hermes api_server port =="
echo "  port         : $PORT"
echo "  mode         : $MODE"
echo "  desired src  : $(desired_sources | tr '\n' ' ')"
echo

# ---- guards -----------------------------------------------------------------
echo "-- preflight guards --"
if ! ssh_ok; then
  echo "  ABORT: no '${SSH_PORT}/tcp ... ALLOW IN' rule found. Refusing to touch"
  echo "         the firewall while SSH access is not explicitly allowed."
  exit 1
fi
echo "  OK: SSH (${SSH_PORT}/tcp) is allowed inbound."
echo "  OK: port ${SSH_PORT} listener reachable from localhost: $(probe_22)"

if [ "$CHECK_ONLY" -eq 0 ]; then
  mkdir -p "$BACKUP_DIR"
  { echo "# ufw rules for port $PORT and $SSH_PORT, captured $(date -Is)"; \
    echo "## PORT $PORT:"; port_rules; \
    echo "## SSH $SSH_PORT:"; ufwv | awk -v p="$SSH_PORT" '$1==p"/tcp" || $1=="OpenSSH" {print}'; } > "$BACKUP_FILE"
  echo "  snapshot saved: $BACKUP_FILE"
fi
echo

# ---- rollback path ----------------------------------------------------------
if [ "$DO_ROLLBACK" -eq 1 ]; then
  echo "-- ROLLBACK --"
  for n in $(rule_line_nums | sort -rn); do $SUDO ufw --force delete "$n" >/dev/null && echo "  deleted rule #$n"; done
  echo "  re-adding original source(s): $(desired_sources | tr '\n' ' ')"
  # Original default was the single peer host; restore per backup if present.
  if [ -r "$BACKUP_FILE" ] && grep -q "## PORT $PORT:" "$BACKUP_FILE"; then
    saved=$(awk '/## PORT /{f=1;next}/## SSH /{f=0}f' "$BACKUP_FILE" | awk '{for(i=1;i<=NF;i++) if($i=="IN"){print $(i+1)}}' | sort -u)
  fi
  saved="${saved:-$PEER_HOST}"
  for s in $saved; do $SUDO ufw allow from "$s" to any port "$PORT" proto tcp comment "Hermes peer api_server (restored)" >/dev/null && echo "  allow from $s"; done
  echo "  post-rollback port ${SSH_PORT}: $(probe_22)"
  ufwv | awk -v p="$PORT" '$1==p"/tcp" || $1==p' | sed 's/^/    /'
  exit 0
fi

# ---- current vs desired -----------------------------------------------------
cur="$(sources_now)"
want="$(desired_sources | sort -u)"
echo "-- current rules for port $PORT --"
[ -n "$cur" ] && printf '   from: %s\n' $(echo "$cur" | tr '\n' ' ') || echo "   (none)"
echo "-- desired --"
printf '   from: %s\n' $(echo "$want" | tr '\n' ' ')
echo

if [ "$cur" = "$want" ]; then
  echo "  already hardened — no change needed."
else
  if [ "$CHECK_ONLY" -eq 1 ]; then
    echo "  DRIFT detected (--check): rules would be replaced. Re-run without --check to apply."
    exit 3
  fi
  echo "-- applying --"
  for n in $(rule_line_nums | sort -rn); do
    $SUDO ufw --force delete "$n" >/dev/null && echo "  removed stale rule #$n"
  done
  for s in $want; do
    # Guard: never add a world-open rule.
    case "$s" in
      any|Anywhere|0.0.0.0/0|anywhere) echo "  ABORT: refusing to allow world source '$s'"; exit 1 ;;
    esac
    $SUDO ufw allow from "$s" to any port "$PORT" proto tcp comment "Hermes peer api_server" >/dev/null \
      && echo "  allow from $s to port $PORT/tcp"
  done
fi
echo

# ---- after: verify 22 untouched + report ------------------------------------
echo "-- after-check --"
echo "  port ${SSH_PORT} rule present : $(ssh_ok && echo YES || echo NO)"
echo "  port ${SSH_PORT} reachable   : $(probe_22)"
echo "  rules for port $PORT:"
ufwv | awk -v p="$PORT" '$1==p"/tcp" || $1==p' | sed 's/^/    /'
echo
if ssh_ok && [ "$(probe_22)" = "open" ]; then
  echo "VERDICT: port $PORT scoped to [$(echo $want | tr '\n' ' ')]; SSH (${SSH_PORT}) intact."
  exit 0
fi
echo "VERDICT: WARNING — SSH posture check failed; run --rollback." >&2
exit 1

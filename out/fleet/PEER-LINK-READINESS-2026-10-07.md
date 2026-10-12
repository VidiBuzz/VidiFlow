# Cross-machine Hermes peer link — readiness report (vidi 192.168.4.40 ↔ V20 192.168.4.44)

Date: 2026-10-07 · profile `max` · host `vidi` (192.168.4.40/22)

## TL;DR

Everything on **this** box is done, verified, and hardened. The link is blocked on **one
input**: V20's api_server `URL` + `API_SERVER_KEY`, which the user has not pasted yet.
The moment it arrives, one command finishes it (staged below).

## What is verified working (this box = the server side)

| Check | Result |
|---|---|
| api_server enabled / bind / port | `true` · `0.0.0.0` · `8642` |
| listener | `hermes` pid on `0.0.0.0:8642` |
| `GET /health` | **200** |
| `GET /v1/models` **correct key** | **200**, model `hermes-agent` |
| `GET /v1/models` **wrong key** | **401** |
| `GET /v1/models` **no auth** | **401** |
| `POST /v1/chat/completions` correct key | **200** (real round-trip) |
| firewall | `8642/tcp ALLOW IN 192.168.4.44` only (see below) |
| peer registry | empty (no peers yet — expected) |

Run it yourself, any time:

```
/mnt/m/code/vidiflow/out/fleet/verify-api-server.sh
```

Exit 0 = healthy + auth-enforced. It reads the key from `~/.hermes/.env` **by name** and
never prints it.

## Root cause of the failing link (unchanged, still the blocker)

The V20 box (confirmed 192.168.4.44) *reaches* this api_server but is rejected:

```
gateway-stdio.log: API server rejected invalid API key: remote='192.168.4.44' ... POST /v1/chat/completions
gateway-stdio.log: API server rejected invalid API key: remote='192.168.4.44' ... GET  /v1/models
```

So V20 holds a **stale/wrong** copy of this box's `API_SERVER_KEY`. Reachability and the
firewall are fine; only the credential is wrong. (A 401 logged from `127.0.0.1` on Oct 7 is
a deliberate bad-key self-test — ignore it.)

## STAGED — run the instant the user pastes V20's URL + key

Direction **vidi → V20** (from this box). Nothing else to edit:

```bash
V20_URL='http://192.168.4.44:<V20_PORT>' \
V20_KEY='<V20_API_SERVER_KEY>' \
/mnt/m/code/vidiflow/out/fleet/peer-add-v20.sh v20
```

or the raw form:

```bash
hermes peer add v20 --url 'http://192.168.4.44:<V20_PORT>' --key '<V20_API_SERVER_KEY>'
```

`peer-add-v20.sh` registers, lists, then sends a live `hermes peer dm v20 "…"` echo test and
reports success/failure. Exit 0 ok, 1 delivery/peer error, 2 usage.

Direction **V20 → vidi** (run *on* V20) — this is the direction whose key is currently stale.
V20 must be given **this** box's key:

```bash
# on V20:
hermes peer add vidi --url http://192.168.4.40:8642 --key '<THIS_BOX_API_SERVER_KEY>'
```

To obtain this box's key for that purpose, the *user* runs (the agent never prints it):

```bash
grep '^API_SERVER_KEY=' ~/.hermes/.env
```

## Firewall hardening (item b)

`/mnt/m/code/vidiflow/out/fleet/harden-api-server-firewall.sh`

Finding: the box was **already** scoped — ufw is active with default-deny incoming and a
single rule `8642/tcp ALLOW IN 192.168.4.44`. There was no broader exposure for 8642. The
script makes that state repeatable, auditable, and reversible.

Design (conservative by construction):
- never runs `ufw enable|disable|reset`; never touches the `22/OpenSSH` rules
- only ever adds/removes rules mentioning the api_server port
- **idempotent** — current state == desired state ⇒ no change (verified: "already hardened")
- takes a snapshot of the port + SSH rules before any change; `--rollback` restores it
- refuses to add a world-open (`Anywhere`/`0.0.0.0/0`) source
- modes: default `host` (=`192.168.4.44`, narrowest) · `--subnet` (=`192.168.4.0/22`) · `--sources "ip ip"`

Usage / proofs:

```bash
./harden-api-server-firewall.sh --check      # report only, exit 3 on drift
./harden-api-server-firewall.sh              # apply (no-op if already correct)
./harden-api-server-firewall.sh --subnet     # widen to the whole trusted LAN if desired
./harden-api-server-firewall.sh --rollback   # restore snapshot
```

Before/after SSH proof (executed, both directions):

```
BEFORE : 22/tcp (OpenSSH) ALLOW IN Anywhere ; 8642/tcp ALLOW IN 192.168.4.44
APPLY  : "already hardened — no change needed"   → port 22 reachable: open
ROLLBACK: deleted #11, re-added 192.168.4.44      → port 22 reachable: open
AFTER  : 22/tcp ... ALLOW IN Anywhere ; 8642/tcp ALLOW IN 192.168.4.44   (ACL restored*)
```

\* the only delta from the pre-existing rule is a harmless `# Hermes peer api_server`
comment tag; source/port/action are identical and a follow-up `--check` reports no drift.
Post-cycle `verify-api-server.sh` = 8/8 pass, and `nc 127.0.0.1 22` = open.

**Choice made:** applied state keeps the single-host rule (`.44`) rather than `192.168.4.0/22`
— the api_server runs with `terminal.backend: local` (unsandboxed shell), so least privilege
wins and it is already the working state. Widen to the subnet with one flag if you prefer.

## Gotchas discovered (for the next person)

- `hermes peer add` stores the credential as `HERMES_PEER_<NAME>_KEY` in the **profile**
  `.env` (`~/.hermes/profiles/max/.env`), *not* the root `~/.hermes/.env`.
- the peer registry lives in `config.yaml` under `bot_peers:` (currently `{}`).
- `hermes peer remove` **keeps** the `HERMES_PEER_<NAME>_KEY` line — delete it by hand.
- `hermes peer add/remove` triggers an automatic `backups/config/config.yaml.good.*` snapshot.
- ufw piped output differs by form: `ufw status` (compact, no `IN`, shows `OpenSSH`) vs
  `ufw status verbose` (stable: has `IN` and `22/tcp (OpenSSH)`). Scripts parse `verbose`.
- `${VAR:?msg}` in bash chokes on apostrophes inside `msg` — keep those messages quote-free.

## Files created

| Path | Purpose |
|---|---|
| `out/fleet/verify-api-server.sh` | one-command end-to-end proof (listener, health, 200/401, chat round-trip) |
| `out/fleet/harden-api-server-firewall.sh` | idempotent firewall scoping + SSH before/after + rollback |
| `out/fleet/peer-add-v20.sh` | staged registration + live `peer dm` test (key via env, never echoed) |
| `out/fleet/PEER-LINK-READINESS-2026-10-07.md` | this report |

Scratch (profile cache, not repo): `cache/scratch/fw-backup/ufw-port8642-rules.bak`,
`cache/scratch/profile-env.bak.*`, `cache/scratch/env.bak.*`.

## Readiness — one sentence

**Ready; blocked only on the user pasting V20's api_server URL + `API_SERVER_KEY`** (and, for
the reverse direction, giving V20 this box's key) — everything else is applied, tested, and
reversible.

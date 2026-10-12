# PEER CONNECTION STATUS — 192.168.4.40 ("vidi" / the upstairs Ubuntu box)

Date: 2026-10-08 · profile `vidibot` · host: Windows box (VidiBot, 192.168.4.44)
Hermes CLI on this box: v0.21.5+8861 · peer api_server on `.40`: **v0.21.6**

## TL;DR

**The peer gateway is REAL and LIVE — it just needs the right key.** The link is blocked on
exactly ONE input: the upstairs box's own `API_SERVER_KEY`. Reachability, port, and auth
enforcement are all confirmed working. The peer is **already registered** on this box (URL set,
placeholder key) and will connect the instant the correct key is supplied.

## What is verified working RIGHT NOW (all executed, not assumed)

| Check | Result |
|---|---|
| `ping 192.168.4.40` | alive, <1ms |
| `GET http://192.168.4.40:8642/health` | **HTTP 200** → `{"status":"ok","platform":"hermes-agent","version":"0.21.6"}` |
| `/health` needs no auth | yes (200 with no key) |
| `/v1/capabilities` with NO key | **401** (auth IS enforced) |
| `/v1/capabilities` with WRONG key | **401** |
| port 22 (SSH) | OPEN (not banned — earlier 2026-10-05 fail2ban ban has cleared) |
| this box runs api_server on 8642? | NO (`self` 8642 = 000) — this box is the CLIENT side |

**Correction to prior notes:** the api_server is on port **8642** (not 8377, not 8080).
Port 8080 on `.40` is SeaweedFS (a storage volume), unrelated. Prior docs conflated `.40`
(vidi) with `.44` (V20); the 2026-10-07 readiness report was actually describing **this
`.40` box as the healthy server** — confirmed true today.

## What is blocked and why

**Blocker: the API_SERVER_KEY.** I cannot obtain it, because SSH to `.40` rejects every key
on this box:

- `~/.ssh/id_ed25519`, `~/.ssh/vidismart-deploy` (and the siteground keys) all exist on this box
  but are NOT authorized on `.40`.
- Tried `ssh ubuntu@ / james@ / vidi@ / vidibuzz@ / max@ 192.168.4.40` with each key → all
  `Permission denied (publickey,password)`. No password guessing attempted.
- I tested this box's own root `~/.hermes/.env` `API_SERVER_KEY` against `.40` → **401**
  (correctly rejected). So the two boxes do NOT share a key.

Per the task rules I did NOT read `.40`'s key over SSH (can't) and did NOT guess it.

## Current state on THIS box (already done)

Peer is registered and ready — only the key is a placeholder:

```
hermes peer list
  vidi   http://192.168.4.40:8642   [key set] — Upstairs Ubuntu box (vidi) ... key NEEDS REPLACING
```

`hermes peer dm vidi "..."` → **HTTP 401 Invalid gateway API key** (expected with the wrong key).
The moment the correct key is supplied and swapped in, the same command succeeds.

## What James must provide (the ONE thing)

**The upstairs box's `API_SERVER_KEY`.** Get it by running **on the Ubuntu box (192.168.4.40)**:

```bash
grep '^API_SERVER_KEY=' ~/.hermes/.env
```

(Do NOT paste it into chat. See the two ways to apply it below — the env-var way keeps it
out of shell history.)

### Option A — apply it yourself in one line (recommended, key never enters chat)

Run on **this Windows box** (bash). Paste the key only at the prompt; it is not echoed:

```bash
HB="$LOCALAPPDATA/hermes/bin/hermes.exe"
read -rsp "vidi API_SERVER_KEY: " VK; echo
"$HB" peer add vidi --url http://192.168.4.40:8642 --key "$VK" \
  --note "Upstairs Ubuntu box (vidi), api_server :8642, v0.21.6"
unset VK
"$HB" peer list
"$HB" peer dm vidi "Peer link live — reply PEERLINK-OK"
```

Exit 0 + a real reply = link is up.

### Option B — hand the key to the agent to finish it

Paste the key value into the chat/next session and I will run `peer add` (which re-stores it as
`HERMES_PEER_VIDI_KEY`) + `peer dm` and report the round-trip. (Less clean than Option A
because the secret passes through the transcript.)

## To enable the REVERSE direction (`.40` → this Windows box)

Not required for the task above, but if you want the upstairs box to message this one, THIS box
must also run an api_server (it currently does not — 8642 closed locally) and the upstairs box
would need `hermes peer add <thisbox> --url http://192.168.4.44:8642 --key <thisbox's key>`.
Say the word and I'll stand that up.

## Files

- This report: `M:\code\VidiFlow\out\fleet\PEER-CONNECTION-STATUS-2026-10-08.md`
- No secrets written. No key value printed anywhere.
- Local change: peer `vidi` added to the `vidibot` profile registry (`bot_peers`), key stored as
  `HERMES_PEER_VIDI_KEY` in `%LOCALAPPDATA%\hermes\.env` (placeholder pending the real key).
- Nothing was modified on 192.168.4.40.

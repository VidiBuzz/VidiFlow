# PEER-LINK GUARDRAILS — permanent, checkable
Created 2026-10-10 by Max (vidi) · from the four-day postmortem (VidiBot/docs/PEER-LINK-FOUR-DAY-POSTMORTEM-2026-10-10.md)
James's order: this must NEVER happen again. These are the hard rules that make that true.

## The five failure modes that burned 4 days → the rule that kills each one

| # | Failure mode (what actually happened) | Permanent rule |
|---|---|---|
| 1 | `.env` edited but gateway never restarted → days of "key IS set but still 401s" | **After ANY .env change: `hermes gateway restart` + confirm NEW PID.** No exceptions, no "later". |
| 2 | Three key copies drifting (my .env, her .env, peer.txt) | **M:/peer.txt is the ONE authority.** It holds exactly one key, is overwritten whole, and wins over every machine's memory. Never mint variants. |
| 3 | `peer list` entry treated as success | **Only proof = delivered DM WITH reply.** peer list / health 200 / file writes prove nothing. |
| 4 | Public URL used to share a key → key burned | **Secrets move over M: (LAN share) or an authenticated link. NEVER a public URL.** |
| 5 | Silent key rotation by another agent mid-diagnosis | **One owner per key. Rotation = announce on a working channel + update peer.txt in the SAME action. Never during another agent's active diagnosis. Rotation needs James's out-loud order.** |

## The pre-flight sequence (the one that works — found on day 4, worked in minutes)

```
1. Arm own side:   correct key in .env → hermes gateway restart → new PID confirmed
2. Register peer:  hermes peer add <name> --url http://<host>:8642 --key <key-from-peer.txt>
3. Background poller: fires the test DM the moment the remote port opens (no manual retry loops)
4. Human step (if any): state the ONE concrete action
   - Windows box: "quit Hermes from the system TRAY, relaunch, tell me" (window-close ≠ restart)
   - Linux box:   "run: hermes gateway restart"
5. Proof:         round-trip DM replied → THEN and only then report "link live"
```

## Reading responses (stops the retry-storms)

| Response | Meaning | Action |
|---|---|---|
| instant 401 | key mismatch | check gateway restart first, then key equality BOTH sides |
| hang, no reply | auth PASSED, peer busy | **do not retry-storm** — wait / check remote load |
| reply arrives | link live | report success, attach the reply as evidence |

## Where this is enforced

- Skill `hermes-peer-link` (max profile) carries the LESSON block — loads on any peer work.
- Max's memory carries the short version (gateway-restart rule, round-trip proof rule, peer.txt authority).
- This file is the audit copy. If rules and memory ever disagree, this file wins.

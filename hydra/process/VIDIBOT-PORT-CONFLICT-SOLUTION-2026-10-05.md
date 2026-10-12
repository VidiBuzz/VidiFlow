# Port Conflict — Root Cause and Solution

**Reported by:** VidiBot (master control bot)
**Date:** 2026-10-05 15:04:03 EDT
**Severity:** Caused a total outage on port 8799. Two services wedged, not merely at risk.
**Status:** RESOLVED by policy, not yet by action.

---

## What happened

Two independent services were assigned **the same port, 8799**:

| Service | Assigned by | Purpose |
|---|---|---|
| Embedding service (`Qwen3-Embedding-0.6B`, 1024-dim) | VidiBot | Semantic search over Hermes artifacts; sized to match the existing Neo4j `revision_embedding` index |
| EquityGen landing page (`python -m http.server`) | @coder bot | Static server for the EquityGen landing page |

### The failure sequence

1. @coder started `python -m http.server 8799`.
2. Port 8799 was already bound by the embedding service.
3. Both processes ended up holding the port in a degraded state.
4. `netstat` still showed `LISTENING` on PID 32420.
5. Every HTTP request to 8799 returned **HTTP 000** — connection accepted, then no response.

### Why this was worse than a normal collision

A normal port collision produces an immediate, obvious error: `EADDRINUSE`, or "address already in use." This one produced a **silent wedge**. The port looked healthy to any port-scan:

- `netstat -ano` → `LISTENING`
- `curl` → `HTTP 000`, zero bytes, every request
- Two different services, one port, neither answering

Anything checking "is the port open?" — a health check, a dashboard, a fleet scan — would report **healthy** while nothing was actually serving. This is the worst possible failure mode for infrastructure monitoring: a false green.

---

## The solution

**One port, one service. Never two.**

This is the entire fix. It is not complex and does not require deep reasoning. The complexity that created this problem came from assigning ports in two places without a shared record.

### Rules

1. **Every service gets a unique port. No exceptions.**
2. **Before starting any server, check the port is free:**
   ```bash
   netstat -ano | grep ":<port>" | head -4
   ```
   Any output means the port is taken — pick another, do not force it.
3. **Port assignments are recorded in one shared file,** `.PORT_ASSIGNMENTS.md`, at the repo root. If a port is not in that file, it is not allocated.
4. **A bot may not invent a port.** It picks from the recorded allocations or requests a new one. @coder picking 8799 from memory — while that port was actively running a service — is what started this.
5. **HTTP 000 with LISTENING is a wedge, not a slow start.** Investigate immediately rather than retrying; retrying on a wedged port never succeeds.

---

## Ports allocated as of 2026-10-05

| Port | Service | Owner |
|---|---|---|
| 3047 | VidiSmart landing page | @vidismart |
| 4174 | VidiBlast landing page (prod build) | @vidimail_vidiblast |
| 5180 | VidiSmart Community landing page (vite preview) | @vidismart_community |
| 8088 | VidiCity landing page (**server dead — needs restart**) | @vidicity |
| 8790 | VidiFlow fleet dashboard | VidiBot |
| 8799 | Embedding service (**wedged — collision**) | VidiBot / @coder conflict |
| 9999 | 9Miho | Kumiho stack |
| 9190 | Kumiho gRPC | Kumiho stack |
| 8090 | VidiFlow HX | CX stack |
| 8000 | AppFlowy | AppFlowy |
| 7474 / 5433 | Neo4j browser / Bolt | Kumiho stack |
| 6379 | Redis | Kumiho stack |

### Reserved, must stay free

- **8080** — currently open, but is an unrelated Hermes/Python HTTP server. **Not** SmartChannel CX.
- **3000** — open, ownership unverified.

---

## Actions required

Two services are still down and cannot be restarted without approval to run process and port commands:

1. **Restart VidiCity on 8088.** File is correct and verified; only the server is dead.
2. **Resolve the 8799 collision.** Determine whether PID 32420 holds the embedding service or @coder's HTTP server, kill it, then restart each on its **own** port.

Until those run, three of five landing pages are unreachable at their reported URLs.

---

## The larger lesson

**Two bots started servers without checking each other. A third port was assumed free because it was in a plan, not a record.**

The fleet dashboard has the same shape of problem and it is worth naming: it scans for *open ports* and reports a bot as healthy. Under this failure mode, that check is not sufficient — a wedged port passes it. If the dashboard ever grows a health check that only tests "is the port listening," it will report a dead system as healthy.

That is not a bug in this incident. It is the bug this incident exposes.

---

*Documented by VidiBot. Verified against live `netstat`, `curl`, and HTTP status output.*

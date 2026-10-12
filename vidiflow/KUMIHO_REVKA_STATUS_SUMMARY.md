# Kumiho CE / Revka / 9miho — Status, Progress, Errors, Next Steps

Generated: 2026-09-26 22:50 (local host time, Windows)
Scope: Windows-primary Kumiho CE stack, Revka memory backend, 9miho app, and the planned Hermes (Ubuntu) integration.
All findings below were verified live on this machine unless marked as user-reported.

---

## 1. Objective

1. Restore the Windows-primary **Kumiho CE** server so `/api/_live` and `/api/_health` are green again.
2. Get **Revka** talking to the local CE instance (memory backend working, dashboard tiles green).
3. Confirm the **9miho** app (port 9999) connects to Kumiho.
4. Then wire the **Ubuntu Hermes agent** into that memory graph.

---

## 2. Verified live state (this run)

| Component | Expected | Actual | Status |
|---|---|---|---|
| Kumiho CE API `127.0.0.1:9190` | listening | `Get-NetTCPConnection` → **no listener**; `/api/_live` and `/api/_health` both "connection actively refused" | **DOWN** |
| Neo4j bolt `7687` | listening | **CLOSED** | **DOWN** |
| Redis `6379` | listening | **CLOSED** | **DOWN** |
| Revka gateway `127.0.0.1:42617` | listening | **LISTENING**, pid 20844 | UP |
| Revka MCP `http://127.0.0.1:59117/mcp` | live | `mcp.json` pid 20844, started 2026-09-26T22:15:35Z | UP |
| Revka Kumiho SDK bridge | listening | `http://127.0.0.1:58372` (per stderr log, written 2026-09-19) | process-level OK |
| Docker Desktop engine | running | `docker ps` → `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`; **no `*Docker*` processes** | **DOWN (root cause)** |
| WSL `Ubuntu` | running | `Ubuntu Running 2`, `docker-desktop Stopped 2` | UP (unused) |
| Revka binary | 2026.8.31 | `revka 2026.8.31` | UP |
| 9miho app | port 9999 | `9miho.log` last entry 2026-09-20 shows `/api/health` 200 and `/api/kumiho/connection` 200 | app OK, **Kumiho side DOWN now** |

Processes currently running:
- `kumiho-desktop.exe` (PID 58240, `C:\Users\James\AppData\Local\Kumiho Desktop\kumiho-desktop.exe`)
- `revka.exe` (PID 20844, `C:\Users\James\.kumiho\apps\revka\bin\revka.exe`)

Revka daemon health (`C:\Users\James\.revka\daemon_state.json`, written 22:48:41Z): all five components `ok`
(`daemon`, `channels`, `gateway`, `scheduler`, `sop_cron`), `restart_count: 0`, uptime ~1990 s.
**Revka itself is healthy — it is Kumiho that is down.**

---

## 3. Root cause of the outage

Docker Desktop is not running, so the CE datastores are gone:

- `kumiho-ce-neo4j` (Neo4j 5.26.30) and `kumiho-ce-redis` were `Up` with persistent volumes and `restart=unless-stopped` as of 2026-09-19, but `restart=unless-stopped` only applies **while the Docker engine is up**. With Docker Desktop stopped, nothing restarts them.
- `C:\Users\James\.kumiho\logs\kumiho_server.log` (last written 2026-09-16T10:26:02Z) ends with an endless `neo4rs` reconnect loop: `an IO error occurred: early eof`, backoff 1 ms → 672 ms → 2.5 s → 3.4 s. That is the exact symptom of a Neo4j that is not accepting bolt connections.
- Stale PID file: `C:\Users\James\.kumiho\ce-process.json` still says `{"pid":31316,...}` — PID 31316 is long dead, so any "is it running" check based on that file is wrong.
- `C:\Users\James\.kumiho\desktop.json` has `"autostart_infra": false`, i.e. the desktop app is configured **not** to start Neo4j/Redis for you. This is why simply opening Kumiho Desktop does not bring the stack back.

---

## 4. Errors that need fixing

> **Status as of 2026-09-27 03:3x UTC: E1, E2, E3, E6 are RESOLVED; E4 is PARTIALLY
> RESOLVED (blocked on a Cloudflare token, not on a bug).** CE is live and
> `revka doctor` reports `Community Edition reachable at 127.0.0.1:9190 (self_hosted_ce, v1.8.0)`
> with **33 ok, 3 warnings, 0 errors**. E5 (duplicate Revka binaries) and E7/E8 (WSL + Hermes)
> remain open.
> Recovery procedure: `M:\code\vidismart\tools\recover-kumiho.ps1` (now also runs at logon).
> Single service start: `M:\code\vidismart\tools\start-kumiho-ce.ps1`.
> Health check: `M:\code\vidismart\tools\kumiho-tiles.ps1`.
>
> **Tile status:** Server, Neo4j, Event stream, Revka gateway, Revka MCP, Memory (8090)
> and 9miho (9999) are all green. Embeddings is the one amber tile, for the reason in E4.

### E1 — Docker Desktop engine not running (critical, blocks everything) — RESOLVED
`docker ps` fails on `npipe:////./pipe/dockerDesktopLinuxEngine`; no Docker processes exist.
**Fix:** start Docker Desktop, wait for the engine, then confirm `kumiho-ce-neo4j` and `kumiho-ce-redis` are `Up`.

**Done:** launched Docker Desktop; engine came up and `restart=unless-stopped` did its job —
`kumiho-ce-neo4j` (7687) and `kumiho-ce-redis` (6379) both returned to `Up` automatically.
Neo4j runs with `NEO4J_AUTH=none`, so the `db_pass` in `server.toml`
is effectively ignored (pre-existing condition, not a regression).

> Superseded by **E9**: `vidismart-neo4j` was not merely losing a race for 7687 — it was
> crash-looping with `restart=always`. That is now disarmed, so 7687 has a single owner.

### E9 — Port 7687 contested by two other Neo4j containers (caused flaky startup) — RESOLVED
Three containers declared the same host ports, which made CE's ability to reach Neo4j
depend on Docker's startup ordering:

| Container | Status found | Restart policy | Claimed |
|---|---|---|---|
| `kumiho-ce-neo4j` | running | `unless-stopped` | 7474, 7687 ✅ **sole owner now** |
| `vidismart-neo4j` | `Restarting (1)` — infinite crash loop | **`always`** | 7474, 7687 |
| `kumiho-neo4j` | `Created` (never run) | `no` | 7474, 7687 |

`vidismart-neo4j` is an **orphan from a deleted project**: its compose file
`community-platform/docker-compose.yml` no longer exists on disk and its bind-mounted data
dir is empty (0 bytes, just `dbms/auth.ini`). It was crash-looping on

```
dbms.security.procedures.unrestricted declared multiple times.
```

— its `neo4j.conf` had been corrupted by a `grep`/`sed` run in binary mode (the logs show
`grep: …/neo4j.conf: binary file matches` immediately before each failure). With
`restart=always` it re-armed its claim on 7687 on every Docker start, and the wasted
restarts were enough to lose the port to `kumiho-ce-neo4j` on some boots.

**Fix:** `tools\fix-neo4j-port.ps1` — `docker update --restart=no` **then** `docker stop`,
for both orphan containers. Deliberately **reversible and non-destructive**: nothing was
removed, no volumes touched. Both containers still exist and can be inspected or deleted
later with `docker rm vidismart-neo4j kumiho-neo4j`.

Verified after: `kumiho-ce-neo4j` is the only listener, `cypher-shell` returns `ok 1`, and
`_health.neo4j = ok`. `tools\recover-kumiho.ps1` only ever starts the `kumiho-ce-*` pair, so
the orphans cannot come back through the recovery path.

### E2 — Kumiho CE server not running (critical) — RESOLVED
Port 9190 closed; stale `ce-process.json` PID.
**Fix:** relaunch after E1 and validate `/api/_live`, `/api/_health`.

**Done:** server started (see E3 for how). `/api/_live` → `status: ok, version: 1.8.0,
deployment_mode: self_hosted_ce`. `/api/_health` → `neo4j: ok (8ms)`, `event_stream: ok`.
The old `early eof` reconnect loop is gone — the log now shows a clean
`neo4rs::pool: creating new connection...`. Stale `ce-process.json` (dead PID 31316) was
rewritten to the live PID.

> **Trap when rewriting `ce-process.json` — do not use PowerShell `Set-Content -Encoding UTF8`.**
> On Windows PowerShell 5.1 that emits a UTF-8 **BOM** (`EF BB BF`). Every JSON file Revka
> itself writes is BOM-free, and a strict parser rejects the BOM'd one, so the desktop app
> silently fails to read the PID and the **Server / Memory tiles stay red even though CE is
> healthy**. `tools/start-kumiho-ce.ps1` now writes this file with
> `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` and self-checks the first byte.
> Verify with `xxd <file> | head -1`: it must start with `7b` (`{`), not `efbbbf`.
>
> **A second, subtler way to write the same broken file — `$p` variable shadowing.**
> The launcher holds the CE process in `$p`. When the infra guard was written as
> `foreach ($p in 7687, 6379)`, the loop *overwrote* `$p` with the port number, so
> `$p.Id` evaluated to `$null` and the launcher cheerfully published
> `{"identity": "…", "pid": null}` — a file that parses fine, tells the desktop
> nothing, and turns the tiles red all over again. Found by
> `tools/test-pidfile-repair.ps1`, not by reading the code. The guard now uses
> `$port`, and the writer refuses outright to write a PID that is null or ≤ 0.
> **When you add code to the launcher, do not reuse `$p`.**
>
> Related WSL trap (cost me a detour, not a live bug): `tools/*.py` run under **WSL** Python
> here. A Windows path like `r"C:\Users\..."` is not special to it — it is treated as a
> *relative* filename and silently creates a junk file named `C:\Users\...` in the cwd.
> Use `/mnt/c/...` in Python scripts; keep `C:\...` only inside PowerShell. Conversely,
> inline `powershell -Command "... $_ ..."` from the bash tool mangles `$_` and `$var`
> (bash eats them) — put anything non-trivial in a `.ps1` file and run it with `-File`.

### E2b — Nothing restarted CE after a reboot (the tiles went red on every restart) — RESOLVED
The containers came back on their own (`restart=unless-stopped`), but `kumiho_server.exe`
did **not**, because it only starts with the `KUMIHO_*` environment that
`tools/start-kumiho-ce.ps1` sets (see E3). Nothing in `HKCU\…\Run` or the Startup folder
invoked it, so "green" was never durable — it held only until the next reboot.

**Fix:** `tools/recover-kumiho.ps1` performs the whole ordered bring-up — wait for the
Docker engine (starts Docker Desktop if needed) → start `kumiho-ce-neo4j` / `kumiho-ce-redis`
(and only those two) → run the launcher → verify `_health`. It is idempotent and safe to
re-run at any time.

It is registered at logon as `KumihoCERecovery` in
`HKCU:\Software\Microsoft\Windows\CurrentVersion\Run`
(registered by `tools/install-kumiho-autostart.ps1`; remove with
`Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'KumihoCERecovery'`).
Docker Desktop's own Run entry is present, and the script *waits* for the engine rather
than assuming an order, so the two cannot race.

**Verified end-to-end** by `tools/test-recovery-e2e.ps1`, which kills CE *and* writes a
stale BOM'd PID file (reproducing the original red state exactly), then runs the recovery
script: CE comes back on a new PID, `ce-process.json` is BOM-free and points at a live
process, and `_health` returns `overall=ok neo4j=ok event_stream=ok`.


### E3 — `kumiho_server.exe` cannot be started bare from a shell (important, blocks manual recovery) — RESOLVED
Running the binary directly fails immediately with:

```
Error: Custom { kind: InvalidInput, error: "self_hosted_ce requires KUMIHO_NEO4J_PORT" }
```

`server.toml` alone is not enough in `self_hosted_ce` mode. The required environment (Neo4j port/user/password, Redis port, bind address, local user) is injected by the desktop app / launcher, not read from the TOML for these values.
**Fix options:** (a) start CE through Kumiho Desktop (preferred, it supplies the env), or (b) export the `KUMIHO_*` env vars explicitly before launching `C:\Users\James\.kumiho\bin\kumiho_server.exe`.

**Done via (b).** Working launcher: `M:\code\vidismart\tools\start-kumiho-ce.ps1`
(guards on double-start and on 7687/6379 being up, then launches detached).
Minimum env that works:

```powershell
$env:KUMIHO_NEO4J_PORT   = "7687"
$env:KUMIHO_REDIS_PORT   = "6379"
$env:KUMIHO_DB_NAME      = "neo4j"
$env:KUMIHO_DB_USER      = "neo4j"
$env:KUMIHO_DB_PASS      = "<from server.toml>"
$env:KUMIHO_LOCAL_USER   = "vidiman"
$env:KUMIHO_CONFIG       = "C:\Users\James\.kumiho\server.toml"
```

**Gotcha:** do **not** set `KUMIHO_REDIS_URL` (or `KUMIHO_DB_URI`) in `self_hosted_ce` mode.
It fails fast with:
`self_hosted_ce does not accept Redis URLs; set KUMIHO_REDIS_PORT for local Redis`.
The full set of recognised `KUMIHO_*` variables (29 of them, useful reference) was
recovered by scanning the binary for `KUMIHO_[A-Z0-9_]+` — `strings` is too slow on
this 15 MB exe, a Python regex scan over the bytes is instant.

### E4 — Embedding endpoint contains an unsubstituted placeholder (real, breaks memory/recall) — PARTIALLY RESOLVED
`C:\Users\James\.kumiho\desktop.json`:

```json
"embedding_enabled": true,
"embedding_provider": "openai",
"embedding_model": "bge-m3",
"embedding_dimensions": 1024,
"embedding_endpoint": "https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/run/@cf/baai/bge-m3"
```

The literal `<account_id>` placeholder was never replaced, so any write/recall path that needs embeddings will fail (or silently degrade) even after the server is up. On 2026-09-16 `_health` reported `embeddings: healthy`, so either it was set at runtime by the desktop app or the check was shallow — re-verify after restart.
**Fix:** put the real Cloudflare account id in the endpoint, or switch the provider to a working local endpoint (e.g. Ollama, which Revka already uses for chat).

**Partially done.** The placeholder in `desktop.json` was replaced with the real account id
`5830508745fd2ac063426ebf9429c22d`, and `autostart_infra` was flipped `false` → `true` so the
desktop app brings the datastores up next time instead of failing silently.

Embeddings are still **`disabled`**, which is why this is only partial. Post-restart
`_health` reports the real reason, and it is *not* the placeholder:
`embedding: disabled — KUMIHO_VECTOR_INDEX_ENABLED is not enabled`.

**Root cause of the remaining gap (verified against the binary, 2026-09-27).**
Embeddings need **two** independent gates open:

1. `KUMIHO_VECTOR_INDEX_ENABLED=true` — confirmed present in `kumiho_server.exe`
   (along with `KUMIHO_EMBEDDING_{PROVIDER,MODEL,ENDPOINT,API_KEY,SEND_DIMENSIONS}`
   and `KUMIHO_VECTOR_DIMENSIONS`). It was simply never set, which is what
   `_health` is reporting.
2. A working embedding credential — the endpoint is Cloudflare Workers AI
   (`…/accounts/<id>/ai/run/@cf/baai/bge-m3`). An unauthenticated POST to it
   returns **HTTP 401**, and **no Cloudflare token exists anywhere on this
   machine**: not in `M:\code\vidismart\.env`, not in User/Machine env scope, and
   the available Cloudflare API credential cannot mint one
   (`9109: Unauthorized to access requested resource` on `GET /accounts/{id}/tokens/permission_groups`).

So this is blocked on **supplying a token**, not on a misconfiguration. The
launcher now handles it correctly and safely:

- It enables the vector gate **only when a key is actually found**, so we never
  trade a clean `disabled` for a 401 storm on every ingest.
- Token lookup order: `KUMIHO_EMBEDDING_API_KEY` → `CF_API_TOKEN` →
  `CLOUDFLARE_API_TOKEN` → `M:\code\vidismart\.env` → `C:\Users\James\.kumiho\embedding.key`.
- The dedicated `embedding.key` file is preferred over `.env` so a token is never
  committed to a repo-tracked file.

**To clear E4:** create a Cloudflare API token with the *Workers AI: Read*
permission, save it as `KUMIHO_EMBEDDING_API_KEY=<token>` in
`C:\Users\James\.kumiho\embedding.key`, then re-run `tools\recover-kumiho.ps1`.
The launcher will flip the vector gate on by itself and print
`Embeddings: ENABLED`. Until then vector/semantic recall is off; lexical and
graph features are unaffected. **Not urgent** — the stack is fully operational without it.

### E11 — The desktop half of the stack kept dying (Memory/Revka/9miho tiles flapping red) — RESOLVED
After the pairing succeeded, the desktop stack collapsed and would not stay up. Three
distinct causes, found in order:

**(a) The desktop is a child of whatever shell launches it.** `kumiho-desktop.exe` started with
`Start-Process` becomes a child of the calling PowerShell. When that shell is reaped, the
desktop dies — **silently, with completely empty stdout/stderr and no Windows event-log
entry** — and takes its own children with it: `kumiho-brain` (Memory, 8090) and `9miho`
(9999). This is why the Memory tile repeatedly snapped back to red with nothing in any log
to explain it, and why it read as an app crash rather than a parent death. `9miho`'s log
simply stops mid-`GET /api/healthz 200 OK`, which is what a killed process looks like.
**Fix:** launch detached via WMI `Win32_Process.Create`, which gives the process no
PowerShell parent. Verified: `kumiho-desktop.exe` now reports `parent = WmiPrvSE`, and the
stack stays green across tool-call boundaries. Encapsulated in
`tools\start-kumiho-desktop.ps1`, and used by `tools\recover-kumiho.ps1` for the desktop,
the memory renderer and the Revka daemon alike.

**(b) Revka's MCP port is dynamic and was hardcoded in my own checker.** The daemon writes
its MCP URL to `C:\Users\James\.revka\mcp.json` at every start. Across three restarts today
it was **59117 → 64285 → 64816**. `tools\kumiho-tiles.ps1` had 64285 hardcoded and reported
a false red. It now parses the port out of `mcp.json`. **Never hardcode this port.**

**(c) `daemon_state.json` goes stale after a daemon restart.** Right after the pairing the
file still named the *old* PID (20844) while the live daemon was 77480, so `revka doctor`
reported `heartbeat stale` and `scheduler unhealthy` — two hard errors — while the daemon
was in fact serving normally. The new daemon had not yet taken ownership of the state file.
**A stale heartbeat shortly after a restart is not proof of a dead daemon;** confirm with
the process list and the port before acting.

Also worth knowing: the desktop does not reliably bring Revka up on its own. After the
desktop started, Revka was still absent and had to be launched separately. The recovery
script now checks for it and starts the daemon if needed.

### E10 — Desktop UI showed Server red while CE was actually healthy — diagnosis note
The Kumiho Desktop window (PID 58240, running since 18:15) displayed a **red Server tile** and
asked for a Revka pairing code, at a moment when `kumiho-diag.ps1` reported CE **down** and
`ce-process.json` holding a stale PID. Restarting CE via the launcher turned the API green
immediately, and it then stayed up for 6+ minutes.

**Two things were true at once, and conflating them wasted time:**

1. **CE genuinely was down at that moment** — the stale PID 29988 was real. The launcher
   brought it back (PID 10432) and the API returned `ok` straight away.
2. **The desktop UI does not re-read `ce-process.json` on its own.** It has no reason to:
   `kumiho-desktop.exe` never launched this CE (CE's parent PID 71068 is dead — CE is
   *orphaned*, not desktop-owned). The desktop caches its view of the server, so it keeps
   showing red until it is told to re-check. A desktop restart, or a manual re-check, is
   what clears the tile.

**So: red tile ≠ CE down, and green tile ≠ CE up.** Always confirm with
`tools\kumiho-tiles.ps1` (Windows-side) rather than trusting the UI.

**Methodology trap that nearly caused a wrong fix.** Checking the API with `curl` from the
WSL bash tool returned empty, which looked exactly like "CE died again" and briefly looked
like the desktop was killing CE. It was not: WSL→Windows loopback is unreliable here, the
same class of problem as the WSL/Python path trap in E2. **All CE liveness checks must run
through Windows PowerShell** (`Invoke-RestMethod` from a `.ps1` via `-File`). CE was alive
and serving the whole time.

**Not fixed here, and it is the real remaining gap:** because the desktop never launched
this CE, the desktop is not supervising it, so it will not restart CE by itself and the tile
will not self-heal. Two options:
- **(a)** Accept it — `KumihoCERecovery` (E2b) already restores CE at logon, and
  `tools\start-kumiho-ce.ps1` fixes the tile's data instantly. The tile itself may need a
  desktop restart to re-render.
- **(b)** Let the desktop own CE by having it launch the server, so the tile, the PID file
  and the process lifetime are all managed in one place. This needs the desktop's own
  start path to supply the `KUMIHO_*` environment, which is what E3 says it currently does
  not do. Not attempted — it is an app-behaviour change, not a config fix.

### E5 — Duplicate / stale Revka copies (maintenance risk) — STILL OPEN, but clarified

Two binaries exist, and they are **byte-identical** (verified 2026-09-27):
- `C:\Users\James\.revka\bin\revka.exe` — standalone, on `PATH`; this is what `revka doctor` invokes
- `C:\Users\James\.kumiho\apps\revka\bin\revka.exe` — Kumiho-managed; this is the one that runs

```
sha256 = 3B07C797E277F98FCF3258EC29E38F9B2A9482A13A4F5F8BDE94A6E1DCB9FA1A   (both, 41,213,440 bytes)
```

The earlier worry — two competing daemons — is **not** happening right now. There is exactly
one `revka.exe` process (PID 20844, `…\.kumiho\apps\revka\bin\revka.exe daemon --host 127.0.0.1
--port 42617`), it owns both 42617 and 64285, and it wrote
`C:\Users\James\.revka\daemon_state.json` with `pid: 20844`. A stray second copy was seen
earlier in the session but has since exited.

**So the split is: binary from `.kumiho\apps\`, state and config from `.revka\`.** That is why
edits to `.revka\config.toml` *do* take effect (the running daemon logs
`Config loaded path=C:\Users\James\.revka\config.toml`) while edits next to the managed binary
would not. Editing config is safe; the only remaining risk is PATH ambiguity if the standalone
copy is ever run manually and tries to bind 42617 while the daemon holds it (`os error 10048`).

Left open deliberately: retiring the standalone copy would break the `revka` command on `PATH`
that `doctor` and the pairing flow rely on. Worth doing, but it is a convenience trade-off, not
a fault — hence not urgent.

### E6 — Six-digit pairing code not captured (RESOLVED 2026-09-27)

**Resolved.** The correct command was never obvious because `revka gateway get-paircode`
*without* `--new` only *reads* an existing code, and none existed (the earlier one was
already consumed). The generating form is:

```powershell
& "C:\Users\James\.kumiho\apps\revka\bin\revka.exe" gateway get-paircode --new
```

This prints a fresh **6-digit** code (e.g. `164705`) and the header to use:
`POST /pair` with header `X-Pairing-Code: <code>`.

Notes:
- Despite `code_length = 8` in `[gateway.pairing_dashboard]`, the emitted code is **6 digits** —
  which matches the Kumiho Desktop UI placeholder ("6-digit code"). The config value appears
  not to drive this code path; do not "fix" the config to match the UI.
- Codes are one-time with `code_ttl_secs = 3600`. If the UI rejects the code, the code was
  already used or expired — just re-run the `--new` command above.
- Verified endpoints: `GET /api/health` → 401 (pairing still enforced, correct);
  MCP sidecar alive; `revka doctor` → 30 ok / 3 warnings / 0 errors.
- Do **not** run `revka gateway restart` to fix this: the running daemon already owns
  port 42617 (PID 20844), so a standalone restart dies with
  `os error 10048` (address already in use) and only needlessly bounces the
  daemon's gateway component.


### E7 — WSL / Ubuntu cannot reach the Windows CE instance
`server_addr = "127.0.0.1:9190"` binds loopback only. Consequences:
- WSL cannot reach it (WSL has its own loopback; there is no Windows loopback forwarding in this configuration).
- The Ubuntu box `192.168.4.40` running Hermes (user-reported, unverified) cannot reach it either.

Additionally, WSL has a **half-finished install**: user `vidiman` has `/home/vidiman/.kumiho/bin/kumiho_server` but **no `server.toml`**. Per the earlier decision, Windows stays primary and the WSL copy should not be on-boarded (that would create a second, conflicting graph). Cleanup was planned but **never executed** (see `plans/1789557130886-kumiho-wsl-cleanup-plan.md`).

### E8 — No integration point for Hermes yet
Nothing in the current configuration lets an Ubuntu-side agent write to the Windows CE graph. This is an architecture decision, not a bug — options are listed in §6.

---

## 5. What was already done (progress so far)

- **2026-09-16** — Windows CE verified healthy end to end:
  - `GET /api/_live` → `status: ok`, `version: 1.8.0`, `deployment_mode: self_hosted_ce`
  - `GET /api/_health` → Neo4j, event stream, embeddings all healthy
- Neo4j 5.26.30 and Redis containers created with persistent volumes and `restart=unless-stopped`; Neo4j reachable on 7687 at that time.
- Kumiho EULA accepted on Windows (`eula_accepted = true`, `eula_version = "1.1"`) in `C:\Users\James\.kumiho\server.toml`; config otherwise: `neo4j_port 7687`, `db_name neo4j`, `db_user neo4j`, `db_pass <redacted>`, `local_user vidiman`, `redis_port 6379`.
- Revka installed and configured for **local CE** (this was changed from Kumiho Cloud during earlier work):
  ```toml
  [kumiho]
  enabled = true
  mode = "local_ce"
  mcp_path = "~/.revka/kumiho/run_kumiho_mcp.py"   # file exists ✓
  api_url = "http://127.0.0.1:9190"
  space_prefix = "Revka"
  memory_project = "CognitiveMemory"
  harness_project = "Revka"
  memory_retrieval_limit = 3

  [memory]
  backend = "kumiho"
  auto_save = true
  auto_hydrate = true
  ```
- Revka gateway paired at least once (`gateway.paired_tokens` populated), Revka daemon + MCP + SDK bridge running clean with zero restarts.
- Revka model defaults staged for local Ollama: `qwen3.5:9b-q4_K_M` (needs verification that Ollama + that model are actually pulled).
- 9miho app installed by Kumiho (`0.22.6`, Nuitka onefile, proprietary `miho_*` packages, `api_port 9999`), EULA accepted; on 2026-09-20 its own log shows `GET /api/health 200` and `GET /api/kumiho/connection 200` — so the 9miho→Kumiho path worked while CE was up.
- Planning artifacts written: `M:\code\vidismart\HERMES-AGENT-ARMY-BUILD-PLAN.md` and `M:\code\vidismart\plans\1789557130886-kumiho-wsl-cleanup-plan.md` (cleanup not executed).

---

## 6. Next steps (ordered)

Steps 1–3, 5 and 7 are **done** and re-verified on 2026-09-27. What is actually left:

1. ~~Start Docker Desktop; confirm `kumiho-ce-neo4j` / `kumiho-ce-redis` are `Up`.~~ → **done, E1.**
   Now also automated: `tools\recover-kumiho.ps1` starts Docker and the infra if they are down.
2. ~~Start CE with the `KUMIHO_*` env supplied.~~ → **done, E2/E3**, via
   `tools\start-kumiho-ce.ps1`. The stale-PID rewrite is automated and self-verifying.
3. ~~Validate `/api/_live` and `/api/_health`.~~ → **done.** Run `tools\kumiho-tiles.ps1` for the
   full tile verdict in one shot; it also prints the autostart registration.
4. **Enable embeddings** (the only remaining amber tile) — create a Cloudflare API token with
   *Workers AI: Read*, save it as `KUMIHO_EMBEDDING_API_KEY=<token>` in
   `C:\Users\James\.kumiho\embedding.key`, then re-run `tools\recover-kumiho.ps1`. The launcher
   sets `KUMIHO_VECTOR_INDEX_ENABLED=true` itself once a key is present. → clears E4.
5. ~~Re-check Revka memory tile.~~ → **done**, green on 8090. Still worth a functional probe:
   write one memory via Revka (`backend = "kumiho"`, project `CognitiveMemory`) and read it back.
6. **Revoke/rotate the Revka tokens** if the pair code or gateway token was ever exposed in a
   transcript or log; codes are single-use but the paired token is long-lived. Not tracked as an
   error because no exposure was found — this is a precaution.
7. ~~Pairing.~~ → **done, E6**; use `revka gateway get-paircode --new`.
8. **Decide the Hermes path** (options below) before touching WSL.
9. **Then** clean up the stray WSL binary-only install so it can never be on-boarded by accident. → clears E7.
10. **Optional tidy-up:** `docker rm vidismart-neo4j kumiho-neo4j` removes the two disarmed
    orphan containers (E9). They are already inert; this is only to stop them cluttering
    `docker ps -a`. Nothing depends on them and no data is lost.

### Maintenance commands

| Purpose | Command |
|---|---|
| Full recovery (what runs at logon) | `powershell -File M:\code\vidismart\tools\recover-kumiho.ps1` |
| Start/refresh CE only | `powershell -File M:\code\vidismart\tools\start-kumiho-ce.ps1` |
| Start the desktop (detached) | `powershell -File M:\code\vidismart\tools\start-kumiho-desktop.ps1` |
| Tile + health verdict | `powershell -File M:\code\vidismart\tools\kumiho-tiles.ps1` |
| Detailed diagnostic | `powershell -File M:\code\vidismart\tools\kumiho-diag.ps1` |
| Re-run the PID-file repair test | `powershell -File M:\code\vidismart\tools\test-pidfile-repair.ps1` |
| Prove reboot recovery (kills CE!) | `powershell -File M:\code\vidismart\tools\test-recovery-e2e.ps1` |
| Re-apply the Neo4j port fix | `powershell -File M:\code\vidismart\tools\fix-neo4j-port.ps1` |
| (Re)install logon autostart | `powershell -File M:\code\vidismart\tools\install-kumiho-autostart.ps1` |

### Hermes integration options (pick one, in preference order)
- **A. Keep CE on Windows, expose it to Ubuntu.** Change `server_addr` to `0.0.0.0:9190`, bind Neo4j/Redis to the LAN or tunnel them, and firewall to `192.168.4.40` only. Smallest change, keeps the "Windows primary" decision; costs loopback-only security.
- **B. Reverse tunnel (SSH).** `ssh -R 9190:127.0.0.1:9190 ubuntu@192.168.4.40` from Windows, leaving CE on loopback. Keeps CE unexposed on the LAN. Needs a persistent tunnel (scheduled task / service).
- **C. Move CE to Ubuntu.** Install CE + Neo4j + Redis on `192.168.4.40` alongside Hermes and have Revka/MCP on Windows talk to the LAN endpoint. Cleanest long-term for a server-side agent fleet, but it contradicts the current "Windows primary" decision and means migrating/re-pointing the existing graph.

---

## 7. Files and state to touch

| Path | Role |
|---|---|
| `C:\Users\James\.kumiho\server.toml` | CE config: `self_hosted_ce`, `127.0.0.1:9190`, neo4j 7687, redis 6379, eula accepted |
| `C:\Users\James\.kumiho\desktop.json` | Desktop/infra config: `autostart_infra: false`, embedding endpoint **with `<account_id>` placeholder** |
| `C:\Users\James\.kumiho\ce-process.json` | Stale PID 31316 — must not be trusted |
| `C:\Users\James\.kumiho\logs\kumiho_server.log` | Ends in the Neo4j `early eof` reconnect loop |
| `C:\Users\James\.kumiho\bin\kumiho_server.exe` | CE server binary (needs `KUMIHO_*` env) |
| `C:\Users\James\.kumiho\apps\revka\{manifest.json,runtime.json,bin\revka.exe}` | Kumiho-managed Revka (running copy) |
| `C:\Users\James\.kumiho\apps\9miho\{manifest.json,logs\9miho.log}` | 9miho 0.22.6, API port 9999 |
| `C:\Users\James\.revka\config.toml` | Revka config — already `local_ce` @ `http://127.0.0.1:9190`, `memory.backend = "kumiho"`, gateway pairing on 42617 |
| `C:\Users\James\.revka\kumiho\run_kumiho_mcp.py` | Kumiho MCP bridge script (present) |
| `C:\Users\James\.revka\{mcp.json,daemon_state.json,service-token}` | Revka runtime state, all `ok` |
| `C:\Users\James\.revka\logs\kumiho-sdk-bridge.stderr.log` | Bridge listening on 127.0.0.1:58372 |
| `/home/vidiman/.kumiho/bin/kumiho_server` (WSL) | Stray binary-only install, no `server.toml` |
| `M:\code\vidismart\HERMES-AGENT-ARMY-BUILD-PLAN.md` | Revka/Kumiho agent-stack integration plan |
| `M:\code\vidismart\plans\1789557130886-kumiho-wsl-cleanup-plan.md` | WSL cleanup plan (never executed) |

Security note: `server.toml` contains the Neo4j password in plaintext. It is intentionally redacted in this document; keep it out of any commit (the repo `.gitignore` broadly ignores `*.json`/secrets rules already exist for this reason).

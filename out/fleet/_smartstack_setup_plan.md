# Smart Stack Setup Plan

## VERDICT
The stack is **already installed and — right now — running**, contrary to the task premise: Kumiho CE (9190), Neo4j (7474/7687), Redis (6379), Revka (42617 + MCP), and 9Miho (9999) are all live and returning real data, with 9Miho already proxying Kumiho (projects `9miho`, `CognitiveMemory`, `Revka`; items visible). The **only genuinely broken link is CX**: port 8765 is a bare `python -m http.server` serving a file directory, not the Next.js Smart Channel CX, and no CX code references Kumiho/Revka/Neo4j at all. Also note **Revka does not exist as source anywhere on M:/code** — it is a closed binary.

## WHAT EXISTS (VERIFIED in code/files)
- Kumiho CE server: `C:/Users/James/.kumiho/bin/kumiho_server.exe` (PID 2820), gRPC on 9190. Config `C:/Users/James/.kumiho/server.toml` (`server_addr 127.0.0.1:9190`, `neo4j_port 7687`, `db_user neo4j`).
- Desktop shell: `C:/Users/James/AppData/Local/Kumiho Desktop/kumiho-desktop.exe` (PID 42696) + `kumiho-brain.exe` (39272). Config `~/.kumiho/desktop.json` — `autostart_infra: true`, embeddings via Cloudflare `bge-m3`.
- Neo4j 5.26.30 CE: HTTP 7474, bolt 7687 (PID 13256 — same PID holds Redis 6379). Confirmed by `curl http://127.0.0.1:7474/` → `neo4j_version 5.26.30`.
- Revka: `C:/Users/James/.kumiho/apps/revka/bin/revka.exe` (PID 54004, v2026.8.31) + duplicate `C:/Users/James/.revka/bin/revka.exe`. Config `C:/Users/James/.revka/config.toml`: `[gateway] port = 42617`, `require_pairing = true`; `[kumiho] enabled=true, mode="local_ce", api_url="http://127.0.0.1:9190", memory_project="CognitiveMemory", harness_project="Revka", mcp_path=~/.revka/kumiho/run_kumiho_mcp.py`. State: `~/.revka/daemon_state.json` all 5 components `ok`; MCP at `http://127.0.0.1:59735/mcp` (ephemeral port, re-read `~/.revka/mcp.json`).
- 9Miho: `C:/Users/James/.kumiho/apps/9miho/bin/9miho.exe` v0.22.6, launched `--kumiho ce`, canvas UI + FastAPI on 9999. **VERIFIED endpoints** from its live `/openapi.json`: `/api/health`, `/api/kumiho/connection`, `/api/kumiho/projects`, `/api/kumiho/spaces?project=`, `/api/kumiho/items?project=&space=`, `/api/kumiho/item`, `/api/kumiho/document`, `/api/kumiho/revisions`, `/api/kumiho/lineage`, `/api/kumiho/file`, plus `/api/creative/*` and `/api/assets/*`.
- Kumiho SDK bridge for Revka: `C:/Users/James/.revka/kumiho/kumiho_sdk_bridge.py`, `run_kumiho_mcp.py`, with own venv.
- Fleet tooling: `M:/code/VidiFlow/out/fleet/fleet_dashboard.py` (SERVICES list, lines 29-36), `kumiho_stack.py` (reads Neo4j directly via `server.toml` creds → `stack.json`), `kumiho_probe.py`.
- Docs: `M:/code/VidiFlow/vidiflow/KUMIHO_REVKA_STATUS_SUMMARY.md` (487 lines, best operational history), `M:/code/VidiFlow/business-plan/REVKA-KUMIHO-CONTEXT-LOCK.md` (engage→answer→reflect rule).

## WHAT IS MISSING OR UNCONFIRMED
- **No Kumiho source on disk.** Only compiled `.exe` + Rust log lines. API surface is knowable only via 9Miho's proxy.
- **No Revka source on disk.** `M:/code/VidiBot/hermes-demo-revka-harness/` contains only a README. No `.env.example`, no docker-compose, no input-format spec. Revka's write path into Kumiho is therefore **INFERRED**, not verified: writing is done by Revka tools (`kumiho_memory_reflect`) over gRPC/MCP, not markdown-dropped or POSTed by hand.
- **No 9Miho source on disk.** `M:/code/Kumiho.Desktop_0.5.0_x64-setup.exe` is an installer; the installed 9miho is 0.22.6 (version skew).
- **CX is not running as CX.** PID 41224 = Hermes' Python `http.server 8765`. Real HX app is `M:/code/VidiBot/vidiflow-hx` (Next.js 15, `next dev|start`), normally 8090/8091.
- **CX↔stack integration is ABSENT.** Grep of `vidiflow-hx/src` returns only two non-functional mentions: `MeetingRoom.tsx:82` ("Revka/Kumiho engage path **planned**") and a label string "Neo4j GraphRAG". No client, no env var, no fetch to 9190/42617/9999.
- Embeddings are **failing**: `kumiho_server.log` shows `revision embedding ... 401 Unauthorized` from the Cloudflare `bge-m3` endpoint. Revisions store but are unvectorized.
- Two Revka binaries on disk (duplicate install, noted as open issue E5 in the status summary).

## ORDERED SETUP STEPS
1. **Confirm the DB tier (Kumiho).** Nothing to start — verify, don't install. *Component:* Kumiho CE + Neo4j + Redis. *Verify:* `curl -s http://127.0.0.1:7474/` returns `neo4j_version`, and `curl -s http://127.0.0.1:9190/health` — **note 9190 is gRPC, not REST, so it returns `grpc-status: 12`; that is healthy, not broken.** *Blockers:* on a cold boot these are Docker-based; if Docker Desktop is down, `autostart_infra` cannot help and Neo4j stays CLOSED (the 2026-09-26 outage root cause).
2. **Open the 9Miho UI.** *Component:* 9miho.exe. *Verify:* `curl -s http://127.0.0.1:9999/api/health` → `{"status":"ok","product_version":"0.22.6"}` and browse `http://127.0.0.1:9999/`. *Blockers:* 9miho must be started with `--kumiho ce` or it won't attach; duplicate 9miho.exe PIDs are running, so check you attach to the right one.
3. **Prove the UI is showing real graph data.** *Verify:* `curl -s 'http://127.0.0.1:9999/api/kumiho/projects'` → `9miho`, `CognitiveMemory`, `Revka`; then `/api/kumiho/spaces?project=Revka` → `{"spaces":[{"name":"Goals"}]}`; `/api/kumiho/items?project=Revka&space=Goals` returns the `ten-projects-into-revka-agent-os.goal` item. *Blocker:* if `tenant_configured:false`, writes will fail.
4. **Fix embeddings before trusting retrieval.** *Component:* `desktop.json` Cloudflare endpoint. *Verify:* no new `401 Unauthorized` in `~/.kumiho/logs/kumiho_server.log` after a write. *Blocker:* needs a valid Cloudflare AI Gateway token — **HITL**.
5. **Start Revka (writes into Kumiho).** *Component:* `revka.exe` gateway. *Verify:* `curl -s http://127.0.0.1:42617/health` → `"status":"ok"` with 5 `ok` components, and `~/.revka/mcp.json` shows a live `url`. Then use the MCP at that URL (112 tools advertised) or the paired-token gateway. *Blockers:* `require_pairing=true` needs a paired token (`~/.revka/service-token`); MCP port is ephemeral; dedupe the two Revka installs first.
6. **Only then wire CX to the stack.** *Component:* `M:/code/VidiBot/vidiflow-hx`. *Do:* start it properly (`npm run dev` on 8090 — **not** 8765), then write the client that does not exist today: `GET {KUMIHO_API}/api/kumiho/projects` and `/items` via 9Miho's proxy, or bolt directly with creds from `server.toml`. Implement the locked turn shape from `REVKA-KUMIHO-CONTEXT-LOCK.md`: engage → answer → reflect. *Verify:* a MeetingRoom turn causes a new kref under `CognitiveMemory`. *Blocker:* this is net-new engineering, not configuration.

## VERIFICATION COMMANDS
```bash
curl -s http://127.0.0.1:7474/ | head -c 200          # neo4j_version
curl -s -i http://127.0.0.1:9190/ | head -3           # grpc-status: 12 == healthy
curl -s http://127.0.0.1:9999/api/health               # 9miho ok
curl -s 'http://127.0.0.1:9999/api/kumiho/connection' # {"mode":"ce",...}
curl -s 'http://127.0.0.1:9999/api/kumiho/projects'
curl -s 'http://127.0.0.1:9999/api/kumiho/items?project=Revka&space=Goals'
curl -s http://127.0.0.1:42617/health | head -c 200   # revka gateway
for p in 6379 7474 7687 9190 9999 42617 8765; do (echo > /dev/tcp/127.0.0.1/$p) >/dev/null 2>&1 && echo "$p OPEN" || echo "$p CLOSED"; done
netstat -ano | grep -E 'LISTENING' | grep -E ':(9190|9999|42617) '
grep -c Unauthorized 'C:/Users/James/.kumiho/logs/kumiho_server.log'   # want 0 new
```
Current readings: 6379/7474/7687/9190/9999/42617 **OPEN**, 8765 OPEN-but-wrong-service. Tasklist: `kumiho_server.exe` 2820, `kumiho-desktop.exe` 42696, `kumiho-brain.exe` 39272, `9miho.exe` 66704+69364, `revka.exe` 54004.

## RISKS / BLOCKERS
1. **Everything is undocumented binaries.** Kumiho, Revka, 9Miho have zero source on M:/code. Upgrades, debugging, or reproducing this setup from scratch is not possible from the repo alone — this plan is derived from runtime inspection, not from reading the servers.
2. **Embedding 401 (HITL).** Needs a Cloudflare token; until then memory is write-only-but-unsearchable-by-vector. Semantic recall is degraded.
3. **Docker coupling for a cold boot.** Steps 1 assumes Neo4j/Redis are already up; if they are not, `autostart_infra` is useless without Docker Desktop. This is the single most likely reason the stack looks "down" later.
4. **CX has no integration at all.** Step 6 is greenfield work, and the fleet dashboard currently shows a green CX tile for what is really a static file server — a false positive in `fleet_dashboard.py` (it only does a TCP connect, lines 52-64).
5. **Duplicate binaries + stale PID files.** `ce-process.json`/`runtime.json` PID values have historically been stale; verify with `tasklist`, not the JSON.
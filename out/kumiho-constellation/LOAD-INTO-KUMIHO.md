# Loading the constellation into the real Kumiho — plan, exact commands, verification

**Date:** 2026-10-11 (ET) · **Author:** Hermes sub-agent (VidiBot TASK 3 of 3)
**Status:** PLAN ONLY — **nothing has been written to any Kumiho graph.**
**Deliverable folder:** `M:\code\VidiFlow\out\kumiho-constellation\`

Read together with: `M:\code\VidiFlow\out\KUMIHO-RESEARCH-CAPTURE-SPEC-2026-10-07.md` (node/edge
property contracts) and `M:\code\VidiBot\kumiho\KUMIHO-CONSTELLATION-LOCK-2026-09-29.md`
(Constellation is the default 3D view **mode**, not the whole product).

---

## 0. Where the stack stands right now (checked live, 2026-10-11 ~19:20 ET)

**The entire memory stack is DOWN on V20.** Nothing can be loaded until it is up.

| Port | Service | Live result |
|---|---|---|
| 9190 | Kumiho CE server (gRPC) | **CLOSED** |
| 7687 | Neo4j bolt (Kumiho's store) | **CLOSED** |
| 7474 | Neo4j HTTP | **CLOSED** |
| 6379 | Redis event stream | **CLOSED** |
| 42617 | Revka gateway | **CLOSED** |
| 9999 | 9Miho UI / API | **CLOSED** |

Also checked: `M:\code\VidiFlow\out\kumiho-constellation\` exists but was **empty** when this plan
was written — VidiBot has not copied `nodes.json`, `edges.json`, `index.html`, `build.py` there yet.

Two facts that shaped this plan:

1. **Kumiho *is* the Neo4j graph.** The correct spine is **Mez → Kumiho (= Neo4j) → Revka → 9Miho**.
   Writing "Kumiho → Neo4j" invents a hop between a thing and itself.
2. Kumiho CE is **loopback-bound** (`127.0.0.1:9190`) and serves **gRPC, not JSON REST** — only the
   health endpoints are HTTP. Any loader therefore runs **on V20**, through the Kumiho SDK or the
   Revka SDK bridge, not by POSTing JSON at 9190.

### 0.1 Bring the stack up (documented, idempotent, already used on this box)

```powershell
# full ordered bring-up: Docker engine -> kumiho-ce-neo4j/redis -> CE server -> desktop -> Revka
powershell -File M:\code\vidismart\tools\recover-kumiho.ps1
# one-shot health verdict for every tile (Server, Neo4j, Event stream, Revka gateway, Revka MCP,
# Memory 8090, 9Miho 9999, Embeddings)
powershell -File M:\code\vidismart\tools\kumiho-tiles.ps1
```

Single-service starts, if only one piece is down:

```powershell
powershell -File M:\code\vidismart\tools\start-kumiho-ce.ps1        # Kumiho CE server only
powershell -File M:\code\vidismart\tools\start-kumiho-desktop.ps1   # detached desktop (Memory + 9miho)
```

**Trap:** all CE liveness checks must run through **Windows PowerShell**, not WSL bash —
WSL→Windows loopback is unreliable here and produced false "CE is dead" readings before.
`GET http://127.0.0.1:9190/api/_live` must answer
`{"status":"ok","version":"1.8.0","deployment_mode":"self_hosted_ce"}`.

---

## 1. What feeds Kumiho, Revka and 9Miho

| Component | What it is | Where it listens | How data gets in |
|---|---|---|---|
| **Kumiho CE 1.8.0** | the graph itself (system of record) | gRPC `127.0.0.1:9190` (HTTP only for `/api/_live`, `/api/_health`) | Kumiho SDK / MCP tools / Revka bridge — all of which land in Neo4j |
| **Neo4j 5.26.30** (`kumiho-ce-neo4j`) | Kumiho's property store | bolt `7687`, HTTP `7474` | written **by Kumiho**, never by hand |
| **Redis** (`kumiho-ce-redis`) | event stream between Kumiho and Revka | `6379` | Kumiho/Revka internals |
| **Revka 2026.8.31** | the **pen** — captures memory into Kumiho | gateway `127.0.0.1:42617`; MCP on an **ephemeral** port in `C:\Users\James\.revka\mcp.json` | `engage → answer → reflect` tool calls against `[kumiho] mode = "local_ce"` |
| **9Miho 0.22.6** | the Kumiho Desktop **UI** | FastAPI `127.0.0.1:9999` (must be launched `--kumiho ce`) | read-mostly proxy over Kumiho; the surface a person looks at |

Revka's live config (`C:\Users\James\.revka\config.toml`) already points at the local graph:

```toml
[kumiho]
enabled = true
mode = "local_ce"
api_url = "http://127.0.0.1:9190"
mcp_path = "~/.revka/kumiho/run_kumiho_mcp.py"
space_prefix = "Revka"
memory_project = "CognitiveMemory"
[memory]
backend = "kumiho"
auto_save = true
auto_hydrate = true
```

### 1.1 The three documented write paths (all verified on this machine today)

**(a) Kumiho MCP server** — `kumiho.mcp_server` (the sidecar Revka launches). **45 tools** are
registered in the installed build (kumiho 0.14.0; older notes claiming 69 come from a different
release — use the live list, not the number). The load-bearing ones:

```
kumiho_create_project   kumiho_create_space    kumiho_create_item
kumiho_create_revision  kumiho_create_edge     kumiho_set_metadata
kumiho_create_bundle    kumiho_add_bundle_member
kumiho_memory_store     kumiho_memory_retrieve
kumiho_get_item         kumiho_get_item_revisions   kumiho_get_revision
kumiho_get_edges        kumiho_get_dependencies     kumiho_get_dependents
kumiho_get_provenance_summary   kumiho_find_path   kumiho_analyze_impact
kumiho_search_items     kumiho_fulltext_search      kumiho_resolve_kref
```

**(b) Revka's Kumiho SDK bridge** — `C:\Users\James\.revka\kumiho\kumiho_sdk_bridge.py`, a local
HTTP front end to the SDK (`/api/v1/...`, tokenless for local CE). This is the concrete REST shape
Revka itself uses:

| Route | Method | Body / params | SDK call behind it |
|---|---|---|---|
| `/api/v1/projects` | GET / POST | POST `{name, description}` | `get_projects` / `create_project` |
| `/api/v1/spaces` | GET / POST | POST `{parent_path, name}` | `get_child_spaces` / `create_space` |
| `/api/v1/items` | GET / POST | POST `{space_path, item_name, kind, metadata}` | `get_items` / `create_item` |
| `/api/v1/revisions` | GET / POST | POST `{item_kref, metadata}` | `get_revisions` / `create_revision` |
| `/api/v1/edges` | GET / POST / DELETE | POST `{source_kref, target_kref, edge_type, metadata}` | `get_edges` / `create_edge` |
| `/api/v1/artifacts` | GET / POST | POST `{revision_kref, name, location, metadata}` | `get_artifacts` / `create_artifact` |
| `/api/v1/items/fulltext-search` | GET | `query=`, `kind=` | `search` |

**(c) The Kumiho Python SDK (0.14.0)** — installed in the Revka sidecar venv
(`C:\Users\James\.revka\kumiho\venv`). This is what `kumiho_load.py` in this folder uses:

```python
import kumiho
client = kumiho.client_from_local_ce()            # tokenless local CE, probes 127.0.0.1:9190
with kumiho.use_client(client):
    proj  = kumiho.get_project("EquityGen") or kumiho.create_project("EquityGen", "…")
    space = proj.get_space("/EquityGen/Constellation") or proj.create_space("Constellation")
    item  = space.create_item("equitygen", "company")           # (item_name, kind)
    item.set_metadata({"constellation_id": "equitygen", …})
    rev   = item.create_revision(metadata={…}, embedding_text="…", idempotency_key="…")
    rev.create_edge(other_rev, "BELONGS_TO", metadata={…}, idempotency_key="…")
```

`client_from_local_ce()` is the documented tokenless route for a self-hosted CE (it reads
`KUMIHO_LOCAL_SERVER_ENDPOINT`, default `127.0.0.1:9190`, probes `/api/_live`, and connects over
gRPC when it sees `deployment_mode=self_hosted_ce`).

### 1.2 Read paths (for verification)

| Path | Command | Note |
|---|---|---|
| 9Miho proxy | `http://127.0.0.1:9999/api/kumiho/projects`, `/spaces?project=`, `/items?project=&space=`, `/item`, `/document`, `/revisions`, `/lineage`, `/file`, plus `/api/health` and `/api/kumiho/connection` | verified from 9Miho's live `openapi.json` on 2026-10-05; re-verify when it is up |
| Kumiho health | `http://127.0.0.1:9190/api/_live`, `/api/_health` | PowerShell only |
| Fleet readers | `M:\code\VidiFlow\out\fleet\kumiho_probe.py`, `kumiho_stack.py` | read Neo4j bolt via `~/.kumiho/server.toml`; **need the `neo4j` driver, which is not installed on any Python on this box today** (`pip install neo4j` where they run, or use the SDK route) |
| Revka | `revka doctor`, `revka memory stats` | gateway + memory backend health |

---

## 2. The mapping: `nodes.json` / `edges.json` → Kumiho

Kumiho already stores everything as **`:Item`** (discriminated by a `kind` property) plus
versioned **`:Revision`** nodes, grouped by `:Project` / `:Space`, with relationships
`CONTAINS` (Space→Item) and `HAS_REVISION` (Item→Revision). The loader adds nothing to that
schema — it only uses it.

| Constellation data | Kumiho object | Exact call |
|---|---|---|
| node (id, name, kind, props) | `:Item` in the space | `space.create_item(item_name=<slug of id>, kind=<node kind>)` |
| node text/metadata | `:Revision` on that item | `item.create_revision(metadata={…}, embedding_text=<summary/text>, idempotency_key=<stable>)` |
| item props | item metadata (string→string) | `item.set_metadata({…})` |
| edge (source, target, type) | **Revision → Revision** relationship | `source_rev.create_edge(target_rev, "DERIVED_FROM", metadata={…}, idempotency_key=…)` |

Key technical facts that the loader encodes:

- **Edges live between *revisions*, not items.** `create_edge(source_revision, target_revision, …)`.
  The loader therefore creates one revision per node and wires edges to those revisions.
- **Edge types must match `^[A-Z][A-Z0-9_]{0,49}$`** (validated by both the SDK and the Rust server).
  Lower-case input like `belongs_to` is normalised to `BELONGS_TO`. Kumiho's own standard types are
  `BELONGS_TO, CREATED_FROM, REFERENCED, DEPENDS_ON, DERIVED_FROM, PRODUCED_BY, MIGRATED_FROM,
  CONTAINS, SUPERSEDES, SUPPORTS`; any other uppercase type in that pattern is accepted.
- **kref format:** `kref://<project>/<space>/<item_name>.<kind>?r=<revision>`. House convention is
  dotted slugs — item names in the live graph look like `ten-projects-into-revka-agent-os.goal`,
  i.e. `item_name` = slug, `kind` = `goal`. The loader passes slug + kind separately and lets
  Kumiho form the dotted name.
- **Idempotency:** `create_revision` and `create_edge` take `idempotency_key`; the loader derives
  deterministic keys (`sha1` of node id / edge triple) so **re-running the load is safe** — the same
  input produces the same nodes and edges, not duplicates. Item identity is the
  `(space_path, item_name, kind)` triple, which Kumiho merges on.
- **Every edge carries `source` + `confidence`** (house rule), and every loaded object carries
  `source = "vidibot.constellation"` so verification can find exactly what this load created.
- `kind = "bundle"` is **reserved** by Kumiho; the loader renames any node that asks for it.

### 2.1 Target housing (needs a GO decision — the default is a proposal)

| Choice | Path | Note |
|---|---|---|
| **Proposed default** | project `EquityGen`, space `/EquityGen/Constellation` | the constellation was meant to be EquityGen's view; a new project keeps it separate from memory |
| Alternative A | project `CognitiveMemory`, space `/CognitiveMemory/Constellation` | keeps everything in the existing memory project |
| Alternative B | project `9miho`, space `/9miho/assets/…` | only if this is to read as an asset view |

`kumiho_load.py` defaults to the proposed project/space and takes `--project` / `--space` overrides,
so the decision costs one flag.

---

## 3. The exact commands

All commands are copy-pasteable. Working folder:
`M:\code\VidiFlow\out\kumiho-constellation\`

### Step 0 — bring the stack up and prove it is up

```powershell
powershell -File M:\code\vidismart\tools\recover-kumiho.ps1
powershell -File M:\code\vidismart\tools\kumiho-tiles.ps1
```

Require: Server, Neo4j, Event stream, Revka gateway, Revka MCP, Memory (8090) and 9Miho (9999) green.

### Step 1 — dry run (no connection to Kumiho is opened)

```powershell
cd M:\code\VidiFlow\out\kumiho-constellation
C:\Python314\python.exe kumiho_load.py
```

Reads `nodes.json` / `edges.json`, validates every node id, every edge endpoint and every edge
type, and writes the full call list to `kumiho-load-plan.json`. Today (against the sample fixture
in the same folder) this prints:

```
nodes parsed : 6   edges parsed: 4
kinds        : {'company': 1, 'product': 2, 'system': 3}
edge types   : {'BELONGS_TO': 1, 'CONTAINS': 1, 'DERIVED_FROM': 1, 'DEPENDS_ON': 1}
target       : project=EquityGen space=/EquityGen/Constellation
SDK calls    : 10  -> plan written to …\kumiho-load-plan.json
DRY RUN ONLY - no connection to Kumiho was opened. …
```

Use `--nodes nodes.sample.json --edges edges.sample.json` to rehearse before VidiBot's real files
land. Exit code is non-zero if any validation problem is found.

### Step 2 — review the plan

Open `kumiho-load-plan.json`: it lists every `space.create_item`, `item.set_metadata`,
`item.create_revision` and `create_edge` call with its arguments and idempotency key.

### Step 3 — the live load (three gates at once; James's GO is required)

```powershell
cd M:\code\VidiFlow\out\kumiho-constellation
$env:KUMIHO_CONSTELLATION_GO = "1"                       # James's GO
C:\Users\James\.revka\kumiho\venv\Scripts\python.exe kumiho_load.py --commit
```

Without `--commit` **and** `KUMIHO_CONSTELLATION_GO=1` **and** a clean validation pass, the script
refuses and writes nothing (proven today: `--commit` alone exits with
`REFUSED: --commit given but KUMIHO_CONSTELLATION_GO is not 1. Nothing was written.`).

Run it with the **sidecar venv** interpreter — that is where the `kumiho` SDK lives. From a Hermes
tool call, strip the injected `PYTHONPATH` (`env -u PYTHONPATH …`) or the loader's own
`os.environ.pop("PYTHONPATH")`; the script already does the latter.

### Step 4 — verify (read-only)

```powershell
cd M:\code\VidiFlow\out\kumiho-constellation
C:\Users\James\.revka\kumiho\venv\Scripts\python.exe verify_load.py
```

Four checks: (1) `/api/_live`, (2) the SDK view — project, space, items carrying
`constellation_id`, revisions, edges, (3) the 9Miho proxy answers with the same project/space/items,
(4) the manual look. Exit code 0 = passed.

### Step 5 — the alternative: load by hand through the MCP tools

If a person or agent prefers one object at a time (or wants to fix a single node), drive the Kumiho
MCP tools in this order:

```
kumiho_create_project(name="EquityGen", description="EquityGen constellation")
kumiho_create_space(project_name="EquityGen", space_name="Constellation")
kumiho_create_item(space_path="/EquityGen/Constellation", item_name="equitygen", kind="company",
                   metadata={"constellation_id":"equitygen","source":"vidibot.constellation"})
kumiho_create_revision(item_kref="kref://EquityGen/Constellation/equitygen.company",
                       metadata={"summary":"EquityGen is the company."})
kumiho_set_metadata(kref="kref://EquityGen/Constellation/equitygen.company", metadata={...})
kumiho_create_edge(source_kref="kref://…/vidi-ai.product?r=1",
                   target_kref="kref://…/equitygen.company?r=1",
                   edge_type="BELONGS_TO", metadata={"source":"vidibot.constellation","confidence":"0.9"})
```

The MCP server is launched by Revka as `python -m kumiho.mcp_server`
(launcher: `C:\Users\James\.revka\kumiho\run_kumiho_mcp.py`); its live URL is in
`C:\Users\James\.revka\mcp.json` (the port changes every start — never hard-code it).

---

## 4. How James puts data in

**Route 1 — drop files and run the loader (recommended, repeatable).**
Put `nodes.json` and `edges.json` in `M:\code\VidiFlow\out\kumiho-constellation\`, run Step 1
(dry run), read the plan, then Step 3 with his GO. Re-running is safe (idempotency keys).

**Route 2 — ask the agent.** Any Mez/Revka session with the Kumiho MCP attached can run
`kumiho_create_item` / `kumiho_create_revision` / `kumiho_create_edge` interactively. Use
`kumiho_memory_store` when the content is memory-shaped (conversation/summary) rather than a graph
node — that is Revka's engage/reflect path, and it is how memory is *meant* to land.

**Route 3 — Revka's own turn shape.** For anything a person asks Revka in chat, the locked shape is
`kumiho_memory_engage(query)` → answer → `kumiho_memory_reflect(response, captures, source_krefs)`.
The constellation is a *seeded* view, so Routes 1–2 suit it better than Route 3.

**Route 4 — 9Miho UI.** The UI reads (and its Canvas can surface) the same graph; it is the place to
*look* at the result, not the place to bulk-load it.

---

## 5. How to verify it landed (and what counts as proof)

1. `verify_load.py` → `VERIFY PASSED`.
2. Read-only Cypher against Neo4j (bolt `7687`, creds in `C:\Users\James\.kumiho\server.toml`,
   which the scripts read but never print):

```cypher
MATCH (i:Item) WHERE i.constellation_id IS NOT NULL RETURN count(i);          -- expect = node count
MATCH (s:Space {path:'/EquityGen/Constellation'})-[:CONTAINS]->(i:Item)
      RETURN i.item_name, i.kind ORDER BY i.item_name;                        -- every node present
MATCH ()-[e]->() WHERE e.source = 'vidibot.constellation'
      RETURN type(e), count(*) ORDER BY type(e);                              -- expect = edge count by type
MATCH (i:Item {constellation_id:'equitygen'})-[:HAS_REVISION]->(r:Revision)
      RETURN r.number, r.metadata;                                            -- revision carries the text
MATCH p=(a:Revision)-[e]->(b:Revision) WHERE e.source='vidibot.constellation'
      RETURN p LIMIT 10;                                                      -- the visible web
```

3. **The real proof is visual, not a status code:** open
   [Kumiho Desktop → Constellation](http://127.0.0.1:9999/) and confirm the nodes and their edges
   render in the 3D sun-and-planets view, and that the same items appear in the 9Miho UI at
   [http://127.0.0.1:9999/](http://127.0.0.1:9999/). Note the known UI trap: a red tile ≠ CE down and
   a green tile ≠ CE up — confirm with `kumiho-tiles.ps1`, then re-check the UI.

---

## 6. Safety, governance and the rules honoured here

- **Nothing was written to the live graph.** The only executions today were the dry run, the
  `--commit` refusal test, and `verify_load.py` (read-only, all three failing honestly because the
  stack is down).
- **Pack A** (the ~12 first-fill captures) is untouched; it stays blocked until James says go.
- **No live deploy, no publish, no email or outside message** was sent for this task.
- **No key was printed, changed or rotated;** `peer.txt` and `.env` were not opened or edited.
- The commands above are documented ones from this machine's own tooling (`M:\code\vidismart\tools\*.ps1`,
  the installed SDK/MCP/bridge) — not invented syntax.

---

## 7. Open items and decisions (not guessed)

1. **Housing:** confirm project `EquityGen` + space `/EquityGen/Constellation` (or pick an alternative, §2.1).
2. **`item_name` dotted convention:** the loader passes slug + `kind` separately; the first live item
   should be read back to confirm Kumiho stores `item_name` as `<slug>.<kind>` (observed convention).
3. **Embeddings are disabled/401** (Cloudflare Workers AI `bge-m3` has no token on this machine), so
   `revision_embedding` is empty: **graph and edges work, semantic recall does not.** This is the one
   amber tile and it is a HITL item, not a blocker for the constellation.
4. **Bolt readers need a driver:** `kumiho_probe.py` / `kumiho_stack.py` require `neo4j` (absent from
   every Python on this box today). Either `pip install neo4j` or use the SDK route in §1.1c.
5. **9Miho proxy shapes** were captured from its live `openapi.json` on 2026-10-05; re-confirm
   `/api/kumiho/*` when the service is back up.
6. **Ubuntu box:** it carries only a stray Kumiho **binary** (`/home/vidiman/.kumiho/bin/kumiho_server`,
   no `server.toml`), so there is nothing loadable there. The Ubuntu-side docs pass was **not**
   performed because this task forbids outbound messages of any kind, and the peer link is a
   bot-to-bot message channel; when James lifts that, the read is one DM away.
7. **Node-count honesty:** VidiBot's real `nodes.json` / `edges.json` were not on disk at the time of
   writing, so counts here come from the sample fixture. Re-run Step 1 the moment they land.

---

## 8. Sources read for this plan (all on V20)

| Source | What it gave |
|---|---|
| `M:\code\VidiFlow\vidiflow\KUMIHO_REVKA_STATUS_SUMMARY.md` | ports, Docker/Neo4j coupling, the `KUMIHO_*` env, PID-file traps, tile/login behaviour |
| `M:\code\VidiFlow\out\fleet\_smartstack_setup_plan.md` | live service inventory + the 9Miho proxy endpoints read from its `openapi.json` |
| `M:\code\VidiFlow\business-plan\VIDI_AI_X_VIDIFLOW_SETUP_AND_OPERATIONS_MANUAL.md` | component/port matrix, MCP launcher, runbook commands, engage→reflect turn shape |
| `M:\code\VidiFlow\business-plan\REVKA-KUMIHO-CONTEXT-LOCK.md` | the mandatory turn shape and `fail-closed` rule |
| `M:\code\VidiFlow\out\KUMIHO-RESEARCH-CAPTURE-SPEC-2026-10-07.md` | house node/edge conventions (`:Item`+`kind`, `HAS_REVISION`, `DERIVED_FROM`, `source`+`confidence`) |
| `M:\code\VidiBot\kumiho\KUMIHO-CONSTELLATION-LOCK-2026-09-29.md` | Constellation = default 3D view mode, sun + planets metaphor |
| `M:\code\VidiBot\projects\ACTIVE-PROGRAM-MEZ-KUMIHO-NEO4J-2026-09-30.md` | locked order and the P1–P4 tracks (Pack A stays on GO) |
| `M:\code\VidiBot\vidiflow-hx\docs\FEDERATION-SPINE-REVIEW-2026-10-11.md` | "Kumiho is the Neo4j graph", loopback binding |
| `M:\code\VidiBot\hermes-demo-revka-harness\README.md` | Revka = the harness at 42617, memory = Kumiho at 9190, project `CognitiveMemory` |
| `M:\code\VidiFlow\hydra\PEER-LINK-V20-2026-10-08.md`, `M:\code\VidiBot\docs\PEER-LINK-FOUR-DAY-POSTMORTEM-2026-10-10.md` | peer-link state (V20 `192.168.4.44`, Ubuntu `192.168.4.40:8642`) |
| **Installed code, read directly (no docs exist for these binaries)** | |
| `C:\Users\James\.revka\kumiho\venv\Lib\site-packages\kumiho\` (0.14.0) | `client_from_local_ce`, `create_project/space/item/revision/edge`, `Kref` format, edge-type rule, reserved kinds |
| `C:\Users\James\.revka\kumiho\venv\Lib\site-packages\kumiho\mcp_server.py` | the 45 registered `kumiho_*` tool names and their arguments |
| `C:\Users\James\.revka\kumiho\kumiho_sdk_bridge.py` | the `/api/v1/*` routes Revka uses, and the tokenless local-CE path |
| `C:\Users\James\.revka\kumiho\venv\Lib\site-packages\kumiho_memory\` (1.6.0) | the higher-level memory API (`UniversalMemoryManager`, `memory_store`/`retrieve`) |
| `M:\code\vidismart\tools\{recover,start}-kumiho*.ps1`, `kumiho-tiles.ps1`, `kumiho-diag.ps1` | the only supported start/health commands |

## 9. Files created by this task

| File | Purpose |
|---|---|
| `M:\code\VidiFlow\out\kumiho-constellation\LOAD-INTO-KUMIHO.md` | this plan |
| `M:\code\VidiFlow\out\kumiho-constellation\LOAD-INTO-KUMIHO.html` | read-friendly render of this plan (generated by `render_doc.py`) |
| `M:\code\VidiFlow\out\kumiho-constellation\render_doc.py` | markdown → styled HTML renderer (re-run after editing this file) |
| `M:\code\VidiFlow\out\kumiho-constellation\kumiho_load.py` | the loader (dry-run by default; triple-gated live write) |
| `M:\code\VidiFlow\out\kumiho-constellation\verify_load.py` | read-only verification (REST, SDK, 9Miho proxy) |
| `M:\code\VidiFlow\out\kumiho-constellation\nodes.sample.json`, `edges.sample.json` | fixture used to prove the dry run before VidiBot's real files land |
| `M:\code\VidiFlow\out\kumiho-constellation\kumiho-load-plan.json` | generated call list from the last dry run |

**Reading it in a browser:** this folder is served on loopback, so the render opens at
[http://127.0.0.1:8791/LOAD-INTO-KUMIHO.html](http://127.0.0.1:8791/LOAD-INTO-KUMIHO.html)
and the flat markdown at
[http://127.0.0.1:8791/LOAD-INTO-KUMIHO.md](http://127.0.0.1:8791/LOAD-INTO-KUMIHO.md).
If that server is not running, restart it with
`C:\Python314\python.exe -m http.server 8791 --bind 127.0.0.1` from this folder.

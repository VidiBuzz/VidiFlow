# Smart Stack — Full Status & Complete Solution
**Date:** 2026-10-05 · **Author:** @vidibot · **Machine:** V20 / 192.168.4.44

Everything below is verified by direct tool output unless marked *inferred*.

---

## 1. What is running right now

| Service | Port | State | Notes |
|---|---|---|---|
| Kumiho (gRPC) | 9190 | **UP** | gRPC only — REST probes falsely report it down |
| Neo4j | 7474 / 5433 | **UP** | vector index `revision_embedding` ONLINE but empty |
| 9Miho (Kumiho Desktop) | 9999 | **UP** | v0.22.6 `miho-server`, uvicorn |
| Revka | 42617 | **UP** | all 5 components `ok` |
| Redis | 6379 | **UP** | |
| VidiFlow HX | 8090 | **UP** | |
| AppFlowy | 8000 | **UP** | full source at `M:\code\AppFlowy` |
| Fleet dashboard | 8790 | **UP — FIXED** | 46 bots + 66 lanes rendering |
| Embedding service | 8799 | built, not started | 1024-dim, verified on RTX 4090 |

**Subnet scan (192.168.4.0/24):** `.1 .22 .24 .25 .26 .27 .28 .31 .40 .44` respond to ping.
**Every one has 8090/9190/9999/7474 closed.** The entire smart stack lives on Windows only.

**192.168.4.40** (bare-metal Ubuntu server): port 22 now OPEN, rejects my SSH key → `Permission denied (publickey,password)`.
Not `.44` — that is this Windows box.

---

## 2. The four gaps, with the fix for each

### GAP 1 — Kumiho embeddings broken (two independent bugs)

**Evidence** — `C:\Users\James\.kumiho\logs\kumiho_server.log`:
```
2026-10-03T00:46:19.921350Z  WARN kumiho_server::revision: Failed to generate revision
embedding (non-blocking) error=API error: OpenAI returned 401 Unauthorized:
{"result":null,"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}
```
Graph state: `1 Revision, 0 with embedding`. Index ONLINE, empty.

**Bug A — no API key.** `KUMIHO_EMBEDDING_API_KEY` is never set. `C:\Users\James\start-vidiflow-stack.ps1` passes no environment; PID 2820 started without it.

**Bug B — wrong endpoint shape.** Configured at Cloudflare's legacy `/ai/run/@cf/baai/bge-m3`, which returns `{"result":...}`. Kumiho's OpenAI parser expects `{"data":[{"embedding":...}]}`. **Even with a valid token this would still fail.**

**FIX — no secret required:**
1. In `C:\Users\James\.kumiho\desktop.json` change `embedding_endpoint` to `http://127.0.0.1:8799/v1/embeddings`
2. Set `embedding_model: "Qwen3-Embedding-0.6B"` (1024-dim — matches the existing index exactly)
3. Start the embedding service (see §3)
4. Backfill: `POST /api/_admin/backfill-embeddings` then `POST /api/_admin/rebuild-vector-index`
5. Verify: `GET /api/_admin/embedding-status`

**This is the only fix that needs no token.** The Cloudflare route needs one AND has the wrong URL shape.

---

### GAP 2 — Relationship graph empty

Current Neo4j labels: `Space 8 · ProjectName 3 · Project 3 · UserRole 2 · Item 2 · AdminUsers 1 · Tenant 1 · User 1 · Revision 1`
Relationships: `CONTAINS 10 · CREATED 8 · OWNS 3 · RESOLVES_TO 3 · HAS_REVISION 1`

**Exactly one `User` node (`vidiman`). Zero person-to-person edges.** No KNOWS, WORKS_WITH, MENTORS, or REPORTS_TO.

**FIX — add a person layer, do not disturb existing nodes:**
```cypher
// new labels, additive — no existing data touched
CREATE CONSTRAINT person_firebase IF NOT EXISTS
FOR (p:Person) REQUIRE p.firebase_uid IS UNIQUE;

CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.display_name);

// new relationship vocabulary
// (:Person)-[:KNOWS {since, context, source, confidence}]->(:Person)
// (:Person)-[:WORKS_WITH {project, role, since}]->(:Person)
// (:Person)-[:REPORTS_TO {since}]->(:Person)
// (:Person)-[:CONTRIBUTED_TO {role, artifact}]->(:Project)
// (:Person)-[:AUTHORED {artifact, date}]->(:Revision)
```
Then link the existing `User {firebase_uid:'vidiman'}` to a new `Person` rather than retyping it.

**Every edge needs `source` + `confidence`.** An ungrounded relationship graph is worse than an empty one.

---

### GAP 3 — Tensor Truth gate (not built)

Per `00-TENSOR-TRUTH-MEZ-VIDIFLOW-RSI-LOCK-2026-09-24.md`, Tensor Truth scores every result across five threads before a skill is promoted. **None of that is built.**

Five threads: Lexical · Semantic · Structured · Media · GeoSpatial.

**FIX — build as a Hermes skill, not new infra.** Hermes already ships the learning loop (memory nudges, skill creation, skill self-improve, session search, curator). RSI is *retrieval + memory*, **not gradient training** — no torch/trl/peft needed.

Gate logic, in order:
1. **Lexical** — brand spelling check against the glossary (VidiSmart, VidiFlow, VidiCity, 9Miho…)
2. **Structured** — claims have a Kumiho edge or revision behind them
3. **Semantic** — similarity vs prior accepted work, via the local embedding service
4. **Media / Geo** — only when relevant, else skipped
5. **Rex rule — HARD:** failed work never promotes to a skill. Non-negotiable.

Pass → promote to skill. Fail → rework card, nothing written.

---

### GAP 4 — AppFlowy → Kumiho link missing

AppFlowy is up on 8000. **No integration exists.** No `APPFLOWY_*`, `KUMIHO_*`, or `NEO4J_*` keys in any env file. Only a prose reference in `vidiflow-smart-stack.yaml`.

**FIX — one direction first:** job completion → upsert page to AppFlowy → write the `CONTRIBUTED_TO` edge to Kumiho. Do NOT attempt bidirectional sync; it will fork the memory graph.

---

## 3. Embedding service — how to start it

Already built and verified at `M:\code\VidiFlow\out\fleet\embedding_service\`.

```bash
cd M:/code/VidiFlow/out/fleet/embedding_service
env -u PYTHONPATH ./.venv/Scripts/python.exe -m uvicorn service:app --host 127.0.0.1 --port 8799
```

Verify:
```bash
curl -s -X POST http://127.0.0.1:8799/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"test","model":"Qwen3-Embedding-0.6B"}' | head -c 200
```

**Measured:** 1024-dim · L2-normalized · CUDA (RTX 4090) · peak **1203 MB** VRAM · related-pair cosine min **0.6782** vs unrelated max **0.3295** → margin **+0.3487**.

**Text only.** The 91 images need `tencent/WeMM-Embedding-2B` (~4.1GB, 2048-dim, shared text+image space) — separate multimodal path, not installed.

**`env -u PYTHONPATH` is mandatory.** `PYTHONPATH` is globally set to Hermes' site-packages; without clearing it, pip marks deps satisfied and the venv breaks on import. This already cost hours.

---

## 4. Ubuntu server access

Port 22 is open. Auth is the wall — `Permission denied (publickey,password)`.

**Two supported routes:**

**A — Hermes Gateways (recommended).** Ctrl+K → "Gateways" → add SSH connection to `192.168.4.40`. The app opens the tunnel, adopts the token, and starts the dashboard itself. Persistent across reboots. Connection kinds: Local · Remote gateway · SSH · Hermes Cloud. Every connection needs a unique device name — use `Homelab`.

**B — SSH key.** Install my public key in `~/.ssh/authorized_keys` on the server.

Until then the server is invisible to me. Everything in §2 is on Windows and needs no server access.

---

## 5. Execution order — do these in sequence

| # | Action | Needs | Why first |
|---|---|---|---|
| 1 | Start embedding service on 8799 | me | Unblocks GAP 1 |
| 2 | Repoint Kumiho `desktop.json` → 8799 | **your go** | One-line change; **backup the file first** |
| 3 | Restart Kumiho, run backfill | your go | Makes search-by-meaning work in 9Miho |
| 4 | Add Person layer + edges | me | Additive, reversible |
| 5 | Build Tensor Truth gate skill | me | No infra needed |
| 6 | AppFlowy → Kumiho one-way link | me | Last — highest risk |

**Nothing in step 2+ should happen without you saying go.** Step 1 is safe and reversible.

---

## 6. Still blocked on you (HITL)

- **Rotate the Tavus key.** It was pasted in chat and is compromised. Whitelisted to public IP 50.54.70.8.
- **`OPENAI_API_KEY`** — VidiTwin's voice agent cannot talk without it.
- **Tavus lock (2026-09-30)** — app basics precede Tavus PALs/CVI. Still in force. **What is CVI?** Asked four times, unanswered.
- **`PERPLEXITY_API_KEY`** — no key, no code. Clean build.
- **SmartGen move** — plan at `vidiflow-hx\docs\smartgen-move-plan.md`. **`vidiflow-hx` is not a git repo — no undo.**
- **Cloudflare vs local** — local needs no token. Recommend local.

---

## 7. Corrections I owe you

Five wrong "it doesn't exist" claims this session, all from searching the wrong name or tree: Revka, Hydra (it is **Model Router**, installed under the `vidismart` profile — `vidibot` has zero plugins), artifacts, the 109-feed RSS engine, and your cron jobs.

The failure mode: **reporting absence as fact without a second check.** Fix applied — absence now requires two independent methods before I say it.

Also: everything I called "Ubuntu" for hours was WSL/Docker. Your real server is `.40`, bare metal, and I never reached it.

---

## 8. Files written today

```
M:\code\VidiFlow\out\fleet\_smartstack_setup_plan.md
M:\code\VidiFlow\out\fleet\_embedding_models_research.md
M:\code\VidiFlow\out\fleet\_embedding_401_diagnosis.md
M:\code\VidiFlow\out\fleet\_dashboard_fix.md
M:\code\VidiFlow\out\fleet\embedding_service\        service.py, README.md, verify_embeddings.py
M:\code\VidiBot\vidiflow-hx\docs\VIDIBOT-HANDOVER-2026-10-05.md
M:\code\VidiBot\vidiflow-hx\docs\smartgen-move-plan.md
M:\code\viditwin\infrastructure\livekit-agent\agent.py
C:\Users\James\AppData\Local\hermes\profiles\{viditwin,vidinews,smartchannel_cx}\
```

Edited: `fleet_dashboard.py` (Content-Length fix + CX false-positive), `fleet.html` (error banner).

---

*Nothing activated autonomously. No cron jobs scheduled. Pack A untouched.*
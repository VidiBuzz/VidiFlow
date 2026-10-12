# Vidi AI × VidiFlow: Sovereign Agentic Operating System & Private AI Stack
## Complete Engineering Ledger, Revka + Kumiho Memory Architecture, Operational Runbook & Production Configurations

**Document Version:** 2.5-SOVEREIGN (corrected 2026-09-22)  
**Publication Date:** September 19, 2026 · **corrected:** September 22, 2026  
**Security Classification:** Highly Confidential / Vidi Corp Sovereign Infrastructure  
**Author:** AI Systems Engineering & Core Architecture Team  
**Runtime Targets:** Two sovereign hosts. **Windows sovereign host** — Revka (v2026.8.31), Kumiho CE (v1.8.0), Neo4j, Redis, AppFlowy / SeaweedFS / Qdrant. **Miami B70** — primary inference: 2× Intel Arc Pro B70 (64 GB VRAM) serving **Qwen 3.8 27B** via **vLLM XPU** (`intel/llm-scaler-vllm`). **RTX 4090 (24 GB) = dev / media / draft node only**, not the production brain.

---

## 0. Corrections in v2.5 (2026-09-22)

The 2.4-SOVEREIGN revision was inaccurate about the model path and the inference host. Corrected here:

| 2.4-SOVEREIGN said | Correct position |
|---|---|
| Local LLM engine = **Ollama** (`qwen3.5:9b-q4_K_M`, `qwen2.5:27b`) | **Dev/lab:** LM Studio `http://127.0.0.1:1234/v1`. **Production:** vLLM XPU on **Miami B70** serving **Qwen 3.8 27B INT4**, OpenAI-compatible. **Ollama is not the production engine** (see `VIDIFLOW-MASTER-PLAN.md` risk "Ollama drift"). |
| Primary accelerator = **RTX 4090** | **Miami B70 is the primary inference host.** The 4090 is dev/media/draft (LTX Desktop, ComfyUI, dev Ollama swarm). |
| SmartGen / VidiPitch on port **3007** | SmartGen API is **:3030** (`SMARTGEN_ARCHITECTURE.md`); agent-backend fleet API is :3007; VidiMail server is :5307. |
| No content/media stack | Add **SmartGen** + **Qwen-Image-2.1** (RGBA images) + **MiniMax H3 / LTX / Wan** (video) — see §8. |
| No licence constraints | **Two licence gates** — Qwen-Image-2.1 is research-only; MiniMax H3 open weights exclude US/EU/UK/KR. See §8.3. |
| No WSL note | Kumiho CE is **loopback-only on Windows** (`127.0.0.1:9190`); processes inside WSL **cannot reach it**. Any Kumiho-dependent agent component must run on Windows until the primary moves. |

The §2 engineering ledger (Revka / Kumiho / Neo4j / Redis on Windows) remains **verified and accurate** and is retained.

---

## 1. Executive Summary & Mission Architecture

### 1.1 The Sovereign Mandate
The Vidi AI × VidiFlow ecosystem is explicitly architected as a **100% private, sovereign on-premises intelligence stack**. All core cognitive workloads, task orchestration, long-term memory operations, vector search, and model inference run locally on dedicated private hardware. 

**Zero Cloud Dependency Policy:**
- **No Recurring Cloud API Costs:** No dependence on third-party SaaS token meters for persistent memory or core orchestration.
- **Zero Third-Party Data Leakage:** Enterprise workflows, CPG pitch strategies, intellectual property, internal SOPs, and user sessions remain strictly behind the local firewall.
- **Sub-Millisecond Loopback Latency:** Memory graph queries, tool execution, and vector similarity comparisons execute over local loopback interfaces (`127.0.0.1` and private Docker bridges), eliminating external WAN transit overhead.

### 1.2 System Layering (The VidiFlow Architecture Lock)

| Architecture Layer | Component / Technology | Primary Responsibility | Port / Protocol |
|---|---|---|---|
| **Surface (Visual / HITL)** | **VidiFlow HX Mission Control** (React Flow Canvas) | Glance-level visual representation of the agent fleet via color, position, and shape. WebRTC low-latency audio for two-way voice. | `http://localhost:3000` / WebSockets |
| **Task Orchestration** | **Hermes Agent Dispatcher** | Central task orchestration, Kanban routing, multi-agent dispatching, and execution state management. | Internal Node / IPC |
| **Cognitive Runtime** | **Revka (v2026.8.31)** | Governed autonomous agent execution engine, tool sandbox security, authorization policy, and audit trail logging. | `http://127.0.0.1:42617` (Gateway) |
| **Persistent Graph Memory** | **Kumiho Community Edition (v1.8.0)** | Versioned graph-native memory store. Exposes MCP sidecar providing 69 graph reasoning and memory tools. | `http://127.0.0.1:9190` (REST & Bridge) |
| **Graph Database** | **Neo4j 5.x** (`kumiho-ce-neo4j`) | Property graph storing entities, semantic concepts, user facts, code decisions, and episodic session history. | `bolt://127.0.0.1:7687` / `http://127.0.0.1:7474` |
| **Event Streaming** | **Redis 7.x** (`kumiho-ce-redis`) | High-speed pub/sub message bus and event stream coordinating state sync between Revka and Kumiho. | `redis://127.0.0.1:6379` |
| **Inference — dev / lab** | **LM Studio** | Local OpenAI-compatible inference for workstation development. **Not Ollama.** | `http://127.0.0.1:1234/v1` |
| **Inference — production** | **vLLM XPU on Miami B70** | Primary sovereign inference: **Qwen 3.8 27B INT4** on 2× Intel Arc Pro B70 (64 GB VRAM); LiteLLM fronts for keys, quota and audit. | vLLM `http://<miami>:8000/v1` · LiteLLM `:4000` |
| **Knowledge & Docs** | **AppFlowy Cloud + SeaweedFS + Qdrant** | Collaborative documentation, workspace hierarchy, S3-compatible blob storage, and high-dimensional semantic search. | AppFlowy `4000`, SeaweedFS `8080/8888`, Qdrant `6333` |
| **Content engine** | **SmartGen + SmartChannel CX + ComfyUI** | Template-based campaign generation: **Qwen-Image-2.1** (native RGBA alpha) images, **MiniMax H3-Base / LTX / Wan** video. Channels: VidiShop, VidiMail, VidiBlast. | SmartGen API `:3030` · Directus `:8055` · VidiMail `:5307` |

---

## 2. Completed Engineering Work & Verification Ledger

All reported blockers regarding Revka, Kumiho, Python sidecars, and Neo4j connectivity have been systematically debugged, remediated, and verified live on the host system.

### 2.1 Summary of Completed Tasks

1. **Revka CLI Deployment & Verification:**
   - Positioned official release binary `revka.exe` (v2026.8.31) at `C:\\Users\\James\\.revka\\bin\\revka.exe`.
   - Initialized workspace structure at `C:\\Users\\James\\.revka\\workspace` containing `SOUL.md`.

2. **Isolated Python 3.14 Sidecar Virtual Environment:**
   - Established Python 3.14 virtual environment at `C:\\Users\\James\\.revka\\kumiho\\venv`.
   - Installed core sidecar packages: `kumiho 0.14.0`, `kumiho_memory 1.6.0`, `mcp`, `httpx`, `jsonschema`, and `pywin32`.
   - Validated sidecar launcher `C:\\Users\\James\\.revka\\kumiho\\run_kumiho_mcp.py` with custom Windows process isolation (replacing `execv` to preserve standard I/O pipe handles).

3. **Kumiho Community Edition (CE) Server Stabilization:**
   - Located native CE server binary at `C:\\Users\\James\\.kumiho\\bin\\kumiho_server.exe` (v1.8.0).
   - Diagnosed root-cause connection failure: Neo4j container had entered authentication lockout due to legacy password mismatch.
   - Re-provisioned Docker container `kumiho-ce-neo4j` configured for loopback zero-auth mode (`NEO4J_AUTH=none`), exposing port `7687` (Bolt) and port `7474` (HTTP Browser).
   - Linked to `kumiho-ce-redis` on port `6379`.
   - Updated `C:\\Users\\James\\.kumiho\\server.toml` with EULA v1.1 acceptance and loopback address `127.0.0.1:9190`.
   - Launched Kumiho CE server process (PID 51136). Verified health probe:
     `GET http://127.0.0.1:9190/api/_live` → `{"status":"ok","version":"1.8.0","deployment_mode":"self_hosted_ce"}`.

4. **Revka Configuration & Memory Backend Binding:**
   - Configured `C:\\Users\\James\\.revka\\config.toml`:
     * Set `[memory] backend = "kumiho"`.
     * Configured `[kumiho] mode = "local_ce"` and `api_url = "http://127.0.0.1:9190"`.
     * Configured model provider to local **LM Studio** (`lmstudio`, `http://127.0.0.1:1234/v1`), model **`qwen3.8-27b`**, for dev/lab; production turns route to the **Miami vLLM XPU** endpoint. *(v2.4 said `ollama` + `qwen3.5:9b-q4_K_M` — corrected.)*

5. **Diagnostic & End-to-End Verification:**
   - Executed `revka doctor`: **27 Passed Checks, 0 Errors!**
     * ✅ `kumiho 0.14.0` importable in sidecar venv.
     * ✅ `kumiho_memory 1.6.0` importable — high-level memory reflexes available.
     * ✅ Community Edition reachable at `127.0.0.1:9190` (self_hosted_ce, v1.8.0).
     * ✅ Neo4j: OK.
     * ✅ Redis event-stream: OK.
   - Executed `revka memory stats`:
     * Bridge started at `http://127.0.0.1:58372`.
     * Connected to Kumiho CE endpoint `http://127.0.0.1:9190`.
     * Space `/CognitiveMemory` verified accessible.
   - Executed `revka agent` loop:
     * Auto-spawned Kumiho MCP sidecar client.
     * **69 graph memory tools successfully registered and ready for agent execution.**

---

## 3. Cognitive Turn Shape (The Context-First Accuracy Gate)

In VidiFlow, hallucinations are structurally prevented by enforcing a strict three-phase cognitive loop on every user interaction:

```
                  ┌──────────────────────────────────┐
                  │       Incoming User Prompt       │
                  └─────────────────┬────────────────┘
                                    │
                                    ▼
       [PHASE 1: ENGAGE] kumiho_memory_engage(query, context)
       Query local Neo4j graph for entities, prior decisions,
       SOP constraints, and historical conversation anchors.
                                    │
                                    ▼
       [PHASE 2: EXECUTE] Agent Reasoning & Local Tool Calls
       Local LLM (**Qwen 3.8 27B** — dev via LM Studio, production via Miami vLLM XPU) processes prompt augmented with
       retrieved graph context. Governed tool execution sandbox.
                                    │
                                    ▼
       [PHASE 3: REFLECT] kumiho_memory_reflect(response, captures)
       Extract new facts, commitments, and updated entity links;
       commit back into Neo4j graph with UTC timestamps.
```

### The 5 Operational Rules:
1. **Always Engage First:** Never answer a domain, organizational, or strategic question without first calling `kumiho_memory_engage`.
2. **Always Reflect Substantively:** Store user preferences, newly approved plans, and system modifications using `kumiho_memory_reflect`.
3. **Kumiho is Canonical:** Chat scrollback is ephemeral. The Neo4j graph is the single source of truth for cross-session knowledge.
4. **Fail Closed:** If Kumiho is unreachable, Revka acknowledges lack of prior memory rather than fabricating historical context.
5. **Graph Visualization:** VidiFlow HX Mission Control binds directly to this Neo4j graph to render the live spatial map of agent knowledge.

---

## 4. Production Configuration Files

### 4.1 Revka Core Configuration (`C:\\Users\\James\\.revka\\config.toml`)

```toml
# VidiFlow / Vidi AI Sovereign Configuration
# Dev/lab default = LM Studio. Production routes to Miami vLLM XPU (Qwen 3.8 27B).
default_provider = "lmstudio"
default_model = "qwen3.8-27b"
default_temperature = 0.7
provider_timeout_secs = 120

[autonomy]
level = "supervised"
workspace_only = true
allowed_commands = [
    "git", "npm", "cargo", "ls", "cat", "grep", 
    "find", "echo", "pwd", "wc", "head", "tail", 
    "date", "python", "python3", "pip", "node"
]
max_actions_per_hour = 40

[memory]
backend = "kumiho"
auto_save = true
hygiene_enabled = true
archive_after_days = 7
purge_after_days = 30

[kumiho]
enabled = true
mode = "local_ce"
api_url = "http://127.0.0.1:9190"
mcp_path = "~/.revka/kumiho/run_kumiho_mcp.py"
space_prefix = "Revka"
memory_project = "CognitiveMemory"
harness_project = "Revka"
memory_retrieval_limit = 3

[operator]
enabled = false
mcp_path = ""
max_tool_iterations = 80
tool_timeout_secs = 600

[gateway]
port = 42617
```

### 4.2 Kumiho CE Server Configuration (`C:\\Users\\James\\.kumiho\\server.toml`)

```toml
deployment_mode = "self_hosted_ce"
eula_accepted = true
eula_version = "1.1"
server_addr = "127.0.0.1:9190"
neo4j_port = 7687
db_name = "neo4j"
db_user = ""
db_pass = ""
local_user = "vidiman"
local_email = "vidiman@self-hosted"
redis_port = 6379
```

### 4.3 Kumiho MCP Launcher (`C:\\Users\\James\\.revka\\kumiho\\run_kumiho_mcp.py`)

```python
#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import subprocess
from pathlib import Path

def main() -> int:
    venv = Path.home() / ".revka" / "kumiho" / "venv"
    if os.name == "nt":
        interp = venv / "Scripts" / "python.exe"
    else:
        interp = venv / "bin" / "python3"

    if not interp.exists():
        sys.stderr.write(f"kumiho venv interpreter not found at {interp}\\n")
        return 127

    os.environ.pop("KUMIHO_AUTO_CONFIGURE", None)
    argv = [str(interp), "-m", "kumiho.mcp_server", *sys.argv[1:]]

    # Windows pipe preservation
    if os.name == "nt":
        return subprocess.call(argv)
    os.execv(str(interp), argv)

if __name__ == "__main__":
    raise SystemExit(main())
```

---

## 5. Operations Runbook & Daily Management

### 5.1 System Startup Sequence (PowerShell)

Save this script as `C:\\Users\\James\\start-vidiflow-stack.ps1`:

```powershell
Write-Host ">>> [1/4] Verifying Docker Backends (Neo4j & Redis)..." -ForegroundColor Cyan
docker start kumiho-ce-redis kumiho-ce-neo4j

Write-Host ">>> [2/4] Verifying Inference Engines..." -ForegroundColor Cyan
# Dev/lab: LM Studio must be running with its local server enabled (port 1234).
# Production: Miami B70 runs vLLM XPU serving Qwen 3.8 27B - verify with:
#   curl.exe -s http://<miami>:8000/v1/models
if (!(Get-Process -Name "LM Studio" -ErrorAction SilentlyContinue)) {
    Write-Host "   LM Studio not running - start it for dev/lab inference (http://127.0.0.1:1234/v1)" -ForegroundColor Yellow
}

Write-Host ">>> [3/4] Launching Kumiho CE Server..." -ForegroundColor Cyan
$kumihoRunning = Get-Process -Name "kumiho_server" -ErrorAction SilentlyContinue
if (!$kumihoRunning) {
    Start-Process -FilePath "C:\\Users\\James\\.kumiho\\bin\\kumiho_server.exe" `
                  -WorkingDirectory "C:\\Users\\James\\.kumiho" `
                  -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

Write-Host ">>> [4/4] Validating Revka Doctor..." -ForegroundColor Cyan
& "C:\\Users\\James\\.revka\\bin\\revka.exe" doctor

Write-Host ">>> VidiFlow Sovereign Cognitive Stack Online!" -ForegroundColor Green
```

### 5.2 Common Diagnostic Commands

| Action | Command | Expected Output |
|---|---|---|
| **Kumiho Health Probe** | `curl.exe -s http://127.0.0.1:9190/api/_live` | `{"status":"ok","version":"1.8.0","deployment_mode":"self_hosted_ce"}` |
| **Revka Overall Health** | `& "C:\\Users\James\.revka\bin\revka.exe" doctor` | Summary: 27 OK, 0 errors |
| **Memory Space Audit** | `& "C:\\Users\James\.revka\bin\revka.exe" memory stats` | Lists `/CognitiveMemory` and item count |
| **Check dev GPU (4090)** | `nvidia-smi` | Dev/media node only — LTX Desktop, ComfyUI, dev LM Studio |
| **Check production inference (Miami)** | `curl.exe -s http://<miami>:8000/v1/models` | **Qwen 3.8 27B** served by vLLM XPU on 2× Intel Arc Pro B70 |
| **Verify Port Listeners (host)** | `Get-NetTCPConnection -LocalPort 9190, 7687, 6379, 1234` | All ports in `Listen` state (LM Studio = `1234`; Ollama's `11434` is no longer used) |

---

## 6. Enterprise Port Registry

| Port | Allocation | Description | Security Policy |
|---|---|---|---|
| **3000** | **AppFlowy Admin** | **STRICT RESERVED** (Never allocate to Node/React) | Internal Only |
| **3007** | **agent-backend fleet API** | Fleet registry, telemetry, command dispatch (VidiPitch CPG) | Local Dev & Production Proxy |
| **3030** | **SmartGen API** | SmartGen generation jobs (`smartgen_db`) | Local / internal |
| **5307** | **VidiMail Server** | Personalized video email backend | Local / internal |
| **4000** | **AppFlowy Gateway** | AppFlowy Cloud Nginx ingress | Internal Network |
| **5432-5435** | **PostgreSQL Fleet** | Converge (`5433`), VSC Staging (`5434`), AirPMD (`5435`) | Container Local |
| **6379** | **Kumiho Redis** | Pub/Sub memory bus (`kumiho-ce-redis`) | Loopback Only (`127.0.0.1`) |
| **7474** | **Neo4j Browser** | Graph exploration web UI | Localhost Only |
| **7687** | **Neo4j Bolt** | Binary graph database protocol | Loopback Only (`127.0.0.1`) |
| **8080/9000** | **SeaweedFS** | Distributed object and volume store | Internal S3 API |
| **9190** | **Kumiho Server** | Community Edition REST and MCP Bridge | Loopback Only (`127.0.0.1`) |
| **1234** | **LM Studio** | Dev/lab local inference (Qwen 3.8 27B) | Loopback Only (`127.0.0.1`) |
| **8000** *(Miami)* | **vLLM XPU** | **Production** inference — Qwen 3.8 27B on 2× B70 | Miami host, internal |
| **4000** *(Miami)* | **LiteLLM** | Keys, quota, audit, provider routing, metering | Miami host, localhost/VPN |
| **42617** | **Revka Gateway** | Autonomous agent control & webhook gateway | Loopback / Encrypted Bearer |

---

## 7. Content engine, local media stack & licence gates

### 7.1 SmartGen (template-based campaign generation)

One master template per asset type; assets generated at delivery time into per-campaign folders —
not thousands of duplicate files. SmartChannel CX is the **Directus extension** UI; the SmartGen API
runs on **:3030** and writes jobs to `smartgen_db`; the Directus media library holds output. Detail:
`SMARTGEN_ARCHITECTURE.md`.

| Asset | Renderer | Channel |
|---|---|---|
| Deck | Remotion / Puppeteer | VidiPitch, VidiSmart Community, VidiCRM |
| Image | **Qwen-Image-2.1** (native RGBA alpha, 2K, ≤10 refs) | VidiShop, social, SmartChannel CX |
| Video | **MiniMax H3-Base** (768p) / **LTX-Video 13B** / **Wan** via ComfyUI | VidiMail, VidiBlast, SmartChannel CX |

### 7.2 Personalized video (universal master + per-person overlays)

1. Render the **universal flat master video once** per campaign (no personal data baked in).
2. Generate **per-person RGBA overlays** with Qwen-Image-2.1 (name plate, logo variant, product cutout, localized plate, offer badge, QR).
3. Join both through an `overlay_plan` spec (extended from `lex/data/scene-spec.schema.json`).
4. Composite per channel: **instant** (player/edge, no re-encode) for VidiShop/SmartChannel; **baked** per recipient (`ffmpeg` overlay + NVENC on 4090 / QSV on Arc) for **VidiMail**; **segment splice** for **VidiBlast** at scale.

Video-flow agents on the Hermes swarm own this: Campaign Orchestrator → Identity Mapper → Asset
Forge → Master Renderer → Compositor → Render Wrangler → Delivery → QA/Compliance, each emitting
vADP-1 status to the VidiFlow feed.

### 7.3 Licence gates (do not sell output until closed)

| Model | Constraint | Options |
|---|---|---|
| **Qwen-Image-2.1** | **Qwen Research License** — research/evaluation only; commercial deployment needs a paid Alibaba licence (it is no longer Apache-2.0) | Buy the licence, or use an Apache-class image model for sellable images |
| **MiniMax H3** | Open-weight licence **excludes the US, EU, UK and South Korea**; open weights are **768p only** (2K requires MiniMax's hosted Context-IR + Regenerate-2K) | Run on a non-excluded node, pay the hosted API, or standardise on Wan/LTX for US-local rendering |

### 7.4 Kumiho reachability constraint

Kumiho CE binds to **loopback only** on this Windows host (`127.0.0.1:9190`). Processes inside WSL
cannot reach it. Any Kumiho-dependent agent component must run on Windows until the primary moves.

---

## 8. Sign-Off & System Status

- **Host Machine:** Windows Server / Workstation (Local Private Sovereign Host) + **Miami B70** (primary inference)
- **Primary AI Accelerators:** **Miami B70 — 2× Intel Arc Pro B70 (64 GB VRAM)**, production inference serving Qwen 3.8 27B via vLLM XPU. **RTX 4090 (24 GB) = dev/media/draft node.**
- **Graph State:** Neo4j Community v5 running cleanly in Docker without authentication lockout
- **Event Bus:** Redis 7 container active
- **Cognitive Agent Runtime:** Revka 2026.8.31 fully operational with Kumiho Memory sidecar injection (69 tools)
- **All Data & Local Code:** Preserved under `M:\\code\\vidismart\\vidiflow`, `C:\\Users\\James\\.revka`, and `C:\\Users\\James\\.kumiho`

*Certified Complete and Verified by Autonomous Agent Architecture Engineering.*

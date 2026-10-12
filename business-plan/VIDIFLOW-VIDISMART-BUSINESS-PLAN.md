# VidiFlow · VidiBio · HX — Business Plan Pack
### With VidiSmart Smart Meeting, workforce OS, and Smart Stack bandwidth story  
**Date:** 2026-09-10 · **Owner research agent:** VidiFlow, VidiBio, HX  
**Status:** Living pack — assets saved under `vidiflow-business-plan/`  
**Architecture lock (2026-09-15):** Final smart app **requires Revka + Kumiho** (engage→context→answer→reflect) for context-accurate answers.
**Updated 2026-09-17 — Hermes core orchestration; SeaweedFS; Miami B70/Qwen.**
**Updated 2026-09-22 — SmartGen content engine, local media stack (Qwen-Image-2.1 / MiniMax H3 / LTX / Wan), personalized-video model, and licence gates.**

---

## 1. Executive summary

VidiSmart sells **Agentic Visual AI** for SMBs and Palm Beach executives: glanceable company structure, conversational Smart Meetings (human + AI avatar as peers), and a **sovereign-capable** hardware story (Bandwidth Lab) that makes “why this server?” obvious.

Three money engines:
1. **Smart Meeting / on-site Grok Bot setup** — productized install+train  
2. **VidiFlow HX** — visual agentic dashboard (humans + AI agents as entities)  
3. **Community + PBBG seminars** → consult funnel into Smart Meeting / stack builds  

---

## 2. Offer & pricing (locked)

| SKU | Scope | Price |
|---|---|---|
| Entry | 2-hr on-site Grok Bot / Smart Meeting setup | **$499** |
| Core | 4–5 hr full desk setup + staff train | **$999** |
| Team half-day | 5–10 people rollout + playbook | **$2,500** |
| Seminar special | Intro rate only | **$100/hr** |

Market comps (ChatGPT.ca, Treetop, Alice Labs, AfterBuild, etc.): implementation often **$150–$350/hr** or **$1.5–3.5K+** packages. Our same-day on-site band sits under multi-week consultancies, above DIY chatbot setup.

---

## 3. Products & architecture

### 3.1 VidiFlow HX (visual company + agent OS)
**CoS lock (layered — do not merge):**
- **Surface / HITL:** Mission Control (agent fleet / HITL) + Peerdom/Rolebase DNA (people+projects map) + React Flow canvas = visual / HITL (**not** the task orchestrator). Hermes / OpenClaw / Grok Bot may still appear as **board entities**.
- **Orchestration:** **Hermes Agent Kanban/dispatcher = CORE task orchestration** (supersedes Sep 7 “Hermes = entities only”).
- **Cognition:** Revka = governed runtime; Kumiho = graph memory; engage → context → answer → reflect.
- **Docs/PM:** AppFlowy for SOPs, docs, plans, project management.

**Workforce tool research (glance + premium):**
| Tier | Product | Role | URL |
|---|---|---|---|
| Money-no-object CoS dashboards | Visier | People analytics | https://www.visier.com/ |
| Enterprise planning | Anaplan | Workforce↔finance | https://www.anaplan.com/ |
| Org design | Orgvue / Nakisa | Structure scenarios | https://www.orgvue.com/ · https://nakisa.com/ |
| Mid visual people ops | ChartHop | Org + headcount UI | https://www.charthop.com/ |
| Glance / SMB visual | Peerdom | Dynamic map + projects | https://peerdom.com/ |
| OSS circles | Maptio | Forkable map DNA | https://maptio.com/ |
| Photoboard | Organimi | Faces + hierarchy | https://www.organimi.com/ |

Screenshots archived in `images/` (Visier, Anaplan, Nakisa, ChartHop, Peerdom, Maptio, Organimi, Orgvue).

Wed MVP mocks the org map; Peerdom sync / Rolebase graph = post-v0.1.

### 3.2 Smart Meeting
Live room: James + Ryan + client + **conversational avatar AI** (not a note-taker).  
**Fri MVP spine:** LiveKit + Agents + Tavus avatar + Deepgram streaming STT + private Postgres/SeaweedFS.  
Spike track: Tavus full CVI vs LiveKit face-only BYO-STT — no final commit until both clear.  
Deep Tavus work → Tavus Research agent.

**Meetily (private notetaker, locked 2026-10-03).** Meetily is part of the VidiFlow Smart Meeting tools, not a side list. It is the private local notetaker on V20. Product site: https://meetily.ai/downloads. Re-verified install on 2026-10-03: meetily 0.4.1 (FileVersion and ProductVersion), publisher meetily, path C:\Users\James\AppData\Local\meetily\meetily.exe. No second copy was installed, and participant-notification settings were not changed.

**Privacy lock (James, 2026-10-03).** Meetily must record and transcribe with 100% privacy on the data, including HIPAA-minded use for doctors on AirPMD (Healthcare AirPMD). Audio, recordings, and transcripts stay on that machine, and this capture is not sent off the machine.

**What the vendor page claims.** https://meetily.ai/downloads says the Community Edition is MIT-licensed, runs on the machine, and is "Compliant by design with GDPR and HIPAA workflows." https://meetily.ai/ says "GDPR/HIPAA/SOC2 compliant by design" and that Meetily "inherently supports HIPAA, GDPR, and ISO 27001 requirements." Those fetched pages do not say Meetily is HIPAA-certified and do not mention a BAA. Native apps on the downloads page are Windows and macOS. Linux is build-from-source at https://github.com/Zackriya-Solutions/meetily or a waitlist. GitHub release v0.4.1 includes meetily_0.4.1_x64-setup.exe, which matches the installed version number, while https://meetily.ai/downloads does not print a version.

### 3.3 Smart Stack / Bandwidth Lab
Per `plans/bandwidth-lab-plan.md`: interactive Next.js ladder + configurator in `vidiflow/`, corrected numbers (HBM4 22 TB/s → GbE), hero forge art + deterministic ladder graphic (this pack).

### 3.4 Visual Engine, Zustand & 3D Force Graph Architecture (VidiFlow + VidiShop)
To scale the visual canvas across hundreds of concurrent agents without frame drops or blurry typography, the stack establishes a 2D/3D dual rendering pipeline:

1. **Atomic Multi-Agent State Management:**
   - **`zustand`**: Slices agent telemetry, token streams, and tool executions into isolated atomic subscriptions. Prevents React root re-renders so canvas frame rate locks at 60 FPS.
   - **`comlink` + Web Workers**: Computes force physics and graph layout in background worker threads, freeing the main browser thread for UI interaction.

2. **2D Interactive Canvas & Workflow Layer:**
   - **`@xyflow/react` (React Flow v12)**: Provides infinite zoom/pan, custom card node containers, and pluggable handles.
   - **`@elkjs/elkjs`**: Deterministic DAG layout computation for Left-to-Right agent pipelines and supervisor-worker trees.
   - **`d3-force` & `d3-hierarchy`**: D3 geometry algorithms for organic clustering and radial dendrograms (Observable style).

3. **3D Force Graph Layer (Kumiho Spatial Memory & VidiShop Product Universe):**
   - **`3d-force-graph` / `three-forcegraph`**: WebGL/Three.js-based 3D force-directed graph engine. Capable of rendering 10,000+ nodes and interlinks smoothly in true 3D space.
   - **`d3-force-3d`**: Extends D3's velocity Verlet simulation into 3D (x, y, z) with 3D Barnes-Hut octrees.
   - **`@react-three/fiber` (R3F) + `@react-three/drei`**: Declarative React components for 3D camera controls, spatial lighting, and holographic agent avatars.
   - **`troika-three-text`**: Signed Distance Field (SDF) 3D text renderer. Ensures node labels, model names, and prices remain crisp and readable at any distance/zoom angle without pixelation.
   - **`postprocessing` (Selective Bloom)**: Holographic glow effects for active data edges, highlighted memory paths, and running agent nodes.

4. **Application to VidiShop:**
   - **3D Product & Style Galaxy**: Replaces static 2D product grids with an explorable 3D force-directed graph where products, accessories, and style aesthetics cluster based on vector similarity.
   - **Agent Scanner Integration**: Autonomous price and inventory agents stream updates directly into Zustand stores, visually highlighting fluctuating deals in real time.

5. **Application to VidiFlow LEX & Browser Extension:**
   - **Zero-Lag Term Caching (`zustand`)**: Powers the Chrome extension (`lexi-extension`) popup and sidepanel, providing instantaneous lookups as users hover over tech terms and system acronyms on arbitrary webpages.
   - **3D Concept Cosmos**: In full VidiFlow LEX view, terminology and system concepts float in an organic 3D knowledge universe (`3d-force-graph` + `d3-force-3d`), with `troika-three-text` keeping definitions razor-sharp.

6. **Lexi & Max Broadcast & Presentation Engine:**
   - **Live Anchor Desk HUDs**: When Lexi and Max present market intelligence, unveil new agent capabilities, or conduct Smart Meeting deep dives, their visual backdrop runs on `@xyflow/react` with `postprocessing` bloom.
   - **Real-Time Data Particle Tracing**: As Lexi explains an architecture in plain English and Max assembles the Smart Stack live, GSAP-driven particle flows illuminate active data pipelines at 60 FPS.

---



### 3.5 Miami fleet (locked 2026-09-17)
**Primary Miami inference:** Threadripper workstation with **2× Intel Arc Pro B70** running **Qwen 3.8 27B** (vLLM XPU, OpenAI-compatible, fronted by LiteLLM for keys/quota/audit). First-class in the smart-flow structure (not an afterthought expand-later note). Pair with SeaweedFS + Postgres on the sovereign path; AirPMD dual RTX PRO 6000 remains a separate lean MVP track where noted elsewhere. The **RTX 4090** is the dev/media/draft node, not the production brain.

### 3.6 Content engine — SmartGen, local media & personalized campaigns (added 2026-09-22)

The revenue-bearing content layer. **SmartGen** is template-based: one master template per asset
type, customized per client/campaign at delivery time into campaign folders. **SmartChannel CX** is
the Directus-extension UI; the SmartGen API runs on **:3030** with jobs in `smartgen_db`.

| Product | Customer promise | Engine |
|---|---|---|
| **VidiShop** | "Visualize before you buy" — product in the customer's own context | Qwen-Image-2.1 RGBA cutout composited into their scene |
| **SmartChannel CX** | Context-aware delivery — the UX for the whole suite | Directus extension → SmartGen API :3030 |
| **VidiMail** | Personalized **video email** (server :5307) | Baked per-recipient render (master + overlays) |
| **VidiBlast** | Campaign engine at list scale | Segment-splice batch render + tracking |
| **VidiTwin** | Digital clone presenter | Avatar/voice + per-recipient script |

**Local generation (no per-call API cost):** images via **Qwen-Image-2.1** — 7B, **native RGBA
alpha channel**, 2K, up to 10 reference images, ComfyUI day-0; video via **MiniMax H3-Base**
(768p local), **LTX-Video 13B** or **Wan**, with LTX Desktop drafting on the 4090 and handing a
locked scene spec to Miami for production render.

**Personalization model:** render the **universal flat master video once**; generate per-person
**RGBA overlays**; composite either **instantly** (player/edge — VidiShop, SmartChannel) or **baked
per recipient** (ffmpeg + NVENC/QSV — VidiMail), or by **segment splice** (VidiBlast). One master,
one spec, N personalized outputs — no duplicated pipeline.

**Licence gates (must close before selling generated media):**
- **Qwen-Image-2.1** — **Qwen Research License** (research/evaluation only; commercial use needs a paid Alibaba licence; no longer Apache-2.0).
- **MiniMax H3** — open-weight licence **excludes the US, EU, UK and South Korea**; open weights are **768p only** (2K requires MiniMax's hosted stages).

Substitutes: **Wan / LTX** for US-local video; an Apache-class image model for sellable images.
Detail and diagrams: `plans/1789852421000-vidiai-private-ai-partitioned-access-plan.md` v0.2.

### 3.7 CRITICAL LOCK — Revka + Kumiho (context for accurate answers)

**Status (2026-09-15 James):** Final VidiFlow / Smart App **must** ship with **Revka** + **Kumiho**. This is not optional UI flavor — it is how the app stays accurate.

| Layer | Product | Role in VidiFlow |
|---|---|---|
| Agent runtime / governance | **[Revka](https://revka.ai/)** | Orchestrates agent workflows, tools, approvals, audit (Merkle), CLI agents under policy |
| Graph memory (canonical) | **[Kumiho](https://revka.ai/docs/guides/kumiho-graph-memory/)** | Persistent cross-session graph memory via MCP; provenance edges; shared substrate across agents |

#### Non-negotiable answer loop (every smart-app agent turn)
1. **Engage before respond** — `kumiho_memory_engage` (or operator `memory_engage`) with a query from the *current* user message → inject returned `context` + keep `source_krefs`.
2. **Reason / answer** using that context (plus live tools). Do **not** answer company/agent facts from bare model memory alone.
3. **Reflect after respond** — `kumiho_memory_reflect` with response + structured captures, linking `DERIVED_FROM` to engage `source_krefs`.

Sources: [Kumiho graph memory](https://revka.ai/docs/guides/kumiho-graph-memory/), [Kumiho memory tools](https://revka.ai/docs/memory/kumiho-tools/), [Kumiho setup](https://revka.ai/docs/memory/kumiho-setup/).

#### Why this is critical for VidiSmart / AirPMD / HX
- Stateless LLM turns forget — wrong org map, wrong agent status, wrong client history.
- ~30 agents per company need a **shared** memory graph, not siloed chat transcripts.
- Glance UI (React Flow / 3d-force-graph) must render **real Kumiho graph** (`memory_graph` / explorer), not fake demo nodes labeled "Kumiho".
- Sovereign path: prefer Kumiho **`local_ce`** (loopback) for on-prem Smart Stack; cloud mode only when customer accepts hosted memory.

#### Acceptance criteria (ship gate)
- [ ] Revka Operator + `[kumiho].enabled = true` in final VidiFlow smart-app stack
- [ ] Every user-facing agent has `kumiho_memory_*` (or operator memory_*) tools visible (`GET /api/tools` / `revka doctor` green)
- [ ] Engage→answer→reflect enforced in agent prompts / harness (fail closed: if memory down, continue without inventing history; log failure)
- [ ] HX Mission Control + org/agent canvas read live graph state (not hard-coded mocks) for production answers
- [ ] No "final app" release that answers from chat window only when the question needs prior company/agent context

Detail lock file: `REVKA-KUMIHO-CONTEXT-LOCK.md` (same folder) and `M:\REVKA-KUMIHO-CONTEXT-LOCK.md`.

## 4. Go-to-market

### Palm Beach Business Group (PBBG)
- Domain: https://pbbusinessgroup.com/ (resolves; send from PBBG → land VidiSmart)  
- Venues first-call: Space Connect Forum, Breakers, Canopy/Hyatt  
- First blast segments: legacy PBBG + ~20k list + SMB owner-operators  
- Partner: George Dubeck  

### Channels
- VidiSmart.com hub · Smart Meeting monetization page · Vidi News / Smart Book (sister agents)  
- On-location Grok Bot network (future 50-state installers)

---

## 5. Financial sketch (directional)

- Unit economics healthy if Core $999 sessions are ≤½ day loaded cost  
- Bandwidth Lab / configurator = marketing + hardware attach (WRX90 + RTX 6000 Pro “Sovereign Node” preset)  
- Enterprise Visier/Anaplan-class software is **not** our sell — we **inspire UI** and ship glanceable HX  

---

## 6. 90-day milestones

| Window | Milestone |
|---|---|
| Now–Wed | PBBG/Smart Meeting page assets; bandwidth hero + ladder published |
| Fri Sep 11 | Smart Meeting spike demos (CVI vs BYO-STT) |
| 30 days | VidiFlow HX scaffold with mocked org map + Mission Control integration path |
| 60 days | Bandwidth Lab interactive page live on VidiSmart/vidiflow |
| 90 days | First paid $999/$2500 Smart Meeting installs from PBBG pipeline |

---

## 7. Risks

- Tavus / cloud STT vs sovereign story tension  
- Enterprise org tools oversold for 20-person glance need  
- Legal: meeting recording consent  
- Hardware claims must stay tied to bandwidth-lab-plan citations  
- **Licence exposure (content):** selling output from Qwen-Image-2.1 (research-only licence) or MiniMax H3 (open weights excluded in US/EU/UK/KR) without a licence or substitute is a legal risk — close before launch  
- **Capability claim:** H3 open weights are 768p; do not market "local 2K video"  
- **Stale derivatives:** decks, PDFs and monetization pages still describe Ollama on a 4090 as the primary stack — re-sync after this update

---

## 8. Asset index (this folder)

| Path | What |
|---|---|
| `VIDIFLOW-VIDISMART-BUSINESS-PLAN.md` | This plan |
| `DATA-FLOW-SPEED-EXPLAINER.md` | Stage-by-stage speed teaching |
| `images/hero-bandwidth-forge.png` | Imagine-generated steampunk forge hero (no text) |
| `images/bandwidth-ladder-2026.png` | Corrected log-scale ladder |
| `images/bandwidth-ladder-2026.svg` | Source SVG |
| `images/01–09-*.png` | Workforce product UI screenshots |
| `research/` | Raw research notes dump |

---

## 9. Next actions

0. **Wire Revka + Kumiho into final VidiFlow smart app** (engage→reflect mandatory; see §3.7)  
1. Drop this pack onto `M:\code\vidismart\` (and `vidiflow/public/` for hero)  
2. Wire Infographic.tsx / Bandwidth Lab app per bandwidth-lab-plan §2  
3. James venue pick for PBBG → Admin/New Bot invite copy  
4. After Smart Meeting spikes, update §3.2 architecture commit  
5. **Content engine:** bring up Qwen-Image-2.1 (RGBA) + video (H3/LTX/Wan) on Miami; wire SmartChannel CX → SmartGen API :3030; build the compositor + video-flow agents; **close the two licence gates** (§3.6)


## Smart content & retrieval (added 2026-10-12)
VidiFlow requires smart content: embeddings and metadata on all content (including video) in a vector + keyword index, with phased pre-retrieval, retrieval, and post-retrieval, plus managed, versioned, tested skills in the harness. Vanilla RAG is not acceptable. The canonical spec covers why vanilla RAG fails, video handling, and skill management: `M:\code\VidiBot\docs\VIDIFLOW-SMART-CONTENT-RAG-AND-SKILLS-2026-10-12.md`.


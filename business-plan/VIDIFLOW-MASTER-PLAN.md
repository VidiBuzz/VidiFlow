# Smart VidiFlow — Master Plan

**Canonical as of 2026-09-22.** Supersedes the August 20, 2026 Smart VidiFlow Master Plan for architecture locks. Phase status from Aug is retained where still accurate; compute, orchestration and content layers are brought forward.

**Companion lock:** `VIDIFLOW-SMART-FLOW-LOCK-2026-09-17.md`  
**Business pack:** `VIDIFLOW-VIDISMART-BUSINESS-PLAN.md`  
**Revka/Kumiho detail:** `REVKA-KUMIHO-CONTEXT-LOCK.md`

---

## Goal

Build **Smart VidiFlow**: the visual, glance-level control panel for the entire AI agent fleet — agents seen through color, position, and shape, not text — with voice so the operator can talk to any agent and it talks back in real time.

Product surface names: **VidiFlow HX** (visual agentic OS / Mission Control) + **Smart Meeting / Smart App**.

---

## Architecture lock (layered — do not merge)

| Layer | System | Role |
|---|---|---|
| **Surface** | HX Mission Control + React Flow canvas (+ Peerdom/Rolebase–Maptio DNA) | Visual / HITL only — **not** the task orchestrator. Agents may appear as board entities. |
| **Orchestration** | **Hermes Agent Kanban / dispatcher** | **CORE task orchestration** (supersedes Sep 7 “Hermes = entities only”) |
| **Cognition** | **Revka** + **Kumiho** | Revka = governed agent runtime; Kumiho = graph memory; turn shape **engage → context → answer → reflect** |
| **Meeting** | Lexi + Max | Smart Meeting personas; spine still open (see Open questions) |
| **Data** | Postgres + **SeaweedFS** + AppFlowy + Qdrant | Object store = **SeaweedFS** (not MinIO). AppFlowy = SOPs / docs / plans / PM. Qdrant = vector knowledge. |
| **Miami compute** | Threadripper + **2× Intel Arc Pro B70** + **Qwen 3.8 27B** (vLLM XPU, INT4) | First-class primary Miami inference |
| **Content / media** | **SmartGen** (template engine) + ComfyUI + **Qwen-Image-2.1** (native RGBA) + video (**MiniMax H3-Base** / LTX-Video / Wan) | Campaign assets for **VidiShop · VidiMail · VidiBlast · SmartChannel CX** |
| **Cloud (experimental)** | Cloudflare Agent OS (`@cloudflare/computer`) | Alongside local Hermes — does not replace it |

```mermaid
flowchart TB
  subgraph Surface["Surface — visual / HITL"]
    MC[HX Mission Control]
    RF[React Flow canvas]
    ENT[Board entities]
  end
  subgraph Orch["Orchestration — CORE"]
    HERMES[Hermes Kanban / dispatcher]
  end
  subgraph Cog["Cognition"]
    REVKA[Revka]
    KUMIHO[Kumiho]
  end
  subgraph Meet["Meeting"]
    LEXI[Lexi]
    MAX[Max]
  end
  subgraph Data["Data"]
    PG[(Postgres)]
    SW[SeaweedFS]
    AF[AppFlowy]
    QD[(Qdrant)]
  end
  subgraph Miami["Miami — primary inference"]
    TR[Threadripper]
    B70[2× Intel B70]
    QW[Qwen 3.8 27B]
  end
  MC --> HERMES
  RF --> HERMES
  ENT -.-> MC
  LEXI & MAX --> HERMES
  HERMES --> REVKA
  REVKA <--> KUMIHO
  REVKA --> QW
  REVKA --> PG & SW & QD
  HERMES --> PG
  AF -.-> MC
  TR --> B70 --> QW
```

---

## Confirmed decisions

- **Name:** Smart VidiFlow / VidiFlow HX. “VidiMeet” retired.
- **Interface:** visual-first; chat in agent drill-down / meeting surfaces, not as the primary panel.
- **Task orchestration:** Hermes Agent Kanban/dispatcher is **core**. Mission Control + canvas = visual HITL.
- **Agent cognition:** Revka (runtime/governance) + Kumiho (graph memory) required for accurate Smart App answers (2026-09-15 lock).
- **Local model path (dev / workstation):** LM Studio (`http://localhost:1234/v1`), **not Ollama**. Hermes context floor ≥ 64K where Hermes profiles are used.
- **Miami primary brain (production):** Qwen 3.8 27B on Threadripper + 2× Intel Arc Pro B70, served OpenAI-compatible by **vLLM XPU** (`intel/llm-scaler-vllm`). Mean measured class: ~70–90 tok/s single-stream INT4. **Ollama is not the production engine.**
- **Content engine:** **SmartGen** template-based generation — SmartChannel CX is the Directus extension UI, SmartGen API on `:3030`, jobs in `smartgen_db`, assets stored per campaign folder (one template, no duplicate-file sprawl).
- **Local media generation (no per-call API):** images = **Qwen-Image-2.1** (7B, native RGBA alpha channel, 2K, up to 10 reference images) via ComfyUI; video = **MiniMax H3-Base** (768p local) / **LTX-Video 13B** / **Wan**; LTX Desktop drafts on the 4090 and hands a locked scene spec to Miami for production render.
- **Personalization model:** one **universal flat master video** rendered once + per-person **RGBA** overlays from Qwen-Image-2.1, joined by an `overlay_plan` spec; composited either instantly (player/edge) or baked per recipient (ffmpeg + NVENC/QSV) for VidiMail / VidiBlast.
- **Licence gates (MUST resolve before selling generated media):** **Qwen-Image-2.1** ships under the **Qwen Research License** (commercial use requires a paid Alibaba licence — it is no longer Apache-2.0); **MiniMax H3** open-weight licence **excludes the US, EU, UK and South Korea**, and its open weights are **768p only** (2K requires MiniMax's hosted stages). Substitutes: Wan / LTX for US-local video; an Apache-class image model for sellable images.
- **Voice / meetings (interim):** LiveKit self-hosted + Agents + Piper / Edge TTS still in the stack; Lexi/Max UI in progress. **Arch commit still open:** Tavus CVI vs LiveKit + sovereign STT.
- **Knowledge:** Qdrant + FastEmbed; per-tenant namespaces `kb_{tenant_id}`.
- **Object storage:** **SeaweedFS** S3-compatible (e.g. :9000). Do **not** pull MinIO (closed source).
- **Cloud media:** `cdn.vidi.news` = Cloudflare R2 bucket `vidismart`.
- **Docs / PM:** AppFlowy (not Notion) for SOPs, docs, plans, project management.
- **Cloud agents:** `@cloudflare/computer` experimental track beside local Hermes fleet.
- **Foundation reused:** `M:\code\vidismart\agent-backend` (:3007), agent UI, piper, `.env.tts`.

---

## Implementation status (carried forward from Aug 2026)

### Phase 1 — Hermes + local models — IN PROGRESS
- Hermes installed/verified historically; profiles = one per agent role where Hermes is the worker surface.
- **Bring-forward:** Hermes Kanban/dispatcher is the **orchestration** layer; pair workers with Revka+Kumiho for governed accurate turns.
- LM Studio endpoint (not Ollama) for local OpenAI-compatible inference; Miami B70/Qwen is the production Miami target.

### Phase 2 — Control plane (agent-backend) — MOSTLY DONE
- Fleet registry, telemetry, command dispatch, Socket.IO events.
- Register Hermes (and later cloud) agents through fleet API so Mission Control shows one grid.

### Phase 3 — Visual control panel — DONE (evolve to HX Mission Board)
- agent-ui / HX Mission Control + React Flow canvas path.
- Keep visual/HITL; do not make the canvas the task DB — that is Hermes Kanban.

### Phase 4 — Voice / Smart Meeting — SERVER PARTIAL, AGENTS PENDING
- LiveKit server path exists; Lexi + Max meeting layer started 2026-09-16.
- **Open:** Tavus CVI vs LiveKit face-only + BYO/sovereign STT.

### Phase 5 — Knowledge — DONE (custom pipeline)
- Qdrant + FastEmbed ingest; wire citations into Revka/Kumiho-aware agent prompts.

### Phase 6 — Storage — DONE (SeaweedFS)
- SeaweedFS all-in-one / S3 path. MinIO removed from current plan.

### Phase 7 — Cloudflare Agent OS — EXPERIMENTAL
- Durable Object agents; feature-flagged; local Hermes remains production orchestration path.

### Phase 8 — Revka + Kumiho (NEW / REQUIRED)
- Wire engage → context → answer → reflect into final Smart App.
- Glance UI must render live Kumiho graph state, not mock nodes.
- Detail: `REVKA-KUMIHO-CONTEXT-LOCK.md`.

### Phase 9 — Miami fleet (NEW / LOCKED)
- Stand up / document Threadripper + 2× Intel Arc Pro B70 serving Qwen 3.8 27B.
- Treat as first-class in bandwidth / privacy / demo story (separate from AirPMD dual RTX PRO 6000 lean MVP track).

### Phase 10 — Content engine / SmartGen (NEW / REQUIRED)
- Bring up the local media stack on Miami (ComfyUI + Qwen-Image-2.1 for RGBA images; H3/LTX/Wan for video) so campaigns generate **without per-call API spend**.
- Wire **SmartChannel CX** (Directus extension) → **SmartGen API :3030** → `smartgen_db` → campaign folders, serving **VidiShop, VidiMail (:5307), VidiBlast**.
- Build the **Compositor** (master video + per-person overlays → instant / baked / spliced modes) and the video-flow agents (Campaign Orchestrator, Identity Mapper, Asset Forge, Master Renderer, Render Wrangler, Delivery, QA/Compliance) on the Hermes swarm.
- Close the two licence gates before any sellable output (see Confirmed decisions).
- Detail: `plans/1789852421000-vidiai-private-ai-partitioned-access-plan.md` v0.2.

---

## Compute plan (updated)

### Miami — PRIMARY (locked 2026-09-17)
- **Hardware:** Threadripper + **2× Intel Arc Pro B70**
- **Model:** **Qwen 3.8 27B**
- **Serving:** vLLM XPU (`intel/llm-scaler-vllm`), OpenAI-compatible, INT4, `ze_affinity_mask` pinned for TP=1; LiteLLM in front for keys/quota/audit.
- **Media workload:** ComfyUI + Qwen-Image-2.1 (RGBA) + video (H3/LTX/Wan). VRAM budget: 27B INT4 ≈ 18 GB, leaving ≈ 40 GB for KV + media/embedding services.
- First-class in smart-flow structure and sovereign demos.

### Workstation / lab — retained
- Local LM Studio brains on available NVIDIA cards (e.g. RTX 4090 path from Aug plan) remain valid for **dev/lab**, and as the **media/draft node** (LTX Desktop, ComfyUI, Ollama swarm — dev only).
- Planned **2× RTX 6000 Pro** expansion (AirPMD / high-VRAM track) stays a **separate** scale ladder — does not replace Miami B70/Qwen as the Miami lock.

### Cloud inference — optional
- Workers AI / Paid plan models for Cloudflare Agent OS only; not a substitute for Miami sovereign path.
- Provider fallback (DeepSeek V4.1-Flash, GLM-5.3-Flash, Claude, Gemini) is brokered through LiteLLM only, and is **hard-denied** for any tenant marked `local_only`.

---

## Validation checklist (updated)

- [ ] Hermes Kanban/dispatcher owns task orchestration; Mission Control is visual/HITL only
- [ ] Revka + Kumiho engage→reflect green on Smart App agents
- [ ] SeaweedFS serving media/object buckets (no MinIO)
- [ ] Miami Threadripper + 2× B70 serving Qwen 3.8 27B end-to-end
- [ ] Fleet dashboard shows real Hermes (+ optional cloud) agents
- [ ] Lexi/Max meeting path works for voice (arch TBD)
- [ ] Document ingest → Qdrant searchable with tenant isolation
- [ ] AppFlowy holds SOPs/plans as team knowledge base
- [ ] SmartGen generates a campaign asset locally with **zero per-call API spend**
- [ ] Qwen-Image-2.1 produces a **transparent (RGBA) PNG** consumed by the compositor
- [ ] One master video + N person records → N personalized renders (baked) and one instant-overlay page
- [ ] Licence gates closed and recorded per asset (Qwen-Image-2.1; MiniMax H3 regional)

---

## Risks

- **Layer collapse** — merging Hermes, Mission Control, and Revka into one blob. Keep layers separate.
- **Ollama drift** — LM Studio (or Miami OpenAI-compatible endpoint) is the local path; do not reintroduce Ollama as default.
- **MinIO reintroduction** — closed source; SeaweedFS is the lock.
- **64K context floor** — set explicitly wherever Hermes + LM Studio are used.
- **Cloudflare computer preview** — feature-flag only.
- **Meeting arch indecision** — Tavus vs LiveKit+sovereign STT blocks a final Smart Meeting commit.
- **Licence exposure** — selling output from **Qwen-Image-2.1** (research-only licence) or **MiniMax H3** (open weights excluded in US/EU/UK/KR) without a licence or substitute is a legal risk. Close before launch.
- **Video-model capability gap** — H3 open weights are 768p only; 2K needs hosted stages. Do not market "local 2K video".
- **Stale-document drift** — the 9/19 ops manual still described Ollama + qwen3.5/qwen2.5 on the 4090 as the primary intelligence. Corrected 2026-09-22; re-check derived PDFs, decks and monetization pages.

---

## Open questions

1. **Meeting spine:** Tavus CVI vs LiveKit + sovereign STT — pick for production.
2. **Org map DNA:** Peerdom license vs Maptio/Rolebase OSS fork for production map sync.
3. Full-duplex vs push-to-talk for first operator voice sessions.
4. Multi-operator / role-based access to Mission Control.
5. **Licences:** buy the Alibaba commercial licence for Qwen-Image-2.1, or switch sellable image output to an Apache-class model?
6. **Video:** host MiniMax H3 on a non-excluded node, pay the hosted API, or standardise on Wan/LTX for US-local rendering?
7. **Compositor default per channel:** confirm VidiMail = baked per-recipient, VidiShop/SmartChannel = instant overlay.

---

## Document history

| Date | Change |
|---|---|
| 2026-08-20 | Original Smart VidiFlow Master Plan (Hermes workers, LM Studio, SeaweedFS, LiveKit, Cloudflare experimental, 4090 / RTX 6000 tiers) |
| 2026-09-15 | Revka + Kumiho required for Smart App accuracy |
| 2026-09-17 | Hermes = core task orchestration; Mission Control = visual/HITL; SeaweedFS confirmed vs MinIO; Miami TR + 2× B70 + Qwen 3.8 27B; AppFlowy KB; this master plan brought forward |
| 2026-09-22 | Content engine added (SmartGen, SmartChannel CX :3030, VidiShop/VidiMail/VidiBlast); local media stack (Qwen-Image-2.1 RGBA, H3/LTX/Wan); personalization model; **licence gates**; vLLM XPU named as production serving (Ollama explicitly not production) |

VidiSmart — Confidential Internal Document  
Smart VidiFlow Master Plan | Updated 2026-09-22


<!-- 2026-10-11: sections below carried from the box copy (/workspace/vidiflow-business-plan/VIDIFLOW-MASTER-PLAN-2026-09-17.md); they were box-only until now. -->
---

## 2026-10-03 — Agent Force morning lock (James via VidiBot)

**Dated 2026-10-03. Source: James via VidiBot, morning lock.** Facts below are recorded as given. Do not treat this section as a rewrite of earlier locks.

### Agent Force

Ten tasks exist on the Hermes board slug `agent-army` (not the empty Default board the desktop was showing). They are tasks, not ten separate profiles. They are not loaded in Revka yet. All were assigned to the default profile and marked running around 3:47 AM ET Oct 3 after gateway PID 35476 started. V20 was offline at 5:50 AM ET, so the desktop could not be switched.

Titles exactly:

1. Hermes gateway
2. Grok Bot bridge
3. equitygen.io
4. Voice workup
5. AppFlowy
6. VidiModels
7. Space Bunny
8. Smart Channel CX
9. VidiSmart Community
10. VidiCity

Grok Bot bridge means ten working Hermes agents with a VidiFlow already in progress. It stays one of the ten tasks, not ten extra rows. Client-facing name is Mez, never Hermes in client copy; the board slug itself is agent-army / Hermes board as recorded.

### Order lock

Order James locked this morning (2026-10-03): ten tasks visible in Mez, the same ten in Revka, VidiFlow work only after both are visible.

### Video hotspots (Smart Channel CX)

Demo at `/workspace/VidiBot/demos/video-hotspots-2026-10-02/` (`index.html`, `tracking.json`, `space-bunny.mp4`). Note copied to `/workspace/VidiBot/docs/SMARTCHANNEL-CX-VIDEO-HOTSPOTS-2026-10-02.md`. SVG note already at `/workspace/VidiBot/docs/SMARTCHANNEL-CX-ANIMATED-SVG-2026-10-02.md`. Not on M: yet because V20 was offline.


### Smart Channel CX

The 2026-10-02 video hotspots take (`space-bunny.mp4` + `tracking.json` + `index.html`) at `/workspace/VidiBot/demos/video-hotspots-2026-10-02/` is filed under Smart Channel CX, the editor being built, and under 9Miho, not only the VidiBot demos folder. Written notes: `/workspace/VidiBot/docs/SMARTCHANNEL-CX-VIDEO-HOTSPOTS-2026-10-02.md`. The animated-SVG companion is `/workspace/VidiBot/docs/SMARTCHANNEL-CX-ANIMATED-SVG-2026-10-02.md`. Not on M: and not live on vidiflow.net.

### 9Miho

The 2026-10-02 video hotspots take (`space-bunny.mp4` + `tracking.json` + `index.html`) at `/workspace/VidiBot/demos/video-hotspots-2026-10-02/` is filed under 9Miho (https://9miho.io/) and under Smart Channel CX, not only the VidiBot demos folder. Written notes: `/workspace/VidiBot/docs/SMARTCHANNEL-CX-VIDEO-HOTSPOTS-2026-10-02.md`. The animated-SVG companion is `/workspace/VidiBot/docs/SMARTCHANNEL-CX-ANIMATED-SVG-2026-10-02.md`. Not on M: and not live on vidiflow.net.

### Animated SVG agent panel (2026-10-03)

James lock 2026-10-03: Animated SVGs are how agent progress shows on VidiFlow screens. Each agent gets an animated icon so one panel can show about fifty agents at once. This panel is next as soon as the ten Mez tasks are visible and the same ten are in Revka. It is not parked. James says VidiFlow is only showing about a tenth of the research already done. For fifty icons, prefer a self-contained loop (CSS or SMIL baked in the SVG), not a GSAP timeline per agent. Inline SVG plus GSAP stays for overlays that must follow a clock. SVG does not replace `.glb`. The 2026-10-02 hotspot demo stays filed under both Smart Channel CX and 9Miho.

| Date | Change |
|---|---|
| 2026-10-03 | Appended Agent Force morning lock (ten `agent-army` board tasks, order lock, Smart Channel CX video hotspots). V20 offline; M: copy not updated. |
| 2026-10-03 | Filed the 2026-10-02 video hotspots demo under Smart Channel CX and under 9Miho (box only; not on M: or vidiflow.net). |
| 2026-10-03 | Animated SVG agent-progress panel lock (about fifty icons; next after ten Mez tasks are in Mez and Revka). Box only. |


### Mercury beta + Mez 3D (2026-10-07)

James lock 2026-10-07: Trap5 **Mercury — Mobile Command** ([trap5.de](https://trap5.de), [trap5.de/mercury/](https://trap5.de/mercury/)) is the VidiFlow mobile start reference. We are **beta-testing** Mercury — Trap5 sends a version to test (not a Play purchase; no unofficial Hermes APKs for real keys). Install on a test phone only after James + VidiBot GO. Dutiful remains the compare target (still undefined). **Mez needs 3D control too** (board + mobile face), same `.glb` delivery standard as HX mid-flow; client UI strings stay VidiFlow/Mez only. Execution owner for phone = VidiFlow Android; product face = VidiFlow, VidiBio, HX.

| Date | Change |
|---|---|
| 2026-10-07 | Mercury beta path (vendor-sent build) + Mez 3D control lock (.glb). Box only; M: copy when V20 online. |


### ComfyUI full-stack integration (2026-10-07)

James lock 2026-10-07: **fully integrate the stack with ComfyUI.** Gen kitchen is first-class across Mez → SmartGen / 9Miho Canvas → Kumiho/Revka → VidiFlow Layer 5. Close SmartGen Image 501 (empty diffusion models folder). No live model install or `:8090` hot-edit until James + VidiBot GO. Owners: HX product face + Smart Channel CX; SmartGen Video Edit for Comfy/video-edit lane. Lock note: `/workspace/VidiBot/docs/COMFYUI-FULL-STACK-INTEGRATION-LOCK-2026-10-07.md`.

| Date | Change |
|---|---|
| 2026-10-07 | ComfyUI full-stack integration lock. Box only; M: when V20 online. |

---

## 2026-10-11 — VidiFlow HX dash: what's next (James via VidiBot)

**Dated 2026-10-11.** Full plan: `M:\code\VidiBot\docs\VIDIFLOW-HX-DASH-NEXT-PLAN-2026-10-11.md`. Plan only. No live change, no `:8090` edit or restart.

Prioritized next steps:

1. **Mez event stream v1** (`/v1/snapshot` + `/v1/events`, SSE, resumable by `seq`, AG-UI-style typed events; alongside `/chat/stream`). Foundation for every surface.
2. **Agent Force wall.** About 50 animated SVG tiles (CSS/SMIL), humans and AI as equal actors, 11-state enum, handoff baton arcs, and only `needs_human` alerts.
3. **Mez Hydra panel.** People / Hardware / Cash flow / Routing quadrants plus an intelligence overlay (not a fifth part). Cash flow is marked undefined until James defines it with Ledger/Casey. Routing shows Clef-style switch decisions.
4. **Approvals inbox + take the wheel + docked Mez chat on every page.** OpenDots patterns, VidiFlow/Mez names, access off by default.
5. **Gen Kitchen tile** (ComfyUI → 9Miho → Kumiho/Revka → Layer 5), honest 501 status until the GO-gated model install.
6. Mez 3D control (`.glb` only). 7. Trap5 Mercury-pattern mobile + Android Auto (beta build + GO first). 8. Voice while it works. 9. Scheduled tasks + learned-skill review queue. 10. Agent visibility metrics (claimed vs verified, waiting on humans; no per-human scoring).

Design lock for HX dash: Kumbh Sans, no overlapping text (fixed label boxes, 40-character status cap, QA at 1280/1920/390 px), every URL/ID clickable, cinematic dark look with one accent reserved for `needs_human`, WCAG 2.2 AA, reduced motion honored.

| Date | Change |
|---|---|
| 2026-10-11 | Carried the 2026-10-03 and 2026-10-07 box-only sections onto M:. Appended the HX dash next-steps plan. Backup taken first. |

---

## Oct 11 HX dashboard update (2026-10-11, afternoon)

**Dated 2026-10-11, ~2:30 PM ET. Source: James via VidiBot.** Full plan: `M:\code\VidiBot\docs\VIDIFLOW-HX-DASHBOARD-PLAN-2026-10-11.md` (mockup next to it: `HX-DASHBOARD-MOCK-2026-10-11.png`). It takes over priority from the morning `VIDIFLOW-HX-DASH-NEXT-PLAN-2026-10-11.md`; that doc's detailed specs still stand. Plan only: no vidiflow.net / `:8090` change.

Verified live today: `/`, `/hx`, `/hx/log`, `/hydra`, `/swarm`, `/org`, `/meeting`, `/briefing`, `/how-it-works`, `/integrate`, `/showcase`, `/visuals` all return 200 and every page is labelled DEMO DATA. `/space-bunny`, `/inbox`, `/v1/*` are 404 on live.

Top 5 next steps:

1. Mez event stream v1 (`/v1/snapshot` + `/v1/events`) on V20, fed first by Lexi's image batch log and the free OpenCode batch jobs.
2. VidiGallery (`M:\code\vidismart\VidiGalleryApp`, localhost `:7432`) becomes the HX Gallery + image approvals surface: add the site-image batch folder, rebuild on batch end, Approve/Redo written back to Mez; retire the `:8787/review/` stopgap. LAN exposure needs a read-only proxy and James GO (its file endpoints are unauthenticated).
3. Agent Force wall v1: 17 animated status tiles (14 Shared Experts + Lexi, Max, James), "Needs you" the only attention state.
4. Live activity timeline with verified/claimed chips + docked Mez chat on every page.
5. Live/Demo honesty badges on every tile.

Design: dark `#07090F` base, VidiFlow blue `#5B8CFF` for brand/primary, amber reserved for "needs you", Kumbh Sans, motion only when state changes, QA at 1280 / 1920 / 390 px.

Open for James: vendor runtime names on the public site vs the client naming lock; VidiGallery bind/proxy GO; cash-flow definition.

| Date | Change |
|---|---|
| 2026-10-11 | Appended Oct 11 HX dashboard update (links the new plan). Backup taken first. |

---

## Oct 11 lock: day-one people + agents baseline (2026-10-11, ~2:30 PM ET)

**Source: James via VidiBot.** Full lock: `M:\code\VidiBot\docs\VIDIFLOW-DAY-ONE-BASELINE-PEOPLE-AND-AGENTS-LOCK-2026-10-11.md`. Lexi brief: `M:\code\VidiBot\docs\LEXI-ORG-PAGE-HEADSHOTS-BRIEF-2026-10-11.md`.

- VidiFlow goes in on day one as the baseline: every person mapped (headshot, what they do today, processes, tasks, time, tools, handoffs) before automation.
- Every person has 2+ agents; every human gets a real photo, every agent a consistent portrait (no initials tiles).
- The org page shows scale: Today → 50 → 100 → 200 people (200 people = 400 agents), constellation → division → person.
- One roster file (`M:\code\VidiFlow\roster\vidiflow-roster.json`) feeds the org page and Mez routing; Lexi keeps it updated.
- This raises P2-7 (Org + Meeting merge) in priority: `/org` becomes the people + agents view of the same roster. Local prototype first (V20 `:8788`); vidiflow.net only on James's GO.

| Date | Change |
|---|---|
| 2026-10-11 | Appended day-one people + agents baseline lock link. Backup taken first. |

## Smart content & retrieval (added 2026-10-12)
VidiFlow requires smart content: embeddings and metadata on all content (including video) in a vector + keyword index, with phased pre-retrieval, retrieval, and post-retrieval, plus managed, versioned, tested skills in the harness. Vanilla RAG is not acceptable. The canonical spec covers why vanilla RAG fails, video handling, and skill management: `M:\code\VidiBot\docs\VIDIFLOW-SMART-CONTENT-RAG-AND-SKILLS-2026-10-12.md`.


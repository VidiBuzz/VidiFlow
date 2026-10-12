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

# VidiFlow Smart Flow Lock — 2026-09-17

**Status:** Active architecture lock (layered — do not merge layers)  
**Applies to:** VidiFlow HX / Smart Meeting / VidiSmart stack planning  

---

## Layered map (do not collapse)

| Layer | System | Role |
|---|---|---|
| **Surface** | HX Mission Control + React Flow canvas | Visual / HITL only — **not** the task orchestrator. Agents may appear as board entities. |
| **Orchestration** | **Hermes Agent Kanban/dispatcher** | **CORE task orchestration** (supersedes Sep 7 “Hermes = entities only” CoS lock) |
| **Cognition** | Revka + Kumiho | Revka = governed agent runtime; Kumiho = graph memory; turn shape **engage → context → answer → reflect** |
| **Meeting** | Lexi + Max | Conversational Smart Meeting peers; spine **still open** |
| **Data** | Postgres + **SeaweedFS** + AppFlowy | Object storage = **SeaweedFS** (not MinIO — MinIO went closed source). AppFlowy = SOPs/docs/plans/PM |
| **Miami compute** | Threadripper + **2× Intel B70** + **Qwen 3.8 27B** | First-class primary Miami inference |

---

## Hermes decision (locked)

- **Hermes Agent Kanban/dispatcher = core task orchestration.**
- Mission Control / React Flow remain **visual + HITL** surfaces.
- Hermes / OpenClaw / Grok Bot can still show as **entities on the board** without becoming the orchestrator UI.
- Sep 7 CoS line “Hermes = entities only” is **superseded** by this lock.

---

## SeaweedFS (locked)

- Replace MinIO everywhere it still appears as *current* storage.
- Smart Meeting / agent-fleet object store: **SeaweedFS** (+ Postgres for structured data).
- Do not reintroduce MinIO as the planned store.

---

## Miami hardware (locked)

- **Threadripper** workstation with **2× Intel Arc Pro B70**
- Primary local model: **Qwen 3.8 27B**
- Treat as first-class in architecture / bandwidth / privacy story

---

## Still open (do not claim decided)

1. **Meeting spine:** Tavus CVI vs LiveKit + sovereign STT  
2. **Org / role map DNA:** Peerdom vs Maptio / Rolebase (post-v0.1 sync path)

---

## Related plan patches

- `VIDIFLOW-VIDISMART-BUSINESS-PLAN.md` — CoS lock, SeaweedFS spine, Miami §3.5, content engine §3.6, changelog 2026-09-17/22
- Drive: VIDIFLOW-SMART-FLOW-LOCK-2026-09-17 in the VidiFlow folder

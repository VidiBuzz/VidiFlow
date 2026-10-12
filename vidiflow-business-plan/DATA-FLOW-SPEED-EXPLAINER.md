# VidiFlow / VidiSmart — Data Flow & Speed Explainer

**Audience:** buyers, staff, and clients who need to *see* why one stack feels instant and another crawls.  
**Companion graphic:** `images/bandwidth-ladder-2026.png` + hero `images/hero-bandwidth-forge.png`  
**Source of truth for numbers:** `M:\code\vidismart\plans\bandwidth-lab-plan.md` (Sept 9, 2026)

---

## One sentence

**Speed is usually memory bandwidth and fit — not “how smart the model is.”** If the model fits in fast memory (HBM / GDDR / unified LPDDR), tokens stream. If it spills over PCIe or the network, speed collapses to the slowest pipe in the chain.

---

## The stages (data path)

```
1. CAPTURE / INPUT
   mic · camera · files · browser · agent tools
        │
2. INGEST & TRANSPORT
   WebRTC (LiveKit) · USB · LAN · WAN
        │
3. UNDERSTAND (STT / vision / parse)
   streaming STT · OCR · embeddings
        │
4. REASON (LLM / agents)
   weights live in VRAM / unified RAM · KV cache grows with context
        │
5. SPEAK / SHOW (TTS / avatar / UI)
   Tavus face · audio · dashboard tiles
        │
6. REMEMBER
   Postgres transcripts · SeaweedFS recordings · vector store
```

Each stage has its own clock. The **user feels the slowest stage**.

---

## Bandwidth stages (why the ladder matters)

| Stage | Typical pipe | Order of magnitude | What breaks if undersized |
|---|---|---|---|
| On-chip HBM (Rubin / B200 / H100) | GPU memory bus | **3–22 TB/s** | Rarely the public demo bottleneck; this is sovereign rack territory |
| GDDR7 (RTX 5090 / 6000 Pro) | Consumer/pro GPU | **~1.8 TB/s** | Best “desk sovereign” decode speed for 70B-class Q4 |
| Unified LPDDR5X (Mac / Strix Halo / DGX Spark) | Shared CPU+GPU pool | **256–819 GB/s** | Great capacity; slower tok/s than discrete GDDR/HBM |
| DDR5 host RAM (8-channel WRX90) | Server DIMMs | **~333–410 GB/s theoretical** | Fine for orchestration; bad as fake VRAM |
| PCIe 5.0 / 4.0 x16 | GPU↔CPU | **64 / 32 GB/s per direction** | **Offload death zone** — model that doesn’t fit VRAM crawls here |
| 100 / 10 / 1 GbE | Network | **12.5 / 1.25 / 0.125 GB/s** | Cloud round-trips & multi-node sync |

**Teaching formula (from bandwidth-lab-plan):**  
`decode tok/s ≈ effective_bandwidth × ~0.65 ÷ active_model_GB` (memory-bound). Prefill is compute-bound (TFLOPs).

Example (70B Q4 ≈ 40 GB active): RTX 5090 ~40+ tok/s · M3 Ultra ~15–18 · Strix Halo ~5–6 · DDR5 CPU offload ~2.

---

## Product-specific flows

### A) Smart Meeting (conversational AI in the room)
1. Humans join **LiveKit** room (WebRTC).  
2. Agent worker pulls audio tracks → **streaming STT** (Deepgram MVP / self-host later).  
3. Text → **LLM** (local or API) with meeting memory.  
4. Reply → **TTS** → **Tavus avatar** publishes A/V as a first-class participant.  
5. Partials + finals → Postgres; room composite → SeaweedFS via LiveKit Egress.

**Speed feel:** STT partials (<300–500 ms) + LLM + TTS + avatar render. Cloud STT/Tavus add hops; sovereign STT/LLM cuts cloud RTT but needs GPU fit (see ladder).

### B) VidiFlow HX (humans + agents on one visual OS)
1. Entity events (agent heartbeats, task state) → Mission Control / control plane.  
2. Org/people map (Peerdom DNA / Rolebase / React Flow) reads roster + project arcs.  
3. Durable work → n8n / Temporal.  
4. Runtimes (Hermes / OpenClaw / Grok Bot) are **entities**, not the UI.

**Speed feel:** UI is local WebSocket; slowdowns are agent job latency, not chart FPS.

### C) Smart Stack / Bandwidth Lab (buyer education)
Interactive ladder + configurator (planned in `vidiflow/`): swap GPU/CPU/RAM/NIC → live tok/s + bottleneck verdict. Hero art sells the metaphor; SVG ladder sells the math.

---

## Bottleneck chain (plain English)

Ordered check every time:

1. **Does it fit?** Weights + KV + headroom ≤ pool  
2. **How fast is the pool?** HBM > GDDR > LPDDR > DDR5  
3. **Compute left?** Prefill / large batch  
4. **Are we offloading?** Then you’re on **PCIe**  
5. **Crossing machines?** Then you’re on **Ethernet / IB**

Verdict examples:  
- “Your GPU runs out of *room* before *speed*.”  
- “You’re offloading — PCIe is the ceiling.”  
- “Network is fine; the model is memory-bound on LPDDR.”

---

## What we save for audits

- Ladder PNG/SVG + hero forge art in this pack  
- Hardware numbers cited in bandwidth-lab-plan.md  
- Meeting recordings/transcripts stay on **private** store (sovereign story)


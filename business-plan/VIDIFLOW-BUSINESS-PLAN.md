# VidiFlow — Business Plan

**Status:** Living master business plan. Last updated 2026-08-29.
**Companion documents:**
- `VIDIFLOW-MASTER-PLAN.md` — engineering/implementation master plan (agent runtime, control plane, voice, knowledge, storage, cloud agents). All technical decisions tracked there.
- `monetization/lexi.html` — Lexi product spec + plan (live: https://vidismart.com/monetization/lexi.html)
- `monetization/agent-plan.html` — 3D agent flow deck (live)
- `monetization/vidiflow-business.html` — this plan as a slide deck

> **Rule:** every decision, note, and work product from working sessions lands in this document so nothing is lost. Engineering detail goes in the master plan; business context lives here.

---

## 1. Executive Summary

**VidiFlow** is the command-and-control layer for the AI×human blended workforce. Small businesses do not need another chat app — they need to **see** their workforce (human and AI), **see** their workflow, and manage both from one dashboard with intention-first controls.

- **Positioning:** category of one. No competitor lets a small business orchestrate 50–100 blended agents (human + AI) from one visual dashboard with voice.
- **Model:** one shared VidiFlow infrastructure platform underlies **12 revenue engines** (from a $2M digital book to a $12M trading swarm) — every product family member is a customer, proof point, and margin contributor for the platform.
- **The line:** *"View your workforce. View your workflow. Manage it all from one command-and-control dashboard."*
- **Method:** *"Curate. Validate. Integrate."* — intention comes first; the tooling makes the path from intention to outcome manageable.
- **Flagship adjacent product:** **Lexi De-Jargon** — the browser extension that explains any term on any page in plain English and 30-second video trailers. It is simultaneously a standalone freemium product, a lead-gen engine, and the literacy layer for the whole VidiSmart ecosystem.

---

## 2. Product Vision & Positioning

### 2.1 Core thesis
HX (Human Experience / blended Human×AI workforce) is the unit of value. Businesses do not replace people with AI; they run blended teams. The unsolved problem is **management**: who is doing what, what does it cost, what does jargon mean, where is the work. VidiFlow makes the blended workforce legible and manageable.

### 2.2 Audience
Small businesses first (5–100 employees). They have the jargon problem, the tool-sprawl problem, and no IT department. The AI Training Academy (Modality & Vector) upskills their existing employees into orchestrators — existing staff already know the brand and the operation; we train them to run the VidiFlow HX dashboard.

### 2.3 Brand language
- **HX** = humans + AI blended workforce (the term itself is a demo of Lexi: hover it and it explains itself).
- Product names set in **Kumbh Sans**.
- Messaging pillars: *Curate. Validate. Integrate.* / *Intention first* / *Command-and-control, not chat*.
- **Lexi headline:** *"Understand Tech Like Never Before."*
- **Lexi campaign line:** *"Speak IT better than your tech experts."*

---

## 3. The VidiFlow Platform (what it is technically)

Full engineering detail: `VIDIFLOW-MASTER-PLAN.md`. Business-relevant summary:

| Layer | What | Status |
|---|---|---|
| **Control plane** | agent-backend (:3007, Express + Socket.IO): fleet registry, telemetry stream, command dispatch (start/stop/pause/kill), health, activity log | Mostly done |
| **Visual panel** | Glance-level dashboard: agent grid, LED status, server heat, gauges, queues, RCA. Voice-first operator interaction via LiveKit | Done (live mode); auth + drill-down pending |
| **Agent runtime (local)** | Hermes Agent profiles, one per agent role; brains = local models via LM Studio (confirmed: NOT Ollama), 64K context floor | In progress |
| **Voice** | LiveKit self-hosted + Piper/Edge TTS; operator talks to any agent, it talks back | Server done; agent pending |
| **Knowledge** | Qdrant + FastEmbed, per-tenant namespaces `kb_{tenant_id}`; on-the-fly ingestion of PDF/DOCX/TXT/MD | Pipeline done; retrieval wiring pending |
| **Storage** | SeaweedFS S3 (bucket `buzz-media`); cloud media on Cloudflare R2 = `cdn.vidi.news` | Done |
| **Cloud agents** | Cloudflare Agent OS (`@cloudflare/computer`, Durable Objects) — experimental track alongside local fleet; deployed worker verified end-to-end | Experimental track |
| **Compute** | Tier 1 now: 1× RTX 4090 (Qwen3.6-27B @ Q4, 64K ctx). Tier 2 planned: 2× RTX 6000 (96 GB) → 128–256K ctx, heavier coding fleets | Tier 1 active |

**Why local-first matters commercially:** zero per-token cost at scale, data privacy as a selling point to small businesses, and compute is capex we already own. Cloud agents burst for media workloads only.

---

## 4. The Portfolio — Twelve Revenue Engines on Shared Infrastructure

Every plan is built on shared VidiFlow infrastructure and orchestrated through the VidiFlow HX dashboard:

| # | Plan | Revenue | Priority |
|---|------|---------|----------|
| 01 | VidiFund — AI trading swarm (Fortuna Trade) | $12M | HIGH |
| 02 | VidiShop — e-commerce | $6M | HIGH |
| 03 | VidiPitch — pitch/content package | $4M | HIGH |
| 04 | Smart Channel CX — video creation platform | $3M | MED |
| 05 | VidiBuzz Media Production | $5M | MED |
| 06 | SmartDeck | $4M | MED |
| 07 | VidiSmart Consulting | $3.6M | LOW |
| 08 | VidiCity | $4M | MED |
| 09 | Vidi.NEWS | $5M | MED |
| 10 | SmartBook — digital book | $2M | LOW |
| 11 | Modality & Vector — AI Training Academy | $8M | MED |
| 12 | **Lexi De-Jargon** (new — see §6) | TBD | Active build |

Portfolio totals ≈ **$55.6M** planned revenue. Each plan page: `monetization/plan-0X-*.html`.

---

## 5. Lexi De-Jargon — Flagship Adjacent Product

*(All working-session notes consolidated here. Live spec: `monetization/lexi.html`.)*

### 5.1 The product
Hover any term on any web page → instant plain-English popup. **Click** it → an instant 30-second trailer video: a visual simulation of what the thing is, real-world use (e.g., a support rep demonstrating inbound/outbound comms for CRM), the top-5 tools ranked with why, and how it fits the rest of your stack. Save terms to **My Words** — a personal glossary with private notes, collections, and team sharing.

Whole product in one line: **see it, get it, keep it.**

### 5.2 Smart vector data — what powers every word
Every term is a **structured vector record**, not a dictionary entry:

1. **Definition layer** — plain-English core definition + structured 30-second script beats (JSON, not prose).
2. **Context variants** — per-industry meanings (factory ABC vs. sales ABC); **each variant embedded separately**.
3. **Vector index** — variants + term titles embedded into **pgvector** (Postgres). On hover, the page's local context window is embedded and nearest-neighbor matched in milliseconds → right variant every time; graceful fallback to the generic definition.
4. **Tool rankings** — top-5 with the "why" (editorial, defensible methodology page planned).
5. **Ecosystem edges** — how the term connects to other terms (CRM ← marketing feeds it leads ← support reads history); powers the stack-fit scene of every trailer.
6. **Usage signals** — what people hover, re-watch, and save feeds rankings and the term queue.

"Enhanced" = LLM-assisted drafting + human QA + continuous re-embedding as meanings drift.

### 5.3 Process for adding new terms
```
CAPTURE → DRAFT → HUMAN QA → VECTORIZE + RENDER → LIVE
```
- **Capture:** extension logs hovered-but-unknown terms (real demand signal), plus client requests and glossary-pack imports. The term queue is ordered by actual user confusion.
- **Draft:** LLM drafts the record — definition, variants, script beats, rankings, ecosystem edges.
- **Human QA:** admin console review and sign-off (React web app).
- **Vectorize + render:** variants embedded into pgvector; **Smart Channel CX** renders the trailer (motion graphics + voiceover from the structured script).
- **Live:** published to API + edge CDN. Terms are **served, not bundled** — new terms appear with zero extension update.

### 5.4 Custom libraries
Three tiers, resolved in order **personal note → company meaning → pack → master record**:

- **My Words** (personal): save any term in one click, private notes ("CRM at Meridian = the Salesforce instance sales ops owns"), collections by project/client/department, cross-device sync. Extension = capture point; full experience in the React web app.
- **Team & company glossaries** (Phase 4): company-specific meanings override generic ones; new hires stop asking what ABC means by day two. Expected strongest paid tier.
- **Glossary packs:** curated industry starter packs ("Manufacturing 100," "Contractor 50") installed in one click; community marketplace in Phase 5.

### 5.5 BYO Smart Stack integration (direct requirement)
The **Smart Stack app** (corporate-bundle deliverable: every tool a company pays for, marked kill/keep/replace, with AI-native replacements and savings) syncs to Lexi as a live **stack profile**:

- **Personalized stack fit:** every popup's "how it fits your stack" panel and every trailer's stack-fit scene renders against *their* tools — "you already run HubSpot; this is where MRR lives," "you run this on spreadsheets — replace."
- **Re-ranked recommendations:** top-5 tool rankings re-order against the stack the customer actually owns.
- **Deep links:** a stack-fit hint jumps to that tool's card in the Smart Stack app.
- **Reverse direction:** hover any tool name *inside* the Smart Stack app and Lexi de-jargons it — the app itself becomes a Lexi surface.
- **Auth:** same account; stack profile shared through the Lexi API.

### 5.6 Platform decisions (confirmed)
- **Browser extension (MV3), not native, not React Native** — runs on Chrome/Edge/Brave/Firefox → Windows/macOS/**Linux** covered automatically. Mobile: web app day one, Capacitor wrapper only if demanded.
- **Tech table:** extension core = vanilla JS; player = inline overlay, edge-cached MP4/HLS, sub-second start; context engine = pgvector + API; My Words + web app = React; admin console = React; video production = **Smart Channel CX (SmartGen)**; MCP server (`explain_term`, `dejargon_document`) in Phase 5.
- **Privacy:** only acronym + local context window goes to the API; whole-document dejargon only when deliberately pasted; recent terms cached locally.

### 5.7 Lexi build plan
| Phase | Deliverable | When |
|-------|-------------|------|
| 0 | Core hover engine — detection, context ranking, popup | ✓ Working now (live on the spec page) |
| 1 | Chrome extension beta (MV3) | ▶ In progress |
| 2 | Trailer engine v1 — Smart Channel CX, first 100 terms w/ video | Next · 2–3 wks |
| 3 | My Words — accounts, notes, sync | +1–2 wks |
| 4 | Teams & company glossaries + admin GA | +2–3 wks |
| 5 | Marketplace + MCP + Edge/Firefox builds | Backlog |

### 5.8 Lexi open questions
- Trailer length variants (15s / 30s / 60s from one storyboard — leaning yes).
- TTS voice: one consistent brand voice across all terms vs per-industry accents.
- Rankings & vendor logos: methodology page + trademark review; logo-free visuals in v1.
- Freemium line: free = unlimited hover popups + N trailers/month; paid = unlimited trailers, My Words full, team glossaries. N TBD (watching storage + CDN cost).
- Offline & privacy defaults (see §5.6).
- Company glossaries as the strongest paid tier (Phase 4).

### 5.9 Lexi work log (so nothing is lost)
- **Page:** `monetization/lexi.html` v2 (~98KB) live at `/monetization/lexi.html`; hero 11s loop (cursor → chip hover → ripple → popup → 4 flashing trailer scenes); live demo tooltip engine (10 terms: crm, erp, saas, kpi, mrr, rag, api, abc-costing, abc-sales, hx); playable simulated trailers with rAF-clock timeline (headless-throttle proof); CRM worked example with inline player; My Words; platform table; admin console; scope; 6-phase plan; WIP notes.
- **Bugs fixed:** hero popup flicker (position:fixed + clamped placement + grace window); popup trailer killed by scroll/outside-click (`trailerMode` + `isConnected` guard); inline player killed by shared timeout (`activeBox` scoping); setTimeout beats batched under headless throttling → rAF clock; mobile overflow from `.pipe` (min-width:0).
- **Assets:** 8 hand-built on-brand SVGs in `monetization/assets/images/lexi/` (scene-popup, scene-what, scene-rep, scene-rank, scene-stack, scene-mywords, scene-admin, scene-docup) — pushed live. PNG upgrade recipe + copy-paste prompts delivered to user (generator was 402/out of credits). Same-filename PNG = drop-in replacement.
- **Deploy:** SiteGround SFTP (`vidismart-main` host) → `/public_html/monetization/` (plain `.html`; legacy `/monetization-plans/` .php retired, stray `lexi.php` deleted). Always cache-bust `?v=N`.

---

## 6. Monetization Model

> **Entity structure (confirmed):** VidiSmart LLC is the only actual legal business. Every product — VidiFlow, Lexi, SmartBook, VidiFund, etc. — is a **brand under VidiSmart LLC**, each with its own brand identity and its own revenue plan. No separate entities per product.

### 6.0 Lexi — all revenue options (inventory)

| # | Stream | Model | Notes |
|---|--------|-------|-------|
| 1 | **Free tier** | Freemium acquisition | Unlimited hover popups + N trailers/month. The funnel, not the revenue. Feeds usage signals. |
| 2 | **SmartBook bundle** ✅ confirmed | $800 one-time + **$20/mo** | Book (kept current by the app) + full Lexi + personalized Smart Stack connection. ~$240/yr recurring per customer. See §6.2.1. |
| 3 | **Individual Pro** | $20/mo standalone | Same app subscription without the book — for extension power users who arrive via the free tier. |
| 4 | **Team & company glossaries** | Per-seat /mo | Company-specific meanings override generic; admin console included. Expected strongest tier (Phase 4). |
| 5 | **Glossary packs** | One-time or subscription | Curated industry packs ("Manufacturing 100," "Contractor 50") sold in-product; corporate glossary builds quoted per term. |
| 6 | **Pack marketplace** | Revenue share (e.g., 70/30) | Phase 5: community authors sell packs through Lexi; we take the cut and the traffic. |
| 7 | **Corporate Bundle inclusion** | Within $3K bundle | Lexi team deployment + glossary build inside the existing corporate-bundle deliverable — raises bundle value without new sales motion. |
| 8 | **Glossary build service** | Per-term services | We write/de-jargon a company's internal acronyms (popup + trailer) as a paid service; feeds the admin pipeline. |
| 9 | **MCP / API licensing** | Per-call / tiered | `explain_term`, `dejargon_document` exposed to other AI tools and agent platforms (Phase 5) — Lexi as infrastructure. |
| 10 | **White-label / OEM** | Per-domain license | Embed the de-jargon engine in other vendors' apps and content sites; their brand, our engine, our vector data. |
| 11 | **Academy tie-in** | Bundle with Modality & Vector | Academy students get Lexi included; extension is the training surface for orchestrators. |
| 12 | **Referral / affiliate (later)** | Per conversion | Click-through from ranked tools. Only with editorial integrity: rankings stay independent, disclosure required. |
| 13 | **Sponsored placements (later)** | CPM/flat | Only after rankings methodology is bulletproof; never let vendors buy rank position. |

Priority order: 1 → 2 → 3 (launch), 4 → 5 → 7 → 8 (grow), 6 → 9 → 10 → 11 (scale), 12 → 13 (only with guardrails).

### 6.1 Platform revenue engines
See §4 table — 12 engines ≈ $55.6M planned. Shared infrastructure means each new plan is margin-accretive: the dashboard, agents, knowledge, and media pipeline are already built.

### 6.2 Confirmed pricing decisions
- **Free:** unlimited hover popups; N video trailers/month; basic My Words.
- **Paid (individual):** unlimited trailers; full My Words; dig-deeper briefings.
- **Team/Company (Phase 4):** company glossaries, shared collections, admin console, **BYO Smart Stack integration** — expected strongest tier because it monetizes the whole Smart Stack relationship.

### 6.2.1 SmartBook + Lexi — $800 + $20/mo (CONFIRMED)
**Decision made: Lexi sells with the SmartBook — $800, then $20/month for the Lexi app.**

The logic that locks book and app together: the SmartBook is a **living book** — its terms get updated continuously, and the thing doing the updating is Lexi's living dictionary. Buying the book without the app means buying a snapshot that goes stale; the app *is* the book's update mechanism.

- **$800** — SmartBook (digital + audiobook, kept current) + Lexi app access included. One-time purchase.
- **$20/month** — Lexi subscription: full app (unlimited trailers, My Words, personalized stack fit) **and the connection to their personalized Smart Stack plans**. The subscription is what keeps their book terms, glossary, and stack profile live — this is the recurring revenue spine of the bundle.
- **Smart Stack connection (the retention hook):** the $20/mo app connects the customer to *their* personalized plans from the Smart Stack analysis — stack-fit popups, re-ranked tool recommendations, kill/keep/replace hints deep-linked into their Smart Stack app. Cancel the subscription and the personalized connection goes with it; the book stays.
- Positions between individual pricing ($49–$199 book alone, free extension tier) and the $3K Corporate Bundle. At $20/mo the bundle pays back ~$240/year recurring per customer.
- Update `plan-10-smartbook.html` and `lexi.html` pricing sections to reflect the $800 + $20/mo model.
- Free extension tier remains the acquisition funnel; the $800 + $20/mo bundle is the first paid step.

### 6.3 Strategic role of Lexi
1. **Top of funnel:** free extension = mass-market acquisition into VidiSmart.
2. **Literacy layer:** every VidiSmart product page is de-jargoned by it (dogfooding — the spec page itself is the demo).
3. **Data moat:** usage signals tell us what small businesses are confused about — feeding content, packs, and product roadmap.
4. **Smart Stack synergy:** Lexi drives Smart Stack analyses; Smart Stack profiles make Lexi personal. Each sells the other.

---

## 7. Go-to-Market

1. **Launch wedge:** Lexi free extension (Chrome Web Store) + the live spec page as the demo.
2. **Content engine:** VidiBuzz + Vidi.NEWS produce de-jargon content; every term is a SEO surface.
3. **Consulting-led:** VidiSmart Consulting runs Smart Stack analyses → installs Lexi → sells VidiFlow orchestration + Academy training.
4. **Academy (Modality & Vector):** upskill existing employees into paid orchestrators; graduates become VidiFlow champions inside customer companies.
5. **Marketplace (Phase 5):** community glossary packs + MCP server make Lexi embeddable in other AI tools.

---

## 8. Risks

| Risk | Mitigation |
|------|-----------|
| Implementation drift (Ollama vs LM Studio) | Master plan pins `http://localhost:1234/v1`; edits must comply |
| Cloudflare Agent OS preview instability | Feature-flagged; local Hermes fleet remains production runtime |
| Python 3.14 ecosystem (LlamaIndex failed, LangChain at risk) | Custom FastEmbed + Qdrant pipeline |
| CDN/storage cost of free video trailers | Freemium N capped by observed cost per active user |
| Vendor names/logos in trailers | Methodology page + trademark review; logo-free v1 |
| 64K context floor | Explicit config in LM Studio + Hermes |
| Scope sprawl across 12 plans | This document + master plan are the single sources of truth |

---

## 9. Immediate Next Steps

1. Finish Lexi extension beta (Phase 1) — hardened injection on arbitrary pages.
2. Trailer engine v1: wire admin console queue → Smart Channel CX render → CDN (first 100 terms).
3. Regenerate the 8 concept frames as PNGs from the delivered shot list (drop-in, same filenames).
4. Supabase: apply `fleet-schema.sql`; register real Hermes profiles in the fleet API.
5. BYO Smart Stack ↔ Lexi profile sync — spec the shared stack-profile API (this is a direct customer requirement, §5.5).

---

## 10. Snap Judges (added 2026-10-03)

Snap Judges is the VidiFlow name for single-pass typed decision engines (choice, score, or noul). One forward pass, no text generation. It is the fast reflex beside Hermes, not a chat model. The earlier drafts called this Jev-like. Jev and TypeSafe stay the vendor's marks.

Open-source pick from the 2026-09-24 adoption report:

- Production core: Laya
- Accuracy pilot: Kev-4B
- Browser and edge demo: SemIf
- Do not adopt jevlike, mini-jev, or jeff as the production core

Source report (still in VidiSmart plans until that folder is moved): `M:\code\vidismart\plans\jev-adoption-report-vidiflow-net-2026-09-24.md`

## Smart content & retrieval (added 2026-10-12)
VidiFlow requires smart content: embeddings and metadata on all content (including video) in a vector + keyword index, with phased pre-retrieval, retrieval, and post-retrieval, plus managed, versioned, tested skills in the harness. Vanilla RAG is not acceptable. The canonical spec covers why vanilla RAG fails, video handling, and skill management: `M:\code\VidiBot\docs\VIDIFLOW-SMART-CONTENT-RAG-AND-SKILLS-2026-10-12.md`.


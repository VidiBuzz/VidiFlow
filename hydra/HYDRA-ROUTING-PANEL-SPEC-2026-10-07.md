# VidiFlow HX — Hydra Routing Panel: Front-Panel Specification

**Written by:** VidiBot (main bot)
**Date:** 2026-10-07 14:40 EDT
**Status:** SPEC — approved direction, panel not yet built
**Deadline stated by James:** running by **5:00 PM today (2026-10-07)**
**Scope:** VidiFlow HX (SmartChannel CX) front panel. This is the operator surface for Hydra routing.

---

## 1. The ask, verbatim (James, 2026-10-07)

> *"in Vity Flow How are we gonna build a panel that shows the priority and the routing — the Hydra has got to show basically three panels right now for everything."*

> *"the smart gen content creation panel is going to have to have images and video. So it's got to show what is the workflow for that?"*

> *"and then I've got another one that's going to have to show the LLMs and the decision engines — I forget what we called them, snap judgment engines — where it's going to route stuff based on without actually looking at the text. They're just going to act as routers."*

> *"VD flow is absolutely got to have a panel."*

> *"that's where we're going to enter this stuff and we're going to have that be the connection that routes all of your data on the back end."*

> *"I need that running by 5 o'clock today."*

**What this means in one sentence:** VidiFlow HX needs one front panel with three zones — content creation, routing intelligence, and priority — that is both the *read* surface (what Hydra is doing) and the *write* surface (where James enters policy).

---

## 2. Hydra, defined (locked brand language)

**Hydra** is the Vidi AI routing system offered by VidiSmart. It connects the servers, chooses the speed, and chooses what intelligence is passed to them.

Three verbs: **connect** · **choose speed** · **choose intelligence**. Every panel below exists to make one of those three legible and editable.

---

## 3. The three panels

### PANEL 1 — SmartGen Content Creation
*"images and video... what is the workflow for that?"*

**Purpose:** show and control how content gets made — the image and video lanes.

| Zone | Shows | Editable |
|---|---|---|
| **Lane status** | Which image/video models are live, their cost per unit, their real output limits | enable/disable per lane |
| **Workflow strip** | The actual pipeline: prompt → model → size/aspect → post-process → wire-into-page → verify | step order, model per step |
| **Queue** | Jobs in flight, their state, their cost so far | retry, cancel, reorder |
| **Output ledger** | Every asset produced: file, real measured dimensions, format, byte cost, which page references it | approve, reject, re-generate |

**Hard-won facts this panel must encode** (learned 2026-10-06/07, do not re-discover):

| Model | Endpoint | Cost/img | Real max size | Notes |
|---|---|---|---|---|
| `grok-imagine` | cheaperinference | **$0.017** | **1280×720 — hard cap, ignores `size`** | cheapest; unusable for heroes |
| `gpt-image-2` | cheaperinference | ~$0.048 | honours size → 2560×1440 | used for VidiSmart hero re-export |
| `nano-banana-2` | cheaperinference | $0.0798 | **2752×1536** | Gemini lineage; measured 2026-10-07 |
| `nano-banana-pro` | cheaperinference | $0.1098 | **2752×1536** | Gemini lineage; measured 2026-10-07 |

**Generator defects the panel must handle automatically:**
- `vidi_image.py` writes **JPEG bytes under `.png` filenames** → sniff magic bytes, correct the extension.
- The grok path **silently ignores`size`** → always measure real dimensions with PIL, never trust the request.
- An **unreferenced image file is a defect** — the ledger must flag orphans.

**Cost rule (James, standing): NO generation run without explicit approval.** The panel shows a running cost estimate before the button is enabled.

---

### PANEL 2 — Routing Intelligence (the "snap judgment engines")
*"the LLMs and the decision engines... they route stuff based on without actually looking at the text — they're just going to act as routers"*

**Purpose:** show which engines are making routing decisions, and what they are deciding.

**Term:** the working name is **snap judgment engines** — fast routers that classify and dispatch *without reading or reasoning over the content*, then hand off. They are decision engines, not chat models.

| Zone | Shows | Editable |
|---|---|---|
| **Engine roster** | Each router: name, what it decides, model behind it, latency, cost | enable/disable |
| **Decision log** | Live feed: input fingerprint → chosen lane → reason code → latency | replay, override |
| **Rule table** | The routing rules: condition → target lane → priority | add/edit/disable rule |
| **Confidence** | Per decision: confidence, fallback taken, escalations to a full model | thresholds, tie-break policy |

**Design constraint:** these engines **do not read the text.** That is the point — they act on signals (embedding, size, media type, source, cost class) and dispatch. The panel must make the *signal that drove the decision* visible, not the content itself.

---

### PANEL 3 — Priority & Routing
*"a panel that shows the priority and the routing"*

**Purpose:** the top-level view — what Hydra is doing right now and why.

| Zone | Shows | Editable |
|---|---|---|
| **Priority queue** | Every in-flight job, ranked, with the reason for its rank | drag to re-prioritise |
| **Lane load** | Each server/lane: throughput, saturation, cost burn, health | pause lane, set weight |
| **Routing map** | Live graph: request → snap judgment → lane → server | inspect a hop |
| **Alerts** | Exceptions only — failures, rate limits, cost spikes, wedged ports | acknowledge, mute |

**The one rule that overrides everything:** *lead with the exception, not the inventory.* A panel that says "46 bots" while hiding "1 running · 32 idle" has failed. Health first, always.

---

## 4. It is a WRITE surface, not just a read surface

James, verbatim: *"that's where we're going to enter this stuff and we're going to have that be the connection that routes all of your data on the back end."*

This is the critical requirement. The panel is **where policy is entered**, and what is entered there is what Hydra routes by. So it needs:

1. **Entry** — forms for rules, lane weights, priority, model assignment, cost ceilings.
2. **Validation** — a rule that cannot be satisfied by any live lane must be rejected at entry, not silently dropped at runtime.
3. **Persistence** — written somewhere Hydra actually reads. A panel whose edits don't take effect is worse than no panel.
4. **Reversibility** — every change records prior state (rule 4 of the governance doc: *RESTORE*).

**Open question for James:** where does the policy file live, and does Hydra hot-reload it or need a restart?

---

## 5. Existing ground this must build on

| Asset | What it already gives us |
|---|---|
| `docs/ROUTING-AND-ASSET-GOVERNANCE.md` | The five governance rules: INVENTORY · REACHABILITY · MATCH · RESTORE · NEVER SILENT. Hydra's contract. |
| `docs/IMAGE-GENERATION-PIPELINE.md` (20 KB) | Existing image pipeline documentation |
| `docs/LTX-2.5-VIDEO-SIZES.md` | Video lane sizing |
| `fleet_dashboard.py` on `127.0.0.1:8790` | Live fleet API: `/api/fleet` (46 bots, 66 lanes), `/api/stack`, `/api/lanes`, `/api/health`. POST is hard-gated 403 (read-only). |
| `mobile/index.html` | Existing HX mobile prototype; already health-first, grouped roster, colourblind-safe status |
| `public/AGENT_CONTROL_DASHBOARD.html` (229 KB) | Prior ops interface reference |

**Known blocker:** `/api/health` returns `"checked_at": ""` and `"lanes": {"expires": "probing…"}`. It must return real values before this panel can be trusted as an operational source of truth.

---

## 6. Acceptance criteria (what "running by 5 PM" means)

A panel is only done when, measured in a real browser at 375 / 768 / 1440:

1. **Zero horizontal overflow**, zero console errors, zero failed requests.
2. **All three panels render real data** — not fixtures, not placeholders. If a source is down, the panel says so honestly (per the mobile prototype's precedent: an "unreachable" banner beats a fake green).
3. **The write path works end-to-end** — enter a rule, and verify it is actually persisted and read back.
4. **Cost is visible before spend.**
5. **Exceptions lead.** No panel opens with inventory.
6. **No fabricated values.** A number on screen is either measured or labelled as illustrative.

---

## 7. Open decisions for James

1. Where does the Hydra policy file live, and does it hot-reload?
2. Are the snap judgment engines built already, or does this panel need to define them too?
3. One panel with three zones, or three separate routes/tabs?
4. Which lanes are always-on vs on-demand (carried over from the governance doc)?
5. Does the write surface need auth, given the dashboard's POST is currently hard-gated read-only?

---

*VidiFlow HX is the visual answer to running 40+ bots. This panel is where routing policy becomes visible and editable. Both are required.*

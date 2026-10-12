# Snap Judgment Engine — Routing Mechanism + PANEL 2 Design

**Written by:** VidiBot sub-agent (research/design)
**Date:** 2026-10-07 ~14:50 EDT
**Scope:** Design of the Hydra "snap judgment engine" routing mechanism and the Routing Intelligence panel (PANEL 2) for VidiFlow HX / SmartChannel CX.
**Status:** DESIGN. This is research + design only. No code was changed; the one file written is this report.

---

## 0. TL;DR (read this first)

1. **The concept already has a name in the fleet: "Snap Judges."** Researched 2026-09-24, documented, and *specified* — but **not built**. The name James half-remembered is real and it is ours. Use **"Snap Judges"** as the internal term and **"snap judgment engines"** only as the lay description.
2. **A working router already exists on this machine** — it is the Hermes **Model Router** desktop plugin backed by `routing/policy.json` and `routing/route.py`. It already emits a decision record. PANEL 2 must **surface this**, not invent a new one.
3. **The cheapest viable signal is already the one in production: deterministic keyword/regex heuristics.** It runs in pure Python, needs no GPU, no model, no network, and **passes 12/12** on the built-in self-test (measured now). The Laya Snap Judge that `policy.json` names as the classifier is **not installed** (`ModuleNotFoundError`), so today the "snap judgment" *is* the heuristic prefilter plus fail-open. That is not a shortfall — it is the correct cheap floor.
4. **Recommendation:** **Primary = deterministic rules/heuristics** (already built, zero cost). **Fallback / accuracy upgrade = Laya** (local typed decision engine, ~1–2 GB VRAM) *or*, if Laya proves a Python-3.14 problem, **nearest-centroid over the existing local embedding service** (Qwen3-Embedding-0.6B, 1024-dim). Do **not** use a chat LLM as the router — that defeats "without looking at the text."
5. **The fleet is currently in exactly the failure state the panel must show honestly:** every named model lane is down. `/api/lanes` right now: OpenCode Zen `HTTP 403` (auth), OpenRouter `HTTP 404` (missing), Kilo `HTTP 404` (missing). The panel's whole job is to lead with that, not a green board.

---

## 1. Prior-art inventory (real files, real line refs, reuse verdict)

### 1.1 The Snap Judges concept — DOCUMENTED, SPEC-ONLY, NOT BUILT (high value, reuse the design)

| Artifact | What it holds | Reuse |
|---|---|---|
| `M:\code\vidismart\snap-judges-comparison.html` (18,888 B, 2026-09-24) | 7-way comparison of single-pass typed decision engines. Defines the term at L60: *"Team term: Snap Judges — typed `choice / score / noul` decisions in one forward pass, no text generation. System-1 reflex beside the Hermes brain (System-2)."* Head-to-head table L93–102; verdict L81–87. | **Reuse the term and the guardrails.** This is the canonical definition. |
| `M:\code\vidismart\plans\jev-adoption-report-vidiflow-net-2026-09-24.md` (19,381 B) | Full adoption report. Recommends **Laya** as production core (§0, §3); the 7-engine table (§2); and §7 the **`snap_judge` tool spec** — `POST http://127.0.0.1:3007/api/fleet/decide`, in/out shape (L90–117), guardrails (L152–157). | **Reuse §7 verbatim as the interface contract.** It matches the "router, not a chat model" idea exactly. |
| `M:\code\vidismart\deploy-snap-judges.txt` | 3-line SFTP script to publish the comparison page. | Historical; ignore. |
| `M:\code\vidismart\landing\index.html:882` | Public copy: *"Vidi AI — Typed decision models — the Snap Judge pattern, routed by Hydra."* Confirms the Snap Judge ↔ Vidi AI ↔ Hydra link is already in the brand language. | Reuse as the label James expects on screen. |

**Verdict:** the *concept* is prior art and is well-specified. The *implementation* (`laya-serve`, `/api/fleet/decide`) does **not exist**: a content search for `laya-serve|api/fleet/decide|snap_judge|fleet:snap-judged` across `M:\code\vidismart` returned **only `snap-judges-comparison.html`**. The Jev report says so itself at L78–80: *"Status: spec only. No changes made to `agent-backend/routes/fleet.js` …"*. And `agent-backend/routes/fleet.js` has **no `/decide` route** (grep for `decide` in that file: none).

### 1.2 The Model Router plugin — BUILT, LIVE ON THIS MACHINE, THE REAL PRIOR ART (reuse this)

This is the "Model Router plugin scoped under vidismart (Hydra)" from the task. It lives in the **Hermes desktop plugin** tree, not under `M:\code\vidismart`:

| File | Facts (verified by reading) | Reuse |
|---|---|---|
| `C:\Users\James\AppData\Local\hermes\desktop-plugins\router\plugin.js` (15,637 B, 292 lines) | Header L1–11: *"Hermes Model Router — desktop plugin pane. Reads `…\hermes\routing\policy.json` and renders all routes grouped by the four destination kinds: tool > skill > agent expertise (SME) > LLM model."* `ID='router'` (L16). Embeds a `ROUTES` snapshot (L23). Has a **heuristic test/preview function** (`Tester`, L133–201) and a live pane registered right-side at 320px (L278–282). Header text on screen (L216): *"… local `policy.json` · **not wired into dispatch yet**."* | **This is PANEL 2's seed.** Reuse the route list, the 4-kind framing, and the heuristic preview. |
| `C:\Users\James\AppData\Local\hermes\desktop-plugins\router\plugin-data.json` (13,102 B) | Machine copy of the policy. `classifier` block L4–12: `engine: laya`, `mode: choice`, `threshold_rule: "gate on answer_confidence, NEVER raw confidence (measured 0.289 conf vs 0.717 answer_conf on same answer)"`, `fallback: heuristics`, `fail_open: true`. | **Reuse the classifier contract.** |
| `C:\Users\James\AppData\Local\hermes\desktop-plugins\router\preview.html` | Static preview of the pane. | Reuse for layout. |

### 1.3 The routing policy + engine — BUILT, THE SOURCE OF TRUTH (reuse this; it is the panel's write target)

| File | Facts | Reuse |
|---|---|---|
| `C:\Users\James\AppData\Local\hermes\routing\policy.json` (14,343 B, 2026-10-04) | Top-level keys: `$comment, version, classifier, rotation, routes(30), tiers, default, destination_kinds, skill_root, skill_inventory, tie_break`. `destination_kinds` precedence: *"tool > skill > agent expertise (SME) > LLM model. Never send a media task to an LLM."* `default`: unmatched → `llm` / `mid` tier, fail-open. `tie_break`: *"highest priority wins; then longest keyword; then hit count. Medical/legal are highest so safety routes cannot be stolen by topical keywords."* `tiers`: cheap / mid / strong. `rotation.order`: 5 slots pinning free providers to bots. | **This is the panel's editable rule table and its persistence target.** |
| `C:\Users\James\AppData\Local\hermes\routing\route.py` (8,067 B, 207 lines) | Two-stage router. `_get_judge()` L49 lazy-imports **Laya**; `classify_llm()` L70 calls `judge.decide(...choice...)`; `classify_heuristics()` L98 is the deterministic fallback; `route()` L132 emits a **decision record** (L150–166: `request, intent, answer_confidence, decided_by, destination, destination_kind_label, fail_open`). `MIN_ANSWER_CONFIDENCE = 0.60` (L43). `self_test()` L185. | **Reuse wholesale.** The record shape in §3 is a superset of what this already prints. |
| `C:\Users\James\AppData\Local\hermes\routing\routes.view.json`, `tools\`, `.venv\` | Rendered route view + tooling + a venv. | Reuse `tools\` for the snapshot regenerator. |

**Measured now (I ran it):** `python route.py --self-test` → **12/12 heuristic expectations met**. `python -c "import laya"` → **ModuleNotFoundError**. So the shipped engine today runs **heuristics only, judge-down**, and passes its own cases.

### 1.4 Other routing prior art in the fleet

| Artifact | Facts | Verdict |
|---|---|---|
| `M:\code\VidiFlow\out\fleet\fleet_dashboard.py` (22,767 B) | `routing_view()` **L373–392** reads `%LOCALAPPDATA%\hermes\config.yaml` (`model.default/provider/base_url/api_mode`, `fallback_providers[]`, `custom_providers[]`) → exposed as `/api/stack.routing`. `lanes()` **L234** probes the model lanes. `fast_snapshot()` L442. | **Reuse** as the panel's lane/routing data feed. |
| Live `http://127.0.0.1:8790/api/stack` | Real `routing` block (primary `ci-haiku-45` / `custom:cheaperinference`; fallbacks `[{openrouter, deepseek/deepseek-v4.1-flash}]`; custom `cheaperinference` → `https://api.cheaperinference.com/v1`). | Reuse. |
| `M:\code\vidismart\agent-backend\routes\org.js:562` and `…\data\org_entities.json:107–116` | A fleet entity named **"Relay"**, title **"Model Router"**, `fleet_profile_id: 'router'`, function *"Token-aware routing across model slots with failover."* | Reuse as the org-chart label for the engine on screen. |
| `M:\code\vidismart\vidismart-master-plan.html:648` | Conceived bot **"ORACLE-01 / Model Router — Picks the cheapest model that can do the job — free OpenRouter tier first. Owns: model selection (Qwen3-Max/GLM-5), fallbacks, cost tracking, rate budgets."** | Reuse the copy; it is the product intent in one line. |
| `C:\…\hermes-agent\plugin-catalog\jev-*.yaml` (jev-model-router, jev-effort-router, jev-judge, jev-skill-router, …) | **Community** catalog entries (e.g. `jev-model-router` by *Pinutss*, tier `community`, *"Registers no Hermes tools or hooks"*). Not ours, not installed, not needed. | Reference only. |
| `M:\code\vidismart\.kilo\plans\1789542399368-install-9router.md`, `…-9router-provider.md` | Local **9Router** AI-provider gateway at `localhost:20128` (~450-model catalog), wired into Kilo Code. | Reference; **currently down** (see §5/§6). |

**Bottom line:** the fleet already has (a) a named concept, (b) a policy file, (c) a working router engine, (d) a desktop panel that renders the policy but is "**not wired into dispatch yet**," and (e) a dashboard lane feed. **PANEL 2 is the wiring-together of these, not a greenfield build.**

---

## 2. The cheapest viable signal (with real numbers)

A snap judgment must be far cheaper than the model call it routes. Concrete options, cheapest first:

| Option | Mechanism | Measured / literal cost | Latency | Reads the text? | Status here |
|---|---|---|---|---|---|
| **(a) Deterministic rules on metadata + keywords** | Regex/word-boundary match on `policy.routes[].match`, scored by `(priority, longest_kw, hits)` — `route.py:98–129` | **$0**, no GPU, no network, no model, pure stdlib Python | **sub-millisecond** (dict/`set` ops) | No (token match only) | **BUILT & PASSING 12/12** |
| **(d) Keyword/regex prefilter** | Same family as (a); the media/metadata branch (`media.image`, `media.video`, `size`, `source app`) is just a rule row | **$0** | sub-ms | No | Partially built (rules exist; media-metadata keys need adding) |
| **(b) Tiny embedding + nearest-centroid** | `Qwen3-Embedding-0.6B`, 1024-dim, L2-normalized (cosine = dot) — `embedding_service/README.md` L12–14, `service.py:179–185` | ~**1.2 GB VRAM** (measured peak, README L179: 1203 MB); model already downloaded (1.2 GB local snapshot) | README: cold load **12.5 s** once (lazy); per-query on 4090 order of **~10–40 ms** (service not up now to re-measure) | No (vector only; instruction prefix supported) | Service exists (`127.0.0.1:8799`), **not running now** (probe → `000`) |
| **(c) Small/cheap LLM as classifier** | Full chat completion (e.g. `ci-haiku-45` via cheaperinference, or `space-bunny-free`) with constrained output | **Per-token $ + hundreds of ms**; a whole generation to make a routing decision | order of **100s of ms–seconds** | **Yes** (it generates) | Available via `/api/stack.routing` primary |

**Why (a) is the right primary.** It already exists, it is free, it is deterministic (auditable — same input always → same lane, which a panel can trust), and it answers James's exact framing: *"route stuff based on without actually looking at the text."* The engine self-test (I ran it just now) proves it works: 12/12.

**Why Laya/embedding is the right *fallback*, not the primary.** `policy.json` names **Laya** (`convaiinnovations/laya`) as the classifier, and the Jev report picks it for good reasons (33 ms, ~1–2 GB, Apache-2.0, typed `choice/score/noul`, Jev-wire server, hooks). But: **Laya is not installed** (`ModuleNotFoundError`), and the checkpoint's own temps are uncalibrated (`route.py:20–22`), so it can't be trusted to auto-act until `fit_temperatures()` runs on our labels. If Laya proves a **Python 3.14 / torch-wheel** problem (the Jev report flags this repeatedly — §5 L71), fall back to **nearest-centroid over the local Qwen3-Embedding service**: no calibration story needed, model already on disk, and it *still* doesn't read text for meaning — it only compares vectors.

**Recommendation.** Primary lane-selection signal = **deterministic rules (a)**. Accuracy escalation = **Laya (b/c)**, gated on `answer_confidence ≥ 0.60` and `decided_by == "laya"`; if Laya is down or uncalibrated, **fall back to (a) and mark the decision `unjudged`** — exactly the `fail_open: true` behavior `route.py:135–141` already implements. **Never** route with a chat LLM (option c) as the decision itself; it is slower and costlier than the thing it routes and it violates the "doesn't read the text" constraint.

---

## 3. The decision record (JSON schema)

This extends the record `route.py:150–166` already emits. Minimal, implementable, human-inspectable. **Every field shown on PANEL 2 comes from here.**

```jsonc
{
  "decision_id": "dj_01J9F...",          // ULID; unique per routing decision
  "at": "2026-10-07T14:52:31-04:00",     // ISO-8601, tz-aware (route.py uses _stamp())
  "schema": "hydra.route.decision/v1",

  "input": {                              // the FINGERPRINT — never the content
    "hash": "sha256:9f2c…",              // hash of the raw request bytes
    "kind": "text",                      // text | image | video | audio
    "bytes": 1834,
    "media_type": "text/plain",
    "source": "smartchannel_cx",         // calling app / profile
    "requested_output": null             // if the caller named one (image/video/pdf…)
  },

  "signal": {                             // THE THING THAT DROVE IT — shown, not the text
    "engine": "heuristics",              // heuristics | laya | embedding-centroid
    "matched": ["thumbnail", "headline"],// keywords hit (heuristics) — or empty
    "vector_nearest": null,              // {lane:"image.generate", cosine:0.71} when embedding
    "longest_match": 9,
    "hit_count": 2
  },

  "lane": "image.generate",              // chosen intent id (or "default")
  "destination": { "kind": "tool", "target": "media.image" },

  "reason_code": "rule.high_confidence", // see table below
  "confidence": 1.0,                     // answer_confidence (0..1) or null if unjudged
  "conf_threshold": 0.60,                // active MIN_ANSWER_CONFIDENCE

  "latency_ms": 0.4,                     // time to decide (NOT to run the lane)
  "fallback_taken": false,               // true if a lower-priority lane was used
  "escalated_to_model": false,           // true if it was handed to a full LLM after routing
  "judge_state": "judge_down",           // up | judge_down | uncalibrated
  "fail_open": true
}
```

**Reason codes** (closed set — the panel filters/groups on these):

| reason_code | Meaning |
|---|---|
| `rule.high_confidence` | A rule matched; `confidence ≥ threshold`. |
| `rule.low_confidence` | A rule matched but `confidence < threshold`. → surface, don't auto-act. |
| `judge.chose` | Laya returned a `choice` with `answer_confidence ≥ threshold`. |
| `judge.low_confidence` | Laya answered but below threshold → fell back. |
| `judge.down` | Laya unavailable (`ModuleNotFoundError`/timeout/error) → heuristics used. |
| `no_match.default` | No rule matched → `default` lane (mid LLM tier), fail-open. |
| `tie_break.priority` | Multiple rules matched; resolved by priority → longest kw → hits. |
| `media.never_llm` | A media route matched; guardrail fires (`warning: "media task - must NOT go to a text LLM"`). |
| `lane.unreachable` | Chosen lane is configured but its provider is not connected (see §5). |

This is a **superset** of `route.py`'s current output, so wiring it is additive: add `decision_id`, `at`, `input.*`, `signal.*`, `reason_code`, `latency_ms`, `fallback_taken`, `escalated_to_model`, `judge_state`.

---

## 4. Failure modes and how PANEL 2 surfaces each (no faking health)

The governing rule from `docs/ROUTING-AND-ASSET-GOVERNANCE.md`: **INVENTORY · REACHABILITY · MATCH · RESTORE · NEVER SILENT**, and *"configured != enabled != connected."* The panel must render **state**, never assume it.

| # | Failure | What it looks like in data | How PANEL 2 shows it (never faked) |
|---|---|---|---|
| 1 | **Low confidence** | `answer_confidence < conf_threshold` (e.g. `voice.transcribe` @ 0.89 vs a 0.60 floor is fine; a 0.42 is not); `reason_code = *.low_confidence` | Decision row gets an amber **"unjudged / low-conf 0.42"** chip and is moved to the **Review** sub-list; never auto-acted. The threshold slider is editable and shows the *current* `MIN_ANSWER_CONFIDENCE`. |
| 2 | **No matching lane** | `best = None` → `lane = "default"`, `reason_code = no_match.default` | Shown as the **`default` (mid LLM tier)** lane with a neutral chip *"no rule matched → default"*, not as an error. Grouped under "Unmatched," counted. |
| 3 | **All lanes saturated / down** | `/api/lanes` returns every lane `ok:false` (right now: zen `HTTP 403`, openrouter `HTTP 404`, kilo `HTTP 404`) | **Exceptions lead.** A red banner at the top of PANEL 2: *"0/3 model lanes reachable — routing is degraded, fail-open active."* The lane strip shows the raw probed state (`auth` / `missing` / `down`), not a green dot. |
| 4 | **Configured-but-not-reachable** (the Cloudflare-MCP burn) | A lane/skill/engine exists in config with no live endpoint: **9router** in `kilo.json` but `:20128` → `000`; **embedding service** on disk but `:8799` → `000`; **Laya** named as classifier but `ModuleNotFoundError`; **OpenRouter** fallback but `HTTP 404` | Each **engine roster row** carries a **tri-state reachability pill**: `configured` ▸ `enabled` ▸ `connected`. A row can read "configured · enabled · **NOT connected**" in red. The panel **never** renders a lane green unless a probe returned `ok:true` *this session*, and always shows the probe timestamp + raw code (`HTTP 404`). |
| 5 | **Judge down / uncalibrated** | `judge_state = judge_down` or `uncalibrated`; `decided_by = "heuristics (fallback)"` | Roster row for Laya: **"not installed — heuristics carrying routing"** (this is true today). Decision rows tag `judge-down`. No green. |

**Never fabricate:** every badge traces to a probe result or a field in the decision record. An `ok:null` probe (the pending state `fleet_dashboard.py` already models, `lanes()` L250–265) renders as **"probing…"**, never as up or down — the same discipline the dashboard already enforces.

---

## 5. The real lane roster I could verify

All read live (READ-ONLY) at ~14:41–14:50 EDT. Anything not probed is marked so.

### 5.1 Model lanes — `/api/lanes` (live probe, `probed_at 2026-10-07T14:39–14:41`)

| Lane | Label | Model | `ok` | State | Note |
|---|---|---|---|---|---|
| `zen` | OpenCode Zen | `space-bunny-free` | **false** | `auth` | HTTP 403 |
| `openrouter` | OpenRouter | `stealth/space-bunny-alpha` | **false** | `missing` | HTTP 404 |
| `kilo` | Kilo Gateway | `stealth/space-bunny-alpha` | **false** | `missing` | HTTP 404 |

Expiry (computed from the clock, `fleet_dashboard.py:71`): *"Space Bunny Alpha retired 2026-10-05, 2d ago (Kilo catalog)"* — `state: retired`, `days_remaining: -2`. **Every named lane is down.**

### 5.2 The routing chain — `/api/stack.routing` (live, from `config.yaml`)

- **Primary:** `model = ci-haiku-45`, `provider = custom:cheaperinference`, `api_mode = chat_completions`.
- **Fallback:** `provider = openrouter`, `model = deepseek/deepseek-v4.1-flash`.
- **Custom provider:** `cheaperinference` → `base_url https://api.cheaperinference.com/v1`, `key_env = CHEAPER_INFERENCE_API_KEY`.

This confirms the task's premise: **cheaperinference is the primary route; OpenRouter is the fallback.** The free `space-bunny-free` lane is *via OpenCode Zen* (not OpenCode per se) — **currently `auth` (HTTP 403)**, i.e. the free lane is not usable right now either.

### 5.3 Bots / profiles — `/api/fleet` (46 bots, 66 lanes, 14 profiles)

Profiles and their pinned lane (14 profiles, all `auth: true`):

| Lane used | Profiles |
|---|---|
| `ci-haiku-45` / `custom:cheaperinference` | `vidibot` (125 execs), `vidicity`, `vidismart` |
| `space-bunny-free` / `opencode-zen` | all 11 others (airpmd, hermes_gateway, isovoice, lex_lexicon, smartchannel_cx, vidibio, vidiflow, vidimail_vidiblast, vidinews, vidismart_community, viditwin) |

### 5.4 Other endpoints probed (for honesty)

| Endpoint | Result |
|---|---|
| Smart Channel CX `:8765/` | **200** (up) |
| 9Router `:20128/v1/models` | **000** (down) — configured in `kilo.json`, not running |
| Embedding service `:8799/health` | **000** (down) — exists on disk, not running |

### 5.5 What I could **not** verify (no API, would need a POST/live run I was told not to do)

- **cheaperinference reachability:** `/api/stack.routing` *declares* it primary, but no lane probe hits it (the probe only covers zen/openrouter/kilo). I could not confirm ci-haiku-45 answers without issuing a generation. **Marked unverified.**
- **Space-bunny-free via opencode:** confirmed only as `zen` = HTTP 403. Whether a working free tier exists on another provider slot is unverified.
- Actual per-request latency of the embedding service on the 4090 (service down at check time; only the README's verified numbers available).

---

## 6. PANEL 2 — Routing Intelligence: layout design

**Prime directive:** make **the signal that drove the decision** visible, **not the content**. This is a router that does not read. Every row shows *why it chose a lane*, never *what the text said*.

**Layout — four stacked zones in one scroll, exception-first (health banner pinned at top).**

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  PANEL 2 · ROUTING INTELLIGENCE                [ ⚠ 0/3 lanes reachable ]  ⟳     │  ← Z0 LEAD
│  fail-open ARMED · judge: NOT INSTALLED (heuristics carrying) · 30 rules        │
├───────────────────────────────────────────────────────────────────────────────┤
│  Z1 · ENGINE ROSTER                                            [ + add engine ] │
│  ┌─────────────────┬──────────────────┬───────────┬──────────┬───────────────┐ │
│  │ Engine          │ Decides          │ Latency p50│ Cost/req │ REACHABILITY  │ │
│  ├─────────────────┼──────────────────┼───────────┼──────────┼───────────────┤ │
│  │ Heuristics (a)  │ intent→lane      │ 0.4 ms    │ $0       │ ● connected   │ │
│  │ Laya Snap Judge │ intent→lane      │ —         │ local    │ ○ configured  │ │  ← "not installed"
│  │ Embed-centroid  │ intent→lane      │ (down)    │ local    │ ○ configured  │ │
│  │ Relay (router)  │ token routing    │ —         │ $0.001   │ ● connected   │ │
│  └─────────────────┴──────────────────┴───────────┴──────────┴───────────────┘ │
│  each row expandable → enable/disable · install · set threshold · where it reads│
├───────────────────────────────────────────────────────────────────────────────┤
│  Z2 · DECISION LOG (live)                        filter: all ▾  unjudged (3) ▾ │
│  ┌──────────┬─────────────────┬────────────┬──────────┬───────┬─────────┬─────┐│
│  │ time     │ FINGERPRINT     │ SIGNAL     │ LANE     │ CONC  │ REASON  │ ms  ││  ← signal, not text
│  ├──────────┼─────────────────┼────────────┼──────────┼───────┼─────────┼─────┤│
│  │ 14:52:31 │ a1f9·1.8KB·text │ ⟦thumbnail,│ image.   │ 1.00  │ rule.hi │ 0.4 ││
│  │          │ src=cx          │  headline⟧  │ generate │       │  ⚑media │     ││
│  │ 14:52:29 │ 7b2c·0.9KB·text │ ⟦nothing⟧  │ default  │ —     │ no_match│ 0.3 ││
│  │ 14:52:24 │ 0d11·3.2KB·text │ ⟦contract, │ legal    │ 0.94  │ rule.hi │ 0.5 ││
│  │          │                 │  liability⟧ │ →airpmd  │       │  ⚠risk  │     │
│  └──────────┴─────────────────┴────────────┴──────────┴───────┴─────────┴─────┘│
│  click a row → drawer: full decision record (§3) · [Replay] [Override lane]     │
│  ▸ NO CONTENT IS EVER RENDERED — only hash, kind, bytes, source, matched signal │
├───────────────────────────────────────────────────────────────────────────────┤
│  Z3 · RULE TABLE (editable → writes routing/policy.json)      [ + add rule ]    │
│  ┌────────────┬───────────┬──────────────────┬────────┬──────┬────────────────┐ │
│  │ rule id    │ kind      │ → destination    │ prio   │ risk │ match keywords │ │
│  ├────────────┼───────────┼──────────────────┼────────┼──────┼────────────────┤ │
│  │ image.gen  │ tool      │ media.image      │ 50     │      │ image,thumb…   │ │
│  │ legal      │ agent     │ airpmd           │ 95     │ HIGH │ legal,contract │ │
│  │ research…  │ skill     │ research/grounded│ 90     │      │ cite,source…   │ │
│  └────────────┴───────────┴──────────────────┴────────┴──────┴────────────────┘ │
│  validation on entry: a rule whose target lane is unreachable → REJECT (gov. §) │
│  every edit records prior state (governance rule RESTORE) · [Undo last change]  │
├───────────────────────────────────────────────────────────────────────────────┤
│  Z4 · CONFIDENCE & TIE-BREAK                                                    │
│  threshold slider (answer_confidence ≥ 0.60)  ▓▓▓▓▓▓░░░░ 0.60                  │
│  tie-break order (read-only from policy): priority ▸ longest keyword ▸ hit count│
│  last calibration: never run · judge temps: UNCALIBRATED → auto-act DISABLED    │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Zone-by-zone, what each shows and what is editable:**

| Zone | Shows | Editable | Data source (real) |
|---|---|---|---|
| **Z0 Lead banner** | Exception-first health: lanes reachable `N/3`, fail-open state, judge state, rule count. | nothing (read-only) | `/api/lanes` + `route.py` judge state |
| **Z1 Engine roster** | One row per decision engine: name, what it decides, p50 latency, cost/req, **tri-state reachability pill**, threshold. | enable/disable · install · set threshold | `policy.classifier`, `routing/route.py`, live probes |
| **Z2 Decision log** | Live feed, **signal-first**: time, fingerprint (hash·bytes·kind·source), **matched signal ⟦…⟧ or vector-nearest**, lane, confidence, reason_code, latency. Drawer = full §3 record. | replay a decision · override its lane | decision records (§3) |
| **Z3 Rule table** | All 30 rules: id, kind, destination, priority, risk, match keywords. | add / edit / disable a rule; keyword list | `routing/policy.json` (`write target`) |
| **Z4 Confidence & tie-break** | Threshold, tie-break order, calibration status. | threshold slider | `route.py:43`, `policy.tie_break` |

**Design constraints honored (from `HYDRA-ROUTING-PANEL-SPEC` §6 / governance):**
- **Exceptions lead** — Z0 is a red banner whenever any lane is unreachable (true today).
- **No fabricated values** — every pill carries a probe state + timestamp; `ok:null` renders "probing…".
- **Configured ≠ enabled ≠ connected** — the reachability pill is a 3-state ladder, and "not installed" is a first-class state (Laya is in it right now).
- **Write path** — edits persist to `routing/policy.json` (the file `route.py` and the desktop plugin already read); a rule pointing at an unreachable lane is rejected at entry.
- **Signal, not content** — Z2 renders a hash, a byte count, a source, and the matched keywords/vector — **never** the request text. That is the entire point of a router that does not read.

---

## 7. What I could NOT determine, and why

1. **Whether Laya installs on Python 3.14.** `import laya` → `ModuleNotFoundError`, and the Jev report flags "no torch wheels for 3.14" as the recurring blocker (§5 L71). I did not attempt an install (design-only task). **Unverified — this gates the "accuracy upgrade" branch.**
2. **cheaperinference reachability / real latency.** `/api/stack.routing` *declares* it primary, but no lane probe covers it and I did not issue a generation. **Unverified.**
3. **Embedding-service per-query latency on the 4090.** The service was **down** (`:8799` → `000`) at check time; only the README's verified cold-load (12.5 s) and cosine separation (+0.3487) numbers exist. Per-query figure is an estimate.
4. **Whether the desktop Model Router plugin shares state with the fleet dashboard.** They read the *same* `routing/policy.json`, but the plugin embeds a *snapshot* (`plugin.js:18–23`, regenerated by `tools/sync-router-snapshot.py`) rather than fetching live. Whether a PANEL 2 edit is seen by the plugin without a reload is **not established**.
5. **Whether `route.py` is invoked by anything at runtime.** `policy.json.rotation.note` says *"Hermes does not call route.py yet; this is the roster the bots are pinned to,"* and the plugin header says *"not wired into dispatch yet."* So the router is **built but idle** — the "write surface actually routes" acceptance criterion is **not yet met** and needs a wiring task.
6. **Exact per-request cost of `ci-haiku-45`.** Not exposed by any endpoint I read. **Unverified.**

---

## 8. One-line build path (for the 5 PM deadline)

The engine exists (`route.py`) and the policy exists (`policy.json`); the panel data exists (`/api/lanes`, `/api/stack.routing`). PANEL 2 = **(1)** upgrade `route.py`'s output to the §3 record, **(2)** expose it on a read-only endpoint (mirror `/api/lanes`), **(3)** render Z0–Z4 as above with the reachability tri-state, **(4)** point Z3's save at `routing/policy.json` with prior-state capture. The "not wired into dispatch yet" gap (item 5 above) is the one honest open risk.

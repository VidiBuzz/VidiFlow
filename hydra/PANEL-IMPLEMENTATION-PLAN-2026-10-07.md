# VidiFlow HX — Hydra Routing Panel: Implementation Plan

**Written by:** research sub-agent (VidiBot)
**Date:** 2026-10-07 ~14:50 EDT
**Inputs:** `HYDRA-ROUTING-PANEL-SPEC-2026-10-07.md`, `ROUTING-AND-ASSET-GOVERNANCE.md`, live reads of `M:\code\VidiBot\vidiflow-hx`, `M:\code\VidiFlow\out\fleet`, and a live fetch of `127.0.0.1:8790`.
**Deadline:** panel running by **17:00 today (~2h10m from writing).**
**Status:** research + plan. No files were built or changed except this report.

Every size, path, line number and JSON field below was read live. Where I could not confirm something, it is listed in §8.

---

## 0. Headline findings (read these even if nothing else)

1. **There is NO server-side fleet fetch in the Next app, and NO proxy route.** The only code anywhere that talks to `127.0.0.1:8790` is the *separate* Python hub `mobile/server.py:40` — it is not a Next route and does not run inside the app. The Next app's "live" data (`src/lib/live.ts`, 87 lines) is a **client-side `setInterval` mock** (`live.ts:36` `window.setInterval`), not a real fetch. A new proxy route must be created.
2. **There is NO Hydra routing-policy file. This is the biggest finding.** `fleet_dashboard.py:373` `routing_view()` reads only `%LOCALAPPDATA%\hermes\config.yaml` — `model`, `fallback_providers`, `custom_providers` — i.e. **model/provider routing, not task routing.** A grep of `config.yaml` for `hydra|routing|snap|priority|lane` returned **zero** hits, and a grep of `src/` for `hydra_policy|routing_policy|policy.json` returned **zero**. The write surface the spec asks for (§4 of the spec) has **no target to write to today.** It must be invented (see §6).
3. **The documented `/api/health` defect appears RESOLVED as of this reading.** A live fetch at 14:41:35 returned `"checked_at": "2026-10-07T14:41:35-04:00"` and a real `lanes.expires` string — not `""` / `"probing…"`. The dashboard source shows the fix is intentional (`fleet_dashboard.py:442-472`, docstring: *"The stub used to answer `checked_at: ""` and `expires: probing…` … Now `checked_at` is always the real request time"*). **Do not build against the old defect; do keep the honest-fallback logic anyway.**
3. **The snap judgment engines do not exist.** `public/snap-judges/index.html` is a marketing page naming them (Laya / Kev-4B / SemIf) and states outright they are "not wired into Hermes" (line 65: *"none of them is wired into Hermes"*). PANEL 2 has no live decision log, rule table, or confidence feed to read from.
4. **The single most reusable live asset is `mobile/index.html`** (1373 lines, 75,820 B) — it is already health-first, colourblind-safe, and fetches real data through a proxy. It is the visual and logic precedent the new panel should copy.
5. **`@xyflow/react` (React Flow) and `framer-motion` are already dependencies** (`package.json`), so the routing-map and motion zones need no new install.

---

## 1. Reuse inventory (real files, real sizes, verdict)

Measured with `wc`/`ls`/`find` on `M:\code\VidiBot\vidiflow-hx` on 2026-10-07.

### 1a. Next.js app (`src/`)

| File | Bytes | Lines | What it is (read) | Verdict |
|---|---|---|---|---|
| `src/app/hx/page.tsx` | 4,859 | 119 | Mission Board; calls `useLiveMission()` mock; carries a DEMO DATA badge | **Pattern only** — reuse layout shell idea, not data |
| `src/app/hx/layout.tsx` | 883 | 24 | amber "DEMO DATA · mock tick" banner | **Pattern** — reuse the honest-banner idea |
| `src/lib/live.ts` | 2,824 | 87 | client-side mock ticker (`useLiveMission`, `setInterval` @ `live.ts:36`) | **Dead end for live data** — replace |
| `src/lib/status.ts` | 845 | 40 | `statusColor()` colourblind-safe palette; `runtimeLabel()`; `kindBadge()` | **Reusable now** — adopt for panel status |
| `src/components/RuntimeMarks.tsx` | 2,974 | — | runtime identity marks | **Reusable** in the header |
| `src/components/hx/EntityRoster.tsx` | 4,862 | — | grouped, filterable roster of entities | **Refactorable** — closes to the bot/lane roster PANEL 3 needs |
| `src/components/hx/EntityDrawer.tsx` | 4,926 | — | side drawer for one entity | **Reusable** for "inspect a hop" / lane detail |
| `src/components/hx/MissionCanvas.tsx` | 7,556 | — | React Flow canvas | **Refactorable** → PANEL 3 routing map |
| `src/components/hx/nodes.tsx` | 7,555 | — | custom React Flow nodes | **Reusable** node styling |
| `src/components/hx/ProgressStream.tsx` | 4,558 | — | heartbeat feed strip | **Refactorable** → PANEL 2 decision log |
| `src/components/hx/HitlTray.tsx` | 4,256 | — | HITL gate tray | **Refactorable** → approvals (cost approval) |
| `src/components/Nav.tsx` | 9,411 | — | primary nav; route list at lines 16-26 | **Must edit** to add the panel route |
| `src/middleware.ts` | 910 | 27 | path normalisation + `/lex` redirect | **No change needed** — no API proxy lives here |
| `src/app/api/` | — | — | **does not exist** | create it (§5) |

**Fetches inside `src/`:** only two, both to a static file, not the fleet API — `src/components/org/OrgWall.tsx:144` and `src/components/swarm/SwarmBoard.tsx:88`, both `fetch("/demo/swarm-status.json")`. There is **no fetch to `8790` anywhere in `src/`.**

### 1b. `public/` legacy HTML

| File | Bytes | Real content (read the head) | Verdict |
|---|---|---|---|
| `public/AGENT_CONTROL_DASHBOARD.html` | 229,143 | `<title>VidiSmart Control Center v2</title>`, Inter font, blue/dark token set | **Dead end** — different design system, one 229 KB file, no live binding; do not import |
| `public/AGENT_BRIDGE.html` | 124,181 | "VidiSmart Agent Bridge — Gen UI Flagship", holographic theme | **Dead end** (showcase) |
| `public/HERMES-FLEET.html` | 20,570 | Title *"Grok Bot Fleet → Hermes Agent — Migration Master Plan"* — a **light-theme report document**, not an app | **Dead end** (it is prose, not a panel) |
| `public/vidiflow-force-graph.html` | 11,009 | standalone force-graph page | **Refactorable** — prototype for the routing map, but rebuild in React Flow |
| `public/snap-judges/index.html` | 7,222 (99 lines) + `assets/` | "Snap Judges" page: Laya (production core), Kev-4B (pilot), SemIf (browser demo) | **Reusable as vocabulary/data source only** — engines not wired (line 65) |
| `mobile/index.html` | 75,820 (1,373 lines) | health-first HX mobile: `#v-fleet`, `#v-pulse`, `#v-lanes`, `#v-send`, `#v-set` views; real fetch + honest source chips | **Primary precedent — copy the pattern** |
| `mobile/server.py` | 14,701 (351 lines) | static host **+ fleet proxy** to `DASH=http://127.0.0.1:8790` (`server.py:40`); tiers live→probed→snapshot | **Reuse as the spec for the new Next proxy** (§5) |
| `mobile/img/_genreport.json` | 1,061 (50 lines) | **the only real generation ledger** — see §4 | **Reuse as PANEL 1 ledger schema** |

`mobile/` is a **separate bundle** served by `server.py` on 8811; it is not part of the Next build. Treat it as a reference implementation, not an import.

---

## 2. Exact file list to create / modify

### Create

| Path | Purpose |
|---|---|
| `src/app/api/hydra/route.ts` | Next route handler. Server-side fetch of the four `8790` endpoints, tiered live→snapshot exactly like `mobile/server.py`. **This removes the CORS problem** (server-to-server, not browser-to-8790) and is the single data source for all three panels. |
| `src/app/api/hydra/policy/route.ts` | GET + PUT for the Hydra policy file (§6). **New write path.** |
| `src/app/hydra/page.tsx` | The three-panel page (one route, three zones — matches spec §7 Q3 default and the mobile precedent). |
| `src/app/hydra/layout.tsx` | Header + honest data-source banner (mirrors `hx/layout.tsx`). |
| `src/components/hydra/PanelSmartGen.tsx` | PANEL 1. |
| `src/components/hydra/PanelRoutingIntel.tsx` | PANEL 2. |
| `src/components/hydra/PanelPriority.tsx` | PANEL 3. |
| `src/components/hydra/RoutingMap.tsx` | React Flow graph (reuses `@xyflow/react`, already installed). |
| `src/lib/fleet.ts` | Typed fetch helpers + honest `source` typing (client side). |

### Modify

| Path | Change |
|---|---|
| `src/components/Nav.tsx` | Add `{ href: "/hydra", label: "Hydra", group: "operate" }` to the route list at lines 16-19. |
| `src/app/globals.css` | Add nothing if tokens suffice; `hx-*` colours already defined (`tailwind.config.ts`). |

### Why a new route, not a rewrite

`src/app/hx/page.tsx` and everything under `src/components/hx/` are **demo-fixture bound** (`useLiveMission`) and carry a DEMO DATA banner. Grafting live fleet data into them means unpicking the mock and the badge — riskier than a clean `/hydra` route that imports the two genuinely reusable pieces (`status.ts`, `RuntimeMarks`) and copies the mobile pattern. The `/hx` Mission Board stays as-is as the simulated surface; `/hydra` is the real one.

---

## 3. Real API JSON shapes (quoted, not invented)

Live fetch of `http://127.0.0.1:8790` on 2026-10-07 14:41 EDT.

### `/api/fleet` (HTTP 200)
Top-level keys: `generated_at, root, totals, bots, lanes, profiles`.
```
"totals": {"bots": 46, "lanes": 66, "profiles": 14, "matched": 14,
           "lane_files": 4792, "empty_lanes": 4}
```
- **`bots[]`** each: `{name, section, id, role, profile}` — e.g. `{"name":"VidiBot","section":"Command / ops","id":"3948602f-…","role":"Master command-and-control agent…","profile":"vidibot"}`. `profile` is **null** for most (only bots with a live Hermes profile have one).
- Section counts (46 bots): `Command / ops` 5, `Shared Experts bench` 10, `Project / research` 28, `Group chat` 1, `Placeholder` 2.
- **`lanes[]`** each: `{name, files, md, modified}` — e.g. `{"name":".kilo","files":1,"md":0,"modified":"2026-09-21"}`. **`lanes` here are project-lane folders, NOT model lanes.** This matters for §5.
- `profiles` — object keyed by profile name (seen in `/api/health`).

### `/api/lanes` (HTTP 200) — the model/provider lanes
```
{"zen": {"label":"OpenCode Zen","model":"space-bunny-free","ok":false,"state":"auth","latency_ms":88,"note":"HTTP 403"},
 "openrouter": {"label":"OpenRouter","model":"stealth/space-bunny-alpha","ok":false,"state":"missing","latency_ms":103,"note":"HTTP 404"},
 "kilo": {"label":"Kilo Gateway","model":"stealth/space-bunny-alpha","ok":false,"state":"missing","latency_ms":366,"note":"HTTP 404"},
 "probe_pending": false, "probed_at": "2026-10-07T14:41:19-04:00",
 "expires": "Space Bunny Alpha retired 2026-10-05, 2d ago (Kilo catalog)",
 "expiry": {"text": "…","date":"2026-10-05","days_remaining":-2,"state":"retired","source":"Kilo catalog"}}
```
Only **three** provider lanes exist. There is **no** throughput / saturation / cost-burn field.

### `/api/health` (HTTP 200)
Keys: `checked_at, host, services[], profiles[], ubuntu{}, lanes{}, totals{}, measured, state, snapshot_age_s`.
- `services[]` each: `{key, label, port, up}` — e.g. `{"key":"kumiho","label":"Kumiho CE","port":9190,"up":true}`. Six services; live result was 3/6 up.
- `profiles[]` each: `{name, role, model, provider, auth, executions, jobs, ticker_age_s}` — e.g. `{"name":"vidibot","role":"","model":"ci-haiku-45","provider":"custom:cheaperinference","auth":true,"executions":125,"jobs":1,"ticker_age_s":55.1}`. **`executions` and `jobs` are the only per-bot workload numbers in the whole API.**
- `totals`: `{"services_up":3,"services_total":6,"profiles":14,"executions":125,"jobs":1,"profiles_with_auth":14}`.
- `checked_at` was **real** (`"2026-10-07T14:41:35-04:00"`), `state:"live"`, `measured:true`.

### `/api/stack` (HTTP 200)
Keys: `kernels, projects, spaces, graph, counts, reltypes, embedding` **plus injected** `routing, lanes, agents_profiles, gateway, checked_at` (`fleet_dashboard.py:416-423`).
- `routing` = output of `routing_view()`: `{"primary":{model,provider,base_url,api_mode}, "fallbacks":[{provider,model}], "custom":[{name,base_url,key_env}]}` — **model routing only**.
- There is **no `/api/routing` route**; `routing_view()` is only reachable embedded inside `/api/stack`.

---

## 4. PANEL 1 (SmartGen) — what a real ledger can read

**Generators that exist** (all in `M:\code\VidiFlow\out\fleet\`):
- `vidi_image.py` (100 lines) — `generate(prompt, model="grok-imagine", size, n)`. Reads `CHEAPER_INFERENCE_API_KEY` from the Hermes `.env` (`vidi_image.py:26-36`, never prints it). Calls `https://api.cheaperinference.com/v1/images/generations`.
- `_gen_landing_hero.py` (73 lines) — `gpt-image-2` at 2560×1440; **sniffs magic bytes** (`sniff_ext`, lines 34-41) and **measures real dims with PIL** (`im.size`, line 69).
- `_gen_landing_band.py` (50+ lines) — same pattern for band images.
- `_install_landing_assets.py` (53 lines) — asserts `im.size == (2560, 1440)`, re-encodes to JPEG q85, prints measured dims.

**The ledger:** the only structured generation record is **`M:\code\VidiBot\vidiflow-hx\mobile\img\_genreport.json`** (50 lines). Real entries look like:
```json
{"name":"fleet-hero","source":"b64","api_format":"JPEG","real_px":"1280x720",
 "mode":"RGB","bytes_raw":166872,"bytes_saved":52934,"file":"fleet-hero.jpg",
 "elapsed_s":12.9,"billing":{}}
```
Fields: `name, source, api_format, real_px, mode, bytes_raw, bytes_saved, file, elapsed_s, billing`.

**Assessment for PANEL 1:**
- **Reusable now:** the `_genreport.json` schema is exactly an "output ledger" row (file, real measured px, format, byte cost). There are 4 rows today.
- **Missing and must be built:** (a) there is **no `genreport.json` per run** — the file is hand-assembled, not appended by the generators; (b) **no queue/job state** anywhere; (c) **no cost accumulator** — `billing` is `{}` in all four rows, so "cost so far" cannot be shown today. `vidi_image.py:86-88` *prints* a `cheaper_inference` billing block when present but writes nothing to disk.
- The spec's cost table (`grok-imagine` $0.017 / 1280×720 hard cap; `gpt-image-2` ~$0.048; `nano-banana-2` $0.0798; `nano-banana-pro` $0.1098) is **hard-coded in the spec doc**, not in any data file the panel can read — it would have to be a static table in the component (labelled as spec-sourced, not measured live).

---

## 5. PANEL 2 (Routing Intelligence) and PANEL 3 (Priority & Routing) — data sufficiency

### PANEL 2 — Routing Intelligence / "snap judgment engines"
- **Vocabulary source exists:** `public/snap-judges/index.html` names Laya (production core), Kev-4B (pilot), SemIf (browser demo), with real figures (Laya 33 ms on a T4; Kev-27B within ~1 pt of hosted Jev), but explicitly says they are **not wired** (line 65).
- **Missing and must be built:** engine roster (roster is prose only), decision log, rule table, confidence/threshold data. **None of these exist as an endpoint, file, or table.** PANEL 2 is the least-backed panel.
- **Honest fallback for 17:00:** render the roster from the snap-judges page content (Laya/Kev-4B/SemIf) as **static, labelled "catalogue — not wired"**, and render the decision log as **empty-with-reason** ("no routed decisions yet: engines not wired") rather than fabricating rows. That satisfies the spec's "exceptions lead / no fabricated values" rule.

### PANEL 3 — Priority & Routing
- **What exists to render now:**
  - Priority queue → **derive from `health.profiles[]`**: one row per profile with `executions` and `jobs`; rank by `jobs` then `executions`. Bots with a `profile` and `jobs>0` are "running"; the rest idle. This is real but coarse.
  - Lane load → **`api/lanes`** gives the 3 provider lanes with `ok`/`state`/`latency_ms`. The 66 `fleet.lanes[]` are **project folders** (with a `files` count), not servers.
  - Routing map → build from `stack.routing` (primary → fallbacks → custom) + `health.services[]`. Real edges exist.
  - Alerts → derive: services `up:false`, lanes `ok:false`, `expiry.state:"retired"`. These are genuine exception signals.
- **Missing and needs backend work (ranked):**
  1. **No priority field** on any job — priority is not modelled anywhere. (med effort)
  2. **No queue** — `jobs` is a count, not a list; no per-job id/state. (med-high)
  3. **No throughput / saturation / cost-burn** per lane — only latency_ms and ok. (high — the dashboard would need to compute it)
  4. **No alerts feed** — alerts are inferred, not served. (low — can infer client-side)
- **Verdict:** PANEL 3 can render a **real, honest first version today** from `/api/fleet`, `/api/health`, `/api/lanes`, `/api/stack` — priority derived from profile `jobs`/`executions`, lane load from the 3 provider lanes, routing map from `stack.routing`, alerts inferred. It cannot show true job-level priority or lane saturation without new backend work.

---

## 6. THE WRITE-PATH FINDING (significant)

**No Hydra routing-policy file exists that Hydra reads today.**

Evidence:
- `fleet_dashboard.py:373-392` `routing_view()` opens `%LOCALAPPDATA%\hermes\config.yaml` and extracts only `model.*`, `fallback_providers[]`, `custom_providers[]`. Nothing else. Docstring: *"Live Vidi.Ai model + Hydra routing chain, read from config.yaml."*
- `config.yaml` (481 lines, 13,759 B, modified today 14:14) top-level keys include `model`, `fallback_providers`, `custom_providers` — and a grep for `hydra|routing|snap|priority|lane` returned **zero matches**. There are no rule, weight, priority, or cost-ceiling keys.
- `grep -rn "hydra_policy|routing_policy|policy.json"` over `src/` → **0 results**.
- The dashboard's POST is hard-gated: `fleet_dashboard.py:557-562` returns `403 {"error":"launch_gated"}`. `mobile/server.py:293-324` only forwards `/api/dispatch` and reports that 403 honestly.
- `kumiho_probe.py:52` writes a `HydraProbe` node into Neo4j — that is a probe, not a policy store.

**Conclusion:** the spec's core requirement — *"that's where we're going to enter this stuff and … routes all of your data on the back end"* — has **no persistence target in the system today.** The panel must create one. Recommended:

- **New file:** `M:\code\VidiFlow\out\fleet\hydra_policy.json` (alongside `fleet.json`, where the hub already reads snapshots). Versioned, with a `prior_state` block per changed rule to satisfy governance rule 4 (RESTORE).
- **New route:** `src/app/api/hydra/policy/route.ts` — GET reads it, PUT writes it with validation (a rule targeting no live lane is **rejected at entry**, per spec §4.2).
- **Honest caveat the panel MUST show:** *nothing reads this file yet*, so a change is "persisted, not yet in effect." Hot-reload is an **open decision for James** (spec §7 Q1) — I could not determine it because nothing consumes the file.
- **Auth:** the dashboard POST is read-only; the PUT route runs inside the Next server. Whoever ships this must decide whether the PUT needs a token (spec §7 Q5). **Recommend: ship the PUT stubbed to `501 Not Implemented` behind an env flag if no auth exists by 17:00**, so the demo is honest rather than fake-writable.

---

## 7. Build sequence, working backwards from 17:00

Now ≈ 14:45. Budget ≈ 2h10m. Order is set so the panel is *renderable and honest* early, with the riskiest work (write path) last and stubbable.

| Time | Step | Files | Done-when |
|---|---|---|---|
| 14:50–15:05 (15m) | Proxy route: server-fetch the 4 endpoints, tier live→snapshot | create `src/app/api/hydra/route.ts`; port logic from `mobile/server.py:104-256` | `curl localhost:3000/api/hydra` returns live fleet + a `source` field |
| 15:05–15:15 (10m) | Route + nav + shell | create `src/app/hydra/page.tsx`, `layout.tsx`; edit `src/components/Nav.tsx` | `/hydra` renders 3 empty panels, no console errors |
| 15:15–15:40 (25m) | PANEL 3 (real data — build first, it has data) | `PanelPriority.tsx`, `RoutingMap.tsx` | priority rows from profiles, 3 lanes, routing map, inferred alerts |
| 15:40–16:00 (20m) | PANEL 1 (ledger + static cost table) | `PanelSmartGen.tsx`; read `_genreport.json` via the proxy | ledger table renders 4 real rows; cost table labelled spec-sourced |
| 16:00–16:20 (20m) | PANEL 2 (catalogue + honest empty log) | `PanelRoutingIntel.tsx` | roster from snap-judges content, decision log empty-with-reason |
| 16:20–16:40 (20m) | Write path: policy GET/PUT + file | `src/app/api/hydra/policy/route.ts`; `M:\code\VidiFlow\out\fleet\hydra_policy.json` | enter a rule → GET reads it back; invalid rule rejected; "not yet in effect" banner |
| 16:40–17:00 (20m) | Verify at 375 / 768 / 1440 | — | zero overflow, zero console errors, honest source chip, exceptions lead |

**Cut lines if behind:** drop the React Flow map to a static SVG (15:15 block); stub the PUT to 501 (16:20 block) and keep GET. Do **not** cut the honest source chip or the "not yet in effect" banner — those are the acceptance criteria the spec weights most (acceptance §6.2, §6.6).

---

## 8. What I could NOT determine (and why)

1. **Where the Hydra policy file should live / whether it hot-reloads.** Nothing consumes such a file today, so there is no existing answer. Recommendation given in §6; final call is James's (spec §7 Q1).
2. **Whether the snap judgment engines are built.** The only artifact (`public/snap-judges/index.html`) says they are **not wired** (line 65). I found no server, endpoint, or config for Laya/Kev-4B/SemIf. Open decision spec §7 Q2 appears **answered: not built** — but James should confirm.
3. **Whether a Next dev/preview server is currently running and on which port.** I did not probe ports (task rules: do not start or kill servers) and did not read a running app.
4. **Whether `_genreport.json` is author-maintained or generated.** I read its 4 rows and the generators, but found no script that appends to it — so I cannot say it updates on every run.
5. **Per-lane throughput / saturation / cost-burn.** These fields do not exist in any endpoint I fetched; I cannot report values.
6. **Auth requirement for the write path** (spec §7 Q5). Undetermined; recommended default in §6.
7. **Exact `role` strings for all 46 bots** — I read the first three and counts, not all 46 (not needed for the plan).

---

## 9. Constraints for whoever builds this

- Bots are called **bots** or **sub-agents**, never "agents".
- Spellings locked: **VidiSmart, Vidi AI, Hydra, VidiFlow, VidiModels, VidiMail, VidiCity**; **VidiSmart Community** is the only two-word form.
- The panel is **read-honest or nothing**: if a source is down, show an "unreachable" banner (mobile precedent, `mobile/index.html:1162-1170`), never a fake green.
- Lead every panel with the **exception**, not the inventory (spec §3/§6.5).
- **NO API key may ever be printed, logged, or echoed.** `vidi_image.py:26-36` already models the correct pattern.
- Do not fabricate JSON, paths, or numbers. Everything in §1–§5 was read live on 2026-10-07.

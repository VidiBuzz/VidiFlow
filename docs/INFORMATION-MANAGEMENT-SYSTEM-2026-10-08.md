# VidiBot Information Management System — 2026-10-08

Owner: James. Operator: vidibot (command). Scope: the `M:\code\VidiBot` doc tree and the ~17-bot fleet it feeds.

---

## 1. THE PROBLEM, stated honestly

M:/code/VidiBot is not a filing cabinet. It is a firehose.

Measured on 2026-10-09, from the real sweep state (`vidibot-sweep-state.json`) and a live walk of the tree:

| Measurement | Value | Source |
|---|---|---|
| Cumulative docs the sweep has seen | **5,573** | `vidibot-sweep-state.json` |
| Docs inside the live 90-day window | **5,519** | live `os.walk`, mtime ≤ 90d |
| Docs touched in the last 26 hours | **4,489** | mtime histogram |
| Docs touched in the last 24h | **4,465** | mtime histogram |
| Mean docs touched/day over 14 days | **352/day** | mtime histogram |
| Files under 400 bytes (stubs/markers) | 30% of the 26h spike | size profile |

Two facts that break any naive reading of "hundreds of docs a day":

1. **The volume is a touch-event firehose, not an authoring firehose.** The 24h spike is not 4,465 new documents. It is **3,595 files in a single hour-bucket**, 3,646 of them under `vidi-news/` and 735 under `vidiflow-hx/`. That is a bulk sync/checkout touching mtime, not 3,595 people writing notes. Median size of the spike is 1,527 bytes and 30% are under 400 bytes — stubs, markers, and machine-generated poll state. Real *new thinking* in that window is a few dozen docs, not thousands.

2. **The sweep's own report cannot tell you this.** `vidibot-sweep-latest.json` (last run `2026-10-09T14:01:06`) reports `{"new": 1, "at": ..., "by_bot": {"vidinews": {...1 item...}}}` — because the state file already `seen`-hashed the other 5,518 files. The moment the state file is reset, or a bulk touch lands, the same report will claim *thousands* of new docs. The number in `new` is **not** a count of new information. It is a count of *changed bytes since last look*.

**Conclusion:** the deliverable can never be a feed of file names. 352 changed files/day is ~4.4x what a human can skim in a day, and the signal-to-noise in the spike is roughly 1 new doc per 100 touched files. The system must (a) separate *changed* from *new*, (b) route to one owner per doc, and (c) compress to one paragraph per bot. Anything that surfaces more than ~5 decisions a day to James has failed.

---

## 2. THE PIPELINE

Five stages. Only stage 5 reaches James.

```
INGEST → ROUTE → TRIAGE → SYNTHESIZE → PRESENT
(2h cron)  (1 owner)  (bot/judge)   (1 para/bot)  (HX surface)
```

### 2.1 INGEST — the 2-hourly sweep

Existing script: `M:/code/VidiFlow/out/fleet/cron/vidibot_folder_sweep.py`. It diffs by md5-of-contents against `vidibot-sweep-state.json` and routes by keyword substring.

**Known defect to fix (P0):** it treats an mtime/hash change as "new". After a bulk sync, it will emit a thousands-long report. Fix before anything else:

- Add a `first_seen` timestamp per path in state, and classify each changed file as **`new`** (never seen before), **`modified`** (seen before, hash changed, *and* the doc's own `mtime` moved by > 60s), or **`retouched`** (hash unchanged — pure mtime bump, e.g. a sync). **`retouched` must never reach a bot.**
- Exclude known machine directories from the "new" count: `vidi-news/pipeline/state/`, `_sync-backups/`, `vidiflow-hx/node_modules`, `.next/`, `.vite/`.
- Report `new` and `modified` separately, and cap the item list at 30 per bot (already done) — but log the overflow count so a spike is visible as a number, not 3,000 rows.

### 2.2 ROUTE — exactly ONE owning bot

**Rule: every doc goes to exactly one owner. Never broadcast.** Broadcast is how 17 bots each spend tokens re-reading the same 352 files and how James ends up with 17 opinions on one lock.

Current router (`ROUTES` in the sweep script) is a substring match, first-key-wins, defaulting to the `vidibot` catch-all. That catch-all currently holds **524 docs** — real work with no owner (AppFlowy sync design, ARA billing, data-residency locks, training locks).

**Escalation path when the router guesses wrong:**

1. Owning bot triages; if the doc does not touch its stack, it tags `MISROUTED` and names the correct owner in the tag (one line, e.g. `MISROUTED → equitygen`).
2. A `MISROUTED` tag adds a durable keyword→owner rule to the router table (append to `ROUTES`, never reorder — order is precedence).
3. Two consecutive `MISROUTED` tags for the same keyword → that keyword is demoted to a *tiebreak-only* rule (matched last, after exact path prefixes).
4. Anything still unrouted after 2 sweeps (4h) lands in a `vidibot` **triage queue**, triaged once a day at the morning run — it is not allowed to sit silently.

**Separation rule, stated plainly:** ownership is decided by *the path prefix first, keyword second, catch-all last*. Path is ground truth; keyword is a heuristic; the catch-all is a parking lot, not a destination.

### 2.3 TRIAGE — three questions per doc

The owning bot (or a delegated read-only subagent) answers, per doc:

1. **Does this change my stack?** (a lock, a contract, a version, an owner, a port, a model)
2. **Does it need an action?** (a GO-gated step, a blocker, a decision awaiting James)
3. **Is it a duplicate/outdated?** (superseded by a newer lock, a copy of a doc elsewhere, a marker/stub)

Every doc gets exactly one tag:

| Tag | Meaning | Who acts |
|---|---|---|
| **ACT** | Changes the stack AND needs work | bot, this cycle |
| **WATCH** | Changes the stack, no action yet | bot, next 2 cycles |
| **ARCHIVE** | Correct, no longer active | nobody — move out of hot path |
| **DELETE-candidate** | Duplicate, superseded, or stub | nobody until batch-approved |

Budget: **60 seconds per doc.** A doc that cannot be judged in 60s gets `WATCH`, not a longer read. The point of triage is routing attention, not comprehension.

### 2.4 SYNTHESIZE — one paragraph + ≤5 actions

Per bot, per run, the bot emits exactly:

```
## <bot> — <one-line verdict>
<one paragraph, ≤120 words: what changed on its stack, what it means, what is blocked>

Actions (max 5):
1. <verb-first action> — owner <bot>, gate <GO/auto>
```

**This is the only thing that reaches James.** If a bot cannot say it in a paragraph, the bot has not finished triaging. Hard cap: 5 actions fleet-wide per day unless a hard blocker exists.

### 2.5 PRESENT — the briefing surface (built by another agent)

Do not rebuild it. `vidiflow-hx` is being built to read `vidibot-sweep-latest.json` and render: per-bot workload bars, a 7-day timeline, top-attention cards, fleet health.

**Design contract this system owes that surface** (coordinate by these, do not fork them):

- The surface reads `M:/code/VidiFlow/out/fleet/cron/vidibot-sweep-latest.json`. Keep that path and that filename.
- Add, don't replace: extend the JSON with `new`/`modified`/`retouched` counts and a per-bot `tags` histogram (`{ACT, WATCH, ARCHIVE, DELETE}`). Additive keys only — the other agent's reader must not break.
- Per-bot workload numbers come from `/api/health` → `profiles[]`: `{name, role, model, provider, auth, executions, jobs, ticker_age_s}`. **`executions` and `jobs` are the only per-bot workload fields in the whole API** — do not invent a spend field that doesn't exist.
- Fleet health: `/api/health` → `services[]` (`{key,label,port,up}`, 6 services), `lanes[]` (3 provider lanes), `totals` (`services_up`, `profiles`, `executions`, `jobs`, `profiles_with_auth`), `state` (`live`), `measured`, `snapshot_age_s`.
- The dashboard was **not running locally when this was written** (all of 8090/8099/8080/3000 refused or 400'd). §4 treats fleet health as a cached snapshot, not a live fetch — the briefing must say "as of HH:MM", never imply live.

---

## 3. THE MORNING BRIEFING

A fixed 6-part structure with time budgets. Target: **~15 minutes of James's attention**. Every part has a hard cap because the failure mode of a briefing is that it grows until it's ignored.

| # | Part | Budget | Cap |
|---|---|---|---|
| a | Health verdict (one line) | 15s | 1 line |
| b | Fleet status | 60s | 6 services, 3 lanes, 402s |
| c | The 3 things that changed yesterday that matter | 2 min | exactly 3 |
| d | Per-bot roll-ups | 8 min | 1 para + ≤5 actions per bot |
| e | Decisions needed FROM James | 3 min | max 5, each with a recommended option |
| f | What's parked and why | 30s | one line per parked item |

### (a) One-line health verdict
Format: `VERDICT: <GREEN|AMBER|RED> — <one clause why>. <N> decisions waiting.`
Green = nothing blocked, no ACT items aging past a day. Amber = something blocked or a router failure. Red = a lane is 402-ing, a port is down, or an ACT item is >24h stale.

### (b) Fleet status
Read from the `/api/health` snapshot. Table: services up/total, lanes ok/failing with the `note` (e.g. `HTTP 403`), any profile with `auth:false`, and **402/credit-exhaustion flags** (a lane whose `note` is an HTTP 402 is a spend-stop, not a transient — it is RED until fixed). Port list from `services[]`.

### (c) The 3 things that changed yesterday that matter
Chosen by the synthesizer from ACT-tagged docs only. Not "3 files touched". Three *changes to the stack*, each one line + the doc it came from. If there are fewer than three real changes, say so — do not pad.

### (d) Per-bot roll-ups
`bot → paragraph → top actions`, sorted by ACT count descending. Bots with zero ACT items are collapsed into a single "quiet: <names>" line so the section stays 8 minutes at 17 bots.

### (e) Decisions needed FROM James (max 5)
Each decision: the question, the options, and **a recommended option** (so it is a confirm/override, not an open question). A decision with no recommendation is not ready to present — it goes to WATCH.

### (f) What's parked and why
DELETE-candidates and ARCHIVEs that were not actioned, one line each: `parked: <doc> — <why>`. This is the honesty section; it is where the backlog is visible without being a wall.

### Sample rendered briefing — Oct 8, 2026

Grounded in the real docs read for this write-up (`mez-stack-notes-2026-10-08/`, `comfyui-full-stack-integration-lock-2026-10-07.md`, `qwen-under-15b-24gb-local-models-2026-10-07.md`, `qwen-full-stack-vs-best-of-breed-2026-10-07.md`, `vidismart-ecosystem-map-and-7-verticals-2026-10-07.md`) and the sweep state (5,573 seen, 352/day touched, 4,465 in last 24h as a bulk-touch spike).

```
════════ MORNING BRIEFING — Wed 2026-10-08 ════════
VERDICT: AMBER — ComfyUI integration locked but GO-gated and stalled
         on a V20 that's offline; 3 decisions waiting.

FLEET (snapshot 06:05, not live)
  services 3/6 up (kumiho 9190 up)   lanes 0/3 ok
  zen: HTTP 403 · openrouter: HTTP 404 · kilo: HTTP 404
  profiles 14, auth 14/14, executions 125, jobs 1
  ⚠ 3 lanes failing; model watch cron (06:00) delivered by email, ok.

3 THINGS THAT CHANGED YESTERDAY THAT MATTER
  1. ComfyUI is now a HARD LOCK across Mez→SmartGen→9Miho→Kumiho→Layer 5
     (comfyui-full-stack-integration-lock-2026-10-07). SmartGen Image
     returns a deliberate 501 until a diffusion model lands in ComfyUI.
  2. Qwen under-15B answer is settled: newest small line is Qwen3.5
     0.8B/2B/4B/9B, all ≤24GB at 8-bit; 9B is tight at BF16.
     (qwen-under-15b-24gb-local-models-2026-10-07)
  3. Ecosystem map landed: 34 VidiSmart pieces, 7-vertical framework
     proposed, VidiPitch confirmed as a specialization INSIDE VidiFlow.
     (vidismart-ecosystem-map-and-7-verticals-2026-10-07)

PER-BOT ROLL-UPS
  mez (1,022 docs) — Mez absorbed the mez-stack-notes-2026-10-08 batch
    (ComfyUI locks, Android mobile plan v1.4, memory research). Nothing
    installed; all GO-gated. ComfyUI path unverified because V20 offline.
    Actions: 1. Inventory live ComfyUI models/ on V20 — gate GO
  vidiflow (975 docs) — HX build in flight by another agent; spec
    readback filed. Briefing surface contract is §2.5 of this doc.
    Actions: 1. Land per-bot tag histogram in sweep-latest.json — auto
  equitygen (110 docs) — 2x2 matrix, domain checks (equitygen.app only,
    never .io), Godot demo. Quiet.
  lex_lexicon (7 docs) — /lex returned 307 on Oct 7; ~13-15 terms only.
    Actions: 1. Investigate 307 on vidiflow.net/lex — auto
  quiet: vidinews, viditwin, vidicity, vidismart, airpmd, vidibio,
         isovoice, vidimail_vidiblast, hermes_gateway, vidibot

DECISIONS NEEDED FROM JAMES (3)
  1. ComfyUI starter checkpoint + workflows — V20 is offline, so the
     GO-gated inventory can't run. Recommend: bring V20 online, then GO
     the 5-step ComfyUI lock. (else: park until V20 returns)
  2. 7 verticals — which of the 34 pieces are the top 7 to sell?
     Recommend: start from the ecosystem map's maturity signals and pick
     VidiFlow/VidiPitch/VidiTwin/Lex first. (else: defer to next call)
  3. Lex 307 — /lex is redirecting, not serving. Recommend: treat as a
     routing bug, not a content gap; assign to VidiFlow. (else: WATCH)

PARKED
  parked: qwen-full-stack-vs-best-of-breed — research done, verdict is
    "Qwen spine, best-of-breed edges"; no action until Hydra routing GO.
  parked: hermes-memory-research — Kumiho stays system of record.
  parked: 30% of last-24h files — bulk sync retouch, not new info.
═══════════════════════════════════════════════════
```

### Voice / audio — honest answer

James asked for "an hour-long briefing". **An hour of spoken briefing is the wrong call, and here is the honest reasoning:**

- The content that matters is ~15 minutes. Padding it to an hour means either re-reading files James doesn't need, or slowing delivery to fill time. Both waste his attention and mine.
- A 60-minute audio track is unsearchable and unskippable in the way that matters — you can't scan "decisions needed" in audio.

**Recommended: two lanes, not one long one.**

1. **~15-minute spoken version** — the briefing above, read aloud, generated with `text_to_speech` (available in Hermes; free lanes). Cuts the walls of text; James can listen while doing something else. Best split: part (a)+(c)+(e) spoken (~6 min), and part (d) per-bot roll-ups as an optional spoken continuation (~9 min) he can stop after the decisions.
2. **The visual page** (vidiflow-hx surface, §2.5) for the detail — workload bars, timeline, attention cards. This is the part that benefits from being visual rather than spoken.

If James specifically wants a long listen, the honest way to fill it is **the per-bot detail, one bot at a time, on demand** — "brief me on mez" — not a fixed hour every morning. Offer that as a command, don't build it as a default.

---

## 4. THE DAILY RHYTHM

| Time (ET) | Event | Automatable | Owner |
|---|---|---|---|
| every 2h | **Sweep** — ingest+route+`retouched` filter | cron (fully) | cron script |
| every 2h | **Triage** of that bot's `new`/`modified` batch | cron-assisted | each owning bot |
| **07:00** | **Morning synthesis** — roll-ups + briefing + TTS | cron (fully) | vidibot |
| **12:00** | **Midday checkpoint** — ACT aging, 402s, decisions due | cron (fully) | vidibot |
| **18:00** | **End-of-day report** — what shipped, what slipped, tomorrow's queue | **bot judgment** | vidibot + James |
| daily 07:30 | Triage the `vidibot` catch-all queue | cron-assisted | vidibot |

Notes on what genuinely needs judgment vs. what cron can do:

- **Cron can do:** the sweep, the `retouched` filter, routing, per-bot triage of a bounded batch, the synthesis roll-up, the briefing render, the TTS, the midday numbers. The existing cron already proves the pattern — `Morning model watch` runs `0 6 * * *`, delivers by email, `last_status: ok`.
- **Needs bot judgment:** the end-of-day "what slipped and why" (requires knowing intent, not just tags), and any `MISROUTED` escalation that needs a new ownership rule.
- **Needs James:** the ≤5 decisions in part (e). Nothing else should require him.

Add the morning synthesis as a cron job mirroring the existing one: schedule `0 7 * * *`, prompt = "read `vidibot-sweep-latest.json` + `/api/health` snapshot, emit the 6-part briefing, write it to `M:/code/VidiFlow/out/fleet/briefings/`, then `text_to_speech` the spoken cut". Deliver by email to match the existing `email:vidiman@vidimail.com` lane.

---

## 5. HANDLING THE 1,808 BACKLOG

First, reconcile the count. The brief says 1,808 (first sweep, 90-day). The live tree now measures **5,519 docs in the 90-day window** and the state file holds **5,573**. The 1,808 was a snapshot; the tree grew. The backlog problem is bigger than 1,808, but *most of it is not reading work* — 30% of the recent spike is stubs under 400 bytes and the spike itself is a bulk retouch.

### Step 1 — Triage first: the genuinely new stuff (read these, in this order)

| Doc | Why it's first |
|---|---|
| `mez-stack-notes-2026-10-08/` (23 files) | James's Oct 8 stack notes — ComfyUI locks, Android plan, memory research. Highest-authority, newest. |
| `comfyui-full-stack-integration-lock-2026-10-07.md` | HARD LOCK defining the ComfyUI contract; blocks SmartGen Image (501). |
| `qwen-under-15b-24gb-local-models-2026-10-07.md` | Settles the ≤24GB local model question; feeds Hydra routing. |
| `vidismart-ecosystem-map-and-7-verticals-2026-10-07.md` | 34 pieces + 7-vertical framework; drives product priorities. |
| `qwen-full-stack-vs-best-of-breed-2026-10-07.md` | Verdict: Qwen spine, best-of-breed edges. Research done, action gated. |
| `viditwin-*` / `2x2/equitygen-*` docs | Smaller; triage after the locks above. |

These are already effectively triaged by this document (see §3 sample). Cost: one pass, ~30 min of bot time, zero paid calls.

### Step 2 — Mass-archive (do not read)

Safe to move out of the hot path without reading, by rule:

- **`_sync-backups/`** — excluded from the sweep already; archive.
- **Anything tagged `retouched`** (hash unchanged, mtime bumped) — the bulk sync. **Do not read; do not count as new.**
- **Files under 400 bytes that are markers/stubs** (`.vidibot-write-probe*.txt`, `moved-to-*.txt`, `last-poll.json`-style state) — DELETE-candidate, batch-approved.
- **Duplicates across trees** — e.g. `comfyui-full-stack-integration-lock-2026-10-07.md` exists at both `docs/` and `docs/mez-stack-notes-2026-10-08/`; `vidiflow-lex-viditwin-visual-deliverables` exists at root and under `vidibot/`. Same md5 → one owner, rest DELETE-candidate.
- **90-day-and-older** — 99 docs are 31-90d old and 54 have aged out of state entirely; these are ARCHIVE, not delete.

Rule: **archive by rule, never read-by-rule.** If a doc needs reading to decide, it isn't mass-archive material.

### Step 3 — Honest note: keyword routing is a heuristic with known failure modes

The router is substring-first-wins. Its real failure modes, measured:

- **`lex` matches `lexicon`, `Lexington`, `lexi`, and every `lex-*` filename.** 33 files hit `lex`; only some are Lex/Lexicon. `lex` should be matched as a path prefix (`lex/`, `lexicon/`) or exact filename token, not a bare substring.
- **`vidiflow` appears in nearly every VidiBot filename prefix** — `00-VIDIFLOW-...`, `vidiflow-hx/`, `vidiflow-lex-viditwin-...`. 998 files match `vidiflow`, which is why `vidiflow` owns 975 docs. It is absorbing docs that belong to mez, lex, or viditwin. **This is the single biggest misrouting vector.**
- **`hydra`, `mez`, `qwen`, `comfyui`, `local-model` all collapse to one owner** — fine while mez is one bot, wrong the moment mez splits.
- **Order is precedence and it's fragile** — `vidimodels → hermes_gateway` sits above `vidiflow`, so a file named `vidiflow-vidimodels-x.md` goes to hermes_gateway, not vidiflow.
- **The catch-all is doing real work** — 524 docs default to `vidibot`, including AppFlowy sync design, ARA billing, data-residency locks. These are unrouted, not unimportant.

Fix, in order: (1) path-prefix matching before substring; (2) `vidiflow` demoted to tiebreak-only; (3) `lex` made prefix/exact; (4) every `MISROUTED` tag appends a rule (§2.2). Until then, treat every route as a guess the owning bot is expected to correct.

---

## 6. COST / SPEND

**All of this runs on free lanes only. No paid API calls, anywhere in the pipeline.**

The two spend-safe design choices:

1. **Hash-diff ingest, not content re-read.** The sweep fingerprints by md5 and only surfaces files whose hash changed. Triage reads only `new`/`modified` docs — never the whole 5,519-file tree. The `retouched` filter (P0 fix, §2.1) is what keeps a bulk sync from turning into thousands of paid reads. A naive "read everything that moved" design would burn the entire budget on a sync event.
2. **Compression before anything reaches a model with James attached.** Each bot compresses its batch to one paragraph + ≤5 actions *locally* (free-lane model), and only that paragraph is carried upward. James's context and any premium lane only ever see the ≤5-decision digest, never raw file lists. Bots triage on free lanes; the paid/persona lanes are reserved for work that needs judgment, not for re-reading the firehose.

Corollary that falls out of the measurements: because 30% of recent files are sub-400-byte stubs and the spike is a retouch, **the actual read volume is a few dozen docs/day, not 352** — once `retouched` is filtered. That is the whole budget story: the free lanes are sufficient because the real signal is small; the danger is only ever the un-filtered touch count.

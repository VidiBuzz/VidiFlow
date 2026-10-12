# VidiFlow Hydra — On-Demand Asset Routing

**Written by:** VidiBot
**Date:** 2026-10-06 01:07:44 EDT
**Status:** SPEC — awaiting James's go before implementation
**Owner:** VidiFlow (per brand glossary: Hydra is the VidiSmart routing system that connects servers, chooses speed, and chooses what intelligence is passed to them)

---

## The problem, measured

Six MCP servers load on **every** session. Cached schema weight:

| Server | Tools | Cached size |
|---|---|---|
| **cloudflare** | **2074** | **1628 KB** |
| grafana | 112 | 138 KB |
| comfy-cloud | 19 | 36 KB |
| sentry | 14 | 38 KB |
| hugging_face | 6 | 11 KB |
| **TOTAL** | **2225** | **~1852 KB** |

**Cloudflare is 88% of the payload** — 2,074 tool definitions injected into context for a capability used occasionally. Canva is configured but never cached, so it likely re-fetches every session.

Total: **~1.9 MB of tool schemas per session**, every time.

Plus 21 installed plugins and an optional-skills tree, none of which are routed on demand.

---

## The principle

> **Assets stay installed. Activation is per-task, decided by rule, and reversible.**

Nothing is uninstalled. Hydra decides what to *turn on* for the task in front of it, and turns it back off when done.

This is not new for the model-router concept — it is the same job applied to capability. Currently model routing is described but not wired; Hydra applies the rule to models, MCP servers, plugins, and skills together.

---

## What Hydra routes

1. **MCP servers** — the 6 above
2. **Plugins** — 21 in `hermes-agent\plugins\`
3. **Skills** — active plus `optional-skills\`
4. **Models/providers** — the free rotation lanes
5. **AGENTS.md** — see below

---

## The rules engine

### Rule 1 — INVENTORY (always, before any task)
Enumerate every asset: MCP servers, plugins, skills, models. Report what's available and what would help, *before* doing the work by hand.

**This is the rule that would have prevented tonight's failure** — a Cloudflare MCP was configured and enabled the entire time while I shelled out to `cloudflared` for hours. See `M:\code\VidiBot\PROJECT-SETUP-CHECKLIST.md`.

### Rule 2 — REACHABILITY (the step that was missed)
Distinguish three states and never conflate them:

| State | Meaning |
|---|---|
| configured | entry exists in config |
| enabled | `enabled: true` |
| **connected** | tools actually load and answer **in this session** |

Cloudflare was `enabled: true` and **not connected** — profile-scoped sessions do not inherit `mcp_servers` from the global config. An existence check repeats this failure; a reachability check catches it.

### Rule 3 — MATCH (activate the minimum)
Turn on only what the task needs. Cloudflare tunnel task → Cloudflare only. Nothing more.

### Rule 4 — DEACTIVATE (restore)
When the task ends, return assets to their prior state. Record what was changed so it can be reversed.

### Rule 5 — NEVER SILENT
Activation may need OAuth approval, may cost money, or may already be connected-but-broken. **Report before activating.** Nothing turns on without James's go.

---

## Cloudflare specifically

Two complementary moves, both proposed, neither applied:

**A. Trim the tool list.** Config already supports `tools.include` / `tools.exclude`. Existing exclusions drop radar/accounts/zones-security families. Cutting to the ~40 tools actually needed (tunnels, DNS, R2) removes ~90% of 1628 KB **while keeping Cloudflare available** — better than switching it off for a task you do twice a month.

**B. On-demand activation.** `enabled: false` by default; Hydra enables + connects for Cloudflare tasks.

**Recommendation: A first, then B.** A alone solves the bloat. B alone means an OAuth round-trip on every tunnel task.

---

## AGENTS.md management

**Verified:** Hermes maintains per-tree `AGENTS.md` instruction files — 13 under `hermes-agent\` (`agent/`, `cron/`, `gateway/`, `hermes_cli/`, `plugins/`, `skills/`, `tools/`, `tui_gateway/`, `web/`, `apps/desktop/`, …), root is 38,400 B.

**No bot profile has one.** All 12 profiles are missing `AGENTS.md`.

Hydra should generate and maintain them:

| Field | Source |
|---|---|
| Brand glossary + spelling rules | VidiBot identity |
| Port registry | `VIDIBOT-PORT-CONFLICT-SOLUTION-2026-10-05.md` |
| Asset roster | live plugin/MCP/skill inventory |
| Verification standard | measured, never asserted |
| Escalation path | report to vidibot |

**Why:** a bot spawned without an `AGENTS.md` starts with no project context — which is how ports got double-assigned and connectors got missed. The file makes the rules travel with the bot.

---

## Deliverables

1. `hydra.yaml` — rules, inventory, per-task activation map
2. `hydra.py` — runtime: inventory → match → activate → report → restore
3. `AGENTS.md` generator — per profile, from one source of truth
4. Connect to the **existing `project-setup-checklist` skill** (Rule 1) rather than duplicating it

**Not yet wired:** the `jev-model-router` catalog entry is present but no Hydra plugin is installed, and profile plugin dirs are empty (only `vidismart` has `homeassistant`). Hydra is a **specification today**, not running code.

---

## Open questions

1. Trim Cloudflare's tool list (A) only, or A + on-demand (B)?
2. Which assets, if any, should be always-on?
3. `AGENTS.md` — one per profile, or shared with profile overrides?
4. Should Hydra live in VidiFlow (`M:\code\VidiFlow`) or SmartChannel CX?

---

*Written after measuring 2,225 tools / 1.9 MB loaded per session and after a connector failure that a single inventory rule would have caught.*

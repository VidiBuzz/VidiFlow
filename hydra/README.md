# VidiFlow Hydra — working home

**Canonical location for ALL Hydra work — and, per James (2026-10-07), for ALL backend process management:** routing, org chart, personality matrix, memory, workflow. Not just routing.
**Owner: Mez Hydra** (profile folder `mez`, UI title "Mez Hydra", section VidiFLOW).
Handed over 2026-10-07.

Subfolders:
- `org/` — consolidated backend-process documents (org chart, roster, fleet mapping, personality matrix) copied here by Mez; canonical originals listed in `org/MANIFEST.md`. Update originals first, re-copy on change.
- `services/` — service code (embedding service copy from `out/fleet/embedding_service`).
- `process/` — backend process management reference copies (fleet_dashboard.py ⚠ LIVE on 8790 — edit the original).

> **Note on how the desktop UI names bots:** renaming a bot in the UI does **not** create a new profile folder. The folder is created once from the name at creation; a later rename only rewrites `ui_meta.hermes-bots.title` inside `profiles/<folder>/profile.yaml`. So "Mez Hydra" lives in the folder `mez` — searching for a `mez_hydra` directory will find nothing. Proof: `profiles/vidiflow/profile.yaml` carries `previous_names: [vidiflow_vidibio_hx]` while the folder stayed `vidiflow`.

Moved here 2026-10-07 on James's instruction: *"we absolutely need this created and saved under VD flow, not in this section for VD bot."*

Nothing Hydra- or routing-related belongs in `M:\code\VidiBot\`.

---

## Documents

| File | What it is |
|---|---|
| `ARCHITECTURE-DIRECTIVE-2026-10-07.md` | **Read first.** James's rule: Hydra never recreates Hermes capabilities — it is the bridge layer (read existing state, expose to VidiFlow.net/desktop/Android frontends, own prioritization & switching). |
| `BUILD-VERIFICATION-2026-10-07.md` | The panel build record — what shipped, what was verified first-hand, what's honestly missing. |
| `PEER-LINK-V20-2026-10-08.md` | V20 ↔ Ubuntu Hermes peer link: verified state + the exact remaining steps (gateway rebind, firewall rule, Ubuntu key). |
| `LANES-CHEAPERINFERENCE-2026-10-07.md` | Verified lane list — 97 models, 3 live-tested, rest catalogued; distinguish LIVE-TESTED / CATALOGUED / DOWN in any UI. |
| `HYDRA-ON-DEMAND-ROUTING-2026-10-06.md` | The original Hydra spec. Asset routing (MCP servers, plugins, skills, models). Defines the five rules: INVENTORY · REACHABILITY · MATCH · RESTORE · NEVER SILENT. |
| `HYDRA-ROUTING-PANEL-SPEC-2026-10-07.md` | **The front-panel specification.** James's ask verbatim + the three panels: SmartGen Content Creation, Routing Intelligence (snap judgment engines), Priority & Routing. Defines the panel as a WRITE surface, not just a read surface. |
| `PANEL-IMPLEMENTATION-PLAN-2026-10-07.md` | How to build it. Reuse inventory, exact files to create/modify, live API JSON shapes, what's missing ranked by effort. |
| `SNAP-JUDGMENT-ENGINE-DESIGN-2026-10-07.md` | The routing-intelligence mechanism. Prior art, cheapest viable signal, decision-record schema, failure modes, PANEL 2 layout. |

## Related prior art (elsewhere in this tree)

| Path | What it is |
|---|---|
| `snap-judges/` (index.html 40.6KB, report.md 23.8KB, assets, screenshots) | The full Snap Judges study — 7 engines compared, Laya recommended, spec'd 2026-09-24, never built. |
| `out/fleet/hydra.html` | Existing Hydra HTML page. |
| `out/fleet/fleet_dashboard.py` | Live fleet API on `127.0.0.1:8790` — `/api/fleet` (46 bots, 66 lanes), `/api/stack`, `/api/lanes`, `/api/health`. Read-only: POST is hard-gated 403. |

## The live routing engine (already written, NOT wired in)

| Path | What it is |
|---|---|
| `%LOCALAPPDATA%\hermes\routing\route.py` (8.1KB) | **The working engine.** Two-stage classify → resolve. 30 rules. Self-test: **12/12 pass** (verified 2026-10-07). |
| `%LOCALAPPDATA%\hermes\routing\policy.json` (14.3KB) | The rule table. |
| `%LOCALAPPDATA%\hermes\desktop-plugins\router\plugin.js` (15.6KB) | The Hydra Model Router UI. Renders 4 destination kinds (`tool > skill > SME > LLM`). Says on screen: *"not wired into dispatch yet."* |

**The gap is wiring, not design.** `route.py` passes its tests and is referenced by nothing — grep of the plugin dir and the HX `src/` tree for `route.py` / `snap_judge` returns zero hits. It is idle.

**Known dependency gap:** `import laya` → `ModuleNotFoundError`. The engine falls back to deterministic heuristics, which is why every self-test line reads `heuristics (fallback)`.

---

## Current model routing (fixed 2026-10-07)

| | Value |
|---|---|
| **default** | `glm-5.3` @ `custom:cheaperinference` |
| fallback 1 | `deepseek-v4.1-flash` @ `custom:cheaperinference` |
| fallback 2 | `deepseek/deepseek-v4.1-flash` @ `openrouter` |

Applied to all 16 configs (global + 14 profiles + mez) on 2026-10-07. Backups at
`%LOCALAPPDATA%\hermes\profiles\vidibot\cache\scratch\cfg-backup-20261007_153429\`.

**Correction of record:** the previous default was `ci-haiku-45` — a temporary alias that was never wanted, and which James never set. All 8 `ci-*` aliases were removed in the same pass. 11 of 16 configs had been pointing at the free `space-bunny-free` lane.

# VidiFlow Provider-Fleet Architecture Proposal
**Date:** 2026-10-05 · **Scope:** Central provider/model management for all Hermes profiles via the vidiflow-hx front end
**Status:** Proposal only — nothing was edited, no gateway restarted.

---

## 1. Live audit (read-only, verified 2026-10-05)

All values below come from actual `grep` of `config.yaml` / `.env`, `hermes profile list` output, and `hermes [-p <profile>] plugins list --plain`.

| Profile | model.default | provider | cheaperinference plugin visible? | CHEAPER_INFERENCE_API_KEY in profile .env? |
|---|---|---|---|---|
| **default** (`~/.hermes/config.yaml`) | `deepseek-v4.1-flash` | `cheaperinference` (base_url `https://api.cheaperinference.com/v1`) + fallback `openrouter` | ✅ yes (`user` plugin, enabled) | ✅ yes (`~/.hermes/.env`) |
| agent_army | `nvidia/nemotron-3-ultra-550b-a55b:free` | `openrouter` | ❌ no | ❌ no |
| appflowy_research | `space-bunny-free` | `opencode-zen` | ❌ no | ❌ no |
| equitygen-app | `nvidia/nemotron-3-ultra-550b-a55b:free` | `openrouter` | ❌ no | ❌ no |
| hermes_gateway | `muse-spark-1.3-contributor-free` | `opencode-zen` | ❌ no | ❌ no |
| lex_lexicon | `space-bunny-free` | `opencode-zen` | ❌ no | ❌ no |
| lexi | `stealth/space-bunny-alpha` | `nous` (base_url `https://inference-api.nousresearch.com/v1`) | ❌ no | ❌ no |
| vidiflow_vidibio_hx | `mimo-v2.6-flash-free` | `opencode-zen` | ❌ no | ❌ no |
| vidimail | `muse-spark-1.3-contributor-free` | `opencode-zen` | ❌ no | ❌ no |

**8 of 9 profiles cannot use cheaperinference today.** Every named profile runs a gateway (`hermes profile list` shows all `running`).

Plugin source on disk: `~/.hermes/plugins/model-providers/cheaperinference/` (`plugin.yaml`, `__init__.py`, __pycache__). This is the **default profile's user-plugin dir**; the file itself is fine — it's the per-profile registry that excludes it.

### Ops side (ties profiles → bots)
`hermes kanban assignees` shows active fleet membership:

| Profile | Kanban assignee exists? | Board state |
|---|---|---|
| agent_army | yes (idle) | agent-army board: blocked=6, done=14, ready=2, todo=9 |
| appflowy_research | yes | done=1 |
| equitygen-app | yes | (idle) |
| hermes_gateway | yes | (idle) |
| lex_lexicon / lexi / vidiflow_vidibio_hx / vidimail | yes | (idle) |
| default | yes | blocked=1, done=6, todo=2 |

Kanban also offers **per-task model overrides** (`hermes kanban set-model`) that already override profile defaults at dispatch — VidiFlow can hook that later.

---

## 2. Root cause of the asymmetry

Verified facts:

1. ** Default-profile user-plugin registry, not per-profile copies.** The CheaperInference provider was installed as a *user plugin* in `~/.hermes/plugins/model-providers/cheaperinference/`. That directory belongs to the **default profile only** — named profiles live at `~/.hermes/profiles/<name>` and only see their own `plugins/` subdirectory. `hermes plugins list` (default) shows `cheaperinference-provider enabled user 1.0.0`; `hermes -p agent_army plugins list --plain` shows it **missing** (per-profile listed plugins differ: default lists 60, agent_army lists 58, missing exactly `homeassistant` and `cheaperinference-provider`).

2. **API key is default-profile-scoped.** `~/.hermes/.env` contains `CHEAPER_INFERENCE_API_KEY`; the six active per-profile `.env` files (`agent_army`, `appflowy_research`, `lexi`, etc.) do NOT contain it. Hermes config-check output for `agent_army` lists `NOUS_BASE_URL / HERMES_ANON_API_SECRET` as optional keys but nothing CheaperInference-related — so a non-default profile has both neither key nor plugin and would fall back to base_url-less OpenAI-mode rather than hit the right wallet-backed gateway.

3. **Not a catalog problem.** `hermes plugins list` shows the plugin properly registered as `kind: model-provider` and enabled in default. So the "add it to each profile by hand" fix is possible, but it's precisely the asymmetry James dislikes — manual copies of a plugin plus manual copies of the key into nine .env files.

Summary: **the asymmetry is structural to how plugins/env are scoped per profile**, not an accident of installation order. Default got the provider; profiles never inherited it.

---

## 3. Proposal

### 3.1 Mechanism options (real, supported by the installed Hermes)

| Mechanism | What it does | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. `hermes -p <profile> plugins install <git-url-or-catalog>`** loop over all profiles from a provisioning script | Runs the native installer per profile; provenance tracked | Native, transactional, works offline; no manual file copying | Must be re-run per new profile; still leaves `/api` key handling separate | **Recommended for MVP** |
| **B. Default `~/.hermes/plugins/model-providers/<name>/` inherited at profile-create time (via `hermes profile create`)** | Already the default behavior when creating a *new* profile off the default home | Zero extra work for future profiles | Not retroactive — existing 8 profiles were created before this plugin existed and don't get it | Use AS the default path for new profiles; do not rely on it alone |
| **C. `hermes config set --profile <p> model.provider cheaperinference` + `model.default <model>` + `model.base_url ...`** | Edits only the per-profile configs; the plugin must already be visible | Correct Hermes-native way to change model assignment; no hand-editing of YAML | Doesn't install the plugin or key — must combine with A and D | **Recommended for MVP** — pair with A and D |
| **D. Env keys: seed CHEAPER_INFERENCE_API_KEY into each profile's `.env` via `hermes secrets` / shell-level provisioning** (never hand-edit `.env` blindly — write through a script that appends or via `hermes auth` when that command exists) | Makes the credential fleet-wide without token-entry friction in the UI | Credential consistency; aligns with Hermes `auth.json` which already references `env:CHEAPER_INFERENCE_API_KEY` | Sensitive value; should be done via env/export at provisioning time, not via VidiFlow's own UI | **Recommended for MVP** — scripted, not UI-typed |
| **E. Distribute the plugin via a VidiFlow-owned `plugins/` overlay per profile** — copy (not symlink) `~/.hermes/plugins/model-providers/cheaperinference/` into each profile's own `plugins/model-providers/` tree and run `hermes [-p <p>] plugins adopt <dir>` to register provenance | Makes each profile fully self-contained | Resilient to future plugin-dir layout changes | 9 copies to keep in sync if the plugin is updated | Back-up plan only, not primary |
| **F. Hot-reload / gateway restart** — the natural way is `hermes -p <profile> gateway restart` (per-profile gateways are listed as `running` in `hermes profile list`) | Closes the window where stale/third-party model choices are read from disk | Zero user-visible downtime if done profile-by-profile (each gateway is a separate process) | Some seconds of unavailability per restarting profile; must not restart the parent/default gateway mid-task | Acceptable, sequential |

**Recommended MVP pattern (combining):**
1. Provisioning script (not yet written — see §3.3 MVP deliverables) loops over the 8 non-default profiles and runs `hermes -p <p> plugins install` for the CheaperInference catalog entry.
2. After install, seeds `CHEAPER_INFERENCE_API_KEY` into each profile's `.env` via a **careful append-if-missing** script (read the key from `~/.hermes/.env` or from a VidiFlow env var the operator supplies once); idempotent: only write if not already present.
3. `hermes -p <p> config set model.provider cheaperinference` + `model.base_url https://api.cheaperinference.com/v1` + `model.default <model-id>` (per-profile choice, optional; these are the keys that flip provider after the plugin is present).
4. `hermes -p <p> gateway restart` for each profile, **staggered**, only when that profile has no active kanban claim (`hermes kanban assignees` / `hermes kanban ls --status active`).
5. Idempotency: the script must be re-runnable — install step is a no-op when already installed (`plugins list` already confirms), the .env append only fires when the key is missing, the config set is declarative (set-to-same-value is a no-op).

### 3.2 VidiFlow front-end management model

Goal: **Fleet→Providers page** in vidiflow-hx where James can add a provider once, then flip which profile uses it.

**Location:** extend `src/app/hx/` with a new page `src/app/hx/providers/page.tsx` (or add a "Providers" tab inside `/org`, which is already the org-level screen). MVP: one new page, next to `/hx` (Mission) and `/org`.

**Data shapes** (VidiFlow reads Hermes config; it should NOT blob-store its own truth — it should *read* Hermes truth and *write* through Hermes commands):

```ts
type FleetProvider = {
  id: string;                 // "cheaperinference" (from plugin dir name or llama-config kind)
  name: string;               // "CheaperInference"
  base_url: string;           // "https://api.cheaperinference.com/v1"
  env_key: string;            // "CHEAPER_INFERENCE_API_KEY"
  opencode_compat: boolean;   // true for openai-compatible gateways
  location: 'default-only' | 'profile:<name>' | 'fleet';
};

type FleetProfileState = {
  profile: string;            // 'agent_army' etc.
  model_default: string;      // current model.default
  model_provider: string;     // current model.provider
  base_url: string;           // current model.base_url
  has_provider: boolean;      // plugin visible?
  key_present: boolean;       // CHEAPER_INFERENCE_API_KEY in .env?
  running: boolean;           // gateway running?
  kanban_lanes: string[];     // agents claimed from `hermes kanban assignees`
};

// Write action
type AssignAction = { profile: string; provider: string; model: string; base_url?: string };
```

**Endpoints (new Next.js route handlers under `src/app/api/fleet/`):**

| Endpoint | Method | Reads/Writes |
|---|---|---|
| `api/fleet/providers` | GET | Runs `hermes plugins list --plain` (default) + `hermes -p <p> plugins list --plain` per profile (cached ~30 s) → returns FleetProvider[] enriched with per-profile presence matrix. |
| `api/fleet/profiles` | GET | Runs `hermes profile list` + per-profile `hermes -p <p> config get model` + `hermes kanban assignees` → returns FleetProfileState[]. |
| `api/fleet/assign` | POST | Body: AssignAction. Server-side runs, **through a provisioning utility, not raw yaml rewrite**: `hermes -p <p> config set model.provider <p>` etc. |
| `api/fleet/provision/:provider` | POST | Installs a newly-added provider plugin into every non-default profile (`hermes -p <p> plugins install`), seeds the env key, then restarts gateways that need it. |
| `api/fleet/status/:profile` | GET | Per-profile health: gateway up, last model used, cheapest-fallback reachable (used by the UI to show reachability). |

**Propagation design — write via Hermes, never via raw file edit:**
- VidiFlow's server route shells out to `hermes -p <profile> config set ...` and `hermes -p <profile> plugins install ...`. This is the only safe write path because Hermes already understands config version (49), unknown-key warnings, and aliasing (`cheaper-inference` / `cheaperinfer` / `cheaper`).
- Do **NOT** have VidiFlow hand-write `config.yaml` or `.env`. Use a server-side script (§3.4) that wraps the same calls with backup + idempotency + validation, and call the script from the route handler. The script, not the UI, is the write-boundary.
- Restart: after config change, `PUT api/fleet/restart/:profile` → `hermes -p <p> gateway restart` happens only if `hermes kanban ls` shows no active claim for that profile; otherwise queue and surface a "blocked-in-Kanban" badge in the UI rather than force-restarting.

### 3.3 MVP vs later

**MVP (first shippable slice)**
- One page: `/hx/providers` — read-only matrix view (profiles × providers, ✅/❌ coloring from live CLI checks) + a **single "Adopt to Fleet" action** on any provider currently only in default.
- `POST /api/fleet/provision/cheaperinference` executes the provisioning script (§3.1 pattern 1-4) for all non-default profiles, sequential, staggered, with per-step log to `ops/` parallel to hermes-agent's pattern.
- `GET /api/fleet/profiles` uses `hermes profile list --json`-style output (fall back to parsing the table) and `hermes kanban assignees` for the tie-to-bot-lane column.
- Restart-gateway only after an explicit per-profile "Apply + Restart" button in UI (never auto).

**Phase 2+ / full editor**
- Full per-profile matrix editor (pick provider + model + base_url per profile, row-level save).
- Diff-preview before write ("you are about to change model.default on 4 profiles; here is the exact diff").
- Hook Kanban per-task model overrides: surface `hermes kanban set-model` for individual tasks as an alternative "one-off escape hatch" in the task detail view.
- Provider-catalog browser (from `hermes plugins search`), "Add provider" wizard that installs from a git URL to every non-default profile.
- Fallback chain editor (mirror of `model.fallback_providers` in the default config).

### 3.4 Files to touch in vidiflow-hx (concrete)

- `src/app/hx/providers/page.tsx` — new Providers page (matrix view).
- `src/app/hx/layout.tsx` — nav entry for "Providers".
- `src/app/api/fleet/providers/route.ts` — GET (aggregated registry + per-profile presence).
- `src/app/api/fleet/profiles/route.ts` — GET (profile/model/kanban-lane snapshot).
- `src/app/api/fleet/provision/[provider]/route.ts` — POST (fleet adoption trigger).
- `src/app/api/fleet/assign/route.ts` — POST (per-profile model/provider assignment).
- `src/app/api/fleet/restart/[profile]/route.ts` — POST (per-profile gateway restart, kanban-aware).
- `tools/` or a new `ops/` folder — the actual provisioning script (bash or TypeScript exec'ing the `hermes -p <p> ...` CLI calls).
- Optional: `src/components/` new shared cell types (`ProviderMatrixCell`, `StatusBadge`) to match existing hx aesthetic.

---

## 4. Risks

1. **Config drift.** If a provider is added "everywhere" via VidiFlow but the default profile is later updated through the CLI, drift reappears. Mitigation: VidiFlow should re-read the CLI-truth on every page load (it owns no persistent provider truth) — the fleet state is derived, not stored.
2. **Gateway restart window.** `hermes -p <p> gateway restart` briefly kills locally-in-flight sessions. Mitigation: always check `hermes kanban ls` for active claims first; only one profile restarts at a time; surface the waiting-state in the UI.
3. **Kanban dispatch ownership.** If a profile is restarting while kanban would have dispatched a task to it, that task will miss the window. Mitigation: for `agent_army` (the busiest board — 6 blocked, 9 todo), gate restarts on "assignee idle" from `hermes kanban assignees`.
4. **What must never be auto-written:**
   - Live `config.yaml` / `.env` — never direct-write from VidiFlow UI. All writes must go through `hermes` CLI subcommands, or, if a script bypasses them, the script must make a **backup copy first** (`.bak-<timestamp>`) and set values with the exact `hermes -p <p> config set` semantics.
   - Do not restart the **default** profile gateway from the fleet page — the default profile is the gateway host tying all the others together; restarting it mid-task drops all of them.
   - Do not auto-adopt per-profile `.env` changes to DEFAULT `.env` values like `API_SERVER_*` / `EMAIL_*` — those are default-only and should not be copied down.
5. **Idempotency.** Provisioning script must be re-runnable safely: re-install is a no-op (`plugins list` confirms), config-set with same value is a no-op, env-append only fires when key is absent. All writes must be check-then-apply-then-verify-readback (post-write `hermes -p <p> config get model.provider` to confirm).
6. **Credential handling.** `CHEAPER_INFERENCE_API_KEY` is already safely stored in default's `.env`. The provisioning script should read from there and append to per-profile `.env` — never inline the value in the UI, never echo it in logs.
7. **Config version skew.** Hermes config version is 49 on this box; a future Hermes update could change the meaning of `model.provider`. VidiFlow should pin to `hermes --version` when it first introspects and surface a "version drift" warning if the CLI version changes out from under it.

---

## What I did NOT touch
- No `config.yaml` or `.env` files were edited.
- No gateway was restarted, no kanban state was mutated.
- No code changes were made to vidiflow-hx — this is a proposal only; `/hx/providers`, `/api/fleet/*`, and the provisioning script **do not yet exist**.

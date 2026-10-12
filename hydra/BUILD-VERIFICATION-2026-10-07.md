# Hydra Panel — BUILD VERIFICATION RECORD

**Built by:** Mez (mez profile) · **Date:** 2026-10-07 · **Deadline:** 17:00 — met at ~16:12 EDT.
**Server:** `node ./node_modules/next/dist/bin/next dev -p 3100` (background, log `next-dev.log` in repo root). NOT port 3000 — that is a Google Maps MCP server.

## Files created

| Path | What it is |
|---|---|
| `src/app/api/hydra/route.ts` | Proxy: server-side fetch of /api/health /api/fleet /api/lanes /api/stack from 8790 + ledger read. live→snapshot→honest-failure tiering. |
| `src/app/api/hydra/policy/route.ts` | GET + PUT for `M:/code/VidiFlow/out/fleet/hydra_policy.json`. Validates target_lane against LIVE lanes (rejects at entry). RESTORE: prior_state recorded per write; `restore` action rolls back. |
| `src/app/hydra/page.tsx`, `layout.tsx` | Route + honest banner. Suppresses the global DEMO DATA badge (false label on a live page). |
| `src/components/hydra/HydraPanels.tsx` | Shell; exceptions-first section. |
| `src/components/hydra/PanelPriority.tsx` | PANEL 3. |
| `src/components/hydra/PanelRoutingIntel.tsx` | PANEL 2. |
| `src/components/hydra/PanelSmartGen.tsx` | PANEL 1. |
| `src/lib/hydraClient.ts` | Client hooks + source chips (LIVE/SNAPSHOT/UNREACHABLE). |
| `M:/code/VidiFlow/out/fleet/hydra_policy.json` | The policy write target (seeded empty). |
| `M:/code/VidiFlow/hydra/ARCHITECTURE-DIRECTIVE-2026-10-07.md` | James's rule: never recreate Hermes capabilities; bridge only. |

## Verification (all run by Mez, first-hand, 2026-10-07 15:45–16:12 EDT)

| Criterion (spec §6) | Result |
|---|---|
| 375/768/1440 zero horizontal overflow | PASS (scrollWidth == clientWidth at 375/776/1440) |
| Zero console errors | PASS (window error catcher: none) |
| Zero failed requests | PASS (25 resource entries, none ≥400) |
| All panels render real data | PASS — exceptions lead (6 services down listed first), priority queue from live profiles (vidibot jobs 1 / exec 133), 3 lanes with latency, routing chain from config.yaml (glm-5.3-flash primary), 4-row measured ledger, engine roster labelled NOT WIRED, decision log empty-with-reason |
| Write path end-to-end | PASS — add_rule persisted + read back (rule-1791403501883); invalid rule (nonexistent-lane) rejected at entry with live-lane list; RESTORE rolled back and stripped prior_state |
| Cost visible before spend | Shown as text gate; actual generate-button enablement is a follow-up (panel triggers no generation) |
| No fabricated values | PASS — every number sourced live or labelled spec-sourced/illustrative |

## Known-honest gaps (not defects, declared)

1. `route.py` still referenced by nothing — wiring it to dispatch is Hydra's next job, not tonight's.
2. Policy file nothing-consumes-yet caveat is displayed on the panel itself.
3. Per-lane throughput/saturation/cost-burn: not served by any endpoint — absent, not faked.
4. Ledger is the mobile prototype's 4 measured rows, labelled as not auto-appended.

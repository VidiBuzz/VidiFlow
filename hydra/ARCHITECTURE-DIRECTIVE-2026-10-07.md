# Hydra — ARCHITECTURE DIRECTIVE (James, 2026-10-07 ~15:45 EDT)

This file is law for all Hydra work. Written during the 5 PM panel build.

## The core rule

**Do not recreate anything that already exists in Hermes Agent.**

Hermes already has: agent profiles, routing config (`config.yaml`: model,
fallback_providers, custom_providers), the fleet dashboard API, execution
state, skills, dispatch. The Mez agents on the back end do the actual heavy
lifting. Hydra does not duplicate any of it.

## What Hydra is

Hydra is the **connective tissue** — a bridge layer, nothing more:

1. **Reads** from what already exists (fleet API 8790, routing config, agent
   state). Never forks a copy of it.
2. **Exposes** that state to the visual frontends: the VidiFlow app in the
   Hermes desktop, **VidiFlow.net**, and the future Android app. Hydra is
   literally the back end of the VidiFlow.net app and Android app.
3. **Prioritizing and switching** is Hydra's own primary role — routing work
   BETWEEN the existing agents, not replacing them. This is the one thing
   Hydra owns.
4. Snap judgment engines (the Laya lineage from the snap-judges study) will
   eventually drive the prioritization/switching decisions. **Not today.**
   Today: deterministic rules.

## What this means for the panel build

- The policy write surface edits/writes **on top of** Hermes's real config
  surfaces — it does not invent a parallel routing engine beside them.
- Everything the panels show must come from live Hermes/fleet state or be
  honestly labelled as spec-sourced. No parallel fixtures.
- If a feature would duplicate a Hermes capability, the question is always
  "how do we bridge to it", never "how do we rebuild it".

*Corrections to this file are allowed only by James or with his explicit
instruction in chat.*

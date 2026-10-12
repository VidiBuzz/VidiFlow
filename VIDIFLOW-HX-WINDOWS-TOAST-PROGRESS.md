# VidiFlow HX — Windows toast / progress UX (locked requirement)

**Date locked:** 2026-09-09  
**Owner lane:** VidiFlow HX  
**Source:** James → VidiBot (dictation note)

## Problem (current Grok Bot weakness)

Windows bottom-right message / toast / progress popups are **not informative enough**. A glance of ~2–3 seconds does not tell James whether he must intervene. Text-only (or opaque) status makes it hard to triage while working on desktop.

## Requirement

VidiFlow HX must **enhance or replace** those prompts with our own per-task progress system:

1. **Informative copy** — what happened / what’s running / what finished / what’s blocked (not vague “working…”).
2. **Progress affordance** — progress bar or equivalent staged indicator if the host allows; if OS toasts are text-only, design our own surface (tray app, overlay, glance tile) that can show real progress.
3. **3-second triage** — enough signal in a glance to decide: ignore vs open chat vs act now.
4. **HITL triggers** — explicit, high-visibility state when **human-in-the-loop is waiting on James right now** (approval, form, takeover, payment, 2FA, etc.). Distinct from background “still working” noise.
5. **Per-task identity** — each toast/row maps to a concrete task/agent so fleet work doesn’t blur together.

## Design notes (open)

- OS notification APIs may be text-only → may need a **custom Windows progress host** (system tray / small always-on-top panel / VidiFlow HX glance companion) fed by agent status packets.
- Severity / urgency levels: `info` | `progress` | `blocked-HITL` | `done` | `failed`.
- Deep-link or one-click jump into the relevant Grok Bot / agent thread.
- Align with planned VidiBot/VidiFlow fleet status board (status packets), not only OS toasts.

## Acceptance sketch

- [ ] HITL-waiting toast is visually distinct and unmistakable within 3 seconds  
- [ ] Non-HITL progress does not spam; updates are meaningful (step/phase, %)  
- [ ] User can tell agent + task + next action from the popup alone  
- [ ] Spec lives with VidiFlow HX implementation, not only chat memory  

## Related

- VidiBot as fleet ops lead; specialists emit status packets  
- Custom glance board planned (Grok Bot has no native multi-agent status screen)  

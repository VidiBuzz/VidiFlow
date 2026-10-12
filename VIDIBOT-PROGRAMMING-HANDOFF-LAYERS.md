# VidiBot programming handoff — layered protocol

**Locked:** 2026-09-09 (James → VidiBot)  
**Goal:** VidiBot manages from Grok Bot; **does not** burn expensive tokens on bulk coding. Cheap IDE agents (GLM-5.3-Flash) do implementation; VidiBot scopes, assigns, checks, and decides.

---

## IDE preference (locked)

| Rank | Tool | Role |
|------|------|------|
| **1** | **VS Code + Kilo Code** (OpenRouter → GLM-5.3-Flash) | Default coding worker |
| **1-alt** | **VS Code + Google Antigravity** | OK alternate agentic IDE lane ([docs](https://antigravity.google/docs/ide/extensions/vscode/)) |
| **3** | Cursor IDE / Cursor Cloud Agent | Only if James explicitly okays it — hard model switching, no preferred account |

Privacy lane (unchanged): local LAN **Qwen3.8-27B** (Ollama in Kilo) for proprietary drafts when cloud is not acceptable.

### Live cost note (verify on OpenRouter before big runs)
As of early Sep 2026 listings: **GLM-5.3-Flash** ≈ **$0.075 / 1M input** and **$0.250 / 1M output** on OpenRouter (Z.ai route), plus OpenRouter pay-as-you-go credit fee (~5.5%). James’s “~32¢/M” mental model ≈ output-heavy ballpark — always live-check [OpenRouter model page](https://openrouter.ai/) before quoting.

---

## Layers (who does what)

```
L0  James          — intent, priorities, HITL approvals, merge/ship
L1  VidiBot        — ops lead on Grok Bot: scope, packet, assign, check-back, escalate
L2  Spec agents    — optional research / docs / QA (Research, Debug Bot, etc.)
L3  IDE worker     — Kilo / Antigravity on VS Code with GLM-5.3-Flash (bulk code)
L4  Local private  — Qwen on LAN when PHI/proprietary prompts must stay on-prem
L5  Verify loop    — VidiBot (or QA Bot) re-checks against acceptance criteria
```

**Hard rule:** L1 never “does all the coding.” L1 writes the **job packet**, hands L3 the work, then **comes back** on a schedule or status ping.

---

## Job packet (minimum fields VidiBot sends to IDE)

1. **Repo / path** — e.g. `M:\code\<project>` or `/code/<project>` on vidi  
2. **Goal** — one paragraph outcome  
3. **Out of scope** — what not to touch  
4. **Acceptance criteria** — checklist (tests, files, URLs)  
5. **Model** — `GLM-5.3-Flash` via OpenRouter (or Antigravity model James picks)  
6. **Privacy** — cloud OK vs local Qwen only  
7. **Check-back** — when/how to report (status packet to VidiBot / Progress Stream)  
8. **HITL gates** — when James must approve (deploy, secrets, destructive git)

Save packets under `M:\code\VidiBot\handoffs\` as `HANDOFF-YYYY-MM-DD-<slug>.md`.

---

## Protocol steps (happy path)

1. **Intake** — James (or specialist) asks for a programming job in VidiBot chat.  
2. **Classify** — VidiBot decides: research-only (L2) vs implement (L3) vs private (L4).  
3. **Packet** — VidiBot writes handoff MD with acceptance criteria.  
4. **Dispatch** — James (or VidiBot via clear instruction) pastes/opens the packet in **Kilo Code** or **Antigravity** on the target workspace.  
   - *Near-term:* paste packet into IDE agent (manual bridge).  
   - *VidiFlow HX target:* status toast + one-click “Open in Kilo/Antigravity” + progress callbacks (see `VIDIFLOW-HX-WINDOWS-TOAST-PROGRESS.md`).  
5. **Run** — L3 works autonomously on cheap tokens.  
6. **Check-back** — L3 (or James) posts status packet: done / blocked / % / files changed.  
7. **Verify** — VidiBot reviews against acceptance criteria (spot-check, ask QA Bot, or James HITL).  
8. **Close or reloop** — merge, re-assign, or escalate.

---

## Status packet (L3 → L1)

```md
## Status: <job-id>
- state: running | blocked-HITL | done | failed
- % or phase: …
- files: …
- tests: …
- needs James: yes/no — why
- next: …
```

Aligns with fleet glance board + Windows toast severity: `progress` | `blocked-HITL` | `done` | `failed`.

---

## What stays on Grok Bot / VidiBot (expensive / high-judgment)

- Priorities across companies  
- Architecture / wedge decisions  
- Acceptance criteria and “is this good enough?”  
- HITL routing and fleet coordination  
- Docs that need live web accuracy gates  

## What goes to GLM-5.3-Flash in IDE

- Boilerplate, refactors, tests, UI pages, Docker glue, migrations  
- Multi-file mechanical edits  
- “Make it run locally” follow-through  

---

## Antigravity vs Kilo (when to pick)

- **Kilo + OpenRouter GLM-5.3-Flash** — default when cost control and model choice matter (James’s standing preference).  
- **Antigravity in VS Code** — when James wants Google’s agentic plan/diff UX in the same editor; still fine as L3 host, but pricing/models follow Antigravity entitlement, not OpenRouter cents.  
- Do **not** default to Cursor for this lane.

---

## Open build items (VidiFlow HX)

- [ ] Auto-open handoff packet in Kilo/Antigravity from VidiBot  
- [ ] Progress callbacks → Windows toast + glance board  
- [ ] HITL toast when IDE agent is waiting on James  
- [ ] Handoff folder + status packet schema enforced  

---

## Related docs

- `VIDIFLOW-HX-WINDOWS-TOAST-PROGRESS.md`  
- Standing stack: Kilo Code + OpenRouter GLM; local Qwen for privacy  

# VidiFlow Smart App — Revka + Kumiho Context Lock
**Date:** 2026-09-15  
**Owner:** James May / VidiFlow research  
**Status:** CRITICAL — required in final VidiFlow / Smart App

## Why
Accurate answers need **context**, not a cold LLM. Stateless chat invents or forgets company structure, agent state, client history, and prior decisions. The final VidiFlow smart app ships **Revka** (governed agent runtime) + **Kumiho** (graph-native persistent memory) so every answer can pull the right prior context first.

## Stack (locked)
| Layer | What | Canonical docs |
|---|---|---|
| **Revka** | Agent runtime, Operator workflows, audit, tool injection | https://revka.ai/ |
| **Kumiho** | Versioned graph memory backend (MCP sidecar) | https://revka.ai/docs/guides/kumiho-graph-memory/ |
| Memory tools | `kumiho_memory_engage` / `kumiho_memory_reflect` (+ operator mirrors) | https://revka.ai/docs/memory/kumiho-tools/ |
| Setup | `[kumiho]` in config; cloud or `local_ce` | https://revka.ai/docs/memory/kumiho-setup/ |

## Mandatory turn shape (accuracy gate)
```
user message
    → kumiho_memory_engage(query from THIS message)  → context + source_krefs
    → agent answers USING that context (+ live tools)
    → kumiho_memory_reflect(response, captures, source_krefs)
```

Hard rules:
1. **Engage before** any answer that might need history (org, agents, clients, prior decisions).
2. **Reflect after** substantive answers — store decisions/facts/corrections with absolute dates.
3. **Kumiho is canonical** for cross-session knowledge — not chat scrollback alone, not model “memory.”
4. If Kumiho is down: **fail closed** (answer without inventing history; log). Never fabricate prior context.
5. HX / Mission Control / 3D graph UI must visualize **real** Kumiho graph data in production.

## Sovereign / AirPMD note
Prefer **`local_ce`** (loopback Kumiho CE) for on-prem Smart Stack demos and healthcare-adjacent deployments. Hosted `api.kumiho.cloud` only when the customer accepts cloud memory.

## Ship checklist
- [ ] Revka in final VidiFlow smart-app runtime
- [ ] `[kumiho].enabled = true`; `revka doctor` / tools catalog shows memory tools
- [ ] Engage→answer→reflect in every user-facing agent harness
- [ ] Shared spaces for ~30-agent company fleets (`CognitiveMemory` / project spaces)
- [ ] UI graph bound to Kumiho (not mock “Kumiho Spatial Memory” labels only)
- [ ] No GA without this path for context-dependent Q&A

## Related
- Business plan §3.7: `VIDIFLOW-VIDISMART-BUSINESS-PLAN.md`

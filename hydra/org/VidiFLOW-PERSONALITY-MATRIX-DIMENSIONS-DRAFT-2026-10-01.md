# Kumiho personality modeling matrix — dimensions draft (top ~18)

**Date:** 2026-10-01 (James voice on VidiFlow HX call)  
**Status:** DRAFT — inspectable per-bot personalization rows for Kumiho relationship graph  
**Canonical milestone:** `KUMIHO-PERSONALITY-MODELING-MATRIX-MILESTONE-2026-10-01.md`  
**Brand:** VidiSmart / VidiFlow (V-I-D-I)  
**Spine:** Mez → Kumiho → Neo4j — no live without GO

Each row = a dimension stored per bot↔person (or per agent persona), viewable on Kumiho.

| # | Dimension | One-line rationale |
|---|-----------|-------------------|
| 1 | Comprehension level (talk up / talk down) | James core lock: match depth to the person |
| 2 | Pace (slower / faster) | Core lock: speech + reply timing per relationship |
| 3 | Vocabulary band | Jargon vs plain; Lexi/VidiBot don’t over/under-explain |
| 4 | Formality / warmth | Close vs professional tone with this person |
| 5 | Humor register | Duck-line humanizing OK vs off |
| 6 | Avatar presence mode | Talking-3D org chart: quiet headshot vs speaking |
| 7 | Speech style for avatars | Lip-sync energy, interruption, “alive” feel |
| 8 | Human-connection guard (HX / Air PMD) | Warn when AI may crowd out real relationships |
| 9 | Companion vs collaborator bias | Friend-like vs tool; Air PMD risk |
| 10 | Consent / intimacy ceiling | Allowed personal topics / self-disclosure |
| 11 | Preferred modalities | Text / voice / video avatar / visual-first |
| 12 | Domain expertise map | What they already know (stack, EquityGen, etc.) |
| 13 | Decision style | Options vs recommend; HITL vs just-do-it |
| 14 | Per-conversation overrides | Thread-local rules; don’t rewrite lasting matrix |
| 15 | Relationship graph edges | Role to agents (owner / peer / client) in Kumiho |
| 16 | Trust / correction history | How they like fixes and “you were wrong” |
| 17 | Escalation / handoff preference | Human or other agent vs stay in bot |
| 18 | Memory visibility | What of this matrix they can see/edit on Kumiho |

## Uncertain (flag for James)
- Exact scoring scales for #1–2 (ordinal? continuous?)
- Air PMD as product score vs hard guardrail
- “Revit” name → fold into Revka/Kumiho graph; no separate matrix row unless James clarifies

---
*Drafted on voice call 2026-10-01 by VidiFlow HX.*

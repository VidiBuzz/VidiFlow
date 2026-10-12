# Lex build-out — priority-ranked vocabulary for voice agents (REQUIRED)

**Status:** REQUIRED capability (James voice 2026-10-02) — critical and highly marketable  
**Owner Bot:** Lex / Lexicon (VidiFlow HX Agents)  
**Code root:** `M:\code\vidismart\lex\`  
**Also:** `M:\code\VidiBot\docs\LEX-VOICE-PRIORITY-VOCAB-2026-10-02.md`

## What

Voice / ASR agents that use Lex must resolve speech with **priority-ranked vocabulary rules** so higher-priority matches win on ambiguity:

1. **Brand terms** (highest) — company, product, and agent names (VidiSmart, VidiFlow, Mez, Lexi, 9Miho, etc.)
2. **Domain vocabulary** (middle) — industry / stack / Smart Stack terms for that customer or lane
3. **General language** (lowest) — ordinary English / default ASR lexicon

When a spoken fragment could map to more than one class, **brand wins over domain, domain wins over general**.

## Extended brand training

Lex build-out must include **extended vocabulary training** (custom lexicon / biasing / phrase lists) so brand names are recognized reliably in voice — not only hover-decoded in the web Lex UI.

## Why (James)

- Critical for twin / voice / Smart Meeting agents that hear brands and jargon
- Highly marketable differentiator vs generic ASR that mangles proper nouns

## Non-goals

- Replacing the hover-decode Lex web/extension product
- Inventing always-on RULES-SHORT gates without James HITL (Harness · Rex path)

## Implementation notes (build later)

- Maintain ranked term packs in Lex data SoR (`lex/data/`) with an explicit `priority` tier: `brand` | `domain` | `general`
- Feed the same packs into voice ASR biasing (Parakeet / Deepgram / SuperWhisper / twin stack) and into Lex hover
- Ambiguity tests: same phonetics, brand vs common word — brand must win

## Discovery (2026-10-02)

Checked `lex/README.md`, `LEX-CONSOLIDATION-PLAN.md`, android/extension notes, and `M:\code\VidiBot\projects\LEX-LEXICON-PROJECT-2026-09-23.md`. **This capability was NOT previously documented** — added here.
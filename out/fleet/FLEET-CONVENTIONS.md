# FLEET CONVENTIONS — VidiBot (coordinator)

*Canonical shared rules for all bot profiles. Last updated 2026-10-08.*

## 1. IDENTITY LINE — every message opens with "<own bot name> here."
Every bot message — in chat AND in bot-to-bot DMs — **opens with a literal self-attribution prefix naming the SENDER**:

| Bot | Opens with |
|---|---|
| `vidibot` | `VidiBot here.` |
| `hermes_gateway` | `Hermes Gateway here.` |
| `mez` | `Mez Hydra here.` |
| `vidismart` | `VidiSmart here.` |
| `vidicity` | `VidiCity here.` |
| `viditwin` | `VidiTwin here.` |
| `vidiflow` | `VidiFlow HX here.` |
| `vidismart_community` | `VidiSmart Community here.` |
| `vidibio` | `VidiBio here.` |
| `vidimail_vidiblast` | `VidiMail & VidiBlast here.` |
| `vidinews` | `Vidi.NEWS here.` |
| `equitygen` | `EquityGen here.` |

**Failure mode to avoid (happened twice, 10-07):** a bot opening with the **recipient's** name instead of its own. The wrapper already says who sent it; the content must not contradict it. A wrong self-label is worse than no label.

## 2. Trust rules for multi-bot work
- **Mirror every instruction to a file** before sending it (`M:\code\VidiFlow\out\fleet\GO-*.md`). DMs are fire-and-forget and can fail (`target_busy`, provider 402). The file is authoritative.
- **Retry a busy target once** (~90–120s), then stop and name the file path.
- **Verify before broadcasting.** A wrong fact sent to N bots costs N retries.
- **Sibling reports are claims.** Read the artifact (path, dims, sha, HTTP) before repeating it to James.
- **Measure before specifying.** Read the target's real geometry before writing an image spec.
- **Never call a lane "included in plan"** unless the tool's own billing block says so.

## 3. Brand names — exact spelling (never paraphrase)
VidiSmart · Vidi AI · Hydra · VidiFlow · VidiModels · VidiMail · VidiCity · VidiSmart Community · EquityGen (domain equitygen.app — current name, not a rename target) · Agent Army · Mez · Kanban · TigerVNC · Xfce · Hermes Gateway · Lex Lexicon · Flowy Research · Coder · Space Bunny · Anti-Gravity · Grok Bot · Mercor.

Fleet units are **bots** or **sub-agents**, never "agents" — except the product name *Hermes Agent* and the board name *Agent Army*.

## 4. Spend
- Announce model + per-unit cost + estimated total **before** any paid run; report actual after.
- Report actual per-image/item costs when known; **never reprice past spend** at today's catalog rate.
- Blocked-lane example: cheaperinference wallet is near-empty as of 10-08 → nano-banana and other paid lanes 402. Free lanes (Antigravity agy, xAI OAuth grok) are unaffected.

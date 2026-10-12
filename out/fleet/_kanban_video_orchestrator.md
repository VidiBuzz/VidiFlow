# Smart Stack addition — Kanban Video Orchestrator

Date: 2026-10-07 · James: "kanban video orchestrator will be key in our video stack for smart channel — add to our smart stack"

## What it is

A video-production pipeline that uses Hermes' existing **kanban task system as the
orchestration layer**: every step of a video job (script → generate → render → review →
deliver) is a kanban card that moves through statuses (`queued → claimed → running →
done/blocked`) with workers doing the actual work.

The kanban machinery already exists and is battle-tested: SQLite tables for tasks,
links (parent/child — i.e. a video job can be a tree of subtasks), runs, events,
attachments, comments, and notification subscriptions. It has worker claiming with
heartbeat + max-runtime + retries, idempotency keys, and blocking (block_kind /
block_recurrences). That's a real job orchestrator — the video stack just supplies the
job types.

## Why this fits Smart Channel CX specifically

Per-customer video means many similar jobs with per-job parameters. Kanban gives, for
free: batch fan-out (one parent card "October campaign, 1,000 customers" → 1,000 child
cards), per-card status anyone can see, retry semantics for the cards that fail review,
and an audit trail (task_events) — the observation layer James asked for and doesn't
have yet.

## The pipeline stages as card types

| Stage | Card type | Does | Status today |
|---|---|---|---|
| 1. Brief | parent card | customer data + message copy | — |
| 2. Prompt | child card | brief → image prompts | prompts authored manually today |
| 3. Generate | child card | Mage-Flow Turbo via ComfyUI (4s/img) | verified, tested |
| 3b. Meme variant | child card | meme-generation skill: template or Mage-Flow scene + caption overlay | verified 2026-10-11 |
| 4. Compose | child card | cutout + composite (rembg) | tested, compositor bug half-fixed |
| 5. Timeline | child card | Remotion assembly | assessed (report exists), not installed |
| 6. Render | child card | Remotion render → MP4 + poster | not installed |
| 7. Review | child card | checker agent scores output; fail → requeue | the loop James wants |
| 8. Deliver | child card | VidiBlast send (hosted MP4 + poster link) | VidiBlast exists |

## What exists on disk already

- `M:\code\VidiBot\vidiflow-hx` — the HX app (Next.js)
- `M:\code\VidiFlow\out\fleet\_video_editor_assessment.md` — the Remotion decision
- `M:\code\vidiflow\out\fleet\_comfyui_image_stack.md` — verified image stack + graphs
- `M:\code\ComfyUI\tools_cx_render.py` — headless single-image renderer
- `M:\code\ComfyUI\tools_cx_composite.py` — cutout/composite (has a known bug in `place()`)
- Kanban DBs: `hermes/kanban-export/<board>/kanban.db` (schema live, 0 rows — unused so far)

## Open decisions (James's call)

1. **Where the orchestrator lives** — a new board (`kanban-export/video/kanban.db`)
   or inside `projects-in-process`?
2. **Who the workers are** — which Hermes profiles pick up generate/render/review cards
   (mez + vidismart have `image_gen`; the renders themselves need the GPU box at night
   per the no-daytime-rule).
3. **GPU gating** — ComfyUI only runs when approved. Orchestrator must treat GPU
   stages as night-shift work or request approval per batch.
4. **Review gate** — what the checker measures (text accuracy? brand palette? identity
   preservation?) before a card can move to Deliver.
5. **Remotion install** — not yet on the box; timeline+render stages are blocked on it.

## Smallest first vertical slice

One campaign card → 3 customer children → generate (Mage-Flow) → composite → review
screenshot → mark done. No Remotion yet, no delivery yet: prove the cards move and the
artefacts land on disk where a human can see them (screenshots per James's rule).

# VidiBot Workspace Sync Workflow (vADP-2)

## Goal
Grok Bot ("VidiBot") keeps its durable files in its cloud `/workspace`; `M:\code\vidibot` is the local mirror and single handoff surface between the Grok-side bot army and the GLM 5.3 Flash / Kilo executor. GLM reads only from `M:\code\vidibot`.

## Researched facts (official docs, docs.x.ai/grok-bot/)
1. **The Bot workspace is a cloud computer, not a drive.** Grok Bot runs on a persistent cloud computer assigned to the user account: "The Grok Bot cloud computer is separate from the Mac or Windows computer in front of you." `/workspace` exists only on that VM — no mount, no drive letter.
2. **All Bots on the account share ONE cloud computer.** Bots hand off to each other via project folders at `/workspace` ("Bots can read files other Bots save in `/workspace`").
3. **No built-in cloud→disk sync.** Files exit as artifact cards in the conversation: "Open a card to preview supported formats. You can then save the file."
4. **Local execution is a documented capability:** Settings → General → Agent → *Execution on Local Computer* (Never / Ask every time [default] / Always allowed). This is the only documented way a Bot writes directly to `M:\code\vidibot`.
5. **Routines** (scheduled bot runs) exist and can be paused/deleted — usable for periodic pushes.
6. **Security boundary = the account, not the Bot.** All account Bots share the cloud computer; never put secrets in `/workspace`.
7. Separate product: **Grok Build** (open-source CLI, `xai-org/grok-build`) runs locally with real filesystem + kernel sandbox profiles — fallback if Bot-app handoff proves unreliable.

## Architecture
```
Grok cloud computer (/workspace/vidismart/...)
        │  (A) artifact cards → James saves        (manual, guaranteed)
        │  (B) approved local command writes       (semi-auto, policy-gated)
        ▼
M:\code\vidibot\                       ← master local mirror
├── inbox\                             ← material pasted/attached FOR Grok
├── vidismart\                         ← project folders mirrored from /workspace
└── agents\<project>\<bot>.json        ← vADP-1 per-bot JSON (live state per bot)
        │
        ▼  tools/vidibot_watch.ps1 (FS watcher)
Kilo / GLM 5.3 Flash executor (reads task JSONs, writes report JSONs back)
        │
        ▼
VidiFlow dashboard (agentarmy/agents-live rendering reads M:\code\vidibot\agents\)
```

## Envelope (unchanged from vADP-1)
One JSON per bot per project; fields: `protocol: "vADP-1"`, `from`, `project`, `type` (`task|report|question|artifact`), `id`, `created`, `body`, optional `emits`, and `=== file: path ===` blocks for code the watcher splits out.

## VidiBot system prompt (paste into Bot config)
- Durable files live in `/workspace/vidismart/<topic>/` with descriptive names.
- Every task ends with a vADP-1 JSON artifact card as the final message (always, even if the local write failed).
- If local execution is approved: also write the same JSON to `M:\code\vidibot\agents\<project>\<botname>.json` and any code blocks to their `file:` paths.
- Plans/research only — execution belongs to GLM/Kilo; never modify code outside `M:\code\vidibot\`.
- Never place credentials in `/workspace`.

## Tasks
1. Create `M:\code\vidibot\` with `inbox\`, `vidismart\`, `agents\` subfolders.
2. Configure VidiBot in Grok Bot with the system prompt above (user action in the Grok app).
3. Mode A (default, zero risk): artifact cards are the delivery — save each vADP-1 JSON card into `M:\code\vidibot\agents\<project>\`.
4. Mode B (optional): set *Execution on Local Computer* → Ask every time; approve the write command per task. Escalate to Always-allowed only via a narrow Auto Review rule (e.g. "Always allow writing under M:\code\vidibot").
5. Write `tools/vidibot_watch.ps1`: FileSystemWatcher on `M:\code\vidibot\agents\**\*.json`; validate with `C:\Python314\python.exe -c "import json;json.load(...)"`; split `=== file: path ===` blocks into the repo; log to `M:\code\vidibot\watch.log`. Port of `handoff_watch.ps1` from `plans/grok-glm-setup-kit.md`.
6. Update `plans/grok-glm-setup-kit.md`: replace the `handoff/` root with `M:\code\vidibot\agents\`; keep envelope schema; document Mode A/B.
7. Point `vidismart-dashboard.html` / VidiFlow live feed at `M:\code\vidibot\agents\` (replaces the single-blob `agents-live.json` pattern — each bot JSON is its own feed, per vADP-1).

## Failure modes
- **No sync service exists** — the mirror is event-driven (cards saved / approved writes), not continuous. Cloud deletions do not propagate; treat local mirror as append-oriented.
- **Mode B is command execution on the user's PC** — keep "Ask every time"; never approve unrecognized commands; never paste secrets in chat.
- **Local writes are best-effort** — the card is the guaranteed fallback; the prompt mandates always emitting the card.
- **Shared cloud computer** — cross-bot file visibility is by design; keep secrets out.

## Validation
1. Test task: "Create /workspace/vidismart/test/hello.json with a vADP-1 envelope and write it to M:\code\vidibot\agents\test\vidibot.json" → verify both the card and the local file.
2. Run `tools/vidibot_watch.ps1`, drop the JSON in, confirm validation and file splitting.
3. Confirm GLM/Kilo picks up a task JSON, writes its report back to `M:\code\vidibot\agents\`, and it shows in the dashboard feed.

## Out of scope
- Grok Imagine automation (manual UI generation stays).
- Grok Build CLI setup (fallback; separate plan if needed).
- Two-way sync into cloud `/workspace` (handled by attachments/inbox paste).

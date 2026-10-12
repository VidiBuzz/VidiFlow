# hydra/org — consolidated backend-process documents (2026-10-07, by Mez)

Copied, not moved. Canonical originals stay where they live (paths below).
Update originals first; re-copy here on change.

| File here | Canonical original | Note |
|---|---|---|
| AGENT_ORG.html | M:/code/VidiFlow/vidiflow/AGENT_ORG.html | NEWEST copy (Sep 26). The vidiflow-hx/public copy (Sep 19) is older and divergent — not canonical. |
| profile-architecture.html | M:/code/VidiFlow/profile-architecture.html | newest of its set (Oct 6) |
| BOT-ROSTER.md | M:/code/VidiBot/BOT-ROSTER.md | |
| HERMES-FLEET-MAPPING.json | M:/code/VidiBot/HERMES-FLEET-MAPPING.json | |
| personality_matrix_hexagon.png | M:/code/viditwin/images/personality_matrix_hexagon.png | |
| VidiFLOW-PERSONALITY-MATRIX-DIMENSIONS-DRAFT-2026-10-01.md | M:/code/VidiFlow/vidiflow/VidiFLOW-PERSONALITY-MATRIX-DIMENSIONS-DRAFT-2026-10-01.md | |

hydra/services/embedding_service — copied from M:/code/VidiFlow/out/fleet/embedding_service (excl. __pycache__/.venv — the .venv is ~3.5 GB and the models dir ~1.2 GB; copy CODE ONLY, never the venv).
hydra/process — backend process management, copied 2026-10-07 (checksums verified):
  fleet_dashboard.py ⚠ LIVE SERVICE on 127.0.0.1:8790 (PID 61396) — reference copy only; edit the original, never "fix" the copy and expect effect.
  sync_model_fleet.py · VIDIBOT-PORT-CONFLICT-SOLUTION-2026-10-05.md · VIDIBOT-PROGRAMMING-HANDOFF-LAYERS.md
LANES-CHEAPERINFERENCE-2026-10-07.md (repo root of hydra) — verified lane list: 97 models, 3 live-tested, rest catalogued-only; distinguish LIVE-TESTED / CATALOGUED / DOWN in any UI.

⚠ Referenced-path caution: profiles/vidibot/profile.yaml's description points at
M:\code\VidiBot\BOT-ROSTER.md and HERMES-FLEET-MAPPING.json. The canonical
originals therefore STAY in VidiBot\ — the copies here are reference snapshots.
If those files ever move, update that profile.yaml description in the same change.

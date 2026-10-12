# vidiflow-cloud-agents

Smart VidiFlow cloud agents on **Cloudflare Agent OS** (`@cloudflare/computer`, announced 2026-08-03, MIT, early preview).

Each agent is a Durable Object with its own computer: a SQLite-backed virtual filesystem plus execution backends (fast isolates via just-bash, or full Linux containers via FUSE mount). Workspaces are primed from the **R2 bucket `vidismart`** — the media server served at **https://cdn.vidi.news**.

## Stack

| Piece | What it does |
|---|---|
| `@cloudflare/computer` | Workspace (virtual FS) + `read`/`write`/`edit`/`ls`/`exec` tools |
| `@cloudflare/think` | Agent loop on Durable Objects |
| `workers-ai-provider` | Workers AI models (swap for LM Studio bridge later) |
| R2 binding `MEDIA` | Bucket `vidismart` = cdn.vidi.news media |

## Endpoints

- `GET /health` — liveness
- `POST /agents/:name/task` — body `{ "prompt": "...", "mediaPrefix?": "brandswap/" }` → primes workspace with a media manifest from R2, runs the agent, returns the result

## Run

```bash
npm install
npm run dev        # local dev (wrangler dev)
npm run deploy     # deploy to Cloudflare (needs wrangler login)
```

Live: `https://vidiflow-cloud-agents.vidiflow-cloud-agents.workers.dev`

```bash
curl -X POST .../agents/<name>/task -H "Content-Type: application/json" \
  -d '{"prompt":"...", "mediaPrefix":"brandswap/"}'
```

Requirements: Workers Paid plan for the container backend and large models
(glm-5.2, kimi-k2.7, ...). The Free plan runs the isolate backend with
`@cf/openai/gpt-oss-20b` (tool-calling capable) — verified end-to-end.

## Notes

- **Preview-only package** — APIs are unstable. This is an experimental track; the local Hermes fleet remains the production runtime.
- Container backend (ffmpeg etc.): add a `containers` section to `wrangler.jsonc` and wire `CloudflareContainerBackend` per the @cloudflare/computer README.
- Bridge to local LM Studio (Qwen3.6-27B) is possible through the existing `cloudflared-vidi-cloud` tunnel instead of Workers AI.
- Register cloud agents in the fleet control plane (`agent-backend /api/fleet/agents`, `provider: "cloudflare"`) so the VidiFlow dashboard shows local + cloud agents in one grid.

# VidiSmart KB Connector

Syncs your self-hosted AppFlowy notes (VidiFlow at `cloud.0human.net`) into a
local knowledgebase that the smart media / relationship-graph system can query.
Read-only against AppFlowy — nothing is written to your notes. No Notion, no
Obsidian, and AppFlowy's built-in AI/graph features are not used.

## Why this works

The self-hosted AppFlowy-Cloud exposes a private REST API that your own stack
can consume:

| Step | Endpoint |
|---|---|
| Login (service account) | `POST /gotrune/token?grant_type=password` |
| Profile | `GET /api/user/profile` |
| Workspaces | `GET /api/workspace` |
| Page tree | `GET /api/workspace/{wid}/folder` |
| Page + document collab | `GET /api/workspace/{wid}/page-view/{view_id}` |
| Batch text collabs | `POST /api/workspace/{wid}/collab_list` |

Documents come back as `encoded_collab` (yrs/Yjs binary). This connector
decodes them with `yjs` and renders **markdown**, preserving the block tree:
paragraphs, headings, lists, todos, quotes, callouts, code, math, images.

## Setup (done 2026-09-16)

1. Service account created via GoTrue admin API:
   - email: `kbservice@vidiflow.local`
   - password: stored in `kb-connector/.env.local` (chmod 600)
2. Verified end-to-end: login → profile → workspace → folder → page read → collab decode.

## Usage

```bash
cd /mnt/m/code/vidismart/vidiflow/kb-connector
export KB_PASSWORD=$(grep ^KB_PASSWORD .env.local | cut -d= -f2)
node test-connection.mjs   # connectivity + permission check
node sync.mjs              # full sync -> ./data/kb-index.json + ./data/kb/*.md
```

## Output (consumed by your graph builder)

- `data/kb/<workspace>/*.md` — one markdown file per page, with YAML-ish header
  (`view_id`, workspace, breadcrumb path, last_edited) for provenance.
- `data/kb-index.json` — machine index:
  `{ generated_at, base_url, account, workspaces: [{ workspace_id, workspace_name,
  documents: [{ view_id, title, path, markdown_file, text_collab_ids, last_edited }] }] }`

Your smart media upgrade system builds its own relationship graphs from this
index + markdown (structural parent/child edges are in `path`; semantic edges
are yours to derive — embeddings, entity extraction, etc.).

## One manual step

The service account can only read workspaces it belongs to. In AppFlowy (as
workspace owner): open each workspace → Share → invite `kbservice@vidiflow.local`
as Editor or Owner. After inviting, run `node sync.mjs`.

To invite via API instead, use an owner account and:
`POST /api/workspace/{wid}/invite` with `{"emails":["kbservice@vidiflow.local"]}`.

## Notes

- Secrets: `.env.local` holds the service password — never commit it.
- If the live instance rotates its JWT secret or DB, only re-run setup.
- Rate limits: sync fetches page-by-page; fine for thousands of pages.
- Tunnel config: earlier today `vidiflow.net` ingress was added to the
  `vidi-cloud` tunnel, then removed again after `vidiflow.net` got its own
  DNS + static site; `cloud.0human.net` and `vidicrm.com` unchanged.

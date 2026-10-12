# LEX — one folder, one app

Browser extension + web app that decodes tech terms in any document and lets users
assemble their own **Smart Stack** (their own plan built from the terms, brands, and
products they save).

**Deploy target: `https://vidiflow.net/lex`** — this `lex/` folder IS the site root.
`lex/app/` maps to the `/lex` URL path.

## Structure

```
lex/
├── README.md            ← this file: structure + deploy map
├── favicon.ico
├── app/                 ← THE WEB APP (served at https://vidiflow.net/lex)
│   ├── index.html       ← full app: dictionary + VidiTwins + Smart Stack Builder + Flow Graph
│   ├── manifesto.html   ← Lexi manifesto page
│   └── assets/          ← css, js, images/lexi/ concept art, viditwin avatars, favicon
├── extension/           ← Chrome MV3 extension ("Lexi") — load unpacked from this folder
│   ├── manifest.json    ← v1.0.0, storage permission, content script on <all_urls>
│   ├── data.js          ← BUNDLED 13-term dictionary (build artifact — see data/seed-unified.json)
│   ├── content.js       ← hover-decode engine for any web document
│   ├── popup.html/js    ← saved terms + Smart Stack export
│   └── icons/
├── data/                ← single source of truth for term data
│   ├── lexi_master_terms.json   ← master v1 terms (Dragonfly, Valkey, SaaS)
│   ├── seed-unified.json        ← canonical 15 merged terms (rebuilt by pipeline)
│   ├── prompt-pack.json         ← per-term image/video generation prompts
│   ├── scene-spec.schema.json   ← scene spec JSON Schema (H3 render contract)
│   ├── scene-spec.example.json
│   └── scene-specs/             ← per-term locked scene specs
├── pipeline/            ← generation/ETL tooling (scripts only, not served)
│   ├── build_prompt_pack.py     ← rebuilds data/seed-unified.json + prompt-pack.json
│   ├── make_scene_spec.py       ← scene-spec skeleton generator (validated vs schema)
│   ├── bootstrap_index.py, etl_*.py, probe_*.py
│   ├── 0010_lexi_terms_media.sql ← Directus migration: scene_spec/quality/video_status
│   ├── smartstack-schema.sql
│   └── data/            ← raw datasets (parquet/duckdb ~550 MB, NEVER committed)
└── legacy/              ← older variants kept for reference (not served)
    ├── builder.html + ai-engine.js   ← standalone SmartStack builder (Supabase unconfigured)
    ├── smartstack.html, smart_stack_builder.html, smart-stack-preview.html
    └── Ai_SmartStack_2.0.html
```

## Data flow (single source of truth)

1. `lex/data/seed-unified.json` is canonical (15 terms).
2. `C:\Python314\python.exe lex/pipeline/build_prompt_pack.py` regenerates it from
   `lex/extension/data.js` + `lex/data/lexi_master_terms.json` and writes the prompt pack.
3. `lex/extension/data.js` is a **bundled artifact** for offline hover decode (13 terms);
   the web app carries its own embedded copy of the 16-term set.
4. Production terms come from Directus `lexi_terms` (server 192.168.4.40:8055) → R2
   `vidismart` bucket → `https://cdn.vidi.news/images/lexi/<ACR>.jpg`.
5. Scene specs (`lex/data/scene-specs/*.json`) feed the video pipeline (LTX Desktop draft →
   H3 local render); validate every spec against `scene-spec.schema.json` before it enters
   `lexi_terms.scene_spec`.

## Serving /lex (VidiFlow.net)

Local dev (Windows):
```
C:\Python314\python.exe -m http.server 8039 --directory lex
# app:  http://localhost:8039/app/   (index.html is the app)
```

Production (Ubuntu 192.168.4.40, nginx already serves the community site):
```nginx
location /lex/ {
    alias /opt/vidismart/web/lex/app/;   # copy lex/app/* here
    index index.html;
}
```
`vidiflow.net` still needs the named-tunnel token + DNS CNAME decision (open item in
`plans/` — see `vidiflow/lex-plan-out.md` §6). Until routed, the quick-tunnel URL serves it.

## Extension install (load unpacked)

1. Chrome → `chrome://extensions` → Developer mode ON.
2. "Load unpacked" → select `M:\code\vidismart\lex\extension`.
3. Hover any acronym on any page for the visual decode; save terms to your Smart Stack;
   export the stack package from the popup.

## Rules

- All new LEX code/data goes in THIS folder. Never recreate `lexi-extension/`,
  `lexi-pipeline/`, or root `smartstack*` files.
- Repo `.gitignore` ignores `*.json` globally (secrets rule) — negations for
  `!lex/data/*.json` are already in place; do not commit `lex/pipeline/data/`.
- See `M:\code\vidismart\AGENTS.md` § "LEX app — consolidated structure" for the
  agent-facing rules.

## Voice agents (required)

Priority-ranked vocabulary (brand > domain > general) + extended brand training: [docs/LEX-VOICE-PRIORITY-VOCAB-2026-10-02.md](docs/LEX-VOICE-PRIORITY-VOCAB-2026-10-02.md).


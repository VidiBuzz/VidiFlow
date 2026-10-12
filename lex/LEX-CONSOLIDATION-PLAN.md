# LEX Consolidation Plan — single root now: `m/code/vidiflow/lex` (moved 2026-10-07)

Date: 2026-10-01
Status: DONE 2026-10-01 — all moves executed with sha256 verify, backup at `lex-backup-20261001/` (excl `pipeline/data/`)
Rule (from `lex/README.md`): All new LEX code/data goes in THIS folder. Never recreate `lexi-extension/`, `lexi-pipeline/`, or root `smartstack*` files.

## 1. Target (keep as canonical)

`M:\code\vidismart\lex\` = `/mnt/m/code/vidismart/lex/` (574M total, ~550M is git-ignored `pipeline/data/*.parquet/duckdb`)

- `app/` — web app served at `https://vidiflow.net/lex` (`index.html`, `manifesto.html`, `assets/`, `builder.html`)
- `extension/` — Chrome MV3 source (`manifest.json` v1.0.0, `data.js`, `content.js`, `popup.html/js`, `tooltip.css`, `icons/`)
- `data/` — source of truth (`seed-unified.json` 15 terms, `lexi_master_terms.json`, `prompt-pack.json`, `scene-specs/`)
- `pipeline/` — scripts + `0010_*.sql`, `smartstack-schema.sql` (never commit `pipeline/data/`)
- `legacy/` — old variants for reference only
- `README.md`, `favicon.ico`

## 2. Sources to consolidate (outside `lex/`)

| # | Source on M: | Size | Disposition |
|---|--------------|------|-------------|
| 1 | `m/code/VidiBot/lex/` (`vidiflow-lex.html`, `shots/` 3 pngs, 2 avatars) | 3.9M | Move `vidiflow-lex.html` → `lex/legacy/` (or `lex/app/` if live); `shots/` → `lex/app/assets/images/lexi/shots/`; avatars → `lex/app/assets/images/lexi-max/` if missing |
| 2 | `m/code/VidiBot/lexi-max/` (5 pngs) | 1.4M | Move → `lex/app/assets/images/lexi-max/` (skip duplicates by hash) |
| 3 | `m/code/vidismart/lex-workbench.html` | 7.4K | Move → `lex/lex-workbench.html` (serves `lex/` index) |
| 4 | `m/code/vidismart/publish-lexi.cmd` + `publish-lexi.ps1` | 0.4K + 7.5K | Move → `lex/publish-lexi.cmd` + `lex/publish-lexi.ps1` |
| 5 | `m/code/vidismart/vidiflow_lex_*.png` (4) + `live-lexi-max-announcement.png` | small | Move → `lex/app/assets/images/` |
| 6 | `m/code/vidismart/LEXTraining.ai-agent-skills-gap-analysis.pdf` | — | Move → `lex/docs/` (create) |
| 7 | `m/code/vidismart/downloads/lexi-extension-v1.zip` (32K, 9 files) | 32K | Copy → `lex/extension/dist/lexi-extension-v1.zip`; source of truth stays `lex/extension/` |
| 8 | `m/lexi.png`, `m/lexi-max-meeting-ui.png` | small | Move → `lex/app/assets/images/lexi-max/` if not dupes, else delete strays |
| 9 | `~/Documents/Default Project/lexi-pipeline/` (Linux, stale predecessor) | 72K | DO NOT MERGE CODE. Archive/leave; `lex/` already supersedes it |

## 3. Keep in place (pointer only, do not move)

- `m/code/vidismart/images/lexi/` (52K old assets) — referenced elsewhere
- `m/code/vidismart/monetization/vidiflow-lex*.html` + `test_lexi.mp3` — monetization surface
- `m/code/vidismart/plans/lex*.md` (6 files) — planning history
- `m/code/vidismart/tools/*lex*.py` (3 files) — tooling
- `m/code/vidismart/icons_public_html_ARCHIVE_*` — archive
- `lex/pipeline/data/` blobs — git-ignored, never commit

## 4. Execution steps (when approved)

1. Backup: `robocopy M:\code\vidismart\lex M:\code\vidismart\lex-backup-YYYYMMDD /E` (Windows) or `cp -a` on Linux.
2. `mkdir lex\docs lex\extension\dist` as needed.
3. Move per table §2 with hash check (`fciv` / `sha256sum`) to skip dupes.
4. Leave behind `MOVED-TO-LEX.txt` shims in `VidiBot/lex/`, `VidiBot/lexi-max/`, and `vidismart/` root pointing to new paths.
5. Re-test: `python -m http.server 8039 --directory lex` → `http://localhost:8039/app/`; Chrome `chrome://extensions` → Load unpacked `lex/extension`.
6. Optional prod: copy `lex/app/*` → `/opt/vidismart/web/lex/app/` + nginx `location /lex/`.
7. Delete originals only after verified + backup confirmed.

## 6. Result 2026-10-01

- 22 source files deleted after verified copy (5 dupes skipped by hash, 17 copied).
- Verified: `python3 -m http.server 8039 --directory lex` → `GET /app/` 200, `GET /extension/manifest.json` 200, manifest `Lexi 1.0.0` valid.
- Shims: `VidiBot/lex/MOVED-TO-LEX.txt`, `VidiBot/lexi-max/MOVED-TO-LEX.txt`, `vidismart/MOVED-TO-LEX.txt`.
- Kept: `downloads/lexi-extension-v1.zip` original (mirrored to `lex/extension/dist/`).
- Note: `lex/android/` (M0 native client, 2026-09-28) left untouched — ships `lex/data/seed-unified.json` as asset.

## 7. Relocation 2026-10-07 + design pass

- Full move `m/code/vidismart/lex` → `m/code/vidiflow/lex` per owner (copy-verify: 163 files, 8 critical sha256 PASS).
  Direct rename blocked (source busy); rsync copy used. NOTE: `vidismart/lex/app` would not delete
  (`Device or resource busy` — close IDE/Explorer handles on the Windows host, then remove the stale
  `vidismart/lex/` tree manually; canonical is now `vidiflow/lex/`).
- Serving: `python3 -m http.server 8039 --directory m/code/vidiflow/lex` → `/app/` 200, `style.css` 200.
- Design: fixed dead mobile drawer (`.sidebar.is-open`/`.nav-scrim` CSS existed with no opener —
  added floating ☰ toggle + scrim/Escape/link-to-close, `node --check` clean), plus additive
  tablet/phone polish in `app/assets/css/style.css` (safe-area, 44px touch targets, focus-visible,
  keyboard dropdowns, responsive media, reduced-motion).

## 5. Open decisions

- Delete vs. keep shims in `VidiBot/*` after move?
- `vidiflow-lex.html` (VidiBot) — live page or legacy?
- Commit `lex/*.json` negations already in `.gitignore` — verify before `git add`.

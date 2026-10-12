# VidiFlow folder map

- Date: 2026-10-03, snapshot about 8:05 AM ET
- Path: M:\code\VidiFlow
- Machine: V20
- Read-only inventory. Nothing in the tree was deleted, moved, or rewritten. This file is the only new write (copied once to VidiBot docs).

## What this folder is

M:\code\VidiFlow is an AppFlowy fork plus later VidiFlow notes and a few small project folders. Upstream pieces are still here: LICENSE, CHANGELOG, CODE_OF_CONDUCT, README, ROADMAP, doc, .github, .githooks, frontend (appflowy_flutter and rust-lib), a flutter SDK, a dart-sdk, and project.inlang. On top of that are VidiFlow customization notes, theme and logo files, zip backups, an installer exe, a small vidflow android/backend/docs slice, vidipitch, supergrok-explainers, and an mcp-playwright-server.

It is not a clean dump of the leftover that had been under VidiSmart. That leftover is still mostly under M:\code\vidismart. See Open mess.

Counts at the top level: 15 directories, 46 files (61 children). Not about 20 subfolders.

Folder timestamps:

- Created: 2025-11-15 11:45 PM ET
- Last write on the folder itself: 2026-10-03 8:00:21 AM ET
- M:\code\vidismart last write is the same second (2026-10-03 8:00:21 AM ET)
- No current child of M:\code\VidiFlow has that 8:00:21 AM timestamp, so the parent stamp is not a new folder sitting in the listing

## Newly moved folder

No top-level folder looks like a docs dump that landed this morning.

The newest handful by LastWriteTime:

| Order | Name | Kind | Last write (ET) | Note |
| --- | --- | --- | --- | --- |
| 1 | .git | dir | 2026-10-03 7:19 AM | git metadata touched today, not a moved project |
| 2 | vidflow | dir | 2026-10-01 12:18 PM | newest project folder |
| 3 | supergrok-explainers | dir | 2026-09-06 10:28 PM | three pngs |
| 4 | dart-sdk | dir | 2026-03-20 2:58 PM | SDK tree |
| 5 | vidipitch | dir | 2026-03-13 2:36 PM | small pitch app |
| 6 | mcp-playwright-server | dir | 2026-03-12 8:29 PM | small node server |
| 7 | flutter | dir | 2026-03-12 5:27 PM | Flutter SDK, not opened |

Callout: `vidflow` is the newest project folder (created 2026-09-16 4:09 AM ET, last write 2026-10-01 12:18 PM ET). It is a small android/backend/docs slice, not a ~20-folder move. The larger tree named vidiflow is still at M:\code\vidismart\vidiflow (last write 2026-10-01 12:42 PM ET; 12 directories and 63 files at that one level).

## Top-level directories

One level only. flutter, node_modules, and .git were not recursed.

| Name | Last write (ET) | What it appears to be |
| --- | --- | --- |
| .git | 2026-10-03 7:19 AM | Git metadata. Exists. Immediate children: 6 dirs, 9 files. Not listed further. |
| .githooks | 2025-11-15 11:45 PM | AppFlowy git hooks: commit-msg, pre-commit, pre-push. |
| .github | 2025-11-15 11:45 PM | Upstream GitHub metadata: actions, ISSUE_TEMPLATE, workflows, FUNDING.yml, PULL_REQUEST_TEMPLATE.md. |
| appflowy_flutter | 2026-01-25 1:44 AM | Only immediate child is `packages`. Partial AppFlowy Flutter tree. Deeper contents not listed. |
| dart-sdk | 2026-03-20 2:58 PM | Dart SDK: bin, include, lib, plus LICENSE, README, revision, version, sdk_packages.yaml, dartdoc_options.yaml. |
| doc | 2025-11-15 11:45 PM | Upstream docs: imgs, readme, CONTRIBUTING.md, roadmap.md. |
| flutter | 2026-03-12 5:27 PM | Flutter SDK. Exists. Immediate children: 13 dirs, 19 files. Not recursed. |
| frontend | 2026-01-27 1:42 PM | AppFlowy frontend. Dirs: .vscode, appflowy_flutter, protoc, resources, rust-lib, scripts, toolsprotoc, and one folder whose name displayed as m?codetoolsprotoc. Files include Makefile.toml, rust-toolchain.toml, build_backend.bat, several build error logs, pub_err.log, and %TEMP%protoc.zip. |
| mcp-playwright-server | 2026-03-12 8:29 PM | Small Playwright MCP server: index.js, package.json, README.md, cline_mcp_settings.json, kilocode_mcp_settings.json. |
| node_modules | 2026-03-12 4:41 PM | Dependencies. Exists. Immediate children: 65 dirs, 1 file. Not recursed. |
| project.inlang | 2025-11-15 11:46 PM | inlang localization config: project_id, settings.json. |
| supergrok-explainers | 2026-09-06 10:28 PM | Three pngs: 01-supergrok-two-tanks.png, 02-logins-brands.png, 03-where-to-work.png. |
| themes | 2025-12-16 2:37 PM | One child: VidiFlow.flowy_plugin. Inner contents not listed. |
| vidflow | 2026-10-01 12:18 PM | Newest project folder. android (data, ui, gradle-deps.md, README.md), backend (.env.example, app.py, requirements.txt), docs (only HX-HUMAN-EXPERIENCE-BOT-TASK-2026-10-01.md), plus ANDROID-MOBILE-PLAN.md, README.md, STARTING-SPECS.md. |
| vidipitch | 2026-03-13 2:36 PM | Small pitch app: public, server, package.json, PROJECT_DOCUMENTATION.md, README.md. |

## Top-level files

Nothing at the top level was skipped.

AppFlowy upstream and fork notes:

- .agent.md (2026-03-12)
- .dockerignore, .gitignore, CHANGELOG.md, CODE_OF_CONDUCT.md, LICENSE, README.md, ROADMAP.md, install.sh, codemagic.yaml, commitlint.config.js, project.inlang.json (mostly 2025-11-15)
- appflowy-fork-customization-guide.md (2026-01-21) and appflowy-fork-customization-guide.md.pdf (2025-11-02)
- AppFlowy.SelfHosting.Guide.md (2025-11-02)
- AppFlowy.VidiFlow.CustomThemes.md (2025-12-17)
- appflowy.vidiflow.inst.md (2025-11-16)
- AppFlowyDataLocation.md (2025-11-04)
- Self-hosting AppFlowy with Docker and PostgreSQL_ Complete Deployment Guide.pdf (2025-11-02)
- CURRENT_LOGO_FILES.md (2026-03-12)
- dart-version.txt (2026-03-12)
- package.json and package-lock.json (2026-03-12)
- last.tasks.md (2026-01-27)

VidiFlow build and later notes:

- VIDIFLOW_BUILD_DOCS.md (2026-01-22)
- VIDIFLOW_WINDOWS_BUILD.md (2026-01-27)
- VIDIFLOW_BUILD_STATUS_2026_01_28.md (2026-01-28)
- VidiFlow-Deployment-Guide.md (2025-11-16)
- VIDIFLOW-HX-WINDOWS-TOAST-PROGRESS.md (2026-09-09)
- VIDIBOT-PROGRAMMING-HANDOFF-LAYERS.md (2026-09-09)
- GROK-BOT-NOTES.md (2026-09-06)
- MEZ-UBUNTU-VIDI-SETUP-PLAN-2026-09-29.md (2026-09-29)
- CF.Token.VidiFlow.tunnel.md (2026-09-16). Filename only. Contents not opened.

Archives, installer, screenshots, junk:

- appflowy_logs.zip (2025-11-15)
- AppFlowy.Backup.11.13.zip (2025-11-13)
- AppFlowy.Bak.Nov15.zip (2025-11-16)
- AppFlowy-0.10.6-windows-x86_64.exe (2025-12-19)
- AppFlowy.png, AppFlowy7.png, AppFlowy67.png, Appflowy06e67.png, appFlowye67.png, AppFlowy0911.png, appFlowye95.png (2025-11-15)
- nul (2026-01-25) and null (2026-01-24). Look like redirected-output junk. Contents not opened.

## Filename search

Searched markdown filenames and folder names under M:\code\VidiFlow. Did not full-text search. Did not recurse flutter, node_modules, or .git. Terms: agent army, agent-army, jev, decision, impulse, hermes, mez.

Hits inside M:\code\VidiFlow (1):

- MEZ-UBUNTU-VIDI-SETUP-PLAN-2026-09-29.md

No markdown filename or top-level folder name inside M:\code\VidiFlow matched agent army, agent-army, jev, decision, impulse, or hermes.

## Snap Judges article (not in this folder)

Still under vidismart, not inside M:\code\VidiFlow. Not moved.

- Path: M:\code\vidismart\plans\jev-adoption-report-vidiflow-net-2026-09-24.md
- Exists: yes. Last write 2026-09-24 4:23 PM ET. Size 18212 bytes. Body not read for this map.
- Title: Snap Judges — Adoption Report for vidiflow.net (2026-09-24)
- Team name: Snap Judges (single-pass typed decision engines, formerly Jev-like)
- Pick recorded with the find: Laya primary, Kev-4B accuracy pilot, SemIf browser demo

## Attached plans

These six were attached to the inventory request. They are recorded here as attached plans. They are not proof the files live in M:\code\VidiFlow. The same titles were not found as filenames under M:\code\VidiFlow.

1. Local AI Model Roster — Voice, Image, Video, and the Search-Answer Model (recommends Muse Glimmer 30B; evidence date 2026-09-22)
2. Vidi Ai — Private AI with Fully Partitioned Access (sales+config v0.2, 2026-09-21; Hermes decided)
3. Media Engine Fleet — File Manifest (2026-09-19; companion to media-engine-fleet-plan)
4. Smart Stack — One Database, Full Roster, and the Animated Stack Report
5. LEX Media Stack — starter build plan (rev 2026-09-18)
6. LEX x OpenGloss v1.1 — Graph ETL + lex app on vidiflow.net (plan 2026-09-18)

None of these six is the Snap Judges / Jev article.

A different file, M:\code\vidismart\vidiflow\lex-media-stack-plan.md (2026-09-16), sits in the still-resident vidismart tree. Same neighborhood as item 5 by name only. Not treated as the attached plan, and not inside M:\code\VidiFlow.

## VidiBot

M:\code\VidiBot exists (last write 2026-10-03 4:00 AM ET). M:\code\VidiBot\docs exists. Docs names only:

- AGENT-PROCESS-AI-SPELLING-FIRST-2026-10-02.md
- CHINA-REGIONAL-INDUSTRY-MAP.html
- CHINA-REGIONAL-INDUSTRY-MAP.png
- FOUR-PROJECT-LAUNCH-BOARD-2026-10-02.md
- GROKBOT-HERMES-BRIDGE-LOCK-2026-10-02.md
- LEX-VOICE-PRIORITY-VOCAB-2026-10-02.md
- SMARTCHANNEL-CX-ANIMATED-SVG-2026-10-02.md
- SMARTCHANNEL-CX-GSAP-VS-PREMIERE-2026-10-02.md
- SPEAKER-DIARIZATION-LIVE-LOOKUP-2026-10-01.md
- STATUS-BOARD-NOTES-2026-10-02.md
- VIDI-BIO-AUTOPILOT-ANIMATED-LOGOS-2026-10-02.md

Exact top-level name overlap with M:\code\VidiFlow (files only, no shared directory name):

- README.md (generic; not evidence of the same document)
- VIDIBOT-PROGRAMMING-HANDOFF-LAYERS.md
- VIDIFLOW-HX-WINDOWS-TOAST-PROGRESS.md

No VidiFlow top-level directory name is also a VidiBot top-level directory name.

Related VidiBot folder names (not the same folder, same lane): appflowy, appflowy-kilo-sync, vidflow-android, vidiflow-android, vidiflow-business-plan, vidiflow-hx, vidiflow-hx-research, vidiflow-tunnel-harden, vidiflow-uptime-worker, hx, lex, lexi-max, mez-seeds, grokbot-hermes-bridge, hermes-demo-revka-harness, vidismart, and several vidismart-* folders. Hermes and mez show up here and were not filename matches inside M:\code\VidiFlow except the one MEZ ubuntu plan at the VidiFlow root.

## Open mess

- Expected ~20 newly moved subfolders are not here. Top level is 15 directories, mostly the AppFlowy fork.
- Agent Army was not found inside M:\code\VidiFlow. Filename matches still at the top of M:\code\vidismart include AGENT-ARMY-CLIENT-TEMPLATE-SKILLS.md, AGENT-ARMY-HARNESS-COMPARISON-2026-09-23.md, AGENT-ARMY-STACK-DECISION.md, HERMES-AGENT-ARMY-BUILD-PLAN.md, plus agentarmy.html and Agent-Army-HF-Top10.pdf. Those were name hits only. Not moved by this inventory.
- Snap Judges article remains at M:\code\vidismart\plans\jev-adoption-report-vidiflow-net-2026-09-24.md.
- Two vidiflow trees: small M:\code\VidiFlow\vidflow versus larger M:\code\vidismart\vidiflow.
- Duplicate handoff files with VidiBot: VIDIBOT-PROGRAMMING-HANDOFF-LAYERS.md and VIDIFLOW-HX-WINDOWS-TOAST-PROGRESS.md.
- Sibling folders also exist at M:\code and were not compared file-by-file: AppFlowy, vidipitch, vidismart. Unknown whether M:\code\vidipitch matches M:\code\VidiFlow\vidipitch.
- frontend contains protoc leftovers and build logs. Root contains nul and null.
- VidiBot holds the Hermes, mez, lex, and vidiflow-* lanes. VidiFlow holds the AppFlowy fork. They are mixed by topic, not by living in one tree.
## Update 2026-10-03 8:08 AM ET

After this map was written, `M:\code\VidiFlow\business-plan` was created by copying `M:\code\vidismart\VIDIFLOW-BUSINESS-PLAN.md` and `M:\code\vidismart\vidiflow-business-plan`. Section 10 of `VIDIFLOW-BUSINESS-PLAN.md` is Snap Judges. Originals were left in VidiSmart. The Snap Judges source report was not moved.

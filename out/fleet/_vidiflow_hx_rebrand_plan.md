# VidiFlow HX rebrand plan — per-brand skins, no fork

Date: 2026-10-05
Decisions confirmed by James: skin/config only, no repo fork · real name is **VidiFlow HX**
(drop "Smart Channel CX") · full rebrand (colors, logo, bot name, custom CSS).

## Licensing — clear

`hermes-agent` is **MIT** (Nous Research), checkout on disk at
`C:\Users\James\AppData\Local\hermes\hermes-agent`, and the running venv imports it
**editable** (`venv\Lib\site-packages\__editable__.hermes_agent-0.19.1.pth`). MIT has two
obligations only: retain the copyright notice and the license text. No copyleft, no
source-disclosure trigger, no revenue threshold, no field-of-use restriction. Forking,
rebranding and shipping inside VidiFlow are all permitted. Nothing here needs a fork.

## Root cause of the confusion (fix FIRST — it is bigger than the UI)

Two separate things are colliding:

1. **Roster bug.** The team listing describes `@vidiflow_vidibio_hx` as *"VidiFlow HX, also
   called Smart Channel CX"* — two names, one bot. Meanwhile this session is
   `@smartchannel_cx`, a **separate profile directory**. So "VidiFlow HX" and "Smart Channel
   CX" are the same bot under two labels, and the answerer is a third identity. No indicator
   fix helps while this stands.
   → Merge to `vidiflow_vidibio_hx`, retire the `smartchannel_cx` label, fix the description.

2. **Voice indicator carries no identity.** `apps/desktop/src/app/chat/composer/voice-fan.tsx:45-52`
   builds `dictationLabel` from bare i18n strings (`c.stopDictation`,
   `c.transcribingDictation`, `c.voiceDictation`) with no profile/agent name mixed in. That is
   the literal "Listening" with no bot attached.

## What the skin system already covers (verified in source)

`hermes_cli/skin_engine.py` — `SkinConfig`:
- `branding: Dict[str,str]` — `agent_name`, `welcome`, `goodbye`, `response_label`,
  `prompt_symbol`, `help_header` (see `_branding()`, line 44)
- `colors` / `light_colors` / `dark_colors` — ~28 TUI tokens
- `banner_logo`, `banner_hero` — Rich-markup ASCII art, replaces the Hermes logo
- `custom_css` — *"Raw CSS injected as a `<style>` tag on the desktop GUI (32 KiB cap)"*
- `tool_prefix`, `tool_emojis`, `spinner`

User skins load from **`$HERMES_HOME/skins/<name>.yaml`** (`_skins_dir()`, line 365), merged
over the built-in `default` skin. `change_watcher.py:27` pushes `customCSS` live to the
desktop GUI. One YAML file per brand. No code edit required for any of it.

Consumers already reading branding: `cli_render.py:922`, `cli_tui_mixin.py:68,1135`,
`cli_commands_mixin.py:396`, `cli_chat_turn_mixin.py:678`, `cli_stream_mixin.py:442`,
`cli_tui_runtime_mixin.py:273`, `gateway/relay/__init__.py:220`.

## Honest gap: the OS window title bar is NOT skin-driven

The Electron window title is build-time, not runtime:
- `apps/desktop/electron-builder.config.cjs:206` — `title: 'Hermes Agent Installer'`
- `package.productName` feeds the window title; `electron-builder.config.cjs:104-108`
  sets `extraMetadata.name`/`productName` from `displayName`.
- `src/main.tsx:53` only overrides `document.title` for `?win=hud` ("Hermes HUD").

So with skin/config only, the **OS-level title bar still says Hermes Agent**. The in-app
title bar (`shell/titlebar-controls.tsx`, `titleBar.left|center|right` slots) is
contribution-driven and *can* be rebranded without a fork, but the native window chrome
cannot. Options:
(a) accept it, (b) rename the installed Electron app directory/shortcut, (c) small upstream
patch to read branding from skin — the only thing that would need a repo change.

**Decide before step 4.**

## Ordered steps

1. **Fix the roster** — merge Smart Channel CX into VidiFlow HX; one name, one bot.
2. **Retire the `smartchannel_cx` profile** (or make it a symlink/alias to
   `vidiflow_vidibio_hx`) after confirming no unique state is lost. Both have a `SOUL.md`;
   diff before merging.
3. **Write the VidiFlow HX skin** — `skins/vidiflow-hx.yaml` with branding, the Kumbh-style
   warm palette (`sand #C4A574`, `cream #F7F3EC`, `ink #141210`, `bg_dark #0C0B0A`),
   `banner_logo`, and `customCSS` for the desktop GUI (respect the 32 KiB cap).
4. **Title bar decision** — (a), (b) or (c) above.
5. **Voice indicator** — the one genuine code change. Mix the active profile name into
   `voice-fan.tsx` `dictationLabel` so it reads `Listening — VidiFlow HX`. Upstreamable as a
   small PR; keep it isolated so it survives rebase.
6. **Repeat the skin per brand** — same YAML shape for VidiBlast, VidiCity, VidiNews,
   VidiSmart, VidiTwin. Each profile points at its own.
7. **Verify** — restart the desktop app per profile; confirm branding in TUI, in-app title
   bar, dictation label, and banner; confirm upstream `git pull` still merges clean.

## Risks

- Palette choice is a brand decision, not an engineering one — get the hexes from
  `M:\code\vidimodels\brand\TOKENS.md` equivalents for HX before writing the skin.
- Two profiles both named ~"CX" will silently pick up each other's `SOUL.md` on any alias
  approach; prefer an explicit rename over a symlink.
- The editable install means repo edits take effect on next process start — restart required,
  and a running desktop app will not pick up TSX changes without a rebuild.
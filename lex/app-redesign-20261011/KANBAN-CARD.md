Owner: Lexi (default profile). Requested by James 2026-10-11: queue the Lex (VidiFlow Lex) acronym/lexicon app UI refactor on OpenCode with the free MuseSpark 1.3 model.

Working copy (ONLY place to change): M:\code\VidiFlow\lex\app-redesign-20261011  (copied from the canonical M:\code\VidiFlow\lex\app at 3:31 PM ET; do NOT touch M:\code\VidiFlow\lex\app, vidiflow-hx files, M:\code\vidismart\lex\app, or M:\code\viditwin; no deploy/publish/push).
Session brief: M:\code\VidiFlow\lex\app-redesign-20261011\REDESIGN-PROMPT.md
Model: opencode/muse-spark-1.3-contributor-free ($0 input/output per `opencode models opencode --verbose`). Do NOT use opencode/muse-spark-1.3 (paid).

UPDATE 3:31 PM ET: the working copy moved here from M:\code\vidismart\lex\app-redesign-20261011 (that old folder is abandoned; its launcher is disabled). Start fresh in the new folder.

Steps (use the opencode skill; OpenCode 1.18.30 on V20 hangs if stdin is open, so always launch via the script below, which closes stdin and runs detached):
1. Launch: pwsh -NoProfile -File "M:\code\VidiFlow\lex\app-redesign-20261011\run-redesign.ps1"
   - Prints STARTED pid/log, or ALREADY RUNNING, or BLOCKED (2 opencode run sessions already active; max 2 in parallel - wait and retry).
2. Monitor: the log path is in opencode-session.current-log.txt (plus .err.log alongside). Check every few minutes until the pid in opencode-session.pid exits. Heartbeat the card while waiting.
3. Verify when it exits: CHANGES.md exists; screens\ has 01-first-screen-1440x900.png, 02-search-1440x900.png, 03-term-card-1440x900.png, 04-dictionary-1440x900.png, 05-first-screen-mobile-390x844.png; your port 8042 server stopped (leave the unrelated 8041 server alone); nothing outside the folder changed. If screenshots are missing, continue the same OpenCode session (opencode run -s <session id> --model opencode/muse-spark-1.3-contributor-free --auto, stdin closed via the same pattern) to finish them.
4. Complete the card with: files changed, screens path, log path, known issues. Deadline context: James has a meeting Mon 2026-10-12 2:30 PM ET.



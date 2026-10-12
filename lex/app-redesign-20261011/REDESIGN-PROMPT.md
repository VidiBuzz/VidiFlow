# Lex app UI redesign (OpenCode session brief)

You are working ONLY inside this folder: M:\code\VidiFlow\lex\app-redesign-20261011
It is a working copy of the VidiFlow Lex acronym/lexicon web app (static site: index.html, assets/, data/, ai-engine.js, builder.html, manifesto.html, privacy.html).

HARD RULES
- Never read-modify-write anything outside this folder. Do NOT touch M:\code\VidiFlow\lex\app (the live source, served on a preview tunnel; also never stop the existing python server on port 8041), any vidiflow-hx files, M:\code\vidismart\lex\app, or M:\code\viditwin.
- Do not deploy, publish, git push, or upload anything.
- Keep ALL terms/data and all working functionality (search, decode, dictionary, AI engine hooks, links between pages). Do not delete data files.
- Brand spellings exactly: VidiSmart, VidiFlow, Lexi, Max.

GOAL: declutter and refactor the Lex (VidiFlow Lex) acronym/lexicon app UI.
1. One clear first screen featuring Lexi. Avatar: <img src="https://cdn.vidi.news/images/viditwin_lexi_avatar.png" referrerpolicy="no-referrer" alt="Lexi">
2. A prominent search box on that first screen.
3. Clean term cards: acronym/term, plain-English decode, short meaning; readable at a glance.
4. Simple dictionary browse (A-Z or category list) that is easy to scan.
5. Remove clutter: collapse/move secondary panels, duplicate nav, noisy badges, walls of text.
6. Cinematic but clean look (dark, confident, good spacing and type scale). No overlapping or clipped text at 1440x900 or 390x844. Responsive.
7. Keep it a static site (no new build step required to view it).

WHEN DONE CODING
A. Write CHANGES.md in this folder: short summary of what changed, what was removed/moved, anything you could not keep, how to view it.
B. Serve the copy and capture screenshots:
   - Serve: python -m http.server 8042 --bind 127.0.0.1 --directory M:\code\VidiFlow\lex\app-redesign-20261011  (run in background; stop it when finished)
   - Use Playwright to screenshot. Preferred: in a temp subfolder _tools\ run `npm init -y` and `npm i playwright-core`, then a small node script using chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true }).
   - Save PNGs into screens\ :
       screens\01-first-screen-1440x900.png
       screens\02-search-1440x900.png        (type a real term, e.g. an acronym from the data, show results)
       screens\03-term-card-1440x900.png     (a decoded term card open)
       screens\04-dictionary-1440x900.png    (dictionary browse view)
       screens\05-first-screen-mobile-390x844.png
   - Open each PNG and check it: no overlapping/clipped text, avatar loads. Fix and re-shoot if not.
C. Delete the _tools\ folder when finished (keep screens\ and CHANGES.md).
D. Final message: list of files changed, screenshot paths, and any known issues.



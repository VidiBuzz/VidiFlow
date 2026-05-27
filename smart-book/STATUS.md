# Smart-Book Project Status

**Last Updated:** May 27, 2026
**Project:** "The Speed of Agentic Visual AI" — Interactive Digital Book
**Author:** James May, VidiSmart · Savage Digital Solutions
**Branch:** `siteground-cleanup`

---

## Current State: IN PROGRESS — Fresh Update

**Live URLs:**
- Landing Page: https://vidismart.com/smart-book/index.html
- Book Reader: https://vidismart.com/smart-book/print-book.html

---

## File Locations

| File | Role |
|------|------|
| `smart-book/data.js` | Core content — chapters, personas, knowledge graph, edges |
| `smart-book/index.html` | Landing page — hero, persona selection, parts grid |
| `smart-book/print-book.html` | Book reader — two-column layout, lightbox, scroll-spy, sidebar TOC |
| `smart-book/STATUS.md` | This file |
| `.kilo/plans/1778876581975-jolly-circuit.md` | Master plan (content update + KDP + podcast + launch) |

---

## Book Structure (Target After Update)

**46 chapters across 7 parts + Foreword**

| Part | Title | Chapters |
|------|-------|----------|
| Foreword | The 500% Lead & The 500-App Breaking Point | 1 |
| Part I | The Landscape | ch1–ch9 |
| Part II | The Technology | ch10–ch17 |
| Part III | The Business | ch18–ch26 |
| Part IV | The Stack & The Future | ch27–ch35 |
| Part V | The Horizon | ch36–ch41 |
| Part VI | Reference | ch42–ch44 |
| Part VII | (TBD) | — |

### New Chapters Being Added

| # | Title | Part | Status |
|---|-------|------|--------|
| ch1 | The Computing Eras — A Personal Journey | Part I | To write |
| ch36 | Abstraction — When It Has Value | Part II | To write |
| ch37 | Observation, Analytics & Adaptive Learning | Part III | To write |
| ch38 | Smart Process — AI Collab with HITL | Part IV | To write |
| ch39 | Glossary (~65 terms A-Z) | Part VI | To write |
| ch40 | New Job Titles + Personal Story | Part VI | To write |
| ch41 | Temporal Truth | Part VI | To write |

### Renumbering

| Old ID | New ID | Title |
|--------|--------|-------|
| ch1 | ch2 | The Customer Journey Out of App Chaos |
| ch2 | ch3 | The Agent Army |
| ... | ... | (all ch1–ch36 shift to ch2–ch37) |
| ch37 | ch42 | Robotics — The Brilliant Machine |
| ch38 | ch43 | Smart Stack — The 5-Layer Architecture |
| ch39 | ch44 | Smart Stack Issue Matrix |

---

## Personas (3)

| Persona | Color | Focus |
|---------|-------|-------|
| Consumer | #3B82F6 | Personal productivity, creativity, AI basics |
| IT Professional | #10B981 | Technical implementation, infrastructure, models |
| Executive/Entrepreneur | #8B5CF6 | Strategy, competitive dynamics, investment |

Each persona has: `critical`, `high`, `medium`, `hide` arrays + `aiInsights` per chapter.

---

## Knowledge Graph

**Current:** 30 nodes, 47 edges
**Target:** ~50 nodes, ~55-60 edges

New nodes to add: Abstraction, Adaptive Learning, HITL, Context Engineer, Knowledge Architect, Temporal Truth, Glossary, Computing Eras, Era Economics

---

## Open Decisions

| # | Decision | Status |
|---|----------|--------|
| D1 | Computing Eras chapter placement | RESOLVED — becomes ch1, all chapters shift +1 |
| D2 | Podcast tour authorship (James vs team) | Open |
| D3 | Audiobook narration (James vs pro) | Open |
| D4 | KDP Select enrollment (90-day exclusive vs wide) | Open |
| D5 | ACX audio release pace | Open |
| D6 | Paperback distribution (Amazon POD vs IngramSpark) | Open |

---

## Completed Work

- [x] Initial book creation (39 chapters, 6 parts)
- [x] Two-column reading layout
- [x] Image lightbox with keyboard nav
- [x] Scroll progress bar
- [x] Scroll-spy navigation
- [x] Responsive design (mobile collapse)
- [x] Dark mode toggle
- [x] Persona-based content filtering
- [x] Knowledge graph visualization
- [x] Deployed to SiteGround

---

## Remaining Tasks

- [ ] T-20: Rewrite STATUS.md (this file)
- [ ] T-01: Update PART_LABELS to 7 parts
- [ ] T-02: Write ch1 (Computing Eras)
- [ ] T-03: Shift all chapter IDs +1
- [ ] T-04: Write ch36 (Abstraction)
- [ ] T-05: Write ch37 (OAL)
- [ ] T-06: Write ch38 (HITL)
- [ ] T-07: Write ch39 (Glossary)
- [ ] T-08: Write ch40 (New Jobs)
- [ ] T-09: Write ch41 (Temporal Truth)
- [ ] T-10: Renumber ch37→ch42, ch38→ch43, ch39→ch44
- [ ] T-11: Add knowledge nodes
- [ ] T-12: Update edges
- [ ] T-13: Update persona arrays
- [ ] T-14: Update aiInsights
- [ ] T-15: Update print-book.html PART_LABELS + chapterKeys
- [ ] T-16: Update cover stats
- [ ] T-17: Update index.html parts-grid + hero stats
- [ ] T-18: Extend sidebar TOC
- [ ] T-19: Visual QA in browser

---

## Deployment

- **Method:** Git push to SiteGround remote
- **Remote:** `siteground` → `ssh://u2627-m33aqlpqghg3@gtxm1044.siteground.biz:18765/home/customer/www/vidismart.com/public_html/`
- **Branch:** `siteground-cleanup` → `master` on SiteGround

---

## Known Issues / Notes

1. STATUS.md was stale (last updated 2026-04-09, referenced 37 chapters/5 parts)
2. No server-side rendering — pure static HTML
3. No analytics — no tracking of reading behavior
4. No offline support — no service worker

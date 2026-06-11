# VidiFlow — Status Document
## Saved: June 7, 2026

### Product Definition
**VidiFlow is a glance-level UI for mass agent management.** Color, position, shape — not paragraphs. See everything. Read nothing.

---

## What We Built

### Page: `agent-ui.html`
A single-page visual dashboard with VidiFlow branding (dark blues, Kumbh Sans, Inter, aurora mesh background).

### Three Core Systems

#### 1. Glance Panel (line ~785)
- **LED RPM bar** — 20 lights chase green→amber→red
- **Fleet numbers** — 847 agents / 12 alert / 3 down / $2.4K cost with breathing animation
- **Inline sparkline stats** — MSG/SEC, LAG, THROUGHPUT with ▲▼ arrows
- **4 rotary dials** — MODE, FUEL, BB, CHARGE (F1 steering wheel style)
- **48 agent buttons** in 12×4 grid — color-coded (green=run, amber=hot, red=error, cyan=hold, gray=idle)
- **8 server heat bars** — each with CPU/RAM/GPU horizontal bars, color shifts green→amber→red
- **4 circular gauges** — GPU, Tokens, Cost, Uptime
- **Scrolling ticker** — shorthand activity feed

#### 2. Priority Queue (line ~1181)
- **7 ranked items** ordered by dependency relationships, not timestamps
- **Dependency chains** — visual node chains showing what blocks what (e.g., `019 → 020 → 021 → ... +66 more`)
- **Impact counts** — how many tasks are waiting on each item
- **Tabs**: ALL / BLOCKED / WAITING ON DEPS / READY
- **Severity indicators**: critical (red glow), high (amber), medium (cyan), low (green)

#### 3. Root Cause Analysis (line ~1392)
- **4 cause cards** — API Rate Limiting, OOM Kills, Thermal Throttling, Consumer Lag
- **Pattern detection** — frequency bars, time patterns
- **Suggested fixes** — not just "here's the error" but "here's what to do"
- **Tabs**: ALL / ⚙ INFRA / 🔌 API / 💻 CODE / 📊 DATA
- **Summary row** — errors today, % change, auto-fixed count, MTBF

#### 4. Thinking Indicator (line ~459)
- **3 static stages** — Searching (gray/15%), Processing (cyan/55%), Confident (green/94%)
- **Live animated demo** — cycles through 7 confidence stages in real time
- **Orb + rings + particles** — visual model of AI thinking process
- **Confidence thermometer** — gray=guessing → cyan=processing → green=certain

### Interactive Features
- **Single click** → agent focuses to #1, everything else dims/reorders
- **Double-click** → drill-down modal with metrics, activity log, links
- **Tabs** → instant filter by status (RUN/HOT/ERR/HOLD/IDLE) or project (α/β/γ/⚙)
- **Queue tabs** → filter by BLOCKED/WAITING ON DEPS/READY
- **Cause tabs** → filter by INFRA/API/CODE/DATA
- **ESC** → closes modal
- **Focus bar** → shows focused agent with CLEAR button

### Data Model
- 48 agents with status, project, task, metrics (tok/s, memory, runtime, cost), activity logs, links
- 8 servers with CPU/RAM/GPU heat levels, temperature, status
- 7 queue items with dependency chains and impact counts
- 4 root cause cards with frequency patterns and fix suggestions

### Animation System ("Everything Flows")
Every active element has motion:
- `btn-breathe` / `btn-alert` — agent buttons pulse
- `bar-shimmer` / `bar-shine` — heat bars and progress bars sweep
- `flow-number` — stat numbers breathe
- `active-glow` — server dots pulse brightness
- `server-shimmer` — data shimmer through server rows
- `queue-critical-pulse` — critical queue borders throb
- `arrow-flow` — dependency arrows push forward
- `data-flow` — flowing data stream lines on section tops
- `flow-border` — traveling light on card borders
- `gauge-pulse` — circular gauges breathe
- `led-blink` — LED bar chase lights
- `scroll-ticker` — activity ticker scrolls
- `think-breathe` / `think-spin` / `think-orbit` — thinking indicator animations

---

## Tools Researched (14+)
- Mission Control (multi-framework fleet dashboard)
- Multica (Kanban-style agent management)
- Hermes Web UI (per-agent control)
- n8n (visual workflow builder)
- Dify (visual AI workflow)
- CrewAI Studio
- AgentOps (observability)
- Arize Phoenix (tracing)
- LangGraph (graph workflows)
- AutoGen Studio
- Flowise
- SGLang Dashboard
- Kafbat UI (Kafka monitoring)
- Open WebUI (excluded — text-heavy chat, not dashboard)

## UI Component Research
- shadcn/ui — Skeleton, Spinner, Progress components
- react-loading-skeleton — auto-adapting animated placeholders
- Framer Motion — smooth React animations
- Noor UI — Thinking Indicator (4 variants: dots, pulse, wave, typing)
- Fragments — ThinkingIndicator component
- Agentic UX Patterns — Confidence Thermometer
- AI UX Playground — Confidence Score pattern
- Goji Labs — Designing Confidence Signals guide
- F1 steering wheel — primary design reference for control panel

## Design References
- F1 steering wheel — color-coded buttons, rotary dials, LED bars, minimal text
- Grafana/Datadog — sparklines, gauges, heatmaps
- Kafka monitoring dashboards — streaming data visualization
- Server monitoring dashboards — status indicators, progress bars

---

## Files
- `M:\code\vidismart\agent-ui.html` — main dashboard page (2372 lines)
- `M:\code\vidismart\vidiflow_high_res.svg` — VidiFlow logo
- `M:\code\vidismart\KumbhSans-VariableFont_wght.ttf` — brand font
- `M:\code\vidismart\VIDIFLOW-STATUS.md` — this file

## Next Steps (When Ready)
1. Consider making this a React app with real WebSocket streaming data
2. Add drag-to-reorder for priority queue
3. Build out the project grouping view (α/β/γ/⚙)
4. Add keyboard shortcuts (1-9 for quick focus, arrows for navigation)
5. Real-time data integration with Kafka/WebSocket backends
6. Mobile responsive adaptation
7. Export/snapshot functionality

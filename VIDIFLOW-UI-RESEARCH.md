# VidiFlow — UI Component Research
## Saved: June 7, 2026

---

## The Big Picture: What's Actually Being Used Right Now

The AI agent UI space has exploded. There are now **purpose-built React component libraries specifically for AI agent interfaces** — not generic dashboards. Here are the top contenders:

---

## TIER 1: Agent-Specific Component Libraries (Most Relevant to VidiFlow)

### 1. CopilotKit
- **GitHub:** https://github.com/CopilotKit/CopilotKit (⭐30.6k)
- **Site:** https://copilotkit.ai
- **What it does:** Full agentic frontend stack with 6 generative UI primitives:
  - **Components as Tools** — agent calls your React component as a tool, renders it inline
  - **Tool Call Rendering** — wraps backend tool calls in custom UI cards with live status, arguments, results
  - **State Rendering** — subscribe to agent's streamed state, re-render UI as values arrive
  - **Reasoning** — render model's thinking chain inline as first-class message type
  - **A2UI** — agent composes layouts from your component catalog
  - **MCP Apps** — embed UI from MCP servers in sandboxed iframes
- **Key for VidiFlow:** The **Reasoning** primitive — surfacing the model's thinking chain. The **State Rendering** — live progress updates. The **Tool Call Rendering** — showing what each agent is doing in real time.
- **Protocol:** Created AG-UI protocol (Agent-User Interaction), now supported by Google, Microsoft, Amazon, Oracle, LangChain, Mastra, CrewAI
- **Pricing:** Open source core, Enterprise Intelligence platform is paid
- **Install:** `npx copilotkit@latest create`

### 2. assistant-ui
- **GitHub:** https://github.com/assistant-ui/assistant-ui (⭐8k+)
- **Site:** https://assistant-ui.com
- **npm:** `@assistant-ui/react` (0.14.13, actively maintained)
- **What it does:** Production-grade AI chat components — Thread, Message, Composer, ActionBar, ThreadList
- **Key features:**
  - Streaming responses with markdown and code highlighting
  - Tool call rendering with structured outputs
  - Branching conversations
  - Generative UI support
  - Works with Vercel AI SDK, LangChain, or any LLM provider
  - Built on Radix UI + shadcn/ui
- **Key for VidiFlow:** The **Tool UI** product (separate site: tool-ui.com) — purpose-built tool call visualization
- **Install:** `npx assistant-ui@latest init`

### 3. Tambo AI
- **GitHub:** https://github.com/tambo-ai/tambo
- **Site:** https://tambo.co
- **What it does:** Generative UI toolkit — register components with Zod schemas, agent picks the right one and streams props
- **Key features:**
  - Agent renders your React components based on context
  - Streaming infrastructure with cancellation/error recovery
  - MCP support
  - Cloud or self-hosted
- **Key for VidiFlow:** The component registration pattern — define your gauges, status cards, progress bars, and the agent renders them automatically
- **Install:** `npm create tambo-app my-tambo-app`

### 4. Aura UI
- **Site:** https://dev.to/yangzh991/why-i-built-a-react-component-library-specifically-for-ai-products-3log
- **What it does:** React component library built specifically for AI products
- **9 core components:**
  - **MessageBubble** — chat layout with role-based styling
  - **StreamingIndicator** — animated states (thinking / streaming / done)
  - **ToolCallCard** — shows what the agent is doing in real time
  - **ParameterSlider** — temperature, top-p controls with live preview
  - **CitationBlock** — source references with hover expand
  - **TokenCounter** — live usage with limit warnings
  - **CodeBlock** — syntax highlight + copy, optimized for LLM output
  - **PromptEditor** — textarea with token count + template variables
- **Key for VidiFlow:** The **StreamingIndicator** (thinking/streaming/done states) and **ToolCallCard** (real-time agent activity)

### 5. AGNO Agent UI
- **Site:** https://creati.ai/ai-tools/agent-ui
- **npm:** `agno-agent-ui`
- **What it does:** React component library for AI Agent chat experiences
- **Features:** Prebuilt chat windows, message bubbles, input forms, loading indicators, error-handling, real-time streaming, custom hooks
- **Integrates with:** LangChain, multi-step workflows, plugin support

---

## TIER 2: General Component Libraries with Strong AI/Dashboard Components

### 6. HeroUI (formerly NextUI)
- **GitHub:** https://github.com/heroui-inc/heroui
- **Site:** https://heroui.com
- **YC:** Summer 2024 batch
- **What it does:** UI framework specifically for AI agents and developers
- **v3.0 (March 2026):** 75+ web components, Tailwind CSS v4, React Aria
- **Key components for VidiFlow:**
  - **Meter** — progress/gauge component
  - **ProgressBar** — linear progress
  - **ProgressCircle** — circular progress (perfect for our gauges)
  - **Badge** — status indicators
  - **Tooltip** — hover details
- **Install:** `npm install @heroui/react`

### 7. Tremor
- **Site:** https://tremor.so (now acquired by Vercel)
- **What it does:** 35+ components for dashboards and charts
- **Key components for VidiFlow:**
  - **Tracker** — event timeline visualization
  - **BarList** — horizontal bar charts
  - **Spark Charts** — mini inline charts
  - **Progress Circles** — circular progress
  - **Data Bars** — usage indicators
  - **Area/Bar/Line charts** — via Recharts
- **Built with:** React, Tailwind CSS, Radix UI
- **Install:** `npm install @tremor/react`

### 8. Magic UI
- **GitHub:** https://github.com/magicuidesign/magicui (⭐21.2k)
- **Site:** https://magicui.design
- **What it does:** Animated components and effects — copy-paste into your apps
- **Key for VidiFlow:** The animation library — shimmer effects, particle effects, orbit animations, glow effects. These are exactly what we built manually in CSS.
- **Built with:** React, Tailwind CSS, Framer Motion
- **Install:** `npx shadcn@latest add https://magicui.design/r/[component]`

### 9. shadcn/ui
- **Site:** https://ui.shadcn.com
- **What it does:** The foundation — copy-paste components built on Radix UI
- **Key components for VidiFlow:**
  - **Skeleton** — loading placeholders
  - **Progress** — linear progress bar
  - **Badge** — status indicators
  - **Card** — container component
  - **Tabs** — filtering (already using this pattern)
  - **Dialog/Modal** — drill-down popups
- **Note:** Most other libraries above are built ON TOP of shadcn/ui

### 10. Watermelon UI
- **GitHub:** https://github.com/WatermelonCorp/watermellon-registry
- **Site:** https://ui.watermelon.sh
- **What it does:** 260+ copy-pasteable React components
- **Key for VidiFlow:** The "AI Input" component category — purpose-built for AI interfaces
- **Built with:** React 19, Tailwind CSS v4, Radix UI, Framer Motion

---

## TIER 3: Specialized Components (Individual Pieces We Need)

### 11. react-gauge-component
- **GitHub:** https://github.com/kjanat/react-gauge-component
- **What it does:** Customizable gauge/speedometer component
- **Key for VidiFlow:** Could replace our hand-built SVG circular gauges with a production component
- **Features:** Multiple display modes, configurable color segments, smooth needle animations, responsive

### 12. ElevenLabs UI
- **Site:** https://ui.elevenlabs.io
- **What it does:** Open-source agent components for audio/voice interfaces
- **Key for VidiFlow:** The **Orb** component — animated visual indicator for agent activity. Built on shadcn/ui.
- **Install:** `pnpm dlx @elevenlabs/agents-cli@latest components add orb`

### 13. prompt-kit
- **Site:** https://prompt-kit.com
- **What it does:** Chat UI components — model-agnostic
- **Key for VidiFlow:** Tool calling UI patterns, streaming responses, code blocks

### 14. Chrry
- **GitHub:** https://github.com/chrryAI/chrry
- **What it does:** 50+ React components built for AI applications
- **Key for VidiFlow:** Production AI platform components, dark mode, i18n

---

## What People Are Actually Using for Agent Monitoring

Based on the research, the most common patterns in production AI dashboards are:

1. **Status dots with color coding** — green (active), amber (thinking), red (error), gray (idle)
2. **Streaming indicators** — animated dots/pulse showing model is generating
3. **Tool call cards** — showing what the agent is doing right now (calling API, reading file, etc.)
4. **Token/cost counters** — live updating usage metrics
5. **Confidence/progress bars** — linear or circular progress showing completion
6. **Thinking chain visualization** — showing the model's reasoning steps
7. **Sparklines** — mini charts showing metrics over time
8. **Heat maps** — color-coded grids showing activity patterns

---

## Recommendation for VidiFlow

**If we rebuild as React, use this stack:**

1. **Foundation:** shadcn/ui + Tailwind CSS + Framer Motion
2. **Agent-specific:** CopilotKit (for Reasoning + State Rendering + Tool Call Rendering)
3. **Dashboard components:** Tremor (Tracker, BarList, Spark Charts, Progress Circles)
4. **Animations:** Magic UI (shimmer, particles, orbit effects — we hand-built these)
5. **Gauges:** react-gauge-component (replace our hand-built SVG)
6. **Status indicators:** HeroUI (Badge, Meter, ProgressBar, ProgressCircle)

**If staying with vanilla HTML/CSS (current approach):**
- Our current `agent-ui.html` is actually ahead of most of these libraries in terms of:
  - F1-style button grid (unique)
  - LED RPM bar (unique)
  - Rotary dials (unique)
  - Priority queue with dependency chains (unique)
  - Root cause analysis visualization (unique)
  - Thinking indicator with orb+particles (on par with ElevenLabs UI)

---

## Key Insight

The space is converging on these standards:
- **AG-UI protocol** (by CopilotKit) is becoming the standard for agent-to-frontend communication
- **MCP** (Model Context Protocol) is the standard for tool/data access
- **Generative UI** — agents render React components, not just text
- **CopilotKit + LangChain** integration is the most common production stack

The most forward-thinking pattern: **agents that render their own UI**. Instead of you building a static dashboard, the agent decides what components to show based on what it's doing.

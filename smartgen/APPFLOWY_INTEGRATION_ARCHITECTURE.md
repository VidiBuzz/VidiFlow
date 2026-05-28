# VidiSmart + AppFlowy Integration Architecture
## Connecting Your Knowledge Base to Live AI Agents

**Date**: 2026-05-16  
**Status**: Planning Phase  
**Author**: VidiSmart Agent System

---

## The Problem (Your Exact Situation)

You have **5 disconnected systems** that don't talk to each other:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AppFlowy    │     │  VS Code /   │     │   Hermes     │
│ (Knowledge   │ ✗   │  Roo / Kilo  │ ✗   │   Agent      │
│  Base 1000s  │────│  / Quad      │────│  (Backend)    │
│  of pages)   │     │  (AI Coding) │     │  (Router)     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ✗                    ✗                    ✗
       └────────────────────┼────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Directus CMS  │
                   │  (154 files)    │
                   │   Railway Deploy│
                   └─────────────────┘
```

**Nobody connects. Nobody web-fetches. Everything is stale.**

---

## What is a Kanban Board?

A **Kanban board** is a visual task management system invented by Toyota in the 1940s. It's now the universal language of project management.

### Visual Structure:
```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│   TO DO     │  │ IN PROGRESS  │  │    DONE     │
│   (Backlog) │  │  (Working)   │  │ (Complete)  │
├─────────────┤  ├──────────────┤  ├─────────────┤
│ ┌─────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │
│ │ Task #1 │ │  │ │ Task #3  │ │  │ │ Task #5 │ │
│ └─────────┘ │  │ └──────────┘ │  │ └─────────┘ │
│ ┌─────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │
│ │ Task #2 │ │  │ │ Task #4  │ │  │ │ Task #6 │ │ │
│ └─────────┘ │  │ └──────────┘ │  │ └─────────┘ │
└─────────────┘  └──────────────┘  └─────────────┘
```

### Key Concepts:
| Concept | Description | Example |
|---------|-------------|---------|
| **Card** | One unit of work | "Create book_chapters collection" |
| **Column** | Status stage | To Do → In Progress → Done |
| **Swimlane** | Horizontal grouping | By project: SmartGen / Smart Book / Deck |
| **WIP Limit** | Max cards per column | "Max 3 tasks In Progress" |
| **Priority** | Card importance | Critical / High / Medium / Low |
| **Assignee** | Who owns the card | Coder Agent / Research Agent |
| **Tags/Labels** | Classification | cms / infra / testing / vector |

### Why Kanban is Your Universal Language:
- **AppFlowy** has native Kanban boards ✓
- **Linear** uses Kanban ✓
- **Plane** uses Kanban ✓
- **Trello** invented digital Kanban ✓
- **Jira** has Kanban mode ✓
- **Notion** has Kanban databases ✓
- **Our custom dashboard** uses Kanban layout ✓

**Every tool you use speaks Kanban. That's your integration point.**

---

## AppFlowy Capabilities (What We Know)

### What AppFlowy CAN Do:
| Feature | Status | Notes |
|---------|--------|-------|
| Kanban Boards | ✅ Built-in | Native database views |
| Document/Wiki Pages | ✅ Core feature | Your 1000s of pages live here |
| Databases/Tables | ✅ Full support | Structured data with properties |
| AI Assistant | ✅ Built-in | BUT only reads internal content |
| Self-Hosting | ✅ Supported | Docker deployment available |
| REST API | ✅ Available | Via self-hosted instance |
| Plugins/Extensions | ⚠️ Limited | Rust-based plugin system |
| Webhooks | ❌ Not native | Need custom integration |
| External AI Connect | ❌ Not supported | Only internal AI |

### What AppFlowy CANNOT Do (Your Pain Points):
1. **No web fetching** - AI can't browse the internet for current info
2. **No external agent connection** - Can't talk to Roo/Kilo/Quad/Hermes
3. **No real-time sync** - Changes don't propagate to other systems
4. **No screenshot/capture** - Can't take Playwright-style snapshots
5. **Stale training data** - AI model cutoff means old information

---

## The Solution: VidiSmart Bridge Architecture

We build a **middleware layer** that sits between AppFlowy and everything else:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIDISMART BRIDGE SERVER                       │
│                  (Node.js + Express + Socket.io)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ AppFlowy   │  │   Hermes   │  │  Directus  │                │
│  │ Connector  │  │  Connector │  │  Connector │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │               │               │                        │
│  ┌─────▼───────────────▼───────────────▼──────┐                │
│  │           UNIFIED KANBAN ENGINE           │                │
│  │  • Real-time sync across all systems      │                │
│  •  Bidirectional state propagation          │                │
│  •  Web-fetch enrichment layer              │                │
│  •  Playwright screenshot capture           │                │
│  •  Agent task assignment & tracking        │                │
│  └──────────────────────────────────────────┘                │
│        │               │               │                        │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐             │
│  │ Dashboard  │  │   API      │  │  Webhook   │             │
│  │   UI       │  │  Endpoints │  │  Receiver  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
   ┌──────────┐      ┌──────────┐        ┌──────────┐
   │ AppFlowy │      │  Agents  │        │ Directus │
   │  Cloud   │      │Roo/Kilo/ │        │   CMS    │
   │ or Self  │      │ Quad/etc │        │          │
   └──────────┘      └──────────┘        └──────────┘
```

---

## Implementation Plan (Phase by Phase)

### Phase 1: Custom Dashboard as Kanban Hub (DONE ✅)
**Status**: Complete  
**File**: [`AGENT_CONTROL_DASHBOARD.html`](smartgen/AGENT_CONTROL_DASHBOARD.html)

What we have:
- Visual Kanban board (To Do / In Progress / Done)
- Project sidebar with task counts
- Active agents panel with load bars
- File preview grid
- Activity feed
- Stats overview

**Missing**: Backend connections (currently static HTML)

---

### Phase 2: AppFlowy Data Exporter
**Build a script that reads from AppFlowy and exports to our format**

```javascript
// Pseudocode for AppFlowy → VidiSmart Bridge
const APPFLOWY_CONFIG = {
  // If self-hosted:
  baseUrl: 'http://localhost:3000',  // Your AppFlowy instance
  // Or cloud:
  cloudUrl: 'https://appflowy.cloud',
  apiKey: process.env.APPFLOWY_API_KEY,
};

// AppFlowy has a GraphQL/REST API when self-hosted
// We query the Kanban database and sync tasks
async function syncFromAppFlowy() {
  const kanbanBoard = await appflowy.getDatabase('Project Tasks');
  const tasks = kanbanBoard.rows.map(row => ({
    id: row.id,
    title: row.get('Title'),
    status: row.get('Status'),        // To Do / In Progress / Done
    priority: row.get('Priority'),    // Critical / High / Medium / Low
    assignee: row.get('Assignee'),
    tags: row.get('Tags'),
    description: row.get('Description'),
    source: 'appflowy',              // Track where it came from
  }));
  
  return tasks;
}
```

**Key insight**: AppFlowy stores data locally in SQLite (when desktop) or PostgreSQL (when self-hosted). We can read directly from the database OR use their API.

---

### Phase 3: Web Fetch Enrichment Layer
**This solves your "stale data" problem**

```javascript
// When an agent needs info about a topic:
class WebFetchEnricher {
  async enrichTask(task) {
    // 1. Check if we have current info (< 24h old)
    const cached = await cache.get(task.title);
    if (cached && !this.isStale(cached)) return cached;
    
    // 2. Fetch live data from multiple sources
    const results = await Promise.allSettled([
      this.webSearch(task.title + ' 2026'),           // Tavily search
      this.screenshotRelevantPages(task.title),        // Playwright capture
      this.fetchGitHubIssues(task.title),              // GitHub API
      this.fetchDocumentation(task.title),             // Official docs
    ]);
    
    // 3. Merge into enriched context
    const enriched = {
      ...task,
      webContext: this.mergeResults(results),
      lastEnriched: new Date().toISOString(),
      sources: this.extractSources(results),
    };
    
    // 4. Store back to knowledge base
    await cache.set(task.title, enriched);
    
    // 5. Optionally push summary to AppFlowy
    await appflowy.updatePage(task.appflowyPageId, {
      content: this.generateSummary(enriched),
    });
    
    return enriched;
  }
}
```

**This is the missing piece that makes your knowledge base CURRENT instead of stale.**

---

### Phase 4: Bidirectional Sync
**Changes anywhere appear everywhere**

```
User moves card in AppFlowy 
  → Bridge detects change via webhook/polling
    → Updates Kanban in Dashboard
      → Notifies Hermes Agent
        → Reassigns to appropriate AI agent
          → Agent picks up task
            → Works on it
              → Updates status back through bridge
                → AppFlowy shows progress
                  → Dashboard updates live
```

---

### Phase 5: Agent Integration Matrix

| Agent | Role | Connects To | Kanban Column |
|-------|------|------------|---------------|
| **Roo (VS Code)** | Code generation | VS Code workspace | In Progress → Done |
| **Kilo Code** | Code review | PRs / commits | In Progress → Done |
| **Quad** | Multi-model routing | LLM APIs | Research → To Do |
| **Hermes** | Task orchestration | All agents | Coordinates all columns |
| **Research Agent** | Web fetching | Internet sources | To Do → In Progress |
| **Coordinator** | Project management | Dashboard / AppFlowy | Oversees all |

---

## File Structure for Integration

```
vidismart/
├── smartgen/
│   ├── AGENT_CONTROL_DASHBOARD.html    ← Phase 1 (DONE)
│   ├── APPFLOWY_INTEGRATION_ARCHITECTURE.md  ← THIS FILE
│   ├── bridge/
│   │   ├── server.js                   ← Express + Socket.io server
│   │   ├── appflowy-connector.js       ← Read/write AppFlowy data
│   │   ├── hermes-connector.js         ← Talk to Hermes agent
│   │   ├── directus-connector.js       ← CMS sync
│   │   ├── kanban-engine.js            ← Core Kanban logic
│   │   └── web-enricher.js             ← Web fetch + screenshot
│   └── config/
│       ├── bridge.config.json          ← Connection settings
│       └── agents.json                 ← Agent definitions
```

---

## AppFlowy Setup Options

### Option A: Use AppFlowy Cloud (Easiest)
- Your existing account at `beta.appflowy.cloud`
- **Limitation**: No API access, no webhooks, limited automation
- **Verdict**: Good for knowledge base, bad for integration

### Option B: Self-Host AppFlowy (Recommended)
- Docker Compose deployment
- Full API access
- Database direct access (PostgreSQL)
- Webhook support possible
- **Verdict**: Best for integration

### Option C: Export & Sync (Pragmatic)
- Keep using AppFlowy Cloud for manual editing
- Export Kanban data periodically (CSV/JSON)
- Our bridge reads exports and syncs
- Push updates back via import
- **Verdict**: Works today without migration

---

## Immediate Next Steps (What to Build Right Now)

1. **✅ Kanban Dashboard UI** — DONE (Agent Control Center)
2. **📋 Task Data Format** — Define JSON schema for tasks
3. **🔌 AppFlowy Export Script** — Pull your existing Kanban boards
4. **🌐 Web Fetch Module** — Add live data fetching to any task
5. **🔄 Sync Daemon** — Polling loop to keep everything current
6. **🤖 Agent Dispatcher** — Route tasks to Roo/Kilo/Quad based on type

---

## The Honest Truth

**There is no existing product that does all of this.** Here's why:

| Product | Kanban | AI Agents | Web Fetch | AppFlowy Sync | Status |
|---------|--------|-----------|-----------|---------------|--------|
| Linear | ✅ | ❌ | ❌ | ❌ | Dev-focused only |
| Plane | ✅ | ❌ | ❌ | ❌ | Dev-focused only |
| CrewAI | ❌ | ✅ | ❌ | ❌ | No UI at all |
| SGLang | ❌ | ✅ | ❌ | ❌ | Backend only |
| AppFlowy | ✅ | ⚠️ | ❌ | N/A | No external AI |
| Notion | ✅ | ⚠️ | ❌ | N/A | Closed ecosystem |
| **VidiSmart Bridge** | ✅ | ✅ | ✅ | ✅ | **WE BUILD THIS** |

**We're building the missing link.**

---

## Quick Start Command (When Ready)

```bash
# Once we build the bridge server:
cd smartgen/bridge
npm install
node server.js
# Opens http://localhost:3000 with live Kanban
# Connected to AppFlowy + Hermes + Directus + Web Fetch
```

---

*This architecture document is living. Update as we build each phase.*

# VIDIFLOW MASTER PLAN: Local AI & Agentic Orchestration

**Status:** ACTIVE
**Last Updated:** February 2026
**Primary Objective:** Build a private, local-first AI Knowledge Base (VidiFlow) that acts as the central brain for personal data, while orchestrating complex workflows via autonomous agents (Gemini, Kimi K2.5, etc.).

---

## 🏗️ Phase 1: The Core - VidiFlow Application (CURRENT STATUS: ✅ DEPLOYED)
**Goal:** A private, secure workspace for data with "Visual RAG" capabilities.

### 1. AppFlowy Basis
- **Core:** AppFlowy Nightly (Stable)
- **Modifications:** None to source code (to preserve updateability).
- **Extension Method:** Middleware Proxy (`AppFlowy-Proxy`)

### 2. VidiFlow AI Proxy (The Bridge)
- **Role:** Intercepts LLM calls to inject real-time data & tools.
- **Location:** `m:\code\vidismart\AppFlowy-Proxy`
- **Technology:** Python + Flask + Tavily API
- **Capabilities:**
    - **Visual RAG:** Fetches images, videos (YouTube), and PDFs during search.
    - **Universal Compatibility:** Uses **ReAct Pattern** (Text-based triggers) instead of native tool definitions, allowing it to work with **ANY** model (Qwen-VL, GLM-4V, Llama 2, older Mistral, etc.).
    - **Deep Search:** Uses Tavily 'Advanced' mode for high-fidelity answers.
    - **Auto-Formatting:** Cleans raw data into Markdown for AppFlowy notes.
- **Launch Method:** `Launch-VidiFlow.ps1` (Autopilot).

### 3. Local AI Models
- **Engine:** Ollama or LM Studio.
- **Primary Models:**
    - `qwen2.5-coder:32b` (Structure & Code)
    - `llama3.3` (General Reasoning)
    - `glm-4-flash` (Speed)
- **Configuration:** Point AppFlowy to `http://localhost:11435`.

---

## 🤖 Phase 2: Agentic Orchestration (NEXT STEPS)
**Goal:** Move from "Chatting with AI" to "AI doing work". We will use a Multi-Agent System (MAS).

### 1. The Agents
| Agent Name | Role | Backend | Status |
|Details|---|---|---|
| **VidiFlow Core** | Knowledge Base & RAG | Ollama + Proxy | ✅ Active |
| **Gemini (DeepMind)** | High-level Reasoning & Coding | Google Gemini 2.0 | 🟢 Integration Ready |
| **Kimi K2.5** | Long-Context Analysis (Docs) | Moonshot AI | 🟡 Planned |
| **Vespa Engine** | Semantic Search & Lead Gen | Vespa Vector DB | 🟡 In Progress |

### 2. The Orchestration Layer
We will build a "Control Plane" that directs traffic between these agents.
- **Workflow:**
    1. **User Request:** "Research this topic and generate a report."
    2. **Router:** Decides which agent handles it.
        - *Complex Logic?* -> Send to **Gemini**.
        - *Huge PDF Dump?* -> Send to **Kimi**.
        - *Quick Fact?* -> Send to **VidiFlow Core**.
    3. **Execution:** Agents perform tasks using their specific tools.
    4. **Aggregation:** VidiFlow collects results and stores them in the Knowledge Base (AppFlowy).

### 3. Integration with Kimi K2.5
- **Strengths:** 200k+ context window, excellent at reading entire repos or books.
- **Plan:**
    - Use Kimi to ingest massive project documentation.
    - Output structured implementation plans (JSON/Markdown).
    - Feed plans into **VidiFlow** for execution by Gemini/Local Agents.

---

## 📝 Documentation & Monitoring Standards
**Rule:** No "Shadow Work". Every task must be documented.

1.  **Plan First:** No code is written without a `.md` plan file.
2.  **Logs:** All Agent actions must be logged to `m:\code\vidismart\logs\`.
3.  **Visuals:** Implementation plans must include Mermaid diagrams for flow visualization.

---

## 🚀 Immediate Action Items
1.  **Daily Routine:**
    - Run `Launch-VidiFlow.ps1` to start the "Brain".
2.  **Dev Task:**
    - Design the API connector for Kimi K2.5 within the Proxy.
    - Create the "Orchestrator" script to route between Gemini and Local AI.

---
*Verified by VidiSmart Architecture Team*

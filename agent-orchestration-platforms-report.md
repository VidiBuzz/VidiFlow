# Agent Army Orchestration Platforms - Deep Dive Report
## March 23, 2026

---

# TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [Platform Deep Dives](#platform-deep-dives)
   - NVIDIA NemoClaw + Agent Toolkit
   - OpenClaw (Original)
   - OpenFang
   - ZeroClaw
   - Microsoft Agent Framework
   - CrewAI
   - Dify
   - Flowise
3. [OpenFang Comparison Chart (Official)](#openfang-comparison)
4. [Benchmarks (Official)](#benchmarks)
5. [Content Creation + ComfyUI Integration](#content-creation)
6. [Local LLM + Qwen 3.5 Support](#local-llm)
7. [Setting Up Playwright MCP for Screenshots](#playwright-mcp)
8. [Recommended Architecture](#recommended-architecture)

---

<a id="executive-summary"></a>
## 1. EXECUTIVE SUMMARY

The agent orchestration landscape fractured in early 2026 after OpenClaw became GitHub's fastest-growing open source project (332K stars). This created a security crisis: OpenClaw's rapid adoption exposed enterprises to uncontrolled agent access. The result: NVIDIA's NemoClaw (enterprise-secured OpenClaw), OpenFang (Rust-based security-first OS), and ZeroClaw (ultra-lightweight Rust alternative).

**Your Requirements Assessment:**
| Requirement | Best Platforms |
|------------|----------------|
| Enterprise Security | OpenFang (16 layers), NemoClaw, ZeroClaw |
| Content Creation/ComfyUI | All via API + ComfyUI-OpenClaw plugin |
| Local LLM (Qwen 3.5) | All support Ollama |
| Plugin/LoRA Support | ComfyUI Agent, VideoAgent |
| Visual Workflows | Dify, Flowise |
| Multi-Agent Orchestration | CrewAI, Microsoft Agent Framework |

---

<a id="platform-deep-dives"></a>
## 2. PLATFORM DEEP DIVES

---

### 2.1 NVIDIA NemoClaw + Agent Toolkit

**Announced:** GTC 2026 (March 16, 2026)
**Status:** GA
**License:** Open Source (Apache 2.0)
**Website:** https://developer.nvidia.com/agentiq
**Analysis Source:** https://futurumgroup.com/insights/at-gtc-2026-nvidia-stakes-its-claim-on-autonomous-agent-infrastructure/

#### What It Is
NemoClaw is NOT a standalone product - it's a **packaged stack** bundling three components:
1. **NemoClaw** - Secure agent runtime (the renamed/evolved OpenClaw)
2. **OpenShell** - Open-source secure runtime with sandboxing, least-privilege access, privacy router
3. **AI-Q** - Open blueprint for enterprise deep research agents (via LangChain)
4. **Nemotron** - Family of open models optimized for agentic reasoning

#### The Security Architecture
- **Process-level isolation** for each agent
- **Least-privilege access controls** - agents can only access approved resources
- **Privacy router** - uses NVIDIA's Gretel acquisition for differential privacy, strips PII from prompts before sending to external APIs
- **Policy enforcement via CLI**
- **Runs beneath enterprise platforms** (ServiceNow, Salesforce, SAP) - not competing with them

#### Key Enterprise Integrations (Live)
- **Salesforce** - Slack as conversational interface for Agentforce agents
- **SAP** - Joule Studio on SAP BTP
- **ServiceNow** - Autonomous Workforce of AI Specialists
- **Siemens** - Fuse EDA AI Agent for semiconductor design
- **CrowdStrike** - Secure-by-Design AI Blueprint
- **Adobe, Atlassian, Cisco, Cohesity, Dassault Systèmes**

#### Nemotron Model Family
| Model | Status | Use Case |
|-------|--------|----------|
| Nemotron 3 Super | Available now | Research/summarization sub-agents |
| Nemotron Ultra | Coming H1 2026 | Larger reasoning and coding |
| Nemotron Omni | Announced | Multimodal (text, speech, image, video, audio) |
| Nemotron VoiceChat | Announced | Speech-to-speech for real-time interaction |

#### Nemotron Coalition Members
Black Forest Labs, Cursor, LangChain, Mistral AI, Perplexity, Reflection AI, Sarvam, Thinking Machines Lab (Mira Murati's venture)

#### Pros
- NVIDIA GPU optimization
- Enterprise-grade security (OpenShell)
- Massive ISV ecosystem
- LangChain integration (AI-Q)
- Privacy router for PII protection

#### Cons
- Very new (March 2026)
- Enterprise roadmap less defined than enthusiast features
- No third-party security audits yet
- Tied to NVIDIA ecosystem

#### Best For
Enterprise deployments needing GPU-accelerated agent workloads with security compliance.

---

### 2.2 OpenClaw (The Original)

**GitHub:** https://github.com/openclaw/openclaw
**Stars:** 332,000+ ⭐
**Forks:** 64,700+
**License:** MIT
**Language:** TypeScript
**Created:** January 25, 2026
**Creator:** Peter Steinberger (joined OpenAI Feb 2026)

#### What It Is
OpenClaw is a **personal AI assistant** you run on your own devices. It answers on 22+ messaging channels (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, etc.).

#### Architecture
```
WhatsApp/Telegram/Slack/Discord/Signal/iMessage...
              │
              ▼
┌───────────────────────────────┐
│            Gateway            │
│       (control plane)         │
│     ws://127.0.0.1:18789      │
└──────────────┬────────────────┘
               │
               ├─ Pi agent (RPC)
               ├─ CLI (openclaw ...)
               ├─ WebChat UI
               ├─ macOS app
               └─ iOS / Android nodes
```

#### Key Features
- **22+ channel adapters** - WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, BlueBubbles, IRC, Microsoft Teams, Matrix, Feishu, LINE, Mattermost, Nextcloud Talk, Nostr, Synology Chat, Tlon, Twitch, Zalo, Zalo Personal, WebChat
- **Voice Wake + Talk Mode** - wake words on macOS/iOS, continuous voice on Android
- **Live Canvas** - agent-driven visual workspace with A2UI
- **Browser control** - dedicated Chrome/Chromium with CDP control
- **Companion apps** - macOS menu bar, iOS/Android nodes
- **Skills platform** - bundled, managed, workspace skills
- **Multi-agent routing** - route channels to isolated agents

#### Security (The Problem)
- **Default:** tools run on host with full access for main session
- **Group safety:** requires manual sandbox configuration
- **3 basic security layers** vs OpenFang's 16
- **No WASM sandbox**
- **File-based memory** (not encrypted)

#### Install
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

#### Why NVIDIA Made NemoClaw
OpenClaw became the fastest-growing open source project in history after release. The security model was designed for personal use, not enterprise. NVIDIA saw the enterprise opportunity and built OpenShell to wrap OpenClaw with proper security.

#### Pros
- Massive community (332K stars)
- Most channels (22+)
- Works everywhere (macOS, Linux, Windows via WSL2)
- Voice wake, canvas, browser control
- MIT license

#### Cons
- **Security not enterprise-grade**
- TypeScript (heavier than Rust alternatives)
- 394MB idle memory usage
- 5980ms cold start
- 3 basic security layers

#### Best For
Personal use, enthusiasts, developers wanting maximum channel support.

---

### 2.3 OpenFang

**Website:** https://openfang.sh
**GitHub:** https://github.com/RightNow-AI/openfang
**Version:** v0.3.30 (March 2026, pre-1.0)
**License:** MIT
**Language:** Rust (137K LOC)
**Created:** February 24, 2026
**Maintainer:** Jaber, Founder of RightNow

#### What It Is
OpenFang is a **full Agent Operating System** - NOT a chatbot framework, NOT a Python wrapper. It's an OS for autonomous agents built entirely in Rust.

#### Architecture (14 Crates)
```
openfang-kernel    → Orchestration, workflows, RBAC, scheduler, metering, budget tracking
openfang-runtime   → Agent loop, 3 LLM drivers, 53 tools, WASM sandbox, MCP, A2A
openfang-api       → 140+ REST/WS/SSE endpoints, OpenAI-compatible API, dashboard
```

#### 16 Security Systems (Defense in Depth)
| # | System | Protection |
|---|--------|------------|
| 1 | WASM dual-metered sandbox | Resource isolation (fuel + epoch interruption) |
| 2 | Ed25519 manifest signing | Code integrity verification |
| 3 | Merkle audit trail | Tamper-proof logging |
| 4 | Taint tracking | Data flow security |
| 5 | SSRF protection | Server-side request forgery prevention |
| 6 | Secret zeroization | Automatic secret cleanup |
| 7 | HMAC-SHA256 mutual auth | Secure agent communication |
| 8 | GCRA rate limiter | Abuse prevention |
| 9 | Subprocess isolation | Process-level security (env-cleared, timeout-enforced) |
| 10 | Prompt injection scanner | LLM attack prevention |
| 11 | Path traversal prevention | File system security |
| 12 | Workspace confinement | File operations workspace-confined |
| 13 | 10-phase graceful shutdown | Clean state preservation |
| 14-16 | Additional layers | See full docs |

#### 7 Autonomous "Hands" (Pre-built Agents)
| Hand | Function | Key Features |
|------|----------|--------------|
| 🎬 Clip | Content creation | Video→shorts, FFmpeg+yt-dlp, 5 STT backends, auto-publish |
| 📊 Lead | Data gathering | ICP scoring 0-100, web research, CSV/JSON/MD export |
| 🔍 Collector | OSINT | Change detection, sentiment analysis, knowledge graphs |
| 🔮 Predictor | Forecasting | Brier score calibration, contrarian mode, evidence chains |
| 🔬 Researcher | Deep research | CRAAP fact-checking, multi-language, APA citations |
| 𝕏 Twitter | Social media | 7 rotating content formats, approval queue, brand voice |
| 🌐 Browser | Web automation | Playwright bridge, session persistence, purchase gate |

#### 30 Pre-Built Agents
Four performance tiers across Anthropic, Gemini, Groq, DeepSeek.

#### 38 Built-in Tools + MCP
Web search, browser automation, image generation, TTS, Docker, knowledge graphs.

#### 40 Channel Adapters
Telegram, Discord, Slack, WhatsApp, Teams, IRC, Matrix, and 33 more.

#### Protocols
- **MCP** (Model Context Protocol) - client + server
- **A2A** (Google Agent-to-Agent)
- **OFP** (OpenFang Protocol) - P2P with HMAC-SHA256 mutual auth

#### Desktop App
Tauri 2.0 native app with:
- System tray
- Notifications
- Single-instance enforcement
- Auto-start on login
- Global shortcuts
- Full dashboard

#### Persistent Memory
SQLite-backed storage with vector embeddings. Cross-channel canonical sessions, automatic LLM-based compaction, JSONL session mirroring.

#### Install
```bash
curl -fsSL https://openfang.sh/install | sh
```

#### Pros
- **16 security layers** (most of any platform)
- Rust performance (180ms cold start, 40MB memory)
- 7 autonomous Hands (run 24/7 without prompting)
- WASM sandboxed execution
- Merkle audit trail
- 40 channel adapters
- Tauri desktop app

#### Cons
- Pre-1.0 (breaking changes possible)
- Smaller community than OpenClaw/CrewAI
- Content creation requires API integration
- Learning curve for TOML configuration

#### Best For
Maximum security, autonomous 24/7 operation, enterprise deployments, edge devices.

---

### 2.4 ZeroClaw

**GitHub:** https://github.com/theonlyhennygod/zeroclaw (search for zeroclaw)
**Stars:** 3,756+
**License:** MIT
**Language:** Rust
**Created:** February 2026

#### What It Is
ZeroClaw is a **minimal Rust-based AI agent framework** designed for self-hosted systems with extreme resource constraints. Full agents running in under 5MB of RAM.

#### Key Metrics (Official)
| Metric | ZeroClaw | OpenClaw | OpenFang |
|--------|----------|----------|----------|
| Cold Start | 10ms | 5980ms | 180ms |
| Idle Memory | 5MB | 394MB | 40MB |
| Install Size | 8.8MB | 500MB | 32MB |
| Security Layers | 6 | 3 | 16 |
| LLM Providers | 28 | 10 | 27 |
| Channel Adapters | 15 | 13 | 40 |

#### Architecture
- Single Rust binary
- Trait-based design (providers, memory, tools, channels all swappable)
- Cross-platform (ARM, x86, RISC-V)

#### Security Features
- Authentication pairing
- Workspace isolation
- Explicit tool allowlists
- Supervised autonomy mode (default)
- Sovereign mode (all API keys local, no external orchestration)

#### Run Modes
1. **CLI mode** - one-off terminal commands
2. **Gateway mode** - webhooks trigger agent
3. **Channel mode** - persistent agent on messaging platforms

#### Supported Providers
OpenAI, Anthropic, Google Gemini, Groq, Hugging Face, Ollama (local), and more.

#### Install
```bash
# Download binary for your platform
# Or build from source
git clone https://github.com/theonlyhennygod/zeroclaw
cd zeroclaw
cargo build --release
```

#### Pros
- **Smallest footprint** (5MB RAM, 8.8MB install)
- **Fastest cold start** (10ms)
- 28 LLM providers (most of any Rust option)
- Cross-architecture support (ARM, x86, RISC-V)
- MIT license

#### Cons
- No autonomous Hands (agents need prompting)
- No desktop app
- Smaller community
- Less feature-rich than OpenFang
- No WASM sandbox

#### Best For
Raspberry Pi, low-cost VPS, IoT devices, constrained hardware, edge deployments.

---

### 2.5 Microsoft Agent Framework

**Docs:** https://learn.microsoft.com/en-us/agent-framework/overview/
**Status:** Release Candidate (Feb 2026), heading to GA
**License:** Open Source
**Website:** https://learn.microsoft.com/en-us/agent-framework/overview/

#### What It Is
Microsoft Agent Framework is the **direct successor to both AutoGen and Semantic Kernel**. It combines:
- AutoGen's simple agent abstractions
- Semantic Kernel's enterprise features
- Graph-based workflows for explicit multi-agent orchestration

#### Key Features
- **Simple agent creation** - zero to working agent in lines of code
- **Function tools** - type-safe tool definitions
- **Graph-based workflows** - sequential, concurrent, handoff, group chat
- **Multi-provider** - Azure OpenAI, OpenAI, Anthropic, Ollama, AWS Bedrock
- **A2A, AG-UI, MCP** protocol support
- **Session-based state management**
- **Built-in checkpointing** for long workflows
- **Human-in-the-loop** support
- **Streaming** real-time responses

#### Multi-Agent Patterns
- **Sequential** - tasks flow one after another
- **Concurrent** - parallel agent execution
- **Group Chat** - conversational agent teams (AutoGen heritage)
- **Handoff** - agents pass control based on conditions
- **MagenticOne** - advanced orchestration pattern

#### Local LLM Support
- **Ollama** integration for local models
- **Azure OpenAI** for cloud
- **OpenAI, Anthropic, AWS Bedrock** - all supported

#### Migration
- From AutoGen: straightforward with mapping guide
- From Semantic Kernel: direct upgrade path
- Both communities merge into one ecosystem

#### Pros
- Mature enterprise features from Semantic Kernel heritage
- Excellent Python AND .NET support
- Strong Microsoft ecosystem integration
- Good local LLM support (Ollama)
- Production monitoring via Foundry

#### Cons
- Content creation requires custom tooling
- Less GPU-optimized than NVIDIA
- Still in RC (not GA)
- Graph-based model has learning curve

#### Best For
Microsoft ecosystem enterprises, .NET developers, teams needing robust multi-agent workflows.

---

### 2.6 CrewAI

**Website:** https://crewai.com
**GitHub:** https://github.com/crewAIInc/crewAI
**Stars:** 45,900+
**Version:** v1.10.1 (March 2026)
**License:** MIT (OSS) + Commercial Platform

#### What It Is
CrewAI is a **role-based multi-agent orchestration framework**. "Agents as team members" - you define a Researcher, Writer, Reviewer with roles/goals, then let them collaborate.

#### Key Stats (Official)
- 60% of Fortune 500 companies use CrewAI
- 450M+ agentic workflows running monthly
- 100,000+ certified developers
- Customers: DocuSign, IBM, PwC, General Assembly

#### Architecture
```
Crews    → Autonomous agent collaboration
Flows    → Deterministic workflow control
Tools    → 700+ application integrations
Memory   → 4-layer persistent learning
```

#### Key Features
- **Role-based agent design** - roles, goals, backstories
- **Native tool integration** - Gmail, Teams, Notion, HubSpot, Salesforce, Slack
- **Real-time tracing** - every agent step tracked
- **Advanced guardrails** - LLM-as-judge quality control
- **MCP + A2A native support** (v1.10+)
- **Visual editor** (Crew Studio) for non-technical users
- **Production monitoring** via CrewAI Enterprise

#### Process Types
- **Sequential** - tasks executed in order
- **Hierarchical** - manager delegates to workers
- **Consensual** - agents reach agreement

#### Enterprise Features
- **CrewAI AMP** (Managed Platform) - cloud-hosted
- **CrewAI AMP Factory** - self-hosted on AWS, Azure, GCP, on-prem
- SSO, VPC deployment, dedicated support

#### Pricing
| Tier | Price | Features |
|------|-------|----------|
| Basic (Free) | $0 | 50 executions/month, 1 seat, visual editor |
| Professional | $25/month | 100 executions/month, 2 seats, community support |
| Enterprise | Custom | Unlimited, SSO, VPC deployment, dedicated support |

#### Pros
- Fastest prototyping (working pipeline before lunch)
- Natural team-based collaboration model
- Strong content workflow support
- Great documentation and community
- Enterprise customers prove production readiness
- Visual editor for non-technical users

#### Cons
- Security less robust than OpenFang/NemoClaw (1 layer)
- 200MB idle memory
- 3000ms cold start
- Limited checkpointing
- Local LLM support requires Ollama configuration
- ComfyUI integration needs custom tool setup

#### Best For
Rapid multi-agent development, content pipelines, marketing automation, teams with mixed technical skills.

---

### 2.7 Dify

**Website:** https://dify.ai
**GitHub:** https://github.com/langgenius/dify
**License:** Apache 2.0
**Status:** Stable

#### What It Is
Dify is an **open-source LLM application development platform** with visual workflow builder. "Backend-as-a-Service for AI."

#### Core Capabilities
- **Visual Workflow Builder** - drag & drop canvas
- **100+ LLM Provider Support** - OpenAI, Anthropic, Ollama, Qwen, etc.
- **Native RAG Pipeline** - document loading, vector databases
- **50+ Built-in Tools** - Google Search, DALL-E, Stable Diffusion, Wolfram Alpha
- **Agent Framework** - Function Calling / ReAct
- **Prompt IDE** - intuitive interface for crafting prompts
- **LLMOps** - logs, analytics, continuous improvement
- **MCP Server Publishing** - workflows as MCP servers

#### Architecture
```
PostgreSQL → Primary database
Redis → Caching and message queue
Weaviate → Vector database for RAG
Docker/K8s ready
```

#### Self-Hosting Benefits
- Data never leaves your network
- Mix local + cloud models
- No rate limits
- No per-token API charges for internal use

#### Local LLM Support
- **Ollama integration** for local models
- **Qwen support** via Tongyi plugin
- **DeepSeek, Llama, Mistral** - all supported

#### Known Qwen Issues
- Qwen3 requires streaming mode (non-stream validation fails)
- Some models missing/deprecated in older plugin versions
- Upgrade to Dify 1.3.0+ for full Qwen3 support

#### Pros
- Easiest visual workflow builder
- Strong RAG support
- Good local LLM support
- Easy self-hosting
- Apache 2.0 license (permissive)
- Production-ready

#### Cons
- Multi-agent support less mature than CrewAI
- Content creation requires external tool integration
- Some Qwen3 compatibility issues documented
- Enterprise features require paid tier

#### Best For
Visual LLM app development, RAG workflows, knowledge-based content, teams wanting no-code AI development.

---

### 2.8 Flowise

**Website:** https://flowiseai.com
**GitHub:** https://github.com/FlowiseAI/Flowise
**License:** MIT
**Acquired by:** Workday (August 2025)
**Status:** Stable

#### What It Is
Flowise is the **"Figma for backend AI"** - visual drag-and-drop platform for building LLM applications. Built on LangChain.

#### Key Features
- **Visual Drag & Drop UI** - design AI workflows like flowcharts
- **Agentflow** - multi-agent system orchestration
- **Chatflow** - single-agent chatbots with RAG
- **100+ LLM/Embedding/Vector DB integrations**
- **Human-in-the-Loop (HITL)** workflows
- **Real-time observability** (Prometheus/OpenTelemetry)
- **API, SDK, Embedded widget** deployment
- **Self-hosted or Cloud**

#### Agentflow Capabilities
- Coordinated multi-agent systems
- Sequential, parallel, conditional flows
- Agent delegation and handoff
- State management between agents
- Tool sharing across agents

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 2 flows, 100 predictions/month, 5MB storage |
| Starter | $35/month | Unlimited flows, 10K predictions, 1GB storage |
| Pro | $65/month | 50K predictions, 10GB, 5 users, RBAC, priority support |
| Enterprise | Custom | SSO/SAML, on-prem, LDAP/RBAC, audit logs, SLA |

#### Pros
- Easiest visual builder in the market
- Good for rapid prototyping
- Strong LangChain ecosystem integration
- Self-hosting available
- Workday backing provides stability
- Visual debugging

#### Cons
- Workday acquisition may shift focus to enterprise HR/finance
- Content creation needs external ComfyUI connection
- Local LLM support via Ollama configuration
- Enterprise pricing opacity
- May need more storage for data-heavy deployments

#### Best For
Rapid prototyping, visual AI workflow building, teams with mixed technical skills.

---

<a id="openfang-comparison"></a>
## 3. OPENFANG OFFICIAL COMPARISON CHART

Source: https://openfang.sh (directly from their website)

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                        OpenFang vs The Landscape                                       ║
║                        6 frameworks. 10 dimensions.                                    ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

Feature                  │ OpenFang │ OpenClaw │ ZeroClaw │ CrewAI │ AutoGen │ LangGraph
─────────────────────────┼──────────┼──────────┼──────────┼────────┼─────────┼──────────
01 Language              │ Rust     │ TypeScript│ Rust    │ Python │ Python  │ Python
02 Autonomous Hands      │ 7 built-in│ None    │ None     │ None   │ None    │ None
03 Security Layers       │ 16 discrete│ 3 basic │ 6 layers │ 1 basic│ Docker  │ AES enc.
04 Agent Sandbox         │ WASM dual│ None     │ Allowlists│ None  │ Docker  │ None
05 Channel Adapters      │ 40       │ 13       │ 15       │ 0      │ 0       │ 0
06 Built-in Tools        │ 53 + MCP │ 50+      │ 12       │ Plugins│ MCP     │ LC tools
07 Memory                │ SQLite+vec│ File-based│ SQLite FTS5│ 4-layer│ External│ Checkpoints
08 Desktop App           │ Tauri 2.0│ None     │ None     │ None   │ Studio  │ None
09 Audit Trail           │ Merkle chain│ Logs  │ Logs     │ Tracing│ Logs    │ Checkpoints
10 License               │ MIT      │ MIT      │ MIT      │ MIT    │ Apache 2.0│ MIT

WINNER SCORES: OpenFang 9, ZeroClaw 1
```

---

<a id="benchmarks"></a>
## 4. OPENFANG OFFICIAL BENCHMARKS

Source: https://openfang.sh (directly from their website)

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                        Measured, Not Marketed                                          ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

COLD START TIME (lower is better)
──────────────────────────────────
ZeroClaw    │ ████ 10ms
OpenFang    │ ████████████████████ 180ms
LangGraph   │ ████████████████████████████████████████████████████████████████████ 2500ms
CrewAI      │ ████████████████████████████████████████████████████████████████████████████ 3000ms
AutoGen     │ ████████████████████████████████████████████████████████████████████████████████████████ 4000ms
OpenClaw    │ ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 5980ms

IDLE MEMORY USAGE (lower is better)
───────────────────────────────────
ZeroClaw    │ ████ 5MB
OpenFang    │ █████████████████████████████████████████ 40MB
LangGraph   │ ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 180MB
CrewAI      │ ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 200MB
AutoGen     │ █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 250MB
OpenClaw    │ █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 394MB

INSTALL SIZE (lower is better)
─────────────────────────────
ZeroClaw    │ ██ 8.8MB
OpenFang    │ ████████████ 32MB
CrewAI      │ ██████████████████████████████████████ 100MB
LangGraph   │ ██████████████████████████████████████████████████████████ 150MB
AutoGen     │ ████████████████████████████████████████████████████████████████████████████ 200MB
OpenClaw    │ █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 500MB

SECURITY SYSTEMS (higher is better)
───────────────────────────────────
OpenFang    │ █████████████████████████████████████████████████████████████████ 16 layers
ZeroClaw    │ ██████████████████████ 6 layers
OpenClaw    │ ████████████ 3 layers
AutoGen     │ ████████ 2 layers
LangGraph   │ ████████ 2 layers
CrewAI      │ ████ 1 layer

CHANNEL ADAPTERS (higher is better)
───────────────────────────────────
OpenFang    │ ████████████████████████████████████████ 40 built-in
ZeroClaw    │ ███████████████ 15 built-in
OpenClaw    │ █████████████ 13 built-in
CrewAI      │ 0
AutoGen     │ 0
LangGraph   │ 0

LLM PROVIDERS (higher is better)
────────────────────────────────
ZeroClaw    │ ████████████████████████████ 28 native
OpenFang    │ ███████████████████████████ 27 native
LangGraph   │ ███████████████ 15 native
CrewAI      │ ██████████ 10 native
OpenClaw    │ ██████████ 10 native
AutoGen     │ ████████ 8 native
```

---

<a id="content-creation"></a>
## 5. CONTENT CREATION + COMFYUI INTEGRATION

### 5.1 ComfyUI-OpenClaw
**GitHub:** https://github.com/rookiestar28/ComfyUI-OpenClaw
**License:** MIT
**Version:** v0.7.0 (March 2026)

A **security-first orchestration layer for ComfyUI** combining hardened automation with LLM-assisted nodes.

**Features:**
- LLM-assisted nodes (planner/refiner/vision/batch variants)
- Built-in extension UI (OpenClaw panel)
- Remote Admin Console (/openclaw/admin) for mobile operations
- Secure HTTP API (webhooks, triggers, schedules, approvals, presets)
- 7 messaging platforms: Discord, Telegram, WhatsApp, LINE, WeChat, KakaoTalk, Slack
- Approval workflows for content generation
- CSRF, HMAC, audit, SSRF controls

**Architecture:**
```
ComfyUI Process (single Python process + shared aiohttp app)
│
├── ComfyUI Core
│   ├── Native routes: /prompt, /history, /view, /upload, /ws
│   └── Execution engine + model runtime
│
└── OpenClaw package
    ├── /openclaw/* routes
    ├── /api/openclaw/* (browser/API shim)
    ├── Security modules (RBAC, CSRF, HMAC, audit, SSRF)
    ├── Automation services (approvals, schedules, presets)
    └── ComfyUI nodes (planner/refiner/image-to-prompt/batch)
```

### 5.2 ComfyUI-Expert (VideoAgent)
**GitHub:** https://github.com/MCKRUZ/ComfyUI-Expert
**License:** MIT

A **session-scoped AI orchestrator** that turns Claude into a senior video production technical director.

**12 Specialized Skill Modules:**
1. comfyui-api - REST API connection
2. comfyui-workflow-builder - Natural language to workflow JSON
3. comfyui-model-scanner - Scans installed models
4. comfyui-video-pipeline - Video generation
5. comfyui-voice-pipeline - Voice synthesis
6. comfyui-lora-trainer - LoRA training
7. comfyui-character-consistency - Character maintenance
8. comfyui-troubleshooter - Error diagnosis
9. comfyui-optimizer - GPU profiling, TensorRT
10. comfyui-research - Technique research
11. video-publisher - YouTube/social publishing
12. + foundation skills

**Supported Models:**
- Wan 2.2 MoE 14B (film-level quality, 5-10 sec clips, 24GB+ VRAM)
- InstantID for character consistency
- Talking head video generation

### 5.3 ComfyUI Agent
**GitHub:** https://github.com/JosephOIbrahim/comfyui-agent
**License:** MIT

AI assistant for ComfyUI with **77 specialized tools** across tiers:

| Tier | Tools | Examples |
|------|-------|----------|
| DISCOVER | 12 | Search nodes, models, compatibility |
| MANAGE | 10 | Load/save/modify workflows |
| EXECUTE | 8 | Queue prompts, poll status |
| Vision | 4 | Image analysis, A/B comparison |
| Planner | 4 | Goal decomposition, step tracking |
| Memory | 4 | Outcome learning, cross-session |
| Orchestrator | 2 | Parallel sub-tasks |
| Optimizer | 4 | GPU profiling, TensorRT detection |
| Demo | 2 | Guided walkthroughs |
| Intent | 4 | Artistic intent capture |
| Iteration | 3 | Refinement journey tracking |

---

<a id="local-llm"></a>
## 6. LOCAL LLM + QWEN 3.5 SUPPORT

### Platform Compatibility Matrix

| Platform | Ollama Support | Qwen Support | LoRA Support | Notes |
|----------|---------------|--------------|--------------|-------|
| OpenFang | ✅ 27 providers | ✅ Via Ollama | ✅ Via ComfyUI | Full provider list |
| OpenClaw | ✅ Via config | ✅ Via Ollama | ⚠️ Manual | Requires model config |
| ZeroClaw | ✅ 28 providers | ✅ Via Ollama | ⚠️ Manual | Most providers |
| NemoClaw | ✅ Via NIM | ✅ Via Ollama/NIM | ✅ Via ComfyUI | NVIDIA-optimized |
| MS Agent | ✅ Via Ollama | ✅ Via Ollama | ⚠️ Custom tools | Good integration |
| CrewAI | ✅ Via config | ✅ Via Ollama | ⚠️ Custom tools | Requires setup |
| Dify | ✅ Native | ⚠️ Known issues | ⚠️ External | Qwen3 needs v1.3.0+ |
| Flowise | ✅ Native | ✅ Via Ollama | ⚠️ External | Good integration |

### Qwen 3.5 Setup via Ollama (All Platforms)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Qwen 3.5
ollama pull qwen3.5

# Verify
ollama list
```

### LoRA Support
Local LoRAs are supported through **ComfyUI**, not directly through orchestration platforms:

1. Place LoRA files in `ComfyUI/models/loras/`
2. Reference in ComfyUI workflows
3. Use ComfyUI-OpenClaw or VideoAgent to manage
4. Orchestration platform triggers ComfyUI API

---

<a id="playwright-mcp"></a>
## 7. SETTING UP PLAYWRIGHT MCP FOR SCREENSHOTS

To capture screenshots of platform interfaces, you need to add Playwright MCP to OpenCode.

### Step 1: Install Playwright Browsers
```bash
npx playwright install
```

### Step 2: Add MCP Server to OpenCode

Edit your OpenCode config file:
- **Windows:** `%APPDATA%\opencode\opencode.json`
- **macOS/Linux:** `~/.config/opencode/opencode.json`

Add Playwright MCP:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

### Step 3: Restart OpenCode

The Playwright MCP server will now be available as tools. You can use it to:
- Navigate to URLs
- Take screenshots
- Extract page content
- Interact with elements

### Alternative: Use CLI to Add
```bash
opencode mcp add playwright
# Select "local"
# Enter command: npx -y @playwright/mcp@latest
```

### Screenshot Commands (Once MCP is Active)
After MCP is configured, you can ask me to:
1. Navigate to a URL
2. Take a screenshot
3. Save it to a file

---

<a id="recommended-architecture"></a>
## 8. RECOMMENDED ARCHITECTURE FOR YOUR USE CASE

Based on your requirements (enterprise security, content creation, ComfyUI, local LLMs including Qwen 3.5):

### PRIMARY RECOMMENDATION: OpenFang + ComfyUI Expert

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPENFANG (Agent OS)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  16 Security Layers │ WASM Sandbox │ Merkle Audit Trail                 │
│  40 Channel Adapters│ 30 Agents    │ 27 LLM Providers                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AUTONOMOUS HANDS (24/7 Operation):                                     │
│  ├── 🎬 Clip → Video content creation (FFmpeg + yt-dlp)                 │
│  ├── 🔬 Researcher → Deep research with CRAAP fact-checking             │
│  └── 🌐 Browser → Web automation (Playwright)                           │
│                                                                         │
│  LLM LAYER:                                                             │
│  ├── Local: Ollama → Qwen 3.5 + LoRAs                                  │
│  ├── Cloud: Claude/GPT-4o via API                                       │
│  └── NVIDIA: Nemotron via NIM (GPU-accelerated)                         │
│                                                                         │
│  CONTENT CREATION:                                                      │
│  ├── ComfyUI (via REST API)                                             │
│  ├── ComfyUI-Expert/VideoAgent (12 skill modules)                       │
│  ├── ComfyUI-OpenClaw (orchestration + security)                        │
│  └── LoRA training & management                                         │
│                                                                         │
│  PROTOCOLS:                                                             │
│  ├── MCP (Model Context Protocol)                                       │
│  ├── A2A (Agent-to-Agent)                                               │
│  └── OFP (OpenFang P2P Protocol)                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### ALTERNATIVE: NemoClaw (If NVIDIA GPU-Centric)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NVIDIA AGENT TOOLKIT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  NemoClaw Runtime │ OpenShell │ AI-Q Blueprint │ Nemotron Models        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SECURITY:                                                              │
│  ├── Process-level isolation                                            │
│  ├── Least-privilege access                                             │
│  └── Privacy router (Gretel PII stripping)                              │
│                                                                         │
│  LLM LAYER:                                                             │
│  ├── Local: Ollama → Qwen 3.5                                          │
│  ├── NVIDIA: Nemotron 3 Super (reasoning)                               │
│  └── Cloud: Any provider                                                │
│                                                                         │
│  CONTENT: ComfyUI via API                                               │
│                                                                         │
│  ENTERPRISE INTEGRATIONS: Salesforce, SAP, ServiceNow                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### IF RAPID DEVELOPMENT IS PRIORITY: CrewAI + Flowise

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CREWAI (Multi-Agent Orchestration)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Role-Based Agents │ 450M+ Workflows │ 60% Fortune 500                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AGENT TEAM:                                                            │
│  ├── Research Agent → Web research, competitor analysis                  │
│  ├── Content Writer Agent → Blog posts, scripts, copy                   │
│  ├── Video Production Agent → ComfyUI API integration                   │
│  └── Quality Review Agent → LLM-as-judge evaluation                     │
│                                                                         │
│  VISUAL WORKFLOW: Flowise (Agentflow)                                   │
│                                                                         │
│  LLM: Ollama (Qwen) + Cloud APIs                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## FINAL COMPARISON SUMMARY

| Dimension | Winner | Why |
|-----------|--------|-----|
| **Maximum Security** | OpenFang | 16 security layers, WASM sandbox, Merkle audit |
| **Smallest Footprint** | ZeroClaw | 5MB RAM, 10ms cold start, 8.8MB install |
| **Most Channels** | OpenClaw | 22+ messaging platforms |
| **Enterprise Ecosystem** | NemoClaw | Salesforce, SAP, ServiceNow, Adobe integrations |
| **Fastest Development** | CrewAI | Role-based agents, visual editor, 45K+ stars |
| **Visual Workflows** | Dify/Flowise | Drag-and-drop canvas, no-code development |
| **Autonomous 24/7** | OpenFang | 7 Hands that run on schedules without prompting |
| **Microsoft Ecosystem** | MS Agent Framework | .NET + Python, Azure integration |
| **Content Creation** | ComfyUI + Any | API integration via ComfyUI-Expert/VideoAgent |
| **Qwen 3.5 Support** | All via Ollama | Standard Ollama integration |

---

## NEXT STEPS

1. **Install OpenFang** for maximum security + autonomous operation
2. **Set up ComfyUI + VideoAgent** for content creation pipeline
3. **Deploy Qwen 3.5 via Ollama** for local LLM inference
4. **Add Playwright MCP** to OpenCode for screenshot capability
5. **Configure channel adapters** for your messaging platforms

---

*Report generated March 23, 2026*
*Sources: Official documentation, GitHub repositories, OpenFang comparison chart, Futurum analysis*

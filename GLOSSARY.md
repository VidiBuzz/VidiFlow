# VidiSmart Glossary

> **Purpose:** This glossary defines every acronym, abbreviation, and unusual term used across the VidiSmart project so newcomers don't have to guess what cryptic terms mean. New acronyms MUST be added here on first use.

---

## A

- **ACP** — Agent Control Protocol. The interface Hermes Router uses to dispatch tasks to AI agents.
- **AI** — Artificial Intelligence. Software that performs tasks normally requiring human reasoning.
- **AIRA** — Air Route Assistant. The conversational AI inside AirPMD that routes clinician questions.
- **AirPMD** — Direct Primary Care platform (air = healthcare; PMD = Primary Medical Doctor). Live at `air.vidicrm.com`.
- **AppFlowy** — Open-source Notion alternative. Self-hosted in Docker for internal knowledge base. Port 8000 is reserved exclusively for it.
- **API** — Application Programming Interface. A way for two programs to talk to each other.

## B

- **BDD** — Behavior-Driven Development. Writing tests in plain language before code.
- **Blob** — Binary Large Object. Generic name for any file stored in S3/MinIO/R2.
- **Bun** — JavaScript runtime alternative to Node.js. Used for some scripts in `M:\code\vidismart\cc\`.

## C

- **CDN** — Content Delivery Network. Edge servers that deliver images/files fast worldwide (we use Cloudflare).
- **CDP** — Has two meanings in this project, depending on context:
  1. **Customer Data Platform** (business term in Smart Book Ch.9) — a unified customer database that aggregates data from multiple sources.
  2. **Chrome DevTools Protocol** (technical term in Playwright scripts) — Google's low-level browser control API. Used in `simpler-scrape.js` to intercept and download images. The `simpler-scrape.js` script now has `page.on('dialog', ...)` to auto-accept any browser dialog that pops up while the CDP session runs.
- **CHOO_CHOO** — Internal codename for the parallel agent flow dashboard. See `M:\code\vidismart\smartgen\CHOO_CHOO_INTEGRATION_SUMMARY.md`.
- **CI/CD** — Continuous Integration / Continuous Deployment. Automated build + deploy pipeline.
- **CMA** — Claude Marketing Agent. The agent that writes VidiBuzz newsletter copy.
- **CMS** — Content Management System. The tool editors use to update website content (we use Directus).
- **Converge** — Internal VidiCRM project for client intake/CRM data. Has its own Postgres (5433) and Redis (6389).
- **CRM** — Customer Relationship Management. Tool for tracking customer interactions (we have VidiCRM).
- **CSS** — Cascading Style Sheets. The language that styles HTML pages.
- **CU** — Compute Unit. Used to size GPU capacity (e.g., 1× A100 = 8 CU).

## D

- **D2C** — Direct-to-Consumer. Selling products straight to end users, no middleman.
- **DAS** — Data Aggregation Service. Collects metrics from all VidiSmart services.
- **Dashboard** — A web page that shows live KPIs/charts (we have the "Candid Dashboard" on dash.candidstudios.net).
- **DB** — Database.
- **DDoS** — Distributed Denial of Service. Attack that overwhelms a server with traffic.
- **Directus** — Open-source headless CMS. Our shared content layer. Runs on port 8055 and is the single auth/content backend for all VidiSmart platforms. **DO NOT take it down or move its port.**
- **DPIA** — Data Protection Impact Assessment. Required for healthcare data under HIPAA.
- **DRY** — Don't Repeat Yourself. Coding principle.
- **DSPy** — A framework for programming LLM prompts. Used in Hermes Router.
- **DSS** — Decision Support System. AirPMD's clinical recommendations engine.

## E

- **EHR** — Electronic Health Record. The doctor's patient chart system.
- **ETL** — Extract, Transform, Load. Pipeline that moves data from one place to another.
- **Env var** — Environment variable. A setting passed to a program at startup (e.g., `HERMES_ROUTER_URL`).

## F

- **FaaS** — Function as a Service. Serverless compute.
- **FastAPI** — A Python web framework. Used to build Hermes Router.
- **FBCA** — Federal Bridge Certification Authority. Trust chain for federal PIV login.
- **FHIR** — Fast Healthcare Interoperability Resources. The standard healthcare data format.
- **FIPS** — Federal Information Processing Standards. Required for federal systems.
- **Fortuna Mill** — Estate/asset that has its own image-download scripts in `M:\code\vidismart\assets\fortuna-mill\`.

## G

- **Gemini brain / `antigravity`** — Google's Gemini AI has a local context storage folder at `C:\Users\James\.gemini\antigravity\brain\`. It contains ~3,952 AI-generated images in UUID subfolders. Whenever docs or scripts reference this folder by its raw path or the word "antigravity", this is what they mean — it's just a storage location for Gemini's outputs, not a service or feature. See `IMAGE-RECOVERY-SUMMARY.md`.
- **Git** — Version control system. Tracks code changes.
- **GPU** — Graphics Processing Unit. The chip that runs AI models fast.
- **GraphQL** — A query language for APIs. Alternative to REST.
- **GUI** — Graphical User Interface. Anything with buttons and windows.

## H

- **HIPAA** — Health Insurance Portability and Accountability Act. US law governing medical data privacy.
- **HITL** — Human-In-The-Loop. A workflow where a human reviews/approves AI output before it ships.
- **HNSW** — Hierarchical Navigable Small World. Algorithm for fast vector search.
- **HTML** — HyperText Markup Language. The language web pages are written in.
- **HTTP/HTTPS** — HyperText Transfer Protocol. How browsers fetch web pages.

## I

- **IaaS** — Infrastructure as a Service. Cloud VMs (AWS EC2, DigitalOcean, etc.).
- **IDE** — Integrated Development Environment. The app you write code in (VS Code, Cursor, Kilo).
- **IdP** — Identity Provider. The service that handles login (Directus for us).
- **IIA** — Independent Intelligence Agency. The VidiPitch org.
- **IMAP/POP3/SMTP** — Email protocols. We use SMTP for sending.
- **IP** — Internet Protocol. Networking layer.
- **ISO** — In Search Of. Search mode for VidiPitch.
- **IT** — Information Technology.

## J

- **JS / TS / JSX / TSX** — JavaScript / TypeScript / JavaScript-XML / TypeScript-XML. Languages and file types.
- **JSON** — JavaScript Object Notation. Common data format. Looks like `{ "key": "value" }`.
- **JWT** — JSON Web Token. A signed token used for authentication.

## K

- **k8s** — Kubernetes. Container orchestration platform.
- **Kilo** — The AI coding assistant (this tool) running in the CLI/VS Code.

## L

- **LLM** — Large Language Model. An AI that generates text (GPT, Claude, Gemini, etc.).
- **LM Studio** — A desktop app for running local LLMs. Listens on port 1234.
- **LP** — Landing Page. A web page designed to capture leads.

## M

- **MCP** — Model Context Protocol. The protocol Kilo uses to talk to language models.
- **MinIO** — S3-compatible object storage. Runs in Docker on **port 9000** (api) and 9001 (console). See Port 9000 note in `PORT_REGISTRY.md`.
- **ML** — Machine Learning. A subset of AI.
- **MongoDB** — Document database. Not currently in our stack.

## N

- **NAS** — Network-Attached Storage.
- **Neo4j** — Graph database. Runs on port 7474. Used for relationship queries.
- **Nextcloud** — Self-hosted file sync (Dropbox alternative). Port 8080.
- **Nginx** — Web server / reverse proxy. Often used in front of Node/Python apps.
- **NLP** — Natural Language Processing. AI for understanding text.
- **NoSQL** — Any database that isn't a traditional SQL table store.
- **NPM / NPX** — Node Package Manager / Node Package Execute. Tooling for JavaScript.

## O

- **OAuth / SAML / SSO** — Federated login standards. We use SSO via Directus.
- **Ollama** — Local LLM runner. Speaks an OpenAI-compatible API. Default port 11434.

## P

- **PaaS** — Platform as a Service. Heroku, Railway, Render, etc.
- **Paperclip** — Internal codename for a Hermes-side task queue / Redis-backed worker.
- **PII** — Personally Identifiable Information. Data that identifies a real person.
- **PIV** — Personal Identity Verification. Federal smart-card login.
- **Playwright** — Browser automation tool. Used in `fortuna-mill/` to scrape/download images. Speaks **CDP** (Chrome DevTools Protocol) to Chromium.
- **PMD** — Primary Medical Doctor. See AirPMD.
- **Port 9000** — See MinIO. **CONFLICT WARNING:** `DEPLOYMENT_STRATEGY.md` previously planned to put the Hermes AI Router on port 9000, but MinIO already occupies it. Hermes Router must use a different port (e.g., 9100, 9200). See `PORT_REGISTRY.md` for the authoritative list.
- **Postgres / PostgreSQL** — Open-source SQL database. Port 5432. We run four databases on one instance: `directus_db`, `vidipitch_db`, `smartgen_db`, `vidicrm_db`.
- **PWA** — Progressive Web App. A website that behaves like a mobile app.

## Q

- **Qwen** — Alibaba's family of LLMs. See `docs\alibaba-cloud-vscode-integration.md`.

## R

- **R2** — Cloudflare R2. S3-compatible object storage. Hosts the `vidismart` bucket at `cdn.vidi.news`. Backup location for the local `images/` directory.
- **RAG** — Retrieval-Augmented Generation. AI technique where the model first looks up relevant documents, then answers. Hermes Router uses RAG.
- **RBAC** — Role-Based Access Control. Permissions by job role.
- **RCA** — Root Cause Analysis. Postmortem process.
- **Redis** — In-memory data store used for caching and queues. We run three instances on 6379, 6380, 6389.
- **REST** — Representational State Transfer. The most common API style.

## S

- **SaaS** — Software as a Service. Cloud-hosted software (Salesforce, Slack, etc.).
- **SAM.gov** — The US government's contractor database. VidiPitch scrapes it.
- **SAML / SSO** — See OAuth.
- **Scrape** — Automated extraction of data from a website.
- **SDK** — Software Development Kit. A library for building on a platform.
- **SIEM** — Security Information & Event Management. Logs/alerting.
- **SLA / SLO / SLI** — Service Level Agreement / Objective / Indicator. Uptime promises.
- **Smart Book** — Interactive digital book at `vidismart.com/smart-book/`. 39 chapters of agentic AI content.
- **Smart Buzz / VidiBuzz** — Newsletter platform. Three years live.
- **Smart Channel / SmartChannel CX** — Customer-experience routing platform. In development.
- **Smart Deck Agent** — AI agent that builds pitch decks. Top priority.
- **SmartGen** — VidiSmart's internal AI media generation API. Runs on port 3007 (Docker). Generates decks, images, and video.
- **SMB** — Small/Medium Business.
- **SQL** — Structured Query Language. Standard database query language.
- **SSL / TLS** — Encryption for network traffic. Modern name is TLS.

## T

- **TDD** — Test-Driven Development. Write the test first, then the code.
- **Telemetry** — Structured event data emitted by services (logs, metrics, traces).
- **TLD** — Top-Level Domain. The `.com` in `example.com`.
- **TLS** — Transport Layer Security. See SSL.

## U

- **UI / UX** — User Interface / User Experience.
- **URI / URL** — Uniform Resource Identifier / Locator. The address of a web resource.
- **UUID** — Universally Unique Identifier. A 128-bit ID. The Gemini brain folder uses UUIDs as subfolder names.

## V

- **Vespa** — Vector + structured search engine from Yahoo. Runs on port 8089. Used for VidiPitch priority scoring.
- **VidiBuzz** — See Smart Buzz.
- **VidiCity** — Local city guides. Not yet started.
- **VidiCRM** — Internal CRM. Live as `vidicrm.com`.
- **VidiMail** — Email marketing tool. In flow gallery mockups.
- **Vidi.NEWS** — News publication platform. Astro-based static site on port 4321 (dev).
- **VidiPitch** — Federal contracting intelligence platform. Live at `vidipitch.com`. Port 3030.
- **VidiSmart** — The umbrella brand. This project.
- **VidiTwin** — Digital twin mockup concept for VidiSmart.
- **VLAN** — Virtual Local Area Network. Network segmentation.
- **VM** — Virtual Machine.
- **VPN** — Virtual Private Network. Encrypted tunnel into a network.
- **VS Code** — Visual Studio Code. The most common code editor.

## W

- **WebSocket** — A persistent two-way connection between browser and server. The Choo Choo dashboard uses one for live telemetry.
- **WAF** — Web Application Firewall. Filters malicious HTTP traffic.
- **WSL** — Windows Subsystem for Linux. Lets you run Linux on Windows.

## X

- **XLSX** — Microsoft Excel file format.
- **XML** — eXtensible Markup Language. Older data format, still used in healthcare (FHIR).

## Y

- **YAML** — "YAML Ain't Markup Language." A human-friendly config format. Files end in `.yml` or `.yaml`.
- **YTD** — Year-To-Date.

## Z

- **ZSH / BASH** — Common Unix shells.

---

## Quick reference: project services & their ports

| Port  | Service | Where | What it does |
|-------|---------|-------|--------------|
| 1234  | LM Studio | Desktop app | Local LLM runtime |
| 3007  | SmartGen API | Docker | AI media generation |
| 3030  | VidiPitch API | `M:\code\vidipitch\server\` | Federal contracting |
| 3101  | Agent Backend | `/agent-backend/` | AI agent orchestration |
| 3102  | AirPMD Platform | `M:\code\airpmd\` | Healthcare AI |
| 4321  | Astro Dev | Vidi.NEWS | Static site dev server |
| 5000  | OpenWebUI | Docker | Chat UI for local LLMs |
| 5432-5434 | PostgreSQL | Docker | Four DBs on one instance |
| 6379-6389 | Redis (×3) | Docker | Caching & queues |
| 7070  | VidiSmart API | Express | `/vidismart-api/` |
| 7474  | Neo4j | Docker | Graph DB |
| 8000  | 🔴 AppFlowy | Docker | **NEVER USE** — reserved |
| 8055  | 🔴 Directus | Docker | **CRITICAL** — shared CMS |
| 8080  | Nextcloud | Docker | File sync (use cloud.0human.net) |
| 8081  | Candid Dash | Docker | Dashboards (use dash.candidstudios.net) |
| 8089  | Vespa | Docker | Vector + structured search |
| **9000**  | **MinIO** | Docker | **S3-compatible storage** — Hermes Router must NOT use this port |
| 9001  | MinIO Console | Docker | MinIO web UI |
| 9100+ | (free) | — | Available for new services (e.g., Hermes Router) |

See `PORT_REGISTRY.md` for the authoritative list. Always check it before assigning a port.

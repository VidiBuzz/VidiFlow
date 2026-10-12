/* Lex (Lexi) acronym dictionary.
 * Extracted from the Lex Lab term data (data/lexi_master_terms.json).
 * Single source for the Chrome extension; keep the page copy in sync manually. */
(function () {
var LEX_DATA = {
    "CRM": {
      acr: "CRM", full: "Customer Relationship Management",
      dept: "Sales Operations",
      conceptImg: "assets/images/lexi/crm-concept.jpg",
      conceptDesc: "Holographic digital address book and glowing neural sales funnel routing customer relationships into closed deals.",
      keywords: ["pipeline", "salesforce", "hubspot", "deal stages", "lead scoring", "b2b sales", "customer history"],
      oneLiner: "A digital address book with a memory — logs every call, email, and deal so nothing falls through the cracks.",
      notes: "At VidiSmart, CRM is owned by Sales Ops and connects into the VidiPitch military retail exchange pipeline.",
      origin: "Tom Siebel (1993) · Enterprise Sales Automation",
      anatomy: [
        { letter: "C", word: "Customer", role: "The Target / Buyer", desc: "The company, lead, or contact purchasing your product.", icon: "👤" },
        { letter: "R", word: "Relationship", role: "The Timeline & Comms", desc: "Every call recording, email thread, meeting note, and ticket.", icon: "💬" },
        { letter: "M", word: "Management", role: "The System & Rules", desc: "Pipeline stage gates, alerts, quotas, and automated follow-ups.", icon: "⚙️" }
      ],
      flow: [
        { step: "Step 1", title: "Lead Inbound", desc: "Web forms, calls, trade shows capture prospect data.", icon: "📥" },
        { step: "Step 2", title: "CRM Hub (HubSpot/SF)", desc: "Deal pipeline updates, automated email sequences trigger.", icon: "⚡", active: true },
        { step: "Step 3", title: "Rep Engagement", desc: "Sales rep calls with complete history on one screen.", icon: "📞" },
        { step: "Step 4", title: "Closed Won $$", desc: "Order syncs to ERP, billing invoice generates.", icon: "💰" }
      ],
      brands: [
        { name: "Salesforce", share: "96%", tag: "Enterprise #1" },
        { name: "HubSpot", share: "84%", tag: "Best for SMB" },
        { name: "Zoho CRM", share: "72%", tag: "Best Value" },
        { name: "Pipedrive", share: "60%", tag: "Pipeline-First" }
      ],
      replaces: ["Messy Excel lead sheets", "Lost paper notebooks", "Scattered email inboxes"],
      connectsWith: ["ERP (Invoicing & Shipping)", "Marketing Automation (Ads)", "Support Desk (Tickets)"]
    },
    "RAG": {
      acr: "RAG", full: "Retrieval-Augmented Generation",
      dept: "AI Engineering",
      conceptImg: "assets/images/lexi/rag-concept.jpg",
      conceptDesc: "Luminous holographic open-book floating in cyberspace connected to a vector database cube, generating grounded verified outputs.",
      keywords: ["vector database", "pgvector", "pinecone", "hallucination fix", "grounded ai", "embeddings", "semantic search"],
      oneLiner: "AI that looks up YOUR private company documents before answering — like an open-book exam with zero hallucinations.",
      notes: "Powers Tensor Truth across the VidiSmart agent stack.",
      origin: "Patrick Lewis / Meta AI (2020) · Neural Information Retrieval",
      anatomy: [
        { letter: "R", word: "Retrieval", role: "Vector Search", desc: "Queries pgvector to find exact relevant paragraphs from your private files.", icon: "🔍" },
        { letter: "A", word: "Augmented", role: "Context Injection", desc: "Pastes verified source facts directly into the AI's prompt.", icon: "💉" },
        { letter: "G", word: "Generation", role: "Grounded Output", desc: "LLM writes the response strictly grounded in your cited sources.", icon: "🤖" }
      ],
      flow: [
        { step: "Step 1", title: "User Question", desc: "Employee asks question about company policy or contracts.", icon: "❓" },
        { step: "Step 2", title: "Vector Search", desc: "Embeddings search private PDFs, databases, and transcripts.", icon: "🧬", active: true },
        { step: "Step 3", title: "Context Injection", desc: "Exact paragraph excerpts bundled into prompt payload.", icon: "📦" },
        { step: "Step 4", title: "Grounded Answer", desc: "Zero hallucination response with clickable citations.", icon: "✅" }
      ],
      brands: [
        { name: "Pinecone / pgvector", share: "95%", tag: "Vector Engine" },
        { name: "Tensor Truth", share: "90%", tag: "VidiSmart Core" },
        { name: "LlamaIndex", share: "82%", tag: "Framework" }
      ],
      replaces: ["Blind AI guessing", "Expensive fine-tuning cycles", "Outdated static search"],
      connectsWith: ["PostgreSQL Databases", "PDF Document Stores", "AI Agent Swarms"]
    },
    "ERP": {
      acr: "ERP", full: "Enterprise Resource Planning",
      dept: "Finance & Supply Chain",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Central glowing holographic brain orchestrating robotic manufacturing, warehouse inventory, global logistics, and financial ledgers.",
      keywords: ["sap", "netsuite", "inventory ledger", "supply chain", "purchase orders", "general ledger"],
      oneLiner: "One master brain for the entire back office: inventory, orders, accounting, shipping, and payroll.",
      notes: "Synchronizes inventory with VidiShop and warehouse orders.",
      origin: "Gartner (1990) · Manufacturing MRP Evolution",
      anatomy: [
        { letter: "E", word: "Enterprise", role: "All Departments", desc: "Unifies finance, manufacturing, warehouse, and human resources.", icon: "🏢" },
        { letter: "R", word: "Resource", role: "Assets & Materials", desc: "Raw inventory, cash balance, machine capacity, and labor hours.", icon: "📦" },
        { letter: "P", word: "Planning", role: "Orchestration", desc: "Automating reorders, scheduling factory runs, and ledger balance.", icon: "📊" }
      ],
      flow: [
        { step: "Step 1", title: "Order Placed", desc: "Sales order arrives from CRM or ecommerce store.", icon: "🛒" },
        { step: "Step 2", title: "Inventory Check", desc: "ERP allocates warehouse stock & schedules factory run.", icon: "🏭", active: true },
        { step: "Step 3", title: "Shipping & ASN", desc: "Warehouse picks, packs, and transmits tracking data.", icon: "🚚" },
        { step: "Step 4", title: "Ledger Cleared", desc: "Invoice generated and general ledger auto-reconciled.", icon: "📑" }
      ],
      brands: [
        { name: "SAP S/4HANA", share: "94%", tag: "Enterprise Titan" },
        { name: "Oracle NetSuite", share: "88%", tag: "Cloud Leader" },
        { name: "Microsoft Dynamics", share: "78%", tag: "Office Native" }
      ],
      replaces: ["Disconnected accounting sheets", "Manual warehouse stocktaking", "Paper packing slips"],
      connectsWith: ["CRM Pipeline", "Warehouse Scanners", "Bank Accounts & Tax Ledgers"]
    },
    "LLM": {
      acr: "LLM", full: "Large Language Model",
      dept: "AI Core",
      conceptImg: "assets/images/lexi/llm-concept.jpg",
      conceptDesc: "Multi-layered transformer neural brain firing linguistic tokens, self-attention heads, and deep reasoning knowledge graphs.",
      keywords: ["claude", "gemini", "gpt-4", "transformer", "neural network", "tokens"],
      oneLiner: "A massive neural network trained on billions of texts to read, reason, write code, and converse like a human.",
      notes: "Integrated with local Ollama and Anthropic APIs.",
      origin: "Vaswani et al. / Google (2017) · Transformer Attention Neural Networks",
      anatomy: [
        { letter: "L", word: "Large", role: "Billions of Weights", desc: "Trained across terabytes of text with hundreds of billions of parameters.", icon: "🐘" },
        { letter: "L", word: "Language", role: "Semantic Space", desc: "Understands syntax, logic, nuance, dialects, and programming code.", icon: "🗣️" },
        { letter: "M", word: "Model", role: "Neural Weights", desc: "Statistical neural network calculating optimal next token probabilities.", icon: "🧠" }
      ],
      flow: [
        { step: "Step 1", title: "Prompt Input", desc: "User or agent feeds text prompt and instructions.", icon: "⌨️" },
        { step: "Step 2", title: "Transformer Layers", desc: "Attention heads calculate semantic relationships across tokens.", icon: "⚡", active: true },
        { step: "Step 3", title: "Reasoning Path", desc: "Model evaluates logic and selects tool execution actions.", icon: "🧩" },
        { step: "Step 4", title: "Synthesized Output", desc: "Generates clean code, reports, or automated decisions.", icon: "📄" }
      ],
      brands: [
        { name: "Anthropic Claude", share: "96%", tag: "Coding & Reasoning" },
        { name: "Google Gemini", share: "92%", tag: "Multimodal King" },
        { name: "OpenAI GPT-4o", share: "90%", tag: "Broad Ecosystem" }
      ],
      replaces: ["Rigid rule-based scripts", "Manual document summarizing"],
      connectsWith: ["Vector Databases", "Agent Orchestration (VidiFlow)", "Code Editors"]
    },
    "MCP": {
      acr: "MCP", full: "Model Context Protocol",
      dept: "AI Architecture",
      conceptImg: "assets/images/lexi/mcp-concept.jpg",
      conceptDesc: "Universal glowing USB protocol connector securely bridging AI reasoning agents to databases, file vaults, and browser robots.",
      keywords: ["anthropic", "tool calling", "json-rpc", "agent plugins", "database connector"],
      oneLiner: "The open USB-C standard for AI — lets AI agents securely plug into databases, local files, and web tools.",
      notes: "Enables Antigravity and VidiFlow subagents to execute tools securely.",
      origin: "Anthropic (Nov 2024) · Open AI Tool Specification",
      anatomy: [
        { letter: "M", word: "Model", role: "AI Reasoning Client", desc: "The LLM that decides which external tool to call.", icon: "🤖" },
        { letter: "C", word: "Context", role: "Live Environment", desc: "Databases, local repositories, browser sessions, and APIs.", icon: "📂" },
        { letter: "P", word: "Protocol", role: "Universal Standard", desc: "Open JSON-RPC 2.0 interface connecting agents to tools.", icon: "🔌" }
      ],
      flow: [
        { step: "Step 1", title: "Agent Needs Tool", desc: "Agent decides it needs database records or file content.", icon: "🤔" },
        { step: "Step 2", title: "MCP Tool Call", desc: "JSON-RPC request sent via standardized protocol.", icon: "⚡", active: true },
        { step: "Step 3", title: "Server Executes", desc: "MCP server reads database securely within authorized scope.", icon: "🔒" },
        { step: "Step 4", title: "Context Injected", desc: "Live records returned directly to the agent's context.", icon: "📦" }
      ],
      brands: [
        { name: "Anthropic MCP SDK", share: "95%", tag: "Open Standard" },
        { name: "Postgres MCP", share: "88%", tag: "Database Connector" },
        { name: "Playwright MCP", share: "82%", tag: "Browser Subagent" }
      ],
      replaces: ["Custom proprietary wrapper scripts", "Brittle one-off integration plugins"],
      connectsWith: ["AI Coding Assistants", "Enterprise SQL Databases", "Cloud APIs"]
    },
    "SaaS": {
      acr: "SaaS", full: "Software as a Service",
      dept: "IT & Infrastructure",
      conceptImg: "assets/images/lexi/rag-concept.jpg",
      conceptDesc: "Multi-tenant cloud platform delivering software instantly via browser with automated overnight updates.",
      keywords: ["cloud", "subscriptions", "multi-tenant", "zero install", "monthly billing"],
      oneLiner: "Software rented via web browser — zero downloads, auto-updated overnight, billed monthly.",
      notes: "Standard delivery model across all VidiSmart client apps.",
      origin: "Salesforce & SIIA (2000) · Cloud Multi-Tenant Architecture",
      anatomy: [
        { letter: "S", word: "Software", role: "The Application", desc: "The code, interface, and features solving the business task.", icon: "💻" },
        { letter: "aa", word: "as a", role: "Delivery Model", desc: "Hosted in the cloud without physical servers on-premise.", icon: "☁️" },
        { letter: "S", word: "Service", role: "Utility Billing", desc: "Billed on predictable monthly or annual recurring subscriptions.", icon: "💳" }
      ],
      flow: [
        { step: "Step 1", title: "Web Login", desc: "User opens browser and signs in with single sign-on.", icon: "🌐" },
        { step: "Step 2", title: "Cloud Engine", desc: "Multi-tenant cloud server executes code & updates database.", icon: "⚡", active: true },
        { step: "Step 3", title: "Overnight Patch", desc: "Provider deploys new features with zero downtime.", icon: "🌙" },
        { step: "Step 4", title: "Monthly Sub", desc: "Predictable recurring fee billed via Stripe or invoice.", icon: "💵" }
      ],
      brands: [
        { name: "Microsoft 365", share: "95%", tag: "Workplace #1" },
        { name: "Google Workspace", share: "90%", tag: "Cloud Native" },
        { name: "Salesforce", share: "85%", tag: "Enterprise SaaS" }
      ],
      replaces: ["Physical installation CD-ROMs", "On-premise server maintenance"],
      connectsWith: ["Web Browsers", "Single Sign-On (SSO)", "Stripe Payment Gateways"]
    },
    "API": {
      acr: "API", full: "Application Programming Interface",
      dept: "Software Engineering",
      conceptImg: "assets/images/lexi/mcp-concept.jpg",
      conceptDesc: "Structured digital communication bridge allowing distinct databases and client apps to exchange data in real-time.",
      keywords: ["endpoints", "rest", "json", "webhooks", "system integration", "mcp"],
      oneLiner: "The digital menu of commands that allows two completely separate software programs to talk automatically.",
      notes: "All VidiSmart microservices connect over secure JSON APIs.",
      origin: "Maurice Wilkes (1968) · Subroutine Standardization",
      anatomy: [
        { letter: "A", word: "Application", role: "Client App", desc: "The frontend website or mobile app requesting data.", icon: "📱" },
        { letter: "P", word: "Programming", role: "Contract Specs", desc: "The structured code endpoints (REST, JSON, GraphQL).", icon: "💻" },
        { letter: "I", word: "Interface", role: "Data Bridge", desc: "The gateway securely exchanging data between databases.", icon: "🌉" }
      ],
      flow: [
        { step: "Step 1", title: "App Request", desc: "App requests data (e.g. 'Get current shipping rate').", icon: "📤" },
        { step: "Step 2", title: "API Gateway", desc: "Authentication key verified and request routed.", icon: "🛡️", active: true },
        { step: "Step 3", title: "Database Query", desc: "Server processes request and formats JSON response.", icon: "🗄️" },
        { step: "Step 4", title: "Instant Delivery", desc: "Data populates in user's screen in 50 milliseconds.", icon: "⚡" }
      ],
      brands: [
        { name: "REST / JSON", share: "96%", tag: "Web Standard" },
        { name: "GraphQL", share: "82%", tag: "Flexible Query" },
        { name: "MCP Protocol", share: "78%", tag: "AI Agent USB" }
      ],
      replaces: ["Manual copy-pasting between tools", "Batch CSV file exports"],
      connectsWith: ["Zapier", "Payment Processors", "Databases & AI Models"]
    },
    "KPI": {
      acr: "KPI", full: "Key Performance Indicator",
      dept: "Executive Leadership",
      conceptImg: "assets/images/lexi/crm-concept.jpg",
      conceptDesc: "Live executive telemetry dashboard filtering thousands of operational events down to vital green/red scorecard dials.",
      keywords: ["scorecard", "metrics", "conversion rate", "churn", "dashboard", "targets"],
      oneLiner: "The single vital metric that proves whether your business is winning, on track, or failing.",
      notes: "Executive scorecards monitored across weekly reviews.",
      origin: "Robert Kaplan & Peter Drucker (1992) · Balanced Scorecard",
      anatomy: [
        { letter: "K", word: "Key", role: "Vital Few", desc: "The 3 to 5 metrics that genuinely dictate company health.", icon: "🔑" },
        { letter: "P", word: "Performance", role: "Quantifiable Result", desc: "Hard numbers: conversion rate, revenue growth, churn percentage.", icon: "📈" },
        { letter: "I", word: "Indicator", role: "Live Signal", desc: "A forward-looking gauge showing if goals will be met.", icon: "🎯" }
      ],
      flow: [
        { step: "Step 1", title: "Raw Events", desc: "Daily sales, complaints, and delivery timestamps logged.", icon: "📊" },
        { step: "Step 2", title: "Metric Engine", desc: "Telemetry calculated and compared against target goal.", icon: "🧮", active: true },
        { step: "Step 3", title: "Dashboard Dial", desc: "Executive gauge flips Green (Winning) or Red (Alert).", icon: "🚨" },
        { step: "Step 4", title: "Action Taken", desc: "Team reallocates budget to fix bottleneck immediately.", icon: "🛠️" }
      ],
      brands: [
        { name: "Power BI", share: "92%", tag: "Microsoft Leader" },
        { name: "Tableau", share: "86%", tag: "Visual Analytics" },
        { name: "VidiFlow Dashboards", share: "80%", tag: "Agent Telemetry" }
      ],
      replaces: ["200-page monthly paper reports", "Gut-feeling management"],
      connectsWith: ["Executive Dashboards", "Team Incentive Bonuses", "Operational Alerts"]
    },
    "MRR": {
      acr: "MRR", full: "Monthly Recurring Revenue",
      dept: "Finance",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Predictable recurring cashflow engine auto-renewing customer subscription tiers across rolling 30-day financial cycles.",
      keywords: ["subscriptions", "recurring cash", "stripe", "arr", "retention", "churn"],
      oneLiner: "The predictable subscription money guaranteed to land in your bank account every 30 days.",
      notes: "Tracked in real time for corporate bundle subscriptions.",
      origin: "SaaS Venture Metrics (2005) · Subscription Economics",
      anatomy: [
        { letter: "M", word: "Monthly", role: "Time Cycle", desc: "Normalized 30-day billing period.", icon: "📅" },
        { letter: "R", word: "Recurring", role: "Auto-Renewing", desc: "Contracted subscription base that auto-charges credit cards.", icon: "🔄" },
        { letter: "R", word: "Revenue", role: "Baseline Cash", desc: "Recognized income before one-time add-on fees.", icon: "💵" }
      ],
      flow: [
        { step: "Step 1", title: "Customer Signs Up", desc: "New subscriber enters credit card for monthly plan.", icon: "✍️" },
        { step: "Step 2", title: "Stripe Auto-Bill", desc: "Billing gateway auto-renews customer on Day 30.", icon: "💳", active: true },
        { step: "Step 3", title: "Net Retention", desc: "Upgrades added, churned accounts subtracted.", icon: "⚖️" },
        { step: "Step 4", title: "Predictable Cash", desc: "Executive team forecasts hiring based on exact revenue.", icon: "🏦" }
      ],
      brands: [
        { name: "Stripe Billing", share: "96%", tag: "Developer Standard" },
        { name: "Chargebee", share: "84%", tag: "Enterprise Sub" }
      ],
      replaces: ["Lumpy unpredictable one-time sales", "Manual invoice reminder calls"],
      connectsWith: ["Bank Accounts", "Investor Financial Models", "Hiring Budgets"]
    },
    "AAFES": {
      acr: "AAFES", full: "Army & Air Force Exchange Service",
      dept: "CPG & Military Retail",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Worldwide military retail marketplace connecting verified American consumer brands directly to 33M troop families.",
      keywords: ["shopmyexchange", "military retail", "px", "bx", "cpg vendor", "dod retail", "tax free"],
      oneLiner: "The Department of Defense's $8.5B tax-free retail marketplace (ShopMyExchange) serving 33 million military patrons.",
      notes: "The primary military buyer targeted by VidiPitch.",
      origin: "US War Department (1895) · General Order 46 / DoD Retail Logistics",
      anatomy: [
        { letter: "A", word: "Army", role: "Service Branch", desc: "US Army active duty, veterans, and military families.", icon: "🎖️" },
        { letter: "A", word: "Air Force", role: "Service Branch", desc: "US Air Force & Space Force installations worldwide.", icon: "✈️" },
        { letter: "E", word: "Exchange", role: "Department Store", desc: "Tax-free on-base BX/PX department stores & ShopMyExchange.com.", icon: "🏬" },
        { letter: "S", word: "Service", role: "DoD Enterprise", desc: "Official retail agency generating funds for troop Quality-of-Life.", icon: "🇺🇸" }
      ],
      flow: [
        { step: "Step 1", title: "VidiPitch Deck", desc: "CPG brand prepares verified retail compliance pitch.", icon: "📊" },
        { step: "Step 2", title: "AAFES Buyer Review", desc: "Military Exchange buyer evaluates wholesale margins.", icon: "🔍", active: true },
        { step: "Step 3", title: "EDI Catalog Setup", desc: "Product barcodes and inventory EDI feeds verified.", icon: "📦" },
        { step: "Step 4", title: "PX/BX Store Shelves", desc: "Product listed online and stocked in worldwide base stores.", icon: "🛒" }
      ],
      brands: [
        { name: "ShopMyExchange.com", share: "96%", tag: "Online Military Mall" },
        { name: "Base BX / PX Stores", share: "92%", tag: "Worldwide Retail" },
        { name: "Military Star Card", share: "85%", tag: "Patron Payment" }
      ],
      replaces: ["Civilian distributor gatekeepers", "Uninformed broker cold calls"],
      connectsWith: ["VidiPitch Platform", "EDI Supply Chain Feeds", "DoD Logistics"]
    },
    "BOM": {
      acr: "BOM", full: "Bill of Materials",
      dept: "Manufacturing & CAD",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Hierarchical master parts blueprint mapping every sub-assembly, raw screw, wire, and casing to the finished parent SKU.",
      keywords: ["parts list", "recipe", "assembly", "raw components", "screws", "item master"],
      oneLiner: "The master recipe for a manufactured product — every screw, ingredient, circuit board, and label needed to build one unit.",
      notes: "Required for factory costing and VidiPitch production audits.",
      origin: "Industrial Engineering (1960s) · MRP Inventory Foundations",
      anatomy: [
        { letter: "B", word: "Bill", role: "Itemized List", desc: "The complete master hierarchy of all parts and sub-assemblies.", icon: "📋" },
        { letter: "O", word: "of", role: "Hierarchy", desc: "Linking raw components directly to the finished parent SKU.", icon: "🔗" },
        { letter: "M", word: "Materials", role: "Physical Parts", desc: "Screws, wires, resins, circuit boards, and packaging boxes.", icon: "🔩" }
      ],
      flow: [
        { step: "Step 1", title: "CAD Engineering", desc: "Engineers design 3D product and export parts list.", icon: "📐" },
        { step: "Step 2", title: "Master BOM Record", desc: "Every screw and part cataloged with unit cost & lead time.", icon: "📑", active: true },
        { step: "Step 3", title: "MRP Procurement", desc: "Automated purchase orders sent to part suppliers.", icon: "🚚" },
        { step: "Step 4", title: "Line Assembly", desc: "Parts delivered to assembly line bins with zero stockouts.", icon: "🏭" }
      ],
      brands: [
        { name: "Arena PLM", share: "90%", tag: "Cloud PLM" },
        { name: "SolidWorks BOM", share: "86%", tag: "CAD Native" }
      ],
      replaces: ["Missing-part factory shutdowns", "Manual parts spreadsheets"],
      connectsWith: ["CAD Software", "Manufacturing ERP", "Supplier Purchase Orders"]
    },
    "OEE": {
      acr: "OEE", full: "Overall Equipment Effectiveness",
      dept: "Plant Operations",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Composite efficiency gauge multiplying machine uptime availability, operating speed, and zero-defect quality yield.",
      keywords: ["machine uptime", "speed", "quality yield", "lean manufacturing", "tpm", "scada"],
      oneLiner: "The 0–100% master score measuring factory machine productivity: Availability × Speed × Zero-Defect Quality.",
      notes: "Measured on factory lines to ensure contract quotas.",
      origin: "Seiichi Nakajima (1982) · Total Productive Maintenance (TPM)",
      anatomy: [
        { letter: "O", word: "Overall", role: "Master Multiplier", desc: "Availability % × Performance % × Quality % combined.", icon: "🎯" },
        { letter: "E", word: "Equipment", role: "Factory Machinery", desc: "CNC mills, injection molders, packaging lines, printers.", icon: "⚙️" },
        { letter: "E", word: "Effectiveness", role: "Productive Output", desc: "Percentage of truly productive time vs theoretical capacity.", icon: "📊" }
      ],
      flow: [
        { step: "Step 1", title: "Machine Telemetry", desc: "IoT sensors log machine run time, pauses, and line speed.", icon: "📡" },
        { step: "Step 2", title: "Scrap & Yield", desc: "Defective scrap units counted by optical line inspection.", icon: "🔬", active: true },
        { step: "Step 3", title: "OEE Calculation", desc: "Uptime (90%) × Speed (95%) × Quality (99%) = 84.6% OEE.", icon: "🧮" },
        { step: "Step 4", title: "Bottleneck Fixed", desc: "Preventative maintenance scheduled before machine breaks.", icon: "🔧" }
      ],
      brands: [
        { name: "Tulip IoT", share: "92%", tag: "No-Code Ops" },
        { name: "Ignition SCADA", share: "88%", tag: "Industrial Standard" }
      ],
      replaces: ["Manual clipboard downtime logs", "Unsubstantiated line speed claims"],
      connectsWith: ["Factory Floor Screens", "SCADA Sensors", "Plant Maintenance Schedules"]
    },
    "JIT": {
      acr: "JIT", full: "Just-In-Time Manufacturing",
      dept: "Logistics & Supply Chain",
      conceptImg: "assets/images/lexi/erp-concept.jpg",
      conceptDesc: "Zero-waste assembly workflow where supplier parts roll off delivery trucks directly into assembly bays on exact kanban triggers.",
      keywords: ["toyota production", "kanban", "zero storage", "flow", "inventory elimination"],
      oneLiner: "An inventory strategy where parts arrive on the factory floor minutes before assembly — eliminating warehouse storage waste.",
      notes: "Eliminates holding costs for military supply fulfillment.",
      origin: "Taiichi Ohno (1950s) · Toyota Production System (TPS)",
      anatomy: [
        { letter: "J", word: "Just", role: "Exact Timing", desc: "Parts delivered precisely when the line is ready for assembly.", icon: "⏱️" },
        { letter: "I", word: "in", role: "Direct Flow", desc: "Direct transit from delivery truck straight to the assembly station.", icon: "➡️" },
        { letter: "T", word: "Time", role: "Zero Holding", desc: "Eliminating dusty warehouse holding costs and tied-up cash.", icon: "🚚" }
      ],
      flow: [
        { step: "Step 1", title: "Kanban Signal", desc: "Assembly line consumes part bin and triggers digital signal.", icon: "📶" },
        { step: "Step 2", title: "Supplier Truck Departs", desc: "Supplier loads exact bin quantities and departs dock.", icon: "🚛", active: true },
        { step: "Step 3", title: "Dock Cross-Docking", desc: "Bin moves straight onto production floor with zero storage.", icon: "📦" },
        { step: "Step 4", title: "Finished Car Ships", desc: "Completed vehicle rolls off line and ships to customer.", icon: "🚗" }
      ],
      brands: [
        { name: "Toyota TPS", share: "98%", tag: "The Pioneer" },
        { name: "Lean Kanban", share: "90%", tag: "Flow Engine" }
      ],
      replaces: ["Bloated warehouse storage costs", "Capital tied up in unsold inventory"],
      connectsWith: ["Supplier EDI Networks", "Factory Kanban Pulls", "Shipping Logistics"]
    }
  };
  var g = typeof globalThis !== "undefined" ? globalThis : window;
  g.LEX_DATA = LEX_DATA;
})();

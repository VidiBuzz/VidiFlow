var fs = require("fs");
var path = require("path");
var BASE = __dirname;

var plans = [
  {n:1,s:"vidifund",nm:"VidiFund",h:"Financial services platform: tariff recovery + AI trading + smart investing.",tag:"urgent",tagLabel:"TIME-SENSITIVE",badge:"crimson",deadline:"HIGH",competition:"LOW",team:40,revCons:5,revReal:12,revOpt:25,unit:"M (combined)",capexTotal:"$7.7M",capex:{People:5200,Tariff_Engine:150,Trading_Infra:300,GPU_Clusters:300,Compliance:400,Marketing:600,Contingency:350},moat:{Tech:5,Data:4,Reg:5,Switch:5,Speed:4},roles:{FullStack:8,Quant_Engines:5,AI_ML:4,Legal_Compliance:5,Sales_BD:6,DevOps:4,Research:3,Portfolio:5},builds:["CAPE Filing Engine - automated tariff refund filings via CBP ACE portal","ACE Portal Bridge - authenticated batch submit with session management","Eligibility Simulation - pre-files against SCOTUS ruling for coverage confirmation","ACH Treasury Enrollment - automated TreasuryDirect routing for refund receipts","20-Agent Trading Swarm - Alpha-Hunter, Momentum-Beta, Mean-Reversion, Arbitrage-Finder, Options-Sniper, VIX-Watcher, Risk-Guardian + 13 more","Broker API Integrations - Interactive Brokers, Alpaca, Schwab for equities/options/futures/crypto","Tensor Truth Intelligence Engine - RAG-verified portfolio analysis with source-linked reasoning","Visual Portfolio Reports - AI-generated narrated video quarterly reports via SmartGen + ElevenLabs","Risk Management Layer - 10% max drawdown guardrail, hard-stop broker API enforcement","Refund Status Dashboard - real-time CBP claim tracking with rejection alerts"],why:"Three complementary financial verticals under one roof: (1) tariff recovery has a 180-day legal window with $175B TAM, (2) 20-agent AI trading swarm with proven architecture (NautilusTrader + Freqtrade), (3) visual-AI wealth management differentiated by verifiable RAG. Combined moat: regulatory + technical + data across all three.",competition:"Tariff: no automated filing tool exists. Trading: 20+ AI quant funds, but 20-agent swarm architecture is unique. Investing: Betterment/Wealthfront pre-date multimodal AI, none have visual+verifiable reporting.",legalEntity:"VidiFund, LLC (subsidiary of VidiSmart, Inc.)",domain:"vidifund.com",founded:"2026",targetCustomers:"U.S. importers (tariff recovery), retail/institutional investors (trading), HNW individuals and RIAs (wealth mgmt)",revenueModel:"Tariff: one-time filing fees + compliance subscriptions | Trading: proprietary returns + AUM management fees (2/20) | Investing: tiered subscriptions ($29-$25K/mo) + referral fees",keyTechnology:"CBP ACE API, NautilusTrader, Freqtrade, Alpaca/Schwab broker APIs, SmartGen AI engine, Tensor Truth RAG framework, ElevenLabs voice, Twelve Labs video understanding",heroImg:"assets/images/badge-guarantee.png",heroAlt:"VidiFund Financial Services",productImg:"assets/images/graphic-omniengine.png",productAlt:"VidiFund AI Engine"},
  {n:2,s:"vidishop",nm:"VidiShop",h:"Visual-AI shopping for every mid-market business.",tag:"growth",tagLabel:"GROWTH",badge:"blue",deadline:"NONE",competition:"MEDIUM",team:15,revCons:2,revReal:6,revOpt:10,unit:"M ARR",capexTotal:"$2.6M",capex:{People:2000,AI:150,Infrastructure:80,Marketing:250,Contingency:100},moat:{Tech:5,Data:5,Reg:2,Switch:4,Speed:4},roles:{FullStack:6,AI:2,UX:2,Sales:3,Ops:2},builds:["Visual Vector Product Catalog (CLIP/Jina in Vespa)","Voice-Driven Product Discovery via ElevenLabs","AI Assistant grounded in catalog + RAG","Vendor Embed SDK (<3 lines of code)","Tensor Truth Product Trust Score"],why:"Shopify Plus has zero visual vector AI. Every business needs this in 12-24 months.",competition:"Shopify AI (coming), Google Shopping AI, Amazon Visual Search.",legalEntity:"VidiShop, Inc.",domain:"vidishop.ai",founded:"2026",targetCustomers:"Mid-market e-commerce businesses (10-200 employees, $1M-$100M revenue) with existing online stores",revenueModel:"SaaS subscriptions ($99-$10K/mo) + 5-8% marketplace transaction fees",keyTechnology:"CLIP/Jina visual embeddings, Vespa vector search, ElevenLabs voice, RAG-grounded product knowledge, embeddable SDK",heroImg:"assets/images/mockup-vidishop.png",heroAlt:"VidiShop AI Shopping Interface",productImg:"assets/images/graphic-omniengine.png",productAlt:"Visual Vector Search Engine"},
  {n:3,s:"vidipitch",nm:"VidiPitch",h:"Video-commerce for federal buyers. 855K vessels. LIVE.",tag:"growth",tagLabel:"GROWTH",badge:"blue",deadline:"NONE",competition:"MEDIUM",team:12,revCons:2.5,revReal:4,revOpt:6,unit:"M",capexTotal:"$2M",capex:{People:1560,Data:80,Portal:60,Marketing:200,Contingency:100},moat:{Tech:4,Data:4,Reg:5,Switch:4,Speed:4},roles:{Devs:5,SAM:2,AI:2,Sales:2,Ops:1},builds:["SmartDeck Agent - real Vespa + SAM.gov integration","VETS GOV Portal - bid alerts, compliance pre-screening","AI Video Pitch - 90s auto from bid docs","SAM Auto-File - annual registration + CPOR"],why:"VidiPitch LIVE on port 3030. VETS Exchange $60B+. Zero AI video-pitch competitors.",competition:"Deltek GovWin, Bloomberg Gov. VidiPitch competitive at $4K/mo + AI.",legalEntity:"VidiPitch, LLC (subsidiary of VidiSmart, Inc.)",domain:"vidipitch.com",founded:"2025",targetCustomers:"Federal government contractors, veteran-owned businesses, small businesses pursuing SAM.gov contract vehicles",revenueModel:"Setup fee ($2,500) + monthly SaaS ($4,000/mo) + 2% commission on won bid value",keyTechnology:"SAM.gov API integration, SmartDeck AI agent, Vespa vector search, SmartGen video generation, Directus CMS",heroImg:"assets/images/hero-vidipitch.png",heroAlt:"VidiPitch Federal Intelligence",productImg:"assets/images/hero-vidipitch-mfg.png",productAlt:"VidiPitch Manufacturing AI"},
  {n:4,s:"smartchannel",nm:"Smart Channel CX",h:"AI video editing. Frame.io playbook. BrandSwap coded.",tag:"saas",tagLabel:"SAAS",badge:"blue",deadline:"NONE",competition:"MEDIUM",team:10,revCons:1.5,revReal:3,revOpt:5,unit:"M",capexTotal:"$2M",capex:{People:1300,GPU:180,AI:60,Infrastructure:80,Marketing:250,Contingency:130},moat:{Tech:5,Data:3,Reg:2,Switch:3,Speed:5},roles:{FullStack:4,AI:2,UX:2,Ops:2},builds:["Remotion-based browser video editor","R2 file browser + TUS resumable upload","BrandSwap AI integrated as timeline action","ElevenLabs voice-over + narration","Directus MCP media library"],why:"Architecture mapped (927 lines). BrandSwap ALREADY CODED. No SaaS bundles this.",competition:"Frame.io, Canva Video, Descript. None bundle visual-vector+brand-swap+R2.",legalEntity:"Smart Channel CX, Inc.",domain:"smartchannelcx.com",founded:"2026",targetCustomers:"Marketing teams (12-50 people), video production agencies, enterprise creative departments (200+ people)",revenueModel:"SaaS subscriptions ($499-$15K/mo) + per-use AI add-ons ($9/project)",keyTechnology:"Remotion video editor, BrandSwap AI (logo detection/replacement), Cloudflare R2 storage, Directus CMS, ComfyUI, ElevenLabs voice synthesis",heroImg:"assets/images/hero-smartchannel.png",heroAlt:"Smart Channel CX Video Editor",productImg:"assets/images/mockup-smartchannel.png",productAlt:"Smart Channel CX Interface"},
  {n:5,s:"vidibuzz",nm:"VidiBuzz Media Production",h:"$15K/mo managed content. LIVE 3 years.",tag:"recurring",tagLabel:"RECURRING",badge:"emerald",deadline:"NONE",competition:"MEDIUM",team:10,revCons:3,revReal:5,revOpt:7,unit:"M",capexTotal:"$1.7M",capex:{People:1200,AI:150,R2:30,Marketing:240,Contingency:80},moat:{Tech:2,Data:4,Reg:1,Switch:3,Speed:5},roles:{Video:4,Sales:3,AI:2,Ops:1},builds:["90-Day AI Content Transformation program","Smart Video Clipping Engine","VidiTwin AI spokesperson clone","VidiMail Video Outreach integration"],why:"LIVE 3 years. $2.5K up + $1K/week. Already has clients and revenue.",competition:"Boutique media vs. large agencies. AI-first edge wins.",legalEntity:"Savage Digital Solutions, LLC (DBA VidiBuzz)",domain:"vidibuzz.com",founded:"2023",targetCustomers:"Mid-market businesses ($5M-$50M revenue) needing ongoing video content production and distribution",revenueModel:"Monthly retainer ($15K/mo) + weekly production ($4K/mo add-on) + custom AI training ($20K one-time)",keyTechnology:"SmartGen video generation, VidiTwin AI spokesperson clone, VidiMail personalized video email, SmartGen video clipping, ElevenLabs voice cloning",heroImg:"assets/images/hero-smartchannel.png",heroAlt:"VidiBuzz Media Production",productImg:"assets/images/graphic-smartstack.png",productAlt:"VidiBuzz Production Stack"},
  {n:6,s:"smartdeck",nm:"SmartDeck",h:"License deck AI to CRM/vendors. Partially built.",tag:"growth",tagLabel:"HIGH MARGIN",badge:"emerald",deadline:"NONE",competition:"LOW-MED",team:8,revCons:2,revReal:4,revOpt:8,unit:"M",capexTotal:"$1.4M",capex:{People:1040,AI:80,Infrastructure:60,Legal:120,Contingency:100},moat:{Tech:4,Data:4,Reg:2,Switch:4,Speed:4},roles:{API:3,AI:2,OEM:2,Ops:1},builds:["Extract SmartDeck as standalone API","Multi-vertical template library","OEM SDK + white-label portal","Stripe billing per API call"],why:"Partially built. No pure-AI deck tool with document intelligence leads.",competition:"Beautiful.ai, Tome are template-substitution only.",legalEntity:"SmartDeck, Inc.",domain:"smartdeck.ai",founded:"2026",targetCustomers:"CRM platforms (Zoho, HubSpot), consulting firms, VC/PE platforms, government contract analysts needing auto-deck generation",revenueModel:"API per-deck ($15-$75) + OEM license ($50K-$150K/yr) + white-label portal ($100K-$500K/yr)",keyTechnology:"SmartGen AI deck generation engine, SAM.gov template intelligence, Vespa vector search, Multi-vertical template library, OAuth2 API",heroImg:"assets/images/graphic-smartstack.png",heroAlt:"SmartDeck AI Architecture",productImg:"assets/images/graphic-ainodes.png",productAlt:"SmartDeck Agent Nodes"},
  {n:7,s:"consulting",nm:"VidiSmart Consulting",h:"Managed engagement. Fastest to cash. Zero build.",tag:"recurring",tagLabel:"FAST CASH",badge:"violet",deadline:"NONE",competition:"LOW",team:6,revCons:2,revReal:3.6,revOpt:5,unit:"M ARR",capexTotal:"$1M",capex:{People:750,Travel:80,Sponsorships:100,Tech:40,Contingency:30},moat:{Tech:1,Data:2,Reg:1,Switch:2,Speed:5},roles:{Consultants:4,Ops:1,BD:1},builds:["90-Day AI Readiness Roadmap","AI Stack Audit (500-app counting)","Monthly Executive Report","VidiDeck Monthly KPIs","Industry Council sponsorships"],why:"Zero build. First invoice 60 days. Platform + community = funnel. Break-even: 3 clients.",competition:"Fractional AI consultants exist. VidiSmart has platform advantage.",legalEntity:"VidiSmart Consulting, LLC",domain:"vidismart.com/consulting",founded:"2026",targetCustomers:"Enterprise IT leaders ($50M+ revenue companies) undergoing AI transformation, mid-market CEOs exploring agentic AI adoption",revenueModel:"Managed platform engagement ($15K/mo, 3-month min) + implementation ($25K one-time) + custom AI templates ($30-60K/project)",keyTechnology:"VidiSmart platform, AI Stack Audit methodology, VidiDeck auto-generated reports, 500-app-to-agentic transformation framework (from 'The Speed of Agentic Visual AI' book)",heroImg:"assets/images/hero-consulting.png",heroAlt:"VidiSmart Consulting",productImg:"assets/images/graphic-execdeck.png",productAlt:"Executive AI Deck"},
  {n:8,s:"vidicity",nm:"VidiCity",h:"Hyperlocal video commerce. Geo-moat. >$100B TAM.",tag:"long-term",tagLabel:"3-5 YEAR",badge:"gold",deadline:"NONE",competition:"LOW",team:15,revCons:2,revReal:4,revOpt:6,unit:"M (MVP)",capexTotal:"$2.7M",capex:{People:2000,GPU:200,BD:100,Marketing:200,Contingency:200},moat:{Tech:5,Data:5,Reg:1,Switch:4,Speed:3},roles:{FullStack:5,AI:3,BD:3,Content:2,Ops:2},builds:["City portal template","VidiShop commerce per-city","AI video from local RSS","Vespa + PostGIS hyperlocal search","AI business listings"],why:"33K cities x $30K ARR x 15% = >$100B. Shared tech stack. Geo-moat.",competition:"Google/Yelp static. No visual AI + commerce at city scale.",legalEntity:"VidiCity, Inc.",domain:"vidicity.net",founded:"2026",targetCustomers:"Local businesses in top 300 US metro areas, city tourism boards, hyperlocal media companies, municipal governments",revenueModel:"Business portal subscriptions ($500-$3K/mo) + local advertising ($500-$2K/mo) + VidiShop transaction fees per city",keyTechnology:"Vespa + PostGIS hyperlocal search, SmartGen video from local RSS/event feeds, VidiShop embedded commerce, Directus CMS, Cloudflare R2, AI business listing generator",heroImg:"assets/images/logo-vidicity.png",heroAlt:"VidiCity Hyperlocal Commerce",productImg:"assets/images/graphic-omniengine.png",productAlt:"VidiCity AI Engine"},
  {n:9,s:"vidi-news",nm:"Vidi.NEWS",h:"AI-Powered News & Media Platform. Automated content creation.",tag:"growth",tagLabel:"GROWTH",badge:"gold",deadline:"NONE",competition:"MEDIUM",team:12,revCons:2.5,revReal:5,revOpt:7.5,unit:"M ARR",capexTotal:"$2.2M",capex:{People:1500,GPU:200,BD:150,Marketing:200,Contingency:150},moat:{Tech:4,Data:4,Reg:1,Switch:3,Speed:5},roles:{FullStack:4,AI:3,Content:2,BD:2,Ops:1},builds:["Automated press release generation engine","Multi-platform news distribution network","AI-powered content curation system","Real-time media monitoring dashboard","Digital twin reporter framework","Premium tier news delivery service","Brand-safe content automation pipeline"],why:"$23B corporate communications market. AI-first news automation is untapped. Digital twin reporters + multi-platform distribution creates a defensible moat. PR industry spends $14B/yr on distribution alone.",competition:"PR Newswire, BusinessWire static. No AI-powered digital twin reporters + automated multi-platform distribution exists.",legalEntity:"Vidi.NEWS, Inc.",domain:"vidi.news",founded:"2026",targetCustomers:"Corporate communications teams, PR agencies, media organizations, Fortune 500 comms departments",revenueModel:"Platform subscriptions ($2K-$10K/mo) + press release generation ($500-$2K each) + distribution network fees + premium news delivery",keyTechnology:"SmartGen AI content engine, multi-platform distribution API, real-time media monitoring, digital twin reporters, Directus CMS, Cloudflare R2, Vespa search, brand-safe content automation",heroImg:"vidi-news2.jpg",heroAlt:"Vidi.NEWS AI News Platform",productImg:"assets/images/graphic-omniengine.png",productAlt:"Vidi.NEWS AI Engine"},
  {n:10,s:"smartbook",nm:"SmartBook",h:"\"The Speed of Agentic Visual AI\" — Interactive digital book, podcast, video, and strategy deck.",tag:"recurring",tagLabel:"CONTENT & LICENSE",badge:"gold",deadline:"NONE",competition:"LOW",team:2,revCons:0.5,revReal:2,revOpt:5,unit:"M",capexTotal:"$50K",capex:{KDP_Production:15,Audiobook_Narration:10,Marketing:15,Contingency:10},moat:{Tech:3,Data:3,Reg:1,Switch:3,Speed:4},roles:{Content:1,Marketing:0.5,Tech:0.5},builds:["47-chapter interactive book with persona-based filtering (Consumer, IT Pro, Executive)","Neural network Three.js animated background","Hero image slideshow (10 images from CDN)","Embedded podcast player with chapter markers (23:46 duration)","Video breakdown player (13 slides, lightbox navigation)","Email capture + VidiPitch lead integration","Smart Stack Generator CTA (free tool, lead magnet)","7-part content structure with reading time estimates","KDP/Audiobook pipeline ready (not yet published)"],why:"Already built. Zero additional build cost. Revenue from existing traffic + distribution push. The book is both a product AND the best marketing asset for every other VidiSmart plan.",competition:"Traditional AI books (O'Reilly, MIT Press) are static text. None have interactive persona filtering, embedded podcast, video breakdown, or strategy deck. This is a category of one.",legalEntity:"James May, VidiSmart · Savage Digital Solutions",domain:"vidismart.com/smart-book",founded:"2026",targetCustomers:"C-suite executives, IT directors, VCs, consultants, universities, corporate training departments",revenueModel:"Direct sales ($49-$199 per copy) + Corporate licensing ($5K-$25K site license) + Bundle inclusion + Audiobook/KDP + Podcast sponsorships",keyTechnology:"Three.js neural net visualization, HTML interactive filters, embedded podcast, video breakdown lightboxes, email capture integration",heroImg:"https://cdn.vidi.news/images/smart_stack_cover_1774454093030.png",heroAlt:"SmartBook Cover",productImg:"https://cdn.vidi.news/images/agentic_video_intelligence_wide.png",productAlt:"SmartBook Preview"}
];

var svgs = {
  vidifund: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes pulse-ring { 0% { r: 2px; opacity: 1; } 100% { r: 8px; opacity: 0; } }
       @keyframes draw-line { to { stroke-dashoffset: 0; } }
       .fund-line { stroke: var(--accent-crimson); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 50; stroke-dashoffset: 50; animation: draw-line 2s ease-in-out infinite; }
       .fund-node { fill: var(--accent-crimson); }
       .fund-pulse { stroke: var(--accent-crimson); stroke-width: 1; fill: none; animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
     </style>
     <path class="fund-line" d="M3 17L9 11L13 15L21 7" />
     <circle class="fund-node" cx="21" cy="7" r="3" />
     <circle class="fund-pulse" cx="21" cy="7" r="2" />
   </svg>`,
  vidishop: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes scan-laser { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
       .shop-laser { stroke: var(--accent-primary); stroke-width: 1.5; animation: scan-laser 2s ease-in-out infinite; }
       .shop-bag { stroke: var(--text-primary); stroke-width: 2; stroke-linejoin: round; }
     </style>
     <path class="shop-bag" d="M6 8V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V8M9 8V5C9 3.3 10.3 2 12 2C13.7 2 15 3.3 15 5V8M4 8H20" />
     <line class="shop-laser" x1="5" y1="12" x2="19" y2="12" />
   </svg>`,
  vidipitch: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes shield-pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
       .pitch-shield { stroke: var(--accent-emerald); stroke-width: 2; transform-origin: center; animation: shield-pulse 2s ease-in-out infinite; }
       .pitch-play { fill: var(--accent-emerald); }
     </style>
     <path class="pitch-shield" d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
     <polygon class="pitch-play" points="10,8 16,12 10,16" />
   </svg>`,
  smartchannel: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes magic-spark { 0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.2) rotate(180deg); } }
       .chan-spark { fill: var(--accent-primary); transform-origin: center; animation: magic-spark 2.5s ease-in-out infinite; }
       .chan-frame { stroke: var(--text-primary); stroke-width: 2; }
     </style>
     <rect class="chan-frame" x="3" y="3" width="18" height="18" rx="2" />
     <path class="chan-frame" d="M9 3V21M15 3V21M3 9H9M15 9H21M3 15H9M15 15H21" />
     <path class="chan-spark" d="M12 8L13 11L16 12L13 13L12 16L11 13L8 12L11 11Z" />
   </svg>`,
  vidibuzz: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes buzz-scale { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
       .buzz-bar { fill: var(--accent-violet); transform-origin: bottom; animation: buzz-scale 1s ease-in-out infinite; }
       .bb1 { transform-origin: 5px 12px; animation-delay: 0.1s; }
       .bb2 { transform-origin: 10px 12px; animation-delay: 0.3s; }
       .bb3 { transform-origin: 15px 12px; animation-delay: 0.5s; }
       .bb4 { transform-origin: 20px 12px; animation-delay: 0.2s; }
     </style>
     <rect class="buzz-bar bb1" x="4" y="4" width="2" height="16" rx="1" />
     <rect class="buzz-bar bb2" x="9" y="4" width="2" height="16" rx="1" />
     <rect class="buzz-bar bb3" x="14" y="4" width="2" height="16" rx="1" />
     <rect class="buzz-bar bb4" x="19" y="4" width="2" height="16" rx="1" />
   </svg>`,
  smartdeck: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes deck-slide { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
       .deck-layer { fill: var(--accent-emerald); transform-origin: center; }
       .dl1 { animation: deck-slide 2s ease-in-out infinite; }
       .dl2 { animation: deck-slide 2s ease-in-out infinite 0.4s; }
       .dl3 { animation: deck-slide 2s ease-in-out infinite 0.8s; }
     </style>
     <path class="deck-layer dl1" d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.9" />
     <path class="deck-layer dl2" d="M12 7L2 12L12 17L22 12L12 7Z" opacity="0.6" />
     <path class="deck-layer dl3" d="M12 12L2 17L12 22L22 17L12 12Z" opacity="0.3" />
   </svg>`,
  consulting: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes gear-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
       .consult-gear { stroke: var(--accent-violet); stroke-width: 2; transform-origin: 12px 12px; animation: gear-spin 8s linear infinite; }
     </style>
     <path class="consult-gear" d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 6C12.55 6 13 5.55 13 5V3C13 2.45 12.55 2 12 2C11.45 2 11 2.45 11 3V5C11 5.55 11.45 6 12 6ZM12 18C11.45 18 11 18.45 11 19V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V19C13 18.45 12.55 18 12 18ZM6 12C6 11.45 5.55 11 5 11H3C2.45 11 2 11.45 2 12C2 12.55 2.45 13 3 13H5C5.55 13 6 12.55 6 12ZM18 12C18 12.55 18.45 13 19 13H21C21.55 13 22 12.55 22 12C22 11.45 21.55 11 21 11H19C18.45 11 18 11.45 18 12Z" />
   </svg>`,
  vidicity: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes pin-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
       @keyframes radar-pulse { 0% { transform: scale(0.2); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } }
       .city-pin { fill: var(--accent-gold); transform-origin: center; animation: pin-bounce 2s ease-in-out infinite; }
       .city-radar { stroke: var(--accent-gold); stroke-width: 1.5; transform-origin: 12px 21px; animation: radar-pulse 2s ease-in-out infinite; }
     </style>
     <circle class="city-radar" cx="12" cy="21" r="5" />
     <path class="city-pin" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" />
   </svg>`,
  "vidi-news": `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
     <style>
       @keyframes news-signal { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
       .news-icon { stroke: var(--accent-gold); stroke-width: 2; stroke-linecap: round; }
       .news-signal1 { animation: news-signal 1s ease-in-out infinite; }
       .news-signal2 { animation: news-signal 1s ease-in-out infinite 0.3s; }
     </style>
     <path class="news-icon" d="M4 4H20V20H4V4Z" />
     <path class="news-icon news-signal1" d="M8 8H16" />
     <path class="news-icon news-signal2" d="M8 12H16" />
     <path class="news-icon" d="M8 16H12" />
   </svg>`,
  smartbook: `<svg class="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;margin-bottom:1rem;">
      <style>
        @keyframes page-turn { 0%, 100% { transform: rotateY(0); } 50% { transform: rotateY(-30deg); } }
        .book-page { fill: none; stroke: var(--accent-primary); stroke-width: 2; transform-origin: 12px center; animation: page-turn 3s ease-in-out infinite; }
        .book-spine { stroke: var(--text-primary); stroke-width: 2; }
      </style>
      <path class="book-spine" d="M12 21V3" />
      <path class="book-page" d="M12 3C8 3 4 5 4 5V19C4 19 8 17 12 17M12 3C16 3 20 5 20 5V19C20 19 16 17 12 17" />
    </svg>`
};

var waves = [
  {num:1,months:"1-4",plans:[1,7],team:46,desc:"VidiFund tariff window NOW. Consulting funds it.",revenue:"$150-300K/mo recurring"},
  {num:2,months:"4-9",plans:[3,4],team:22,desc:"VidiPitch live. Shared SmartGen/Vespa/Directus.",revenue:"VidiPitch $1M+/mo MRR"},
  {num:3,months:"9-14",plans:[2,6],team:23,desc:"VidiShop reuses Wave 2. SmartDeck API extraction.",revenue:"VidiShop $200K MRR"},
  {num:4,months:"14-19",plans:[5,8,9],team:37,desc:"VidiBuzz scales. VidiCity 10-city MVP seed. Vidi.NEWS launch.",revenue:"VidiBuzz $300K+/mo MRR"}
];

var waveColors = ["var(--accent-crimson)","var(--accent-primary)","var(--accent-emerald)","var(--accent-violet)"];

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function navHTML(activePage) {
  var links = "";
  var indexClass = activePage === "index" ? " class=\"active\"" : "";
  links += "<li><a href=\"index.html\"" + indexClass + ">Overview</a></li>";

  var dropdownItems = "";
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var moatVal = (p.moat.Tech + p.moat.Data + p.moat.Reg + p.moat.Switch + p.moat.Speed);
    var moatCls = moatVal >= 20 ? "hi" : moatVal >= 15 ? "md" : "";
    var moatLabel = moatVal >= 20 ? "HIGH" : moatVal >= 15 ? "MED" : "LOW";
    var activeCls = activePage === p.s ? " class=\"active\"" : "";
    dropdownItems += "<a href=\"plan-" + (p.n < 10 ? "0" : "") + p.n + "-" + p.s + ".html\"" + activeCls + ">";
    dropdownItems += "<span class=\"pn\">" + p.n + "</span>";
    dropdownItems += esc(p.nm.split(" ").slice(0,2).join(" "));
    dropdownItems += "<span class=\"pm " + moatCls + "\">" + moatLabel + "</span>";
    dropdownItems += "</a>";
  }

  var roadmapClass = activePage === "roadmap" ? " class=\"active\"" : "";
  var agentClass = activePage === "agent" ? " class=\"active\"" : "";

  var parts = [];
  parts.push("<nav class=\"nav\">");
  parts.push("  <div class=\"nav-in\">");
  parts.push("    <a class=\"nav-logo\" href=\"index.html\"><img src=\"assets/images/logo-vidismart.svg\" alt=\"VidiSmart\" style=\"height:32px;width:auto;\"> <span class=\"rk-badge\">TOP 10</span></a>");
  parts.push("    <ul class=\"nav-links\">");
  parts.push("      " + links);
  parts.push("      <li class=\"dd\"><a href=\"#\">Plans &#9662;</a>");
  parts.push("        <div class=\"ddm\">");
  parts.push("          " + dropdownItems);
  parts.push("          <div style=\"border-top:1px solid var(--border-subtle);margin:.25rem 0;\"></div>");
  parts.push("          <a href=\"corporate-bundle.html\"><span class=\"pn\" style=\"background:rgba(245,158,11,0.2);color:var(--accent-gold);\">CB</span>Corporate Bundle<span class=\"pm hi\" style=\"background:rgba(245,158,11,0.15);color:var(--accent-gold);\">$3K</span></a>");
  parts.push("        </div>");
  parts.push("      </li>");
  parts.push("      <li><a href=\"roadmap.html\"" + roadmapClass + ">Roadmap</a></li>");
  parts.push("      <li><a href=\"agent-plan.html\"" + agentClass + ">Agent Plan</a></li>");
  parts.push("    </ul>");
  parts.push("  </div>");
  parts.push("</nav>");
  return parts.join("\n");
}

function footerHTML() {
  return "<div class=\"ft\"><div class=\"container\">VidiSmart Monetization Research | Generated 2026-05-27 | Directional estimates only</div></div>";
}

function scriptsHTML() {
  var parts = [];
  parts.push("<script src=\"assets/js/nav.js\"></script>");
  parts.push("<script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>");
  parts.push("<script src=\"assets/js/charts.js\"></script>");
  return parts.join("\n");
}

function headHTML(title) {
  var parts = [];
  parts.push("<!DOCTYPE html>");
  parts.push("<html lang=\"en\">");
  parts.push("<head>");
  parts.push("  <meta charset=\"UTF-8\">");
  parts.push("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
  parts.push("  <title>" + esc(title) + " | VidiSmart Top 10</title>");
  parts.push("  <link rel=\"stylesheet\" href=\"assets/css/style.css\">");
  parts.push("  <link rel=\"icon\" href=\"assets/images/favicon.ico\">");
  parts.push("</head>");
  return parts.join("\n");
}

function closeHTML() {
  return "</body>\n</html>";
}

function moatScore(m) {
  return m.Tech + m.Data + m.Reg + m.Switch + m.Speed;
}

function jsonForChart(obj) {
  var keys = Object.keys(obj);
  var pairs = [];
  for (var i = 0; i < keys.length; i++) {
    pairs.push("\"" + keys[i] + "\":" + obj[keys[i]]);
  }
  return "{" + pairs.join(",") + "}";
}

function slugFile(n, s) {
  return "plan-" + (n < 10 ? "0" : "") + n + "-" + s + ".html";
}

function companyProfileSection(p) {
  var parts = [];
  parts.push("<section class=\"sec\" style=\"padding-top:0;padding-bottom:0;\">");
  parts.push("  <div class=\"container-n\">");
  parts.push("    <div class=\"card\" style=\"border-left:4px solid var(--accent-primary);\">");
  parts.push("      <div class=\"ct\">Company Profile</div>");
  parts.push("      <div class=\"g2\" style=\"margin-top:1rem;gap:1.5rem;\">");
  parts.push("        <div>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-bottom:.25rem;\">Legal Entity</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.legalEntity) + "</p>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-top:1rem;margin-bottom:.25rem;\">Domain</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.domain) + "</p>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-top:1rem;margin-bottom:.25rem;\">Founded</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.founded) + "</p>");
  parts.push("        </div>");
  parts.push("        <div>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-bottom:.25rem;\">Target Customers</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.targetCustomers) + "</p>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-top:1rem;margin-bottom:.25rem;\">Revenue Model</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.revenueModel) + "</p>");
  parts.push("          <h3 style=\"font-size:1rem;color:var(--text-muted);margin-top:1rem;margin-bottom:.25rem;\">Key Technology</h3>");
  parts.push("          <p style=\"font-size:.9rem;\">" + esc(p.keyTechnology) + "</p>");
  parts.push("        </div>");
  parts.push("      </div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");
  return parts.join("\n");
}

// ── Index Page ──
function generateIndex() {
  var parts = [];
  parts.push(headHTML("Top 10 Monetization Plans"));
  parts.push("<body>");
  parts.push("<div class=\"bg-mesh\"></div>");
  parts.push(navHTML("index"));

  parts.push("<section class=\"sec pt-nav\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <h1 class=\"d-xl fu\">Top 10<br>Monetization Plans</h1>");
  parts.push("    <p class=\"fu fu2\" style=\"font-size:1.1rem;color:var(--text-secondary);margin-top:1rem;max-width:600px;\">Ranked by revenue potential, time-sensitivity, and competitive moat. Click any plan for the full analysis.</p>");
  parts.push("  </div>");
  parts.push("</section>");

  // Hero Image
  parts.push("<section style=\"padding-top:0;padding-bottom:0;\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"cw\" style=\"overflow:hidden;padding:0;\">");
  parts.push("      <img src=\"assets/images/hero-vidismart-dashboard.png\" alt=\"VidiSmart Platform Dashboard\" style=\"width:100%;height:auto;display:block;max-height:450px;object-fit:cover;\">");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Ranking Table
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"cw\">");
  parts.push("      <table style=\"width:100%;border-collapse:collapse;font-size:.85rem;\">");
  parts.push("        <thead><tr style=\"border-bottom:1px solid var(--border-light);color:var(--text-muted);text-align:left;\">");
  parts.push("          <th style=\"padding:10px 12px;\">#</th><th style=\"padding:10px 12px;\">Plan</th><th style=\"padding:10px 12px;\">Type</th><th style=\"padding:10px 12px;\">Rev (Realistic)</th><th style=\"padding:10px 12px;\">Team</th><th style=\"padding:10px 12px;\">CapEx</th><th style=\"padding:10px 12px;\">MoAT</th><th style=\"padding:10px 12px;\">Competition</th>");
  parts.push("        </tr></thead>");
  parts.push("        <tbody>");
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var ms = moatScore(p.moat);
    var rowBg = i % 2 === 0 ? "" : "background:var(--bg-elevated);";
    parts.push("          <tr style=\"border-bottom:1px solid var(--border-subtle);" + rowBg + "\">");
    parts.push("            <td style=\"padding:10px 12px;font-weight:700;color:var(--accent-primary);\">" + p.n + "</td>");
    parts.push("            <td style=\"padding:10px 12px;\"><a href=\"" + slugFile(p.n, p.s) + "\" style=\"color:var(--text-primary);text-decoration:none;font-weight:600;\">" + esc(p.nm) + "</a></td>");
    parts.push("            <td style=\"padding:10px 12px;\"><span class=\"tag " + p.tag + "\">" + esc(p.tagLabel) + "</span></td>");
    parts.push("            <td style=\"padding:10px 12px;font-weight:600;\">$" + p.revReal + "M</td>");
    parts.push("            <td style=\"padding:10px 12px;\">" + p.team + "</td>");
    parts.push("            <td style=\"padding:10px 12px;\">" + esc(p.capexTotal) + "</td>");
    parts.push("            <td style=\"padding:10px 12px;font-weight:700;\">" + ms + "/25</td>");
    parts.push("            <td style=\"padding:10px 12px;\">" + esc(p.competition) + "</td>");
    parts.push("          </tr>");
  }
  parts.push("        </tbody>");
  parts.push("      </table>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Plan Cards
  parts.push("<section class=\"sec\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g2\">");
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var ms = moatScore(p.moat);
    parts.push("      <a href=\"" + slugFile(p.n, p.s) + "\" class=\"card fu fu" + ((i % 3) + 1) + "\">");
    parts.push("        <span class=\"cr\">" + (p.n < 10 ? "0" : "") + p.n + "</span>");
    if (svgs[p.s]) {
      parts.push("        " + svgs[p.s]);
    }
    parts.push("        <span class=\"tag " + p.tag + "\" style=\"margin-bottom:1rem;\">" + esc(p.tagLabel) + "</span>");
    parts.push("        <h3 style=\"font-size:1.25rem;margin:.75rem 0;\">" + esc(p.nm) + "</h3>");
    parts.push("        <p style=\"color:var(--text-secondary);font-size:.9rem;margin-bottom:1.5rem;\">" + esc(p.h) + "</p>");
    parts.push("        <div class=\"g4\" style=\"gap:.75rem;\">");
    parts.push("          <div class=\"mp\"><span class=\"ml\">Revenue</span><span class=\"mv\" style=\"font-size:1.1rem;\">$" + p.revReal + "M</span></div>");
    parts.push("          <div class=\"mp\"><span class=\"ml\">Team</span><span class=\"mv\" style=\"font-size:1.1rem;\">" + p.team + "</span></div>");
    parts.push("          <div class=\"mp\"><span class=\"ml\">CapEx</span><span class=\"mv\" style=\"font-size:1.1rem;\">" + esc(p.capexTotal) + "</span></div>");
    parts.push("          <div class=\"mp\"><span class=\"ml\">MoAT</span><span class=\"mv\" style=\"font-size:1.1rem;\">" + ms + "/25</span></div>");
    parts.push("        </div>");
    parts.push("      </a>");
  }
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Wave Summary
  parts.push("<section class=\"sec\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <h2 style=\"font-size:2rem;margin-bottom:2rem;\">Execution Waves</h2>");
  parts.push("    <div class=\"g2\">");
  for (var w = 0; w < waves.length; w++) {
    var wv = waves[w];
    var planNames = "";
    for (var pi = 0; pi < wv.plans.length; pi++) {
      var pp = plans[wv.plans[pi] - 1];
      if (pi > 0) planNames += " + ";
      planNames += pp.nm.split(" ")[0];
    }
    parts.push("      <div class=\"card\" style=\"border-left:3px solid " + waveColors[w] + ";\">");
    parts.push("        <span class=\"rh\" style=\"background:" + waveColors[w] + ";color:#ffffff;border:1px solid " + waveColors[w] + ";\">WAVE " + wv.num + " &mdash; MONTHS " + wv.months + "</span>");
    parts.push("        <h3 style=\"margin:1rem 0 .5rem;\">" + esc(planNames) + "</h3>");
    parts.push("        <p style=\"color:var(--text-secondary);font-size:.9rem;\">" + esc(wv.desc) + "</p>");
    parts.push("        <div class=\"g2\" style=\"margin-top:1rem;gap:.5rem;\">");
    parts.push("          <div class=\"mp\"><span class=\"ml\">Team</span><span class=\"mv\" style=\"font-size:1rem;\">" + wv.team + "</span></div>");
    parts.push("          <div class=\"mp\"><span class=\"ml\">Revenue</span><span class=\"mv\" style=\"font-size:.9rem;\">" + esc(wv.revenue) + "</span></div>");
    parts.push("        </div>");
    parts.push("      </div>");
  }
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  parts.push(footerHTML());
  parts.push(scriptsHTML());
  parts.push(closeHTML());
  return parts.join("\n");
}

// ── Individual Plan Page ──
function generatePlanPage(p, planIndex) {
  var prevPlan = planIndex > 0 ? plans[planIndex - 1] : null;
  var nextPlan = planIndex < plans.length - 1 ? plans[planIndex + 1] : null;
  var ms = moatScore(p.moat);
  var canvasId = "chart-" + p.n;

  var parts = [];
  parts.push(headHTML(p.nm));
  parts.push("<body>");
  parts.push("<div class=\"bg-mesh\"></div>");
  parts.push(navHTML(p.s));

  // Hero
  parts.push("<section class=\"sec pt-nav\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"rh " + p.badge + "\"><span class=\"rn\">#" + p.n + "</span> " + esc(p.tagLabel) + "</div>");
  if (svgs[p.s]) {
    parts.push("    <div style=\"margin-top:1.5rem;\">" + svgs[p.s].replace("margin-bottom:1rem;","margin-bottom:0;") + "</div>");
  }
  parts.push("    <h1 class=\"d-lg\" style=\"margin-top:1.5rem;\">" + esc(p.nm) + "</h1>");
  parts.push("    <p style=\"font-size:1.15rem;color:var(--text-secondary);margin-top:1rem;max-width:700px;\">" + esc(p.h) + "</p>");
  parts.push("  </div>");
  parts.push("</section>");

  // Product Showcase Image
  parts.push("<section style=\"padding-top:0;padding-bottom:0;\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"cw\" style=\"overflow:hidden;padding:0;position:relative;\">");
  parts.push("      <img src=\"" + p.heroImg + "\" alt=\"" + esc(p.heroAlt) + "\" style=\"width:100%;height:auto;display:block;max-height:400px;object-fit:cover;\">");
  parts.push("      <div style=\"position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(6,10,20,0.9));padding:2rem;\">");
  parts.push("        <span style=\"font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);\">" + esc(p.heroAlt) + "</span>");
  parts.push("      </div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Company Profile
  parts.push(companyProfileSection(p));

  // Metric Pills
  parts.push("<section style=\"padding-top:1.5rem\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g4\">");
  parts.push("      <div class=\"mp\"><span class=\"ml\">Revenue Target</span><span class=\"mv\">$" + p.revReal + "M " + esc(p.unit) + "</span></div>");
  parts.push("      <div class=\"mp\"><span class=\"ml\">Team Size</span><span class=\"mv\">" + p.team + " people</span></div>");
  parts.push("      <div class=\"mp\"><span class=\"ml\">Total CapEx</span><span class=\"mv\">" + esc(p.capexTotal) + "</span></div>");
  parts.push("      <div class=\"mp\"><span class=\"ml\">MoAT Score</span><span class=\"mv\">" + ms + " / 25</span></div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Charts Row: Revenue + MoAT
  parts.push("<section class=\"sec\" style=\"padding-top:1rem\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g2\">");
  parts.push("      <div class=\"cw\"><div class=\"ct\">Revenue Projection ($M)</div><canvas id=\"" + canvasId + "-rev\" data-chart-rev='{\"cons\":" + p.revCons + ",\"real\":" + p.revReal + ",\"opt\":" + p.revOpt + "}'></canvas></div>");
  parts.push("      <div class=\"cw\"><div class=\"ct\">MoAT Analysis</div><canvas id=\"" + canvasId + "-moat\" data-chart-moat='{\"Tech\":" + p.moat.Tech + ",\"Data\":" + p.moat.Data + ",\"Reg\":" + p.moat.Reg + ",\"Switch\":" + p.moat.Switch + ",\"Speed\":" + p.moat.Speed + "}'></canvas></div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Builds Accordion
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container-n\">");
  parts.push("    <div class=\"acc\">");
  parts.push("      <div class=\"aci open\">");
  parts.push("        <div class=\"ach\"><h2 style=\"font-size:1.1rem;\">What We Build</h2><span class=\"aar\">&#9662;</span></div>");
  parts.push("        <div class=\"acb\"><div class=\"acbi\"><ul>");
  for (var bi = 0; bi < p.builds.length; bi++) {
    parts.push("          <li>" + esc(p.builds[bi]) + "</li>");
  }
  parts.push("        </ul></div></div>");
  parts.push("      </div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Secondary Product Image
  parts.push("<section style=\"padding-top:0;padding-bottom:0;\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"cw\" style=\"overflow:hidden;padding:0;position:relative;\">");
  parts.push("      <img src=\"" + p.productImg + "\" alt=\"" + esc(p.productAlt) + "\" style=\"width:100%;height:auto;display:block;max-height:350px;object-fit:cover;\">");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Team + CapEx Charts
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g2\">");
  parts.push("      <div class=\"cw\"><div class=\"ct\">Team Allocation</div><canvas id=\"" + canvasId + "-team\" data-chart-team='" + jsonForChart(p.roles) + "'></canvas></div>");
  parts.push("      <div class=\"cw\"><div class=\"ct\">CapEx Breakdown ($K)</div><canvas id=\"" + canvasId + "-capex\" data-chart-capex='" + jsonForChart(p.capex) + "'></canvas></div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Why This Rank
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container-n\">");
  parts.push("    <div class=\"ub\">");
  parts.push("      <span style=\"font-size:1.5rem;\">&#9733;</span>");
  parts.push("      <div><strong>Why This Rank</strong><p style=\"margin-top:.5rem;color:var(--text-secondary);font-size:.9rem;\">" + esc(p.why) + "</p></div>");
  parts.push("    </div>");
  parts.push("    <div class=\"cw\">");
  parts.push("      <div class=\"ct\">Competition</div>");
  parts.push("      <p style=\"color:var(--text-secondary);font-size:.9rem;\">" + esc(p.competition) + "</p>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Prev/Next Navigation
  parts.push("<section style=\"padding:0 0 3rem;\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g2\">");
  if (prevPlan) {
    parts.push("      <a href=\"" + slugFile(prevPlan.n, prevPlan.s) + "\" class=\"card\" style=\"text-align:left;\"><span class=\"ml\">&#8592; Previous</span><div style=\"font-weight:700;margin-top:.5rem;\">" + esc(prevPlan.nm) + "</div></a>");
  } else {
    parts.push("      <div></div>");
  }
  if (nextPlan) {
    parts.push("      <a href=\"" + slugFile(nextPlan.n, nextPlan.s) + "\" class=\"card\" style=\"text-align:right;\"><span class=\"ml\">Next &#8594;</span><div style=\"font-weight:700;margin-top:.5rem;\">" + esc(nextPlan.nm) + "</div></a>");
  } else {
    parts.push("      <div></div>");
  }
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  parts.push(footerHTML());
  parts.push(scriptsHTML());
  parts.push(closeHTML());
  return parts.join("\n");
}

// ── Roadmap Page ──
function generateRoadmap() {
  var parts = [];
  parts.push(headHTML("Execution Roadmap"));
  parts.push("<body>");
  parts.push("<div class=\"bg-mesh\"></div>");
  parts.push(navHTML("roadmap"));

  parts.push("<section class=\"sec pt-nav\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <h1 class=\"d-lg\">Execution Roadmap</h1>");
  parts.push("    <p style=\"font-size:1.1rem;color:var(--text-secondary);margin-top:1rem;max-width:700px;\">Four waves across 19 months. Each builds on shared infrastructure.</p>");
  parts.push("  </div>");
  parts.push("</section>");

  parts.push("<section style=\"padding-top:0;padding-bottom:0;\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"cw\" style=\"overflow:hidden;padding:0;\">");
  parts.push("      <img src=\"assets/images/slide-roadmap.png\" alt=\"Execution Roadmap\" style=\"width:100%;height:auto;display:block;max-height:350px;object-fit:cover;\">");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container\">");

  for (var w = 0; w < waves.length; w++) {
    var wv = waves[w];
    parts.push("    <div class=\"card mb-lg\" style=\"border-left:4px solid " + waveColors[w] + ";\">");
    parts.push("      <div class=\"g2\" style=\"gap:2rem;align-items:start;\">");
    parts.push("        <div>");
    parts.push("          <span class=\"rh\" style=\"background:" + waveColors[w] + ";color:#ffffff;border:1px solid " + waveColors[w] + ";\">WAVE " + wv.num + "</span>");
    parts.push("          <h2 style=\"font-size:1.5rem;margin:1rem 0 .5rem;\">Months " + wv.months + "</h2>");
    parts.push("          <p style=\"color:var(--text-secondary);margin-bottom:1rem;\">" + esc(wv.desc) + "</p>");
    parts.push("          <div class=\"g2\" style=\"gap:.5rem;\">");
    parts.push("            <div class=\"mp\"><span class=\"ml\">Team</span><span class=\"mv\" style=\"font-size:1rem;\">" + wv.team + " people</span></div>");
    parts.push("            <div class=\"mp\"><span class=\"ml\">Revenue Milestone</span><span class=\"mv\" style=\"font-size:.85rem;\">" + esc(wv.revenue) + "</span></div>");
    parts.push("          </div>");
    parts.push("        </div>");
    parts.push("        <div>");
    parts.push("          <div class=\"ct\">Plans in this Wave</div>");
    for (var pi = 0; pi < wv.plans.length; pi++) {
      var pp = plans[wv.plans[pi] - 1];
      parts.push("          <a href=\"" + slugFile(pp.n, pp.s) + "\" class=\"cw\" style=\"display:block;margin-bottom:.75rem;text-decoration:none;border-left:3px solid " + waveColors[w] + ";\">");
      parts.push("            <div style=\"display:flex;align-items:center;gap:.75rem;\">");
      parts.push("              <span class=\"pn\" style=\"background:" + waveColors[w] + ";color:#fff;\">" + pp.n + "</span>");
      parts.push("              <div><strong style=\"font-size:.9rem;\">" + esc(pp.nm) + "</strong><br><span style=\"color:var(--text-muted);font-size:.8rem;\">" + esc(pp.h.substring(0, 60)) + "...</span></div>");
      parts.push("            </div>");
      parts.push("          </a>");
    }
    parts.push("        </div>");
    parts.push("      </div>");
    parts.push("    </div>");
  }

  parts.push("  </div>");
  parts.push("</section>");

  parts.push(footerHTML());
  parts.push(scriptsHTML());
  parts.push(closeHTML());
  return parts.join("\n");
}

// ── Agent Plan Page ──
function generateAgentPlan() {
  var agents = [
    {id:"researcher",name:"Market Research Agent",desc:"Searches SEC filings, Crunchbase, patent databases, and government registries to validate market claims and competitive landscapes.",tasks:["Validate TAM/SAM/SOM for each plan","Identify existing competitors and their funding","Cross-reference government data (SAM.gov, ACE, CBP)","Track recent M&A and IPO activity in space"]},
    {id:"financial",name:"Financial Modeling Agent",desc:"Builds revenue projections, CapEx models, and break-even timelines using comparable SaaS benchmarks and public market data.",tasks:["Build 3-scenario revenue models (conservative/realistic/optimistic)","Calculate unit economics and LTV/CAC","Model CapEx requirements with contingency","Generate investor-grade financial summaries"]},
    {id:"technical",name:"Technical Architecture Agent",desc:"Evaluates tech stack requirements, identifies reuse opportunities across plans, and estimates build complexity.",tasks:["Map shared infrastructure (Vespa, Directus, R2, SmartGen)","Estimate engineering effort per component","Identify API-first architectures for licensing","Assess GPU/compute requirements"]},
    {id:"competitive",name:"Competitive Intelligence Agent",desc:"Monitors competitor product launches, pricing changes, and strategic moves across all 8 plan verticals.",tasks:["Track competitor product roadmaps","Monitor pricing and packaging changes","Identify partnership and acquisition opportunities","Generate monthly competitive briefings"]},
    {id:"regulatory",name:"Regulatory & Compliance Agent",desc:"Tracks regulatory changes, filing requirements, and compliance deadlines relevant to tariff filing, investing, and government contracts.",tasks:["Monitor SCOTUS and IEEPA-related rulings","Track CBP ACE system updates and API changes","Ensure SEC/FINRA compliance for investing plans","Maintain SAM.gov registration status"]},
    {id:"synthesis",name:"Synthesis & Reporting Agent",desc:"Aggregates findings from all agents into executive-ready dashboards, weekly briefings, and investor updates.",tasks:["Generate weekly executive summary","Produce monthly board deck","Update real-time KPI dashboard","Flag critical risks and opportunities"]}
  ];

  var parts = [];
  parts.push(headHTML("Agent Plan"));
  parts.push("<body>");
  parts.push("<div class=\"bg-mesh\"></div>");
  parts.push(navHTML("agent"));

  parts.push("<section class=\"sec pt-nav\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <h1 class=\"d-lg\">Research Agent Plan</h1>");
  parts.push("    <p style=\"font-size:1.1rem;color:var(--text-secondary);margin-top:1rem;max-width:700px;\">Six specialized AI agents coordinated by a central orchestrator. Each agent focuses on a specific domain, feeding insights into a unified research pipeline.</p>");
  parts.push("  </div>");
  parts.push("</section>");

  // Architecture Overview
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container-n\">");
  parts.push("    <div class=\"cw\" style=\"text-align:center;padding:2rem;\">");
  parts.push("      <div class=\"ct\" style=\"text-align:center;\">Agent Architecture</div>");
  parts.push("      <div style=\"display:flex;flex-direction:column;align-items:center;gap:1rem;margin-top:1rem;\">");
  parts.push("        <div class=\"rh violet\" style=\"font-size:.9rem;\">COORDINATOR AGENT</div>");
  parts.push("        <div style=\"color:var(--text-muted);\">&#8595; task assignment &#8595;</div>");
  parts.push("        <div class=\"g3\" style=\"width:100%;\">");
  for (var i = 0; i < 6; i++) {
    parts.push("          <div class=\"mp\" style=\"text-align:center;border-color:" + waveColors[i % 4] + ";\"><span class=\"ml\" style=\"color:#ffffff;font-size:.8rem;font-weight:700;\">" + agents[i].name.replace(" Agent","") + "</span></div>");
  }
  parts.push("        </div>");
  parts.push("        <div style=\"color:var(--text-muted);\">&#8595; findings &#8595;</div>");
  parts.push("        <div class=\"rh blue\" style=\"font-size:.9rem;\">SYNTHESIS AGENT</div>");
  parts.push("        <div style=\"color:var(--text-muted);\">&#8595; insights &#8595;</div>");
  parts.push("        <div class=\"rh gold\" style=\"font-size:.9rem;\">EXECUTIVE DASHBOARD + WEEKLY BRIEFINGS</div>");
  parts.push("      </div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Agent Cards
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container\">");
  parts.push("    <div class=\"g2\">");
  for (var i = 0; i < agents.length; i++) {
    var ag = agents[i];
    parts.push("      <div class=\"card\">");
    parts.push("        <div class=\"g2\" style=\"gap:1rem;align-items:center;margin-bottom:1rem;\">");
    parts.push("          <div class=\"pn\" style=\"width:32px;height:32px;font-size:.8rem;background:" + waveColors[i % 4] + ";color:#fff;\">" + (i + 1) + "</div>");
    parts.push("          <div class=\"ct\" style=\"margin:0;\">" + esc(ag.name) + "</div>");
    parts.push("        </div>");
    parts.push("        <p style=\"color:var(--text-secondary);font-size:.9rem;margin-bottom:1rem;\">" + esc(ag.desc) + "</p>");
    parts.push("        <div class=\"acc\"><div class=\"aci open\">");
    parts.push("          <div class=\"ach\"><span style=\"font-size:.8rem;font-weight:600;\">Key Tasks</span><span class=\"aar\">&#9662;</span></div>");
    parts.push("          <div class=\"acb\"><div class=\"acbi\"><ul>");
    for (var ti = 0; ti < ag.tasks.length; ti++) {
      parts.push("            <li>" + esc(ag.tasks[ti]) + "</li>");
    }
    parts.push("          </ul></div></div>");
    parts.push("        </div></div>");
    parts.push("      </div>");
  }
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  // Output Format
  parts.push("<section class=\"sec\" style=\"padding-top:0\">");
  parts.push("  <div class=\"container-n\">");
  parts.push("    <div class=\"cw\">");
  parts.push("      <div class=\"ct\">Output Format Specification</div>");
  parts.push("      <div class=\"g2\" style=\"margin-top:1rem;\">");
  parts.push("        <div><h3 style=\"font-size:.95rem;margin-bottom:.5rem;\">Weekly Executive Briefing</h3><ul style=\"padding-left:1.2rem;color:var(--text-secondary);font-size:.85rem;\"><li>Key developments per plan (3 bullet max)</li><li>Revenue tracking vs. projections</li><li>Risk flags and recommended actions</li><li>Competitive intelligence highlights</li></ul></div>");
  parts.push("        <div><h3 style=\"font-size:.95rem;margin-bottom:.5rem;\">Monthly Board Deck</h3><ul style=\"padding-left:1.2rem;color:var(--text-secondary);font-size:.85rem;\"><li>Wave progress dashboard</li><li>Financial model updates</li><li>Team allocation review</li><li>Strategic pivots and market shifts</li></ul></div>");
  parts.push("      </div>");
  parts.push("    </div>");
  parts.push("  </div>");
  parts.push("</section>");

  parts.push(footerHTML());
  parts.push(scriptsHTML());
  parts.push(closeHTML());
  return parts.join("\n");
}

// ── Write All Files ──
function main() {
  var dirs = ["assets/css", "assets/js"];
  for (var d = 0; d < dirs.length; d++) {
    var dirPath = path.join(BASE, dirs[d]);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
    }
  }

  fs.writeFileSync(path.join(BASE, "index.html"), generateIndex(), "utf8");
  console.log("Created index.html");

  for (var i = 0; i < plans.length; i++) {
    var fname = slugFile(plans[i].n, plans[i].s);
    fs.writeFileSync(path.join(BASE, fname), generatePlanPage(plans[i], i), "utf8");
    console.log("Created " + fname);
  }

  fs.writeFileSync(path.join(BASE, "roadmap.html"), generateRoadmap(), "utf8");
  console.log("Created roadmap.html");

  fs.writeFileSync(path.join(BASE, "agent-plan.html"), generateAgentPlan(), "utf8");
  console.log("Created agent-plan.html");

  console.log("\nAll 11 pages generated successfully.");
}

main();

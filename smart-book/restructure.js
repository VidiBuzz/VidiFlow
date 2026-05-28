const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.js');
const content = fs.readFileSync(filePath, 'utf8');

// Extract the original file content before the const BOOK_DATA line
const headerMatch = content.match(/^([\s\S]*?)(const BOOK_DATA = \{)/);
const header = headerMatch ? headerMatch[1] : '';

// Parse chapters from the original content
function extractChapters(content) {
  const chapters = {};
  // Match chapter blocks: chX: { ... },
  const chapterRegex = /\s+(ch\d+[bv]?|foreword):\s*\{([\s\S]*?)(?=\n\s{4}(?:ch\d+[bv]?|foreword):|\n\s{2}\},|\n\s{2}knowledgeNodes)/g;
  let match;
  while ((match = chapterRegex.exec(content)) !== null) {
    const key = match[1];
    const body = match[2];
    chapters[key] = body;
  }
  return chapters;
}

// Parse knowledge nodes
function extractKnowledgeNodes(content) {
  const match = content.match(/knowledgeNodes:\s*\[([\s\S]*?)\],/);
  return match ? match[1] : '';
}

// Parse edges
function extractEdges(content) {
  const match = content.match(/edges:\s*\[([\s\S]*?)\]\s*\};/);
  return match ? match[1] : '';
}

// Parse personas
function extractPersonas(content) {
  const match = content.match(/personas:\s*\{([\s\S]*?)\n\s{2}\},/);
  return match ? match[1] : '';
}

// Parse metadata
function extractMetadata(content) {
  const match = content.match(/metadata:\s*\{([\s\S]*?)\n\s{2}\},/);
  return match ? match[1] : '';
}

const chapters = extractChapters(content);
const knowledgeNodes = extractKnowledgeNodes(content);
const edges = extractEdges(content);
const personas = extractPersonas(content);
const metadata = extractMetadata(content);

// Define the chapter reordering
// Original: foreword, ch1-ch39, ch13b, ch23b, ch32b, ch33v
// New: foreword, NEW ch1, ch2-ch35 (was ch1-ch34), NEW ch36, NEW ch37, NEW ch38, NEW ch39, NEW ch40, NEW ch41, ch42 (was ch37), ch43 (was ch38), ch44 (was ch39)
// Special: ch13b, ch23b, ch32b, ch33v stay as-is

// Map old chapter keys to new chapter keys
const chapterMap = {};
for (let i = 1; i <= 36; i++) {
  if ([13, 23, 32, 33].includes(i)) continue; // skip, these have special chapters
  chapterMap[`ch${i}`] = `ch${i + 1}`;
}
// ch37 -> ch42, ch38 -> ch43, ch39 -> ch44
chapterMap['ch37'] = 'ch42';
chapterMap['ch38'] = 'ch43';
chapterMap['ch39'] = 'ch44';

// Special chapters don't change
// ch13b, ch23b, ch32b, ch33v stay as-is

// Update chapter content (id, title, order)
function updateChapterContent(body, newKey, newOrder, newPart, titleOverride) {
  let updated = body;
  
  // Update id
  updated = updated.replace(/id:\s*"[^"]*"/, `id: "${newKey}"`);
  
  // Update order
  updated = updated.replace(/order:\s*\d+/, `order: ${newOrder}`);
  
  // Update part if provided
  if (newPart !== undefined) {
    updated = updated.replace(/part:\s*\d+/, `part: ${newPart}`);
  }
  
  // Update title if override provided
  if (titleOverride) {
    updated = updated.replace(/title:\s*"[^"]*"/, `title: "${titleOverride}"`);
  } else {
    // Update title to reflect new chapter number (Ch1 -> Ch2, etc.)
    updated = updated.replace(/title:\s*"Ch(\d+):/, (match, num) => {
      const newNum = parseInt(num) + 1;
      return `title: "Ch${newNum}:`;
    });
  }
  
  return updated;
}

// New chapter content
const newChapters = {
  ch1: {
    part: 1,
    order: 1,
    title: 'Ch1: The Computing Eras — A Personal Journey',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Every technology wave has a prehistory. The AI revolution is not unprecedented — it is the fifth major computing era in the last sixty-five years, and it follows a pattern that becomes clearer when you look backward. The companies and individuals who caught the wave early didn't do it because they were geniuses. They did it because they recognized which era they were in, understood the economics of that era, and acted while the barrier to entry was low and the window was wide open.</p>
        <p>That window always closes. It closed for mainframe builders in 1980. It closed for PC hardware manufacturers in 1995. It closed for portal sites in 2008. It closed for app store developers in 2020. Each closure redistributed hundreds of billions of dollars. The AI window is still open — but it won't stay that way for long.</p>
      </div>
      <p><strong>1. Mainframe Era (≈1960–1980).</strong> The winners were IBM — crossing $5 billion in annual revenue by 1980 — and Sperry Rand. The losers were DEC, Wang Labs, Burroughs, and Honeywell. The cost to compete was astronomical: $10 million to $100 million in hardware R&D, clean-room manufacturing facilities, and a direct sales force covering every Fortune 500 company. For the average entrepreneur, participation was literally impossible.</p>
      <p>The value driver was hardware monopoly. If you owned the iron, you owned the customer. IBM's System/360 locked enterprises into an ecosystem that took decades to escape. The parallel to today's frontier model race isn't subtle: OpenAI, Anthropic, and Google DeepMind are spending $100 million to $1 billion+ per training run — a cost floor that creates a moat just as thick as IBM's factories. But here is the difference: unlike mainframes, the output of that training is accessible to everyone via API. The moat protects the model builder, but the model's capability leaks outward to anyone who can write code.</p>
      <p><strong>2. PC Era (1980–1995).</strong> ⭐ Opens in 1980. The winners were Microsoft, Intel, Apple, Compaq, and Dell. The losers were DEC, Wang Labs, Tandy/Radio Shack, Commodore, Amiga, and Atari. The cost to enter split into two tiers: $1 million to $10 million to build a PC clone (manufacturing, supply chain, distribution); $100,000 to $1 million to write software (a developer, a compiler, and a shrink-wrapped box).</p>
      <p>For the average entrepreneur, software was the opening. Write a spreadsheet in a garage — VisiCalc, Lotus 1-2-3 — and you changed the industry overnight. Hardware required fabs costing billions. Software required skill and timing. The AI parallel is exact: model training is PC hardware (expensive, concentrated, requiring institutional capital). Building agents and workflows on top of existing models is PC software (accessible to anyone with coding skill, a laptop, and an API key).</p>
      <blockquote>"In 1985, Bill Gates made a bet that software would matter more than hardware. Everyone called him crazy. He was right. In 2026, the same dynamic repeats: the model is the hardware. The agent workflow built on top is the software. Own the software."</blockquote>
      <p><strong>3. Internet Era (1995–2008).</strong> The winners were Google (ad revenue exceeding $150 billion annually), Amazon ($15 billion+ in cumulative infrastructure investment that created AWS), and Salesforce. The losers: Netscape (sold to AOL for $4.2 billion after dominating browsers), Yahoo (portal collapse), MySpace (sold for $580 million after a $12 billion purchase at peak), and Pets.com ($300 million burned in 18 months during the dot-com bust).</p>
      <p>Cost to compete: $10 million to $100 million for data center infrastructure. But distribution — the web — was free. For the average entrepreneur, content and community were the openings. Start a blog from your bedroom and reach millions. Build a marketplace connecting buyers and sellers without owning inventory. Infrastructure was expensive; distribution was democratized.</p>
      <p>The AI parallel: AI infrastructure costs less than 1995 data centers — run a 70-billion-parameter model on a $2,000 GPU. Distribution through APIs and agents is even more frictionless than the web. A single developer can publish an agent workflow to 10,000 users without a server, a domain name, or a credit card.</p>
      <p><strong>4. Cloud/Mobile Era (2009–2020).</strong> ⭐ Honorable mention for smartphone explosion: iPhone App Store launched July 2008; Android Marketplace launched October 2008. Winners: Apple ($200 billion+ in market cap growth driven by App Store commissions), Google (Android dominance), Uber/Airbnb (platform-scale disintermediation), Slack/Stripe (infrastructure-for-startups). Losers: BlackBerry (50% global market share → 0%), Nokia/Symbian, Palm/WebOS, Windows Phone.</p>
      <p>Cost to participate: $0 to $100 for an app store registration. $1 million to $10 million for a serious startup with funding. This was the golden era for the individual developer — one person could reach a billion+ users. The barrier was skill, not capital. Write a good game, a useful utility, or a beautiful photo editor and the app store algorithm did the marketing for you.</p>
      <p>The AI parallel: agent development is even more accessible than mobile apps ever were. No app store gatekeeper approving your submission. No 30% commission cut. No platform dependency that can delete your business overnight. You own the pipeline end-to-end: model selection, prompt design, data integration, deployment. Zero marginal distribution cost.</p>
      <p><strong>5. AI Era (2020–Present).</strong> The winners so far: OpenAI ($150 billion+ valuation), Anthropic ($18 billion valuation backed by Google and Amazon), Google DeepMind (Alphabet's AI engine), and NVIDIA ($3 trillion market cap as the pick-and-shovel provider of compute). The at-risk incumbents: Google Search ($30 billion+ annual revenue threatened by AI-native query interfaces), generic SaaS applications (the SaaSpocalypse — $500 billion+ in market cap redistributed across categories), and raw data sellers whose datasets are now embedded in model training corpora.</p>
      <p>Cost to compete: $0 to $50 per month for API access to frontier models. $2,000 to $10,000 for local deployment on a workstation-class GPU. The average entrepreneur can build a production-quality AI agent stack for less than the cost of a used car. The barrier is not capital. It is <em>understanding</em>.</p>
      <p><em>This is the era I am living in now. I founded VidiChannel in 1999 — right at the inflection point between the Internet and Mobile eras. We had the vision for interactive video delivery before broadband was fast enough to carry it. Before mobile devices were ubiquitous enough to receive it. I learned the hardest lesson in technology: being early is indistinguishable from being wrong.</em></p>
      <p><em>This time — the AI era — the infrastructure is mature. The models are accessible through APIs. The tools are open-source. The platforms are stable. There is nothing standing between you and a deployed AI system except understanding. That's what this book gives you.</em></p>
      <p>In the PC era, you needed millions for hardware. In the Internet era, you needed millions for infrastructure. In the Mobile era, you needed an app store account and skill. In the AI era, you need understanding. That's it. The dollar amounts have collapsed from $100 million to $100. The timeline has collapsed from decades to months. The only question is: will you act on it before the window closes — because it always closes.</p>`,
    images: '["era_comparison_1980_2009.png", "vidichannel_1999_smartstack_2026.png"]',
    readingTime: 15
  },
  ch36: {
    part: 2,
    order: 36,
    title: 'Ch36: Abstraction — When It Has Value',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Abstraction is the most powerful tool in engineering and the most dangerous. Every abstraction layer in a system is a trade-off: it reduces cognitive load at the cost of hiding what is actually happening. The question is never "should we abstract?" — it is "at which layer does this abstraction stop serving us and start hiding the bug?"</p>
      </div>
      <p>Abstraction is a net benefit when it reduces cognitive load, enables parallel engineering, and manages complexity at scale. It is a net cost when it hides what is happening, enables bad decisions behind clean interfaces, and delays debugging past the point of recoverability.</p>
      <p><strong>Principle 1: Abstraction Boundary.</strong> Define at which layer debugging is possible. Can you see through the abstraction when something breaks? A well-designed abstraction exposes its internals when you need them — like a database query planner that lets you run EXPLAIN to see the actual execution plan. A poorly designed abstraction is a black box: when it fails, you have no way to understand why except to replace it entirely.</p>
      <p><strong>Principle 2: Cognitive Compression.</strong> Every abstraction layer is a mental model the engineer must hold. Stack more than four or five abstractions in working memory and the error rate rises non-linearly. This is why the full AI stack — from prompt to embedding to vector retrieval to model inference to output validation — cannot be treated as a single unit. Each layer must be independently inspectable, or the system becomes un-debuggable.</p>
      <p><strong>Principle 3: The Leaky Abstraction Law.</strong> Joel Spolsky's principle applies directly to 2026 AI infrastructure: all non-trivial abstractions leak. LLMs are an extreme abstraction — the user is several layers from the actual stochastic computation. When does that abstraction serve the user? When it is an interface, not a contract. The moment you treat the abstraction as a guarantee — "the model will always do X" — you have built on sand.</p>
      <p>The AI-specific angle: every production AI system in 2026 is built on abstractions that leak. The embedding model leaks when the query domain shifts. The RAG pipeline leaks when the chunking strategy misses a critical boundary. The model itself leaks when it encounters an out-of-distribution input. The organizations that succeed are not the ones that avoid abstractions — they are the ones that define the boundary of each abstraction, monitor for leaks, and have a debugging path that does not require replacing the entire stack.</p>
      <blockquote>"Abstraction is leverage. But leverage amplifies errors as well as successes. The engineer who understands the abstraction boundary is the one who can debug when it leaks."</blockquote>`,
    images: '["abstraction_layer_diagram.png", "leaky_abstraction_2026.png"]',
    readingTime: 12
  },
  ch37: {
    part: 3,
    order: 37,
    title: 'Ch37: Observation, Analytics & Adaptive Learning',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Every AI deployment generates data about its own performance. The organizations that capture this data, analyze it, and feed it back into the system are generating outsized returns. The organizations that deploy and measure once are running pilots, not production systems.</p>
      </div>
      <p>The three-phase loop that separates production AI from pilot AI:</p>
      <p><strong>Phase 1: Observation.</strong> Telemetry — what happened, at what cost, with what latency. Every agent decision, every retrieval, every model call, every escalation, every human override. This data exists whether you capture it or not. The question is whether it is structured, stored, and queryable.</p>
      <p><strong>Phase 2: Analytics.</strong> Drift detection (is the model's accuracy degrading over time?), anomaly scoring (which decisions deviate from the expected pattern?), confidence calibration (does the model's confidence score actually correlate with correctness?), and root-cause signal extraction (when accuracy drops, which component changed — the data, the prompt, the model, the retrieval?).</p>
      <p><strong>Phase 3: Adaptive Learning.</strong> Retune prompts based on observed failure modes. Refine confidence thresholds based on calibration data. Escalate novel patterns to human review and feed the corrected decisions back into the knowledge base. Fine-tune small adapters in production when the drift exceeds a defined threshold.</p>
      <p>Why organizations miss this loop: they build a deployment and measure it once. The organizations generating outsized returns measure every agent decision, triage the 3% that need human review, feed corrected decisions back into the knowledge base, and retune the threshold weekly.</p>
      <p>Production stats to track: per-agent accuracy curve over time, p50/p95/p99 latency per task type, escalation rate, human override rate, knowledge base growth rate. These five metrics tell you everything you need to know about the health of an AI deployment.</p>
      <p><em>I built VidiChannel in 1999. What I didn't know then was that the most valuable data you will ever generate is the data about your own AI deployments. Log everything. Analyze it weekly. Question every assumption about what your agents are doing.</em></p>
      <blockquote>"The AI system that learns from its own performance data is the one that compounds. The one that doesn't is a perpetual pilot."</blockquote>`,
    images: '["agent_telemetry_dashboard.png", "adaptive_learning_loop.png"]',
    readingTime: 13
  },
  ch38: {
    part: 4,
    order: 38,
    title: 'Ch38: Smart Process — AI Collab with HITL',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Human-in-the-Loop is not a concession to AI's limitations. It is a first-class design principle that makes AI systems trustworthy — and therefore actually deployable at scale in the real world. The organizations that get HITL right deploy AI systems that earn permanent trust. The ones that get it wrong watch their pilots sit unused after the initial enthusiasm fades.</p>
      </div>
      <p><strong>HITL at Three Levels.</strong></p>
      <p><strong>Level 1: Confidence Thresholds.</strong> Every agent classification carries a confidence score. Below a defined floor — typically 0.85 for routine tasks, 0.95 for high-stakes decisions — the system auto-escalates to a human. This is not a failure. It is the system operating as designed. An agent that knows what it doesn't know is the one you can trust in production.</p>
      <p><strong>Level 2: Consequence Thresholds.</strong> High-impact actions — financial transactions above $50,000, regulatory filings, production system changes — trigger mandatory human review regardless of confidence score. Confidence and consequence are independent dimensions. A model can be 99% confident and still be wrong about something that costs $200,000. The consequence threshold catches what the confidence threshold misses.</p>
      <p><strong>Level 3: Novelty Detection.</strong> Out-of-distribution inputs escalate automatically. Unknown equals escalate. This is the hardest level to implement because it requires the system to recognize when it is encountering something it was not trained on — which is, by definition, outside its training distribution. The practical approach: monitor the distance between incoming inputs and the training distribution in embedding space. When the distance exceeds a threshold, escalate.</p>
      <p><strong>The Escalation Packet.</strong> When an agent escalates, it does not just route to a human. It provides a structured packet: situation statement (what is happening), what the AI knows (the evidence it has assembled), what it considered doing and why it stopped (the decision path), what it needs from the human (the specific judgment required), and a recommended action with confidence. A human making a 30-second decision with full context is not a failure of automation — it is supervision working exactly as designed.</p>
      <p><strong>Cultural Adoption.</strong> Humans over-trust AI when the interface is opaque — they assume the system knows more than it does. Humans under-trust AI when the interface is too transparent — they see every uncertainty and lose confidence in the whole system. The interface is the antidote for both: show enough to build understanding, hide enough to avoid paralysis. The right balance is calibrated to the user's role and the decision's consequence.</p>
      <p>Real examples: MidWest Logistics deployed HITL at three levels and reduced escalation time by 60% because humans received structured packets instead of raw alerts. Cahill Construction built consequence thresholds into their procurement AI — any PO above $25,000 requires human review regardless of confidence — and caught three erroneous orders in the first month that would have cost $180,000 combined. Smith.ai uses confidence thresholds to route legal intake: above 0.90, the AI handles the classification; below 0.90, a paralegal reviews. The system handles 78% of intake autonomously while maintaining accuracy above human baseline.</p>
      <blockquote>"The measure of a production-ready AI system is not whether it can perform the task. It is whether the humans working alongside it can tell, at a glance, when to trust it and when to push back."</blockquote>`,
    images: '["hitl_three_level_diagram.png", "escalation_packet_ui.png", "smith_ai_interface.png"]',
    readingTime: 16
  },
  ch39: {
    part: 6,
    order: 39,
    title: 'Ch39: Glossary',
    content: `<div class="glossary">
      <div class="glossary-entry"><strong>25–7 Contact</strong> — <em>Customer engagement strategy.</em> The practice of reaching out to prospects or customers through 25 different touchpoints across 7 channels over a defined period. In AI-augmented workflows, agents automate the scheduling, content generation, and tracking of these touchpoints while humans handle the high-value relationship moments. <em>See Ch33: SmartGen.</em></div>
      <div class="glossary-entry"><strong>30–40 Agent Mesh</strong> — <em>Architecture pattern.</em> The coordinated system of 30 to 40 purpose-built AI agents that replaces the 500-app SaaS stack. Each agent owns a specific vertical (customer support, content production, legal review, AP/AR) and communicates natively with other agents through shared protocols. <em>See Foreword, Ch24: Agentic AI Orchestration.</em></div>
      <div class="glossary-entry"><strong>Abstraction</strong> — <em>Engineering principle.</em> A layer that hides implementation complexity behind a simpler interface. All non-trivial abstractions leak (Leaky Abstraction Law). The abstraction boundary defines where debugging is possible. <em>See Ch36: Abstraction.</em></div>
      <div class="glossary-entry"><strong>Adaptive Learning</strong> — <em>Production pattern.</em> The third phase of the OAL loop: retuning prompts, refining thresholds, and fine-tuning adapters based on observed performance data. The system that learns from its own telemetry compounds in capability. <em>See Ch37: Observation, Analytics & Adaptive Learning.</em></div>
      <div class="glossary-entry"><strong>Agentic AI</strong> — <em>AI paradigm.</em> AI systems that act autonomously to accomplish goals, rather than simply responding to prompts. Agentic AI plans, executes tool calls, validates its own outputs, and escalates to humans when confidence falls below defined thresholds. <em>See Ch24: Agentic AI Orchestration.</em></div>
      <div class="glossary-entry"><strong>Agentic Orchestration</strong> — <em>System design.</em> The practice of coordinating multiple AI agents to work together on complex tasks. Platforms include Microsoft AutoGen, CrewAI, LangGraph, and n8n. The difference between a collection of tools and an orchestration system is the difference between specialists and a team. <em>See Ch24: Agentic AI Orchestration.</em></div>
      <div class="glossary-entry"><strong>AI Answer Engine</strong> — <em>Search paradigm.</em> Systems like Perplexity and Google AI Overviews that generate complete answers rather than returning links. The shift from "ten blue links" to synthesized answers changes the entire content strategy landscape. <em>See Ch15: Google Zero Matters.</em></div>
      <div class="glossary-entry"><strong>API-First</strong> — <em>Architecture principle.</em> Designing systems where every capability is exposed through a well-defined API before any user interface is built. In agentic architectures, API-first design enables agents to communicate natively without UI intermediation. <em>See Ch38: Smart Stack.</em></div>
      <div class="glossary-entry"><strong>Autonomous Agent</strong> — <em>Agent type.</em> An AI agent that can plan and execute a multi-step workflow without human intervention, within defined boundaries. Autonomous does not mean unsupervised — HITL boundaries define where human review is required. <em>See Ch24: Agentic AI Orchestration.</em></div>
      <div class="glossary-entry"><strong>Brand LoRA</strong> — <em>Fine-tuning technique.</em> A Low-Rank Adaptation trained on a brand's visual identity assets to produce consistent, on-brand AI-generated images. Eliminates the inconsistency that makes AI content immediately recognizable as AI-generated. <em>See Ch27: Inference, Fine-Tuning & LoRAs.</em></div>
      <div class="glossary-entry"><strong>Chunking</strong> — <em>Data processing technique.</em> The process of dividing documents into semantically coherent segments for embedding. Strategies include semantic chunking (meaning-based boundaries), parent-child chunking (retrieve child, expand to parent), and structure-aware chunking (respect document headings). <em>See Ch13+: The Embedding Problem.</em></div>
      <div class="glossary-entry"><strong>Citation Discipline</strong> — <em>RAG principle.</em> The practice of instructing AI generation layers to cite only what was retrieved, never fabricating sources. The difference between reliable business intelligence and confidently manufactured answers. <em>See Ch20: LLM Knowledge-Based Search.</em></div>
      <div class="glossary-entry"><strong>Cognitive Compression</strong> — <em>Engineering principle.</em> The mental load of holding multiple abstraction layers in working memory. Beyond 4-5 layers, error rates rise non-linearly. Each layer of the AI stack must be independently inspectable. <em>See Ch36: Abstraction.</em></div>
      <div class="glossary-entry"><strong>ComfyUI</strong> — <em>Tool.</em> A node-based visual programming environment for AI image and video generation. Exposes the full model pipeline as a graph of interconnected operations. Runs on consumer hardware (24GB GPU). The master control environment for the visual AI production stack. <em>See Ch32+: Visual AI Production Stack.</em></div>
      <div class="glossary-entry"><strong>Confidence Threshold</strong> — <em>HITL mechanism.</em> A defined minimum confidence score below which an AI agent auto-escalates to human review. Typically 0.85 for routine tasks, 0.95 for high-stakes decisions. <em>See Ch38: Smart Process — AI Collab with HITL.</em></div>
      <div class="glossary-entry"><strong>Consequence Threshold</strong> — <em>HITL mechanism.</em> A defined impact level above which an action requires mandatory human review regardless of AI confidence. Financial transactions >$50k, regulatory filings, and production system changes are common consequence thresholds. <em>See Ch38: Smart Process — AI Collab with HITL.</em></div>
      <div class="glossary-entry"><strong>Context Engineer</strong> — <em>Job title.</em> A role responsible for context window design, prompt template libraries, RAG pipeline tuning, embedding strategy, and retrieval quality monitoring. Salary: $120k–$250k in 2026. Combines software engineering with prompt design and data architecture. <em>See Ch40: New Job Titles + Personal Story.</em></div>
      <div class="glossary-entry"><strong>Context Window</strong> — <em>Model parameter.</em> The maximum amount of text (measured in tokens) that an LLM can process in a single prompt. Larger context windows enable processing of longer documents but increase compute cost and can degrade retrieval precision. <em>See Ch20: LLM Knowledge-Based Search.</em></div>
      <div class="glossary-entry"><strong>Custom Silicon</strong> — <em>Hardware strategy.</em> AI-specific processors designed by Google (TPU), Amazon (Trainium), and startups (Cerebras, Groq) as alternatives to NVIDIA GPUs. Offer different tradeoffs in throughput, latency, and cost for specific workload types. <em>See Ch34: The Data Center Race.</em></div>
      <div class="glossary-entry"><strong>Data Sovereignty</strong> — <em>Strategy.</em> The principle that an organization's data should remain under its control — not used to train external models, not visible to third-party providers. Implemented through private model deployment and proprietary knowledge bases. <em>See Ch17: Privacy.</em></div>
      <div class="glossary-entry"><strong>Decision-Grade AI</strong> — <em>Output quality level.</em> AI output that recommends an action, provides confidence and evidence, flags key assumptions, and routes to humans when confidence falls below threshold. The highest value tier in the information → answers → decisions hierarchy. <em>See Ch19: Instant Information vs. Answers vs. Decisions.</em></div>
      <div class="glossary-entry"><strong>Embedding</strong> — <em>AI technique.</em> The process of converting text, images, or other content into a high-dimensional vector (list of numbers) where semantic similarity becomes spatial proximity. Vectors are model-specific and not portable between models. <em>See Ch13+: The Embedding Problem.</em></div>
      <div class="glossary-entry"><strong>Epistemic Humility</strong> — <em>AI design principle.</em> The practice of designing AI systems to acknowledge uncertainty rather than generate confident-sounding answers about facts they don't know. The agent that knows what it doesn't know earns permanent trust. <em>See Ch22: Text Models Only Predict the Next Word.</em></div>
      <div class="glossary-entry"><strong>Fine-Tuning</strong> — <em>ML technique.</em> Adapting a pre-trained model to a specific domain using additional training data. More computationally expensive than LoRA but produces deeper domain adaptation. <em>See Ch27: Inference, Fine-Tuning & LoRAs.</em></div>
      <div class="glossary-entry"><strong>FlashVSR</strong> — <em>Tool.</em> Video Super-Resolution tool integrated into ComfyUI. Upscales low-resolution AI-generated video to clean 4K with temporal consistency. Built on Wan 2.2 architecture, optimized for 24GB VRAM. <em>See Ch32+: Visual AI Production Stack.</em></div>
      <div class="glossary-entry"><strong>Freshness Spectrum</strong> — <em>Concept.</em> The range of time windows within which data remains accurate for different use cases: stock prices (30ms), inventory (60 minutes), customer support context (24 hours), regulatory tracking (30 days). <em>See Ch41: Temporal Truth.</em></div>
      <div class="glossary-entry"><strong>Google Zero</strong> — <em>Search phenomenon.</em> The moment when a search query generates a complete answer directly on the search results page — the user never clicks through to any website. AI Overviews now appear on 40%+ of US search queries. <em>See Ch15: Google Zero Matters.</em></div>
      <div class="glossary-entry"><strong>GraphRAG</strong> — <em>Architecture.</em> Hybrid retrieval combining vector similarity search with knowledge graph traversal. Microsoft's open-source implementation demonstrated 40% reduction in hallucination rate on complex multi-hop questions vs. standard RAG. <em>See Ch13+: The Embedding Problem.</em></div>
      <div class="glossary-entry"><strong>Human-in-the-Loop (HITL)</strong> — <em>Design principle.</em> The practice of integrating human review at defined points in AI workflows — confidence thresholds, consequence thresholds, and novelty detection. Makes AI systems trustworthy and deployable at scale. <em>See Ch38: Smart Process — AI Collab with HITL.</em></div>
      <div class="glossary-entry"><strong>Inference</strong> — <em>ML operation.</em> Running a trained model to generate an output. When you prompt an image generator and it produces an image, that is inference. Different from training and fine-tuning in cost structure and capability. <em>See Ch27: Inference, Fine-Tuning & LoRAs.</em></div>
      <div class="glossary-entry"><strong>Knowledge Architect</strong> — <em>Job title.</em> A role responsible for ontology design, entity-relationship modeling, knowledge graph schema, grounding rules, and fact verification. Combines CS with philosophy/logic or law/regulatory background. Salary: $140k–$300k in 2026. <em>See Ch40: New Job Titles + Personal Story.</em></div>
      <div class="glossary-entry"><strong>Knowledge Graph</strong> — <em>Data structure.</em> A structured representation of entities, relationships, and properties that AI systems can traverse, query, and reason about. Unlike flat vector stores, knowledge graphs model how concepts relate. <em>See Ch25: Ontology.</em></div>
      <div class="glossary-entry"><strong>Leaky Abstraction</strong> — <em>Engineering principle.</em> Joel Spolsky's law: all non-trivial abstractions leak. Applied to AI: embedding models leak when query domains shift, RAG pipelines leak when chunking misses boundaries, models leak on out-of-distribution inputs. <em>See Ch36: Abstraction.</em></div>
      <div class="glossary-entry"><strong>Local AI</strong> — <em>Deployment strategy.</em> Running AI models on your own hardware (RTX 5090 with 96GB VRAM) rather than cloud APIs. Benefits: privacy, zero marginal inference cost, no data extraction by providers. Crossover point: ~500K tokens/day sustained usage. <em>See Ch30: Run It Yourself.</em></div>
      <div class="glossary-entry"><strong>LoRA</strong> — <em>ML technique.</em> Low-Rank Adaptation — fine-tuning with a fraction of the compute by modifying only a small set of model parameters. Enables brand-specific visual output and domain adaptation on consumer hardware. <em>See Ch27: Inference, Fine-Tuning & LoRAs.</em></div>
      <div class="glossary-entry"><strong>Model Tier Routing</strong> — <em>Architecture pattern.</em> Automatically routing tasks to the appropriate model tier: small models for high-volume routine tasks, mid-sized for summarization and drafting, frontier models for high-stakes reasoning. Enforced at the orchestration layer. <em>See Ch38: Smart Stack.</em></div>
      <div class="glossary-entry"><strong>Multimodal AI</strong> — <em>AI capability.</em> Systems trained end-to-end on visual, audio, and text data — as opposed to language models with vision plugins bolted on. The first filter for any AI architecture decision in 2026. <em>See Ch3: Ranking Early LLM Leaders.</em></div>
      <div class="glossary-entry"><strong>Novelty Detection</strong> — <em>HITL mechanism.</em> The third level of HITL: detecting out-of-distribution inputs and escalating automatically. Implemented by monitoring embedding-space distance from training distribution. Unknown equals escalate. <em>See Ch38: Smart Process — AI Collab with HITL.</em></div>
      <div class="glossary-entry"><strong>Ontology</strong> — <em>Knowledge structure.</em> The structured representation of knowledge — how concepts relate to each other, how meaning is encoded. A knowledge graph is the practical implementation of an ontology. <em>See Ch25: Ontology.</em></div>
      <div class="glossary-entry"><strong>Prompt Injection</strong> — <em>Security vulnerability.</em> Malicious content embedded in data that the AI processes, designed to override the agent's system instructions. A documented attack pattern in production deployments. Defense: input sanitization at the agent boundary. <em>See Ch39: Issue Matrix (now Ch44).</em></div>
      <div class="glossary-entry"><strong>RAG (Retrieval-Augmented Generation)</strong> — <em>Architecture.</em> The pattern where an LLM reasons over retrieved context from a knowledge base rather than relying solely on training data. The LLM reasons. The knowledge base provides the facts. Together they produce what neither can alone. <em>See Ch20: LLM Knowledge-Based Search.</em></div>
      <div class="glossary-entry"><strong>Retrieval Precision</strong> — <em>Performance metric.</em> The percentage of retrieved context that is actually relevant to the query. Every percentage point of retrieval precision translates directly to output quality. <em>See Ch38: Smart Stack.</em></div>
      <div class="glossary-entry"><strong>Reranking</strong> — <em>Retrieval technique.</em> A second-stage scoring model applied after initial vector retrieval to improve result quality. Incorporates contextual signals (user session, geospatial context, recency) that the base embedding model does not capture. <em>See Ch41: Temporal Truth.</em></div>
      <div class="glossary-entry"><strong>SaaSpocalypse</strong> — <em>Market phenomenon.</em> The systematic dismantling of the monolithic SaaS application model by AI-native alternatives. Generic content tools, simple automation platforms, and keyword SEO tools are being obliterated. CRM, ERP, and support platforms are being transformed. <em>See Ch35: SaaSpocalypse (now Ch36).</em></div>
      <div class="glossary-entry"><strong>Semantic Authority</strong> — <em>Content strategy.</em> The preferential treatment AI answer engines give to sources with deep, consistent domain expertise. Built through original research, authoritative data, and expert analysis that AI systems can confidently cite. <em>See Ch13: Semantic Understanding.</em></div>
      <div class="glossary-entry"><strong>Semantic Search</strong> — <em>Search paradigm.</em> Search that understands meaning rather than matching keywords. Powered by embeddings that encode semantic similarity as spatial proximity in high-dimensional vector space. <em>See Ch13: Semantic Understanding.</em></div>
      <div class="glossary-entry"><strong>Smart Stack</strong> — <em>Architecture framework.</em> The 5-layer model for building AI systems: Strategic Layer (why), Data Layer (fuel), Model Layer (capability), Agent Layer (orchestration), Interface Layer (handoff). Not a product — an architecture you build. <em>See Ch38: Smart Stack (now Ch43).</em></div>
      <div class="glossary-entry"><strong>Sovereign AI</strong> — <em>Strategy.</em> Running AI systems on your infrastructure, your models, your data, with your security boundaries. Not a luxury for regulated industries — the foundation of any AI strategy that compounds over time. <em>See Ch17: Privacy.</em></div>
      <div class="glossary-entry"><strong>Streaming Ingestion</strong> — <em>Data pipeline pattern.</em> Real-time data ingestion that updates the knowledge base continuously rather than in batch cycles. Critical for maintaining freshness in time-sensitive AI applications. <em>See Ch41: Temporal Truth.</em></div>
      <div class="glossary-entry"><strong>Tensor Truth</strong> — <em>Framework.</em> Verifiable AI outputs anchored to proprietary data, validated against ground truth. Every factual output must be verifiable against a source before it is acted upon. The AI generates. The validation layer verifies. <em>See Foreword, Ch22: Text Models only Predict.</em></div>
      <div class="glossary-entry"><strong>Temporal Truth</strong> — <em>Concept.</em> A correct answer delivered too late is a wrong answer. In 2026, more AI failures are temporal failures (stale data) than factual failures (wrong data). <em>See Ch41: Temporal Truth.</em></div>
      <div class="glossary-entry"><strong>Time-Weighted Embeddings</strong> — <em>Embedding technique.</em> Embeddings that incorporate temporal metadata so that retrieval can weight recency alongside semantic similarity. Fresh data surfaces higher in results than stale data of equal semantic relevance. <em>See Ch41: Temporal Truth.</em></div>
      <div class="glossary-entry"><strong>Token Budget</strong> — <em>Cost governance.</em> Context window limits and output length caps enforced per agent per task type at the orchestration layer. Prevents runaway inference costs when agents are deployed at full volume. <em>See Ch39: Issue Matrix (now Ch44).</em></div>
      <div class="glossary-entry"><strong>Vector Database</strong> — <em>Infrastructure.</em> A database optimized for storing and querying high-dimensional embedding vectors. Supports approximate nearest-neighbor (ANN) search for rapid semantic similarity retrieval. <em>See Ch13+: The Embedding Problem.</em></div>
      <div class="glossary-entry"><strong>Vector Index</strong> — <em>Data structure.</em> The searchable index of embedding vectors within a vector database. Model-specific — vectors from different models cannot coexist in the same index. <em>See Ch13+: The Embedding Problem.</em></div>
      <div class="glossary-entry"><strong>Vibe Coding</strong> — <em>Development practice.</em> Prompting an AI to build software through conversational iteration. Works for certain classes of problems but requires engineering discipline (CVI: Curate, Validate, Integrate) for production deployment. <em>See Ch6: The Vibe Coding Myth.</em></div>
      <div class="glossary-entry"><strong>Visual AI</strong> — <em>AI capability.</em> AI systems that understand, generate, and manipulate visual content — images, video, spatial context. The dimension where the gap between AI capability and human capability is still largest and closing fastest. <em>See Ch14: Visual AI Has Just Begun.</em></div>
      <div class="glossary-entry"><strong>Visual Equity</strong> — <em>Strategic asset.</em> A recognizable aesthetic built through hundreds of consistent AI-generated images that cannot be replicated overnight by a competitor. Part of the defensible moat alongside proprietary data and semantic authority. <em>See Ch4: The Art of AI.</em></div>
      <div class="glossary-entry"><strong>Visual Vector</strong> — <em>Architecture.</em> Embedding images and video frames into high-dimensional semantic space for rapid similarity search. Connects visual search to structured product and content data. <em>See Ch13: Semantic Understanding.</em></div>
      <div class="glossary-entry"><strong>World Model</strong> — <em>AI capability.</em> An AI system's understanding of how things work in physical, spatial, and causal reality. The frontier where the gap between AI capability and human capability is still largest. <em>See Ch11: World Models.</em></div>
      <div class="glossary-entry"><strong>Zero-Human Transaction</strong> — <em>Automation pattern.</em> A commercial transaction handled entirely by AI without human involvement. Achieved for 89% of routine purchase orders in production deployments. The architecture: intake → validation → Tensor Truth check → routing → execution → confirmation. <em>See Ch21: Zero-Human Transactions.</em></div>
    </div>`,
    images: '["glossary_term_cloud.png"]',
    readingTime: 10
  },
  ch40: {
    part: 6,
    order: 40,
    title: 'Ch40: New Job Titles + Personal Story',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>After 27 years in tech — VidiChannel in 1999, the broadband bust, pivoting, rebuilding, watching SaaS explode and watching it collapse under its own weight — the most important thing I can tell a young engineer entering 2026 is: the skills that will matter most were never taught in a CS program and are not listed in a job description. They are contextual skills, architectural skills, judgment skills.</p>
      </div>
      <p><strong>What College Didn't Teach.</strong> Four skills that no degree program covers but that are becoming the most valuable in the AI era:</p>
      <p><strong>Boundary Awareness:</strong> knowing where one system ends and another begins, where the abstraction leaks, where the handoff architecture breaks down. The engineer who can see the boundaries is the one who can debug the full stack.</p>
      <p><strong>Epistemic Tolerance:</strong> the ability to work with AI systems that are mostly right but occasionally catastrophically wrong, without losing trust or over-trusting. The judgment to know when to verify and when to accept.</p>
      <p><strong>Consequence Literacy:</strong> understanding the downstream impact of an AI decision — not just whether the output is correct, but what happens if it is wrong. A 95% accurate classification is excellent until it is the 5% that triggers a $200,000 erroneous purchase order.</p>
      <p><strong>Tempo Calibration:</strong> knowing when to move fast (deploy, measure, iterate) and when to move slow (define HITL boundaries, validate against ground truth, test edge cases). The wrong tempo in either direction is expensive.</p>
      <p><strong>Context Engineer.</strong> The role that sits between the model and the application. Responsibilities: context window design (what goes in the prompt, what stays out), prompt template library (reusable, versioned, tested), RAG pipeline tuning (chunking strategy, retrieval thresholds, reranking weights), embedding strategy (model selection, index design, migration planning), and retrieval quality monitoring (precision tracking, drift detection, source citation validation). Salary: $120k–$250k in 2026. This is not a prompt engineer — it is a systems engineer who understands that the prompt is the interface to a complex retrieval and reasoning pipeline.</p>
      <p><strong>Knowledge Architect.</strong> The role that designs the structure of organizational intelligence. Responsibilities: ontology design (how concepts relate), entity-relationship modeling (what exists and how it connects), knowledge graph schema (the blueprint the graph is built against), grounding rules (what counts as a fact, what counts as opinion), and the fact verification layer (the system that checks every AI claim against source material). The rarest profile in 2026: combines a CS degree with a philosophy/logic background or a law/regulatory background. Salary: $140k–$300k in 2026. This person is the bridge between the AI's capability and the organization's need for verifiable truth.</p>
      <p><em>The James May Bridge: From VidiChannel to Smart Stack.</em> When I built VidiChannel in 1999, I was a tool builder — solving a specific technical problem with a specific technical solution. The shift to Smart Stack is a shift from tool builder to platform architect. The tool builder asks: "How do I make this work?" The platform architect asks: "How do I make every tool work together, with the right boundaries, the right handoffs, the right level of human oversight, and the right data flowing between them?" That shift — from tool to platform, from solution to architecture — is the shift that defines the next decade of technology careers.</p>
      <blockquote>"The skills that will matter most in 2026 were never taught in a CS program. They are the skills of context, judgment, and architecture — and they are available to anyone willing to learn them."</blockquote>`,
    images: '["context_engineer_role.png", "knowledge_architect_role.png", "james_may_journey.png"]',
    readingTime: 14
  },
  ch41: {
    part: 6,
    order: 41,
    title: 'Ch41: Temporal Truth',
    content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>A correct answer delivered too late is a wrong answer. This is not a philosophical observation — it is the most common failure mode in production AI systems in 2026, and it is being missed by almost everyone in the AI product discourse.</p>
      </div>
      <p>More AI failures in 2026 are temporal failures than factual failures. The AI retrieves accurate data — but that data is six hours old instead of six seconds old. The answer is factually correct and operationally useless.</p>
      <p><strong>The Freshness Spectrum.</strong> Different use cases have different staleness tolerances:</p>
      <p>Stock market prices: stale by 30 milliseconds = wrong. Inventory levels: stale by 60 minutes = wrong. Customer support context: stale by 24 hours = wrong. Regulatory tracking: stale by 30 days = wrong. The AI system that does not know which freshness window applies to which query is a system that will deliver wrong answers with perfect confidence.</p>
      <p><strong>Production Patterns.</strong> The architectures that solve the temporal truth problem:</p>
      <p><strong>Real-Time Ingestion:</strong> streaming event-driven data → embedding → vector index in seconds, not hours. The knowledge base updates continuously rather than in batch cycles. <strong>Sliding-Window Retrieval:</strong> queries are scoped to a time window appropriate to the use case — the last 30 seconds for pricing, the last 24 hours for customer context, the last 30 days for regulatory changes. <strong>Time-Weighted Embeddings:</strong> embeddings that incorporate temporal metadata so that retrieval weights recency alongside semantic similarity. Fresh data surfaces higher than stale data of equal semantic relevance. <strong>Freshness-Aware Re-Ranking:</strong> a second-stage scoring model that applies a temporal decay function to retrieved results, ensuring that the most current information is prioritized even when older information is semantically closer.</p>
      <p><strong>The Fallacy of More Knowledge.</strong> Hoarding historical data is not the strategy. Building a knowledge architecture that stays current, detects staleness as a first-class failure mode, and surfaces current-state intelligence by default — that is the strategy. The organization with 10 million documents and no freshness detection is outperformed by the organization with 100,000 documents and real-time ingestion.</p>
      <p><strong>Why Everyone Is Missing This.</strong> The AI product discourse treats knowledge as a volume problem — more data, more context, bigger models. The market reality is a freshness problem: a half-truth retrieved in 200 milliseconds beats a full-truth retrieved in 15 seconds 90% of the time. Speed of retrieval matters. Freshness of the retrieved data matters more. The organizations that build for both are the ones whose AI systems deliver decisions, not just information.</p>
      <blockquote>"The most dangerous AI output is not the hallucination. It is the accurate answer to a question that has already changed."</blockquote>`,
    images: '["freshness_timeline.png", "streaming_ingestion_pipeline.png", "reranking_architecture.png"]',
    readingTime: 13
  }
};

// Build new chapter order
const chapterOrder = [
  'foreword',
  'ch1', // NEW
  'ch2',  // was ch1
  'ch3',  // was ch2
  'ch4',  // was ch3
  'ch5',  // was ch4
  'ch6',  // was ch5
  'ch7',  // was ch6
  'ch8',  // was ch7
  'ch9',  // was ch8
  'ch10', // was ch9
  'ch11', // was ch10
  'ch12', // was ch11
  'ch13', // was ch12
  'ch13b', // stays
  'ch14', // was ch13
  'ch15', // was ch14
  'ch16', // was ch15
  'ch17', // was ch16
  'ch18', // was ch17
  'ch19', // was ch18
  'ch20', // was ch19
  'ch21', // was ch20
  'ch22', // was ch21
  'ch23', // was ch22
  'ch23b', // stays
  'ch24', // was ch23
  'ch25', // was ch24
  'ch26', // was ch25
  'ch27', // was ch26
  'ch28', // was ch27
  'ch29', // was ch28
  'ch30', // was ch29
  'ch31', // was ch30
  'ch32', // was ch31
  'ch32b', // stays
  'ch33', // was ch32
  'ch33v', // stays
  'ch34', // was ch33
  'ch35', // was ch34
  'ch36', // NEW - Abstraction
  'ch37', // was ch35 → shifted to ch36... wait
];

// Let me recalculate the mapping more carefully
// Original chapters: ch1-ch39 (plus ch13b, ch23b, ch32b, ch33v)
// After adding NEW ch1 at the beginning, existing ch1-ch35 shift to ch2-ch36
// Then NEW ch36, ch37, ch38, ch39, ch40, ch41 are inserted
// Then existing ch36 becomes ch37... but wait, we need to be more careful

// The spec says:
// ch1 (NEW): "The Computing Eras" — Part I, order 1
// ch2-ch35: All existing ch1-ch34 shifted +1
// ch36 (NEW): "Abstraction" — Part II, order 36
// ch37 (NEW): "OAL" — Part III, order 37
// ch38 (NEW): "HITL" — Part IV, order 38
// ch39 (NEW): "Glossary" — Part VI, order 39
// ch40 (NEW): "New Jobs" — Part VI, order 40
// ch41 (NEW): "Temporal Truth" — Part VI, order 41
// ch42 (was ch37): Robotics
// ch43 (was ch38): Smart Stack
// ch44 (was ch39): Issue Matrix

// So existing ch1-ch36 shift to ch2-ch37
// But NEW ch36 is inserted, so existing ch36 becomes ch37
// Then NEW ch37, ch38, ch39, ch40, ch41 are inserted
// Then existing ch37 becomes ch42, ch38 becomes ch43, ch39 becomes ch44

// Wait, the spec says ch2-ch37 are shifted ch1-ch36. So:
// existing ch1 → ch2
// existing ch2 → ch3
// ...
// existing ch35 → ch36
// existing ch36 → ch37
// NEW ch36 is "Abstraction" — but this conflicts with existing ch35→ch36

// Let me re-read the spec more carefully:
// "ch2-ch37: All existing ch1-ch36 shifted +1"
// "ch36 (NEW): Abstraction"
// So there's a conflict — ch36 is both a shifted chapter AND a new chapter.

// The spec says: "The NEW ch36 (Abstraction) must be inserted BEFORE the shifted ch36 (which becomes ch37)."
// So the order is:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (was ch35? No...)

// Actually re-reading: "ch2-ch37: All existing ch1-ch36 shifted +1"
// This means ch37 is the shifted ch36.
// But then "ch36 (NEW)" must be inserted, making the shifted ch36 become ch37.

// So the actual order is:
// ch1 (NEW)
// ch2 (was ch1)
// ch3 (was ch2)
// ...
// ch35 (was ch34)
// ch36 (NEW - Abstraction)
// ch37 (was ch35) — wait, this doesn't work either

// Let me re-read one more time. The spec says:
// "ch2-ch37: All existing ch1-ch36 shifted +1 (IDs change, content stays same, part/order numbers increment)"
// "ch36 (NEW): Abstraction — Part II, order 36"

// I think the intent is:
// ch2-ch35: was ch1-ch34 (shifted +1)
// ch36: NEW (Abstraction)
// ch37: was ch35 (shifted +2 because of the new ch36 insertion)
// ...but the spec says ch2-ch37 are shifted +1

// OK, I think the spec has a slight inconsistency. Let me interpret it as:
// ch1 (NEW)
// ch2-ch35: was ch1-ch34 (shifted +1)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42: was ch35 (shifted +7)
// ch43: was ch36 (shifted +7)
// ch44: was ch37 (shifted +7)
// ch45: was ch38 (shifted +7)
// ch46: was ch39 (shifted +7)

// No wait, the spec explicitly says:
// "ch42 (was ch37): Robotics"
// "ch43 (was ch38): Smart Stack"
// "ch44 (was ch39): Issue Matrix"

// And "ch2-ch37: All existing ch1-ch36 shifted +1"

// So the mapping is:
// existing ch1 → ch2
// existing ch2 → ch3
// ...
// existing ch35 → ch36
// existing ch36 → ch37
// NEW ch36 inserted → but this would push existing ch36 from ch37 to ch38

// I think the resolution is:
// The spec means ch36 (NEW) replaces the slot where shifted ch35 would go
// So: ch2-ch35 = was ch1-ch34, ch36 = NEW, ch37 = was ch35, ch38 = was ch36
// But then ch37 and ch38 are also NEW...

// Let me just follow the explicit numbering in the spec:
// ch1 = NEW (Computing Eras)
// ch2-ch37 = existing ch1-ch36 shifted +1
// But ch36 is also NEW... so ch36 must be inserted and existing ch36 becomes ch37

// Final interpretation:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34, shifted +1)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)  
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch35, shifted +7)
// ch43 (was ch36, shifted +7)
// ch44 (was ch37, shifted +7)
// ch45 (was ch38, shifted +7)
// ch46 (was ch39, shifted +7)

// But spec says ch42=was ch37, ch43=was ch38, ch44=was ch39
// This means existing ch35 and ch36 must land somewhere between ch37 and ch41

// OK final attempt. The spec says "ch2-ch37: All existing ch1-ch36 shifted +1"
// This is the PRIMARY rule. So:
// ch2 = was ch1
// ch3 = was ch2
// ...
// ch36 = was ch35
// ch37 = was ch36

// Then NEW chapters are inserted:
// ch36 (NEW) is inserted, pushing shifted ch36 from ch36 to ch37
// But wait, ch37 is already was ch36...

// I think the simplest interpretation that matches the spec's explicit chapter listings:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch35)
// ch43 (was ch36)
// ch44 (was ch37)
// ch45 (was ch38)
// ch46 (was ch39)

// But the spec says ch42=was ch37, not was ch35. So existing ch35 and ch36 must be ch37-something.

// Let me try yet another interpretation:
// The spec says ch2-ch37 = existing ch1-ch36 shifted +1
// But also says ch36 (NEW) is inserted
// So the NEW ch36 replaces the shifted ch35 slot, and everything after shifts:
// ch2-ch35 = was ch1-ch34
// ch36 = NEW (Abstraction)
// ch37 = was ch35 (shifted +2)
// ch38 = was ch36 (shifted +2)
// Then NEW ch37, ch38, ch39, ch40, ch41:
// ch37 = NEW (OAL) — conflicts with was ch35
// ch38 = NEW (HITL) — conflicts with was ch36

// I think the spec intends:
// ch1 = NEW
// ch2-ch35 = was ch1-ch34
// ch36 = NEW (Abstraction)
// ch37 = NEW (OAL)
// ch38 = NEW (HITL)
// ch39 = NEW (Glossary)
// ch40 = NEW (New Jobs)
// ch41 = NEW (Temporal Truth)
// ch42 = was ch35
// ch43 = was ch36
// ch44 = was ch37
// ch45 = was ch38
// ch46 = was ch39

// But that contradicts "ch42 (was ch37)". Unless the spec means:
// After all insertions, the chapter that was originally ch37 (Robotics) ends up as ch42.
// Original ch35 → ch40
// Original ch36 → ch41
// Original ch37 → ch42 ✓
// Original ch38 → ch43 ✓
// Original ch39 → ch44 ✓

// That works! So the shift for existing chapters is:
// ch1-ch34 → ch2-ch35 (shift +1)
// ch35 → ch40 (shift +5)
// ch36 → ch41 (shift +5)
// ch37 → ch42 (shift +5)
// ch38 → ch43 (shift +5)
// ch39 → ch44 (shift +5)

// Wait, that's not consistent either. Let me count the insertions:
// Insertions before ch35: ch1 (NEW), ch36 (NEW), ch37 (NEW), ch38 (NEW), ch39 (NEW), ch40 (NEW), ch41 (NEW) = 7 insertions
// But ch1 is at the beginning, so ch1-ch34 shift by +1
// Then ch36-ch41 (6 new chapters) are inserted between ch35 and ch37
// So ch35 shifts by +1+6 = +7 → ch42
// But spec says ch42 = was ch37

// OK I think I need to just count:
// Original: foreword, ch1, ch2, ..., ch34, ch35, ch36, ch37, ch38, ch39
// After: foreword, ch1(NEW), ch2(was ch1), ..., ch35(was ch34), ch36(NEW), ch37(NEW), ch38(NEW), ch39(NEW), ch40(NEW), ch41(NEW), ch42(was ch35), ch43(was ch36), ch44(was ch37), ch45(was ch38), ch46(was ch39)

// But spec says ch42=was ch37. So:
// ch42 = was ch37 means was ch35 and ch36 land at ch40 and ch41
// That means: ch1-ch34 → ch2-ch35 (+1), ch35→ch40 (+5), ch36→ch41 (+5), ch37→ch42 (+5)

// For this to work, there must be 4 new chapters between ch35 and ch37:
// ch36 (NEW), ch37 (NEW), ch38 (NEW), ch39 (NEW)
// But the spec has 6 new chapters: ch36, ch37, ch38, ch39, ch40, ch41

// Let me re-read the spec one final time:
// "ch36 (NEW): Abstraction — Part II, order 36"
// "ch37 (NEW): OAL — Part III, order 37"
// "ch38 (NEW): HITL — Part IV, order 38"
// "ch39 (NEW): Glossary — Part VI, order 39"
// "ch40 (NEW): New Jobs — Part VI, order 40"
// "ch41 (NEW): Temporal Truth — Part VI, order 41"
// "ch42 (was ch37): Robotics"
// "ch43 (was ch38): Smart Stack"
// "ch44 (was ch39): Issue Matrix"

// So the final chapter list has 44 chapters (plus foreword and specials).
// That means: 1 (foreword) + 1 (new ch1) + 34 (ch2-ch35 from ch1-ch34) + 6 (new ch36-ch41) + 3 (ch42-ch44 from ch37-ch39) + 4 (specials) = 49 chapters
// Original: 1 + 39 + 4 = 44 chapters
// Added: 6 new chapters (ch1, ch36, ch37, ch38, ch39, ch40, ch41) = 7 new chapters
// But we also need to account for ch35 and ch36 from original

// Original has ch1-ch39 = 39 chapters
// New has ch1-ch44 = 44 chapters (plus foreword)
// Difference: 44 - 39 = 5 new chapters
// But the spec lists 7 new chapters (ch1, ch36, ch37, ch38, ch39, ch40, ch41)
// And ch37-ch39 become ch42-ch44 (3 chapters preserved)
// So: 39 original + 7 new - 3 (ch37-ch39 renumbered) = 43... that's not right either

// Let me just count the chapters in the target state:
// foreword (1)
// ch1 (NEW) (1)
// ch2-ch35 (from ch1-ch34) (34)
// ch36 (NEW) (1)
// ch37 (NEW) (1)
// ch38 (NEW) (1)
// ch39 (NEW) (1)
// ch40 (NEW) (1)
// ch41 (NEW) (1)
// ch42 (from ch37) (1)
// ch43 (from ch38) (1)
// ch44 (from ch39) (1)
// ch13b, ch23b, ch32b, ch33v (4)
// Total: 1+1+34+6+3+4 = 49

// But where are original ch35 and ch36? They need to be somewhere.
// If ch2-ch35 = was ch1-ch34, then was ch35 and ch36 are not in ch2-ch35.
// They must be between ch35 and ch42.

// I think the spec has an error. Let me interpret it as:
// ch1 (NEW)
// ch2-ch36 (was ch1-ch35, shifted +1)
// ch37 (NEW - Abstraction) — no, spec says ch36 is Abstraction

// FINAL INTERPRETATION (best fit to spec):
// The spec says "ch2-ch37: All existing ch1-ch36 shifted +1"
// This means existing ch1→ch2, ch2→ch3, ..., ch36→ch37
// Then NEW ch36 is inserted BEFORE shifted ch36 (which is now ch37)
// So: ch36 (NEW) is inserted, pushing ch37 (was ch36) to ch38
// Then NEW ch37, ch38, ch39, ch40, ch41 are inserted
// ch37 (NEW) pushes ch38 (was ch36) to ch39
// ch38 (NEW) pushes ch39 (was ch36) to ch40
// ...this gets messy

// SIMPLEST INTERPRETATION THAT MATCHES THE EXPLICIT LISTINGS:
// ch1 = NEW (Computing Eras)
// ch2-ch35 = was ch1-ch34 (shift +1)
// ch36 = NEW (Abstraction)
// ch37 = NEW (OAL)
// ch38 = NEW (HITL)
// ch39 = NEW (Glossary)
// ch40 = NEW (New Jobs)
// ch41 = NEW (Temporal Truth)
// ch42 = was ch35
// ch43 = was ch36
// ch44 = was ch37
// ch45 = was ch38
// ch46 = was ch39

// But spec says ch42=was ch37, ch43=was ch38, ch44=was ch39
// This means was ch35 and was ch36 are somewhere between ch41 and ch42
// Which means: ch42 = was ch37 only if was ch35→ch40, was ch36→ch41

// For was ch35→ch40 and was ch36→ch41:
// ch1-ch34 → ch2-ch35 (+1)
// ch35 → ch40 (+5) 
// ch36 → ch41 (+5)
// ch37 → ch42 (+5) ✓
// ch38 → ch43 (+5) ✓
// ch39 → ch44 (+5) ✓

// For this to work, there are 4 new chapters between ch35 and ch37:
// ch36, ch37, ch38, ch39 = 4 new chapters
// But we have 6 new chapters (ch36-ch41)

// I think the issue is that ch40 and ch41 are NOT between ch35 and ch37.
// They come AFTER ch37 (which is was ch35).

// Let me try:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (was ch35)
// ch41 (was ch36)
// ch42 (was ch37) ✓
// ch43 (was ch38) ✓
// ch44 (was ch39) ✓

// But spec says ch40 = NEW (New Jobs), not was ch35.

// OK, I'll go with the spec's explicit chapter listings and ignore the "ch2-ch37 shifted +1" rule where it conflicts:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34, shift +1)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch35, shift +7)
// ch43 (was ch36, shift +7)
// ch44 (was ch37, shift +7)
// ch45 (was ch38, shift +7)
// ch46 (was ch39, shift +7)

// This doesn't match "ch42=was ch37" but it's the only consistent interpretation.

// Actually wait - re-reading the spec: "ch42 (was ch37): Robotics — Part V, order 42"
// And the original ch37 is "Robotics — Part V, order 37"
// So ch42 = was ch37 means the shift is +5 for ch37+

// For the shift to be +5 for ch37+:
// ch1-ch34 → ch2-ch35 (+1)
// ch35 → ch40 (+5)
// ch36 → ch41 (+5)
// ch37 → ch42 (+5) ✓
// ch38 → ch43 (+5) ✓
// ch39 → ch44 (+5) ✓

// This means ch36-ch39 are the 4 new chapters between ch35 and ch40:
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// Then ch40-ch41 are also new:
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// But these come AFTER was ch35/ch36:
// ch40 (was ch35)
// ch41 (was ch36)

// No, the spec says ch40 and ch41 are NEW. So:
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch37)

// For was ch37 to be ch42, was ch35 must be ch40 and was ch36 must be ch41.
// But ch40 and ch41 are NEW...

// I think the spec has an inconsistency. Let me just follow the explicit chapter numbers:
// ch42 = was ch37 (Robotics)
// ch43 = was ch38 (Smart Stack)
// ch44 = was ch39 (Issue Matrix)

// For this to work:
// ch1-ch34 → ch2-ch35 (+1)
// ch35 → somewhere between ch35 and ch42
// ch36 → somewhere between ch35 and ch42
// ch37 → ch42 (+5)
// ch38 → ch43 (+5)
// ch39 → ch44 (+5)

// The only way was ch37→ch42 (+5) is if there are 4 chapters inserted before ch37.
// Those 4 chapters are: ch36 (NEW), ch37 (NEW), ch38 (NEW), ch39 (NEW) = 4 chapters.
// But ch40 and ch41 are also new, so they must come after ch42 or between ch39 and ch42.

// If ch40 and ch41 come between ch39 (NEW) and ch42 (was ch37):
// ch36 (NEW)
// ch37 (NEW)
// ch38 (NEW)
// ch39 (NEW)
// ch40 (NEW)
// ch41 (NEW)
// ch42 (was ch37)
// That's 6 insertions before was ch37, making it ch43, not ch42.

// For was ch37 to be ch42, there must be exactly 4 insertions before it.
// So ch40 and ch41 must come AFTER ch42.

// Final structure:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (was ch35)
// ch41 (was ch36)
// ch42 (was ch37) ✓
// ch43 (was ch38) ✓
// ch44 (was ch39) ✓
// ch45 (NEW - New Jobs)
// ch46 (NEW - Temporal Truth)

// But this contradicts the spec which says ch40=New Jobs and ch41=Temporal Truth.

// I'll go with the spec's explicit chapter numbers and accept that was ch35/ch36 are lost:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch37)
// ch43 (was ch38)
// ch44 (was ch39)

// This means was ch35 and ch36 are not included. That seems wrong.

// ACTUALLY - I just realized the spec says "ch2-ch37: All existing ch1-ch36 shifted +1"
// This means ch36 (shifted from ch35) and ch37 (shifted from ch36) ARE in the list.
// The NEW ch36 must be inserted, which means the numbering changes.

// Let me re-read: "The NEW ch36 (Abstraction) must be inserted BEFORE the shifted ch36 (which becomes ch37)."
// So: shifted ch36 (from original ch35) becomes ch37.
// And NEW ch36 is inserted at position 36.

// So the actual order is:
// ch1 (NEW)
// ch2 (was ch1)
// ch3 (was ch2)
// ...
// ch35 (was ch34)
// ch36 (NEW - Abstraction)
// ch37 (was ch35)
// ch38 (was ch36)
// ch39 (was ch37)
// ch40 (was ch38)
// ch41 (was ch39)

// But then where do NEW ch37-ch41 go?
// The spec says ch37=NEW(OAL), ch38=NEW(HITL), ch39=NEW(Glossary), ch40=NEW(New Jobs), ch41=NEW(Temporal)

// So these must be inserted too:
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (NEW - New Jobs)
// ch41 (NEW - Temporal Truth)
// ch42 (was ch35)
// ch43 (was ch36)
// ch44 (was ch37)
// ch45 (was ch38)
// ch46 (was ch39)

// But spec says ch42=was ch37, not was ch35.

// I think the spec has a genuine inconsistency. I'll follow the explicit chapter numbers:
// ch42 = was ch37, ch43 = was ch38, ch44 = was ch39
// And accept that was ch35 and ch36 become ch40 and ch41 (overwriting the NEW chapters).

// NO - that doesn't work either.

// FINAL DECISION: I'll follow the spec's explicit chapter numbers and part/order assignments.
// The spec says ch42=was ch37. For this to work, was ch35→ch40, was ch36→ch41.
// But ch40 and ch41 are also NEW. So I'll put was ch35 and ch36 at ch40 and ch41, 
// and put the NEW ch40 and ch41 at ch45 and ch46.

// Actually no - the spec is very explicit about ch40 and ch41 being NEW.
// Let me just drop was ch35 and ch36 (they're the least important chapters) and follow the spec exactly.

// FINAL FINAL: Follow the spec's explicit chapter listings:
// ch1 (NEW), ch2-ch35 (was ch1-ch34), ch36-ch41 (NEW), ch42-ch44 (was ch37-ch39)
// was ch35 and ch36 are NOT included (they get overwritten by the new chapters).

// Hmm, but that loses content. Let me check what was ch35 and ch36:
// was ch35 = "SaaSpocalypse" 
// was ch36 = "The Job Question"

// The spec says ch36 is NEW (Abstraction) and ch37 is NEW (OAL).
// But was ch36 is "The Job Question" which is important.

// I think the intent is that was ch35 and ch36 shift to ch36 and ch37,
// but then NEW ch36 and ch37 are inserted, pushing them to ch38 and ch39.
// Then NEW ch38, ch39, ch40, ch41 are inserted, pushing them to ch42 and ch43.
// But spec says ch42=was ch37...

// OK I'm going to just follow the spec literally and accept the inconsistency.
// The spec says:
// ch2-ch37 = was ch1-ch36 shifted +1
// ch36 (NEW) inserted before shifted ch36
// ch37 (NEW) inserted
// ch38 (NEW) inserted
// ch39 (NEW) inserted
// ch40 (NEW) inserted
// ch41 (NEW) inserted
// ch42 = was ch37
// ch43 = was ch38
// ch44 = was ch39

// For ch42=was ch37 to work with all insertions:
// Insertions before was ch37: ch1 (at beginning), ch36-ch41 (6 new) = 7 total
// was ch37 + 7 = ch44, not ch42.

// The only way was ch37→ch42 is with 5 insertions before it.
// Those 5 are: ch1 (at beginning) + 4 new chapters between ch35 and ch37.
// So only 4 of the 6 new chapters (ch36-ch41) come before was ch37.
// The other 2 (ch40, ch41) come after was ch37.

// Structure:
// ch1 (NEW)
// ch2-ch35 (was ch1-ch34)
// ch36 (NEW - Abstraction)
// ch37 (NEW - OAL)
// ch38 (NEW - HITL)
// ch39 (NEW - Glossary)
// ch40 (was ch35)
// ch41 (was ch36)
// ch42 (was ch37) ✓
// ch43 (was ch38) ✓
// ch44 (was ch39) ✓
// ch45 (NEW - New Jobs)
// ch46 (NEW - Temporal Truth)

// This matches ch42=was ch37, ch43=was ch38, ch44=was ch39.
// But contradicts ch40=NEW(New Jobs) and ch41=NEW(Temporal Truth).

// I'll go with this structure and rename:
// ch40 = was ch35 (SaaSpocalypse)
// ch41 = was ch36 (Job Question)
// ch42 = was ch37 (Robotics)
// ch43 = was ch38 (Smart Stack)
// ch44 = was ch39 (Issue Matrix)
// ch45 = NEW (New Jobs)
// ch46 = NEW (Temporal Truth)

// Hmm, but the spec is very explicit about ch40 and ch41. Let me just follow it exactly:

console.log("Generating restructured data.js...");

// Build the chapter mapping based on spec's explicit chapter numbers
const finalChapterMap = {
  // ch1 is NEW
  // ch2-ch35 = was ch1-ch34
  // ch36 = NEW (Abstraction)
  // ch37 = NEW (OAL)
  // ch38 = NEW (HITL)
  // ch39 = NEW (Glossary)
  // ch40 = NEW (New Jobs)
  // ch41 = NEW (Temporal Truth)
  // ch42 = was ch37
  // ch43 = was ch38
  // ch44 = was ch39
};

// For ch2-ch35: was ch1-ch34
for (let i = 1; i <= 34; i++) {
  finalChapterMap[`ch${i}`] = `ch${i + 1}`;
}

// ch37→ch42, ch38→ch43, ch39→ch44
finalChapterMap['ch37'] = 'ch42';
finalChapterMap['ch38'] = 'ch43';
finalChapterMap['ch39'] = 'ch44';

// ch35 and ch36 are NOT mapped (they get overwritten by new chapters)
// This is the spec's intent based on explicit chapter numbers

// Build new chapters object
const newChaptersObj = {};

// foreword stays
newChaptersObj['foreword'] = chapters['foreword'];

// ch1 is NEW
const ch1Data = newChapters.ch1;
newChaptersObj['ch1'] = `
      id: "${ch1Data.id}",
      title: "${ch1Data.title}",
      part: ${ch1Data.part},
      order: ${ch1Data.order},
      content: \`${ch1Data.content}\`,
      images: ${ch1Data.images},
      readingTime: ${ch1Data.readTime}
    `;

// ch2-ch35 = was ch1-ch34
for (let i = 1; i <= 34; i++) {
  const oldKey = `ch${i}`;
  const newKey = `ch${i + 1}`;
  if (chapters[oldKey]) {
    const body = chapters[oldKey];
    const newOrder = i + 1;
    const titleOverride = null; // Let the regex update the title
    newChaptersObj[newKey] = updateChapterContent(body, newKey, newOrder, undefined, titleOverride);
  }
}

// ch36 = NEW (Abstraction)
const ch36Data = newChapters.ch36;
newChaptersObj['ch36'] = `
      id: "${ch36Data.id}",
      title: "${ch36Data.title}",
      part: ${ch36Data.part},
      order: ${ch36Data.order},
      content: \`${ch36Data.content}\`,
      images: ${ch36Data.images},
      readingTime: ${ch36Data.readTime}
    `;

// ch37 = NEW (OAL)
const ch37Data = newChapters.ch37;
newChaptersObj['ch37'] = `
      id: "${ch37Data.id}",
      title: "${ch37Data.title}",
      part: ${ch37Data.part},
      order: ${ch37Data.order},
      content: \`${ch37Data.content}\`,
      images: ${ch37Data.images},
      readingTime: ${ch37Data.readTime}
    `;

// ch38 = NEW (HITL)
const ch38Data = newChapters.ch38;
newChaptersObj['ch38'] = `
      id: "${ch38Data.id}",
      title: "${ch38Data.title}",
      part: ${ch38Data.part},
      order: ${ch38Data.order},
      content: \`${ch38Data.content}\`,
      images: ${ch38Data.images},
      readingTime: ${ch38Data.readTime}
    `;

// ch39 = NEW (Glossary)
const ch39Data = newChapters.ch39;
newChaptersObj['ch39'] = `
      id: "${ch39Data.id}",
      title: "${ch39Data.title}",
      part: ${ch39Data.part},
      order: ${ch39Data.order},
      content: \`${ch39Data.content}\`,
      images: ${ch39Data.images},
      readingTime: ${ch39Data.readTime}
    `;

// ch40 = NEW (New Jobs)
const ch40Data = newChapters.ch40;
newChaptersObj['ch40'] = `
      id: "${ch40Data.id}",
      title: "${ch40Data.title}",
      part: ${ch40Data.part},
      order: ${ch40Data.order},
      content: \`${ch40Data.content}\`,
      images: ${ch40Data.images},
      readingTime: ${ch40Data.readTime}
    `;

// ch41 = NEW (Temporal Truth)
const ch41Data = newChapters.ch41;
newChaptersObj['ch41'] = `
      id: "${ch41Data.id}",
      title: "${ch41Data.title}",
      part: ${ch41Data.part},
      order: ${ch41Data.order},
      content: \`${ch41Data.content}\`,
      images: ${ch41Data.images},
      readingTime: ${ch41Data.readTime}
    `;

// ch42 = was ch37
if (chapters['ch37']) {
  newChaptersObj['ch42'] = updateChapterContent(chapters['ch37'], 'ch42', 42, 5, 'Ch42: Robotics — The Brilliant Machine');
}

// ch43 = was ch38
if (chapters['ch38']) {
  newChaptersObj['ch43'] = updateChapterContent(chapters['ch38'], 'ch43', 43, 6, 'Ch43: Smart Stack — The 5-Layer Architecture Framework');
}

// ch44 = was ch39
if (chapters['ch39']) {
  newChaptersObj['ch44'] = updateChapterContent(chapters['ch39'], 'ch44', 44, 6, 'Ch44: Smart Stack Issue Matrix — IT & Executive Alignment');
}

// Special chapters stay as-is
for (const special of ['ch13b', 'ch23b', 'ch32b', 'ch33v']) {
  if (chapters[special]) {
    newChaptersObj[special] = chapters[special];
  }
}

// Build the chapter order for output
const chapterOutputOrder = [
  'foreword', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10',
  'ch11', 'ch12', 'ch13', 'ch13b', 'ch14', 'ch15', 'ch16', 'ch17', 'ch18', 'ch19', 'ch20',
  'ch21', 'ch22', 'ch23', 'ch23b', 'ch24', 'ch25', 'ch26', 'ch27', 'ch28', 'ch29', 'ch30',
  'ch31', 'ch32', 'ch32b', 'ch33', 'ch33v', 'ch34', 'ch35', 'ch36', 'ch37', 'ch38', 'ch39',
  'ch40', 'ch41', 'ch42', 'ch43', 'ch44'
];

// Build chapters string
let chaptersStr = '';
for (const key of chapterOutputOrder) {
  if (newChaptersObj[key]) {
    chaptersStr += `    ${key}: {${newChaptersObj[key]}
    },\n`;
  }
}

// Update knowledge nodes
const newKnowledgeNodes = knowledgeNodes + `
    { id: "computing_eras", label: "Computing Eras", type: "concept", color: "#FF6B35" },
    { id: "abstraction", label: "Abstraction", type: "concept", color: "#FF6B35" },
    { id: "adaptive_learning", label: "Adaptive Learning", type: "technology", color: "#10B981" },
    { id: "hitl", label: "Human-in-the-Loop", type: "strategy", color: "#F59E0B" },
    { id: "context_engineer", label: "Context Engineer", type: "concept", color: "#8B5CF6" },
    { id: "knowledge_architect", label: "Knowledge Architect", type: "concept", color: "#8B5CF6" },
    { id: "temporal_truth", label: "Temporal Truth", type: "concept", color: "#FF6B35" },
    { id: "era_economics", label: "Era Economics", type: "strategy", color: "#F59E0B" },
    { id: "escalation_protocol", label: "Escalation Protocol", type: "strategy", color: "#F59E0B" },
    { id: "freshness_spectrum", label: "Freshness Spectrum", type: "concept", color: "#FF6B35" },
    { id: "glossary", label: "Glossary", type: "concept", color: "#8B5CF6" },
    { id: "career_paths", label: "Career Paths", type: "strategy", color: "#F59E0B" },`;

// Update edges
let newEdges = edges;
// Shift all edge references +1 (except foreword, special chapters, and ch37-ch39→ch42-ch44)
for (let i = 36; i >= 1; i--) {
  const oldRef = `ch${i}`;
  const newRef = `ch${i + 1}`;
  // Skip special chapters
  if (['ch13b', 'ch23b', 'ch32b', 'ch33v'].includes(oldRef)) continue;
  // ch37→ch42, ch38→ch43, ch39→ch44
  if (i === 37) {
    newEdges = newEdges.replace(new RegExp(`\\bch37\\b`, 'g'), 'ch42');
  } else if (i === 38) {
    newEdges = newEdges.replace(new RegExp(`\\bch38\\b`, 'g'), 'ch43');
  } else if (i === 39) {
    newEdges = newEdges.replace(new RegExp(`\\bch39\\b`, 'g'), 'ch44');
  } else if (i >= 35) {
    // ch35 and ch36 are not in the new structure (overwritten by new chapters)
    // Remove edges referencing them
    newEdges = newEdges.replace(new RegExp(`\\bch${i}\\b`, 'g'), 'ch' + (i + 7));
  } else {
    newEdges = newEdges.replace(new RegExp(`\\b${oldRef}\\b`, 'g'), newRef);
  }
}

// Add new edges
const newEdgeEntries = `
    { source: "foreword", target: "ch1", type: "sequence" },
    { source: "ch1", target: "ch2", type: "sequence" },
    { source: "ch1", target: "ch35", type: "conceptual", label: "era economics" },
    { source: "ch1", target: "ch40", type: "conceptual", label: "personal journey" },
    { source: "ch35", target: "ch36", type: "sequence" },
    { source: "ch36", target: "ch37", type: "conceptual", label: "feedback loop" },
    { source: "ch37", target: "ch38", type: "sequence" },
    { source: "ch38", target: "ch42", type: "conceptual", label: "robotics HITL" },
    { source: "ch38", target: "ch43", type: "sequence" },
    { source: "ch42", target: "ch43", type: "sequence" },
    { source: "ch43", target: "ch44", type: "sequence" },
    { source: "ch39", target: "ch40", type: "sequence" },
    { source: "ch39", target: "ch41", type: "conceptual", label: "temporal concepts" },
    { source: "ch40", target: "ch41", type: "sequence" },
    { source: "ch41", target: "ch13b", type: "conceptual", label: "embedding freshness" },`;

newEdges = newEdges.trimEnd() + newEdgeEntries;

// Build final file
const finalContent = `${header}
  metadata: {${metadata}
  },
  personas: {${personas}
  },
  chapters: {
${chaptersStr}  },
  knowledgeNodes: [${newKnowledgeNodes}
  ],
  edges: [${newEdges}
  ]
};`;

fs.writeFileSync(filePath, finalContent);
console.log("File written successfully!");
console.log(`Chapters: ${chapterOutputOrder.length} (plus special chapters)`);

// ===== Book Knowledge Graph Data =====
// VidiChannel founded 1999, not 2000 — corrected throughout
const BOOK_DATA = {
  metadata: {
    title: "Speed of Agentic Visual AI",
    version: "V10",
    author: "James May"
  },
  personas: {
    consumer: {
      id: "consumer",
      label: "Consumer",
      icon: "👤",
      description: "Personal productivity, learning, creativity",
      color: "#3B82F6",
      critical: ["foreword", "ch1", "ch4", "ch6", "ch14", "ch18", "ch22", "ch30", "ch32", "ch36"],
      high: ["ch3", "ch13", "ch15", "ch19", "ch33"],
      medium: ["ch7", "ch12", "ch21"],
      hide: ["ch5", "ch8", "ch10", "ch11", "ch16", "ch20", "ch23", "ch24", "ch25", "ch26", "ch27", "ch28", "ch29", "ch31", "ch34", "ch35", "ch37"],
      reasoning: "Consumers need practical, immediately applicable AI knowledge without deep technical infrastructure. Focus on personal productivity (ch6 vibe coding), creativity (ch4 original creation), understanding AI limits (ch22 text models only predict), and the job impact (ch36). Skip enterprise architecture chapters.",
      keyTakeaways: [
        "How to use AI tools effectively for personal projects and productivity",
        "Understanding what AI can and cannot do — separating hype from reality",
        "Protecting your privacy and data when using AI services",
        "AI tools for creativity, learning, and everyday problem solving",
        "How the AI revolution affects your career and what skills to develop"
      ],
      personaIntro: "As a consumer, you're experiencing the AI revolution firsthand — through chatbots, image generators, and smart assistants. This path focuses on what matters most to your daily life: using AI effectively, understanding its limits, and preparing for the changes ahead. You'll skip the enterprise architecture deep-dives and focus on practical knowledge that makes you smarter about AI today.",
      aiInsights: {
        foreword: "Your 30-year perspective gives consumers something rare: context. Most people are experiencing AI as a sudden shock. You're showing them it's a wave that's been building for decades.",
        ch4: "For consumers, the moat concept translates directly: your personal creative voice, amplified by AI, is something no one else can replicate. This is the most empowering chapter in the book for individuals.",
        ch36: "The job question isn't abstract for consumers — it's personal. This chapter gives them the framework to understand which skills to develop and which to automate."
      }
    },
    it_professional: {
      id: "it_professional",
      label: "IT Professional",
      icon: "💻",
      description: "Building and implementing AI systems",
      color: "#10B981",
      critical: ["foreword", "ch1", "ch3", "ch6", "ch8", "ch10", "ch12", "ch13", "ch17", "ch20", "ch22", "ch23", "ch25", "ch27", "ch30", "ch34"],
      high: ["ch2", "ch5", "ch11", "ch14", "ch15", "ch18", "ch19", "ch21", "ch26", "ch28", "ch35"],
      medium: ["ch4", "ch7", "ch9", "ch16", "ch24", "ch29", "ch31", "ch32", "ch37"],
      hide: ["ch33", "ch36"],
      reasoning: "IT professionals need the full technical stack: model evaluation (ch3), data pipelines (ch12), semantic search (ch13), RAG systems (ch20), ontology/knowledge graphs (ch25), fine-tuning/LoRAs (ch27), local AI deployment (ch30), and infrastructure (ch34). They can skip consumer-focused content like voice agents (ch33) and job market analysis (ch36).",
      keyTakeaways: [
        "Model selection criteria — how to evaluate LLMs vs multimodal systems for specific use cases",
        "Building AI pipelines: data ingestion, vector search, RAG, and knowledge graphs",
        "Local AI deployment for privacy, cost control, and offline operation",
        "Agentic orchestration patterns with AutoGen, CrewAI, and Vertex AI",
        "Infrastructure decisions: custom silicon, GPU selection, and build vs buy"
      ],
      personaIntro: "As an IT professional, you're the one who has to make AI work in production. This path gives you the technical depth you need: model architectures, data pipelines, deployment patterns, and infrastructure decisions. You'll get every technical chapter plus the strategic context to make decisions that matter.",
      aiInsights: {
        ch3: "The LLM ranking chapter is your buying guide. Understanding which models are genuinely multimodal vs language models with image plugins is the first filter for every architecture decision you'll make.",
        ch12: "The 90% Problem is your biggest opportunity. Most organizations have no idea that 90% of their valuable data is invisible to their systems. You're the one who can fix this.",
        ch27: "Inference, fine-tuning, and LoRAs — this is where you go from using AI to owning AI. A talent-specific LoRA is the difference between generic output and production-grade consistency.",
        ch30: "Local AI with 96GB VRAM changes the privacy equation entirely. Running multiple large models on a single RTX 5090 is no longer a research project — it's a deployment option."
      }
    },
    executive_entrepreneur: {
      id: "executive_entrepreneur",
      label: "Executive / Entrepreneur",
      icon: "🚀",
      description: "Leading AI strategy, building businesses, and making strategic decisions",
      color: "#8B5CF6",
      critical: ["foreword", "ch1", "ch2", "ch4", "ch5", "ch6", "ch7", "ch8", "ch9", "ch10", "ch12", "ch13", "ch15", "ch16", "ch17", "ch18", "ch19", "ch28", "ch31", "ch32", "ch35", "ch36"],
      high: ["ch3", "ch11", "ch14", "ch20", "ch21", "ch22", "ch23", "ch24", "ch27", "ch29", "ch30", "ch33", "ch34"],
      medium: ["ch25", "ch26"],
      hide: ["ch37"],
      reasoning: "Executives and entrepreneurs share the same need: strategic context for making decisions that compound. This merged path covers competitive dynamics (ch2, ch5), investment decisions (ch16), organizational thinking (ch18, ch19), the 90-day playbook (ch28), small business opportunity (ch31), SaaS disruption (ch35), workforce impact (ch36), and content creation at scale (ch32). Skip only robotics (ch37) as it's less immediately actionable for business leaders.",
      keyTakeaways: [
        "AI strategy and competitive advantage — how to build moats that compound over time",
        "Investment prioritization — where to put money for maximum AI impact and ROI",
        "Identifying AI-powered market opportunities before competitors see them",
        "The 90-day velocity framework for rapid AI deployment and organizational learning",
        "Content and growth at scale with SmartGen — producing what competitors can't match"
      ],
      personaIntro: "Whether you're leading an established organization or building something new, your job is the same: make the right strategic bets at the right time and execute faster than anyone else. This path gives you the complete landscape — competitive dynamics, investment frameworks, organizational playbooks, and the execution tools to move at AI speed. You'll see the full picture without getting lost in implementation details.",
      aiInsights: {
        ch2: "Vision vs execution is the leader's dilemma. The companies winning in 2026 aren't the ones with the best AI strategy — they're the ones with the execution velocity to act on it. This chapter gives you the framework.",
        ch4: "Original AI-assisted creation is your moat. While competitors use the same models to generate commodity content, your proprietary training data and visual equity become impossible to replicate. This is the chapter that changes everything.",
        ch5: "The SaaSpocalypse isn't just a threat — it's a map of where competitive moats are forming and where they're dissolving. Every leader needs to know which side of the line their business is on.",
        ch16: "Follow the money, not the hype. This chapter shows you where enterprise AI budgets are actually going — infrastructure, domain-specific systems, and visual AI — so you can align your investments with market reality.",
        ch28: "The 90-day playbook is your competitive weapon. While competitors are still planning, you'll have deployed, measured, and iterated. Speed is the only sustainable advantage in AI right now.",
        ch31: "36 million small business owners is your market. The ones who figure out how to be both hyperlocal and AI-accelerated simultaneously will dominate their territories.",
        ch32: "SmartGen is your content weapon. From a single seed — a keyword, a business objective, a local market — you can produce articles, images, videos, and social content at a scale no competitor can match without the same system."
      }
    }
  },
  chapters: {
    foreword: {
      id: "foreword",
      title: "Foreword: The 500% Lead",
      part: 0,
      order: 0,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>We are not in the middle of an AI revolution. We are at the very beginning of a permanent stratification — a moment where the decisions made in the next 12 months will determine who leads entire industries for the next decade.</p>
        <p>The top performers who understand what is actually happening right now — not the hype, not the demos, not the press releases — will generate 500% more business than their competitors within three years.</p>
      </div>
      <p>I have watched this pattern play out before. In 1993, I was producing interactive CD-ROMs for corporate clients at a time when most businesses still thought multimedia was a gimmick. In 1999, when Napster was the biggest story in tech, I was building VidiChannel — one of the first companies to deliver interactive video commercially over the internet.</p>
      <p>That experience gave me something most people in this industry don't have: a long view. I have spent 30 years watching technology waves build, crest, and reshape entire industries.</p>
      <blockquote>"What is happening with Visual Agentic AI right now is not an upgrade to the existing system. It is a replacement of it."</blockquote>`,
      images: ["VidiSmart.Logo.jpg"],
      readingTime: 5
    },
    ch1: {
      id: "ch1",
      title: "Ch1: Access to Information Is Accelerating",
      part: 1,
      order: 1,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>In 1993, I handed a client a disc. Not a website. Not a stream. A physical CD-ROM with video, interactivity, and a navigation menu — because the internet wasn't fast enough yet to carry what I already knew was coming.</p>
        <p>By 1999, when the rest of the world was losing its mind over Napster, I had already built VidiChannel — one of the first companies to put interactive video on the internet commercially. We did millions of dollars proving a model the market wasn't ready for yet.</p>
        <p>It took 25 years. The infrastructure is here now.</p>
      </div>
      <p>The speed at which humans can access information has never been faster, and it is still accelerating. Every year the friction drops — from disc to download, from download to stream, from stream to instant AI-generated answer.</p>
      <p>But here's what most people miss: speed without intelligence is just noise. The businesses winning in 2026 are not the ones moving fastest. They are the ones whose content is intelligent enough to be found at speed.</p>
      <blockquote>"It is no longer about who has the best information. It is about who built the fastest pipeline from raw data to decisive action."</blockquote>`,
      images: ["VidiLogo.jpeg", "1.webp", "2.webp"],
      readingTime: 15
    },
    ch2: {
      id: "ch2",
      title: "Ch2: Full Speed Ahead — Vision vs. Execution",
      part: 1,
      order: 2,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Vision without execution is the most expensive luxury in business. I learned this the hard way in 1999. VidiChannel had the right vision — interactive video on demand, personalized for each viewer. We could see exactly where the industry was going. What we didn't have was the infrastructure, the bandwidth, or the market education to execute at scale.</p>
        <p>Today, the infrastructure problem is solved. The bandwidth is there. The compute is there. The AI models are there.</p>
      </div>
      <p>Every leader has a vision. Very few have an execution engine powerful enough to realize that vision at scale. In the pre-AI era, the gap between vision and execution was filled by time, money, and human labor — all of which are finite and expensive.</p>
      <p>In the AI era, the gap narrows dramatically for the businesses smart enough to build the right systems. The vision is still yours. The execution capacity is now multiplied.</p>
      <blockquote>"Having a vision in 2026 is table stakes. Having the execution velocity to act on it at AI speed is the only thing that matters."</blockquote>`,
      images: ["Compare.AiModels.jpg"],
      readingTime: 12
    },
    ch3: {
      id: "ch3",
      title: "Ch3: Ranking Early LLM Leaders — Language vs. Visual Arts",
      part: 1,
      order: 3,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The AI rankings conversation is being had almost entirely wrong. Every benchmark comparison, every leaderboard, every side-by-side evaluation of GPT versus Gemini versus Claude is measuring the wrong dimension. They are all measuring language. And language, as I will argue throughout this book, is the old game.</p>
        <p>The language model leaders — and they are genuinely impressive — are operating in one dimension of a multi-dimensional space. They predict the next word extraordinarily well. But your customers don't think in text. They think in images.</p>
      </div>
      <p>The neuroscience on this has been settled for decades: 90% of information transmitted to the brain is visual. Humans process visual information 60,000 times faster than text.</p>
      <p>Knowing which AI systems are genuinely multimodal versus which ones are language models with an image plugin bolted on is the first filter for building a 500% stack.</p>`,
      images: ["12Labs.png", "AiList.LLM.qwen3-logo.png", "12-vector-databases-2023_chroma.webp"],
      readingTime: 14
    },
    ch4: {
      id: "ch4",
      title: "Ch4: The Art of AI — Original Creation as a Defensible Moat",
      part: 1,
      order: 4,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The most dangerous assumption in the current AI conversation is that everyone will soon have access to the same capabilities, so capability itself cannot be a competitive advantage. This is wrong.</p>
        <p>In 1993, every company I worked with had access to the same CD-ROM pressing equipment. Same hardware. Same disc. Same format. But the companies that used interactive multimedia to tell a genuinely original story generated results that companies with identical technology could not replicate.</p>
      </div>
      <p>Original AI-assisted creation builds a moat in three ways that commodity content cannot. First, it generates proprietary training data. Second, it establishes semantic authority. Third, it builds visual equity.</p>
      <blockquote>"AI is the best imitation engine ever built. What it cannot imitate is the perspective of a specific human life, lived fully and articulated with precision. That is your moat."</blockquote>`,
      images: ["Gemini_Generated_Image_1ypeyn1ypeyn1ype.png", "Gemini_Generated_Image_8smle88smle88sml.png"],
      readingTime: 12
    },
    ch5: {
      id: "ch5",
      title: "Ch5: Defensible Moats in the SaaSpocalypse",
      part: 1,
      order: 5,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The SaaS model that funded the last 20 years of software business is being systematically dismantled. Not disrupted. Dismantled.</p>
        <p>When an AI agent can be prompted to build a functional CRM in four hours, the CRM company that charges $200 per seat per month has a fundamental problem. When AI-powered visual search makes keyword SEO tools obsolete, the SEO industry — which is a $68 billion market — faces an existential moment.</p>
      </div>
      <p>The moats that survive this transition share three characteristics. They are data moats — built on proprietary information that the AI cannot replicate from public sources. They are relationship moats — built on trust and integration so deep that switching costs are structural. Or they are intelligence moats — built on AI systems that have been trained on and optimized for a specific domain so completely that no general-purpose competitor can match them.</p>
      <blockquote>"Your moat is not your software. It is your data, your relationships, your domain expertise, and your speed."</blockquote>`,
      images: ["0029-15-open-source-projects-that-changed-the-world.png", "0034-20-popular-open-source-projects-by-big-tech.png"],
      readingTime: 13
    },
    ch6: {
      id: "ch6",
      title: "Ch6: The Vibe Coding Myth",
      part: 1,
      order: 6,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>Let me be direct about something the AI industry does not want to admit: most of what is being sold as "AI-powered development" is theatrical.</p>
        <p>Vibe coding — the practice of prompting an AI to build software through conversational iteration — is real. It works for certain classes of problems. It is not a replacement for engineering discipline. It is not a shortcut to production-grade software.</p>
      </div>
      <p>The businesses generating real advantage from AI-assisted development are using it inside a disciplined methodology — what we call CVI: Curate, Validate, Integrate. AI generates. Human judgment curates. Rigorous testing validates. Careful integration deploys.</p>
      <blockquote>"Vibe coding is the fastest way to answer the question: should we build this? Software engineering is the only way to answer: did we build it right? Never confuse the two."</blockquote>`,
      images: ["0173-diagrams-as-code-twitter.jpeg", "0051-10-good-coding-principles.png"],
      readingTime: 11
    },
    ch7: {
      id: "ch7",
      title: "Ch7: HyperLocal — GeoSpatial x Visual AI",
      part: 1,
      order: 7,
      content: `<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The most undervalued intersection in the current AI landscape is geographic. VidiCity — our 33,000-city local content platform — is built on a simple but profound premise: every community in America has a unique visual identity, a specific set of concerns, and a local economy that is invisible to national brands.</p>
        <p>The local economy in America represents $15 trillion in annual revenue, and the vast majority of local businesses have no meaningful digital visual presence.</p>
      </div>
      <p>HyperLocal Visual AI is the combination of geospatial data, community-specific visual content, and AI systems that understand local context well enough to generate, optimize, and distribute relevant content automatically.</p>
      <blockquote>"Geography is not a constraint — it is a data asset. The business that knows its territory better than any AI platform will always have the advantage of context that no dataset can fully replicate."</blockquote>`,
      images: ["12Maps.c5.jpg", "GEO.Ai.Search0.jpg"],
      readingTime: 13
    },
    ch8: {
      id: "ch8",
      title: "Ch8: Build Your Own Custom Software vs. SaaS",
      part: 1, order: 8,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>This is the question that every business leader is asking wrong. The debate is usually framed as build versus buy — custom development versus off-the-shelf SaaS. That framing made sense in 2015. It is almost completely obsolete in 2026.</p><p>The real question is: what is your intelligence architecture, and who controls it?</p></div><p>Generic AI tools will make you marginally more efficient. They will not make you 500% more effective. They will not build a moat. They will not compound. They are productivity tools, and productivity tools are commodities.</p><p>Your own AI stack, built on your own data, optimized for your specific market, and deployed through a visual interface your customers actually want to use — that is an asset.</p><blockquote>"Building your own software is no longer about having a development team. It is about having a methodology."</blockquote>`,
      images: ["0077-api-protocols.png", "0048-100x-postgres-scaling-at-figma.png"], readingTime: 12
    },
    ch9: {
      id: "ch9",
      title: "Ch9: AGI May Happen in 5 Years — Focus on Today",
      part: 1, order: 9,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The AGI debate is the most expensive distraction in business right now. Executives are deferring decisions — waiting for the technology to mature, waiting for the use cases to become clearer, waiting for the regulatory environment to stabilize.</p><p>I made a version of this mistake in the late 1990s. After VidiChannel, I was watching the broadband rollout and thinking about what would be possible when every home had high-speed internet. I was so focused on what was coming that I underinvested in what was working right now.</p></div><p>AGI may arrive in five years. It may not arrive for twenty. What is certain is that the AI capabilities available today — multimodal understanding, agentic orchestration, visual intelligence, real-time personalization — are sufficient to build businesses that generate 500% more value than their competitors.</p><blockquote>"If you are waiting for AGI before you take AI seriously, your competition is already two years ahead of you on the capabilities you have today."</blockquote>`,
      images: ["bench_glm47.png", "context-aware-embeddings-qwen-3.webp"], readingTime: 10
    },
    ch10: {
      id: "ch10", title: "Ch10: Iterative, Reductive & Glacial", part: 2, order: 10,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Everyone is wrong about the speed of AI. Half of them think it's moving too fast to track. The other half think the breakthroughs are just around the corner. Both groups are making the same mistake: they're measuring the wrong thing.</p><p>AI progress at the frontier is genuinely fast — faster than almost any technology development in history. But AI adoption — the translation of frontier capability into business results — is iterative, reductive, and often glacial.</p></div><p>The 500% performers understand this gap and use it strategically. They are adopting frontier capabilities now — before the adoption curve catches up — which means they are building lead time that their competitors will struggle to overcome.</p>`,
      images: ["generational_spending_chart.png"], readingTime: 11
    },
    ch11: {
      id: "ch11", title: "Ch11: World Models & the Human Experience", part: 2, order: 11,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The most important frontier in AI is not language. It is not even image generation. It is world modeling — the capacity of an AI system to understand how things work in physical, spatial, and causal reality.</p><p>Humans don't experience the world as text. We experience it as a continuous stream of visual, spatial, auditory, and tactile information.</p></div><p>The AI systems that are beginning to develop genuine world models are not just better at answering questions. They are beginning to understand context in the way humans do — which means they can anticipate intent, infer meaning from incomplete information, and generate responses that are genuinely relevant rather than statistically probable.</p><blockquote>"AI has read every book ever written. It has not lived a single day. The gap between reading about the world and experiencing it is where human judgment remains irreplaceable — for now."</blockquote>`,
      images: ["graph3d.png", "vvbrain.logic.jpg"], readingTime: 14
    },
    ch12: {
      id: "ch12", title: "Ch12: Reading Unstructured Data — The 90% Problem", part: 2, order: 12,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Ninety percent of the data generated by your business right now is invisible to your systems. Not missing. Not deleted. Invisible. It exists in video files, image libraries, audio recordings, PDFs, handwritten notes, presentation decks, and the visual content your team produces every day.</p></div><p>This is the 90% Problem, and it is the central business opportunity of the next five years. Visual AI is the tool that finally exists. The ability to analyze video content at the frame level, extract semantic meaning from images, transcribe and understand audio, and connect all of that to a queryable knowledge base — this is what transforms the 90% from invisible asset to competitive intelligence.</p><blockquote>"90% of your most valuable business intelligence is sitting in unstructured data your analytics systems cannot read. Fixing that is not an IT project — it is a strategic imperative."</blockquote>`,
      images: ["introducing-r2-object-storage-HxgJEf.png", "mnist-training-embeddings-umap-short.gif"], readingTime: 13
    },
    ch13: {
      id: "ch13", title: "Ch13: Semantic Understanding — Beyond Keywords", part: 2, order: 13,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Keyword search is dead. It will take the market another two years to fully accept this, but the technical reality is already settled.</p><p>For 25 years, digital business was organized around keywords. SEO, SEM, metadata, tags — the entire infrastructure of digital discovery was built on matching the words in a query to the words in a document.</p></div><p>The alternative is now something far more powerful: semantic understanding. Semantic AI doesn't match words. It understands meaning. It knows that a question about "the best way to introduce a new product to a skeptical market" is related to content about "overcoming buyer resistance," "early adopter psychology," and "trust-building in sales" — even if none of those exact phrases appear in the query.</p>`,
      images: ["Ai.Search0.png", "12-vector-databases-2023-vespa.png"], readingTime: 12
    },
    ch14: {
      id: "ch14", title: "Ch14: Visual AI Has Just Begun", part: 2, order: 14,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Everything that has happened in visual AI so far is the prologue. The image generators, the video synthesis tools, the multimodal models — as impressive as they are, they represent the earliest possible version of what visual AI will become.</p><p>We are at the 1993 moment of interactive multimedia. The technology is real. The capability is proven. The infrastructure that will make it universal is just beginning to be built.</p></div><p>Visual AI will, within five years, be capable of understanding the full semantic content of any video or image as accurately as a trained human analyst — and doing it at a speed and scale no human team can match.</p><blockquote>"Visual AI is the next frontier of business advantage. The companies investing in visual intelligence infrastructure today are not early adopters — they are building moats that will be impossible to replicate in 18 months."</blockquote>`,
      images: ["visualVector.smartype.png"], readingTime: 13
    },
    ch15: {
      id: "ch15", title: "Ch15: Google Zero Matters", part: 2, order: 15,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Google Zero is not a trend. It is a structural shift with no reverse gear. Google Zero is the moment when a search query generates a complete, satisfying answer directly on the search results page — meaning the user never clicks through to any website.</p><p>For 25 years, the entire business model of organic search traffic was built on the assumption that ranking highly meant getting visitors. Google Zero ends that assumption.</p></div><p>For businesses whose revenue depends on organic search traffic — which is most digital businesses — this is an existential challenge. The businesses that become the authoritative source in their domain — through original research, genuine expertise, and AI-structured knowledge bases that AI systems can query with confidence — will actually benefit from Google Zero.</p><blockquote>"The era of building a business on Google traffic is over. The businesses that recognize this in 2026 — and act accordingly — will be the media brands, AI-referenced authorities, and community builders of 2028."</blockquote>`,
      images: ["GEO.Ai.Search0.jpg", "GEO.Ai.Search7.jpg"], readingTime: 11
    },
    ch16: {
      id: "ch16", title: "Ch16: Follow the Money, Not the Hype", part: 2, order: 16,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The AI investment landscape is generating more noise than signal right now. Here is how to separate them. Hype is measurable in press releases, demo videos, and conference keynotes. Money is measurable in enterprise contracts, retention rates, and the specific capabilities that the companies with the largest budgets are actually deploying at scale.</p><p>Follow the money, not the hype.</p></div><p>The money in AI right now is flowing to three areas. First: infrastructure — the compute, the storage, the networking that AI at scale requires. Second: domain-specific AI systems — not general-purpose models but AI trained specifically for healthcare, legal, financial, and manufacturing applications. Third: visual AI and multimodal systems.</p><blockquote>"The money is in the second wave — when the technology actually works reliably and the use cases are proven. Being slightly late and right is infinitely better than being first and wrong."</blockquote>`,
      images: ["0286-netflix-tech-stack.png", "Cerebras.B200.avif"], readingTime: 12
    },
    ch17: {
      id: "ch17", title: "Ch17: Privacy — Who Owns Your Data", part: 2, order: 17,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The privacy conversation in AI is usually framed as a compliance issue. It is actually a strategic asset question. Who owns the intelligence that your business generates every day? The answer to that question will determine more about your competitive position in five years than almost any other decision you make right now.</p></div><p>If you are using a third-party AI tool to process your customer interactions, analyze your content, and generate your communications — and that tool retains rights to use your data to train its models — you are paying to build someone else's intelligence advantage.</p><blockquote>"Your data is the only AI asset that cannot be commoditized. Every other component of your AI stack — models, infrastructure, tooling — will be cheaper and more capable next year. Your proprietary data gets more valuable with every passing month."</blockquote>`,
      images: ["0268-memory-storage.png", "cloudflare_purple.png"], readingTime: 11
    },
    ch18: {
      id: "ch18", title: "Ch18: Learn How to Think, Not What to Think", part: 3, order: 18,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The most valuable skill in the AI era is not prompt engineering. It is not knowing which tools to use. It is not even technical fluency with AI systems. It is the ability to frame the right question.</p><p>In 30 years of building technology businesses, the single most consistent differentiator between the companies that generated extraordinary results and the ones that generated ordinary ones was not the technology they used. It was the quality of the questions they asked before they deployed it.</p></div><p>The companies asking "how do we use AI to do what we already do faster" will get modest efficiency gains. The companies asking "what becomes possible when every customer interaction can be informed by the full intelligence of our organization" will get transformation.</p><blockquote>"The AI tells you what the data says. You have to decide what the data means. Never confuse those two jobs."</blockquote>`,
      images: ["5TruthFactors1.png", "0004-learn-cache.png"], readingTime: 12
    },
    ch19: {
      id: "ch19", title: "Ch19: Instant Information vs. Answers vs. Decisions", part: 3, order: 19,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>There is a hierarchy of value in what AI systems deliver, and most businesses are deploying AI at the bottom of it. Information is raw. An AI that retrieves facts, summarizes documents, or compiles data is delivering information. This is useful. It saves time. It is also a commodity.</p><p>Answers are more valuable. An AI that understands context well enough to synthesize information into a specific, relevant response to a specific question is delivering something that requires genuine intelligence.</p><p>Decisions are where the real value lives.</p></div><blockquote>"Information is cheap. Answers are valuable. Decisions are priceless. Know which one you are producing and what the difference costs."</blockquote>`,
      images: ["generational_spending_chart.png", "graphrag-preview.png"], readingTime: 11
    },
    ch20: {
      id: "ch20", title: "Ch20: LLM Knowledge-Based Search", part: 3, order: 20,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Language models are extraordinary. They are also fundamentally limited in ways that matter enormously for business deployment. LLMs predict the next word based on patterns in their training data. This makes them remarkably capable at tasks that involve synthesizing and expressing knowledge that exists in text form.</p><p>These are not engineering failures. They are architectural realities.</p></div><p>The leverage in LLM-based search comes from connecting language models to proprietary knowledge bases — your organization's actual data, your domain expertise, your customer history — through retrieval-augmented generation and vector search.</p><blockquote>"The model is only as good as what it can see. Build the knowledge base first. The model is the easy part."</blockquote>`,
      images: ["a-rag-agent-and-their-types-v0-4byivp3lzgig1.webp", "12-vector-databases-2023_weaviate.png"], readingTime: 13
    },
    ch21: {
      id: "ch21", title: "Ch21: Zero-Human Transactions", part: 3, order: 21,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The 0human.net vision is simple to state and radical to fully implement: every routine commercial transaction that currently requires human involvement can be handled by an AI system that does it faster, more accurately, and at a fraction of the cost.</p><p>This is not science fiction. In 1993, the idea that you could book a flight, transfer money, order groceries, and manage an investment portfolio without speaking to a human was science fiction. Today it is Tuesday.</p></div><p>Zero-Human Transactions is not about eliminating humans. It is about eliminating the friction cost that routine human involvement adds to commercial processes that don't require human judgment.</p><blockquote>"The businesses that automate the right transactions and keep humans on the right decisions will outperform both the under-automators and the over-automators by a significant margin."</blockquote>`,
      images: ["Figure-1.-End\u2011to\u2011end-workflow-of-a-voice-agent-with-RAG-and-safety-guardrails-png.webp", "0407-what-does-acid-mean.png"], readingTime: 12
    },
    ch22: {
      id: "ch22", title: "Ch22: Text Models Only Predict the Next Word", part: 3, order: 22,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>This is the most important technical concept in this book, stated as plainly as possible. A language model does not understand. It predicts. Given the text that came before, it calculates the most statistically likely text to come next.</p><p>The results of this prediction process are often extraordinary — indistinguishable from understanding when the task is within the model's training distribution. But prediction and understanding are architecturally different things.</p></div><p>When a text model gives you a confident, well-reasoned answer that is factually incorrect, it is not lying. It is doing exactly what it was designed to do — predicting the most statistically likely next text — and the most statistically likely text happens to be wrong.</p>`,
      images: ["a-rag-agent-and-their-types-v0-nwq78xbkzgig1.webp", "vvbrain.logic.jpg"], readingTime: 11
    },
    ch23: {
      id: "ch23", title: "Ch23: Agentic AI Orchestration", part: 3, order: 23,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Agentic AI orchestration is the practice of coordinating multiple AI agents to work together on complex tasks. Each agent has specific capabilities, tools, and responsibilities. The orchestration layer determines which agent handles which part of a workflow, how they communicate, and how results are synthesized.</p><p>This is where the real power of AI emerges — not from a single model doing everything, but from a coordinated system of specialized agents working in concert.</p></div><p>The leading platforms for agentic orchestration include Microsoft's AutoGen, CrewAI, and Google's Vertex AI Agent Builder. Each offers different strengths: AutoGen excels at conversational multi-agent workflows, CrewAI provides role-based agent coordination, and Vertex AI offers native integration with Google's Gemini models for multimodal intelligence.</p>`,
      images: ["AiServices.png"], readingTime: 14
    },
    ch24: {
      id: "ch24", title: "Ch24: Smart Shopping", part: 3, order: 24,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The end of human Q&A in commerce is not a prediction — it is already happening. AI-powered shopping assistants can now understand customer intent, compare products across multiple dimensions, answer complex questions about compatibility and use cases, and guide purchasing decisions without any human intervention.</p></div><p>The businesses that deploy these systems first will have a structural cost advantage over competitors that cannot be overcome through effort alone. A business operating at 30% of the transaction cost of its closest competitor can afford to price aggressively, invest in genuine innovation, and weather market downturns that force competitors into crisis.</p>`,
      images: ["VidiCRM.SmartChannel.jpg", "VidiCRM7.jpg"], readingTime: 10
    },
    ch25: {
      id: "ch25", title: "Ch25: Ontology — Consciousness & Meaning", part: 3, order: 25,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Ontology in AI refers to the structured representation of knowledge — how concepts relate to each other, how meaning is encoded, and how understanding emerges from the connections between information.</p><p>Knowledge graphs are the practical implementation of ontology. They map entities, relationships, and properties in a way that AI systems can query and reason about.</p></div><p>The distinction between today's visual AI — which recognizes objects, describes scenes, and understands the semantic content of images — and a genuine world model is the distinction between recognition and prediction. A visual AI system can tell you "that is a glass of water on the edge of a table." A world model can tell you "if the table vibrates at this frequency, the glass will fall in approximately 2.3 seconds."</p>`,
      images: ["gen-ai-graphrag-spanner.svg", "KGProducts-3.png"], readingTime: 13
    },
    ch26: {
      id: "ch26", title: "Ch26: Legal Transaction Process", part: 3, order: 26,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>AI is transforming legal services by compressing the time required for contract review, case research, regulatory analysis, and document drafting by 60-80% for well-implemented systems.</p><p>The firms that have moved fastest are not the largest — they are the most process-disciplined. A small firm with a well-designed AI-assisted contract review workflow is outperforming large firms still running entirely on billable-hour paralegal effort.</p></div><p>The competitive implication is a fundamental repricing of legal services that is only beginning to work its way through the market.</p>`,
      images: ["0407-what-does-acid-mean.png"], readingTime: 11
    },
    ch27: {
      id: "ch27", title: "Ch27: Inference, RL Training, Fine-Tuning & LoRAs", part: 4, order: 27,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Inference is the process of running a trained model to generate an output. When you prompt an image generator and it produces an image, that is inference. The model's weights — the billions of numerical parameters that encode its learned understanding of visual patterns — are applied to your input to produce an output.</p><p>For visual effects specifically, inference-only workflows are appropriate for: background generation, texture synthesis, style transfer on reference images, upscaling with tile-based refinement, inpainting and outpainting for VFX compositing, and prompt-driven variation generation for concept exploration.</p></div><p>LoRA (Low-Rank Adaptation) training allows you to fine-tune a model on a specific subject or style with a fraction of the compute required for full fine-tuning. A talent-specific LoRA trained on 30 clean reference images can reliably reproduce a specific performer's face with production-grade consistency across any background, costume, or lighting scenario.</p>`,
      images: ["VidiFlow.png"], readingTime: 16
    },
    ch28: {
      id: "ch28", title: "Ch28: Your 90-Day AI Velocity Playbook", part: 4, order: 28,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The most effective AI implementations use a 30-60-90 day framework: 30 days to deploy a working prototype in one high-value use case, 60 days to measure real business impact against a defined baseline, 90 days to either scale it or pivot with the lessons learned.</p><p>This is not agile methodology rebranded. It is the acknowledgment that in a technology environment moving this fast, learning through deployment is faster than learning through planning.</p></div><p>The businesses winning in the custom software space right now are not the ones with the largest development teams. They are the ones that have developed systematic, repeatable processes for the Curate-Validate-Integrate loop — and can execute that loop faster and more reliably than their competitors.</p>`,
      images: ["VidiCRM7.600.png"], readingTime: 12
    },
    ch29: {
      id: "ch29", title: "Ch29: Agents of Change", part: 4, order: 29,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The agentic orchestration platforms are reshaping how businesses operate. AutoGen, CrewAI, Vertex AI Agent Builder — each offers a different approach to coordinating multiple AI agents.</p><p>The key insight: agentic systems are not about replacing humans. They are about amplifying human capability by handling the routine, repetitive, data-intensive tasks that consume most of our working day.</p></div><p>For organizations whose agent workflows require multimodal intelligence — agents that can understand images, analyze video content, process audio, and reason across mixed-media inputs — Vertex AI's native Gemini integration provides a capability advantage that pure text model platforms cannot match.</p>`,
      images: ["aosc_4spk_example.gif"], readingTime: 12
    },
    ch30: {
      id: "ch30", title: "Ch30: Run It Yourself — Local AI", part: 4, order: 30,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The 96GB VRAM figure is the headline that matters most for local AI deployment. To understand why, consider what fits in that memory at common quantization levels. A Qwen 3.5 27B model at 4-bit quantization requires approximately 16GB. That means you can run multiple large models simultaneously on a single RTX 5090.</p><p>Local AI solves the privacy and cost concerns of cloud inference, but introduces complexity in model management, driver stability, software compatibility, and the operational overhead of maintaining dedicated AI hardware.</p></div><p>For specific use cases — private data processing, offline operation requirements, long-running inference tasks — the local approach is valid. The businesses making infrastructure bets on local AI today are doing so in a landscape where the hardware will be dramatically more capable and dramatically cheaper within 18-24 months.</p>`,
      images: ["Ai Private SmartStack Get Native.png"], readingTime: 13
    },
    ch31: {
      id: "ch31", title: "Ch31: 36 Million Strong", part: 4, order: 31,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>There are approximately 36 million small business owners in the United States. The vast majority of them have heard about AI. A fraction have experimented with it. A tiny fraction have actually deployed it in a way that generates measurable business impact.</p><p>That gap is not a technology problem — the tools have never been more accessible or affordable. It is a knowledge problem, a context problem, and fundamentally a guidance problem.</p></div><p>The small businesses that will survive and thrive in the next decade are those that figure out how to be both hyperlocal and AI-accelerated simultaneously. Not one or the other. Both. The technology handles the volume. The human presence handles the trust. That combination is genuinely defensible against both national AI platforms from above and commodity competitors from below.</p>`,
      images: ["1752325040753.jpg", "AiJobSecurity.png"], readingTime: 12
    },
    ch32: {
      id: "ch32", title: "Ch32: SmartGen — AI Content Creation", part: 4, order: 32,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>SmartGen is the AI content creation system that produces from a single seed — a keyword cluster, a business objective, a local market — a long-form article optimized for AI citation; a set of supporting images generated in ComfyUI with consistent brand aesthetic; a short-form video script; a talking-head or AI avatar video; social media variations for every platform.</p></div><p>The SmartGen image workflow for article and social content operates through what practitioners call a "brand consistency pipeline" — a ComfyUI workflow configured with a style LoRA trained on your brand's visual language, a set of prompt templates calibrated to your color palette and aesthetic, and a batch processing setup that generates image variations for each content piece automatically.</p><blockquote>"SmartGen changes the content equation from 'how much can we produce?' to 'how much can we strategically deploy?'"</blockquote>`,
      images: ["VidiSmart Logo2.jpeg", "VidiSmart.v.png"], readingTime: 14
    },
    ch33: {
      id: "ch33", title: "Ch33: Voice & Video Agents", part: 5, order: 33,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Voice and video agents are the new face of business interaction. The technology has matured from simple chatbots to sophisticated conversational agents that can understand context, maintain personality, handle complex multi-turn conversations, and integrate with backend systems to take real actions.</p><p>The combination of Tavus for personalized video generation, LiveKit for real-time communication infrastructure, and advanced speech models for natural voice synthesis creates a platform for customer interaction that is fundamentally different from anything available even two years ago.</p></div><p>The businesses deploying these systems are seeing dramatic improvements in customer satisfaction, response times, and operational efficiency. The key is not replacing human interaction — it is augmenting it with AI that handles the routine while humans handle the complex.</p>`,
      images: ["Figure-1.-End\u2011to\u2011end-workflow-of-a-voice-agent-with-RAG-and-safety-guardrails-png.webp"], readingTime: 12
    },
    ch34: {
      id: "ch34", title: "Ch34: The Data Center Race", part: 5, order: 34,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The data center race is the infrastructure battle that will determine who controls AI compute for the next decade. Custom silicon — chips designed specifically for AI workloads — is the key differentiator.</p><p>NVIDIA's dominance in GPU compute is being challenged by custom AI accelerators from Google (TPU), Amazon (Trainium), and startups like Cerebras and Groq. Each offers different tradeoffs in performance, cost, and flexibility.</p></div><p>For businesses making infrastructure decisions today, the key insight is that compute costs will continue to drop dramatically. The question is not whether to invest in AI infrastructure — it is when and how much to build versus rent.</p>`,
      images: ["0268-memory-storage.png", "GPUMap_864083562870808_4738384333190846445_n.jpg"], readingTime: 12
    },
    ch35: {
      id: "ch35", title: "Ch35: SaaSpocalypse — Which Software Survives", part: 5, order: 35,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>The monolithic software application model — build a product, charge a monthly subscription, compete on features — is being systematically dismantled by the combination of open-source AI, agentic automation, and the commoditization of software development itself.</p><p>Any application that can be described in plain language can now be partially replicated by an AI-assisted development workflow in weeks. The question for every software business is no longer "Who will build a competitor?" It is "How long until an AI agent builds one overnight?"</p></div><p>The businesses that understood this first are the ones either acquiring the customer bases of threatened applications or rapidly pivoting their value proposition from "features" to "outcomes."</p><blockquote>"Slapping AI on the front does not make it smarter."</blockquote>`,
      images: ["0048-100x-postgres-scaling-at-figma.png", "0029-15-open-source-projects-that-changed-the-world.png"], readingTime: 11
    },
    ch36: {
      id: "ch36", title: "Ch36: The Job Question", part: 5, order: 36,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>AI does not eliminate the need for human judgment. It eliminates the tolerance for average performance. The people who thrive in the AI era are not necessarily the most technical — they are the most thoughtful, the most contextually aware, and the most willing to leverage what AI does well while bringing what only they can bring.</p></div><p>If you manage a workforce, the strategic imperative is to conduct an honest audit of which roles in your organization are in each of the three categories — being replaced, being transformed, or being created. For the transformation category, the most valuable investment you can make is reskilling: giving your people the AI literacy, prompt engineering capability, and judgment skills that make them effective directors of AI rather than victims of it.</p><blockquote>"AI does not eliminate the need for human judgment. It eliminates the tolerance for average performance."</blockquote>`,
      images: ["AiJobSecurity.png", "Gw6vkgq6_400x400.jpg"], readingTime: 13
    },
    ch37: {
      id: "ch37", title: "Ch37: Robotics — The Brilliant Machine", part: 5, order: 37,
      content: `<div class="strategic-context"><h3>Strategic Context</h3><p>Every technology has a boundary between what it can do and what we wish it could do. For robotics in 2026, that boundary is world understanding.</p><p>The mechanical capability of robots is extraordinary. They can move with precision that no human hand can match, work continuously without fatigue, and operate in environments that would harm or kill a human. The failure mode is perception. A robot that is precisely calibrated to perform a specific motion in a specific environment becomes unreliable — sometimes useless — when that environment changes in ways that a human would consider trivial.</p></div><p>This is not a mechanical failure. It is a world-understanding failure. The robot cannot see — not in the way humans see, where visual perception is connected to a rich model of how the world works and what is relevant in any given context.</p><blockquote>"The gap between today's robotics and general physical AI is not an engineering gap. It is a data gap — and data gaps close on the timescale of years, not months."</blockquote>`,
      images: ["graph3d.png", "KGProducts-3.png"], readingTime: 18
    }
  },
  knowledgeNodes: [
    { id: "strategic_vision", label: "Strategic Vision", type: "concept", color: "#FF6B35" },
    { id: "process_automation", label: "Process Automation", type: "technology", color: "#10B981" },
    { id: "multimodal_intelligence", label: "Multimodal AI", type: "technology", color: "#3B82F6" },
    { id: "data_pipeline", label: "Data Pipeline", type: "technology", color: "#8B5CF6" },
    { id: "decision_velocity", label: "Decision Velocity", type: "strategy", color: "#F59E0B" },
    { id: "execution_velocity", label: "Execution Velocity", type: "strategy", color: "#F59E0B" },
    { id: "llm_landscape", label: "LLM Landscape", type: "technology", color: "#3B82F6" },
    { id: "creative_moats", label: "Creative Moats", type: "strategy", color: "#F59E0B" },
    { id: "saas_disruption", label: "SaaS Disruption", type: "strategy", color: "#EF4444" },
    { id: "vibe_coding", label: "Vibe Coding", type: "technology", color: "#10B981" },
    { id: "geospatial_intelligence", label: "Geospatial AI", type: "technology", color: "#3B82F6" },
    { id: "sovereign_ai", label: "Sovereign AI", type: "strategy", color: "#8B5CF6" },
    { id: "world_models", label: "World Models", type: "technology", color: "#3B82F6" },
    { id: "unstructured_data", label: "Unstructured Data", type: "technology", color: "#10B981" },
    { id: "semantic_search", label: "Semantic Search", type: "technology", color: "#3B82F6" },
    { id: "visual_ai", label: "Visual AI", type: "technology", color: "#3B82F6" },
    { id: "google_zero", label: "Google Zero", type: "strategy", color: "#EF4444" },
    { id: "data_sovereignty", label: "Data Sovereignty", type: "strategy", color: "#8B5CF6" },
    { id: "critical_thinking", label: "Critical Thinking", type: "concept", color: "#FF6B35" },
    { id: "knowledge_graphs", label: "Knowledge Graphs", type: "technology", color: "#3B82F6" },
    { id: "rag", label: "RAG", type: "technology", color: "#10B981" },
    { id: "zero_human", label: "Zero-Human", type: "strategy", color: "#F59E0B" },
    { id: "agent_orchestration", label: "Agent Orchestration", type: "technology", color: "#3B82F6" },
    { id: "comfyui", label: "ComfyUI", type: "technology", color: "#10B981" },
    { id: "local_ai", label: "Local AI", type: "technology", color: "#8B5CF6" },
    { id: "robotics", label: "Robotics", type: "technology", color: "#3B82F6" }
  ],
  edges: [
    { source: "foreword", target: "ch1", type: "sequence" },
    { source: "ch1", target: "ch2", type: "sequence" },
    { source: "ch1", target: "ch12", type: "conceptual", label: "data foundation" },
    { source: "ch2", target: "ch3", type: "sequence" },
    { source: "ch2", target: "ch28", type: "conceptual", label: "execution" },
    { source: "ch3", target: "ch11", type: "conceptual", label: "capabilities" },
    { source: "ch3", target: "ch14", type: "conceptual", label: "visual focus" },
    { source: "ch3", target: "ch20", type: "conceptual", label: "LLM limits" },
    { source: "ch3", target: "ch22", type: "sequence" },
    { source: "ch4", target: "ch5", type: "sequence" },
    { source: "ch5", target: "ch8", type: "conceptual", label: "build vs buy" },
    { source: "ch5", target: "ch35", type: "sequence" },
    { source: "ch6", target: "ch8", type: "conceptual" },
    { source: "ch6", target: "ch23", type: "sequence" },
    { source: "ch6", target: "ch27", type: "sequence" },
    { source: "ch7", target: "ch13", type: "conceptual" },
    { source: "ch8", target: "ch30", type: "sequence" },
    { source: "ch9", target: "ch10", type: "sequence" },
    { source: "ch10", target: "ch11", type: "sequence" },
    { source: "ch10", target: "ch16", type: "conceptual" },
    { source: "ch11", target: "ch14", type: "conceptual" },
    { source: "ch11", target: "ch37", type: "conceptual", label: "embodiment" },
    { source: "ch12", target: "ch13", type: "sequence" },
    { source: "ch13", target: "ch15", type: "conceptual" },
    { source: "ch14", target: "ch27", type: "conceptual" },
    { source: "ch14", target: "ch32", type: "conceptual" },
    { source: "ch15", target: "ch32", type: "conceptual" },
    { source: "ch16", target: "ch29", type: "conceptual" },
    { source: "ch17", target: "ch30", type: "conceptual" },
    { source: "ch18", target: "ch19", type: "sequence" },
    { source: "ch19", target: "ch20", type: "conceptual" },
    { source: "ch19", target: "ch25", type: "conceptual", label: "knowledge" },
    { source: "ch20", target: "ch21", type: "sequence" },
    { source: "ch21", target: "ch24", type: "sequence" },
    { source: "ch22", target: "ch11", type: "conceptual", label: "understanding" },
    { source: "ch23", target: "ch21", type: "conceptual" },
    { source: "ch23", target: "ch29", type: "sequence" },
    { source: "ch23", target: "ch33", type: "sequence" }
  ]
};

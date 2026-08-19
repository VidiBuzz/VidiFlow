// VidiSmart AI Content Tools Intelligence Feed
// Data sourced from the CrewAI + LangGraph research pipeline

const TOOLS_DATA = [
    // === VLM (Vision & Multimodal Language Models) — Updated August 2026 ===

    // — OpenAI —
    {
        id: 2, category: "vlm", name: "GPT-5.6 Sol (Jul 2026)", provider: "OpenAI",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$1.75/1M input, $7.00/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 96.2,
        description: "OpenAI's latest flagship model (August 2026). #1 on the Artificial Analysis Coding Agent Index, featuring native computer-use, whole-repository comprehension, and 1M context with aggressive new pricing.",
        strengths: ["#1 Coding Agent Index", "Native computer use", "1M context window", "Frontier multimodal reasoning"],
        url: "https://openai.com",
        badge: "LATEST"
    },
    {
        id: 130, category: "vlm", name: "GPT-5.6 Terra (Jul 2026)", provider: "OpenAI",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$0.25/1M input, $1.00/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 91.5,
        description: "OpenAI's high-efficiency mid-tier model. Delivers exceptional multimodal reasoning and fast tool-calling at 1/7th the cost of Sol.",
        strengths: ["Cost-efficiency", "Fast tool calling", "1M context", "Multimodal QA"],
        url: "https://openai.com",
        badge: "NEW"
    },
    {
        id: 131, category: "vlm", name: "GPT-5.6 Luna (Jul 2026)", provider: "OpenAI",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$0.05/1M input, $0.20/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 87.0,
        description: "OpenAI's ultra-fast lightweight model for high-throughput classification, routing, and lightweight multimodal inspection.",
        strengths: ["Ultra-low latency", "High throughput", "Budget pricing", "1M context"],
        url: "https://openai.com",
        badge: "NEW"
    },
    {
        id: 122, category: "vlm", name: "GPT-5.3 Codex (May 2026)", provider: "OpenAI",
        params: "Undisclosed", context_window: "400K", vision_capable: true,
        pricing: "$1.75/1M input, $14/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 93.0,
        description: "OpenAI's specialized coding model optimized for software engineering, long-context code review, and agentic code execution workflows.",
        strengths: ["Code generation", "400K context", "Agentic coding"],
        url: "https://openai.com"
    },

    // — Alibaba / Qwen —
    {
        id: 129, category: "vlm", name: "Qwen 3.8 Max (Aug 2026)", provider: "Alibaba / Qwen",
        params: "2.4T MoE", context_window: "1M", vision_capable: true,
        pricing: "$1.20/1M input, $3.60/1M output",
        open_source: false, license: "Proprietary Cloud API",
        benchmark_score: 95.8,
        description: "Alibaba's 2.4 Trillion parameter multimodal flagship, ranking in the Top 5 globally on the Intelligence Index. Features native image and video sequence understanding, frontier SWE-Bench Pro coding, and a 1M-token context window.",
        strengths: ["2.4T parameters", "Native image & video", "Top-5 globally", "1M context window", "Frontier SWE-Bench"],
        url: "https://chat.qwen.ai",
        badge: "LATEST"
    },
    {
        id: 3, category: "vlm", name: "Qwen 3.8 Plus (Aug 2026)", provider: "Alibaba / Qwen",
        params: "Undisclosed MoE", context_window: "1M", vision_capable: true,
        pricing: "$0.30/1M input, $1.20/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 91.2,
        description: "Qwen's multimodal workhorse — delivers fast high-resolution vision QA, document parsing, and agentic tool loops at 4x lower cost than Max.",
        strengths: ["1M context window", "Native vision/video QA", "Cost-effective tool loops", "High throughput"],
        url: "https://chat.qwen.ai",
        badge: "NEW"
    },
    {
        id: 132, category: "vlm", name: "Qwen 3.8 27B (Aug 2026)", provider: "Alibaba / Qwen",
        params: "27B Dense", context_window: "128K", vision_capable: true,
        pricing: "Free (Self-Hosted)",
        open_source: true, license: "Apache 2.0",
        benchmark_score: 87.5,
        description: "The latest open-weight 27B model runnable locally on a single RTX 3090/4090 (~17 GB VRAM at Q4_K_M). 100% private inference on the Vidi AI™ server.",
        strengths: ["Single GPU (~17GB VRAM)", "100% private & offline", "Apache 2.0 open weights", "Strong local coding"],
        url: "https://huggingface.co/Qwen",
        badge: "OPEN SOURCE"
    },

    // — DeepSeek —
    {
        id: 133, category: "vlm", name: "DeepSeek V4 Pro 0813 (Aug 2026)", provider: "DeepSeek",
        params: "Undisclosed MoE (~900GB VRAM)", context_window: "1M", vision_capable: false,
        pricing: "$0.44/1M input, $0.87/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 95.0,
        description: "Released August 13, 2026. DeepSeek's upgraded flagship with switchable Thinking / Non-Thinking modes for trading latency vs reasoning depth, backed by a 1M context window and unmatched price/performance.",
        strengths: ["Dual Thinking modes", "Frontier reasoning", "1M context", "Unbeatable flagship pricing"],
        url: "https://deepseek.com",
        badge: "NEW"
    },
    {
        id: 134, category: "vlm", name: "DeepSeek V4 Flash 0731 (Jul 2026)", provider: "DeepSeek",
        params: "284B total / 13B active (MoE)", context_window: "1M", vision_capable: false,
        pricing: "$0.09/1M input, $0.18/1M output",
        open_source: true, license: "MIT License",
        benchmark_score: 92.8,
        description: "Released July 31, 2026. Speculative decoding module crushes agentic benchmarks — Terminal Bench 2.1 (82.7%), DeepSWE (54.4%). MIT-licensed and runnable locally on ~160 GB VRAM.",
        strengths: ["MIT License", "$0.09/$0.18 budget pricing", "Speculative decoding", "High-volume agent loops"],
        url: "https://deepseek.com",
        badge: "LATEST"
    },

    // — Zhipu AI —
    {
        id: 135, category: "vlm", name: "Zhipu GLM-5.3 (Aug 2026)", provider: "Zhipu AI",
        params: "Undisclosed MoE", context_window: "1M", vision_capable: false,
        pricing: "$1.35/1M input, $4.20/1M output",
        open_source: true, license: "MIT License",
        benchmark_score: 94.5,
        description: "Zhipu AI's MIT-licensed flagship (August 2026). Engineered for long-horizon agentic coding, multi-turn reasoning, and complex tool orchestration across a full 1M-token context window.",
        strengths: ["MIT Licensed", "Frontier coding agent", "1M context window", "Open-source flagship"],
        url: "https://zhipuai.cn",
        badge: "NEW"
    },
    {
        id: 136, category: "vlm", name: "Zhipu GLM-5V Turbo (Jun 2026)", provider: "Zhipu AI",
        params: "Undisclosed MoE", context_window: "1M", vision_capable: true,
        pricing: "$0.20/1M input, $0.80/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 89.0,
        description: "High-speed multimodal vision-language model with native OCR, document parsing, and visual reasoning at 1M context.",
        strengths: ["Fast vision inference", "Document/OCR parsing", "1M context", "Budget multimodal"],
        url: "https://zhipuai.cn",
        badge: "NEW"
    },

    // — Moonshot AI —
    {
        id: 137, category: "vlm", name: "Moonshot AI Kimi K3 (Jul 2026)", provider: "Moonshot AI",
        params: "2.8T MoE", context_window: "1M", vision_capable: true,
        pricing: "$3.00/1M input, $15.00/1M output",
        open_source: true, license: "Modified MIT",
        benchmark_score: 94.2,
        description: "2.8 Trillion parameter multimodal flagship, ranking #4 globally on public intelligence benchmarks. Features native high-resolution vision, video comprehension, and autonomous tool loops.",
        strengths: ["2.8T parameters", "#4 Globally", "Native vision + video", "1M context", "Modified MIT weights"],
        url: "https://kimi.ai",
        badge: "LATEST"
    },
    {
        id: 126, category: "vlm", name: "Kimi K 2.6 (May 2026)", provider: "Moonshot AI",
        params: "1T total / 32B active (MoE)", context_window: "2M", vision_capable: true,
        pricing: "$0.684/1M input, $3.42/1M output",
        open_source: true, license: "Modified MIT",
        benchmark_score: 92.0,
        description: "1 trillion parameter MoE model dominating agentic coding and frontend UI generation. Supports 300-agent swarms across 4,000 coordinated steps.",
        strengths: ["Agent swarms", "Frontend generation", "Long-horizon coding", "Open weights"],
        url: "https://kimi.ai"
    },

    // — MiniMax —
    {
        id: 200, category: "vlm", name: "MiniMax M3 (May 2026)", provider: "MiniMax",
        params: "Undisclosed MoE", context_window: "1M", vision_capable: true,
        pricing: "$0.30/1M input, $1.20/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 90.5,
        description: "MiniMax's frontier omni-modal model pairing frontier coding with native vision and audio comprehension in one unified architecture at $0.30 / $1.20.",
        strengths: ["Native vision + audio + text", "1M context", "Strong coding ELO", "Cost effective"],
        url: "https://minimax.io",
        badge: "LATEST"
    },

    // — NVIDIA —
    {
        id: 138, category: "vlm", name: "NVIDIA Nemotron 3 Ultra (Apr 2026)", provider: "NVIDIA",
        params: "550B MoE", context_window: "1M", vision_capable: false,
        pricing: "$0.80/1M input, $2.40/1M output",
        open_source: true, license: "NVIDIA Open Model License",
        benchmark_score: 93.8,
        description: "NVIDIA's 550B MoE reasoning powerhouse for complex text and software engineering workflows. Optimized for NIM microservices on NVIDIA Hopper and Blackwell. Note: Ultra is text/code only; for multimodal, use Nemotron 3 Nano Omni.",
        strengths: ["550B MoE", "NVIDIA NIM integration", "1M context", "Hardware accelerated"],
        url: "https://build.nvidia.com",
        badge: "NEW"
    },
    {
        id: 139, category: "vlm", name: "NVIDIA Nemotron 3 Nano Omni (Apr 2026)", provider: "NVIDIA",
        params: "30B-A3B MoE", context_window: "128K", vision_capable: true,
        pricing: "Free (NIM / Open weights)",
        open_source: true, license: "NVIDIA Open Model License",
        benchmark_score: 88.0,
        description: "NVIDIA's native omni-modal model combining real-time vision, speech audio, and text comprehension with edge-deployable efficiency on RTX/DGX hardware.",
        strengths: ["Native Omni (vision/audio/text)", "Edge deployable", "NVIDIA NIM optimized"],
        url: "https://build.nvidia.com",
        badge: "NEW"
    },

    // — Anthropic —
    {
        id: 1, category: "vlm", name: "Claude Opus 5 (Aug 2026)", provider: "Anthropic",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$5.00/1M input, $25.00/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 96.5,
        description: "Anthropic's flagship reasoning powerhouse in the Claude 5 generation. Excels at long-horizon agentic coding, multi-repo architectural refactoring, complex mathematics, and high-res vision tasks.",
        strengths: ["Agentic coding leader", "1M context window", "128K max output", "Deep architectural reasoning", "High-res vision"],
        url: "https://www.anthropic.com/claude/opus",
        badge: "LATEST"
    },
    {
        id: 147, category: "vlm", name: "Claude Fable 5 (Jun 2026)", provider: "Anthropic",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$10.00/1M input, $50.00/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 97.2,
        description: "Anthropic's most capable widely-released model, ranking #1 on the Artificial Analysis Intelligence Index for extreme reasoning, hard mathematical proofs, and frontier agent capabilities.",
        strengths: ["#1 Intelligence Index", "Extreme reasoning", "Adaptive Thinking Max Effort", "1M context"],
        url: "https://anthropic.com",
        badge: "NEW"
    },
    {
        id: 121, category: "vlm", name: "Claude Sonnet 5 (Jun 2026)", provider: "Anthropic",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$2.00/1M input, $10.00/1M output ($3/$15 standard)",
        open_source: false, license: "Proprietary",
        benchmark_score: 93.5,
        description: "Anthropic's most agentic Sonnet model with autonomous terminal/browser orchestration, 1M context, and high-speed tool loops at lower operational cost than Opus.",
        strengths: ["High-speed agent loops", "1M context window", "Autonomous tool use", "Cost efficiency"],
        url: "https://anthropic.com",
        badge: "NEW"
    },
    {
        id: 120, category: "vlm", name: "Claude Mythos Preview (Jul 2026)", provider: "Anthropic",
        params: "Undisclosed", context_window: "Undisclosed", vision_capable: true,
        pricing: "$2500/1M (restricted)",
        open_source: false, license: "Proprietary — Project Glasswing only",
        benchmark_score: 98.0,
        description: "Anthropic's most powerful model ever — restricted access under Project Glasswing for frontier cybersecurity and alignment research.",
        strengths: ["Frontier intelligence", "Advanced reasoning", "Cybersecurity research"],
        url: "https://anthropic.com",
        badge: "RESTRICTED"
    },

    // — Google DeepMind —
    {
        id: 5, category: "vlm", name: "Gemini 3.1 Pro (Feb 2026)", provider: "Google DeepMind",
        params: "Undisclosed", context_window: "10M", vision_capable: true,
        pricing: "$2/1M input, $12/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 93.5,
        description: "Google's flagship model with a 10M token context window. Leads in math/science benchmarks, multimodal reasoning, and frontend design generation.",
        strengths: ["10M context window", "Math/Science", "Multimodal"],
        url: "https://deepmind.google/gemini",
        badge: "LATEST"
    },
    {
        id: 124, category: "vlm", name: "Gemini 2.5 Flash (May 2026)", provider: "Google DeepMind",
        params: "Undisclosed", context_window: "1M", vision_capable: true,
        pricing: "$0.15/1M input, $0.60/1M output",
        open_source: false, license: "Proprietary",
        benchmark_score: 87.0,
        description: "Google's workhorse model on Vertex AI and AI Studio. Designed for high-throughput enterprise tasks with fast inference and strong multimodal capability.",
        strengths: ["High throughput", "Low cost", "1M context"],
        url: "https://deepmind.google/gemini"
    },
    {
        id: 125, category: "vlm", name: "Gemma 4 (Mar 2026)", provider: "Google DeepMind",
        params: "31B / 26B-A4B", context_window: "128K", vision_capable: true,
        pricing: "Free (Open weights)", open_source: true, license: "Gemma License",
        benchmark_score: 86.0,
        description: "Google's latest generation of open models with dense and MoE variants, strong multimodal capabilities, and efficient local inference.",
        strengths: ["Open weights", "MoE efficiency", "Google ecosystem"],
        url: "https://ai.google.dev/gemma",
        badge: "OPEN SOURCE"
    },

    // — Xiaomi MiMo —
    {
        id: 201, category: "vlm", name: "MiMo 2.5 Omni (Apr 2026)", provider: "Xiaomi",
        params: "Undisclosed MoE", context_window: "512K", vision_capable: true,
        pricing: "$0.40/1M input, $2.00/1M output",
        open_source: true, license: "Modified Apache 2.0",
        benchmark_score: 89.0,
        description: "Xiaomi's flagship omni-modal model — native vision, audio, and text understanding in a single architecture with strong GUI perception.",
        strengths: ["Omni-modal", "Open weights", "GUI perception", "Real-time visual"],
        url: "https://github.com/XiaomiMiMo",
        badge: "OPEN SOURCE"
    },

    // — Meta —
    {
        id: 4, category: "vlm", name: "Llama 4 Maverick (Apr 2026)", provider: "Meta",
        params: "10M+ MoE", context_window: "10M", vision_capable: true,
        pricing: "$0.20/1M input, $0.60/1M output",
        open_source: true, license: "Llama 4 Community",
        benchmark_score: 88.5,
        description: "Meta's flagship open-weight model with a massive 10M context window. Multimodal model for vision, reasoning, and long-document tasks.",
        strengths: ["10M context", "Open weights", "Multimodal"],
        url: "https://ai.meta.com/llama",
        badge: "OPEN SOURCE"
    },
    {
        id: 128, category: "vlm", name: "Llama 4 Scout (Apr 2026)", provider: "Meta",
        params: "Undisclosed", context_window: "10M", vision_capable: true,
        pricing: "$0.11/1M input, $0.34/1M output",
        open_source: true, license: "Llama 4 Community",
        benchmark_score: 85.0,
        description: "Meta's efficient open-weight model — ultra-fast at 2600 tokens/sec. Optimized for high-throughput production deployments at very low cost.",
        strengths: ["2600 t/s speed", "Budget friendly", "Open weights"],
        url: "https://ai.meta.com/llama",
        badge: "OPEN SOURCE"
    },



    // === Video Generation ===
    {
        id: 7, category: "video", name: "Wan 2.7 (T2V) (Jul 2026)", provider: "Wan",
        max_duration: 15, resolution: "1080p", audio: "Yes",
        pricing: "API/Hosted", api_available: true, commercial_license: true,
        strengths: ["Instruction editing", "Audio sync", "Plot recreation"],
        description: "Latest top-tier text-to-video model with integrated audio.",
        url: "https://wan.video"
    },
    {
        id: 8, category: "video", name: "Wan 2.7 (I2V) (Jul 2026)", provider: "Wan",
        max_duration: 15, resolution: "1080p", audio: "Yes",
        pricing: "API/Hosted", api_available: true, commercial_license: true,
        strengths: ["First/last-frame control", "Clip continuation", "Multi-image guidance"],
        description: "Latest top-tier image-to-video model with advanced clip continuation.",
        url: "https://wan.video"
    },
    {
        id: 9, category: "video", name: "Wan 2.2 (T2V 14B) (May 2026)", provider: "Wan",
        max_duration: 30, resolution: "1080p",
        pricing: "Free (open weights)", api_available: true, commercial_license: true,
        strengths: ["MoE architecture", "Cost effective"],
        description: "14B parameter multimodal text-to-video generator.",
        url: "https://huggingface.co/Wan-AI"
    },
    {
        id: 10, category: "video", name: "Wan 2.2 (I2V 14B) (May 2026)", provider: "Wan",
        max_duration: 30, resolution: "720p",
        pricing: "Free (open weights)", api_available: true, commercial_license: true,
        strengths: ["MoE architecture", "Image to video"],
        description: "14B parameter multimodal image-to-video generator.",
        url: "https://huggingface.co/Wan-AI"
    },
    {
        id: 11, category: "video", name: "Kling 3.0 (Jul 2026)", provider: "Kuaishou",
        max_duration: 180, resolution: "1080p", audio: "Yes",
        pricing: "$0.09–0.14/sec (as low as $0.029/s on fal.ai)", api_available: true, commercial_license: true,
        strengths: ["Strong high-motion I2V", "Realistic motion", "Native audio generation", "Long clips"],
        description: "Kuaishou's flagship video model with enhanced character consistency, realistic physics, and integrated sound effects generation.",
        url: "https://kling.ai",
        badge: "LATEST"
    },
    {
        id: 140, category: "video", name: "MiniMax H3 (Jul 2026)", provider: "MiniMax",
        max_duration: 60, resolution: "2K", audio: "Yes",
        pricing: "$0.13/sec (2K) / $0.08/sec (768P)", api_available: true, commercial_license: true,
        strengths: ["Native stereo audio", "2K cinematic resolution", "Direct dialogue sync", "High prompt adherence"],
        description: "Unified multimodal video architecture natively generating cinematic 2K video alongside perfectly synced stereo audio and Foley sound effects.",
        url: "https://minimax.io",
        badge: "NEW"
    },
    {
        id: 141, category: "video", name: "Seedance 2.5 (Jul 2026)", provider: "ByteDance",
        max_duration: 60, resolution: "4K", audio: "Yes",
        pricing: "~$0.09/sec", api_available: true, commercial_license: true,
        strengths: ["Native 4K & Audio Sync", "50 Multimodal References", "Region-Level Editing", "High Frame Stability"],
        description: "ByteDance's flagship 4K generative video model (Jul 2026) supporting up to 30s single-pass generation, native synchronized audio/SFX, and 50 multimodal character/scene references.",
        url: "https://seedance.ai",
        badge: "NEW"
    },
    {
        id: 142, category: "video", name: "Grok Imagine 1.5 (Aug 2026)", provider: "xAI",
        max_duration: 30, resolution: "1080p", audio: "Yes",
        pricing: "$0.08/sec", api_available: true, commercial_license: true,
        strengths: ["Built-in dialogue & SFX", "Fast generation", "Photorealistic rendering"],
        description: "xAI's video generation model featuring built-in audio synthesis, ambient soundscapes, and photorealistic physics.",
        url: "https://x.ai",
        badge: "NEW"
    },
    {
        id: 13, category: "video", name: "Veo 3.1 (Jun 2026)", provider: "Google DeepMind",
        max_duration: 60, resolution: "4K", audio: "Yes",
        pricing: "$0.50/s standard / $0.75/s w/ audio", api_available: true, commercial_license: true,
        strengths: ["4K photoreal", "Precise audio sync", "Cinematic camera paths", "Brand content"],
        description: "Google DeepMind's 4K cinematic video generator integrated into top creative workflows with native audio support.",
        url: "https://deepmind.google/technologies/veo/",
        badge: "LATEST"
    },
    {
        id: 60, category: "video", name: "Runway Gen-4.5 (Jun 2026)", provider: "Runway ML",
        max_duration: 60, resolution: "4K",
        pricing: "$0.08–0.40/sec", api_available: true, commercial_license: true,
        strengths: ["HD text-to-video", "Advanced physics", "Cinematic quality"],
        description: "Gen-4.5 produces high-definition text-to-video with advanced physics simulation, camera motion controls, and multi-asset consistency.",
        url: "https://runwayml.com",
        badge: "LATEST"
    },
    {
        id: 61, category: "workflow", name: "Higgsfield.ai", provider: "Higgsfield",
        type: "Studio Platform", gpu_required: false,
        api_available: true, learning_curve: "Moderate",
        pricing: "$15/$39/$99 per month (Starter/Plus/Ultra)",
        description: "All-in-one AI video 'Cinema Studio' aggregating 15+ models (Veo 3.1, Kling 3.0, WAN 2.6, Seedance 2, Hailuo) with directed shots and integrated image-to-video-to-edit pipelines.",
        url: "https://higgsfield.ai"
    },
    {
        id: 202, category: "workflow", name: "LTX Studio", provider: "Lightricks",
        type: "Studio Platform", gpu_required: false,
        api_available: true, learning_curve: "Moderate",
        pricing: "Free / $15/$35/$125 per month",
        description: "Multi-model creative platform combining Lightricks' own LTX-2 (Fast/Pro/Ultra) with Google Veo, Kling 2.6/3.0 Pro, FLUX.2 Pro, and Nano Banana behind one credit-based subscription.",
        url: "https://ltx.studio",
        badge: "NEW"
    },
    {
        id: 62, category: "workflow", name: "WaveSpeedAI", provider: "WaveSpeed",
        type: "API / Platform", gpu_required: false,
        api_available: true, learning_curve: "Developer",
        description: "600+ models via API including Kling and Wan 2.2 variants in a unified developer platform.",
        url: "https://wavespeed.ai"
    },
    {
        id: 63, category: "workflow", name: "CapCut (2026)", provider: "ByteDance",
        type: "Video Editor", gpu_required: false,
        api_available: false, learning_curve: "Easy",
        description: "Social-first editor natively integrating Veo 3.1 with AI dialogue scenes (dropped its Sora 2 integration after OpenAI discontinued the product in 2026).",
        url: "https://capcut.com"
    },
    {
        id: 108, category: "video", name: "HunyuanVideo", provider: "Tencent",
        max_duration: 10, resolution: "720p",
        pricing: "Free (Open weights)", api_available: true, commercial_license: true,
        strengths: ["Open weights", "High realism", "ComfyUI support"],
        description: "Tencent's top-tier open-source video foundation model featuring exceptional prompt adherence.",
        url: "https://huggingface.co/tencent/HunyuanVideo"
    },
    {
        id: 109, category: "video", name: "Mochi 1", provider: "Genmo",
        max_duration: 5, resolution: "720p",
        pricing: "Free (Open weights)", api_available: true, commercial_license: true,
        strengths: ["Asymmetric MoE", "High motion", "Open source"],
        description: "State-of-the-art open source video generation model using a novel Asymmetric Diffusion Transformer.",
        url: "https://huggingface.co/genmo/mochi-1-preview"
    },
    {
        id: 110, category: "video", name: "CogVideoX", provider: "Zhipu AI",
        max_duration: 6, resolution: "1080p",
        pricing: "Free (Open weights)", api_available: true, commercial_license: true,
        strengths: ["3D VAE", "Consumer GPU ready", "Open weights"],
        description: "Highly efficient open-source video model that can run on consumer GPUs like the RTX 3060.",
        url: "https://huggingface.co/THUDM/CogVideoX-5b"
    },
    {
        id: 111, category: "video", name: "LTX-Video", provider: "Lightricks",
        max_duration: 5, resolution: "720p",
        pricing: "Free (Open weights)", api_available: true, commercial_license: true,
        strengths: ["Fast inference", "Low VRAM", "DiT architecture"],
        description: "High-quality, real-time video generation model optimized for extreme speed and low memory usage.",
        url: "https://huggingface.co/Lightricks/LTX-Video"
    },
    {
        id: 112, category: "video", name: "Google Vids", provider: "Google Workspace",
        max_duration: "Unlimited", resolution: "1080p",
        pricing: "Workspace Subscription", api_available: false, commercial_license: true,
        strengths: ["Presentations", "Business workflows", "Integrated assets"],
        description: "AI-powered video creation app for work that helps you easily turn ideas into videos.",
        url: "https://workspace.google.com/products/vids/"
    },

    // === Image Generation ===
    {
        id: 14, category: "image", name: "Midjourney v7 (Jul 2026)", provider: "Midjourney",
        model_type: "Diffusion (proprietary)", pricing: "$0.04/image (Standard plan)",
        api_endpoint: false, ComfyUI_node: false, best_for: "Artistic, editorial",
        description: "The gold standard for artistic image generation with unmatched aesthetic quality and coherent styling.",
        url: "https://midjourney.com",
        badge: "LATEST"
    },
    {
        id: 15, category: "image", name: "FLUX 1.1 Pro (Aug 2026)", provider: "Black Forest Labs",
        model_type: "Flow Matching", pricing: "$0.04/image",
        api_endpoint: true, ComfyUI_node: true, best_for: "Commercial, product photography",
        description: "Commercial-grade image foundation model with ultra-crisp resolution, fast generation times, and wide API availability.",
        url: "https://blackforestlabs.ai",
        badge: "LATEST"
    },
    {
        id: 143, category: "image", name: "FLUX.1 Kontext [dev] (Jul 2026)", provider: "Black Forest Labs",
        model_type: "Flow Matching", pricing: "$0.015/image",
        api_endpoint: true, ComfyUI_node: true, best_for: "Open-weights development, fine-tuning",
        description: "High-efficiency open-weight generation model offering state-of-the-art aesthetics at just $0.015/image.",
        url: "https://blackforestlabs.ai",
        badge: "OPEN SOURCE"
    },
    {
        id: 18, category: "image", name: "Ideogram 3.0 (Jul 2026)", provider: "Ideogram",
        model_type: "Diffusion", pricing: "$0.05/image",
        api_endpoint: true, ComfyUI_node: false, best_for: "Typography, logos, graphic design, posters",
        description: "Best-in-class text rendering in generated images with accurate graphic design layouts and typography.",
        url: "https://ideogram.ai",
        badge: "LATEST"
    },
    {
        id: 144, category: "image", name: "Grok Imagine (Image) (Aug 2026)", provider: "xAI",
        model_type: "Diffusion", pricing: "$0.02/image",
        api_endpoint: true, ComfyUI_node: false, best_for: "Fast photorealism, high-volume generation",
        description: "xAI's fast, high-volume image model delivering 1K/2K photorealistic generations at just $0.02 per image.",
        url: "https://x.ai",
        badge: "NEW"
    },
    {
        id: 145, category: "image", name: "Seedream v5.0 Lite (Jul 2026)", provider: "ByteDance",
        model_type: "Diffusion", pricing: "$0.026/image",
        api_endpoint: true, ComfyUI_node: false, best_for: "High-resolution 2048x2048 illustration & design",
        description: "ByteDance's high-speed image generator supporting native 2048×2048 generation at rapid inference speeds.",
        url: "https://seedance.ai",
        badge: "NEW"
    },
    {
        id: 146, category: "image", name: "Imagen 4 Ultra (Jun 2026)", provider: "Google DeepMind",
        model_type: "Diffusion", pricing: "Vertex AI Pricing",
        api_endpoint: true, ComfyUI_node: false, best_for: "Photorealism, rich detail, complex lighting",
        description: "Google DeepMind's flagship image generation model with photoreal lighting, skin textures, and spatial composition.",
        url: "https://deepmind.google/technologies/imagen/",
        badge: "NEW"
    },
    {
        id: 19, category: "image", name: "Recraft V3 (May 2026)", provider: "Recraft",
        model_type: "Diffusion", pricing: "$0.02/image",
        api_endpoint: true, ComfyUI_node: false, best_for: "Vector art, icons, brand assets",
        description: "Specialized in vector-style graphics, SVG export, and brand-consistent asset generation.",
        url: "https://recraft.ai"
    },
    {
        id: 17, category: "image", name: "Stable Diffusion 3.5 Large (Jun 2026)", provider: "Stability AI",
        model_type: "Latent Diffusion", pricing: "Free (self-hosted)",
        api_endpoint: true, ComfyUI_node: true, best_for: "Custom workflows, fine-tuning",
        description: "Open-source image model with full ComfyUI support and extensive fine-tuning ecosystem.",
        url: "https://stability.ai",
        badge: "OPEN SOURCE"
    },

    // === Audio & Music ===
    {
        id: 20, category: "audio", name: "ElevenLabs v3 (Aug 2026)", provider: "ElevenLabs",
        category_type: "Voice cloning & TTS", pricing: "$0.03/1K chars",
        api_available: true, royalty_free: true,
        use_cases: ["Narration", "Dubbing", "Character voices", "Podcasts"],
        description: "Industry-leading voice synthesis with emotional range and multilingual support.",
        url: "https://elevenlabs.io"
    },
    {
        id: 21, category: "audio", name: "Suno v4 (May 2026)", provider: "Suno AI",
        category_type: "Music generation", pricing: "$0.015/sec (Pro plan)",
        api_available: false, royalty_free: true,
        use_cases: ["Full songs", "Background music", "Jingles", "Soundtracks"],
        description: "Full song generation with vocals, lyrics, and genre control.",
        url: "https://suno.ai"
    },
    {
        id: 22, category: "audio", name: "Udio 1.5 (Jun 2026)", provider: "Udio",
        category_type: "Music generation", pricing: "$0.02/sec",
        api_available: true, royalty_free: true,
        use_cases: ["Music production", "Creative projects", "Commercial licensing"],
        description: "High-fidelity music generation with commercial licensing and API access.",
        url: "https://udio.com"
    },
    {
        id: 23, category: "audio", name: "Mubert (Apr 2026)", provider: "Mubert Inc.",
        category_type: "Ambient & background music", pricing: "$0.01/sec",
        api_available: true, royalty_free: true,
        use_cases: ["Streaming", "Video content", "Apps & games", "Meditation"],
        description: "Royalty-free ambient music API designed for content creators and apps.",
        url: "https://mubert.com"
    },
    {
        id: 24, category: "audio", name: "PlayHT 2.0 (May 2026)", provider: "PlayHT",
        category_type: "Voice cloning & TTS", pricing: "$0.025/1K chars",
        api_available: true, royalty_free: true,
        use_cases: ["Enterprise TTS", "Audiobooks", "E-learning", "IVR"],
        description: "Enterprise-grade voice cloning with brand voice consistency tools.",
        url: "https://play.ht"
    },
    {
        id: 114, category: "audio", name: "MusicFX", provider: "Google Labs",
        category_type: "Music Generation", pricing: "Free (Labs)",
        api_available: false, royalty_free: true,
        use_cases: ["Music exploration", "DJing", "Loop generation"],
        description: "Google's experimental AI music generator powered by MusicLM for creating tracks, loops, and mixes.",
        url: "https://aitestkitchen.withgoogle.com/tools/music-fx"
    },
    {
        id: 115, category: "audio", name: "TextFX", provider: "Google Labs",
        category_type: "Creative Writing", pricing: "Free (Labs)",
        api_available: false, royalty_free: true,
        use_cases: ["Wordplay", "Lyric writing", "Brainstorming"],
        description: "AI-powered tool for rappers, writers, and wordsmiths to explore creative word combinations.",
        url: "https://textfx.withgoogle.com/"
    },

    // === Workflow & Orchestration ===
    {
        id: 25, category: "workflow", name: "ComfyUI", provider: "comfyanonymous",
        type: "Local", gpu_required: true, custom_nodes_count: 2800,
        api_available: true, learning_curve: "Steep",
        description: "The dominant node-based AI workflow engine for image and video generation pipelines.",
        url: "https://comfyui.org"
    },
    {
        id: 26, category: "workflow", name: "n8n", provider: "n8n",
        type: "Cloud / Self-hosted", gpu_required: false, custom_nodes_count: 1200,
        api_available: true, learning_curve: "Moderate",
        description: "Visual workflow automation with deep AI model integration capabilities.",
        url: "https://n8n.io"
    },
    {
        id: 27, category: "workflow", name: "LangGraph", provider: "LangChain",
        type: "Code-based (Python/JS)", gpu_required: false, custom_nodes_count: 450,
        api_available: true, learning_curve: "Moderate-Steep",
        description: "Graph-based agent orchestration framework — the backbone of the VidiSmart research pipeline itself.",
        url: "https://langchain.com/langgraph"
    },
    {
        id: 28, category: "workflow", name: "CrewAI", provider: "CrewAI Inc.",
        type: "Code-based (Python)", gpu_required: false, custom_nodes_count: 200,
        api_available: true, learning_curve: "Moderate",
        description: "Role-based multi-agent orchestration framework with built-in delegation patterns.",
        url: "https://crewai.com"
    },
    {
        id: 29, category: "workflow", name: "Automatic1111 SD WebUI", provider: "AUTOMATTIC",
        type: "Local", gpu_required: true, custom_nodes_count: 1500,
        api_available: true, learning_curve: "Moderate",
        description: "The classic Stable Diffusion web interface with a massive extension ecosystem.",
        url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui"
    },
    {
        id: 30, category: "workflow", name: "Dify", provider: "Dify.AI",
        type: "Cloud / Self-hosted", gpu_required: false, custom_nodes_count: 300,
        api_available: true, learning_curve: "Easy-Moderate",
        description: "No-code LLM app development platform with RAG pipeline and agent workflows.",
        url: "https://dify.ai"
    },
    {
        id: 116, category: "workflow", name: "Gemini Advanced", provider: "Google DeepMind",
        type: "Chat / Workspace", gpu_required: false, custom_nodes_count: 0,
        api_available: false, learning_curve: "Easy",
        description: "Google's premium AI assistant with deep ecosystem integration and massive context window.",
        url: "https://gemini.google.com/advanced"
    },
    {
        id: 117, category: "workflow", name: "NotebookLM", provider: "Google Labs",
        type: "Research Assistant", gpu_required: false, custom_nodes_count: 0,
        api_available: false, learning_curve: "Easy",
        description: "Personalized AI research assistant and podcast generator powered by Gemini.",
        url: "https://notebooklm.google.com"
    },
    {
        id: 118, category: "workflow", name: "Firebase Genkit", provider: "Google",
        type: "Code-based (TS/Go)", gpu_required: false, custom_nodes_count: 250,
        api_available: true, learning_curve: "Moderate",
        description: "Open source framework that makes it easy for developers to build, test, and deploy AI features.",
        url: "https://firebase.google.com/products/genkit"
    },

    // === GPU Hosting ===
    {
        id: 31, category: "gpu", name: "RunPod", provider: "RunPod Inc.",
        rtx4090_hr: "$0.74", a100_hr: "$1.69", h100_hr: "$3.99",
        free_tier: false, serverless: true,
        notes: "Most popular serverless GPU for AI inference. Fast cold starts, great API.",
        description: "Leading serverless GPU platform optimized for AI inference and ComfyUI deployments.",
        url: "https://runpod.io"
    },
    {
        id: 32, category: "gpu", name: "Vast.ai", provider: "Vast.ai Inc.",
        rtx4090_hr: "$0.35", a100_hr: "$0.80", h100_hr: "$2.50",
        free_tier: false, serverless: false,
        notes: "Cheapest GPU rental via marketplace model. Reliability varies by host.",
        description: "GPU rental marketplace with the lowest prices, but variable reliability.",
        url: "https://vast.ai"
    },
    {
        id: 33, category: "gpu", name: "Replicate", provider: "Replicate",
        rtx4090_hr: "N/A (per-prediction)", a100_hr: "N/A (per-prediction)", h100_hr: "N/A (per-prediction)",
        free_tier: true, serverless: true,
        notes: "Pay-per-prediction model. No GPU management. Great for APIs and prototypes.",
        description: "Serverless ML inference — pay per prediction, no GPU management needed.",
        url: "https://replicate.com"
    },
    {
        id: 34, category: "gpu", name: "fal.ai", provider: "fal.ai",
        rtx4090_hr: "N/A (per-inference)", a100_hr: "N/A (per-inference)", h100_hr: "N/A (per-inference)",
        free_tier: true, serverless: true,
        notes: "Specialized in image/video generation. Optimized for FLUX, SD, and video models.",
        description: "Specialized serverless platform optimized for generative media models.",
        url: "https://fal.ai"
    },
    {
        id: 35, category: "gpu", name: "Modal", provider: "Modal Labs",
        rtx4090_hr: "$1.20", a100_hr: "$2.50", h100_hr: "$5.00",
        free_tier: true, serverless: true,
        notes: "Developer-first serverless. Great for building and deploying AI pipelines in code.",
        description: "Developer-friendly serverless platform — deploy AI workflows as code.",
        url: "https://modal.com"
    },
    {
        id: 36, category: "gpu", name: "Clore.ai", provider: "Clore.ai",
        rtx4090_hr: "$0.28", a100_hr: "$0.70", h100_hr: "N/A",
        free_tier: false, serverless: false,
        notes: "Budget GPU rental. Good for training and long-running workloads.",
        description: "Budget GPU marketplace with competitive rates for long-running training jobs.",
        url: "https://clore.ai"
    },
];

// Category config
const CATEGORY_CONFIG = {
    vlm: { icon: "👁️", label: "Vision Models", badgeClass: "badge-vlm" },
    video: { icon: "🎬", label: "Video Generation", badgeClass: "badge-video" },
    image: { icon: "🎨", label: "Image Generation", badgeClass: "badge-image" },
    audio: { icon: "🎵", label: "Audio & Music", badgeClass: "badge-audio" },
    workflow: { icon: "⚙️", label: "Workflows", badgeClass: "badge-workflow" },
    gpu: { icon: "🖥️", label: "GPU Hosting", badgeClass: "badge-gpu" }
};

// State
let currentCategory = "all";
let currentSearch = "";
let currentPricing = "all";
let currentLicense = "all";
let currentSort = "name";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    updateCounts();
    renderTools();
    setupEventListeners();
    updatePipelineStatus();
});

function setupEventListeners() {
    // Category tabs
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCategory = tab.dataset.category;
            renderTools();
        });
    });

    // Search
    document.getElementById("searchBtn").addEventListener("click", performSearch);
    document.getElementById("searchInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") performSearch();
        if (e.target.value === "") {
            currentSearch = "";
            renderTools();
        }
    });

    // Filters
    document.getElementById("pricingFilter").addEventListener("change", (e) => {
        currentPricing = e.target.value;
        renderTools();
    });
    document.getElementById("licenseFilter").addEventListener("change", (e) => {
        currentLicense = e.target.value;
        renderTools();
    });
    document.getElementById("sortOrder").addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderTools();
    });

    // Modal close
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("toolModal").addEventListener("click", (e) => {
        if (e.target.id === "toolModal") closeModal();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

function performSearch() {
    currentSearch = document.getElementById("searchInput").value.toLowerCase().trim();
    renderTools();
}

function getFilteredTools() {
    let tools = [...TOOLS_DATA];

    // Category filter
    if (currentCategory !== "all") {
        tools = tools.filter(t => t.category === currentCategory);
    }

    // Search filter
    if (currentSearch) {
        tools = tools.filter(t => {
            const searchFields = [
                t.name, t.provider, t.description, t.category,
                ...(t.strengths || []),
                ...(t.use_cases || []),
                t.best_for || "",
                t.notes || ""
            ].map(f => String(f).toLowerCase());
            return searchFields.some(f => f.includes(currentSearch));
        });
    }

    // Pricing filter
    if (currentPricing === "free") {
        tools = tools.filter(t => {
            const p = (t.pricing || "").toLowerCase();
            return p.includes("free") || p.includes("$0.00") || t.open_source === true || t.free_tier === true;
        });
    } else if (currentPricing === "open-source") {
        tools = tools.filter(t => t.open_source === true);
    } else if (currentPricing === "paid") {
        tools = tools.filter(t => !t.open_source && !(t.pricing || "").toLowerCase().includes("free"));
    }

    // License filter
    if (currentLicense !== "all") {
        tools = tools.filter(t => {
            const lic = (t.license || "").toLowerCase();
            if (currentLicense === "commercial") return t.commercial_license !== false && lic !== "open source";
            if (currentLicense === "open-source") return lic.includes("apache") || lic.includes("mit") || lic.includes("llama") || t.open_source;
            if (currentLicense === "proprietary") return lic.includes("proprietary") || (!t.open_source && !lic.includes("apache") && !lic.includes("mit"));
            return true;
        });
    }

    // Sort
    tools.sort((a, b) => {
        switch (currentSort) {
            case "name": return a.name.localeCompare(b.name);
            case "name-desc": return b.name.localeCompare(a.name);
            case "price-low": return extractPriceNum(a) - extractPriceNum(b);
            case "price-high": return extractPriceNum(b) - extractPriceNum(a);
            default: return 0;
        }
    });

    return tools;
}

function extractPriceNum(tool) {
    const match = (tool.pricing || "").match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 9999;
}

function updateCounts() {
    const counts = {};
    ["vlm", "video", "image", "audio", "workflow", "gpu"].forEach(cat => {
        counts[cat] = TOOLS_DATA.filter(t => t.category === cat).length;
    });

    document.getElementById("countAll").textContent = TOOLS_DATA.length;
    document.getElementById("countVLM").textContent = counts.vlm;
    document.getElementById("countVideo").textContent = counts.video;
    document.getElementById("countImage").textContent = counts.image;
    document.getElementById("countAudio").textContent = counts.audio;
    document.getElementById("countWorkflow").textContent = counts.workflow;
    document.getElementById("countGPU").textContent = counts.gpu;

    const heroCount = document.getElementById("heroToolCount");
    if (heroCount) heroCount.textContent = TOOLS_DATA.length + "+";
}

function renderTools() {
    const tools = getFilteredTools();
    const grid = document.getElementById("toolsGrid");
    const countEl = document.getElementById("resultsCount");

    countEl.textContent = `Showing ${tools.length} of ${TOOLS_DATA.length} tools`;

    if (tools.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:4rem 2rem; color: rgba(255,255,255,0.6);">
                <p style="font-size:3rem; margin-bottom:1rem;">🔍</p>
                <p style="font-size:1.2rem;">No tools match your current filters.</p>
                <p style="margin-top:0.5rem;">Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = tools.map(tool => {
        const cat = CATEGORY_CONFIG[tool.category];
        const metaItems = getMetaItems(tool);
        const domain = tool.url ? new URL(tool.url).hostname.replace('www.', '') : '';
        const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
        const initial = tool.provider ? tool.provider.charAt(0).toUpperCase() : '?';
        const iconContent = faviconUrl
            ? `<img src="${faviconUrl}" alt="${tool.provider}" class="provider-favicon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <span class="provider-initial" style="display:none">${initial}</span>`
            : `<span class="provider-initial">${initial}</span>`;

        const badgeHtml = tool.badge
            ? `<span class="tool-card-badge ${cat.badgeClass} status-badge-${tool.badge.toLowerCase().replace(/\s+/g,'-')}">${tool.badge}</span>`
            : `<span class="tool-card-badge ${cat.badgeClass}">${cat.label}</span>`;

        return `
            <div class="tool-card" data-id="${tool.id}" data-cat="${tool.category}">
                <div class="tool-card-screenshot">
                    <div class="provider-icon-wrap">
                        ${iconContent}
                    </div>
                    <span class="tool-category-pill ${cat.badgeClass}">${cat.icon} ${cat.label}</span>
                </div>
                <div class="tool-card-body">
                    <div class="tool-card-header">
                        <h3 class="tool-card-name">${tool.name}</h3>
                        ${badgeHtml}
                    </div>
                    <p class="tool-card-provider">${tool.provider}</p>
                    <p class="tool-card-desc">${tool.description}</p>
                    <div class="tool-card-meta">
                        ${metaItems.map(m => `
                            <span class="tool-meta-item">
                                <span class="tool-meta-icon">${m.icon}</span>
                                ${m.text}
                            </span>
                        `).join("")}
                    </div>
                    <div class="tool-card-footer">
                        <span class="tool-price">${formatPrice(tool)}</span>
                        <a href="${tool.url}" target="_blank" rel="noopener" class="tool-link">Visit →</a>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Click handlers for modal
    grid.querySelectorAll(".tool-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = parseInt(card.dataset.id);
            const tool = TOOLS_DATA.find(t => t.id === id);
            if (tool) openModal(tool);
        });
    });
}

function getMetaItems(tool) {
    const items = [];
    switch (tool.category) {
        case "vlm":
            if (tool.context_window) items.push({ icon: "📏", text: tool.context_window + " ctx" });
            if (tool.benchmark_score) items.push({ icon: "📊", text: tool.benchmark_score });
            if (tool.open_source) items.push({ icon: "🔓", text: "Open Source" });
            break;
        case "video":
            if (tool.max_duration) items.push({ icon: "⏱️", text: tool.max_duration + "s max" });
            if (tool.resolution) items.push({ icon: "📺", text: tool.resolution });
            if (tool.api_available) items.push({ icon: "🔌", text: "API" });
            break;
        case "image":
            if (tool.ComfyUI_node) items.push({ icon: "🔧", text: "ComfyUI" });
            if (tool.api_endpoint) items.push({ icon: "🔌", text: "API" });
            if (tool.best_for) items.push({ icon: "🎯", text: tool.best_for });
            break;
        case "audio":
            if (tool.category_type) items.push({ icon: "🏷️", text: tool.category_type });
            if (tool.api_available) items.push({ icon: "🔌", text: "API" });
            if (tool.royalty_free) items.push({ icon: "©️", text: "Royalty Free" });
            break;
        case "workflow":
            if (tool.type) items.push({ icon: "📍", text: tool.type });
            if (tool.custom_nodes_count) items.push({ icon: "🧩", text: tool.custom_nodes_count + " nodes" });
            if (tool.api_available) items.push({ icon: "🔌", text: "API" });
            break;
        case "gpu":
            if (tool.rtx4090_hr && tool.rtx4090_hr !== "N/A (per-prediction)" && tool.rtx4090_hr !== "N/A (per-inference)") {
                items.push({ icon: "🎮", text: "4090: " + (tool.rtx4090_hr.startsWith('$') ? tool.rtx4090_hr : '$' + tool.rtx4090_hr) + "/hr" });
            }
            if (tool.serverless) items.push({ icon: "☁️", text: "Serverless" });
            if (tool.free_tier) items.push({ icon: "🆓", text: "Free Tier" });
            break;
    }
    return items;
}

function formatPrice(tool) {
    if (tool.category === "gpu") {
        const rate = (tool.rtx4090_hr && tool.rtx4090_hr !== "N/A (per-prediction)" && tool.rtx4090_hr !== "N/A (per-inference)")
            ? tool.rtx4090_hr
            : (tool.a100_hr && tool.a100_hr !== "N/A (per-prediction)" && tool.a100_hr !== "N/A (per-inference)")
                ? tool.a100_hr
                : null;
        return rate ? `From ${rate.startsWith('$') ? rate : '$' + rate}/hr` : "Per-inference / API";
    }
    return tool.pricing || "Contact for pricing";
}

function openModal(tool) {
    const modal = document.getElementById("toolModal");
    const cat = CATEGORY_CONFIG[tool.category];

    document.getElementById("modalBadge").className = `modal-category-badge ${cat.badgeClass}`;
    document.getElementById("modalBadge").textContent = cat.label;
    document.getElementById("modalTitle").textContent = tool.name;
    document.getElementById("modalProvider").textContent = `by ${tool.provider}`;

    let rows = "";

    // Description
    rows += `<tr><td>Description</td><td>${tool.description}</td></tr>`;

    // Category-specific fields
    switch (tool.category) {
        case "vlm":
            rows += buildRow("Parameters", tool.params);
            rows += buildRow("Context Window", tool.context_window);
            rows += buildRow("Vision Capable", tool.vision_capable ? "✅ Yes" : "❌ No");
            rows += buildRow("Pricing", tool.pricing);
            rows += buildRow("Open Source", tool.open_source ? "✅ Yes" : "❌ No");
            rows += buildRow("License", tool.license);
            rows += buildRow("Benchmark Score", tool.benchmark_score);
            break;
        case "video":
            rows += buildRow("Max Duration", tool.max_duration ? `${tool.max_duration} seconds` : "N/A");
            rows += buildRow("Resolution", tool.resolution);
            rows += buildRow("Pricing", tool.pricing);
            rows += buildRow("API Available", tool.api_available ? "✅ Yes" : "❌ No");
            rows += buildRow("Commercial License", tool.commercial_license ? "✅ Yes" : "❌ No");
            if (tool.strengths && tool.strengths.length) {
                rows += `<tr><td>Strengths</td><td><div class="modal-strengths">${tool.strengths.map(s => `<span class="modal-strength">${s}</span>`).join("")}</div></td></tr>`;
            }
            break;
        case "image":
            rows += buildRow("Model Type", tool.model_type);
            rows += buildRow("Pricing", tool.pricing);
            rows += buildRow("API Endpoint", tool.api_endpoint ? "✅ Yes" : "❌ No");
            rows += buildRow("ComfyUI Node", tool.ComfyUI_node ? "✅ Yes" : "❌ No");
            rows += buildRow("Best For", tool.best_for);
            break;
        case "audio":
            rows += buildRow("Category", tool.category_type);
            rows += buildRow("Pricing", tool.pricing);
            rows += buildRow("API Available", tool.api_available ? "✅ Yes" : "❌ No");
            rows += buildRow("Royalty Free", tool.royalty_free ? "✅ Yes" : "❌ No");
            if (tool.use_cases && tool.use_cases.length) {
                rows += `<tr><td>Use Cases</td><td><div class="modal-strengths">${tool.use_cases.map(u => `<span class="modal-strength">${u}</span>`).join("")}</div></td></tr>`;
            }
            break;
        case "workflow":
            rows += buildRow("Type", tool.type);
            rows += buildRow("GPU Required", tool.gpu_required ? "✅ Yes" : "❌ No");
            rows += buildRow("Custom Nodes", tool.custom_nodes_count);
            rows += buildRow("API Available", tool.api_available ? "✅ Yes" : "❌ No");
            rows += buildRow("Learning Curve", tool.learning_curve);
            break;
        case "gpu":
            rows += buildRow("RTX 4090/hr", tool.rtx4090_hr);
            rows += buildRow("A100/hr", tool.a100_hr);
            rows += buildRow("H100/hr", tool.h100_hr);
            rows += buildRow("Free Tier", tool.free_tier ? "✅ Yes" : "❌ No");
            rows += buildRow("Serverless", tool.serverless ? "✅ Yes" : "❌ No");
            rows += buildRow("Notes", tool.notes);
            break;
    }

    rows += buildRow("Website", `<a href="${tool.url}" target="_blank" rel="noopener" style="color: #667eea;">${tool.url}</a>`);

    document.getElementById("modalBody").innerHTML = `<table>${rows}</table>`;
    modal.classList.add("visible");
}

function buildRow(label, value) {
    if (!value && value !== 0 && value !== false) return "";
    return `<tr><td>${label}</td><td>${value}</td></tr>`;
}

function closeModal() {
    document.getElementById("toolModal").classList.remove("visible");
}

function quickJump(cat) {
    const tab = document.querySelector(`.tab[data-category="${cat}"]`);
    if (!tab) return;
    tab.click();
    setTimeout(() => {
        document.querySelector('.category-tabs-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
}

function updatePipelineStatus() {
    document.getElementById("totalTools").textContent = TOOLS_DATA.length;

    // Calculate next month's run
    const now = new Date();
    const nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 6, 0, 0);
    const lastRun = new Date(now.getFullYear(), now.getMonth(), 1, 6, 0, 0);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("lastRun").textContent = `${months[lastRun.getMonth()]} ${lastRun.getDate()}, ${lastRun.getFullYear()}`;
    document.getElementById("nextRun").textContent = `${months[nextRun.getMonth()]} ${nextRun.getDate()}, ${nextRun.getFullYear()}`;
}

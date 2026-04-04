# SmartGen Stack Architecture

## Complete Agent and MCP Server Ecosystem for Real-Life Content Creation Workflows

**Version:** 1.0  
**Date:** March 2026  
**Author:** VidiSmart AI Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Agent Definitions](#3-agent-definitions)
4. [MCP Server Catalog](#4-mcp-server-catalog)
    - [4.1 Video MCP Servers](#41-video-mcp-servers)
    - [4.2 Image MCP Servers](#42-image-mcp-servers)
    - [4.3 Audio MCP Servers](#43-audio-mcp-servers)
    - [4.4 Web MCP Servers](#44-web-mcp-servers)
    - [4.5 Hugging Face Multimedia Tools](#45-hugging-face-multimedia-tools)
    - [4.6 Playwright MCP Server](#46-playwright-mcp-server)
5. [Real-Life Workflow Scenarios](#5-real-life-workflow-scenarios)
6. [Agent Communication Matrix](#6-agent-communication-matrix)
7. [Deployment Options](#7-deployment-options)
8. [Appendix A: Quick Reference](#appendix-a-quick-reference)
9. [Appendix B: Environment Variables](#appendix-b-environment-variables)
10. [Appendix C: Quick-Start Installation Guide](#appendix-c-quick-start-installation-guide)

---

## 1. Executive Summary

### What is SmartGen Stack?

**SmartGen Stack** is a comprehensive, production-ready agent orchestration framework designed for enterprise-scale content creation workflows. It combines state-of-the-art AI models for video, image, and audio generation with intelligent agents coordinated through Model Context Protocol (MCP) servers.

### Purpose and Vision

The SmartGen Stack addresses the growing need for automated, high-quality content production across multiple channels. By leveraging specialized AI agents for each content domain (video, image, audio, web) and coordinating them through a central orchestration layer, organizations can:

- **Reduce production time** from weeks to hours
- **Maintain brand consistency** across all generated content
- **Scale content operations** without proportional headcount increases
- **Enable real-time personalization** at enterprise scale

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **Multi-Modal Generation** | Video, image, audio, and web content from unified prompts |
| **Agent Orchestration** | Coordinated workflows across specialized AI agents |
| **MCP Server Integration** | Standardized protocol for model/service connectivity |
| **Production Deployment** | Local, hybrid, and cloud deployment options |
| **Cost Optimization** | Intelligent routing based on pricing/performance |

### Key Differentiators

1. **Unified Architecture**: Single stack for all content types
2. **Model Agnostic**: Support for multiple providers per modality
3. **Production Ready**: Built for enterprise workloads
4. **Cost Transparent**: Clear pricing for all operations
5. **Extensible**: Easy to add new models and agents

---

## 2. Architecture Overview

### Stack Layers

The SmartGen Stack is organized into five distinct layers, each with specific responsibilities and interfaces:

```mermaid
graph TB
    subgraph Layer5[Layer 5: Presentation & Delivery]
        A1[Web Frontend]
        A2[Mobile Apps]
        A3[API Gateway]
        A4[CDN Distribution]
    end
    
    subgraph Layer4[Layer 4: Orchestration]
        B1[Orchestration Agent]
        B2[Workflow Engine]
        B3[Task Queue]
        B4[State Management]
    end
    
    subgraph Layer3[Layer 3: Specialized Agents]
        C1[Video Agent]
        C2[Image Agent]
        C3[Audio Agent]
        C4[Web Agent]
    end
    
    subgraph Layer2[Layer 2: MCP Servers]
        D1[Video MCP Servers]
        D2[Image MCP Servers]
        D3[Audio MCP Servers]
        D4[Web MCP Servers]
    end
    
    subgraph Layer1[Layer 1: AI Models & Services]
        E1[LTX 2.3]
        E2[Wan 2.6]
        E3[Qwen-Image]
        E4[FLUX.2]
        E5[Audio Models]
        E6[ChatCompare]
    end
    
    Layer5 --> Layer4
    Layer4 --> Layer3
    Layer3 --> Layer2
    Layer2 --> Layer1
```

### Layer Descriptions

#### Layer 1: AI Models & Services
The foundation layer containing all AI models and external services:
- **Video Generation**: LTX 2.3, Wan 2.6, Video-Reason/VBVR-Wan2.2
- **Image Generation**: Qwen-Image, Qwen-Image Layered, Tongyi Wanxiang, FLUX.2 family
- **Audio Processing**: Speech-to-text, TTS, music generation models
- **Web Services**: ChatCompare, deployment platforms

#### Layer 2: MCP Servers
Model Context Protocol servers provide standardized interfaces:
- Connection pooling and management
- Request/response transformation
- Rate limiting and quota management
- Health monitoring and failover

#### Layer 3: Specialized Agents
Domain-specific agents with deep expertise:
- **Video Agent**: Generation, editing, effects, compositing
- **Image Agent**: Generation, editing, upscaling, layering
- **Audio Agent**: Transcription, TTS, music, sound design
- **Web Agent**: Frontend generation, deployment, optimization

#### Layer 4: Orchestration
Coordination and workflow management:
- **Orchestration Agent**: Central coordinator
- **Workflow Engine**: DAG-based execution
- **Task Queue**: Reliable job processing
- **State Management**: Persistent workflow state

#### Layer 5: Presentation & Delivery
User-facing interfaces and distribution:
- Web dashboards and editors
- Mobile applications
- REST/GraphQL APIs
- CDN integration for asset delivery

### Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestration Agent
    participant VA as Video Agent
    participant IA as Image Agent
    participant AA as Audio Agent
    participant MCP as MCP Servers
    participant M as AI Models
    
    U->>O: Content Request (prompt)
    O->>O: Parse & Plan Workflow
    O->>IA: Generate Images
    IA->>MCP: Request Image Generation
    MCP->>M: Call Qwen-Image/FLUX.2
    M-->>MCP: Return Generated Image
    MCP-->>IA: Return Image URL
    IA-->>O: Images Complete
    
    O->>AA: Generate Audio
    AA->>MCP: Request Audio Generation
    MCP->>M: Call TTS/Music Model
    M-->>MCP: Return Audio File
    MCP-->>AA: Return Audio URL
    AA-->>O: Audio Complete
    
    O->>VA: Generate Video
    VA->>MCP: Request Video Generation
    MCP->>M: Call LTX 2.3/Wan 2.6
    M-->>MCP: Return Video File
    MCP-->>VA: Return Video URL
    VA-->>O: Video Complete
    
    O->>O: Composite Final Output
    O-->>U: Deliver Complete Content
```

---

## 3. Agent Definitions

### 3.1 Audio Agent

#### Purpose
The Audio Agent handles all audio-related content generation and processing, from speech transcription to music composition and sound design.

#### Capabilities

| Capability | Models/Services | Use Cases |
|------------|-----------------|-----------|
| **Speech-to-Text** | Whisper, AssemblyAI | Transcription, captions, subtitles |
| **Text-to-Speech** | ElevenLabs, PlayHT, Azure TTS | Voiceovers, narrations, announcements |
| **Music Generation** | Suno, Udio, MusicLM | Background music, jingles, themes |
| **Sound Design** | AudioLDM, Stable Audio | SFX, ambience, audio branding |
| **Voice Cloning** | ElevenLabs, Resemble AI | Custom voices, localization |
| **Audio Enhancement** | Adobe Enhance, Krisp | Noise removal, quality improvement |

#### Configuration

```json
{
  "agent": "audio-agent",
  "version": "1.0.0",
  "capabilities": ["stt", "tts", "music", "sfx", "enhancement"],
  "default_models": {
    "stt": "whisper-large-v3",
    "tts": "elevenlabs-multilingual-v2",
    "music": "suno-v3",
    "sfx": "stable-audio-open-1.0"
  },
  "pricing_tiers": {
    "stt": "$0.006/minute",
    "tts": "$0.30/1K characters",
    "music": "$0.10/generated track",
    "sfx": "$0.05/generated effect"
  }
}
```

#### MCP Server Integration

| MCP Server | Endpoint | Purpose |
|------------|----------|---------|
| `mcp-audio-whisper` | `localhost:8001` | Speech transcription |
| `mcp-audio-elevenlabs` | `localhost:8002` | Text-to-speech generation |
| `mcp-audio-suno` | `localhost:8003` | Music generation |
| `mcp-audio-stable-audio` | `localhost:8004` | Sound effects generation |

#### Hardware Requirements (Local)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3060 12GB | RTX 4090 24GB |
| **VRAM** | 12GB | 24GB+ |
| **RAM** | 32GB | 64GB |
| **Storage** | 100GB SSD | 500GB NVMe |

---

### 3.2 Image Agent

#### Purpose
The Image Agent manages all image generation, editing, and manipulation tasks, supporting multiple state-of-the-art models for different use cases.

#### Supported Models

| Model | Provider | Context | Pricing | Best For |
|-------|----------|---------|---------|----------|
| **Qwen-Image** | Alibaba | 4K resolution | $0.02/image | General purpose, Asian markets |
| **Qwen-Image Layered** | Alibaba | Layered PSD | $0.05/image | Professional editing, compositing |
| **Tongyi Wanxiang** | Alibaba | 2K-4K | $0.03/image | Artistic styles, illustrations |
| **FLUX.2** | Black Forest Labs | 2MP | $0.02/M tokens | High quality, fast generation |
| **FLUX.2 Max** | Black Forest Labs | 4MP | $0.04/M tokens | Maximum quality, detailed scenes |
| **FLUX.2 Klein-4B** | Black Forest Labs | 1MP | $3.50/M tokens | Efficient, low-resource deployment |

#### Capabilities

| Capability | Description | Models Used |
|------------|-------------|-------------|
| **Text-to-Image** | Generate images from prompts | All models |
| **Image-to-Image** | Transform existing images | FLUX.2, Qwen-Image |
| **Inpainting** | Edit specific regions | FLUX.2 Max, Qwen Layered |
| **Outpainting** | Extend image boundaries | FLUX.2, Tongyi Wanxiang |
| **Upscaling** | Increase resolution 2x-8x | FLUX.2 Max |
| **Layering** | Generate layered compositions | Qwen-Image Layered |
| **Background Removal** | Isolate subjects | FLUX.2 + SAM |
| **Style Transfer** | Apply artistic styles | Tongyi Wanxiang |

#### Configuration

```json
{
  "agent": "image-agent",
  "version": "1.0.0",
  "capabilities": ["txt2img", "img2img", "inpaint", "outpaint", "upscale", "layer"],
  "default_models": {
    "general": "flux.2",
    "high_quality": "flux.2-max",
    "layered": "qwen-image-layered",
    "artistic": "tongyi-wanxiang",
    "efficient": "flux.2-klein-4b"
  },
  "pricing": {
    "flux.2": "$0.02/M tokens",
    "flux.2-max": "$0.04/M tokens",
    "flux.2-klein-4b": "$3.50/M tokens",
    "qwen-image": "$0.02/image",
    "qwen-image-layered": "$0.05/image",
    "tongyi-wanxiang": "$0.03/image"
  }
}
```

#### MCP Server Integration

| MCP Server | Endpoint | Models | Purpose |
|------------|----------|--------|---------|
| `mcp-image-qwen` | `localhost:8010` | Qwen-Image, Layered | Alibaba models |
| `mcp-image-tongyi` | `localhost:8011` | Tongyi Wanxiang | Artistic generation |
| `mcp-image-flux` | `localhost:8012` | FLUX.2 family | Black Forest models |
| `mcp-image-upscale` | `localhost:8013` | Real-ESRGAN | Upscaling operations |

#### Hardware Requirements (Local)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3080 10GB | RTX 4090 24GB |
| **VRAM** | 10GB | 24GB+ |
| **RAM** | 32GB | 64GB |
| **Storage** | 200GB SSD | 1TB NVMe |

---

### 3.3 Video Agent

#### Purpose
The Video Agent handles video generation, editing, effects, and compositing workflows, leveraging cutting-edge video generation models.

#### Supported Models

| Model | Provider | Max Duration | Resolution | Pricing | Best For |
|-------|----------|--------------|------------|---------|----------|
| **LTX 2.3 Lightning** | Lightricks | 10s | 720p-1080p | $0.05/sec | Fast generation, social content |
| **Wan 2.6 WanX** | Alibaba | 30s | 1080p | $0.08/sec | High quality, commercial use |
| **Video-Reason/VBVR-Wan2.2** | Research | 60s | 1080p-2K | $0.10/sec | Complex reasoning, long-form |

#### Capabilities

| Capability | Description | Models Used |
|------------|-------------|-------------|
| **Text-to-Video** | Generate video from prompts | All models |
| **Image-to-Video** | Animate static images | LTX 2.3, Wan 2.6 |
| **Video Editing** | Cut, trim, transition | VBVR-Wan2.2 |
| **Visual Effects** | Add VFX, particles | Wan 2.6 |
| **Compositing** | Layer multiple elements | VBVR-Wan2.2 |
| **Frame Interpolation** | Smooth motion (60fps) | LTX 2.3 |
| **Style Transfer** | Apply visual styles | Wan 2.6 |
| **Lip Sync** | Match audio to video | VBVR-Wan2.2 + Audio Agent |

#### Configuration

```json
{
  "agent": "video-agent",
  "version": "1.0.0",
  "capabilities": ["txt2vid", "img2vid", "edit", "vfx", "composite", "lipsync"],
  "default_models": {
    "fast": "ltx-2.3-lightning",
    "quality": "wan-2.6-wanx",
    "complex": "vbvr-wan2.2"
  },
  "pricing": {
    "ltx-2.3-lightning": "$0.05/second",
    "wan-2.6-wanx": "$0.08/second",
    "vbvr-wan2.2": "$0.10/second"
  },
  "output_formats": ["mp4", "webm", "mov", "gif"],
  "max_resolution": "2K",
  "frame_rates": [24, 30, 60]
}
```

#### MCP Server Integration

| MCP Server | Endpoint | Models | Purpose |
|------------|----------|--------|---------|
| `mcp-video-ltx` | `localhost:8020` | LTX 2.3 | Fast video generation |
| `mcp-video-wan` | `localhost:8021` | Wan 2.6 | High-quality video |
| `mcp-video-vbvr` | `localhost:8022` | VBVR-Wan2.2 | Complex video workflows |
| `mcp-video-ffmpeg` | `localhost:8023` | FFmpeg | Video processing |

#### Hardware Requirements (Local)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3090 24GB | RTX 4090 24GB+ |
| **VRAM** | 24GB | 48GB+ (dual GPU) |
| **RAM** | 64GB | 128GB |
| **Storage** | 500GB NVMe | 2TB NVMe |
| **CPU** | Ryzen 7/Intel i7 | Ryzen 9/Intel i9 |

---

### 3.4 Web Agent

#### Purpose
The Web Agent generates, deploys, and optimizes web applications and landing pages, integrating with modern deployment platforms and optimization tools.

#### Supported Services

| Service | Provider | Context Window | Pricing | Best For |
|---------|----------|----------------|---------|----------|
| **ChatCompare** | CompareAI | 46,864 tokens | $0/M tokens | Code generation, analysis |
| **Vercel** | Vercel Inc | N/A | Free-$200/mo | Frontend deployment |
| **Netlify** | Netlify Inc | N/A | Free-$199/mo | JAMstack deployment |
| **Cloudflare Pages** | Cloudflare | N/A | Free-$200/mo | Edge deployment |

#### Capabilities

| Capability | Description | Services Used |
|------------|-------------|---------------|
| **Frontend Generation** | Generate React/Next.js code | ChatCompare |
| **Component Library** | Reusable UI components | ChatCompare |
| **Deployment** | One-click deployment | Vercel, Netlify |
| **Optimization** | Performance tuning | ChatCompare + Lighthouse |
| **SEO** | Meta tags, structured data | ChatCompare |
| **A/B Testing** | Experiment configuration | Vercel, Optimizely |
| **Analytics** | Integration setup | Google Analytics, Plausible |

#### Configuration

```json
{
  "agent": "web-agent",
  "version": "1.0.0",
  "capabilities": ["generate", "deploy", "optimize", "seo", "ab-test"],
  "default_services": {
    "code_generation": "chatcompare",
    "deployment": "vercel",
    "analytics": "plausible",
    "optimization": "lighthouse"
  },
  "pricing": {
    "chatcompare": "$0/M tokens",
    "vercel": "$20/month pro",
    "netlify": "$19/month team",
    "cloudflare-pages": "$5/month"
  },
  "supported_frameworks": ["nextjs", "react", "vue", "svelte", "astro"],
  "output_formats": ["static", "ssr", "edge"]
}
```

#### MCP Server Integration

| MCP Server | Endpoint | Services | Purpose |
|------------|----------|----------|---------|
| `mcp-web-chatcompare` | `localhost:8030` | ChatCompare | Code generation |
| `mcp-web-vercel` | `localhost:8031` | Vercel API | Deployment |
| `mcp-web-netlify` | `localhost:8032` | Netlify API | Alternative deployment |
| `mcp-web-cloudflare` | `localhost:8033` | Cloudflare API | Edge deployment |
| `mcp-web-analytics` | `localhost:8034` | GA/Plausible | Analytics integration |

#### Hardware Requirements (Local)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 8GB | 16GB |
| **Storage** | 50GB SSD | 100GB NVMe |
| **Network** | 100 Mbps | 1 Gbps |

---

### 3.5 Orchestration Agent

#### Purpose
The Orchestration Agent is the central coordinator that manages workflows, routes tasks to specialized agents, handles state management, and ensures reliable execution.

#### Capabilities

| Capability | Description |
|------------|-------------|
| **Workflow Planning** | Parse requests into executable DAGs |
| **Task Routing** | Route tasks to appropriate agents |
| **State Management** | Track workflow progress and state |
| **Error Handling** | Retry logic, fallback strategies |
| **Resource Management** | Load balancing, quota management |
| **Cost Optimization** | Route based on pricing/performance |
| **Audit Logging** | Complete execution history |

#### Architecture

```mermaid
graph LR
    subgraph Orchestration Agent
        A[Request Parser]
        B[Workflow Planner]
        C[Task Router]
        D[State Manager]
        E[Error Handler]
        F[Cost Optimizer]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    C --> G[Video Agent]
    C --> H[Image Agent]
    C --> I[Audio Agent]
    C --> J[Web Agent]
```

#### Configuration

```json
{
  "agent": "orchestration-agent",
  "version": "1.0.0",
  "workflow_engine": "openfang",
  "state_backend": "postgresql",
  "task_queue": "redis",
  "features": {
    "retry_policy": {
      "max_retries": 3,
      "backoff": "exponential",
      "initial_delay_ms": 1000
    },
    "timeout_policy": {
      "default_timeout_seconds": 300,
      "max_timeout_seconds": 3600
    },
    "cost_optimization": {
      "enabled": true,
      "prefer_cheaper": true,
      "quality_threshold": 0.8
    }
  }
}
```

#### MCP Server Integration

| MCP Server | Endpoint | Purpose |
|------------|----------|---------|
| `mcp-orchestrator-core` | `localhost:8000` | Core orchestration |
| `mcp-orchestrator-state` | `localhost:8001` | State persistence |
| `mcp-orchestrator-queue` | `localhost:8002` | Task queue |
| `mcp-orchestrator-audit` | `localhost:8003` | Audit logging |

#### Hardware Requirements (Local)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 16GB | 32GB |
| **Storage** | 100GB SSD | 500GB NVMe |
| **Network** | 100 Mbps | 1 Gbps |

---

## 4. MCP Server Catalog

### 4.1 Video MCP Servers

#### mcp-video-ltx
**Purpose:** Interface with LTX 2.3 Lightning model for fast video generation

**Configuration:**
```json
{
  "name": "mcp-video-ltx",
  "version": "1.0.0",
  "endpoint": "localhost:8020",
  "protocol": "http",
  "models": ["ltx-2.3-lightning"],
  "parameters": {
    "max_duration_seconds": 10,
    "default_resolution": "720p",
    "supported_resolutions": ["480p", "720p", "1080p"],
    "frame_rates": [24, 30],
    "output_formats": ["mp4", "webm"]
  },
  "rate_limits": {
    "requests_per_minute": 60,
    "concurrent_requests": 5
  },
  "pricing": {
    "per_second": "$0.05",
    "minimum_charge": "1 second"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-video-ltx --port 8020

# Environment variables
export LTX_API_KEY="your-api-key"
export LTX_ENDPOINT="https://api.lightricks.com/v1"
```

**Use Cases:**
- Social media shorts
- Quick product demos
- Animated GIFs
- Story content

---

#### mcp-video-wan
**Purpose:** Interface with Wan 2.6 WanX model for high-quality video generation

**Configuration:**
```json
{
  "name": "mcp-video-wan",
  "version": "1.0.0",
  "endpoint": "localhost:8021",
  "protocol": "http",
  "models": ["wan-2.6-wanx"],
  "parameters": {
    "max_duration_seconds": 30,
    "default_resolution": "1080p",
    "supported_resolutions": ["720p", "1080p"],
    "frame_rates": [24, 30, 60],
    "output_formats": ["mp4", "mov", "webm"]
  },
  "rate_limits": {
    "requests_per_minute": 30,
    "concurrent_requests": 3
  },
  "pricing": {
    "per_second": "$0.08",
    "minimum_charge": "2 seconds"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-video-wan --port 8021

# Environment variables
export WAN_API_KEY="your-api-key"
export WAN_ENDPOINT="https://api.wanx.aliyun.com/v1"
```

**Use Cases:**
- Commercial advertisements
- Product showcases
- Brand videos
- Marketing content

---

#### mcp-video-vbvr
**Purpose:** Interface with Video-Reason/VBVR-Wan2.2 for complex video workflows

**Configuration:**
```json
{
  "name": "mcp-video-vbvr",
  "version": "1.0.0",
  "endpoint": "localhost:8022",
  "protocol": "http",
  "models": ["vbvr-wan2.2"],
  "parameters": {
    "max_duration_seconds": 60,
    "default_resolution": "1080p",
    "supported_resolutions": ["720p", "1080p", "2K"],
    "frame_rates": [24, 30, 60],
    "output_formats": ["mp4", "mov", "prores"],
    "features": ["reasoning", "compositing", "lipsync"]
  },
  "rate_limits": {
    "requests_per_minute": 20,
    "concurrent_requests": 2
  },
  "pricing": {
    "per_second": "$0.10",
    "minimum_charge": "5 seconds"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-video-vbvr --port 8022

# Environment variables
export VBVR_API_KEY="your-api-key"
export VBVR_ENDPOINT="https://api.videoreason.ai/v1"
```

**Use Cases:**
- Training videos with reasoning
- Multi-scene compositions
- Lip-synced presentations
- Long-form content

---

### 4.2 Image MCP Servers

#### mcp-image-qwen
**Purpose:** Interface with Qwen-Image and Qwen-Image Layered models

**Configuration:**
```json
{
  "name": "mcp-image-qwen",
  "version": "1.0.0",
  "endpoint": "localhost:8010",
  "protocol": "http",
  "models": ["qwen-image", "qwen-image-layered"],
  "parameters": {
    "max_resolution": "4096x4096",
    "supported_resolutions": ["512x512", "1024x1024", "2048x2048", "4096x4096"],
    "output_formats": ["png", "jpg", "webp", "psd"],
    "features": ["txt2img", "img2img", "layering"]
  },
  "rate_limits": {
    "requests_per_minute": 120,
    "concurrent_requests": 10
  },
  "pricing": {
    "qwen-image": "$0.02/image",
    "qwen-image-layered": "$0.05/image"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-image-qwen --port 8010

# Environment variables
export QWEN_API_KEY="your-api-key"
export QWEN_ENDPOINT="https://api.dashscope.aliyun.com/v1"
```

**Use Cases:**
- Product photography
- Marketing visuals
- Layered compositions for editing
- E-commerce imagery

---

#### mcp-image-tongyi
**Purpose:** Interface with Tongyi Wanxiang for artistic image generation

**Configuration:**
```json
{
  "name": "mcp-image-tongyi",
  "version": "1.0.0",
  "endpoint": "localhost:8011",
  "protocol": "http",
  "models": ["tongyi-wanxiang"],
  "parameters": {
    "max_resolution": "2048x2048",
    "supported_styles": ["realistic", "anime", "oil-painting", "watercolor", "sketch"],
    "output_formats": ["png", "jpg", "webp"],
    "features": ["txt2img", "img2img", "style-transfer", "outpaint"]
  },
  "rate_limits": {
    "requests_per_minute": 60,
    "concurrent_requests": 5
  },
  "pricing": {
    "per_image": "$0.03"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-image-tongyi --port 8011

# Environment variables
export TONGYI_API_KEY="your-api-key"
export TONGYI_ENDPOINT="https://api.tongyi.aliyun.com/v1"
```

**Use Cases:**
- Artistic illustrations
- Style transfer
- Creative concepts
- Brand artwork

---

#### mcp-image-flux
**Purpose:** Interface with FLUX.2 family of models

**Configuration:**
```json
{
  "name": "mcp-image-flux",
  "version": "1.0.0",
  "endpoint": "localhost:8012",
  "protocol": "http",
  "models": ["flux.2", "flux.2-max", "flux.2-klein-4b"],
  "parameters": {
    "max_resolution": "4MP",
    "output_formats": ["png", "jpg", "webp"],
    "features": ["txt2img", "img2img", "inpaint", "outpaint", "upscale"]
  },
  "rate_limits": {
    "requests_per_minute": 100,
    "concurrent_requests": 8
  },
  "pricing": {
    "flux.2": "$0.02/M tokens",
    "flux.2-max": "$0.04/M tokens",
    "flux.2-klein-4b": "$3.50/M tokens"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-image-flux --port 8012

# Environment variables
export FLUX_API_KEY="your-api-key"
export FLUX_ENDPOINT="https://api.bfl.ml/v1"
```

**Use Cases:**
- High-quality photography
- Detailed illustrations
- Professional compositing
- Efficient local deployment (Klein-4B)

---

### 4.3 Audio MCP Servers

#### mcp-audio-whisper
**Purpose:** Speech-to-text transcription using Whisper

**Configuration:**
```json
{
  "name": "mcp-audio-whisper",
  "version": "1.0.0",
  "endpoint": "localhost:8001",
  "protocol": "http",
  "models": ["whisper-large-v3", "whisper-medium", "whisper-small"],
  "parameters": {
    "supported_languages": 99,
    "max_audio_duration_minutes": 120,
    "output_formats": ["srt", "vtt", "json", "txt"],
    "features": ["transcription", "translation", "speaker-diarization"]
  },
  "rate_limits": {
    "requests_per_minute": 30,
    "concurrent_requests": 5
  },
  "pricing": {
    "per_minute": "$0.006"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-audio-whisper --port 8001

# Environment variables
export WHISPER_API_KEY="your-api-key"
export WHISPER_ENDPOINT="https://api.openai.com/v1"
```

**Use Cases:**
- Video transcription
- Podcast captions
- Meeting notes
- Multi-language translation

---

#### mcp-audio-elevenlabs
**Purpose:** Text-to-speech generation using ElevenLabs

**Configuration:**
```json
{
  "name": "mcp-audio-elevenlabs",
  "version": "1.0.0",
  "endpoint": "localhost:8002",
  "protocol": "http",
  "models": ["elevenlabs-multilingual-v2", "elevenlabs-turbo-v2"],
  "parameters": {
    "supported_languages": 29,
    "available_voices": 1000,
    "max_text_length": 5000,
    "output_formats": ["mp3", "wav", "ogg"],
    "features": ["tts", "voice-cloning", "speech-to-speech"]
  },
  "rate_limits": {
    "requests_per_minute": 60,
    "concurrent_requests": 10
  },
  "pricing": {
    "per_character": "$0.0003",
    "voice_cloning": "$5/voice"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-audio-elevenlabs --port 8002

# Environment variables
export ELEVENLABS_API_KEY="your-api-key"
```

**Use Cases:**
- Video voiceovers
- Audiobook narration
- Character voices
- Multi-language dubbing

---

#### mcp-audio-suno
**Purpose:** Music generation using Suno

**Configuration:**
```json
{
  "name": "mcp-audio-suno",
  "version": "1.0.0",
  "endpoint": "localhost:8003",
  "protocol": "http",
  "models": ["suno-v3", "suno-v3-instrumental"],
  "parameters": {
    "max_duration_seconds": 120,
    "genres": ["pop", "rock", "electronic", "classical", "jazz", "ambient"],
    "output_formats": ["mp3", "wav"],
    "features": ["music-generation", "lyrics-generation", "instrumental"]
  },
  "rate_limits": {
    "requests_per_minute": 20,
    "concurrent_requests": 3
  },
  "pricing": {
    "per_track": "$0.10"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-audio-suno --port 8003

# Environment variables
export SUNO_API_KEY="your-api-key"
```

**Use Cases:**
- Background music
- Jingles and themes
- Podcast intros
- Video soundtracks

---

#### mcp-audio-stable-audio
**Purpose:** Sound effects generation using Stable Audio

**Configuration:**
```json
{
  "name": "mcp-audio-stable-audio",
  "version": "1.0.0",
  "endpoint": "localhost:8004",
  "protocol": "http",
  "models": ["stable-audio-open-1.0"],
  "parameters": {
    "max_duration_seconds": 47,
    "sample_rate": 44100,
    "output_formats": ["wav", "mp3"],
    "features": ["sfx-generation", "ambience", "loops"]
  },
  "rate_limits": {
    "requests_per_minute": 60,
    "concurrent_requests": 10
  },
  "pricing": {
    "per_effect": "$0.05"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-audio-stable-audio --port 8004

# Environment variables
export STABILITY_API_KEY="your-api-key"
```

**Use Cases:**
- Sound effects
- Ambient backgrounds
- UI sounds
- Game audio

---

### 4.4 Web MCP Servers

#### mcp-web-chatcompare
**Purpose:** Code generation and analysis using ChatCompare

**Configuration:**
```json
{
  "name": "mcp-web-chatcompare",
  "version": "1.0.0",
  "endpoint": "localhost:8030",
  "protocol": "http",
  "models": ["chatcompare"],
  "parameters": {
    "context_window": 46864,
    "supported_languages": ["javascript", "typescript", "python", "html", "css"],
    "features": ["code-generation", "code-analysis", "refactoring", "debugging"]
  },
  "rate_limits": {
    "requests_per_minute": 100,
    "concurrent_requests": 20
  },
  "pricing": {
    "per_million_tokens": "$0.00"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-web-chatcompare --port 8030

# Environment variables
export CHATCOMPARE_API_KEY="your-api-key"
export CHATCOMPARE_ENDPOINT="https://api.chatcompare.com/v1"
```

**Use Cases:**
- Frontend code generation
- Component libraries
- Code review
- Bug fixing

---

#### mcp-web-vercel
**Purpose:** Deployment to Vercel platform

**Configuration:**
```json
{
  "name": "mcp-web-vercel",
  "version": "1.0.0",
  "endpoint": "localhost:8031",
  "protocol": "http",
  "services": ["vercel"],
  "parameters": {
    "supported_frameworks": ["nextjs", "react", "vue", "svelte", "astro"],
    "deployment_types": ["static", "ssr", "edge"],
    "features": ["deploy", "preview", "rollback", "analytics"]
  },
  "rate_limits": {
    "requests_per_minute": 30,
    "concurrent_requests": 5
  },
  "pricing": {
    "hobby": "free",
    "pro": "$20/month",
    "enterprise": "custom"
  }
}
```

**Connection Details:**
```bash
# Start server
npx @smartgen/mcp-web-vercel --port 8031

# Environment variables
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_TEAM_ID="your-team-id"
```

**Use Cases:**
- Frontend deployment
- Preview deployments
- Production releases
- A/B testing

---

## 4.5 Hugging Face Multimedia Tools

### Overview

Hugging Face provides access to thousands of pre-trained models for audio, video, image, and vision tasks. This section covers the most relevant models for content creation workflows, including installation, hardware requirements, and integration patterns.

---

### 4.5.1 Audio Models

| Model | Hugging Face Path | Capabilities | VRAM Required | GPU Recommendation |
|-------|-------------------|--------------|---------------|-------------------|
| **OpenAI Whisper** | `openai/whisper-large-v3` | Speech-to-text, 99 languages, translation | 3.5GB | RTX 3060 12GB+ |
| **Whisper Tiny** | `openai/whisper-tiny` | Lightweight STT, fast transcription | 150MB | Integrated GPU |
| **Whisper Base** | `openai/whisper-base` | Basic STT, good for podcasts | 280MB | GTX 1650 4GB+ |
| **Whisper Small** | `openai/whisper-small` | Balanced STT performance | 950MB | RTX 2060 6GB+ |
| **Whisper Medium** | `openai/whisper-medium` | High accuracy STT | 2.3GB | RTX 3060 12GB+ |
| **Meta AudioCraft** | `facebook/audiocraft` | MusicGen, AudioGen for music/audio generation | 6-12GB | RTX 3080 10GB+ |
| **MusicGen** | `facebook/musicgen-large` | Music generation from text prompts | 8GB | RTX 3080 10GB+ |
| **AudioGen** | `facebook/audiogen-large` | Environmental audio generation | 6GB | RTX 3070 8GB+ |
| **Bark** | `suno/bark` | Expressive text-to-audio with emotions | 4-8GB | RTX 3070 8GB+ |
| **XTTS** | `coqui/XTTS-v2` | Multilingual TTS with voice cloning | 3GB | RTX 3060 12GB+ |
| **Demucs** | `facebook/demucs` | Music source separation (stems) | 4GB | RTX 3060 12GB+ |
| **DeepFilterNet** | `lenerx/deepfilternet` | Real-time noise reduction | 2GB | GTX 1650 4GB+ |

#### Installation Commands

```bash
# Whisper
pip install openai-whisper
# Or use transformers
pip install transformers accelerate torch

# AudioCraft / MusicGen
pip install audiocraft

# Bark
pip install git+https://github.com/suno-ai/bark.git

# XTTS
pip install TTS

# Demucs
pip install -U demucs

# DeepFilterNet
pip install deepfilternet
```

#### Usage Example (Whisper)

```python
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model_id = "openai/whisper-large-v3"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    max_new_tokens=128,
    chunk_length_s=30,
    batch_size=16,
    return_timestamps=True,
)

result = pipe("path/to/audio.mp3")
print(result["text"])
```

---

### 4.5.2 Video Models

| Model | Hugging Face Path | Capabilities | VRAM Required | GPU Recommendation |
|-------|-------------------|--------------|---------------|-------------------|
| **Stable Video Diffusion** | `stabilityai/stable-video-diffusion-img2vid` | Image-to-video generation | 8-16GB | RTX 3080 10GB+ |
| **SVD-XT** | `stabilityai/stable-video-diffusion-img2vid-xt` | Extended frames (25 frames) | 12GB | RTX 3080 Ti 12GB+ |
| **ModelScope T2V** | `damo-vilab/text-to-video-synthesis` | Text-to-video generation | 8GB | RTX 3070 8GB+ |
| **VideoCrafter2** | `VideoCrafter/VideoCrafter2` | High-quality video generation | 10GB | RTX 3080 10GB+ |
| **AnimateDiff** | `guoyww/animatediff` | Animation from text/images | 6-10GB | RTX 3070 8GB+ |
| **RIFE** | `hzwer/arXiv2023-RIFE` | Frame interpolation (60fps) | 2GB | GTX 1650 4GB+ |
| **Real-ESRGAN** | `xinntao/Real-ESRGAN` | Video/image upscaling | 4GB | RTX 3060 12GB+ |

#### Installation Commands

```bash
# Stable Video Diffusion
pip install diffusers transformers accelerate torch torchvision

# ModelScope
pip install modelscope

# VideoCrafter2
git clone https://github.com/VideoCrafter/VideoCrafter2.git
cd VideoCrafter2 && pip install -r requirements.txt

# AnimateDiff
pip install animatediff-cli-prompt-travel

# RIFE
pip install rife

# Real-ESRGAN
pip install realesrgan
```

#### Usage Example (Stable Video Diffusion)

```python
import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16,
    variant="fp16"
)
pipe.enable_model_cpu_offload()

# Load and resize image
image = load_image("path/to/input.png")
image = image.resize((1024, 576))

# Generate video
frames = pipe(image, decode_chunk_size=8, generator=torch.manual_seed(42)).frames[0]
export_to_video(frames, "output.mp4", fps=7)
```

---

### 4.5.3 Image Models

| Model | Hugging Face Path | Capabilities | VRAM Required | GPU Recommendation |
|-------|-------------------|--------------|---------------|-------------------|
| **Stable Diffusion XL** | `stabilityai/stable-diffusion-xl-base-1.0` | High-quality image generation | 8-12GB | RTX 3080 10GB+ |
| **SDXL Turbo** | `stabilityai/sdxl-turbo` | Real-time image generation | 6-10GB | RTX 3070 8GB+ |
| **SDXL Refiner** | `stabilityai/stable-diffusion-xl-refiner-1.0` | Image refinement/enhancement | 8GB | RTX 3070 8GB+ |
| **ControlNet** | `lllyasviel/control_v11p_sd15_*` | Conditional image generation | 4-8GB | RTX 3060 12GB+ |
| **IP-Adapter** | `h94/IP-Adapter` | Image prompting | 6-10GB | RTX 3070 8GB+ |
| **Roop/ReActor** | `Gourieff/roop` | Face swapping | 4-6GB | RTX 3060 12GB+ |
| **GFPGAN** | `TencentARC/GFPGAN` | Face restoration | 2-4GB | GTX 1650 4GB+ |
| **CodeFormer** | `sczhou/CodeFormer` | Face enhancement/restoration | 3-5GB | RTX 3060 12GB+ |
| **RemBG** | `danielgatis/rembg` | Background removal | 1-2GB | Integrated GPU |

#### Installation Commands

```bash
# Stable Diffusion XL
pip install diffusers transformers accelerate torch torchvision

# SDXL Turbo
pip install diffusers accelerate torch

# ControlNet
pip install controlnet-aux

# IP-Adapter
pip install ip-adapter

# Roop/ReActor (face swap)
git clone https://github.com/Gourieff/roop.git
cd roop && pip install -r requirements.txt

# GFPGAN
pip install gfpgan

# CodeFormer
pip install facexlib basicsr
pip install git+https://github.com/sczhou/CodeFormer.git

# RemBG
pip install rembg[gpu]  # GPU version
# or
pip install rembg  # CPU version
```

#### Usage Example (SDXL)

```python
import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    use_safetensors=True,
    variant="fp16",
)
pipe.to("cuda")

pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

prompt = "A professional product photograph of a sleek black smartphone on a marble surface, studio lighting, 8k"
image = pipe(prompt=prompt, num_inference_steps=30, guidance_scale=7.5).images[0]
image.save("output.png")
```

---

### 4.5.4 Vision/Multimodal Models

| Model | Hugging Face Path | Capabilities | VRAM Required | GPU Recommendation |
|-------|-------------------|--------------|---------------|-------------------|
| **Qwen2-VL** | `Qwen/Qwen2-VL-7B-Instruct` | Vision-language understanding | 14-28GB | RTX 3090 24GB+ |
| **Qwen2-VL-2B** | `Qwen/Qwen2-VL-2B-Instruct` | Lightweight VLM | 4-8GB | RTX 3060 12GB+ |
| **LLaVA** | `llava-hf/llava-1.5-13b-hf` | Visual assistant, VQA | 26GB | RTX 3090 24GB+ |
| **LLaVA-7B** | `llava-hf/llava-7b-hf` | Compact visual assistant | 14GB | RTX 3080 10GB+ |
| **Florence-2** | `microsoft/Florence-2-large` | Captioning, detection, segmentation | 2-4GB | RTX 3060 12GB+ |
| **Grounding DINO** | `IDEA-Research/grounding-dino-base` | Object detection with text | 4-8GB | RTX 3060 12GB+ |
| **SAM** | `facebook/sam-vit-huge` | Segment Anything Model | 2-4GB | RTX 3060 12GB+ |

#### Installation Commands

```bash
# Qwen2-VL
pip install transformers accelerate torch torchvision
pip install qwen-vl-utils

# LLaVA
pip install llava-torch

# Florence-2
pip install transformers accelerate torch torchvision

# Grounding DINO
pip install git+https://github.com/IDEA-Research/GroundingDINO.git

# SAM (Segment Anything)
pip install segment-anything
```

#### Usage Example (Florence-2)

```python
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

model_id = "microsoft/Florence-2-large"
processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForVision2Seq.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    trust_remote_code=True
).to(device)

image = Image.open("path/to/image.jpg")

# Caption
prompt = "<CAPTION>"
inputs = processor(text=prompt, images=image, return_tensors="pt").to(device)
generated_ids = model.generate(
    input_ids=inputs["input_ids"],
    pixel_values=inputs["pixel_values"],
    max_new_tokens=1024,
    do_sample=False,
    num_beams=3
)
caption = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
print(f"Caption: {caption}")
```

---

### 4.5.5 Hugging Face Integration Guide

#### Inference API Usage

For quick prototyping without local hardware:

```python
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="your-hf-token")

# Text-to-Image
image = client.text_to_image(
    "A futuristic cityscape at sunset, cyberpunk style",
    model="stabilityai/stable-diffusion-xl-base-1.0"
)
image.save("output.png")

# Automatic Speech Recognition
result = client.automatic_speech_recognition(
    "path/to/audio.wav",
    model="openai/whisper-large-v3"
)
print(result["text"])
```

#### Self-Hosting with Text Generation Inference (TGI)

```bash
# Pull Docker image
docker pull ghcr.io/huggingface/text-generation-inference:latest

# Run inference server
docker run --gpus all \
  -p 8080:80 \
  -v /path/to/models:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id Qwen/Qwen2-VL-7B-Instruct \
  --num-shard 1 \
  --max-input-length 4096 \
  --max-total-tokens 8192
```

#### Hardware Requirements Summary

| Category | Minimum GPU | Recommended GPU | VRAM Minimum | VRAM Recommended |
|----------|-------------|-----------------|--------------|------------------|
| **Audio (STT/TTS)** | GTX 1650 4GB | RTX 3060 12GB | 2GB | 8GB |
| **Audio (Music Gen)** | RTX 3060 12GB | RTX 3080 10GB | 6GB | 12GB |
| **Video Generation** | RTX 3070 8GB | RTX 3090 24GB | 8GB | 16GB+ |
| **Image Generation** | RTX 3060 12GB | RTX 3080 10GB | 6GB | 12GB |
| **Vision Models** | RTX 3060 12GB | RTX 3090 24GB | 8GB | 24GB |
| **Face Enhancement** | GTX 1650 4GB | RTX 3060 12GB | 2GB | 6GB |

---

## 4.6 Playwright MCP Server

### mcp-playwright

**Purpose:** Browser automation for web scraping, testing, and content capture. The Playwright MCP server provides programmatic access to Chromium, Firefox, and WebKit browsers for automated workflows.

### Installation

```bash
# Global installation
npm install -g @playwright/mcp-server

# Or local project installation
npm install @playwright/mcp-server

# Install browser binaries
npx playwright install
```

### Configuration

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/path/to/browsers",
        "PLAYWRIGHT_HEADLESS": "true"
      },
      "capabilities": {
        "navigation": true,
        "screenshots": true,
        "content_extraction": true,
        "form_interaction": true,
        "javascript_execution": true,
        "file_download": true,
        "mobile_emulation": true,
        "pdf_generation": true
      }
    }
  }
}
```

### Capabilities

| Capability | Description | Example Use Case |
|------------|-------------|------------------|
| **Navigate URLs** | Load and navigate web pages | Competitor website analysis |
| **Screenshots** | Capture full-page or element screenshots | Visual documentation, UI comparison |
| **Extract Content** | Scrape text, HTML, structured data | Content research, price monitoring |
| **Fill Forms** | Interact with form inputs | Automated testing, data submission |
| **Execute JavaScript** | Run custom JS in browser context | Dynamic content extraction |
| **Download Files** | Save files from web pages | Asset collection, document download |
| **Mobile Emulation** | Simulate mobile devices | Mobile-first testing, responsive checks |
| **PDF Generation** | Save pages as PDF | Documentation, archiving |
| **Wait for Elements** | Wait for dynamic content | SPA handling, lazy loading |
| **Cookie Management** | Handle authentication sessions | Logged-in content access |

### Use Cases

1. **Competitor Analysis**: Automatically capture competitor pricing, product descriptions, and marketing materials
2. **Content Research**: Extract articles, blog posts, and reference materials for content creation
3. **Automated Testing**: Verify generated web content renders correctly across browsers
4. **Social Media Capture**: Archive social media posts, comments, and engagement metrics
5. **Price Monitoring**: Track e-commerce pricing changes over time
6. **SEO Analysis**: Extract meta tags, headings, and structured data
7. **Visual Regression**: Compare UI changes over time with screenshots

### Example Workflow

```python
# Example: Capture competitor product page
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Navigate to product page
    page.goto("https://competitor.com/product/123")
    
    # Wait for dynamic content
    page.wait_for_selector(".product-price")
    
    # Extract data
    title = page.text_content(".product-title")
    price = page.text_content(".product-price")
    description = page.text_content(".product-description")
    
    # Capture screenshot
    page.screenshot(path="competitor-product.png", full_page=True)
    
    # Save as PDF
    page.pdf(path="competitor-product.pdf")
    
    browser.close()
    
print(f"Captured: {title} - {price}")
```

### MCP Server Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `browser/navigate` | POST | Navigate to URL |
| `browser/screenshot` | POST | Capture screenshot |
| `browser/extract` | POST | Extract content with selectors |
| `browser/click` | POST | Click element |
| `browser/type` | POST | Type text into input |
| `browser/evaluate` | POST | Execute JavaScript |
| `browser/download` | POST | Download file |
| `browser/pdf` | POST | Generate PDF |

---

## 5. Real-Life Workflow Scenarios

### 5.1 Website Hero Video Creation

**Scenario:** Create an engaging hero video for a SaaS product landing page

**Workflow:**
```mermaid
graph TD
    A[Product Brief] --> B[Orchestration Agent]
    B --> C[Image Agent: Generate Storyboard]
    C --> D[Video Agent: Generate Base Video]
    D --> E[Audio Agent: Generate Voiceover]
    E --> F[Audio Agent: Generate Background Music]
    F --> G[Video Agent: Composite & Sync]
    G --> H[Web Agent: Deploy to Landing Page]
    H --> I[Final Review]
```

**Steps:**

1. **Input**: Product brief with key features and brand guidelines
2. **Image Agent** generates storyboard frames using FLUX.2 Max
   - Cost: ~$0.20 for 5 frames
   - Time: 2-3 minutes
3. **Video Agent** animates storyboard using Wan 2.6
   - Cost: ~$2.40 for 30 seconds
   - Time: 5-7 minutes
4. **Audio Agent** generates voiceover using ElevenLabs
   - Cost: ~$0.15 for 100 words
   - Time: 1 minute
5. **Audio Agent** generates background music using Suno
   - Cost: ~$0.10
   - Time: 2 minutes
6. **Video Agent** composites all elements with lip-sync
   - Cost: ~$3.00 for compositing
   - Time: 5 minutes
7. **Web Agent** deploys to landing page via Vercel
   - Cost: Included in Vercel plan
   - Time: 1 minute

**Total Cost:** ~$5.85  
**Total Time:** ~15-20 minutes

---

### 5.2 Product Landing Page Generation

**Scenario:** Generate a complete product landing page from a product description

**Workflow:**
```mermaid
graph TD
    A[Product Description] --> B[Orchestration Agent]
    B --> C[Web Agent: Generate Page Structure]
    C --> D[Image Agent: Generate Product Images]
    D --> E[Image Agent: Generate Icons/Graphics]
    E --> F[Web Agent: Assemble Components]
    F --> G[Web Agent: Deploy & Optimize]
    G --> H[Final Review]
```

**Steps:**

1. **Input**: Product description and brand assets
2. **Web Agent** generates page structure using ChatCompare
   - Cost: Free (ChatCompare is $0/M tokens)
   - Time: 2-3 minutes
3. **Image Agent** generates product images using Qwen-Image Layered
   - Cost: ~$0.10 for 5 images
   - Time: 3-4 minutes
4. **Image Agent** generates icons using FLUX.2
   - Cost: ~$0.08 for 8 icons
   - Time: 2 minutes
5. **Web Agent** assembles components and applies styling
   - Cost: Free
   - Time: 2-3 minutes
6. **Web Agent** deploys to Vercel with optimization
   - Cost: Included in Vercel plan
   - Time: 1-2 minutes

**Total Cost:** ~$0.18  
**Total Time:** ~10-15 minutes

---

### 5.3 Social Media Content Pipeline

**Scenario:** Create a week's worth of social media content from a single video

**Workflow:**
```mermaid
graph TD
    A[Source Video] --> B[Orchestration Agent]
    B --> C[Video Agent: Extract Clips]
    C --> D[Image Agent: Generate Thumbnails]
    D --> E[Audio Agent: Extract/Generate Audio]
    E --> F[Video Agent: Create Variations]
    F --> G[Web Agent: Schedule Posts]
    G --> H[Content Calendar]
```

**Steps:**

1. **Input**: Long-form video (e.g., podcast, webinar)
2. **Video Agent** extracts 30 short clips using LTX 2.3
   - Cost: ~$7.50 for 150 seconds total
   - Time: 10 minutes
3. **Image Agent** generates thumbnails for each clip
   - Cost: ~$0.60 for 30 thumbnails
   - Time: 5 minutes
4. **Audio Agent** extracts audio and generates captions
   - Cost: ~$0.30 for transcription
   - Time: 3 minutes
5. **Video Agent** creates platform-specific variations
   - Cost: ~$5.00 for variations
   - Time: 8 minutes
6. **Web Agent** schedules posts across platforms
   - Cost: Depends on scheduling tool
   - Time: 2 minutes

**Total Cost:** ~$13.40  
**Total Time:** ~28 minutes  
**Output:** 30 pieces of content for a week

---

### 5.4 Corporate Training Video Production

**Scenario:** Convert training materials into engaging video content

**Workflow:**
```mermaid
graph TD
    A[Training Documents] --> B[Orchestration Agent]
    B --> C[Audio Agent: Generate Script]
    C --> D[Image Agent: Generate Visuals]
    D --> E[Video Agent: Generate Video Segments]
    E --> F[Audio Agent: Generate Narration]
    F --> G[Video Agent: Composite with Lip-Sync]
    G --> H[Web Agent: Deploy to LMS]
    H --> I[Training Portal]
```

**Steps:**

1. **Input**: Training documents, slides, scripts
2. **Audio Agent** generates narration script using ChatCompare
   - Cost: Free
   - Time: 2-3 minutes
3. **Image Agent** generates visual aids using Qwen-Image
   - Cost: ~$1.00 for 50 images
   - Time: 10 minutes
4. **Video Agent** generates video segments using VBVR-Wan2.2
   - Cost: ~$30.00 for 5 minutes of content
   - Time: 15 minutes
5. **Audio Agent** generates professional narration
   - Cost: ~$1.50 for 5000 characters
   - Time: 3 minutes
6. **Video Agent** composites with lip-sync
   - Cost: ~$15.00 for compositing
   - Time: 10 minutes
7. **Web Agent** deploys to LMS
   - Cost: Depends on LMS
   - Time: 2 minutes

**Total Cost:** ~$47.50  
**Total Time:** ~45 minutes  
**Output:** 5 minutes of professional training video

---

### 5.5 E-commerce Product Photography

**Scenario:** Generate professional product photos for an e-commerce catalog

**Workflow:**
```mermaid
graph TD
    A[Product SKU List] --> B[Orchestration Agent]
    B --> C[Image Agent: Generate Product Images]
    C --> D[Image Agent: Generate Lifestyle Images]
    D --> E[Image Agent: Generate Variations]
    E --> F[Image Agent: Upscale & Optimize]
    F --> G[Web Agent: Upload to CDN]
    G --> H[E-commerce Platform]
```

**Steps:**

1. **Input**: Product SKU list with descriptions
2. **Image Agent** generates product shots on white background
   - Cost: ~$2.00 for 100 products
   - Time: 15 minutes
3. **Image Agent** generates lifestyle context images
   - Cost: ~$3.00 for 100 lifestyle images
   - Time: 20 minutes
4. **Image Agent** generates color/angle variations
   - Cost: ~$2.00 for 200 variations
   - Time: 15 minutes
5. **Image Agent** upscales to high resolution
   - Cost: ~$1.00 for upscaling
   - Time: 10 minutes
6. **Web Agent** uploads to CDN and updates product catalog
   - Cost: CDN storage costs
   - Time: 5 minutes

**Total Cost:** ~$8.00 (plus CDN)  
**Total Time:** ~65 minutes  
**Output:** 500+ product images for 100 SKUs

---

### 5.6 Podcast-to-Video Conversion

**Scenario:** Convert audio podcast into engaging video content for YouTube

**Workflow:**
```mermaid
graph TD
    A[Podcast Audio] --> B[Orchestration Agent]
    B --> C[Audio Agent: Transcribe]
    C --> D[Audio Agent: Identify Highlights]
    D --> E[Image Agent: Generate Visuals]
    E --> F[Video Agent: Create Video]
    F --> G[Video Agent: Add Captions]
    G --> H[Web Agent: Upload to YouTube]
    H --> I[YouTube Channel]
```

**Steps:**

1. **Input**: Podcast audio file (30-60 minutes)
2. **Audio Agent** transcribes using Whisper
   - Cost: ~$0.36 for 60 minutes
   - Time: 5 minutes
3. **Audio Agent** identifies highlights and chapters
   - Cost: Included
   - Time: 2 minutes
4. **Image Agent** generates visuals for key points
   - Cost: ~$1.00 for 50 images
   - Time: 10 minutes
5. **Video Agent** creates video with animated visuals
   - Cost: ~$15.00 for 60 minutes
   - Time: 20 minutes
6. **Video Agent** adds burned-in captions
   - Cost: Included
   - Time: 5 minutes
7. **Web Agent** uploads to YouTube with metadata
   - Cost: Free
   - Time: 3 minutes

**Total Cost:** ~$16.36  
**Total Time:** ~45 minutes  
**Output:** Full YouTube-ready video episode

---

### 5.7 App UI/UX Generation

**Scenario:** Generate complete UI/UX designs for a mobile app

**Workflow:**
```mermaid
graph TD
    A[App Requirements] --> B[Orchestration Agent]
    B --> C[Web Agent: Generate Component Library]
    C --> D[Image Agent: Generate Screen Designs]
    D --> E[Image Agent: Generate Icons/Assets]
    E --> F[Web Agent: Create Interactive Prototype]
    F --> G[Web Agent: Deploy Preview]
    G --> H[Stakeholder Review]
```

**Steps:**

1. **Input**: App requirements and user stories
2. **Web Agent** generates React component library
   - Cost: Free
   - Time: 5 minutes
3. **Image Agent** generates screen designs using FLUX.2 Max
   - Cost: ~$0.40 for 20 screens
   - Time: 10 minutes
4. **Image Agent** generates icons and assets
   - Cost: ~$0.20 for 50 icons
   - Time: 5 minutes
5. **Web Agent** creates interactive prototype
   - Cost: Free
   - Time: 10 minutes
6. **Web Agent** deploys preview to Vercel
   - Cost: Included in Vercel
   - Time: 2 minutes

**Total Cost:** ~$0.60  
**Total Time:** ~32 minutes  
**Output:** Complete interactive UI prototype

---

### 5.8 Automated Competitor Research Pipeline

**Scenario:** Automatically monitor and analyze competitor websites, extract product information, and generate comparison reports using Playwright and Vision models.

**Workflow:**
```mermaid
graph TD
    A[Competitor URL List] --> B[Orchestration Agent]
    B --> C[Playwright: Navigate & Capture]
    C --> D[Florence-2: Analyze Screenshots]
    D --> E[Qwen2-VL: Extract Product Details]
    E --> F[Whisper: Process Video Content]
    F --> G[SDXL: Generate Comparison Charts]
    G --> H[Web Agent: Publish Report]
    H --> I[Competitive Intelligence Dashboard]
```

**Steps:**

1. **Input**: List of competitor URLs and product categories
2. **Playwright MCP** navigates to each competitor site and captures screenshots
   - Cost: $0 (self-hosted)
   - Time: 2-3 minutes per site
3. **Florence-2** analyzes screenshots to identify page structure and elements
   - Cost: $0 (local inference on RTX 3060)
   - Time: 30 seconds per image
4. **Qwen2-VL** extracts detailed product information, pricing, and features
   - Cost: $0 (local inference on RTX 3090)
   - Time: 1 minute per page
5. **Whisper** transcribes any video content on competitor pages
   - Cost: $0 (local inference)
   - Time: 1 minute per minute of audio
6. **SDXL** generates visual comparison charts and infographics
   - Cost: $0 (local inference)
   - Time: 30 seconds per image
7. **Web Agent** publishes interactive report to dashboard
   - Cost: Included in hosting
   - Time: 1 minute

**Total Cost:** ~$0 (self-hosted) or ~$5 using HF Inference API
**Total Time:** ~15-20 minutes for 5 competitors
**Output:** Comprehensive competitive analysis report with visual comparisons

**Tools Used:**
- Playwright MCP Server (browser automation)
- Florence-2 (vision analysis)
- Qwen2-VL-7B-Instruct (detailed extraction)
- Whisper-large-v3 (audio transcription)
- SDXL (visualization)

---

### 5.9 Social Media Content Repurposing

**Scenario:** Transform a single long-form video into multiple social media clips with captions, thumbnails, and platform-specific formatting using Hugging Face audio/video models.

**Workflow:**
```mermaid
graph TD
    A[Source Video] --> B[Orchestration Agent]
    B --> C[Whisper: Transcribe & Timestamp]
    C --> D[Demucs: Extract Audio Stems]
    D --> E[VideoCrafter2: Generate B-Roll]
    E --> F[RIFE: Frame Interpolation]
    F --> G[SDXL: Generate Thumbnails]
    G --> H[RemBG: Create Transparent Assets]
    H --> I[Real-ESRGAN: Upscale Output]
    I --> J[Multi-Platform Export]
```

**Steps:**

1. **Input**: Long-form video (webinar, podcast, presentation)
2. **Whisper-large-v3** transcribes with word-level timestamps
   - Cost: $0 (local) or $0.006/minute (API)
   - Time: 1 minute per 10 minutes of audio
3. **Demucs** separates vocals, music, and effects for clean audio
   - Cost: $0 (local inference)
   - Time: 30 seconds per minute of audio
4. **VideoCrafter2** generates additional B-roll footage from text prompts
   - Cost: $0 (local on RTX 3080)
   - Time: 2 minutes per clip
5. **RIFE** interpolates frames for smooth 60fps playback
   - Cost: $0 (local)
   - Time: 1 minute per minute of video
6. **SDXL** generates eye-catching thumbnails for each clip
   - Cost: $0 (local)
   - Time: 15 seconds per thumbnail
7. **RemBG** removes backgrounds for transparent overlays
   - Cost: $0 (local)
   - Time: 5 seconds per image
8. **Real-ESRGAN** upscales final output to 4K
   - Cost: $0 (local)
   - Time: 30 seconds per clip

**Total Cost:** ~$0 (self-hosted with GPU)
**Total Time:** ~45 minutes for 10 clips from 60-minute source
**Output:** 10 platform-optimized clips with thumbnails and captions

**Tools Used:**
- Whisper-large-v3 (transcription)
- Demucs (audio separation)
- VideoCrafter2 (video generation)
- RIFE (frame interpolation)
- SDXL (thumbnail generation)
- RemBG (background removal)
- Real-ESRGAN (upscaling)

---

### 5.10 Product Photo Enhancement Workflow

**Scenario:** Transform raw product photos into professional e-commerce images using face enhancement, background removal, and upscaling models from Hugging Face.

**Workflow:**
```mermaid
graph TD
    A[Raw Product Photos] --> B[Orchestration Agent]
    B --> C[GFPGAN: Restore Faces]
    C --> D[CodeFormer: Enhance Details]
    D --> E[RemBG: Remove Background]
    E --> F[SDXL: Generate Lifestyle Context]
    F --> G[ControlNet: Apply Consistent Style]
    G --> H[Real-ESRGAN: Upscale to 4K]
    H --> I[E-commerce Platform]
```

**Steps:**

1. **Input**: Raw product photos (smartphone, webcam quality)
2. **GFPGAN** restores any faces in product shots (models, hands)
   - Cost: $0 (local inference on GTX 1650)
   - Time: 5 seconds per image
3. **CodeFormer** enhances facial details and removes artifacts
   - Cost: $0 (local)
   - Time: 10 seconds per image
4. **RemBG** removes backgrounds with clean edges
   - Cost: $0 (local) or $0.02/image (API)
   - Time: 3 seconds per image
5. **SDXL** generates lifestyle context backgrounds
   - Cost: $0 (local on RTX 3070)
   - Time: 15 seconds per image
6. **ControlNet** applies consistent brand style across all images
   - Cost: $0 (local)
   - Time: 20 seconds per image
7. **Real-ESRGAN** upscales to 4K for e-commerce platforms
   - Cost: $0 (local)
   - Time: 30 seconds per image

**Total Cost:** ~$0 (self-hosted) or ~$2 for 100 images (API)
**Total Time:** ~20 minutes for 100 product images
**Output:** Professional e-commerce ready images with transparent and lifestyle backgrounds

**Tools Used:**
- GFPGAN (face restoration)
- CodeFormer (face enhancement)
- RemBG (background removal)
- SDXL (background generation)
- ControlNet (style consistency)
- Real-ESRGAN (upscaling)

**Hardware Requirements:**
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | GTX 1650 4GB | RTX 3080 10GB |
| **VRAM** | 4GB | 10GB+ |
| **RAM** | 16GB | 32GB |
| **Storage** | 100GB SSD | 500GB NVMe |

---

## 6. Agent Communication Matrix

### Communication Overview

The SmartGen Stack uses a hub-and-spoke communication model with the Orchestration Agent at the center:

```mermaid
graph LR
    subgraph Agents
        OA[Orchestration Agent]
        VA[Video Agent]
        IA[Image Agent]
        AA[Audio Agent]
        WA[Web Agent]
    end
    
    subgraph MCP Layer
        MCP1[Video MCPs]
        MCP2[Image MCPs]
        MCP3[Audio MCPs]
        MCP4[Web MCPs]
    end
    
    OA <--> VA
    OA <--> IA
    OA <--> AA
    OA <--> WA
    
    VA <--> MCP1
    IA <--> MCP2
    AA <--> MCP3
    WA <--> MCP4
```

### Communication Protocols

| Protocol | Use Case | Format |
|----------|----------|--------|
| **HTTP/REST** | Agent-to-MCP | JSON |
| **WebSocket** | Real-time streaming | JSON Messages |
| **gRPC** | High-performance internal | Protocol Buffers |
| **Redis Pub/Sub** | Event notifications | JSON |

### Message Formats

#### Request Message
```json
{
  "message_id": "uuid",
  "timestamp": "ISO8601",
  "source": "orchestration-agent",
  "destination": "image-agent",
  "action": "generate",
  "parameters": {
    "model": "flux.2-max",
    "prompt": "A professional office setting",
    "resolution": "2048x2048",
    "output_format": "png"
  },
  "metadata": {
    "workflow_id": "wf-123",
    "priority": "normal",
    "timeout_seconds": 300
  }
}
```

#### Response Message
```json
{
  "message_id": "uuid",
  "timestamp": "ISO8601",
  "source": "image-agent",
  "destination": "orchestration-agent",
  "correlation_id": "original-message-id",
  "status": "success",
  "result": {
    "image_url": "https://cdn.example.com/image.png",
    "generation_time_ms": 2340,
    "tokens_used": 1024
  },
  "metadata": {
    "workflow_id": "wf-123",
    "cost": "$0.04"
  }
}
```

### Agent Interaction Table

| From | To | Message Types | Frequency |
|------|-----|---------------|-----------|
| Orchestration | Video | Generate, Edit, Composite | Per workflow |
| Orchestration | Image | Generate, Edit, Upscale | Per workflow |
| Orchestration | Audio | Transcribe, TTS, Music | Per workflow |
| Orchestration | Web | Deploy, Optimize, Analyze | Per workflow |
| Video | Audio | Sync request | During compositing |
| Image | Video | Asset delivery | During generation |
| Audio | Video | Audio track delivery | During compositing |
| Web | Image | Asset upload | During deployment |

### Event Types

| Event | Publisher | Subscribers | Description |
|-------|-----------|-------------|-------------|
| `workflow.started` | Orchestration | All agents | New workflow initiated |
| `task.completed` | Any agent | Orchestration | Task finished successfully |
| `task.failed` | Any agent | Orchestration | Task failed with error |
| `asset.ready` | Image/Video/Audio | Web Agent | Asset ready for deployment |
| `deployment.complete` | Web Agent | Orchestration | Deployment finished |

---

## 7. Deployment Options

### 7.1 Local Deployment

**Best For:** Development, testing, small-scale production, data sovereignty

#### Architecture
```mermaid
graph TB
    subgraph Local Machine
        A[Orchestration Agent]
        B[Specialized Agents]
        C[MCP Servers]
        D[Local Models]
    end
    
    A --> B
    B --> C
    C --> D
```

#### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3090 24GB | RTX 4090 24GB+ |
| **VRAM** | 24GB | 48GB+ |
| **RAM** | 64GB | 128GB |
| **Storage** | 1TB NVMe | 2TB+ NVMe |
| **CPU** | Ryzen 7/i7 | Ryzen 9/i9 |

#### Software Stack

```yaml
# docker-compose.local.yml
services:
  orchestration-agent:
    image: smartgen/orchestration:latest
    ports:
      - "8000:8000"
    environment:
      - STATE_BACKEND=postgresql://localhost:5432/smartgen
      - TASK_QUEUE=redis://localhost:6379
  
  video-agent:
    image: smartgen/video-agent:latest
    ports:
      - "8020-8023:8020-8023"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  image-agent:
    image: smartgen/image-agent:latest
    ports:
      - "8010-8013:8010-8013"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  audio-agent:
    image: smartgen/audio-agent:latest
    ports:
      - "8001-8004:8001-8004"
  
  web-agent:
    image: smartgen/web-agent:latest
    ports:
      - "8030-8034:8030-8034"
  
  postgresql:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

#### Cost Considerations

| Item | Cost |
|------|------|
| **Hardware (one-time)** | $3,000 - $8,000 |
| **Electricity (monthly)** | $50 - $150 |
| **Software licenses** | $0 - $500/month |
| **API costs** | $0 (local models) |

---

### 7.2 Hybrid Deployment

**Best For:** Production workloads, cost optimization, scalability

#### Architecture
```mermaid
graph TB
    subgraph Local
        A[Orchestration Agent]
        B[State Management]
    end
    
    subgraph Cloud
        C[Video Agent]
        D[Image Agent]
        E[Audio Agent]
        F[Web Agent]
        G[MCP Servers]
        H[Cloud Models]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H
```

#### Configuration

```yaml
# config.hybrid.yml
orchestration:
  location: local
  state_backend: local_postgresql
  
agents:
  video:
    location: cloud
    provider: aws
    instance_type: g5.2xlarge
    
  image:
    location: cloud
    provider: aws
    instance_type: g5.2xlarge
    
  audio:
    location: cloud
    provider: aws
    instance_type: c5.xlarge
    
  web:
    location: cloud
    provider: vercel
```

#### Cost Considerations

| Item | Cost |
|------|------|
| **Local hardware** | $1,000 - $2,000 |
| **Cloud compute (monthly)** | $500 - $2,000 |
| **API costs** | Usage-based |
| **Data transfer** | $0.09/GB outbound |

---

### 7.3 Cloud Deployment

**Best For:** Enterprise scale, global distribution, maximum scalability

#### Architecture
```mermaid
graph TB
    subgraph Cloud Provider
        A[Orchestration Agent]
        B[Video Agent]
        C[Image Agent]
        D[Audio Agent]
        E[Web Agent]
        F[MCP Servers]
        G[Managed Models]
    end
    
    subgraph Services
        H[Managed PostgreSQL]
        I[Managed Redis]
        J[Object Storage]
        K[CDN]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    
    A --> H
    A --> I
    
    B --> J
    C --> J
    D --> J
    
    J --> K
```

#### Cloud Provider Options

| Provider | Compute | Storage | CDN | Estimated Monthly |
|----------|---------|---------|-----|-------------------|
| **AWS** | EC2 G5 | S3 | CloudFront | $2,000 - $10,000 |
| **GCP** | A2 VMs | GCS | Cloud CDN | $1,800 - $9,000 |
| **Azure** | NCas | Blob | Azure CDN | $1,900 - $9,500 |
| **Vercel + AWS** | Lambda + EC2 | S3 | Vercel Edge | $1,500 - $8,000 |

#### Kubernetes Configuration

```yaml
# k8s/smartgen-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestration-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orchestration-agent
  template:
    metadata:
      labels:
        app: orchestration-agent
    spec:
      containers:
      - name: orchestration-agent
        image: smartgen/orchestration:latest
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
        env:
        - name: STATE_BACKEND
          valueFrom:
            secretKeyRef:
              name: smartgen-secrets
              key: database-url
        - name: TASK_QUEUE
          valueFrom:
            secretKeyRef:
              name: smartgen-secrets
              key: redis-url
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-agent
spec:
  replicas: 5
  selector:
    matchLabels:
      app: video-agent
  template:
    spec:
      containers:
      - name: video-agent
        image: smartgen/video-agent:latest
        resources:
          limits:
            nvidia.com/gpu: 1
---
# Additional deployments for image, audio, web agents
```

#### Cost Considerations

| Item | Cost Range |
|------|------------|
| **Compute instances** | $1,000 - $5,000/month |
| **Managed databases** | $200 - $500/month |
| **Object storage** | $0.023/GB/month |
| **CDN egress** | $0.08 - $0.12/GB |
| **API costs** | Usage-based |
| **Total estimated** | $2,000 - $10,000/month |

---

### 7.4 Deployment Comparison

| Factor | Local | Hybrid | Cloud |
|--------|-------|--------|-------|
| **Initial Cost** | High | Medium | Low |
| **Operating Cost** | Low | Medium | High |
| **Scalability** | Limited | Medium | High |
| **Data Control** | Complete | Partial | Limited |
| **Maintenance** | High | Medium | Low |
| **Performance** | High (no latency) | Medium | Variable |
| **Best For** | Dev/Small prod | Growing teams | Enterprise |

---

## Appendix A: Quick Reference

### Model Pricing Summary

| Model | Provider | Pricing |
|-------|----------|---------|
| LTX 2.3 Lightning | Lightricks | $0.05/second |
| Wan 2.6 WanX | Alibaba | $0.08/second |
| VBVR-Wan2.2 | Video-Reason | $0.10/second |
| Qwen-Image | Alibaba | $0.02/image |
| Qwen-Image Layered | Alibaba | $0.05/image |
| Tongyi Wanxiang | Alibaba | $0.03/image |
| FLUX.2 | Black Forest | $0.02/M tokens |
| FLUX.2 Max | Black Forest | $0.04/M tokens |
| FLUX.2 Klein-4B | Black Forest | $3.50/M tokens |
| ChatCompare | CompareAI | $0/M tokens |

### Port Assignments

| Service | Port | Protocol |
|---------|------|----------|
| Orchestration | 8000 | HTTP |
| Audio Whisper | 8001 | HTTP |
| Audio ElevenLabs | 8002 | HTTP |
| Audio Suno | 8003 | HTTP |
| Audio Stable Audio | 8004 | HTTP |
| Image Qwen | 8010 | HTTP |
| Image Tongyi | 8011 | HTTP |
| Image FLUX | 8012 | HTTP |
| Image Upscale | 8013 | HTTP |
| Video LTX | 8020 | HTTP |
| Video Wan | 8021 | HTTP |
| Video VBVR | 8022 | HTTP |
| Video FFmpeg | 8023 | HTTP |
| Web ChatCompare | 8030 | HTTP |
| Web Vercel | 8031 | HTTP |
| Web Netlify | 8032 | HTTP |
| Web Cloudflare | 8033 | HTTP |
| Web Analytics | 8034 | HTTP |

---

## Appendix B: Environment Variables

### Core Configuration

```bash
# Orchestration
SMARTGEN_ENVIRONMENT=production
SMARTGEN_LOG_LEVEL=info
SMARTGEN_STATE_BACKEND=postgresql://user:pass@localhost:5432/smartgen
SMARTGEN_TASK_QUEUE=redis://localhost:6379

# API Keys
LTX_API_KEY=your-ltx-key
WAN_API_KEY=your-wan-key
VBVR_API_KEY=your-vbvr-key
QWEN_API_KEY=your-qwen-key
TONGYI_API_KEY=your-tongyi-key
FLUX_API_KEY=your-flux-key
ELEVENLABS_API_KEY=your-elevenlabs-key
SUNO_API_KEY=your-suno-key
STABILITY_API_KEY=your-stability-key
CHATCOMPARE_API_KEY=your-chatcompare-key
VERCEL_TOKEN=your-vercel-token
```

---

## Appendix C: Quick-Start Installation Guide

### C.1 One-Line Installation Commands

#### Audio Models
```bash
# Whisper (Speech-to-Text)
pip install -U openai-whisper

# AudioCraft/MusicGen (Music Generation)
pip install -U audiocraft

# Bark (Expressive TTS)
pip install -U git+https://github.com/suno-ai/bark.git

# XTTS (Voice Cloning)
pip install -U TTS

# Demucs (Source Separation)
pip install -U demucs

# All-in-one audio stack
pip install -U openai-whisper audiocraft TTS demucs deepfilternet
```

#### Video Models
```bash
# Stable Video Diffusion
pip install -U diffusers transformers accelerate torch torchvision

# ModelScope T2V
pip install -U modelscope

# AnimateDiff
pip install -U animatediff-cli-prompt-travel

# RIFE (Frame Interpolation)
pip install -U rife

# Real-ESRGAN (Upscaling)
pip install -U realesrgan

# All-in-one video stack
pip install -U diffusers transformers accelerate torch torchvision modelscope realesrgan
```

#### Image Models
```bash
# SDXL (Image Generation)
pip install -U diffusers transformers accelerate torch torchvision

# ControlNet
pip install -U controlnet-aux

# IP-Adapter
pip install -U ip-adapter

# GFPGAN/CodeFormer (Face Enhancement)
pip install -U gfpgan facexlib basicsr git+https://github.com/sczhou/CodeFormer.git

# RemBG (Background Removal)
pip install -U rembg[gpu]

# All-in-one image stack
pip install -U diffusers transformers accelerate torch torchvision controlnet-aux rembg[gpu] gfpgan
```

#### Vision/Multimodal Models
```bash
# Qwen2-VL
pip install -U transformers accelerate torch torchvision qwen-vl-utils

# LLaVA
pip install -U llava-torch

# Florence-2
pip install -U transformers accelerate torch torchvision

# SAM (Segment Anything)
pip install -U segment-anything

# Grounding DINO
pip install -U git+https://github.com/IDEA-Research/GroundingDINO.git

# All-in-one vision stack
pip install -U transformers accelerate torch torchvision segment-anything qwen-vl-utils
```

#### Playwright MCP Server
```bash
# Global installation
npm install -g @playwright/mcp-server && npx playwright install

# Or with Docker
docker pull mcr.microsoft.com/playwright:v1.40.0
```

---

### C.2 Docker Compose Examples

#### Hugging Face Inference Server
```yaml
# docker-compose.huggingface.yml
version: '3.8'

services:
  text-generation-inference:
    image: ghcr.io/huggingface/text-generation-inference:latest
    runtime: nvidia
    ports:
      - "8080:80"
    volumes:
      - ./models:/data
    environment:
      - MODEL_ID=Qwen/Qwen2-VL-7B-Instruct
      - NUM_SHARD=1
      - MAX_INPUT_LENGTH=4096
      - MAX_TOTAL_TOKENS=8192
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  image-generation:
    image: ghcr.io/huggingface/text-generation-inference:latest
    runtime: nvidia
    ports:
      - "8081:80"
    volumes:
      - ./models:/data
    environment:
      - MODEL_ID=stabilityai/stable-diffusion-xl-base-1.0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  whisper:
    image: ghcr.io/huggingface/text-generation-inference:latest
    runtime: nvidia
    ports:
      - "8082:80"
    volumes:
      - ./models:/data
    environment:
      - MODEL_ID=openai/whisper-large-v3
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  models:
```

#### Playwright MCP Server
```yaml
# docker-compose.playwright.yml
version: '3.8'

services:
  playwright-mcp:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    ports:
      - "3000:3000"
    volumes:
      - ./scripts:/app/scripts
      - ./output:/app/output
    working_dir: /app
    command: >
      npx @playwright/mcp-server --port 3000
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
      - PLAYWRIGHT_HEADLESS=true

  playwright-chromium:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    volumes:
      - ./output:/app/output
    command: >
      node -e "
        const { chromium } = require('playwright');
        (async () => {
          const browser = await chromium.launch({ headless: true });
          const page = await browser.newPage();
          await page.goto('https://example.com');
          await page.screenshot({ path: '/app/output/screenshot.png' });
          await browser.close();
        })();
      "
```

#### Complete SmartGen Stack with Hugging Face
```yaml
# docker-compose.smartgen-hf.yml
version: '3.8'

services:
  orchestration:
    image: smartgen/orchestration:latest
    ports:
      - "8000:8000"
    environment:
      - STATE_BACKEND=postgresql://postgres:postgres@db:5432/smartgen
      - TASK_QUEUE=redis://redis:6379
      - HF_API_KEY=${HF_API_KEY}
      - HF_INFERENCE_ENDPOINT=http://tgi:80
    depends_on:
      - db
      - redis
      - tgi

  tgi:
    image: ghcr.io/huggingface/text-generation-inference:latest
    runtime: nvidia
    ports:
      - "8080:80"
    volumes:
      - hf-models:/data
    environment:
      - MODEL_ID=Qwen/Qwen2-VL-7B-Instruct
      - NUM_SHARD=1
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  diffusers:
    image: ghcr.io/huggingface/diffusers:latest
    runtime: nvidia
    ports:
      - "8081:80"
    volumes:
      - hf-models:/data
    environment:
      - MODEL_ID=stabilityai/stable-diffusion-xl-base-1.0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  whisper:
    image: ghcr.io/huggingface/text-generation-inference:latest
    runtime: nvidia
    ports:
      - "8082:80"
    volumes:
      - hf-models:/data
    environment:
      - MODEL_ID=openai/whisper-large-v3
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  playwright:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    ports:
      - "3000:3000"
    command: npx @playwright/mcp-server --port 3000
    environment:
      - PLAYWRIGHT_HEADLESS=true

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=smartgen

  redis:
    image: redis:7-alpine

volumes:
  hf-models:
  pgdata:
```

---

### C.3 Environment Variable Setup

#### Basic Configuration
```bash
# .env file
# Hugging Face
HF_API_KEY=your-huggingface-token
HF_INFERENCE_ENDPOINT=https://api-inference.huggingface.co

# Text Generation Inference
MODEL_ID=Qwen/Qwen2-VL-7B-Instruct
NUM_SHARD=1
MAX_INPUT_LENGTH=4096
MAX_TOTAL_TOKENS=8192

# Diffusers
DIFFUSERS_MODEL=stabilityai/stable-diffusion-xl-base-1.0
DIFFUSERS_DEVICE=cuda
DIFFUSERS_DTYPE=float16

# Whisper
WHISPER_MODEL=large-v3
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=float16

# Playwright
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_DEFAULT_TIMEOUT=30000
```

#### NVIDIA GPU Configuration
```bash
# .env.nvidia
# GPU Settings
NVIDIA_VISIBLE_DEVICES=all
NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Memory Settings
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
CUDA_VISIBLE_DEVICES=0
CUDA_LAUNCH_BLOCKING=1

# Performance
TORCH_CUDA_ARCH_LIST=8.6
TF32_OVERRIDE=1
```

#### Model Cache Configuration
```bash
# .env.cache
# Hugging Face Cache
HF_HOME=/path/to/hf/cache
TRANSFORMERS_CACHE=/path/to/transformers/cache
DIFFUSERS_CACHE=/path/to/diffusers/cache

# Default paths (Linux)
# HF_HOME=~/.cache/huggingface
# TRANSFORMERS_CACHE=~/.cache/huggingface/transformers
# DIFFUSERS_CACHE=~/.cache/huggingface/diffusers

# Default paths (Windows)
# HF_HOME=%USERPROFILE%\.cache\huggingface
# TRANSFORMERS_CACHE=%USERPROFILE%\.cache\huggingface\transformers
# DIFFUSERS_CACHE=%USERPROFILE%\.cache\huggingface\diffusers
```

---

### C.4 Verification Commands

#### Test Hugging Face Installation
```bash
# Test transformers
python -c "from transformers import pipeline; print('Transformers OK')"

# Test torch/CUDA
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.cuda.is_available()}')"

# Test diffusers
python -c "from diffusers import StableDiffusionPipeline; print('Diffusers OK')"

# Test whisper
python -c "import whisper; print(f'Whisper OK - Available models: {whisper.available_models()}')"
```

#### Test Model Loading
```bash
# Test SDXL loading
python -c "
from diffusers import StableDiffusionXLPipeline
import torch
pipe = StableDiffusionXLPipeline.from_pretrained(
    'stabilityai/stable-diffusion-xl-base-1.0',
    torch_dtype=torch.float16
)
print('SDXL Model Loaded Successfully')
"

# Test Whisper loading
python -c "
import whisper
model = whisper.load_model('base')
print('Whisper Model Loaded Successfully')
"

# Test Qwen2-VL loading
python -c "
from transformers import AutoProcessor, AutoModelForVision2Seq
processor = AutoProcessor.from_pretrained('Qwen/Qwen2-VL-2B-Instruct')
print('Qwen2-VL Model Loaded Successfully')
"
```

#### Test Playwright Installation
```bash
# Test Playwright
npx playwright --version

# Test browser installation
npx playwright install --dry-run

# Test MCP server
npx @playwright/mcp-server --help

# Quick screenshot test
npx playwright screenshot https://example.com test.png
```

#### Full System Verification Script
```bash
#!/bin/bash
# verify-installation.sh

echo "=== SmartGen Stack Verification ==="

echo -e "\n[1/5] Checking Python..."
python --version || echo "Python not found"

echo -e "\n[2/5] Checking PyTorch..."
python -c "import torch; print(f'PyTorch {torch.__version__}'); print(f'CUDA: {torch.cuda.is_available()}')"

echo -e "\n[3/5] Checking Transformers..."
python -c "from transformers import pipeline; print('Transformers OK')"

echo -e "\n[4/5] Checking Diffusers..."
python -c "from diffusers import StableDiffusionPipeline; print('Diffusers OK')"

echo -e "\n[5/5] Checking Node.js/Playwright..."
node --version && npx playwright --version

echo -e "\n=== Verification Complete ==="
```

---

### C.5 Quick Reference: Model Download Sizes

| Model Category | Model | Download Size | VRAM Required |
|----------------|-------|---------------|---------------|
| **Audio** | Whisper Tiny | 150 MB | <1 GB |
| **Audio** | Whisper Base | 280 MB | <1 GB |
| **Audio** | Whisper Small | 950 MB | 2 GB |
| **Audio** | Whisper Medium | 2.3 GB | 4 GB |
| **Audio** | Whisper Large-v3 | 3.5 GB | 6 GB |
| **Audio** | MusicGen Large | 8 GB | 10 GB |
| **Image** | SDXL Base | 7 GB | 10 GB |
| **Image** | SDXL Refiner | 7 GB | 10 GB |
| **Image** | ControlNet (each) | 1.5 GB | 4 GB |
| **Video** | SVD-XT | 10 GB | 16 GB |
| **Video** | VideoCrafter2 | 8 GB | 12 GB |
| **Vision** | Qwen2-VL-2B | 4 GB | 8 GB |
| **Vision** | Qwen2-VL-7B | 14 GB | 24 GB |
| **Vision** | LLaVA-7B | 14 GB | 24 GB |
| **Vision** | LLaVA-13B | 26 GB | 48 GB |
| **Vision** | Florence-2 Large | 2 GB | 4 GB |
| **Enhancement** | GFPGAN | 500 MB | 2 GB |
| **Enhancement** | CodeFormer | 1 GB | 4 GB |
| **Enhancement** | Real-ESRGAN | 17 MB | 2 GB |

---

**Document Version:** 1.0
**Last Updated:** March 2026
**Status:** Complete

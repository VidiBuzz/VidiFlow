# SmartChannel CX: Comprehensive Documentation & Integration Guide

**Document Version:** 1.1  
**Date:** March 21, 2026  
**Status:** DRAFT  
**Classification:** Internal Technical Documentation  
**Project:** VidiSmart/SmartChannel CX Console Integration for VidiCRM.com

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [IconGen 66: Implementation Details](#icogen-66-implementation-details)
5. [Tool Specifications](#tool-specifications)
6. [Directus Integration Plan](#directus-integration-plan)
7. [UI/UX Specifications](#uiux-specifications)
8. [Backend Services Architecture](#backend-services-architecture)
9. [Data Infrastructure](#data-infrastructure)
10. [Plugin & Extension Ecosystem](#plugin--extension-ecosystem)
11. [Deployment Strategy](#deployment-strategy)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Appendices](#appendices)

---

## 1. Executive Summary

SmartChannel CX is a comprehensive AI-powered media processing and content management platform designed to be the central "website command center" for VidiSmart operations. This document outlines the complete technical specification for integrating IconGen 66 and all SmartChannelCX tools into a unified system accessible via:

1. **Directus Custom Module** - Administrative interface within Directus CMS
2. **Standalone React/TypeScript Application** - Public-facing tool interface
3. **WordPress Plugin** - Embeddable tools for WordPress sites
4. **Backend Microservices** - FastAPI-based processing services

### Key Objectives
- Create a unified interface for 12+ AI media processing tools
- Integrate with Directus CMS for content management
- Provide multi-platform access (Directus, standalone, WordPress)
- Implement robust data infrastructure (vector DB, knowledge graph, embeddings)
- Ensure scalable deployment with Docker/Kubernetes

### Current Status
- **IconGen 66**: Core conversion scripts implemented, frontend UI created
- **VidiCRM.com Directus Instance**: Converge stack running on port 8055 with PostgreSQL, Redis, Neo4j, Vespa
- **FastAPI Backend**: Existing VidiFlow API with multi-agent orchestration
- **Frontend**: Next.js SmartChannelCX application with tool interfaces

### VidiCRM.com Architecture
VidiCRM.com is built on the **Converge Stack** with the following components:
- **Directus 10.9.1**: Primary CMS on port 8055
- **PostgreSQL 16**: Database (port 5433, database: `converge`)
- **Redis 7**: Caching and queue management (port 6379)
- **Neo4j 5**: Knowledge graph database (ports 7474, 7687)
- **Vespa 8**: Vector database (port 8089)
- **Extensions**: Custom Directus extensions in `/directus/extensions`

---

## 2. Project Overview

### 2.1 What is SmartChannel CX?
SmartChannel CX is the evolution of the SmartChannelCX component from VidiFlow, expanded into a full-featured media processing console. It combines:

- **AI Tool Suite**: 12+ media processing tools (image, video, audio, documents)
- **Content Management**: Directus-powered CMS integration
- **Multi-Platform Delivery**: Web, WordPress, mobile apps
- **Data Intelligence**: Vector search, knowledge graphs, analytics

### 2.2 Business Value Proposition
| Stakeholder | Value Proposition |
|-------------|-------------------|
| **Content Creators** | AI-powered tools for rapid media production |
| **Marketing Teams** | Brand consistency across all assets |
| **Developers** | API-first architecture for custom integrations |
| **Businesses** | Reduced media production costs and time-to-market |

### 2.3 Scope & Boundaries
**In Scope:**
- All existing SmartChannelCX tools
- Directus custom module development
- WordPress plugin creation
- Vector database and knowledge graph integration
- Batch processing and queue management

**Out of Scope:**
- LLM model training/fine-tuning
- Hardware infrastructure provisioning
- Third-party service account management
- Mobile native applications (Phase 2)

---

## 3. Technical Architecture

### 3.1 High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  Directus   │    │   Standalone    │    │     WordPress Plugin     │   │
│  │   Module    │    │   React App     │    │    (Embeddable Tools)    │   │
│  │  (Admin)    │    │  (Public)       │    │                          │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
│         │                      │                         │                 │
│         └──────────────────────┼─────────────────────────┘                 │
│                                │                                           │
│                    ┌─────────────────────────────┐                        │
│                    │      API Gateway Layer      │                        │
│                    │  (FastAPI + Directus SDK)   │                        │
│                    └─────────────────────────────┘                        │
│                                │                                           │
├────────────────────────────────┼────────────────────────────────────────────┤
│                              SERVICES LAYER                                │
├────────────────────────────────┼────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  IconGen    │    │   SmartGen      │    │     BrandSwap            │   │
│  │  Service    │    │   Service       │    │     Service              │   │
│  │ (ImageMagick)│   │  (ComfyUI)      │    │  (OpenCV + AI)           │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
│         │                      │                         │                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  Video      │    │   Audio         │    │     Document             │   │
│  │  Enhancer   │    │   Cleaner       │    │     Processor            │   │
│  │  (FFmpeg)   │    │  (FFmpeg)       │    │  (PDF/Office)            │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
│                                │                                           │
│                    ┌─────────────────────────────┐                        │
│                    │    Orchestration Layer       │                        │
│                    │  (Redis Queue + Workers)     │                        │
│                    └─────────────────────────────┘                        │
│                                │                                           │
├────────────────────────────────┼────────────────────────────────────────────┤
│                             DATA LAYER                                     │
├────────────────────────────────┼────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  Directus   │    │   PostgreSQL    │    │     Object Storage       │   │
│  │  CMS        │    │   (Metadata)    │    │     (S3/R2)              │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
│         │                      │                         │                 │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  Vector DB  │    │   Knowledge     │    │     Redis Cache          │   │
│  │  (Pinecone) │    │   Graph (Neo4j) │    │     + Queue              │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, Next.js 15, TypeScript, Tailwind CSS | User interfaces |
| **Backend** | FastAPI, Python 3.12, Pydantic | API services |
| **CMS** | Directus 10.9.1, PostgreSQL 15 | Content management |
| **Queue** | Redis 7, Celery | Job processing |
| **Vector DB** | Pinecone/Weaviate | Embedding storage |
| **Knowledge Graph** | Neo4j 5 | Relationship mapping |
| **Storage** | AWS S3/Cloudflare R2 | Media files |
| **Processing** | ImageMagick, FFmpeg, ComfyUI | Media processing |
| **Deployment** | Docker, Docker Compose, Kubernetes | Orchestration |

### 3.3 Data Flow Architecture
1. **Upload Flow**: User → UI → API Gateway → Processing Service → Storage → Database
2. **Processing Flow**: Queue → Worker → Service → Result → Notification
3. **Search Flow**: Query → Embedding → Vector DB → Results → UI

---

## 4. IconGen 66: Implementation Details

### 4.1 Current Implementation Status
IconGen 66 is the first tool fully implemented in the SmartChannel CX ecosystem.

#### Completed Components:
1. **Core Conversion Scripts** (`/home/vidiman/svg-to-ico-fixed.sh`)
   - Aspect ratio preservation
   - Square padding with transparent background
   - Multi-size ICO generation (16, 32, 48, 64, 128, 256)

2. **Generated Files** (`/mnt/wsl/.../images/`)
   - VidiAi-16.ico through VidiAi-256.ico
   - VidiAi-favicon.ico (combined multi-size)

3. **Frontend UI** (`/mnt/m/code/vidismart/vidiflow/frontend/app/smartchannel/tools/icogen/page.tsx`)
   - Tool layout with existing component library
   - Upload zone, size selection, mock conversion
   - Integrated with SmartChannelCX sidebar

4. **Backend API** (Mock endpoints in `/api/main.py`)
   - `POST /api/tools/icogen/convert`
   - `GET /api/tools/icogen/download/{job_id}/{size}`

### 4.2 Technical Specifications

#### Input Formats:
- **SVG** (Scalable Vector Graphics) - Recommended
- **PNG** (Portable Network Graphics) - With transparency
- **JPEG** (Joint Photographic Experts Group) - Limited support

#### Output Formats:
- **ICO** (Windows Icon) - Multiple sizes in single file
- **Individual ICO files** - Separate files per size
- **ZIP archive** - Batch download of all sizes

#### Processing Pipeline:
```
Input File → Validation → Resize (preserve aspect) → Center on square canvas → 
Generate PNGs → Combine into ICO → Store in S3/R2 → Return download URLs
```

### 4.3 API Specification (To Be Implemented)

```yaml
openapi: 3.0.0
info:
  title: IconGen 66 API
  version: 1.0.0
paths:
  /api/tools/icogen/convert:
    post:
      summary: Convert logo to ICO files
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                sizes:
                  type: string
                  example: "16,32,48,64,128,256"
      responses:
        '200':
          description: Conversion successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  job_id:
                    type: string
                  status:
                    type: string
                  download_url:
                    type: string
```

---

## 5. Tool Specifications

This section provides detailed specifications for all SmartChannel CX tools, including feature descriptions, input/output specifications, UI layouts, and API endpoints.

### 5.1 Overview of SmartChannel CX Tool Suite

| Tool | Category | Primary Function | Status |
|------|----------|------------------|--------|
| **IconGen 66** | Image | SVG/PNG to ICO conversion | ✅ Implemented |
| **PDF Gen** | Document | PDF generation from templates | 🔄 In Planning |
| **SmartGen Image** | Image | AI image generation | 🔄 In Planning |
| **Background Remover** | Image | AI background removal | 🔄 In Planning |
| **Smart Restyle** | Image | Style transfer/renovation | 🔄 In Planning |
| **Object Eraser** | Image | Remove objects from images | 🔄 In Planning |
| **AI Image Gen** | Image | Advanced AI image generation | 🔄 In Planning |
| **BrandSwap** | Video/Image | Logo replacement in media | 🔄 In Planning |
| **Video Enhancer** | Video | Video quality enhancement | 🔄 In Planning |
| **Video Upscaler** | Video | AI video upscaling | 🔄 In Planning |
| **Text to Video** | Video | Generate video from text | 🔄 In Planning |
| **SiteSwarm Engine** | Web | Generate multiple faceted pages | 🔄 In Planning |
| **Audio Cleaner** | Audio | AI audio noise reduction | 🔄 In Planning |

### 5.2 Tool UI Layout Pattern

All tools follow a consistent UI pattern:

```
┌─────────────────────────────────────────────────────────────┐
│ [Tool Name] - SmartChannel CX                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tool Header & Description                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Input Section     │ │ Output/Preview Section        │   │
│  │ • Upload/Dropzone │ │ • Preview Area                │   │
│  │ • Settings Panel  │ │ • Download Options            │   │
│  │ • Action Buttons  │ │ • Processing Status           │   │
│  └───────────────────┘ └───────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Additional Options / Batch Processing / History      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 IconGen 66 Specification (Extended)

*See Section 4 for complete implementation details.*

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ IconGen 66 - SVG/PNG to ICO Converter                       │
├─────────────────────────────────────────────────────────────┤
│ Convert your logos and images to favicon ICO format         │
│ Supports SVG, PNG, JPEG input → Multi-size ICO output      │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Upload Image      │ │ Preview & Download            │   │
│  │ ┌───────────────┐ │ │ ┌───────────────────────────┐ │   │
│  │ │ Drag & Drop   │ │ │ │ Original: logo.svg        │ │   │
│  │ │ or Click      │ │ │ │ Sizes: 16,32,48,64,128,256│ │   │
│  │ │ to Upload     │ │ │ │                           │ │   │
│  │ └───────────────┘ │ │ │  ┌──────┐  ┌──────┐       │ │   │
│  │                   │ │ │  │ 16px │  │ 32px │       │ │   │
│  │ Selected: None    │ │ │  └──────┘  └──────┘       │ │   │
│  │                   │ │ │  ┌──────┐  ┌──────┐       │ │   │
│  │ Output Sizes:     │ │ │  │ 48px │  │ 64px │       │ │   │
│  │ ☑ 16x16          │ │ │  └──────┘  └──────┘       │ │   │
│  │ ☑ 32x32          │ │ │  ┌──────┐  ┌──────┐       │ │   │
│  │ ☑ 48x48          │ │ │  │128px │  │256px │       │ │   │
│  │ ☑ 64x64          │ │ │  └──────┘  └──────┘       │ │   │
│  │ ☑ 128x128        │ │ │                           │ │   │
│  │ ☑ 256x256        │ │ │ [Download All as ZIP]     │ │   │
│  │                   │ │ │ [Download Individual]     │ │   │
│  │ [Convert to ICO]  │ │ └───────────────────────────┘ │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 PDF Gen Specification

#### Overview:
Dedicated PDF generation service for creating reports, documents, and exports from tool outputs.

#### Features:
- Template-based document generation
- Batch PDF processing
- Custom branding and styling
- Integration with all SmartChannel tools
- Export tool results to PDF reports

#### Input/Output:
- **Input**: JSON data, tool results, templates
- **Output**: PDF documents (single or batch)

#### API Endpoints:
```
POST /api/tools/pdfgen/generate
GET  /api/tools/pdfgen/download/{job_id}
POST /api/tools/pdfgen/batch
```

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ PDF Gen - Document Generation Tool                          │
├─────────────────────────────────────────────────────────────┤
│ Create professional PDF documents from templates and data   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Document Setup    │ │ Preview & Customization       │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Template:         │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │  Document Preview         │ │   │
│  │ │ Report        │ │ │ │                           │ │   │
│  │ │ Presentation  │ │ │ │  Page 1 of 5              │ │   │
│  │ │ Invoice       │ │ │ │                           │ │   │
│  │ └───────────────┘ │ │ │  [Zoom] [Rotate] [Print]  │ │   │
│  │                   │ │ └───────────────────────────┘ │   │
│  │ Data Source:      │ │                               │   │
│  │ ○ Manual Input    │ │ Style Options:                │   │
│  │ ○ Tool Results    │ │ • Header/Footer               │   │
│  │ ○ Upload JSON     │ │ • Branding                    │   │
│  │                   │ │ • Page Size                   │   │
│  │ Pages: [1-5]      │ │ • Margins                     │   │
│  │                   │ │                               │   │
│  │ [Generate PDF]    │ │ [Download PDF] [Share Link]   │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 SmartGen Image Specification

#### Overview:
AI-powered image generation using state-of-the-art diffusion models.

#### Features:
- Text-to-image generation
- Image-to-image transformation
- Style presets and custom styles
- Resolution selection (SD, HD, 4K)
- Batch generation

#### Input/Output:
- **Input**: Text prompt, reference image (optional), style settings
- **Output**: Generated image(s) in PNG/JPEG format

#### API Endpoints:
```
POST /api/tools/smartgen/generate
GET  /api/tools/smartgen/status/{job_id}
POST /api/tools/smartgen/batch
```

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ SmartGen Image - AI Image Generation                        │
├─────────────────────────────────────────────────────────────┤
│ Generate stunning images from text descriptions              │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Generation Settings│ │ Generated Images              │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Prompt:           │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   [Image 1]              │ │   │
│  │ │ A beautiful   │ │ │ │   [Image 2]              │ │   │
│  │ │ sunset over   │ │ │ │   [Image 3]              │ │   │
│  │ │ mountains     │ │ │ │   [Image 4]              │ │   │
│  │ └───────────────┘ │ │ │                           │ │   │
│  │                   │ │ │   [Regenerate] [Download] │ │   │
│  │ Style:            │ │ └───────────────────────────┘ │   │
│  │ ┌───────────────┐ │ │                               │   │
│  │ │ Photorealistic│ │ │ Batch Generation:             │   │
│  │ │ Illustration  │ │ │ • Count: [4]                  │   │
│  │ │ Anime         │ │ │ • Variations: [ ]             │   │
│  │ └───────────────┘ │ │ • Seed: [Random]              │   │
│  │                   │ │                               │   │
│  │ Resolution:       │ │ [Generate Batch]              │   │
│  │ ○ SD (512x512)    │ │                               │   │
│  │ ○ HD (1024x1024)  │ │                               │   │
│  │ ○ 4K (4096x4096)  │ │                               │   │
│  │                   │ │                               │   │
│  │ [Generate Image]  │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Background Remover Specification

#### Overview:
AI-powered background removal with edge detection and transparency.

#### Features:
- Automatic background detection
- Edge refinement
- Transparent PNG output
- Batch processing
- Manual touch-up tools

#### Input/Output:
- **Input**: Image file (PNG, JPEG, WebP)
- **Output**: PNG with transparent background

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Background Remover - AI Background Removal                  │
├─────────────────────────────────────────────────────────────┤
│ Remove backgrounds from images with AI precision            │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Upload & Settings │ │ Before/After Comparison       │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Upload Image:     │ │ │ Original    Processed     │ │   │
│  │ ┌───────────────┐ │ │ │ ┌─────────┐ ┌─────────┐  │ │   │
│  │ │ Drag & Drop   │ │ │ │ │         │ │         │  │ │   │
│  │ │ or Click      │ │ │ │ │  Image  │ │  Image  │  │ │   │
│  │ └───────────────┘ │ │ │ │   with  │ │   with  │  │ │   │
│  │                   │ │ │ │   bg    │ │ no bg   │  │ │   │
│  │ Edge Detection:   │ │ │ └─────────┘ └─────────┘  │ │   │
│  │ ○ Automatic       │ │ │                           │ │   │
│  │ ○ High Precision  │ │ │ [Download PNG] [Edit]     │ │   │
│  │ ○ Custom          │ │ └───────────────────────────┘ │   │
│  │                   │ │                               │   │
│  │ Output Format:    │ │ Touch-up Tools:               │   │
│  │ ○ Transparent PNG │ │ • Erase                       │   │
│  │ ○ Solid Color     │ │ • Restore                     │   │
│  │ ○ Custom BG       │ │ • Smooth Edges                │   │
│  │                   │ │                               │   │
│  │ [Remove Background]│ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Smart Restyle Specification

#### Overview:
Style transfer and image renovation using neural style transfer.

#### Features:
- Apply artistic styles to images
- Custom style upload
- Intensity control
- Batch processing

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Smart Restyle - Style Transfer Tool                         │
├─────────────────────────────────────────────────────────────┤
│ Transform images with artistic styles and renovations       │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Style Selection   │ │ Result Preview                │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Content Image:    │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   Original    Styled     │ │   │
│  │ │ [Upload]      │ │ │ │   ┌──────┐   ┌──────┐    │ │   │
│  │ └───────────────┘ │ │ │   │      │   │      │    │ │   │
│  │                   │ │ │   └──────┘   └──────┘    │ │   │
│  │ Style Presets:    │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │ [Download] [Compare]     │ │   │
│  │ │ Van Gogh      │ │ │ └───────────────────────────┘ │   │
│  │ │ Impressionist │ │ │                               │   │
│  │ │ Modern        │ │ │ Intensity: [██████░░] 70%     │   │
│  │ │ Abstract      │ │ │                               │   │
│  │ └───────────────┘ │ │                               │   │
│  │                   │ │                               │   │
│  │ Upload Custom:    │ │                               │   │
│  │ ┌───────────────┐ │ │                               │   │
│  │ │ [Choose File] │ │ │                               │   │
│  │ └───────────────┘ │ │                               │   │
│  │                   │ │                               │   │
│  │ [Apply Style]     │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.8 Object Eraser Specification

#### Overview:
Remove unwanted objects from images using AI inpainting.

#### Features:
- Object selection tools
- AI inpainting for seamless removal
- Batch processing
- Manual touch-up

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Object Eraser - Remove Objects from Images                  │
├─────────────────────────────────────────────────────────────┤
│ Erase unwanted objects with AI-powered inpainting           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Image & Selection │ │ Result Preview                │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Upload Image:     │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   Original    Cleaned    │ │   │
│  │ │ [Upload]      │ │ │ │   ┌──────┐   ┌──────┐    │ │   │
│  │ └───────────────┘ │ │ │   │      │   │      │    │ │   │
│  │                   │ │ │   └──────┘   └──────┘    │ │   │
│  │ Selection Tools:  │ │ │                           │ │   │
│  │ • Brush           │ │ │ [Download] [Compare]     │ │   │
│  │ • Rectangle       │ │ └───────────────────────────┘ │   │
│  │ • Lasso           │ │                               │   │
│  │ • Magic Wand      │ │ Brush Size: [████░░░░] 50%    │   │
│  │                   │ │                               │   │
│  │ Erase Strength:   │ │                               │   │
│  │ ○ Automatic       │ │                               │   │
│  │ ○ Gentle          │ │                               │   │
│  │ ○ Strong          │ │                               │   │
│  │                   │ │                               │   │
│  │ [Erase Objects]   │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.9 AI Image Gen Specification

#### Overview:
Advanced AI image generation with multiple models and fine-grained control.

#### Features:
- Multiple diffusion models (SDXL, DALL-E, Midjourney-style)
- Negative prompts
- Guidance scale control
- Seed control for reproducibility
- High-resolution output

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ AI Image Gen - Advanced Image Generation                    │
├─────────────────────────────────────────────────────────────┤
│ Generate images with advanced AI models and controls        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Generation Controls│ │ Generated Images              │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Positive Prompt:  │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   [Image 1] [Image 2]    │ │   │
│  │ │ Detailed      │ │ │ │   [Image 3] [Image 4]    │ │   │
│  │ │ description   │ │ │ │                           │ │   │
│  │ └───────────────┘ │ │ │   [Download All]         │ │   │
│  │                   │ │ └───────────────────────────┘ │   │
│  │ Negative Prompt:  │ │                               │   │
│  │ ┌───────────────┐ │ │ Model: [SDXL] [DALL-E 3]    │   │
│  │ │ What to avoid │ │ │ Resolution: [1024x1024]     │   │
│  │ └───────────────┘ │ │ Steps: [30] Guidance: [7.5] │   │
│  │                   │ │ Seed: [Random]               │   │
│  │ Advanced:         │ │                               │   │
│  │ • Steps: [30]     │ │                               │   │
│  │ • Guidance: [7.5] │ │                               │   │
│  │ • Seed: [Random]  │ │                               │   │
│  │                   │ │                               │   │
│  │ [Generate]        │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.10 BrandSwap Specification

#### Overview:
Replace logos and branding in images and videos.

#### Features:
- Logo detection and replacement
- Video frame-by-frame processing
- Custom logo upload
- Batch processing

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ BrandSwap - Logo Replacement Tool                           │
├─────────────────────────────────────────────────────────────┤
│ Replace logos and branding in images and videos             │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Source & Target   │ │ Preview & Results             │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Source Media:     │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   Original    Swapped    │ │   │
│  │ │ [Upload Img/  │ │ │ │   ┌──────┐   ┌──────┐    │ │   │
│  │ │      Video]   │ │ │ │   │      │   │      │    │ │   │
│  │ └───────────────┘ │ │ │   └──────┘   └──────┘    │ │   │
│  │                   │ │ │                           │ │   │
│  │ Original Logo:    │ │ │ [Download] [Compare]     │ │   │
│  │ • Auto-detect     │ │ └───────────────────────────┘ │   │
│  │ • Manual select   │ │                               │   │
│  │                   │ │ Replacement Logo:             │   │
│  │ Replacement Logo: │ │ ┌───────────────┐             │   │
│  │ ┌───────────────┐ │ │ │ [Upload]      │             │   │
│  │ │ [Upload]      │ │ │ └───────────────┘             │   │
│  │ └───────────────┘ │ │                               │   │
│  │                   │ │ Position: [Auto] [Manual]     │   │
│  │ Detection Method: │ │ Size: [Match Original]        │   │
│  │ ○ AI Detection    │ │                               │   │
│  │ ○ Manual Region   │ │                               │   │
│  │                   │ │                               │   │
│  │ [Swap Logos]      │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.11 Video Enhancer Specification

#### Overview:
Enhance video quality with AI upscaling, stabilization, and color correction.

#### Features:
- AI upscaling (1080p to 4K)
- Video stabilization
- Color correction
- Frame interpolation
- Batch processing

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Video Enhancer - AI Video Quality Enhancement               │
├─────────────────────────────────────────────────────────────┤
│ Enhance video quality with AI upscaling and correction      │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Video & Settings  │ │ Preview & Results             │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Upload Video:     │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   Original    Enhanced    │ │   │
│  │ │ [Drag & Drop] │ │ │ │   ┌──────┐   ┌──────┐    │ │   │
│  │ │ or Click      │ │ │ │   │      │   │      │    │ │   │
│  │ └───────────────┘ │ │ │   └──────┘   └──────┘    │ │   │
│  │                   │ │ │                           │ │   │
│  │ Enhancement:      │ │ │ [Download] [Compare]     │ │   │
│  │ ☑ Upscale to 4K   │ │ └───────────────────────────┘ │   │
│  │ ☑ Stabilize       │ │                               │   │
│  │ ☑ Color Correct   │ │ Processing Progress:          │   │
│  │ ☑ Frame Interp.   │ │ ████████████░░░░░░░░ 60%     │   │
│  │                   │ │                               │   │
│  │ Quality:          │ │ Estimated Time: 2h 15m        │   │
│  │ ○ Fast            │ │                               │   │
│  │ ○ Balanced        │ │                               │   │
│  │ ○ High Quality    │ │                               │   │
│  │                   │ │                               │   │
│  │ [Enhance Video]   │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.12 Video Upscaler Specification

#### Overview:
AI-powered video upscaling to higher resolutions.

#### Features:
- Upscale to 4K/8K
- Frame-by-frame processing
- Batch processing
- Quality presets

#### UI Layout: Similar to Video Enhancer with focus on resolution scaling.

### 5.13 Text to Video Specification

#### Overview:
Generate videos from text descriptions using AI.

#### Features:
- Text-to-video generation
- Style presets
- Duration control
- Resolution selection

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Text to Video - Generate Videos from Text                   │
├─────────────────────────────────────────────────────────────┤
│ Create videos from text descriptions with AI                │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Script & Settings │ │ Generated Video Preview       │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Video Description:│ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   [Video Player]         │ │   │
│  │ │ A sunset over │ │ │ │   ▶ Play    ⏱ Duration   │ │   │
│  │ │ mountains     │ │ │ │   ┌─────────────────────┐ │ │   │
│  │ └───────────────┘ │ │ │   │                     │ │ │   │
│  │                   │ │ │   └─────────────────────┘ │ │   │
│  │ Style:            │ │ │                           │ │   │
│  │ ○ Cinematic       │ │ │ [Download] [Share]       │ │   │
│  │ ○ Animated        │ │ └───────────────────────────┘ │   │
│  │ ○ Documentary     │ │                               │   │
│  │                   │ │ Generation Progress:          │   │
│  │ Duration: [30s]   │ │ ████████████░░░░░░░░ 60%     │   │
│  │ Resolution: 1080p │ │                               │   │
│  │                   │ │ Estimated Time: 45m          │   │
│  │ [Generate Video]  │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.14 SiteSwarm Engine Specification

#### Overview:
Generate multiple faceted pages for SEO and marketing campaigns.

#### Features:
- Template-based page generation
- Dynamic content insertion
- Batch generation
- SEO optimization

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ SiteSwarm Engine - Multi-Page Generation                    │
├─────────────────────────────────────────────────────────────┤
│ Generate multiple faceted pages for campaigns               │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Campaign Setup    │ │ Generated Pages               │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Campaign Name:    │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │ Page 1: Landing Page      │ │   │
│  │ │ Spring Sale   │ │ │ │ Page 2: Product Features  │ │   │
│  │ └───────────────┘ │ │ │ Page 3: Testimonials      │ │   │
│  │                   │ │ │ Page 4: FAQ               │ │   │
│  │ Templates:        │ │ │                           │ │   │
│  │ ☑ Landing Page    │ │ │ [Preview] [Edit] [Publish]│ │   │
│  │ ☑ Product Page    │ │ └───────────────────────────┘ │   │
│  │ ☑ Blog Post       │ │                               │   │
│  │ ☑ Email Template  │ │ Batch Actions:                │   │
│  │                   │ │ • Generate [10] pages          │   │
│  │ Content Variables:│ │ • Optimize for SEO            │   │
│  │ • Product Name    │ │ • Export to HTML              │   │
│  │ • Price           │ │                               │   │
│  │ • Features        │ │                               │   │
│  │                   │ │                               │   │
│  │ [Generate Pages]  │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.15 Audio Cleaner Specification

#### Overview:
Remove noise and enhance audio quality using AI.

#### Features:
- Noise reduction
- Voice enhancement
- Batch processing
- Multiple output formats

#### UI Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Audio Cleaner - AI Audio Noise Reduction                    │
├─────────────────────────────────────────────────────────────┤
│ Clean and enhance audio recordings with AI                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────────────────┐   │
│  │ Audio & Settings  │ │ Preview & Results             │   │
│  │                   │ │ ┌───────────────────────────┐ │   │
│  │ Upload Audio:     │ │ │                           │ │   │
│  │ ┌───────────────┐ │ │ │   Waveform Comparison     │ │   │
│  │ │ [Drag & Drop] │ │ │ │   Original: ~~~~~~        │ │   │
│  │ │ or Click      │ │ │ │   Cleaned:  ~~~~~~        │ │   │
│  │ └───────────────┘ │ │ │                           │ │   │
│  │                   │ │ │   [▶ Play Original]       │ │   │
│  │ Cleaning:         │ │ │   [▶ Play Cleaned]        │ │   │
│  │ ☑ Remove Background│ │ │                           │ │   │
│  │ ☑ Enhance Voice   │ │ │ [Download] [Compare]     │ │   │
│  │ ☑ Normalize       │ │ └───────────────────────────┘ │   │
│  │                   │ │                               │   │
│  │ Intensity:        │ │ Processing: ████████░░ 80%    │   │
│  │ ○ Light           │ │                               │   │
│  │ ○ Medium          │ │ Estimated Time: 5m            │   │
│  │ ○ Heavy           │ │                               │   │
│  │                   │ │                               │   │
│  │ Output Format:    │ │                               │   │
│  │ ○ WAV             │ │                               │   │
│  │ ○ MP3             │ │                               │   │
│  │ ○ FLAC            │ │                               │   │
│  │                   │ │                               │   │
│  │ [Clean Audio]     │ │                               │   │
│  └───────────────────┘ └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 6. Directus Integration Plan

### 6.1 Directus Custom Module Development

#### Module Structure:
```
directus-extension-smartchannel/
├── src/
│   ├── index.ts                    # Module entry point
│   ├── App.tsx                     # Main React component
│   ├── components/
│   │   ├── ToolGrid.tsx           # Tool selection grid
│   │   ├── ProcessingModal.tsx    # Processing status modal
│   │   └── ResultsPanel.tsx       # Download results panel
│   ├── hooks/
│   │   ├── useTools.ts           # Tool data fetching
│   │   └── useProcessing.ts      # Processing state management
│   ├── services/
│   │   ├── api.ts                # FastAPI communication
│   │   └── directus.ts           # Directus SDK integration
│   └── styles/
│       └── module.css            # Module-specific styles
├── package.json
├── tsconfig.json
└── README.md
```

#### Module Registration:
```typescript
// src/index.ts
import { defineModule } from '@directus/extensions-sdk';
import App from './App';

export default defineModule({
  id: 'smartchannel-cx',
  name: 'SmartChannel CX',
  icon: 'auto_awesome',
  routes: [
    {
      path: '',
      component: App,
    },
  ],
});
```

### 6.2 Directus Data Models Extension

#### New Collections Required:
1. **Tool Usage** - Track tool execution history
2. **Processing Queue** - Job queue management
3. **Tool Results** - Store processing results
4. **User Preferences** - Per-user tool settings

#### Directus Hooks:
```javascript
// After tool processing completes
module.exports = {
  'items.create': async function({ item, collection }) {
    if (collection === 'tool_usage') {
      // Send notification
      // Update analytics
      // Sync with external services
    }
  }
}
```

### 6.3 Authentication & Authorization
- **Directus Users** - Primary authentication
- **Role-Based Access**:
  - Admin: Full access to all tools and settings
  - Editor: Can use tools, view results
  - Viewer: View only access
  - API: Programmatic access via API tokens

---

## 7. UI/UX Specifications

### 7.1 Design System
- **Color Palette**: VidiSmart brand colors (Indigo/Purple/Blue)
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: 4px grid system
- **Components**: Reusable component library from VidiFlow

### 7.2 Directus Module Layout
```
┌─────────────────────────────────────────────────────────────┐
│  SmartChannel CX Console                                    │
├─────────────────────────────────────────────────────────────┤
│  [Dashboard] [Tools] [Media Library] [Analytics] [Settings] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Quick Actions                                       │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │ │Upload   │ │Process  │ │Convert  │ │Export   │   │   │
│  │ │Media    │ │Batch    │ │to ICO   │ │PDF      │   │   │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AI Tools Grid                                       │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │ │IconGen  │ │SmartGen │ │BrandSwap│ │ Video   │   │   │
│  │ │   66    │ │  Image  │ │         │ │Enhancer │   │   │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Responsive Design
- **Desktop**: 1200px+ (full dashboard layout)
- **Tablet**: 768px-1199px (condensed grid)
- **Mobile**: <768px (single column, touch-optimized)

---

## 8. Backend Services Architecture

### 8.1 Microservices Design
Each tool runs as an independent FastAPI microservice:

| Service | Port | Dependencies | Scaling |
|---------|------|--------------|---------|
| **icogen** | 8001 | ImageMagick | Horizontal |
| **smartgen** | 8002 | ComfyUI, GPU | Horizontal (GPU nodes) |
| **brandswap** | 8003 | OpenCV, PyTorch | Horizontal |
| **video-enhancer** | 8004 | FFmpeg, GPU | Horizontal (GPU nodes) |
| **audio-cleaner** | 8005 | FFmpeg | Horizontal |
| **orchestrator** | 8000 | Redis, all services | Single instance |

### 8.2 Service Communication
- **REST API** - Synchronous requests
- **Redis Queue** - Asynchronous job processing
- **WebSockets** - Real-time progress updates
- **gRPC** - High-performance internal communication

### 8.3 Error Handling & Recovery
- **Circuit Breaker Pattern** - Prevent cascade failures
- **Retry Logic** - Exponential backoff
- **Dead Letter Queue** - Failed job handling
- **Health Checks** - Service monitoring

---

## 9. Data Infrastructure

### 9.1 Vector Database Integration
**Purpose**: Enable semantic search across all processed media

**Implementation**:
```python
# Embedding generation
async def generate_embedding(image_path: str):
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    image = load_image(image_path)
    embedding = model.encode_image(image)
    return embedding.tolist()

# Store in vector DB
await pinecone.upsert(vectors=[(file_id, embedding, metadata)])
```

**Use Cases**:
- Find similar logos/images
- Content-based retrieval
- Duplicate detection
- Style matching

### 9.2 Knowledge Graph (3D Visualization)
**Purpose**: Visualize relationships between entities (companies, people, tools)

**Data Model**:
```
Nodes: Company, Person, Tool, MediaFile, Project
Relationships: WORKS_AT, CREATED, USES_TOOL, SIMILAR_TO
```

**Visualization**: Three.js-based 3D graph with:
- Force-directed layout
- Color coding by entity type
- Interactive exploration
- Export to SVG/PDF

### 9.3 Embedding & Chunking Configuration
**Embedding Models**:
- **CLIP** - For image embeddings
- **Sentence-BERT** - For text embeddings
- **Whisper** - For audio embeddings

**Chunking Strategies**:
- **Fixed-size**: 512 tokens for text
- **Semantic**: Split at paragraph boundaries
- **Visual**: For image regions

---

## 10. Plugin & Extension Ecosystem

### 10.1 Required Directus Extensions
1. **SmartChannel CX Module** - Main interface
2. **File Processing Hooks** - Trigger processing on upload
3. **Webhook Handler** - WordPress integration
4. **Audit Logger** - Track all tool usage
5. **Notification System** - Email/webhook notifications

### 10.2 Required Backend Services
1. **Image Optimization** - Sharp/ImageMagick compression
2. **Video Transcoding** - FFmpeg format conversion
3. **PDF Generator** - Report generation
4. **Batch Processor** - Queue management
5. **Media Organizer** - Auto-tagging and categorization

### 10.3 Third-Party Integrations
1. **WordPress** - OAuth, media sync, shortcode embedding
2. **Google Drive** - Import/export functionality
3. **Dropbox** - Media synchronization
4. **Slack** - Notifications and commands
5. **Zapier** - Workflow automation

---

## 11. Deployment Strategy

### 11.1 Docker Compose Configuration
```yaml
version: '3.8'
services:
  # Core Infrastructure
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  # Directus
  directus:
    image: directus/directus:10.9.1
    depends_on:
      - postgres
      - redis
    environment:
      KEY: ${KEY}
      SECRET: ${SECRET}
      DB_CLIENT: pg
      DB_HOST: postgres
      # ... other env vars
    volumes:
      - directus_data:/directus
      - ./extensions:/directus/extensions
  
  # Tool Services
  icogen-service:
    build: ./services/icogen
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
    volumes:
      - uploads:/uploads
  
  # ... other services
  
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_DIRECTUS_URL=http://directus:8055
      - NEXT_PUBLIC_API_URL=http://api-gateway:8000

volumes:
  postgres_data:
  redis_data:
  directus_data:
  uploads:
```

### 11.2 Environment Configuration
```bash
# .env file
KEY=your-secret-key
SECRET=your-secret-secret
ADMIN_EMAIL=admin@vidismart.com
ADMIN_PASSWORD=secure-password
DB_CLIENT=pg
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=smartchannel_cx
DB_USERNAME=directus
DB_PASSWORD=directus-password
```

### 11.3 Scaling Strategy
- **Horizontal Scaling** - Add more instances of tool services
- **GPU Scaling** - Separate GPU nodes for AI services
- **Database Scaling** - Read replicas for PostgreSQL
- **Cache Scaling** - Redis cluster for high availability

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Milestone**: Core infrastructure and IconGen 66 complete
- ✅ Directus custom module skeleton
- ✅ IconGen 66 real API implementation
- ✅ Basic tool UI in Directus
- ✅ Redis queue setup

### Phase 2: Tool Integration (Weeks 5-8)
**Milestone**: All tools integrated and functional
- 🔄 SmartGen Image integration
- 🔄 BrandSwap integration
- 🔄 Video Enhancer integration
- 🔄 Batch processing system

### Phase 3: Advanced Features (Weeks 9-12)
**Milestone**: Data infrastructure and advanced UI
- 🔄 Vector database integration
- 🔄 Knowledge graph (3D visualization)
- 🔄 PDF export functionality
- 🔄 WordPress plugin development

### Phase 4: Production Ready (Weeks 13-16)
**Milestone**: Deployment and optimization
- 🔄 Performance optimization
- 🔄 Security hardening
- 🔄 Monitoring and logging
- 🔄 Documentation completion

---

## 13. Appendices

### Appendix A: File Structure Reference
```
/mnt/m/code/vidismart/
├── directus/                          # Directus instance
│   ├── docker-compose.yml
│   ├── schema.yaml
│   └── extensions/                    # Custom extensions
├── vidiflow/                          # VidiFlow project
│   ├── frontend/
│   │   ├── app/smartchannel/tools/icogen/  # IconGen 66 page
│   │   ├── components/SmartChannelCX.tsx   # Main component
│   │   └── components/tools/ToolLayout.tsx # Tool layout
│   └── backend/
│       └── api/main.py                # API endpoints (mock)
├── services/                          # Tool microservices
│   ├── icogen/                        # IconGen service
│   └── smartgen/                      # SmartGen service
└── SmartChannel_CX_Comprehensive_Documentation.md  # This document
```

### Appendix B: IconGen 66 Files
- **Scripts**: `/home/vidiman/svg-to-ico-fixed.sh`, `/home/vidiman/convert-all-svg-to-ico.sh`
- **Generated ICOs**: `/mnt/wsl/.../images/VidiAi-*.ico`
- **Frontend Page**: `/mnt/m/code/vidismart/vidiflow/frontend/app/smartchannel/tools/icogen/page.tsx`
- **Backend Mock API**: `/mnt/m/code/vidismart/vidiflow/backend/api/main.py` (lines 307-326)

### Appendix C: Directus Connection Details
- **URL**: http://localhost:8055
- **Admin Credentials**: [Stored in .env file]
- **Database**: PostgreSQL on port 5432
- **Extensions Path**: `/directus/extensions` in container

### Appendix D: API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tools/icogen/convert` | POST | Convert logo to ICO |
| `/api/tools/icogen/download/{job_id}/{size}` | GET | Download specific size |
| `/api/tasks` | POST | Create processing task |
| `/api/tasks/{task_id}` | GET | Get task status |

### Appendix E: Dependencies
**Frontend**:
- React 19, Next.js 15, TypeScript
- Tailwind CSS, Lucide React icons
- Directus SDK

**Backend**:
- FastAPI, Pydantic, Uvicorn
- Redis, Celery
- ImageMagick, FFmpeg

**Database**:
- PostgreSQL 15
- Redis 7
- Pinecone/Weaviate (vector DB)

---

## Document Control

**Author**: AI Assistant  
**Created**: March 21, 2026  
**Last Updated**: March 21, 2026  
**Next Review**: March 28, 2026  
**Distribution**: VidiSmart Development Team  

---

*This document is a living guide and will be updated as the SmartChannel CX project progresses. For questions or clarifications, contact the project lead.*
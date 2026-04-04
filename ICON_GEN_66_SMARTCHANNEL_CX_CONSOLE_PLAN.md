# IconGen 66 & SmartChannel CX Console Integration Plan

**Project:** Build a comprehensive SmartChannel CX console integrated with Directus  
**Date:** March 21, 2026  
**Status:** Planning Phase  
**Objective:** Create a unified "website command center" that includes IconGen 66, PDF Gen, and all SmartChannelCX tools, accessible via Directus admin, standalone app, and WordPress plugin.

## 📋 Executive Summary

This plan outlines the development of a **SmartChannel CX Console** that integrates:
1. **Directus Custom Module** - Admin interface for managing tools and content
2. **Standalone React/TypeScript App** - End-user interface for using tools
3. **WordPress Plugin** - Embedding tools in WordPress sites
4. **Backend Services** - FastAPI microservices for tool processing
5. **Data Infrastructure** - Vector database, knowledge graph, embedding models

## 🎯 Core Requirements

### **Tool Suite (All SmartChannelCX Tools)**
- ✅ **IconGen 66** - SVG/PNG to ICO conversion (already implemented)
- 🔄 **PDF Gen** - PDF generation from templates, tool outputs, reports
- 🔄 **SmartGen Image** - AI image generation
- 🔄 **Background Remover** - AI background removal
- 🔄 **Smart Restyle** - Style transfer
- 🔄 **Object Eraser** - Remove objects from images
- 🔄 **AI Image Gen** - Advanced AI image generation
- 🔄 **BrandSwap** - Logo replacement in images/videos
- 🔄 **Video Enhancer** - Video quality enhancement
- 🔄 **Video Upscaler** - AI video upscaling
- 🔄 **Text to Video** - Generate video from text
- 🔄 **SiteSwarm Engine** - Generate multiple faceted pages
- 🔄 **Audio Cleaner** - AI audio noise reduction

### **Additional Required Features**
- **PDF Export** - Generate PDF reports from tool outputs
- **PDF Gen Tool** - Dedicated PDF generation service (templates, reports, batch)
- **Image Optimization** - Compress/resize images
- **Video Transcoding** - Convert video formats for web
- **Batch Processing** - Queue and process multiple files
- **User Authentication & Permissions** - Role-based access
- **Audit Logging** - Track usage and changes

### **Integration Points**
1. **Directus Custom Module** - Embedded in admin UI for content management
2. **Standalone TypeScript/React App** - Public-facing tool interface
3. **WordPress Plugin** - Embed tools in WordPress sites
4. **Backend API** - FastAPI services for tool processing

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMARTCHANNEL CX CONSOLE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │  Directus   │    │ Standalone  │    │  WordPress  │            │
│  │   Module    │    │    React    │    │   Plugin    │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│         │                    │                    │                │
│         └────────────────────┼────────────────────┘                │
│                              │                                    │
│                   ┌─────────────────────┐                        │
│                   │   FastAPI Gateway   │                        │
│                   │   (Auth, Routing)   │                        │
│                   └─────────────────────┘                        │
│                              │                                    │
│         ┌────────────────────┼────────────────────┼────────────────────┐               │
│         │                    │                    │                    │               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  IconGen    │    │   SmartGen  │    │   BrandSwap │    │   PDF Gen   │          │
│  │  Service    │    │   Service   │    │   Service   │    │   Service   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘          │
│         │                    │                    │                    │               │
│         └────────────────────┼────────────────────┼────────────────────┘               │
│                              │                                    │
│                   ┌─────────────────────┐                        │
│                   │  Data Infrastructure│                        │
│                   │ (Vector DB, KG,     │                        │
│                   │  Embeddings, etc.)  │                        │
│                   └─────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📅 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
**Goal:** Set up core infrastructure and IconGen 66 integration

#### Tasks:
1. **Directus Custom Module Setup**
   - Create Directus extension skeleton
   - Set up React/Vite development environment
   - Configure module registration with Directus

2. **IconGen 66 Real API Implementation**
   - Replace mock endpoints with actual ImageMagick conversion
   - Implement file upload/download with proper storage
   - Add batch ZIP download functionality

3. **Basic Tool UI in Directus Module**
   - Create tool selection interface
   - Implement IconGen 66 interface within Directus
   - Add user authentication with Directus users

### **Phase 2: Core Tools Integration (Week 3-4)**
**Goal:** Integrate remaining SmartChannelCX tools

#### Tasks:
1. **Tool Service Adapters**
   - Create service adapters for each tool
   - Implement consistent API interface
   - Add error handling and logging

2. **Directus Module UI Expansion**
   - Tool grid with category filtering
   - Real-time processing status
   - Download management

3. **Batch Processing System**
   - Redis queue for job processing
   - Progress tracking and notifications
   - Result storage in Directus files

### **Phase 3: Advanced Features (Week 5-6)**
**Goal:** Add required plugins and integrations

#### Tasks:
1. **PDF Export Plugin**
   - Generate PDF reports from tool outputs
   - Custom templates for different tools
   - Batch report generation

2. **PDF Gen Service**
   - Dedicated PDF generation microservice
   - Template-based document generation
   - Integration with all SmartChannel tools
   - Batch PDF processing

3. **Image Optimization Pipeline**
   - Integrate with Sharp/ImageMagick
   - Compression settings per use case
   - Before/after comparison

4. **Video Transcoding Service**
   - FFmpeg integration
   - Format conversion for web
   - Quality settings

### **Phase 4: Data Infrastructure (Week 7-8)**
**Goal:** Set up vector database, knowledge graph, embedding

#### Tasks:
1. **Vector Database Integration**
   - Pinecone/Weaviate/Qdrant setup
   - Embedding generation pipeline
   - Similarity search for visual media

2. **Knowledge Graph (3D)**
   - Neo4j integration
   - Entity relationship mapping
   - 3D visualization interface

3. **Embedding & Chunking Configuration**
   - Embedding model selection (OpenAI, local models)
   - Document chunking strategies
   - RAG pipeline integration

### **Phase 5: Advanced Interfaces (Week 9-10)**
**Goal:** Visual media search, Remotion editor, WordPress plugin

#### Tasks:
1. **Visual Media Search**
   - Image similarity search
   - Color-based search
   - Content-based retrieval

2. **Remotion Video Editor Integration**
   - Embed Remotion editor in Directus module
   - Template system for common video types
   - Export to various formats

3. **WordPress Plugin Development**
   - Create WordPress plugin that embeds SmartChannelCX tools
   - OAuth integration with Directus
   - Shortcode system for embedding

### **Phase 6: Deployment & Polish (Week 11-12)**
**Goal:** Production deployment and optimization

#### Tasks:
1. **Docker Compose Configuration**
   - All services in docker-compose
   - Environment configuration
   - Health checks and monitoring

2. **Performance Optimization**
   - Caching strategies
   - Database indexing
   - CDN setup

3. **Security & Compliance**
   - Role-based access control
   - Audit logging
   - Data encryption

## 🔧 Technical Specifications

### **Directus Custom Module**
```typescript
// Module structure
/src
  /components
    /ToolGrid.tsx
    /ToolCard.tsx
    /ProcessingModal.tsx
  /hooks
    useTools.ts
    useProcessing.ts
  /services
    api.ts
    directus.ts
  index.ts
```

### **Backend Services**
```yaml
services:
  icogen:
    build: ./services/icogen
    environment:
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./uploads:/uploads
  
  smartgen:
    build: ./services/smartgen
    environment:
      - COMFYUI_URL=http://comfyui:8188
  
  # ... other tool services
```

### **Database Schema Extensions**
```sql
-- Add to Directus collections
CREATE TABLE tool_usage (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES directus_users(id),
    tool_id VARCHAR(255),
    parameters JSONB,
    status VARCHAR(50),
    result_url TEXT,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE tool_queue (
    id UUID PRIMARY KEY,
    tool_id VARCHAR(255),
    payload JSONB,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📦 Required Plugins & Extensions

### **Directus Extensions**
1. **Custom Module** - Main SmartChannel CX interface
2. **Webhook Handler** - For WordPress integration
3. **File Processing Hooks** - For image/video optimization
4. **Audit Log Plugin** - Track tool usage

### **Backend Services**
1. **IconGen Service** - Python + ImageMagick
2. **SmartGen Service** - ComfyUI integration
3. **Video Processing Service** - FFmpeg
4. **Vector Search Service** - Embedding + similarity search

### **Frontend Libraries**
1. **Remotion** - Video editing
2. **Three.js** - 3D knowledge graph visualization
3. **PDF.js** - PDF generation/viewing
4. **FFmpeg.wasm** - Client-side video processing

### **External Services**
1. **Vector Database** - Pinecone/Weaviate/Qdrant
2. **Embedding API** - OpenAI, Cohere, or local models
3. **Object Storage** - S3/R2 for media files
4. **CDN** - Cloudflare/AWS CloudFront

## 🎨 UI/UX Specifications

### **Directus Module Layout**
```
┌─────────────────────────────────────────────────────┐
│  SmartChannel CX Console - Directus Module          │
├─────────────────────────────────────────────────────┤
│  [Dashboard] [Tools] [Media Library] [Analytics]    │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ IconGen │  │SmartGen │  │BrandSwap│  │ Video   ││
│  │   66    │  │  Image  │  │         │  │Enhancer ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Recent Activity                                  ││
│  │ • IconGen 66: logo.ico converted (2 min ago)   ││
│  │ • BrandSwap: logo replaced (15 min ago)        ││
│  │ • Video Enhancer: processing (25% complete)    ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### **Standalone App Routes**
```
/smartchannel/dashboard
/smartchannel/tools/icogen
/smartchannel/tools/smartgen
/smartchannel/tools/brandswap
/smartchannel/media-library
/smartchannel/analytics
```

## 📊 Integration Points

### **WordPress Plugin**
- Embed tools via shortcodes: `[smartchannel_tool tool="icogen"]`
- OAuth authentication with Directus
- Media library synchronization

### **Vector Database Integration**
- Store embeddings of all processed media
- Enable semantic search across tools
- Power recommendation engine

### **3D Knowledge Graph**
- Visualize relationships between entities
- Interactive graph exploration
- Export to various formats

## 🚀 Deployment Strategy

### **Development Environment**
```bash
# Start all services
docker-compose up -d

# Frontend development
cd frontend && npm run dev

# Backend development  
cd backend && uvicorn api.main:app --reload
```

### **Production Deployment**
- Kubernetes/Docker Swarm for orchestration
- PostgreSQL for Directus + tool metadata
- Redis for queue management
- S3/R2 for media storage
- CloudFlare for CDN/edge caching

## 📈 Success Metrics

1. **Tool Usage** - Number of conversions/processing jobs
2. **Processing Time** - Average time per tool
3. **User Adoption** - Active users per week
4. **Error Rate** - Failed processing jobs
5. **Storage Usage** - Media files stored

## 🎯 Next Immediate Actions

1. **Set up Directus extension development environment**
2. **Implement real IconGen 66 API** (replace mock endpoints)
3. **Create basic Directus module UI** with IconGen 66
4. **Configure Docker Compose** for all services
5. **Establish CI/CD pipeline** for extension deployment

## 📞 Stakeholder Contacts
- **Directus Expert**: [To be assigned]
- **FastAPI Developer**: [To be assigned]
- **UI/UX Designer**: [To be assigned]
- **DevOps Engineer**: [To be assigned]

---

**Document Location:** `/mnt/m/code/vidismart/ICON_GEN_66_SMARTCHANNEL_CX_CONSOLE_PLAN.md`  
**Created:** March 21, 2026  
**Version:** 1.0  
**Next Review:** March 28, 2026
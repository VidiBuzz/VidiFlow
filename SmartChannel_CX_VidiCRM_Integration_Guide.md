# SmartChannel CX Console: Complete Integration Guide for VidiCRM.com

**Document Version:** 1.0  
**Date:** March 21, 2026  
**Status:** DRAFT  
**Classification:** Internal Technical Documentation  
**Project:** VidiSmart/SmartChannel CX Console Integration for VidiCRM.com Directus Instance

---

## Document Purpose

This document provides a comprehensive technical guide for integrating the SmartChannel CX console into the VidiCRM.com Directus instance (Converge Stack). It covers:

1. **Complete System Architecture** - How SmartChannel CX integrates with VidiCRM.com
2. **IconGen 66 Deep Dive** - Full implementation details and integration points
3. **Directus Module Development** - Step-by-step guide for creating the custom module
4. **All Tool Integrations** - Specifications for each SmartChannelCX tool
5. **Plugin & Extension Ecosystem** - Required plugins and configurations
6. **Deployment & Operations** - Deployment to VidiCRM.com infrastructure
7. **API Specifications** - Complete API documentation
8. **Data Architecture** - Database schemas and data flow
9. **Security & Compliance** - Security considerations for VidiCRM.com
10. **Testing & Quality Assurance** - Testing strategies and validation

---

## Table of Contents

1. [Executive Summary & Objectives](#1-executive-summary--objectives)
2. [VidiCRM.com Architecture Overview](#2-vidicrmcom-architecture-overview)
3. [SmartChannel CX System Design](#3-smartchannel-cx-system-design)
4. [IconGen 66: Complete Implementation](#4-icogen-66-complete-implementation)
5. [Directus Custom Module Development](#5-directus-custom-module-development)
6. [Tool Integration Specifications](#6-tool-integration-specifications)
7. [Plugin & Extension Ecosystem](#7-plugin--extension-ecosystem)
8. [Data Architecture & Storage](#8-data-architecture--storage)
9. [API Specifications & Integration](#9-api-specifications--integration)
10. [Security & Access Control](#10-security--access-control)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Testing & Quality Assurance](#12-testing--quality-assurance)
13. [Implementation Roadmap & Timeline](#13-implementation-roadmap--timeline)
14. [Appendices & Reference](#14-appendices--reference)

---

## 1. Executive Summary & Objectives

### 1.1 Business Context
VidiCRM.com is a comprehensive CRM and marketing automation platform built on the Converge Stack. The SmartChannel CX Console aims to integrate AI-powered media processing tools directly into the VidiCRM.com admin interface, creating a unified "website command center" for content creation, brand management, and media processing.

### 1.2 Strategic Objectives
1. **Unified Tool Access**: Provide all SmartChannelCX tools within VidiCRM.com admin interface
2. **Seamless Integration**: Deep integration with Directus CMS for content management
3. **Multi-Platform Delivery**: Enable tools via Directus, standalone app, and WordPress
4. **Data Intelligence**: Leverage existing Converge Stack components (Neo4j, Vespa)
5. **Scalable Architecture**: Microservices architecture that scales with VidiCRM.com growth

### 1.3 Success Metrics
- **User Adoption**: 80% of VidiCRM.com users accessing SmartChannel CX within 3 months
- **Processing Efficiency**: 50% reduction in media processing time
- **Brand Consistency**: 95% brand compliance across generated assets
- **System Reliability**: 99.9% uptime for processing services

---

## 2. VidiCRM.com Architecture Overview

### 2.1 Current Converge Stack
VidiCRM.com runs on the **Converge Stack** with the following architecture:

```yaml
# VidiCRM.com Converge Stack Components
converge-stack:
  directus:
    image: directus/directus:10.9.1
    port: 8055
    purpose: "Primary CMS and admin interface"
    extensions_path: "/directus/extensions"
  
  postgres:
    image: postgres:16-alpine
    port: 5433
    database: "converge"
    purpose: "Primary data storage"
  
  redis:
    image: redis:7-alpine
    port: 6379
    purpose: "Caching and queue management"
  
  neo4j:
    image: neo4j:5-community
    ports: ["7474", "7687"]
    purpose: "Knowledge graph and relationship mapping"
  
  vespa:
    image: vespaengine/vespa:8
    port: 8089
    purpose: "Vector database and semantic search"
```

### 2.2 Directus Instance Details for VidiCRM.com
- **Admin URL**: http://localhost:8055/admin (local) / https://vidicrm.com/admin (production)
- **API Endpoint**: http://localhost:8055 (local) / https://vidicrm.com (production)
- **Extensions Directory**: `/directus/extensions` (mounted from `/mnt/m/code/vidismart/converge/directus-custom`)
- **Uploads Directory**: `/directus/uploads` (mounted from `/mnt/m/code/vidismart/converge/uploads`)
- **Admin Credentials**: admin@vidismart.com (password in .env file)

### 2.3 Existing Directus Collections in VidiCRM.com
Based on the schema.yaml, VidiCRM.com already has:
- `ai_companies` - AI company directory
- `ai_consultants` - AI consultant directory  
- `articles` - News and blog posts
- `events` - Event management
- `forum_posts` - Community discussions

**Additional collections needed for SmartChannel CX:**
```sql
-- SmartChannel CX specific collections
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

CREATE TABLE tool_results (
    id UUID PRIMARY KEY,
    tool_usage_id UUID REFERENCES tool_usage(id),
    file_id UUID REFERENCES directus_files(id),
    metadata JSONB,
    download_count INTEGER DEFAULT 0
);

CREATE TABLE media_library (
    id UUID PRIMARY KEY,
    file_id UUID REFERENCES directus_files(id),
    tags TEXT[],
    ai_tags TEXT[],
    embedding VECTOR(512),
    metadata JSONB
);
```

### 2.4 Integration Points with Existing Converge Components
1. **Neo4j Integration**: Link processed media to companies/people in knowledge graph
2. **Vespa Integration**: Store embeddings for semantic search of processed media
3. **Directus Files**: Store processed outputs in Directus file system
4. **Directus Users**: Leverage existing user authentication and permissions

---

## 3. SmartChannel CX System Design

### 3.1 System Architecture for VidiCRM.com
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VIDICRM.COM ADMIN INTERFACE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              SmartChannel CX Directus Module                       │   │
│  │  [Dashboard] [Tools] [Media Library] [Processing Queue] [Analytics] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   │ (REST API / WebSocket)                  │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SmartChannel CX API Gateway                       │   │
│  │                    (FastAPI + Directus SDK Integration)              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│       ┌──────────────────────────┼──────────────────────────┐              │
│       │                          │                          │              │
│       ▼                          ▼                          ▼              │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  IconGen    │    │   SmartGen      │    │     BrandSwap            │   │
│  │  Service    │    │   Service       │    │     Service              │   │
│  │ (ImageMagick)│   │  (ComfyUI)      │    │  (OpenCV + AI)           │   │
│  └─────────────┘    └─────────────────┘    └──────────────────────────┘   │
│       │                          │                          │              │
│       └──────────────────────────┼──────────────────────────┘              │
│                                  │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Converge Stack Integration Layer                  │   │
│  │  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────┐│   │
│  │  │  Directus   │    │   Neo4j         │    │     Vespa            ││   │
│  │  │  Files/DB   │    │   Knowledge     │    │     Vector DB        ││   │
│  │  └─────────────┘    └─────────────────┘    └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown

#### Frontend Components:
1. **Directus Module** - Embedded in VidiCRM.com admin UI
2. **Standalone React App** - Public-facing tool interface at smartchannel.vidicrm.com
3. **WordPress Plugin** - Embeddable tools for WordPress sites

#### Backend Services:
1. **API Gateway** - FastAPI service handling authentication and routing
2. **Tool Microservices** - Individual services for each tool
3. **Worker Services** - Background job processing with Redis/Celery
4. **Integration Layer** - Connects to Converge Stack components

### 3.3 Data Flow for VidiCRM.com
1. **User uploads media** → Directus Files
2. **User selects tool** → Directus Module triggers API call
3. **API Gateway authenticates** → Checks Directus user permissions
4. **Processing service executes** → Stores results in Directus Files
5. **Embeddings generated** → Stored in Vespa
6. **Relationships mapped** → Stored in Neo4j
7. **User notified** → Via Directus notifications

---

## 4. IconGen 66: Complete Implementation

### 4.1 Current Implementation Status (Already Completed)

#### Core Conversion Scripts:
- **Primary Script**: `/home/vidiman/svg-to-ico-fixed.sh`
  - Preserves aspect ratio with transparent padding
  - Generates sizes: 16, 32, 48, 64, 128, 256 pixels
  - Creates both individual ICO files and combined favicon.ico

- **Batch Script**: `/home/vidiman/convert-all-svg-to-ico.sh`
  - Processes multiple SVG files in a directory
  - Creates organized output with naming convention

#### Generated Files for VidiAi:
- Location: `/code/vidismart/images/`
- Files: `VidiAi-16.ico` through `VidiAi-256.ico`, `VidiAi-favicon.ico`
- Status: ✅ **COMPLETE AND VERIFIED**

#### Frontend UI (Already Created):
- **Location**: `/mnt/m/code/vidismart/vidiflow/frontend/app/smartchannel/tools/icogen/page.tsx`
- **Features**: Upload zone, size selection, mock conversion, results panel
- **Status**: ✅ **COMPLETE** (needs backend API integration)

#### Backend Mock API (Already Created):
- **Location**: `/mnt/m/code/vidismart/vidiflow/backend/api/main.py`
- **Endpoints**: 
  - `POST /api/tools/icogen/convert` - Mock conversion
  - `GET /api/tools/icogen/download/{job_id}/{size}` - Mock download
- **Status**: ⚠️ **MOCK ONLY** - Needs real ImageMagick integration

### 4.2 Integration with VidiCRM.com Directus

#### Directus Module for IconGen 66:
```typescript
// IconGen 66 Directus Module Component
import { defineModule } from '@directus/extensions-sdk';
import IconGen66Page from './IconGen66Page';

export default defineModule({
  id: 'icogen-66',
  name: 'IconGen 66',
  icon: 'image',
  routes: [{
    path: 'icogen',
    component: IconGen66Page,
    name: 'Icon Generator',
    meta: {
      title: 'IconGen 66 - Logo to ICO Converter',
      requiresAdmin: false,
      permissions: ['tools:convert']
    }
  }]
});
```

#### Directus Data Model for IconGen 66:
```sql
-- Icon conversion history
CREATE TABLE icon_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES directus_users(id),
    original_file_id UUID REFERENCES directus_files(id),
    original_filename VARCHAR(255),
    output_sizes INTEGER[],
    status VARCHAR(50),
    result_files JSONB, -- Array of file IDs
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    download_count INTEGER DEFAULT 0
);
```

### 4.3 API Implementation for VidiCRM.com

#### FastAPI Service Endpoint:
```python
# /api/tools/icogen/convert
@router.post("/convert")
async def convert_icon(
    file: UploadFile = File(...),
    sizes: str = "16,32,48,64,128,256",
    current_user: dict = Depends(get_current_directus_user)
):
    # Validate user permissions via Directus
    if not await has_permission(current_user.id, "tools:convert"):
        raise HTTPException(403, "Insufficient permissions")
    
    # Process conversion
    job_id = str(uuid.uuid4())
    size_list = [int(s) for s in sizes.split(",")]
    
    # Call ImageMagick conversion script
    result = await call_conversion_script(file, size_list)
    
    # Store result in Directus Files
    file_ids = await store_in_directus(result, current_user.id)
    
    # Log to database
    await log_conversion(current_user.id, file.filename, file_ids)
    
    return {"job_id": job_id, "status": "completed", "file_ids": file_ids}
```

---

## 5. Directus Custom Module Development

### 5.1 Development Environment Setup for VidiCRM.com

#### Prerequisites:
1. **Node.js 18+** and **npm/yarn**
2. **Directus Extensions SDK**: `npm install @directus/extensions-sdk`
3. **Access to VidiCRM.com Converge Stack**: SSH to server or local Docker setup

#### Development Workflow:
```bash
# 1. Clone/create extension in VidiCRM.com extensions directory
cd /mnt/m/code/vidismart/converge/directus-custom
npx create-directus-extension@latest smartchannel-cx --type module

# 2. Develop locally with hot-reload
cd smartchannel-cx
npm install
npm run dev

# 3. Test with VidiCRM.com Directus instance
# The extension auto-reloads when files change in /directus/extensions

# 4. Build for production
npm run build
```

### 5.2 Complete Module Structure for VidiCRM.com
```
/mnt/m/code/vidismart/converge/directus-custom/smartchannel-cx/
├── src/
│   ├── index.ts                          # Module entry point
│   ├── App.tsx                           # Main React component
│   ├── router.tsx                        # Internal routing
│   ├── context/
│   │   ├── AuthContext.tsx               # Directus authentication
│   │   └── ToolContext.tsx               # Tool state management
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Overview.tsx              # Dashboard overview
│   │   │   ├── QuickActions.tsx          # Quick action buttons
│   │   │   └── RecentActivity.tsx        # Recent processing jobs
│   │   ├── Tools/
│   │   │   ├── ToolGrid.tsx              # Tool selection grid
│   │   │   ├── ToolCard.tsx              # Individual tool card
│   │   │   ├── ProcessingModal.tsx       # Processing status modal
│   │   │   └── ResultsPanel.tsx          # Download results panel
│   │   ├── IconGen66/
│   │   │   ├── UploadZone.tsx            # File upload component
│   │   │   ├── SizeSelector.tsx          # ICO size selection
│   │   │   ├── PreviewPanel.tsx          # Preview generated icons
│   │   │   └── DownloadManager.tsx       # Download management
│   │   ├── MediaLibrary/
│   │   │   ├── MediaGrid.tsx             # Media file grid
│   │   │   ├── MediaCard.tsx             # Individual media card
│   │   │   └── MediaFilters.tsx          # Filtering and search
│   │   └── Shared/
│   │       ├── LoadingSpinner.tsx        # Loading indicator
│   │       ├── ErrorBoundary.tsx         # Error handling
│   │       └── ConfirmationModal.tsx     # Confirmation dialogs
│   ├── hooks/
│   │   ├── useTools.ts                   # Tool data fetching
│   │   ├── useProcessing.ts              # Processing state management
│   │   ├── useDirectus.ts                # Directus SDK integration
│   │   ├── useAuth.ts                    # Authentication hook
│   │   └── useWebSocket.ts               # Real-time updates
│   ├── services/
│   │   ├── api.ts                        # FastAPI communication
│   │   ├── directus.ts                   # Directus SDK service
│   │   ├── websocket.ts                  # WebSocket service
│   │   └── notifications.ts              # Notification service
│   ├── utils/
│   │   ├── formatters.ts                 # Data formatting utilities
│   │   ├── validators.ts                 # Input validation
│   │   └── constants.ts                  # Constants and config
│   └── styles/
│       ├── module.css                    # Module-specific styles
│       └── variables.css                 # CSS variables for VidiCRM branding
├── package.json
├── tsconfig.json
├── directus.config.js                    # Directus extension config
└── README.md
```

### 5.3 Authentication Integration with VidiCRM.com

#### Directus Authentication Flow:
```typescript
// src/context/AuthContext.tsx
import { useApi } from '@directus/extensions-sdk';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  token: string;
  isAuthenticated: boolean;
  permissions: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  
  useEffect(() => {
    // Get current user from Directus
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data.data);
        setToken(api.defaults.headers.Authorization);
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    fetchUser();
  }, [api]);
  
  const permissions = user?.role?.permissions || [];
  
  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, permissions }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 5.4 Directus Hooks for VidiCRM.com

#### Processing Hooks:
```javascript
// directus-extension/hooks/processing.js
module.exports = {
  'files.upload': async function({ payload, file }) {
    // Auto-process uploaded images with IconGen 66 if SVG/PNG
    if (file.type.includes('svg') || file.type.includes('png')) {
      await triggerIconConversion(file.id);
    }
  },
  
  'items.create': async function({ collection, item }) {
    // Update knowledge graph when new companies/consultants are added
    if (collection === 'ai_companies' || collection === 'ai_consultants') {
      await updateNeo4jGraph(item);
    }
  }
};
```

---

## 6. Tool Integration Specifications

### 6.1 Complete Tool List for VidiCRM.com

| Tool | Service Port | Dependencies | Converge Integration |
|------|--------------|--------------|---------------------|
| **IconGen 66** | 8001 | ImageMagick | Directus Files, Vespa embeddings |
| **SmartGen Image** | 8002 | ComfyUI, GPU | Directus Files, Neo4j entities |
| **Background Remover** | 8003 | rembg, PyTorch | Directus Files |
| **Smart Restyle** | 8004 | Stable Diffusion | Directus Files |
| **Object Eraser** | 8005 | SAM, PyTorch | Directus Files |
| **AI Image Gen** | 8006 | DALL-E/Stable Diffusion | Directus Files, Neo4j |
| **BrandSwap** | 8007 | OpenCV, AI models | Directus Files, Vespa |
| **Video Enhancer** | 8008 | FFmpeg, Real-ESRGAN | Directus Files |
| **Video Upscaler** | 8009 | FFmpeg, AI models | Directus Files |
| **Text to Video** | 8100 | ComfyUI, GPU | Directus Files |
| **SiteSwarm Engine** | 8101 | SEO tools | Directus Pages |
| **Audio Cleaner** | 8102 | FFmpeg, audio AI | Directus Files |

### 6.2 Tool Integration Pattern for VidiCRM.com
Each tool follows this integration pattern:
1. **Directus Module UI** → User uploads/selects media
2. **API Gateway** → Authenticates via Directus, routes to tool service
3. **Tool Service** → Processes media, stores results in Directus Files
4. **Converge Integration** → Updates Neo4j relationships, Vespa embeddings
5. **Notification** → User notified via Directus interface

---

## 7. Plugin & Extension Ecosystem

### 7.1 Required Directus Extensions for VidiCRM.com

#### 1. SmartChannel CX Module (Primary)
- **Purpose**: Main interface for all tools
- **Location**: `/directus/extensions/smartchannel-cx/`
- **Dependencies**: React, Directus SDK

#### 2. File Processing Hooks
- **Purpose**: Auto-process uploaded media
- **Triggers**: `files.upload`, `files.update`
- **Actions**: Run IconGen 66, generate embeddings

#### 3. Neo4j Sync Hook
- **Purpose**: Sync data with knowledge graph
- **Triggers**: `items.create`, `items.update`
- **Actions**: Create/update nodes and relationships in Neo4j

#### 4. Vespa Embedding Hook
- **Purpose**: Generate and store embeddings for semantic search
- **Triggers**: `files.create` for images/videos
- **Actions**: Generate CLIP/Sentence-BERT embeddings, store in Vespa

#### 5. Notification Extension
- **Purpose**: Real-time notifications for processing completion
- **Channels**: Directus UI, email, webhooks
- **Templates**: Customizable notification templates

### 7.2 Required Plugins for VidiCRM.com

#### PDF Export Plugin
- **Purpose**: Generate PDF reports from tool outputs
- **Features**:
  - Custom report templates
  - Batch report generation
  - Branding with VidiCRM.com logo

#### Image Optimization Plugin
- **Purpose**: Compress and optimize images
- **Features**:
  - Lossless/lossy compression
  - Format conversion (WebP, AVIF)
  - Size optimization for web

#### Video Transcoding Plugin
- **Purpose**: Convert video formats for web
- **Features**:
  - Format conversion (MP4, WebM, MOV)
  - Resolution scaling
  - Bitrate optimization

#### Batch Processing Plugin
- **Purpose**: Queue and process multiple files
- **Features**:
  - Job queuing with Redis
  - Progress tracking
  - Priority scheduling

### 7.3 Third-Party Integrations Required

#### WordPress Integration
- **OAuth Provider**: Directus as OAuth server
- **Media Sync**: Bidirectional media synchronization
- **Shortcode System**: `[smartchannel_tool tool="icogen"]`
- **Embed Widgets**: Customizable tool embeds

#### Google Workspace Integration
- **Google Drive**: Import/export files
- **Google Docs**: Export reports to Google Docs
- **Google Sheets**: Export data to spreadsheets

#### Slack Integration
- **Notifications**: Processing completion alerts
- **Commands**: `/smartchannel convert` slash commands
- **File Sharing**: Share results in Slack channels

---

## 8. Data Architecture & Storage

### 8.1 Database Schema Extensions for VidiCRM.com

#### Directus Collections:
```sql
-- Extend existing VidiCRM.com schema

-- 1. Tool Management
CREATE TABLE tools (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    service_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    configuration JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Processing Jobs
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY,
    tool_id UUID REFERENCES tools(id),
    user_id UUID REFERENCES directus_users(id),
    input_files JSONB,
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    output_files JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- 3. Media Library Enhancement
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS tool_used UUID REFERENCES tools(id);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- 4. Analytics
CREATE TABLE tool_analytics (
    id UUID PRIMARY KEY,
    tool_id UUID REFERENCES tools(id),
    date DATE,
    usage_count INTEGER,
    success_rate DECIMAL(5,2),
    avg_processing_time DECIMAL(10,2),
    total_files_processed INTEGER
);
```

#### Neo4j Graph Schema:
```cypher
// Nodes
CREATE (c:Company {id, name, industry})
CREATE (p:Person {id, name, role})
CREATE (t:Tool {id, name, category})
CREATE (m:MediaFile {id, filename, type})
CREATE (pr:Project {id, name, client})

// Relationships
CREATE (p)-[:WORKS_AT]->(c)
CREATE (p)-[:USED_TOOL {date, duration}]->(t)
CREATE (t)-[:PROCESSED {timestamp}]->(m)
CREATE (m)-[:BELONGS_TO]->(pr)
CREATE (m)-[:SIMILAR_TO {similarity_score}]->(otherMedia)
```

#### Vespa Schema for Vector Search:
```yaml
schema: media_embeddings
document {
  field id type string {
    indexing: summary | index
  }
  field filename type string {
    indexing: summary
  }
  field embedding type tensor<float>[512] {
    indexing: index
  }
  field metadata type map<string, string> {
    indexing: summary
  }
}

fieldset default {
  fields: id, filename, metadata
}

rank-profile default {
  first-phase {
    expression: closeness(embedding, query(embedding))
  }
}
```

### 8.2 Storage Architecture for VidiCRM.com

#### File Storage Strategy:
1. **Directus Uploads** - Primary storage for all media files
2. **S3/R2 Bucket** - Backup and CDN distribution
3. **Local Cache** - Temporary processing cache
4. **Processed Files** - Separate folder structure

#### Folder Structure in Directus:
```
/directus/uploads/
├── smartchannel/
│   ├── raw/                    # Original uploaded files
│   ├── processed/              # Tool outputs
│   │   ├── icogen/             # IconGen 66 outputs
│   │   ├── smartgen/           # SmartGen outputs
│   │   └── brandswap/          # BrandSwap outputs
│   └── temp/                   # Temporary processing files
└── default/                    # Standard Directus uploads
```

---

## 9. API Specifications & Integration

### 9.1 API Gateway for VidiCRM.com

#### Base URL Configuration:
- **Local Development**: http://localhost:8000
- **VidiCRM.com Production**: https://api.vidicrm.com
- **Directus Integration**: Uses Directus SDK for authentication

#### Authentication Flow:
```typescript
// Authentication with Directus users
async function authenticateWithDirectus(token: string) {
  const directus = createDirectus('https://vidicrm.com')
    .with(rest())
    .with(staticToken(token));
  
  const user = await directus.request(readUsers('me'));
  return user;
}
```

### 9.2 Complete API Endpoints

#### Tool Management:
```
GET    /api/tools                     # List all tools
GET    /api/tools/{id}                # Get tool details
POST   /api/tools/{id}/execute        # Execute tool
GET    /api/tools/{id}/status/{job_id} # Get job status
```

#### IconGen 66 Specific:
```
POST   /api/tools/icogen/convert      # Convert logo to ICO
GET    /api/tools/icogen/preview/{id} # Preview generated icons
GET    /api/tools/icogen/download/{id}/{size} # Download specific size
POST   /api/tools/icogen/batch        # Batch conversion
```

#### Media Library:
```
GET    /api/media                     # List media files
POST   /api/media/upload              # Upload media
GET    /api/media/{id}/embeddings     # Get embeddings
POST   /api/media/search              # Semantic search
```

#### Analytics:
```
GET    /api/analytics/usage           # Usage statistics
GET    /api/analytics/performance     # Performance metrics
GET    /api/analytics/popular-tools   # Popular tools
```

### 9.3 WebSocket Events for Real-time Updates
```typescript
// WebSocket event types
interface WSEvents {
  'job:created': { jobId: string, tool: string };
  'job:progress': { jobId: string, progress: number };
  'job:completed': { jobId: string, results: any };
  'job:failed': { jobId: string, error: string };
  'media:processed': { fileId: string, tool: string };
}
```

---

## 10. Security & Access Control

### 10.1 Authentication & Authorization for VidiCRM.com

#### Role-Based Access Control:
```yaml
roles:
  admin:
    description: "Full access to all tools and settings"
    permissions:
      - tools:execute
      - tools:configure
      - media:manage
      - analytics:view
      - users:manage
  
  editor:
    description: "Can use tools and manage media"
    permissions:
      - tools:execute
      - media:manage
      - analytics:view
  
  viewer:
    description: "View only access"
    permissions:
      - analytics:view
      - media:view
  
  api:
    description: "API access for integrations"
    permissions:
      - tools:execute
      - media:read
      - media:write
```

#### API Security:
- **JWT Authentication** - Directus JWT tokens
- **Rate Limiting** - 100 requests per minute per user
- **CORS** - Restrict to vidicrm.com domains
- **Input Validation** - File type, size, and content validation
- **Output Sanitization** - Prevent XSS in generated content

### 10.2 Data Privacy Compliance
- **GDPR Compliance** - Data retention policies
- **User Consent** - Processing consent tracking
- **Data Export** - User data export capability
- **Audit Logs** - Complete activity logging

---

## 11. Deployment & Infrastructure

### 11.1 Deployment to VidiCRM.com Converge Stack

#### Docker Compose Extension:
```yaml
# Add to VidiCRM.com docker-compose.yml
version: '3.8'
services:
  # ... existing services
  
  # SmartChannel CX API Gateway
  smartchannel-api:
    build: ./smartchannel-api
    ports:
      - '8000:8000'
    environment:
      - DIRECTUS_URL=http://directus:8055
      - REDIS_URL=redis://cache:6379
      - NEO4J_URL=bolt://neo4j:7687
      - VESPA_URL=http://vespa:8080
    depends_on:
      - directus
      - cache
      - neo4j
      - vespa
    volumes:
      - ./smartchannel-api:/app
      - uploads:/uploads
  
  # Tool Microservices
  icogen-service:
    build: ./services/icogen
    environment:
      - REDIS_URL=redis://cache:6379
      - UPLOAD_DIR=/uploads
    volumes:
      - uploads:/uploads
    depends_on:
      - cache
  
  # ... other tool services
  
  # Redis for job queue
  smartchannel-redis:
    image: redis:7-alpine
    ports:
      - '6380:6379'
    volumes:
      - smartchannel_redis:/data
```

### 11.2 Environment Configuration for VidiCRM.com

#### Required Environment Variables:
```bash
# VidiCRM.com Specific
VIDICRM_DIRECTUS_URL=http://directus:8055
VIDICRM_DIRECTUS_KEY=your-directus-key
VIDICRM_DIRECTUS_SECRET=your-directus-secret

# Database
POSTGRES_HOST=database
POSTGRES_PORT=5432
POSTGRES_DB=converge
POSTGRES_USER=converge
POSTGRES_PASSWORD=converge_secret

# Redis
REDIS_HOST=cache
REDIS_PORT=6379

# Neo4j
NEO4J_URL=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=converge_password

# Vespa
VESPA_URL=http://vespa:8080

# Storage
STORAGE_TYPE=directus  # or s3, r2
UPLOAD_DIR=/directus/uploads/smartchannel

# Processing
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=image/svg,image/png,image/jpeg,video/mp4,audio/mpeg
```

### 11.3 Scaling Configuration
```yaml
# Docker Compose scaling
services:
  icogen-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
  
  smartgen-service:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '4'
          memory: 8G
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 12. Testing & Quality Assurance

### 12.1 Testing Strategy for VidiCRM.com Integration

#### Unit Tests:
```typescript
// IconGen 66 Unit Tests
describe('IconGen 66 Service', () => {
  test('should convert SVG to ICO with correct sizes', async () => {
    const result = await convertIcon(testSvg, [16, 32, 48]);
    expect(result.files).toHaveLength(3);
    expect(result.files[0].size).toBe(16);
  });
  
  test('should preserve aspect ratio', async () => {
    const result = await convertIcon(nonSquareSvg, [64]);
    expect(result.metadata.aspectRatio).toBe(originalAspectRatio);
  });
});
```

#### Integration Tests:
```typescript
// Directus Integration Tests
describe('Directus Module Integration', () => {
  test('should authenticate with Directus', async () => {
    const auth = await authenticateWithDirectus(testToken);
    expect(auth.user).toBeDefined();
  });
  
  test('should upload file to Directus', async () => {
    const file = await uploadToDirectus(testFile);
    expect(file.id).toBeDefined();
  });
});
```

#### End-to-End Tests:
```typescript
// Full workflow test
test('IconGen 66 end-to-end', async () => {
  // 1. Upload SVG via Directus UI
  // 2. Select sizes and convert
  // 3. Verify ICO files generated
  // 4. Download and validate
  // 5. Check Directus Files updated
  // 6. Verify Neo4j relationships created
  // 7. Confirm Vespa embeddings stored
});
```

### 12.2 Performance Testing
- **Load Testing**: 100 concurrent users converting icons
- **Stress Testing**: Large file conversions (50MB+)
- **Soak Testing**: 24-hour continuous operation
- **Memory Testing**: Memory leak detection

### 12.3 Security Testing
- **Penetration Testing**: API endpoint security
- **File Upload Testing**: Malicious file detection
- **Permission Testing**: Role-based access verification
- **Data Isolation**: Multi-tenant data separation

---

## 13. Implementation Roadmap & Timeline

### 13.1 Phase 1: Foundation (Weeks 1-4)
**Goal**: Core infrastructure and IconGen 66 integration

#### Week 1: Environment Setup
- [ ] Set up Directus extension development environment
- [ ] Create module skeleton in `/directus/extensions/`
- [ ] Configure hot-reload for development
- [ ] Set up API gateway service

#### Week 2: IconGen 66 Real Implementation
- [ ] Replace mock API with real ImageMagick integration
- [ ] Implement file upload/download with Directus Files
- [ ] Add proper error handling and validation
- [ ] Create unit tests for conversion logic

#### Week 3: Directus Module UI
- [ ] Create dashboard overview component
- [ ] Implement tool grid with category filtering
- [ ] Add real-time processing status
- [ ] Create download management interface

#### Week 4: Basic Integration Testing
- [ ] Integration testing with VidiCRM.com Directus
- [ ] Load testing with concurrent users
- [ ] Security testing and validation
- [ ] Documentation and deployment guide

### 13.2 Phase 2: Tool Integration (Weeks 5-8)
**Goal**: Integrate all SmartChannelCX tools

#### Week 5: Image Processing Tools
- [ ] SmartGen Image integration (ComfyUI)
- [ ] Background Remover integration
- [ ] Smart Restyle integration
- [ ] Object Eraser integration

#### Week 6: Video Processing Tools
- [ ] Video Enhancer integration
- [ ] Video Upscaler integration
- [ ] Text to Video integration
- [ ] FFmpeg service setup

#### Week 7: Specialized Tools
- [ ] BrandSwap integration
- [ ] AI Image Gen integration
- [ ] SiteSwarm Engine integration
- [ ] Audio Cleaner integration

#### Week 8: Batch Processing & Queue
- [ ] Redis queue implementation
- [ ] Batch processing system
- [ ] Progress tracking
- [ ] Notification system

### 13.3 Phase 3: Advanced Features (Weeks 9-12)
**Goal**: Data infrastructure and advanced UI

#### Week 9: Data Infrastructure
- [ ] Neo4j integration for knowledge graph
- [ ] Vespa integration for vector search
- [ ] Embedding generation pipeline
- [ ] Relationship mapping

#### Week 10: Advanced UI Features
- [ ] 3D knowledge graph visualization
- [ ] Advanced analytics dashboard
- [ ] Custom report generation
- [ ] PDF export functionality

#### Week 11: WordPress Integration
- [ ] WordPress plugin development
- [ ] OAuth integration with Directus
- [ ] Shortcode system
- [ ] Embed widget customization

#### Week 12: Testing & Optimization
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion

### 13.4 Phase 4: Production Ready (Weeks 13-16)
**Goal**: Deployment and optimization

#### Week 13: Deployment Preparation
- [ ] Docker Compose configuration
- [ ] Environment configuration
- [ ] Database migrations
- [ ] Backup procedures

#### Week 14: Staging Deployment
- [ ] Deploy to staging VidiCRM.com instance
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] Bug fixes and improvements

#### Week 15: Production Deployment
- [ ] Deploy to production VidiCRM.com
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitoring and alerting setup
- [ ] Rollback procedures

#### Week 16: Post-Launch
- [ ] User training and documentation
- [ ] Performance monitoring
- [ ] Bug fixes and patches
- [ ] Feature requests collection

---

## 14. Appendices & Reference

### Appendix A: File Structure Reference
```
/mnt/m/code/vidismart/
├── converge/                              # VidiCRM.com Converge Stack
│   ├── docker-compose.yml                 # Main Docker configuration
│   ├── start-vidicrm.sh                  # Start script
│   ├── vidicrm.service                   # Systemd service
│   ├── directus-custom/                  # Directus extensions
│   │   └── smartchannel-cx/              # SmartChannel CX module
│   ├── uploads/                          # Directus uploads
│   └── .env                              # Environment variables
├── vidiflow/                              # VidiFlow project
│   ├── frontend/
│   │   ├── app/smartchannel/tools/icogen/  # IconGen 66 page
│   │   ├── components/SmartChannelCX.tsx   # Main component
│   │   └── components/tools/ToolLayout.tsx # Tool layout
│   └── backend/
│       └── api/main.py                    # API endpoints (mock)
├── services/                              # Tool microservices
│   ├── icogen/                            # IconGen service
│   ├── smartgen/                          # SmartGen service
│   └── docker-compose.tools.yml           # Tool services config
└── SmartChannel_CX_VidiCRM_Integration_Guide.md  # This document
```

### Appendix B: Key Commands for VidiCRM.com

#### Start VidiCRM.com Stack:
```bash
cd /mnt/m/code/vidismart/converge
./start-vidicrm.sh
```

#### Access Directus Admin:
- URL: http://localhost:8055/admin
- Email: admin@vidismart.com
- Password: [from .env file]

#### Deploy SmartChannel CX Module:
```bash
# Build the module
cd /mnt/m/code/vidismart/converge/directus-custom/smartchannel-cx
npm run build

# Restart Directus to load new extension
cd /mnt/m/code/vidismart/converge
docker compose restart directus
```

#### Monitor Services:
```bash
# Check all services
docker compose ps

# View logs
docker compose logs -f smartchannel-api
docker compose logs -f icogen-service

# Check health
curl http://localhost:8000/health
curl http://localhost:8055/server/health
```

### Appendix C: API Quick Reference

#### IconGen 66 API Examples:
```bash
# Convert logo to ICO
curl -X POST http://localhost:8000/api/tools/icogen/convert \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@logo.svg" \
  -F "sizes=16,32,48,64,128,256"

# Get conversion status
curl http://localhost:8000/api/tools/icogen/status/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"

# Download ICO file
curl http://localhost:8000/api/tools/icogen/download/$FILE_ID/32 \
  -H "Authorization: Bearer $TOKEN" \
  -o icon-32.ico
```

### Appendix D: Troubleshooting Guide

#### Common Issues:
1. **Directus Extension Not Loading**
   - Check extensions directory mount
   - Verify file permissions
   - Check Directus logs: `docker compose logs directus`

2. **Tool Service Connection Failed**
   - Verify service is running: `docker compose ps`
   - Check network connectivity between containers
   - Verify environment variables

3. **File Upload Issues**
   - Check file size limits
   - Verify file type permissions
   - Check storage space

4. **Neo4j Connection Issues**
   - Verify Neo4j is running: `curl http://localhost:7474`
   - Check credentials in environment variables
   - Verify network connectivity

### Appendix E: Glossary

| Term | Definition |
|------|------------|
| **Converge Stack** | VidiCRM.com's Docker-based infrastructure |
| **Directus Module** | Custom extension for Directus admin UI |
| **SmartChannelCX** | The unified tool interface system |
| **IconGen 66** | SVG/PNG to ICO conversion tool |
| **Vespa** | Vector database for semantic search |
| **Neo4j** | Graph database for relationship mapping |
| **ComfyUI** | AI image generation framework |

### Appendix F: References

1. **VidiCRM.com Converge Stack**: `/mnt/m/code/vidismart/converge/README.md`
2. **Directus Extensions Documentation**: https://docs.directus.io/extensions/
3. **VidiFlow Architecture**: `/mnt/m/code/vidismart/vidiflow/VIDIFLOW_PLAN.md`
4. **SmartChannelCX Components**: `/mnt/m/code/vidismart/vidiflow/frontend/components/SmartChannelCX.tsx`
5. **IconGen 66 Implementation**: `/mnt/m/code/vidismart/iconGen66.md`

---

## Document Control

**Author**: VidiSmart Development Team  
**Created**: March 21, 2026  
**Last Updated**: March 21, 2026  
**Next Review**: March 28, 2026  
**Distribution**: VidiCRM.com Development Team, SmartChannel CX Stakeholders  

**Change History**:
- v1.0 (2026-03-21): Initial comprehensive document
- v1.1 (2026-03-21): Added VidiCRM.com specific architecture and Converge Stack integration

---

*This document serves as the primary technical reference for the SmartChannel CX Console integration with VidiCRM.com. All development, testing, and deployment should reference this guide.*
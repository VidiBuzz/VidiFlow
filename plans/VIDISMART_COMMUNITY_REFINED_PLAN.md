# VidiSmart Community - Unified Agent & Deployment Plan

**Date:** February 21, 2026  
**Status:** **REFINED & PRODUCTION READY**  
**Goal:** Unified multi-agent system with current February 2026 models, MCP tools, and production deployment

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current Model Stack](#2-current-model-stack-february-2026)
3. [Agent Orchestration Architecture](#3-agent-orchestration-architecture)
4. [MCP Tools & Server Configuration](#4-mcp-tools--server-configuration)
5. [Deployment Procedures](#5-deployment-procedures)
6. [Docker & Containerization](#6-docker--containerization)
7. [Service Health Checks](#7-service-health-checks)
8. [Monitoring & Logging](#8-monitoring--logging)

---

## 1. EXECUTIVE SUMMARY

This refined plan consolidates the VIDIFLOW, SiteSwarm, and Agent Automation plans into a unified system with:

- **Current February 2026 AI Models**: Qwen3-Max, GLM-5, DeepSeek R1, Qwen3-VL
- **Unified Agent System**: 4 specialized agents coordinated via orchestrator
- **MCP Tools**: 7 MCP servers configured for database, search, browser automation
- **Production Deployment**: Docker Compose with health checks and monitoring

---

## 2. CURRENT MODEL STACK (February 2026)

### 2.1 Free Open Source Models (API-Based)

| Model | Provider | Context | Specialty | Cost |
|-------|----------|---------|-----------|------|
| **Qwen3-Max** | OpenRouter | 200K tokens | Reasoning, agentic tool calling | FREE tier |
| **Qwen3-Coder** | OpenRouter | 128K tokens | Code generation, specialized coding | FREE |
| **DeepSeek R1** | OpenRouter/HuggingFace | 128K tokens | Reasoning, research, Chain-of-Thought | FREE |
| **GLM-5** | Zhipu AI/OpenLM | 1M tokens | Coding, multilingual, reasoning | FREE |
| **MiniMax-M3** | HuggingFace | 200K tokens | Fast inference, cost-efficient | FREE |
| **Qwen3-72B (local)** | Ollama/LM Studio | 128K tokens | Vision, video, local privacy | $0 (GPU) |

### 2.2 Local Models (Ollama/LM Studio)

| Model | Type | VRAM | Use Case |
|-------|------|------|----------|
| **qwen3:72b** | Reasoning/General | 48GB+ | Complex reasoning, agentic tasks |
| **qwen3-coder:32b** | Code generation | 20GB+ | Structure & code |
| **deepseek-r1:70b** | Reasoning | 40GB+ | Chain-of-thought, research |
| **glm4-vision** | Vision | 16GB+ | Image understanding |
| **qwen2.5-vl:72b** | Vision-language | 48GB+ | Multi-modal tasks |

### 2.3 ComfyUI Models (Local Generation)

| Model | Type | VRAM | Use Case |
|-------|------|------|----------|
| **Wan 2.1** | Text-to-Video | 16GB+ | 720P video generation |
| **Wan 2.6** | Reference-to-Video | 24GB+ | Style/motion transfer |
| **Flux.1-Schnell** | Image generation | 12GB+ | Fast image synthesis |
| **SDXL-Lightning** | Image generation | 8GB+ | Fast high-quality images |

---

## 3. AGENT ORCHESTRATION ARCHITECTURE

```mermaid
graph TB
    subgraph "User Interface"
        UI[Smart Channel CX<br/>Directus Admin]
    end
    
    subgraph "API Gateway"
        API[FastAPI Backend<br/>Port 8000]
    end
    
    subgraph "Agent Coordinator"
        COORD[Coordinator Agent<br/>Qwen3-Max]
    end
    
    subgraph "Specialized Agents"
        COD[Coder Agent<br/>GLM-5]
        RES[Research Agent<br/>DeepSeek R1]
        VIS[Vision Agent<br/>Qwen3-VL]
    end
    
    subgraph "MCP Tools"
        MCP1[PostgreSQL DB]
        MCP2[Brave Search]
        MCP3[Filesystem]
        MCP4[GitHub]
        MCP5[Browser/Puppeteer]
        MCP6[Playwright]
    end
    
    subgraph "Vector & Graph"
        VESPA[Vespa AI<br/>Vector Search]
        NEO4J[Neo4j<br/>Knowledge Graph]
    end
    
    subgraph "Visual Pipeline"
        COMFY[ComfyUI<br/>Image/Video]
        OLLAMA[Ollama<br/>Local Models]
    end
    
    UI --> API
    API --> COORD
    COORD --> COD
    COORD --> RES
    COORD --> VIS
    
    COD --> MCP1
    COD --> MCP3
    RES --> MCP2
    RES --> MCP4
    VIS --> MCP5
    VIS --> MCP6
    
    COORD --> VESPA
    COORD --> NEO4J
    
    COD --> COMFY
    VIS --> OLLAMA
```

### Agent Role Definitions

| Agent | Primary Model | Responsibilities | Tools |
|-------|--------------|-------------------|-------|
| **Coordinator** | Qwen3-Max | Task decomposition, routing, orchestration | All MCP tools |
| **Coder** | GLM-5 | Code generation, debugging, refactoring | PostgreSQL, Filesystem |
| **Research** | DeepSeek R1 | Web search, content analysis, Chain-of-Thought reasoning | Brave Search, GitHub |
| **Vision** | Qwen3-VL (local) | Image analysis, visual content, QC | Puppeteer, Playwright |

---

## 4. MCP TOOLS & SERVER CONFIGURATION

### 4.1 Current MCP Servers

```json
{
  "mcpServers": {
    "vidiflow-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "connection": "postgresql://postgres:password@localhost:5432/vidiflow"
    },
    "vidiflow-filesystem": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "paths": ["/mnt/m/code/vidismart/vidiflow"]
    },
    "vidiflow-brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {"BRAVE_API_KEY": "${BRAVE_SEARCH_API_KEY}"}
    },
    "vidiflow-github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"}
    },
    "vidiflow-puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {"PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome"}
    },
    "vidiflow-playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "vidiflow-fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### 4.2 Environment Variables Required

```bash
# API Keys (Free Tier)
BRAVE_SEARCH_API_KEY=your_brave_key
OPENROUTER_API_KEY=your_openrouter_key  # For Qwen3-Max, DeepSeek R1
OPENLM_API_KEY=your_openlm_key  # For GLM-5
HUGGINGFACE_API_KEY=your_huggingface_key  # For MiniMax-M3
GITHUB_TOKEN=your_github_token

# Service Connections
SUPABASE_DATABASE_URL=postgresql://postgres:password@localhost:5432/vidismart_community
REDIS_URL=redis://localhost:6379

# Local Services
OLLAMA_HOST=http://localhost:11434
COMFYUI_HOST=http://localhost:8188
VESPA_ENDPOINT=http://localhost:8080
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=vidismart_omni_secret
```

---

## 5. DEPLOYMENT PROCEDURES

### 5.1 Prerequisites

```bash
# System Requirements
- Docker & Docker Compose
- 16GB RAM minimum (32GB recommended)
- 100GB disk space
- GPU optional for local models
```

### 5.2 Quick Start Deployment

```bash
# 1. Clone and navigate to project
cd /mnt/m/code/vidismart

# 2. Copy environment configuration
cp vidismart_community_plans/docker-compose.community.yml docker-compose.yml

# 3. Update .env with your API keys
# Edit the following in .env:
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY  
# - R2_ACCOUNT_ID
# - GEMINI_API_KEY

# 4. Start all services
docker-compose up -d

# 5. Verify services are running
docker-compose ps
```

### 5.3 Service Ports Configuration

| Service | Port | Protocol |
|---------|------|----------|
| Directus CMS | 8055 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Vespa | 8080 | HTTP |
| Vespa Admin | 19071 | HTTP |
| Neo4j HTTP | 7474 | HTTP |
| Neo4j Bolt | 7687 | TCP |
| Ollama | 11434 | HTTP |
| ComfyUI | 8188 | HTTP |

### 5.4 Manual Service Start (Alternative)

```bash
# Start individual services if not using Docker

# PostgreSQL
docker run -d --name vidismart-postgres \
  -e POSTGRES_USER=directus \
  -e POSTGRES_PASSWORD=directus_password \
  -e POSTGRES_DB=vidismart_community \
  -p 5432:5432 \
  postgis/postgis:15-3.3

# Redis
docker run -d --name vidismart-redis \
  -p 6379:6379 \
  redis:6

# Neo4j
docker run -d --name vidismart-neo4j \
  -e NEO4J_AUTH=neo4j/vidismart_omni_secret \
  -e NEO4J_PLUGINS='["apoc"]' \
  -p 7474:7474 -p 7687:7687 \
  neo4j:latest

# Vespa
docker run -d --name vidismart-vespa \
  -p 8080:8080 -p 19071:19071 \
  -e VESPA_CONTAINER_JVMARGS="-Xms2g -Xmx4g" \
  vespaengine/vespa:latest

# Directus
docker run -d --name vidismart-directus \
  -p 8055:8055 \
  --link vidismart-postgres:database \
  --link vidismart-redis:cache \
  -e KEY=vidismart-secret \
  -e SECRET=vidismart-secret \
  -e DB_CLIENT=pg \
  -e DB_HOST=database \
  -e DB_PORT=5432 \
  -e DB_DATABASE=vidismart_community \
  -e DB_USER=directus \
  -e DB_PASSWORD=directus_password \
  -e CACHE_ENABLED=true \
  -e CACHE_STORE=redis \
  -e CACHE_REDIS=redis://cache:6379 \
  directus/directus:latest
```

---

## 6. DOCKER & CONTAINERIZATION

### 6.1 Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  database:
    image: postgis/postgis:15-3.3
    container_name: vidismart-postgres
    restart: always
    environment:
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: directus_password
      POSTGRES_DB: vidismart_community
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - vidismart_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:6-alpine
    container_name: vidismart-cache
    restart: always
    ports:
      - "6379:6379"
    networks:
      - vidismart_net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  neo4j:
    image: neo4j:latest
    container_name: vidismart-neo4j
    restart: always
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/vidismart_omni_secret
      NEO4J_apoc_export_file_enabled: "true"
      NEO4J_apoc_import_file_enabled: "true"
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data
    networks:
      - vidismart_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7474"]
      interval: 30s
      timeout: 10s
      retries: 3

  vespa:
    image: vespaengine/vespa:latest
    container_name: vidismart-vespa
    restart: always
    ports:
      - "19071:19071"
      - "8080:8080"
    environment:
      VESPA_CONTAINER_JVMARGS: "-Xms2g -Xmx4g"
    volumes:
      - vespa_data:/opt/vespa/var
      - vespa_apps:/opt/vespa/app
    networks:
      - vidismart_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:19071/ApplicationStatus"]
      interval: 30s
      timeout: 10s
      retries: 3

  directus:
    image: directus/directus:latest
    container_name: vidismart-directus
    restart: always
    ports:
      - "8055:8055"
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_started
    environment:
      KEY: vidismart-community-secret-key
      SECRET: vidismart-community-secret-secret
      ADMIN_EMAIL: admin@vidismart.com
      ADMIN_PASSWORD: admin_password
      DB_CLIENT: pg
      DB_HOST: database
      DB_PORT: 5432
      DB_DATABASE: vidismart_community
      DB_USER: directus
      DB_PASSWORD: directus_password
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      CACHE_REDIS: redis://cache:6379
      STORAGE_LOCATIONS: local
      # Add R2 configuration for production
      # STORAGE_LOCATIONS: "r2"
      # STORAGE_R2_DRIVER: "s3"
      # STORAGE_R2_KEY: "${R2_ACCESS_KEY_ID}"
      # STORAGE_R2_SECRET: "${R2_SECRET_ACCESS_KEY}"
      # STORAGE_R2_BUCKET: "${R2_BUCKET_NAME}"
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
    networks:
      - vidismart_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8055/server/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  neo4j_data:
  vespa_data:
  vespa_apps:

networks:
  vidismart_net:
    driver: bridge
```

---

## 7. SERVICE HEALTH CHECKS

### 7.1 Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Directus | `http://localhost:8055/server/health` | `{"status":"ok"}` |
| PostgreSQL | `pg_isready -U directus` | Exit code 0 |
| Redis | `redis-cli ping` | `PONG` |
| Neo4j | `http://localhost:7474` | HTML response |
| Vespa | `http://localhost:19071/ApplicationStatus` | JSON status |

### 7.2 Scripted Health Check

```bash
#!/bin/bash
# health-check.sh

echo "=== VidiSmart Community Health Check ==="
echo ""

# Check Docker containers
echo "📦 Container Status:"
docker-compose ps
echo ""

# Check Directus
echo "🌐 Directus:"
curl -s http://localhost:8055/server/health && echo " OK" || echo " FAILED"
echo ""

# Check PostgreSQL
echo "🗄️ PostgreSQL:"
docker exec vidismart-postgres pg_isready -U directus && echo " OK" || echo " FAILED"
echo ""

# Check Redis
echo "⚡ Redis:"
docker exec vidismart-redis redis-cli ping && echo " OK" || echo " FAILED"
echo ""

# Check Neo4j
echo "🔷 Neo4j:"
curl -s http://localhost:7474 > /dev/null && echo " OK" || echo " FAILED"
echo ""

# Check Vespa
echo "🔍 Vespa:"
curl -s http://localhost:19071/ApplicationStatus > /dev/null && echo " OK" || echo " FAILED"
echo ""

echo "=== Health Check Complete ==="
```

---

## 8. MONITORING & LOGGING

### 8.1 Log Viewing Commands

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f directus
docker-compose logs -f neo4j
docker-compose logs -f vespa

# Follow with tail
docker-compose logs --tail=100 -f
```

### 8.2 Resource Monitoring

```bash
# Docker stats
docker stats

# Container resource usage
docker stats vidismart-directus vidismart-postgres vidismart-redis
```

---

## DEPLOYMENT CHECKLIST

- [ ] Copy docker-compose.community.yml to docker-compose.yml
- [ ] Update .env with R2 credentials
- [ ] Update .env with GEMINI_API_KEY
- [ ] Run `docker-compose up -d`
- [ ] Verify all health checks pass
- [ ] Access Directus at http://localhost:8055
- [ ] Login with admin@vidismart.com / admin_password

---

## NEXT STEPS

1. **Start Development**: Run `docker-compose up -d`
2. **Configure MCP**: Update mcp-config.json with API keys
3. **Initialize Database**: Access Directus and configure schema
4. **Deploy Frontend**: Build and deploy to production

---

**Document Location:** `vidismart_community_plans/VIDISMART_COMMUNITY_REFINED_PLAN.md`  
**Created:** February 21, 2026  
**Version:** 2.0 (Refined)

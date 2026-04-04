# VidiSmart Agent Orchestrator

Multi-agent content creation system using **CrewAI** + **Vespa MCP** for the VidiSmart platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CREWAI AGENT ORCHESTRATOR                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│   │   Research   │  │   Content    │  │    Video     │  │  Quality   ││
│   │   Agent      │→ │   Creator    │→ │   Planner    │→ │   Agent    ││
│   └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘│
│         │                  │                  │                │        │
│         ▼                  ▼                  ▼                ▼        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    VESPA MCP SERVER (8089/mcp/)                  │  │
│   │   • vespa_query - Semantic search                               │  │
│   │   • vespa_schema - Schema management                            │  │
│   │   • vespa_search - Full-text + vector hybrid search             │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                               │                                         │
│         ┌─────────────────────┼─────────────────────┐                  │
│         ▼                     ▼                     ▼                  │
│   ┌──────────┐         ┌──────────┐          ┌──────────┐             │
│   │ Vespa    │         │ Directus │          │ ComfyUI  │             │
│   │ Database │         │   CMS    │          │  Video   │             │
│   │ (8089)   │         │ (8055)   │          │  (8188)  │             │
│   └──────────┘         └──────────┘          └──────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

         ┌─────────────────┐           ┌─────────────────┐
         │  LM Studio      │           │   Ollama        │
         │  (Qwen 3.5)     │           │  (MiMo v2)      │
         │  Port 1234      │           │  Port 11434     │
         └─────────────────┘           └─────────────────┘
```

## Features

- **Multi-Agent Orchestration**: Research → Content → Video → QA pipeline
- **Vespa MCP Integration**: Native MCP server for vector search
- **Local LLM Support**: LM Studio (Qwen 3.5) and Ollama (MiMo v2)
- **Directus Integration**: Pull consultant data from CMS
- **ComfyUI Pipeline**: Generate video content

## Quick Start

### 1. Install Dependencies

```bash
cd crewai-orchestrator
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Ensure Infrastructure is Running

```bash
cd ../converge
docker-compose up -d
```

### 4. Run the Crew

```python
# Basic run (without Vespa MCP)
python crew.py

# Run with Vespa MCP tools
python -c "from crew import run_with_vespa_mcp; run_with_vespa_mcp('healthcare')"
```

## Agent Roles

| Agent | Role | LLM | Tools |
|-------|------|-----|-------|
| Research Specialist | Search Vespa for consultants/data | Qwen 3.5 | vespa_search, vespa_query |
| Content Creator | Write blog posts, articles | Qwen 3.5 | None |
| Video Planner | Create ComfyUI scripts | Qwen 3.5 | None |
| QA Lead | Review and approve content | Qwen 3.5 | None |

## Vespa MCP Tools

The native Vespa MCP server provides:

- **vespa_query**: Execute YQL queries against Vespa
- **vespa_schema**: Get schema information
- **vespa_search**: Perform semantic/hybrid search

### Example Queries

```python
# Search for AI consultants
vespa_query("select * from sources * where docType contains 'consultant' and industry contains 'healthcare'")

# Get schema info
vespa_schema("doc")

# Semantic search
vespa_search("AI consulting healthcare digital transformation")
```

## Configuration Files

- `crew.py` - Main orchestrator with agents and tasks
- `requirements.txt` - Python dependencies
- `.env.example` - Environment variables template
- `docker-compose.yml` - Infrastructure services

## Integration Points

### Directus CMS (Port 8055)
- Consultant profiles
- Case studies
- Technology stack data

### Vespa (Port 8089)
- Vector embeddings
- Full-text search
- Hybrid search

### LM Studio (Port 1234)
- Qwen 3.5 27B model
- Primary LLM for agents

### Ollama (Port 11434)
- MiMo v2 Omni model
- Backup/alternative LLM

### ComfyUI (Port 8188)
- Video generation
- Image creation
- Style transfer

## Project Structure

```
crewai-orchestrator/
├── crew.py                 # Main orchestrator
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── README.md              # This file
└── agents/                # Agent definitions (future)
    ├── research.py
    ├── content.py
    ├── video.py
    └── quality.py
```

## Troubleshooting

### Vespa MCP Not Connecting

1. Verify Vespa is running: `curl http://localhost:8089/mcp/`
2. Check Vespa logs: `docker logs converge-vespa`
3. Ensure Vespa version supports MCP (v8+)

### LM Studio Connection Issues

1. Ensure LM Studio server is running on port 1234
2. Check model is loaded: `curl http://localhost:1234/v1/models`
3. Verify API base URL in `.env`

### CrewAI Import Errors

```bash
pip install --upgrade crewai crewai-tools
```

## License

MIT

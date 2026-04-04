# VidiAi (Vespa) Vector Database - Complete Guide

## Current Status

| Component | Status |
|-----------|--------|
| HTTP API (port 8089) | ✅ Running - v8.620.35 |
| Config API (port 19071) | ✅ Running |
| Content Cluster | ⚠️ Not configured |
| Document Storage | ⚠️ Not initialized |
| Vector Index | ⚠️ Not configured |

---

## How Vespa's Vector Database Works

### 1. Core Architecture

Vespa is a **full-text search engine with integrated vector similarity search**. Unlike pure vector databases (like Pinecone or Milvus), Vespa combines:

```
┌─────────────────────────────────────────────────────────────┐
│                    VESPA ENGINE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐  │
│  │  Document   │   │   Vector    │   │   Traditional   │  │
│  │  Store     │   │   Search    │   │   BM25 Search   │  │
│  │ (JSON docs)│   │(embeddings) │   │  (keyword)      │  │
│  └─────────────┘   └─────────────┘   └─────────────────┘  │
│         │                 │                  │             │
│         └────────────────┼──────────────────┘             │
│                          ▼                                  │
│               ┌─────────────────────┐                      │
│               │  Hybrid Search      │                      │
│               │  (Combine all three)│                      │
│               └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### 2. How Vector Search Works in Vespa

#### Step 1: Embed Your Content
```python
# Use any embedding model (OpenAI, Voyage, local)
text = "A cat sitting on a couch"
embedding = get_embedding(text)  # Returns [0.12, -0.45, 0.89, ...] (1536 dims)
```

#### Step 2: Store in Vespa with Vector Field
```json
{
  "id": "video:123",
  "title": "Funny Cat Video",
  "description": "A cat sitting on a couch",
  "embedding": [0.12, -0.45, 0.89, ...],  // 1536-dim vector
  "metadata": {
    "duration": 120,
    "category": "pets"
  }
}
```

#### Step 3: Query with Similarity Search
```python
query = "adorable kitten"
query_embedding = get_embedding(query)

# Vespa search request
results = vespa.query(
    {
        "yql": "SELECT * FROM video_docs WHERE ({targetHits:10}nearestNeighbor(embedding, query_embedding))",
        "input": query_embedding
    }
)
```

### 3. Key Concepts

#### Document Schema (`.sd` file)
Defines your data structure:
```sd
schema video_docs {
    document video_docs {
        field title type string {
            indexing: summary | index
        }
        field description type string {
            indexing: summary | index
        }
        field embedding type tensor<float>(x[1536]) {
            indexing: attribute | index
            attribute: distance-metric: euclidean
        }
        field metadata type string {
            indexing: summary
        }
    }
}
```

#### Nearest Neighbor Search
```sd
# Enables fast approximate nearest neighbor search
field embedding type tensor<float>(x[1536]) {
    indexing: attribute | index
    attribute: distance-metric: euclidean
    index {
        hnsw {
            max-links-per-node: 16
            neighbors-to-explore-at-insert: 100
        }
    }
}
```

#### Hybrid Search (Combining Vector + Keyword)
```yql
SELECT * FROM video_docs WHERE
  ({targetHits:10}nearestNeighbor(embedding, query_embedding)) OR
  (title CONTAINS "cat" OR description CONTAINS "cat")
```

---

## Current Gap: What's Missing

### 1. Content Cluster Configuration
Vespa needs a **content cluster** to actually store and index documents:

**`services.xml`** (needed):
```xml
<?xml version="1.0" encoding="utf-8" ?>
<services version="1.0">
  <container id="default" version="1.0">
    <search/>
    <document-api/>
  </container>

  <content id="vidismart" version="1.0">
    <redundancy>1</redundancy>
    <documents>
      <document type="video_docs" mode="index"/>
    </documents>
    <nodes>
      <node distribution-key="0" hostalias="node1"/>
    </nodes>
  </content>
</services>
```

### 2. Document Schema Definition
We need to create `schemas/video_docs.sd` with:
- Vector field for embeddings
- Text fields for metadata
- HNSW index configuration

---

## How to Start Ingesting Content

### Option 1: Configure Full Vespa (Recommended)

1. **Create services.xml** in the Vespa app directory
2. **Create video_docs schema** with vector field
3. **Deploy** using Vespa CLI
4. **Start feeding** documents via REST API

### Option 2: Use Vespa Cloud (Easier)

Deploy to Vespa Cloud which handles all infrastructure:
- Automatic scaling
- Managed HNSW indexes
- Easy document ingestion

### Option 3: Alternative - Use pgvector

Since we already have PostgreSQL running with pgvector:

```sql
-- Create a table with vector support
CREATE TABLE video_embeddings (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255),
    title TEXT,
    embedding vector(1536),
    metadata JSONB
);

-- Create HNSW index
CREATE INDEX ON video_embeddings USING hnsw (embedding vector_cosine_ops);

-- Query similar videos
SELECT * FROM video_embeddings
ORDER BY embedding <=> query_vector
LIMIT 10;
```

---

## Quick Start: Ingest a Video Document

### Using REST API (once content cluster is configured)

```bash
curl -X PUT "http://localhost:8089/document/v1/vidismart/video_docs/docid/video-001" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": "How to Build a Smart Channel",
      "description": "Tutorial on creating AI-powered video marketing channels",
      "embedding": [0.1, -0.2, 0.3, ...],  // 1536 floats
      "metadata": {
        "duration": 300,
        "category": "marketing",
        "created_at": "2026-02-01"
      }
    }
  }'
```

### Query for Similar Videos

```bash
curl -X GET "http://localhost:8089/search/" \
  -H "Content-Type: application/json" \
  -d '{
    "yql": "SELECT * FROM video_docs WHERE ({targetHits:10}nearestNeighbor(embedding, query_embedding))",
    "input": [0.1, -0.2, 0.3, ...]  // Query embedding
  }'
```

---

## Next Steps

1. **Decision needed**: Use Vespa native or pgvector?
   - Vespa = more complex setup, better scalability
   - pgvector = already running, simpler

2. **If Vespa**: Need to create deployment package
   - `services.xml` (cluster config)
   - `schemas/video_docs.sd` (document schema)
   - `hosts.xml` (node definitions)

3. **Start ingesting**: Build a simple ingestion pipeline
   - Extract video metadata
   - Generate embeddings (Voyage AI, OpenAI, or local)
   - Feed to Vespa

---

## References

- [Vespa Documentation](https://docs.vespa.ai/)
- [Vector Search Guide](https://docs.vespa.ai/en/nearest-neighbor-search.html)
- [Document API](https://docs.vespa.ai/en/document-api.html)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

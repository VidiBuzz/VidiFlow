# AGENT AUTOMATION - VESPA AI ENGINE

## Stack Architecture
- **Primary AI Engine**: Vespa (hybrid search: text + vectors + tensors)
- **Knowledge Graph**: Neo4j (entity relationships)
- **Cache**: Redis
- **Database**: PostgreSQL/PostGIS (Directus CMS)
- **Storage**: Cloudflare R2

## Phase 1: Lead Capture → CRM Automation (TODAY)

### Agent 1: Lead Processor
```javascript
// Triggered on: /api/signup POST
1. Save to PostgreSQL (Directus) ✅
2. Index in Vespa for AI search
3. Create contact with tags: "vidismart-lead", platform type
5. Assign to sales rep
6. Trigger welcome sequence
```

**Vespa Indexing**:
```javascript
// Feed lead to Vespa for semantic search
await vespa.feed({
  schema: 'leads',
  fields: {
    id: leadId,
    company: companyName,
    email: email,
    platform: platformType,
    vector: embedding(companyDescription)  // For semantic search
  }
});
```

### Agent 2: Notification Bot
```javascript
// Immediate notifications
1. Email notification with lead details
2. SMS to assigned rep: "New lead: [Company Name]"
```

### Agent 3: Lead Qualifier
```javascript
// AI analyzes the submission via Vespa
1. Query Vespa for similar leads → score quality (1-10)
2. Check company size (LinkedIn API)
3. Determine budget tier
4. Auto-assign to appropriate rep
```

## Phase 2: Follow-up Automation (NEXT)

**Agent 4: Email Sequence**
```javascript
// n8n workflow
Day 0: Welcome + Calendar link
Day 1: Case study PDF
Day 3: Video demo invitation
Day 7: Special offer (if no response)
```

**Agent 5: Smart Scheduler**
```javascript
// When they book demo
1. Check calendar
2. Find best time based on lead score
3. Send Zoom link + prep materials
4. Remind both parties 1 hour before
```

## Phase 3: Content Multiplication (WEEK 2)

**Agent 6: Video Analyzer**
```javascript
// When demo video is uploaded
1. Twelve Labs → Extract scenes
2. Generate 30 social clips
3. Create thumbnails
4. Extract quotes for graphics
5. Index metadata in Vespa for content discovery
```

**Agent 7: Smart Channel Bot**
```javascript
// Auto-post generated content
1. Schedule across platforms
2. A/B test variations
3. Track engagement
4. Report winners back to Vespa
```

## Phase 4: Revenue Acceleration (MONTH 1)

**Agent 8: Upsell Detective**
```javascript
// Monitor customer usage via Vespa
1. Track video uploads (query Vespa)
2. Identify power users
3. Suggest platform upgrades
4. Auto-generate upsell emails
```

**Agent 9: Churn Preventer**
```javascript
// Retention monitoring
1. Detect low engagement (Vespa query)
2. Trigger re-engagement campaign
3. Offer bonus features
4. Schedule check-in call
```

## 🔥 VESPA AI INTEGRATION

### Core Capabilities (All Agents Use):
1. **Hybrid Search** - Text + vectors + structured data
2. **Multi-phase Ranking** - Custom ML ranking functions
3. **Tensor Fields** - For personalization/embeddings
4. **ONNX Model Serving** - Run ML models in Vespa
5. **Real-time Indexing** - Sub-second updates

### Vespa Schema for Community:
```yaml
# /data/vespa/apps/community/schemas/documents.sd
schema company {
  field name type string {}
  field description type string {}
  field video_profile type string {}
  field location type position {}
  field embedding type tensor<float>(x[768]) {
    indexing: attribute | index
    attribute: distance-metric: angular
  }
  field people type array<reference<person>> {}
}

schema person {
  field full_name type string {}
  field role type string {}
  field vidi_bio_url type string {}
  field embedding type tensor<float>(x[768]) {}
  field company_id type reference<company> {}
}

schema ai_news {
  field title type string {}
  field video_content type string {}
  field published_date type int {}
  field embedding type tensor<float>(x[768]) {}
}

schema tools {
  field name type string {}
  field category type string {}
  field ranking type int {}
  field embedding type tensor<float>(x[768]) {}
}
```

## MCP SERVERS FOR AGENTS

### Already Connected:
- **Memory** - Knowledge graph for customer data
- **Gmail** - Email automation
- **Google Drive** - Document storage
- **YouTube** - Video management

### Need to Add:
- **Vespa MCP** - Direct Vespa operations
- **Twelve Labs** - Video AI processing
- **Stripe** - Payment automation
- **n8n** - Workflow orchestration

## VESPA QUERY EXAMPLES FOR AGENTS

### Semantic Search for Leads:
```javascript
const results = await vespa.query({
  yql: `select * from leads where 
        ({targetHits:10}nearestNeighbor(embedding, query_embedding)) 
        or userQuery()`,
  input: `query_embedding`,
  ranking: 'hybrid'
});
```

### Find Similar Content:
```javascript
const similar = await vespa.query({
  yql: `select * from ai_news where 
        {targetHits:5}nearestNeighbor(embedding, $video_embedding)`,
  input: { video_embedding: videoEmbedding }
});
```

## IMPLEMENTATION ORDER:

### **TODAY (2 hours):**
1. Deploy Vespa container ✅
2. Connect Vespa MCP to signup endpoint
3. Auto-index leads on form submit

### **THIS WEEK:**
1. Build n8n welcome sequence
2. Add Twelve Labs video processing
3. Create Smart Channel scheduler with Vespa search

### **NEXT WEEK:**
1. Stripe payment integration
2. Automated invoice generation
3. Revenue tracking dashboard with Vespa analytics

## READY TO AUTOMATE?

**Tell me which agent to build first:**
1. Vespa lead indexing
2. Email welcome sequence
3. Video content multiplier

**LET'S GO! What's first?**

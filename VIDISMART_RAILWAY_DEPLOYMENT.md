# VidiSmart Railway Deployment Guide

## Date: 2026-03-26

---

## CRITICAL ARCHITECTURE QUESTION ANSWERED

### How Do HTML/JS Pages Integrate with Directus?

**Short Answer:** They DON'T integrate into Directus. They sit SEPARATE and call the Directus API.

**The Architecture:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VIDI.SMART ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐         ┌─────────────────────────────────┐ │
│  │  vidismart.com      │         │  Directus Admin Panel           │ │
│  │  (SiteGround)       │         │  (Railway)                      │ │
│  │                     │         │  admin.vidismart.com            │ │
│  │  • index.html       │         │                                 │ │
│  │  • ai_consultants   │   API   │  • Team manages data            │ │
│  │    _directory_v3    │◄───────►│  • Creates collections          │ │
│  │  • tool pages       │  REST/  │  • Uploads media                │ │
│  │  • landing pages    │ GraphQL │  • Sets permissions             │ │
│  │  • 20+ pages        │         │                                 │ │
│  └─────────────────────┘         └─────────────────────────────────┘ │
│            │                                │                        │
│            │                                │                        │
│            ▼                                ▼                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    RAILWAY (Backend Services)                    │ │
│  │                                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │ │
│  │  │ PostgreSQL   │  │ Vespa (Vidi.ai) │  │ Redis/Dragonfly   │  │ │
│  │  │ Database     │  │ Search Engine │  │ Cache              │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Points:**

1. **HTML pages stay on SiteGround** - Your 20+ existing HTML/JS pages remain where they are
2. **Directus runs on Railway** - Backend database + admin panel
3. **Pages call Directus API** - JavaScript fetch() calls to get data
4. **Directus NEVER shows to vendors** - Only your team uses the admin panel

**Example: How ai_consultants_directory_v3.html Works**

```javascript
// Current (static data in HTML):
const consultants = [
  { name: "Elevate AI", rating: 5.0 },
  { name: "The AI Lab", rating: 4.8 }
];

// Future (fetches from Directus API on Railway):
async function loadConsultants() {
  const response = await fetch('https://api.vidismart.com/items/consultants?filter[region][_eq]=South Florida');
  const data = await response.json();
  renderConsultants(data.data);
}
```

**The HTML page stays the same. Only the data source changes.**

---

## TWO-DATABASE ARCHITECTURE

### Database 1: AI Vendor Profiles (PostgreSQL + Directus)

**What it stores:**
- Company profiles (name, description, logo, video, images)
- People at each company (executives, team members)
- Custom fields per company tier
- Geo-spatial data (city, state, coordinates)
- Relationships between companies
- Interview content (video links, transcripts)
- Status/published workflow

**Schema Design:**

```sql
-- Core Tables
vendors_companies (id, name, slug, logo, video_url, description, city, state, lat, lng, tier, status)
vendors_people (id, company_id, name, title, photo, bio, linkedin, is_featured)
vendors_interviews (id, company_id, person_id, video_url, transcript, topics[], published_at)
vendors_categories (id, name, slug, icon)
vendors_company_categories (company_id, category_id)

-- Geo-spatial
CREATE INDEX idx_vendors_geo ON vendors_companies USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
```

**Directus Collections:**
- vendors_companies
- vendors_people
- vendors_interviews
- vendors_categories
- vendor_media (uploaded files)

### Database 2: Vidi.ai Search Index (Vespa)

**What it stores:**
- Vector embeddings of all content
- Full-text search index
- Semantic similarity rankings
- User behavior signals
- Real-time ranking models

**What Vespa Does NOT Store:**
- Raw data (pulled from PostgreSQL on demand)
- User accounts (handled by Next.js auth)
- Session state (handled by Dragonfly)

**Vespa Integration:**

```python
# Index a vendor in Vidi.ai
vespa_document = {
    "fields": {
        "company_name": "Elevate AI Consulting",
        "description": "We help leaders adopt AI responsibly...",
        "category": "AI Consulting / Strategy",
        "city": "Miami",
        "state": "Florida",
        "rating": 5.0,
        "people": ["John Smith (CEO)", "Jane Doe (CTO)"],
        "embedding": vector_embedding("AI consulting strategy Miami"),
        "video_count": 3,
        "interview_topics": ["enterprise AI", "leadership", "automation"]
    }
}

# Search with hybrid (keyword + semantic) ranking
results = vespa.search({
    "query": "AI consultant for enterprise in Florida",
    "ranking": "hybrid",  # BM25 + vector similarity
    "limit": 20
})
```

---

## RAILWAY DEPLOYMENT PLAN

### Step 1: Login to Railway

```bash
npx railway login
# Opens browser for authentication
```

### Step 2: Create Project

```bash
npx railway init vidismart-backend
```

### Step 3: Add Services (in order)

#### 3.1 PostgreSQL Database

```bash
# Railway provides managed PostgreSQL
# Add via Railway dashboard: New → Database → PostgreSQL

# Configuration:
- Name: vidismart-postgres
- Version: 15
- Storage: 20GB (expandable)
- RAM: 1GB (scales to 4GB)
```

#### 3.2 Dragonfly Cache (Redis replacement)

```bash
# Add via Railway dashboard: New → Database → Redis
# Or deploy Dragonfly Docker image

# docker-compose.yml for Dragonfly:
services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly
    command: --maxmemory=1gb --requirepass=your_password
    ports:
      - "6379:6379"
```

#### 3.3 Directus Instance

```bash
# Deploy Directus from template or custom Docker

# Environment Variables for Railway:
KEY=your-secret-key
SECRET=your-secret-value
ADMIN_EMAIL=admin@vidismart.com
ADMIN_PASSWORD=secure_password_here

DB_CLIENT=pg
DB_HOST=vidismart-postgres.railway.internal
DB_PORT=5432
DB_DATABASE=vidismart
DB_USER=postgres
DB_PASSWORD=railway_postgres_password

CACHE_ENABLED=true
CACHE_STORE=redis
CACHE_REDIS=redis://dragonfly:6379

STORAGE_LOCATIONS=r2
STORAGE_R2_KEY=your_r2_key
STORAGE_R2_SECRET=your_r2_secret
STORAGE_R2_BUCKET=vidismart-media
STORAGE_R2_ENDPOINT=https://your_account.r2.cloudflarestorage.com

PUBLIC_URL=https://admin.vidismart.com
```

#### 3.4 Vespa (Vidi.ai) Search Engine

```bash
# Vespa requires Docker deployment on Railway

# railway.yml:
services:
  vespa:
    image: vespaengine/vespa
    build:
      context: ./converge/vespa
    ports:
      - "8080:8080"
      - "8443:8443"
    volumes:
      - vespa_data:/opt/vespa/var
    env:
      VESPA_CONFIGSERVERS: vespa:19071
```

### Step 4: Set Up Custom Domains

```
admin.vidismart.com → Directus (Railway)
api.vidismart.com → Next.js API (Railway) - future
search.vidismart.com → Vespa (Railway) - future
```

---

## COST ESTIMATE

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| PostgreSQL | Pro | $5-10 |
| Dragonfly | Pro | $5 |
| Directus | Pro | $5-10 |
| Vespa | Pro | $10-20 |
| **Total Initial** | | **$25-45/month** |

**At 100+ users:** Still $25-45/month
**At 1000+ users:** Scale to $100-200/month

---

## IMMEDIATE DEPLOYMENT STEPS

### 1. Login to Railway
```bash
npx railway login
```

### 2. Link to existing project OR create new
```bash
# If you have an existing Railway project:
npx railway link

# If creating new:
npx railway init vidismart-backend
```

### 3. Deploy PostgreSQL
- Go to Railway dashboard
- Click "New Service"
- Select "PostgreSQL"
- Name: `vidismart-postgres`
- Wait for deployment

### 4. Deploy Directus
- Click "New Service"
- Select "GitHub Repo" or "Docker Image"
- For Docker: `directus/directus:latest`
- Add environment variables (see above)
- Connect to PostgreSQL

### 5. Import Data
Once Directus is running:

```bash
# Convert JSON to Directus import format
node scripts/import-consultants.js

# Or use Directus admin panel:
# 1. Go to https://admin.vidismart.com/admin/
# 2. Create "consultants" collection
# 3. Use Data Studio to import ai_consultants_data.json
```

---

## HTML PAGE INTEGRATION EXAMPLES

### Example 1: ai_consultants_directory_v3.html

**Current Code (static):**
```html
<div class="consultant-card">
  <h3>Elevate AI Consulting</h3>
  <span class="rating">5.0</span>
  <p>We help leaders adopt AI responsibly...</p>
</div>
```

**Updated Code (fetches from Directus):**
```html
<div id="consultants-grid"></div>

<script>
async function loadConsultants() {
  const res = await fetch('https://admin.vidismart.com/items/consultants?limit=20&sort=-rating');
  const { data } = await res.json();
  
  const grid = document.getElementById('consultants-grid');
  grid.innerHTML = data.map(c => `
    <div class="consultant-card">
      <h3>${c.name}</h3>
      <span class="rating">${c.rating}</span>
      <p>${c.description}</p>
      <span class="region">${c.region}</span>
    </div>
  `).join('');
}

loadConsultants();
</script>
```

### Example 2: Filter by Region

```html
<select id="region-filter" onchange="filterByRegion(this.value)">
  <option value="">All Regions</option>
  <option value="South Florida">South Florida</option>
  <option value="San Francisco CA">San Francisco</option>
  <!-- etc -->
</select>

<script>
async function filterByRegion(region) {
  let url = 'https://admin.vidismart.com/items/consultants';
  if (region) {
    url += `?filter[region][_eq]=${encodeURIComponent(region)}`;
  }
  const res = await fetch(url);
  const { data } = await res.json();
  renderConsultants(data);
}
</script>
```

### Example 3: Search with Vidi.ai (Vespa)

```html
<input type="text" id="search" placeholder="Search AI consultants...">
<div id="results"></div>

<script>
async function searchConsultants(query) {
  const res = await fetch('https://search.vidismart.com/search/', {
    method: 'POST',
    body: JSON.stringify({
      query: query,
      yql: 'select * from sources * where default contains "' + query + '"',
      hits: 20
    })
  });
  const data = await res.json();
  renderResults(data.hits);
}

document.getElementById('search').addEventListener('input', (e) => {
  searchConsultants(e.target.value);
});
</script>
```

---

## VESPA (VIDI.AI) SETUP

### What Vespa Needs

1. **Data Source:** PostgreSQL (for indexing)
2. **Schema Definition:** Search fields and ranking rules
3. **Indexing Pipeline:** Python/Node script to push data
4. **API Endpoint:** For queries from HTML pages

### Vespa Schema for AI Vendors

```xml
<schema>
  <document>
    <field name="id" type="string" type="string" indexing="summary">
    <field name="company_name" type="string" indexing="summary | index">
    <field name="description" type="string" indexing="summary | index">
    <field name="category" type="string" indexing="summary | index">
    <field name="city" type="string" indexing="summary | index">
    <field name="state" type="string" indexing="summary | index">
    <field name="rating" type="float" indexing="summary">
    <field name="people_count" type="int" indexing="summary">
    <field name="embedding" type="tensor<float>[768]" indexing="summary | index">
  </document>
  
  <rank-profiles>
    <rank-profile default>
      <first-phase>
        expression: bm25(text) + 0.5 * closeness(field, embedding)
      </first-phase>
    </rank-profile>
  </rank-profiles>
</schema>
```

### Indexing Script (Python)

```python
import json
import requests

# Load consultant data
with open('ai_consultants_data.json') as f:
    data = json.load(f)

# Index in Vespa
for consultant in data['consultants']:
    doc = {
        "fields": {
            "id": str(consultant['id']),
            "company_name": consultant['name'],
            "description": consultant.get('description', ''),
            "category": consultant['business_type'],
            "city": consultant['region'].split()[0],
            "state": consultant['region'][-2:] if consultant['region'] else '',
            "rating": consultant.get('rating') or 0.0,
            "embedding": get_embedding(consultant['name'] + ' ' + consultant.get('description', ''))
        }
    }
    requests.post('http://vespa:8080/document/v1/vidismart/doc/docid=' + str(consultant['id']), json=doc)
```

---

## NEXT STEPS

1. **Login to Railway:** `npx railway login`
2. **Create project:** `npx railway init vidismart-backend`
3. **Add PostgreSQL** via dashboard
4. **Add Directus** via Docker image
5. **Import consultants data** from ai_consultants_data.json
6. **Update HTML pages** to fetch from Directus API
7. **Deploy Vespa** for Vidi.ai search
8. **Index data** in Vespa

---

## ANSWER TO YOUR QUESTIONS

### Q: Where is the best place to host Directus?
**A:** Railway is perfect. It supports Docker, PostgreSQL, Redis, and scales horizontally.

### Q: Will this run on SiteGround?
**A:** No. SiteGround is PHP/MySQL only. Railway is the right choice.

### Q: How do 20+ pages integrate with Directus?
**A:** Pages stay separate (on SiteGround or moved to Railway). They call the Directus API via JavaScript (fetch). Directus is the backend, not the frontend.

### Q: Can it handle 1000+ users?
**A:** Yes. At $100-200/month on Railway with proper caching (Dragonfly) and search (Vespa), it handles 1000+ concurrent users easily.

### Q: Two databases needed?
**A:** Yes:
1. **PostgreSQL** - Structured vendor data (managed by Directus)
2. **Vespa** - Vector search + semantic ranking (Vidi.ai)

---

*Last updated: March 26, 2026*
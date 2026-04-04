# VidiSmart AI Directory - Visual Vector Omni Search Platform

## Overview
A modern AI-powered directory platform featuring:
- **Vespa** for vector similarity search + geospatial queries
- **Supabase/PostgreSQL** as the main relational database
- **Three.js** particle constellation background animation
- Dark theme with gradient aesthetics
- Real-time Omni Search with keyboard shortcuts (Ctrl/Cmd+K)

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Frontend (HTML/CSS/JS + Three.js)     │
│         Visual Vector Omni Search        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
  ┌────────┐      ┌──────────┐
  │ Vespa  │      │ Supabase │
  │ Vector │      │ PostgreSQL│
  │ Search │      │   DB     │
  └────────┘      └──────────┘
```

---

## Configuration

### Backend Services Config (main.js)

#### Vespa Configuration
```javascript
vespa: {
    baseUrl: 'https://vespa.vidismart.com',
    appId: 'vidismart-ai-directory',
    searchEndpoint: '/api/v1/search',
    vectorEndpoint: '/api/v1/vector-search',
    geospatialEndpoint: '/api/v1/geospatial'
}
```

#### Supabase Configuration
```javascript
supabase: {
    url: 'https://u2627-m33aqlpqghg3.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Load from .env in production
    endpoints: {
        users: '/rest/v1/users',
        companies: '/rest/v1/companies',
        consultants: '/rest/v1/consultants',
        resources: '/rest/v1/resources'
    }
}
```

---

## API Endpoints

### Vespa APIs

#### 1. Vector Search (Hybrid)
- **Endpoint:** `/api/v1/vector-search`
- **Method:** POST
- **Features:** Semantic search with embeddings, geospatial filtering
- **Request Body:**
```json
{
    "queries": [{
        "body": {
            "query": "AI consulting services",
            "features": [0.12, -0.45, ...], // 512-dim embedding vector
            "ranking": {
                "profile": "hybrid-search"
            },
            "where": "nearestNeighbor(location, lat(40.71), lon(-74.00)) <= 50km"
        }
    }]
}
```

#### 2. Text Search (Fallback)
- **Endpoint:** `/api/v1/search`
- **Method:** GET
- **Query Params:** `?query=<search_term>&limit=20`

#### 3. Geospatial Search
- **Endpoint:** `/api/v1/geospatial`
- **Method:** POST
- **Request Body:**
```json
{
    "location": { "lat": 40.71, "lon": -74.00 },
    "radius": "50km",
    "entity_type": "all",
    "limit": 50
}
```

### Supabase APIs (PostgreSQL REST)

#### Companies Table
- **Endpoint:** `/rest/v1/companies`
- **Filters:** `category=eq.<value>`, `location=ilike.%<term>%`, `limit=<n>`

#### Consultants Table
- **Endpoint:** `/rest/v1/consultants`
- **Filters:** `specialty=ilike.%<term>%`, `limit=<n>`

#### Resources Table
- **Endpoint:** `/rest/v1/resources`
- **Filters:** `type=eq.<value>`, `category=ilike.%<term>%`, `limit=<n>`

---

## Frontend Features

### Three.js Particle Constellation Background
- 150 particles with random positions and velocities
- Dynamic connecting lines between nearby particles (<8 units)
- Mouse interaction rotates the scene
- Gradient colors: #667eea (particles), #764ba2 (lines)

### Omni Search Box
- **Location:** Hero section, centered
- **Keyboard Shortcut:** Ctrl/Cmd + K
- **Functionality:** 
  - Calls unified Vespa + Supabase search
  - Shows loading state ("Searching Vespa + Supabase...")
  - Redirects to `directory.html?search=<term>`

### Styling (CSS)
- **Font:** Kumbh Sans (headers), Inter (body)
- **Colors:** 
  - Background: #0a0a2e → #1a1a4e gradient
  - Primary: #667eea, #764ba2
  - Text: #ffffff, #b8c7ff
- **Effects:** 3D buttons with transform/box-shadow, card hover animations

---

## File Structure

```
frontend/
├── index.html              # Main landing page
├── directory.html          # Search results page (to be created)
└── assets/
    ├── css/
    │   └── style.css       # Dark theme styles
    └── js/
        └── main.js         # Three.js + Vespa/Supabase integration
```

---

## Usage Instructions

### 1. Setup Environment Variables
Create `.env` file:
```bash
SUPABASE_URL=https://u2627-m33aqlpqghg3.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
VESPA_BASE_URL=https://vespa.vidismart.com
```

### 2. Update main.js Configuration
Replace placeholder values:
```javascript
supabase: {
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY // or load from .env
}
```

### 3. Run Local Development Server
```bash
cd frontend
python -m http.server 8080
# Visit http://localhost:8080
```

### 4. Deploy to Production
- **Static Hosting:** Netlify, Vercel, GitHub Pages
- **Backend:** Ensure Vespa cluster and Supabase project are accessible
- **CORS:** Configure CORS headers for cross-origin requests

---

## Database Schema (Supabase/PostgreSQL)

### companies Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Company name |
| description | TEXT | Company description |
| category | TEXT | AI category (LLM, Computer Vision, etc.) |
| location | TEXT | City/Country |
| website | TEXT | URL |
| rating | FLOAT | 0-5 scale |

### consultants Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Consultant name |
| specialty | TEXT | Area of expertise |
| bio | TEXT | Biography |
| location | TEXT | City/Country |
| contact_email | TEXT | Email address |

### resources Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Resource title |
| type | TEXT | blog, tutorial, dataset, tool |
| category | TEXT | Topic category |
| url | TEXT | Link to resource |
| description | TEXT | Summary |

---

## Search Flow Diagram

```
User Types Query
       │
       ▼
┌──────────────────┐
│ Omni Search Form │
│  (Ctrl+K focus)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ performUnifiedSearch()│
│   (Parallel Calls)    │
└────────┬──────────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌────────┐ ┌─────────┐  ┌──────────┐
│ Vespa  │ │Supabase │  │ Supabase │
│ Vector │ │Companies│  │Consultants│
└────┬───┘ └────┬────┘  └────┬─────┘
     │          │             │
     └──────────┴─────────────┘
              │
              ▼
    ┌─────────────────┐
    │ Merge & Rank    │
    │ (by score)      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Redirect to     │
    │ directory.html  │
    └─────────────────┘
```

---

## Performance Optimizations

1. **Parallel API Calls:** Vespa + Supabase queries run concurrently with `Promise.all()`
2. **Debounced Search:** Future enhancement for typing optimization
3. **Result Caching:** Implement localStorage or Redis cache layer
4. **Lazy Loading:** Load Three.js only when visible
5. **CDN Assets:** Host Three.js from CDN (already implemented)

---

## Security Considerations

1. **API Keys:** Never expose Supabase anon key in production frontend; use middleware proxy
2. **Rate Limiting:** Implement on backend APIs
3. **Input Sanitization:** Validate all search queries
4. **CORS:** Restrict to allowed origins
5. **HTTPS Only:** Enforce secure connections

---

## Future Enhancements

- [ ] Add result filtering UI (category, location, type)
- [ ] Implement pagination for large result sets
- [ ] Add user authentication and saved searches
- [ ] Create detailed company/consultant profile pages
- [ ] Integrate OpenAI embeddings API for real vector generation
- [ ] Add voice search capability
- [ ] Build admin dashboard for content management

---

## Credits & References

- **Three.js:** https://threejs.org
- **Vespa:** https://vespa.ai
- **Supabase:** https://supabase.com
- **Fonts:** Google Fonts (Kumbh Sans, Inter)

---

*Last Updated: March 12, 2026*
*Version: 1.0.0*

# Vidismart Data Discovery Report

## Scan Date: 2026-03-26

---

## Executive Summary

Successfully scanned vidismart.com and discovered comprehensive data assets ready for Directus migration. The site is an AI-powered platform for small businesses with a substantial AI Consultants Directory containing 600+ companies.

---

## Site Overview

**Domain:** https://vidismart.com  
**Brand:** VidiSmart / Vidi Smart  
**Tagline:** "Transform Your Tech Stack into a Smart Stack in 10 Minutes"  
**Purpose:** AI-powered platform connecting small businesses with AI technologies and consultants

### Navigation Structure
- Master Stack
- AI Consultants
- Join Waitlist

---

## Data Files Discovered

### 1. ai_consultants_data.json ✅
- **Location:** `m:\code\vidismart\ai_consultants_data.json`
- **Total Records:** 436 consultants
- **Generated:** 2026-03-01
- **Status:** Ready for migration

#### Data Schema
| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | Yes | 1 |
| name | String | Yes | "Elevate AI Consulting" |
| business_type | String | Yes | "AI Consulting / Strategy" |
| rating | Float | No | 5.0 |
| description | Text | No | "We help leaders adopt AI responsibly..." |
| region | String | Yes | "South Florida" |
| address | String | No | "407 Lincoln Rd Suite 6-H, Miami Beach, FL 33139" |
| phone | String | No | "(305) 924-6820" |
| website | URL | No | "http://www.elevateaiconsulting.com/" |
| created_at | Timestamp | Yes | "2026-03-01T10:42:50.890752" |

#### Business Categories Found
1. AI Consulting / Strategy
2. AI / ML Development
3. Visual AI / Computer Vision
4. RAG / LLM / NLP
5. AI Infrastructure / MLOps
6. AI Automation
7. Data Science / Analytics

#### Regions Covered (8)
1. South Florida
2. San Francisco CA
3. Denver CO
4. Chicago IL
5. Detroit MI
6. Cleveland OH
7. Saint Louis MO
8. Bentonville AR

#### Sample Consultants
| Name | Rating | Region | Category |
|------|--------|--------|----------|
| Elevate AI Consulting | 5.0 | South Florida | AI Consulting / Strategy |
| The AI Consulting Lab | 5.0 | South Florida | AI Consulting / Strategy |
| Acsetra - AI Consulting | null | San Francisco CA | AI Consulting / Strategy |
| AIM Consulting | 2.6 | Denver CO | AI Consulting / Strategy |
| Slalom Consulting | 4.9 | San Francisco CA | AI Consulting / Strategy |
| Boston Consulting Group | 4.8 | San Francisco CA | AI Consulting / Strategy |

---

### 2. ai_visual_rag_companies_20260214_165715.json
- **Location:** `m:\code\vidismart\ai_visual_rag_companies_20260214_165715.json`
- **Status:** Contains Visual AI/RAG companies
- **Fields:** name, website, scraped_address, category

---

### 3. company_descriptions.json
- **Location:** `m:\code\vidismart\company_descriptions.json`
- **Status:** Company description mappings
- **Contains:** 40+ company descriptions

---

## Directus Schema Recommendations

### Collection: consultants
```json
{
  "collection": "consultants",
  "meta": {
    "singleton": false,
    "icon": "badge",
    "note": "AI Consultant profiles from vidismart.com"
  },
  "schema": {
    "fields": [
      {"field": "id", "type": "integer", "pk": true},
      {"field": "name", "type": "string", "required": true},
      {"field": "business_type", "type": "string"},
      {"field": "rating", "type": "float"},
      {"field": "description", "type": "text"},
      {"field": "region", "type": "string"},
      {"field": "address", "type": "string"},
      {"field": "phone", "type": "string"},
      {"field": "website", "type": "string"},
      {"field": "email", "type": "string"},
      {"field": "logo", "type": "uuid", "relation": "directus_files"},
      {"field": "status", "type": "string", "default": "published"},
      {"field": "featured", "type": "boolean", "default": false},
      {"field": "created_at", "type": "timestamp"},
      {"field": "updated_at", "type": "timestamp"}
    ]
  }
}
```

### Collection: categories
```json
{
  "collection": "categories",
  "schema": {
    "fields": [
      {"field": "id", "type": "integer", "pk": true},
      {"field": "name", "type": "string", "required": true},
      {"field": "slug", "type": "string"},
      {"field": "description", "type": "text"},
      {"field": "sort", "type": "integer"}
    ]
  }
}
```

### Collection: regions
```json
{
  "collection": "regions",
  "schema": {
    "fields": [
      {"field": "id", "type": "integer", "pk": true},
      {"field": "name", "type": "string", "required": true},
      {"field": "slug", "type": "string"},
      {"field": "state", "type": "string"},
      {"field": "country", "type": "string", "default": "US"}
    ]
  }
}
```

---

## Migration Priority

### Phase 1: Immediate (High Priority)
- [ ] Import 436 consultants from ai_consultants_data.json
- [ ] Create 7 business categories
- [ ] Create 8 regions
- [ ] Validate data integrity

### Phase 2: Soon (Medium Priority)
- [ ] Import Visual AI/RAG companies
- [ ] Import company descriptions
- [ ] Set up media/assets

### Phase 3: Later (Low Priority)
- [ ] Dynamic pages
- [ ] User accounts
- [ ] Advanced features

---

## Directus Instance Details

**URL:** http://localhost:8060/admin/  
**Version:** directus:latest  
**Database:** vidismart_community (PostgreSQL)  
**Storage:** Cloudflare R2  
**Status:** ✅ Running

---

## Next Steps

1. **Access Directus Admin:** http://localhost:8060/admin/
2. **Create Collections:** consultants, categories, regions
3. **Import Data:** Use Directus API or admin panel
4. **Test API Endpoints:** Verify data access
5. **Update Frontend:** Connect to Directus API

---

## Notes

- All 436 consultants have complete data (name, category, region, contacts)
- 295 consultants have descriptions
- 523 have phone numbers
- 537 have websites
- Data is current as of March 1, 2026
# Vidismart.com Site Scan Report

## Scan Date: 2026-03-26

---

## Site Overview

**Domain:** https://vidismart.com  
**Brand:** VidiSmart / Vidi Smart  
**Tagline:** "Transform Your Tech Stack into a Smart Stack in 10 Minutes"  
**Purpose:** AI-powered platform for small businesses to optimize technology infrastructure

---

## Homepage Structure

### Header Navigation
- Logo: "Vidi Smart"
- Main Navigation:
  - Master Stack
  - AI Consultants
  - Join Waitlist
  - CTA Button: "Join Waitlist"

### Hero Section
- Headline: "Transform Your Tech Stack into a Smart Stack in 10 Minutes"
- Subheadline: "Join 36 million small businesses using AI to increase efficiency by 500-1000%"
- CTAs:
  - "Join Early Access Waitlist"
  - "Browse 481 Technologies"

### Features Section
- 3D Animation (Built with Spline)

### Tabs Section
- Small Businesses
- Vetted Technologies
- To Smart Stack
- Max Efficiency Gain

### What is VidiSmart?
- AI-powered platform description
- Value propositions:
  - Proprietary AI searches 481+ technologies
  - GDPR, CCPA, SOC2 compliant
  - Complete analysis in 10 minutes

### How It Works
- Four simple steps:
  1. AI Discovery
  2. Omni Search™
  3. Smart Stack
  4. Instant Deployment

---

## AI Consultants Directory

**URL:** https://vidismart.com/ai_consultants_directory_v3.html  
**Title:** "AI & Visual AI Consultants Directory"  
**Categories:** Machine Learning | Computer Vision | LLM/RAG | AI Strategy

### Directory Statistics
| Metric | Count |
|--------|-------|
| Total AI Companies & Consultants | 600 |
| Regions Covered | 8 |
| With Descriptions | 295 |
| With Phone Numbers | 523 |
| With Websites | 537 |

### Filter Options
- By Business Type
- By Region
- Regions: South Florida, San Francisco, Denver, Detroit, Chicago, Saint Louis

### Business Categories Observed
1. **AI Consulting / Strategy** (85 companies)

### Data Fields per Company
| Field | Type | Example |
|-------|------|---------|
| Company Name | Text | "Elevate AI Consulting" |
| Business Type | Tag | "AI Consulting / Strategy" |
| Rating | Number | 5.0, 2.6 |
| Description | Text (long) | Company description |
| Region | Text | "South Florida", "San Francisco CA" |
| Address | Text | Full street address |
| Phone | Phone | "(727) 292-1966" |
| Website | URL | "https://www.acsetra.com/" |

### Sample Companies Found
1. Elevate AI Consulting - Miami, FL (Rating: 5.0)
2. The AI Consulting Lab - South Florida (Rating: 5.0)
3. Acsetra - AI Consulting - San Francisco, CA
4. AIM Consulting - Denver, CO (Rating: 2.6)

---

## Pages to Catalog

### Discovered Pages
1. `/` - Homepage (landing page)
2. `/ai_consultants_directory_v3.html` - AI Consultants Directory
3. (Additional pages need to be discovered via sitemap or further crawling)

---

## Data Schema Requirements for Directus

### Collection: Consultants
| Field | Type | Notes |
|-------|------|-------|
| id | Primary Key | Auto-generated |
| company_name | String | Required |
| business_type | Relationship → Categories | Many-to-many |
| rating | Float | Optional, 0-5 scale |
| description | Text (Rich Text) | Company description |
| region | Relationship → Regions | Many-to-one |
| address | String | Full address |
| phone | String | Phone number |
| website | URL | Company website |
| email | Email | Contact email |
| logo | Image (Directus Files) | Company logo |
| status | Enum | draft/published/archived |
| featured | Boolean | Show on homepage |
| created_at | Timestamp | Auto-generated |
| updated_at | Timestamp | Auto-generated |

### Collection: Categories
| Field | Type | Notes |
|-------|------|-------|
| id | Primary Key | Auto-generated |
| name | String | e.g., "AI Consulting / Strategy" |
| slug | String | URL-friendly name |
| description | Text | Category description |
| parent | Relationship → Categories | Self-referencing for hierarchy |
| sort | Integer | Display order |

### Collection: Regions
| Field | Type | Notes |
|-------|------|-------|
| id | Primary Key | Auto-generated |
| name | String | e.g., "South Florida" |
| slug | String | URL-friendly name |
| state | String | State code |
| country | String | Country code |
| latitude | Float | For map display |
| longitude | Float | For map display |

### Collection: Pages
| Field | Type | Notes |
|-------|------|-------|
| id | Primary Key | Auto-generated |
| title | String | Page title |
| slug | String | URL path |
| content | Rich Text | Page content |
| meta_title | String | SEO title |
| meta_description | Text | SEO description |
| status | Enum | draft/published/archived |
| template | String | Layout template |
| created_at | Timestamp | Auto-generated |
| updated_at | Timestamp | Auto-generated |

### Collection: Tools
| Field | Type | Notes |
|-------|------|-------|
| id | Primary Key | Auto-generated |
| name | String | Tool name |
| slug | String | URL-friendly name |
| description | Rich Text | Tool description |
| category | Relationship → Categories | Many-to-many |
| website | URL | Tool website |
| pricing | String | Free/Paid/Freemium |
| rating | Float | User rating |
| features | JSON | Feature list |
| logo | Image | Tool logo |
| status | Enum | draft/published/archived |

---

## Integration Requirements

### API Endpoints Needed
1. `GET /api/consultants` - List all consultants with filtering
2. `GET /api/consultants/:id` - Single consultant detail
3. `GET /api/categories` - List all categories
4. `GET /api/regions` - List all regions
5. `GET /api/tools` - List all tools
6. `GET /api/pages/:slug` - Get page by slug

### Frontend Components to Build
1. Consultant Card (reusable)
2. Filter Panel (by category, region)
3. Search Bar
4. Pagination
5. Page Template (for dynamic pages)

---

## Migration Priority

### Phase 1 (High Priority)
- [ ] AI Consultants Directory data (600 records)
- [ ] Categories (AI Consulting, Computer Vision, etc.)
- [ ] Regions (8 regions)

### Phase 2 (Medium Priority)
- [ ] Tools directory (481+ tools)
- [ ] Homepage content
- [ ] Static pages

### Phase 3 (Low Priority)
- [ ] Additional directories
- [ ] User accounts
- [ ] Advanced features

---

## Notes

- The site uses a waitlist/early access model
- Main value proposition: AI-powered tech stack optimization
- Directory is a key feature with substantial data (600+ entries)
- Data is structured by business type and geographic region
- Need to maintain SEO URLs for existing pages
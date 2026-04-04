# Vidismart Community Site - Agent Plan

## Objective
Configure Directus (port 8060) as the main database/CMS for vidismart.com and organize all existing pages for the community site.

---

## Phase 1: SiteGround Scan & Inventory

### 1.1 Scan All Pages on vidismart.com
- Use web crawling to discover all HTML pages
- Identify page types: landing pages, directory pages, tool pages, etc.
- Document URL structure and navigation hierarchy
- Catalog existing data schemas (consultants, tools, companies, etc.)

### 1.2 Key Pages Identified
- `/ai_consultants_directory_v3.html` - AI Consultants Directory
- Other tool directories
- Landing pages
- API endpoints
- Static assets

### 1.3 Deliverables
- Complete sitemap of vidismart.com
- Page inventory with metadata
- Data schema analysis for each page type

---

## Phase 2: Directus Schema Design

### 2.1 Content Types to Create
Based on initial scan, anticipate needing:
- **Consultants** - AI consultant profiles
- **Companies** - Company listings
- **Tools** - AI tool directory
- **Categories** - Classification system
- **Media** - Images, logos, assets
- **Pages** - Dynamic page content
- **Users** - Community members

### 2.2 Relationships
- Consultants → Companies (many-to-one)
- Consultants → Categories (many-to-many)
- Tools → Categories (many-to-many)
- Pages → Media (many-to-one)

### 2.3 Custom Fields
- SEO metadata
- Status (draft/published/archived)
- Featured flags
- Timestamps

---

## Phase 3: Data Migration Strategy

### 3.1 Source Data Analysis
- Current HTML pages (static content)
- JSON files in workspace (ai_companies, consultants data)
- Database exports if available

### 3.2 Migration Approach
1. Export data from existing sources
2. Transform to Directus-compatible format
3. Import via Directus API or admin panel
4. Validate data integrity

### 3.3 Tools Required
- Directus API client
- Data transformation scripts
- Validation scripts

---

## Phase 4: Frontend Integration

### 4.1 API Endpoints to Build
- `/api/consultants` - List/search consultants
- `/api/tools` - List/search tools
- `/api/companies` - List/search companies
- `/api/pages` - Dynamic page content

### 4.2 Frontend Updates
- Replace static HTML with dynamic Directus-driven content
- Implement search/filter functionality
- Add admin dashboard for content management

---

## Phase 5: Deployment & Testing

### 5.1 Directus Configuration
- Set up production credentials
- Configure CORS for vidismart.com
- Set up media storage (R2)
- Enable necessary extensions

### 5.2 Testing Checklist
- [ ] All pages load correctly
- [ ] Data displays accurately
- [ ] Search/filter works
- [ ] Admin panel accessible
- [ ] Media uploads work
- [ ] API responses correct

---

## Agent Assignments

| Agent | Task | Priority |
|-------|------|----------|
| **Scanner Agent** | Crawl vidismart.com, build sitemap | High |
| **Schema Agent** | Design Directus collections | High |
| **Migration Agent** | Extract and transform existing data | Medium |
| **Integration Agent** | Build API endpoints and frontend | Medium |
| **Testing Agent** | Validate everything works | High |

---

## Timeline Estimate
- Phase 1 (Scan): 2-4 hours
- Phase 2 (Schema): 2-3 hours
- Phase 3 (Migration): 4-6 hours
- Phase 4 (Integration): 6-8 hours
- Phase 5 (Testing): 2-4 hours

**Total: 16-25 hours**

---

## Next Steps
1. Begin Phase 1: Scan all pages on vidismart.com
2. Document findings in detailed inventory
3. Design Directus schema based on discovered content types
4. Begin data migration planning
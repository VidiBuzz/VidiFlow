# Directus Integration Plan for VidiCRM.com (Local Docker)

## Executive Summary
This document outlines the comprehensive plan to migrate all VidiSmart HTML pages into the local Directus CMS platform (VidiCRM.com) running on Docker. The smart-book project serves as the foundational content model for this migration.

## Architecture Overview

| Component | Location | URL |
|-----------|----------|-----|
| VidiCRM.com (Directus) | Local Docker | http://localhost:8055 |
| VidiSmart.com (Static HTML) | SiteGround | https://vidismart.com |
| BYO Smart Stack App | Railway | https://vidismart-smartstack-production.up.railway.app |

## Phase 1: Discovery & Assessment (Complete)

### Current State Analysis
- **Source Platform**: Static HTML site (smart-book) with 50+ HTML pages on SiteGround
- **Target Platform**: Directus CMS (headless) on Local Docker (VidiCRM.com)
- **Content Volume**: 50 existing pages in `site_pages` collection
- **Schema Requirements**: Custom fields for book-specific content

### Smart-Book Content Structure
```
BOOK_DATA Object:
├── metadata (title, description, etc.)
├── personas (3 types: consumer, it_professional, executive_entrepreneur)
├── chapters (37 chapters across 5 parts)
├── knowledgeNodes (content nodes for graph)
└── edges (relationships between nodes)
```

## Phase 2: Schema Design

### Proposed `site_pages` Collection Schema

#### Core Fields (Existing)
- `id` (auto-generated)
- `status` (published, draft, archived)
- `title` (string)
- `slug` (string, URL-friendly)
- `file_path` (string)
- `description` (text)
- `menu_label` (string)
- `menu_order` (integer)
- `show_in_menu` (boolean)
- `icon` (string)
- `category` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

#### New Smart-Book Specific Fields
- `content` (rich text/JSON - main book content)
- `meta_description` (SEO optimization)
- `head_content` (custom head HTML)
- `persona_type` (consumer/it_professional/executive_entrepreneur)
- `chapter_number` (integer for ordering)
- `part_number` (integer for parts)
- `is_interactive` (boolean for 3D features)
- `animation_data` (JSON for Three.js configuration)

### Category Structure
- `books` (for smart-book content)
- `landing_pages` (for main site pages)
- `resources` (for supporting materials)
- `documentation` (for technical docs)

## Phase 3: Migration Strategy

### Step 1: Local Docker Environment Setup
- **Timeline**: 1-2 days
- **Tasks**:
  1. Verify Directus Docker container is running on port 8055
  2. Configure `site_pages` collection with new schema
  3. Set up preview environment
  4. Create initial admin user and API keys

### Step 2: Content Migration (Phase 1 - Smart-Book)
- **Timeline**: 3-5 days
- **Approach**: Batch migration using Directus API
- **Process**:
  1. Export smart-book content to structured JSON
  2. Transform data to match Directus schema
  3. Import via Directus API batch operations
  4. Verify data integrity

### Step 3: Content Migration (Phase 2 - Remaining Pages)
- **Timeline**: 2-3 weeks
- **Scope**: All 50+ HTML pages across VidiSmart domains
- **Automation**: Custom migration scripts

### Step 4: Preview & Testing
- **Timeline**: 1-2 days
- **Test URLs**:
  - Preview: `http://localhost:8055/admin/content/site_pages`
  - Live: `https://vidismart.com/smart-book/`

## Phase 4: Production Migration

### Cutover Plan
1. **Blue-Green Deployment**: Maintain both static and CMS versions
2. **DNS Switch**: Gradual traffic migration
3. **Monitoring**: Real-time error tracking
4. **Rollback Plan**: Static files backup

### SEO Considerations
- 301 redirects from old URLs
- Preserve meta descriptions
- Maintain URL structure where possible
- Submit sitemap to search engines

## Technical Implementation

### API Integration
```javascript
// Example: Creating a page in Directus (Local Docker)
const response = await fetch('http://localhost:8055/items/site_pages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Smart Book Chapter 1',
    slug: 'chapter-1',
    content: chapterData,
    category: 'books',
    persona_type: 'consumer'
  })
});
```

### Data Transformation Pipeline
1. **HTML Parser**: Extract content from static HTML
2. **Content Chunker**: Split into logical sections
3. **Metadata Extractor**: Generate slugs, titles, descriptions
4. **API Loader**: Batch import to Directus

## Risk Analysis

### High Risk
- **Data Loss**: Mitigation - Multiple backups before migration
- **Downtime**: Mitigation - Blue-green deployment strategy

### Medium Risk
- **Schema Mismatch**: Mitigation - Thorough testing in staging
- **Performance Issues**: Mitigation - Index optimization in Directus

### Low Risk
- **User Training**: Mitigation - Documentation and training sessions
- **Browser Compatibility**: Mitigation - Cross-browser testing

## Success Metrics

### Phase 1 (VIDIpitch.com)
- [ ] All smart-book content accessible via Directus
- [ ] Page load times < 2 seconds
- [ ] Zero critical bugs
- [ ] User acceptance testing passed

### Phase 2 (Full Migration)
- [ ] 100% content migration accuracy
- [ ] All pages indexed and searchable
- [ ] SEO metrics maintained or improved
- [ ] 99.9% uptime

## Next Steps

1. **Immediate**: Review and approve this plan
2. **Week 1**: Verify local Docker Directus environment
3. **Week 2-3**: Execute Phase 1 migration (smart-book)
4. **Week 4-6**: Execute Phase 2 migration (remaining pages)
5. **Week 7**: Production cutover planning

## Support & Resources

- Directus Documentation: https://docs.directus.io
- API Reference: https://docs.directus.io/api/
- Migration Scripts: To be developed in collaboration with dev team

---
*Document Version: 1.0*  
*Last Updated: April 13, 2026*
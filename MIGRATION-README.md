# VidiSmart to Directus Migration Scripts

This directory contains scripts and tools for migrating VidiSmart HTML pages into the local Directus CMS platform (VidiCRM.com) running on Docker at `http://localhost:8055`.

## Architecture Overview

| Component | Location | URL |
|-----------|----------|-----|
| VidiCRM.com (Directus) | Local Docker | http://localhost:8055 |
| VidiSmart.com (Static HTML) | SiteGround | https://vidismart.com |
| BYO Smart Stack App | Railway | https://vidismart-smartstack-production.up.railway.app |

## Quick Start

### 1. Set Up Environment
```bash
# Set your Directus access token
export DIRECTUS_ACCESS_TOKEN="your-token-here"
```

### 2. Run Migration
```bash
# Preview migration (dry run)
npm run migrate:dry-run

# Migrate all files
npm run migrate

# Migrate by category
npm run migrate:books
npm run migrate:landing
npm run migrate:tools
npm run migrate:docs

# Migrate single file
npm run migrate:file smart-book/index.html
```

## Files

| File | Purpose |
|------|---------|
| `migrate-to-directus.js` | Main migration script |
| `package.json` | NPM scripts and dependencies |
| `DIRECTUS-INTEGRATION-PLAN.md` | Comprehensive integration plan |
| `VIDISMART-LAUNCH-PLAN.md` | Launch dashboard and status |

## Configuration

Edit `migrate-to-directus.js` to modify:

```javascript
const CONFIG = {
  directusUrl: 'http://localhost:8055',
  accessToken: process.env.DIRECTUS_ACCESS_TOKEN || '',
  collection: 'site_pages',
  batchSize: 10,
  delayBetweenBatches: 1000,
};
```

## Prerequisites

1. **Directus Docker container must be running**:
   ```bash
   docker-compose up -d
   ```

2. **Verify Directus is accessible**:
   ```bash
   curl http://localhost:8055
   ```

3. **Get your access token** from Directus admin panel:
   - Navigate to http://localhost:8055/admin
   - Log in with admin credentials
   - Go to User Settings → API Tokens → Create Token

## HTML Files to Migrate

The script migrates the following files by default:

### Books
- `smart-book/index.html` - Smart Book Landing Page
- `smart-book/print-book.html` - Smart Book Reader

### Landing Pages
- `vidismart.masterlist.html` - VidiSmart Master List
- `vidismart.masterlist.FINAL.html` - VidiSmart Master List (Final)
- `vidismart.consultants.html` - VidiSmart Consultants
- `vidismart.directory.html` - VidiSmart Directory
- `vidismart.sectors.html` - VidiSmart Sectors
- `vidismart.deck.html` - VidiSmart Deck
- `vidismart.deck.agent.html` - VidiSmart Agent Deck
- `vidismart.smartsearch.presentation.html` - VidiSmart Smart Search
- `vidismart.newsaggregator.presentation.html` - VidiSmart News Aggregator
- `vidismart.streamstack.html` - VidiSmart StreamStack
- `smartchannelcx.html` - SmartChannel CX
- `smartchannelcx-tech.html` - SmartChannel CX Tech

### Tools
- `smartstack-builder.html` - Smart Stack Builder
- `smartstack.html` - Smart Stack
- `smartgen.html` - SmartGen
- `smartgen.tools.html` - SmartGen Tools
- `smartgen.vlm.html` - SmartGen VLM

### Documentation
- `smartchannel.dashbuild-ses_397e.md` - SmartChannel Dashboard Build

## Adding New Files

To add new files to the migration, edit the `HTML_FILES` array in `migrate-to-directus.js`:

```javascript
const HTML_FILES = [
  { path: 'path/to/file.html', category: 'category', title: 'Page Title' },
  // Add more files here
];
```

## Troubleshooting

### Error: DIRECTUS_ACCESS_TOKEN environment variable is required
Set your Directus access token:
```bash
export DIRECTUS_ACCESS_TOKEN="your-token-here"
```

### Error: File not found
Ensure the file path is relative to the workspace root (`m:/code/vidismart`).

### Error: HTTP 401 Unauthorized
Your access token is invalid or expired. Generate a new token from Directus admin panel.

### Error: HTTP 403 Forbidden
Your token doesn't have permission to create items in the `site_pages` collection. Check your role permissions.

## Directus API Reference

- **Create Item**: `POST /items/{collection}`
- **Update Item**: `PATCH /items/{collection}/{id}`
- **Delete Item**: `DELETE /items/{collection}/{id}`
- **List Items**: `GET /items/{collection}`
- **Get Item**: `GET /items/{collection}/{id}`

Full API docs: https://docs.directus.io/api/

## Support

For issues or questions, contact the VidiSmart development team.
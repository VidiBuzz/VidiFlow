# VidiSmart Automated Deployment System

## Overview

This deployment system automates pushing web content to the correct destinations:
- **HTML/CSS/JS files** → SiteGround (vidismart.com) via Git
- **Images & Videos** → Cloudflare R2 (CDN for fast global delivery)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Local Files    │────▶│  Git Repository  │────▶│  SiteGround     │
│  (vidismart/    │     │  (master branch) │     │  (vidismart.com)│
│   workspace)    │     └──────────────────┘     └─────────────────┘
└─────────────────┘              │
                                 │
                    ┌────────────▼────────────┐
                    │  Cloudflare R2 Bucket   │
                    │  (pub-cbf23f2408c64b... │
                    │   .r2.dev)              │
                    └─────────────────────────┘
```

## What I Fixed Today

### 1. Recharts CDN Link (qwen3.5.hardware.html)
**Problem:** The page wasn't loading because Recharts library was failing to load from unpkg CDN.

**Solution:** Changed from:
```html
<script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
```
To:
```html
<script src="https://cdn.jsdelivr.net/npm/recharts@2.10.3/umd/Recharts.min.js"></script>
```

### 2. RTX 5090 Bar Not Displaying
**Problem:** When hardware has "VRAM Failure", the token value is 0, and Recharts doesn't render bars for 0 values.

**Solution:** Added a `displayTokens` property:
- Modified `auditData` to include `displayTokens: userTokensPerSec === 0 ? 0.8 : userTokensPerSec`
- Updated `BarChart` to use `displayTokens` for rendering
- Added Tooltip formatter to show actual 0 value on hover

## How to Use This System Going Forward

### Quick Deployment (Single File)
```bash
# Edit the file you want to deploy
# Then run:
node deploy-qwen-quick.js
```

### Full Site Deployment (Multiple Files)
```bash
# 1. Stage your changes
git add filename.html

# 2. Commit with descriptive message
git commit -m "Fix: Description of changes"

# 3. Push to SiteGround
git push origin master
```

### Adding New Pages to Deployment
Edit `deploy-vidi-all.js` and add your page to the `PAGES` array:
```javascript
const PAGES = [
    { src: 'index.html', type: 'text/html' },
    { src: 'your-new-page.html', type: 'text/html' },  // Add here
];
```

## File Structure

| File | Purpose |
|------|---------|
| `deploy-qwen-quick.js` | Deploy single file to R2 (for testing) |
| `deploy-vidi-all.js` | Deploy all pages and assets to R2 |
| `deploy.js` | Git-based deployment to SiteGround |
| `deploy_update.sh` | Example deployment script |
| `VIDISMART_DEPLOYMENT_SYSTEM.md` | This documentation |

## Storage Destinations

### Cloudflare R2 (Images/Videos)
- **Bucket:** vidismart
- **Public URL:** https://pub-cbf23f2408c64b16a4314106f21e1a1d.r2.dev/
- **Use for:** Images, videos, large assets

### SiteGround (HTML/CSS/JS)
- **Server:** gtxm1044.siteground.biz:18765
- **Path:** /home/customer/www/vidismart.com/public_html/
- **Domain:** https://vidismart.com/
- **Use for:** Web pages, stylesheets, scripts

## Credentials (from .env file)

```
# R2 Storage
R2_ACCOUNT_ID=5830508745fd2ac063426ebf9429c22d
R2_ACCESS_KEY_ID=e9c7b7eb9ea570cc59e413cfdf580deb
R2_SECRET_ACCESS_KEY=aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b
R2_BUCKET_NAME=vidismart-media

# Git/SiteGround
SSH: u2627-m33aqlpqghg3@gtxm1044.siteground.biz:18765
```

## Testing Before Deployment

```bash
# Start local server
python -m http.server 8080

# Open in browser
http://localhost:8080/your-file.html
```

## Troubleshooting

### Page Not Loading
1. Check browser console for errors
2. Verify CDN links are working
3. Test locally first: `python -m http.server 8080`

### R2 Upload Fails
1. Verify credentials in .env file
2. Check bucket name (vidismart vs vidismart-media)
3. Ensure @aws-sdk/client-s3 is installed: `npm install @aws-sdk/client-s3`

### Git Push Fails
1. Check SSH key is configured
2. Verify remote URL: `git remote -v`
3. Ensure you're on master branch: `git branch`

## Best Practices

1. **Always test locally first** using `python -m http.server`
2. **Use specific versions** for CDN libraries (e.g., `@2.10.3`)
3. **Commit descriptive messages** for tracking changes
4. **Test on R2** before SiteGround for quick iteration
5. **Use R2 for large assets** (images > 1MB, videos)
6. **Use SiteGround for HTML/CSS/JS** (faster for small files)

## Next Steps / Improvements

1. Set up GitHub Actions for automatic deployment
2. Configure Cloudflare Pages for staging environment
3. Add automated testing before deployment
4. Set up CDN purging after updates

---

**Created:** March 4, 2026
**By:** AI Agent (Debug Mode)
**Purpose:** Document deployment system for qwen3.5.hardware.html fix and future use

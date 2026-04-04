# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ QUICK REFERENCE - R2 UPLOADS (READ FIRST)

**Upload images to R2, NOT to vidismart.com/images folder**

**Credentials** (already configured, just copy-paste):
- Access Key: `e9c7b7eb9ea570cc59e413cfdf580deb`
- Secret Key: `aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b`
- Endpoint: `https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com`
- Bucket: `vidismart`
- CDN URL: `https://cdn.vidi.news/[filename]`

**One-liner upload**:
```bash
python3 -c "
import boto3
from botocore.config import Config
s3 = boto3.client('s3', endpoint_url='https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com', aws_access_key_id='e9c7b7eb9ea570cc59e413cfdf580deb', aws_secret_access_key='aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b', region_name='auto', config=Config(signature_version='s3v4'))
with open('/mnt/m/code/vidismart/images/YOUR_IMAGE.png', 'rb') as f: s3.upload_fileobj(f, 'vidismart', 'YOUR_IMAGE.png')
print('DONE')
"
```

**HTML format**: `<img referrerpolicy="no-referrer" src="https://cdn.vidi.news/YOUR_IMAGE.png">`

## CRITICAL RULES - MUST READ

**CHECK WORKFLOWS FIRST**: Before taking complex actions (deploy, build, test), ALWAYS check `.agent/workflows/` for project-specific instructions.
**DEPLOYMENT COMMAND**: ALWAYS use `wsl git push`. The Windows `git push` WILL FAIL with permission errors.
**NO BATCH FILES**: NEVER create or use .bat files. If you see them, ignore them or delete them. They are "toss files" and should not exist.
**ALWAYS USE LINUX/BASH COMMANDS**: Use `wsl <command>` if running from Windows CMD, or standard linux commands.

## CRITICAL INFORMATION - KORBEX MULTI PORTAL

**WEBSITE SPELLING**: KORBEX (with K, not Corbex with C)
**KORBEX.CO PLUGIN LOCATION**: `/mnt/m/code/vidismart/korbex-multi-portal/`
**KORBEX.CO SITE CLONE**: `/mnt/m/code/korbex/`
**GIT DEPLOYMENT**: `/mnt/m/code/vidismart/korbex-multi-portal/` is the Git repository for korbex.co
**DATABASE**: `dbcg9wekbugen6` on localhost (127.0.0.1)
**LOCALHOST**: Common ports to try - 8000, 8080, 8888, 8889, 3000

## KORBEX MULTI PORTAL STRUCTURE

- Main plugin file: `korbex-multi-portal.php`
- Templates: 5 portal types (client, employee, editor, affiliate, admin)
- Assets: CSS/JS for portal functionality
- Git repo for korbex.co is at `/mnt/m/code/vidismart/korbex-multi-portal/`
- Site clone is at `/mnt/m/code/korbex/`

## Project Overview

VidiSmart is an AI-powered tech stack planning application that helps users configure modern, AI-enabled technology stacks for their projects. The application is a client-side web application built with vanilla HTML, CSS, and JavaScript, featuring an interactive 3D visualization powered by Three.js and a comprehensive tech stack recommendation system.

## Architecture

This is a **frontend-only web application** with the following structure:

### Main Files

- `index.html` - Main application page with tech stack configuration interface
- `script.js` - Core application logic, Three.js animations, and tech stack data
- `style.css` - Aura/Aurora-inspired design system with modern glass morphism effects
- `gemini-backend.js` - Node.js backend for AI analysis (requires deployment)

### Key Features

- Interactive 3D atom-like logo animation using Three.js with mouse reactivity
- Dynamic tech stack configuration with modal-based multi-select interfaces
- Comprehensive tech database covering 9 categories: archetype, frontend, backend, CMS, AI models, AI video tools, CRM, payment gateways, hosting, site creation, UI/UX tools, agent tools, MCP servers, video hosting, and vector databases
- AI-powered analysis via Google Gemini API (when deployed)

## Development Setup

### Local Development

- **No build process required** - open `index.html` directly in browser
- **No package.json** - all dependencies are loaded via CDN
- Static hosting compatible

### Dependencies (CDN-loaded)

- Three.js r128 for 3D graphics and animations
- Google Fonts (Kumbh Sans, Roboto)

## Deployment

### SiteGround Git Integration

**IMPORTANT:** Only the `public_html/` directory is live on the website (vidismart.com)

- Git repository: `ssh://u2627-m33aqlpqghg3@gtxm1044.siteground.biz:18765/home/customer/www/vidismart.com/public_html/`
- Files outside of `public_html/` are development files only
- To deploy: copy files INTO `public_html/` directory and commit/push

### Frontend Deployment

Deploy to any static hosting service:

- Vercel, Netlify, GitHub Pages, Cloudflare Pages
- Simply upload all files to hosting provider

### AI Analysis Backend

The AI analysis feature requires:

1. Deploy `gemini-backend.js` as serverless function at `/api/analyze`
2. Set environment variable `GEMINI_API_KEY` with Google Gemini API key
3. Install dependencies: `npm install express node-fetch`

For Vercel deployment, place `gemini-backend.js` in `/api/analyze.js`

## Key Technical Details

### Tech Stack Data Structure

The `techData` object in `script.js` contains comprehensive information about 150+ technologies across 14 categories. Each tech entry includes:

- `id` - unique identifier
- `name` - display name
- `description` - detailed description
- `website` - official website URL
- `video` - YouTube tutorial link (when available)

### Modal System

Multi-select categories use a modal interface for selection:

- Categories: `mcpServers`, `uiuxTools`, `videoHosting`, `ai-model`, `payment`, `hosting`
- Single-select dropdowns for other categories

### Three.js Animation System

- Animated background shader with noise patterns and color sweeps
- 3D atom logo with rotating electrons and interactive mouse tracking
- Canvas ID: `vidismart-logo` (logo), `bg-canvas` (background)

## Common Operations

### Adding New Technologies

1. Edit the `techData` object in `script.js`
2. Add new entries with required fields: `id`, `name`, `description`, `website`
3. Update category icons in `getCardIcon()` function if adding new categories

### Modifying UI Styles

- Main styles in `style.css` using CSS custom properties
- Aura/Aurora design system with glass morphism effects
- Color palette: deep blues (#101820, #151E27) with green accents (#5deb5a)

### Updating AI Analysis

- Modify the prompt in `getAiAnalysis()` function in `script.js`
- Ensure backend deployment includes updated `gemini-backend.js`

## Notes

- Git repository is located in `public_html/` directory (connected to SiteGround)
- All animations optimized for 60fps performance
- Responsive design supports mobile and desktop viewports
- Application uses modern ES6+ JavaScript features

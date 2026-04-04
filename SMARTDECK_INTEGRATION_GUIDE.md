# SmartGen Media - SmartChannel CX Integration Guide

## Project Overview

SmartGen Media is an AI-powered media generation and presentation system built for SmartChannel CX's SmartGen platform. It enables dynamic image and video creation using multiple AI providers and integrates seamlessly with a professional pitch deck presentation.

**Version:** 1.0.0  
**Last Updated:** March 20, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Image Generation Providers](#image-generation-providers)
4. [Configuration & API Setup](#configuration--api-setup)
5. [Deployment Guide](#deployment-guide)
6. [Features Implemented](#features-implemented)
7. [Technical Implementation](#technical-implementation)
8. [Known Limitations](#known-limitations)
9. [Troubleshooting](#troubleshooting)
10. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  SmartGen Media System                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Admin Panel    │  Sync   │   Slide Deck     │         │
│  │   (Control Hub)  │◄───────►│   (Presentation) │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  localStorage    │         │  SmartImage      │         │
│  │  (Settings Sync) │         │  Component       │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                    │
│           └────────────┬───────────────┘                    │
│                        ▼                                    │
│           ┌─────────────────────────┐                       │
│           │  SmartGen Media APIs    │                       │
│           │  • Picsum (Free)        │                       │
│           │  • Pollinations (Free)  │                       │
│           │  • Seedance (Paid)      │                       │
│           │  • Gemini (Paid)        │                       │
│           │  • Stability (Paid)     │                       │
│           │  • Local Models         │                       │
│           └─────────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### 1. Admin Panel (`vidismart.deck.agent.html`)

**Purpose:** Central control hub for managing AI prompts and SmartGen Media generation

**Key Features:**
- Dynamic prompt editing for 8 slides
- SmartGen Media provider selection (9 providers)
- API key configuration
- Real-time preview generation
- Engine status labels
- Bulk generation ("Generate All 8 Slides")
- Connection testing
- Pricing information display

**Tabs:**
- **AI Prompts:** Edit prompts and generate images
- **API Settings:** Configure providers and API keys
- **Preview Deck:** View all slides in grid format

### 2. Slide Deck (`vidismart.deck.html`)

**Purpose:** Professional presentation with AI-generated visuals

**Key Features:**
- 8-slide narrative structure
- Keyboard navigation (arrow keys)
- Responsive design
- Engine labels on each image
- Automatic fallback handling
- Visual effects and animations

**Slide Structure:**
1. Hero Slide - VidiSmart Overview
2. Problem Statement - SMB Tech Crisis
3. Solution - 10-Minute Transformation
4. Comparison - Legacy vs. Smart Stack
5. Case Study - Real-world Example
6. Value Proposition - Why VidiSmart Wins
7. Pricing - Transparent Plans
8. Call to Action - Next Steps

---

## SmartGen Media Providers

### Free Providers (No API Key Required)

| Provider | Status | API Endpoint | Rate Limit | Notes |
|----------|--------|--------------|------------|-------|
| **Picsum** | ✅ Stable | `https://picsum.photos/` | None | Stock photos, always works |
| **Pollinations** | ⚠️ Variable | `https://image.pollinations.ai/` | Unknown | Free tier, may have downtime |
| **Craiyon** | ⚠️ Fallback | N/A | N/A | Requires backend proxy - falls back to Picsum |

### Paid Providers (API Key Required)

| Provider | Cost | API Key Source | Implementation Status |
|----------|------|----------------|----------------------|
| **Seedance** | $0.08/image | seedance.ai | AI Video Generation |
| **Gemini Flash** | $0.04/image | aistudio.google.com | Frontend placeholder |
| **Stability AI** | $0.06/image | platform.stability.ai | Frontend placeholder |
| **Nano Banana 2** | $0.02/image | Custom proxy | Requires proxy URL |

### Local Providers (LM Studio)

| Provider | Requirements | Status |
|----------|--------------|--------|
| **Qwen Image** | LM Studio on port 1234 | Fallback to Picsum |
| **LTX 2.3** | LM Studio on port 1234 | Fallback to Picsum |

---

## Configuration & API Setup

### Quick Settings Panel

The admin panel includes a collapsible Quick Settings panel for rapid configuration:

```
┌─────────────────────────────────────┐
│  ⚙️ Quick Settings                  │
├─────────────────────────────────────┤
│  Image Model: [Dropdown]            │
│  API URL: [Input field]             │
│  API Key: [Password field]          │
│                                     │
│  Pricing Info:                      │
│  ┌─────────────────────────────┐   │
│  │ Badge: Free/Paid/Local      │   │
│  │ Cost: $0.00 / image         │   │
│  │ Details: No API key needed  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Test Connection Button]           │
└─────────────────────────────────────┘
```

### API Key Configuration

**Settings Tab Configuration:**

1. **Seedance API Key**
   - Get from: seedance.ai
   - Format: `sk-...`
   - Cost: $0.08 per image
   - AI Video Generation

2. **Gemini / Google AI Key**
   - Get from: aistudio.google.com
   - Format: `AIza...`
   - Cost: $0.04 per image

3. **Stability AI Key**
   - Get from: platform.stability.ai
   - Format: `sk-...`
   - Cost: $0.06 per image

4. **Nano Banana 2 Proxy URL**
   - Custom proxy endpoint required
   - Format: `https://your-proxy.com/api`
   - Cost: $0.02 per image

5. **OpenAI Key (Backup)**
   - Get from: platform.openai.com
   - Format: `sk-...`
   - Optional backup provider

### Local Model Setup (LM Studio)

For local AI models:

1. Install LM Studio
2. Download Qwen Image or LTX 2.3 models
3. Start LM Studio server on port 1234
4. Configure API URL: `http://localhost:1234/v1`
5. No API key required for local models

---

## Deployment Guide

### Git Workflow

```bash
# Add changes
git add vidismart.deck.agent.html vidismart.deck.html

# Commit with descriptive message
git commit -m "Feature: Description of changes"

# Push to production
git push origin master
```

### Deployment History

| Version | Commit | Changes |
|---------|--------|---------|
| 1.0.0 | 06ffe82d | Initial deployment with engine labels |
| 1.0.1 | 996f6e19 | Fixed Pollinations API (removed model=flux) |
| 1.0.2 | 1e0f8599 | Fixed labels to show accurate fallback status |
| 1.0.3 | ab7dcd09 | Added Seedance provider and SmartGen Media terminology |

### Production URLs

- **Admin Panel:** `https://vidismart.com/vidismart.deck.agent.html`
- **Slide Deck:** `https://vidismart.com/vidismart.deck.html`

### Server Configuration

**Target Server:** SiteGround (GTX M1044)  
**Protocol:** SSH  
**Path:** `/home/customer/www/vidismart.com/public_html/`

---

## Features Implemented

### Core Features

✅ **Multi-Provider Support**
- 8 image providers configured
- Automatic fallback to Picsum
- Error handling for all providers

✅ **Admin Panel**
- Dynamic prompt editing
- Real-time preview generation
- API key management
- Connection testing
- Pricing information

✅ **Slide Deck**
- 8-slide professional presentation
- Keyboard navigation
- Responsive design
- Engine labels on images

✅ **Settings Synchronization**
- localStorage-based sync
- Admin panel ↔ Slide deck
- Persistent across sessions

✅ **Error Handling**
- Graceful fallbacks
- Toast notifications
- Console logging
- No crashes on missing API keys

### Advanced Features

✅ **Engine Labels**
- Shows which AI generated each image
- Displays "(fallback)" for providers without API keys
- Accurate status reporting

✅ **Bulk Generation**
- "Generate All 8 Slides" button
- Sequential generation with delays
- Progress feedback

✅ **Connection Testing**
- Test API connectivity
- Validate API keys
- Network error detection

✅ **Pricing Display**
- Real-time pricing information
- Badge system (Free/Paid/Local)
- Cost per image display

---

## Technical Implementation

### Data Flow

```
User Action → Admin Panel → localStorage → Slide Deck → SmartImage Component → API Provider → Image Display
```

### Key Functions

**Admin Panel:**
```javascript
// Generate image for single slide
generateSlideImage(slideId)

// Generate all slides
generateAllSlides()

// Get image URL based on provider
getImageUrl(prompt, provider)

// Save settings to localStorage
saveSettings()

// Test API connection
testConnection()
```

**Slide Deck:**
```javascript
// SmartImage component
SmartImage({ prompt, className })

// Reads settings from localStorage
// Displays engine label
// Handles loading states
// Falls back on error
```

### localStorage Keys

| Key | Purpose | Structure |
|-----|---------|-----------|
| `vidismart_settings` | Provider & API keys | JSON object |
| `vidismart_prompts` | Slide prompts | Array of objects |
| `vidismart_deck_prompts` | Synced prompts | Array of objects |
| `vidismart_deck_settings` | Synced settings | JSON object |

### API Integration

**Picsum:**
```
https://picsum.photos/seed/{seed}/800/600
```

**Pollinations:**
```
https://image.pollinations.ai/prompt/{encodedPrompt}?width=800&height=600&nologo=true&seed={seed}
```

**Local LM Studio:**
```
http://localhost:1234/v1/models
```

---

## Known Limitations

### Current Issues

1. **Pollinations API Instability**
   - Occasionally returns 500 errors
   - API may be slow or timeout
   - Fallback to Picsum ensures reliability

2. **Craiyon Integration**
   - Requires backend CORS proxy
   - Currently falls back to Picsum
   - Frontend-only implementation not possible

3. **Paid Provider Frontend Only**
   - Gemini, Stability, Nano Banana are placeholders
   - Actual implementation requires backend server
   - Current implementation falls back to Picsum

4. **Local Models**
   - Require LM Studio running on port 1234
   - Currently fall back to Picsum
   - Full integration pending

### Workarounds Implemented

- ✅ Automatic fallback to Picsum for all failures
- ✅ Accurate labels showing fallback status
- ✅ Toast notifications for missing API keys
- ✅ No crashes on configuration errors

---

## Troubleshooting

### Common Issues

**Issue: Images not generating**
- Check browser console for errors
- Verify API keys are entered correctly
- Test connection using the Test button
- Check network connectivity

**Issue: Wrong engine label displayed**
- Clear localStorage and reload
- Reconfigure provider settings
- Check that API keys are saved

**Issue: Pollinations returning errors**
- This is a known issue with their API
- Images will fall back to Picsum automatically
- Try again later or use Picsum directly

**Issue: Local models not working**
- Ensure LM Studio is running
- Verify port 1234 is accessible
- Check CORS settings in LM Studio

### Debug Commands

```javascript
// Check current settings
console.log(JSON.parse(localStorage.getItem('vidismart_settings')));

// Check prompts
console.log(JSON.parse(localStorage.getItem('vidismart_prompts')));

// Clear all settings
localStorage.clear();
location.reload();
```

---

## Future Enhancements

### Planned Features

🔄 **Backend Integration**
- Server-side API calls for paid providers
- Actual Gemini Flash implementation
- Actual Stability AI implementation
- Nano Banana proxy server

🔄 **Additional Providers**
- DALL-E integration
- Midjourney via API
- Stable Diffusion XL
- Custom model support

🔄 **Enhanced Features**
- Image editing capabilities
- Batch processing
- Image history/versioning
- Export to various formats

🔄 **Performance Optimizations**
- Image caching
- Lazy loading
- Progressive enhancement
- CDN integration

### API Integration Roadmap

| Phase | Provider | Implementation |
|-------|----------|----------------|
| Phase 1 | Gemini Flash | Backend proxy + API key |
| Phase 2 | Stability AI | Backend proxy + API key |
| Phase 3 | Nano Banana | Custom proxy setup |
| Phase 4 | Local Models | Full LM Studio integration |

---

## Appendix

### File Structure

```
vidismart/
├── vidismart.deck.agent.html    # Admin panel
├── vidismart.deck.html          # Slide deck
└── SMARTDECK_INTEGRATION_GUIDE.md  # This file
```

### Configuration Example

```javascript
{
  "imageProvider": "picsum",
  "geminiApiKey": "",
  "stabilityApiKey": "",
  "nanobananaProxyUrl": "",
  "openaiApiKey": "",
  "apiUrl": "http://localhost:1234/v1",
  "apiKey": ""
}
```

### Provider Status Summary

| Provider | Free? | Works? | Label |
|----------|-------|--------|-------|
| Picsum | ✅ | ✅ Always | Picsum |
| Pollinations | ✅ | ⚠️ Sometimes | Pollinations |
| Craiyon | ✅ | ❌ Needs proxy | Picsum (fallback) |
| Gemini | ❌ | ❌ Needs key | Picsum (fallback) |
| Stability | ❌ | ❌ Needs key | Picsum (fallback) |
| Nano Banana | ❌ | ❌ Needs proxy | Picsum (fallback) |
| Qwen Local | ✅ | ⚠️ Needs LM Studio | Qwen (Local) |
| LTX Local | ✅ | ⚠️ Needs LM Studio | LTX (Local) |

---

## Support & Contact

**Project:** SmartGen Media for SmartChannel CX  
**Platform:** SmartGen  
**Deployment:** VidiSmart Website  
**Last Commit:** ab7dcd09

---

**Document Version:** 1.0.0  
**Author:** AI Development Assistant  
**Date:** March 20, 2026
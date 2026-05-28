# Smart Book Content Plan — Personas, Images & Video

**Last Updated:** 2026-04-22  
**Project:** "The Speed of Agentic Visual AI" — Interactive Digital Book

---

## 1. How the Persona System Works

### 1.1 The Three Personas

The smart book uses a **persona-based filtering system** that shows/hides chapters based on the reader's role. Here's how it's implemented:

| Persona | Icon | Color | Chapters Shown | Focus |
|---------|------|-------|----------------|-------|
| **Consumer** | 👤 | Blue (#3B82F6) | 18 chapters (~45 min) | Personal productivity, creativity, AI basics |
| **IT Professional** | 💻 | Green (#10B981) | 27 chapters (~75 min) | Technical implementation, infrastructure, models |
| **Executive/Entrepreneur** | 🚀 | Purple (#8B5CF6) | 24 chapters (~70 min) | Strategy, competitive dynamics, investment |

### 1.2 How Chapter Filtering Works

The system is defined in [`smart-book/data.js`](smart-book/data.js:9-89). Each persona has four arrays:

```javascript
personas: {
  consumer: {
    critical: ["foreword", "ch1", "ch4", "ch6", "ch14", ...],  // Must-read
    high: ["ch3", "ch13", "ch15", ...],                         // High priority
    medium: ["ch7", "ch12", "ch13b", ...],                      // Medium priority
    hide: ["ch5", "ch8", "ch10", ...],                          // Hidden chapters
  }
}
```

**The filtering logic** (in [`smart-book/print-book.html`](smart-book/print-book.html:1207-1214)):

```javascript
function getVisibleChapters(persona) {
    if (persona === 'all' || !BOOK_DATA.personas[persona]) {
        return Object.keys(BOOK_DATA.chapters); // Show all
    }
    const p = BOOK_DATA.personas[persona];
    // Combine critical + high + medium = visible chapters
    const visible = [...(p.critical || []), ...(p.high || []), ...(p.medium || [])];
    return Object.keys(BOOK_DATA.chapters).filter(k => visible.includes(k));
}
```

### 1.3 How Users Select a Persona

1. **Landing Page** ([`smart-book/index.html`](smart-book/index.html)): Users pick a persona on the cover page
2. **URL Parameters**: Navigation passes `?persona=consumer&name=John` to the reader
3. **Reader Page** ([`smart-book/print-book.html`](smart-book/print-book.html)): Dropdown selector at top to switch personas
4. **Dynamic Rebuild**: When persona changes, the entire book rebuilds with only visible chapters

### 1.4 Persona-Specific Features

| Feature | How It Works |
|---------|-------------|
| **Persona Intro Panel** | Each persona gets a custom welcome message with key takeaways |
| **AI Insight Banners** | Specific chapters show colored insight boxes unique to that persona |
| **Color Theming** | CSS variables change based on persona (blue/green/purple) |
| **Company Field** | Hidden for Consumer, shown for IT Pro and Executive |
| **Cover Personalization** | Shows "Custom Edition for [Name] · [Persona] Path" |

### 1.5 Current Chapter Assignments

**Consumer sees (18 chapters):**
- Foreword, Ch1, Ch4, Ch6, Ch14, Ch18, Ch22, Ch30, Ch32, Ch36 (critical)
- Ch3, Ch13, Ch15, Ch19, Ch23b, Ch32b, Ch33, Ch33v (high)
- Ch7, Ch12, Ch13b, Ch21 (medium)

**IT Professional sees (27 chapters):**
- Foreword, Ch1, Ch3, Ch6, Ch8, Ch10, Ch12, Ch13, Ch13b, Ch17, Ch20, Ch22, Ch23, Ch23b, Ch25, Ch27, Ch30, Ch34, Ch38 (critical)
- Plus Ch2, Ch5, Ch11, Ch14, Ch15, Ch18, Ch19, Ch21, Ch26, Ch28, Ch35, Ch39 (high)
- Plus Ch4, Ch7, Ch9, Ch16, Ch24, Ch29, Ch31, Ch32, Ch32b, Ch37 (medium)

**Executive/Entrepreneur sees (24 chapters):**
- Foreword, Ch1, Ch2, Ch4, Ch5, Ch6, Ch7, Ch8, Ch9, Ch10, Ch12, Ch13, Ch15, Ch16, Ch17, Ch18, Ch19, Ch28, Ch31, Ch32, Ch32b, Ch35, Ch36, Ch38, Ch39 (critical + high)
- Plus Ch25, Ch26 (medium)

---

## 2. Current Image & Video Status

### 2.1 How Images Are Currently Assigned

Each chapter in [`data.js`](smart-book/data.js:91-919) has an `images` array:

```javascript
ch1: {
    id: "ch1",
    title: "Ch1: The Customer Journey Out of App Chaos",
    content: `...`,
    images: ["hero_tech_professional_1775089047994.png", "ai_answer_engine_strategy.png"],
    readingTime: 15
}
```

Images are loaded from Cloudflare R2 CDN:
- **Base URL:** `https://cdn.vidi.news/images/`
- **Current images:** ~50+ images across all chapters

### 2.2 Current Image Inventory

| Chapter | Images | Status |
|---------|--------|--------|
| Foreword | ai_plan_people_*.png, exec_overview_people_*.png | ✅ Has images |
| Ch1 | hero_tech_professional_*.png, ai_answer_engine_strategy.png | ✅ Has images |
| Ch2 | ai_agents_collaboration_*.png, vidiflow_news_hero_*.png | ✅ Has images |
| Ch3 | visual_vector_architecture.png, 12-vector-databases-*.png | ✅ Has images |
| Ch4 | vidismart_header_13_*.png, explainer_video_people_*.png | ✅ Has images |
| Ch5 | SmartStack.DevOps.png, smart_stack_people_*.png | ✅ Has images |
| Ch6 | tech_agent_edit_*.png, tech_agent_collab_*.png | ✅ Has images |
| Ch7 | VidiCity.47.png, local_seo_*.png | ✅ Has images |
| Ch8 | VidiCRM7.png, cahill_construction_automation_*.png | ✅ Has images |
| Ch9 | neuralbrain.png, exec_slide_deck_people_*.png | ✅ Has images |
| Ch10 | vidismart-tensors.jpg, midwest-logistics.jpg | ✅ Has images |
| Ch11 | viditwin-glass.png, 3DD_gllaisgllaisglla.png | ✅ Has images |
| Ch12+ | Various | ⚠️ Some chapters need more images |

### 2.3 Image Gaps

**Chapters that need more/better images:**
- Ch13-Ch39: Many chapters have only 1-2 images or reference missing files
- **No video content** is currently embedded in the book
- **No animated/interactive visuals** beyond the Three.js background

---

## 3. AI Agents for Content Creation

### 3.1 Content Creation Agent ([`agents/content-creation-agent.md`](agents/content-creation-agent.md))

**What it DOES:**
- ✅ Generate written content (articles, blog posts, documentation)
- ✅ SEO-optimized content
- ✅ Marketing copy and ad creatives
- ✅ Brand voice adaptation
- ✅ Suggest image placements (`images_suggested` field)

**What it DOES NOT do:**
- ❌ Generate actual images or videos
- ❌ Create visual assets directly

**How it HELPS with images/videos:**
- It can write **image prompts** for generation
- It can create **video scripts** and storyboards
- It can suggest **image placements** in content
- It can write **alt text** and captions for accessibility

### 3.2 Visual Design Agent ([`agents/visual-design-agent.md`](agents/visual-design-agent.md))

**What it DOES:**
- ✅ Logo and brand identity creation
- ✅ Infographic design and data visualization
- ✅ Social media graphic generation
- ✅ Presentation slide design
- ✅ Image editing and enhancement
- ✅ **DALL-E 3 / Midjourney API integration** for image generation
- ✅ **Python PIL/Pillow** for image manipulation
- ✅ **SVG generation** for vector graphics

**What it DOES NOT do:**
- ❌ Video generation (not in current capabilities)
- ❌ 3D animation

### 3.3 What You Need for Video Content

**Current agents DON'T include video generation.** You would need to add:

| Capability | Tool/Service | Purpose |
|-----------|--------------|---------|
| **Video Generation** | Runway ML, Kling, Luma Dream Machine | AI video from prompts |
| **Video Editing** | FFmpeg, MoviePy | Programmatic video editing |
| **Animation** | Manim, After Effects API | Animated explanations |
| **Text-to-Video** | CogVideo, Stable Video Diffusion | Generate video from text |

**Existing video-related files in workspace:**
- [`hf_animatediff.json`](hf_animatediff.json) - AnimateDiff config
- [`hf_cogvideo.json`](hf_cogvideo.json) - CogVideo config
- [`hf_video_gen.json`](hf_video_gen.json) - Video generation config
- [`hf_video_upscale.json`](hf_video_upscale.json) - Video upscaling config
- [`hf_video_enhance.json`](hf_video_enhance.json) - Video enhancement config
- [`hf_svd.json`](hf_svd.json) - Stable Video Diffusion config
- [`hf_text_video.json`](hf_text_video.json) - Text-to-video config
- [`hf_video_understanding.json`](hf_video_understanding.json) - Video understanding

---

## 4. Recommended Action Plan

### Phase 1: Generate Missing Images (Use Visual Design Agent)

**Priority: HIGH**

For each chapter that needs images, the Visual Design Agent can:
1. Generate AI images using DALL-E 3 or Midjourney
2. Create infographics for technical concepts
3. Produce data visualizations

**Process:**
```
1. Define image brief per chapter (topic, style, dimensions)
2. Visual Design Agent generates 2-3 images per chapter
3. Upload to Cloudflare R2
4. Update data.js with new image filenames
```

### Phase 2: Create Video Content (New Capability Needed)

**Priority: MEDIUM**

Options for adding video to the smart book:

**Option A: Embed External Videos**
- Upload videos to YouTube/Vimeo/R2
- Add `<iframe>` embeds to chapter content in `data.js`
- Simple, works immediately

**Option B: AI-Generated Videos**
- Use existing HuggingFace configs (CogVideo, AnimateDiff)
- Generate short explainer videos per chapter
- More complex, requires GPU infrastructure

**Option C: SmartGen Integration**
- Use the SmartGen system to generate videos on-demand
- Most powerful, but requires SmartGen to be fully operational

### Phase 3: Enhance Persona System

**Priority: LOW (system is working well)**

Potential enhancements:
- [ ] Add persona-specific image variants (different images for same chapter per persona)
- [ ] Add persona-specific video recommendations
- [ ] Add reading progress per persona path
- [ ] Add "recommended next chapter" based on persona

---

## 5. How to Use the Agents Right Now

### For Image Generation (Visual Design Agent):

```
1. Define the brief:
   - Chapter: "Ch13: Semantic Search"
   - Topic: "Vector database visualization"
   - Style: "Professional tech illustration"
   - Dimensions: 1200x800

2. Agent generates images using DALL-E 3 / Midjourney

3. Upload to R2:
   - Use the existing R2 upload scripts
   - Or upload via Directus Media Library

4. Update data.js:
   - Add image filename to chapter's images array
```

### For Content Writing (Content Creation Agent):

```
1. Define content brief:
   - Topic: "Chapter 14 supplement"
   - Audience: "IT Professionals"
   - Tone: "Technical but accessible"
   - Word count: 800-1200

2. Agent generates content with SEO optimization

3. Add to data.js chapter content field
```

---

## 6. Quick Reference: Files to Modify

| Task | File to Edit |
|------|-------------|
| Add new images to a chapter | [`smart-book/data.js`](smart-book/data.js) — `images` array |
| Change persona chapter assignments | [`smart-book/data.js`](smart-book/data.js) — `critical`, `high`, `medium`, `hide` arrays |
| Add persona intro text | [`smart-book/data.js`](smart-book/data.js) — `personaIntro` field |
| Add persona AI insights | [`smart-book/data.js`](smart-book/data.js) — `aiInsights` object |
| Change visual styling | [`smart-book/print-book.html`](smart-book/print-book.html) — CSS section |
| Upload images to CDN | Use Directus Media Library or R2 upload scripts |

---

*This document serves as the guide for expanding the smart book's visual content and understanding the persona system.*

# SmartChannel CX - Complete UI Implementation Plan

**Project:** VidiSmart SmartChannel CX
**Date:** March 27, 2026
**Status:** Planning Phase
**Reference URL:** https://vidi.news/smartchannel

---

## Executive Summary

This document outlines the implementation plan for building consistent, professional user interfaces for all 11 SmartChannel CX tools. The plan follows the established design pattern from the SmartGen Image tool and ensures a cohesive user experience across all media processing tools.

---

## Current Status

### Existing Tools with Complete Pages
- ✅ **SmartGen Image** - `vidiflow/frontend/app/smartchannel/tools/smartgen/page.tsx` (COMPLETE - serves as template)
- ✅ **BrandSwap** - `vidiflow/frontend/app/smartchannel/brandswap/page.tsx` (Has dedicated app)
- ⚠️ **IconGen 66** - `vidiflow/frontend/app/smartchannel/tools/icogen/page.tsx` (Exists, may need update)

### Tools Requiring Full UI Implementation (9 tools)

#### Image Tools (4 tools)
1. **Background Remover** - `vidiflow/frontend/app/smartchannel/tools/background-remover/page.tsx`
2. **Smart Restyle** - `vidiflow/frontend/app/smartchannel/tools/smart-restyle/page.tsx`
3. **Object Eraser** - `vidiflow/frontend/app/smartchannel/tools/object-eraser/page.tsx`
4. **AI Image Gen** - `vidiflow/frontend/app/smartchannel/tools/ai-image-gen/page.tsx`

#### Video Tools (4 tools)
5. **Video Enhancer** - `vidiflow/frontend/app/smartchannel/tools/video-enhancer/page.tsx`
6. **Video Upscaler** - `vidiflow/frontend/app/smartchannel/tools/video-upscaler/page.tsx`
7. **Text to Video** - `vidiflow/frontend/app/smartchannel/tools/text-to-video/page.tsx`
8. **SiteSwarm Engine** - `vidiflow/frontend/app/smartchannel/siteswarm/page.tsx`

#### Audio Tools (1 tool)
9. **Audio Cleaner** - `vidiflow/frontend/app/smartchannel/tools/audio-cleaner/page.tsx`

---

## Design Pattern & Architecture

### Established Pattern
Each tool page follows the **SmartGen template pattern** located at:
- Template: `vidiflow/frontend/app/smartchannel/tools/smartgen/page.tsx`
- Layout Components: `vidiflow/frontend/components/tools/ToolLayout.tsx`

### Page Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ToolLayout (Header + Navigation + Credits)                  │
├─────────────────────────────────────────────────────────────┤
│ ToolHero (Icon + Title + Description + Gradient Background) │
├──────────────────────────────┬──────────────────────────────┤
│ Left Column (2/3 width)      │ Right Sidebar (1/3 width)    │
│                              │                              │
│ 1. What is [Tool]?           │ 1. Quick Start CTA           │
│    - Overview paragraph      │    - Gradient card           │
│    - Use cases               │    - Start button            │
│                              │    - Credit cost             │
│ 2. Key Features              │                              │
│    - 4 feature cards         │ 2. Example Results           │
│    - Icons + descriptions    │    - Demo cards              │
│                              │    - Before/After            │
│ 3. How to Use                │                              │
│    - 3 numbered steps        │ 3. Credits Info              │
│    - StepCard components     │    - Pricing breakdown       │
│                              │    - Current balance         │
│ 4. Pro Tips                  │                              │
│    - 5-6 bullet points       │ 4. Upload Zone               │
│    - Best practices          │    - File upload area        │
│                              │    - Drag & drop             │
│ 5. Example Prompts/Uses      │                              │
│    - 4 example cards         │ 5. Share/Documentation       │
│    - Real-world scenarios    │    - Share button            │
│                              │    - Docs link               │
└──────────────────────────────┴──────────────────────────────┘
```

### Reusable Components
Located in `vidiflow/frontend/components/tools/ToolLayout.tsx`:

| Component | Purpose | Props |
|-----------|---------|-------|
| `ToolLayout` | Main page wrapper with header/navigation | `children, title, description, toolId, color, backUrl` |
| `ToolHero` | Hero section with gradient background | `title, description, toolId, color` |
| `InstructionSection` | Content card wrapper | `title, children` |
| `StepCard` | Numbered step-by-step instructions | `number, title, description` |
| `DemoCard` | Before/after comparison cards | `before, after, title` |
| `UploadZone` | File upload interface | `accept, multiple` |
| `ToolBreadcrumb` | Navigation breadcrumbs | `items` |

---

## Color & Icon System

### Tool Color Mapping
Each tool has a consistent brand color used throughout its interface:

| Tool | Color Class | Hex/RGB | Icon Component |
|------|-------------|---------|----------------|
| SmartGen Image | `bg-purple-500` | Purple | `Wand2` |
| Background Remover | `bg-green-500` | Green | `Scissors` |
| Smart Restyle | `bg-pink-500` | Pink | `Palette` |
| Object Eraser | `bg-orange-500` | Orange | `Eraser` |
| AI Image Gen | `bg-cyan-500` | Cyan | `Layers` |
| BrandSwap | `bg-indigo-500` | Indigo | `RefreshCw` |
| Video Enhancer | `bg-blue-500` | Blue | `Video` |
| Video Upscaler | `bg-purple-500` | Purple | `Maximize2` |
| Text to Video | `bg-cyan-500` | Cyan | `Type` |
| SiteSwarm Engine | `bg-green-500` | Green | `Sparkles` |
| Audio Cleaner | `bg-yellow-500` | Yellow | `Music` |
| IconGen 66 | `bg-blue-500` | Blue | `Layers` |

### Icon Import
All icons are from `lucide-react`:
```typescript
import {
  Wand2, Scissors, Palette, Eraser, Layers,
  RefreshCw, Video, Maximize2, Type, Sparkles, Music
} from "lucide-react";
```

---

## Tool-by-Tool Content Specifications

### 1. Background Remover (Green, Scissors)

**Purpose:** Remove backgrounds instantly from images

**What is Background Remover?**
AI-powered background removal for portraits, products, and objects. Automatically detects the main subject in your image and removes the background with pixel-perfect accuracy. Perfect for e-commerce, profile pictures, marketing materials, and social media content.

**Key Features:**
- 🎯 **One-Click Removal** - Automatic subject detection and background removal
- ✨ **Edge Refinement** - Precise edge detection with hair and fur detail preservation
- 📦 **Transparent PNG Export** - Download with transparent background for layering
- ⚡ **Batch Processing** - Process multiple images simultaneously

**How to Use (3 Steps):**
1. **Upload Your Image** - Drag and drop or select images with clear subjects (JPG, PNG, WebP)
2. **Auto-Remove Background** - AI instantly detects and removes the background, preserving fine details
3. **Download & Use** - Export as transparent PNG for use in designs, presentations, or websites

**Pro Tips:**
- Use high-contrast images with clear subject separation for best results
- Ensure good lighting on your subject for accurate edge detection
- Works best with portraits, products, pets, and objects with defined edges
- For complex backgrounds, use the edge refinement tool to perfect results
- Process product photos in batches to save time on e-commerce listings

**Example Uses:**
- **E-commerce Products** - Clean product photos with transparent backgrounds for online stores
- **Professional Headshots** - Remove messy backgrounds from profile pictures
- **Social Media Graphics** - Create eye-catching posts with isolated subjects
- **Marketing Materials** - Prepare images for brochures, flyers, and presentations

**Credits:** 10 credits per image | Batch (10 images): 80 credits

**Accepted Files:** JPG, PNG, WebP up to 25MB

---

### 2. Smart Restyle (Pink, Palette)

**Purpose:** Apply artistic styles to images

**What is Smart Restyle?**
Neural style transfer that transforms your photos into artistic masterpieces. Apply the styles of famous artists, art movements, or custom aesthetics to any photo while preserving the original composition. Perfect for creating unique social media content, artistic prints, or creative marketing materials.

**Key Features:**
- 🎨 **20+ Artistic Styles** - Oil painting, watercolor, sketch, pop art, anime, and more
- 🎚️ **Adjustable Intensity** - Control how strongly the style is applied
- 🖼️ **Composition Preservation** - Maintains your original image structure and details
- 🔄 **Style Variations** - Generate multiple interpretations of the same style

**How to Use (3 Steps):**
1. **Upload Your Photo** - Choose any photo you want to transform (portraits, landscapes, products)
2. **Select Artistic Style** - Browse 20+ styles from oil painting to anime, adjust intensity slider
3. **Generate & Download** - Preview the result, try variations, and download your artistic creation

**Pro Tips:**
- Landscape and portrait photos work exceptionally well with painterly styles
- Start with 70% intensity and adjust based on the result
- Combine multiple styles by applying them sequentially for unique effects
- Watercolor and sketch styles work great for minimalist designs
- Use anime style for illustrations and character art

**Example Styles:**
- **Oil Painting Landscape** - Transform nature photos into classic oil paintings with rich textures
- **Watercolor Portrait** - Convert headshots into delicate watercolor illustrations
- **Anime Style** - Turn photos into Japanese anime/manga art style
- **Pencil Sketch** - Create realistic pencil drawing effects from any photo

**Credits:** 15 credits per style application | High-resolution: +10 credits

**Accepted Files:** JPG, PNG up to 20MB

---

### 3. Object Eraser (Orange, Eraser)

**Purpose:** Remove unwanted objects from images

**What is Object Eraser?**
AI-powered inpainting tool that removes photobombers, clutter, watermarks, and unwanted elements from your photos. The AI intelligently fills the removed areas with content that matches the surrounding context, making it look like the object was never there.

**Key Features:**
- 🖱️ **Smart Selection Tool** - Easy brush/lasso selection for marking objects to remove
- 🧠 **Content-Aware Fill** - AI analyzes surroundings and fills intelligently
- ↩️ **Undo/Redo** - Multiple steps to perfect your edits
- 📸 **Multiple Object Removal** - Remove several objects in a single session

**How to Use (3 Steps):**
1. **Upload & Select** - Upload your image and use the brush tool to mark objects you want removed
2. **AI Inpainting** - The AI analyzes the image context and fills the selected area seamlessly
3. **Review & Refine** - Check the result, undo/redo if needed, and download the cleaned image

**Pro Tips:**
- Mark the entire object clearly including shadows for best results
- Works best with relatively simple or repeating backgrounds (sky, grass, walls)
- Use multiple passes for complex removals rather than one large selection
- For large objects, remove in sections to maintain better context awareness
- The tool excels at removing people, text overlays, power lines, and small clutter

**Example Uses:**
- **Remove Photobombers** - Delete unwanted people from vacation photos and group shots
- **Erase Watermarks** - Remove text overlays and watermarks from images (use ethically!)
- **Clean Up Clutter** - Remove trash, wires, signs, and distracting elements
- **Object Removal** - Delete unwanted objects from real estate or product photos

**Credits:** 12 credits per image | Complex removals: +8 credits

**Accepted Files:** JPG, PNG up to 25MB

---

### 4. AI Image Gen (Cyan, Layers)

**Purpose:** Advanced AI image generation with professional controls

**What is AI Image Gen?**
Professional-grade AI image generation platform with access to multiple cutting-edge AI models including DALL-E 3, Midjourney, and Stable Diffusion. Features advanced controls like ControlNet for composition guidance, img2img transformation, inpainting, outpainting, and high-resolution upscaling up to 8K.

**Key Features:**
- 🤖 **Multi-Model Support** - Switch between DALL-E 3, Midjourney v6, Stable Diffusion XL
- 🎮 **ControlNet Integration** - Use pose, depth, edge maps to control composition precisely
- 🔄 **Img2Img Transformation** - Transform existing images with AI guidance
- 🖼️ **Inpainting/Outpainting** - Edit specific areas or extend image boundaries
- 📐 **High-Resolution Output** - Generate up to 8K resolution for professional use
- ⚙️ **Advanced Parameters** - CFG scale, sampling steps, negative prompts, seeds

**How to Use (3 Steps):**
1. **Choose Model & Write Prompt** - Select AI model (DALL-E for photorealism, SD for control), write detailed prompt
2. **Configure Advanced Settings** - Set resolution, use ControlNet for composition, adjust sampling parameters
3. **Generate & Refine** - Generate multiple variations, use img2img or inpainting to perfect details

**Pro Tips:**
- Use DALL-E 3 for photorealistic content and accurate text rendering
- Use Stable Diffusion XL with ControlNet for precise composition control
- Negative prompts are crucial - specify what you DON'T want in the image
- Start with lower resolutions for testing, then upscale final versions
- Save successful seeds to reproduce similar results
- Experiment with CFG scale: 7-9 for creative freedom, 10-15 for prompt adherence

**Example Uses:**
- **Photorealistic Portraits** - "Professional headshot of confident businesswoman, studio lighting, Canon EOS R5"
- **Architectural Renders** - "Modern minimalist house on cliff, sunset, architectural photography, 8k"
- **Fantasy Landscapes** - "Floating islands with waterfalls, magical forest, ethereal lighting, highly detailed"
- **Product Mockups** - "Sleek smartphone on marble surface, studio lighting, product photography"

**Credits:**
- DALL-E 3: 40 credits per image
- Midjourney v6: 35 credits per image
- Stable Diffusion XL: 25 credits per image
- ControlNet: +10 credits
- High-res (4K+): +15 credits

**Accepted Files (for img2img):** JPG, PNG up to 30MB

---

### 5. Video Enhancer (Blue, Video)

**Purpose:** Upscale video quality with AI

**What is Video Enhancer?**
AI-powered video enhancement platform that upscales resolution, interpolates frames for smooth motion, reduces noise, and applies color correction. Transform old footage, low-resolution videos, or compressed content into high-quality, professional-looking videos up to 4K resolution.

**Key Features:**
- 📈 **AI Upscaling** - Enhance resolution from 480p/720p to 1080p or 4K using AI models
- 🎬 **Frame Interpolation** - Convert 24fps to 60fps for buttery-smooth motion
- 🔇 **Noise Reduction** - Remove grain, compression artifacts, and video noise
- 🎨 **Color Correction** - Automatic color grading and enhancement
- ⚡ **Batch Processing** - Process multiple videos in queue

**How to Use (3 Steps):**
1. **Upload Video** - Select video file (MP4, MOV, AVI) and choose target resolution (1080p, 4K)
2. **Select Enhancement Options** - Enable upscaling, frame interpolation, denoise, color correction
3. **Process & Download** - Processing takes 5-15 minutes depending on length, download enhanced MP4

**Pro Tips:**
- Original video quality matters - AI can't create detail that isn't there
- Use frame interpolation for smooth slow-motion effects or gameplay footage
- Combine upscaling with noise reduction for best results on old footage
- For batch processing, use consistent settings to maintain visual continuity
- 4K upscaling works best on sources that are at least 720p or higher
- Test a short clip first before processing long videos

**Example Uses:**
- **Old Footage Restoration** - Restore family videos, vintage film, or archival content to modern quality
- **Social Media Optimization** - Upscale vertical videos for Instagram/TikTok quality requirements
- **1080p → 4K Upscale** - Prepare content for 4K displays and high-end presentations
- **Gaming Footage** - Enhance gameplay recordings with frame interpolation for smooth 60fps

**Credits:**
- Per minute: 30 credits (1080p), 50 credits (4K)
- Frame interpolation: +15 credits/min
- Noise reduction: +10 credits/min
- Color correction: +8 credits/min

**Accepted Files:** MP4, MOV, AVI up to 2GB | Max length: 30 minutes

---

### 6. Video Upscaler (Purple, Maximize2)

**Purpose:** AI upscaling via ComfyUI workflows

**What is Video Upscaler?**
Professional video upscaling using ComfyUI's powerful workflow system. Access advanced AI models, create custom processing pipelines, and achieve the highest quality upscaling results. Designed for professionals who need granular control over the upscaling process with real-time workflow visualization.

**Key Features:**
- 🔧 **Custom Workflow Editor** - Build and customize ComfyUI workflows visually
- 🎯 **Multiple AI Models** - ESRGAN, Real-ESRGAN, SwinIR, and more specialized models
- 👁️ **Real-Time Preview** - See workflow progress and intermediate results
- 💾 **Workflow Templates** - Pre-built workflows for common use cases
- 📊 **Performance Monitoring** - Track VRAM usage and processing time

**How to Use (3 Steps):**
1. **Upload Video & Select Workflow** - Choose from templates (anime, live-action, film restoration) or build custom
2. **Configure Models & Parameters** - Select upscaling models, adjust settings, preview workflow graph
3. **Process & Monitor** - Watch real-time progress, monitor VRAM usage, download result

**Pro Tips:**
- Use anime-specific models (Real-ESRGAN Anime) for cartoon/animated content
- For live-action, try Real-ESRGAN-x4plus for balanced quality and speed
- Monitor VRAM usage - complex workflows may require GPU with 8GB+ VRAM
- Experiment with different models on test clips before full processing
- Combine multiple models in sequence for hybrid results
- Save successful workflows for reuse on similar content

**Example Workflows:**
- **Film Restoration** - Grain reduction → ESRGAN upscale → Color correction → Sharpening
- **Anime Upscaling** - Real-ESRGAN Anime → Frame interpolation → Detail enhancement
- **Gaming Footage** - Denoise → SwinIR upscale → Contrast boost → Frame rate conversion
- **Documentary Enhancement** - Color grading → Real-ESRGAN → Stabilization → Export

**Credits:**
- Standard workflow: 40 credits/min
- Complex workflow (3+ nodes): 60 credits/min
- Custom models: +20 credits/min

**Accepted Files:** MP4, MOV, AVI up to 3GB | Requires basic ComfyUI knowledge

---

### 7. Text to Video (Cyan, Type)

**Purpose:** Generate video from text prompts

**What is Text to Video?**
Create video content from text descriptions using state-of-the-art AI video generation models. Describe the scene, action, camera movement, and style, and the AI will generate short video clips perfect for social media, concept visualization, product animations, or creative projects.

**Key Features:**
- 📝 **Prompt-Based Generation** - Describe your vision in natural language
- 🎥 **Motion Controls** - Specify camera movements (pan, zoom, tilt) and subject actions
- ⏱️ **Duration Options** - Generate 3-second, 5-second, or 10-second clips
- 🎨 **Style Presets** - Cinematic, anime, photorealistic, sketch, abstract styles
- 🔄 **Variation Generation** - Create multiple takes of the same prompt

**How to Use (3 Steps):**
1. **Write Video Description** - Describe scene, motion, camera movement (e.g., "Camera pans across mountain lake at sunset")
2. **Set Duration & Style** - Choose clip length (3s/5s/10s) and visual style (cinematic, photorealistic)
3. **Generate & Download** - Wait 2-5 minutes for processing, preview, download MP4

**Pro Tips:**
- Describe motion explicitly: "camera slowly zooms in" or "subject walks toward camera"
- Use cinematic terminology: "dolly zoom," "tracking shot," "establishing shot"
- Keep prompts focused - simpler scenes generate better results than complex multi-action sequences
- Iterate on prompts based on results - small wording changes can significantly impact output
- For product videos, specify lighting and background clearly
- Combine multiple generated clips in video editor for longer sequences

**Example Prompts:**
- **Product Animation** - "Sleek smartphone rotating slowly on gradient background, studio lighting, 360-degree view"
- **Explainer Clip** - "Animated icons appearing one by one with subtle bounce effect, clean white background"
- **Social Media Content** - "Coffee pouring into white cup in slow motion, steam rising, warm morning light"
- **Concept Video** - "Futuristic city skyline at night, flying cars passing by, neon lights, cyberpunk aesthetic"

**Credits:**
- 3 seconds: 50 credits
- 5 seconds: 75 credits
- 10 seconds: 120 credits
- Variations (4 clips): 2x cost

**Output:** MP4, 1080p, 24fps | Max 10 seconds per clip

---

### 8. SiteSwarm Engine (Green, Sparkles)

**Purpose:** Generate 50+ faceted pages at scale

**What is SiteSwarm Engine?**
Automated page generation system that creates hundreds of SEO-optimized pages from templates and structured data. Perfect for location-based pages, product catalogs, service offerings, and directory sites. Upload your data (CSV/JSON), apply templates, and deploy complete site sections instantly.

**Key Features:**
- 📊 **Data-Driven Generation** - Import CSV, JSON, or database connections
- 📄 **Template Engine** - Customizable HTML/JSX templates with variable substitution
- 🔍 **SEO Optimization** - Auto-generate meta titles, descriptions, schema markup
- 🚀 **Bulk Deployment** - Generate and deploy hundreds of pages simultaneously
- 🎯 **Faceted Navigation** - Automatic filter and category page creation

**How to Use (3 Steps):**
1. **Upload Data Source** - Import CSV/JSON with your data (locations, products, services)
2. **Select & Configure Template** - Choose template type, map data fields, configure SEO settings
3. **Generate & Deploy** - Preview sample pages, bulk generate all pages, deploy to site

**Pro Tips:**
- Structure your data properly with consistent column names and clean values
- Use semantic, descriptive templates with proper heading hierarchy (H1, H2, H3)
- Test with a small batch (5-10 pages) before generating thousands
- Include unique content in each data row to avoid duplicate content penalties
- Use schema markup templates for better search engine visibility
- Set up URL structure carefully - changing it later requires redirects

**Example Use Cases:**
- **Product Catalog** - Generate 500+ product pages from e-commerce database
- **Location Pages** - Create city/region landing pages for service businesses (50+ locations)
- **Service Offerings** - Build pages for every service variation and package
- **Directory Sites** - Generate listing pages for businesses, professionals, or resources

**Credits:**
- Template setup: 100 credits
- Per page generated: 2 credits
- Bulk (100+ pages): 150 credits flat
- SEO optimization: +50 credits

**Accepted Data:** CSV, JSON, API endpoint | Max 10,000 rows per batch

---

### 9. Audio Cleaner (Yellow, Music)

**Purpose:** Clean audio with AI

**What is Audio Cleaner?**
AI-powered audio enhancement that removes background noise, enhances voice clarity, eliminates echo, and normalizes loudness. Perfect for podcasts, interviews, voiceovers, video soundtracks, and meeting recordings. Transform poor-quality audio into broadcast-ready sound.

**Key Features:**
- 🔇 **Background Noise Removal** - Eliminate hiss, hum, traffic, wind, and ambient noise
- 🎤 **Voice Enhancement** - Boost clarity, presence, and intelligibility of spoken audio
- 🔊 **Echo Cancellation** - Remove room echo and reverb from recordings
- 📊 **Loudness Normalization** - Standardize volume levels to broadcast standards (-16 LUFS)
- 🎚️ **Multi-Track Support** - Process multiple audio files with consistent settings

**How to Use (3 Steps):**
1. **Upload Audio File** - Select audio file (MP3, WAV, M4A) - supports mono and stereo
2. **Select Cleanup Options** - Enable noise reduction, voice enhancement, echo removal, normalization
3. **Preview & Download** - Listen to preview with A/B comparison, download cleaned audio

**Pro Tips:**
- Original recording quality still matters - AI can't fix severe distortion or clipping
- Use voice enhancement specifically for podcasts, interviews, and narration
- Apply normalization last in the processing chain for consistent loudness
- For music, use gentler noise reduction settings to preserve audio fidelity
- Batch process podcast episodes with identical settings for consistency
- Export in WAV format for further editing, MP3 for final distribution

**Example Uses:**
- **Podcast Cleanup** - Remove room noise, enhance host voices, normalize levels across episodes
- **Interview Enhancement** - Clean up phone interviews, Zoom calls, field recordings
- **Voiceover Polishing** - Remove mouth clicks, breath sounds, background hum from VO recordings
- **Meeting Recordings** - Enhance clarity of conference calls and video meeting audio

**Credits:**
- Per minute: 8 credits
- Voice enhancement: +5 credits/min
- Echo removal (heavy): +8 credits/min
- Batch discount (10+ files): 20% off

**Accepted Files:** MP3, WAV, M4A, AAC up to 500MB | Max length: 2 hours

---

## Implementation Checklist

### Phase 1: Setup (1 tool - 30 minutes)
- [ ] Review SmartGen template thoroughly
- [ ] Set up development environment
- [ ] Test one tool implementation (Background Remover recommended)
- [ ] Validate responsive design and component behavior

### Phase 2: Image Tools (4 tools - 4 hours)
- [ ] Background Remover - `tools/background-remover/page.tsx`
- [ ] Smart Restyle - `tools/smart-restyle/page.tsx`
- [ ] Object Eraser - `tools/object-eraser/page.tsx`
- [ ] AI Image Gen - `tools/ai-image-gen/page.tsx`

### Phase 3: Video Tools (4 tools - 5 hours)
- [ ] Video Enhancer - `tools/video-enhancer/page.tsx`
- [ ] Video Upscaler - `tools/video-upscaler/page.tsx`
- [ ] Text to Video - `tools/text-to-video/page.tsx`
- [ ] SiteSwarm Engine - `siteswarm/page.tsx`

### Phase 4: Audio Tools (1 tool - 1 hour)
- [ ] Audio Cleaner - `tools/audio-cleaner/page.tsx`

### Phase 5: Testing & Polish (2 hours)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Navigation flow testing
- [ ] Link verification
- [ ] Typography and spacing consistency
- [ ] Color scheme validation
- [ ] Accessibility review (WCAG 2.1 AA)

### Phase 6: Documentation
- [ ] Update SmartChannelCX.tsx with any new tools
- [ ] Document credit pricing in central config
- [ ] Create style guide for future tools
- [ ] Update project README

---

## Technical Implementation Notes

### Standard Page Template Structure

```typescript
"use client";

import { useState } from "react";
import {
  [ToolIcon],
  Sparkles,
  Download,
  Share2,
  CheckCircle,
  // ... other icons
} from "lucide-react";
import {
  ToolLayout,
  InstructionSection,
  DemoCard,
  ToolHero,
  StepCard,
  UploadZone
} from "@/components/tools/ToolLayout";

export default function [ToolName]Page() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ToolLayout
      toolId="[tool-id]"
      title="[Tool Name]"
      description="[Short description]"
      color="bg-[color]-500"
    >
      {/* Hero Section */}
      <ToolHero
        title="[Tool Name]"
        toolId="[tool-id]"
        description="[Long description]"
        color="bg-[color]-500"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <InstructionSection title="What is [Tool Name]?">
            {/* Content */}
          </InstructionSection>

          {/* Features */}
          <InstructionSection title="Key Features">
            {/* 4 feature cards */}
          </InstructionSection>

          {/* How to Use */}
          <InstructionSection title="How to Use [Tool Name]">
            <div className="space-y-4">
              <StepCard number={1} title="..." description="..." />
              <StepCard number={2} title="..." description="..." />
              <StepCard number={3} title="..." description="..." />
            </div>
          </InstructionSection>

          {/* Pro Tips */}
          <InstructionSection title="Pro Tips for Better Results">
            {/* Bulleted list */}
          </InstructionSection>

          {/* Examples */}
          <InstructionSection title="Example [Uses/Prompts]">
            {/* Example cards */}
          </InstructionSection>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Start CTA */}
          {/* Example Results */}
          {/* Credits Info */}
          {/* Upload Zone */}
          {/* Share/Docs Buttons */}
        </div>
      </div>
    </ToolLayout>
  );
}
```

### File Acceptance Patterns

| Tool | Accept Attribute | Max Size |
|------|------------------|----------|
| Image Tools | `image/*,.jpg,.jpeg,.png,.webp` | 25MB |
| Video Tools | `video/*,.mp4,.mov,.avi` | 2-3GB |
| Audio Tools | `audio/*,.mp3,.wav,.m4a,.aac` | 500MB |
| Text to Video | N/A (text input only) | - |
| SiteSwarm | `.csv,.json` | 10MB |

### Credit Pricing Reference

Maintain consistency across all tool pages:

| Tool | Base Cost | Premium Options |
|------|-----------|-----------------|
| Background Remover | 10 credits | Batch (10): 80 |
| Smart Restyle | 15 credits | High-res: +10 |
| Object Eraser | 12 credits | Complex: +8 |
| AI Image Gen | 25-40 credits | ControlNet: +10, High-res: +15 |
| Video Enhancer | 30-50 credits/min | Interpolation: +15/min |
| Video Upscaler | 40-60 credits/min | Custom models: +20/min |
| Text to Video | 50-120 credits | Based on duration |
| SiteSwarm | 150 credits | Bulk (100+), +SEO: +50 |
| Audio Cleaner | 8 credits/min | Voice enhance: +5/min |

---

## Success Metrics

### Completion Criteria
- ✅ All 9 tools have fully functional UI pages
- ✅ Consistent design language across all tools
- ✅ Responsive on mobile, tablet, desktop
- ✅ All navigation links working correctly
- ✅ Upload zones configured with correct file types
- ✅ Credit information accurate and consistent
- ✅ Share functionality working on all pages
- ✅ No console errors or warnings

### Quality Standards
- Typography consistent with design system
- Color usage matches tool assignments
- All icons properly imported and displayed
- Smooth scrolling and animations
- Accessibility features implemented (ARIA labels, keyboard navigation)
- Loading states for async operations
- Error handling for file uploads

---

## Future Enhancements

### Phase 7: Backend Integration (Future)
- Connect upload zones to actual file processing APIs
- Implement real-time processing progress tracking
- Add result preview and download functionality
- Integrate credit deduction system
- Build processing history/gallery

### Phase 8: Advanced Features (Future)
- Drag-and-drop file upload
- Batch processing interface
- Processing templates and presets
- User settings and preferences
- Analytics and usage tracking

---

## Resources & References

### Key Files
- Template: `vidiflow/frontend/app/smartchannel/tools/smartgen/page.tsx`
- Components: `vidiflow/frontend/components/tools/ToolLayout.tsx`
- Main Dashboard: `vidiflow/frontend/components/SmartChannelCX.tsx`
- Tool Routes: `vidiflow/frontend/app/smartchannel/page.tsx`

### External Resources
- Live Site: https://vidi.news/smartchannel
- Lucide Icons: https://lucide.dev/icons/
- Tailwind CSS: https://tailwindcss.com/docs
- Next.js App Router: https://nextjs.org/docs/app

### Design System
- Primary Colors: Indigo-500, Purple-600
- Background: Slate-900, Slate-800
- Text: White, Slate-300, Slate-400
- Accent: Tool-specific colors
- Border Radius: rounded-xl (12px), rounded-2xl (16px)
- Spacing: Tailwind default scale

---

## Questions & Decisions

### Decisions Made
- ✅ Use SmartGen as template for all tools
- ✅ Maintain consistent 3-column layout (2/3 content, 1/3 sidebar)
- ✅ Implement "Coming Soon" modals for non-functional features
- ✅ Use Lucide React icons exclusively
- ✅ Follow established color assignments

### Open Questions
- ⏳ Should credit pricing be stored in a central config file?
- ⏳ Do we need a global credit balance component/context?
- ⏳ Should example images/videos be included or remain placeholders?
- ⏳ Will backend APIs follow a standard interface for all tools?

---

**Document Version:** 1.0
**Last Updated:** March 27, 2026
**Next Review:** After Phase 2 completion

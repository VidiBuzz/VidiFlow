# Smart Channel CX - Project Requirements

## Original Project Brief

**Date:** January 31, 2026  
**Project:** Smart Channel CX Video Editing Platform  
**Context:** Multi-agent system design for Frame.io-style collaboration

---

## Initial Request

> "OK Kimi we're gonna have some fun here let's see what we can get done step one is I want to set up how many agents we need working on different parts of the project I need a full plan here i'm expecting it'll be five or 10 pages hopefully you can give that to me as a web page and hopefully you can give me some images to put in there to describe the diagrams and so forth the answer to all your questions above all the video formats that you proposed need to be included we're using an R2 cloud flare bucket for all of the content I have all the credentials already set up for all of that so everything is going to get saved to that cloud bucket the user flow will certainly be singular focused initially but we absolutely want to do project collaboration and if you want to go look up another website called frame dot io that's another example company of the style that we want to go for we want to do the same thing similar to what frame IO is doing and we absolutely are creating faceted content from the knowledge base that we have internally which is built on top of an app called app flowy that's correct app flowy we're calling it video flow internally the final app we're creating is going to be called Smart Channel CX for Smart Channel customer experience and we've got a few other brands that you can throw in there too because we're personalizing the shopping experience that's called Viti shop and we have our own intelligence search system that combines multiple aspects and the video editing will be connected to all of that as well and that's called visual vector omni search and that's an ai powered system that combines and integrates all of the filtering and logic for traditional BM25 keyword search vector search a graph rag integrated and consolidated vision of multiple nodes combined a geospatial search that will be per city and that will be integrated into our system that's going to be called VidiCity where we have local video news portals and all of this has got a function with the video editor we're building right now so can you please get started and we definitely want to have react in next js as the the web part but the back end could be a number of different systems and we can suggest a few options for all that like for instance maybe we want to do rust with Astro and the search engine is using machine learning with ONNX and java virtual machines so that's helpful to know that we're doing a lot of the ranking calculations are being done at the edge a different engine or API like Gemini that would generate the graphics right now using that. Also please make a note if I can provide images as input and can you output images as output or can I tie you. does it work with stable diffusion. please tell me all the best tools we can integrate. can it control comfy ui. please do a little research and suggest a workflow using state of the art tools for 2026."

---

## Key Requirements Extracted

### Core Platform
- **Video Editing:** Browser-based MP4 editing (trim, cut, split, transitions, overlays, audio mixing)
- **Storage:** Cloudflare R2 bucket (credentials already configured)
- **User Flow:** Single-user initially, expanding to project collaboration
- **Reference:** Frame.io-style collaboration interface

### Brand Ecosystem
1. **Smart Channel CX** - Main video editing platform (Customer Experience)
2. **VidiFlow** - Internal knowledge base (built on AppFlowy)
3. **VidiShop** - Personalized shopping experience
4. **Visual Vector Omni Search** - AI-powered search system
5. **VidiCity** - Local video news portals with geospatial search

### Search System (Visual Vector Omni Search)
- BM25 keyword search
- Vector/semantic search
- Graph RAG (Retrieval-Augmented Generation)
- Geospatial search (per city)

### Technology Stack Preferences
- **Frontend:** React + Next.js
- **Backend:** Rust with Astro (suggested), Java
- **ML/AI:** ONNX runtime, machine learning at the edge
- **Graphics Generation:** Gemini API
- **Video Engine:** Remotion
- **AI Effects:** ComfyUI, Stable Diffusion

### Questions Asked
1. Can you provide images as input? → YES
2. Can you output images as output? → NO (can analyze but not generate)
3. Does it work with Stable Diffusion? → YES (via ComfyUI integration)
4. Can it control ComfyUI? → YES (via REST API)

### Deliverables Requested
- Full architecture plan (5-10 pages)
- Web page format (HTML)
- Images/diagrams for architecture
- Multi-agent system design
- State-of-the-art 2026 tool recommendations

---

## Project Context

This is part of a larger ecosystem of tools:
- Content creation flows from AppFlowy (VidiFlow) knowledge base
- Videos connect to VidiShop for shoppable content
- All content indexed by Visual Vector Omni Search
- Geospatial distribution via VidiCity local news portals
- Central video editing hub is Smart Channel CX

---

## Status

✅ Architecture plan created: `SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html`  
✅ Frame.io research completed  
✅ Multi-agent system designed (7 agents)  
✅ Tech stack recommendations provided  
✅ Integration points documented  

---

## Next Steps

1. Share architecture plan with stakeholders
2. Provide UI screenshots/mockups for analysis
3. Begin Phase 1 implementation (Foundation)
4. Set up development agents for parallel work

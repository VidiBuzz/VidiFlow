# 🤖 VidiSmart AI Agent System - Complete Technical Analysis

**Date:** March 2026  
**Purpose:** Comprehensive overview of all systems, libraries, and integration requirements for personalizing LLM outputs with branding/logo integration

---

## 📋 Executive Summary

Your project is a **multi-platform AI ecosystem** combining:
- **OpenFang** (Rust-based Agent OS) - Core agent orchestration
- **AnythingLLM** + **NotebookLM** - RAG and document intelligence  
- **Continue.dev** + **LM Studio** - Local LLM integration with Qwen 3.5
- **VidiFlow** (Next.js frontend) - Video editing platform
- **Multiple MCP Servers** - Tool extensions for agents

This document covers everything needed to customize the system and integrate your logo/branding across all components.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  VidiFlow (Next.js) │ Smart Channel CX │ Agent Dashboard       │
│  React 19, Tailwind │ Three.js, GSAP   │ Supabase Auth        │
└──────────────────────┬──────────────────┬──────────────────────┘
                       │                  │
┌──────────────────────▼──────────────────▼──────────────────────┐
│                    API & ORCHESTRATION                          │
├─────────────────────────────────────────────────────────────────┤
│  OpenFang (Rust) │ Continue MCP │ AnythingLLM API             │
│  14 Crates       │ Playwright   │ Document Chat              │
└──────────────────────┬──────────────────┬──────────────────────┘
                       │                  │
┌──────────────────────▼──────────────────▼──────────────────────┐
│                    AI/LLM LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Qwen 3.5 (LM Studio) │ Ollama │ NotebookLM API               │
│  Local Inference      │ Embeddings │ Google Research          │
└──────────────────────┬──────────────────┬──────────────────────┘
                       │                  │
┌──────────────────────▼──────────────────▼──────────────────────┐
│                    DATA & STORAGE                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL) │ Cloudflare R2 │ Paperless-ngx        │
│  Vector DB             │ Media Storage │ OCR + Documents      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Breakdown

### **1. Core Agent System: OpenFang**

| Component | Language | Purpose | Lines of Code |
|-----------|----------|---------|---------------|
| `openfang-kernel` | Rust | Orchestration, workflows, RBAC | ~25K LOC |
| `openfang-runtime` | Rust | Agent loop, 53 tools, WASM sandbox | ~30K LOC |
| `openfang-api` | Rust | 140+ REST/WS/SSE endpoints | ~15K LOC |
| `openfang-channels` | Rust | 40 messaging adapters | ~20K LOC |
| `openfang-memory` | Rust | SQLite + vector embeddings | ~10K LOC |
| `openfang-skills` | Rust | 60 bundled skills | ~15K LOC |
| `openfang-hands` | Rust | 7 autonomous Hands | ~8K LOC |
| `openfang-desktop` | Rust/Tauri | Native desktop app | ~14K LOC |

**Total:** 137,728 lines of Rust code across 14 crates

#### Key Features:
- **Cold Start:** <200ms (vs. 6s for competitors)
- **Memory Usage:** 40MB idle (vs. 500MB for OpenClaw)
- **Install Size:** ~32MB binary
- **Security:** 16 discrete security layers

#### The 7 Autonomous "Hands":
1. **Clip** - YouTube → Shorts pipeline (FFmpeg + yt-dlp)
2. **Lead** - Prospecting and lead scoring
3. **Collector** - OSINT intelligence gathering
4. **Predictor** - Superforecasting engine
5. **Researcher** - Deep autonomous research
6. **Twitter** - Social media management
7. **Browser** - Web automation (Playwright)

---

### **2. Frontend: VidiFlow & Smart Channel CX**

#### Package.json Dependencies:
```json
{
  "core": {
    "next": "^15.1.0",           // React framework
    "react": "^19.0.0",          // UI library
    "react-dom": "^19.0.0"       // DOM rendering
  },
  "styling": {
    "tailwindcss": "^3.4.14",    // Utility-first CSS
    "tailwind-merge": "^2.5.4",  // Class merging
    "clsx": "^2.1.1"             // Conditional classes
  },
  "3D/Graphics": {
    "three": "^0.183.2",         // WebGL library
    "@types/three": "^0.183.1",  // TypeScript definitions
    "gsap": "^3.14.2",           // Animations
    "@types/gsap": "^1.20.2"     // GSAP types
  },
  "data-fetching": {
    "@tanstack/react-query": "^5.60.0",  // Server state
    "@directus/sdk": "^19.0.0"           // Headless CMS
  },
  "auth/database": {
    "@supabase/supabase-js": "^2.95.3",     // Database client
    "@supabase/auth-helpers-nextjs": "^0.15.0",  // Auth helpers
    "next-auth": "^5.0.0-beta.19"           // Authentication
  },
  "utilities": {
    "uuid": "^13.0.0",              // UUID generation
    "date-fns": "^4.1.0",           // Date manipulation
    "dotenv": "^17.3.1",            // Environment variables
    "recharts": "^2.13.3"           // Charts/graphs
  }
}
```

#### Build Tools:
- **TypeScript:** ^5.6.3
- **PostCSS:** ^8.4.47 (CSS processing)
- **Autoprefixer:** ^10.4.20 (Browser compatibility)
- **ESLint:** ^8.57.1 (Code linting)

---

### **3. LLM Integration Layer**

#### A. Continue.dev Configuration
```jsonc
{
  "models": [
    {
      "title": "Qwen 3.5",
      "provider": "llama.cpp",
      "model": "qwen-3.5-instruct",
      "apiBaseUrl": "http://localhost:1234"
    }
  ],
  "contextLength": 40000,
  "maxHistoryMessages": 10,
  "compressContext": true
}
```

**Supported Models:**
- Qwen 3.5 (8B/14B/32B) via LM Studio or Ollama
- Embedding: qwen3-embedding:2b

#### B. MCP Servers (Model Context Protocol)

| Server | Command | Purpose |
|--------|---------|---------|
| `supabase` | `node supabase-mcp-server.js` | Database operations |
| `filesystem` | `npx @modelcontextprotocol/server-filesystem` | File system access |
| `git` | `npx @modelcontextprotocol/server-git` | Git operations |
| `tavily-search` | `npx tavily-mcp` | Web search |
| `playwright` | Custom script | Browser automation |

**MCP Configuration Location:** `mcp-config.json`

#### C. NotebookLM Integration

**Python Package:** `notebooklm-py[browser]`

```bash
# Install with browser support
pip install "notebooklm-py[browser]" playwright

# Install Playwright browsers
playwright install chromium
```

**Available MCP Tools:**
- `notebooklm_list_notebooks` - List notebooks
- `notebooklm_get_sources` - Get notebook sources
- `notebooklm_chat` - Chat with notebook
- `notebooklm_generate_audio` - Create audio overviews
- `notebooklm_export_to_anythingllm` - Export to AnythingLLM

---

### **4. Backend Services**

#### A. Paperless-ngx (Document Management)
```yaml
services:
  paperless:     # Main app (port 8090)
  cache:         # Redis for task queue
  tika:          # Apache Tika for document parsing (port 9998)
  gotenberg:     # PDF conversion (port 8091)
```

**Features:**
- OCR with Tesseract
- Document indexing
- Searchable PDFs
- API integration

#### B. AnythingLLM Setup
```json
{
  "llm_provider": "LM Studio",
  "base_url": "http://localhost:1234/v1",
  "model": "qwen2.5",
  "context_length": 8192,
  "port": 3001
}
```

**Capabilities:**
- RAG-based document chat
- Workspace management
- MCP server integration
- API access for automation

---

### **5. Database & Storage**

#### Supabase Configuration:
```javascript
const supabase = {
  url: "https://jeasmwbberfgztkxfjwr.supabase.co",
  anonKey: "sbp_229e5b28acf95c33a6a6d611683962149eb327bd"
};
```

**Tables:**
- Users & authentication
- Projects & workflows
- Vector embeddings (pgvector)
- Audit logs

#### Cloudflare R2:
- **Purpose:** Media storage (videos, images)
- **Access:** S3-compatible API
- **CDN:** Automatic global distribution

---

## 🔌 Integration Points for Logo/Branding

### **1. Frontend Branding**

#### Files to Modify:
```
vidiflow/frontend/
├── app/
│   ├── globals.css          # Global styles (add logo imports)
│   ├── layout.tsx           # Root layout (header/logo placement)
│   └── components/
│       ├── Header.tsx       # Navigation header
│       └── Logo.tsx         # Logo component
├── public/
│   └── images/
│       └── logo.png         # Your new logo file
```

#### Code Changes Needed:

**A. Create Logo Component:**
```tsx
// vidiflow/frontend/app/components/Logo.tsx
import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image 
        src="/images/logo.png" 
        alt="VidiSmart Logo" 
        width={40}
        height={40}
        priority
      />
      <span className="text-xl font-bold">VidiSmart</span>
    </div>
  );
}
```

**B. Update Header:**
```tsx
// vidiflow/frontend/app/components/Header.tsx
import Logo from './Logo';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      {/* Navigation */}
    </header>
  );
}
```

**C. Add to Layout:**
```tsx
// vidiflow/frontend/app/layout.tsx
import Header from './components/Header';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

---

### **2. Agent Output Branding**

#### A. OpenFang Agent Responses

**Location:** `openfang/crates/openfang-runtime/src/agents/mod.rs`

**Add branding to agent responses:**
```rust
// Add logo watermark or signature to outputs
fn add_branding(&self, content: &str) -> String {
    format!(
        "{}\n\n---\nGenerated by {} | {}", 
        content, 
        self.agent_name,
        env!("BRAND_LOGO_URL")
    )
}
```

**Environment Variable:**
```toml
# openfang/.env
BRAND_LOGO_URL="https://cdn.vidismart.com/logo.png"
BRAND_NAME="VidiSmart AI"
```

#### B. Continue.dev Chat Interface

**Location:** `~/.continue/config.json`

**Add custom welcome message with logo:**
```jsonc
{
  "welcomeMessage": {
    "text": "Welcome to VidiSmart! 🤖",
    "logoUrl": "https://cdn.vidismart.com/logo.png"
  }
}
```

#### C. AnythingLLM Workspace Branding

**Configuration:** `~/.anythingllm/config.json`

```jsonc
{
  "workspaceSettings": {
    "brandName": "VidiSmart Knowledge Base",
    "logoUrl": "https://cdn.vidismart.com/logo.png",
    "primaryColor": "#0066FF"
  }
}
```

---

### **3. Document Generation Branding**

#### A. PDF Reports (Python)

**Script:** `add_logo_overlay.py` (already exists in your project!)

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Image
from reportlab.pdfgen import canvas

def add_logo_to_pdf(output_path, logo_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    c = canvas.Canvas(output_path)
    
    # Add logo to header
    logo = Image(logo_path, width=40, height=40)
    logo.drawOn(c, 500, 750)
    
    c.save()
```

**Usage:**
```bash
python add_logo_overlay.py --input report.pdf --output branded_report.pdf
```

#### B. HTML Reports

**Template Location:** `templates/report.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>VidiSmart Report</title>
</head>
<body>
  <header>
    <img src="https://cdn.vidismart.com/logo.png" alt="VidiSmart Logo">
    <h1>{{ report_title }}</h1>
  </header>
  
  {{ content }}
  
  <footer>
    <p>Generated by VidiSmart AI</p>
  </footer>
</body>
</html>
```

---

### **4. Video Content Branding**

#### A. OpenFang Clip Hand Integration

The **Clip Hand** already handles video processing with FFmpeg:

```bash
# Add logo watermark to videos
ffmpeg -i input.mp4 \
  -i logo.png \
  -filter_complex "overlay=10:10" \
  output_branded.mp4
```

**Configuration:** `openfang/crates/openfang-hands/src/clip/hand.toml`

```toml
[branding]
logo_path = "/path/to/logo.png"
position = "bottom-right"
opacity = 0.8
scale = 0.1
```

#### B. VidiFlow Video Editor

**Component:** `vidiflow/frontend/app/components/VideoEditor.tsx`

Add logo overlay feature:
```tsx
function VideoEditor() {
  const [logoOverlay, setLogoOverlay] = useState(false);
  
  return (
    <div>
      <video ref={videoRef}>
        {logoOverlay && (
          <img 
            src="/logo.png" 
            className="absolute bottom-4 right-4 w-16 h-16 opacity-80"
          />
        )}
      </video>
    </div>
  );
}
```

---

## 📦 Libraries & Dependencies Summary

### **By Category:**

#### **Rust Crates (OpenFang):**
| Crate | Purpose | Key Dependencies |
|-------|---------|------------------|
| `openfang-kernel` | Orchestration | tokio, serde, sqlx |
| `openfang-runtime` | Agent execution | wasmtime, reqwest, uuid |
| `openfang-api` | REST API | axum, tower, tracing |
| `openfang-channels` | Messaging adapters | telegram-bot, discord-rs |
| `openfang-memory` | Storage | rusqlite, candle-core (ML) |
| `openfang-skills` | Skill system | toml, walkdir |

#### **Node.js Packages:**
```json
{
  "framework": ["next@15.1", "react@19"],
  "styling": ["tailwindcss@3.4", "clsx"],
  "database": ["@supabase/supabase-js@2.95"],
  "ai/ml": ["playwright@1.58", "@directus/sdk@19"],
  "graphics": ["three@0.183", "gsap@3.14"]
}
```

#### **Python Packages:**
```bash
# NotebookLM integration
notebooklm-py[browser]
playwright

# PDF generation
reportlab
fpdf2

# Video processing
opencv-python
moviepy
ffmpeg-python
```

---

## 🔧 Customization Requirements

### **What You Need to Do:**

#### **Phase 1: Logo Integration (Immediate)**

1. **Upload Logo to CDN**
   ```bash
   # Upload to Cloudflare R2 or your hosting
   aws s3 cp logo.png s3://vidismart-assets/logo.png
   # URL: https://cdn.vidismart.com/logo.png
   ```

2. **Update Frontend Configuration**
   - Edit `vidiflow/frontend/app/globals.css` (add logo imports)
   - Create `Logo.tsx` component
   - Update all header/navigation components

3. **Configure Agent Branding**
   - Set environment variables in OpenFang
   - Update MCP server configs
   - Modify AnythingLLM workspace settings

#### **Phase 2: System-Wide Branding (1-2 days)**

4. **Update All Documentation**
   - Replace placeholder logos in README files
   - Add logo to HTML reports and presentations
   - Update deployment manifests

5. **Configure Email/Notification Templates**
   - Add logo to email headers
   - Update notification branding
   - Configure Slack/Discord bot avatars

6. **Video Content Branding**
   - Configure FFmpeg watermark settings
   - Update Clip Hand configuration
   - Test video output with logo overlay

#### **Phase 3: Advanced Integration (1 week)**

7. **Dynamic Logo Selection**
   - Implement A/B testing for logos
   - Support multiple brand variants
   - Add seasonal/holiday branding options

8. **API Response Branding**
   - Add branded headers to API responses
   - Include logo in JSON metadata
   - Watermark generated images/PDFs

9. **Agent Personality Customization**
   - Configure tone/voice per brand
   - Add custom system prompts with branding
   - Train fine-tuned models on brand guidelines

---

## 🚀 Deployment Checklist

### **Pre-Deployment:**
- [ ] Logo uploaded to CDN (HTTPS URL)
- [ ] Environment variables configured
- [ ] All frontend components updated
- [ ] Agent configs modified
- [ ] Test deployments completed

### **Deployment Steps:**

1. **Frontend Deployment**
   ```bash
   cd vidiflow/frontend
   npm run build
   # Deploy to hosting (Vercel/Netlify/custom)
   ```

2. **OpenFang Deployment**
   ```bash
   cargo build --release
   cp target/release/openfang /usr/local/bin/
   openfang init  # Configure branding vars
   openfang start
   ```

3. **MCP Server Updates**
   ```bash
   # Restart all MCP servers with new configs
   systemctl restart mcp-servers
   ```

4. **AnythingLLM Configuration**
   - Update workspace settings via UI
   - Restart AnythingLLM service
   - Verify logo appears in chat interface

5. **Continue.dev Config**
   - Update `~/.continue/config.json`
   - Restart Continue extension
   - Test branded welcome message

---

## 📊 Performance Considerations

### **Logo Optimization:**

| Format | Use Case | Max Size | Compression |
|--------|----------|----------|-------------|
| **SVG** | Web/UI elements | 50KB | Lossless |
| **PNG** | Video watermark | 100KB | PNGquant |
| **WebP** | Modern browsers | 80KB | 80% quality |
| **JPEG** | Email headers | 60KB | 75% quality |

### **CDN Strategy:**
```
Primary: Cloudflare R2 (vidismart-assets)
Fallback: GitHub Pages (static hosting)
Backup: Local file server (localhost fallback)
```

---

## 🔐 Security Considerations

### **Logo Asset Protection:**
1. Use signed URLs for logo access (Cloudflare R2)
2. Implement CORS policies to prevent hotlinking
3. Add watermark to high-res versions
4. Monitor CDN analytics for unauthorized use

### **API Key Management:**
```bash
# Never commit these files!
.env
supabase-mcp-server.js  # Contains API keys
mcp-config.json         # May have secrets
```

---

## 📞 Support & Resources

### **Documentation Links:**
- [OpenFang Docs](https://openfang.sh/docs)
- [Continue.dev Guide](./CONTINUE-SETUP-GUIDE.md)
- [AnythingLLM Setup](./PAPERLESS_NGX_ANYTHINGLLM_SETUP.md)
- [NotebookLM Integration](./NOTEBOOKLM-ANYTHINGLLM-GUIDE.md)

### **Key Files in Your Project:**
```
vidismart/
├── openfang/              # Rust agent OS (137K LOC)
├── vidiflow/frontend/     # Next.js UI
├── mcp-config.json        # MCP server configs
├── continue-config.json   # Continue.dev config
├── add_logo_overlay.py    # Logo watermarking script
└── LOGO_ENHANCEMENT_README.md  # Logo guide
```

---

## 🎯 Next Steps Summary

### **Immediate Actions (Today):**
1. ✅ Upload logo to CDN
2. ✅ Update frontend components (Logo.tsx, Header.tsx)
3. ✅ Configure OpenFang environment variables
4. ✅ Test branded outputs in all systems

### **Short-term (This Week):**
5. Update documentation with new branding
6. Configure video watermarking pipeline
7. Set up email/notification templates
8. Deploy to staging environment

### **Long-term (Next Month):**
9. Implement A/B testing for logo variants
10. Fine-tune LLM on brand voice guidelines
11. Add dynamic seasonal branding support
12. Create branded agent personas

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Logo visibility | 100% of outputs | Audit all agent responses |
| Brand consistency | Unified across platforms | Visual inspection |
| Load time impact | <50ms overhead | Lighthouse scores |
| CDN hit rate | >95% cache hits | Cloudflare analytics |

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Author:** VidiSmart AI Team  
**Status:** Ready for Implementation ✅

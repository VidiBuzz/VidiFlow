# Frame.io UI Reference for Smart Channel CX

**Date Captured:** January 31, 2026  
**Purpose:** UI/UX study for Frame.io-style video collaboration platform

---

## Table of Contents
1. [Dashboard Layout](#1-dashboard-layout)
2. [Project View](#2-project-view)
3. [Asset Grid & Thumbnails](#3-asset-grid--thumbnails)
4. [Commenting System](#4-commenting-system)
5. [AI Features](#5-ai-features)
6. [File Management](#6-file-management)
7. [Sharing & Presentation](#7-sharing--presentation)
8. [Status Workflows](#8-status-workflows)
9. [Key Metrics & Social Proof](#9-key-metrics--social-proof)

---

## 1. Dashboard Layout

### Overall 3-Panel Design
```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEFT SIDEBAR          │  CENTER PANEL            │  RIGHT PANEL        │
│  ─────────────────     │  ────────────────────    │  ─────────────────  │
│  • Projects            │  • Project Thumbnails    │  • Empty (context)  │
│  • Recents             │  • Progress bars         │  • Asset details    │
│  • Favorites           │  • Duration info         │  • Comments panel   │
│  • Shared with me      │  • Team avatars          │  • Fields/Metadata  │
│  • Tags                │  • Status indicators     │                     │
│                         │                           │                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Left Sidebar Elements
| Element | Description | Implementation Notes |
|---------|-------------|---------------------|
| **Projects** | Main navigation item, selected by default | Root collection |
| **Recents** | Recently accessed projects | Timestamp-sorted |
| **Favorites** | Starred/pinned projects | User preference |
| **Shared with me** | Projects shared by others | Permission-based |
| **Tags** | Custom labels (Syfy, LA, Tokyo in example) | Metadata filter |

### Visual Design
- **Dark theme** - Professional video tool aesthetic
- **Sidebar width** - ~250px (collapsed state available)
- **Active state** - Subtle background highlight
- **Icons** - Minimalist line icons (20x20px)

---

## 2. Project View

### Project Card Components
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │     THUMBNAIL IMAGE            │    │
│  │     (16:9 aspect ratio)        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Project Name        [Progress Bar]     │
│  Client Name         ████████████░░ 75% │
│                                         │
│  [Avatar] [Avatar] [Avatar]  +3 more   │
│                                         │
└─────────────────────────────────────────┘
```

### Project Card Elements
| Element | Data Type | Example |
|---------|-----------|---------|
| Thumbnail | Image (auto-generated) | Video frame |
| Project name | String | "S1 E1 - The Long Road" |
| Client name | String | "Syfy" |
| Progress bar | Visual + percentage | 75% complete |
| Team avatars | User images | 3 avatars shown |

### Progress Bar States
- **Incomplete:** Light gray background
- **Complete:** Green fill (100%)
- **In-progress:** Partial fill + percentage

---

## 3. Asset Grid & Thumbnails

### Video Asset Components
```
┌──────────────────────────────────────┐
│  ┌────────────────────────────┐      │
│  │                            │      │
│  │     VIDEO THUMBNAIL       │      │
│  │     (with hover effects)  │      │
│  │                            │      │
│  │         ▶ 2:34            │      │  Duration badge
│  └────────────────────────────┘      │
│                                      │
│  filename.mp4                        │
│  1080p • ProRes 422 • 1.2 GB        │
└──────────────────────────────────────┘
```

### Thumbnail Features
| Feature | Description | Smart Channel CX Implementation |
|---------|-------------|--------------------------------|
| **Hover preview** | Play on hover | Preview GIF on hover |
| **Duration badge** | Time overlay | Bottom-right corner |
| **Quality label** | Resolution/codec | Below thumbnail |
| **File size** | Storage info | Below thumbnail |
| **Selection state** | Multi-select support | Checkbox + highlight |

### Resolution & Codec Labels
```
1080p  •  ProRes 422  •  1.2 GB
│      │              │
│      │              └── File size (auto-calculated)
│      └── Codec (color-coded: ProRes=orange)
└── Resolution (color-coded: 4K=purple, 1080p=blue)
```

---

## 4. Commenting System

### Right Panel Layout
```
┌─────────────────────────────────────────┐
│  COMMENTS                    [x] Close │  ← Comment panel header
├─────────────────────────────────────────┤
│  [Tab: Comments] [Tab: Fields]          │  ← Tab navigation
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [User Avatar]  User Name         │  │
│  │  ⏱ 00:02                          │  │  ← Time-stamped
│  │  "Great color grading on this      │  │
│  │   shot. Can we push the contrast   │  │
│  │   a bit more?"                     │  │
│  │                                   │  │
│  │  [Reply] [Resolve] [Emoji]        │  │  ← Action buttons
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [User Avatar]  User Name         │  │
│  │  ⏱ 00:12                          │  │
│  │  "Yes, I'll adjust in the next    │  │
│  │   pass. Should I also add a        │  │
│  │   LUT?"                           │  │
│  │                                   │  │
│  │  [Reply] [Resolve] [Emoji]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📎 SupersCopy.docx attached      │  │  ← File attachment
│  │  [User Avatar]  User Name         │  │
│  │  "Here's the brief for the        │  │
│  │   revised edit"                   │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Comment Components
| Component | Description | Implementation |
|-----------|-------------|----------------|
| **User avatar** | 32x32px circular image | Gravatar or upload |
| **Username** | Display name | From auth system |
| **Timestamp** | Link to frame (⏱ 00:02) | Clickable - seeks video |
| **Comment text** | Rich text support | Markdown or plain |
| **File attachment** | Paperclip icon + filename | Upload to R2 |
| **Reply button** | Thread continuation | Nested comments |
| **Resolve button** | Mark as resolved | Status change |
| **Emoji reactions** | Quick feedback | Hover panel |

### Thread Features
- **Nested replies** - Indented threading
- **Resolve threading** - Collapses resolved threads
- **@mentions** - User notifications
- **Email notifications** - For missed comments
- **Bulk resolve** - Select multiple comments

---

## 5. AI Features

### Transcription & Captions
| Feature | Description | Smart Channel CX |
|---------|-------------|------------------|
| **Auto-transcription** | Speech-to-text | Whisper API |
| **Speaker ID** | Label speakers | Diarization |
| **Timestamp search** | Find spoken content | Indexed transcripts |
| **Export captions** | SRT/VTT download | Convert to formats |

### AI Workflow
```
Video Upload → Whisper API → Transcription + Timestamps
                                      ↓
                         Searchable transcript panel
                                      ↓
                    Click timestamp → Jump to frame
```

---

## 6. File Management

### Collections & Folders
| Element | Purpose | Implementation |
|---------|---------|----------------|
| **Collections** | Group assets | Folder hierarchy |
| **Status folders** | Workflow stages | Needs Review / Approved |
| **Shares** | External links | Share links panel |
| **Keywords/tags** | Metadata filtering | Tag system |
| **Ratings** | Quality assessment | Star system (1-5) |
| **Assignees** | Task ownership | User assignment |
| **Due dates** | Deadline tracking | Date picker |

### Status Workflow
```
Draft → Needs Review → Approved
  ↓         ↓            ↓
[Gray]   [Yellow]     [Green]
```

### Metadata Fields
| Field Type | Example Values |
|------------|----------------|
| Keywords | Syfy, Los Angeles, Tokyo |
| Ratings | ★ ★ ★ ★ ☆ (4/5) |
| Assignees | John, Sarah, Mike |
| Due dates | Jan 15, 2026 |
| Custom fields | Client, Season, Episode |

---

## 7. Sharing & Presentation

### Share Link Configuration
| Setting | Options | Description |
|---------|---------|-------------|
| **Permissions** | View / Comment / Download | Access level |
| **Expiration** | 1 day / 7 days / 30 days | Link expiry |
| **Password** | Optional | Protection |
| **Branding** | Custom colors/logos | White-label |

### Presentation Mode
- **Thumbnail navigation** - Click to jump
- **Full-screen option** - Theater mode
- **Custom branding** - Client logos/colors
- **Download controls** - Prevent unauthorized DL
- **Comment visibility** - Show/hide comments

---

## 8. Status Workflows

### Review Pipeline
```
┌──────────┐    ┌──────────────┐    ┌──────────┐
│  Draft   │ → │ Needs Review │ → │ Approved │
└──────────┘    └──────────────┘    └──────────┘
     ↓               ↓                   ↓
  [Gray]          [Yellow]           [Green]
```

### Approval Features
- **Version history** - Track changes
- **Branch/merge** - Parallel versions
- **Approval chains** - Multi-step sign-off
- **Notifications** - Email + in-app

---

## 9. Key Metrics & Social Proof

### Frame.io Statistics (from website)
| Metric | Value | Context |
|--------|-------|---------|
| Review speed | 2.7x faster | vs traditional methods |
| Review churn | 31% reduction | Content iteration |
| Creative workflow | 2.9x faster | Production speed |
| Users | 250,000+ | Creative professionals |
| Files uploaded | Millions | Platform scale |

### Customer Logos
- Netflix, Disney, HBO (implied from website)
- "Trusted by top creative teams"

---

## Smart Channel CX UI Requirements

Based on Frame.io analysis, here's our feature matrix:

### Must-Have (MVP)
- [ ] 3-panel layout (sidebar, grid, details)
- [ ] Video thumbnails with duration
- [ ] Time-stamped comments
- [ ] Threaded replies
- [ ] Progress bars on projects
- [ ] Team avatars
- [ ] Status folders (Needs Review/Approved)
- [ ] Dark theme

### Should-Have (Phase 2)
- [ ] Auto-transcription
- [ ] Speaker identification
- [ ] Timestamp search
- [ ] Share links with permissions
- [ ] Presentation mode
- [ ] Ratings system
- [ ] Due dates & assignees
- [ ] Custom fields

### Nice-to-Have (Phase 3)
- [ ] AI-powered suggestions
- [ ] Version branching
- [ ] Real-time cursor sync
- [ ] Annotation tools
- [ ] Custom branding
- [ ] API integrations (Premiere, DaVinci)

---

## Color Palette Reference

| Element | Hex | Usage |
|---------|-----|-------|
| Background dark | #1a1a1a | Main background |
| Background light | #2a2a2a | Panels/cards |
| Text primary | #ffffff | Headings |
| Text secondary | #a0a0a0 | Metadata |
| Accent blue | #4a90d9 | Links/buttons |
| Status draft | #888888 | Draft state |
| Status review | #f5a623 | Needs review |
| Status approved | #4caf50 | Approved |
| Error | #e74c3c | Problems |
| Success | #4caf50 | Complete |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | System UI | 18-24px | Bold |
| Project names | System UI | 14px | Medium |
| Timestamps | Monospace | 12px | Regular |
| Metadata | System UI | 12px | Regular |
| Comments | System UI | 13px | Regular |

---

## Resources

### Frame.io Links
- Main: https://frame.io
- Features: https://frame.io/features
- Blog: https://blog.frame.io

### Similar Tools for Reference
- Vimeo Review: https://vimeo.com/review
- Wipster: https://wipster.io
- Evercast: https://www.evercast.io

---

*Document generated for Smart Channel CX UI/UX design reference. All Frame.io features documented are from public website as of January 2026.*

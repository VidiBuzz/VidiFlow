# Vidimail Build Plan - Agentic Implementation Guide

## Project Overview
**Product:** Vidimail (Smart Channel CX Module)  
**Group Feature:** Vidiblast  
**Reference:** Sendspark.com Analysis  
**Date:** February 1, 2026

---

## Executive Summary

Vidimail is a personalized video email platform integrated within Smart Channel CX. Based on Sendspark's proven model, Vidimail will enable users to record one video and automatically personalize it for thousands of recipients using AI technology.

---

## Core Features Matrix

| Feature | Sendspark Equivalent | Priority | Complexity | Timeline |
|---------|---------------------|----------|------------|----------|
| AI Video Personalization | Core Engine | P0 | High | 4 weeks |
| Bulk Contact Import | CSV/CRM Import | P0 | Medium | 2 weeks |
| Video Landing Pages | Branded Pages | P0 | Medium | 3 weeks |
| Email Delivery System | Send to Inbox | P0 | Medium | 2 weeks |
| Dynamic Backgrounds | Website/LinkedIn BG | P1 | High | 3 weeks |
| AI Voice Cloning | Voice Synthesis | P1 | High | 4 weeks |
| Visual Cloning | AI Avatar | P2 | Very High | 6 weeks |
| Analytics Dashboard | Engagement Tracking | P1 | Medium | 2 weeks |

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 18+ with TypeScript
- **State Management:** Zustand + React Query
- **UI Library:** TailwindCSS + Radix UI
- **Video Player:** Video.js with custom overlays
- **Build Tool:** Vite

### Backend Stack
- **Runtime:** Node.js 20+ with Express
- **Database:** PostgreSQL (primary) + Redis (cache/queue)
- **Queue System:** BullMQ for video processing
- **Storage:** Cloudflare R2 (S3-compatible)
- **AI Services:** 
  - **Persona Plex (NVIDIA)** - Voice synthesis and transcription (primary)
  - **Vidi AI Ranking Engine (Vespa AI)** - Content ranking and personalization
  - **Twelvelabs** - Intelligent video editing (advanced features)
  - HeyGen/D-ID (visual cloning)
  - Replicate (background removal)

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (production)
- **CDN:** Cloudflare
- **Monitoring:** Datadog + Sentry

---

## Implementation Phases

### Phase 1: Core MVP (Weeks 1-4)
**Goal:** Basic video recording, personalization, and email delivery

#### Week 1: Foundation
- [ ] Project setup (monorepo structure)
- [ ] Database schema design
- [ ] Authentication system
- [ ] Basic video upload/playback

#### Week 2: Personalization Engine
- [ ] Text-to-speech integration
- [ ] Variable substitution system ({{firstName}}, {{company}})
- [ ] Video rendering pipeline
- [ ] Basic landing page template

#### Week 3: Contact Management
- [ ] CSV import functionality
- [ ] Contact list UI
- [ ] Bulk selection interface
- [ ] CRM integration hooks

#### Week 4: Email Delivery
- [ ] Email template system
- [ ] SMTP/API integration (SendGrid/AWS SES)
- [ ] Delivery tracking
- [ ] Basic analytics

**Deliverable:** Working MVP with single video personalization

---

### Phase 2: AI Enhancement (Weeks 5-8)
**Goal:** Advanced AI features and dynamic content

#### Week 5: Voice Synthesis (Persona Plex)
- [ ] **Persona Plex (NVIDIA)** API integration
- [ ] Voice training workflow
- [ ] Voice selection UI
- [ ] Audio synchronization
- [ ] Emotional tone adjustment
- [ ] Multilingual support (30+ languages)

#### Week 6: Dynamic Backgrounds
- [ ] Website screenshot API (Puppeteer)
- [ ] LinkedIn profile integration
- [ ] Background removal AI
- [ ] Video compositing engine

#### Week 7: Advanced Landing Pages
- [ ] Landing page builder (drag-and-drop)
- [ ] CTA builder
- [ ] Template system
- [ ] A/B testing framework

#### Week 8: Bulk Generation
- [ ] Queue optimization
- [ ] Batch processing
- [ ] Progress tracking
- [ ] Error handling & retries

**Deliverable:** AI-enhanced platform with voice cloning and dynamic backgrounds

---

### Phase 3: Advanced Features (Weeks 9-12)
**Goal:** Visual cloning, deep integrations, and enterprise features

#### Week 9-10: Visual Cloning & Vidi AI Integration
- [ ] Avatar training system
- [ ] Lip-sync technology
- [ ] Gesture synthesis
- [ ] Quality optimization
- [ ] **Vidi AI Ranking Engine (Vespa AI)** integration
- [ ] Systematic content governance implementation
- [ ] Search-result-driven personalization
- [ ] On-the-fly content finishing pipeline

#### Week 11: CRM Deep Integration
- [ ] Salesforce connector
- [ ] HubSpot integration
- [ ] API webhooks
- [ ] Data sync automation

#### Week 12: Analytics & Advanced Video Editing
- [ ] Advanced analytics dashboard
- [ ] Engagement tracking
- [ ] Conversion attribution
- [ ] AI-powered recommendations
- [ ] **Twelvelabs** intelligent video editing (optional)
  - Auto-cut and scene detection
  - Smart transitions
  - Highlight extraction
  - Caption generation

**Deliverable:** Enterprise-ready platform with full AI capabilities

---

## Agentic Implementation Tasks

### Autonomous Agents Required

#### 1. Video Processing Agent
**Purpose:** Handle video upload, processing, and rendering
**Tasks:**
- Transcode uploaded videos to standard formats
- Extract audio for voice cloning
- Apply dynamic backgrounds
- Render personalized versions
- Quality assurance checks

**Decision Points:**
- Resolution optimization based on use case
- Format selection (MP4/WebM) based on browser
- Compression level based on file size constraints

#### 2. Personalization Agent
**Purpose:** Generate personalized content for each recipient
**Tasks:**
- Parse contact data for variables
- Generate TTS audio for each name
- Synthesize personalized introductions
- Apply visual customizations
- Assemble final video

**Decision Points:**
- Fallback handling for missing data
- Pronunciation validation
- Variation selection for bulk campaigns

#### 3. Delivery Agent
**Purpose:** Handle email delivery and tracking
**Tasks:**
- Compose personalized emails
- Manage delivery queues
- Handle bounces and retries
- Track opens and clicks
- Update analytics in real-time

**Decision Points:**
- Send time optimization
- Throttling based on reputation
- Retry logic for failures

#### 4. Background Intelligence Agent
**Purpose:** Generate dynamic backgrounds
**Tasks:**
- Capture website screenshots
- Fetch LinkedIn profile data
- Apply AI background removal
- Composite video layers
- Optimize for performance

**Decision Points:**
- Cache strategy for repeated domains
- Privacy compliance checks
- Image quality vs. speed trade-offs

---

## Database Schema

### Core Tables

```sql
-- Users & Teams
users (id, email, name, team_id, created_at)
teams (id, name, plan, settings, created_at)

-- Videos
videos (id, user_id, title, original_url, status, duration, created_at)
video_templates (id, video_id, name, variables, created_at)

-- Contacts
contacts (id, team_id, email, first_name, last_name, company, role, linkedin_url, website, custom_data, created_at)
lists (id, team_id, name, created_at)
list_contacts (list_id, contact_id)

-- Campaigns
campaigns (id, team_id, name, video_id, template_id, status, created_at)
campaign_recipients (id, campaign_id, contact_id, personalized_video_url, status, sent_at, opened_at, clicked_at)

-- Landing Pages
landing_pages (id, campaign_id, header, message, cta_text, cta_url, branding_settings, created_at)

-- Analytics
events (id, campaign_recipient_id, event_type, metadata, created_at)
daily_stats (team_id, date, videos_sent, emails_opened, clicks, meetings_booked)
```

---

## API Design

### Core Endpoints

```
POST   /api/videos                     # Upload new video
GET    /api/videos/:id                 # Get video details
POST   /api/videos/:id/personalize     # Generate personalized versions

POST   /api/contacts/import            # Bulk import contacts
GET    /api/contacts                   # List contacts
PUT    /api/contacts/:id               # Update contact

POST   /api/campaigns                  # Create campaign
POST   /api/campaigns/:id/send         # Send campaign
GET    /api/campaigns/:id/analytics    # Get campaign stats

POST   /api/email/send                 # Send single video email
POST   /api/webhook/email-events       # Receive email events

GET    /api/landing-pages/:id          # Get landing page (public)
POST   /api/landing-pages              # Create landing page
```

---

## Security & Compliance

### Data Protection
- [ ] GDPR compliance (data deletion, portability)
- [ ] CCPA compliance
- [ ] SOC 2 Type II preparation
- [ ] End-to-end encryption for videos
- [ ] Secure API authentication (JWT + refresh tokens)

### Privacy
- [ ] Consent management for video recording
- [ ] Data retention policies
- [ ] Audit logging
- [ ] PII data masking in logs

---

## Testing Strategy

### Automated Testing
- **Unit Tests:** Jest (80%+ coverage target)
- **Integration Tests:** Supertest for API
- **E2E Tests:** Playwright for critical user flows
- **Visual Regression:** Chromatic/Storybook

### Performance Testing
- Load testing for bulk generation (k6)
- Video processing benchmarks
- Email delivery rate testing

---

## Deployment Strategy

### Environments
1. **Development:** Local Docker Compose
2. **Staging:** Kubernetes cluster (manual deploys)
3. **Production:** Kubernetes with auto-scaling

### CI/CD Pipeline
1. GitHub Actions for testing
2. Build containers on merge to main
3. Deploy to staging automatically
4. Production deploys require approval

### Monitoring
- Application performance (Datadog APM)
- Error tracking (Sentry)
- Video processing metrics
- Email delivery rates
- User engagement analytics

---

## Success Metrics

### Technical KPIs
- Video processing time: < 30 seconds per video
- Email delivery rate: > 95%
- Uptime: 99.9% SLA
- API response time: < 200ms (p95)

### Business KPIs
- Videos sent per user: Target 100/month
- Open rate: Target 40%+ (vs 20% industry avg)
- Click-through rate: Target 15%+
- Conversion to meeting: Target 5%+

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI service downtime | High | Fallback to standard TTS, multiple providers |
| Video processing overload | High | Queue-based processing, auto-scaling |
| Email deliverability | High | Reputation monitoring, throttling, SPF/DKIM |
| Data privacy breach | Critical | Encryption, audit logs, compliance reviews |
| Cost overruns | Medium | Usage limits, caching, optimization |

---

## Resource Requirements

### Team
- 2x Full-stack Engineers
- 1x AI/ML Engineer
- 1x DevOps Engineer
- 1x Product Manager
- 1x UX/UI Designer

### Infrastructure (Monthly Estimates)
- Compute: $2,000 (Kubernetes cluster)
- Storage: $500 (R2/S3)
- AI Services: $3,000 (ElevenLabs, etc.)
- Email Delivery: $1,000 (SendGrid)
- CDN: $500 (Cloudflare)
- **Total: ~$7,000/month** (at scale)

---

## Next Steps

1. **Week 0:** Architecture review and tech stack finalization
2. **Week 0:** Design system creation (based on Sendspark analysis)
3. **Week 1:** Begin Phase 1 development
4. **Ongoing:** Weekly sprint reviews with stakeholders

---

## Reference Materials
- UI Reference: `SENDSPARK_UI_REFERENCE.html`
- Screenshots: `images/sendspark/` (12 captures)
- API Docs: (to be created)
- Design System: (to be created)

---

**Document Owner:** Product Team  
**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation

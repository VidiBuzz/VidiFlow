# VidiCity.net Full Site Upgrade - Architecture Plan
## AI-Powered Community with Hyperlocal Visual Vector Search

**Version:** 1.0  
**Date:** February 2026  
**Scope:** 10 Cities MVP with 100 Creators (10 per city)

---

## Executive Summary

This document outlines the complete architectural blueprint for upgrading VidiCity.net from a static hyperlocal video directory into an AI-powered community platform with visual vector search capabilities. The platform will support tiered user profiles (Viewers → Creators → Premium Businesses), each with video landing pages and AI-enhanced discoverability.

### Core Value Propositions
1. **Visual Vector Search** - Find businesses/videos by uploading an image or describing visual content
2. **AI-Powered Discovery** - Smart recommendations based on visual similarity + location
3. **Video-First Profiles** - Every company gets a dedicated video landing page
4. **Hyperlocal Community** - City-focused content with 10-cities MVP expanding to 33,000

---

## System Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend["Next.js 15 Frontend"]
        A[Web App - Next.js App Router]
        B[3D Visualization - Three.js]
        C[Video Player - Custom HLS]
        D[Search UI - Instant Results]
    end
    
    subgraph Backend["API Layer - FastAPI"]
        E[REST API Gateway]
        F[Vector Search API]
        G[AI Processing Pipeline]
        H[WebSocket Server]
    end
    
    subgraph Data["Data Layer"]
        I[Qdrant - Vector DB]
        J[Neo4j - Knowledge Graph]
        K[Supabase - Auth & Metadata]
        L[Cloudflare R2 - Media Storage]
    end
    
    subgraph AI["AI Services"]
        M[CLIP/Jina - Image Embeddings]
        N[Twelve Labs/Gemini - Video Embeddings]
        O[Gemini Pro - Content Gen]
        P[Whisper - Transcription]
    end
    
    A --> E
    A --> B
    A --> C
    A --> D
    E --> F
    E --> G
    E --> H
    F --> I
    F --> J
    G --> AI
    K --> E
    L --> C
    I --> F
    J --> F
```

---

## Detailed Component Design

### 1. Keycloak SSO Architecture (NEW)

**Why Keycloak:**
- Enterprise-grade identity management
- Self-hosted (data sovereignty)
- Flexible federation (SAML, OIDC, LDAP)
- Role-based access control (RBAC)
- Session management & centralized logout

**Keycloak Architecture:**

```mermaid
flowchart TB
    subgraph Keycloak["Keycloak SSO Server"]
        A[Realm: VidiCity-Production]
        B[Realm: VidiCity-Staging]
        C[Identity Providers]
        D[User Federation]
        E[Client Registrations]
    end
    
    subgraph IdPs["Identity Providers"]
        F[Google OAuth]
        G[Apple Sign-In]
        H[Enterprise SAML]
        I[LDAP/AD]
    end
    
    subgraph Clients["Client Applications"]
        J[Next.js Web App]
        K[FastAPI Backend]
        L[Mobile App]
    end
    
    subgraph Data["Keycloak Data"]
        M[PostgreSQL - Keycloak DB]
        N[Redis - Sessions]
    end
    
    A --> C
    C --> F
    C --> G
    C --> H
    C --> I
    A --> E
    E --> J
    E --> K
    E --> L
    A --> D
    A --> M
    A --> N
```

**Keycloak Configuration:**

| Setting | Value |
|---------|-------|
| Realms | VidiCity-Production, VidiCity-Staging |
| Protocol | OpenID Connect (OIDC) |
| Flow | Authorization Code + PKCE |
| Tokens | JWT (RS256), 15-min access, 30-day refresh |
| MFA | TOTP (optional), WebAuthn (future) |
| Custom Attributes | tier, city_id, onboarding_status |

**User Profile Data Flow (Keycloak + PostgreSQL):**

```typescript
// Keycloak stores: identity, auth tokens, roles
interface KeycloakUser {
  id: string;           // UUID from Keycloak
  username: string;
  email: string;
  email_verified: boolean;
  realm_roles: ['viewer', 'creator', 'business'];
  client_roles: ['premium', 'verified'];
  attributes: {
    tier: 'viewer' | 'creator' | 'business';
    city_id: string;
    onboarding_status: 'incomplete' | 'complete';
  };
}

// PostgreSQL stores: profile data, preferences, analytics
interface UserProfile {
  keycloak_id: string;  // Foreign key to Keycloak
  display_name: string;
  avatar_url: string;
  bio: string;
  social_links: SocialLinks;
  preferences: UserPreferences;
  analytics: UserAnalytics;
  created_at: Date;
  updated_at: Date;
}
```

**SSO Integration Flow:**

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js App
    participant Keycloak
    participant API as FastAPI Backend
    participant DB as PostgreSQL

    User->>NextJS: Click "Sign In"
    NextJS->>Keycloak: Redirect to login
    
    alt New User
        Keycloak->>Keycloak: Show registration form
        Keycloak->>Keycloak: Create user with tier attribute
        Keycloak->>NextJS: Redirect with auth code
    else Existing User
        Keycloak->>Keycloak: Validate credentials
        Keycloak->>NextJS: Redirect with auth code
    end
    
    NextJS->>Keycloak: Exchange code for tokens
    Keycloak-->>NextJS: Access + Refresh tokens
    
    NextJS->>API: Request with Bearer token
    API->>Keycloak: Validate JWT signature
    Keycloak-->>API: Token valid + user info
    API->>DB: Fetch user profile (keycloak_id)
    DB-->>API: Profile data
    API-->>NextJS: Response with user data
```

---

### 2. User Profile System (Tiered)

```mermaid
flowchart LR
    A[Unauthenticated Visitor] --> B[Free Viewer Account]
    B --> C[Creator Account]
    C --> D[Premium Business]
    
    B -->|Can| B1[View Content]
    B -->|Can| B2[Search & Filter]
    B -->|Can| B3[Follow Creators]
    
    C -->|Can| C1[Upload Videos/Images]
    C -->|Can| C2[Create Landing Pages]
    C -->|Can| C3[Basic Analytics]
    
    D -->|Can| D1[Custom Domain]
    D -->|Can| D2[Advanced CTAs]
    D -->|Can| D3[Priority Search Ranking]
    D -->|Can| D4[API Access]
```

**Profile Data Schema (PostgreSQL, synced with Keycloak):**
```typescript
interface UserProfile {
  id: string;                    // UUID
  tier: 'viewer' | 'creator' | 'business';
  display_name: string;
  avatar_url: string;
  bio: string;
  city_id: string;              // Foreign key to cities
  location: { lat: number; lng: number };
  social_links: SocialLinks;
  analytics: {
    views: number;
    followers: number;
    engagement_rate: number;
  };
  created_at: Date;
  updated_at: Date;
}
```

---

### 2. Video Landing Pages

**Page Structure:**
```
/company/[slug]
├── Hero Section
│   ├── Auto-playing background video (muted)
│   ├── Company logo + name
│   ├── Primary CTA (Contact/Book/Visit)
│   └── City badge with location
├── Video Gallery
│   ├── Featured video (large)
│   ├── Video grid (thumbnails)
│   └── Chapter navigation
├── About Section
│   ├── Rich text description
│   ├── Business hours
│   └── Services/tags
├── Contact/CTA Section
│   ├── Contact form
│   ├── Map embed
│   └── Social links
└── Related Content
    ├── Similar businesses (vector match)
    └── More from this city
```

**Video Upload Pipeline:**
```mermaid
flowchart LR
    A[User Upload] --> B[Cloudflare R2]
    B --> C[FFmpeg Processing]
    C --> D[HLS Segments]
    C --> E[Thumbnails]
    D --> F[Qdrant Vector DB]
    E --> G[AI Analysis]
    G --> H[Auto-tags/Entities]
    H --> I[Neo4j Knowledge Graph]
```

---

### 3. Video Reviews System (NEW - Native Feature)

**Overview:**
Video reviews are a first-class citizen in VidiCity - not an add-on. Users record video testimonials, demonstrations, or feedback about businesses, creating an authentic, visual review ecosystem.

**Review Architecture:**

```mermaid
flowchart TB
    subgraph Recording["Review Recording"]
        A[Webcam Recording]
        B[Screen Recording]
        C[File Upload]
    end
    
    subgraph Storage["Review Storage"]
        D[Cloudflare R2]
        E[Review Metadata DB]
    end
    
    subgraph Processing["Processing"]
        F[AI Moderation]
        G[Sentiment Analysis]
        H[Transcription]
        I[Vector Embedding]
    end
    
    subgraph Display["Display"]
        J[Review Carousel]
        K[Business Review Tab]
        L[Trending Reviews]
    end
    
    subgraph Engagement["Engagement"]
        M[Owner Response]
        N[Helpful/Not Helpful]
        O[Report Review]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    J --> M
    J --> N
    J --> O
```

**Review Types:**

| Type | Description | Example |
|------|-------------|---------|
| **Testimonial** | Customer experience story | "I loved the service at Joe's Pizza..." |
| **Demo** | Product/service demonstration | Showing how a bike repair was done |
| **Walkthrough** | Venue/business tour | Walking through a restaurant space |
| **Comparison** | Side-by-side comparison | "This salon vs. that salon" |
| **Response** | Owner responding to feedback | Addressing a customer concern |

**Review Data Model (PostgreSQL):**

```typescript
interface VideoReview {
  id: string;                    // UUID
  business_id: string;           // Foreign key to business
  reviewer_id: string;           // Foreign key to user (Keycloak ID)
  
  // Review Content
  title: string;                 // Review headline
  video_url: string;             // R2 URL to HLS playlist
  thumbnail_url: string;         // AI-generated thumbnail
  duration: number;              // Video length in seconds
  transcript: string;            // Auto-generated transcript
  
  // Metadata
  review_type: 'testimonial' | 'demo' | 'walkthrough' | 'comparison' | 'response';
  rating: number;                // 1-5 stars (optional for video)
  visit_date?: Date;             // When they visited
  verified_purchase: boolean;    // Did they actually buy/service?
  
  // AI Processing Results
  sentiment_score: number;       // -1 to 1 (negative to positive)
  keywords: string[];            // Extracted topics/entities
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_reason?: string;    // If rejected/flagged
  
  // Vector search (Qdrant)
  vector_id: string;             // Reference to Qdrant vector
  
  // Engagement
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  owner_response?: {
    text: string;
    responded_at: Date;
    video_url?: string;          // Owner can respond with video too
  };
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  published_at?: Date;           // When it went live
}
```

**Review Recording Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Browser as Browser (MediaRecorder)
    participant NextJS as Next.js
    participant API as FastAPI
    participant R2 as Cloudflare R2
    participant Q as Queue
    participant AI as AI Pipeline

    User->>NextJS: Click "Write a Review"
    NextJS->>User: Show recording options
    
    alt Live Recording
        User->>Browser: Grant camera/mic permissions
        User->>Browser: Start recording
        Browser->>Browser: Record WebM chunks
        User->>Browser: Stop recording
        Browser->>Browser: Compile to MP4
    else File Upload
        User->>NextJS: Select video file
    end
    
    NextJS->>API: Initiate upload (get signed URL)
    API->>NextJS: Return presigned R2 URL
    NextJS->>R2: Upload review video
    R2->>NextJS: Upload complete
    
    NextJS->>API: Submit review metadata
    API->>API: Validate user tier (reviewers must be registered)
    API->>DB: Save review (status: pending)
    API->>Q: Queue AI processing
    API->>User: "Review submitted for moderation"
    
    par AI Processing
        AI->>AI: Content moderation (safety)
        AI->>AI: Sentiment analysis
        AI->>AI: Generate transcript
        AI->>AI: Create thumbnail
        AI->>AI: Extract keywords/entities
    end
    
    AI->>API: Processing complete
    API->>DB: Update review (status: approved/rejected)
    
    alt Approved
        API->>NextJS: WebSocket - review published
        NextJS->>User: "Your review is live!"
    else Rejected
        API->>User: Email notification with reason
    end
```

**Review Display Components:**

```
Business Landing Page - Reviews Tab
├── Review Summary Card
│   ├── Average rating (if text reviews)
│   ├── Total review count
│   ├── Sentiment distribution chart
│   └── "Write a Review" CTA
│
├── Featured Video Review (pinned by owner)
│   └── Large player with business response
│
├── Review Filters
│   ├── Type: All | Testimonials | Demos | Walkthroughs
│   ├── Rating: 5★ | 4★ | 3★ | 2★ | 1★
│   ├── Verified only toggle
│   └── Sort: Recent | Helpful | Positive | Critical
│
└── Review Grid/Carousel
    └── Review Card:
        ├── Reviewer avatar + name
        ├── Video thumbnail (plays on hover)
        ├── Title + excerpt
        ├── Rating stars
        ├── "Verified" badge
        ├── Engagement: Helpful / Not Helpful
        ├── Owner response (if exists)
        └── Report button
```

**Owner Response System:**

```typescript
interface OwnerResponse {
  review_id: string;
  owner_id: string;
  
  // Response can be text OR video
  response_type: 'text' | 'video';
  text_content?: string;
  video_url?: string;
  video_duration?: number;
  
  // Metadata
  responded_at: Date;
  is_public: boolean;
  
  // Engagement
  helpful_count: number;
}
```

**Review Moderation Dashboard (Admin):**

```
/admin/reviews
├── Queue Overview
│   ├── Pending: 23
│   ├── Approved Today: 156
│   ├── Flagged: 8
│   └── Rejected (This Week): 12
│
├── Review Queue
│   ├── Review card with video player
│   ├── AI confidence scores (safety, sentiment)
│   ├── Auto-transcript
│   ├── Quick actions: Approve / Reject / Flag / Escalate
│   └── Bulk actions
│
└── Moderation Settings
    ├── Auto-approve threshold (AI confidence > 0.9)
    ├── Prohibited content rules
    ├── Reviewer reputation scores
    └── Appeal process
```

**Review Vector Search (Unique Feature):**

Users can search within reviews:
- "Show me reviews mentioning 'outdoor seating'"
- "Find reviews about 'birthday celebrations'"
- Visual search: "Reviews with similar vibes to this"

Qdrant vectors include:
- Video embedding (Twelve Labs)
- Transcript text embedding (BGE-M3)
- Combined multimodal embedding

---

### 4. Visual Vector Search Engine

**Architecture:**

```mermaid
flowchart TB
    subgraph SearchTypes["Search Modalities"]
        A[Text Query]
        B[Image Upload]
        C[Video Upload]
        D[Map Selection]
    end
    
    subgraph Processing["Embedding Pipeline"]
        E[Text Encoder<br/>BGE-M3 / GTE]
        F[Image Encoder<br/>CLIP / Jina]
        G[Video Encoder<br/>Twelve Labs / Gemini]
    end
    
    subgraph Retrieval["Hybrid Retrieval"]
        H[Vector Search<br/>Qdrant ANN]
        I[Graph Traversal<br/>Neo4j]
        J[Geospatial Filter<br/>PostGIS]
    end
    
    subgraph Ranking["Reranking"]
        K[Cross-encoder<br/>ColBERT]
        L[Business Rules<br/>Premium Boost]
        M[Diversity Filter]
    end
    
    A --> E
    B --> F
    C --> G
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
```

**Vector Dimensions by Content Type:**
- **Text:** 768-1024 dimensions (BGE-M3)
- **Images:** 512-768 dimensions (CLIP)
- **Videos:** 1408-3072 dimensions (Twelve Labs)
- **Combined multimodal:** 1536-2048 dimensions (late fusion)

**Query Flow:**
1. User inputs query (text/image/location)
2. Convert to embedding vector
3. ANN search in Qdrant (top 100 candidates)
4. Filter by geospatial radius (if location provided)
5. Expand via Neo4j graph (related entities)
6. Rerank with cross-encoder
7. Return top 20 results with metadata

---

### 4. 3D Vector Visualization Dashboard

**Purpose:** Allow users to "see" the content universe of a city in 3D space

```mermaid
flowchart TB
    A[3D Vector Space] --> B[Content Clusters]
    B --> C[Food & Dining]
    B --> D[Services]
    B --> E[Retail]
    B --> F[Entertainment]
    
    G[User Interaction] --> H[Zoom/Pan/Rotate]
    G --> I[Hover for Preview]
    G --> J[Click to Navigate]
    
    K[Live Updates] --> L[New Content Appears]
    K --> M[Real-time Animation]
```

**Tech Stack:**
- **Three.js** for WebGL rendering
- **UMAP** for dimensionality reduction (project to 3D)
- **Force-directed graph** for relationship visualization
- **WebSockets** for live updates

**Features:**
- Each video/image is a point in 3D space
- Similar content clusters together
- Color-coded by category/business type
- Hover shows thumbnail preview
- Click navigates to landing page
- New uploads animate in real-time

---

### 5. AI-Powered Features

#### 5.1 Smart Video Thumbnails
```
Input: Video file
Process: 
  1. Extract keyframes every 5 seconds
  2. Run quality scoring (blur, lighting, composition)
  3. Detect faces/products (if applicable)
  4. Generate AI-enhanced thumbnail
  5. A/B test variants
Output: 3 thumbnail options + auto-selected default
```

#### 5.2 Auto-Tagging & Entity Extraction
```
Input: Video frames + audio transcript
Process:
  1. Vision model analyzes frames (objects, scenes, actions)
  2. NLP extracts entities from transcript
  3. Gemini generates descriptive tags
  4. Confidence scoring per tag
Output: 
  - Visual tags: ["restaurant", "outdoor seating", "dinner"]
  - Entity tags: ["Italian cuisine", "date night", "patio"]
  - Sentiment: Positive
```

#### 5.3 Visual Similarity Recommendations
```
User views: "Joe's Pizza" video
System:
  1. Get vector embedding of viewed video
  2. Find nearest neighbors in same city
  3. Filter by business type similarity
  4. Boost if premium subscriber
  5. Diverse results (not all pizza)
Output: "You might also like: [Italian places], [casual dining], [family restaurants]"
```

---

## City-Based Architecture

### City Entity Model (Neo4j)

```cypher
// City node
CREATE (c:City {
  id: 'nyc',
  name: 'New York City',
  state: 'NY',
  country: 'USA',
  center: point({latitude: 40.7128, longitude: -74.0060}),
  population: 8400000,
  timezone: 'America/New_York'
})

// Business profile in city
CREATE (b:Business {
  id: 'joes-pizza-nyc',
  name: "Joe's Pizza",
  slug: 'joes-pizza-nyc',
  tier: 'premium',
  location: point({latitude: 40.7580, longitude: -73.9855})
})

// Relationships
CREATE (b)-[:LOCATED_IN]->(c)
CREATE (b)-[:SERVES]->(:Category {name: 'Italian Restaurant'})
CREATE (b)-[:HAS_VIDEO]->(:Video {id: 'vid-123', title: 'Best Slice in NYC'})
```

### City Landing Page

**URL Structure:**
```
/city/[city-slug]
├── Hero: City skyline image + tagline
├── Featured Creators (10 per city)
├── Trending Content (this week)
├── Categories Grid (Food, Services, Retail, etc.)
├── Map View (all businesses pinned)
├── Recent Uploads (live feed)
└── Join CTA (for new creators)
```

---

## Technical Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + React 19 | SSR, App Router, React Server Components |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development |
| **3D/Viz** | Three.js + React Three Fiber | Vector space visualization |
| **Video** | hls.js + custom player | HLS streaming, chapters |
| **Backend** | FastAPI (Python) | High-performance API |
| **Vector DB** | Qdrant | Visual similarity search |
| **Graph DB** | Neo4j AuraDB | Relationships, knowledge graph |
| **Auth/SSO** | Keycloak | Single sign-on, identity management |
| **Auth DB** | PostgreSQL | User accounts, profiles (synced with Keycloak) |
| **Media Storage** | Cloudflare R2 | Video/image CDN |
| **Caching** | Cloudflare Workers | Edge caching, rate limiting |
| **AI Models** | Gemini Pro, CLIP, Whisper | Embeddings, generation |
| **Queue** | Redis + Celery | Async video processing |

---

## Data Flow Architecture

### Video Upload Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as FastAPI
    participant R2 as Cloudflare R2
    participant Q as Queue (Redis)
    participant W as Worker
    participant Qdrant as Qdrant
    participant Neo4j as Neo4j

    U->>F: Select video file
    F->>API: Initiate upload (get signed URL)
    API->>F: Return presigned R2 URL
    F->>R2: Direct upload to storage
    R2->>F: Upload complete
    F->>API: Confirm upload (metadata)
    API->>Q: Queue processing job
    API->>U: Return "processing"
    
    par Video Processing
        W->>R2: Download source video
        W->>W: FFmpeg transcode to HLS
        W->>R2: Upload segments
    and Thumbnail Generation
        W->>W: Extract keyframes
        W->>W: AI quality scoring
    and Embedding Generation
        W->>W: Twelve Labs embed video
        W->>Qdrant: Store vector + metadata
    and Knowledge Graph
        W->>W: Extract entities (Gemini)
        W->>Neo4j: Create nodes/relationships
    end
    
    W->>API: Processing complete
    API->>F: WebSocket notification
    F->>U: "Video ready!"
```

### Search Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as FastAPI
    participant Qdrant as Qdrant
    participant Neo4j as Neo4j
    participant Gemini as Gemini

    U->>F: Upload image or type query
    F->>API: Search request
    
    alt Image Query
        API->>API: CLIP encode image
    else Text Query
        API->>API: BGE-M3 encode text
    end
    
    API->>Qdrant: ANN search (top 100)
    Qdrant-->>API: Candidate IDs + scores
    
    API->>Neo4j: Expand graph (related entities)
    Neo4j-->>API: Related content IDs
    
    API->>API: Merge + deduplicate results
    API->>API: Geospatial filter (if city set)
    API->>API: Business rules (premium boost)
    API->>API: Diversity ranking
    
    API->>F: Top 20 results + metadata
    F->>U: Display search results
```

---

## Security Considerations

### Authentication & Authorization (Keycloak)
- **Keycloak** as central SSO identity provider
- Self-hosted for data sovereignty
- JWT tokens (RS256) with 15-min access, 30-day refresh
- Role-based access control (RBAC) via Keycloak realm + client roles
- Identity federation: Google, Apple, Enterprise SAML, LDAP/AD
- Session management with Redis caching
- Centralized logout (all sessions terminated on password change)
- Account linking (merge Google + email accounts)

**Keycloak Security Hardening:**
- Brute force protection (temp lock after 5 failed attempts)
- SSL/TLS enforced for all endpoints
- Confidential clients for backend services
- PKCE for public clients (mobile, SPA)
- Regular security audits of Keycloak configuration
- Backup realm configurations to Git

**FastAPI Token Validation:**
```python
# Keycloak JWT validation middleware
from keycloak import KeycloakOpenID

keycloak_openid = KeycloakOpenID(
    server_url="https://auth.vidicity.com",
    client_id="vidicity-api",
    realm_name="VidiCity-Production",
    client_secret_key="..."
)

# Verify token on each request
token_info = keycloak_openid.introspect(token)
if not token_info['active']:
    raise HTTPException(status_code=401)
```

### Video Content Safety
- AWS Rekognition or Google Vision for content moderation
- Automated scanning: nudity, violence, hate symbols
- User reporting system
- Admin review queue for flagged content
- Rate limiting on uploads (prevent spam)

### API Security
- Cloudflare WAF for DDoS protection
- Rate limiting per user/IP
- Input validation (Pydantic schemas)
- CORS configuration
- API key management for business tier

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load (First Contentful Paint) | < 1.5s | With 3D hero disabled on mobile |
| Video Start Time | < 2s | From click to first frame |
| Search Response | < 300ms | Vector search + reranking |
| Upload Processing | < 3 min | For 5-minute 1080p video |
| 3D Viz Frame Rate | 60fps | Desktop, 30fps minimum |
| Concurrent Users | 1000+ | Per city during peak |

---

## Cost Estimation (Monthly - 10 Cities)

| Service | Estimated Cost | Notes |
|---------|---------------|-------|
| Cloudflare R2 | $50-100 | 1TB storage, 5TB egress |
| Qdrant Cloud | $50-150 | 10K vectors, light queries |
| Neo4j AuraDB | $65 | 1GB RAM, production tier |
| PostgreSQL (Keycloak + App) | $50 | Managed DB for Keycloak + app data |
| Keycloak Hosting | $50 | Docker on Railway/ECS or self-hosted |
| Redis (Sessions) | $15 | Keycloak session cache |
| Railway/Render | $100 | FastAPI + workers |
| Gemini API | $100-200 | 10K video analyses |
| Twelve Labs | $100 | Video embeddings |
| **Video Reviews** | $75 | Review processing, storage, AI moderation |
| **Total** | **$670-950/month** | Scales with usage |

*Note: Video reviews add ~$75/month for processing (AI moderation, transcription, thumbnails) and additional storage.*

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Infrastructure setup (DBs, storage, API)
- Authentication system
- Basic profile pages

### Phase 2: Video Platform (Weeks 3-4)
- Upload pipeline
- Video landing pages
- Basic search (text only)

### Phase 3: Visual Search (Weeks 5-6)
- Vector database integration
- Image similarity search
- 3D visualization prototype

### Phase 4: AI Features (Weeks 7-8)
- Auto-tagging
- Smart thumbnails
- Recommendations

### Phase 5: City Expansion (Weeks 9-10)
- City landing pages
- Geospatial features
- Creator onboarding flow

### Phase 6: Polish & Launch (Weeks 11-12)
- Performance optimization
- Security audit
- Beta testing with 100 creators

---

## Future Expansion Path

### Phase 2: Scale to 100 Cities
- Multi-region deployment
- Sharded vector database
- Edge caching optimization

### Phase 3: Advanced AI
- Real-time video editing
- AI-generated video summaries
- Automated highlight reels
- Voice cloning for accessibility

### Phase 4: Ecosystem
- Mobile apps (iOS/Android)
- API marketplace
- Third-party integrations
- White-label solution

---

## Appendix: Existing VidiSmart Integration Points

The following existing infrastructure will be leveraged:

1. **ai-proxy.php** - Extend for video analysis APIs
2. **SmartChannel CX** - Customer experience foundation
3. **Vector Database docs** - Implementation patterns
4. **3D Visual Knowledge Graph** - Visualization techniques
5. **VidiTwin** - Digital avatar integration potential

---

## Conclusion

This architecture provides a scalable, AI-native foundation for the VidiCity community platform. The visual vector search differentiates it from traditional business directories, while the tiered profile system enables sustainable monetization. Starting with 10 cities allows for rapid iteration before scaling to the full 33,000-city vision.

**Next Steps:**
1. Review and approve architecture
2. Begin Phase 1 implementation
3. Recruit first 100 creators (10 per city)
4. Set up staging environment for testing

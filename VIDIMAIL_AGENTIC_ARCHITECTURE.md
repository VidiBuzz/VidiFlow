# Vidimail Agentic Architecture & Smart Stack Integration

## Executive Overview

This document defines the complete technical architecture for Vidimail within Smart Channel CX, including data flows, Smart Stack components, Visual Vector Omni Search integration, and SmartGen-powered faceted video creation.

### Core AI Technologies
- **Vidi AI Ranking Engine**: Built on Vespa AI (Yahoo/Spotify/Perplexity proven architecture)
- **Voice Transcription**: Persona Plex from NVIDIA (replacing ElevenLabs)
- **Intelligent Video Editing**: Twelvelabs API (potential integration for advanced editing)
- **Content Personalization**: Real-time search-result-driven content generation

### Smart Channel CX Integration
Vidimail is governed by the Vidi AI systematic content ranking engine, which orchestrates:
- Email content personalization based on user search results
- On-the-fly content finishing processes
- Complete custom content per email recipient
- Integration with Smart Stack knowledge graph and Visual Vector systems

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SMART CHANNEL CX PLATFORM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   VIDIMAIL   │  │  SMARTGEN    │  │  VISUAL      │  │   OMNI       │    │
│  │   MODULE     │◄─┤   ENGINE     │◄─┤  VECTOR      │◄─┤   SEARCH     │    │
│  │              │  │              │  │  KNOWLEDGE   │  │   LAYER      │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘  └──────────────┘    │
│         │                                    │                              │
│         └────────────────────────────────────┘                              │
│                         │                                                   │
│              ┌──────────┴──────────┐                                        │
│              │   SMART STACK       │                                        │
│              │   DATA LAYER        │                                        │
│              └──────────┬──────────┘                                        │
│                         │                                                   │
│    ┌────────────────────┼────────────────────┐                              │
│    │                    │                    │                              │
│ ┌──┴───┐  ┌─────────┐ ┌┴──────┐  ┌────────┐  │                              │
│ │VIDI- │  │ VIDIBLAST│ │FACETED│  │ PERSONALIZATION│                           │
│ │FLOW  │  │ QUEUE   │ │VIDEO  │  │ ENGINE        │                           │
│ │AGENT │  │         │ │BUILDER│  │               │                           │
│ └──┬───┘  └────┬────┘ └───────┘  └────────┘                              │
│    │           │                                                           │
│    └───────────┼──────────────────────────────────────────┐                │
│                │                                          │                │
│         ┌──────┴──────┐                          ┌───────┴──────┐         │
│         │  AI/ML      │                          │   DATA       │         │
│         │  SERVICES   │                          │   GRAPH      │         │
│         └─────────────┘                          └──────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Architecture

### 2.1 Video Creation Flow (SmartGen + Faceted Builder)

```
USER INPUT
    │
    ▼
┌────────────────────────────────────────────────────────────────┐
│              SMARTGEN FACETED VIDEO FORM                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Content    │  │   Visual     │  │   Audio      │         │
│  │   Facets     │  │   Facets     │  │   Facets     │         │
│  │              │  │              │  │              │         │
│  │ • Script     │  │ • Avatar     │  │ • Voice      │         │
│  │ • Talking    │  │ • Background │  │ • Tone       │         │
│  │   Points     │  │ • Branding   │  │ • Language   │         │
│  │ • CTA        │  │ • Layout     │  │ • Speed      │         │
│  │ • Variables  │  │ • Effects    │  │ • Music      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                    │
│                           ▼                                    │
│              ┌──────────────────────┐                         │
│              │   VISUAL VECTOR      │                         │
│              │   KNOWLEDGE GRAPH    │                         │
│              │                      │                         │
│              │ • Retrieve templates │                         │
│              │ • Match brand assets │                         │
│              │ • Suggest variations │                         │
│              └──────────┬───────────┘                         │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                    VIDIFLOW ORCHESTRATOR                        │
│                     (Agentic Controller)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  AGENT PIPELINE                                         │   │
│  │                                                         │   │
│  │  1. ContentAgent  ──► Validate & enhance script        │   │
│  │         │                                               │   │
│  │         ▼                                               │   │
│  │  2. VisualAgent   ──► Generate/Select avatar           │   │
│  │         │         ──► Apply background                 │   │
│  │         │                                               │   │
│  │         ▼                                               │   │
│  │  3. AudioAgent    ──► Synthesize voice                 │   │
│  │         │         ──► Sync lip movements               │   │
│  │         │                                               │   │
│  │         ▼                                               │   │
│  │  4. RenderAgent   ──► Composite final video            │   │
│  │         │         ──► Apply effects                    │   │
│  │         │                                               │   │
│  │         ▼                                               │   │
│  │  5. QualityAgent  ──► QA checks                        │   │
│  │         │         ──► Approve/Reject                   │   │
│  │         │                                               │   │
│  └─────────┼───────────────────────────────────────────────┘   │
│            │                                                    │
│            ▼                                                    │
│  ┌────────────────────┐                                        │
│  │  OUTPUT QUEUE      │                                        │
│  │  (Redis/BullMQ)    │                                        │
│  └────────────────────┘                                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Personalization & Delivery Flow

```
CAMPAIGN TRIGGER
       │
       ▼
┌────────────────────────────────────────────────────────────────┐
│              VIDIBLAST PERSONALIZATION ENGINE                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: Template Video + Contact List                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CONTACT PROCESSING PIPELINE (Parallel Execution)       │   │
│  │                                                         │   │
│  │  For Each Contact:                                      │   │
│  │                                                         │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │   │
│  │  │  Extract    │───►│  Generate   │───►│  Compose    │ │   │
│  │  │  Variables  │    │  Personal   │    │  Landing    │ │   │
│  │  │             │    │  Elements   │    │  Page       │ │   │
│  │  │ • Name      │    │             │    │             │ │   │
│  │  │ • Company   │    │ • TTS Audio │    │ • Video     │ │   │
│  │  │ • Role      │    │ • Name      │    │ • Message   │ │   │
│  │  │ • Website   │    │   Overlay   │    │ • CTA       │ │   │
│  │  │ • LinkedIn  │    │ • Dynamic   │    │ • Tracking  │ │   │
│  │  │   Data      │    │   BG        │    │   Pixel     │ │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘ │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  VISUAL VECTOR OMNI SEARCH INTEGRATION                  │   │
│  │                                                         │   │
│  │  • Search: "Similar successful campaigns"               │   │
│  │  • Retrieve: Best performing templates                  │   │
│  │  • Recommend: Optimal send times                        │   │
│  │  • Enrich: Additional prospect data                     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│            ┌──────────────────────┐                            │
│            │  PERSONALIZED VIDEO  │                            │
│            │  QUEUE (BullMQ)      │                            │
│            └──────────┬───────────┘                            │
└───────────────────────┼────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   EMAIL      │ │   LANDING    │ │   ANALYTICS  │
│   DELIVERY   │ │   PAGE       │ │   TRACKING   │
│              │ │   HOSTING    │ │              │
│ • SendGrid   │ │ • R2/Cloudflare│ • Open      │
│ • SES        │ │ • Edge cached │ • Click      │
│ • Tracking   │ │ • Dynamic     │ • Conversion │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 2.3 Data Ingestion & Smart Stack Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   CSV    │  │ Salesforce│  │ HubSpot  │  │ LinkedIn │  │  API     │      │
│  │  Upload  │  │   API    │  │   API    │  │   API    │  │ Webhooks │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │             │            │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SMART STACK DATA PROCESSING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    INGESTION AGENT                                   │   │
│  │                                                                       │   │
│  │  • Validate schema      • Deduplicate      • Normalize fields        │   │
│  │  • Enrich data          • Extract entities   • Score quality         │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                           │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              VISUAL VECTOR KNOWLEDGE GRAPH                           │   │
│  │                                                                       │   │
│  │  Nodes:                  Relationships:                               │   │
│  │  ├─ Contact              ├─ WORKS_AT (Contact → Company)             │   │
│  │  ├─ Company              ├─ HAS_ROLE (Contact → Role)                │   │
│  │  ├─ Video                ├─ SENT_TO (Campaign → Contact)             │   │
│  │  ├─ Campaign             ├─ USES_TEMPLATE (Campaign → Template)      │   │
│  │  ├─ Template             ├─ WATCHED (Contact → Video)                │   │
│  │  ├─ Engagement           ├─ CONVERTED (Contact → Opportunity)        │   │
│  │  └─ Opportunity                                                     │   │
│  │                                                                       │   │
│  │  Vector Embeddings:                                                   │   │
│  │  • Video content vectors (CLIP)                                       │   │
│  │  • Contact intent vectors (text embedding)                            │   │
│  │  • Campaign success vectors (performance data)                        │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                           │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    STORAGE LAYER                                     │   │
│  │                                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  PostgreSQL  │  │    Redis     │  │   Pinecone   │              │   │
│  │  │  (Primary)   │  │   (Cache)    │  │  (Vectors)   │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  │ • Contacts   │  │ • Sessions   │  │ • Video      │              │   │
│  │  │ • Campaigns  │  │ • Queues     │  │   embeddings │              │   │
│  │  │ • Analytics  │  │ • Rate limits│  │ • Similarity │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Smart Stack Component Specifications

### 3.1 SmartGen Faceted Video Creation Form with Vidi AI Integration

The SmartGen engine provides an intelligent, faceted interface for video creation, governed by the Vidi AI ranking engine:

**Vidi AI Ranking Engine Architecture:**
- **Base**: Vespa AI (proven at Yahoo, Spotify, Perplexity scale)
- **Function**: Real-time content ranking and personalization
- **Inputs**: User search results, contact intent vectors, historical engagement
- **Outputs**: Optimized email content, video scripts, CTA recommendations

**Content Personalization Flow:**
```
USER SEARCH QUERY
       │
       ▼
┌──────────────────────────────────┐
│     VIDI AI RANKING ENGINE       │
│     (Vespa AI-based)             │
│                                  │
│  • Ranks content relevance       │
│  • Matches intent to messaging   │
│  • Generates custom content      │
│  • Optimizes per recipient       │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  ON-THE-FLY CONTENT FINISHING    │
│                                  │
│  • Dynamic script generation     │
│  • Personalized email body       │
│  • Context-aware CTAs            │
│  • Unique content per email      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   SMART CHANNEL CX DELIVERY      │
└──────────────────────────────────┘
```

```typescript
interface SmartGenFacetedForm {
  // CONTENT FACETS
  content: {
    script: {
      type: 'ai-generated' | 'template' | 'custom';
      input: string; // user prompt or template ID
      talkingPoints: string[];
      tone: 'professional' | 'casual' | 'enthusiastic' | 'formal';
      cta: {
        type: 'book-meeting' | 'reply' | 'download' | 'custom';
        text: string;
        url?: string;
      };
      variables: VariableDefinition[]; // {{firstName}}, {{company}}, etc.
    };
    
    personalization: {
      voiceClone: boolean;
      visualClone: boolean;
      dynamicBackground: boolean;
      nameOverlay: boolean;
    };
  };
  
  // VISUAL FACETS
  visual: {
    avatar: {
      type: 'user-webcam' | 'ai-avatar' | 'stock-presenter';
      aiAvatarId?: string;
      appearance?: AvatarAppearance;
    };
    
    background: {
      type: 'solid' | 'gradient' | 'image' | 'dynamic-website' | 'dynamic-linkedin';
      color?: string;
      imageUrl?: string;
      dynamicSource?: 'prospect-website' | 'prospect-linkedin' | 'custom-url';
    };
    
    branding: {
      logo: {
        position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        url: string;
      };
      colors: {
        primary: string;
        secondary: string;
      };
      font: string;
    };
    
    layout: {
      type: 'fullscreen' | 'split' | 'picture-in-picture';
      aspectRatio: '16:9' | '9:16' | '1:1';
    };
    
    effects: {
      intro: EffectType;
      outro: EffectType;
      transitions: TransitionType[];
    };
  };
  
  // AUDIO FACETS - Powered by Persona Plex (NVIDIA)
  audio: {
    voice: {
      type: 'cloned' | 'ai-generated' | 'user-recorded';
      voiceId?: string; // Persona Plex voice ID (NVIDIA)
      engine: 'persona-plex-nvidia'; // Primary voice synthesis engine
      settings: {
        stability: number; // 0-1
        clarity: number;   // 0-1
        speed: number;     // 0.5-2.0
        emotionalTone: 'professional' | 'friendly' | 'enthusiastic' | 'calm';
        multilingual: boolean; // Support for 30+ languages
      };
    };
    
    music: {
      enabled: boolean;
      trackId?: string;
      volume: number; // 0-1, background level
      fadeIn: boolean;
      fadeOut: boolean;
    };
    
    soundEffects: {
      intro: boolean;
      outro: boolean;
      cta: boolean;
    };
    
    // INTELLIGENT VIDEO EDITING - Powered by Twelvelabs
    videoEditing: {
      enabled: boolean;
      engine: 'twelvelabs' | 'native'; // Twelvelabs for advanced AI editing
      features: {
        autoCut: boolean;           // AI-powered scene detection
        smartTransitions: boolean;  // Context-aware transitions
        highlightExtraction: boolean; // Extract key moments
        noiseReduction: boolean;    // Audio cleanup
        colorCorrection: boolean;   // Auto color grading
        captionGeneration: boolean; // Auto subtitles
        bRollInsertion: boolean;    // Smart B-roll suggestions
      };
    };
  };
}

// Facet Recommendation Engine
interface FacetRecommendationEngine {
  // Uses Visual Vector Omni Search to suggest optimal facet combinations
  recommend(input: UserIntent): FacetSuggestion[];
  
  // Based on:
  // - Industry benchmarks
  // - Similar successful campaigns
  // - User's historical performance
  // - Current trends
}
```

### 3.2 Visual Vector Omni Search Integration

```typescript
interface VisualVectorOmniSearch {
  // Vector Search Capabilities
  searchVideos(query: VectorQuery): VideoResult[];
  searchTemplates(criteria: TemplateCriteria): TemplateResult[];
  findSimilarCampaigns(campaign: Campaign): CampaignInsight[];
  
  // Knowledge Graph Queries
  queryKnowledgeGraph(query: GraphQuery): GraphResult;
  
  // Smart Recommendations
  recommendSendTime(contact: Contact): OptimalTime;
  recommendTemplate(audience: Audience): TemplateRecommendation;
  recommendPersonalization(contact: Contact): PersonalizationStrategy;
}

// Example Queries
const queries = {
  // Find videos similar to a successful template
  similarVideos: {
    type: 'vector-similarity',
    embedding: videoEmbedding,
    filters: {
      industry: 'saas',
      useCase: 'outbound-sales',
      performance: { minConversionRate: 0.05 }
    }
  },
  
  // Find optimal templates for a specific contact
  contactOptimized: {
    type: 'knowledge-graph',
    query: `
      MATCH (c:Contact {id: $contactId})-[:SIMILAR_TO]->(similar:Contact)
      MATCH (similar)-[:WATCHED]->(v:Video)<-[:USES_TEMPLATE]-(camp:Campaign)
      WHERE camp.conversionRate > 0.05
      RETURN camp.template, COUNT(*) as successCount
      ORDER BY successCount DESC
    `,
    params: { contactId: '123' }
  }
};
```

### 3.3 Vidimail Data Models

```typescript
// Core Entities

interface Video {
  id: string;
  userId: string;
  teamId: string;
  
  // Source
  source: {
    type: 'uploaded' | 'recorded' | 'generated';
    originalUrl: string;
    duration: number;
    resolution: string;
  };
  
  // SmartGen Configuration
  smartGenConfig: SmartGenFacetedForm;
  
  // Processing Status
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  processingStage?: string;
  
  // AI Features
  aiFeatures: {
    voiceCloneId?: string;
    visualCloneId?: string;
    transcription: string;
    keyFrames: KeyFrame[];
  };
  
  // Vector Embeddings
  embeddings: {
    visual: number[]; // CLIP embedding
    audio: number[];  // Audio embedding
    text: number[];   // Script embedding
  };
  
  createdAt: Date;
  updatedAt: Date;
}

interface Campaign {
  id: string;
  teamId: string;
  videoId: string;
  templateId: string;
  
  // Configuration
  name: string;
  config: {
    personalization: PersonalizationConfig;
    landingPage: LandingPageConfig;
    email: EmailConfig;
  };
  
  // Recipient Management
  recipients: CampaignRecipient[];
  listId?: string;
  
  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  schedule?: {
    sendAt: Date;
    timezone: string;
    batchSize: number;
    throttleMs: number;
  };
  
  // Analytics
  stats: CampaignStats;
  
  // Knowledge Graph Links
  graphRelations: {
    similarCampaigns: string[];
    bestPerformingVariant: string;
  };
}

interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  
  // Personalization Data
  variables: Record<string, string>;
  personalizedVideoUrl?: string;
  landingPageUrl?: string;
  
  // Delivery Status
  status: 'pending' | 'generating' | 'ready' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'bounced';
  
  // Timeline
  timeline: {
    generatedAt?: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    convertedAt?: Date;
  };
  
  // Engagement Details
  engagement: {
    openCount: number;
    clickCount: number;
    videoWatchDuration: number;
    ctaClicked: boolean;
  };
}

interface Contact {
  id: string;
  teamId: string;
  
  // Basic Info
  email: string;
  firstName: string;
  lastName: string;
  
  // Professional
  company?: string;
  role?: string;
  industry?: string;
  
  // Enrichment Data
  enrichment: {
    linkedinUrl?: string;
    website?: string;
    companySize?: string;
    technologies?: string[];
    intent?: IntentScore;
  };
  
  // Vector Embeddings
  embeddings: {
    profile: number[];
    intent: number[];
  };
  
  // Engagement History
  engagementHistory: {
    totalEmailsSent: number;
    totalOpens: number;
    totalClicks: number;
    lastEngagedAt?: Date;
    engagementScore: number;
  };
  
  // Knowledge Graph Relations
  relations: {
    similarContacts: string[];
    decisionMakers: string[];
    pastCampaigns: string[];
  };
}
```

---

## 4. Agentic Workflow Definitions

### 4.1 Vidimail Orchestrator Agent

```typescript
class VidimailOrchestratorAgent {
  // Main coordination agent that manages the entire video workflow
  
  async createCampaign(config: CampaignConfig): Promise<Campaign> {
    // 1. Validate configuration
    await this.validationAgent.validate(config);
    
    // 2. Enrich data via Visual Vector
    const enriched = await this.enrichmentAgent.enrich(config);
    
    // 3. Generate video via SmartGen
    const video = await this.smartGenAgent.generate(enriched);
    
    // 4. Queue for personalization
    await this.personalizationAgent.queue(enriched.recipients);
    
    // 5. Schedule delivery
    await this.deliveryAgent.schedule(campaign);
    
    return campaign;
  }
}

// Sub-agents

class SmartGenAgent {
  async generate(config: SmartGenFacetedForm): Promise<Video> {
    // Coordinate multiple AI services
    const [visual, audio, content] = await Promise.all([
      this.visualAgent.render(config.visual),
      this.audioAgent.synthesize(config.audio, config.content),
      this.contentAgent.prepare(config.content)
    ]);
    
    // Composite final video
    return this.renderAgent.composite({ visual, audio, content });
  }
}

class PersonalizationAgent {
  async queue(recipients: Contact[]): Promise<void> {
    // Add to BullMQ queue for parallel processing
    for (const batch of chunk(recipients, 100)) {
      await this.queue.add('personalize-batch', {
        batch,
        template: this.template,
        onProgress: (job) => this.trackProgress(job)
      });
    }
  }
  
  async personalize(contact: Contact, template: Video): Promise<PersonalizedVideo> {
    // 1. Extract variables
    const vars = this.extractVariables(contact);
    
    // 2. Generate dynamic content
    const audio = await this.generateTTS(contact.firstName, template);
    const background = await this.fetchDynamicBackground(contact);
    
    // 3. Composite personalized video
    return this.renderAgent.personalize(template, { audio, background, vars });
  }
}

class DeliveryAgent {
  async schedule(campaign: Campaign): Promise<void> {
    // Use Visual Vector to determine optimal send times
    for (const recipient of campaign.recipients) {
      const optimalTime = await this.omniSearch.recommendSendTime(recipient.contact);
      
      await this.queue.add('send-email', {
        recipient,
        sendAt: optimalTime,
        priority: this.calculatePriority(recipient)
      }, {
        delay: optimalTime.getTime() - Date.now()
      });
    }
  }
}
```

### 4.2 Background Intelligence Agent

```typescript
class BackgroundIntelligenceAgent {
  // Handles dynamic background generation
  
  async generateBackground(contact: Contact, type: BackgroundType): Promise<string> {
    switch (type) {
      case 'website':
        return this.captureWebsite(contact.enrichment.website);
      
      case 'linkedin':
        return this.generateLinkedInCard(contact.enrichment.linkedinUrl);
      
      case 'ai-generated':
        return this.aiGenerateBackground(contact.industry, contact.company);
    }
  }
  
  private async captureWebsite(url: string): Promise<string> {
    // Use Puppeteer/Playwright to capture screenshot
    const screenshot = await this.browserAgent.capture(url, {
      viewport: { width: 1920, height: 1080 },
      fullPage: false
    });
    
    // Optimize and cache
    return this.optimizeAndCache(screenshot);
  }
}
```

---

## 5. Smart Channel CX & Vidi AI Ranking Engine Integration

### 5.1 Vidi AI Systematic Content Governance

The Vidi AI Ranking Engine (built on Vespa AI) governs all Vidimail content systematically:

```
┌─────────────────────────────────────────────────────────────────┐
│              VIDI AI RANKING ENGINE (Vespa AI)                  │
│            Yahoo | Spotify | Perplexity Scale                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT SOURCES:                                                 │
│  ├─ User Search Results (real-time queries)                     │
│  ├─ Visual Vector Omni Search (intent vectors)                  │
│  ├─ Smart Stack Knowledge Graph (relationships)                 │
│  ├─ Contact Enrichment Data (LinkedIn, websites)                │
│  └─ Historical Campaign Performance (embeddings)                │
│                                                                 │
│  RANKING & PERSONALIZATION:                                     │
│  ├─ Content relevance scoring (0-1.0)                          │
│  ├─ Intent-to-message matching                                  │
│  ├─ Optimal CTA selection per recipient                         │
│  ├─ Dynamic script generation                                   │
│  └─ Unique content per email (no two emails identical)          │
│                                                                 │
│  OUTPUT: Systematically governed personalized content           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 On-The-Fly Content Finishing Process

Each email undergoes real-time content finishing:

1. **Search Query Analysis**: Analyzes user's search context
2. **Intent Vector Matching**: Matches recipient intent to content
3. **Content Assembly**: Dynamically assembles unique email body
4. **Video Script Generation**: Creates personalized video scripts
5. **CTA Optimization**: Selects best call-to-action based on ranking
6. **Final Composition**: Delivers completely custom email per recipient

### 5.3 Smart Channel CX Integration Architecture

```
SMART CHANNEL CX
       │
       ├──► CRM Module (Contacts, Companies, Opportunities)
       │
       ├──► Analytics Module (Dashboards, Reports, Attribution)
       │
       ├──► Automation Module (Workflows, Triggers, Sequences)
       │
       ├──► Communication Module (Email, SMS, Chat)
       │
       └──► AI Module (SmartGen, Omni Search, Vidi AI Ranking)
                │
                ├──► VIDI AI RANKING ENGINE (Vespa AI)
                │       └► Governs content systematically
                │
                └──► VIDIMAIL MODULE
                        │
                        ├──► Uses: SmartGen for video creation
                        ├──► Uses: Vidi AI for content ranking
                        ├──► Uses: Omni Search for recommendations  
                        ├──► Uses: CRM for contact data
                        ├──► Uses: Analytics for tracking
                        └──► Uses: Automation for sequences
```

### 5.2 API Integration Contracts

```typescript
// Smart Channel CX Hooks

interface SmartChannelIntegration {
  // CRM Sync
  crm: {
    syncContacts(listId: string): Promise<SyncResult>;
    createOpportunity(contactId: string, data: OpportunityData): Promise<Opportunity>;
    logActivity(contactId: string, activity: Activity): Promise<void>;
  };
  
  // Analytics
  analytics: {
    track(event: AnalyticsEvent): Promise<void>;
    report(campaignId: string): Promise<AnalyticsReport>;
    attribution(contactId: string): Promise<AttributionModel>;
  };
  
  // Automation
  automation: {
    triggerWorkflow(trigger: string, data: any): Promise<void>;
    addToSequence(contactId: string, sequenceId: string): Promise<void>;
  };
  
  // AI Services
  ai: {
    smartGen: SmartGenAPI;
    omniSearch: OmniSearchAPI;
    vectorStore: VectorStoreAPI;
  };
}
```

---

## 6. Implementation Phases with Smart Stack

### Phase 1: Foundation + SmartGen Basic (Weeks 1-4)
- [ ] SmartGen faceted form (Content + Visual facets)
- [ ] Basic video recording/upload
- [ ] PostgreSQL + Redis setup
- [ ] Visual Vector schema setup
- [ ] Simple personalization (text variables)

### Phase 2: AI Enhancement + Omni Search (Weeks 5-8)
- [ ] **Persona Plex (NVIDIA)** voice integration - Primary voice synthesis engine
- [ ] Visual Vector Omni Search live
- [ ] Dynamic backgrounds
- [ ] Knowledge graph population
- [ ] Facet recommendation engine
- [ ] **Twelvelabs** intelligent video editing integration (optional/advanced)

### Phase 3: Advanced Features + Full Integration (Weeks 9-12)
- [ ] Visual cloning (HeyGen/D-ID)
- [ ] Advanced Analytics
- [ ] Smart Channel CX deep integration
- [ ] Real-time personalization
- [ ] AI-powered optimization

---

## 7. Infrastructure & Deployment

### Smart Stack Data Infrastructure

```yaml
# docker-compose.smartstack.yml
version: '3.8'

services:
  # Primary Database
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: vidimail
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache & Queue
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes

  # Vector Database
  pinecone:
    # Cloud-managed, connection via API
    
  # Video Processing
  vidiflow-worker:
    build: ./workers/vidiflow
    environment:
      - REDIS_URL=redis://redis:6379
      - PG_URL=postgres://postgres:5432/vidimail
    depends_on:
      - redis
      - postgres

  # Background Intelligence
  background-agent:
    build: ./agents/background
    environment:
      - BROWSER_WS_ENDPOINT=ws://browser:3000

  # Browser for screenshots
  browser:
    image: browserless/chrome:latest
```

---

---

## 8. Related Smart Stack Documentation

### Core Architecture Documents
- **VIDIMAIL_AGENTIC_ARCHITECTURE.md** (This Document) - Complete technical architecture
- **VIDIMAIL_BUILD_PLAN.md** - Implementation phases and build specifications
- **VIDIMAIL_IMPLEMENTATION_ROADMAP.md** - Timeline and milestones
- **VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.md** - Sendspark competitor analysis

### AI & Technology Specifications
- **Persona Plex Integration** (NVIDIA) - Voice synthesis and transcription engine
- **Vespa AI Platform** - Vidi AI Ranking Engine base architecture
- **Twelvelabs API** (Optional) - Intelligent video editing capabilities
- **Visual Vector System** - Omni Search and knowledge graph documentation

### Integration Documents
- **Smart Channel CX Architecture** - Platform integration specifications
- **Smart Stack Data Layer** - Data ingestion and processing workflows
- **Vidiflow Orchestration** - Agentic workflow definitions

### Additional Resources
- **VIDIMAIL_VIDIBLAST_SHOWCASE.html** - Marketing showcase page
- **FRAMEIO_UI_REFERENCE.html** - UI/UX design references
- **SENDSPARK_UI_REFERENCE.html** - Competitor UI analysis

---

**Document Version:** 2.0  
**Last Updated:** February 8, 2026  
**Status:** Architecture Complete - Smart Stack Integration Defined  
**Key Updates:**
- Added Vidi AI Ranking Engine (Vespa AI) systematic content governance
- Integrated Persona Plex (NVIDIA) as primary voice synthesis engine
- Added Twelvelabs intelligent video editing capabilities
- Defined on-the-fly content finishing processes
- Documented search-result-driven personalization workflow

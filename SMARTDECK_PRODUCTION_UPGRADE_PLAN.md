# SmartDeck Production Upgrade Plan

## Overview
Transform SmartDeck from a localStorage-based demo into a full production SaaS application with user accounts, secure API storage, and real provider integrations.

## Current State Analysis

### Current Limitations:
- ❌ Settings only saved locally (no sync across devices)
- ❌ No user accounts or profiles
- ❌ API keys stored insecurely in browser localStorage
- ❌ Most APIs fall back to Picsum (not real implementations)
- ❌ No backend for paid API calls
- ❌ No usage tracking or billing
- ❌ No production database

### Current Features Working:
- ✅ 9 media providers configured
- ✅ Admin panel with prompt editing
- ✅ 8-slide presentation deck
- ✅ Engine labels and fallback system
- ✅ Local settings synchronization

## Target Production Architecture

### Technology Stack:
- **Frontend:** Vercel (React/Next.js)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for generated images)
- **Payments:** Stripe (future)

## Database Schema Design

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  company TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. API Configurations Table (Encrypted)
```sql
CREATE TABLE api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key_encrypted TEXT,
  proxy_url TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

### 4. Project Settings Table
```sql
CREATE TABLE project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT DEFAULT 'SmartGen Media',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Generated Images Cache Table
```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_hash TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  provider TEXT NOT NULL,
  slide_number INTEGER,
  project_id UUID REFERENCES project_settings(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'generate', 'edit', 'batch'
  cost_cents INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Backend API Endpoints

### Authentication Endpoints
```
POST /api/auth/signup - User registration
POST /api/auth/signin - User login
POST /api/auth/signout - User logout
GET /api/auth/user - Get current user
```

### Provider Management Endpoints
```
GET /api/providers - List available providers
POST /api/providers/config - Save API configuration
GET /api/providers/config - Get user's API configs
PUT /api/providers/config/:id - Update API config
DELETE /api/providers/config/:id - Remove API config
POST /api/providers/test - Test provider connection
```

### Image Generation Endpoints
```
POST /api/generate/image - Generate single image
POST /api/generate/batch - Generate multiple images
GET /api/generate/status/:jobId - Check generation status
GET /api/generate/history - Get generation history
```

### Settings Management Endpoints
```
GET /api/settings - Get user settings
PUT /api/settings - Update user settings
POST /api/settings/sync - Sync settings across devices
```

### Usage and Billing Endpoints
```
GET /api/usage/stats - Get usage statistics
GET /api/usage/history - Get usage history
GET /api/billing/credits - Get remaining credits
```

## Real API Integrations

### 1. Google Gemini Flash Integration
```javascript
// Backend implementation
async function generateWithGemini(prompt, apiKey) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'image/png' }
    })
  });
  return response.json();
}
```

### 2. Stability AI Integration
```javascript
async function generateWithStability(prompt, apiKey) {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 600,
      width: 800,
      samples: 1
    })
  });
  return response.json();
}
```

### 3. Seedance Integration
```javascript
async function generateWithSeedance(prompt, apiKey) {
  const response = await fetch('https://api.seedance.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: prompt,
      aspect_ratio: '16:9',
      duration: 4
    })
  });
  return response.json();
}
```

### 4. Nano Banana 2 Integration
```javascript
async function generateWithNanoBanana(prompt, proxyUrl) {
  const response = await fetch(`${proxyUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt })
  });
  return response.json();
}
```

## Frontend Architecture

### React/Next.js Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── AuthGuard.jsx
│   ├── admin/
│   │   ├── PromptEditor.jsx
│   │   ├── ProviderSelector.jsx
│   │   └── SettingsPanel.jsx
│   ├── deck/
│   │   ├── SlideDeck.jsx
│   │   ├── SmartImage.jsx
│   │   └── Navigation.jsx
│   └── common/
│       ├── LoadingSpinner.jsx
│       ├── ErrorBoundary.jsx
│       └── Toast.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProviders.js
│   ├── useSettings.js
│   └── useImageGeneration.js
├── lib/
│   ├── supabase.js
│   ├── api.js
│   └── utils.js
├── pages/
│   ├── index.jsx
│   ├── admin.jsx
│   ├── deck.jsx
│   ├── auth/
│   │   ├── login.jsx
│   │   └── signup.jsx
│   └── api/ (serverless functions)
└── styles/
    └── globals.css
```

### Key Frontend Updates:

#### 1. Supabase Integration
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Replace localStorage with Supabase
const saveSettings = async (settings) => {
  const { data, error } = await supabase
    .from('project_settings')
    .upsert({ 
      user_id: user.id, 
      settings: settings 
    })
  return { data, error }
}
```

#### 2. Secure API Key Management
```javascript
// API keys are never exposed to frontend
const saveApiKey = async (provider, apiKey) => {
  const { data, error } = await supabase.rpc('save_api_key', {
    p_provider: provider,
    p_api_key: apiKey
  })
  return { data, error }
}
```

#### 3. Real Image Generation
```javascript
const generateImage = async (prompt, provider) => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: { prompt, provider }
  })
  return { data, error }
}
```

## Deployment Plan

### Phase 1: Supabase Setup (Day 1)
1. Create Supabase project
2. Set up database tables with RLS policies
3. Configure authentication
4. Set up storage buckets for images
5. Create necessary database functions

### Phase 2: Backend Development (Days 2-3)
1. Create Vercel project
2. Implement authentication endpoints
3. Build provider management APIs
4. Implement image generation proxies
5. Add usage tracking
6. Set up error handling and logging

### Phase 3: Frontend Upgrade (Days 4-5)
1. Set up Next.js project with Supabase
2. Implement authentication UI
3. Update admin panel with real API integration
4. Upgrade slide deck with backend calls
5. Add user dashboard and settings
6. Implement real-time updates

### Phase 4: Testing & Deployment (Day 6)
1. Test all provider integrations
2. Load testing and optimization
3. Security audit
4. Deploy to production
5. Set up monitoring and alerts

## Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### API Keys (Server-side only)
```
GOOGLE_AI_API_KEY=your-gemini-key
STABILITY_API_KEY=your-stability-key
SEEDANCE_API_KEY=your-seedance-key
NANOBANANA_PROXY_URL=your-proxy-url
```

### Vercel Configuration
```
VERCEL_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Security Considerations

### 1. API Key Encryption
- All API keys encrypted at rest in database
- Keys never exposed to frontend
- Server-side decryption only when needed

### 2. Row Level Security (RLS)
```sql
-- Users can only access their own data
ALTER TABLE api_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own configs" ON api_configs
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Rate Limiting
- Implement rate limiting on all endpoints
- Per-user usage limits
- Provider-specific rate limiting

### 4. Input Validation
- Sanitize all user inputs
- Validate prompts for content policy
- File type and size validation

## Cost Estimation

### Monthly Costs (Production):
- **Vercel Pro:** $20/month
- **Supabase Pro:** $25/month
- **API Usage:** Variable based on usage
  - Gemini: $0.04/image
  - Stability: $0.06/image
  - Seedance: $0.08/image

### Estimated Monthly Cost for 1000 images:
- Infrastructure: $45
- APIs: $40-80
- **Total: $85-125/month**

## Success Metrics

### Technical Metrics:
- ✅ 99.9% uptime
- ✅ <2s image generation time
- ✅ Zero security breaches
- ✅ All providers functional

### Business Metrics:
- ✅ User registration and retention
- ✅ API usage and revenue
- ✅ Customer satisfaction scores

## Next Steps

1. **Immediate:** Set up Supabase project and database
2. **Week 1:** Implement backend APIs and authentication
3. **Week 2:** Upgrade frontend with real integrations
4. **Week 3:** Testing, optimization, and launch

This upgrade will transform SmartDeck into a professional, scalable SaaS application ready for production use.

---

**Document Version:** 1.0.0  
**Created:** March 20, 2026  
**Author:** AI Development Assistant  
**Status:** Ready for Implementation
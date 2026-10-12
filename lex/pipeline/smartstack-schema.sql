-- VidiSmart Smart Stack Database Schema
-- AI-Powered Enterprise Tech Stack Builder
-- Run this in your Supabase SQL editor

-- =====================================================
-- 1. TECHNOLOGIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  pricing_model TEXT, -- 'free', 'freemium', 'paid', 'enterprise', 'open-source'
  deployment_type TEXT[], -- array: ['cloud', 'self-hosted', 'hybrid', 'edge']
  tech_maturity TEXT, -- 'experimental', 'beta', 'stable', 'enterprise'
  use_cases TEXT[], -- array of use case IDs or keywords
  performance_score DECIMAL(3,2), -- 0.00 to 10.00
  ease_of_use_score DECIMAL(3,2), -- 0.00 to 10.00
  community_score DECIMAL(3,2), -- 0.00 to 10.00
  metadata JSONB DEFAULT '{}', -- flexible metadata storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- FontAwesome class
  display_order INTEGER,
  parent_category_id UUID REFERENCES categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. USE CASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  industry TEXT[], -- array: ['saas', 'ecommerce', 'fintech', 'healthtech', etc.]
  complexity_level TEXT, -- 'simple', 'moderate', 'complex', 'enterprise'
  estimated_setup_time_hours INTEGER,
  min_budget_usd INTEGER,
  max_budget_usd INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SMART STACKS TABLE (Generated Solutions)
-- =====================================================
CREATE TABLE IF NOT EXISTS smart_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  use_case_id UUID REFERENCES use_cases(id),
  description TEXT,
  architecture_diagram JSONB, -- stores flowchart node/edge data
  technology_ids UUID[], -- array of technology UUIDs
  stack_config JSONB DEFAULT '{}', -- configuration details
  estimated_cost_monthly_usd DECIMAL(10,2),
  setup_time_hours INTEGER,
  complexity_score DECIMAL(3,2), -- 0.00 to 10.00
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_by TEXT, -- user identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. STACK COMPONENTS (Join table with metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS stack_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES smart_stacks(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id),
  component_role TEXT, -- 'primary', 'alternative', 'optional'
  layer TEXT, -- 'frontend', 'backend', 'database', 'ai-model', 'hosting', etc.
  position_x INTEGER, -- for flowchart visualization
  position_y INTEGER,
  config JSONB DEFAULT '{}', -- component-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. INTEGRATIONS TABLE (Tech compatibility)
-- =====================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_from_id UUID REFERENCES technologies(id),
  tech_to_id UUID REFERENCES technologies(id),
  integration_type TEXT, -- 'native', 'plugin', 'api', 'custom'
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  documentation_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tech_from_id, tech_to_id)
);

-- =====================================================
-- 7. USER PREFERENCES (Optional for personalization)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  preferred_categories TEXT[],
  budget_range_usd INTEGER[],
  deployment_preference TEXT[], -- ['cloud', 'self-hosted']
  experience_level TEXT, -- 'beginner', 'intermediate', 'expert'
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. STACK RATINGS (Community feedback)
-- =====================================================
CREATE TABLE IF NOT EXISTS stack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES smart_stacks(id) ON DELETE CASCADE,
  user_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_use_cases ON technologies USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_smart_stacks_use_case ON smart_stacks(use_case_id);
CREATE INDEX IF NOT EXISTS idx_stack_components_stack ON stack_components(stack_id);
CREATE INDEX IF NOT EXISTS idx_stack_components_tech ON stack_components(technology_id);
CREATE INDEX IF NOT EXISTS idx_integrations_from ON integrations(tech_from_id);
CREATE INDEX IF NOT EXISTS idx_integrations_to ON integrations(tech_to_id);

-- =====================================================
-- VIEWS for Quick Queries
-- =====================================================
CREATE OR REPLACE VIEW popular_stacks AS
SELECT
  s.*,
  COUNT(DISTINCT r.id) as rating_count,
  AVG(r.rating) as avg_rating,
  uc.name as use_case_name
FROM smart_stacks s
LEFT JOIN stack_ratings r ON s.id = r.stack_id
LEFT JOIN use_cases uc ON s.use_case_id = uc.id
WHERE s.is_public = TRUE
GROUP BY s.id, uc.name
ORDER BY rating_count DESC, avg_rating DESC;

-- =====================================================
-- RPC Functions for AI Stack Assembly
-- =====================================================

-- Function to find compatible technologies
CREATE OR REPLACE FUNCTION find_compatible_technologies(
  base_tech_id UUID,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  technology_id UUID,
  technology_name TEXT,
  integration_type TEXT,
  difficulty TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    i.integration_type,
    i.difficulty
  FROM technologies t
  INNER JOIN integrations i ON t.id = i.tech_to_id
  WHERE i.tech_from_id = base_tech_id
  ORDER BY
    CASE i.difficulty
      WHEN 'easy' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'hard' THEN 3
    END,
    t.performance_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to recommend stack based on use case
CREATE OR REPLACE FUNCTION recommend_stack_for_use_case(
  p_use_case_slug TEXT,
  p_max_budget INTEGER DEFAULT NULL
)
RETURNS TABLE (
  stack_id UUID,
  stack_name TEXT,
  confidence_score DECIMAL,
  estimated_cost DECIMAL,
  rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.ai_confidence_score,
    s.estimated_cost_monthly_usd,
    COALESCE(AVG(r.rating), 0) as avg_rating
  FROM smart_stacks s
  INNER JOIN use_cases uc ON s.use_case_id = uc.id
  LEFT JOIN stack_ratings r ON s.id = r.stack_id
  WHERE uc.slug = p_use_case_slug
    AND s.is_public = TRUE
    AND (p_max_budget IS NULL OR s.estimated_cost_monthly_usd <= p_max_budget)
  GROUP BY s.id
  ORDER BY s.ai_confidence_score DESC, avg_rating DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Enable later if needed
-- =====================================================
-- ALTER TABLE smart_stacks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stack_ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SEED DATA - Categories
-- =====================================================
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Vision AI', 'vision-ai', 'fa-camera', 1),
  ('Generative Video', 'generative-video', 'fa-film', 2),
  ('LLMs & AI', 'llms-ai', 'fa-brain', 3),
  ('Voice AI', 'voice-ai', 'fa-microphone', 4),
  ('Vector Databases', 'vector-databases', 'fa-database', 5),
  ('Databases', 'databases', 'fa-server', 6),
  ('Event Streaming', 'event-streaming', 'fa-bolt', 7),
  ('Programming Languages', 'languages', 'fa-code', 8),
  ('Backend Frameworks', 'backend', 'fa-gears', 9),
  ('Frontend Frameworks', 'frontend', 'fa-desktop', 10),
  ('Mobile Development', 'mobile', 'fa-mobile-screen', 11),
  ('Edge Computing', 'edge', 'fa-microchip', 12),
  ('Cloud Platforms', 'cloud', 'fa-cloud', 13),
  ('Infrastructure', 'infrastructure', 'fa-network-wired', 14),
  ('CI/CD', 'cicd', 'fa-sync', 15),
  ('Observability', 'observability', 'fa-chart-line', 16),
  ('Security', 'security', 'fa-shield-halved', 17),
  ('APIs', 'api', 'fa-plug', 18),
  ('Data Engineering', 'data-engineering', 'fa-vials', 19),
  ('Testing', 'testing', 'fa-check-double', 20),
  ('Collaboration', 'collaboration', 'fa-briefcase', 21)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED DATA - Sample Use Cases
-- =====================================================
INSERT INTO use_cases (name, slug, description, industry, complexity_level, estimated_setup_time_hours, min_budget_usd, max_budget_usd) VALUES
  ('AI Video Processing Pipeline', 'ai-video-pipeline', 'Process and analyze video content with AI vision models', ARRAY['media', 'saas', 'entertainment'], 'complex', 80, 500, 5000),
  ('E-commerce Platform', 'ecommerce-platform', 'Full-featured online store with payments and inventory', ARRAY['ecommerce', 'retail'], 'complex', 120, 300, 3000),
  ('SaaS Application', 'saas-app', 'Multi-tenant SaaS application with authentication and billing', ARRAY['saas', 'b2b'], 'complex', 160, 400, 4000),
  ('AI Chatbot & Support System', 'ai-chatbot-support', 'Customer support with AI chatbot and knowledge base', ARRAY['saas', 'support'], 'moderate', 60, 200, 2000),
  ('Real-time Analytics Dashboard', 'realtime-analytics', 'Live data visualization and monitoring dashboard', ARRAY['analytics', 'saas'], 'moderate', 80, 300, 2500),
  ('Mobile App with Backend', 'mobile-app-backend', 'Cross-platform mobile app with API backend', ARRAY['mobile', 'saas'], 'moderate', 100, 250, 2000),
  ('Content Management System', 'cms-platform', 'Headless CMS with media management', ARRAY['media', 'publishing'], 'moderate', 60, 150, 1500),
  ('AI Agent Platform', 'ai-agent-platform', 'Multi-agent AI orchestration platform with RAG', ARRAY['ai', 'saas'], 'complex', 140, 600, 6000),
  ('IoT Data Platform', 'iot-data-platform', 'Collect and process IoT sensor data at scale', ARRAY['iot', 'industrial'], 'complex', 120, 500, 5000),
  ('Marketing Automation', 'marketing-automation', 'Email campaigns, CRM integration, and analytics', ARRAY['marketing', 'saas'], 'moderate', 70, 200, 2000)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'VidiSmart Smart Stack Schema Created Successfully!';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Import technology data from vidismart.masterlist.html';
  RAISE NOTICE '2. Create integration mappings';
  RAISE NOTICE '3. Build AI recommendation engine';
  RAISE NOTICE '4. Deploy frontend interface';
END $$;

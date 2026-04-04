// Complete Smart Stack Database Setup
// Creates schema and imports all 599 technologies

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL Schema Creation
const SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS tech_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies Table
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES tech_categories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    github_url TEXT,
    documentation_url TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    popularity_score INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tech_categories_slug ON tech_categories(slug);
CREATE INDEX IF NOT EXISTS idx_tech_categories_sort_order ON tech_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_technologies_category_id ON technologies(category_id);
CREATE INDEX IF NOT EXISTS idx_technologies_slug ON technologies(slug);
CREATE INDEX IF NOT EXISTS idx_technologies_featured ON technologies(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_technologies_tags ON technologies USING GIN(tags);

-- RLS Policies
ALTER TABLE tech_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access on categories" ON tech_categories
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access on technologies" ON technologies
    FOR SELECT USING (is_active = true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$\nBEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_tech_categories_updated_at
    BEFORE UPDATE ON tech_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_technologies_updated_at
    BEFORE UPDATE ON technologies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for API responses
CREATE OR REPLACE VIEW tech_stack_overview AS
SELECT 
    tc.id as category_id,
    tc.slug as category_slug,
    tc.name as category_name,
    tc.display_name as category_display_name,
    tc.icon as category_icon,
    tc.sort_order,
    COUNT(t.id) as technology_count,
    json_agg(
        json_build_object(
            'id', t.id,
            'slug', t.slug,
            'name', t.name,
            'display_name', t.display_name,
            'description', t.description,
            'website_url', t.website_url,
            'logo_url', t.logo_url,
            'tags', t.tags,
            'is_featured', t.is_featured,
            'popularity_score', t.popularity_score
        ) ORDER BY t.popularity_score DESC, t.name
    ) FILTER (WHERE t.id IS NOT NULL) as technologies
FROM tech_categories tc
LEFT JOIN technologies t ON tc.id = t.category_id AND t.is_active = true
WHERE tc.is_active = true
GROUP BY tc.id, tc.slug, tc.name, tc.display_name, tc.icon, tc.sort_order
ORDER BY tc.sort_order;
`;

// Category data
const categoryMap = {
  'vision': 'vision-ai',
  'gen-video': 'generative-video',
  'llm': 'llm-agents',
  'voice': 'voice-ai',
  'vector': 'vector-databases',
  'database': 'structured-data',
  'streaming': 'messaging',
  'languages': 'languages',
  'backend': 'backend',
  'frontend': 'frontend',
  'mobile': 'mobile',
  'edge': 'edge-hardware',
  'cloud': 'cloud',
  'devops': 'infrastructure',
  'cicd': 'cicd',
  'observability': 'observability',
  'security': 'security',
  'api': 'api-tools',
  'data-eng': 'data-science',
  'testing': 'testing',
  'business': 'productivity'
};

const categoryData = {
  'vision-ai': { name: 'Vision AI & Computer Vision', display_name: 'Vision AI', icon: 'fa-camera', sort: 1, desc: 'Computer vision, image recognition, and video analysis tools' },
  'generative-video': { name: 'Generative Video & Creative AI', display_name: 'Generative Video', icon: 'fa-video', sort: 2, desc: 'AI-powered video generation and creative content tools' },
  'llm-agents': { name: 'LLMs & Agentic Orchestration', display_name: 'LLMs & Agents', icon: 'fa-brain', sort: 3, desc: 'Large language models and AI agent frameworks' },
  'voice-ai': { name: 'Voice AI & Conversational Agents', display_name: 'Voice AI', icon: 'fa-microphone', sort: 4, desc: 'Speech recognition, synthesis, and voice agent platforms' },
  'vector-databases': { name: 'Vector Databases & RAG', display_name: 'Vector DBs', icon: 'fa-database', sort: 5, desc: 'Vector databases and retrieval-augmented generation systems' },
  'structured-data': { name: 'Structured & Real-time Data', display_name: 'Data Stores', icon: 'fa-table', sort: 6, desc: 'Relational and NoSQL databases for structured data' },
  'messaging': { name: 'Messaging & Event Streaming', display_name: 'Messaging', icon: 'fa-stream', sort: 7, desc: 'Message queues, event streaming, and real-time data pipelines' },
  'languages': { name: 'Core Programming Languages', display_name: 'Languages', icon: 'fa-code', sort: 8, desc: 'Programming languages for AI and system development' },
  'backend': { name: 'Backend Frameworks', display_name: 'Backend', icon: 'fa-server', sort: 9, desc: 'Server-side frameworks and APIs' },
  'frontend': { name: 'Frontend & UI Engineering', display_name: 'Frontend', icon: 'fa-desktop', sort: 10, desc: 'Client-side frameworks and UI libraries' },
  'mobile': { name: 'Mobile & Edge App Dev', display_name: 'Mobile', icon: 'fa-mobile-alt', sort: 11, desc: 'Mobile development and edge computing platforms' },
  'edge-hardware': { name: 'Edge Computing & Hardware', display_name: 'Edge & Hardware', icon: 'fa-microchip', sort: 12, desc: 'Edge devices, embedded systems, and hardware acceleration' },
  'cloud': { name: 'Cloud Platforms & Hosting', display_name: 'Cloud', icon: 'fa-cloud', sort: 13, desc: 'Cloud providers and hosting platforms' },
  'infrastructure': { name: 'Infrastructure & IaC', display_name: 'Infrastructure', icon: 'fa-network-wired', sort: 14, desc: 'Infrastructure as code and DevOps tools' },
  'cicd': { name: 'CI/CD & Automation', display_name: 'CI/CD', icon: 'fa-sync-alt', sort: 15, desc: 'Continuous integration and deployment automation' },
  'observability': { name: 'Observability & Monitoring', display_name: 'Observability', icon: 'fa-eye', sort: 16, desc: 'Monitoring, logging, and observability platforms' },
  'security': { name: 'Security & Identity', display_name: 'Security', icon: 'fa-shield-alt', sort: 17, desc: 'Authentication, authorization, and security tools' },
  'api-tools': { name: 'API Development & Management', display_name: 'API Tools', icon: 'fa-plug', sort: 18, desc: 'API gateways, documentation, and testing tools' },
  'data-science': { name: 'Data Science & ML Ops', display_name: 'ML Ops', icon: 'fa-flask', sort: 19, desc: 'Machine learning operations and data science platforms' },
  'testing': { name: 'Testing & Quality', display_name: 'Testing', icon: 'fa-vial', sort: 20, desc: 'Testing frameworks and quality assurance tools' },
  'productivity': { name: 'Productivity & Collaboration', display_name: 'Productivity', icon: 'fa-users', sort: 21, desc: 'Team collaboration and productivity tools' }
};

const tagMap = {
  'vision-ai': ['computer-vision', 'ai', 'ml', 'image-recognition'],
  'generative-video': ['video', 'generative', 'creative', 'ai-generation'],
  'llm-agents': ['llm', 'ai', 'nlp', 'agents', 'orchestration'],
  'voice-ai': ['voice', 'audio', 'speech', 'conversation'],
  'vector-databases': ['vector-db', 'rag', 'search', 'embeddings'],
  'structured-data': ['database', 'storage', 'sql', 'nosql'],
  'messaging': ['streaming', 'messaging', 'events', 'queue'],
  'languages': ['programming', 'language', 'code'],
  'backend': ['backend', 'framework', 'api', 'server'],
  'frontend': ['frontend', 'ui', 'framework', 'client'],
  'mobile': ['mobile', 'app', 'ios', 'android'],
  'edge-hardware': ['edge', 'hardware', 'iot', 'embedded'],
  'cloud': ['cloud', 'hosting', 'infrastructure'],
  'infrastructure': ['devops', 'infrastructure', 'iac', 'kubernetes'],
  'cicd': ['cicd', 'automation', 'pipeline', 'deployment'],
  'observability': ['monitoring', 'observability', 'logging', 'metrics'],
  'security': ['security', 'auth', 'identity', 'protection'],
  'api-tools': ['api', 'integration', 'gateway', 'documentation'],
  'data-science': ['data', 'pipeline', 'ml-ops', 'analytics'],
  'testing': ['testing', 'quality', 'qa', 'automation'],
  'productivity': ['productivity', 'collaboration', 'tools']
};

async function createSchema() {
  console.log('🏗️  Creating database schema...');
  
  // Execute schema SQL
  const { error } = await supabase.rpc('exec_sql', { sql: SCHEMA_SQL });
  
  if (error) {
    // Try running SQL directly via REST
    console.log('⚠️  RPC not available, trying direct SQL...');
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log('\n' + SCHEMA_SQL + '\n');
    return false;
  }
  
  console.log('✅ Schema created');
  return true;
}

async function importCategories() {
  console.log('📁 Importing 21 categories...');
  
  const categories = Object.entries(categoryData).map(([slug, data]) => ({
    slug,
    name: data.name,
    display_name: data.display_name,
    description: data.desc,
    icon: data.icon,
    sort_order: data.sort,
    is_active: true
  }));

  const { error } = await supabase
    .from('tech_categories')
    .upsert(categories, { onConflict: 'slug' });

  if (error) {
    console.error('❌ Error importing categories:', error);
    return false;
  }

  console.log(`✅ Imported ${categories.length} categories`);
  return true;
}

async function getCategoryIds() {
  const { data, error } = await supabase
    .from('tech_categories')
    .select('id, slug');
  
  if (error) {
    console.error('❌ Error fetching categories:', error);
    return {};
  }

  const idMap = {};
  data.forEach(cat => {
    idMap[cat.slug] = cat.id;
  });
  return idMap;
}

async function importTechnologies(categoryIds) {
  console.log('🔧 Importing technologies from masterlist...');
  
  const masterlistPath = path.join(__dirname, '..', 'vidismart.masterlist.v3.html');
  const htmlContent = fs.readFileSync(masterlistPath, 'utf-8');

  // Extract URLs
  const urlMatches = htmlContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g);
  const techUrls = {};
  for (const match of urlMatches) {
    techUrls[match[1]] = match[2];
  }

  // Extract categories and items
  const categoryMatches = htmlContent.matchAll(/\{ id: "([^"]+)", title: "([^"]+)", icon: "([^"]+)", items: \[([^\]]+)\] \}/g);
  
  let totalTechs = 0;
  
  for (const match of categoryMatches) {
    const masterlistId = match[1];
    const schemaSlug = categoryMap[masterlistId];
    
    if (!schemaSlug || !categoryIds[schemaSlug]) {
      console.warn(`⚠️  Skipping: ${masterlistId}`);
      continue;
    }

    const categoryId = categoryIds[schemaSlug];
    const itemsStr = match[4];
    const items = itemsStr.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
    const uniqueItems = [...new Set(items)];
    const tags = tagMap[schemaSlug] || ['technology'];

    const technologies = uniqueItems.map((techName, index) => {
      const url = techUrls[techName] || `https://www.google.com/search?q=${encodeURIComponent(techName)}`;
      const slug = techName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) || `tech-${index}`;
      
      const isFeatured = index < 3;
      const popularityScore = isFeatured ? 90 - index * 5 : Math.floor(Math.random() * 50) + 30;

      return {
        category_id: categoryId,
        slug,
        name: techName,
        display_name: techName,
        description: `${techName} - ${categoryData[schemaSlug].name}`,
        website_url: url,
        is_featured: isFeatured,
        popularity_score: popularityScore,
        tags,
        is_active: true
      };
    });

    const { error } = await supabase
      .from('technologies')
      .upsert(technologies, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ ${schemaSlug}:`, error.message);
    } else {
      console.log(`✅ ${schemaSlug}: ${technologies.length} technologies`);
      totalTechs += technologies.length;
    }
  }

  return totalTechs;
}

async function verify() {
  console.log('\n🔍 Verifying...');
  
  const { data: cats } = await supabase.from('tech_categories').select('*');
  const { count } = await supabase.from('technologies').select('*', { count: 'exact', head: true });

  console.log(`📊 Categories: ${cats?.length || 0}`);
  console.log(`📊 Technologies: ${count || 0}`);
}

async function main() {
  console.log('🚀 Smart Stack Database Setup\n');

  try {
    // Check if tables exist by trying to query
    const { error: checkError } = await supabase.from('tech_categories').select('count');
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('⚠️  Tables do not exist.');
      console.log('Please run this SQL in Supabase SQL Editor first:');
      console.log('\n📄 File: vidiflow/supabase-smart-stack-schema.sql');
      console.log('Then run this script again.\n');
      return;
    }

    // Import categories
    const catsOk = await importCategories();
    if (!catsOk) return;

    // Get IDs and import technologies
    const categoryIds = await getCategoryIds();
    console.log(`📋 Found ${Object.keys(categoryIds).length} categories\n`);
    
    const techCount = await importTechnologies(categoryIds);
    console.log(`\n🎉 Total: ${techCount} technologies`);

    await verify();

    console.log('\n✨ Setup complete!');
    console.log('🌐 API: http://localhost:3002/api/smart-stack');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

main();

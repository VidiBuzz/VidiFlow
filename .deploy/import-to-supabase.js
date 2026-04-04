// Auto-import Smart Stack data to Supabase
// Uses service role key for admin access

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Supabase credentials from .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jeasmwbberfgztkxfjwr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Category mapping from masterlist IDs to schema slugs
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

// Category display data
const categoryData = {
  'vision-ai': { name: 'Vision AI & Computer Vision', display_name: 'Vision AI', icon: 'fa-camera', sort: 1 },
  'generative-video': { name: 'Generative Video & Creative AI', display_name: 'Generative Video', icon: 'fa-video', sort: 2 },
  'llm-agents': { name: 'LLMs & Agentic Orchestration', display_name: 'LLMs & Agents', icon: 'fa-brain', sort: 3 },
  'voice-ai': { name: 'Voice AI & Conversational Agents', display_name: 'Voice AI', icon: 'fa-microphone', sort: 4 },
  'vector-databases': { name: 'Vector Databases & RAG', display_name: 'Vector DBs', icon: 'fa-database', sort: 5 },
  'structured-data': { name: 'Structured & Real-time Data', display_name: 'Data Stores', icon: 'fa-table', sort: 6 },
  'messaging': { name: 'Messaging & Event Streaming', display_name: 'Messaging', icon: 'fa-stream', sort: 7 },
  'languages': { name: 'Core Programming Languages', display_name: 'Languages', icon: 'fa-code', sort: 8 },
  'backend': { name: 'Backend Frameworks', display_name: 'Backend', icon: 'fa-server', sort: 9 },
  'frontend': { name: 'Frontend & UI Engineering', display_name: 'Frontend', icon: 'fa-desktop', sort: 10 },
  'mobile': { name: 'Mobile & Edge App Dev', display_name: 'Mobile', icon: 'fa-mobile-alt', sort: 11 },
  'edge-hardware': { name: 'Edge Computing & Hardware', display_name: 'Edge & Hardware', icon: 'fa-microchip', sort: 12 },
  'cloud': { name: 'Cloud Platforms & Hosting', display_name: 'Cloud', icon: 'fa-cloud', sort: 13 },
  'infrastructure': { name: 'Infrastructure & IaC', display_name: 'Infrastructure', icon: 'fa-network-wired', sort: 14 },
  'cicd': { name: 'CI/CD & Automation', display_name: 'CI/CD', icon: 'fa-sync-alt', sort: 15 },
  'observability': { name: 'Observability & Monitoring', display_name: 'Observability', icon: 'fa-eye', sort: 16 },
  'security': { name: 'Security & Identity', display_name: 'Security', icon: 'fa-shield-alt', sort: 17 },
  'api-tools': { name: 'API Development & Management', display_name: 'API Tools', icon: 'fa-plug', sort: 18 },
  'data-science': { name: 'Data Science & ML Ops', display_name: 'ML Ops', icon: 'fa-flask', sort: 19 },
  'testing': { name: 'Testing & Quality', display_name: 'Testing', icon: 'fa-vial', sort: 20 },
  'productivity': { name: 'Productivity & Collaboration', display_name: 'Productivity', icon: 'fa-users', sort: 21 }
};

// Tags generator based on category
function getTags(categorySlug) {
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
  return tagMap[categorySlug] || ['technology'];
}

async function importCategories() {
  console.log('📁 Importing categories...');
  
  const categories = Object.entries(categoryData).map(([slug, data]) => ({
    slug,
    name: data.name,
    display_name: data.display_name,
    description: `${data.name} technologies and tools`,
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
  console.log('🔧 Importing technologies...');
  
  // Read the masterlist HTML to extract tech data
  const masterlistPath = path.join(__dirname, '..', 'vidismart.masterlist.v3.html');
  const htmlContent = fs.readFileSync(masterlistPath, 'utf-8');

  // Extract URLs
  const urlLines = htmlContent.match(/"([^"]+)":\s*"([^"]+)"/g) || [];
  const techUrls = {};
  urlLines.forEach(line => {
    const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
    if (match) techUrls[match[1]] = match[2];
  });

  // Extract categories and items
  const categoryMatches = htmlContent.matchAll(/\{ id: "([^"]+)", title: "([^"]+)", icon: "([^"]+)", items: \[([^\]]+)\] \}/g);
  
  let totalTechs = 0;
  
  for (const match of categoryMatches) {
    const masterlistId = match[1];
    const schemaSlug = categoryMap[masterlistId];
    
    if (!schemaSlug || !categoryIds[schemaSlug]) {
      console.warn(`⚠️ Skipping unknown category: ${masterlistId}`);
      continue;
    }

    const categoryId = categoryIds[schemaSlug];
    const itemsStr = match[4];
    const items = itemsStr.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
    const uniqueItems = [...new Set(items)];
    const tags = getTags(schemaSlug);

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

    // Batch insert technologies for this category
    const { error } = await supabase
      .from('technologies')
      .upsert(technologies, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error importing ${schemaSlug}:`, error);
    } else {
      console.log(`✅ ${schemaSlug}: ${technologies.length} technologies`);
      totalTechs += technologies.length;
    }
  }

  console.log(`\n🎉 Total technologies imported: ${totalTechs}`);
  return totalTechs;
}

async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const { data: categories, error: catError } = await supabase
    .from('tech_categories')
    .select('*');
  
  if (catError) {
    console.error('❌ Error verifying categories:', catError);
    return;
  }

  const { count: techCount, error: techError } = await supabase
    .from('technologies')
    .select('*', { count: 'exact', head: true });

  if (techError) {
    console.error('❌ Error verifying technologies:', techError);
    return;
  }

  console.log(`📊 Categories: ${categories.length}`);
  console.log(`📊 Technologies: ${techCount}`);
  console.log('\n✅ Import verification complete!');
}

async function main() {
  console.log('🚀 Starting Smart Stack import to Supabase...\n');

  try {
    // Step 1: Import categories
    const categoriesOk = await importCategories();
    if (!categoriesOk) {
      console.error('Failed to import categories. Aborting.');
      process.exit(1);
    }

    // Step 2: Get category IDs
    const categoryIds = await getCategoryIds();
    console.log(`📋 Found ${Object.keys(categoryIds).length} category IDs\n`);

    // Step 3: Import technologies
    const techCount = await importTechnologies(categoryIds);

    // Step 4: Verify
    await verifyImport();

    console.log('\n✨ Supabase import complete!');
    console.log('🌐 Your Smart Stack API is ready at: http://localhost:3002/api/smart-stack');

  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

main();

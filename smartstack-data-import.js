/**
 * VidiSmart SmartStack Data Import Script
 * Imports technologies from vidismart.masterlist.FINAL.html into Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// =====================================================
// CONFIGURATION
// =====================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jeasmwbberfgztkxfjwr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sbp_229e5b28acf95c33a6a6d611683962149eb327bd';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// TECHNOLOGY DATA FROM MASTERLIST
// =====================================================
const TECHNOLOGY_DATA = {
  'vision-ai': [
    { name: 'YOLO v11', url: 'https://docs.ultralytics.com/models/yolo11/', pricing: 'open-source', performance: 9.5, ease: 8.0, community: 9.0 },
    { name: 'MediaPipe', url: 'https://mediapipe.dev/', pricing: 'open-source', performance: 9.0, ease: 8.5, community: 8.5 },
    { name: 'OpenCV', url: 'https://opencv.org/', pricing: 'open-source', performance: 8.5, ease: 7.0, community: 9.5 },
    { name: 'PyTorch', url: 'https://pytorch.org/', pricing: 'open-source', performance: 9.5, ease: 7.5, community: 9.5 },
    { name: 'TensorRT', url: 'https://developer.nvidia.com/tensorrt', pricing: 'free', performance: 10.0, ease: 6.5, community: 8.0 },
    { name: 'Detectron2', url: 'https://github.com/facebookresearch/detectron2', pricing: 'open-source', performance: 9.0, ease: 7.0, community: 8.5 },
    { name: 'Roboflow', url: 'https://roboflow.com/', pricing: 'freemium', performance: 8.5, ease: 9.0, community: 8.0 },
    { name: 'SAM 2', url: 'https://segment-anything.com/', pricing: 'open-source', performance: 9.5, ease: 8.0, community: 8.5 },
    { name: 'Ultralytics', url: 'https://ultralytics.com/', pricing: 'freemium', performance: 9.0, ease: 8.5, community: 9.0 }
  ],
  'generative-video': [
    { name: 'Sora API', url: 'https://openai.com/sora', pricing: 'paid', performance: 9.5, ease: 8.0, community: 7.5 },
    { name: 'Runway Gen-3', url: 'https://runwayml.com/', pricing: 'paid', performance: 9.0, ease: 9.0, community: 8.5 },
    { name: 'Luma Dream Machine', url: 'https://lumalabs.ai/dream-machine', pricing: 'freemium', performance: 9.0, ease: 9.5, community: 8.0 },
    { name: 'Pika Labs', url: 'https://pika.art/', pricing: 'freemium', performance: 8.5, ease: 9.0, community: 8.0 },
    { name: 'HeyGen', url: 'https://heygen.com/', pricing: 'paid', performance: 9.0, ease: 9.5, community: 8.5 },
    { name: 'ComfyUI', url: 'https://github.com/comfyanonymous/ComfyUI', pricing: 'open-source', performance: 9.0, ease: 6.5, community: 9.0 }
  ],
  'llms-ai': [
    { name: 'GPT-4', url: 'https://openai.com/', pricing: 'paid', performance: 10.0, ease: 9.5, community: 9.5 },
    { name: 'Claude Sonnet 4.5', url: 'https://claude.ai/', pricing: 'paid', performance: 10.0, ease: 9.5, community: 9.0 },
    { name: 'Gemini 1.5 Pro', url: 'https://deepmind.google/technologies/gemini/', pricing: 'freemium', performance: 9.5, ease: 9.0, community: 8.5 },
    { name: 'Llama 3.1', url: 'https://llama.meta.com/', pricing: 'open-source', performance: 9.0, ease: 8.0, community: 9.5 },
    { name: 'LangChain', url: 'https://langchain.com/', pricing: 'open-source', performance: 8.5, ease: 8.0, community: 9.5 },
    { name: 'CrewAI', url: 'https://crewai.com/', pricing: 'open-source', performance: 8.5, ease: 8.5, community: 8.5 },
    { name: 'Ollama', url: 'https://ollama.ai/', pricing: 'open-source', performance: 8.0, ease: 9.0, community: 9.0 },
    { name: 'Groq', url: 'https://groq.com/', pricing: 'freemium', performance: 10.0, ease: 9.0, community: 8.0 }
  ],
  'vector-databases': [
    { name: 'Pinecone', url: 'https://pinecone.io/', pricing: 'freemium', performance: 9.5, ease: 9.0, community: 9.0 },
    { name: 'Milvus', url: 'https://milvus.io/', pricing: 'open-source', performance: 9.0, ease: 7.5, community: 8.5 },
    { name: 'Qdrant', url: 'https://qdrant.tech/', pricing: 'open-source', performance: 9.0, ease: 8.5, community: 8.5 },
    { name: 'Weaviate', url: 'https://weaviate.io/', pricing: 'open-source', performance: 8.5, ease: 8.0, community: 8.5 },
    { name: 'ChromaDB', url: 'https://trychroma.com/', pricing: 'open-source', performance: 8.0, ease: 9.0, community: 8.5 },
    { name: 'Pgvector', url: 'https://github.com/pgvector/pgvector', pricing: 'open-source', performance: 8.5, ease: 9.0, community: 9.0 }
  ],
  'databases': [
    { name: 'PostgreSQL 17', url: 'https://postgresql.org/', pricing: 'open-source', performance: 9.5, ease: 8.0, community: 10.0 },
    { name: 'MongoDB', url: 'https://mongodb.com/', pricing: 'freemium', performance: 9.0, ease: 8.5, community: 9.5 },
    { name: 'Redis Stack', url: 'https://redis.io/', pricing: 'open-source', performance: 10.0, ease: 8.5, community: 9.5 },
    { name: 'Supabase', url: 'https://supabase.com/', pricing: 'freemium', performance: 8.5, ease: 9.5, community: 9.0 },
    { name: 'PlanetScale', url: 'https://planetscale.com/', pricing: 'freemium', performance: 9.0, ease: 9.0, community: 8.5 },
    { name: 'Neon', url: 'https://neon.tech/', pricing: 'freemium', performance: 8.5, ease: 9.0, community: 8.0 }
  ],
  'backend': [
    { name: 'Next.js 16', url: 'https://nextjs.org/', pricing: 'open-source', performance: 9.0, ease: 9.0, community: 10.0 },
    { name: 'FastAPI', url: 'https://fastapi.tiangolo.com/', pricing: 'open-source', performance: 9.5, ease: 9.0, community: 9.5 },
    { name: 'NestJS', url: 'https://nestjs.com/', pricing: 'open-source', performance: 9.0, ease: 8.5, community: 9.0 },
    { name: 'Django', url: 'https://djangoproject.com/', pricing: 'open-source', performance: 8.5, ease: 8.0, community: 9.5 },
    { name: 'Laravel', url: 'https://laravel.com/', pricing: 'open-source', performance: 8.0, ease: 8.5, community: 9.0 },
    { name: 'Gin (Go)', url: 'https://gin-gonic.com/', pricing: 'open-source', performance: 10.0, ease: 8.0, community: 8.5 }
  ],
  'frontend': [
    { name: 'React 19', url: 'https://react.dev/', pricing: 'open-source', performance: 9.0, ease: 8.5, community: 10.0 },
    { name: 'Vue 3', url: 'https://vuejs.org/', pricing: 'open-source', performance: 9.0, ease: 9.0, community: 9.5 },
    { name: 'SvelteKit', url: 'https://kit.svelte.dev/', pricing: 'open-source', performance: 9.5, ease: 8.5, community: 8.5 },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', pricing: 'open-source', performance: 9.0, ease: 9.5, community: 10.0 },
    { name: 'Shadcn UI', url: 'https://ui.shadcn.com/', pricing: 'open-source', performance: 8.5, ease: 9.0, community: 9.0 },
    { name: 'Three.js', url: 'https://threejs.org/', pricing: 'open-source', performance: 9.0, ease: 7.5, community: 9.0 }
  ],
  'cloud': [
    { name: 'AWS', url: 'https://aws.amazon.com/', pricing: 'paid', performance: 10.0, ease: 7.0, community: 10.0 },
    { name: 'Google Cloud', url: 'https://cloud.google.com/', pricing: 'paid', performance: 10.0, ease: 7.5, community: 9.5 },
    { name: 'Vercel', url: 'https://vercel.com/', pricing: 'freemium', performance: 9.5, ease: 10.0, community: 9.5 },
    { name: 'Railway', url: 'https://railway.app/', pricing: 'freemium', performance: 8.5, ease: 9.5, community: 8.5 },
    { name: 'Fly.io', url: 'https://fly.io/', pricing: 'freemium', performance: 9.0, ease: 9.0, community: 8.5 },
    { name: 'Netlify', url: 'https://netlify.com/', pricing: 'freemium', performance: 9.0, ease: 9.5, community: 9.0 }
  ],
  'security': [
    { name: 'Auth0', url: 'https://auth0.com/', pricing: 'freemium', performance: 9.0, ease: 9.0, community: 9.0 },
    { name: 'Clerk', url: 'https://clerk.com/', pricing: 'freemium', performance: 9.0, ease: 10.0, community: 8.5 },
    { name: 'Supabase Auth', url: 'https://supabase.com/auth', pricing: 'freemium', performance: 8.5, ease: 9.5, community: 9.0 },
    { name: 'Vault', url: 'https://vaultproject.io/', pricing: 'open-source', performance: 9.0, ease: 7.0, community: 8.5 }
  ],
  'api': [
    { name: 'GraphQL', url: 'https://graphql.org/', pricing: 'open-source', performance: 9.0, ease: 7.5, community: 9.5 },
    { name: 'tRPC', url: 'https://trpc.io/', pricing: 'open-source', performance: 9.5, ease: 9.0, community: 9.0 },
    { name: 'gRPC', url: 'https://grpc.io/', pricing: 'open-source', performance: 10.0, ease: 7.0, community: 9.0 },
    { name: 'Postman', url: 'https://postman.com/', pricing: 'freemium', performance: 8.5, ease: 9.5, community: 10.0 }
  ]
};

// =====================================================
// INTEGRATION MAPPINGS
// =====================================================
const INTEGRATIONS = [
  { from: 'Next.js 16', to: 'React 19', type: 'native', difficulty: 'easy' },
  { from: 'Next.js 16', to: 'Vercel', type: 'native', difficulty: 'easy' },
  { from: 'Next.js 16', to: 'PostgreSQL 17', type: 'api', difficulty: 'easy' },
  { from: 'Next.js 16', to: 'Supabase', type: 'native', difficulty: 'easy' },
  { from: 'FastAPI', to: 'PostgreSQL 17', type: 'native', difficulty: 'easy' },
  { from: 'FastAPI', to: 'Redis Stack', type: 'native', difficulty: 'easy' },
  { from: 'React 19', to: 'Tailwind CSS', type: 'native', difficulty: 'easy' },
  { from: 'LangChain', to: 'Pinecone', type: 'native', difficulty: 'easy' },
  { from: 'LangChain', to: 'GPT-4', type: 'native', difficulty: 'easy' },
  { from: 'PostgreSQL 17', to: 'Pgvector', type: 'plugin', difficulty: 'easy' },
  { from: 'Supabase', to: 'PostgreSQL 17', type: 'native', difficulty: 'easy' },
  { from: 'Clerk', to: 'Next.js 16', type: 'native', difficulty: 'easy' }
];

// =====================================================
// IMPORT FUNCTIONS
// =====================================================

async function importCategories() {
  console.log('\n📁 Importing categories...');

  const categories = [
    { name: 'Vision AI', slug: 'vision-ai', icon: 'fa-camera', display_order: 1 },
    { name: 'Generative Video', slug: 'generative-video', icon: 'fa-film', display_order: 2 },
    { name: 'LLMs & AI', slug: 'llms-ai', icon: 'fa-brain', display_order: 3 },
    { name: 'Vector Databases', slug: 'vector-databases', icon: 'fa-database', display_order: 4 },
    { name: 'Databases', slug: 'databases', icon: 'fa-server', display_order: 5 },
    { name: 'Backend', slug: 'backend', icon: 'fa-gears', display_order: 6 },
    { name: 'Frontend', slug: 'frontend', icon: 'fa-desktop', display_order: 7 },
    { name: 'Cloud', slug: 'cloud', icon: 'fa-cloud', display_order: 8 },
    { name: 'Security', slug: 'security', icon: 'fa-shield-halved', display_order: 9 },
    { name: 'APIs', slug: 'api', icon: 'fa-plug', display_order: 10 }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error importing category ${category.name}:`, error.message);
    } else {
      console.log(`✅ Imported: ${category.name}`);
    }
  }
}

async function importTechnologies() {
  console.log('\n💻 Importing technologies...');

  let totalImported = 0;

  for (const [categorySlug, technologies] of Object.entries(TECHNOLOGY_DATA)) {
    console.log(`\n  Category: ${categorySlug}`);

    for (const tech of technologies) {
      const techData = {
        name: tech.name,
        category: categorySlug,
        website_url: tech.url,
        pricing_model: tech.pricing,
        performance_score: tech.performance,
        ease_of_use_score: tech.ease,
        community_score: tech.community,
        deployment_type: ['cloud', 'self-hosted'],
        tech_maturity: 'stable',
        logo_url: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(tech.url).hostname}`,
        description: `${tech.name} - ${categorySlug} technology`,
        metadata: {}
      };

      const { error } = await supabase
        .from('technologies')
        .upsert(techData, { onConflict: 'name' });

      if (error) {
        console.error(`  ❌ Error importing ${tech.name}:`, error.message);
      } else {
        console.log(`  ✅ ${tech.name}`);
        totalImported++;
      }
    }
  }

  console.log(`\n✅ Total technologies imported: ${totalImported}`);
}

async function importIntegrations() {
  console.log('\n🔗 Importing integrations...');

  // Get all technologies to map names to IDs
  const { data: technologies, error: techError } = await supabase
    .from('technologies')
    .select('id, name');

  if (techError) {
    console.error('❌ Error fetching technologies:', techError.message);
    return;
  }

  const techMap = new Map(technologies.map(t => [t.name, t.id]));

  let totalImported = 0;

  for (const integration of INTEGRATIONS) {
    const fromId = techMap.get(integration.from);
    const toId = techMap.get(integration.to);

    if (!fromId || !toId) {
      console.log(`  ⚠️  Skipping ${integration.from} -> ${integration.to} (not found)`);
      continue;
    }

    const { error } = await supabase
      .from('integrations')
      .upsert({
        tech_from_id: fromId,
        tech_to_id: toId,
        integration_type: integration.type,
        difficulty: integration.difficulty,
        is_verified: true
      }, { onConflict: 'tech_from_id,tech_to_id' });

    if (error) {
      console.error(`  ❌ Error: ${integration.from} -> ${integration.to}:`, error.message);
    } else {
      console.log(`  ✅ ${integration.from} -> ${integration.to}`);
      totalImported++;
    }
  }

  console.log(`\n✅ Total integrations imported: ${totalImported}`);
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🚀 VidiSmart SmartStack Data Import\n');
  console.log(`📊 Supabase URL: ${SUPABASE_URL}\n`);

  try {
    await importCategories();
    await importTechnologies();
    await importIntegrations();

    console.log('\n✅ Data import completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Open smartstack-builder.html in your browser');
    console.log('2. Start the AI engine: node smartstack-ai-engine.js');
    console.log('3. Generate your first tech stack!\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
  }
}

main();

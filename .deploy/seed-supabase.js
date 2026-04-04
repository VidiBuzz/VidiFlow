const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jeasmwbberfgztkxfjwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYXNtd2JiZXJmZ3p0a3hmancyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzMjQxNSwiZXhwIjoyMDg2NDA4NDE1fQ.eLKsolLYu16CQzJU-fc3A0ykuBw3VnmmGUb3GHGLsbU';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vision AI & Computer Vision', slug: 'vision-ai', description: 'Computer vision and image recognition technologies', icon: 'Eye', sort_order: 1 },
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Video AI & Generation', slug: 'video-ai', description: 'Video generation and processing technologies', icon: 'Video', sort_order: 2 },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'LLMs & Agentic Orchestration', slug: 'llms', description: 'Large language models and AI orchestration', icon: 'Brain', sort_order: 3 },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Vector Databases & RAG', slug: 'vector-databases', description: 'Vector storage and retrieval systems', icon: 'Database', sort_order: 4 },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Backend Frameworks', slug: 'backend', description: 'Server-side frameworks and tools', icon: 'Server', sort_order: 5 },
    { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Frontend & UI', slug: 'frontend', description: 'Client-side frameworks and UI libraries', icon: 'Layout', sort_order: 6 },
    { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Cloud Platforms', slug: 'cloud', description: 'Cloud hosting and infrastructure', icon: 'Cloud', sort_order: 7 },
];

const technologies = [
    // Vision AI
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'YOLO v11', slug: 'yolo-v11', description: 'Real-time object detection', url: 'https://docs.ultralytics.com/models/yolo11/', icon_url: 'https://www.google.com/s2/favicons?domain=ultralytics.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'MediaPipe', slug: 'mediapipe', description: 'Cross-platform ML solutions', url: 'https://mediapipe.dev/', icon_url: 'https://www.google.com/s2/favicons?domain=mediapipe.dev&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'OpenCV', slug: 'opencv', description: 'Computer vision library', url: 'https://opencv.org/', icon_url: 'https://www.google.com/s2/favicons?domain=opencv.org&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'PyTorch', slug: 'pytorch', description: 'Deep learning framework', url: 'https://pytorch.org/', icon_url: 'https://www.google.com/s2/favicons?domain=pytorch.org&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'TensorRT', slug: 'tensorrt', description: 'High-performance inference', url: 'https://developer.nvidia.com/tensorrt', icon_url: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=64', is_featured: false },
    { category_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Roboflow', slug: 'roboflow', description: 'Computer vision tools', url: 'https://roboflow.com/', icon_url: 'https://www.google.com/s2/favicons?domain=roboflow.com&sz=64', is_featured: false },

    // Video AI
    { category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sora API', slug: 'sora-api', description: 'OpenAI video generation', url: 'https://openai.com/sora', icon_url: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Runway Gen-3', slug: 'runway-gen-3', description: 'AI video generation', url: 'https://runwayml.com/', icon_url: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Luma Dream Machine', slug: 'luma-dream-machine', description: 'Video generation', url: 'https://lumalabs.ai/dream-machine', icon_url: 'https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Pika Labs', slug: 'pika-labs', description: 'Video creation', url: 'https://pika.art/', icon_url: 'https://www.google.com/s2/favicons?domain=pika.art&sz=64', is_featured: true },

    // LLMs
    { category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'GPT-5 (o1)', slug: 'gpt-5', description: 'OpenAI latest model', url: 'https://openai.com/', icon_url: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Claude Sonnet 4.6', slug: 'claude-sonnet', description: 'Anthropic AI assistant', url: 'https://claude.ai/', icon_url: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Gemini 1.5 Pro', slug: 'gemini', description: 'Google multimodal AI', url: 'https://deepmind.google/technologies/gemini/', icon_url: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Llama 3.1', slug: 'llama', description: 'Meta open source LLM', url: 'https://llama.meta.com/', icon_url: 'https://www.google.com/s2/favicons?domain=meta.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'LangChain', slug: 'langchain', description: 'LLM orchestration', url: 'https://langchain.com/', icon_url: 'https://www.google.com/s2/favicons?domain=langchain.com&sz=64', is_featured: true },

    // Vector DBs
    { category_id: '550e8400-e29b-41d4-a716-446655440003', name: 'Pinecone', slug: 'pinecone', description: 'Vector search platform', url: 'https://pinecone.io/', icon_url: 'https://www.google.com/s2/favicons?domain=pinecone.io&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440003', name: 'Milvus', slug: 'milvus', description: 'Open vector database', url: 'https://milvus.io/', icon_url: 'https://www.google.com/s2/favicons?domain=milvus.io&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440003', name: 'Qdrant', slug: 'qdrant', description: 'Vector similarity search', url: 'https://qdrant.tech/', icon_url: 'https://www.google.com/s2/favicons?domain=qdrant.tech&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440003', name: 'Weaviate', slug: 'weaviate', description: 'AI-native vector database', url: 'https://weaviate.io/', icon_url: 'https://www.google.com/s2/favicons?domain=weaviate.io&sz=64', is_featured: true },

    // Backend
    { category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Next.js 16', slug: 'nextjs', description: 'React framework', url: 'https://nextjs.org/', icon_url: 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'FastAPI', slug: 'fastapi', description: 'Python web framework', url: 'https://fastapi.tiangolo.com/', icon_url: 'https://www.google.com/s2/favicons?domain=fastapi.tiangolo.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Django', slug: 'django', description: 'Python web framework', url: 'https://djangoproject.com/', icon_url: 'https://www.google.com/s2/favicons?domain=djangoproject.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'NestJS', slug: 'nestjs', description: 'Node.js framework', url: 'https://nestjs.com/', icon_url: 'https://www.google.com/s2/favicons?domain=nestjs.com&sz=64', is_featured: true },

    // Frontend
    { category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'React 19', slug: 'react', description: 'UI library', url: 'https://react.dev/', icon_url: 'https://www.google.com/s2/favicons?domain=react.dev&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Vue 3', slug: 'vue', description: 'Progressive framework', url: 'https://vuejs.org/', icon_url: 'https://www.google.com/s2/favicons?domain=vuejs.org&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Tailwind CSS', slug: 'tailwind', description: 'Utility-first CSS', url: 'https://tailwindcss.com/', icon_url: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Shadcn UI', slug: 'shadcn', description: 'UI component library', url: 'https://ui.shadcn.com/', icon_url: 'https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64', is_featured: true },

    // Cloud
    { category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'AWS', slug: 'aws', description: 'Amazon Web Services', url: 'https://aws.amazon.com/', icon_url: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Google Cloud', slug: 'gcp', description: 'Google Cloud Platform', url: 'https://cloud.google.com/', icon_url: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Azure', slug: 'azure', description: 'Microsoft Azure', url: 'https://azure.microsoft.com/', icon_url: 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=64', is_featured: true },
    { category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Vercel', slug: 'vercel', description: 'Frontend cloud', url: 'https://vercel.com/', icon_url: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64', is_featured: true },
];

async function seedDatabase() {
    console.log('Seeding Supabase database...');

    // Insert categories
    console.log('Inserting categories...');
    const { error: catError } = await supabase
        .from('tech_categories')
        .upsert(categories, { onConflict: 'id' });

    if (catError) {
        console.error('Error inserting categories:', catError);
        return;
    }
    console.log('✓ Categories inserted');

    // Insert technologies
    console.log('Inserting technologies...');
    const { error: techError } = await supabase
        .from('technologies')
        .upsert(technologies, { onConflict: 'slug' });

    if (techError) {
        console.error('Error inserting technologies:', techError);
        return;
    }
    console.log('✓ Technologies inserted');

    console.log('\n✅ Database seeded successfully!');
    console.log(`- ${categories.length} categories`);
    console.log(`- ${technologies.length} technologies`);
}

seedDatabase().catch(console.error);

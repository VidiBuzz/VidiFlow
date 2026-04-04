// Static fallback data for Smart Stack when database is unavailable
import { Category } from '@/components/smart-stack/TechStackGrid';
import { Technology } from '@/components/smart-stack/TechCard';

export const staticCategories: Category[] = [
    {
        category_id: 'vision-ai',
        category_name: 'Vision AI & Computer Vision',
        category_slug: 'vision-ai',
        category_display_name: 'Vision AI & Computer Vision',
        category_icon: 'Eye',
        sort_order: 1,
        technology_count: 6,
        technologies: [
            { id: 'yolo', name: 'YOLO v11', slug: 'yolo-v11', display_name: 'YOLO v11', description: 'Real-time object detection', website_url: 'https://docs.ultralytics.com/models/yolo11/', logo_url: 'https://www.google.com/s2/favicons?domain=ultralytics.com&sz=64', is_featured: true },
            { id: 'mediapipe', name: 'MediaPipe', slug: 'mediapipe', display_name: 'MediaPipe', description: 'Cross-platform ML solutions', website_url: 'https://mediapipe.dev/', logo_url: 'https://www.google.com/s2/favicons?domain=mediapipe.dev&sz=64', is_featured: true },
            { id: 'opencv', name: 'OpenCV', slug: 'opencv', display_name: 'OpenCV', description: 'Computer vision library', website_url: 'https://opencv.org/', logo_url: 'https://www.google.com/s2/favicons?domain=opencv.org&sz=64', is_featured: true },
            { id: 'pytorch', name: 'PyTorch', slug: 'pytorch', display_name: 'PyTorch', description: 'Deep learning framework', website_url: 'https://pytorch.org/', logo_url: 'https://www.google.com/s2/favicons?domain=pytorch.org&sz=64', is_featured: true },
            { id: 'tensorrt', name: 'TensorRT', slug: 'tensorrt', display_name: 'TensorRT', description: 'High-performance inference', website_url: 'https://developer.nvidia.com/tensorrt', logo_url: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=64', is_featured: false },
            { id: 'roboflow', name: 'Roboflow', slug: 'roboflow', display_name: 'Roboflow', description: 'Computer vision tools', website_url: 'https://roboflow.com/', logo_url: 'https://www.google.com/s2/favicons?domain=roboflow.com&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'video-ai',
        category_name: 'Video AI & Generation',
        category_slug: 'video-ai',
        category_display_name: 'Video AI & Generation',
        category_icon: 'Video',
        sort_order: 2,
        technology_count: 6,
        technologies: [
            { id: 'sora', name: 'Sora API', slug: 'sora-api', display_name: 'Sora API', description: 'OpenAI video generation', website_url: 'https://openai.com/sora', logo_url: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64', is_featured: true },
            { id: 'runway', name: 'Runway Gen-3', slug: 'runway-gen-3', display_name: 'Runway Gen-3', description: 'AI video generation', website_url: 'https://runwayml.com/', logo_url: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=64', is_featured: true },
            { id: 'luma', name: 'Luma Dream Machine', slug: 'luma-dream-machine', display_name: 'Luma Dream Machine', description: 'Video generation', website_url: 'https://lumalabs.ai/dream-machine', logo_url: 'https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=64', is_featured: true },
            { id: 'pika', name: 'Pika Labs', slug: 'pika-labs', display_name: 'Pika Labs', description: 'Video creation', website_url: 'https://pika.art/', logo_url: 'https://www.google.com/s2/favicons?domain=pika.art&sz=64', is_featured: true },
            { id: 'heygen', name: 'HeyGen', slug: 'heygen', display_name: 'HeyGen', description: 'AI video avatars', website_url: 'https://heygen.com/', logo_url: 'https://www.google.com/s2/favicons?domain=heygen.com&sz=64', is_featured: false },
            { id: 'synthesia', name: 'Synthesia', slug: 'synthesia', display_name: 'Synthesia', description: 'AI video generation', website_url: 'https://synthesia.io/', logo_url: 'https://www.google.com/s2/favicons?domain=synthesia.io&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'llms',
        category_name: 'LLMs & Agentic Orchestration',
        category_slug: 'llms',
        category_display_name: 'LLMs & Agentic Orchestration',
        category_icon: 'Brain',
        sort_order: 3,
        technology_count: 6,
        technologies: [
            { id: 'gpt5', name: 'GPT-5 (o1)', slug: 'gpt-5', display_name: 'GPT-5 (o1)', description: 'OpenAI latest model', website_url: 'https://openai.com/', logo_url: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64', is_featured: true },
            { id: 'claude', name: 'Claude Sonnet 4.6', slug: 'claude-sonnet', display_name: 'Claude Sonnet 4.6', description: 'Anthropic AI assistant', website_url: 'https://claude.ai/', logo_url: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64', is_featured: true },
            { id: 'gemini', name: 'Gemini 1.5 Pro', slug: 'gemini', display_name: 'Gemini 1.5 Pro', description: 'Google multimodal AI', website_url: 'https://deepmind.google/technologies/gemini/', logo_url: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=64', is_featured: true },
            { id: 'llama', name: 'Llama 3.1', slug: 'llama', display_name: 'Llama 3.1', description: 'Meta open source LLM', website_url: 'https://llama.meta.com/', logo_url: 'https://www.google.com/s2/favicons?domain=meta.com&sz=64', is_featured: true },
            { id: 'langchain', name: 'LangChain', slug: 'langchain', display_name: 'LangChain', description: 'LLM orchestration', website_url: 'https://langchain.com/', logo_url: 'https://www.google.com/s2/favicons?domain=langchain.com&sz=64', is_featured: true },
            { id: 'ollama', name: 'Ollama', slug: 'ollama', display_name: 'Ollama', description: 'Run LLMs locally', website_url: 'https://ollama.ai/', logo_url: 'https://www.google.com/s2/favicons?domain=ollama.ai&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'vector-db',
        category_name: 'Vector Databases & RAG',
        category_slug: 'vector-databases',
        category_display_name: 'Vector Databases & RAG',
        category_icon: 'Database',
        sort_order: 4,
        technology_count: 6,
        technologies: [
            { id: 'pinecone', name: 'Pinecone', slug: 'pinecone', display_name: 'Pinecone', description: 'Vector search platform', website_url: 'https://pinecone.io/', logo_url: 'https://www.google.com/s2/favicons?domain=pinecone.io&sz=64', is_featured: true },
            { id: 'milvus', name: 'Milvus', slug: 'milvus', display_name: 'Milvus', description: 'Open vector database', website_url: 'https://milvus.io/', logo_url: 'https://www.google.com/s2/favicons?domain=milvus.io&sz=64', is_featured: true },
            { id: 'qdrant', name: 'Qdrant', slug: 'qdrant', display_name: 'Qdrant', description: 'Vector similarity search', website_url: 'https://qdrant.tech/', logo_url: 'https://www.google.com/s2/favicons?domain=qdrant.tech&sz=64', is_featured: true },
            { id: 'weaviate', name: 'Weaviate', slug: 'weaviate', display_name: 'Weaviate', description: 'AI-native vector database', website_url: 'https://weaviate.io/', logo_url: 'https://www.google.com/s2/favicons?domain=weaviate.io&sz=64', is_featured: true },
            { id: 'chroma', name: 'ChromaDB', slug: 'chromadb', display_name: 'ChromaDB', description: 'AI-native embedding database', website_url: 'https://trychroma.com/', logo_url: 'https://www.google.com/s2/favicons?domain=trychroma.com&sz=64', is_featured: false },
            { id: 'pgvector', name: 'Pgvector', slug: 'pgvector', display_name: 'Pgvector', description: 'Postgres vector extension', website_url: 'https://github.com/pgvector/pgvector', logo_url: 'https://www.google.com/s2/favicons?domain=github.com&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'backend',
        category_name: 'Backend Frameworks',
        category_slug: 'backend',
        category_display_name: 'Backend Frameworks',
        category_icon: 'Server',
        sort_order: 5,
        technology_count: 6,
        technologies: [
            { id: 'nextjs', name: 'Next.js 16', slug: 'nextjs', display_name: 'Next.js 16', description: 'React framework', website_url: 'https://nextjs.org/', logo_url: 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=64', is_featured: true },
            { id: 'fastapi', name: 'FastAPI', slug: 'fastapi', display_name: 'FastAPI', description: 'Python web framework', website_url: 'https://fastapi.tiangolo.com/', logo_url: 'https://www.google.com/s2/favicons?domain=fastapi.tiangolo.com&sz=64', is_featured: true },
            { id: 'django', name: 'Django', slug: 'django', display_name: 'Django', description: 'Python web framework', website_url: 'https://djangoproject.com/', logo_url: 'https://www.google.com/s2/favicons?domain=djangoproject.com&sz=64', is_featured: true },
            { id: 'nestjs', name: 'NestJS', slug: 'nestjs', display_name: 'NestJS', description: 'Node.js framework', website_url: 'https://nestjs.com/', logo_url: 'https://www.google.com/s2/favicons?domain=nestjs.com&sz=64', is_featured: true },
            { id: 'spring', name: 'Spring Boot', slug: 'spring-boot', display_name: 'Spring Boot', description: 'Java framework', website_url: 'https://spring.io/projects/spring-boot', logo_url: 'https://www.google.com/s2/favicons?domain=spring.io&sz=64', is_featured: false },
            { id: 'laravel', name: 'Laravel', slug: 'laravel', display_name: 'Laravel', description: 'PHP framework', website_url: 'https://laravel.com/', logo_url: 'https://www.google.com/s2/favicons?domain=laravel.com&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'frontend',
        category_name: 'Frontend & UI',
        category_slug: 'frontend',
        category_display_name: 'Frontend & UI',
        category_icon: 'Layout',
        sort_order: 6,
        technology_count: 6,
        technologies: [
            { id: 'react', name: 'React 19', slug: 'react', display_name: 'React 19', description: 'UI library', website_url: 'https://react.dev/', logo_url: 'https://www.google.com/s2/favicons?domain=react.dev&sz=64', is_featured: true },
            { id: 'vue', name: 'Vue 3', slug: 'vue', display_name: 'Vue 3', description: 'Progressive framework', website_url: 'https://vuejs.org/', logo_url: 'https://www.google.com/s2/favicons?domain=vuejs.org&sz=64', is_featured: true },
            { id: 'tailwind', name: 'Tailwind CSS', slug: 'tailwind', display_name: 'Tailwind CSS', description: 'Utility-first CSS', website_url: 'https://tailwindcss.com/', logo_url: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64', is_featured: true },
            { id: 'shadcn', name: 'Shadcn UI', slug: 'shadcn', display_name: 'Shadcn UI', description: 'UI component library', website_url: 'https://ui.shadcn.com/', logo_url: 'https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64', is_featured: true },
            { id: 'framer', name: 'Framer Motion', slug: 'framer-motion', display_name: 'Framer Motion', description: 'Animation library', website_url: 'https://framer.com/motion/', logo_url: 'https://www.google.com/s2/favicons?domain=framer.com&sz=64', is_featured: false },
            { id: 'threejs', name: 'Three.js', slug: 'threejs', display_name: 'Three.js', description: '3D library', website_url: 'https://threejs.org/', logo_url: 'https://www.google.com/s2/favicons?domain=threejs.org&sz=64', is_featured: false },
        ] as Technology[]
    },
    {
        category_id: 'cloud',
        category_name: 'Cloud Platforms',
        category_slug: 'cloud',
        category_display_name: 'Cloud Platforms',
        category_icon: 'Cloud',
        sort_order: 7,
        technology_count: 6,
        technologies: [
            { id: 'aws', name: 'AWS', slug: 'aws', display_name: 'AWS', description: 'Amazon Web Services', website_url: 'https://aws.amazon.com/', logo_url: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64', is_featured: true },
            { id: 'gcp', name: 'Google Cloud', slug: 'gcp', display_name: 'Google Cloud', description: 'Google Cloud Platform', website_url: 'https://cloud.google.com/', logo_url: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64', is_featured: true },
            { id: 'azure', name: 'Azure', slug: 'azure', display_name: 'Azure', description: 'Microsoft Azure', website_url: 'https://azure.microsoft.com/', logo_url: 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=64', is_featured: true },
            { id: 'vercel', name: 'Vercel', slug: 'vercel', display_name: 'Vercel', description: 'Frontend cloud', website_url: 'https://vercel.com/', logo_url: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=64', is_featured: true },
            { id: 'firebase', name: 'Firebase', slug: 'firebase', display_name: 'Firebase', description: 'Google app platform', website_url: 'https://firebase.google.com/', logo_url: 'https://www.google.com/s2/favicons?domain=firebase.google.com&sz=64', is_featured: false },
            { id: 'supabase', name: 'Supabase', slug: 'supabase', display_name: 'Supabase', description: 'Open source Firebase', website_url: 'https://supabase.com/', logo_url: 'https://www.google.com/s2/favicons?domain=supabase.com&sz=64', is_featured: false },
        ] as Technology[]
    },
];

/**
 * VidiSmart SmartStack AI Engine
 * AI-Powered Enterprise Tech Stack Assembly
 *
 * This backend service:
 * 1. Analyzes use cases and requirements
 * 2. Recommends optimal technology stacks
 * 3. Generates architecture diagrams
 * 4. Calculates cost estimates
 * 5. Provides integration compatibility checks
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// CONFIGURATION
// =====================================================
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jeasmwbberfgztkxfjwr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sbp_229e5b28acf95c33a6a6d611683962149eb327bd';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// TECH STACK KNOWLEDGE BASE
// =====================================================
const STACK_PATTERNS = {
  'ai-video-pipeline': {
    layers: ['vision-ai', 'backend', 'database', 'storage', 'hosting'],
    recommended: {
      'vision-ai': ['YOLO v11', 'MediaPipe', 'OpenCV'],
      'backend': ['FastAPI', 'Django', 'NestJS'],
      'database': ['PostgreSQL 17', 'MongoDB', 'Redis Stack'],
      'storage': ['AWS S3', 'Cloudflare R2', 'MinIO'],
      'hosting': ['AWS', 'Google Cloud', 'Railway']
    },
    budget_tiers: {
      'low': { max: 500, preference: 'open-source' },
      'medium': { max: 2000, preference: 'cloud' },
      'high': { max: 10000, preference: 'enterprise' }
    }
  },
  'ecommerce-platform': {
    layers: ['frontend', 'backend', 'database', 'payment', 'hosting', 'cdn'],
    recommended: {
      'frontend': ['Next.js 16', 'Vue 3', 'SvelteKit'],
      'backend': ['NestJS', 'FastAPI', 'Laravel'],
      'database': ['PostgreSQL 17', 'MongoDB', 'Supabase'],
      'payment': ['Stripe', 'PayPal', 'Square'],
      'hosting': ['Vercel', 'Netlify', 'Railway'],
      'cdn': ['Cloudflare', 'AWS CloudFront', 'Fastly']
    }
  },
  'saas-app': {
    layers: ['frontend', 'backend', 'database', 'auth', 'billing', 'hosting', 'monitoring'],
    recommended: {
      'frontend': ['React 19', 'Next.js 16', 'SvelteKit'],
      'backend': ['NestJS', 'FastAPI', 'Go Gin'],
      'database': ['PostgreSQL 17', 'Supabase', 'PlanetScale'],
      'auth': ['Clerk', 'Auth0', 'Supabase Auth'],
      'billing': ['Stripe', 'Paddle', 'LemonSqueezy'],
      'hosting': ['Vercel', 'Railway', 'Fly.io'],
      'monitoring': ['Sentry', 'LogRocket', 'Datadog']
    }
  },
  'ai-chatbot-support': {
    layers: ['llm', 'vector-db', 'backend', 'frontend', 'hosting'],
    recommended: {
      'llm': ['GPT-4', 'Claude Sonnet 4.5', 'Llama 3.1'],
      'vector-db': ['Pinecone', 'Weaviate', 'Qdrant'],
      'backend': ['LangChain', 'FastAPI', 'NestJS'],
      'frontend': ['React 19', 'Next.js 16', 'Vue 3'],
      'hosting': ['Vercel', 'Railway', 'AWS']
    }
  },
  'realtime-analytics': {
    layers: ['frontend', 'backend', 'streaming', 'database', 'visualization', 'hosting'],
    recommended: {
      'frontend': ['React 19', 'Vue 3', 'D3.js'],
      'backend': ['FastAPI', 'NestJS', 'Go Gin'],
      'streaming': ['Apache Kafka', 'Redpanda', 'NATS'],
      'database': ['ClickHouse', 'TimescaleDB', 'InfluxDB'],
      'visualization': ['Grafana', 'Metabase', 'Superset'],
      'hosting': ['AWS', 'Google Cloud', 'DigitalOcean']
    }
  },
  'mobile-app-backend': {
    layers: ['mobile', 'backend', 'database', 'auth', 'storage', 'hosting', 'push'],
    recommended: {
      'mobile': ['React Native', 'Flutter', 'Expo'],
      'backend': ['NestJS', 'FastAPI', 'Supabase'],
      'database': ['PostgreSQL 17', 'MongoDB', 'Supabase'],
      'auth': ['Firebase Auth', 'Clerk', 'Supabase Auth'],
      'storage': ['AWS S3', 'Cloudflare R2', 'Supabase Storage'],
      'hosting': ['Railway', 'Fly.io', 'AWS'],
      'push': ['OneSignal', 'Firebase Cloud Messaging', 'Pusher']
    }
  }
};

// =====================================================
// COMPATIBILITY MATRIX
// =====================================================
const COMPATIBILITY_RULES = {
  'Next.js 16': {
    compatible: ['PostgreSQL 17', 'MongoDB', 'Supabase', 'Vercel', 'Clerk', 'Stripe'],
    optimal: ['React 19', 'Tailwind CSS', 'tRPC', 'Prisma'],
    incompatible: []
  },
  'FastAPI': {
    compatible: ['PostgreSQL 17', 'MongoDB', 'Redis Stack', 'SQLAlchemy', 'Pydantic'],
    optimal: ['Python 3.13', 'Uvicorn', 'PostgreSQL 17', 'Redis Stack'],
    incompatible: []
  },
  'React Native': {
    compatible: ['Expo', 'Firebase', 'Supabase', 'OneSignal'],
    optimal: ['Expo', 'React 19', 'TypeScript 5.x'],
    incompatible: []
  }
};

// =====================================================
// API ENDPOINTS
// =====================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'SmartStack AI Engine', version: '1.0.0' });
});

/**
 * Generate tech stack based on use case
 */
app.post('/api/generate-stack', async (req, res) => {
  try {
    const { useCaseSlug, budget, complexity, industry, customRequirements } = req.body;

    if (!useCaseSlug) {
      return res.status(400).json({ error: 'useCaseSlug is required' });
    }

    console.log(`[AI Engine] Generating stack for: ${useCaseSlug}`);

    // 1. Get use case from database
    const { data: useCase, error: ucError } = await supabase
      .from('use_cases')
      .select('*')
      .eq('slug', useCaseSlug)
      .single();

    if (ucError || !useCase) {
      return res.status(404).json({ error: 'Use case not found' });
    }

    // 2. Check for existing stacks
    const { data: existingStacks } = await supabase
      .from('smart_stacks')
      .select('*')
      .eq('use_case_id', useCase.id)
      .eq('is_verified', true)
      .order('ai_confidence_score', { ascending: false })
      .limit(1);

    if (existingStacks && existingStacks.length > 0) {
      console.log('[AI Engine] Returning existing verified stack');
      return res.json({
        stack: existingStacks[0],
        source: 'database',
        confidence: existingStacks[0].ai_confidence_score
      });
    }

    // 3. Generate new stack using AI
    const generatedStack = await generateStackWithAI(useCase, budget, complexity, customRequirements);

    // 4. Save to database
    const { data: savedStack, error: saveError } = await supabase
      .from('smart_stacks')
      .insert([generatedStack])
      .select()
      .single();

    if (saveError) {
      console.error('[AI Engine] Error saving stack:', saveError);
    }

    res.json({
      stack: savedStack || generatedStack,
      source: 'ai-generated',
      confidence: generatedStack.ai_confidence_score
    });

  } catch (error) {
    console.error('[AI Engine] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze compatibility between technologies
 */
app.post('/api/analyze-compatibility', async (req, res) => {
  try {
    const { technologyIds } = req.body;

    if (!technologyIds || !Array.isArray(technologyIds)) {
      return res.status(400).json({ error: 'technologyIds array is required' });
    }

    // Get technologies from database
    const { data: technologies, error } = await supabase
      .from('technologies')
      .select('*')
      .in('id', technologyIds);

    if (error) throw error;

    // Check compatibility matrix
    const compatibility = analyzeCompatibility(technologies);

    res.json({
      compatible: compatibility.compatible,
      warnings: compatibility.warnings,
      suggestions: compatibility.suggestions,
      score: compatibility.score
    });

  } catch (error) {
    console.error('[AI Engine] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get cost estimate for a stack
 */
app.post('/api/estimate-cost', async (req, res) => {
  try {
    const { technologyIds, usageLevel } = req.body;

    const { data: technologies, error } = await supabase
      .from('technologies')
      .select('*')
      .in('id', technologyIds);

    if (error) throw error;

    const estimate = calculateCostEstimate(technologies, usageLevel || 'medium');

    res.json(estimate);

  } catch (error) {
    console.error('[AI Engine] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get architecture diagram for a stack
 */
app.post('/api/generate-diagram', async (req, res) => {
  try {
    const { stackId, technologyIds } = req.body;

    let technologies;
    if (stackId) {
      // Get from existing stack
      const { data: stack } = await supabase
        .from('smart_stacks')
        .select('*, stack_components(*, technologies(*))')
        .eq('id', stackId)
        .single();

      technologies = stack?.stack_components?.map(sc => sc.technologies) || [];
    } else if (technologyIds) {
      // Get technologies directly
      const { data } = await supabase
        .from('technologies')
        .select('*')
        .in('id', technologyIds);

      technologies = data || [];
    }

    const diagram = generateArchitectureDiagram(technologies);

    res.json(diagram);

  } catch (error) {
    console.error('[AI Engine] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search technologies with AI recommendations
 */
app.post('/api/search-technologies', async (req, res) => {
  try {
    const { query, category, filters } = req.body;

    let dbQuery = supabase.from('technologies').select('*');

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (filters?.pricingModel) {
      dbQuery = dbQuery.eq('pricing_model', filters.pricingModel);
    }

    const { data: technologies, error } = await dbQuery.limit(50);

    if (error) throw error;

    res.json({
      technologies,
      count: technologies.length,
      recommendations: getAIRecommendations(technologies, query)
    });

  } catch (error) {
    console.error('[AI Engine] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// AI LOGIC FUNCTIONS
// =====================================================

/**
 * Generate a complete tech stack using AI reasoning
 */
async function generateStackWithAI(useCase, budget, complexity, customRequirements) {
  const pattern = STACK_PATTERNS[useCase.slug] || STACK_PATTERNS['saas-app'];

  // Select technologies for each layer
  const selectedTechnologies = [];
  const architectureLayers = [];

  for (const layer of pattern.layers) {
    const options = pattern.recommended[layer] || [];

    // Get technology from database
    const { data: techs } = await supabase
      .from('technologies')
      .select('*')
      .in('name', options)
      .limit(3);

    if (techs && techs.length > 0) {
      // Select best technology for this layer based on budget and complexity
      const selected = selectBestTechnology(techs, budget, complexity);
      selectedTechnologies.push(selected);

      architectureLayers.push({
        layer,
        technology: selected.name,
        position: pattern.layers.indexOf(layer)
      });
    }
  }

  // Calculate estimates
  const costEstimate = calculateCostEstimate(selectedTechnologies, 'medium');
  const setupTime = estimateSetupTime(selectedTechnologies, complexity);

  // Build architecture diagram
  const diagram = generateArchitectureDiagram(selectedTechnologies);

  return {
    name: `${useCase.name} - AI Generated Stack`,
    use_case_id: useCase.id,
    description: `AI-generated tech stack optimized for ${useCase.name}`,
    architecture_diagram: diagram,
    technology_ids: selectedTechnologies.map(t => t.id),
    stack_config: {
      layers: architectureLayers,
      pattern: useCase.slug,
      customRequirements
    },
    estimated_cost_monthly_usd: costEstimate.monthly,
    setup_time_hours: setupTime,
    complexity_score: calculateComplexityScore(selectedTechnologies),
    ai_confidence_score: 0.85,
    is_verified: false,
    is_public: true,
    created_by: 'ai-engine'
  };
}

/**
 * Select best technology based on criteria
 */
function selectBestTechnology(technologies, budget, complexity) {
  // Scoring algorithm
  return technologies.reduce((best, current) => {
    const currentScore =
      (current.performance_score || 5) * 0.4 +
      (current.ease_of_use_score || 5) * 0.3 +
      (current.community_score || 5) * 0.3;

    const bestScore =
      (best.performance_score || 5) * 0.4 +
      (best.ease_of_use_score || 5) * 0.3 +
      (best.community_score || 5) * 0.3;

    return currentScore > bestScore ? current : best;
  });
}

/**
 * Analyze compatibility between technologies
 */
function analyzeCompatibility(technologies) {
  const warnings = [];
  const suggestions = [];
  let compatibilityScore = 100;

  for (let i = 0; i < technologies.length; i++) {
    for (let j = i + 1; j < technologies.length; j++) {
      const tech1 = technologies[i];
      const tech2 = technologies[j];

      const rules1 = COMPATIBILITY_RULES[tech1.name];
      const rules2 = COMPATIBILITY_RULES[tech2.name];

      if (rules1?.incompatible?.includes(tech2.name)) {
        warnings.push(`${tech1.name} is incompatible with ${tech2.name}`);
        compatibilityScore -= 20;
      }

      if (rules1?.optimal?.includes(tech2.name)) {
        suggestions.push(`${tech1.name} works optimally with ${tech2.name}`);
        compatibilityScore += 5;
      }
    }
  }

  return {
    compatible: compatibilityScore >= 60,
    warnings,
    suggestions,
    score: Math.min(100, Math.max(0, compatibilityScore))
  };
}

/**
 * Calculate cost estimate
 */
function calculateCostEstimate(technologies, usageLevel) {
  const baseCosts = {
    'free': 0,
    'freemium': 25,
    'paid': 100,
    'enterprise': 500,
    'open-source': 10 // hosting/infrastructure cost
  };

  const usageMultipliers = {
    'low': 0.5,
    'medium': 1.0,
    'high': 2.5,
    'enterprise': 5.0
  };

  const multiplier = usageMultipliers[usageLevel] || 1.0;

  const monthlyCost = technologies.reduce((sum, tech) => {
    const baseCost = baseCosts[tech.pricing_model] || 50;
    return sum + (baseCost * multiplier);
  }, 0);

  return {
    monthly: Math.round(monthlyCost),
    annual: Math.round(monthlyCost * 12 * 0.9), // 10% discount for annual
    breakdown: technologies.map(tech => ({
      name: tech.name,
      cost: Math.round((baseCosts[tech.pricing_model] || 50) * multiplier)
    }))
  };
}

/**
 * Estimate setup time
 */
function estimateSetupTime(technologies, complexity) {
  const baseHours = {
    'simple': 20,
    'moderate': 60,
    'complex': 120,
    'enterprise': 240
  };

  const techComplexity = technologies.length * 8; // 8 hours per technology
  return (baseHours[complexity] || 60) + techComplexity;
}

/**
 * Calculate complexity score
 */
function calculateComplexityScore(technologies) {
  return Math.min(10, technologies.length * 0.8);
}

/**
 * Generate architecture diagram
 */
function generateArchitectureDiagram(technologies) {
  const nodes = technologies.map((tech, index) => ({
    id: tech.id,
    type: 'technology',
    data: {
      label: tech.name,
      category: tech.category,
      icon: tech.logo_url
    },
    position: {
      x: 250,
      y: index * 120
    }
  }));

  // Generate edges (connections between nodes)
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
      animated: true
    });
  }

  return { nodes, edges };
}

/**
 * Get AI recommendations
 */
function getAIRecommendations(technologies, query) {
  // Simple recommendation logic
  return technologies.slice(0, 3).map(tech => ({
    technology: tech.name,
    reason: `High performance and community support for ${query || 'your use case'}`
  }));
}

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log(`\n🚀 VidiSmart SmartStack AI Engine running on port ${PORT}`);
  console.log(`📊 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🧠 AI-powered tech stack generation ready\n`);
});

module.exports = app;

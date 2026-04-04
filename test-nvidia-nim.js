/**
 * NVIDIA NIM API Test Script
 * Run: node test-nvidia-nim.js
 * 
 * Set your API key: set NVIDIA_API_KEY=your-key-here (Windows)
 * Or: export NVIDIA_API_KEY=your-key-here (Mac/Linux)
 */

const API_KEY = process.env.NVIDIA_API_KEY;

if (!API_KEY) {
  console.error('❌ Please set NVIDIA_API_KEY environment variable');
  console.log('Windows: set NVIDIA_API_KEY=your-key-here');
  console.log('Mac/Linux: export NVIDIA_API_KEY=your-key-here');
  process.exit(1);
}

const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Test models - try different ones if first fails
const testModels = [
  'moonshotai/kimi-k2.5',
  'nvidia/nemotron-3-mini-nemotron-3-mini-4b-hf',
  'mistralai/mixtral-8x7b-instruct-v0.1'
];

async function testNIM() {
  console.log('🧪 Testing NVIDIA NIM API...\n');
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  // First, list available models
  console.log('📋 Fetching available models...');
  try {
    const modelsRes = await fetch(`${BASE_URL}/models`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!modelsRes.ok) {
      throw new Error(`Models check failed: ${modelsRes.status}`);
    }

    const modelsData = await modelsRes.json();
    console.log('✅ Models endpoint accessible!');
    console.log('Available models:', modelsData.data?.map(m => m.id).join(', ') || 'Check response');
  } catch (err) {
    console.log('⚠️ Models endpoint error (may be normal):', err.message);
  }

  // Test chat completion with each model
  for (const model of testModels) {
    console.log(`\n--- Testing model: ${model} ---`);
    try {
      const startTime = Date.now();

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say "Hello from NVIDIA NIM!" in 5 words or less.' }],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.text();
        console.log(`❌ ${model}: HTTP ${response.status}`);
        console.log(`   Error: ${error.substring(0, 200)}`);
        continue;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';

      console.log(`✅ ${model} working!`);
      console.log(`   Response: ${reply}`);
      console.log(`   Latency: ${latency}ms`);

      // Success! Exit after first working model
      console.log('\n🎉 NVIDIA NIM is configured correctly!');
      process.exit(0);

    } catch (err) {
      console.log(`❌ ${model}: ${err.message}`);
    }
  }

  console.log('\n⚠️ No models responded successfully.');
  console.log('Check:');
  console.log('  1. Your API key is valid at https://build.nvidia.com');
  console.log('  2. You have quota/credits for NIM models');
  console.log('  3. Your region is supported by NVIDIA NIM');

  process.exit(1);
}

testNIM();

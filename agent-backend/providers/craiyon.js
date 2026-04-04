const fetch = require('node-fetch');

// Craiyon's public API is blocked (403 on all versions as of 2026)
// Using Hugging Face free inference API as replacement
// Free tier: ~1000 requests/month, no credit card needed
// Get token at: https://huggingface.co/settings/tokens (free account)

const HF_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

module.exports = async function craiyon(prompt, apiKey) {
  // apiKey here = HuggingFace token (stored as 'craiyon' provider key in DB)
  const token = apiKey || process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    throw new Error('HuggingFace token required — get a free one at huggingface.co/settings/tokens');
  }

  const resp = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { num_inference_steps: 20 }
    }),
    timeout: 90000,
  });

  if (resp.status === 503) throw new Error('HuggingFace model loading — wait 30s and retry');
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`HuggingFace ${resp.status}: ${err.substring(0, 100)}`);
  }

  const buffer = await resp.buffer();
  return { type: 'base64', data: `data:image/jpeg;base64,${buffer.toString('base64')}` };
};

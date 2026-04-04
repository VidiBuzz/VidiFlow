const fetch = require('node-fetch');

module.exports = async function seedance(prompt, apiKey) {
  if (!apiKey) throw new Error('Seedance API key required');

  // Seedance image generation endpoint
  const resp = await fetch('https://api.seedance.ai/v1/images/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, width: 1280, height: 720 })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Seedance ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  const imageUrl = json.data?.[0]?.url || json.url;
  if (!imageUrl) throw new Error('Seedance returned no image URL');

  return { type: 'url', data: imageUrl };
};

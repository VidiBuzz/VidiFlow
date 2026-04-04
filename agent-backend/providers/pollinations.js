const fetch = require('node-fetch');

module.exports = async function pollinations(prompt, apiKey) {
  const encoded = encodeURIComponent(prompt);
  // No width/height params — they trigger slow generation that times out
  // Use enhance=true for better quality, nologo=true to remove watermark
  const url = `https://image.pollinations.ai/prompt/${encoded}?nologo=true&enhance=true`;

  const resp = await fetch(url, {
    timeout: 90000, // 90s — Pollinations can be slow
    headers: {
      'Referer': 'https://vidismart.com',
      'User-Agent': 'Mozilla/5.0 SmartGen/1.0'
    }
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error('Pollinations rate limited — try again in 30 seconds');
    throw new Error(`Pollinations ${resp.status}`);
  }

  const buffer = await resp.buffer();
  return { type: 'base64', data: `data:image/jpeg;base64,${buffer.toString('base64')}` };
};

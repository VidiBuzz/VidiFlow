const fetch = require('node-fetch');

// gemini-2.5-flash-image supports image generation on free tier via generateContent
// imagen-4.0 requires paid plan
const MODEL = 'gemini-2.5-flash-image';

module.exports = async function gemini(prompt, apiKey) {
  if (!apiKey) throw new Error('Gemini API key required');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Generate a photorealistic image: ${prompt}` }]
      }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    })
  });

  if (resp.status === 429) throw new Error('Gemini rate limited — wait 60 seconds and retry');
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData?.data);

  if (!imgPart) throw new Error('Gemini returned no image — try again');

  const { mimeType, data } = imgPart.inlineData;
  return { type: 'base64', data: `data:${mimeType};base64,${data}` };
};

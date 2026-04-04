const fetch = require('node-fetch');

module.exports = async function openai(prompt, apiKey) {
  if (!apiKey) throw new Error('OpenAI key required');

  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard'
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  return { type: 'url', data: json.data[0].url };
};

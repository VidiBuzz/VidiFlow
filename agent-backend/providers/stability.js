const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async function stability(prompt, apiKey) {
  if (!apiKey) throw new Error('Stability AI key required');

  const fd = new FormData();
  fd.append('prompt', prompt);
  fd.append('output_format', 'png');
  fd.append('aspect_ratio', '16:9');

  const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/*', ...fd.getHeaders() },
    body: fd
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Stability ${resp.status}: ${err}`);
  }

  const buffer = await resp.buffer();
  return { type: 'base64', data: `data:image/png;base64,${buffer.toString('base64')}` };
};

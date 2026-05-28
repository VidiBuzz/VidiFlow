const express = require('express');
const router = express.Router();

/**
 * POST /api/chat - Kimi K2.6 via NVIDIA NIM API
 */
router.post('/chat', async (req, res) => {
  const input = req.body.messages || [];
  const payload = {
    model: process.env.KIMI_K2_6_MODEL_ID || 'meta-llama/Llama-3.3-NI',
    messages: [
      { role: 'system', content: 'You are VidiSmart AI. Be helpful, accurate, and concise.' },
      ...input.slice(-3)
    ],
    max_tokens: req.body.maxTokens || 1024,
    temperature: req.body.temperature || 0.7,
    stream: false
  };

  try {
    const response = await (async () => {
      if (process.env.NVIDIA_NIM_API_KEY) {
        // Production: NVIDIA NIM API
        return new Promise((resolve, reject) => {
          const options = {
            hostname: 'integrate.api.nvidia.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          };

          const req = require('http').request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk });
            res.on('end', () => {
              try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
            });
          });

          req.on('error', reject);
          req.write(JSON.stringify(payload));
          req.end();
        });
      } else {
        // Development: Return mock response for testing
        console.log('NVIDIA API KEY NOT SET - Using mock response');
        setTimeout(() => ({
          id: 'test-' + Date.now(),
          choices: [{ message: { content: '**KIMI MOCK RESPONSE**\n\nReady to integrate with NVIDIA NIM once configured!' } }]
        }), 500);
      }
    })();

    res.json({
      id: response.id,
      choices: [{ index: 0, message: { role: 'assistant', content: response.choices[0]?.message?.content || '' } }]
    });
  } catch (err) {
    console.error('NIM Chat Error:', err.message);
    res.status(500).json({ error: 'AI Service unavailable', details: err.message });
  }
});

module.exports = router;

const http = require('http');

/**
 * NVIDIA NIM Inference API - Kimi K2.6 Integration
 * Connects to NVIDIA's managed inference endpoint for LLM access
 */

const NVIDIA_NIM_API_URL = `https://integrate.api.nvidia.com/v1/chat/completions`;

/**
 * Stream response from NVIDIA NIM API
 * @param {Object} payload - Request body with messages, model, temperature etc.
 * @returns {Promise<EventTarget>} - AsyncIterable for streaming tokens
 */
async function nvidiaStream(payload) {
  return new EventSource(
    `${NVIDIA_NIM_API_URL}?max_tokens=${payload.maxTokens || 1024}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        Content-Type: 'application/json',
        Accept: 'text/event-stream'
      },
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

/**
 * Send batch request (non-streaming) to NVIDIA NIM
 * @param {Object} payload - Request body
 * @returns {Promise<Object>} - Full response object
 */
async function nvidiaBatch(payload) {
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk });
      res.on('end', () => JSON.parse(data));
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();

    return new Promise((resolve, reject) => {
      req.on('response', res2 => {
        let data2 = '';
        res2.on('data', chunk => { data2 += chunk });
        res2.on('end', () => {
          try { resolve(JSON.parse(data2)); }
          catch(e) { reject(new Error('Invalid JSON response')) }
        });
      });
    }));
  });
}

/**
 * Chat completions handler for Express middleware
 */

const NIMMiddleware = async (req, res, next) => {
  try {
    const input = req.body?.messages || [];
    
    if (!input.length) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const payload = {
      model: process.env.KIMI_K2_6_MODEL_ID || 'meta-llama/Llama-3.3-NI',
      messages: [
        { role: 'system', content: 'You are VidiSmart - helpful, concise assistant.' },
        ...input.slice(-3) // Last 3 user messages for context window
      ],
      max_tokens: req.body.maxTokens || 1024,
      temperature: req.body.temperature || 0.7,
      stream: false
    };

    const response = await nvidiaBatch(payload);
    
    res.json({
      id: response.id,
      object: 'chat.completion',
      created: response.created,
      model: payload.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.choices[0]?.message?.content || ''
        }
      }]
    });

  } catch (error) {
    console.error('NVIDIA NIM Error:', error);
    res.status(500).json({ 
      error: 'NVIDIA inference failed',
      message: error.message 
    });
  }
};

module.exports = { nvidiaStream, nvidiaBatch, NIMMiddleware };

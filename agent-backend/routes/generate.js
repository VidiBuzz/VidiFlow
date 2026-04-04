const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const providers = {
  gemini:       require('../providers/gemini'),
  stability:    require('../providers/stability'),
  openai:       require('../providers/openai'),
  craiyon:      require('../providers/craiyon'),
  seedance:     require('../providers/seedance'),
  pollinations: require('../providers/pollinations'),
  picsum:       require('../providers/picsum'),
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', requireAuth, async (req, res) => {
  const { provider = 'picsum', prompt, slideId } = req.body;
  const userId = req.user.id;
  const startTime = Date.now();

  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  if (!providers[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

  // Get API key: user's stored key takes priority over server env var
  let apiKey = process.env[`${provider.toUpperCase()}_API_KEY`] || null;
  const { data: keyRow } = await supabaseAdmin
    .from('user_api_keys')
    .select('api_key')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();
  if (keyRow?.api_key) apiKey = keyRow.api_key;

  let status = 'success', errorMsg = null, result = null;

  try {
    result = await providers[provider](prompt, apiKey);
  } catch (err) {
    status = 'failed';
    errorMsg = err.message;
    console.error(`[${provider}] error:`, err.message);
  }

  // Log every attempt (service role bypasses RLS)
  await supabaseAdmin.from('generation_logs').insert({
    user_id: userId,
    provider,
    prompt: prompt.substring(0, 500),
    slide_id: slideId || null,
    status,
    error_msg: errorMsg,
    duration_ms: Date.now() - startTime,
  });

  if (status === 'failed') {
    return res.status(502).json({ error: errorMsg });
  }

  res.json(result); // { type: 'base64'|'url', data: '...' }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_PROVIDERS = ['gemini', 'stability', 'openai', 'craiyon', 'seedance', 'pollinations', 'picsum'];

// GET /api/keys — list configured providers (never returns the actual key)
router.get('/', requireAuth, async (req, res) => {
  const { data } = await supabaseAdmin
    .from('user_api_keys')
    .select('provider, updated_at')
    .eq('user_id', req.user.id)
    .order('provider');
  res.json(data || []);
});

// POST /api/keys — upsert a key for a provider
router.post('/', requireAuth, async (req, res) => {
  const { provider, api_key } = req.body;
  if (!provider || !api_key) return res.status(400).json({ error: 'provider and api_key required' });
  if (!VALID_PROVIDERS.includes(provider)) return res.status(400).json({ error: 'Invalid provider' });

  const { error } = await supabaseAdmin
    .from('user_api_keys')
    .upsert(
      { user_id: req.user.id, provider, api_key },
      { onConflict: 'user_id,provider' }
    );

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, provider });
});

// DELETE /api/keys/:provider — remove a stored key
router.delete('/:provider', requireAuth, async (req, res) => {
  const { provider } = req.params;
  await supabaseAdmin
    .from('user_api_keys')
    .delete()
    .eq('user_id', req.user.id)
    .eq('provider', provider);
  res.json({ ok: true });
});

module.exports = router;

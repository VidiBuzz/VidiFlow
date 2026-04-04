const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/sessions — log a new login (called right after successful Supabase auth)
router.post('/', requireAuth, async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || req.body.user_agent || 'unknown';

  await supabaseAdmin.from('login_sessions').insert({
    user_id: req.user.id,
    ip_address: ip,
    user_agent: userAgent,
  });

  res.json({ ok: true });
});

module.exports = router;

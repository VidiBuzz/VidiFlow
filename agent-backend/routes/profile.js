const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/profile — full profile + stats
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const [profileRes, keysRes, logsRes, sessionsRes] = await Promise.all([
    supabaseAdmin.from('user_profiles').select('*').eq('id', userId).single(),
    supabaseAdmin.from('user_api_keys').select('provider, updated_at').eq('user_id', userId),
    supabaseAdmin.from('generation_logs')
      .select('provider, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin.from('login_sessions')
      .select('ip_address, user_agent, logged_in_at')
      .eq('user_id', userId)
      .order('logged_in_at', { ascending: false })
      .limit(10),
  ]);

  // Aggregate stats
  const logs = logsRes.data || [];
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    byProvider: logs.reduce((acc, l) => {
      acc[l.provider] = (acc[l.provider] || 0) + 1;
      return acc;
    }, {})
  };

  res.json({
    profile: profileRes.data || { id: userId, display_name: req.user.email?.split('@')[0] },
    email: req.user.email,
    configuredProviders: (keysRes.data || []).map(k => k.provider),
    stats,
    recentActivity: logs.slice(0, 10),
    recentSessions: sessionsRes.data || [],
  });
});

// PATCH /api/profile — update display name, company, bio, avatar_url
router.patch('/', requireAuth, async (req, res) => {
  const { display_name, company, bio, avatar_url } = req.body;
  const updates = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (company !== undefined) updates.company = company;
  if (bio !== undefined) updates.bio = bio;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: req.user.id, ...updates }, { onConflict: 'id' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;

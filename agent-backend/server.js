require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3007;

const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5590',
  'http://127.0.0.1:5590',
  'http://localhost:5595',
  'http://127.0.0.1:5595',
  'null', // file:// opened directly in browser
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) ? origin || '*' : false),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Routes
app.use('/api/generate', require('./routes/generate'));
app.use('/api/keys',     require('./routes/keys'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/sessions', require('./routes/sessions'));

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`\n🚀 VidiPitch Agent Backend running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

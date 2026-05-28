const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

// Initialize Express app
const app = express();
app.use(express.json());

// Database connection pool with individual env vars (not DATABASE_URL string)
const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || 'converge',
  user: process.env.DB_USER || 'converge',
  password: process.env.DB_PASSWORD || 'converge_secret',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'cache',
  port: parseInt(process.env.REDIS_PORT) || 6379
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Connected'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redisClient.ping();
    res.json({ status: 'healthy', database: 'ok', cache: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// API endpoint for tracking requests
app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT version FROM pg_catalog.pg_database WHERE datname = $1', [process.env.DB_DATABASE || 'converge']);
    res.json({ 
      service: 'converge-api',
      database_version: result.rows[0]?.version || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server on port 3005 (internal container port)
const PORT = process.env.API_PORT || 3005;
app.listen(PORT, () => {
  console.log(`Converge API listening on port ${PORT}`);
  
  // Initialize database connection
  pool.query('SELECT NOW()').then(() => {
    console.log('Database connected');
  }).catch(err => {
    console.error('Database connection error:', err);
  });
});

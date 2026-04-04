const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id SERIAL PRIMARY KEY,
        section VARCHAR(255) NOT NULL,
        task_text TEXT NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  } finally {
    client.release();
  }
}

initDB();

// API Routes

// Get all checklist items
app.get('/api/checklist', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM checklist_items ORDER BY section, id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get checklist items by section
app.get('/api/checklist/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const result = await pool.query(
      'SELECT * FROM checklist_items WHERE section = $1 ORDER BY id',
      [section]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new checklist item
app.post('/api/checklist', async (req, res) => {
  try {
    const { section, task_text, completed = false } = req.body;
    const result = await pool.query(
      'INSERT INTO checklist_items (section, task_text, completed) VALUES ($1, $2, $3) RETURNING *',
      [section, task_text, completed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update checklist item (toggle completion)
app.patch('/api/checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await pool.query(
      'UPDATE checklist_items SET completed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [completed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete checklist item
app.delete('/api/checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM checklist_items WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { company, name, email, phone, platform } = req.body;

    // Validate required fields
    if (!company || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO signups (company, name, email, phone, platform) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [company, name, email, phone, platform || 'all']
    );

    // Feed lead to Vespa for semantic search and AI retrieval
    try {
      // Placeholder zero-vector array of dimension 768 for compatibility
      const dummyVector = new Array(768).fill(0.01);

      const vespaDoc = {
        put: `id:community:leads::${result.rows[0].id}`,
        fields: {
          id: String(result.rows[0].id),
          company: company || '',
          email: email || '',
          platform: platform || 'all',
          vector: dummyVector
        }
      };

      await fetch('http://localhost:8080/document/v1/community/leads/docid/' + result.rows[0].id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vespaDoc)
      });
      console.log('Successfully indexed lead into Vespa AI Engine');
    } catch (vespaErr) {
      console.error('Failed to index lead in Vespa:', vespaErr);
      // We don't fail the signup if Vespa is down
    }

    // TODO: Send welcome email to customer
    // TODO: Add to CRM
    // TODO: Send notification email to sales team

    res.status(201).json({
      success: true,
      message: 'Signup received! We\'ll contact you within 24 hours.',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Get all signups (admin only - add auth later)
app.get('/api/signups', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM signups ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stock Quotes API using yahoo-finance2
const yahooFinance = require('yahoo-finance2').default;

// Cache for stock prices (30 minute TTL)
const stockCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

app.get('/api/stocks', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') :
      ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY', 'QQQ'];

    const results = [];
    const now = Date.now();

    for (const symbol of symbols) {
      // Check cache first
      const cached = stockCache.get(symbol);
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        results.push(cached.data);
        continue;
      }

      try {
        // Fetch from Yahoo Finance
        const quote = await yahooFinance.quote(symbol);

        if (quote && quote.regularMarketPrice) {
          const stockData = {
            symbol: symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice
          };

          // Cache the result
          stockCache.set(symbol, {
            data: stockData,
            timestamp: now
          });

          results.push(stockData);
        }
      } catch (err) {
        console.warn(`Failed to fetch ${symbol}:`, err.message);
        // Return cached data if available, even if expired
        const cached = stockCache.get(symbol);
        if (cached) {
          results.push(cached.data);
        }
      }
    }

    res.json({
      success: true,
      count: results.length,
      timestamp: new Date().toISOString(),
      data: results
    });
  } catch (err) {
    console.error('Stock API error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

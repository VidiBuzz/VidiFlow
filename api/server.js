const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (waitlist.html, index.html, etc.)
app.use(express.static(path.join(__dirname, '..')));

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

// Waitlist submission endpoint - writes directly to Directus PostgreSQL database
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, name, company, business_type, interests, source, referrer_url, utm_source, utm_medium, utm_campaign } = req.body;

    // Validate required fields
    if (!email || !name || !business_type) {
      return res.status(400).json({ error: 'Missing required fields: email, name, business_type' });
    }

    // Check for duplicate email
    const existing = await pool.query('SELECT id FROM waitlist_leads WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This email is already on the waitlist!' });
    }

    const result = await pool.query(
      `INSERT INTO waitlist_leads (id, email, name, company, business_type, interests, source, referrer_url, utm_source, utm_medium, utm_campaign, status, date_created, date_updated)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW(), NOW())
       RETURNING id, email, name`,
      [email, name, company || null, business_type, interests || null, source || 'vidismart-website', referrer_url || null, utm_source || null, utm_medium || null, utm_campaign || null]
    );

    // Send welcome email via Resend SMTP (configure RESEND_API_KEY in .env)
    sendWaitlistEmail(email, name);

    res.status(201).json({
      success: true,
      message: 'Welcome to VidiSmart! You\'re on the waitlist.',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('Waitlist submission error:', err);
    res.status(500).json({ error: 'Waitlist submission failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stock Quotes API - disabled due to yahoo-finance2 package compatibility issue
// TODO: Re-enable with a compatible version or alternative API

// Resend email configuration (REST API)
async function sendWaitlistEmail(email, name) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email not sent: RESEND_API_KEY not configured');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'VidiSmart <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to VidiSmart Waitlist!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0ea5e9;">Welcome${name ? ' ' + name : ''}!</h1>
            <p>Thank you for joining the VidiSmart waitlist.</p>
            <p>We'll notify you as soon as early access is available.</p>
            <p>In the meantime, explore our <a href="https://vidismart.com/vidismart.masterlist.html">Master Stack</a> with 481+ vetted technologies.</p>
            <br>
            <p style="color: #64748b;">Best,<br>The VidiSmart Team</p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log(`Welcome email sent to: ${email}`);
    } else {
      const error = await response.json();
      console.error('Failed to send welcome email:', error.message);
    }
  } catch (err) {
    console.error('Failed to send welcome email:', err.message);
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

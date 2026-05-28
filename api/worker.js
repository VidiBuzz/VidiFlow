/**
 * VidiSmart Worker Service
 * Async task processor - consumes jobs from RabbitMQ queues:
 *   - email.send       → Send emails via Resend API
 *   - waitlist.welcome → Send welcome emails to new waitlist signups
 *   - vespa.index      → Index documents into Vespa search
 */

const amqp = require('amqplib');
const { Pool } = require('pg');

// ── PostgreSQL connection ──────────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_DATABASE || 'converge',
  user: process.env.DB_USER || 'converge',
  password: process.env.DB_PASSWORD || 'converge_secret',
  ssl: false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// ── RabbitMQ connection ───────────────────────────────────────────────────────
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'rabbitmq';
const RABBITMQ_URL = `amqp://vidicrm:vidicrm_secret@${RABBITMQ_HOST}:5672`;

const QUEUES = {
  EMAIL_SEND: 'email.send',
  WAITLIST_WELCOME: 'waitlist.welcome',
  VESPA_INDEX: 'vespa.index'
};

// ── Email sender (Resend API) ─────────────────────────────────────────────────
async function sendEmail(payload) {
  const { to, subject, html, from } = payload;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[worker] RESEND_API_KEY not configured – skipping email to:', to);
    return { skipped: true, reason: 'RESEND_API_KEY not set' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || process.env.EMAIL_FROM || 'VidiSmart <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject || 'Message from VidiSmart',
        html: html || '<p>No content</p>'
      })
    });

    if (response.ok) {
      console.log(`[worker] Email sent to: ${to}`);
      return { success: true };
    } else {
      const err = await response.json();
      console.error('[worker] Email send failed:', err.message);
      return { success: false, error: err.message };
    }
  } catch (err) {
    console.error('[worker] Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Waitlist welcome email handler ────────────────────────────────────────────
async function handleWaitlistWelcome(payload) {
  const { email, name } = payload;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0ea5e9;">Welcome${name ? ' ' + name : ''}!</h1>
      <p>Thank you for joining the VidiSmart waitlist.</p>
      <p>We'll notify you as soon as early access is available.</p>
      <p>In the meantime, explore our <a href="https://vidismart.com/vidismart.masterlist.html">Master Stack</a> with 481+ vetted technologies.</p>
      <br>
      <p style="color: #64748b;">Best,<br>The VidiSmart Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to VidiSmart Waitlist!',
    html
  });
}

// ── Vespa indexing handler (placeholder – Vespa not yet deployed) ──────────────
async function handleVespaIndex(payload) {
  const vespaUrl = process.env.VESPA_URL;
  if (!vespaUrl) {
    console.warn('[worker] VESPA_URL not configured – skipping index for:', payload.id);
    return { skipped: true, reason: 'VESPA_URL not set' };
  }

  try {
    const response = await fetch(`${vespaUrl}/document/v1/vidismart/apps/docid/${payload.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: payload.fields || payload })
    });

    if (response.ok) {
      console.log(`[worker] Vespa indexed: ${payload.id}`);
      return { success: true };
    } else {
      const err = await response.text();
      console.error('[worker] Vespa index failed:', err);
      return { success: false, error: err };
    }
  } catch (err) {
    console.error('[worker] Vespa index error:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Queue consumer setup ──────────────────────────────────────────────────────
async function consumeQueue(channel, queueName, handler) {
  await channel.assertQueue(queueName, {
    durable: true      // survives broker restart
  });

  await channel.prefetch(1); // process one message at a time

  console.log(`[worker] Listening on queue: ${queueName}`);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    let payload;
    try {
      payload = JSON.parse(msg.content.toString());
    } catch (e) {
      console.error(`[worker] Invalid JSON on ${queueName}:`, e.message);
      channel.nack(msg, false, false); // discard bad message
      return;
    }

    try {
      console.log(`[worker] Processing ${queueName}:`, JSON.stringify(payload).substring(0, 120));
      const result = await handler(payload);

      if (result?.success || result?.skipped) {
        channel.ack(msg);
      } else {
        // Retry up to 3 times
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
        if (retryCount < 3) {
          console.warn(`[worker] Retry ${retryCount}/3 for ${queueName}`);
          channel.nack(msg, false, true); // requeue
        } else {
          console.error(`[worker] Max retries reached for ${queueName} – discarding`);
          channel.nack(msg, false, false); // dead-letter (discard)
        }
      }
    } catch (err) {
      console.error(`[worker] Handler error for ${queueName}:`, err.message);
      channel.nack(msg, false, true); // requeue on unexpected error
    }
  }, { noAck: false });
}

// ── Main startup ──────────────────────────────────────────────────────────────
async function start() {
  console.log('[worker] Starting VidiSmart Worker Service...');

  // Verify database connection
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 AS ok');
    client.release();
    console.log('[worker] Database connected:', result.rows[0]);
  } catch (err) {
    console.error('[worker] Database connection failed:', err.message);
    process.exit(1);
  }

  // Connect to RabbitMQ with retry
  let connection;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      console.log('[worker] RabbitMQ connected');
      break;
    } catch (err) {
      console.warn(`[worker] RabbitMQ attempt ${attempt}/10 failed: ${err.message}`);
      if (attempt === 10) {
        console.error('[worker] RabbitMQ connection failed after 10 attempts – exiting');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 3000)); // wait 3s between retries
    }
  }

  const channel = await connection.createChannel();

  // Register queue consumers
  await consumeQueue(channel, QUEUES.EMAIL_SEND, sendEmail);
  await consumeQueue(channel, QUEUES.WAITLIST_WELCOME, handleWaitlistWelcome);
  await consumeQueue(channel, QUEUES.VESPA_INDEX, handleVespaIndex);

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[worker] SIGTERM received – shutting down');
    await channel.close();
    await connection.close();
    await pool.end();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[worker] SIGINT received – shutting down');
    await channel.close();
    await connection.close();
    await pool.end();
    process.exit(0);
  });

  console.log('[worker] Worker service ready – waiting for jobs...');
}

start().catch(err => {
  console.error('[worker] Fatal startup error:', err);
  process.exit(1);
});

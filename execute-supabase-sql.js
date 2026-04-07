const { Client } = require('pg');
const fs = require('fs');

// Supabase PostgreSQL connection
const client = new Client({
  host: 'db.jeasmwbberfgztkxfjwr.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSQL() {
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');
    
    const sql = fs.readFileSync('/mnt/m/code/vidismart/supabase-member-profiles-schema.sql', 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    
    console.log('✅ SQL executed successfully!');
    
    // Verify the table was created
    const result = await client.query('SELECT COUNT(*) as count FROM member_profiles');
    console.log(`✅ Member profiles table created with ${result.rows[0].count} members`);
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Table may already exist, checking...');
      try {
        const result = await client.query('SELECT COUNT(*) as count FROM member_profiles');
        console.log(`✅ Member profiles table exists with ${result.rows[0].count} members`);
      } catch (e) {
        console.error('Could not verify table:', e.message);
      }
    }
  } finally {
    await client.end();
  }
}

executeSQL();

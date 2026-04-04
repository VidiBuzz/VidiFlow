const { Client } = require('pg');
const fs = require('fs');

// Supabase connection pooler (accepts JWT tokens)
const client = new Client({
  host: 'db.jeasmwbberfgztkxfjwr.supabase.co',
  port: 6543, // Connection pooler port
  database: 'postgres',
  user: 'postgres',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYXNtd2JiZXJmZ3p0a3hmandyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzMjQxNSwiZXhwIjoyMDg2NDA4NDE1fQ.eLKsolLYu16CQzJU-fc3A0ykuBw3VnmmGUb3GHGLsbU',
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSQL() {
  try {
    console.log('Connecting to Supabase via connection pooler...');
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

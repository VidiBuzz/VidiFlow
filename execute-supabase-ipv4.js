const { Client } = require('pg');
const fs = require('fs');
const dns = require('dns');

async function getIPv4(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) reject(err);
      else resolve(address);
    });
  });
}

async function executeSQL() {
  try {
    console.log('Resolving IPv4 address...');
    const ipv4 = await getIPv4('db.jeasmwbberfgztkxfjwr.supabase.co');
    console.log('IPv4:', ipv4);
    
    const client = new Client({
      host: ipv4,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYXNtd2JiZXJmZ3p0a3hmandyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzMjQxNSwiZXhwIjoyMDg2NDA4NDE1fQ.eLKsolLYu16CQzJU-fc3A0ykuBw3VnmmGUb3GHGLsbU',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
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
    
    await client.end();
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

executeSQL();

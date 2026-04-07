const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
    const sqlFile = process.argv[2] || 'vidiflow/supabase-masterlist-complete-seed.sql';
    console.log(`Reading SQL from: ${sqlFile}`);
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('Connecting to Supabase PostgreSQL...');
    
    await client.connect();
    console.log('Connected! Executing SQL (this may take a while for large files)...');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    console.log(`Executing ${statements.length} SQL statements...`);
    
    let executed = 0;
    let errors = 0;
    
    for (const stmt of statements) {
      try {
        if (stmt.trim()) {
          await client.query(stmt);
          executed++;
          if (executed % 50 === 0) {
            console.log(`Progress: ${executed}/${statements.length} statements executed`);
          }
        }
      } catch (err) {
        errors++;
        // Log error but continue
        if (errors <= 5) {
          console.error(`Error: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    console.log(`✅ SQL execution complete! ${executed} statements executed, ${errors} errors`);
    
  } catch (err) {
    console.error('Fatal Error:', err.message);
  } finally {
    await client.end();
  }
}

executeSQL();

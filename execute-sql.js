const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://jeasmwbberfgztkxfjwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYXNtd2JiZXJmZ3p0a3hmandyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzMjQxNSwiZXhwIjoyMDg2NDA4NDE1fQ.eLKsolLYu16CQzJU-fc3A0ykuBw3VnmmGUb3GHGLsbU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  const sql = fs.readFileSync('/mnt/m/code/vidismart/supabase-member-profiles-schema.sql', 'utf8');
  
  // Split SQL into individual statements
  const statements = sql.split(';').filter(s => s.trim());
  
  console.log(`Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement) continue;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        console.log(`Statement ${i + 1} error: ${error.message}`);
      } else {
        console.log(`✓ Statement ${i + 1} executed`);
      }
    } catch (e) {
      console.log(`✗ Statement ${i + 1} failed: ${e.message}`);
    }
  }
  
  console.log('Done!');
}

executeSQL();

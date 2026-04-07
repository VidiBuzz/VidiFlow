const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

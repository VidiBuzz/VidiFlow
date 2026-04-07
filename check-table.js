const { createClient } = require('/mnt/m/code/vidi.news/node_modules/@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking if member_profiles table exists...');
  
  const { data, error } = await supabase
    .from('member_profiles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('❌ Table does not exist or error:', error.message);
    return false;
  }
  
  console.log('✅ Table exists!');
  return true;
}

checkTable();

const { createClient } = require('/mnt/m/code/vidi.news/node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://jeasmwbberfgztkxfjwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYXNtd2JiZXJmZ3p0a3hmandyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgzMjQxNSwiZXhwIjoyMDg2NDA4NDE1fQ.eLKsolLYu16CQzJU-fc3A0ykuBw3VnmmGUb3GHGLsbU';

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

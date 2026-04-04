const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bxhoiaagvmngiibanqn.supabase.co',
  'sbp_229e5b28acf95c33a6a6d611683962149eb327bd'
);

async function createTable() {
  console.log('Checking if waitlist_leads table exists...\n');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('waitlist_leads')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table does not exist');
        console.log('\n⚠️  MANUAL ACTION REQUIRED:');
        console.log('\n1. Go to: https://supabase.com/dashboard/project/bxhoiaagvmngiibanqn/sql/new');
        console.log('\n2. Paste this SQL and click RUN:\n');
        console.log('--- COPY THIS SQL ---');
        console.log(`CREATE TABLE IF NOT EXISTS waitlist_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    industry TEXT NOT NULL,
    company_size TEXT NOT NULL,
    pain_point TEXT,
    current_tech_spend TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE waitlist_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON waitlist_leads FOR INSERT TO PUBLIC WITH CHECK (true);`);
        console.log('---------------------\n');
        console.log('3. Table will be created and ready for leads!\n');
      } else {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Table waitlist_leads ALREADY EXISTS!');
      console.log('🎉 Ready to capture leads!');
      console.log('\nView leads at: https://vidismart.com/admin/waitlist.html');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createTable();

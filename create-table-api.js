const https = require('https');

const supabaseUrl = process.env.SUPABASE_HOST || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create table SQL
const createTableSQL = `CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  tagline TEXT,
  phone TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  company TEXT,
  job_title TEXT,
  industry TEXT,
  skills TEXT[] DEFAULT '{}',
  address JSONB DEFAULT '{}',
  total_videos INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  featured_video TEXT,
  role TEXT NOT NULL CHECK (role IN ('navigator', 'coach', 'creator', 'member')),
  interests TEXT[] DEFAULT '{}',
  contributions INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{"newsletter": true, "notifications": true, "profile_public": true}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`;

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: supabaseUrl,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData,
          headers: res.headers
        });
      });
    });

    req.on('error', (e) => reject(e));
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function createTable() {
  try {
    console.log('Creating member_profiles table...');
    
    // Try to create table using pg_exec if available
    const result = await makeRequest('/rest/v1/rpc/pg_exec', 'POST', { 
      command: createTableSQL 
    });
    
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTable();

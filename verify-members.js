const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: supabaseUrl,
      path: path,
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function checkMembers() {
  try {
    console.log('Fetching members from database...\n');
    
    const result = await makeRequest('/rest/v1/member_profiles?select=slug,display_name,role&order=created_at.desc');
    
    if (result.status === 200) {
      const members = JSON.parse(result.data);
      console.log(`✅ SUCCESS! Found ${members.length} member profiles:\n`);
      
      members.forEach((m, i) => {
        console.log(`${i + 1}. ${m.display_name} (${m.role}) - /member/${m.slug}`);
      });
      
      console.log('\n🌐 Live site: https://vidinews.vercel.app/member');
    } else {
      console.log('Status:', result.status);
      console.log('Response:', result.data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMembers();

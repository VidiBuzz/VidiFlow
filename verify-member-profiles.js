const https = require('https');

const accessToken = 'sbp_229e5b28acf95c33a6a6d611683962149eb327bd';
const projectRef = 'jeasmwbberfgztkxfjwr';

function makeRequest(hostname, path, method, headers, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: hostname,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...headers
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

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

async function verifyTable() {
  try {
    console.log('Checking member_profiles table...');
    
    const result = await makeRequest(
      'api.supabase.com',
      `/v1/projects/${projectRef}/database/query`,
      'POST',
      {},
      { query: 'SELECT COUNT(*) as count FROM member_profiles' }
    );
    
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    
    if (result.status === 200) {
      const response = JSON.parse(result.data);
      console.log(`\n✅ Member profiles table exists with ${response[0]?.count || 0} members`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyTable();

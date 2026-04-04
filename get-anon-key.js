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

async function getAnonKey() {
  try {
    console.log('Fetching project API keys...');
    
    const result = await makeRequest(
      'api.supabase.com',
      `/v1/projects/${projectRef}/api-keys`,
      'GET',
      {},
      null
    );
    
    console.log('Status:', result.status);
    const keys = JSON.parse(result.data);
    
    // Find anon key
    const anonKey = keys.find(k => k.name === 'anon' || k.name === 'publishable' || k.description?.includes('anon'));
    if (anonKey) {
      console.log('\n✅ ANON_KEY=' + anonKey.api_key);
    } else {
      console.log('\nAvailable keys:', keys.map(k => ({ name: k.name, desc: k.description })));
    }
    
  } catch (error) {
    console.error('Error fetching API keys:', error.message);
  }
}

getAnonKey();

const https = require('https');

const API_TOKEN = '0o80LXFth2drsN_qc3J8zLxdEumc8KQXPD-z_kFQ';
const ZONE_ID = '0c99ad9d9254e668c73b7b5076ab8dfd'; // modalityvector.com

function purgeCache() {
    console.log(`Attempting to purge cache for Zone: ${ZONE_ID}...`);
    
    const data = JSON.stringify({
        purge_everything: true
    });

    const options = {
        hostname: 'api.cloudflare.com',
        port: 443,
        path: `/client/v4/zones/${ZONE_ID}/purge_cache`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (d) => {
            responseData += d;
        });

        res.on('end', () => {
            console.log('Status Code:', res.statusCode);
            const parsed = JSON.parse(responseData);
            if (parsed.success) {
                console.log('✅ Cache purged successfully!');
            } else {
                console.error('❌ Cache purge failed:', parsed.errors);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error.message);
    });

    req.write(data);
    req.end();
}

purgeCache();

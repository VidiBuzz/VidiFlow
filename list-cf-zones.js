const https = require('https');

const API_TOKEN = 'DsxnOu8rJo72cAV3MTu3EHHZJjFZDjeL-mfoqDbE';

function listZones() {
    console.log('Listing zones for the token...');
    
    const options = {
        hostname: 'api.cloudflare.com',
        port: 443,
        path: '/client/v4/zones',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (d) => {
            responseData += d;
        });

        res.on('end', () => {
            const parsed = JSON.parse(responseData);
            if (parsed.success) {
                console.log('Zones found:');
                parsed.result.forEach(zone => {
                    console.log(` - ${zone.name}: ${zone.id}`);
                });
            } else {
                console.error('❌ Failed to list zones:', parsed.errors);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error.message);
    });

    req.end();
}

listZones();

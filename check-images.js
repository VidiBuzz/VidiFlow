const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const http = require('http');

const PAGES = [
    'https://vidismart.com/viditwin.html',
    'https://vidismart.com/SmartGenUi.html',
    'https://vidismart.com/vidismart.masterlist.v3.html',
    'https://vidismart.com/index.html'
];

const CDN_DOMAINS = ['cdn.vidi.news', 'vidismart.com'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

function extractImages(html, baseUrl) {
    const images = [];
    const urlRegex = /src=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg)[^"']*)["']/gi;
    let match;
    
    while ((match = urlRegex.exec(html)) !== null) {
        let url = match[1];
        
        if (url.startsWith('http')) {
            images.push(url);
        } else if (url.startsWith('//')) {
            images.push('https:' + url);
        } else if (url.startsWith('/')) {
            for (const domain of CDN_DOMAINS) {
                images.push(`https://${domain}${url}`);
            }
        }
    }
    
    return [...new Set(images)];
}

async function checkImage(url) {
    try {
        const res = await fetchUrl(url);
        return { url, status: res.status, ok: res.status === 200 };
    } catch (err) {
        return { url, status: 'ERROR', ok: false, error: err.message };
    }
}

async function main() {
    console.log('🔍 Checking images on vidismart.com pages...\n');
    
    let totalImages = 0;
    let brokenImages = [];
    
    for (const pageUrl of PAGES) {
        console.log(`📄 Checking: ${pageUrl}`);
        
        try {
            const { body } = await fetchUrl(pageUrl);
            const images = extractImages(body, pageUrl);
            
            console.log(`   Found ${images.length} images`);
            
            for (const imgUrl of images) {
                totalImages++;
                const result = await checkImage(imgUrl);
                
                if (!result.ok) {
                    brokenImages.push({ page: pageUrl, image: imgUrl, status: result.status });
                    console.log(`   ❌ ${imgUrl.split('/').pop()}: ${result.status}`);
                } else {
                    console.log(`   ✅ ${imgUrl.split('/').pop()}`);
                }
            }
        } catch (err) {
            console.log(`   ❌ Error fetching page: ${err.message}`);
        }
        
        console.log('');
    }
    
    console.log('--- SUMMARY ---');
    console.log(`Total images checked: ${totalImages}`);
    console.log(`Working: ${totalImages - brokenImages.length}`);
    console.log(`Broken: ${brokenImages.length}`);
    
    if (brokenImages.length > 0) {
        console.log('\n🚨 BROKEN IMAGES:');
        for (const img of brokenImages) {
            console.log(`   - ${img.image} (on ${img.page.split('/').pop()})`);
        }
        process.exit(1);
    } else {
        console.log('\n✅ All images working!');
    }
}

main();

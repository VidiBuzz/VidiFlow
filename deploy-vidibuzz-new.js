const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration for vidismart.com (same CDN used for vidibuzz)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const BASE_PATH = '/code/vidismart';

// Files to upload
const files = [
    { src: 'vidibuzz.agent.new2.html', dest: 'vidibuzz.agent.new2.html' },
];

// Images to upload
const images = [
    { src: 'images/reporter_female_1_1770778899643.png', dest: 'images/reporter_female_1_1770778899643.png' },
    { src: 'images/ai_agents_collaboration_1771112013711.png', dest: 'images/ai_agents_collaboration_1771112013711.png' },
    { src: 'images/marketing_outbound_flow.png', dest: 'images/marketing_outbound_flow.png' },
    { src: 'images/private_ai_core_hero.png', dest: 'images/private_ai_core_hero.png' },
    { src: 'images/agentic_video_intelligence_wide.png', dest: 'images/agentic_video_intelligence_wide.png' },
    { src: 'images/siteswarm_network_visualization_1771112045746.png', dest: 'images/siteswarm_network_visualization_1771112045746.png' },
    { src: 'images/digital_twin_poster.png', dest: 'images/digital_twin_poster.png' },
    { src: 'images/ai_answer_engine_strategy.png', dest: 'images/ai_answer_engine_strategy.png' },
];

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

function getContentType(filename) {
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.css')) return 'text/css';
    if (filename.endsWith('.md')) return 'text/markdown';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.svg')) return 'image/svg+xml';
    if (filename.endsWith('.gif')) return 'image/gif';
    if (filename.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
}

async function uploadFile(srcPath, destPath) {
    const fullPath = path.join(BASE_PATH, srcPath);
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Missing file: ${fullPath}`);
        return false;
    }

    const fileStream = fs.createReadStream(fullPath);
    const stats = fs.statSync(fullPath);
    const contentType = getContentType(destPath);

    console.log(`📤 Uploading ${destPath} (${(stats.size / 1024).toFixed(1)} KB)...`);

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: destPath,
            Body: fileStream,
            ContentType: contentType,
            ContentLength: stats.size,
        }));
        console.log(`✅ Uploaded: https://cdn.vidi.news/${destPath}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed:`, e.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Uploading vidibuzz.agent.new2.html and images to vidibuzz.com...\n');
    
    let successCount = 0;
    
    // Upload HTML files
    console.log('📄 Uploading HTML files...');
    for (const file of files) {
        if (await uploadFile(file.src, file.dest)) successCount++;
    }
    
    // Upload images
    console.log('\n🖼️ Uploading images...');
    for (const image of images) {
        if (await uploadFile(image.src, image.dest)) successCount++;
    }
    
    console.log('\n✨ Upload complete!');
    console.log(`\n📍 Main URL: https://vidibuzz.com/vidibuzz.agent.new2.html`);
    console.log(`   CDN URL: https://cdn.vidi.news/vidibuzz.agent.new2.html`);
    console.log(`\n📊 Total files uploaded: ${successCount}/${files.length + images.length}`);
}

main();
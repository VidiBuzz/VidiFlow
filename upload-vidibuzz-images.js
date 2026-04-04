const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';
const CDN_DOMAIN = 'cdn.vidi.news';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

// Images used in vidibuzz.agent.html
const IMAGE_FILES = [
    'reporter_female_1_1770778899643.png',
    'ai_agents_collaboration_1771112013711.png',
    'marketing_outbound_flow.png',
    'private_ai_core_hero.png',
    'agentic_video_intelligence_wide.png',
    'siteswarm_network_visualization_1771112045746.png',
    'digital_twin_poster.png',
    'ai_answer_engine_strategy.png',
];

async function uploadFile(filename) {
    const localPath = path.join(__dirname, 'images', filename);
    const r2Key = `images/${filename}`;

    if (!fs.existsSync(localPath)) {
        console.error(`  MISSING: ${localPath}`);
        return false;
    }

    const stats = fs.statSync(localPath);
    const fileStream = fs.readFileSync(localPath);

    console.log(`  Uploading ${filename} (${(stats.size / 1024).toFixed(0)} KB)...`);

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: r2Key,
            Body: fileStream,
            ContentType: 'image/png',
            CacheControl: 'public, max-age=31536000, immutable',
        }));
        console.log(`  -> https://${CDN_DOMAIN}/${r2Key}`);
        return true;
    } catch (e) {
        console.error(`  FAILED: ${e.message}`);
        return false;
    }
}

async function main() {
    console.log(`Uploading ${IMAGE_FILES.length} images to R2 (${BUCKET_NAME})...\n`);

    let ok = 0, fail = 0;
    for (const file of IMAGE_FILES) {
        if (await uploadFile(file)) ok++;
        else fail++;
    }

    console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
    console.log(`\nCDN base URL: https://${CDN_DOMAIN}/images/`);
}

main();
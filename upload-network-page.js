const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration for vidismart.com
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const BASE_PATH = __dirname;

// Files to upload
const files = [
    { src: 'network.html', dest: 'network.html' },
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
        console.log(`✅ Uploaded: https://vidismart.com/${destPath}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed:`, e.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Uploading network.html to vidismart.com...\n');

    let successCount = 0;

    for (const file of files) {
        if (await uploadFile(file.src, file.dest)) successCount++;
    }

    console.log('\n✨ Upload complete!');
}

main();

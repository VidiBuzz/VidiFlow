const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const FILES_TO_UPLOAD = [
    { name: 'viditwin2.html', type: 'text/html' },
    { name: 'vidishop_lingerie_model.png', type: 'image/png' },
    { name: 'vidismart-moe-stack.png', type: 'image/png' }
];

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(filename, contentType) {
    const localPath = path.join(__dirname, filename);
    console.log(`Uploading ${filename} to ${BUCKET_NAME} (vidismart.com)...`);

    if (!fs.existsSync(localPath)) {
        console.error(`❌ File not found: ${localPath} - Skipping.`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: fileStream,
            ContentType: contentType,
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Success! ${filename} uploaded.`);
    } catch (err) {
        console.error(`❌ Upload failed for ${filename}:`, err.message);
    }
}

async function run() {
    console.log('Starting Digital Twin Strategy Asset Push to VidiSmart.com...');
    for (const file of FILES_TO_UPLOAD) {
        await uploadFile(file.name, file.type);
    }
    console.log('--- Deployment Complete ---');
}

run();

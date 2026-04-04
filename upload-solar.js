const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const FILES_TO_UPLOAD = [
    { src: 'solar.html', dest: 'solar.html', type: 'text/html' }
];

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(file) {
    const localPath = path.join(__dirname, file.src);
    console.log(`Uploading ${file.src} as ${file.dest}...`);

    if (!fs.existsSync(localPath)) {
        console.error(`❌ File not found: ${localPath} - Skipping.`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.dest,
            Body: fileStream,
            ContentType: file.type,
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Success! https://vidismart.com/${file.dest}`);
    } catch (err) {
        console.error(`❌ Upload failed for ${file.dest}:`, err.message);
    }
}

async function run() {
    console.log('Pushing Solar Pre-Vis...');
    for (const file of FILES_TO_UPLOAD) {
        await uploadFile(file);
    }
    console.log('--- Deployment Complete ---');
}

run();

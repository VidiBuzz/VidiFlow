const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const TARGET_FILES = ['vidismart.consultants.html', 'stack1d.png', 'stack2.png'];

function getContentType(filename) {
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.png')) return 'image/png';
    return 'application/octet-stream';
}

async function uploadFiles() {
    for (const file of TARGET_FILES) {
        const localPath = path.join(__dirname, file);

        if (!fs.existsSync(localPath)) {
            console.warn(`⚠️ Warning: File not found: ${localPath}`);
            continue;
        }

        try {
            const fileStream = fs.createReadStream(localPath);
            const stats = fs.statSync(localPath);

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: file,
                Body: fileStream,
                ContentType: getContentType(file),
                ContentLength: stats.size,
            });

            await s3Client.send(command);
            console.log(`✅ Fast Pushed: https://vidismart.com/${file}`);
        } catch (err) {
            console.error(`❌ Failed on ${file}:`, err.message);
        }
    }
}

uploadFiles();

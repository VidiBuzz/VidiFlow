const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

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

const FILES = [
    { src: 'stack1d.png', dest: 'stack1d.png', type: 'image/png' },
    { src: 'stack2.png', dest: 'stack2.png', type: 'image/png' }
];

async function upload() {
    for (const file of FILES) {
        const filePath = path.join(__dirname, file.src);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            continue;
        }
        const body = fs.createReadStream(filePath);
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.dest,
            Body: body,
            ContentType: file.type
        });
        await s3Client.send(command);
        console.log(`✅ Uploaded: ${file.dest}`);
    }
}

upload().catch(console.error);

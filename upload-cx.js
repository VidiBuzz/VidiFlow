const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// The file to upload
const FILENAME = 'SmartChannelCXv1.html';
const TARGET_KEY = 'SMART_CHANNEL_CX.html'; // Uploading with the name the user requested for consistency in URL

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function run() {
    const localPath = path.join(__dirname, FILENAME);
    console.log(`Uploading ${FILENAME} as ${TARGET_KEY} to ${BUCKET_NAME} (vidismart.com)...`);

    if (!fs.existsSync(localPath)) {
        console.error(`❌ File not found: ${localPath}`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: TARGET_KEY,
            Body: fileStream,
            ContentType: 'text/html',
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Success! Uploaded to: https://vidismart.com/${TARGET_KEY}`);

        // Also upload with original name just in case
        const commandOriginal = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILENAME,
            Body: fs.createReadStream(localPath),
            ContentType: 'text/html',
            ContentLength: stats.size,
        });
        await s3Client.send(commandOriginal);
        console.log(`✅ Success! Uploaded to: https://vidismart.com/${FILENAME}`);

    } catch (err) {
        console.error(`❌ Upload failed:`, err.message);
    }
}

run();

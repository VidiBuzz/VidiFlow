const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// File source
const FILENAME = 'digital_twin_poster.png';
const LOCAL_PATH = path.join(__dirname, FILENAME);

// Configure S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadToR2() {
    console.log(`Checking local file: ${LOCAL_PATH}`);

    if (!fs.existsSync(LOCAL_PATH)) {
        throw new Error(`File not found: ${LOCAL_PATH}`);
    }

    const stats = fs.statSync(LOCAL_PATH);
    const fileSizeInBytes = stats.size;

    try {
        console.log(`\nUploading to R2 bucket: ${BUCKET_NAME}/${FILENAME}...`);

        const fileStream = fs.createReadStream(LOCAL_PATH);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILENAME,
            Body: fileStream,
            ContentType: 'image/png',
            ContentLength: fileSizeInBytes,
        });

        await s3Client.send(command).catch(err => {
            console.error("SDK Send Error:", err);
            throw err;
        });

        console.log('✅ Image uploaded successfully to R2!');
        console.log(`\nImage URL: https://cdn.vidi.news/${FILENAME}`);

    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

uploadToR2().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});

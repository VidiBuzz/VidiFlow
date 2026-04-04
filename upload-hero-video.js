const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// Video source
const VIDEO_FILENAME = 'Digital_Twin_Tensor_Truth_-_KG_+_Text_+_Vector.mp4';
const R2_KEY = 'Digital_Twin_Tensor_Truth.mp4';
const LOCAL_VIDEO_PATH = path.join(__dirname, VIDEO_FILENAME);

// Configure S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadLocalVideoToR2() {
    console.log(`Checking local video file: ${LOCAL_VIDEO_PATH}`);

    if (!fs.existsSync(LOCAL_VIDEO_PATH)) {
        throw new Error(`File not found: ${LOCAL_VIDEO_PATH}`);
    }

    const stats = fs.statSync(LOCAL_VIDEO_PATH);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log(`File size: ${fileSizeInMegabytes.toFixed(2)} MB`);

    try {
        console.log(`\nUploading to R2 bucket: ${BUCKET_NAME}/${R2_KEY}...`);

        const fileStream = fs.createReadStream(LOCAL_VIDEO_PATH);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: R2_KEY,
            Body: fileStream,
            ContentType: 'video/mp4',
            ContentLength: fileSizeInBytes,
        });

        await s3Client.send(command).catch(err => {
            console.error("SDK Send Error:", err);
            throw err;
        });

        console.log('✅ Video uploaded successfully to R2!');
        console.log(`\nVideo URL: https://cdn.vidi.news/${R2_KEY}`);

    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

uploadLocalVideoToR2().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});

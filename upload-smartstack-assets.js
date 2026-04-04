const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// File mapping
const files = [
    { src: 'C:/Users/James/.gemini/antigravity/brain/55851b28-d4b4-44e9-bc66-035871b2106a/uploaded_media_0_1769732270328.jpg', dest: 'viditwin-brain-engine.jpg' },
    { src: 'C:/Users/James/.gemini/antigravity/brain/55851b28-d4b4-44e9-bc66-035871b2106a/uploaded_media_1_1769732270328.jpg', dest: 'viditwin-visual-vectors.jpg' },
    { src: 'C:/Users/James/.gemini/antigravity/brain/55851b28-d4b4-44e9-bc66-035871b2106a/uploaded_media_2_1769732270328.jpg', dest: 'viditwin-tensors.jpg' },
    { src: 'C:/Users/James/.gemini/antigravity/brain/55851b28-d4b4-44e9-bc66-035871b2106a/uploaded_media_3_1769732270328.jpg', dest: 'viditwin-graph-rag.jpg' },
    { src: 'C:/Users/James/.gemini/antigravity/brain/55851b28-d4b4-44e9-bc66-035871b2106a/uploaded_media_4_1769732270328.jpg', dest: 'viditwin-privacy.jpg' }
];

// Configure S3 client
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(file) {
    if (!fs.existsSync(file.src)) {
        console.error(`Skipping missing file: ${file.src}`);
        return;
    }

    const fileStream = fs.createReadStream(file.src);
    const stats = fs.statSync(file.src);
    const contentType = 'image/jpeg';

    console.log(`Uploading ${file.dest}...`);

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.dest,
        Body: fileStream,
        ContentType: contentType,
        ContentLength: stats.size,
    }));

    console.log(`✅ Uploaded: https://cdn.vidi.news/${file.dest}`);
}

async function main() {
    for (const file of files) {
        try {
            await uploadFile(file);
        } catch (e) {
            console.error(`Failed to upload ${file.dest}:`, e);
        }
    }
}

main();

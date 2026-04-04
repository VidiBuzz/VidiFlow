const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

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

async function deployFile(src, contentType) {
    try {
        const fileContent = fs.readFileSync(src);
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: src,
            Body: fileContent,
            ContentType: contentType,
        });
        await s3Client.send(command);
        console.log(`✅ Deployed: ${src}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to deploy ${src}:`, error.message);
        return false;
    }
}

async function deploy() {
    console.log('🚀 Deploying qwen3.5.hardware.html...\n');
    await deployFile('qwen3.5.hardware.html', 'text/html');
    console.log('\n✨ Done!');
    console.log('🌐 URL: https://pub-cbf23f2408c64b16a4314106f21e1a1d.r2.dev/qwen3.5.hardware.html');
}

deploy();

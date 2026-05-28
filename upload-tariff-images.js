const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';
const IMAGES_DIR = 'm:/code/vidismart/images';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const filesToUpload = [
    'tariff_china.png',
    'tariff_nafta.png',
    'tariff_global.png',
    'tariff_metals.png',
    'cape_container.png',
    'cape_liquidation.png',
    'cape_ace_portal.png',
    'cape_protest.png'
];

async function uploadFile(filename) {
    const fullPath = path.join(IMAGES_DIR, filename);
    const destPath = `images/${filename}`;
    
    try {
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${filename}`);
            return false;
        }
        const stats = fs.statSync(fullPath);
        const fileStream = fs.createReadStream(fullPath);

        console.log(`📤 Uploading: ${filename}`);

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: destPath,
            Body: fileStream,
            ContentType: 'image/png',
            ContentLength: stats.size,
        }));
        return true;
    } catch (e) {
        console.error(`❌ Failed ${filename}:`, e.message);
        return false;
    }
}

async function main() {
    for (const file of filesToUpload) {
        await uploadFile(file);
    }
    console.log('\n✅ Tariff images uploaded to R2.');
}

main();

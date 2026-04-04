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

const TARGET_FILE = 'SmartGenUi.html';

async function uploadFile() {
    const localPath = path.join(__dirname, TARGET_FILE);
    
    if (!fs.existsSync(localPath)) {
        console.log(`❌ Not found: ${localPath}`);
        return;
    }

    const fileContent = fs.readFileSync(localPath);
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: TARGET_FILE,
        Body: fileContent,
        ContentType: 'text/html',
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: https://vidismart.com/${TARGET_FILE}`);
    
    // Verify
    console.log(`File size: ${fileContent.length} bytes`);
}

uploadFile();

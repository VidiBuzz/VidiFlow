const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// Mapping local file to the requested remote filename
const FILE_MAPPING = {
    src: 'SmartChannelCXv1.html',
    dest: 'smartchannelcx.html',
    type: 'text/html'
};

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function run() {
    const localPath = path.join(__dirname, FILE_MAPPING.src);
    console.log(`Uploading ${FILE_MAPPING.src} as ${FILE_MAPPING.dest} to ${BUCKET_NAME}...`);

    if (!fs.existsSync(localPath)) {
        console.error(`❌ File not found: ${localPath}`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: FILE_MAPPING.dest,
            Body: fileStream,
            ContentType: FILE_MAPPING.type,
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Success! Uploaded to: https://vidismart.com/${FILE_MAPPING.dest}`);

    } catch (err) {
        console.error(`❌ Upload failed:`, err.message);
    }
}

run();

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// File to upload
const FILES_TO_UPLOAD = [
    { src: 'FRAMEIO_UI_REFERENCE.html', dest: 'FRAMEIO_UI_REFERENCE.html', type: 'text/html' },
    { src: 'frameio_dashboard_main.png', dest: 'frameio_dashboard_main.png', type: 'image/png' },
    { src: 'frameio_player_ui.png', dest: 'frameio_player_ui.png', type: 'image/png' },
    { src: 'frameio_asset_grid.png', dest: 'frameio_asset_grid.png', type: 'image/png' }
];

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function uploadFile(file) {
    constlocalPath = path.join(__dirname, file.src);
    console.log(`Uploading ${file.src} as ${file.dest}...`);

    if (!fs.existsSync(file.src)) {
        console.error(`❌ File not found: ${file.src}`);
        return;
    }

    try {
        const fileContent = fs.readFileSync(file.src);
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.dest,
            Body: fileContent,
            ContentType: file.type,
        });

        await s3Client.send(command);
        console.log(`✅ Success! https://vidismart.com/${file.dest}`);
    } catch (err) {
        console.error(`❌ Upload failed for ${file.dest}:`, err.message);
    }
}

async function run() {
    console.log('Pushing Frame.io Reference Update...');
    for (const file of FILES_TO_UPLOAD) {
        await uploadFile(file);
    }
    console.log('--- Deployment Complete ---');
}

run();

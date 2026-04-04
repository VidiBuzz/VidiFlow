const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

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

// Windows path needs double backslashes
const SOURCE_PATH = 'C:\\Users\\James\\.gemini\\antigravity\\brain\\d49510e0-6368-4f0c-8399-3fcda9f8623c\\vidiblast_architecture_flowchart_1769976962723.png';
const DEST_FILENAME = 'vidiblast_architecture_flowchart.png';

async function copyAndUpload() {
    console.log(`Copying from ${SOURCE_PATH}...`);

    if (!fs.existsSync(SOURCE_PATH)) {
        console.error('❌ Source file not found!');
        // Try WSL path just in case
        const wslPath = '/mnt/c/Users/James/.gemini/antigravity/brain/d49510e0-6368-4f0c-8399-3fcda9f8623c/vidiblast_architecture_flowchart_1769976962723.png';
        if (fs.existsSync(wslPath)) {
            console.log('Found at WSL path, using that.');
            await processFile(wslPath);
            return;
        }
        return;
    }

    await processFile(SOURCE_PATH);
}

async function processFile(srcPath) {
    try {
        // 1. Copy locally (optional, but good for repo)
        const localDest = path.join(__dirname, DEST_FILENAME);
        fs.copyFileSync(srcPath, localDest);
        console.log(`✅ Copied to ${localDest}`);

        // 2. Upload
        const fileStream = fs.createReadStream(localDest);
        const stats = fs.statSync(localDest);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: DEST_FILENAME,
            Body: fileStream,
            ContentType: 'image/png',
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Pushed Image: https://cdn.vidi.news/${DEST_FILENAME}`);
    } catch (err) {
        console.error(`❌ Failed:`, err.message);
    }
}

copyAndUpload();

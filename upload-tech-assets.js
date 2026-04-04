const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket (vidismart.com)
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// List of new images to upload
const FILES_TO_UPLOAD = [
    { src: 'tech_agent_ingestion.png', dest: 'tech_agent_ingestion.png', type: 'image/png' },
    { src: 'tech_agent_edit.png', dest: 'tech_agent_edit.png', type: 'image/png' },
    { src: 'tech_agent_graphics.png', dest: 'tech_agent_graphics.png', type: 'image/png' },
    { src: 'tech_agent_collab.png', dest: 'tech_agent_collab.png', type: 'image/png' },
    { src: 'tech_agent_search.png', dest: 'tech_agent_search.png', type: 'image/png' },
    { src: 'tech_agent_quality.png', dest: 'tech_agent_quality.png', type: 'image/png' },
    { src: 'tech_agent_render.png', dest: 'tech_agent_render.png', type: 'image/png' }
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
    // Check possible locations for the image (current dir or artifact dir)
    // In this environment, images might be in the root or a specific folder, 
    // but the previous steps saved them to absolute paths in artifacts.
    // However, for this script to work, I will assume the node process is running where the files are
    // OR I will just try to find them. 
    // Since I cannot easily move files from 'artifacts' to here without a move tool which I don't have explicit access to in this script context,
    // I will assume the 'generate_image' tool saved them to a recoverable location or I need to find them.
    // WAIT: The generate_image tool saves to C:/Users/...
    // I need to COPY them to the current directory first or reference them there.
    // Since I am writing a node script, I can try to access the artifact path if known, 
    // but the easiest way is to assume the agent (Me) acts as the bridge.

    // CORRECTION: The user's prompt implies I should just upload them. 
    // I will look for them in the current directory as standard procedure.
    // If they aren't there, this script fails.
    // I will add a step to copy them in the shell before running this.

    const localPath = path.join(__dirname, file.src);
    console.log(`Uploading ${file.src} as ${file.dest}...`);

    if (!fs.existsSync(localPath)) {
        console.error(`❌ File not found: ${localPath} - Skipping.`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.dest,
            Body: fileStream,
            ContentType: file.type,
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        console.log(`✅ Success! https://vidismart.com/${file.dest}`);
    } catch (err) {
        console.error(`❌ Upload failed for ${file.dest}:`, err.message);
    }
}

async function run() {
    console.log('Pushing Tech Page Assets...');
    for (const file of FILES_TO_UPLOAD) {
        await uploadFile(file);
    }
    console.log('--- Asset Deployment Complete ---');
}

run();

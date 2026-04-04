const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// --- CONFIGURATION ---
const R2_CONFIG = {
    accountId: '5830508745fd2ac063426ebf9429c22d',
    accessKeyId: 'e9c7b7eb9ea570cc59e413cfdf580deb',
    secretAccessKey: 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
    bucket: 'vidismart'
};

const SITEGROUND_CONFIG = {
    host: 'gtxm1044.siteground.biz',
    user: 'u2627-m33aqlpqghg3',
    port: 18765,
    remotePath: 'www/vidismart.com/public_html/'
};

// Files to deploy
const VIDEO_FILE = fs.existsSync('smartchannel.vidishop.branded.mp4')
    ? 'smartchannel.vidishop.branded.mp4'
    : 'smartchannel.vidishop.mp4';

console.log(`ℹ️ Selected video file: ${VIDEO_FILE}`);

const DEPLOY_TASKS = [
    {
        type: 'r2',
        src: VIDEO_FILE,
        dest: 'smartchannel.vidishop.mp4', // Always upload to this canonical name
        contentType: 'video/mp4'
    },
    {
        type: 'siteground',
        src: 'vidishop.html',
        dest: 'vidishop.html'
    }
];

// --- R2 CLIENT ---
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
    },
});

// --- HELPER FUNCTIONS ---

async function uploadToR2(src, dest, contentType) {
    console.log(`☁️  Uploading to R2 (CDN): ${src}...`);
    try {
        if (!fs.existsSync(src)) {
            throw new Error(`Local file not found: ${src}`);
        }
        const fileStream = fs.createReadStream(src);
        const stats = fs.statSync(src);

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_CONFIG.bucket,
            Key: dest,
            Body: fileStream,
            ContentType: contentType || 'application/octet-stream',
            ContentLength: stats.size,
        }));
        console.log(`✅ R2 Upload Success: https://cdn.vidi.news/${dest}`);
        return true;
    } catch (error) {
        console.error(`❌ R2 Upload Failed: ${error.message}`);
        return false;
    }
}

async function uploadToSiteGround(src, dest) {
    console.log(`🌍 Uploading to SiteGround (Web): ${src}...`);
    try {
        const cmd = `scp -P ${SITEGROUND_CONFIG.port} ${src} ${SITEGROUND_CONFIG.user}@${SITEGROUND_CONFIG.host}:${SITEGROUND_CONFIG.remotePath}${dest}`;
        // console.log(`   Command: ${cmd}`); // Debug info

        await execPromise(cmd);
        console.log(`✅ SiteGround Upload Success: https://vidismart.com/${dest}`);
        return true;
    } catch (error) {
        console.error(`❌ SiteGround Upload Failed: ${error.message}`);
        // Fallback or explicit error message
        console.error(`   Ensure you have SSH keys configured for ${SITEGROUND_CONFIG.host}`);
        return false;
    }
}

// --- MAIN EXECUTION ---

async function main() {
    console.log('🚀 Starting VidiShop Deployment...\n');

    for (const task of DEPLOY_TASKS) {
        if (task.type === 'r2') {
            await uploadToR2(task.src, task.dest, task.contentType);
        } else if (task.type === 'siteground') {
            await uploadToSiteGround(task.src, task.dest);
        }
    }

    console.log('\n✨ Deployment sequence complete.');
}

main();

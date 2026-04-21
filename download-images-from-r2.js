const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';
const LOCAL_IMAGES_DIR = 'm:/code/vidismart/images';

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function listAllImages() {
    const keys = [];
    let continuationToken = undefined;
    do {
        const res = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'images/',
            ContinuationToken: continuationToken,
        }));
        for (const obj of res.Contents || []) {
            // Skip the .keep placeholder and subdirectories
            if (obj.Key === 'images/.keep') continue;
            if (obj.Key.endsWith('/')) continue;
            keys.push({ key: obj.Key, size: obj.Size });
        }
        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);
    return keys;
}

async function downloadFile(key, size) {
    // Strip the "images/" prefix to get the local filename
    const filename = key.replace(/^images\//, '');
    const localPath = path.join(LOCAL_IMAGES_DIR, filename);

    // Skip if already exists with same size
    if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        if (stat.size === size) {
            console.log(`⏭  Skipped (exists): ${filename}`);
            return false;
        }
    }

    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    const writeStream = fs.createWriteStream(localPath);
    await pipeline(res.Body, writeStream);
    console.log(`✅ Downloaded: ${filename} (${(size / 1024).toFixed(1)} KB)`);
    return true;
}

async function main() {
    console.log('🔍 Listing images in R2...');
    const files = await listAllImages();
    console.log(`📦 Found ${files.length} files under images/ in R2\n`);

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const { key, size } of files) {
        try {
            const didDownload = await downloadFile(key, size);
            if (didDownload) downloaded++;
            else skipped++;
        } catch (err) {
            console.error(`❌ Failed: ${key} — ${err.message}`);
            failed++;
        }
    }

    console.log(`\n✨ Done. Downloaded: ${downloaded} | Skipped (already exist): ${skipped} | Failed: ${failed}`);
}

main().catch(console.error);

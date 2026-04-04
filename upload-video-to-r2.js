#!/usr/bin/env node

// Upload video directly from URL to R2 bucket
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// Video source
const VIDEO_URL = 'https://mvv.modalityvector.com/vidismart/The_Visual_AI_Smart_Stack.mp4';
const VIDEO_KEY = 'The_Visual_AI_Smart_Stack.mp4';

// Configure S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadVideoToR2() {
  console.log(`Fetching video from: ${VIDEO_URL}`);

  return new Promise((resolve, reject) => {
    https.get(VIDEO_URL, async (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch video: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      let totalSize = 0;

      response.on('data', (chunk) => {
        chunks.push(chunk);
        totalSize += chunk.length;
        process.stdout.write(`\rDownloading: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      });

      response.on('end', async () => {
        console.log('\n✅ Video fetched successfully');
        const videoBuffer = Buffer.concat(chunks);

        try {
          console.log(`\nUploading to R2 bucket: ${BUCKET_NAME}/${VIDEO_KEY}...`);

          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: VIDEO_KEY,
            Body: videoBuffer,
            ContentType: 'video/mp4',
          });

          await s3Client.send(command);

          console.log('✅ Video uploaded successfully to R2!');
          console.log(`\nVideo URL: https://cdn.vidi.news/${VIDEO_KEY}`);
          console.log(`\nNext steps:`);
          console.log(`1. Configure custom domain "cdn.vidi.news" in Cloudflare R2 dashboard`);
          console.log(`2. Update gemini.dash.html to use the new URL`);

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      response.on('error', reject);
    }).on('error', reject);
  });
}

uploadVideoToR2().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

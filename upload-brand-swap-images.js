#!/usr/bin/env node

// Upload brand swap images to R2 bucket
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// Configure S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadImage(localPath, r2Key) {
  console.log(`Uploading ${localPath} to R2...`);
  
  const fileContent = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  
  const contentType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }[ext] || 'application/octet-stream';

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: r2Key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    const publicUrl = `https://cdn.vidi.news/${r2Key}`;
    console.log('✅ Uploaded successfully!');
    console.log(`URL: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

// Upload brand swap step images
const imagesToUpload = [
  { local: 'images/brandswap_step_1_1773418282695.png', r2: 'brandswap_step_1.png' },
  { local: 'images/brandswap_step_2_1773418297809.png', r2: 'brandswap_step_2.png' },
  { local: 'images/brandswap_step_3_1773418311822.png', r2: 'brandswap_step_3.png' },
  { local: 'images/brandswap_step_4_1773418325928.png', r2: 'brandswap_step_4.png' },
  { local: 'images/brandswap_step_5_1773418341806.png', r2: 'brandswap_step_5.png' },
];

async function main() {
  console.log('🚀 Starting brand swap images upload to R2...\n');
  
  for (const img of imagesToUpload) {
    await uploadImage(img.local, img.r2);
    console.log('');
  }
  
  console.log('✨ All brand swap images uploaded successfully!');
}

main().catch(console.error);

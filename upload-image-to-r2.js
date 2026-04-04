#!/usr/bin/env node

// Upload local image to R2 bucket
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

// Upload multiple images
const imagesToUpload = [
  { local: '/mnt/m/code/vidismart/images/VidiFLOW.png', r2: 'images/VidiFLOW.png' },
  { local: '/mnt/m/code/vidismart/images/VidiNews12.png', r2: 'images/VidiNews12.png' },
  { local: '/mnt/m/code/vidismart/images/VidiNEWS.png', r2: 'images/VidiNEWS.png' },
];

async function uploadAll() {
  for (const img of imagesToUpload) {
    await uploadImage(img.local, img.r2);
    console.log('');
  }
  console.log('✅ All uploads complete!');
}

uploadAll();

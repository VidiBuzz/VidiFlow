#!/usr/bin/env node

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const images = [
  'images/brandswap_step_1.png',
  'images/brandswap_step_2.png',
  'images/brandswap_step_3.png',
  'images/brandswap_step_4.png',
  'images/brandswap_step_5.png',
  'images/velocis_replaces_slocum.png'
];

async function uploadImages() {
  console.log('🚀 Uploading BrandSwap images to cdn.vidi.news...\n');

  for (const filePath of images) {
    const fileName = path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath);
    console.log(`📤 Uploading ${fileName} (${fileContent.length} bytes)...`);

    try {
      const command = new PutObjectCommand({
        Bucket: 'vidismart',
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/png',
      });

      await s3Client.send(command);
      console.log(`✅ ${fileName} uploaded successfully!`);
      console.log(`   URL: https://cdn.vidi.news/${fileName}\n`);

    } catch (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message);
    }
  }

  console.log('\n🎉 All images uploaded to cdn.vidi.news!');
}

uploadImages();

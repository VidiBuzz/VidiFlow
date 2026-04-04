#!/usr/bin/env node

// List all files in R2 bucket
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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

async function listR2Files() {
  try {
    console.log(`Listing files in bucket: ${BUCKET_NAME}\n`);
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // Adjust if you have more files
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('No files found in bucket.');
      return;
    }

    console.log(`Found ${response.Contents.length} files:\n`);
    
    // Group files by type
    const images = [];
    const videos = [];
    const other = [];
    
    response.Contents.forEach((file) => {
      const key = file.Key;
      const size = (file.Size / 1024 / 1024).toFixed(2);
      const lastModified = file.LastModified;
      
      if (key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        images.push({ key, size, lastModified });
      } else if (key.match(/\.(mp4|webm|mov|avi)$/i)) {
        videos.push({ key, size, lastModified });
      } else {
        other.push({ key, size, lastModified });
      }
    });
    
    if (images.length > 0) {
      console.log(`📸 Images (${images.length}):`);
      images.forEach(img => {
        console.log(`  - ${img.key} (${img.size} MB)`);
      });
      console.log();
    }
    
    if (videos.length > 0) {
      console.log(`🎬 Videos (${videos.length}):`);
      videos.forEach(vid => {
        console.log(`  - ${vid.key} (${vid.size} MB)`);
      });
      console.log();
    }
    
    if (other.length > 0) {
      console.log(`📁 Other files (${other.length}):`);
      other.forEach(file => {
        console.log(`  - ${file.key} (${file.size} MB)`);
      });
    }
    
    console.log(`\n✅ CDN URLs will be: https://cdn.vidi.news/[filename]`);
    
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    process.exit(1);
  }
}

listR2Files();

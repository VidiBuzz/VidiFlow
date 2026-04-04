#!/usr/bin/env node

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
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

async function uploadImage() {
  const filePath = 'images/velocis_replaces_slocum.png';
  const fileName = 'velocis_replaces_slocum.png';
  
  console.log('Reading file:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(filePath);
  console.log('File size:', fileContent.length, 'bytes');
  
  try {
    const command = new PutObjectCommand({
      Bucket: 'vidismart',
      Key: fileName,
      Body: fileContent,
      ContentType: 'image/png',
    });
    
    console.log('Uploading to R2...');
    const result = await s3Client.send(command);
    console.log('Upload result:', result);
    
    // Verify
    const listCmd = new ListObjectsV2Command({ Bucket: 'vidismart', MaxKeys: 10 });
    const listResult = await s3Client.send(listCmd);
    console.log('\nFiles in bucket:');
    listResult.Contents.forEach(f => console.log('  -', f.Key));
    
    console.log('\n✅ Image uploaded successfully!');
    console.log('URL: https://vidismart.r2.cloudflarestorage.com/' + fileName);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.$metadata) {
      console.error('Metadata:', error.$metadata);
    }
    process.exit(1);
  }
}

uploadImage();

#!/usr/bin/env node

const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// This is the account where vidismart bucket exists
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

async function showRecentUploads() {
  console.log('Account:', R2_ACCOUNT_ID);
  console.log('\nRecent files in vidismart bucket:\n');
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: 'vidismart',
      MaxKeys: 20
    });
    
    const response = await s3Client.send(command);
    
    // Sort by last modified date (newest first)
    const sortedFiles = (response.Contents || [])
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
      .slice(0, 10);
    
    sortedFiles.forEach(file => {
      const date = new Date(file.LastModified).toLocaleString();
      const size = (file.Size / 1024 / 1024).toFixed(2);
      console.log(`${date} - ${file.Key} (${size} MB)`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

showRecentUploads();

#!/usr/bin/env node

const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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

async function checkBuckets() {
  console.log('Using Account ID:', R2_ACCOUNT_ID);
  console.log('Checking what buckets exist with these credentials...\n');
  
  try {
    // List all buckets
    const bucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(bucketsCommand);
    
    console.log('Buckets found:');
    for (const bucket of bucketsResponse.Buckets || []) {
      console.log(`  - ${bucket.Name}`);
    }
    console.log();
    
    // Check each bucket for files
    for (const bucket of bucketsResponse.Buckets || []) {
      console.log(`\nChecking bucket: ${bucket.Name}`);
      try {
        const objectsCommand = new ListObjectsV2Command({
          Bucket: bucket.Name,
          MaxKeys: 5
        });
        const objectsResponse = await s3Client.send(objectsCommand);
        
        console.log(`  Files: ${objectsResponse.Contents?.length || 0}`);
        if (objectsResponse.Contents) {
          objectsResponse.Contents.slice(0, 3).forEach(file => {
            console.log(`    - ${file.Key}`);
          });
        }
      } catch (err) {
        console.log(`  Error accessing: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBuckets();

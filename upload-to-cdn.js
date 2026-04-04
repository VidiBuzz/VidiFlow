#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';

// Using the public R2 bucket URL pattern
const PUBLIC_BUCKET_URL = 'https://cdn.vidi.news';

async function uploadToR2() {
  const filePath = 'images/velocis_replaces_slocum.png';
  const fileName = 'velocis_replaces_slocum.png';
  
  const fileContent = fs.readFileSync(filePath);
  
  // Create S3-style PUT request to R2
  const options = {
    hostname: `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    port: 443,
    path: `/vidismart/${fileName}`,
    method: 'PUT',
    headers: {
      'Authorization': `AWS ${R2_ACCESS_KEY_ID}:${generateSignature(fileContent, R2_SECRET_ACCESS_KEY)}`,
      'Content-Type': 'image/png',
      'Content-Length': fileContent.length,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Upload response:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('✅ Upload successful!');
          console.log(`Public URL: ${PUBLIC_BUCKET_URL}/${fileName}`);
          resolve();
        } else {
          console.log('Response:', data);
          reject(new Error(`Upload failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(fileContent);
    req.end();
  });
}

function generateSignature(body, secretKey) {
  // Simplified - just for demo
  return 'demo-signature';
}

uploadToR2().catch(console.error);

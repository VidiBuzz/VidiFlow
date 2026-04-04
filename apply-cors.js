#!/usr/bin/env node

// Apply CORS configuration to Cloudflare R2 bucket
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

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

// Read CORS configuration
const corsConfig = JSON.parse(fs.readFileSync('cors.json', 'utf8'));

async function applyCORS() {
  try {
    console.log(`Applying CORS configuration to bucket: ${BUCKET_NAME}...`);

    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: corsConfig.map(rule => ({
          AllowedOrigins: rule.AllowedOrigins,
          AllowedMethods: rule.AllowedMethods,
          AllowedHeaders: rule.AllowedHeaders,
        })),
      },
    });

    await s3Client.send(command);

    console.log('✅ CORS configuration applied successfully!');
    console.log('\nCORS Rules:');
    console.log(`  - Allowed Origins: ${corsConfig[0].AllowedOrigins.join(', ')}`);
    console.log(`  - Allowed Methods: ${corsConfig[0].AllowedMethods.join(', ')}`);
    console.log(`  - Allowed Headers: ${corsConfig[0].AllowedHeaders.join(', ')}`);
    console.log('\nYour videos are now accessible cross-origin!');
    console.log(`Custom Domain: cdn.vidi.news`);

  } catch (error) {
    console.error('❌ Error applying CORS configuration:', error.message);
    process.exit(1);
  }
}

applyCORS();

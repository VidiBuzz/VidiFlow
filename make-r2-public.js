#!/usr/bin/env node

const { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } = require('@aws-sdk/client-s3');

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

// Public policy for R2 bucket - allows anyone to read objects
const publicPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicRead",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: ["arn:aws:s3:::vidismart/*"]
    }
  ]
};

async function setPublicAccess() {
  try {
    console.log('Setting public read policy on vidismart bucket...');
    
    const policyCommand = new PutBucketPolicyCommand({
      Bucket: 'vidismart',
      Policy: JSON.stringify(publicPolicy)
    });
    
    await s3Client.send(policyCommand);
    console.log('✅ Public access policy applied successfully!');
    console.log('Objects should now be publicly accessible at:');
    console.log(`https://pub-4f264586865740e8a07ad858d4830895.r2.dev/<object-key>`);
    
  } catch (error) {
    console.error('Error setting policy:', error.message);
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }
  }
}

setPublicAccess();

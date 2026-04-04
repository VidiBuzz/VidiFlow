const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration - VidiSmart
const R2_CONFIG = {
  region: 'auto',
  endpoint: 'https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'e9c7b7eb9ea570cc59e413cfdf580deb',
    secretAccessKey: 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
  },
};

const BUCKET_NAME = 'vidismart';

const s3Client = new S3Client(R2_CONFIG);

async function deployFile(localPath, remoteKey, contentType) {
  try {
    const fileContent = fs.readFileSync(localPath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: remoteKey,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600',
    });

    await s3Client.send(command);
    console.log(`✅ Deployed: ${localPath} -> ${remoteKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deploy ${localPath}:`, error.message);
    return false;
  }
}

async function deploy() {
  console.log('🚀 Starting deployment of qwen3.5.hardware.html...\n');

  // Deploy the HTML file
  await deployFile(
    'qwen3.5.hardware.html',
    'qwen3.5.hardware.html',
    'text/html'
  );

  console.log('\n✨ Deployment complete!');
  console.log(`🌐 File available at: https://cdn.vidi.news/qwen3.5.hardware.html`);
}

deploy().catch(console.error);

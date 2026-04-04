const { S3Client, PutObjectCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

// R2 Configuration
const R2_CONFIG = {
    accountId: '5830508745fd2ac063426ebf9429c22d',
    accessKeyId: 'e9c7b7eb9ea570cc59e413cfdf580deb',
    secretAccessKey: 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
    bucketName: 'vidismart',
};

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
    },
});

async function deployFile(filename) {
    if (!fs.existsSync(filename)) {
        console.error(`❌ File not found: ${filename}`);
        return false;
    }

    try {
        const fileContent = fs.readFileSync(filename);
        
        const command = new PutObjectCommand({
            Bucket: R2_CONFIG.bucketName,
            Key: filename,
            Body: fileContent,
            ContentType: 'text/html',
            // Make object publicly readable
            ACL: 'public-read',
        });

        await s3Client.send(command);
        
        const publicUrl = `https://pub-cbf23f2408c64b16a4314106f21e1a1d.r2.dev/${filename}`;
        console.log(`✅ Deployed: ${filename}`);
        console.log(`🌐 URL: ${publicUrl}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed:`, error.message);
        return false;
    }
}

// Deploy
console.log('🚀 Deploying with public access...\n');
deployFile('qwen3.5.hardware.html');

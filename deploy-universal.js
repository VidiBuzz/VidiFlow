const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

/**
 * VidiSmart Universal Deployment Script
 * 
 * Usage:
 *   node deploy-universal.js <filename> [type]
 *   
 * Examples:
 *   node deploy-universal.js qwen3.5.hardware.html
 *   node deploy-universal.js my-page.html text/html
 *   node deploy-universal.js styles.css text/css
 *   node deploy-universal.js image.png image/png
 */

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

// Auto-detect content type from file extension
function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
}

async function deployFile(filename, contentType) {
    if (!fs.existsSync(filename)) {
        console.error(`❌ File not found: ${filename}`);
        return false;
    }

    try {
        const fileContent = fs.readFileSync(filename);
        const finalContentType = contentType || getContentType(filename);
        
        const command = new PutObjectCommand({
            Bucket: R2_CONFIG.bucketName,
            Key: filename,
            Body: fileContent,
            ContentType: finalContentType,
            CacheControl: 'public, max-age=3600',
        });

        await s3Client.send(command);
        
        const publicUrl = `https://pub-cbf23f2408c64b16a4314106f21e1a1d.r2.dev/${filename}`;
        console.log(`✅ Deployed: ${filename}`);
        console.log(`📦 Type: ${finalContentType}`);
        console.log(`🌐 URL: ${publicUrl}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to deploy ${filename}:`, error.message);
        return false;
    }
}

async function deployMultiple(files) {
    console.log(`🚀 Deploying ${files.length} file(s)...\n`);
    
    let successCount = 0;
    for (const file of files) {
        const result = await deployFile(file);
        if (result) successCount++;
        console.log('');
    }
    
    console.log(`✨ Complete: ${successCount}/${files.length} files deployed`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('VidiSmart Universal Deployment Script\n');
    console.log('Usage:');
    console.log('  node deploy-universal.js <filename> [content-type]');
    console.log('  node deploy-universal.js file1.html file2.css file3.png\n');
    console.log('Examples:');
    console.log('  node deploy-universal.js qwen3.5.hardware.html');
    console.log('  node deploy-universal.js styles.css text/css');
    console.log('  node deploy-universal.js page1.html page2.html page3.html\n');
    process.exit(0);
}

// Check if first arg is a content type (contains /)
const firstArg = args[0];
const isContentType = firstArg.includes('/');

if (isContentType && args.length >= 2) {
    // Format: deploy-universal.js <content-type> <file1> <file2>...
    const contentType = firstArg;
    const files = args.slice(1);
    deployMultiple(files.map(f => ({ file: f, type: contentType })));
} else {
    // Format: deploy-universal.js <file1> <file2>...
    // Auto-detect content types
    deployMultiple(args);
}

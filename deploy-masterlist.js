const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// =============================================================================
// VidiSmart Deployment Configuration
// =============================================================================
// This script deploys files to:
// 1. SiteGround (vidismart.com) via Git push for HTML/CSS/JS
// 2. Cloudflare R2 (CDN) for images and videos
// =============================================================================

const R2_CONFIG = {
    accountId: '5830508745fd2ac063426ebf9429c22d',
    accessKeyId: 'e9c7b7eb9ea570cc59e413cfdf580deb',
    secretAccessKey: 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
    bucket: 'vidismart',
    cdnDomain: 'cdn.vidi.news'
};

const SITEGROUND_CONFIG = {
    remote: 'origin',
    branch: 'master',
    remotePath: 'ssh://u2627-m33aqlpqghg3@gtxm1044.siteground.biz:18765/home/customer/www/vidismart.com/public_html/'
};

// File extensions to upload to R2 (CDN)
const MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.mp4', '.webm', '.avi', '.mov'];

// Initialize S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
    },
});

// =============================================================================
// Helper Functions
// =============================================================================

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
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
}

function isMediaFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return MEDIA_EXTENSIONS.includes(ext);
}

function extractMediaFiles(htmlContent) {
    const mediaFiles = new Set();
    
    // Match src attributes
    const srcRegex = /src=["']([^"']+?)["']/gi;
    let match;
    while ((match = srcRegex.exec(htmlContent)) !== null) {
        const src = match[1];
        if (!src.startsWith('http') && !src.startsWith('data:')) {
            mediaFiles.add(src);
        }
    }
    
    // Match srcset attributes
    const srcsetRegex = /srcset=["']([^"']+?)["']/gi;
    while ((match = srcsetRegex.exec(htmlContent)) !== null) {
        const srcset = match[1];
        srcset.split(',').forEach(item => {
            const src = item.trim().split(/\s+/)[0];
            if (!src.startsWith('http') && !src.startsWith('data:')) {
                mediaFiles.add(src);
            }
        });
    }
    
    // Match poster attributes (for video thumbnails)
    const posterRegex = /poster=["']([^"']+?)["']/gi;
    while ((match = posterRegex.exec(htmlContent)) !== null) {
        const poster = match[1];
        if (!poster.startsWith('http') && !poster.startsWith('data:')) {
            mediaFiles.add(poster);
        }
    }
    
    return Array.from(mediaFiles);
}

async function uploadToR2(localPath, remoteKey, contentType) {
    try {
        if (!fs.existsSync(localPath)) {
            console.log(`⚠️  File not found (skipping): ${localPath}`);
            return false;
        }
        
        const fileContent = fs.readFileSync(localPath);
        const finalContentType = contentType || getContentType(localPath);
        
        const command = new PutObjectCommand({
            Bucket: R2_CONFIG.bucket,
            Key: remoteKey,
            Body: fileContent,
            ContentType: finalContentType,
            CacheControl: 'public, max-age=31536000', // 1 year cache for CDN
        });
        
        await s3Client.send(command);
        
        const publicUrl = `https://${R2_CONFIG.cdnDomain}/${remoteKey}`;
        console.log(`✅ R2 Upload: ${remoteKey}`);
        console.log(`   📦 Type: ${finalContentType}`);
        console.log(`   🌐 URL: ${publicUrl}`);
        return true;
    } catch (error) {
        console.error(`❌ R2 Upload Failed: ${remoteKey}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

function gitPush(filename) {
    try {
        console.log('📦 Git Operations:');
        
        // Add file to git (force to bypass .gitignore)
        console.log(`   Adding ${filename} to git...`);
        execSync(`git add -f "${filename}"`, { stdio: 'pipe' });
        
        // Commit
        console.log(`   Committing changes...`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        execSync(`git commit -m "deploy: ${filename} - ${timestamp}"`, { stdio: 'pipe' });
        
        // Push to SiteGround
        console.log(`   Pushing to SiteGround (${SITEGROUND_CONFIG.remotePath})...`);
        execSync(`git push ${SITEGROUND_CONFIG.remote} ${SITEGROUND_CONFIG.branch}`, { stdio: 'inherit' });
        
        const publicUrl = `https://vidismart.com/${filename}`;
        console.log(`✅ SiteGround Deploy: ${publicUrl}`);
        return true;
    } catch (error) {
        console.error(`❌ Git Push Failed: ${error.message}`);
        return false;
    }
}

// =============================================================================
// Main Deployment Function
// =============================================================================

async function deploy(filename, options = {}) {
    const { uploadMedia = true, pushToGit = true } = options;
    
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║       VidiSmart Deployment Script                         ║');
    console.log('║       HTML/CSS/JS → SiteGround (Git)                      ║');
    console.log('║       Images/Videos → Cloudflare R2 (CDN)                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    
    if (!fs.existsSync(filename)) {
        console.error(`❌ File not found: ${filename}`);
        return false;
    }
    
    const stats = fs.statSync(filename);
    console.log(`📄 Source File: ${filename}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('');
    
    let successCount = 0;
    
    // Step 1: Extract and upload media files to R2
    if (uploadMedia) {
        console.log('☁️  Step 1: Uploading media files to R2 CDN...');
        console.log('');
        
        const htmlContent = fs.readFileSync(filename, 'utf-8');
        const mediaFiles = extractMediaFiles(htmlContent);
        
        if (mediaFiles.length > 0) {
            console.log(`   Found ${mediaFiles.length} media file(s) to upload:\n`);
            
            for (const mediaFile of mediaFiles) {
                const localPath = path.join(path.dirname(filename), mediaFile);
                const result = await uploadToR2(localPath, mediaFile);
                if (result) successCount++;
            }
        } else {
            console.log('   No local media files found in HTML.');
        }
        console.log('');
    }
    
    // Step 2: Push HTML to SiteGround via Git
    if (pushToGit) {
        console.log('🌍 Step 2: Deploying to SiteGround via Git...');
        console.log('');
        
        const result = gitPush(filename);
        if (result) successCount++;
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✨ Deployment Complete: ${successCount} operation(s) successful`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return true;
}

// =============================================================================
// CLI Interface
// =============================================================================

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
VidiSmart Deployment Script

Usage:
  node deploy-masterlist.js <filename> [options]

Options:
  --no-media    Skip media upload to R2
  --no-git      Skip git push to SiteGround

Examples:
  node deploy-masterlist.js vidismart.masterlist.html
  node deploy-masterlist.js index.html --no-media
  node deploy-masterlist.js styles.css --no-git
`);
    process.exit(0);
}

const filename = args[0];
const options = {
    uploadMedia: !args.includes('--no-media'),
    pushToGit: !args.includes('--no-git'),
};

deploy(filename, options).then(success => {
    process.exit(success ? 0 : 1);
});

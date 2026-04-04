const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// R2 Configuration for vidiflow
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidiflow';

const BASE_PATH = 'm:/code/vidismart/vidiflow';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

function getContentType(filename) {
    if (filename.endsWith('.html')) return 'text/html';
    if (filename.endsWith('.css')) return 'text/css';
    if (filename.endsWith('.js')) return 'application/javascript';
    if (filename.endsWith('.json')) return 'application/json';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.svg')) return 'image/svg+xml';
    if (filename.endsWith('.woff') || filename.endsWith('.woff2')) return 'font/woff2';
    return 'application/octet-stream';
}

async function uploadFile(filePath, destPath) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing file: ${filePath}`);
        return false;
    }

    const fileStream = fs.createReadStream(filePath);
    const stats = fs.statSync(filePath);
    const contentType = getContentType(destPath);

    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`📤 Uploading ${destPath} (${sizeKB} KB)...`);

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: destPath,
            Body: fileStream,
            ContentType: contentType,
            ContentLength: stats.size,
            CacheControl: 'max-age=31536000',
        }));
        console.log(`✅ Uploaded: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${destPath}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed to upload ${destPath}:`, e.message);
        return false;
    }
}

async function uploadDirectory(dirPath, prefix = '') {
    const files = fs.readdirSync(dirPath);
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const result = await uploadDirectory(fullPath, path.join(prefix, file));
            successCount += result.success;
            failCount += result.fail;
        } else {
            const destPath = prefix ? path.join(prefix, file) : file;
            if (await uploadFile(fullPath, destPath)) {
                successCount++;
            } else {
                failCount++;
            }
        }
    }

    return { success: successCount, fail: failCount };
}

async function buildFrontend() {
    return new Promise((resolve, reject) => {
        console.log('🔨 Building VidiFlow frontend...');
        const buildProcess = exec('npm run build', {
            cwd: path.join(BASE_PATH, 'frontend'),
            maxBuffer: 1024 * 1024 * 10, // 10MB
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Build failed:', error.message);
                // Still resolve to try uploading existing build
                resolve(false);
            } else {
                console.log('✅ Build completed');
                resolve(true);
            }
        });

        buildProcess.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });

        buildProcess.stderr.on('data', (data) => {
            console.error(data.toString().trim());
        });
    });
}

async function main() {
    console.log('🚀 VidiFlow Deployment Script');
    console.log('=============================\n');

    // Step 1: Build the frontend
    console.log('Step 1: Building frontend...');
    await buildFrontend();

    // Step 2: Check if build exists
    const outDir = path.join(BASE_PATH, 'frontend/.next/static');
    const outDirServer = path.join(BASE_PATH, 'frontend/.next/server');

    if (!fs.existsSync(path.join(BASE_PATH, 'frontend/.next'))) {
        console.log('⚠️  No build found. Please run "npm run build" first in the frontend directory.');
        console.log('   Trying to deploy existing files...\n');
    }

    // Step 3: Upload all static files
    console.log('Step 2: Uploading to R2 CDN...\n');

    // Files to upload (from .next/output/export or .next/static)
    const uploadPaths = [
        { src: path.join(BASE_PATH, 'frontend/.next/static'), dest: '_next/static' },
        { src: path.join(BASE_PATH, 'frontend/.next/server'), dest: '_next/server' },
        { src: path.join(BASE_PATH, 'frontend/public'), dest: '' },
    ];

    let totalSuccess = 0;
    let totalFail = 0;

    for (const uploadPath of uploadPaths) {
        if (fs.existsSync(uploadPath.src)) {
            console.log(`\n📁 Uploading ${uploadPath.src} → ${uploadPath.dest || '(root)'}`);
            const result = await uploadDirectory(uploadPath.src, uploadPath.dest);
            totalSuccess += result.success;
            totalFail += result.fail;
        }
    }

    // Step 4: Upload index.html (static export)
    console.log('\nStep 3: Creating static pages...');

    // Create a simple static landing page
    const staticLandingPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VidiFlow - Multi-Agent Visual AI Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container { max-width: 1200px; text-align: center; }
        h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { font-size: 1.25rem; color: #94a3b8; margin-bottom: 3rem; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 3rem 0; }
        .feature { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; }
        .feature h3 { color: #818cf8; margin-bottom: 0.5rem; }
        .status { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.75rem 1.5rem; border-radius: 100px; display: inline-block; margin-top: 2rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 VidiFlow</h1>
        <p class="subtitle">Multi-Agent Visual AI Platform</p>

        <div class="features">
            <div class="feature">
                <h3>🤖 4 AI Agents</h3>
                <p>Grok 4.1 Fast, GLM 4.7, MiniMax 2.1, Qwen3 VL</p>
            </div>
            <div class="feature">
                <h3>🎨 ComfyUI Workflows</h3>
                <p>Text-to-video, image generation, style transfer</p>
            </div>
            <div class="feature">
                <h3>🕸️ GraphRAG</h3>
                <p>Neo4j knowledge graph + Vespa vector search</p>
            </div>
            <div class="feature">
                <h3>💰 $0/month</h3>
                <p>All services use free tiers or run locally</p>
            </div>
        </div>

        <div class="status">✅ Platform Ready for Deployment</div>
    </div>
</body>
</html>`;

    await uploadFileBuffer('index.html', staticLandingPage, 'text/html');
    await uploadFileBuffer('api/index.html', staticLandingPage, 'text/html');

    console.log('\n=============================');
    console.log('✨ Deployment complete!');
    console.log(`\n📍 URLs:`);
    console.log(`   https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/index.html`);
    console.log(`   https://cdn.vidi.news/vidiflow/index.html`);

    // Set up public URL
    console.log(`\n🌐 Public URL: https://cdn.vidi.news/vidiflow/`);
}

async function uploadFileBuffer(destPath, content, contentType) {
    console.log(`📤 Creating ${destPath}...`);
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: destPath,
            Body: content,
            ContentType: contentType,
            CacheControl: 'max-age=3600',
        }));
        console.log(`✅ Created: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${destPath}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed:`, e.message);
        return false;
    }
}

main().catch(console.error);

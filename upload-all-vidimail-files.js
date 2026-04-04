const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// Base path
const BASE_PATH = 'm:/code/vidismart';

// Files to upload - HTML files
const htmlFiles = [
    'VIDIMAIL_VIDIBLAST_SHOWCASE.html',
    'VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.html',
    'SmartGenUi.html',
    'VidiShop.Gen2.UI.html',
    'SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html',
    'vidicity-agent-orchestration.html',
    'vidicityplan2.html',
    'smartchannelcx.html',
    'smartgen.html',
    'index.html',
    'moderntechguidelines.html',
    'smartstack.html',
    'smartchannelcx.tech.html',
];

// Plans subfolder files
const plansFiles = [
    { src: 'plans/SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html', dest: 'plans/SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html' },
    { src: 'plans/smartchannel-new-pages-architecture.md', dest: 'plans/smartchannel-new-pages-architecture.md' },
    { src: 'plans/vidicity-agent-orchestration.html', dest: 'plans/vidicity-agent-orchestration.html' },
    { src: 'plans/vidicity-architecture-plan.md', dest: 'plans/vidicity-architecture-plan.md' },
    { src: 'plans/vidicityplan2.html', dest: 'plans/vidicityplan2.html' },
];

// Markdown documentation files
const mdFiles = [
    'VIDIMAIL_AGENTIC_ARCHITECTURE.md',
    'VIDIMAIL_BUILD_PLAN.md',
    'VIDIMAIL_IMPLEMENTATION_ROADMAP.md',
    'VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.md',
];

// CSS files
const cssFiles = [
    'style.css',
    'aura.css',
    'aurastyle.css',
];

// Image files
const imageFiles = [
    { src: 'images/sendspark/01-hero-section.jpg', dest: 'images/sendspark/01-hero-section.jpg' },
    { src: 'images/sendspark/02-ai-demo-modal.jpg', dest: 'images/sendspark/02-ai-demo-modal.jpg' },
    { src: 'images/sendspark/03-record-once-personalize.jpg', dest: 'images/sendspark/03-record-once-personalize.jpg' },
    { src: 'images/sendspark/04-dynamic-backgrounds.jpg', dest: 'images/sendspark/04-dynamic-backgrounds.jpg' },
    { src: 'images/sendspark/05-personalized-video-pages.jpg', dest: 'images/sendspark/05-personalized-video-pages.jpg' },
    { src: 'images/sendspark/06-edit-landing-page.jpg', dest: 'images/sendspark/06-edit-landing-page.jpg' },
    { src: 'images/sendspark/07-add-contacts-generate.jpg', dest: 'images/sendspark/07-add-contacts-generate.jpg' },
    { src: 'images/sendspark/08-cta-section.jpg', dest: 'images/sendspark/08-cta-section.jpg' },
    { src: 'images/sendspark/09-main-hero.jpg', dest: 'images/sendspark/09-main-hero.jpg' },
    { src: 'images/sendspark/10-video-demo.jpg', dest: 'images/sendspark/10-video-demo.jpg' },
    { src: 'vidiblast_architecture_flowchart.png', dest: 'vidiblast_architecture_flowchart.png' },
    { src: 'vidiblast_audience_matrix_ui.png', dest: 'vidiblast_audience_matrix_ui.png' },
    { src: 'vidiblast_voice_avatar_ui.png', dest: 'vidiblast_voice_avatar_ui.png' },
    { src: 'viditwin_vs_vidiblast_comparison.png', dest: 'viditwin_vs_vidiblast_comparison.png' },
];

// Configure S3 client
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
    if (filename.endsWith('.md')) return 'text/markdown';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.svg')) return 'image/svg+xml';
    if (filename.endsWith('.js')) return 'application/javascript';
    if (filename.endsWith('.json')) return 'application/json';
    return 'application/octet-stream';
}

async function uploadFile(srcPath, destPath) {
    const fullPath = path.join(BASE_PATH, srcPath);
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Missing file: ${fullPath}`);
        return false;
    }

    const fileStream = fs.createReadStream(fullPath);
    const stats = fs.statSync(fullPath);
    const contentType = getContentType(destPath);

    console.log(`📤 Uploading ${destPath} (${(stats.size / 1024).toFixed(1)} KB)...`);

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: destPath,
            Body: fileStream,
            ContentType: contentType,
            ContentLength: stats.size,
        }));
        console.log(`✅ Uploaded: https://cdn.vidi.news/${destPath}`);
        return true;
    } catch (e) {
        console.error(`❌ Failed to upload ${destPath}:`, e.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Uploading VidiMail files to Cloudflare R2...\n');
    
    let successCount = 0;
    let failCount = 0;

    // Upload HTML files
    console.log('📄 HTML Files:');
    for (const file of htmlFiles) {
        const src = file;
        const dest = file;
        if (await uploadFile(src, dest)) successCount++;
        else failCount++;
    }
    
    // Upload Markdown files
    console.log('\n📝 Markdown Files:');
    for (const file of mdFiles) {
        const src = file;
        const dest = file;
        if (await uploadFile(src, dest)) successCount++;
        else failCount++;
    }
    
    // Upload CSS files
    console.log('\n🎨 CSS Files:');
    for (const file of cssFiles) {
        const src = file;
        const dest = file;
        if (await uploadFile(src, dest)) successCount++;
        else failCount++;
    }
    
    // Upload Plans subfolder files
    console.log('\n📁 Plans Subfolder:');
    for (const file of plansFiles) {
        if (await uploadFile(file.src, file.dest)) successCount++;
        else failCount++;
    }
    
    // Upload Image files
    console.log('\n🖼️  Image Files:');
    for (const file of imageFiles) {
        if (await uploadFile(file.src, file.dest)) successCount++;
        else failCount++;
    }
    
    console.log('\n✨ Upload complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully uploaded: ${successCount} files`);
    console.log(`   ❌ Failed: ${failCount} files`);
    
    console.log('\n📍 Key URLs:');
    console.log('   https://cdn.vidi.news/VIDIMAIL_VIDIBLAST_SHOWCASE.html');
    console.log('   https://cdn.vidi.news/VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.md');
    console.log('   https://cdn.vidi.news/plans/SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html');
}

main();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 Configuration
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

// HTML files to upload
const files = [
    { src: 'm:/code/vidismart/VIDIMAIL_VIDIBLAST_SHOWCASE.html', dest: 'VIDIMAIL_VIDIBLAST_SHOWCASE.html' },
    { src: 'm:/code/vidismart/VIDIMAIL_AGENTIC_ARCHITECTURE.md', dest: 'VIDIMAIL_AGENTIC_ARCHITECTURE.md' },
    { src: 'm:/code/vidismart/VIDIMAIL_BUILD_PLAN.md', dest: 'VIDIMAIL_BUILD_PLAN.md' },
    { src: 'm:/code/vidismart/VIDIMAIL_IMPLEMENTATION_ROADMAP.md', dest: 'VIDIMAIL_IMPLEMENTATION_ROADMAP.md' },
];

// Also upload images
const imageFiles = [
    { src: 'm:/code/vidismart/images/sendspark/01-hero-section.jpg', dest: 'images/sendspark/01-hero-section.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/02-ai-demo-modal.jpg', dest: 'images/sendspark/02-ai-demo-modal.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/03-record-once-personalize.jpg', dest: 'images/sendspark/03-record-once-personalize.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/04-dynamic-backgrounds.jpg', dest: 'images/sendspark/04-dynamic-backgrounds.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/05-personalized-video-pages.jpg', dest: 'images/sendspark/05-personalized-video-pages.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/06-edit-landing-page.jpg', dest: 'images/sendspark/06-edit-landing-page.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/07-add-contacts-generate.jpg', dest: 'images/sendspark/07-add-contacts-generate.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/08-cta-section.jpg', dest: 'images/sendspark/08-cta-section.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/09-main-hero.jpg', dest: 'images/sendspark/09-main-hero.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/10-video-demo.jpg', dest: 'images/sendspark/10-video-demo.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/11-social-proof.jpg', dest: 'images/sendspark/11-social-proof.jpg' },
    { src: 'm:/code/vidismart/images/sendspark/12-personalized-example.jpg', dest: 'images/sendspark/12-personalized-example.jpg' },
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

async function uploadFile(file) {
    if (!fs.existsSync(file.src)) {
        console.error(`❌ Missing file: ${file.src}`);
        return;
    }

    const fileStream = fs.createReadStream(file.src);
    const stats = fs.statSync(file.src);
    
    let contentType = 'text/html';
    if (file.dest.endsWith('.md')) contentType = 'text/markdown';
    if (file.dest.endsWith('.jpg') || file.dest.endsWith('.jpeg')) contentType = 'image/jpeg';
    if (file.dest.endsWith('.png')) contentType = 'image/png';

    console.log(`📤 Uploading ${file.dest}...`);

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.dest,
        Body: fileStream,
        ContentType: contentType,
        ContentLength: stats.size,
    }));

    console.log(`✅ Uploaded: https://cdn.vidi.news/${file.dest}`);
}

async function main() {
    console.log('🚀 Uploading VidiMail HTML files and assets...\n');
    
    // Upload HTML files
    console.log('📄 HTML & Markdown Files:');
    for (const file of files) {
        try {
            await uploadFile(file);
        } catch (e) {
            console.error(`❌ Failed to upload ${file.dest}:`, e.message);
        }
    }
    
    console.log('\n🖼️  Image Files:');
    // Upload images
    for (const file of imageFiles) {
        try {
            await uploadFile(file);
        } catch (e) {
            console.error(`❌ Failed to upload ${file.dest}:`, e.message);
        }
    }
    
    console.log('\n✨ Upload complete!');
    console.log('\n📍 Access your files at:');
    console.log('   https://cdn.vidi.news/VIDIMAIL_VIDIBLAST_SHOWCASE.html');
}

main();

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Credentials for VidiSmart Bucket
const R2_ACCOUNT_ID = '5830508745fd2ac063426ebf9429c22d';
const R2_ACCESS_KEY_ID = 'e9c7b7eb9ea570cc59e413cfdf580deb';
const R2_SECRET_ACCESS_KEY = 'aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b';
const BUCKET_NAME = 'vidismart';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const PAGES = [
    { src: 'index.html', type: 'text/html' },
    { src: 'smartchannelcx.tech.html', type: 'text/html' },
    { src: 'smartchannelcx.html', type: 'text/html' },
    { src: 'FRAMEIO_UI_REFERENCE.html', type: 'text/html' },
    { src: 'SENDSPARK_UI_REFERENCE.html', type: 'text/html' },
    { src: 'solar.html', type: 'text/html' },
    { src: 'SMART_CHANNEL_CX.html', type: 'text/html' },
    { src: 'moderntechguidelines.html', type: 'text/html' },
    { src: 'vidismart.masterlist.html', type: 'text/html' },
    { src: 'VidiSmart.VVTruth.html', type: 'text/html' },
    { src: 'VIDIMAIL_VIDIBLAST_SHOWCASE.html', type: 'text/html' }
];

const ASSETS = [
    { src: 'vidismart_cloud_editor_ui_mockup.png', type: 'image/png' },
    { src: 'vidismart-moe-stack.png', type: 'image/png' },
    { src: 'vidismart-tensors.jpg', type: 'image/jpeg' },
    { src: 'VidiSmart__AI_Video_Creation.mp4', dest: 'vidismart.mp4', type: 'video/mp4' },
    { src: 'frameio_dashboard_main.png', type: 'image/png' },
    { src: 'frameio_player_ui.png', type: 'image/png' },
    { src: 'frameio_asset_grid.png', type: 'image/png' },
    { src: 'smartchannel_swimsuit_model.png', type: 'image/png' },
    { src: 'smartchannel_global_connect.png', type: 'image/png' },
    { src: 'viditwin-glass.png', type: 'image/png' },
    { src: 'vidishop_ui_mockup.png', type: 'image/png' },
    { src: 'remotion_ai_editor_ui_mockup.png', type: 'image/png' },
    { src: 'satellite_app_ui.png', type: 'image/png' },
    { src: 'wp_admin_ui.png', type: 'image/png' },
    { src: 'candid_studios_homepage.png', type: 'image/png' },
    { src: 'digital_twin_poster.png', type: 'image/png' },
    { src: 'vidismart-global-connect.png', type: 'image/png' },
    { src: 'vidishop_lingerie_model.png', type: 'image/png' },
    { src: 'VC.diagram.png', type: 'image/png' },
    { src: 'vidiblast_voice_avatar_ui.png', type: 'image/png' },
    { src: 'vidiblast_audience_matrix_ui.png', type: 'image/png' },
    { src: 'viditwin_vs_vidiblast_comparison.png', type: 'image/png' }
];

const SENDSPARK_IMAGES = [
    '01-hero-section.jpg', '02-ai-demo-modal.jpg', '03-record-once-personalize.jpg',
    '04-dynamic-backgrounds.jpg', '05-personalized-video-pages.jpg', '06-edit-landing-page.jpg',
    '07-add-contacts-generate.jpg', '08-cta-section.jpg', '09-main-hero.jpg',
    '10-video-demo.jpg', '11-social-proof.jpg', '12-personalized-example.jpg'
].map(img => ({
    src: `images/sendspark/${img}`,
    dest: `images/sendspark/${img}`,
    type: 'image/jpeg'
}));

async function uploadFile(file) {
    const src = file.src;
    const dest = file.dest || file.src;
    const localPath = path.join(__dirname, src);

    if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ Warning: File not found: ${localPath}`);
        return;
    }

    try {
        const fileStream = fs.createReadStream(localPath);
        const stats = fs.statSync(localPath);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: dest,
            Body: fileStream,
            ContentType: file.type,
            ContentLength: stats.size,
        });

        await s3Client.send(command);
        const domain = file.type.startsWith('video') || file.type.startsWith('image') ? 'cdn.vidi.news' : 'vidismart.com';
        console.log(`✅ Pushed: https://${domain}/${dest}`);
    } catch (err) {
        console.error(`❌ Failed ${dest}:`, err.message);
    }
}

async function main() {
    console.log('🚀 Starting Full VidiSmart Force Push...');

    console.log('\n--- Pushing Pages ---');
    for (const page of PAGES) await uploadFile(page);

    console.log('\n--- Pushing Assets ---');
    for (const asset of ASSETS) await uploadFile(asset);

    console.log('\n--- Pushing Sendspark Assets ---');
    for (const img of SENDSPARK_IMAGES) await uploadFile(img);

    console.log('\n✨ Deployment Complete! All systems optimized.');
}

main();

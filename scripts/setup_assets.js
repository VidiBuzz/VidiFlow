const fs = require('fs');
const https = require('https');
const path = require('path');

const logos = [
    { name: 'pimcore.png', url: 'https://logo.clearbit.com/pimcore.com' },
    { name: 'figma.png', url: 'https://logo.clearbit.com/figma.com' },
    { name: 'penpot.png', url: 'https://logo.clearbit.com/penpot.app' },
    { name: 'plasmic.png', url: 'https://logo.clearbit.com/plasmic.app' },
    { name: 'affinity.png', url: 'https://logo.clearbit.com/affinity.serif.com' },
    { name: 'swirl.png', url: 'https://logo.clearbit.com/swirl.today' },
    { name: 'cloudflare.png', url: 'https://logo.clearbit.com/cloudflare.com' },
    { name: 'keycloak.png', url: 'https://logo.clearbit.com/keycloak.org' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

const assetsDir = path.join(__dirname, '..', 'assets', 'logos');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('🚀 Starting asset localization...');

Promise.all(logos.map(async (logo) => {
    const filePath = path.join(assetsDir, logo.name);
    try {
        await downloadImage(logo.url, filePath);
        console.log(`✅ Downloaded: ${logo.name}`);
    } catch (e) {
        console.error(`❌ Failed to download ${logo.name}: ${e.message}`);
    }
})).then(() => {
    console.log('🎉 Asset localization complete!');
});

const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

// SiteGround SFTP credentials — vidismart.com server
const SFTP_CONFIG = {
    host: 'gtxm1044.siteground.biz',
    port: 18765,
    username: 'u2627-m33aqlpqghg3',
    // Windows path to SSH key
    privateKey: fs.readFileSync(path.join(process.env.USERPROFILE || 'C:/Users/James', '.ssh', 'vidismart-deploy')),
};

// Source files on your machine (Windows paths)
const SOURCE_DIR = path.join(__dirname, 'smart-book');

// Remote destination on SiteGround (public_html/smart-book/)
const REMOTE_DIR = '/home/customer/www/vidismart.com/public_html/smart-book';

const files = [
    'index.html',
    'app.js',
    'data.js',
    'styles.css',
    'print-book.html',
];

async function main() {
    const sftp = new Client();
    console.log('🔌 Connecting to SiteGround via SFTP...');

    try {
        await sftp.connect(SFTP_CONFIG);
        console.log('✅ Connected!\n');

        // Create remote directory if needed
        console.log(`📁 Ensuring ${REMOTE_DIR} exists...`);
        await sftp.mkdir(REMOTE_DIR, true);

        // Upload each file
        for (const file of files) {
            const localPath = path.join(SOURCE_DIR, file);
            const remotePath = `${REMOTE_DIR}/${file}`;

            if (!fs.existsSync(localPath)) {
                console.error(`❌ Local file not found: ${localPath}`);
                continue;
            }

            const size = (fs.statSync(localPath).size / 1024).toFixed(1);
            console.log(`📤 Uploading ${file} (${size} KB)...`);
            await sftp.put(localPath, remotePath);
            console.log(`   ✅ https://vidismart.com/smart-book/${file}`);
        }

        console.log('\n🎉 Smart Book is LIVE at:');
        console.log('   👉 https://vidismart.com/smart-book/index.html');
        console.log('   👉 https://vidismart.com/smart-book/print-book.html');

    } catch (err) {
        console.error('\n❌ SFTP Error:', err.message);

        // If SSH key fails, show password fallback instructions
        if (err.message.includes('authentication') || err.message.includes('key')) {
            console.log('\n💡 SSH key not found. Try running:');
            console.log('   ssh-keygen -t ed25519 -C "vidismart-deploy"');
            console.log('   Then add the public key to SiteGround SSH Manager.');
        }
    } finally {
        await sftp.end();
    }
}

main();

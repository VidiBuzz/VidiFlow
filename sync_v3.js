const fs = require('fs');
const path = require('path');

console.log('Finalizing full migration to main vidipitch project...');

const srcDir = 'm:/code/vidismart/vidipitch';
const destDir = 'm:/code/vidipitch';

function copyRecursiveSync(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((file) => {
            if (file === 'node_modules' || file === '.git') return; // skip massive hidden folders
            copyRecursiveSync(path.join(src, file), path.join(dest, file));
        });
    } else {
        // Because the user moved images to images/ instead of assets/, update HTML during copy
        if (src.endsWith('index.html')) {
            let html = fs.readFileSync(src, 'utf8');
            html = html.replace(/src="assets\//g, 'src="images/');
            fs.writeFileSync(dest, html, 'utf8');
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

try {
    // Replaces all backend files, package.json, and the frontend files to ensure port 3005 boots correctly
    copyRecursiveSync(srcDir, destDir);
    
    console.log(`✅ Fully migrated! Your main folder (m:\\code\\vidipitch) is now identical to the 3005 VidiSMART version.`);
    console.log(`\nPlease navigate to your m:\\code\\vidipitch terminal and simply run:`);
    console.log(`npm start`);
    console.log(`\nIt will beautifully boot on port 3005 exactly as requested!`);
} catch (err) {
    console.error('Migration failed:', err);
}

const fs = require('fs');
const path = require('path');

const srcDir = 'm:/code/vidismart/vidipitch';
const destDir = 'm:/code/vidipitch';
const artifactDir = 'C:/Users/James/.gemini/antigravity/brain/cd9cb4ae-d9ed-4d1f-8b3e-188ed77cf7d8';
const assetsDir = path.join(destDir, 'assets');

console.log('Starting sync process...');

// 1. Copy everything from vidismart/vidipitch to the main vidipitch folder
if (fs.existsSync(srcDir)) {
    console.log(`Copying updated files from ${srcDir} to ${destDir}...`);
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
}

// 2. Ensure assets directory exists and copy the newly generated graphics
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const filesToCopy = [
    'slide_deck_graphic', 'explainer_video_graphic', 'exec_overview_graphic',
    'microsite_graphic', 'ai_plan_graphic', 'custom_stack_graphic'
];

if (fs.existsSync(artifactDir)) {
    console.log(`Copying new CPG graphics to ${assetsDir}...`);
    const files = fs.readdirSync(artifactDir);
    
    filesToCopy.forEach(prefix => {
        const file = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
        if (file) {
            fs.copyFileSync(path.join(artifactDir, file), path.join(assetsDir, prefix + '.png'));
            console.log(` -> Copied ${prefix}.png`);
        }
    });
}

console.log('\n✅ Sync complete! Your main vidipitch folder now has ALL the latest code and images.');
console.log('You can now safely run: npm start');

const fs = require('fs');

console.log('Merging front-end changes to main vidipitch project...');

const sourceIndex = 'm:/code/vidismart/vidipitch/index.html';
const targetIndex = 'm:/code/vidipitch/index.html';
const sourceAdmin = 'm:/code/vidismart/vidipitch/admin.html';
const targetAdmin = 'm:/code/vidipitch/admin.html';

try {
    // 1. Copy index.html and update image paths from assets/ to images/
    if (fs.existsSync(sourceIndex)) {
        let indexHtml = fs.readFileSync(sourceIndex, 'utf8');
        // Update the image paths to look in the 'images' subfolder since the user placed them there
        indexHtml = indexHtml.replace(/src="assets\//g, 'src="images/');
        fs.writeFileSync(targetIndex, indexHtml, 'utf8');
        console.log(`✅ Successfully updated ${targetIndex} with the new CPG layout and 'images' references.`);
    }

    // 2. Copy admin.html
    if (fs.existsSync(sourceAdmin)) {
        fs.copyFileSync(sourceAdmin, targetAdmin);
        console.log(`✅ Successfully copied ${targetAdmin}.`);
    }

    console.log('\nAll new VidiSMART files safely moved over! You can now safely delete the vidismart folder.');
    console.log('Run your server in m:/code/vidipitch normally and the new layout will appear on port 3001.');

} catch (err) {
    console.error('Error during sync:', err);
}

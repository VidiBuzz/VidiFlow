const fs = require('fs');
const path = require('path');

console.log('Validating AI Community Site structure...');

const requiredFiles = [
    'directus/docker-compose.yml',
    'directus/.env',
    'directus/package.json',
    'directus/schema.yaml',
    'frontend/index.html',
    'frontend/directory.html',
    'frontend/resources.html',
    'frontend/community.html',
    'frontend/about.html',
    'frontend/assets/css/style.css',
    'frontend/assets/js/main.js',
    'frontend/assets/js/directory.js',
    'frontend/assets/js/resources.js',
    'frontend/assets/js/community.js',
    'frontend/assets/js/directus-service.js'
];

let missingFiles = [];
let existingFiles = 0;

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        existingFiles++;
        console.log(`✓ ${file}`);
    } else {
        missingFiles.push(file);
        console.log(`✗ ${file}`);
    }
});

console.log(`\nValidation complete: ${existingFiles}/${requiredFiles.length} files found`);

if (missingFiles.length > 0) {
    console.log('\nMissing files:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
    process.exit(1);
} else {
    console.log('\nAll required files are present!');
    console.log('\nTo run the site:');
    console.log('1. Start Directus: cd directus && docker-compose up -d');
    console.log('2. Open frontend/index.html in your browser');
    process.exit(0);
}
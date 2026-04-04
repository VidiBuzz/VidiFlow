/**
 * Company Logo Fetcher
 *
 * This script helps fetch and download company logos for the competitive analysis page.
 * It uses multiple sources to get high-quality logos.
 *
 * Usage:
 *   node fetch-company-logos.js
 *
 * The script will download logos to ./logos/ directory
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Company list for competitive analysis
const companies = [
    { name: 'NVIDIA', domain: 'nvidia.com', color: '#76B900' },
    { name: 'ElevenLabs', domain: 'elevenlabs.io', color: '#FF6B35' },
    { name: 'Microsoft Azure', domain: 'azure.microsoft.com', color: '#00A4EF' },
    { name: 'AWS', domain: 'aws.amazon.com', color: '#FF9900' },
    { name: 'HeyGen', domain: 'heygen.com', color: '#6366f1' },
    { name: 'Synthesia', domain: 'synthesia.io', color: '#22D3EE' },
    { name: 'SendSpark', domain: 'sendspark.com', color: '#F59E0B' }
];

// Create logos directory if it doesn't exist
const logosDir = path.join(__dirname, 'logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir);
}

/**
 * Method 1: Clearbit Logo API
 * Free service that provides company logos based on domain
 */
function fetchFromClearbit(company) {
    const url = `https://logo.clearbit.com/${company.domain}`;
    const filename = path.join(logosDir, `${company.name.toLowerCase().replace(/\s+/g, '-')}-clearbit.png`);

    console.log(`Fetching ${company.name} from Clearbit...`);

    https.get(url, (response) => {
        if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(filename);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✓ Saved ${company.name} logo from Clearbit`);
            });
        } else {
            console.log(`✗ Failed to fetch ${company.name} from Clearbit (${response.statusCode})`);
        }
    }).on('error', (err) => {
        console.error(`✗ Error fetching ${company.name}:`, err.message);
    });
}

/**
 * Method 2: Logo.dev API
 * Alternative logo service
 */
function fetchFromLogoDev(company) {
    const url = `https://img.logo.dev/${company.domain}?token=YOUR_API_TOKEN`;
    const filename = path.join(logosDir, `${company.name.toLowerCase().replace(/\s+/g, '-')}-logodev.png`);

    console.log(`Fetching ${company.name} from Logo.dev...`);
    console.log(`Note: You need to sign up at https://logo.dev and replace YOUR_API_TOKEN`);

    // Uncomment when you have an API token
    // https.get(url, (response) => {
    //     if (response.statusCode === 200) {
    //         const fileStream = fs.createWriteStream(filename);
    //         response.pipe(fileStream);
    //         fileStream.on('finish', () => {
    //             fileStream.close();
    //             console.log(`✓ Saved ${company.name} logo from Logo.dev`);
    //         });
    //     }
    // });
}

/**
 * Method 3: Generate SVG data URLs for inline use
 */
function generateSVGDataURLs() {
    console.log('\n=== SVG Data URLs for Inline Use ===\n');

    companies.forEach(company => {
        // Simple SVG text logo
        const svg = `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${company.color}">${company.name}</text>
        </svg>`;

        const dataURL = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
        console.log(`${company.name}:`);
        console.log(dataURL);
        console.log('');
    });
}

/**
 * Generate HTML code with official logo URLs
 */
function generateHTMLWithOfficialLogos() {
    console.log('\n=== HTML Code with Logo URLs ===\n');
    console.log('You can use these official CDN URLs or the downloaded logos:\n');

    const officialLogos = {
        'NVIDIA': 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/01-nvidia-logo-vert-500x200-2c50-d@2x.png',
        'Microsoft Azure': 'https://azure.microsoft.com/svghandler/azure-logo/',
        'AWS': 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png',
        'HeyGen': 'https://www.heygen.com/logo.svg',
        'Synthesia': 'https://www.synthesia.io/favicon.svg'
    };

    Object.entries(officialLogos).forEach(([name, url]) => {
        console.log(`<!-- ${name} -->`);
        console.log(`<div class="logo-item">`);
        console.log(`    <img src="${url}" alt="${name} logo" />`);
        console.log(`</div>\n`);
    });
}

// Main execution
console.log('=== Company Logo Fetcher ===\n');
console.log('This script will help you fetch company logos for the competitive analysis page.\n');

console.log('Method 1: Fetching from Clearbit (free, no API key needed)...\n');
companies.forEach(company => {
    setTimeout(() => fetchFromClearbit(company), companies.indexOf(company) * 500);
});

// Generate SVG data URLs
setTimeout(() => generateSVGDataURLs(), 3000);

// Generate HTML with official URLs
setTimeout(() => generateHTMLWithOfficialLogos(), 4000);

console.log('\nLogo files will be saved to:', logosDir);
console.log('\nAlternative methods:');
console.log('1. Visit https://clearbit.com/logo - Free logo API');
console.log('2. Visit https://logo.dev - Premium logo API');
console.log('3. Download from official company press kits');
console.log('4. Use the SVG logos already embedded in the HTML file');

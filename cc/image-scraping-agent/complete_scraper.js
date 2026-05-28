const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

/**
 * CC Image Scraper - FIXED
 * Scrapes property images from MLS listings and saves them to the project directory.
 */

// Configuration
const CONFIG = {
    baseUrl: path.resolve(__dirname, '../assets/images/projects/fortuna-mill'),
    scrapingUrl: 'https://www.seaglassproperties.com/propertydetail.cfm?PropID=420',
    manifestPath: path.resolve(__dirname, '../assets/images/projects/fortuna-mill/manifest.json')
};

async function init() {
    console.log('🚀 Initializing Scraper...');
    
    // Create directory structure
    await fs.mkdir(CONFIG.baseUrl, { recursive: true });
    console.log(`📂 Target directory: ${CONFIG.baseUrl}`);
    
    // Initialize manifest
    let manifest = {
        project_name: "Fortuna Mill Estate",
        scraped_date: new Date().toISOString(),
        images: []
    };
    
    try {
        const existing = await fs.readFile(CONFIG.manifestPath, 'utf-8');
        manifest = JSON.parse(existing);
        console.log(`📝 Loaded existing manifest with ${manifest.images.length} images.`);
    } catch (e) {
        console.log('📝 Creating new manifest.');
    }
    
    return manifest;
}

async function downloadImage(url, filename) {
    const dest = path.join(CONFIG.baseUrl, filename);
    
    return new Promise((resolve, reject) => {
        const file = require('fs').createWriteStream(dest);
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest);
            reject(err);
        });
    });
}

async function scrape() {
    const manifest = await init();
    
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log(`🔗 Navigating to ${CONFIG.scrapingUrl}...`);
        await page.goto(CONFIG.scrapingUrl, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Wait for gallery to load
        await page.waitForTimeout(5000);
        
        console.log('📸 Extracting image URLs...');
        const imageUrls = await page.evaluate(() => {
            const urls = new Set();
            
            // Search for high-res images in common gallery patterns
            const selectors = [
                'img[src*="sparkplatform.com"]',
                'img[src*="cdn.photos"]',
                'a[href*="sparkplatform.com"]',
                '.gallery-item img',
                '.property-photos img'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    const url = el.src || el.href;
                    if (url && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))) {
                        // Try to get original resolution if it's a thumbnail
                        const originalUrl = url.replace(/-thumbnail|-thumb|-medium|-small/i, '-original');
                        urls.add(originalUrl);
                    }
                });
            });
            
            return Array.from(urls);
        });
        
        console.log(`✅ Found ${imageUrls.length} potential images.`);
        
        let count = 0;
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const ext = path.extname(url.split('?')[0]) || '.jpg';
            const filename = `fortuna-mill-${i + 1}${ext}`;
            
            try {
                console.log(`[${i+1}/${imageUrls.length}] Downloading ${filename}...`);
                await downloadImage(url, filename);
                
                if (!manifest.images.find(img => img.filename === filename)) {
                    manifest.images.push({
                        filename: filename,
                        url: url,
                        date: new Date().toISOString()
                    });
                }
                count++;
                
                // Save manifest every 5 images
                if (count % 5 === 0) {
                    await fs.writeFile(CONFIG.manifestPath, JSON.stringify(manifest, null, 2));
                }
            } catch (err) {
                console.error(`❌ Failed to download ${url}: ${err.message}`);
            }
        }
        
        // Final manifest save
        await fs.writeFile(CONFIG.manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`\n🎉 SCRAPING COMPLETE!`);
        console.log(`✅ Successfully downloaded ${count} images.`);
        
    } catch (err) {
        console.error('❌ Fatal error during scraping:', err);
    } finally {
        await browser.close();
    }
}

scrape();

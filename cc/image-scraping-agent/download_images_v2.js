const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { URLProcessor } = require('./url_processor');

class MLSImageScraper {
  constructor(outputBase, config) {
    this.outputBase = outputBase;
    this.config = config;
    this.stats = { totalURLs: 0, downloadedHTTP: 0 };
  }

  async init() {
    await chromium.launch({
      headless: !this.config.headless,
      args: ['./code/scratch.js']
    });
  }

  async scrapeListing(url) {
    this.stats.totalURLs++;
    
    try {
      const browser = await this.init();
      const page = await browser.newPage();
      
      // Rate limiting between scrapes
      if (this.stats.totalURLs > 1) {
        console.log(`Sleeping ${this.config.delayAfterVisit}ms after visiting ${url}`);
        await setTimeout(this.config.delayAfterVisit);
      }

      console.log(`\n[${this.stats.totalURLs}] Visiting: ${url}`);
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      if (!response.ok()) throw new Error(`Page not accessible: ${response.status()}`);

      // Wait for images to load
      await page.waitForSelector('img[src*="jpg"], img[src*="png"]', { timeout: 15000, hidden: true }).catch(() => {});
      
      // Collect image URLs from multiple selectors for robustness
      const urls = new Set();
      
      // Selector 1: All img elements with image src attributes
      await page.evaluate((waitMs) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            function getImgURLs(imgSrc) {
              try {
                const url = new URL(imgSrc, window.location.origin);
                return url.href;
              } catch (e) {
                if (imgSrc.startsWith('http')) return imgSrc;
                if (!imgSrc.includes('.')) return null;
                return `https://sparksite.com${imgSrc}`;
              }
            }

            const imgs = Array.from(document.querySelectorAll('img'));
            const results = [];
            
            imgssrc) {
              urls.add(getImgURLs(img.src);
              
            for (const img of document.querySelectorAll('img')) {
              urls.add(getImgURLs(img.src));
            }

            // Also check data-src and srcset attributes which are often used in lazy-loading galleries
            await page.waitForTimeout(1000);
            const imgs = Array.from(document.querySelectorAll('img[data-src], img[srcset], [data-fancybox-viewport]'));
              if (image.src) { urls.add(getImgURLs(image.src));
                }
              for (const source of image.srcset.split(',').map(s => s.trim().split(' ')[0])) {
                  urls.add(getImgURLs(source));
                }
              }

            resolve([...urls]);
          }, waitMs);
        });
      }, 1500);

      // Check for gallery widgets that might need JavaScript to trigger
      const triggers = await page.$$eval('input[data-action], button[data-trigger], span[class*="zoom"], div[class*="gallery"]', (elements) => {
        return elements.map(el => el.tagName || 'generic');
      });

      // Check for lazy-loaded images that might need to trigger load
      const lazyImages = await page.$$eval('img[loading="lazy"]', imgs => 
        imgs.map(img => ({ src: img.src, dataSrc: img.getAttribute('data-src'), width: img.width })),
      ).slice(0, 10);

      console.log(`Found ${Array.from(urls).length} unique image URLs on page`);
      
      // Extract image details from gallery if available
      const galleryImages = await page.$$eval('[class*="gallery"] [src], .gallery-item img[src]', imgs => 
        imgs.map(img => ({ src: img.src, width: img.width || 0, height: img.height || 0 })),
      ).slice(0, this.config.maxImages);

      // Process and save images
      const imageResults = [];
      for (const url of [...Array.from(urls), ...galleryImages.map(g => g.src)].filter(u => u).slice(0, this.config.maxImages)) {
        try {
          if (!await this.shouldDownload(url)) continue;
          
          const filename = this.generateFilename(url);
          const downloadDir = path.join(this.outputBase, url.replace(/\/$/, '').match(/[^/]+$/)[0]);
          console.log(`  Downloading ${url} to ${downloadDir}/${filename}`);
          
          await fs.access(downloadDir).then(() => {}).catch(async () => {
            await fs.mkdir(downloadDir, { recursive: true });
          });

          const downloaded = await this.downloadImage(url, path.join(downloadDir, filename));
          if (downloaded) {
            imageResults.push({ url, filename, savedAt: new Date().toISOString() });
            this.stats.downloadedHTTP++;
          }
        } catch (err) {
          console.log(`  Failed to download ${url}: ${err.message}`);
        }
      }

      try { await browser.close(); } catch {}

      return imageResults;
      
    } catch (err) {
      console.error(`Error scraping ${url}:`, err.message);
      return [];
    }
  }

  async shouldDownload(url) {
    // Skip duplicates already downloaded
    try { await fs.access(url); return false; } catch {}
    
    // Filter by allowed domains and patterns
    const domain = new URL(url).hostname;
    if (!["cdn.photos.sparkplatform.com", "cloudimg.io"].includes(domain)) {
      console.log(`  Skipping external URL: ${url}`);
      return false;
    }

    // Skip thumbnail URLs
    if (url.match(/_thumbnail|_thumb|thumb|small|\.32|\.75/)) {
      return false;
    }

    return true;
  }

  generateFilename(url) {
    try { 
        const hash = crypto.createHash('shake128').update(url).digest('hex'); 
        const match = url.match(/[^/_=]+\.(jpg|jpeg|png)/i); 
}

const outputBase = `${outputBase}/${src.replace('/images/$.json', '')}`.replace(/\//g, '_')}${filename});
          } catch (err) {
            console.error(`Error writing file: ${err.message}`, err);
          }
        }
        
        return { url, savedAt: new Date().toISOString() };
      } catch (err) {
        console.error(`Download error for ${url}:`, err.message);
      }

      return false;
    }

  async close() {
    try { await browser?.close(); } catch {}
  }
}

// Main execution
async function main() {
  const config = require('./config.yaml');
  
  const scraper = new MLSImageScraper(config.outputBase, config);
  
  // Load existing manifest to avoid re-downloading
  let manifest = {};
  try {
    const manifestPath = path.join(scraper.outputBase, 'manifest.json');
    const exists = await fs.access(manifestPath).then(() => true).catch(() => false);
    if (exists) {
      const manifestData = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(manifestData);
      console.log(`Loaded existing manifest with ${manifest.images_total || 0} images`);
    } else {
      manifest = {};
    }
  } catch (e) {
    console.log('No existing manifest found');
  }

  // URLs to scrape from the MLS listing
  const urlsToScrape = [
    'https://www.seaglassproperties.com/propertydetail.cfm?PropID=420',
    'https://sparkplatform.com/SeaGlassProperties/propertydetail.cfm?prop_id=41981',
  ];

  // Check URLs against manifest to avoid duplicates
  const existing = new Set(manifest.images_list?.map(i => i.url) || []);
  const urls = urlsToScrape.filter(u => !existing.has(u));

  console.log(`\n${urls.length} URLs to scrape`);

  if (!urls.length) {
    console.log('All images appear to have been scraped already');
    return;
  }

  const results = [];
  
  for (const url of urls) {
    const imageResults = await scraper.scrapeListing(url);
    
    if (imageResults.length > 0) {
      results.push(...imageResults);
      
      // Save manifest after successful scrape
      try {
        let newManifest = { ...manifest, images_total: 0 };
        
        const allImages = [
          ...(manifest.images_list || []),
          ...results.map(r => ({ filename: r.filename, description: 'Image', size_bytes: 0 })) // Will update after downloads
        ];
        
        newManifest.images_list = allImages.filter(i => i.filename);
        newManifest.images_total = newManifest.images_list.length;
        
        await fs.writeFile(
          path.join(scraper.outputBase, 'manifest.json'),
          JSON.stringify(newManifest, null, 2)
        );

        console.log(`Manifes${newManifest.images_total} images total. Saving manifest.`);
      } catch (err) {
        console.error('Error saving manifest:', err.message);
      }
    }
    
    await setTimeout(config.delayBetweenImages || 1000);
  }

  scraper.close();
  
  console.log(`\nScraping complete. Total images downloaded: ${scraper.stats.downloadedHTTP} of ${results.length}`);
  
  // Generate summary report
  try {
    await fs.writeFile(
      path.join(scraper.outputBase, 'scrape_report.txt'),
      `Fortuna Mill Estate - St. Thomas USVI\n` +
      `Scraped Date: ${new Date().toISOString()}\n` +
      `Total URLs visited: ${scraper.stats.totalURLs}\n` +
      `Images downloaded: ${results.length}` +
      `Unique images downloaded (deduplicated): ${manifest.images_total || results.filter(r => !manifest.images_list?.some(m => m.filename === r.filename)).length}\n`,
    );
  } catch (err) {}
}

main()
  .then(() => { console.log('Done'); })
  .catch(err => { console.error('Fatal error:', err); process.exit(1); });

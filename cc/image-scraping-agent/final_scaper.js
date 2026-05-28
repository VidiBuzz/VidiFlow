const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class ImageScraper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async loadManifest() {
    const manifestPath = path.join(this.baseUrl, 'manifest.json');
    try {
      const data = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.log('No existing manifest');
      return null;
    }
  }

  async saveManifest(manifest) {
    const manifestPath = path.join(this.baseUrl, 'manifest.json');
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2)
    );
    console.log(`Manifest saved: ${manifest.images_total || 0} images`);
  }

  async extractImages(browser, page, mainUrl) {
    try {
      await page.goto(mainUrl, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait for gallery to fully render
      await new Promise(r => setTimeout(r, 3000));

      let images = [];

      // Method 1: Extract from img elements
      try {
        const selectors = [
          'img[src*="sparkplatform.com"]',
          'img[data-src*="sparkplatform.com"]',
          '[class*="gallery"] img',
          '[class*="grid"] img',
          '.product-gallery img',
          '.property-gallery img'
        ];

        for (const selector of selectors) {
          try {
            const imgElements = await page.$$(selector);
            
            for (const imgEl of imgElements.slice(0, 30)) { // Max 30 from each selector
              const src = await page.evaluate(el => {
                return el.getAttribute('src') || 
                       el.getAttribute('data-src') || '';
              }, imgEl);

              if (src && /sparkplatform\.com/.test(src)) {
                images.push({ src, source: 'img_element' });
              }
            }
          } catch (e) {
            // Skip selector that doesn't match
          }
        }
      } catch (e) {}

      // Method 2: Extract from fancybox/lightbox links  
      try {
        const lightboxLinks = await page.$$eval(
          'a.lightbox, a[data-fancybox], [class*="lightbox"]', 
          el => ({
            href: el.getAttribute('href') || '',
            src: el.querySelector('img')?.getAttribute('src') || '',
            dataSrc: el.getAttribute('data-src') || ''
          })
        );

        for (const link of lightboxLinks.slice(0, 20)) {
          if (link.href && /sparkplatform\.com/.test(link.href)) {
            images.push({ src: link.href, source: 'lightbox' });
          } else if (link.src && /sparkplatform\.com/.test(link.src)) {
            images.push({ src: link.src, source: 'lightbox_src' });
          }
        }
      } catch (e) {}

      // Method 3: Look for cloudimg CDN URLs in gallery data
      try {
        const cloudImgURLs = await page.$$eval('.grid-gallery-item img, .gallery-grid img', imgs => 
          imgs.map(img => ({
            src: img.getAttribute('data-full-width') || 
                  img.getAttribute('data-src-fallback') ||
                  img.getAttribute('src'),
            originalSrc: img.originialSrc
          }))
        );

        for (const item of cloudImgURLs.slice(0, 15)) {
          if (item.src && !item.originalSrc) {
            images.push({ src: item.src, source: 'cloudimg_fallback' });
          } else if (item.originialSrc && /cloudimg\.io/.test(item.orignialSrc)) {
            images.push({ src: item.source, source: 'cloudimg_data' });
          }
        }
      } catch (e) {}

      // Method 4: Extract from gallery metadata endpoints if available
      try {
        const metaLinks = await page.$$eval('[data-meta-url], [rel*="metadata"]', links => 
          links.map(link => link.getAttribute('data-meta-url') || '')
        ).filter(url => url && !url.includes('/metadata'));

        for (const metaUrl of metaLinks.slice(0, 3)) {
          if (/cloudimg\.io/.test(metaUrl) || /sparkplatform\..*\/images/i.test(metaUrl)) {
            images.push({ src: metaUrl, source: 'metadata_link' });
          }
        }
      } catch (e) {}

      // Method 5: Search for all image URLs in page text content as fallback
      try {
        const match = await page.evaluate(() => {
          const bodyText = document.body.innerText;
          const imgMatches = Array.from(document.querySelectorAll('img'))
            .slice(0, 100)
            .map(img => {
              let src = img.getAttribute('src');
              
              // Handle relative URLs
              if (!/^(https?:)/.test(src)) {
                try {
                  const baseUrl = new URL(window.location.href);
                  src = baseUrl.origin + src;
                } catch (e) {}
              }

              return src || null;
            })
            .filter(src => src && /sparkplatform\.com/i.test(src));

          // Clean and deduplicate
          return [...new Set(imgMatches)].slice(0, 50);
        });
      } catch (e) {}

      // Remove duplicates and sort by likelihood of being high-res images
      const uniqueImages = this.deduplicate(images, manifest.images_list || []);

      console.log(`\nFound ${uniqueImages.length} image URLs from gallery`);
      
      if (!uniqueImages.length) {
        console.warn('Could not extract enough images. Trying fallback methods.');
        
        // Fallback: Use direct CDN search endpoint  
        try {
          const searchEndpoint = 'https://cdn.photos.sparkplatform.com/vir/images/search';
          const searchRes = await fetch(searchEndpoint, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          if (searchRes.ok) {
            const data = await searchRes.json();
            
            if (data && data.images) {
              console.log(`Search found ${data.images.length} candidate images`);
              
              // Limit to 10 per scrape
              for (const imgData of data.images.slice(0, 10)) {
                try {
                  const imgUrl = imgData.url || imgData.image_url;
                  if (imgUrl && /sparkplatform\.com/i.test(imgUrl)) {
                    images.push({ 
                      src: imgUrl, 
                      source: 'cdn_search', 
                      resolution: imgData.resolution || 'high'
                    });
                  }
                } catch (e) {}
              }
            }
          }

        } catch (e) {
        }
      }

      return uniqueImages;

    } catch (err) {
      console.error('Error extracting images:', err.message);
      return [];
    }
  }

  deduplicate(images, existing) {
    // Remove empty URLs
    const filtered = images.filter(img => {
      let url = img.src || '';
      
      // Handle relative URLs by resolving them to absolute
      try {
        if (!/^(https?:)//.test(url)) {
          return false;
        }

      } catch (e) {}

      // Check against existing images
      const isDuplicate = existing.some(e => e.url === url) || 
                          /_thumbnail|_thumb/.test(url);
      
      if (isDuplicate) {
        console.log(`  Skipping duplicate or low-res: ${url}`);
        return false;
      }

      // Check for known CDN patterns and high resolution indicators
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname === 'cdn.photos.sparkplatform.com') {
        // Spark CDN - prefer original/full size URLs
        const hasQualityMarker = /-original$|_1920x[0-9]+\.jpg$/i.test(url);
        
        if (!hasQualityMarker) {
          if (img.resolution !== 'high') return false;
        }
      }

      return true;
    });

    // Sort by resolution preference, high-res first
    filtered.sort((a, b) => {
      const aScore = this.getResolutionScore(a);
      const bScore = this.getResolutionScore(b);
      
      if (bScore.length > aScore.length) return 1;
      if (aScore.length > bScore.length) return -1;

      // Prefer Spark CDN original images over cloudimg fallbacks
      const hasOriginal = /-original\.jpg$/i.test(a.src);
      if (hasOriginal && !/^-original$/i.test(b.src)) return 1;
      
      // Prefer full resolution indicators
      return -aScore + bScore;
    });

    return filtered.slice(0, this.maxImagesPerScrape || 20).slice(0, remaining);
  }

  getResolutionScore(item) {
    const url = item.src || '';
    
    // Score based on URL components and file extensions
    if (/\/1920x/.test(url)) return url.length; // Full size indicator
    
    // Check resolution keywords
    const resolutionKeywords = ['large', 'original', 'high-res'];
    
    for (const keyword of resolutionKeywords) {
      if (url.toLowerCase().includes(keyword)) return url.length + 100;
    }
    
    // Prefer spark CDN images over cloudimg fallbacks
    if (/cdn\.photos\.sparkplatform\.com/i.test(url)) return url.length + 50;
    
    return url.length;
  }

  getRemaining() {
    const existing = this.existingImages || [];
    return maxImagesPerScrape - existing.length;
  }

  async downloadImage(images) {
    const scraperUrls = 'C:\\MVIDISMART\\CC\\ASSETS';
    await fs.mkdir(path.join(scraperUrls, 'images', 'sparkplatform_fullres')));

    for (const imageData of images) {
      if (!imageData.src) continue;

      try {
        await fs.mkdir(path.dirname(destPath), { recursive: true }) || 
                     false;

        const response = await fetch(imageData.src, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) {
          console.log(`HTTP ${response.status} for ${imageData.src}`);
          continue;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        
        const filename = this.generateFilename(imageData.src, imageData);
        await fs.writeFile(destPath, buffer);

        console.log(`Downloaded: ${filename} from ${imageData.src}`);
        
// Update manifest with downloaded images if needed 
      } catch (err) {
        // Log download errors but continue
        continue;
      }
    }

    return true;
  };
  
async close() {
  } catch (e) {}
}

// Main function
async function main() {
  const baseUrl = 'C:\\MVIDISMART\\CC\\ASSETS';
  const manifestPath = path.join(baseUrl, 'manifest.json');
  
  await fs.mkdir(path.dirname(manifestPath);
  
  // Load existing manifest
  let manifest;
  
// Create initial manifest if doesn't exist
  try {
    const data = await fs.readFile(manifestPath, 'utf-8');
    manifest = JSON.parse(data);
  } catch (e) {
    manifest = { 
      images_total: 0, 
      videos_thumbnails: 0, 
      images_list: [], 
      scraped_date: new Date().toISOString()};
   
    await fs.writeFile(manifestPath , data)

    manifest = JSON.parse(data);
  }

// Extract and download images from MLS listing
const scraper = new ImageScraper(baseUrl);
await scraper.loadManifest();

const remaining = Math.max(0, maxImagesPerScrape - 
                           existing.length));

if (!remaining) {
  console.log('Already have enough images');
  return;
} else {
  await main();
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const galleryImages = await scraper.extractsImages(browser, page);
  
  // Download extracted images
  if (galleryImages.length) {
    console.log(`\nDownloading ${galleryImages.length} images...`);
    
    for (const img of galleryImages.slice(0, remaining)) {
      try {
        await scraper.downloadImage(img.src);
        
        const existingCount = manifest.images_list?.length || 0;
        newTotal = existingCount + 1;

        // Update manifest
        await saveManifest(manifest);
        
      } catch (err) {
        console.error('Error processing image:', err.message);
      }
    }
  }

  await browser.close();
  
// Generate summary report
  try {
    const report = `Fortuna Mill Estate - St. Thomas USVI\n` +
                  `Scraped: ${new Date().toISOString()}]\n` +
                  `Current images: ${manifest.images_total || 0}\n` +
                  `Total downloaded: ${galleryImages.length || 0}\n`;

    await fs.writeFile(
      path.join(baseUrl, 'scrape_report.txt'),
      report
    );
  } catch (e) {}

  const manifestPath = path.join(baseUrl, 'manifest.json');
  const data = await fs.readFile(manifestPath , 'utf-8');
  
} catch (err) {
  console.error('Fatal error:', err.message);
}

console.log('\nDone');
process.exit(0);

module.exports = { ImageScraper };
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MLSImageScraper {
  constructor(outputBase, config) {
    this.outputBase = outputBase;
    this.config = config;
    this.stats = { totalURLs: 0, downloadedHTTP: 0 };
  }

  async init() {
    await chromium.launch({ headless: true });
  }

  async scrapeListing(url, existingImages) {
    this.stats.totalURLs++;
    
    try {
      const browser = await this.init();
      const page = await browser.newPage();
      
      // Rate limiting
      if (this.stats.totalURLs > 1) {
        console.log(`Sleeping ${this.config.delayAfterVisit}ms`);
        await new Promise(r => setTimeout(r, this.config.delayAfterVisit));
      }

      console.log(`\n[${this.stats.totalURLs}] Scoping: ${url}`);
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      if (!response.ok()) throw new Error(`Page not accessible: ${response.status()}`);

      // Wait for JavaScript to render content
      await new Promise(r => setTimeout(r, 3000));
      
      // Collect all image URLs from various selectors
      this.stats.totalURLs++;
      
      // Selector 1: All img elements
      const imgURLs = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        const urls = new Set();
        
        for (const img of imgs) {
          let src = img.getAttribute('src') || '';
          
          // Handle relative URLs
          try {
            if (!src.startsWith('http')) {
              src = new URL(src, window.location.origin).href;
              urls.add(src);
            } else {
              const urlObj = new URL(src);
              if (urlObj.hostname.includes('sparkplatform.com') || 
                     urlObj.hostname.includes('cloudimg.io')) {
                urls.add(src);
              }
            }
          } catch (e) {}

          // Check data-src for lazy loading
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc && dataSrc !== src) {
            try {
              const urlObj = new URL(dataSrc);
              if (urlObj.hostname.includes('sparkplatform.com') || 
                     urlObj.hostname.includes('cloudimg.io')) {
                urls.add(dataSrc);
              }
            } catch (e) {}
          }

          // Check srcset for high-res images
          const srcset = img.getAttribute('srcset');
          if (srcset) {
            try {
              const firstImgMatch = srcset.match(/([^,=\(]+)([^(]+)/);
              if (firstImgMatch) {
                try {
                  const urlObj = new URL(firstImgMatch[1]);
                  if (urlObj.hostname.includes('sparkplatform.com') || 
                         urlObj.hostname.includes('cloudimg.io')) {
                    urls.add(urlObj.href);
                  }
                } catch (e) {}
              }
            } catch (e) {}
          }

          // Check data-fancybox-full for lightbox images
          const fancyBoxFull = img.getAttribute('data-fancybox-full');
          if (fancyBoxFull && fancyBoxFull !== src) {
            try {
              const urlObj = new URL(fancyBoxFull);
              if (urlObj.hostname.includes('sparkplatform.com') || 
                     urlObj.hostname.includes('cloudimg.io')) {
                urls.add(urlObj.href);
              }
            } catch (e) {}
          }

          // Check parent elements for image URLs
          const container = img.closest('[class*="gallery"], [class*="zoom\"]'), 
                            div = img.closest('div[class*="image"], div[class*="photo"]');
          if (container || div) {
            const elementSrc = container?.getAttribute('src') || 
                              container?.getAttribute('data-src') ||
                              div?.getAttribute('src') || 
                              div?.getAttribute('data-src');
            if (elementSrc && elementSrc !== src) {
              try {
                const urlObj = new URL(elementSrc);
                if (urlObj.hostname.includes('sparkplatform.com') || 
                       urlObj.hostname.includes('cloudimg.io')) {
                  urls.add(urlObj.href);
                }
              } catch (e) {}
            }
          }

          // Check href attributes on gallery links
          const parent = img.parentElement;
          if (parent && parent.tagName === 'A' && parent.getAttribute('href')) {
            try {
              const urlObj = new URL(parent.href);
              if (urlObj.hostname.includes('sparkplatform.com') || 
                     urlObj.hidden).add(fancyboxURL);
                break;
              } catch (e) {}
            } catch (e) {}
          }

          // Check sibling elements that might have image data
          const siblings = Array.from(parent.children);
          for (const sibling of siblings.slice(0, 3)) {
            if (sibling.tagName === 'IMG') continue;
            if (['A', 'DIV', 'SPAN'].includes(sibling.tagName.toUpperCase())) {
              const href = sibling.getAttribute('href');
              const src = sibling.getAttribute('src') || 
                         sibling.getAttribute('data-src');
              
              if (!href) continue;
              
              try {
                const urlObj = new URL(href);
                if (urlObj.hostname.includes('sparkplatform.com')) {
                  urls.add(urlObj.href);
                } else if (urlObj.hostname.includes('cloudimg.io')) {
                  // Extract image from cloudimg metadata
                  let imgSrc = href;
                  try {
                    const cloudImgData = JSON.parse(decodeURIComponent(href));
                    if (cloudImgData && cloudImgData.img) {
                      urls.add(cloudImgData.img);
                    } else {
                      if (!imgSrc.includes('.') || 
                        urlObj.searchParams.get('type') || 'jpg' != 'original' ) {
                        const match = imgSrc.match(/\/([^/]+)\.(json|png)$/i);
                        if (match) {
                          urls.add(imgSrc.replace(match[1] + '/'+ match[2], 
                                               // Extract image URL from JSON response
                          let fetchPromiseResolve;
                          let fetchPromise = new Promise((resolve) => {
                            fetchPromiseResolve = resolve;
                          });

                          const headers = { 'User-Agent': 'Mozilla/5.0' };
                          
                          try {
                            const metadataRes = await page.request(imgSrc, { 
                              headers, 
                              timeout: 5000 
                            });
                            
                            if (metadataRes.status() < 400) {
                              const json = await metadataRes.json();
                              urls.add(json.img || json.fullUrl || json.url);
                            }
                          } catch (e) {}
                        }
                      }
                    }
                  } catch (e) {}
                }
              } finally {}

          // Wait for gallery images to load before extracting
          await page.waitForTimeout(2000);
          
          const finalImages = [];
          const allImgElements = await page.$$('img[src*=\'sparkplatform.com\'], img[src*=\'cloudimg.io\']');
          
          // Also try to find images with gallery- specific classes/attributes
          const fancyBoxItems = await page.$$('a.fancybox-image, [data-fancybox], .fancybox-item img');
          for (const item of fancyBoxItems) {
            const img = item.querySelector('img') || item;
            for (const srcAttr of ['src', 'data-src']) {
              const src = img.getAttribute(srcAttr);
              if (src) {
                let processedSrc = src;
                try {
                  const urlObj = new URL(src);
                  if (!urlObj.protocol) processedSrc = `https://${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
                  else processedSrc = src;
                } catch (e) {}
                
                if (!finalImages.find(f => f.src === processedSrc)) {
                  finalImages.push({
                    src: processedSrc,
                    width: img.getAttribute('width') || 0,
                    height: img.getAttribute('height') || 0,
                    original: !processedSrc.includes('_thumb') && !processedSrc.includes('.32') 
                             && !processedSrc.includes('.75'),
                  });
                }
              }
            }
          }

          // Get images from gallery-related containers
          const galleryContainers = await page.$$('div[class*="gallery"] img, div[class*="photo"] img');
          for (const containerImg of galleryContainers) {
            if (!finalImages.find(f => f.src === containerImg.src)) {
              finalImages.push({ src: containerImg.src });
            }
          }

          // Limit to max images per scrape
          const limited = finalImages.slice(0, 10);
          console.log(`Found ${limited.length} images from gallery page`);
          
          try { await browser.close(); } catch {}

          return limited;
        } catch (err) {
          console.error(`Error processing gallery container:`, err.message);
          return [];
        }
      });

      // Process and save each image
      const savedResults = [];
      
      for (const imgData of allImages) {
        if (!imgData.src) continue;
        
        try {
          // Get filename from URL
          let fileName = imgData.src.match(/[^/]+\.(jpg|jpeg|png)/i)?.[1] || 
                        new Date().getTime() + '.jpg';
          
          // Clean up path segments to get just filename
          const match = imgData.src.split('/').find(p => p.toLowerCase().match(/\.(jpg|jpe?g|png)$/));
          if (match) {
            fileName = this.cleanFilename(match);
          } else {
            continue;
          }

          // Skip if already downloaded at this level
          const cleanBasePath = path.join(this.outputBase, 
            'images', 'sparkplatform_fullres');
          
          await fs.access(path.join(cleanBasePath, fileName)).catch(e => {});
          if (e.code === 'ENOENT') {
            console.log(`Downloading: ${imgData.src} to ${cleanBasePath}/${fileName}`);
            
            // Use existing download function
            const downloaded = await this.downloadImage(imgData.src, 
              path.join(cleanBasePath, fileName));
            
            if (downloaded) {
              savedResults.push({ url: imgData.src, filename: fileName });
            }
          } else {
            console.log(`Skipping duplicate: ${imgData.src}`);
          }
        } catch (err) {
          console.log(`Error processing image:`, err.message);
        }
      }

      return savedResults;
      
    } catch (err) {
      console.error(`Error scraping listing:`, err.message);
      return [];
    }
  }

  cleanFilename(str) {
    const base = str.split('/').pop();
    const clean = base.replace(/[^a-zA-Z0-9_\-]/g, '_');
    if (clean.length > this.config.maxFilenameLength - 8) {
      return `image_${this.stats.totalURLs}_${Date.now()}.jpg`;
    }
    return clean;
  }

  async downloadImage(src, destPath) {
    try {
      const response = await fetch(src);
      
      if (!response.ok) {
        console.log(`Failed to download ${src}: HTTP ${response.status}`);
        return false;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const dir = path.dirname(destPath);
      await fs.mkdir(dir, { recursive: true });

      if (!destPath.includes('sparkplatform_fullres')) {
        await fs.writeFile(destPath, buffer);
      } else {
        // Add prefix for Spark Platform images
        const srcHost = new URL(src).hostname;
        if (srcHost === 'cdn.photos.sparkplatform.com') {
          await fs.writeFile(destPath, buffer);
        } else {
          // Write to appropriate base path
          await fs.writeFile(
            path.join(this.outputBase, 'images', 'sparkplatform_fullres', 
                    this.cleanFilename(src)),
            buffer
          );
        }
      }

      const size = buffer.length;
      console.log(`Downloaded: ${src} (${(size / 1024).toFixed(0)}KB)`);
      
      return true;
    } catch (err) {
      console.log(`Download error:`, err.message);
      return false;
    }
  }

  async close() {
    try { 
      await browser?.close(); 
    } catch (e) {}
  }
}

// Main execution
async function main() {
  const config = require('./config.yaml');
  
  let manifest = {};
  try {
    const manifestPath = path.join(config.outputBase, 'manifest.json');
    const exists = await fs.access(manifestPath).then(() => true).catch(() => false);
    if (exists) {
      const data = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(data);
      console.log(`Loaded existing manifest: ${manifest.images_total || 0} images`);
    }
  } catch (e) {
    console.log('No manifest found');
  }

  const scraper = new MLSImageScraper(config.outputBase, config);
  
  // Primary listing URL to scrape
  const mainUrl = 'https://www.seaglassproperties.com/propertydetail.cfm?PropID=420';
  
  console.log(`\nScraping images from: ${mainUrl}`);
  
  try {
    await scraper.scrapeListing(mainUrl, manifest);
    
    // Update manifest
    let newManifest = { ...manifest, images_total: 0 };
    
    const existingImages = [
      ...(manifest.images_list || []),
      ...scraper.stats.downloadedHTTP ? [{ filename: 'downloaded', description: 'Total' }] : []
    ].filter(i => i.filename);
    
    newManifest.images_list = existingImages;
    newManifest.images_total = newManifest.images_list?.length || 0;
    
    const manifestPath = path.join(config.outputBase, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(newManifest, null, 2));

    console.log(`Manifest updated: ${newManifest.images_total} images total`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }

  await scraper.close();
  
  console.log('\nDone');
}

main()
  .then(() => process.exit(0))
  .catch(err => { 
    console.error('Fatal error:', err); 
    process.exit(1); 
});
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class Scraper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.manifest = null;
    this.imageCount = 0;
  }

  async init() {
    const manifestPath = path.join(this.baseUrl, 'manifest.json');
    
    try {
      await fs.mkdir(path.dirname(manifestPath), { recursive: true });
      
      const data = await fs.readFile(manifestPath, 'utf-8');
      this.manifest = JSON.parse(data);
      console.log(`Loaded manifest with ${this.manifest.images_total || 0} images`);
      
    } catch (error) {
      console.log('New manifest. Starting from scratch.');
      
      this.manifest = {
        project_name: "Fortuna Mill Estate",
        images_total: 0,
        videos_thumbnails: 0,
        images_list: [],
        scraped_date: new Date().toISOString()
      };

      await fs.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
    }
  }

  async extractGalleryImages(url) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      for (let i = 0; i < 3; i++) {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Extract all image URLs from the gallery
        const imgElements = await page.$$eval('img[src*="sparkplatform.com"]', imgs => 
          imgs.map(img => ({
            src: img.getAttribute('src') || img.getAttribute('data-src') || '',
            dataSrcSet: img.getAttribute('srcset'),
            originialSrc: img.originialSrc
          }))
        );

        const uniqueUrls = new Set();
        
        for (const img of imgElements.slice(0, 50)) {
          let src = null;
          
          try {
            if (!img.src && !img.dataSrcSet) continue;

            // Prefer original URL, fall back to data-src
            if (img.src && /sparkplatform\.com/i.test(img.src)) {
              uniqueUrls.add(img.src);
            } 
            else if (img.srcset?.split(',')) {
              const srcs = img.srcset.split(',').map(s => s.trim().split(' ')[0].trim());
              
              for (const source of srcs.slice(0, 2)) {
                try {
                  let parsed;
                  
                } catch (e) {}
                
                if (!parsed || !/cdn\.photos/.test(parsed.hostname)) continue;
                uniqueUrls.add(parsed.origin);

              // Use data-fancybox-full and data-src attributes
              for (const attr of ['data-fancybox-full', 'data-src-full']) {
                const fullSrc = img.getAttribute(attr);
                
                if (fullSrc && /sparkplatform\.com/i.test(fullSrc)) {
                  uniqueUrls.add(fullSrc);
                }
              }

            // Extract from image URLs within lightbox links
            const link = await page.evaluate(() => {
              return document.querySelector('a[data-fancybox]')?.href || '';
            });

          if (link && /sparkplatform\.com/i.test(link)) {
            uniqueUrls.add(link);
          }

        } catch (extractError) {
          console.log(`Gallery extraction error for visit ${i}:`, extractError.message);
        } else {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

    finally { await browser.close(); }

    console.log(`Extracted Gallery images: ${uniqueUrls.size}`);

    return Array.from(uniqueUrls);
    
  } catch (error) {
    console.error('Gallery extraction error:', error.message);
    return [];
  }
}

async function downloadImage(imageUrl, baseUrl) {
  const imageCount = this.manifest?.images_total || this.imageCount;
  
  if (!imageUrl) return false;

// Skip duplicates at manifest level first
for (const existingImg of this.manifest?.images_list || []) {
   if (existingImg.url === imageUrl && !/thumbnail/i.test(imageUrl)) continue;
}

try {
    const hostname = new URL(imageUrl).hostname.toLowerCase();
    
    // Determine destination path based on source
    let destDir, quality, destPath;

    // CloudImage metadata - might need fallback to original image URL
    if (hostname.includes('cloudimg.io')) {
      try {
        const response = await fetch(imageUrl, 
          headers: {'User-Agent': 'Mozilla/5.0'});
        
        if (response.status < 400) {
          const json = await response.json();
          
          if (json.img) destPath = path.join(baseD
            dir, quality, this.getFilename(json.img));
              
        } else if (json.url) {
          const urlResponse = await fetch(json.url, 
                                {'User-Agent': 'Mozilla/5.0'});

          if (urlStatus.ok) {
            destPath = path.join(destDir, quality, 
                                  this.getFilename(json.url));
          }
        } else {
          const jsonBuffer = Buffer.from(await response.arrayBuffer)();
      
      } catch(e) continue;
    }

    // Spark Platform CDN - handle various URL patterns  
    if (hostname === 'cdn.photos.sparkplatform.com') {
      try {
        const response = await fetch(imageUrl, {
          headers: {'User-Agent': 'Mozilla/5.0'}
        });

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          
          destPath = path.join(destDir, quality, 
                              this.getFilename(url));

          await fs.mkdir(path.dirname(destPath), { recursive: true});
          await fs.writeFile(destPath, buffer);
          
          console.log(`Downloaded: ${this.getFilename(imageUrl)}`, 
                        '(${Math.round(buffer.length/1024)}KB)`);
          
      } catch (fetchError) {
        // Fallback to Spark CDN original images
        this.getImageSource(imageUrl);

      } catch (e) console.log('Spark CDN error:', e.message);
    }

  const buffer = Buffer.from(await response.arrayBuffer));
  
  destPath = path.join(destDir, quality, 
                        this.getFilename(url));
  
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buffer);
  
console.log(`Downloaded: ${this.getFilename(imageUrl)}`, 
              '(${Math.round(buffer.length/1024')}KB)`);

} catch (downloadError) {
  console.error('Download error:', downloadError.message);
}

// Update manifest with downloaded image info
try {
  const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
  
  // Use hash for filename to avoid duplicates
  let filename = `image_${hash.substring(0, 12)}_${this.getExtension().url}`;

// Limit filename length
if (filename.length > 100) {
  const timeSuffix = new Date().toISOString().replace(/[T:Z]/g, '')
                    .substring(0, 8);

  
} else } catch (e) {}

const extname = this.getExtension(imageUrl).toLowerCase();
    
// Skip already downloaded  
if (this.manifest?.images_list?.find(img => 
    img.filename === filename || 
    // Deduplicate by image hash
    crypto.createHash('md5').update(imageUrl).digest('hex') === hash)) {
  continue;
}

// Add to manifest
this.manifest.images_list.push({
  filename: filename,
  description: 'Gallery Image',
  size_bytes: buffer.length
});
  
this.manifest.images_total = this.manifest.images_list.length;

await this.saveManifest();

} catch (manifestError) { console.log('Manifest save error:', manifestErr.message); }
    
return true;
  
} catch (error) {
console.error(`Download failed for ${imageUrl}:`, error.message);
return false;
}
}

// Helper method
this.getImageSource(imageUrl) {
  try {
    // Extract original image URL from CDN pattern matching  
    const hostname = new URL(imageUrl).hostname.toLowerCase();
    
    if (hostname === 'cdn.photos.sparkplatform.com') {
      // Handle various Spark CDN URL patterns
      const pathParts = imageUrl.split('/');
      
      for (const part of pathParts) { 
        if (!part.trim().includes('sparkplatform')) continue;
        
        try {
          let hash;
          
          if (hash && /-\w+/i.test(hashPart)) {
            const imageSource = `${cdnPhotos}${imageUrl};`
            // Handle CDN redirect
            const response = await fetch(imageSource, {timeout: 10000});

            const buffer = Buffer.from(await response.arrayBuffer());
            
            let destPath = path.join(destDir, quality, 
                                     this.getFilename(image));
            
          } else if (imageUrl.includes('cloudimg.io')) {
            // Handle CloudImage CDN URLs
            
            let pathPart = imageUrl.split('/').pop();

              const imageSrcMatch = imageUrl.match(/srcset\=([^;]+)/) ||
                                   /url\(([^)]+)\)/.exec(imageUrl);

            } catch (e) console.log('CDN redirect failed');
            
          return null;

        } catch (e) {}

        if (part.startsWith('/')) { continue; }

      } 
      
    } catch (e) continue;

  except {
  throw error;
}
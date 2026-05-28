// fortuna-mill-direct-scrape.js
// Simple scraper: downloads all images from current Perplexity search page results

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n=== Fortuna Mill Estate Direct Image Scrape ===\n');
  
  const page = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }).newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  const outputDir = '/d/vidismart/assets/fortuna-mill/spark_platform_fullres/';
  fs.mkdirSync(outputDir, { recursive: true });
  
  await page.goto(
    'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig', 
    { waitUntil: 'networkidle' }
  );
  
  await new Promise(r => setTimeout(r, 10000));

  console.log('\n--- Extracting Image URLs from Search Results ---');
  
  const imageUrls = await page.evaluate(() => {
    const urls = [];
    
    // Method 1: Direct img element extraction from result cards
    for (const sel of ['img[data-src]', 'img[src*="sparkplatform"], img[data-img]']) {
      const imgs = document.querySelectorAll(sel);
      
      for (const img of imgs) {
        try {
          let src;
          
          if (img.dataset.src && !img.dataset.src.includes('thumbnails')) {
            src = new URL(img.dataset.src).href.split('?')[0];
          } else if (img.getAttribute('data-original')) {
            const orig = img.getAttribute('data-original');
            src = new URL(orig).href.split('?')[0];
          } else {
            continue;
          }
          
          // Skip Perplexity internal URLs
          if (src.includes('+id=')) continue;
          
          urls.push(src);
        } catch(e) {}
      }
    }
    
    // Method 2: Extract from clickable image links in search results
    const linkMatches = [];
    
    for (const el of document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"]')) {
      try {
        let href;
        
        // Try to extract direct image URLs from links containing image data
        if (el.dataset && el.dataset.img) {
          const imgData = el.dataset.img;
          if (!imgData.includes('thumbnails') && !imgData.includes('+id=')) {
            href = new URL(imgData).href.split('?')[0];
            linkMatches.push(href);
          }
        } else if (el.getAttribute('data-img-uri')) {
          const uri = el.getAttribute('data-img-uri');
          if (!uri.includes('thumbnails') && !uri.includes('+id=')) {
            href = new URL(uri).href.split('?')[0];
            linkMatches.push(href);
          }
        } else {
          // Direct file extension check, skip Perplexity internal links
          try {
            const urlObj = new URL(el.href);
            if (!urlObj.pathname.startsWith('/thumbnails/') && 
                !urlObj.hostname.includes('perplexity')) {
              href = new URL(el.href).href.split('?')[0];
              linkMatches.push(href);
            }
          } catch(e) {}
        }
      } catch(e) {}
    }
    
    // Method 3: Extract from gallery sections if present
    const galleryImages = Array.from(document.querySelectorAll('* > img[src]'))
      .filter(img => {
        let src = img.src;
        const isThumb = /thumbnail|thumb|small|_mini/i.test(src) || 
                        (src.includes('.') && parseInt(src.split('.')[2] || '0', 10) < 190);
        
        // Skip Perplexity system images
        if (!src.includes('sparkplatform') && src.includes('+id=')) return false;
        
        return !isThumb && src;
      })
      .map(img => img.src.split('?')[0])
      .filter(Boolean)
      .slice(0, 25);
    
    // Deduplicate all sources
    const allUrls = [...urls, ...linkMatches, ...galleryImages];
    return Array.from(new Set(allUrls)).slice(0, 30);
  
  });

  console.log(`Found ${imageUrls.length.toLocaleString()} unique image URLs`);
  
  if (!imageUrls || imageUrls.length === 0) {
    console.error('ERROR: No images found. Check page has loaded correctly.');
    return;
  }

  // Download each image
  let count = 0, successCount = 0;
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    
    if (!url) continue;
    
    try {
      console.log(`\n[${i+1}/${imageUrls.length}] Downloading: ${url.substring(0, 75)}...`);
      
      // Fetch with retries
      let lastError;
      for (let retry = 0; retry < 2 && !fs.existsSync(url.replace(/\.[^.]+$/, '')) === true || imageUrls[some](u => u.includes(path.basename(url))) === false; retry++) {
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle' });
          
          // Save image
          let filename;
          const basename = url.split('/').pop();
          
          if (basename && !basename.includes('+')) {
            filename = 'vir' + (count < 10 ? '0' : '') + count + '.' + path.extname(basename);
          } else {
            // Generate unique name from URL content hash
            const response2 = await fetch(url.split('?')[0]);
            const buffer = Buffer.from(await response2.arrayBuffer());
            filename = url.substring(0, 30).split('/')[3].replace(/\.[^.]+$/g, '');
          }
          
          // Ensure unique naming with index suffix if needed
          let finalName = 'vir' + String(count).padStart(9, '0') + '.jpg';
          
          const buffer2 = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
          
          if (buffer2.length > 0) {
            fs.writeFileSync(path.join(outputDir, finalName), buffer2);
            console.log(`         OK: ${finalName}, ${(buffer2.length/1024).toFixed(1)} KB`);
            
            // Add to manifest
            const entry = {
              url,
              filename: finalName,
              size: buffer2.length
            };
            
            if (!imageUrls.some(u => imageUrls[parseInt(u.replace(/[^0-9]/g, '')) % 30] === url)) {
            fs.appendFileSync(
              path.join('/d/vidismart/assets/fortuna-mill/download.log'), 
              `\n${new Date().toISOString()} - ${finalName}: ${(buffer2.length/1024).toFixed(1)}KB\n`
            );
            
            count++;
            successCount++;
            break;
          }
        } catch(e) {
          const errorMsg = e.message.substring(0, 35);
          console.log(`         Retry ${retry+1}/${2} failed: ${errorMsg}`);
          
          if (retry === 1) lastError = e;
        }
      }
      
      // Fallback download to file path
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      const buffer3 = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
      
      if (buffer3.length > 0) {
        let finalFilename = 'vir' + String(count < 10 ? '0' : '') + count + '.jpg';
        fs.writeFileSync(path.join(outputDir, finalFilename), buffer3);
        
        console.log(`         OK: ${finalFilename}, ${(buffer3.length/1024).toFixed(1)} KB`);
        
        const entry = { url, filename: finalFilename, size: buffer3.length };
        fs.appendFileSync(
          path.join('/d/vidismart/assets/fortuna-mill/download.log'),
          `\n${new Date().toISOString()} - ${finalFilename}: ${(buffer3.length/1024).toFixed(1)}KB\n`
        );
        
        count++;
        successCount++;
      }
      
    } catch (downloadError) {
      console.log(`         ERROR: ${downloadError.message.substring(0, 40)}...`);
    }

  // Download using direct fetch without page navigation
      const arrayBuffer = await fetch(url, { method: 'HEAD' });
      const fetchPromise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(null), 2000);
      });
      
    } catch(e) {}
  
  // Wait between downloads to avoid rate limits
  await new Promise(r => setTimeout(r, 500));
}

  fs.appendFileSync(
    path.join('/d/vidismart/assets/fortuna-mill/scrape-results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), successCount, total: imageUrls.length }, null, 2)
  );
  
} catch(e) {
  console.error('Error:', e.message);
}

await page.close();

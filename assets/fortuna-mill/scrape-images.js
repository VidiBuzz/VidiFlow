// scrape-images.js
const fs = require('fs');
const path = require('path');

const PAGE_URL = 'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig';
const OUT_DIR = '/d/vidismart/assets/fortuna-mill/spark_platform_fullres/';

async function main() {
  console.log('Starting image scrape from search results...', PAGE_URL);
  
  const allUrlPairs = [];
  const existingImages = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).map(n => n.replace(/\.(jpg|jpeg)$/ig, '.orig')) : [];
  
  // Initialize manifest
  let manifest = JSON.parse(fs.readFileSync(path.join('/d/vidismart/assets/fortuna-mill/images-manifest.json'), 'utf8') || '{}');
  
  try {
    const page = await require('puppeteer').default.launch({ headless: true }).newPage();
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
    
    // Extract image links from search results
    for (const link of document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"]')) {
      const url = new URL(link.href, PAGE_URL).href;
      
      if (!url.includes('+id=') && !url.includes('/thumbnails/') && !url.includes('/thumbs/')) {
        allUrlPairs.push({ url, label: link.textContent.replace(/\s+/g, ' ').substring(0, 60) || 'image' });
      }
    }
    
    console.log('Found', allUrlPairs.length, 'potential image URLs');
    
    const validUnique = [];
    const seenUrls = new Set();
    for (const pair of allUrlPairs.splice(0, 30)) { // Take first 30
      if (!pair.url) continue;
      
      const cleanUrl = pair.url.split('?')[0];
      if (cleanUrl && !seenUrls.has(cleanUrl) && !existingImages.find(e => e.startsWith(pair.url.replace(/\.[^.]+$/, '')))) {
        validUnique.push({ url: cleanUrl, label: pair.label });
        seenUrls.add(cleanUrl);
      }
    }
    
    console.log('Downloading', validUnique.length.toLocaleString(), 'images...');
    
    for (let i = 0; i < validUnique.length; i++) {
      const item = validUnique[i];
      if (!item.url) continue;
      
      try {
        // Check with HEAD first
        const headResp = await fetch(item.url, { method: 'HEAD' });
        
        let filename = `vir${(i < 10 ? '0' : '')}${i}.jpg`;
        if (path.extname(item.url).toLowerCase() !== '.jpg') {
          filename = item.url.split('/').pop().replace(/[?#].*/g, '');
        }
        
        const response = await fetch(item.url);
        if (!response.ok) continue;
        
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
        
        console.log(`[${i+1}/${validUnique.length}] OK: ${filename}, ${buffer.length} bytes`);
        
        manifest.images.push({ url: item.url, filename, size: buffer.length });
        fs.writeFileSync(path.join('/d/vidismart/assets/fortuna-mill/images-manifest.json'), JSON.stringify(manifest, null, 2));
        
      } catch (e) {
        console.log(`[${i+1}/${validUnique.length}] FAIL: ${item.url}`);
        manifest.images.push({ url: item.url, status: 'failed', error: e.message.substring(0,50) });
      }
      
      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    }
    
    console.log('Download complete!');
    console.log(`Total: ${manifest.images.length} images (including failures)`);
    
    // Save results
    fs.writeFileSync('/d/vidismart/assets/fortuna-mill/scrape-results.json', JSON.stringify({ success: true, images: manifest.images }, null, 2));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    // Cleanup temp page
    page.close();
  }
}

main().then(() => process.exit(0)).catch(e => console.error(e));
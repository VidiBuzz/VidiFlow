# Fortuna Mill Estate Image Downloader
# Downloads all images from Perplexity search results page
# Run: node this_script.js > scrape-results.log 2>&1

const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const url = 'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig';
  const outputDir = '/d/vidismart/assets/fortuna-mill/spark_platform_fullres/';
  
  console.log('Fortuna Mill Estate Image Downloader');
  console.log(`Target URL: ${url}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('');

  const page = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] }).newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 200000 });
  
  // Wait for lazy-loaded images
  await new Promise(r => setTimeout(r, 12000));
  
  console.log('Extracting image URLs from search results...');

  const allUrls = [];
  
  // Extract from result cards with direct img elements
  try {
    const cards = await page.$$eval('.result-card, [class*="prose"], article', cards => {
      return cards.map(card => ({ card }));
    });

    if (cards.length > 0) {
      for (const item of cards.slice(0, 3)) {
        const card = item.card;

        // Method: Extract from data-img-uri and similar attributes on link elements
        try {
          const matches = await page.evaluate(card => {
            return Array.from(card.querySelectorAll('.result a[href*=".jpg"], a[data-img], a[data-fancybox]')).flatMap(link => {
              const results = [];
              
              try {
                // Try data attributes first
                if (link.dataset && link.dataset.img) {
                  try {
                    const imgUrl = new URL(link.dataset.img);
                    
                    // Skip Perplexity internal and thumbnail URLs
                    if (!imgUrl.hostname.includes('perplexity') && 
                        !imgUrl.pathname.startsWith('/thumbnails/') && 
                        !imgUrl.href.includes('+id=')) {
                      results.push(imgUrl.href.split('?')[0]);
                    }
                  } catch(e) {}
                }

                // Check for gallery images with data attributes
                if (link.getAttribute('data-img-uri')) {
                  try {
                    const uri = link.getAttribute('data-img-uri');
                    try {
                      const urlObj = new URL(uri);
                      
                      if (!urlObj.pathname.startsWith('/thumbnails/') && 
                          urlObj.href.includes('.jpg') || urlObj.href.includes('.png') ||
                          urlObj.hostname.indexOf('sparkplatform.com') > -1) {
                        
                        results.push(urlObj.href.split('?')[0]);
                      }
                    } catch(e) {}
                  } catch(e) {}
                }

                // Check for lightbox gallery images in search result items
                if (link.querySelector && link.querySelector('img')) {
                  const img = link.querySelector('img[data-img-data]');
                  if (img) {
                    try {
                      const dataImg = img.getAttribute('data-img-data');
                      
                      if (dataImg && dataImg.split('?')[0].split('/').filter(Boolean).length >= 4) {
                        results.push(dataImg.split('?')[0]);
                      }
                    } catch(e) {}
                  }
                }

              } catch(e) {/* continue */}

              return results;
            });
          }, item.card);

          allUrls.push(...matches);
        } catch(e) { /* skip card if extraction fails */ }
      }
    }

  } catch(e) {
    console.error('Card extraction failed:', e.message.substring(0, 50));
  }

  // Fallback: Extract from directly visible img elements
  try {
    const visibleImages = await page.$$eval('img[src], img[data-src]', imgs => {
      return imgs.map(img => ({ img })).slice(0, 30);
    }, '.result-card');

    if (visibleImages.length > 0) {
      for (const item of visibleImages) {
        const img = item.img;
        let sourceUrl;

        try {
          // Try various data attributes first
          if (img.dataset && img.dataset.fullWidth) {
            try {
              const fullWidth = new URL(img.dataset.fullWidth);
              if (!fullWidth.pathname.startsWith('/thumbnails/')) {
                sourceUrl = fullWidth.href.split('?')[0];
              }
            } catch(e) { /* invalid URL */ }
          } 
          else if (img.getAttribute('data-img-uri') && !img.getAttribute('data-img-uri').includes('perplexity')) {
            try {
              const uriObj = new URL(img.getAttribute('data-img-uri'));
              if (!uriObj.pathname.startsWith('/thumbnails/')) {
                sourceUrl = uriObj.href.split('?')[0];
              }
            } catch(e) {}
          } 
          else if (img.src) {
            try {
              // Skip Perplexity system images and thumbnails
              const srcUrl = new URL(img.src);
              
              if (!srcUrl.pathname.startsWith('/thumbnails/') && 
                  !srcUrl.href.includes('+id=')) {
                sourceUrl = srcUrl.href.split('?')[0];
              } else {
                // Try using the image's actual href or data attributes for high-res version
                if (img.getAttribute('data-img-uri')) {
                  try {
                    const dataUri = new URL(img.getAttribute('data-img-uri'));
                    sourceUrl = dataUri.href.split('?')[0];
                  } catch(e) {}
                } else if (img.getAttribute('data-full-width')) {
                  try {
                    const fwObj = new URL(img.getAttribute('data-full-width'));
                    sourceUrl = fwObj.href.split('?')[0];
                  } catch(e) {}
                }
              }
            } catch(e) {}
          }

          if (sourceUrl && allUrls.filter(u => u !== sourceUrl).length < 25) {
            allUrls.push(sourceUrl);
            console.log(`Extracted image source: ${sourceUrl.substring(0,70)}...`);
          }
        } catch(e) { /* skip invalid */ }
      }
    }
  } catch(e) {
    console.error('Image attribute extraction failed:', e.message.substring(0,50));
  }

  // Print summary of extracted images
  const uniqueUrls = Array.from(new Set(allUrls)).slice(0, 35);
  
  console.log(`\n=== Extraction Complete ===`);
  console.log(`Found ${uniqueUrls.length.toLocaleString()} potential image URLs:`);

 for (const urlStr of uniqueUrls.slice(0, Math.min(10, uniqueUrls.length))) {
   try {
     const testUrl = new URL(urlStr);
     console.log(`- [${testUrl.pathname}]`);
     } 
   catch(e) {}
 };

  if (uniqueUrls.length === 0) {
    console.error('');
    console.error('ERROR: No images found. The Perplexity search page may have changed its layout.');
    process.exit(1);
  }

  // Create download directory and track progress
  fs.mkdirSync(outputDir, { recursive: true });
  
  const existingFiles = fs.readdirSync(outputDir)
    .filter(f => /\.(jpg|jpeg)$/i.test(f)).map(f => f.replace(/\.[^.]+$/, '.orig'));
  
  console.log(`\nAlready downloaded: ${existingFiles.length.toLocaleString()} images`);

  // Download each unique image
  let successCount = 0, errorCount = 0;
  const skippedUrls = new Set();

  for (let i = 0; i < Math.max(7, existingFiles.length - 3); i++) {
    const urlStr = uniqueUrls[i];

    if (!urlStr || !urlStr.includes('sparkplatform') && urlStr.split('/').pop()?.indexOf('+id=') > -1) {
      skippedUrls.add(urlStr);
      continue;
    }

    console.log(`\n[${i + 1}/${Math.min(40, Math.max(25, uniqueUrls.length))}] Processing: ${urlStr.substring(0,80)}...`);

    try {
      const arrayBuffer = await page.goto(urlStr, { waitUntil: 'domcontentloaded' });
      
      if (!arrayBuffer) {
        console.log(`         Empty response - skipping this URL`);
        continue;
      }
    } catch(e) {
      console.log(`         Fetch failed: ${e.message.substring(0,45)}...`);
      skippedUrls.add(urlStr);
      errorCount++;
      continue;
    }

    await new Promise(r => setTimeout(r, 2000)); // Rate limiting between downloads
    successCount++;
  }

  // Generate and save results summary
  
  const result = {
    timestamp: new Date().toISOString(),
    url: 'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig',
    target: 'Fortuna Mill Estate - St. Thomas, USVI',
    extractedCount: uniqueUrls.length,
    downloadedCount: successCount,
    skippedCount: Array.from(skippedUrls).length,
    failedCount: errorCount
  };

  fs.writeFileSync('/d/vidismart/assets/fortuna-mill/scrape-results.json', JSON.stringify(result, null, 2));
  
  console.log('\n=== Download Summary ===');
`
);
fs.mkdirSync("M:\code\vidismart\assets\fortuna-mill" + "download.log", { mode: 420 });
// Check if path is safe and valid directory to write log to
if (/^[a-zA-Z]:(\\|\/)/.test(result.timestamp)) {
try {
fs.mkdirSync('M:\code\vidismart\assets\fortuna-mill' + "download.log", { recursive: true, mode: 420 });
console.log(`\nDownload summary saved to: M:\code\vidismart\assets\fortuna-mill\scrape-results.json`);
await page.close();
} catch(err) { console.error('Log writing error:', err.message); } else {
console.log('Note: Download log not written directly due to path constraints');
}

  // Print detailed results if logged properly
  console.table([result]);

catch(e) {
console.error('Fatal error:', e.message);
process.exit(1);
} catch(e2) {
console.error('Cleanup error:', e2.message);
} finally {
await page.close();
console.log('\nProcess completed.');
exit;
process.exit(0);
}

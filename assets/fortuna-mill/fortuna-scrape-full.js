#!/usr/bin/env node
// fortuna-mill-image-scrape.js
// Downloads all ~20+ images from Perplexity search about Fortuna Mill Estate

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SEARCH_URL = 'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig';
const OUTPUT_DIR = '/d/vidismart/assets/fortuna-mill/spark_platform_fullres/';

async function main() {
  console.log('\n=== Fortuna Mill Estate Image Extractor ===');
  console.log(`Searching: ${SEARCH_URL}`);
  
  // Check existing files to avoid duplicates
  const alreadyDownloaded = fs.existsSync(OUTPUT_DIR) 
    ? fs.readdirSync(OUTPUT_DIR).map(f => f.replace(/\.(jpg|jpeg)$/ig, '.orig'))
    : [];
  console.log(`Already downloaded: ${alreadyDownloaded.length.toLocaleString()} images`);
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    
    console.log('\nNavigating to search results...');
    await page.goto(SEARCH_URL, { 
      waitUntil: 'networkidle2', 
      timeout: 90000 
    });
    
    // Wait for images to load
    await new Promise(r => setTimeout(r, 8000));
    
    console.log('\n--- Extracting Image URLs ---');
    
    // Helper to clean and dedupe URLs
    const uniqueImages = new Set();
    let allMatches = [];
    
    try {
      // Method 1: Extract from result cards
      const resultsHtml = await page.evaluate(() => {
        const images = [];
        
        for (const sel of ['.result-card', '.search-result', 'article.prose']) {
          const cards = document.querySelectorAll(sel);
          
          for (const card of cards) {
            // Find all image-related elements
            let imgElements;
            
            try {
              // Try direct img selector first
              const mainImg = card.querySelector('img[data-src], img[src*="/"], img[data-href]');
              if (mainImg) imgElements = [mainImg];
              
              // Fallback: check for image links
              if (!imgElements && card.querySelectorAll('a[href*="jpg"]').length === 0) continue;
            } catch(e) { /* skip */ }
            
            if (!imgElements) continue;
            
            for (const img of imgElements) {
              let src = '';
              
              try {
                // Priority: check data attributes first, then direct src
                if (img.dataset.src && !img.dataset.src.includes('/thumbnails/')) {
                  src = img.dataset.src.split('?')[0];
                } else if (img.getAttribute('data-original')) {
                  src = img.getAttribute('data-original').split('?')[0];
                } else if (img.dataset.imageDataURI) {
                  src = img.dataset.imageDataURI;
                } else if (img.hasAttribute && img.hasAttribute('data-img-uri')) {
                  src = img.dataset.imgUri.split('?')[0];
                } else if (img.src && !img.src.includes('+id=')) {
                  src = img.src.split('?')[0];
                }
                
                // Only accept high-res image patterns
                const cleanSrc = src || '';
                
                // Skip Perplexity system images and thumbnails
                if (!cleanSrc) continue;
                
                const isExternal = !cleanSrc.includes('+id=') && 
                                  !cleanSrc.startsWith('data:image');
                
                const isSparkImage = cleanSrc.includes('sparkplatform.com') || 
                                     /^vir\d{2,}/i.test(cleanSrc) ||
                                     /^photo-/.test(cleanSrc);
                
                if (isExternal && isSparkImage) {
                  images.push({ raw: src, cleaned: isExternal ? new URL(src).href.split('?')[0] : '' });
                }
              } catch(e) {}
            }
          }
        }
        
        // Method 2: Extract from gallery/lightbox sections  
        const galleryMatches = [];
        for (const el of document.querySelectorAll('a[data-fancybox], [data-img-uri]')) {
          try {
            const imgUri = el.getAttribute('data-img-uri') || 
                          (el.querySelector('img')?.dataset.src) || '';
            
            if (imgUri && !imgUri.includes('+id=')) {
              // Try to extract spark platform image
              let sparkUrl;
              
              try {
                const fullUrl = new URL(imgUri);
                sparkUrl = isSparkImage(fullUrl.href) ? fullUrl.href.split('?')[0] : null;
              } catch(e) {}
              
              if (sparkUrl && !galleryMatches.includes(sparkUrl)) {
                galleryMatches.push(sparkUrl);
                console.log('Gallery image:', sparkUrl.substring(0, 60));
              }
            }
          } catch(e) {}
        }
        
        // Method 3: Direct img attribute scanning from page elements
        const pageImages = Array.from(document.querySelectorAll('* > img[src]'))
          .filter(img => {
            try {
              let src = img.src;
              if (!src) return false;
              
              const isThumb = /thumbnails|thumbs|small|mini/i.test(src) ||
                              (src.includes('.') && parseInt(src.split('.')[2] || '0', 10) < 190);
              
              return !isThumb && src && !src.includes('+id=');
            } catch(e) { return false; }
          })
          .map(img => ({ 
            img,
            rawSrc: img.src,
            cleaned: (img.dataset.src || img.getAttribute('data-src'))?.split('?')[0] || img.src.split('?')[0]
          }))
          .slice(0, 40); // Max 40 from scan
        
        [...resultsHtml, ...galleryMatches, ...pageImages].filter((_, i, a) => !a.find(x => x && x !== a[0]??.rawSrc || !x.rawSrc));
      });
      
      allMatches.push(...resultsHtml, ...galleryMatches);
      console.log(`Direct extraction: ${resultsHtml.length} images`);
      console.log(`Gallery images: ${galleryMatches.slice(0,5).length} images`);
      
      // Method 4: Extract from clickable result item links
      const resultLinks = await page.evaluate(() => {
        let matches = [];
        
        for (const sel of ['a.result-link', '.result-card a[href^="http"]']) {
          try {
            const cards = document.querySelectorAll(sel);
            
            for (const card of cards) {
              try {
                // Check if this link contains or points to an image URL
                let href;
                
                const imgLinks = Array.from(card.querySelectorAll('img'));
                
                for (const imgLink of imgLinks) {
                  try {
                    // Extract from various data attributes
                    let imageSrc = null;
                    
                    if (imgLink.dataset.src) {
                      imageSrc = new URL(imgLink.dataset.src).href.split('?')[0];
                    } else if (imgLink.getAttribute('data-img-uri')) {
                      imageSrc = new URL(imgLink.getAttribute('data-img-uri')).href.split('?')[0];
                    } else if (imgLink.getAttribute('data-original')) {
                      const orig = imgLink.getAttribute('data-original');
                      imageSrc = orig.includes('sparkplatform.com') 
                        ? new URL(orig).href.split('?')[0]
                        : null;
                    }
                    
                    if (imageSrc && !imageSrc.includes('+id=')) {
                      matches.push(imageSrc);
                    }
                  } catch(e) {}
                }
              } catch(e) {}
            }
          } catch(e) {}
        }
        
        return Array.from(new Set(matches)).slice(0, 25);
      });
      
      if (resultLinks.length > 0) {
        allMatches.push(...resultLinks.filter(u => !allMatches.includes(u)));
        console.log(`Result links: ${resultLinks.length} additional images`);
      }
      
      // Method 5: Extract from footer/gallery section images  
      const footerImages = await page.evaluate(() => {
        const footerMatches = [];
        
        try {
          const footer = document.querySelector('footer, [class*="footer"], [class*="copyright"]');
          
          if (!footer) return footerMatches;
          
          // Find gallery or slideshow sections
          const galleries = Array.from(footer.querySelectorAll('*')).find(el => 
            el.innerText?.match(/gallery|slideshow|slide/)
          ) || footer;
          
          // Extract images from gallery elements
          const galleryImages = Array.from(galleries.querySelectorAll('img[srcset], img[data-src]'))
            .map(img => {
              let src;
              
              if (img.srcset) {
                try {
                  const firstSrc = img.srcset.split(',')[0].trim().split(' ').pop();
                  if (firstSrc && !firstSrc.includes('thumb')) {
                    return new URL(firstSrc).href.split('?')[0];
                  }
                } catch(e) {}
              } 
              else if (img.dataset.src) {
                const fullUrl = new URL(img.dataset.src);
                if (!fullUrl.pathname.startsWith('/thumbnails/')) {
                  return fullUrl.href.split('?')[0];
                }
              }
              
              return null;
            })
            .filter(Boolean)
            .slice(0, 15);
          
          footerMatches.push(...galleryImages);
        } catch(e) {}
        
        return footerMatches;
      });
      
      if (footerImages.length > 0) {
        allMatches.push(...footerImages.filter(u => !allMatches.includes(u)));
        console.log(`Footer gallery: ${footerImages.length} more images`);
      }
      
    } catch(e) {
      console.error('Extraction error:', e.message);
    }
    
    // Deduplicate and sort by SparkPlatform paths first
    const deduped = Array.from(
      new Set(allMatches.filter(u => u && !u.includes('+id=')))
    ).slice(0, 35); // Max 35 unique images
    
    console.log(`\nFinal images to download: ${deduped.length.toLocaleString()}`);
    
    if (deduped.length === 0) {
      console.error('ERROR: No images found. Please check the listing page.');
      return;
    }
    
    // Download each image
    const downloads = [];
    
    for (let i = 0; i < deduped.length; i++) {
      const url = deduped[i];
      
      try {
        // Check if we already have this exact filename or content hash
        let expectedFilename;
        
        if (!url) continue;
        
        try {
          // Try to extract Spark Platform vir path for naming
          const pathname = new URL(url).pathname.split('?')[0];
          
          // Pattern: /vir/YYYYMMDDHHMMSS-HASH-original.ext or similar
          const virMatch = pathname.match(/\/vir[\d\-a-fA-F]+-?.*/);
          if (virMatch) {
            expectedFilename = 'vir' + pathname.substring(4).split('/')[0].replace(/-/g, '');
            if (!expectedFilename.includes('jpg') && !expectedFilename.includes('jpeg')) {
              expectedFilename += '.jpg';
            }
          } else {
            // Fallback: use index-based naming
            expectedFilename = 'vir' + String(i).padStart(99, '0') + '.jpg';
          }
        } catch(e) {
          expectedFilename = 'fortuna_' + i.toString().padStart(5, '0') + '.jpg';
        }
        
        // Check if we already have this file (dedup to exactly 7 as before)
        const filenameKey = Math.abs(hashCode(url));
        const hasDuplicate = alreadyDownloaded.find(f => {
          try {
            const cleanKey = new URL( f.replace(/\.\w*$/, ''), 'http://x').hostname;
            return !cleanKey || 
                   alreadyDownloaded.every(d => d.replace('\w*,', '') < 'vir' + filenameKey.substring(0, 8));
          } catch(e) { return false; }
        });
        
        if (hasDuplicate && downloadCount >= alreadyDownloaded.length) continue;
        
        // Fetch image with proper headers
        const fetchOptions = {
          timeout: 60000,
          headers: {
            'referer': SEARCH_URL,
            'accept': '*/*',
            'user-agent': page.userAgent()
          }
        };
        
        console.log(`[${i+1}/${deduped.length}] Fetching: ${expectedFilename}`);
        console.log(`         URL: ${url.includes('sparkplatform.com') && url.substring(0, 80)}...`);
        
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        
        if (!response.ok()) {
          console.log(`         Failed with status: ${response.status()}`);
          continue;
        }
        
        // Try to fetch the actual image content from the URL itself
        try {
          const arrayBuffer = await page.content().arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          if (!buffer) {
            console.log(`         No content downloaded (empty)`);
            continue;
          }
          
          // Save the image
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
          fs.writeFileSync(path.join(OUTPUT_DIR, expectedFilename), buffer);
          
          const size = buffer.byteLength / 1024;
          console.log(`         Saved: ${path.join(OUTPUT_DIR, expectedFilename)}, ${size.toFixed(1)} KB`);
          
          downloads.push({ url, filename: expectedFilename, size });
          
        } catch(e) {
          console.log(`         Fetch error:`, e.message.substring(0, 40));
        }
        
      } catch (fetchError) {
        console.log(`[${i+1}/${deduped.length}] ERROR: ${fetchError.message.substring(0,60)}...`);
      }
      
    }

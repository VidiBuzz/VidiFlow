"use strict";

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SEARCH_URL = 'https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig';
const OUTPUT_DIR = '/d/vidismart/assets/fortuna-mill/spark_platform_fullres/';

async function extractAndDownloadImages() {
  console.log('Fortuna Mill Estate Image Downloader');
  console.log(`Target: ${SEARCH_URL}\n`);

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    console.log('Navigating to search results...');
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2', timeout: 200000 });
    
    await new Promise(r => setTimeout(r, 10000)); // Wait for lazy-loaded images

    console.log('\n--- Extracting Image URLs ---');
    
    // Extract all image sources using multiple complementary methods
    const imageUrlCollector = [];

    // Method 1: Direct img elements from search result cards
    try {
      console.log('Looking for direct img elements in result cards...');
      
      const cardResults = await page.evaluate(() => {
        const results = new Set();
        
        // Search common result container patterns
        const selectors = [
          '.result-card, .result-article, [class*="prose"], article',
          'div[class*="gallery"], div[class*="result"]'
        ];

        for (const sel of selectors) {
          try {
            const cards = document.querySelectorAll(sel);
            
            for (const card of cards) {
              let containerImages;
              
              try {
                // Try direct img selector first
                containerImages = Array.from(card.querySelectorAll('img[src], img[data-src]'));
              } catch(e) {
                continue;
              }

              if (containerImages.length === 0) continue;

              for (const img of containerImages) {
                let sourceUrl;

                try {
                  // Priority: data attributes, then direct src
                  
                  if (img.dataset.src && !img.dataset.src.includes('/thumbnails/')) {
                    const dataSrc = img.dataset.src.split('?')[0];
                    sourceUrl = dataSrc;
                  } 
                  else if (img.getAttribute('data-img-uri') && !img.getAttribute('data-img-uri').includes('perplexity')) {
                    try {
                      const fullUrl = new URL(img.getAttribute('data-img-uri'));
                      sourceUrl = fullUrl.href.split('?')[0];
                    } catch(e) {}
                  }
                  else if (img.getAttribute('data-original') && 
                           !img.getAttribute('data-original').includes('/thumbnails/')) {
                    try {
                      const orig = new URL(img.getAttribute('data-original'));
                      sourceUrl = orig.href.split('?')[0];
                    } catch(e) {}
                  }
                  else if (img.src.includes('+id=') || img.src.startsWith('http://') || !img.src.includes('.')) {
                    // Perplexity internal or malformed - skip
                  }
                  else {
                    try {
                      sourceUrl = new URL(img.src).href.split('?')[0];
                    } catch(e) {}
                  }

                  if (sourceUrl) {
                    // Only keep spark platform and non-thumbnail URLs
                    const pathObj = new URL(sourceUrl);
                    
                    if (!pathObj.pathname.startsWith('/thumbnails/') && 
                        !sourceUrl.includes('/thumbs/')) {
                      
                      sourceUrl.split('?')[0];
                      
                      if (!results.has(sourceUrl)) {
                        results.add(sourceUrl);
                      }
                    }
                  }
                } catch(e) {/* continue */}
              }
            }
          } catch(e) {/* skip */}
        }

        return Array.from(results).slice(0, 40);
      });

      imageUrlCollector.push(...cardResults);
      console.log(`Found ${cardResults.length.toLocaleString()} images from direct extraction`);
    } catch(e) {
      console.error('Extraction method 1 failed:', e.message.substring(0, 50));
    }

    // Method 2: Extract from clickable image links in search results  
    try {
      console.log('Looking for clickable image links...');
      
      try {
        const linkResults = await page.evaluate(() => {
          const matches = new Set();
          
          // Look for gallery or lightbox style image links
          const selectors = [
            'a[data-fancybox], a[data-img-uri], [class*="gallery"] a',
            '.result-image, .search-result img'
          ];

          for (const sel of selectors) {
            try {
              const links = document.querySelectorAll(sel);
              
              for (const link of links) {
                try {
                  let sourceUrl;
                  
                  // Extract from data attributes on link elements
                  if (link.dataset && link.dataset.img) {
                    try {
                      sourceUrl = new URL(link.dataset.img).href.split('?')[0];
                    } catch(e) {}
                  } else if (link.getAttribute('data-img-uri')) {
                    try {
                      const uri = link.getAttribute('data-img-uri');
                      // Only keep external Spark Platform URLs, skip internal links
                      sourceUrl = new URL(uri).href.split('?')[0];
                      matches.add(sourceUrl);
                    } catch(e) {/* skip invalid URIs */}
                  } else if (link.shadowRoot && link.shadowRoot.querySelector('img')) {
                    // Try shadow DOM for lightbox images
                    const innerImg = link.shadowRoot.querySelector('img[data-src]');
                    if (!innerImg) continue;
                    
                    try {
                      const dataSrc = innerImg.dataset.src;
                      if (dataSrc && !new URL(dataSrc).pathname.startsWith('/thumbnails/')) {
                        sourceUrl = new URL(dataSrc).href.split('?')[0];
                        matches.add(sourceUrl);
                      }
                    } catch(e) {/* skip */}
                  } 
                  
                  // Direct link href check for external gallery images
                  if (!sourceUrl && link.href.includes('+id=')) {
                    continue;
                  }

                  // Fallback: try direct image URLs in link content (edge case)
                  if (!sourceUrl) {
                    try {
                      const directImg = new URL(link.getAttribute('href') || '');
                      sourceUrl = directImg.href.split('?')[0];
                    } catch(e) {}
                  }

                  // Skip Perplexity system URLs
                  if (sourceUrl && 
                      !new URL(sourceUrl).hostname.endsWith('perplexity.ai')) {
                    
                    const pathObj = new URL(sourceUrl);
                    
                    if (!pathObj.pathname.startsWith('/thumbnails/') && 
                        !pathObj.href.includes('/thumbs/')) {
                      
                      matches.add(sourceUrl);
                    }
                  }
                } catch(e) {/* continue */}
              }
            } catch(e) {/* skip */}
          }

          return Array.from(matches).slice(0, 35);
        });

        imageUrlCollector.push(...linkResults);
        console.log(`Found ${linkResults.length.toLocaleString()} from link extraction`);
      } catch(e) {
        console.error('Method 2 failed:', e.message.substring(0, 40));
      }
    } catch(e) {}

    // Method 3: Footer/gallery section images
    try {
      console.log('Looking for footer/slideshow images...');
      
      const footer = await page.$('footer [data-img], footer img[data-src], [class*="slideshow"] img');
      
      if (footer) {
        console.log('Found slideshow/gallery container');
        
        try {
          const galleryImgs = await page.evaluate(() => {
            const matches = new Set();
            
            // Method 3a: Footer slides/galleries
            const footerGallery = Array.from(document.querySelectorAll('*')).find(el => 
              el && el.classList?.contains('gallery') || 
              (el.getAttribute('style')?.indexOf('flex') !== -1) ||
              false);
            
            if (!footerGallery) return [];

            const galleryImages = Array.from(footerGallery.querySelectorAll('[data-full-width], [data-href], [style*="object-fit"]'));

            for (const img of galleryImages.slice(0, 30)) {
              try {
                let src;

                // Try data attributes for high-res images
                if (img.dataset.fullWidth) {
                  try {
                    const fullUrl = new URL(img.dataset.fullWidth);
                    src = fullUrl.href.split('?')[0];
                    matches.add(src);
                  } catch(e) {}
                  
                  // Alternative: check for other common gallery attributes
                  if (!src && img.getAttribute('data-img-uri')) {
                    try {
                      const uri = new URL(img.getAttribute('data-img-uri')).href;
                      sourceUrl.split('?')[0];
                        matches.add(uri.href);
                    } catch(e) {}
                  }
                } 
                else if (img.dataset.hintSrc) {
                  try {
                    const hintUrl = new URL(img.dataset.hintSrc);
                    src = hintUrl.href.split('?')[0];
                    matches.add(src);
                  } catch(e) {}
                } 
                else if (img.srcset) {
                  // Parse first image from srcset, skip thumbnails
                  const parts = img.srcset.split(', ');
              
                  for (const part of parts) {
                    try {
                      const [urlStr, widthDesc] = part.trim().split(/\s+/);
                      const cleanUrl = urlStr.split('?')[0];

                      // Reject thumbnail variants and internal Perplexity URLs
                      if (!cleanUrl.includes('/thumbnails/') && 
                          !cleanUrl.includes('/thumbs/') &&
                          new URL(cleanUrl).hostname.includes('perplexai'))) {
                        
                        matches.add(cleanUrl);
                      }
                    } catch(e) {}
                  }
                } 
                
              } catch(e) {/* continue */}
            }

            return Array.from(matches);
          });

        imageUrlCollector.push(...galleryImgs);
        console.log(`Found ${galleryImgs.length.toLocaleString()} footer gallery images`);
      } else {
        const slideElements = await page.$$('[style*="object-fit"], [class*="slide"]');

        for (const slide of slideElements.slice(0, 5)) {
          try {
            for (const img of Array.from(slide.querySelectorAll('img'))) {
              try {
                // Extract from various data attributes used in slideshow images
                if (img.dataset.src) {
                  const sourceUrl = new URL(img.dataset.src).href.split('?')[0];

                  // Filter out thumbnails and Perplexity internal links
                  const urlPath = new URL(sourceUrl);

                  if (urlPath.pathname.indexOf('/thumbnails/') === -1 && 
                      !sourceUrl.includes('/thumbs/') &&
                      !new URL(new URL(sourceUrl)).hostname.startsWith('perplexity')) {

                    if (imageUrlCollector.filter(u => u !== sourceUrl).length < 20) {
                      imageUrlCollector.push(sourceUrl);
                    }
                  }
                } 
                
              } catch(e) {/* continue */}
            }
          } catch(e) {}
        }
      }

    } catch(e) {
      console.error('Method 3 error:', e.message.substring(0,45));
    }

    // Deduplicate and prepare for download
    const uniqueUrls = Array.from(new Set(imageUrlCollector))
      .map(url => url.split('?')[0])
      .filter(url => url.length > 5);

    console.log(`\n=== Final Images to Download ===`);
    console.log(`Total unique URLs: ${uniqueUrls.length}`);
    
  } catch(e) {
    console.error('Error:', e.message);
    throw e;
  }

  // Close browser cleanly on exit
  process.on('SIGINT', () => {
    if (browser) {
      await browser.close();
    }
    process.exit(0);
  });

  return { uniqueUrls, OUTPUT_DIR };
}

(async () => {
  try {
    const { uniqueUrls, OUTPUT_DIR } = await extractAndDownloadImages();
    
    if (uniqueUrls.length === 0) {
      console.error('ERROR: No images found. Check the search page loaded correctly.');
      process.exit(1);
    }

    console.log('\n--- Starting Download Process ---');

    // Prepare download directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let totalDownloaded = 0;
    const existingFiles = fs.readdirSync(OUTPUT_DIR)
      .map(f => f.replace(/\.(jpg|jpeg)$/ig, '.orig'));
    
    console.log(`Already downloaded: ${existingFiles.length.toLocaleString()} images`);
    
    // Download each unique image with retries
    for (let i = 0; i < Math.max(0, existingFiles.length - 5) && i < uniqueUrls.length; i++) {
      const url = uniqueUrls[i];

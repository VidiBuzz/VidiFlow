const { chromium } = require('C:/Users/James/AppData/Roaming/npm/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleErrors = [];
  const imageErrors = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Listen for failed requests (404s, broken images)
  page.on('requestfailed', request => {
    if (request.failure()) {
      const errorText = request.failure().errorText;
      const url = request.url();
      if (errorText.includes('404') || errorText.includes('blocked') || url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) {
        imageErrors.push({ url, error: errorText });
      }
    }
  });
  
  // Step 1: Navigate to projects.html
  console.log('=== VERIFYING projects.html ===');
  console.log('Navigating to https://caribbeanconsultants.net/projects.html...');
  await page.goto('https://caribbeanconsultants.net/projects.html', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for images to load
  await page.waitForTimeout(3000);
  
  // Check if Amanera image is loading
  const amaneraImage = await page.$('img[src*="amanera"], img[src*="plantation"], img[alt*="Amanera"]');
  if (amaneraImage) {
    const src = await amaneraImage.getAttribute('src');
    console.log(`Amanera image found with src: ${src}`);
    
    // Check if image is actually loaded (has naturalWidth > 0)
    const isLoaded = await amaneraImage.evaluate(img => {
      return img.naturalWidth > 0;
    });
    console.log(`Amanera image loaded successfully: ${isLoaded}`);
  } else {
    console.log('Amanera image NOT found - checking all project cards...');
  }
  
  // Get all images on the page
  const allImages = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loaded: img.naturalWidth > 0
    }))
  );
  
  console.log('\nAll images on projects.html:');
  allImages.forEach((img, i) => {
    const status = img.loaded ? '✓' : '✗ BROKEN';
    console.log(`  ${i+1}. ${status} ${img.src} (alt: "${img.alt}")`);
  });
  
  // Take full-page screenshot
  await page.screenshot({ path: 'projects-full-page.png', fullPage: true });
  console.log('\nScreenshot saved: projects-full-page.png');
  
  // Step 2: Navigate to index.html
  console.log('\n=== VERIFYING index.html ===');
  console.log('Navigating to https://caribbeanconsultants.net/index.html...');
  await page.goto('https://caribbeanconsultants.net/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for images to load
  await page.waitForTimeout(3000);
  
  // Get all images on the page
  const indexImages = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loaded: img.naturalWidth > 0
    }))
  );
  
  console.log('\nAll images on index.html:');
  indexImages.forEach((img, i) => {
    const status = img.loaded ? '✓' : '✗ BROKEN';
    console.log(`  ${i+1}. ${status} ${img.src} (alt: "${img.alt}")`);
  });
  
  // Take full-page screenshot
  await page.screenshot({ path: 'index-full-page.png', fullPage: true });
  console.log('\nScreenshot saved: index-full-page.png');
  
  // Report console errors
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => console.log(`  ERROR: ${err}`));
  } else {
    console.log('  No console errors found.');
  }
  
  // Report image errors
  console.log('\n=== IMAGE ERRORS (404s) ===');
  if (imageErrors.length > 0) {
    imageErrors.forEach(err => console.log(`  ${err.url}: ${err.error}`));
  } else {
    console.log('  No image 404 errors found.');
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  const brokenProjectImages = allImages.filter(img => !img.loaded);
  const brokenIndexImages = indexImages.filter(img => !img.loaded);
  
  console.log(`projects.html: ${allImages.length} images, ${brokenProjectImages.length} broken`);
  console.log(`index.html: ${indexImages.length} images, ${brokenIndexImages.length} broken`);
  
  const amaneraLoaded = allImages.find(img => img.src.includes('plantation') || img.alt.includes('Amanera'));
  if (amaneraLoaded) {
    console.log(`Amanera Resort image: ${amaneraLoaded.loaded ? 'LOADING CORRECTLY' : 'BROKEN'}`);
  }
  
  await browser.close();
})();

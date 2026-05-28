const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const consoleErrors = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
  });
  
  console.log('Navigating to https://caribbeanconsultants.net/...');
  await page.goto('https://caribbeanconsultants.net/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for full page load
  await page.waitForTimeout(3000);
  
  // Take full-page screenshot
  const fullPagePath = path.join(__dirname, 'cc-fullpage-screenshot.png');
  await page.screenshot({ 
    path: fullPagePath, 
    fullPage: true 
  });
  console.log(`Full-page screenshot saved: ${fullPagePath}`);
  
  // Scroll through sections and capture screenshots
  const sections = [
    { name: 'hero', selector: 'header, .hero, [class*="hero"]' },
    { name: 'pillars', selector: '[class*="pillar"], [class*="service"], section:nth-of-type(2)' },
    { name: 'slider', selector: '[class*="slider"], [class*="carousel"], [class*="project"]' },
    { name: 'footer', selector: 'footer, [class*="footer"]' }
  ];
  
  for (const section of sections) {
    try {
      const element = await page.$(section.selector);
      if (element) {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const sectionPath = path.join(__dirname, `cc-section-${section.name}.png`);
        await element.screenshot({ path: sectionPath });
        console.log(`Section screenshot saved: ${sectionPath}`);
      } else {
        console.log(`Section "${section.name}" not found with selector: ${section.selector}`);
      }
    } catch (err) {
      console.log(`Error capturing section "${section.name}": ${err.message}`);
    }
  }
  
  // Check for CSS errors in console
  console.log('\n=== Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors found.');
  } else {
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
  
  // Get computed styles for gradient elements
  console.log('\n=== Gradient Analysis ===');
  const gradientElements = await page.evaluate(() => {
    const results = [];
    const elements = document.querySelectorAll('[class*="hero"], [class*="gradient"], [class*="overlay"], footer, [class*="footer"]');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bg = style.background || style.backgroundImage;
      if (bg && (bg.includes('gradient') || bg.includes('linear') || bg.includes('radial'))) {
        results.push({
          tag: el.tagName,
          className: el.className,
          background: bg.substring(0, 200)
        });
      }
    });
    return results;
  });
  
  if (gradientElements.length > 0) {
    console.log('Gradient elements found:');
    gradientElements.forEach((el, i) => {
      console.log(`${i + 1}. <${el.tag}> class="${el.className}"`);
      console.log(`   Background: ${el.background}`);
    });
  } else {
    console.log('No gradient elements detected via computed styles.');
  }
  
  await browser.close();
  console.log('\n=== Verification Complete ===');
})();

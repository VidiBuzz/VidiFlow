const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pages = [
    { name: 'Home', url: 'https://caribbeanconsultants.net/' },
    { name: 'Projects', url: 'https://caribbeanconsultants.net/projects.html' },
    { name: 'Leadership', url: 'https://caribbeanconsultants.net/leadership.html' }
  ];

  let allClean = true;

  for (const pageInfo of pages) {
    console.log(`\n=== Checking ${pageInfo.name} (${pageInfo.url}) ===`);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    
    await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Extract the copyright line text
    const footerText = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return 'NO FOOTER FOUND';
      return footer.innerText;
    });
    
    console.log(`Footer text:\n${footerText}`);
    
    // Check for the specific copyright line containing "Caribbean Consultants Management"
    const copyrightLine = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;
      const paragraphs = footer.querySelectorAll('p');
      for (const p of paragraphs) {
        if (p.textContent.includes('Caribbean Consultants Management')) {
          return p.textContent.trim();
        }
      }
      // Also check divs and spans
      const allElements = footer.querySelectorAll('*');
      for (const el of allElements) {
        if (el.children.length === 0 && el.textContent.includes('Caribbean Consultants Management')) {
          return el.textContent.trim();
        }
      }
      return null;
    });
    
    console.log(`Copyright line: "${copyrightLine}"`);
    
    // Check for bullet character issues
    if (copyrightLine) {
      const hasBullet = copyrightLine.includes('â€¢') || copyrightLine.includes('•') || copyrightLine.includes('\u2022');
      const hasCleanDash = copyrightLine.includes(' - ');
      console.log(`Contains bullet character: ${hasBullet}`);
      console.log(`Contains clean dash: ${hasCleanDash}`);
      
      if (hasBullet) {
        console.log(`❌ BULLET CHARACTER FOUND on ${pageInfo.name}`);
        allClean = false;
      } else if (hasCleanDash) {
        console.log(`✅ Clean dash found on ${pageInfo.name}`);
      } else {
        console.log(`⚠️ Neither bullet nor dash found on ${pageInfo.name}`);
      }
    } else {
      console.log(`⚠️ Could not find copyright line on ${pageInfo.name}`);
      allClean = false;
    }
    
    // Take screenshot of footer area
    const footer = await page.$('footer');
    if (footer) {
      await footer.screenshot({ path: `cc/footer-${pageInfo.name.toLowerCase()}.png` });
      console.log(`Screenshot saved: cc/footer-${pageInfo.name.toLowerCase()}.png`);
    }
    
    await context.close();
  }
  
  console.log(`\n========================================`);
  console.log(`ALL PAGES CLEAN: ${allClean ? '✅ YES' : '❌ NO'}`);
  console.log(`========================================`);
  
  await browser.close();
})();

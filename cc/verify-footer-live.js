const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to https://caribbeanconsultants.net/ ...');
  await page.goto('https://caribbeanconsultants.net/', { waitUntil: 'networkidle', timeout: 30000 });

  // Scroll to the footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Extract the raw text of the copyright line containing "Caribbean Consultants Management"
  const footerText = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return 'NO FOOTER ELEMENT FOUND';
    return footer.innerText;
  });

  console.log('\n=== FULL FOOTER TEXT ===');
  console.log(footerText);

  // Find the specific copyright line
  const copyrightLine = footerText.split('\n').find(line => line.includes('Caribbean Consultants Management'));
  console.log('\n=== COPYRIGHT LINE ===');
  console.log(copyrightLine || 'NOT FOUND');

  // Check for the bullet character â€¢ vs clean " - "
  const hasBullet = footerText.includes('â€¢');
  const hasCleanDash = footerText.includes(' - ');
  console.log('\n=== CHARACTER CHECK ===');
  console.log(`Contains â€¢ (bullet): ${hasBullet}`);
  console.log(`Contains " - " (clean dash): ${hasCleanDash}`);

  // Take screenshot of the footer area
  const footerElement = await page.$('footer');
  if (footerElement) {
    await footerElement.screenshot({ path: 'cc/footer-live-verification.png' });
    console.log('\nScreenshot saved to cc/footer-live-verification.png');
  } else {
    // Fallback: full page screenshot
    await page.screenshot({ path: 'cc/footer-live-verification.png', fullPage: true });
    console.log('\nFull page screenshot saved to cc/footer-live-verification.png');
  }

  await browser.close();
  console.log('\nDone.');
})();

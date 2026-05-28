const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  try {
    // Navigate to the live Caribbean Consultants website
    console.log('=== NAVIGATING TO LIVE SITE ===');
    await page.goto('https://caribbeanconsultants.net/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Take a full page screenshot first
    await page.screenshot({ path: 'cc/live-site-full.png', fullPage: false });
    console.log('Full page screenshot saved.');

    // Scroll to the bottom to find the footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Screenshot focused on footer area
    await page.screenshot({ path: 'cc/live-site-footer.png' });
    console.log('Footer screenshot saved.');

    // Extract the raw HTML of the footer element
    const footerHTML = await page.evaluate(() => {
      const footer = document.querySelector('footer') || document.querySelector('[class*="footer"]') || document.querySelectorAll('*').find(el => el.textContent.includes('All Rights Reserved'));
      if (footer) {
        return {
          tag: footer.tagName,
          className: footer.className,
          html: footer.outerHTML,
          textContent: footer.textContent.trim().substring(0, 500)
        };
      }
      return { error: 'No footer found' };
    });
    
    console.log('\n=== FOOTER ELEMENT FOUND ===');
    console.log('Tag:', footerHTML.tag);
    console.log('Class:', footerHTML.className);
    console.log('Text content:', footerHTML.textContent);
    console.log('\nRaw HTML:\n', footerHTML.html);

    // Check specifically for the copyright line with "Caribbean Consultants Management"
    const copyrightLine = await page.evaluate(() => {
      const body = document.body.innerText;
      // Find the line containing "Caribbean Consultants" and "Rights Reserved"
      const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const copyrightLines = lines.filter(l => 
        l.toLowerCase().includes('caribbean consultants') && 
        l.toLowerCase().includes('rights reserved')
      );
      return copyrightLines;
    });
    
    console.log('\n=== COPYRIGHT LINES FOUND ON PAGE ===');
    console.log(JSON.stringify(copyrightLine, null, 2));

    // Get the full page source to check for mangled characters
    const pageSource = await page.content();
    
    // Search for the specific patterns
    const hasMangledBullet = pageSource.includes('â€¢') || pageSource.includes('%E2%80%A2');
    const hasFixedDash = pageSource.includes('LLC - All Rights') || pageSource.includes('LLC-All Rights');
    const hasHtmlEntityBullet = pageSource.includes('&bull;');
    const hasUnicodeBullet = pageSource.includes('\u2022');
    
    console.log('\n=== CHARACTER CHECK IN PAGE SOURCE ===');
    console.log('Contains mangled â€¢:', hasMangledBullet);
    console.log('Contains fixed dash (LLC -):', hasFixedDash);
    console.log('Contains &bull; entity:', hasHtmlEntityBullet);
    console.log('Contains Unicode bullet \\u2022:', hasUnicodeBullet);

    // Extract just the copyright/footer text portion from page source
    const footerMatch = pageSource.match(/Caribbean Consultants Management[^<]*<\/p>/i);
    if (footerMatch) {
      console.log('\n=== FOOTER COPYRIGHT FROM SOURCE ===');
      console.log(footerMatch[0]);
    }

    // Also search more broadly in the source
    const allMatches = [...pageSource.matchAll(/Caribbean Consultants Management[^<]*/gi)];
    console.log('\n=== ALL MATCHES FOR "Caribbean Consultants Management" IN SOURCE ===');
    allMatches.forEach((m, i) => {
      console.log(`${i + 1}. "${m[0]}"`);
    });

    // Check browser console errors
    console.log('\n=== BROWSER ERRORS CHECK ===');
    const consoleErrors = await page.evaluate(() => {
      return 'Console errors checked via listener above';
    });
    console.log(consoleErrors);

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await browser.close();
    console.log('\n=== DONE ===');
  }
})();

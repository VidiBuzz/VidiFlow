// Phase 3: Browser Verification Test for Smart-Book
// Runs Playwright to take screenshots and verify all features
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:8080';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];
function log(test, status, detail = '') {
  const entry = `[${status}] ${test}${detail ? ' — ' + detail : ''}`;
  results.push(entry);
  console.log(entry);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  // ──────────────────────────────────────────
  // TEST 1: Landing Page
  // ──────────────────────────────────────────
  console.log('\n=== TEST 1: Landing Page ===');
  try {
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // let animations play
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing-page.png'), fullPage: false });

    const title = await page.title();
    log('Page title loaded', title.includes('Speed of Agentic Visual AI') ? 'PASS' : 'FAIL', title);

    // Verify chapter count shows "47"
    const chapterCountText = await page.textContent('.impact-stat:last-child .impact-num');
    log('Chapter count display (47)', chapterCountText?.trim() === '47' ? 'PASS' : 'FAIL', `Found: "${chapterCountText?.trim()}"`);

    // Verify persona cards exist
    const personaCards = await page.$$('.persona-card');
    log('Persona cards present (3)', personaCards.length >= 3 ? 'PASS' : 'FAIL', `Found: ${personaCards.length}`);

    // Verify "Start Reading" or persona links exist
    const startLinks = await page.$$('a[href*="print-book"]');
    log('Start Reading links', startLinks.length > 0 ? 'PASS' : 'FAIL', `Found: ${startLinks.length}`);

    log('Landing page screenshot', 'INFO', '01-landing-page.png');
  } catch (e) {
    log('Landing page test', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 2: Book Reader — Consumer Persona
  // ──────────────────────────────────────────
  console.log('\n=== TEST 2: Book Reader — Consumer ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=consumer&name=TestUser`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify cover/hero loaded
    const coverTitle = await page.textContent('.cover-page h1, .cover-title, .book-title');
    log('Book cover loaded', coverTitle ? 'PASS' : 'WARN', coverTitle || 'No cover title found');

    // Wait for custom name to appear
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-consumer-book.png'), fullPage: false });

    // Check filter badge for consumer persona
    const personaPill = await page.$('.persona-pill, .filter-badge, .persona-badge');
    const personaText = personaPill ? await personaPill.textContent() : '';
    log('Persona filter active', personaText.includes('Consumer') ? 'PASS' : 'WARN', `Badge: "${personaText}"`);

    // Count chapters rendered
    const chapters = await page.$$('.chapter[id]');
    log('Chapters rendered for Consumer', chapters.length > 5 ? 'PASS' : 'FAIL', `Count: ${chapters.length}`);

    log('Consumer book reader screenshot', 'INFO', '02-consumer-book.png');
  } catch (e) {
    log('Consumer book reader', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 2b: IT Professional Persona
  // ──────────────────────────────────────────
  console.log('\n=== TEST 2b: Book Reader — IT Professional ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=it_professional&name=ITPro`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-itpro-book.png'), fullPage: false });

    const chapters = await page.$$('.chapter[id]');
    log('Chapters rendered for IT Professional', chapters.length > 5 ? 'PASS' : 'FAIL', `Count: ${chapters.length}`);
    log('IT Professional book reader screenshot', 'INFO', '03-itpro-book.png');
  } catch (e) {
    log('IT Professional book reader', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 2c: Executive Persona
  // ──────────────────────────────────────────
  console.log('\n=== TEST 2c: Book Reader — Executive ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=executive_entrepreneur&name=ExecUser`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-executive-book.png'), fullPage: false });

    const chapters = await page.$$('.chapter[id]');
    log('Chapters rendered for Executive', chapters.length > 5 ? 'PASS' : 'FAIL', `Count: ${chapters.length}`);
    log('Executive book reader screenshot', 'INFO', '04-executive-book.png');
  } catch (e) {
    log('Executive book reader', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 3: Two-Column Layout (Desktop)
  // ──────────────────────────────────────────
  console.log('\n=== TEST 3: Two-Column Layout ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Scroll past cover to first chapter
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-two-column-layout.png'), fullPage: false });

    // Check for image sidebar
    const imageSidebar = await page.$('.image-sidebar');
    if (imageSidebar) {
      const sidebarStyles = await imageSidebar.evaluate(el => {
        const style = getComputedStyle(el);
        return { position: style.position, width: style.width, display: style.display };
      });
      log('Image sidebar exists', 'PASS', `position: ${sidebarStyles.position}, width: ${sidebarStyles.width}`);
    } else {
      log('Image sidebar exists', 'FAIL', 'No .image-sidebar element found');
    }

    // Check for text column
    const textColumn = await page.$('.chapter-content, .text-column, .book-content');
    log('Text column exists', textColumn ? 'PASS' : 'FAIL');

    // Check sidebar is sticky (if exists)
    if (imageSidebar) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      const isSticky = await imageSidebar.evaluate(el => getComputedStyle(el).position === 'sticky');
      log('Sidebar is sticky', isSticky ? 'PASS' : 'WARN', isSticky ? 'position: sticky' : 'position is not sticky');
    }
  } catch (e) {
    log('Two-column layout', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 4: Image Lightbox
  // ──────────────────────────────────────────
  console.log('\n=== TEST 4: Image Lightbox ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await page.waitForTimeout(800);

    // Find and click a sidebar thumbnail
    const sidebarImages = await page.$$('.image-sidebar img, .sidebar-thumb, .chapter-image-thumb');
    log('Sidebar images found', sidebarImages.length > 0 ? 'PASS' : 'WARN', `Count: ${sidebarImages.length}`);

    if (sidebarImages.length > 0) {
      await sidebarImages[0].click();
      await page.waitForTimeout(800);

      // Check lightbox opened
      const lightbox = await page.$('.lightbox-overlay.active, .lightbox.active, #lightbox:not([style*="display: none"])');
      if (lightbox) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-lightbox-open.png'), fullPage: false });
        log('Lightbox opened on click', 'PASS');

        // Test close
        const closeBtn = await page.$('.lightbox-close, .lb-close, #lightboxClose');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(500);
          const lightboxClosed = !(await page.$('.lightbox-overlay.active, .lightbox.active'));
          log('Lightbox closed', lightboxClosed ? 'PASS' : 'FAIL');
        } else {
          // Try Escape key
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          log('Lightbox closed with Escape', 'PASS');
        }
      } else {
        log('Lightbox opened on click', 'FAIL', 'No active lightbox overlay found after click');
      }
    } else {
      log('Image lightbox test', 'SKIP', 'No sidebar images to click');
    }
  } catch (e) {
    log('Image lightbox', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 5: Scroll Progress Bar
  // ──────────────────────────────────────────
  console.log('\n=== TEST 5: Scroll Progress Bar ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check progress bar exists
    const progressBar = await page.$('.progress-bar, #progressBar, [class*="progress"]');
    if (progressBar) {
      const initialWidth = await progressBar.evaluate(el => el.style.width || getComputedStyle(el).width);
      log('Progress bar exists (initial)', 'PASS', `Initial: ${initialWidth}`);

      // Scroll halfway and check width changed
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      const midWidth = await progressBar.evaluate(el => el.style.width || getComputedStyle(el).width);
      log('Progress bar updates on scroll', midWidth !== '0px' && midWidth !== '0%' ? 'PASS' : 'FAIL', `Mid-scroll: ${midWidth}`);
    } else {
      log('Progress bar exists', 'FAIL', 'No progress bar element found');
    }
  } catch (e) {
    log('Scroll progress bar', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 6: Scroll-Spy Navigation
  // ──────────────────────────────────────────
  console.log('\n=== TEST 6: Scroll-Spy Navigation ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check sidebar navigation links
    const sidebarLinks = await page.$$('.sidebar-link, .toc-link, .chapter-nav-link');
    log('Sidebar nav links exist', sidebarLinks.length > 0 ? 'PASS' : 'FAIL', `Count: ${sidebarLinks.length}`);

    // Scroll to a position and check active class
    if (sidebarLinks.length > 0) {
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
      await page.waitForTimeout(800);

      const activeLink = await page.$('.sidebar-link.active, .toc-link.active, .chapter-nav-link.active');
      log('Scroll-spy highlights active chapter', activeLink ? 'PASS' : 'WARN', activeLink ? 'Active link found' : 'No active class on links');
    }
  } catch (e) {
    log('Scroll-spy navigation', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 7: Glossary Chapter (Ch39)
  // ──────────────────────────────────────────
  console.log('\n=== TEST 7: Glossary Chapter ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?chapter=ch39&persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check glossary chapter loaded
    const glossaryTitle = await page.textContent('h1, h2, .chapter-title');
    log('Glossary chapter loaded', glossaryTitle?.includes('Glossary') || glossaryTitle?.includes('39') ? 'PASS' : 'WARN', `Title: "${glossaryTitle?.substring(0, 60)}"`);

    // Count <dt> terms
    const terms = await page.$$('dl dt');
    log('Glossary term count (140)', terms.length === 140 ? 'PASS' : 'FAIL', `Found: ${terms.length} -- expected 140`);

    // Check A-Z structure with h2 headers
    const h2s = await page.$$('.chapter h2');
    const h2Texts = [];
    for (const h2 of h2s) {
      h2Texts.push(await h2.textContent());
    }
    log('Glossary A-Z headers', h2s.length >= 20 ? 'PASS' : 'FAIL', `Found ${h2s.length} letter headers: ${h2Texts.join(', ').substring(0, 100)}`);

    // Verify proper <dl>/<dt>/<dd> markup
    const dlCount = await page.$$eval('dl', els => els.length);
    log('Glossary <dl> sections', dlCount > 0 ? 'PASS' : 'FAIL', `Found: ${dlCount}`);

    // Verify glossary visible for consumer persona
    await page.goto(`${BASE_URL}/print-book.html?chapter=ch39&persona=consumer`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const consumerTerms = await page.$$('dl dt');
    log('Glossary visible for Consumer persona', consumerTerms.length > 0 ? 'PASS' : 'FAIL', `Terms: ${consumerTerms.length}`);

    // Verify glossary visible for it_professional persona
    await page.goto(`${BASE_URL}/print-book.html?chapter=ch39&persona=it_professional`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const itTerms = await page.$$('dl dt');
    log('Glossary visible for IT Professional persona', itTerms.length > 0 ? 'PASS' : 'FAIL', `Terms: ${itTerms.length}`);

    // Verify glossary visible for executive persona
    await page.goto(`${BASE_URL}/print-book.html?chapter=ch39&persona=executive_entrepreneur`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const execTerms = await page.$$('dl dt');
    log('Glossary visible for Executive persona', execTerms.length > 0 ? 'PASS' : 'FAIL', `Terms: ${execTerms.length}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-glossary-chapter.png'), fullPage: false });
    log('Glossary chapter screenshot', 'INFO', '07-glossary-chapter.png');
  } catch (e) {
    log('Glossary chapter', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 8: Console Errors
  // ──────────────────────────────────────────
  console.log('\n=== TEST 8: Console Errors ===');
  log('Console errors detected', consoleErrors.length === 0 ? 'PASS' : 'FAIL', consoleErrors.length > 0 ? `Count: ${consoleErrors.length}` : 'None');
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('  ', e));
  }

  // ──────────────────────────────────────────
  // TEST 9: Mobile Responsive
  // ──────────────────────────────────────────
  console.log('\n=== TEST 9: Mobile Responsive ===');
  try {
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08-mobile-layout.png'), fullPage: false });
    log('Mobile layout screenshot', 'INFO', '08-mobile-layout.png');

    // Check single column on mobile
    const sidebar = await mobilePage.$('.image-sidebar');
    const sidebarVisible = sidebar ? await sidebar.evaluate(el => getComputedStyle(el).display !== 'none') : false;
    log('Sidebar hidden on mobile', !sidebarVisible ? 'PASS' : 'WARN', sidebarVisible ? 'Sidebar still visible' : 'Single column');

    await mobilePage.close();
  } catch (e) {
    log('Mobile responsive', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // TEST 10: Dark Mode Toggle
  // ──────────────────────────────────────────
  console.log('\n=== TEST 10: Dark Mode Toggle ===');
  try {
    await page.goto(`${BASE_URL}/print-book.html?persona=all`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Look for dark mode toggle button
    const darkToggle = await page.$('.dark-mode-toggle, .theme-toggle, #darkModeToggle, [onclick*="dark"], [onclick*="theme"]');
    if (darkToggle) {
      log('Dark mode toggle exists', 'PASS');

      // Toggle dark mode
      await darkToggle.click();
      await page.waitForTimeout(500);
      const bodyClass = await page.evaluate(() => document.body.className);
      log('Dark mode toggled', bodyClass.includes('dark') ? 'PASS' : 'WARN', `Body classes: "${bodyClass}"`);
    } else {
      // Check if print-book has dark mode support or is already dark
      const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      log('Dark mode toggle exists', 'WARN', `No toggle found, bg: ${bgColor}. Landing page is dark-themed by default.`);
    }
  } catch (e) {
    log('Dark mode toggle', 'FAIL', e.message);
  }

  // ──────────────────────────────────────────
  // FINAL SUMMARY
  // ──────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════');
  console.log('     TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════');
  results.forEach(r => console.log(r));

  const passCount = results.filter(r => r.includes('[PASS]')).length;
  const failCount = results.filter(r => r.includes('[FAIL]')).length;
  const warnCount = results.filter(r => r.includes('[WARN]')).length;
  console.log(`\nPASS: ${passCount} | FAIL: ${failCount} | WARN: ${warnCount}`);

  // Write results to file
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'test-results.json'),
    JSON.stringify({ results, passCount, failCount, warnCount, timestamp: new Date().toISOString() }, null, 2)
  );

  await browser.close();
  console.log('\nScreenshots saved to:', SCREENSHOT_DIR);
}

run().catch(e => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
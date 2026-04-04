const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  // Create screenshots directory if it doesn't exist
  const screenshotDir = './screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Launch browser using local Chrome installation
  console.log('Launching Chromium browser...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Pages to capture screenshots for vidiflow/frontend
  const pages = [
    { path: '/', name: 'landing' },
    { path: '/smart-stack', name: 'smart-stack' },
    { path: '/smart-stack/builder', name: 'smart-stack-builder' },
    { path: '/smart-stack/analytics', name: 'smart-stack-analytics' },
    { path: '/smart-stack/deploy', name: 'smart-stack-deploy' },
    { path: '/smart-stack/docs', name: 'smart-stack-docs' },
    { path: '/ai-consultants', name: 'ai-consultants' },
    { path: '/channel', name: 'channel' },
    { path: '/vidi-fund', name: 'vidi-fund' },
    { path: '/vidi-fund/account', name: 'vidi-fund-account' },
    { path: '/vidi-fund/apply', name: 'vidi-fund-apply' },
    { path: '/vidi-fund/dashboard', name: 'vidi-fund-dashboard' },
    { path: '/vidi-fund/login', name: 'vidi-fund-login' },
    { path: '/vidi-fund/register', name: 'vidi-fund-register' },
    { path: '/smartchannel', name: 'smartchannel' },
    { path: '/smartchannel/media-library', name: 'smartchannel-media-library' },
    { path: '/smartchannel/siteswarm', name: 'smartchannel-siteswarm' },
    { path: '/smartchannel/text-to-video', name: 'smartchannel-text-to-video' },
  ];

  const baseUrl = 'http://localhost:3000';

  console.log(`Starting screenshots for vidiflow/frontend at ${baseUrl}`);
  console.log(`Saving to: ${screenshotDir}`);
  console.log(`Total pages to capture: ${pages.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const pageConfig of pages) {
    try {
      console.log(`Navigating to: ${pageConfig.name} (${pageConfig.path})`);
      
      await page.goto(`${baseUrl}${pageConfig.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for any loading states or animations using a proper delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const screenshotPath = path.join(screenshotDir, `${pageConfig.name}.png`);
      
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      console.log(`✓ Screenshot saved: ${screenshotPath}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error capturing ${pageConfig.name}:`, error.message);
      failCount++;
    }
  }

  await browser.close();
  
  console.log('\n========================================');
  console.log('Screenshot capture complete!');
  console.log(`Successful: ${successCount}/${pages.length}`);
  console.log(`Failed: ${failCount}/${pages.length}`);
  console.log('========================================\n');
})();

# Fortuna Mill Estate Image Downloader
const page = await require('playwright').page();
await page.goto('about:blank');
await page.setContent(`<div id="fetch">Fetching from Perplexity...<pre id="log"></pre></div>`);

console.log('=== Fortuna Mill Estate Image Downloader ===');
const log = document.getElementById('log');
await page.evaluate(() => { const o=document.getElementById('fetch');o.textContent=''; });
await page.waitForTimeout(2000);
const result = await page.context().newCDPSession(async (client) => {
  await client.send('Page.setInterceptContentSettings', {
    urlFilter: '*/fortuna-mill*',
    resourceType: 'Image',
    disableSecurityFixes?: true,
    securityLevel?: 'strict'
});
});

await page.goto('about:blank');

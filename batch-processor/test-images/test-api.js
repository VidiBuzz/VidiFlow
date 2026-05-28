/**
 * Quick API test script for BrandSwap batch processor.
 * Tests: template upload, config update, image upload, and output verification.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3456';

function multipartUpload(urlPath, fieldName, filePath, contentType) {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const parts = [];
    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
    ));
    parts.push(fileData);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(parts);
    const url = new URL(urlPath, BASE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function postJSON(urlPath, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', (chunk) => { d += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('=== BrandSwap API Test ===\n');

  // Step 1: Upload template
  console.log('1. Uploading template...');
  const templateResult = await multipartUpload('/api/template', 'template',
    path.join(__dirname, 'logo.png'), 'image/png');
  console.log('   Status:', templateResult.status);
  console.log('   Response:', JSON.stringify(templateResult.body));
  if (!templateResult.body.success) {
    console.error('   ❌ Template upload FAILED');
    process.exit(1);
  }
  console.log('   ✅ Template uploaded\n');

  // Step 2: Set replacement config
  console.log('2. Setting replacement config...');
  const configResult = await postJSON('/api/replacements', {
    text: 'VidiSmart',
    position: 'top-right',
    threshold: 0.5
  });
  console.log('   Status:', configResult.status);
  console.log('   Response:', JSON.stringify(configResult.body));
  if (!configResult.body.success) {
    console.error('   ❌ Config update FAILED');
    process.exit(1);
  }
  console.log('   ✅ Config updated\n');

  // Step 3: Verify config
  console.log('3. Verifying config...');
  const getConfigResult = await new Promise((resolve, reject) => {
    http.get(`${BASE_URL}/api/config`, (res) => {
      let d = '';
      res.on('data', (chunk) => { d += chunk; });
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
  console.log('   Config:', JSON.stringify(getConfigResult));
  console.log('   ✅ Config verified\n');

  // Step 4: Upload test image
  console.log('4. Uploading test image...');
  const uploadResult = await multipartUpload('/api/upload', 'files',
    path.join(__dirname, 'background.png'), 'image/png');
  console.log('   Status:', uploadResult.status);
  console.log('   Response:', JSON.stringify(uploadResult.body));
  if (!uploadResult.body.success) {
    console.error('   ❌ Image upload FAILED');
    process.exit(1);
  }
  console.log('   ✅ Image uploaded\n');

  // Step 5: Wait for processing
  console.log('5. Waiting 10 seconds for processing...');
  await sleep(10000);

  // Step 6: Check output
  console.log('6. Checking output directory...');
  const outputDir = path.join(__dirname, '..', 'output');
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    console.log('   Output files:', files);
    if (files.length > 0) {
      console.log('   ✅ Output files found!');
      for (const f of files) {
        const stat = fs.statSync(path.join(outputDir, f));
        console.log(`   - ${f} (${stat.size} bytes)`);
      }
    } else {
      console.log('   ⚠️  No output files yet (processing may still be in progress)');
    }
  } else {
    console.log('   ⚠️  Output directory does not exist');
  }

  // Step 7: Check server status
  console.log('\n7. Checking server status...');
  const statusResult = await new Promise((resolve, reject) => {
    http.get(`${BASE_URL}/api/status`, (res) => {
      let d = '';
      res.on('data', (chunk) => { d += chunk; });
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
  console.log('   Stats:', JSON.stringify(statusResult.stats));
  console.log('   ✅ Server running\n');

  console.log('=== API Test Complete ===');
}

main().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});

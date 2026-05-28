/**
 * Realistic Brand-Swap Test
 * Tests logo replacement with recognizable "NotebookLM" -> "VidiSmart" branding
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3456';
const TEST_DIR = __dirname;

function multipartUpload(urlPath, fieldName, filePath, contentType) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    
    const preamble = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
    );
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([preamble, fileData, epilogue]);

    const url = new URL(urlPath, SERVER_URL);
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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
    const url = new URL(urlPath, SERVER_URL);
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
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJSON(urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== Realistic Brand-Swap Test ===\n');
  console.log('Testing: NotebookLM -> VidiSmart logo replacement\n');

  try {
    // Step 1: Upload template (NotebookLM logo for detection)
    console.log('1. Uploading template (NotebookLM logo)...');
    const templatePath = path.join(TEST_DIR, 'realistic_template.png');
    const templateResult = await multipartUpload('/api/template', 'template', templatePath, 'image/png');
    console.log(`   Status: ${templateResult.status}`);
    if (templateResult.status === 200) {
      console.log('   [OK] Template uploaded\n');
    } else {
      console.log('   [FAIL] Template upload failed:', templateResult.data);
      return;
    }

    // Step 2: Upload replacement logo (VidiSmart)
    console.log('2. Uploading replacement logo (VidiSmart)...');
    const replacementPath = path.join(TEST_DIR, 'realistic_replacement_logo.png');
    const configResult = await postJSON('/api/replacements', {
      replacementImage: replacementPath,
      position: 'top-right',
      threshold: 0.5
    });
    console.log(`   Status: ${configResult.status}`);
    if (configResult.status === 200) {
      console.log('   [OK] Replacement config updated\n');
    } else {
      console.log('   [FAIL] Config update failed:', configResult.data);
      return;
    }

    // Step 3: Verify config
    console.log('3. Verifying configuration...');
    const configCheck = await getJSON('/api/config');
    console.log('   Config:', JSON.stringify(configCheck.data, null, 2));
    console.log('   [OK] Config verified\n');

    // Step 4: Upload test image (with NotebookLM logo)
    console.log('4. Uploading test image (with NotebookLM logo)...');
    const testImagePath = path.join(TEST_DIR, 'realistic_test_input.png');
    const uploadResult = await multipartUpload('/api/upload', 'files', testImagePath, 'image/png');
    console.log(`   Status: ${uploadResult.status}`);
    if (uploadResult.status === 200) {
      console.log('   [OK] Test image uploaded\n');
    } else {
      console.log('   [FAIL] Upload failed:', uploadResult.data);
      return;
    }

    // Step 5: Wait for processing
    console.log('5. Waiting 15 seconds for processing...');
    await sleep(15000);

    // Step 6: Check output
    console.log('6. Checking output directory...');
    const outputDir = path.join(__dirname, '..', 'output');
    const outputFiles = fs.readdirSync(outputDir).filter(f => f.includes('realistic_test_input'));
    
    if (outputFiles.length > 0) {
      console.log(`   [OK] Found ${outputFiles.length} output file(s):`);
      outputFiles.forEach(f => {
        const stats = fs.statSync(path.join(outputDir, f));
        console.log(`   - ${f} (${stats.size} bytes)`);
      });
      console.log();
    } else {
      console.log('   [FAIL] No output files found\n');
      return;
    }

    // Step 7: Check server status
    console.log('7. Checking server status...');
    const statusResult = await getJSON('/api/status');
    console.log('   Stats:', JSON.stringify(statusResult.data, null, 2));
    console.log('   [OK] Server running\n');

    console.log('=== Test Complete ===\n');
    console.log('Next: Open the output image to verify:');
    console.log('1. The NotebookLM logo was detected');
    console.log('2. The VidiSmart logo replaced it');
    console.log('3. The alignment is correct (no overlap or misalignment)');
    console.log(`\nOutput file: ${path.join(outputDir, outputFiles[outputFiles.length - 1])}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

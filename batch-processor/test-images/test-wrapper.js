const ImageProcessor = require('../lib/image-processor');
const path = require('path');

async function test() {
  const processor = new ImageProcessor();
  try {
    const result = await processor.processImage({
      inputFile: path.join(__dirname, 'background.png'),
      outputFile: path.join(__dirname, 'output-wrapper.png'),
      templateFile: path.join(__dirname, 'logo.png'),
      text: 'VidiSmart',
      position: 'top-right',
      threshold: 0.5
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();

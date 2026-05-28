require('dotenv').config({ path: '../.env' });
const { QwenClient } = require('./qwen-client');

async function testQwenClient() {
  if (!process.env.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY === 'your-api-key-here') {
    console.error('Error: DASHSCOPE_API_KEY not configured in .env file');
    console.error('Get your API key from: https://dashscope.console.aliyun.com/');
    process.exit(1);
  }

  const qwen = new QwenClient();

  console.log('Testing Qwen 3.6 Plus client...');
  console.log(`Model: ${qwen.model}`);
  console.log(`Base URL: ${process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'}`);
  console.log('---');

  try {
    const response = await qwen.chat([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Who are you?' }
    ]);

    console.log('Response received:');
    console.log(response.choices[0].message.content);
    console.log('---');
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testQwenClient();

/**
 * Example usage of Piper TTS Service with LM Studio reasoning_content handling
 */

const { PiperTTSService } = require('./index');

// Mock logger for demonstration
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()}:`, msg),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()}:`, msg, err?.message || err),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()}:`, msg),
  debug: (msg) => console.log(`[DEBUG] ${new Date().toISOString()}:`, msg)
};

async function demonstrateLmStudioIssue() {
  console.log('='.repeat(80));
  console.log('Demonstrating LM Studio reasoning_content Issue Fix');
  console.log('='.repeat(80));
  
  // Simulate different LLM response formats that might be encountered
  const testCases = [
    {
      name: 'Standard OpenAI format',
      response: {
        choices: [{ message: { content: 'Hello, this is a test of the TTS system.' } }]
      },
      expectedText: 'Hello, this is a test of the TTS system.'
    },
    {
      name: 'LM Studio with reasoning_content (the bug)',
      response: {
        content: '', // Empty content field
        reasoning_content: 'This is what the model actually said in its reasoning'
      },
      expectedText: 'This is what the model actually said in its reasoning'
    },
    {
      name: 'Direct content field',
      response: {
        content: 'Direct content from LLM'
      },
      expectedText: 'Direct content from LLM'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Test Case: ${testCase.name} ---`);
    const text = PiperTTSService.extractTextForTTS(testCase.response);
    logger.info(`Extracted text: "${text}"`);
    
    if (testCase.expectedText === text) {
      console.log('✓ PASS: Text extracted correctly');
    } else {
      console.log(`✗ FAIL: Expected "${testCase.expectedText}", got "${text}"`);
    }
  }
}

async function demonstratePiperUsage() {
  console.log('\n' + '='.repeat(80));
  console.log('Demonstrating Piper TTS Service Usage');
  console.log('='.repeat(80));
  
  // Initialize the service (this won't actually synthesize without a real Piper installation)
  const ttsService = new PiperTTSService({
    provider: 'piper_local',
    voiceName: process.env.TTS_VOICE_NAME || 'en_US-amy-medium',
    debug: true,
    speakingRate: 1.0,
    pitch: 0,
    volumeGain: 0
  });

  // Get service status
  const status = await ttsService.getStatus();
  console.log('\n--- Service Status ---');
  logger.info(`Provider: ${status.provider}`);
  logger.info(`Status: ${status.status}`);
  logger.info(`Message: ${status.message}`);

  // Demonstrate text extraction from various LLM response formats
  console.log('\n--- Text Extraction Examples ---');
  
  const llmResponses = [
    {
      name: 'Standard ChatGPT format',
      data: { choices: [{ message: { content: 'Hello, how can I help you today?' } }] }
    },
    {
      name: 'LM Studio with reasoning_content (buggy)',
      data: { 
        content: '', // Empty - this is the bug!
        reasoning_content: 'This text should actually be spoken'
      }
    },
    {
        name: 'Empty response',
        data: {}
      }
    ];

  for (const item of llmResponses) {
    console.log(`\n--- ${item.name} ---`);
    const extractedText = PiperTTSService.extractTextForTTS(item.data);
    if (extractedText) {
      logger.info(`Extracted: "${extractedText}"`);
    } else {
      logger.warn('No text could be extracted - TTS would fail!');
    }
  }

  // Clean up
  await ttsService.destroy();
}

// Run the examples
async function main() {
  try {
    await demonstrateLmStudioIssue();
    await demonstratePiperUsage();
    
    console.log('\n' + '='.repeat(80));
    console.log('Example execution completed successfully!');
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('Error during example execution:', error);
    process.exit(1);
  }
}

// Run the example if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { demonstrateLmStudioIssue, demonstratePiperUsage };

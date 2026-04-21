# Piper TTS Integration Module

A comprehensive text-to-speech integration module for VidiSmart AI Platform using the Piper TTS engine. This module specifically addresses the issue where LM Studio models return empty `content` with actual text in `reasoning_content`, which caused TTS to have nothing to synthesize during chat interactions.

## Features

- **LM Studio Reasoning Content Handling**: Automatically extracts text from `reasoning_content` field when `content` is empty
- **Multi-provider Support**: Works with both local Piper installations and remote TTS APIs  
- **Voice Customization**: Configurable voice parameters including speaking rate, pitch, and volume
- **Error Handling**: Robust error handling and logging for production use
- **Easy Integration**: Simple API for integrating TTS into any Node.js application

## Installation

```bash
npm install @vidismart/piper-tts
```

Or clone the repository:

```bash
git clone <repository-url>
cd piper-tts
npm install
```

## Configuration

### Environment Variables

Copy the example environment file and configure accordingly:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# TTS Provider (piper_local or piper_remote)
TTS_PROVIDER=piper_local

# Voice configuration  
PIPER_VOICE_NAME=en_US-amy-medium
TTS_VOICE_NAME=en_US-amy-medium

# Remote API endpoint (for remote mode)
PIPER_TTS_API_URL=http://localhost:59125

# Voice parameters
PIPER_PITCH=0
PIPER_VOLUME_GAIN=0
TTS_SPEAKING_RATE=1.0
```

## Usage

### Basic Example

```javascript
const { PiperTTSService } = require('@vidismart/piper-tts');

// Initialize the service with configuration
const ttsService = new PiperTTSService({
  provider: 'piper_local', // or 'piper_remote'
  voiceName: 'en_US-amy-medium',
  debug: true
});

async function main() {
  // Synthesize speech from text
  const audioBuffer = await ttsService.synthesizeSpeech('Hello, welcome to the future of AI voice synthesis!');
  
  // Save to file or stream to client
  require('fs').writeFileSync('output.wav', audioBuffer);
}

main().catch(console.error);
```

### Handling LM Studio Reasoning Content Issue

The key feature of this module is handling cases where LM Studio returns empty `content` with actual text in `reasoning_content`:

```javascript
const { PiperTTSService } = require('@vidismart/piper-tts');

// Simulate an LLM response from LM Studio
const llmResponse = {
  content: '', // Empty - this is the bug!
  reasoning_content: 'This text should actually be spoken'
};

// Extract processable text for TTS synthesis
const textForTTS = PiperTTSService.extractTextForTTS(llmResponse);
console.log(textForTTS); // "This text should actually be spoken"

// Now synthesize speech with the extracted text
const audioBuffer = await ttsService.synthesizeSpeech(textForTTS);
```

### Advanced Example with Error Handling

```javascript
const { PiperTTSService } = require('@vidismart/piper-tts');

async function synthesizeWithRetry(text, maxRetries = 3) {
  const ttsService = new PiperTTSService({
    provider: process.env.TTS_PROVIDER || 'piper_local',
    voiceName: process.env.TTS_VOICE_NAME || 'en_US-amy-medium'
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const audioBuffer = await ttsService.synthesizeSpeech(text);
      return audioBuffer;
    } catch (error) {
      console.error(`Synthesis failed (attempt ${attempt}/${maxRetry}):`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to synthesize speech after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

// Usage example
synthesizeWithRetry('This is a test of the emergency audio system.')
  .then(audioBuffer => {
    console.log(`Successfully synthesized ${audioBuffer.length} bytes of audio data`);
  })
  .catch(error => {
    console.error('Failed to synthesize speech:', error.message);
  });
```

## API Reference

### Constructor

```javascript
const service = new PiperTTSService(options);
```

**Parameters:**
- `options` (Object, optional): Configuration options
  - `voiceName` (string): Name of the voice to use (default: 'en_US-amy-medium')
  - `provider` (string): TTS provider type ('piper_local' or 'piper_remote')
  - `apiBase` (string): Base URL for remote API calls
  - `voiceId` (string): Optional voice identifier
  - `speakingRate` (number): Speaking rate multiplier (default: 1.0)
  - `pitch` (number): Pitch adjustment in semitones (default: 0)
  - `volumeGain` (number): Volume gain in decibels (default: 0)

### Static Methods

#### `PiperTTSService.extractTextForTTS(response)`

Extracts processable text from LLM responses, handling both regular content and reasoning_content fields. This is the key method that solves the LM Studio issue where content is empty but reasoning_content contains the actual text.

**Parameters:**
- `response` (Object): The LLM response object which may contain either `content` or `reasoning_content` field

**Returns:** `{string}` Processable text for TTS synthesis

**Example:**
```javascript
// Handle LM Studio's reasoning_content issue
const llmResponse = { content: '', reasoning_content: 'Actual text here' };
const textForTTS = PiperTTSService.extractTextForTTS(llmResponse);
console.log(textForTTS); // "Actual text here"
```

### Instance Methods

#### `synthesizeSpeech(text)`

Synthesizes speech from the given text.

**Parameters:**
- `text` (string): The text to synthesize

**Returns:** `Promise<Buffer>` - Audio data as a Buffer object

**Example:**
```javascript
const audio = await service.synthesizeSpeech('Hello, world!');
fs.writeFileSync('output.wav', audio);
```

#### `getAvailableVoices()`

Retrieves available voices from the TTS engine.

**Returns:** `Promise<Array<Object>>` - Array of voice objects with id and name properties

#### `getStatus()`

Gets the current status of the TTS service.

**Returns:** `Promise<Object>` - Status object containing:
- `provider`: The provider type
- `status`: Service status ('ready', 'error', etc.)
- `message`: Human-readable status message

## Testing

Run the test suite with:

```bash
npm test
```

## License

MIT © VidiSmart AI Team

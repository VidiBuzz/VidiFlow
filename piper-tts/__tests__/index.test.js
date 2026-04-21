/**
 * Test suite for Piper TTS Service - Addresses LM Studio reasoning_content issue
 */

const { PiperTTSService } = require('../index');

describe('PiperTTSService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TTS_PROVIDER = 'piper_local';
    delete process.env.PIPER_TTS_API_URL;
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      service = new PiperTTSService({ provider: 'piper_local' });
      expect(service.config.provider).toBe('piper_local');
      expect(service.config.voiceName).toBe('en_US-amy-medium');
    });

    test('should throw error for invalid provider', () => {
      expect(() => {
        new PiperTTSService({ provider: 'invalid_provider' });
      }).toThrow('Invalid TTS provider');
    });

    test('should use environment variables when options not provided', () => {
      process.env.TTS_VOICE_NAME = 'test-voice';
      service = new PiperTTSService();
      expect(service.config.voiceName).toBe('test-voice');
    });
  });

  describe('extractTextForTTS', () => {
    test('should extract text from reasoning_content field (LM Studio issue)', () => {
      const response = {
        reasoning_content: 'This is the actual content for TTS synthesis'
      };
      
      const result = PiperTTSService.extractTextForTTS(response);
      expect(result).toBe('This is the actual content for TTS synthesis');
    });

    test('should extract text from choices array', () => {
      const response = {
        choices: [
          { message: { content: 'Hello world' } }
        ]
      };
      
      const result = PiperTTSService.extractTextForTTS(response);
      expect(result).toBe('Hello world');
    });

    test('should extract text from direct content field', () => {
      const response = {
        content: 'Direct content here'
      };
      
      const result = PiperTTSService.extractTextForTTS(response);
      expect(result).toBe('Direct content here');
    });

    test('should return empty string for invalid input', () => {
      expect(PiperTTSService.extractTextForTTS(null)).toBe('');
      expect(PiperTTSService.extractTextForTTS(undefined)).toBe('');
      expect(PiperTTSService.extractTextForTTS({})).toBe('');
    });

    test('should prioritize reasoning_content over content', () => {
      const response = {
        reasoning_content: 'Reasoning text here',
        content: 'Regular content'
      };
      
      const result = PiperTTSService.extractTextForTTS(response);
      expect(result).toBe('Reasoning text here');
    });

    test('should handle empty strings and whitespace', () => {
      expect(PiperTTSService.extractTextForTTS({ content: '   ' })).toBe('');
      expect(PiperTTSService.extractTextForTTS({ content: '' })).toBe('');
    });
  });

  describe('synthesizeSpeech', () => {
    beforeEach(() => {
      service = new PiperTTSService({ provider: 'piper_local' });
    });

    test('should throw error for empty text', async () => {
      await expect(service.synthesizeSpeech('')).rejects.toThrow();
    });

    test('should throw error for non-string input', async () => {
      await expect(service.synthesizeSpeech(123)).rejects.toThrow();
    });

    test('should call _synthesizeLocal when provider is piper_local', async () => {
      const mockSynthesis = jest.fn().mockResolvedOnce(Buffer.from('test'));
      service._synthesizeLocal = mockSynthesis;

      await expect(service.synthesizeSpeech('Hello world')).resolves.toBeInstanceOf(Buffer);
      expect(mockSynthesis).toHaveBeenCalledWith('Hello world');
    });
  });

  describe('_validateConfig', () => {
    test('should return true for valid configuration', () => {
      service = new PiperTTSService({ 
        provider: 'piper_local',
        voiceName: 'en_US-amy-medium'
      });
      
      expect(service._validateConfig()).toBe(true);
    });

    test('should throw error for missing voice name', () => {
      expect(() => {
        new PiperTTSService({ provider: 'piper_local', voiceName: '' });
      }).toThrow();
    });
  });
});

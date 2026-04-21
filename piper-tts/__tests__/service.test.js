/**
 * Test suite for Piper TTS Service
 */

const { PiperTTSService } = require('../index');

describe('PiperTTSService', () => {
  let service;

  beforeEach(() => {
    // Reset module state between tests
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      service = new PiperTTSService({ provider: 'piper_local' });
      expect(service.config.provider).toBe('piper_local');
    });

    test('should throw error for invalid provider', () => {
      expect(() => {
        new PiperTTSService({ provider: 'invalid_provider' });
      }).toThrow('Invalid TTS provider');
    });
  });

  describe('synthesizeSpeech', () => {
    beforeEach(() => {
      service = new PiperTTSService({ provider: 'piper_local' });
    });

    test('should throw error for empty text', async () => {
      await expect(service.synthesizeSpeech('')).rejects.toThrow();
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

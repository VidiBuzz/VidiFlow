/**
 * Piper TTS Service Module
 * 
 * Handles text-to-speech synthesis using the Piper TTS engine.
 * Supports both local and remote TTS providers with proper error handling.
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const { join } = require('path');
const { existsSync, readFileSync } = require('fs');
const { createLogger, format, transports } = require('winston');

// Create logger instance for the service
const logger = format.combine(
  format.color({}),
  format.errors({ stack: true }),
  format.printf(({ message }) => message)
)();

class PiperTTSService {
  constructor(options = {}) {
    this.voiceName = options.voiceName || process.env.TTS_VOICE_NAME || 'en_US-amy-medium';
    this.provider = options.provider || process.env.TTS_PROVIDER || 'piper_local';
    this.apiBase = options.apiBase || process.env.PIPER_TTS_API_URL || 'http://localhost:59125';
    this.voiceId = options.voiceId || process.env.PIPER_VOICE_ID;
    this.speakingRate = parseFloat(options.speakingRate) || parseFloat(process.env.TTS_SPEAKING_RATE) || 1.0;
    this.pitch = parseInt(options.pitch) || parseInt(process.env.PIPER_PITCH) || 0;
    this.volumeGain = parseFloat(options.volumeGain) || parseFloat(process.env.PIPER_VOLUME_GAIN) || 0;
    
    // Validate voice configuration on initialization
    if (!this._validateVoiceConfig()) {
      logger.warn('Warning: Voice configuration validation failed, using defaults');
      this.voiceName = 'en_US-amy-medium';
    }
    
    // Internal state for tracking synthesis operations
    this.synthesisQueue = [];
    this.isProcessing = false;
  }

  /**
   * Validate voice configuration based on environment variables and options
   */
  _validateVoiceConfig() {
    // Check if required settings are present
    const hasProvider = this.provider && ['piper_local', 'piper_remote'].includes(this.provider);
    const hasVoiceName = this.voiceName && typeof this.voiceName === 'string';
    
    return hasProvider && hasVoiceName;
  }

  /**
   * Synthesize speech from text input
   * @param {string} text - The text to synthesize
   * @returns {Promise<Buffer>} Audio data as Buffer
   */
  async synthesizeSpeech(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for synthesis');
    }

    // Log the incoming text for debugging
    logger.info(`Synthesizing speech for text: ${text.substring(0, 100)}...`);

    try {
      switch (this.provider) {
        case 'piper_local':
          return await this._synthesizeLocal(text);
        case 'piper_remote':
          return await this._synthesizeRemote(text);
        default:
          throw new Error(`Unsupported TTS provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('Speech synthesis failed:', error.message);
      throw error;
    }
  }

  /**
   * Synthesize speech using local Piper installation
   */
  async _synthesizeLocal(text) {
    return new Promise((resolve, reject) => {
      // Command to run Piper TTS locally
      const command = `piper --model ${this.voiceName} --output_array "${text}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Piper local synthesis error: ${error.message}`);
          return reject(error);
        }
        
        try {
          // Parse the JSON output from Piper
          const result = JSON.parse(stdout);
          resolve(Buffer.from(result.audio, 'base64'));
        } catch (e) {
          logger.error('Failed to parse Piper output:', e.message);
          reject(e);
        }
      });
    });
  }

  /**
   * Synthesize speech using remote Piper API
   */
  async _synthesizeRemote(text) {
    const response = await fetch(`${this.apiBase}/v1/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_name: this.voiceName })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Get available voices from the TTS engine
   */
  async getAvailableVoices() {
    try {
      if (this.provider === 'piper_local') {
        // Return default voice list for local Piper
        return [{ id: this.voiceName, name: 'Piper Local Voice' }];
      } else {
        const response = await fetch(`${this.apiBase}/v1/voices`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      }
    } catch (error) {
      logger.error('Failed to get available voices:', error.message);
      return [];
    }
  }

  /**
   * Get service status and health check
   */
  async getStatus() {
    try {
      if (this.provider === 'piper_local') {
        // Check local Piper installation
        const exists = await this._checkLocalPiper();
        return {
          provider: this.provider,
          voiceName: this.voiceName,
          status: exists ? 'ready' : 'not_found',
          message: exists ? 'Piper TTS is ready' : 'Piper not found locally'
        };
      } else {
        // Check remote API health
        const response = await fetch(`${this.apiBase}/health`);
        return {
          provider: this.provider,
          status: response.ok ? 'ready' : 'error',
          message: response.ok ? 'Piper TTS is ready' : 'Service unavailable'
        };
      }
    } catch (error) {
      logger.error('Status check failed:', error.message);
      return {
        provider: this.provider,
        status: 'error',
        message: `Error checking status: ${error.message}`
      };
    }
  }

  /**
   * Check if Piper is installed locally
   */
  async _checkLocalPiper() {
    try {
      const { execSync } = require('child_process');
      execSync('piper --version', { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Clean up resources and close connections
   */
  async destroy() {
    this.synthesisQueue = [];
    this.isProcessing = false;
    logger.info('Piper TTS Service destroyed');
  }
}

// Export the class for Node.js modules
module.exports = { PiperTTSService };

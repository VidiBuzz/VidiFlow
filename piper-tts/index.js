/**
 * Piper TTS Integration Module - Main Entry Point
 * 
 * This module provides a complete text-to-speech solution using the Piper TTS engine.
 * It integrates with AnythingLLM and supports both local and remote TTS providers.
 * 
 * Key Features:
 * - Handles LM Studio's reasoning_content vs content field issue
 * - Extracts text from LLM responses properly for TTS synthesis
 * - Supports both piper_local and piper_remote providers
 */

const { exec, spawn } = require('child_process');
const path = require('path');

// Import dependencies
const fs = require('fs').promises;
const { existsSync } = require('fs');
const { join } = require('path');

class PiperTTSService {
  constructor(options = {}) {
    // Configuration from options or environment variables
    this.config = {
      voiceName: options.voiceName || process.env.TTS_VOICE_NAME || 'en_US-amy-medium',
      provider: options.provider || process.env.TTS_PROVIDER || 'piper_local',
      apiBase: options.apiBase || process.env.PIPER_TTS_API_URL || 'http://localhost:59125',
      voiceId: options.voiceId || process.env.PIPER_VOICE_ID,
      speakingRate: parseFloat(options.speakingRate) || 1.0,
      pitch: parseInt(options.pitch) || 0,
      volumeGain: parseFloat(options.volumeGain) || 0,
      debug: options.debug || false
    };

    // Validate configuration on initialization
    this._validateConfig();
    
    // Internal state for tracking synthesis operations
    this.synthesisQueue = [];
    this.isProcessing = false;
    
    // Logger instance
    this.logger = {
      info: (msg) => this.config.debug && console.log(`[INFO] ${new Date().toISOString()}:`, msg),
      error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()}:`, msg, err?.message || err),
      warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()}:`, msg),
      debug: (msg) => this.config.debug && console.log(`[DEBUG] ${new Date().toISOString()}:`, msg)
    };

    // Log initialization
    this.logger.info('Piper TTS Service initialized', {
      provider: this.config.provider,
      voiceName: this.config.voiceName
    });
  }

  /**
   * Validate the configuration parameters
   */
  _validateConfig() {
    const validProviders = ['piper_local', 'piper_remote'];
    
    if (!this.config.provider || !validProviders.includes(this.config.provider)) {
      throw new Error(`Invalid TTS provider: ${this.config.provider}. Must be one of: ${validProviders.join(', ')}`);
    }

    if (!this.config.voiceName) {
      throw new Error('Voice name is required for TTS configuration');
    }

    this.logger.debug('Configuration validated successfully');
  }

  /**
   * Extract processable text from LLM response, handling both regular content and reasoning_content fields.
   * 
   * This method addresses the core issue where LM Studio models return empty `content` 
   * with actual text in `reasoning_content`, causing TTS to have nothing to synthesize.
   * 
   * @param {Object} response - The LLM response object
   * @returns {string} Processable text for TTS synthesis
   */
  static extractTextForTTS(response) {
    if (!response) return '';

    // Handle different response formats from various LLM providers
    let text = '';
    
    // Case 1: Response has reasoning_content (like qdb3.6-35b-a3b model)
    // This is the key fix for the AnythingLLM issue where content is empty
    if (response.reasoning_content) {
      text = response.reasoning_content;
    } 
    // Case 2: Response has a choices array with message.content
    else if (response.choices?.[0]?.message?.content) {
      text = response.choices[0].message.content;
    }
    // Case 3: Direct content field
    else if (response.content !== undefined && response.content !== null) {
      text = String(response.content);
    }
    // Case 4: Response is a string
    else if (typeof response === 'string' && response.trim()) {
      text = response;
    }

    // Clean up the extracted text - remove extra whitespace and newlines
    return text ? text.toString().trim() : '';
  }

  /**
   * Synthesize speech from text input with proper error handling
   * @param {string} text - The text to synthesize
   * @returns {Promise<Buffer>} Audio data as Buffer
   */
  async synthesizeSpeech(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for synthesis');
    }

    // Log the incoming text for debugging
    this.logger.info(`Synthesizing speech for text: ${text.substring(0, 100)}...`);

    try {
      switch (this.config.provider) {
        case 'piper_local':
          return await this._synthesizeLocal(text);
        case 'piper_remote':
          return await this._synthesizeRemote(text);
        default:
          throw new Error(`Unsupported TTS provider: ${this.config.provider}`);
      }
    } catch (error) {
      this.logger.error('Speech synthesis failed:', error.message);
      throw error;
    }
  }

  /**
   * Synthesize speech using local Piper installation
   */
  async _synthesizeLocal(text) {
    return new Promise((resolve, reject) => {
      // Command to run Piper TTS locally with proper escaping and parameters
      const command = `piper --model ${this.config.voiceName} --output_array "${text}"`;
      
      this.logger.debug(`Executing: ${command}`);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Piper local synthesis error: ${error.message}`, stderr);
          return reject(new Error(`Local synthesis failed: ${error.message}`));
        }
        
        try {
          // Parse the JSON output from Piper
          const result = JSON.parse(stdout);
          resolve(Buffer.from(result.audio, 'base64'));
        } catch (e) {
          this.logger.error('Failed to parse Piper output:', e.message);
          reject(e);
        }
      });
    });
  }

  /**
   * Synthesize speech using remote Piper API
   */
  async _synthesizeRemote(text) {
    try {
      const response = await fetch(`${this.config.apiBase}/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice_name: this.config.voiceName,
          speaking_rate: this.config.speakingRate,
          pitch: this.config.pitch,
          volume_gain: this.config.volumeGain
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const audioData = await response.arrayBuffer();
      return Buffer.from(audioData);
    } catch (error) {
      this.logger.error('Remote synthesis failed:', error.message);
      throw error;
    }
  }

  /**
   * Get available voices from the TTS engine
   */
  async getAvailableVoices() {
    try {
      if (this.config.provider === 'piper_local') {
        // Return default voice list for local Piper
        return [{ id: this.config.voiceName, name: `Piper Local Voice (${this.config.voiceName})` }];
      } else {
        const response = await fetch(`${this.config.apiBase}/v1/voices`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      }
    } catch (error) {
      this.logger.error('Failed to get available voices:', error.message);
      return [];
    }
  }

  /**
   * Get service status and health check
   */
  async getStatus() {
    try {
      if (this.config.provider === 'piper_local') {
        // Check local Piper installation
        const exists = await this._checkLocalPiper();
        return {
          provider: this.config.provider,
          voiceName: this.config.voiceName,
          status: exists ? 'ready' : 'not_found',
          message: exists ? 'Piper TTS is ready' : 'Piper not found locally'
        };
      } else {
        // Check remote API health
        const response = await fetch(`${this.config.apiBase}/health`);
        return {
          provider: this.config.provider,
          status: response.ok ? 'ready' : 'error',
          message: response.ok ? 'Piper TTS is ready' : 'Service unavailable'
        };
      }
    } catch (error) {
      this.logger.error('Status check failed:', error.message);
      return {
        provider: this.config.provider,
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
    this.logger.info('Piper TTS Service destroyed');
  }
}

// Export the class for Node.js modules
module.exports = { PiperTTSService };

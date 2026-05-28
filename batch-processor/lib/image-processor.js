const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * ImageProcessor - Node.js wrapper for the BrandSwap image rebranding Python script.
 *
 * Spawns the Python `rebrand.py` script as a child process, collects its JSON
 * stdout output, and returns structured results. Handles timeouts, missing
 * dependencies, and error conditions gracefully.
 *
 * @example
 * const processor = new ImageProcessor({ threshold: 0.6 });
 * const result = await processor.processImage({
 *   inputFile: './input/photo.jpg',
 *   outputFile: './output/rebranded.jpg',
 *   templateFile: './templates/old-logo.png',
 *   text: 'VidiSmart',
 *   position: 'top-right'
 * });
 * console.log(result.matched, result.confidence);
 */
class ImageProcessor {
  /**
   * @param {Object} [config={}]
   * @param {string}  [config.pythonPath='python']   - Path to Python executable
   * @param {number}  [config.threshold=0.5]         - Default match threshold (0-1)
   * @param {string}  [config.position='top-right']   - Default replacement position
   * @param {number}  [config.scales=12]             - Number of scales for multi-scale matching
   * @param {number}  [config.timeoutMs=60000]       - Per-image timeout in ms (default 60s)
   */
  constructor(config = {}) {
    this.pythonPath = config.pythonPath || 'python';
    this.scriptPath = path.join(__dirname, '..', 'scripts', 'rebrand.py');
    this.defaultThreshold = config.threshold || 0.5;
    this.defaultPosition = config.position || 'top-right';
    this.defaultScales = config.scales || 12;
    this.timeoutMs = config.timeoutMs || 60000;
    this._pythonChecked = false;
  }

  /**
   * Verify that Python is available and the rebrand script exists.
   * Called once lazily before first processImage call.
   * @returns {Promise<void>}
   * @throws {Error} If Python is not installed or the script is missing
   */
  async _ensurePythonReady() {
    if (this._pythonChecked) return;

    // Check script exists
    if (!fs.existsSync(this.scriptPath)) {
      throw new Error(
        `Rebrand script not found at: ${this.scriptPath}. ` +
        'Ensure batch-processor/scripts/rebrand.py exists.'
      );
    }

    // Check Python is available
    try {
      await this._runCommand(this.pythonPath, ['--version']);
      this._pythonChecked = true;
    } catch (err) {
      throw new Error(
        `Python is not available at "${this.pythonPath}". ` +
        'Install Python 3.8+ and ensure it is on your PATH, or pass pythonPath in the constructor.'
      );
    }
  }

  /**
   * Run a simple command and return stdout (used for version checks).
   * @param {string} command
   * @param {string[]} args
   * @returns {Promise<string>}
   */
  _runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}: ${stderr.trim()}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn "${command}": ${err.message}`));
      });
    });
  }

  /**
   * Process a single image file.
   *
   * Spawns the Python rebrand script with the given options and returns the
   * parsed JSON result.
   *
   * @param {Object}   options
   * @param {string}   options.inputFile         - Path to input image
   * @param {string}   options.outputFile        - Path for output image
   * @param {string}   options.templateFile      - Path to logo template to detect
   * @param {string}   [options.text]            - Replacement text to overlay
   * @param {string}   [options.replacementImage]- Path to replacement logo image
   * @param {string}   [options.position]        - Position: top-left, top-right, bottom-left, bottom-right
   * @param {number}   [options.threshold]       - Match threshold 0-1
   * @param {number}   [options.scaleMin]        - Minimum scale factor (default 0.2)
   * @param {number}   [options.scaleMax]        - Maximum scale factor (default 3.0)
   * @param {number}   [options.scales]          - Number of scales to try (default 12)
   * @param {number}   [options.overlayOpacity]  - Overlay opacity 0-1 (default 1.0)
   * @param {Function} [options.onProgress]      - Progress callback
   * @returns {Promise<Object>} Result with matched, confidence, position info
   * @throws {Error} On missing required args or Python failure
   */
  async processImage(options) {
    await this._ensurePythonReady();

    const {
      inputFile,
      outputFile,
      templateFile,
      text,
      replacementImage,
      position,
      threshold,
      scaleMin,
      scaleMax,
      scales,
      overlayOpacity
    } = options;

    // Validate required args
    if (!inputFile) throw new Error('options.inputFile is required');
    if (!outputFile) throw new Error('options.outputFile is required');
    if (!templateFile) throw new Error('options.templateFile is required');
    if (!text && !replacementImage) {
      throw new Error('Either options.text or options.replacementImage is required');
    }

    // Build Python script arguments
    const pyArgs = [
      this.scriptPath,
      '--input', path.resolve(inputFile),
      '--output', path.resolve(outputFile),
      '--template', path.resolve(templateFile),
      '--position', position || this.defaultPosition,
      '--threshold', String(threshold ?? this.defaultThreshold),
      '--scale-min', String(scaleMin ?? 0.2),
      '--scale-max', String(scaleMax ?? 3.0),
      '--scales', String(scales ?? this.defaultScales),
      '--overlay-opacity', String(overlayOpacity ?? 1.0)
    ];

    if (text) {
      pyArgs.push('--text', text);
    }
    if (replacementImage) {
      pyArgs.push('--replacement-image', path.resolve(replacementImage));
    }

    // Spawn Python process
    const result = await this._spawnPython(pyArgs);

    // Parse JSON output
    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch (err) {
      throw new Error(
        `Failed to parse Python output as JSON. Raw output: ${result.stdout.slice(0, 500)}`
      );
    }

    if (parsed.error) {
      throw new Error(`Python processing error: ${parsed.error}`);
    }

    return parsed;
  }

  /**
   * Process multiple images in a folder sequentially.
   *
   * Scans `inputDir` for supported image files, processes each one through
   * the Python rebrand script, and returns a summary.
   *
   * @param {Object}   options
   * @param {string}   options.inputDir          - Input directory
   * @param {string}   options.outputDir         - Output directory
   * @param {string}   options.templateFile      - Logo template to detect
   * @param {string}   [options.text]            - Replacement text
   * @param {string}   [options.replacementImage]- Replacement logo image
   * @param {string}   [options.position]        - Position (default: top-right)
   * @param {number}   [options.threshold]       - Match threshold
   * @param {number}   [options.scaleMin]        - Min scale factor
   * @param {number}   [options.scaleMax]        - Max scale factor
   * @param {number}   [options.scales]          - Number of scales
   * @param {number}   [options.overlayOpacity]  - Overlay opacity
   * @param {Function} [options.onProgress]      - Callback: (currentIndex, total, currentFile)
   * @returns {Promise<Object>} Summary: { processed, matched, failed, results[], errors[] }
   */
  async processBatch(options) {
    const {
      inputDir,
      outputDir,
      templateFile,
      text,
      replacementImage,
      position,
      threshold,
      scaleMin,
      scaleMax,
      scales,
      overlayOpacity,
      onProgress
    } = options;

    if (!inputDir) throw new Error('options.inputDir is required');
    if (!outputDir) throw new Error('options.outputDir is required');
    if (!templateFile) throw new Error('options.templateFile is required');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Find all image files in inputDir
    const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif']);
    const files = fs.readdirSync(inputDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.has(ext);
      })
      .sort();

    if (files.length === 0) {
      return {
        processed: 0,
        matched: 0,
        failed: 0,
        results: [],
        errors: []
      };
    }

    const results = [];
    const errors = [];
    let matchedCount = 0;
    let failedCount = 0;

    // Process sequentially to avoid memory issues
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputFile = path.join(inputDir, file);
      const outputFile = path.join(outputDir, file);

      if (onProgress) {
        onProgress(i, files.length, file);
      }

      try {
        const result = await this.processImage({
          inputFile,
          outputFile,
          templateFile,
          text,
          replacementImage,
          position,
          threshold,
          scaleMin,
          scaleMax,
          scales,
          overlayOpacity
        });

        results.push({ file, ...result });
        if (result.matched) matchedCount++;
      } catch (err) {
        failedCount++;
        errors.push({ file, error: err.message });
        results.push({ file, matched: false, error: err.message });
      }
    }

    // Final progress callback
    if (onProgress) {
      onProgress(files.length, files.length, null);
    }

    return {
      processed: files.length,
      matched: matchedCount,
      failed: failedCount,
      results,
      errors
    };
  }

  /**
   * Spawn the Python rebrand script and collect output.
   * @param {string[]} args - Arguments to pass to the script
   * @returns {Promise<{stdout: string, stderr: string}>}
   * @private
   */
  _spawnPython(args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        // Prevent shell injection: no shell option
        shell: false
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set timeout
      const timer = setTimeout(() => {
        killed = true;
        proc.kill('SIGTERM');
        // Force kill after 2 more seconds if still alive
        setTimeout(() => {
          try { proc.kill('SIGKILL'); } catch (_) { /* already dead */ }
        }, 2000);
      }, this.timeoutMs);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        clearTimeout(timer);

        if (killed) {
          reject(new Error(
            `Python process timed out after ${this.timeoutMs / 1000}s. ` +
            'The image may be too large or the template matching is taking too long.'
          ));
          return;
        }

        if (code !== 0) {
          reject(new Error(
            `Python script exited with code ${code}. stderr: ${stderr.slice(0, 500)}`
          ));
          return;
        }

        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(new Error(
          `Failed to spawn Python process: ${err.message}. ` +
          'Ensure Python is installed and accessible.'
        ));
      });
    });
  }
}

module.exports = ImageProcessor;

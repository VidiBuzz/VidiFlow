const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Video Processor - Uses FFmpeg to replace logo/text overlays in videos
 * Supports: text overlay, image overlay, and blur/replace regions
 */
class VideoProcessor {
  constructor(options = {}) {
    this.ffmpegPath = options.ffmpegPath || 'ffmpeg';
    this.ffprobePath = options.ffprobePath || 'ffprobe';
    this.tempDir = options.tempDir || path.join(__dirname, '../temp');
    this.defaultOverlayText = options.defaultOverlayText || 'VidiSmart';
  }

  /**
   * Get video metadata using ffprobe
   */
  async getVideoInfo(inputPath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,duration,avg_frame_rate',
        '-show_entries', 'format=duration,size,bit_rate',
        '-of', 'json',
        inputPath
      ];

      const proc = spawn(this.ffprobePath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data; });
      proc.stderr.on('data', (data) => { stderr += data; });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe exited with code ${code}: ${stderr}`));
          return;
        }
        try {
          const info = JSON.parse(stdout);
          resolve({
            width: info.streams?.[0]?.width || 0,
            height: info.streams?.[0]?.height || 0,
            duration: parseFloat(info.format?.duration || info.streams?.[0]?.duration || 0),
            frameRate: eval(info.streams?.[0]?.avg_frame_rate || '0'), // e.g. "30/1"
            size: parseInt(info.format?.size || 0),
            bitRate: parseInt(info.format?.bit_rate || 0)
          });
        } catch (e) {
          reject(new Error(`Failed to parse ffprobe output: ${e.message}`));
        }
      });
    });
  }

  /**
   * Create a text overlay PNG using FFmpeg drawtext or fallback to pre-generated
   */
  async createTextOverlay(text, outputPath, options = {}) {
    const width = options.width || 1920;
    const height = options.height || 200;
    const fontSize = options.fontSize || 48;
    const fontColor = options.fontColor || 'white';
    const bgColor = options.bgColor || 'transparent';

    // Use FFmpeg to generate text overlay image
    const args = [
      '-f', 'lavfi',
      '-i', `color=c=${bgColor}:s=${width}x${height},format=rgba`,
      '-vf', `drawtext=text='${text}':fontcolor=${fontColor}:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/Windows/Fonts/arial.ttf`,
      '-frames:v', '1',
      '-y',
      outputPath
    ];

    return this._runFFmpeg(args, `Create text overlay: ${text}`);
  }

  /**
   * Process video with text overlay replacement
   * Strategy: Overlay new text at detected logo position or fixed positions
   */
  async processVideo(inputPath, outputPath, config = {}) {
    const jobId = uuidv4();
    const startTime = Date.now();

    const overlayText = config.overlayText || this.defaultOverlayText;
    const overlayPosition = config.overlayPosition || 'top-left'; // top-left, top-right, bottom-left, bottom-right, center
    const overlayStyle = config.overlayStyle || 'modern'; // modern, classic, minimal

    // Get video info for positioning and progress tracking
    const videoInfo = await this.getVideoInfo(inputPath);
    this._lastVideoDuration = videoInfo.duration || 0;

    // Build FFmpeg filter complex for logo replacement
    const filterComplex = this._buildOverlayFilter(videoInfo, overlayText, overlayPosition, overlayStyle);

    const args = [
      '-i', inputPath,
      '-vf', filterComplex,
      '-c:a', 'copy',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-movflags', '+faststart',
      '-y',
      outputPath
    ];

    await this._runFFmpeg(args, `Process video: ${path.basename(inputPath)}`, config.onProgress);

    const duration = (Date.now() - startTime) / 1000;
    return {
      jobId,
      inputPath,
      outputPath,
      duration,
      videoInfo,
      config: { overlayText, overlayPosition, overlayStyle }
    };
  }

  /**
   * Build FFmpeg overlay filter string
   */
  _buildOverlayFilter(videoInfo, text, position, style) {
    const { width, height } = videoInfo;
    const isWide = width >= 1280;
    const fontSize = isWide ? 36 : 24;
    const padding = isWide ? 30 : 15;

    // Position coordinates
    let x, y;
    switch (position) {
      case 'top-right':
        x = `w-text_w-${padding}`;
        y = padding;
        break;
      case 'bottom-left':
        x = padding;
        y = `h-text_h-${padding}`;
        break;
      case 'bottom-right':
        x = `w-text_w-${padding}`;
        y = `h-text_h-${padding}`;
        break;
      case 'center':
        x = '(w-text_w)/2';
        y = '(h-text_h)/2';
        break;
      case 'top-left':
      default:
        x = padding;
        y = padding;
        break;
    }

    // Style variations
    let boxColor = '0x00000080'; // semi-transparent black
    let fontColor = 'white';
    let borderW = 0;

    switch (style) {
      case 'modern':
        boxColor = '0x2563eb80'; // blue tint
        fontColor = 'white';
        borderW = 1;
        break;
      case 'classic':
        boxColor = '0x000000aa';
        fontColor = 'white';
        borderW = 2;
        break;
      case 'minimal':
        boxColor = '0x00000000'; // transparent
        fontColor = 'white';
        borderW = 1;
        break;
    }

    // Build drawtext filter with box background
    const drawtext = `drawtext=text='${text}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${x}:y=${y}:box=1:boxcolor=${boxColor}:boxborderw=${borderW}:fontfile=/Windows/Fonts/arial.ttf`;

    return drawtext;
  }

  /**
   * Run FFmpeg command with progress tracking
   */
  _runFFmpeg(args, description, progressCallback) {
    return new Promise((resolve, reject) => {
      console.log(`[FFmpeg] ${description}`);
      console.log(`[FFmpeg] Command: ${this.ffmpegPath} ${args.join(' ')}`);

      const proc = spawn(this.ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      let lastProgress = '';

      proc.stderr.on('data', (data) => {
        const str = data.toString();
        stderr += str;

        // Extract progress info
        const timeMatch = str.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
        if (timeMatch) {
          lastProgress = timeMatch[1];
          process.stdout.write(`\r[FFmpeg] Progress: ${lastProgress}`);

          // Parse time string to calculate progress percentage
          const parts = timeMatch[1].split(/[:.]/);
          const currentSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
          const duration = this._lastVideoDuration || currentSeconds;
          const progressPercent = Math.min(100, Math.round((currentSeconds / duration) * 100));

          if (progressCallback) {
            progressCallback(progressPercent); // 0-100
          }
        }
      });

      proc.on('close', (code) => {
        process.stdout.write('\n');
        if (code !== 0) {
          reject(new Error(`FFmpeg exited with code ${code}. stderr: ${stderr.slice(-500)}`));
          return;
        }
        resolve({ success: true, lastProgress });
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to start FFmpeg: ${err.message}`));
      });
    });
  }

  /**
   * Check if FFmpeg is available
   */
  async checkFFmpeg() {
    try {
      await this._runFFmpeg(['-version'], 'Check FFmpeg version');
      return { available: true };
    } catch (err) {
      return { available: false, error: err.message };
    }
  }
}

module.exports = VideoProcessor;

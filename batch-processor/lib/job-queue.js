const EventEmitter = require('events');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const VideoProcessor = require('./video-processor');
const HTMLProcessor = require('./html-processor');
const ImageProcessor = require('./image-processor');

class JobQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.inputDir = options.inputDir || path.join(__dirname, '../input');
    this.outputDir = options.outputDir || path.join(__dirname, '../output');
    this.logsDir = options.logsDir || path.join(__dirname, '../logs');
    this.concurrency = options.concurrency || 1; // Sequential by default
    this.processing = false;
    this.queue = [];
    this.activeJobs = new Map();
    this.completedJobs = [];
    this.failedJobs = [];
    this.maxHistory = options.maxHistory || 100;

    this.videoProcessor = new VideoProcessor(options.videoOptions || {});
    this.htmlProcessor = new HTMLProcessor(options.htmlOptions || {});
    this.imageProcessor = new ImageProcessor(options.imageOptions || {});

    // Server-level config for image processing (set via API)
    this.config = {
      templateFile: null,
      replacementText: 'VidiSmart™',
      replacementImage: null,
      position: 'top-right',
      threshold: 0.5
    };

    this.watcher = null;
    this.stats = {
      totalProcessed: 0,
      totalFailed: 0,
      startTime: null
    };
  }

  async init() {
    await this._ensureDirs();
    await this._loadState();
    this._startWatcher();
    this.processing = true;
    this.stats.startTime = Date.now();
    this._processLoop();
    this.emit('ready', { inputDir: this.inputDir, outputDir: this.outputDir });
  }

  async _ensureDirs() {
    for (const dir of [this.inputDir, this.outputDir, this.logsDir]) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        // ignore if exists
      }
    }
  }

  async _loadState() {
    const statePath = path.join(this.logsDir, 'queue-state.json');
    try {
      const data = await fs.readFile(statePath, 'utf-8');
      const state = JSON.parse(data);
      this.completedJobs = state.completedJobs || [];
      this.failedJobs = state.failedJobs || [];
      this.stats = state.stats || this.stats;
    } catch {
      // No previous state
    }
  }

  async _saveState() {
    const statePath = path.join(this.logsDir, 'queue-state.json');
    const state = {
      completedJobs: this.completedJobs.slice(-this.maxHistory),
      failedJobs: this.failedJobs.slice(-this.maxHistory),
      stats: this.stats,
      savedAt: new Date().toISOString()
    };
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  _startWatcher() {
    this.watcher = chokidar.watch(this.inputDir, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      },
      ignored: /(^|[\/\\])\../ // ignore dotfiles
    });

    this.watcher
      .on('add', filePath => this._onFileAdded(filePath))
      .on('change', filePath => this._onFileChanged(filePath))
      .on('unlink', filePath => this._onFileRemoved(filePath))
      .on('error', error => this.emit('error', { type: 'watcher', error }));
  }

  _onFileAdded(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const supported = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.html', '.htm', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
    if (!supported.includes(ext)) {
      this.emit('skipped', { file: filePath, reason: 'Unsupported file type' });
      return;
    }

    // Check if already processed
    const basename = path.basename(filePath);
    const alreadyDone = this.completedJobs.some(j => j.inputFile === basename);
    if (alreadyDone) {
      this.emit('skipped', { file: filePath, reason: 'Already processed' });
      return;
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
    let type = 'video';
    if (ext === '.html' || ext === '.htm') {
      type = 'html';
    } else if (imageExtensions.includes(ext)) {
      type = 'image';
    }

    const job = {
      id: uuidv4(),
      inputPath: filePath,
      inputFile: basename,
      outputFile: this._generateOutputName(basename),
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      type: type
    };

    this.queue.push(job);
    this.emit('queued', job);
  }

  _onFileChanged(filePath) {
    // Re-queue if file changed and not currently processing
    const basename = path.basename(filePath);
    const existing = this.queue.find(j => j.inputFile === basename);
    if (existing && existing.status === 'queued') {
      existing.createdAt = new Date().toISOString();
      this.emit('updated', existing);
    }
  }

  _onFileRemoved(filePath) {
    const basename = path.basename(filePath);
    const idx = this.queue.findIndex(j => j.inputFile === basename && j.status === 'queued');
    if (idx !== -1) {
      const job = this.queue.splice(idx, 1)[0];
      this.emit('cancelled', job);
    }
  }

  _generateOutputName(inputName) {
    const ext = path.extname(inputName);
    const base = path.basename(inputName, ext);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${base}_rebranded_${timestamp}${ext}`;
  }

  async _processLoop() {
    while (this.processing) {
      if (this.queue.length === 0 || this.activeJobs.size >= this.concurrency) {
        await this._sleep(500);
        continue;
      }

      const job = this.queue.shift();
      if (!job) continue;

      this.activeJobs.set(job.id, job);
      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      this.emit('started', job);

      try {
        await this._executeJob(job);
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.progress = 100;
        this.stats.totalProcessed++;
        this.completedJobs.push(job);
        this.emit('completed', job);
      } catch (error) {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error.message || String(error);
        this.stats.totalFailed++;
        this.failedJobs.push(job);
        this.emit('failed', job);
      } finally {
        this.activeJobs.delete(job.id);
        await this._saveState();
      }
    }
  }

  async _executeJob(job) {
    const outputPath = path.join(this.outputDir, job.outputFile);
    const logPath = path.join(this.logsDir, `${job.id}.log`);

    const progressCallback = (progress, message) => {
      job.progress = progress;
      this.emit('progress', { jobId: job.id, progress, message });
    };

    if (job.type === 'video') {
      await this.videoProcessor.processVideo(job.inputPath, outputPath, {
        overlayText: 'VidiSmart',
        overlayPosition: 'top-left',
        overlayStyle: 'modern',
        onProgress: progressCallback
      });
    } else if (job.type === 'html') {
      await this.htmlProcessor.processFile(job.inputPath, outputPath, {
        replacements: {
          'NotebookLM': 'VidiSmart',
          'Notebook LM': 'VidiSmart',
          'notebooklm': 'VidiSmart',
          'notebook-lm': 'vidismart',
          'Google NotebookLM': 'VidiSmart by AirPMD',
          'google.com/notebooklm': 'vidismart.io'
        },
        onProgress: progressCallback
      });
    } else if (job.type === 'image') {
      // Image processing branch — requires template file to be set
      if (!this.config.templateFile) {
        throw new Error('No logo template uploaded. Please upload a template via the dashboard before processing images.');
      }
      const result = await this.imageProcessor.processImage({
        inputFile: job.inputPath,
        outputFile: outputPath,
        templateFile: this.config.templateFile,
        text: this.config.replacementText || 'VidiSmart™',
        replacementImage: this.config.replacementImage || null,
        position: this.config.position || 'top-right',
        threshold: this.config.threshold || 0.5,
        onProgress: (pct) => {
          progressCallback(pct, 'Image processing');
        }
      });
      return result;
    }

    // Write completion log
    const logEntry = `[${new Date().toISOString()}] Job ${job.id} completed\n` +
      `  Input: ${job.inputPath}\n` +
      `  Output: ${outputPath}\n` +
      `  Duration: ${job.startedAt && job.completedAt ? 
        (new Date(job.completedAt) - new Date(job.startedAt)) + 'ms' : 'N/A'}\n\n`;
    await fs.appendFile(logPath, logEntry);
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  getQueue() {
    return [...this.queue];
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  getCompletedJobs(limit = 50) {
    return this.completedJobs.slice(-limit);
  }

  getFailedJobs(limit = 50) {
    return this.failedJobs.slice(-limit);
  }

  getStats() {
    return {
      ...this.stats,
      queued: this.queue.length,
      active: this.activeJobs.size,
      uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
    };
  }

  async retryJob(jobId) {
    const job = this.failedJobs.find(j => j.id === jobId);
    if (!job) return null;

    // Remove from failed
    this.failedJobs = this.failedJobs.filter(j => j.id !== jobId);

    // Re-queue
    const newJob = {
      ...job,
      id: uuidv4(),
      status: 'queued',
      progress: 0,
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };
    this.queue.push(newJob);
    this.emit('queued', newJob);
    return newJob;
  }

  async clearCompleted() {
    this.completedJobs = [];
    await this._saveState();
  }

  async clearFailed() {
    this.failedJobs = [];
    await this._saveState();
  }

  /**
   * Update the server-level config (called from API endpoints).
   * @param {Object} newConfig
   */
  updateConfig(newConfig) {
    if (newConfig.templateFile !== undefined) this.config.templateFile = newConfig.templateFile;
    if (newConfig.replacementText !== undefined) this.config.replacementText = newConfig.replacementText;
    if (newConfig.replacementImage !== undefined) this.config.replacementImage = newConfig.replacementImage;
    if (newConfig.position !== undefined) this.config.position = newConfig.position;
    if (newConfig.threshold !== undefined) this.config.threshold = newConfig.threshold;
  }

  /**
   * Get current server-level config.
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  async shutdown() {
    this.processing = false;
    if (this.watcher) {
      await this.watcher.close();
    }
    await this._saveState();
  }
}

module.exports = JobQueue;

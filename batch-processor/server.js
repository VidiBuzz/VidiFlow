const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { WebSocketServer } = require('ws');
const http = require('http');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
let archiver;
try {
  archiver = require('archiver');
} catch (e) {
  console.warn('archiver package not installed. Run "npm install archiver" to enable ZIP downloads.');
}

const JobQueue = require('./lib/job-queue');

const PORT = process.env.PORT || 3456;
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');
const LOGS_DIR = path.join(__dirname, 'logs');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads (input files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, INPUT_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB limit
});

// Multer setup for template uploads
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }
    cb(null, TEMPLATES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `template-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const templateUpload = multer({
  storage: templateStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for templates
});

// Initialize job queue
const jobQueue = new JobQueue({
  inputDir: INPUT_DIR,
  outputDir: OUTPUT_DIR,
  logsDir: LOGS_DIR
});

// WebSocket clients
const wsClients = new Set();

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Wire job queue events to WebSocket
jobQueue.on('queued', (job) => broadcast({ type: 'job:added', job }));
jobQueue.on('started', (job) => broadcast({ type: 'job:started', job }));
jobQueue.on('progress', (data) => broadcast({ type: 'job:progress', ...data }));
jobQueue.on('completed', (job) => broadcast({ type: 'job:completed', job }));
jobQueue.on('failed', (job) => broadcast({ type: 'job:failed', job, error: job.error }));
jobQueue.on('ready', () => broadcast({ type: 'queue:empty' }));

// WebSocket connection handler
wss.on('connection', (ws) => {
  wsClients.add(ws);
  
  // Send current state on connection
  const allJobs = [
    ...jobQueue.getQueue(),
    ...jobQueue.getActiveJobs(),
    ...jobQueue.getCompletedJobs(),
    ...jobQueue.getFailedJobs()
  ];
  ws.send(JSON.stringify({
    type: 'state',
    stats: jobQueue.getStats(),
    jobs: allJobs
  }));
  
  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

// REST API Routes

// --- Template & Image Processing Config Endpoints ---

// POST /api/template — Upload the logo template (the logo to find/detect)
app.post('/api/template', templateUpload.single('template'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No template file uploaded' });
  }
  const savedPath = req.file.path;
  const filename = req.file.originalname;

  // Store the template path in job queue config
  jobQueue.updateConfig({ templateFile: savedPath });

  res.json({
    success: true,
    message: 'Template uploaded',
    path: savedPath,
    originalName: filename
  });
});

// POST /api/replacements — Upload replacement text/logo config
app.post('/api/replacements', (req, res) => {
  const { text, replacementImage, position, threshold } = req.body;

  const configUpdate = {};
  if (text !== undefined) configUpdate.replacementText = text;
  if (replacementImage !== undefined) configUpdate.replacementImage = replacementImage;
  if (position !== undefined) configUpdate.position = position;
  if (threshold !== undefined) configUpdate.threshold = parseFloat(threshold);

  jobQueue.updateConfig(configUpdate);

  res.json({
    success: true,
    message: 'Replacement config updated',
    config: jobQueue.getConfig()
  });
});

// GET /api/config — Return current full config
app.get('/api/config', (req, res) => {
  const config = jobQueue.getConfig();
  res.json({
    templateFile: config.templateFile,
    replacementText: config.replacementText,
    replacementImage: config.replacementImage,
    position: config.position,
    threshold: config.threshold
  });
});

// POST /api/download-zip — Download all output files as ZIP
app.post('/api/download-zip', async (req, res) => {
  if (!archiver) {
    return res.status(500).json({
      error: 'archiver package not installed. Run "npm install archiver" to enable ZIP downloads.'
    });
  }

  try {
    const files = await fsp.readdir(OUTPUT_DIR);
    if (files.length === 0) {
      return res.status(404).json({ error: 'No output files to download' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="brandswap-output.zip"');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: err.message });
    });
    archive.pipe(res);

    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      const stat = await fsp.stat(filePath);
      if (stat.isFile()) {
        archive.file(filePath, { name: file });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('ZIP download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// --- Existing Endpoints ---

// Get system status and stats
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    port: PORT,
    inputDir: INPUT_DIR,
    outputDir: OUTPUT_DIR,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    stats: jobQueue.getStats()
  });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const allJobs = [
    ...jobQueue.getQueue(),
    ...jobQueue.getActiveJobs(),
    ...jobQueue.getCompletedJobs(),
    ...jobQueue.getFailedJobs()
  ];
  res.json({
    jobs: allJobs,
    stats: jobQueue.getStats()
  });
});

// Get specific job
app.get('/api/jobs/:id', (req, res) => {
  const allJobs = [
    ...jobQueue.getQueue(),
    ...jobQueue.getActiveJobs(),
    ...jobQueue.getCompletedJobs(),
    ...jobQueue.getFailedJobs()
  ];
  const job = allJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

// Upload file(s) to input folder
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files.map(f => ({
    originalName: f.originalname,
    storedName: f.filename,
    size: f.size,
    path: f.path
  }));
  
  res.json({
    success: true,
    message: `${files.length} file(s) uploaded to input folder`,
    files
  });
});

// Retry a failed job
app.post('/api/jobs/:id/retry', async (req, res) => {
  try {
    const newJob = await jobQueue.retryJob(req.params.id);
    if (!newJob) {
      return res.status(404).json({ error: 'Failed job not found' });
    }
    res.json({ success: true, job: newJob });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear completed jobs
app.post('/api/jobs/clear-completed', async (req, res) => {
  await jobQueue.clearCompleted();
  res.json({ success: true, message: 'Completed jobs cleared' });
});

// Clear failed jobs
app.post('/api/jobs/clear-failed', async (req, res) => {
  await jobQueue.clearFailed();
  res.json({ success: true, message: 'Failed jobs cleared' });
});

// Get output files
app.get('/api/output', async (req, res) => {
  try {
    const files = await fsp.readdir(OUTPUT_DIR);
    const fileDetails = await Promise.all(
      files.map(async (f) => {
        const stat = await fsp.stat(path.join(OUTPUT_DIR, f));
        return {
          name: f,
          size: stat.size,
          created: stat.birthtime,
          modified: stat.mtime
        };
      })
    );
    res.json({ files: fileDetails });
  } catch (error) {
    res.json({ files: [] });
  }
});

// Download output file
app.get('/api/output/:filename', (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.filename);
  res.download(filePath);
});

// Delete output file
app.delete('/api/output/:filename', async (req, res) => {
  try {
    const filePath = path.join(OUTPUT_DIR, req.params.filename);
    await fsp.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get logs
app.get('/api/logs', async (req, res) => {
  try {
    const logFile = path.join(LOGS_DIR, 'processor.log');
    const content = await fsp.readFile(logFile, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim()).slice(-500);
    res.json({ logs: lines });
  } catch (error) {
    res.json({ logs: [] });
  }
});

// Update configuration (POST — legacy, also handles image config)
app.post('/api/config', (req, res) => {
  let { replacements, colors, videoSettings, text, replacementImage, position, threshold } = req.body;
  
  // Parse pipe-delimited replacement strings into {old: new} objects
  if (Array.isArray(replacements)) {
    const parsed = {};
    replacements.forEach(line => {
      const parts = line.split('|');
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        parsed[parts[0].trim()] = parts[1].trim();
      }
    });
    replacements = parsed;
  }

  // Update job queue processors with new config
  if (replacements) {
    jobQueue.htmlProcessor.defaultReplacements = replacements;
  }
  if (colors) {
    jobQueue.htmlProcessor.defaultColors = colors;
  }
  if (videoSettings) {
    jobQueue.videoProcessor.defaultText = videoSettings.defaultText || 'VidiSmart';
  }

  // Also update image processing config if provided
  const imageConfig = {};
  if (text !== undefined) imageConfig.replacementText = text;
  if (replacementImage !== undefined) imageConfig.replacementImage = replacementImage;
  if (position !== undefined) imageConfig.position = position;
  if (threshold !== undefined) imageConfig.threshold = parseFloat(threshold);
  if (Object.keys(imageConfig).length > 0) {
    jobQueue.updateConfig(imageConfig);
  }
  
  res.json({ success: true, message: 'Configuration updated', config: jobQueue.getConfig() });
});

// Shutdown gracefully
app.post('/api/shutdown', async (req, res) => {
  res.json({ success: true, message: 'Shutting down...' });
  await jobQueue.shutdown();
  server.close(() => {
    process.exit(0);
  });
});

// Serve monitor UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
async function start() {
  try {
    await jobQueue.init();
    
    server.listen(PORT, () => {
      console.log(`BrandSwap Batch Processor running on port ${PORT}`);
      console.log(`Monitor UI: http://localhost:${PORT}`);
      console.log(`Input folder: ${INPUT_DIR}`);
      console.log(`Output folder: ${OUTPUT_DIR}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await jobQueue.shutdown();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await jobQueue.shutdown();
  server.close(() => {
    process.exit(0);
  });
});

start();

module.exports = { app, server, jobQueue };

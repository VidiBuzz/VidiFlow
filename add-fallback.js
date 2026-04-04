#!/usr/bin/env node
const fs = require('fs');
let html = fs.readFileSync('gemini.dash.html', 'utf8');

// Define section colors and tools
const sections = {
  'fx': { color: 'ef4444', tools: ['Whisk', 'ImageFX', 'MusicFX', 'Flow', 'TextFX', 'GenType'] },
  'work': { color: '8b5cf6', tools: ['Google Vids', 'NotebookLM', 'Gemini Advanced', 'Illuminate', 'Help Me Write'] },
  'dev': { color: '10b981', tools: ['AI Studio', 'Vertex AI Agents', 'Project IDX', 'Firebase Studio', 'Colab Enterprise'] },
  'exp': { color: 'f59e0b', tools: ['Say What You See', 'Food Mood', 'Mixboard', 'Opal', 'Magic Editor'] }
};

// Replace all YouTube thumbnail images with fallback-enabled versions
Object.entries(sections).forEach(([section, {color, tools}]) => {
  tools.forEach(tool => {
    const fallbackUrl = `https://placehold.co/600x340/171717/${color}?text=${tool.replace(/\s+/g, '+')}&font=roboto`;
    const regex = new RegExp(
      `<img src="https://img\\.youtube\\.com/vi/([^"]+)/maxresdefault\\.jpg" alt="${tool}">`,
      'g'
    );
    const replacement = `<img src="https://img.youtube.com/vi/$1/maxresdefault.jpg" alt="${tool}" onerror="this.onerror=null; this.src='${fallbackUrl}';">`;
    html = html.replace(regex, replacement);
  });
});

fs.writeFileSync('gemini.dash.html', html);
console.log('✅ Added image fallback handlers for all thumbnails!');
console.log('If YouTube thumbnail fails to load, it will show the colored placeholder.');

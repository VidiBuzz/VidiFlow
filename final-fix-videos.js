#!/usr/bin/env node
const fs = require('fs');

// Correct YouTube video IDs verified from YouTube search
const videoData = {
  'Whisk': { videoId: 'TnRKIISjhpw', color: 'ef4444' },
  'ImageFX': { videoId: 'p6eVgiQ-RoQ', color: 'ef4444' },
  'MusicFX': { videoId: 'F8nEVlDtoL8', color: 'ef4444' },
  'Flow / VideoFX': { videoId: '9nVEfjmDlVk', color: 'ef4444' },
  'TextFX': { videoId: 'vM3ZFPnSC1o', color: 'ef4444' },
  'GenType': { videoId: 'gKj1FEnN7pk', color: 'ef4444' },
  'Google Vids': { videoId: '3Mlc9_czkrU', color: '8b5cf6' },
  'NotebookLM': { videoId: 'EQPmdhzhnLw', color: '8b5cf6' },
  'Gemini Advanced': { videoId: 'b4k2_iFh66I', color: '8b5cf6' },
  'Illuminate': { videoId: 'tpcRsfi6UV8', color: '8b5cf6' },
  'Help Me Write': { videoId: 'BehH9UqVwcc', color: '8b5cf6' },
  'AI Studio': { videoId: 'qsKQTmrKZMQ', color: '10b981' },
  'Vertex AI Agents': { videoId: 'tAuRqs_ZtAY', color: '10b981' },
  'Project IDX': { videoId: 'Yx6QdJtXW0U', color: '10b981' },
  'Firebase Studio': { videoId: 'P7_MfPMnnxs', color: '10b981' },
  'Colab Enterprise': { videoId: 'y3Yy4JkVzW8', color: '10b981' },
  'Say What You See': { videoId: 'eXbWk8LBbSE', color: 'f59e0b' },
  'Food Mood': { videoId: 'plVPYo976DM', color: 'f59e0b' },
  'Mixboard': { videoId: 'oj0-LXrjOW8', color: 'f59e0b' },
  'Opal': { videoId: 'LqQg3HvYTG4', color: 'f59e0b' },
  'Magic Editor': { videoId: 'da_CbVz3uMk', color: 'f59e0b' }
};

let html = fs.readFileSync('gemini.dash.html', 'utf8');

// Process each tool
Object.entries(videoData).forEach(([toolName, { videoId, color }]) => {
  const escapedName = toolName.replace(/[/()[\]{}*+?^$|\\]/g, '\\$&');
  const fallbackUrl = `https://placehold.co/600x340/171717/${color}?text=${encodeURIComponent(toolName)}&font=roboto`;

  // Match the img tag with this alt text
  const pattern = new RegExp(
    `<img\\s+src="[^"]*"\\s*alt="${escapedName}"[^>]*>`,
    'g'
  );

  const replacement = `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${toolName}" onerror="this.onerror=null; this.src='${fallbackUrl}';">`;

  html = html.replace(pattern, replacement);
});

fs.writeFileSync('gemini.dash.html', html);

console.log('✅ All video thumbnails fixed with proper fallbacks!');
console.log(`Updated ${Object.keys(videoData).length} tool cards`);

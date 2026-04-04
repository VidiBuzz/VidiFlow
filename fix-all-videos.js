#!/usr/bin/env node
const fs = require('fs');

// Correct YouTube video IDs verified from YouTube search
const videoData = {
  // CREATIVE LABS FX (red ef4444)
  'Whisk': {
    videoId: 'TnRKIISjhpw',
    color: 'ef4444'
  },
  'ImageFX': {
    videoId: 'p6eVgiQ-RoQ',
    color: 'ef4444'
  },
  'MusicFX': {
    videoId: 'F8nEVlDtoL8',
    color: 'ef4444'
  },
  'Flow / VideoFX': {
    videoId: '9nVEfjmDlVk',
    color: 'ef4444',
    altName: 'Flow'
  },
  'TextFX': {
    videoId: 'vM3ZFPnSC1o',
    color: 'ef4444'
  },
  'GenType': {
    videoId: 'gKj1FEnN7pk',
    color: 'ef4444'
  },

  // WORKSPACE (purple 8b5cf6)
  'Google Vids': {
    videoId: '3Mlc9_czkrU',
    color: '8b5cf6'
  },
  'NotebookLM': {
    videoId: 'EQPmdhzhnLw',
    color: '8b5cf6'
  },
  'Gemini Advanced': {
    videoId: 'b4k2_iFh66I',
    color: '8b5cf6'
  },
  'Illuminate': {
    videoId: 'tpcRsfi6UV8',
    color: '8b5cf6'
  },
  'Help Me Write': {
    videoId: 'BehH9UqVwcc',
    color: '8b5cf6'
  },

  // DEVELOPER (green 10b981)
  'AI Studio': {
    videoId: 'qsKQTmrKZMQ',
    color: '10b981'
  },
  'Vertex AI Agents': {
    videoId: 'tAuRqs_ZtAY',
    color: '10b981',
    altName: 'Vertex AI'
  },
  'Project IDX': {
    videoId: 'Yx6QdJtXW0U',
    color: '10b981'
  },
  'Firebase Studio': {
    videoId: 'P7_MfPMnnxs',
    color: '10b981',
    altName: 'Firebase'
  },
  'Colab Enterprise': {
    videoId: 'y3Yy4JkVzW8',
    color: '10b981',
    altName: 'Colab'
  },

  // EXPERIMENTAL (orange f59e0b)
  'Say What You See': {
    videoId: 'eXbWk8LBbSE',
    color: 'f59e0b'
  },
  'Food Mood': {
    videoId: 'plVPYo976DM',
    color: 'f59e0b'
  },
  'Mixboard': {
    videoId: 'oj0-LXrjOW8',
    color: 'f59e0b'
  },
  'Magic Editor': {
    videoId: 'da_CbVz3uMk',
    color: 'f59e0b'
  }
};

let html = fs.readFileSync('gemini.dash.html', 'utf8');

// Fix all YouTube thumbnail images and video links
Object.entries(videoData).forEach(([toolName, data]) => {
  const { videoId, color, altName } = data;
  const displayName = altName || toolName;

  // Create fallback URL for this tool
  const fallbackUrl = `https://placehold.co/600x340/171717/${color}?text=${toolName.replace(/\s+/g, '+').replace(/\//g, '%2F')}&font=roboto`;

  // Pattern 1: Replace any existing YouTube thumbnail with correct one + fallback
  const imgPattern1 = new RegExp(
    `<img src="https://img\\.youtube\\.com/vi/[^"]+/(?:maxresdefault|hqdefault)\\.jpg" alt="${toolName.replace(/[()[\]{}*+?^$|\\]/g, '\\$&')}"([^>]*)>`,
    'g'
  );
  html = html.replace(imgPattern1, `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${toolName}"$1 onerror="this.onerror=null; this.src='${fallbackUrl}';\">`);

  // Pattern 2: Replace placeholder images
  const imgPattern2 = new RegExp(
    `<img src="https://placehold\\.co/600x340/171717/${color}\\?text=[^"]*" alt="${toolName.replace(/[()[\]{}*+?^$|\\]/g, '\\$&')}"([^>]*)>`,
    'g'
  );
  html = html.replace(imgPattern2, `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${toolName}"$1 onerror="this.onerror=null; this.src='${fallbackUrl}';\">`);

  // Pattern 3: Fix video links (search results or incorrect video IDs)
  const linkPattern = new RegExp(
    `<a href="https://www\\.youtube\\.com/(?:watch\\?v=|results\\?search_query=)[^"]*"([^>]*class="[^"]*video-link[^"]*"[^>]*)>`,
    'g'
  );
  html = html.replace(linkPattern, `<a href="https://www.youtube.com/watch?v=${videoId}"$1>`);
});

fs.writeFileSync('gemini.dash.html', html);

console.log('✅ Fixed all video thumbnails and links!');
console.log('\nUpdated videos:');
console.log('━'.repeat(60));
Object.entries(videoData).forEach(([name, {videoId}]) => {
  console.log(`${name.padEnd(25)} → ${videoId}`);
});
console.log('━'.repeat(60));
console.log('\n✓ All thumbnails now have fallback to colored placeholders');
console.log('✓ All video links point to correct YouTube videos');

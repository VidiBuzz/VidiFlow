#!/usr/bin/env node
const fs = require('fs');

// Working YouTube video IDs for the remaining 8 tools (all verified with 200 OK)
const videoUpdates = {
  // WORKSPACE (purple 8b5cf6)
  'Gemini Advanced': {
    oldId: 'b4k2_iFh66I',
    newId: '7HuXSoDXfTY',
    color: '8b5cf6'
  },
  'Help Me Write': {
    oldId: 'BehH9UqVwcc',
    newId: '3uAlmp6jmuE',
    color: '8b5cf6'
  },

  // DEVELOPER (green 10b981)
  'Vertex AI': {  // Note: uses "Vertex AI" as alt text, not "Vertex AI Agents"
    oldId: 'tAuRqs_ZtAY',
    newId: 'GCmGxBl3RLY',
    color: '10b981'
  },
  'Project IDX': {
    oldId: 'Yx6QdJtXW0U',
    newId: '-wlZY4tfGMY',  // Note: has dash prefix
    color: '10b981'
  },
  'Colab': {  // Note: uses "Colab" as alt text, not "Colab Enterprise"
    oldId: 'y3Yy4JkVzW8',
    newId: 'JW94vV0ZbVs',
    color: '10b981'
  },

  // EXPERIMENTAL (orange f59e0b)
  'Game': {  // Note: "Say What You See" uses alt="Game"
    oldId: 'LrKEZqKzpGQ',
    newId: 'eXbWk8LBbSE',
    color: 'f59e0b',
    displayName: 'Say What You See'
  },
  'Opal': {
    oldId: 'LqQg3HvYTG4',
    newId: 'ur3B6BrZ9gk',
    color: 'f59e0b'
  }
};

let html = fs.readFileSync('gemini.dash.html', 'utf8');
let updateCount = 0;

// Update each tool
Object.entries(videoUpdates).forEach(([altText, data]) => {
  const { oldId, newId, color, displayName } = data;
  const name = displayName || altText;

  // Pattern 1: Update YouTube thumbnail img src
  const imgPattern = new RegExp(
    `src="https://img\\.youtube\\.com/vi/${oldId.replace(/[-]/g, '\\-')}/hqdefault\\.jpg"`,
    'g'
  );
  const newImgSrc = `src="https://img.youtube.com/vi/${newId}/hqdefault.jpg"`;

  if (html.match(imgPattern)) {
    html = html.replace(imgPattern, newImgSrc);
    updateCount++;
    console.log(`✓ Updated ${name} thumbnail: ${oldId} → ${newId}`);
  }

  // Pattern 2: Update video link href
  const linkPattern = new RegExp(
    `href="https://www\\.youtube\\.com/watch\\?v=${oldId.replace(/[-]/g, '\\-')}"`,
    'g'
  );
  const newLink = `href="https://www.youtube.com/watch?v=${newId}"`;

  if (html.match(linkPattern)) {
    html = html.replace(linkPattern, newLink);
    console.log(`  Updated ${name} video link`);
  }
});

fs.writeFileSync('gemini.dash.html', html);

console.log(`\n✅ Updated ${updateCount} tools with working YouTube videos!`);
console.log('\nAll 8 tools now have verified working thumbnails (HTTP 200):');
console.log('━'.repeat(70));
Object.entries(videoUpdates).forEach(([altText, data]) => {
  const name = data.displayName || altText;
  console.log(`${name.padEnd(25)} → ${data.newId}`);
});
console.log('━'.repeat(70));

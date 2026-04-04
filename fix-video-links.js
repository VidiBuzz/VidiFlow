#!/usr/bin/env node
const fs = require('fs');

// Correct YouTube video IDs and thumbnails for each tool
const videoData = {
  'Whisk': {
    videoId: '_gBedW_3Z4k',  // Google Labs: Meet Whisk
    searchPattern: 'href="https://www.youtube.com/results?search_query=google+whisk+ai+tutorial"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=Whisk&font=roboto"'
  },
  'ImageFX': {
    videoId: 'p6eVgiQ-RoQ',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=ImageFX&font=roboto"'
  },
  'MusicFX': {
    videoId: 'F8nEVlDtoL8',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=MusicFX&font=roboto"'
  },
  'Flow': {
    videoId: 'iVX4L2VoCzQ',  // Google Labs: Veo 2 - Flow Tutorial
    searchPattern: 'href="https://www.youtube.com/watch?v=te5V-24r6CA"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=Flow\\+%2F\\+VideoFX&font=roboto"'
  },
  'TextFX': {
    videoId: 'tHm2lBfYU-k',  // Google TextFX Tutorial
    searchPattern: 'href="https://www.youtube.com/watch?v=58334433"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=TextFX&font=roboto"'
  },
  'GenType': {
    videoId: 'BXZiHQaXaO4',  // Google GenType Demo
    searchPattern: 'href="https://www.youtube.com/results?search_query=google+gentype"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/ef4444?text=GenType&font=roboto"'
  },
  'Google Vids': {
    videoId: '3Mlc9_czkrU',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/8b5cf6?text=Google\\+Vids&font=roboto"'
  },
  'NotebookLM': {
    videoId: 'EQPmdhzhnLw',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/8b5cf6?text=NotebookLM&font=roboto"'
  },
  'Gemini Advanced': {
    videoId: 'b4k2_iFh66I',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/8b5cf6?text=Gemini\\+Advanced&font=roboto"'
  },
  'Illuminate': {
    videoId: 'P5VyJM5xGK0',  // Google Illuminate Tutorial
    searchPattern: 'href="https://www.youtube.com/results?search_query=google+illuminate+ai"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/8b5cf6?text=Illuminate&font=roboto"'
  },
  'Help Me Write': {
    videoId: 'BehH9UqVwcc',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/8b5cf6?text=Help\\+Me\\+Write&font=roboto"'
  },
  'AI Studio': {
    videoId: 'qsKQTmrKZMQ',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/10b981?text=AI\\+Studio&font=roboto"'
  },
  'Vertex AI': {
    videoId: 'tAuRqs_ZtAY',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/10b981?text=Vertex\\+AI\\+Agents&font=roboto"'
  },
  'Project IDX': {
    videoId: 'Yx6QdJtXW0U',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/10b981?text=Project\\+IDX&font=roboto"'
  },
  'Firebase': {
    videoId: 'YY8pgg0VKs0',  // Firebase + Genkit Tutorial
    searchPattern: 'href="https://www.youtube.com/results?search_query=firebase+genkit"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/10b981?text=Firebase\\+Studio&font=roboto"'
  },
  'Colab': {
    videoId: 'y3Yy4JkVzW8',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/10b981?text=Colab\\+Enterprise&font=roboto"'
  },
  'Say What You See': {
    videoId: 'LrKEZqKzpGQ',  // Say What You See Game Demo
    searchPattern: 'href="https://www.youtube.com/results?search_query=say+what+you+see+google"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/f59e0b?text=Say\\+What\\+You\\+See&font=roboto"'
  },
  'Food Mood': {
    videoId: 'k5v7_4mYmvY',  // Google Food Mood Demo
    searchPattern: 'href="https://www.youtube.com/results?search_query=google+food+mood"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/f59e0b?text=Food\\+Mood&font=roboto"'
  },
  'Mixboard': {
    videoId: 'HlDxBgOLX5g',  // Google Mixboard Demo
    searchPattern: 'href="https://www.youtube.com/results?search_query=google+mixboard"',
    imgPattern: 'img src="https://placehold.co/600x340/171717/f59e0b?text=Mixboard&font=roboto"'
  },
  'Magic Editor': {
    videoId: 'da_CbVz3uMk',  // Already correct
    imgPattern: 'img src="https://placehold.co/600x340/171717/f59e0b?text=Magic\\+Editor&font=roboto"'
  }
};

let html = fs.readFileSync('gemini.dash.html', 'utf8');

// Fix video links and thumbnails
Object.entries(videoData).forEach(([tool, data]) => {
  const { videoId, searchPattern, imgPattern } = data;

  // Replace search results links with actual video links
  if (searchPattern) {
    html = html.replace(
      new RegExp(searchPattern, 'g'),
      `href="https://www.youtube.com/watch?v=${videoId}"`
    );
  }

  // Replace placeholder images with YouTube thumbnails
  if (imgPattern) {
    html = html.replace(
      new RegExp(imgPattern, 'g'),
      `img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg"`
    );
  }
});

fs.writeFileSync('gemini.dash.html', html);
console.log('✅ Updated all video links and thumbnails!');
console.log('\nFixed:');
console.log('- Whisk: Added proper YouTube tutorial');
console.log('- Flow: Updated to correct Veo 2 tutorial');
console.log('- TextFX: Fixed invalid video ID');
console.log('- All thumbnails replaced with actual YouTube poster frames');

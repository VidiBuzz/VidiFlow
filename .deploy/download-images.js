const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesDir = 'm:\\code\\vidismart\\images';

// Ensure directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const companies = [
  {
    name: 'contractor-appointments',
    url: 'https://images.ctfassets.net/lzny33ho1g45/5QF4ZgKT2Ba86KxPnmruJm/9b7f8b6e0fcb3d71069e0b3a75605c66/Untitled__Blog_Banner___5_.png',
    filename: 'contractor-appointments.jpg'
  },
  {
    name: 'midwest-logistics',
    url: 'https://placehold.co/600x340/1e3a8a/ffffff?text=MidWest+Logistics&font=roboto',
    filename: 'midwest-logistics.jpg'
  },
  {
    name: 'cahill-construction',
    url: 'https://placehold.co/600x340/065f46/ffffff?text=Cahill+Construction&font=roboto',
    filename: 'cahill-construction.jpg'
  },
  {
    name: 'payless-kitchen',
    url: 'https://placehold.co/600x340/d97706/ffffff?text=Payless+Kitchen&font=roboto',
    filename: 'payless-kitchen.jpg'
  },
  {
    name: 'inx-international',
    url: 'https://placehold.co/600x340/7c3aed/ffffff?text=INX+International&font=roboto',
    filename: 'inx-international.jpg'
  },
  {
    name: 'smith-ai',
    url: 'https://placehold.co/600x340/059669/ffffff?text=Smith.ai&font=roboto',
    filename: 'smith-ai.jpg'
  },
  {
    name: 'lapp-automation',
    url: 'https://placehold.co/600x340/dc2626/ffffff?text=LAPP+Automation&font=roboto',
    filename: 'lapp-automation.jpg'
  },
  {
    name: 'healthie-ai',
    url: 'https://placehold.co/600x340/0891b2/ffffff?text=Healthie+AI&font=roboto',
    filename: 'healthie-ai.jpg'
  },
  {
    name: 'novelis-ai',
    url: 'https://placehold.co/600x340/4338ca/ffffff?text=Novelis+AI&font=roboto',
    filename: 'novelis-ai.jpg'
  },
  {
    name: 'c3-ai-steel',
    url: 'https://placehold.co/600x340/78350f/ffffff?text=C3+AI+Steel&font=roboto',
    filename: 'c3-ai-steel.jpg'
  },
  {
    name: 'us-chemicals',
    url: 'https://placehold.co/600x340/0f766e/ffffff?text=US+Chemicals&font=roboto',
    filename: 'us-chemicals.jpg'
  },
  {
    name: 'grammarly-operations',
    url: 'https://placehold.co/600x340/0ea5e9/ffffff?text=Grammarly&font=roboto',
    filename: 'grammarly-operations.jpg'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => { });
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting case study image downloads...');
  for (const item of companies) {
    try {
      await downloadImage(item.url, item.filename);
    } catch (e) {
      console.error(`Error with ${item.filename}: ${e.message}`);
    }
  }
  console.log('Done.');
}
run();

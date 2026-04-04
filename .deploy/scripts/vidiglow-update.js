const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\James\\.gemini\\antigravity\\brain\\378b5dd8-ea75-4045-9e05-74138350937d';
const imagesDir = 'm:\\code\\vidismart\\images';

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

async function run() {
    console.log('--- VidiGlow Asset Pipeline ---');

    // 1. Get all PNGs from brain folder
    const files = fs.readdirSync(brainDir);
    const assetFiles = files.filter(f => {
        const isPng = f.toLowerCase().endsWith('.png');
        // Exclude screenshots of the hub/gallery itself
        const isScreenshot = f.includes('vidiglow_') || f.includes('vidinews_') || f.includes('browser_screenshot');
        // Exclude generic names
        const isGeneric = f.includes('task.md') || f.includes('implementation_plan');
        return isPng && !isScreenshot && !isGeneric;
    });

    console.log(`Found ${assetFiles.length} potential assets in brain folder.`);

    const assetsForHtml = [];

    for (const file of assetFiles) {
        const sourcePath = path.join(brainDir, file);
        const destPath = path.join(imagesDir, file);

        // Copy if doesn't exist (don't overwrite established ones if they have same name, though they usually have timestamps)
        if (!fs.existsSync(destPath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`+ Copied: ${file}`);
        } else {
            console.log(`= Already exists: ${file}`);
        }

        assetsForHtml.push({
            name: file,
            title: file.replace(/_\d+\.png$/, '').replace(/_/g, ' ').toUpperCase(),
            type: 'image'
        });
    }

    // 2. Generate the HTML
    const htmlPath = path.join(imagesDir, 'vidiglow.images.html');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VidiGlow | AI Generated Assets</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #22c55e;
            --secondary: #3b82f6;
            --bg: #030712;
            --card-bg: #111827;
            --text: #f9fafb;
            --text-muted: #9ca3af;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: var(--bg); 
            color: var(--text); 
            padding: 2rem;
            background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #030712 100%);
            min-height: 100vh;
        }
        
        header { 
            max-width: 1400px; 
            margin: 0 auto 4rem; 
            text-align: center; 
        }

        h1 { 
            font-family: 'Outfit', sans-serif; 
            font-size: 5rem; 
            font-weight: 900; 
            background: linear-gradient(to right, #22c55e, #3b82f6, #8b5cf6); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            margin-bottom: 1rem;
            letter-spacing: -2px;
        }

        .stats {
            display: inline-flex;
            gap: 2rem;
            background: rgba(255,255,255,0.05);
            padding: 1rem 2rem;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 2rem;
        }
        .stat-item span { color: var(--primary); font-weight: bold; }

        .search-container {
            max-width: 600px;
            margin: 0 auto 3rem;
            position: relative;
        }
        #search {
            width: 100%;
            padding: 1.25rem 2rem;
            background: var(--card-bg);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 1rem;
            color: #fff;
            font-size: 1.1rem;
            outline: none;
            transition: all 0.3s ease;
        }
        #search:focus {
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }

        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
            gap: 3rem; 
            max-width: 1600px; 
            margin: 0 auto; 
        }
        
        .card { 
            background: var(--card-bg); 
            border-radius: 1.5rem; 
            overflow: hidden; 
            border: 1px solid rgba(255,255,255,0.05); 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            position: relative;
        }
        .card:hover { 
            transform: translateY(-10px) scale(1.02); 
            border-color: var(--primary); 
            z-index: 10;
        }
        
        .img-container { 
            width: 100%; 
            aspect-ratio: 16/10; 
            background: #000; 
            overflow: hidden; 
        }
        .img-container img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            transition: transform 0.6s ease;
        }
        .card:hover img { transform: scale(1.1); }
        
        .info { padding: 1.5rem; }
        .title { 
            font-family: 'Outfit', sans-serif;
            font-weight: 700; 
            margin-bottom: 0.5rem; 
            font-size: 1.25rem; 
            color: #fff; 
            letter-spacing: -0.5px;
        }
        .meta { 
            font-size: 0.85rem; 
            color: var(--text-muted); 
            font-family: monospace;
        }
        .tag { 
            background: rgba(34, 197, 94, 0.1);
            color: var(--primary); 
            padding: 0.25rem 0.75rem;
            border-radius: 99px;
            font-weight: 700; 
            font-size: 0.7rem; 
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 0.75rem;
        }

        /* Modal */
        #modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 4rem;
        }
        #modal img {
            max-width: 90%;
            max-height: 90vh;
            border-radius: 1rem;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
        #close-modal {
            position: absolute;
            top: 2rem;
            right: 2rem;
            color: #fff;
            font-size: 3rem;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
        }

        .empty-state {
            text-align: center;
            padding: 5rem;
            grid-column: 1 / -1;
            color: var(--text-muted);
        }
    </style>
</head>
<body>

<header>
    <div class="tag">Live Asset Registry</div>
    <h1>VidiGlow</h1>
    <div class="stats">
        <div class="stat-item">Total Generated: <span>${assetsForHtml.length}</span></div>
        <div class="stat-item">Format: <span>PNG 24-bit</span></div>
        <div class="stat-item">Source: <span>VidiSmart Intelligence</span></div>
    </div>
    
    <div class="search-container">
        <input type="text" id="search" placeholder="Search across ${assetsForHtml.length} generated visuals...">
    </div>
</header>

<div class="grid" id="asset-grid">
    <!-- Assets injected by JS -->
</div>

<div id="modal">
    <span id="close-modal">&times;</span>
    <div id="modal-content"></div>
</div>

<script>
    const assets = ${JSON.stringify(assetsForHtml)};

    const grid = document.getElementById('asset-grid');
    const search = document.getElementById('search');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('close-modal');

    function render(filter = '') {
        grid.innerHTML = '';
        const filtered = assets.filter(a => a.title.toLowerCase().includes(filter.toLowerCase()));
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state">No assets found matching your search.</div>';
            return;
        }

        filtered.forEach(asset => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = \`
                <div class="img-container">
                    <img src="\${asset.name}" loading="lazy" alt="\${asset.title}">
                </div>
                <div class="info">
                    <div class="tag">AI Generated Asset</div>
                    <div class="title">\${asset.title}</div>
                    <div class="meta">\${asset.name}</div>
                </div>
            \`;
            card.onclick = () => {
                modalContent.innerHTML = '<img src="' + asset.name + '">';
                modal.style.display = 'flex';
            };
            grid.appendChild(card);
        });
    }

    search.oninput = (e) => render(e.target.value);
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    render();
</script>

</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`--- Done! Updated ${htmlPath} with ${assetsForHtml.length} assets. ---`);
}

run().catch(console.error);

#!/usr/bin/env node
/**
 * Generate chapters.html dynamically from BOOK_DATA
 * Uses count-chapters.js approach to load data
 */

const fs = require('fs');
const path = require('path');

// Load data.js by creating a temp CJS wrapper
const dataPath = path.join(__dirname, 'data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Add export if not present
const exportLine = '\nif (typeof module !== "undefined") { module.exports = { BOOK_DATA }; }';
const exportableContent = dataContent.includes('module.exports') ? dataContent : dataContent + exportLine;

// Write temp file
const tempPath = path.join(__dirname, '_data-temp.cjs');
fs.writeFileSync(tempPath, exportableContent, 'utf8');

// Load it
delete require.cache[require.resolve(tempPath)];
let BOOK_DATA;
try {
    const mod = require(tempPath);
    BOOK_DATA = mod.BOOK_DATA;
} catch (e) {
    console.error('Failed to load data.js:', e.message);
    fs.unlinkSync(tempPath);
    process.exit(1);
}
fs.unlinkSync(tempPath);

if (!BOOK_DATA || !BOOK_DATA.chapters) {
    console.error('BOOK_DATA.chapters not found');
    process.exit(1);
}

const chapters = BOOK_DATA.chapters;
const chapterKeys = Object.keys(chapters).sort((a, b) => {
    const orderA = chapters[a].order ?? 999;
    const orderB = chapters[b].order ?? 999;
    return orderA - orderB;
});

// Group chapters by part FIRST, then sort within each part
const parts = {};
chapterKeys.forEach(key => {
    const ch = chapters[key];
    const partNum = ch.part ?? 0;
    if (!parts[partNum]) {
        parts[partNum] = { num: partNum, chapters: [] };
    }
    parts[partNum].chapters.push({ key, ...ch });
});

// Sort chapters within each part by order
Object.values(parts).forEach(part => {
    part.chapters.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
});

// Part names
const partNames = {
    0: 'Foreword',
    1: 'The Landscape',
    2: 'The Technology',
    3: 'The Business',
    4: 'The Stack & The Future',
    5: 'The Horizon',
    6: 'Reference'
};

const partRoman = { 0: 'F', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };

// Generate chapter card HTML
function generateChapterCard(ch) {
    const order = ch.order ?? 0;
    const chapterNum = Math.round(order);
    const isVariant = ch.id.includes('b') || ch.id.includes('v');
    const displayNum = ch.id === 'foreword' ? 'Foreword' : 
                       isVariant ? `Chapter ${chapterNum}+` : `Chapter ${chapterNum}`;
    const title = ch.title.replace(/^Ch\d+:\s*/, '').replace(/^Foreword:\s*/, '');
    const readTime = ch.readTime || '10 min';
    
    // Get first 150 chars of content for description - strip ALL HTML
    let summary = '';
    if (ch.content) {
        // Strip all HTML tags, collapse whitespace, trim
        summary = ch.content
            .replace(/<[^>]*>/g, ' ')           // Remove all HTML tags
            .replace(/&[^;]+;/g, ' ')           // Remove HTML entities
            .replace(/\s+/g, ' ')               // Collapse whitespace
            .trim()
            .substring(0, 150);
        if (summary.length >= 150) summary += '...';
    }
    
    return `            <a class="chapter-card" href="print-book.html?chapter=${ch.id}">
                <div class="chapter-number">${displayNum}</div>
                <div class="chapter-title">${title}</div>
                <div class="chapter-desc">${summary}</div>
                <div class="chapter-meta"><span class="chapter-pill">${readTime} min read</span></div>
            </a>`;
}

// Generate part section HTML
function generatePartSection(partNum, partData) {
    const partName = partNames[partNum] || `Part ${partRoman[partNum] || partNum}`;
    const roman = partRoman[partNum] || partNum;
    const count = partData.chapters.length;
    const countLabel = count === 1 ? '1 chapter' : `${count} chapters`;
    const sectionId = partNum === 0 ? 'foreword' : `part${partNum}`;
    
    const chapterCards = partData.chapters.map(ch => generateChapterCard(ch)).join('\n');
    
    return `
    <!-- Part ${roman} -->
    <div class="part-section" id="${sectionId}">
        <div class="part-header">
            <span class="part-num">${roman}</span>
            <span class="part-title">${partName}</span>
            <span class="part-chapter-count">${countLabel}</span>
        </div>
        <div class="chapter-grid">
${chapterCards}
        </div>
    </div>`;
}

// Generate nav links
const navLinks = Object.keys(parts).sort((a,b) => a-b).map(p => {
    const id = p === '0' ? 'foreword' : `part${p}`;
    const label = p === '0' ? 'Foreword' : `Part ${partRoman[p] || p}`;
    return `        <a href="#${id}">${label}</a>`;
}).join('\n');

// Generate all part sections
const partSections = Object.entries(parts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([partNum, partData]) => generatePartSection(Number(partNum), partData))
    .join('\n');

// Calculate stats
const totalChapters = chapterKeys.length;
const totalParts = Object.keys(parts).length;
const totalReadTime = chapterKeys.reduce((sum, key) => {
    const ch = chapters[key];
    const readTime = ch.readTime || 10;
    return sum + readTime;
}, 0);

// Build the full HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Chapter Index — The Speed of Agentic Visual AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Kumbh+Sans:wght@700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --fire: #FF6B35; --fire-dark: #D4551F; --gold: #C8A951;
            --blue: #1A659E; --teal: #10B981; --purple: #8B5CF6;
            --bg: #060914; --bg-card: rgba(255,255,255,0.04);
            --border: rgba(255,255,255,0.09); --border-bright: rgba(255,255,255,0.18);
        }
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: #E2E8F0; overflow-x: hidden; }
        #neuralCanvas { position: fixed; inset:0; z-index:0; filter: blur(0.5px); opacity:0.55; pointer-events:none; }
        .container { position: relative; z-index:1; max-width: 1100px; margin: 0 auto; padding: 3rem 2rem 5rem; }
        .back-link { display: inline-flex; align-items:center; gap:0.5rem; color: var(--gold); text-decoration:none; font-size:0.85rem; font-weight:600; letter-spacing:1px; margin-bottom:2rem; transition: color 0.2s; }
        .back-link:hover { color:#fff; }
        .page-header { text-align: center; margin-bottom: 3rem; }
        .page-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--fire); margin-bottom: 0.5rem; }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem, 6vw, 4.5rem); letter-spacing: 2px; color: #fff; line-height: 1; margin-bottom: 0.5rem; }
        .page-subtitle { font-family: 'DM Serif Display', serif; font-style: italic; color: rgba(255,255,255,0.5); font-size: 1.1rem; margin-bottom: 0.5rem; }
        .page-stats { display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; }
        .page-stat { text-align: center; }
        .page-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: var(--fire); line-height:1; }
        .page-stat-label { font-size:0.65rem; letter-spacing:2px; text-transform:uppercase; color: rgba(255,255,255,0.35); }
        .part-nav { display: flex; flex-wrap:wrap; justify-content:center; gap:0.4rem; margin-bottom: 2.5rem; position: sticky; top: 60px; z-index:10; background: rgba(6,9,20,0.92); backdrop-filter:blur(16px); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border); }
        .part-nav a { font-size:0.72rem; font-weight:700; letter-spacing:1px; color: rgba(255,255,255,0.5); text-decoration:none; padding: 0.35rem 0.75rem; border-radius: 4px; transition: all 0.2s; white-space: nowrap; }
        .part-nav a:hover { color:#fff; background: rgba(255,107,53,0.15); }
        .part-nav a.active { color: var(--fire); background: rgba(255,107,53,0.12); }
        .part-section { margin-bottom: 2.5rem; scroll-margin-top: 120px; }
        .part-header { display: flex; align-items:baseline; gap:0.75rem; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .part-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: var(--fire); line-height:1; letter-spacing: 1px; }
        .part-title { font-family: 'Kumbh Sans', sans-serif; font-size: 1.4rem; font-weight:800; color:#fff; }
        .part-chapter-count { font-size:0.7rem; color: rgba(255,255,255,0.3); letter-spacing:1px; margin-left: auto; }
        .chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.75rem; }
        .chapter-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 1.1rem 1.25rem; transition: border-color 0.2s, transform 0.15s; cursor: pointer; text-decoration: none; display: block; }
        .chapter-card:hover { border-color: var(--fire); transform: translateY(-2px); }
        .chapter-number { font-size: 0.55rem; font-weight:800; letter-spacing:2px; text-transform: uppercase; color: var(--fire); margin-bottom: 0.25rem; }
        .chapter-title { font-family: 'Kumbh Sans', sans-serif; font-size: 0.9rem; font-weight:700; color:#fff; margin-bottom: 0.35rem; line-height:1.3; }
        .chapter-desc { font-size: 0.78rem; color: rgba(255,255,255,0.45); line-height: 1.5; }
        .chapter-meta { display:flex; gap:0.5rem; margin-top:0.6rem; }
        .chapter-pill { font-size:0.62rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:12px; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.4); border:1px solid rgba(255,255,255,0.08); }
        footer { text-align:center; padding:2rem; border-top:1px solid rgba(255,255,255,0.06); position:relative; z-index:1; }
        footer p { font-size:0.75rem; color:rgba(255,255,255,0.2); }
        @media (max-width:700px) { .chapter-grid { grid-template-columns: 1fr; } .part-nav { flex-wrap:nowrap; overflow-x:auto; justify-content:flex-start; } .part-nav a { flex-shrink:0; } }
    </style>
</head>
<body>
<canvas id="neuralCanvas"></canvas>
<div class="container">
    <a href="index.html" class="back-link">← Back to Book Cover</a>

    <div class="page-header">
        <div class="page-eyebrow">Complete Chapter Reference</div>
        <h1 class="page-title">Chapter Index</h1>
        <p class="page-subtitle">The Speed of Agentic Visual AI</p>
        <div class="page-stats">
            <div class="page-stat">
                <div class="page-stat-num">${totalChapters}</div>
                <div class="page-stat-label">Chapters</div>
            </div>
            <div class="page-stat">
                <div class="page-stat-num">${totalParts}</div>
                <div class="page-stat-label">Parts</div>
            </div>
            <div class="page-stat">
                <div class="page-stat-num">~${totalReadTime}</div>
                <div class="page-stat-label">Min. Reading</div>
            </div>
        </div>
    </div>

    <nav class="part-nav" id="partNav">
${navLinks}
    </nav>

${partSections}
</div>
<footer>
    <p>Generated from BOOK_DATA · ${totalChapters} chapters · ${totalParts} parts</p>
</footer>
<script>
(function(){
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    for (let i = 0; i < 60; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
    }
    function draw() {
        ctx.clearRect(0, 0, w, h);
        nodes.forEach(n => {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;
        });
        ctx.strokeStyle = 'rgba(255,107,53,0.08)'; ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
            }
        }
        nodes.forEach(n => { ctx.fillStyle = 'rgba(255,107,53,0.3)'; ctx.beginPath(); ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2); ctx.fill(); });
        requestAnimationFrame(draw);
    }
    draw();
})();
</script>
</body>
</html>`;

// Write the output
const outputPath = path.join(__dirname, 'chapters.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log(`✅ Generated chapters.html with ${totalChapters} chapters across ${totalParts} parts`);
console.log(`📄 Output: ${outputPath}`);
console.log('\n📚 Chapters included:');
chapterKeys.forEach(key => {
    const ch = chapters[key];
    console.log(`   ${key}: "${ch.title}" (Part ${ch.part}, Order ${ch.order})`);
});

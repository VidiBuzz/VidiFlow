#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const tempPath = path.join(__dirname, '_data-temp.cjs');
fs.writeFileSync(tempPath, dataContent + '\nif(typeof module!=="undefined"){module.exports={BOOK_DATA}}', 'utf8');
delete require.cache[require.resolve(tempPath)];
const { BOOK_DATA } = require(tempPath);
fs.unlinkSync(tempPath);

if (!BOOK_DATA || !BOOK_DATA.chapters) { console.error('No BOOK_DATA.chapters'); process.exit(1); }

const chapters = BOOK_DATA.chapters;
const chapterKeys = Object.keys(chapters).sort((a, b) => (chapters[a].order ?? 999) - (chapters[b].order ?? 999));

const parts = {};
chapterKeys.forEach(key => {
    const ch = chapters[key];
    const p = ch.part ?? 0;
    if (!parts[p]) parts[p] = [];
    parts[p].push({ key, ...ch });
});
Object.values(parts).forEach(arr => arr.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)));

const PN = { 0:'Foreword', 1:'The Landscape', 2:'The Technology', 3:'The Business', 4:'The Stack & The Future', 5:'The Horizon', 6:'Reference' };
const PR = { 0:'F', 1:'I', 2:'II', 3:'III', 4:'IV', 5:'V', 6:'VI' };

function esc(s) { return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"'); }

function card(ch) {
    const n = Math.round(ch.order ?? 0);
    const v = ch.id.includes('b') || ch.id.includes('v');
    const dn = ch.id === 'foreword' ? 'Foreword' : v ? 'Chapter ' + n + '+' : 'Chapter ' + n;
    const t = ch.title.replace(/^Ch\d+:\s*/, '').replace(/^Foreword:\s*/, '');
    let s = '';
    if (ch.content) { s = ch.content.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim().substring(0,150); if (s.length >= 150) s += '...'; }
    return '<a class="chapter-card" href="print-book.html?chapter=' + ch.id + '">' +
        '<div class="chapter-number">' + esc(dn) + '</div>' +
        '<div class="chapter-title">' + esc(t) + '</div>' +
        '<div class="chapter-desc">' + esc(s) + '</div>' +
        '<div class="chapter-meta"><span class="chapter-pill">' + esc(ch.readTime || '10') + ' min read</span></div>' +
        '</a>';
}

const nav = Object.keys(parts).sort((a,b)=>a-b).map(p=>'<a href="#'+(p==='0'?'foreword':'part'+p)+'">'+(p==='0'?'Foreword':'Part '+PR[p])+'</a>').join('\n');

let sections = '';
const sorted = Object.entries(parts).sort(([a],[b])=>Number(a)-Number(b));
sorted.forEach(([pn, arr]) => {
    const name = PN[pn] || 'Part ' + (PR[pn] || pn);
    const id = pn === '0' ? 'foreword' : 'part' + pn;
    sections += '<div class="part-section" id="' + id + '">' +
        '<div class="part-header"><span class="part-num">' + (PR[pn]||pn) + '</span>' +
        '<span class="part-title">' + esc(name) + '</span>' +
        '<span class="part-chapter-count">' + arr.length + ' chapter' + (arr.length!==1?'s':'') + '</span></div>' +
        '<div class="chapter-grid">' + arr.map(card).join('') + '</div></div>';
});

const total = chapterKeys.length;
const partsCount = Object.keys(parts).length;
const readTime = chapterKeys.reduce((s,k)=>s+(chapters[k].readTime||10),0);

const CSS = '<style>:root{--fire:#FF6B35;--gold:#C8A951;--bg:#060914;--bg-card:rgba(255,255,255,.04);--border:rgba(255,255,255,.09)}*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:"DM Sans",sans-serif;background:var(--bg);color:#E2E8F0;overflow-x:hidden}.container{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:3rem 2rem 5rem}.back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--gold);text-decoration:none;font-size:.85rem;font-weight:600;letter-spacing:1px;margin-bottom:2rem;transition:color .2s}.back-link:hover{color:#fff}.page-header{text-align:center;margin-bottom:3rem}.page-eyebrow{font-size:.7rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--fire);margin-bottom:.5rem}.page-title{font-family:"Bebas Neue",sans-serif;font-size:clamp(2.5rem,6vw,4.5rem);letter-spacing:2px;color:#fff;line-height:1;margin-bottom:.5rem}.page-subtitle{font-family:"DM Serif Display",serif;font-style:italic;color:rgba(255,255,255,.5);font-size:1.1rem;margin-bottom:.5rem}.page-stats{display:flex;justify-content:center;gap:2rem;margin-top:1rem}.page-stat{text-align:center}.page-stat-num{font-family:"Bebas Neue",sans-serif;font-size:2rem;color:var(--fire);line-height:1}.page-stat-label{font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35)}.part-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem;margin-bottom:2.5rem;position:sticky;top:60px;z-index:10;background:rgba(6,9,20,.92);backdrop-filter:blur(16px);padding:.75rem 1rem;border-radius:8px;border:1px solid var(--border)}.part-nav a{font-size:.72rem;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,.5);text-decoration:none;padding:.35rem .75rem;border-radius:4px;transition:all .2s;white-space:nowrap}.part-nav a:hover{color:#fff;background:rgba(255,107,53,.15)}.part-section{margin-bottom:2.5rem;scroll-margin-top:120px}.part-header{display:flex;align-items:baseline;gap:.75rem;margin-bottom:1.25rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)}.part-num{font-family:"Bebas Neue",sans-serif;font-size:2.5rem;color:var(--fire);line-height:1;letter-spacing:1px}.part-title{font-family:"Kumbh Sans",sans-serif;font-size:1.4rem;font-weight:800;color:#fff}.part-chapter-count{font-size:.7rem;color:rgba(255,255,255,.3);letter-spacing:1px;margin-left:auto}.chapter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.75rem}.chapter-card{background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:1.1rem 1.25rem;transition:border-color .2s,transform .15s;cursor:pointer;text-decoration:none;display:block}.chapter-card:hover{border-color:var(--fire);transform:translateY(-2px)}.chapter-number{font-size:.55rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--fire);margin-bottom:.25rem}.chapter-title{font-family:"Kumbh Sans",sans-serif;font-size:.9rem;font-weight:700;color:#fff;margin-bottom:.35rem;line-height:1.3}.chapter-desc{font-size:.78rem;color:rgba(255,255,255,.45);line-height:1.5}.chapter-meta{display:flex;gap:.5rem;margin-top:.6rem}.chapter-pill{font-size:.62rem;font-weight:600;padding:.2rem .55rem;border-radius:12px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08)}footer{text-align:center;padding:2rem;border-top:1px solid rgba(255,255,255,.06);position:relative;z-index:1}footer p{font-size:.75rem;color:rgba(255,255,255,.2)}@media(max-width:700px){.chapter-grid{grid-template-columns:1fr}.part-nav{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start}.part-nav a{flex-shrink:0}}</style>';

const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="referrer" content="no-referrer"><title>Chapter Index - The Speed of Agentic Visual AI</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Kumbh+Sans:wght@700;800;900&display=swap" rel="stylesheet">' +
    CSS + '</head><body><div class="container">' +
    '<a href="index.html" class="back-link">&larr; Back to Book Cover</a>' +
    '<div class="page-header"><div class="page-eyebrow">Complete Chapter Reference</div>' +
    '<h1 class="page-title">Chapter Index</h1><p class="page-subtitle">The Speed of Agentic Visual AI</p>' +
    '<div class="page-stats"><div class="page-stat"><div class="page-stat-num">' + total + '</div><div class="page-stat-label">Chapters</div></div>' +
    '<div class="page-stat"><div class="page-stat-num">' + partsCount + '</div><div class="page-stat-label">Parts</div></div>' +
    '<div class="page-stat"><div class="page-stat-num">~' + readTime + '</div><div class="page-stat-label">Min. Reading</div></div></div></div>' +
    '<nav class="part-nav">' + nav + '</nav>' + sections +
    '</div><footer><p>' + total + ' chapters &middot; ' + partsCount + ' parts</p></footer></body></html>';

fs.writeFileSync(path.join(__dirname, 'chapters.html'), html, 'utf8');
console.log('OK: ' + total + ' chapters, ' + partsCount + ' parts');
chapterKeys.forEach(k => console.log('  ' + k + ': ' + chapters[k].title + ' (P' + chapters[k].part + ', O' + chapters[k].order + ')'));

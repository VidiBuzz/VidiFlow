#!/usr/bin/env node
/**
 * Verify chapters.html has all expected chapter cards
 */
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/chapters.html', 'utf8');

// Count chapter cards
const cardMatches = html.match(/<a class="chapter-card" href="print-book\.html\?chapter=([^"]+)">/g);
const cardCount = cardMatches ? cardMatches.length : 0;

// Extract chapter IDs
const chapterIds = cardMatches ? cardMatches.map(m => {
    const match = m.match(/chapter=([^"]+)/);
    return match ? match[1] : null;
}).filter(Boolean) : [];

// Check for duplicates
const uniqueIds = new Set(chapterIds);
const duplicates = chapterIds.filter((id, i) => chapterIds.indexOf(id) !== i);

console.log('=== Chapters.html Verification ===');
console.log(`Total chapter cards: ${cardCount}`);
console.log(`Unique chapter IDs: ${uniqueIds.size}`);
console.log(`Duplicate IDs: ${duplicates.length > 0 ? duplicates.join(', ') : 'None'}`);

// Expected chapters from data.js
const expectedChapters = [
    'foreword', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10',
    'ch11', 'ch12', 'ch13', 'ch13b', 'ch14', 'ch15', 'ch16', 'ch17', 'ch18',
    'ch19', 'ch20', 'ch21', 'ch22', 'ch23', 'ch23b', 'ch24', 'ch25', 'ch26', 'ch27',
    'ch28', 'ch29', 'ch30', 'ch31', 'ch32', 'ch32b', 'ch33', 'ch33v', 'ch34', 'ch35',
    'ch36', 'ch37', 'ch38', 'ch39', 'ch40', 'ch41', 'ch42', 'ch43', 'ch44', 'ch45', 'ch46'
];

// Check for missing chapters
const missing = expectedChapters.filter(id => !uniqueIds.has(id));
const extra = chapterIds.filter(id => !expectedChapters.includes(id));

console.log(`\nExpected chapters: ${expectedChapters.length}`);
console.log(`Missing chapters: ${missing.length > 0 ? missing.join(', ') : 'None'}`);
console.log(`Extra chapters: ${extra.length > 0 ? extra.join(', ') : 'None'}`);

// Count part sections
const partSections = html.match(/class="part-section"/g);
console.log(`\nPart sections: ${partSections ? partSections.length : 0}`);

// Count chapter grids
const grids = html.match(/class="chapter-grid"/g);
console.log(`Chapter grids: ${grids ? grids.length : 0}`);

// Check stat display
const statMatch = html.match(/page-stat-num">(\d+)</g);
if (statMatch) {
    console.log(`\nStat numbers displayed: ${statMatch.map(m => {
        const v = m.match(/(\d+)/);
        return v ? v[1] : '?';
    }).join(', ')}`);
}

// Check for broken HTML - unclosed tags in chapter cards
const brokenCards = [];
chapterIds.forEach((id, i) => {
    // Find the card HTML
    const cardRegex = new RegExp(`<a class="chapter-card" href="print-book\\.html\\?chapter=${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">[\\s\\S]*?</a>`);
    const cardMatch = html.match(cardRegex);
    if (!cardMatch) {
        brokenCards.push(id);
    }
});

console.log(`\nBroken card HTML: ${brokenCards.length > 0 ? brokenCards.join(', ') : 'None'}`);

if (missing.length === 0 && duplicates.length === 0 && brokenCards.length === 0) {
    console.log('\n✅ ALL CHECKS PASSED - 51 chapters correctly rendered');
} else {
    console.log('\n❌ ISSUES FOUND');
}

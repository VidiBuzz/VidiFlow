const BOOK_DATA = require('./data.js').BOOK_DATA || globalThis.BOOK_DATA;

// Handle both module export and global variable
let bookData = BOOK_DATA;
if (!bookData && typeof globalThis.BOOK_DATA !== 'undefined') {
    bookData = globalThis.BOOK_DATA;
}

// If still not found, try loading the file directly
if (!bookData) {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
    // Extract the object from the const declaration
    const match = content.match(/const BOOK_DATA = ({[\s\S]*});/);
    if (match) {
        bookData = eval('(' + match[1] + ')');
    }
}

if (!bookData || !bookData.chapters) {
    console.error('Could not load BOOK_DATA');
    process.exit(1);
}

const chapters = bookData.chapters;
const keys = Object.keys(chapters);

console.log('Total chapters in data.js:', keys.length);

// Sort by order
const sorted = keys.sort((a, b) => {
    const orderA = chapters[a].order || 999;
    const orderB = chapters[b].order || 999;
    return orderA - orderB;
});

console.log('\nChapters sorted by order:');
sorted.forEach(key => {
    const ch = chapters[key];
    console.log(`  ${key}: order=${ch.order}, part=${ch.part}, title="${ch.title}"`);
});

// Check for duplicates or gaps
const orders = sorted.map(k => chapters[k].order).filter(o => o !== undefined);
const uniqueOrders = new Set(orders);
console.log(`\nUnique order values: ${uniqueOrders.size}`);
console.log(`Order range: ${Math.min(...orders)} to ${Math.max(...orders)}`);

// Check persona chapter counts
console.log('\nPersona chapter counts:');
for (const [personaId, persona] of Object.entries(bookData.personas)) {
    const allChapters = new Set([
        ...(persona.critical || []),
        ...(persona.high || []),
        ...(persona.medium || []),
        ...(persona.hide || [])
    ]);
    console.log(`  ${personaId}: ${allChapters.size} unique chapters referenced`);
}

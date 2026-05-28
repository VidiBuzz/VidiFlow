const fs = require('fs');
const html = fs.readFileSync(__dirname + '/chapters.html', 'utf8');

// Find all chapter-desc content
const regex = /<div class="chapter-desc">([\s\S]*?)<\/div>/g;
let match;
let cardNum = 0;
let broken = [];
while ((match = regex.exec(html)) !== null) {
    cardNum++;
    const desc = match[1];
    // Check for unescaped HTML tags or quotes
    if (/<[a-zA-Z]/.test(desc) || /"/.test(desc)) {
        broken.push({ card: cardNum, desc: desc.substring(0, 100) });
    }
}

console.log(`Total cards: ${cardNum}`);
console.log(`Broken descriptions: ${broken.length}`);
broken.forEach(b => {
    console.log(`  Card ${b.card}: "${b.desc}"`);
});

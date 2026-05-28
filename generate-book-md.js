const fs = require('fs');

let dataJsContent = fs.readFileSync('m:\\code\\vidismart\\smart-book\\data.js', 'utf8');

// Replace const BOOK_DATA with global.BOOK_DATA so we can access it
dataJsContent = dataJsContent.replace(/const\s+BOOK_DATA\s*=/, 'global.BOOK_DATA =');

try {
    eval(dataJsContent);
} catch (e) {
    console.error("Error evaluating data.js", e);
    process.exit(1);
}

if (!global.BOOK_DATA || !global.BOOK_DATA.chapters) {
    console.error("No global.BOOK_DATA.chapters found");
    process.exit(1);
}

// Convert chapters to markdown
const chapters = global.BOOK_DATA.chapters;
// Sort chapters by 'order' property
const sortedKeys = Object.keys(chapters).sort((a, b) => {
    return (chapters[a].order || 0) - (chapters[b].order || 0);
});

let mdContent = `# The Speed of Agentic Visual AI\n\n`;

for (const key of sortedKeys) {
    const chapter = chapters[key];
    mdContent += `## ${chapter.title}\n\n`;
    
    // Clean up basic HTML tags to Markdown (super basic)
    let content = chapter.content;
    content = content.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1');
    content = content.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1');
    content = content.replace(/<p[^>]*>/g, '');
    content = content.replace(/<\/p>/g, '\n\n');
    content = content.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
    content = content.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
    content = content.replace(/<ul[^>]*>/g, '');
    content = content.replace(/<\/ul>/g, '\n');
    content = content.replace(/<ol[^>]*>/g, '');
    content = content.replace(/<\/ol>/g, '\n');
    content = content.replace(/<li[^>]*>/g, '- ');
    content = content.replace(/<\/li>/g, '\n');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<div[^>]*>/g, '');
    content = content.replace(/<\/div>/g, '');
    content = content.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
    content = content.replace(/<img[^>]*src="([^"]+)"[^>]*>/g, '![]($1)\n\n');
    content = content.replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
    
    // Some basic unescaping
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");

    mdContent += content.trim() + '\n\n---\n\n';
}

fs.writeFileSync('m:\\code\\vidismart\\The_Speed_of_Agentic_Visual_AI.md', mdContent);
console.log("Markdown generation complete.");

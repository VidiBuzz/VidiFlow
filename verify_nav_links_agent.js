
const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FILES_TO_CHECK = [
    "vidismart.masterlist.html",
    "master-index.html",
    "smartchannelcx.tech.html",
    "smartchannelcx.html",
    "vidismart-competitive-analysis-2026.html",
    "viditwin.html",
    "vidishop.html",
    "gemini.dash.html"
];

// STRICT Expectations
const EXPECTED_LINKS = {
    "Smart Stack": "vidismart.masterlist.html",
    "VidiMail": "vidismart-competitive-analysis-2026.html",
    "VidiShop": "vidishop.html",
    "VidiTwin": "viditwin.html",
    "AI Gen": "SmartGenUi.html",
    "SmartGen AI": "SmartGenUi.html",
    "SmartChannel": "smartchannelcx.html", // Overview
    "Tech Specs": "smartchannelcx-tech.html" // Tech 
};

function checkFile(filename) {
    const fullPath = path.join(BASE_DIR, filename);
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ FILE MISSING: ${filename}`);
        return;
    }

    console.log(`\n🔍 AUDITING: ${filename}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    let issues = 0;

    // Check for Duplicate Headers (Universal Nav vs Dynamic/Glass)
    if (content.includes('vidi-universal-nav') && content.includes('vidi-glass-nav')) {
        console.log(`   ⚠️  WARNING: Duplicate Headers (Universal + Glass) detected!`);
        issues++;
    }

    // Check specific links
    // Regex for <a ... href="TARGET">...LABEL...</a>
    // This is approximate but practical
    for (const [label, expected] of Object.entries(EXPECTED_LINKS)) {
        // Regex: 
        // 1. Capture href content
        // 2. Ensure Label is present inside tag content
        const regex = new RegExp(`<a[^>]*href=["']([^"']+)["'][^>]*>[\\s\\S]*?${label}[\\s\\S]*?</a>`, 'gi');

        let match;
        while ((match = regex.exec(content)) !== null) {
            const actualUrl = match[1];
            // Remove anchors like #section
            const cleanActual = actualUrl.split('#')[0];

            if (cleanActual !== expected) {
                // Allow exact match or if expected is list (not implemented here but needed for SmartChannel)
                // For SmartChannel specifically, we allow both depending on context, BUT we want them distinct
                // Current rule: "SmartChannel" -> smartchannelcx.html, "Tech Specs" -> smartchannelcx-tech.html
                // If label is strictly "SmartChannel", it should be overview.

                // Exception: If label is "SmartChannel" but URL is "smartchannelcx-tech.html", is that allowed?
                // User complained about confusion. So let's be strict.

                console.log(`   ❌ BROKEN LINK: Label '${label}' -> '${actualUrl}' (Expected: '${expected}')`);
                issues++;
            } else {
                // console.log(`   ✅ Valid: ${label}`);
            }
        }
    }

    if (issues === 0) {
        console.log(`   ✅ ALL CLEAR.`);
    }
}

console.log("🚀 STARTING NAVIGATION AUDIT AGENT...");
FILES_TO_CHECK.forEach(checkFile);
console.log("\n🏁 AUDIT COMPLETE.");

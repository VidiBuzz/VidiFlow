#!/usr/bin/env node

/**
 * VidiSmart HTML to Directus Migration Script
 * 
 * This script extracts content from static HTML files and imports them
 * into the Directus CMS on VIDIpitch.com for testing before production rollout.
 * 
 * Usage: node migrate-to-directus.js [options]
 * 
 * Options:
 *   --dry-run          Preview migration without importing
 *   --file <path>      Migrate a single file
 *   --category <cat>   Filter by category (books, landing_pages, resources, documentation)
 *   --help             Show help message
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
    directusUrl: 'http://localhost:8055',
    accessToken: process.env.DIRECTUS_ACCESS_TOKEN || '',
    collection: 'site_pages',
    batchSize: 10,
    delayBetweenBatches: 1000, // ms
};

// HTML files to migrate
const HTML_FILES = [
    { path: 'smart-book/index.html', category: 'books', title: 'Smart Book - Landing Page' },
    { path: 'smart-book/print-book.html', category: 'books', title: 'Smart Book - Reader' },
    { path: 'vidismart.masterlist.html', category: 'landing_pages', title: 'VidiSmart Master List' },
    { path: 'vidismart.masterlist.FINAL.html', category: 'landing_pages', title: 'VidiSmart Master List (Final)' },
    { path: 'vidismart.consultants.html', category: 'landing_pages', title: 'VidiSmart Consultants' },
    { path: 'vidismart.directory.html', category: 'landing_pages', title: 'VidiSmart Directory' },
    { path: 'vidismart.sectors.html', category: 'landing_pages', title: 'VidiSmart Sectors' },
    { path: 'vidismart.deck.html', category: 'landing_pages', title: 'VidiSmart Deck' },
    { path: 'vidismart.deck.agent.html', category: 'landing_pages', title: 'VidiSmart Agent Deck' },
    { path: 'vidismart.smartsearch.presentation.html', category: 'landing_pages', title: 'VidiSmart Smart Search' },
    { path: 'vidismart.newsaggregator.presentation.html', category: 'landing_pages', title: 'VidiSmart News Aggregator' },
    { path: 'vidismart.streamstack.html', category: 'landing_pages', title: 'VidiSmart StreamStack' },
    { path: 'smartstack-builder.html', category: 'tools', title: 'Smart Stack Builder' },
    { path: 'smartstack.html', category: 'tools', title: 'Smart Stack' },
    { path: 'smartgen.html', category: 'tools', title: 'SmartGen' },
    { path: 'smartgen.tools.html', category: 'tools', title: 'SmartGen Tools' },
    { path: 'smartgen.vlm.html', category: 'tools', title: 'SmartGen VLM' },
    { path: 'smartchannelcx.html', category: 'landing_pages', title: 'SmartChannel CX' },
    { path: 'smartchannelcx-tech.html', category: 'landing_pages', title: 'SmartChannel CX Tech' },
    { path: 'smartchannel.dashbuild-ses_397e.md', category: 'documentation', title: 'SmartChannel Dashboard Build' },
];

// Helper: Extract metadata from HTML
function extractMetadata(htmlContent, fileConfig) {
    const metadata = {
        title: fileConfig.title || 'Untitled Page',
        slug: '',
        description: '',
        content: '',
        meta_description: '',
        head_content: '',
        category: fileConfig.category || 'general',
        status: 'published',
        show_in_menu: true,
        menu_order: 0,
        icon: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Generate slug from filename
    const filename = path.basename(fileConfig.path, '.html');
    metadata.slug = filename.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

    // Extract title from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
        metadata.title = titleMatch[1].trim();
    }

    // Extract meta description
    const metaDescMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch) {
        metadata.meta_description = metaDescMatch[1].trim();
        metadata.description = metaDescMatch[1].trim();
    }

    // Extract head content (scripts, styles, meta tags)
    const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (headMatch) {
        metadata.head_content = headMatch[1].trim();
    }

    // Extract body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        metadata.content = bodyMatch[1].trim();
    }

    return metadata;
}

// Helper: Make HTTP request to Directus API
function directusRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.directusUrl}${endpoint}`;
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.accessToken}`,
            },
        };

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }

        const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Helper: Sleep for specified milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main migration function
async function migrateFiles(options = {}) {
    const { dryRun = false, singleFile = null, categoryFilter = null } = options;

    console.log('🚀 VidiSmart to Directus Migration');
    console.log('==================================');
    console.log(`Directus URL: ${CONFIG.directusUrl}`);
    console.log(`Collection: ${CONFIG.collection}`);
    console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);
    console.log('');

    // Check for access token
    if (!CONFIG.accessToken) {
        console.error('❌ Error: DIRECTUS_ACCESS_TOKEN environment variable is required');
        console.error('   Set it with: export DIRECTUS_ACCESS_TOKEN="your-token-here"');
        process.exit(1);
    }

    // Filter files
    let filesToMigrate = HTML_FILES;

    if (singleFile) {
        filesToMigrate = filesToMigrate.filter(f => f.path === singleFile);
        if (filesToMigrate.length === 0) {
            console.error(`❌ File not found: ${singleFile}`);
            process.exit(1);
        }
    }

    if (categoryFilter) {
        filesToMigrate = filesToMigrate.filter(f => f.category === categoryFilter);
        if (filesToMigrate.length === 0) {
            console.error(`❌ No files found for category: ${categoryFilter}`);
            process.exit(1);
        }
    }

    console.log(`📁 Files to migrate: ${filesToMigrate.length}`);
    console.log('');

    const results = {
        success: [],
        failed: [],
        skipped: [],
    };

    // Process files in batches
    for (let i = 0; i < filesToMigrate.length; i += CONFIG.batchSize) {
        const batch = filesToMigrate.slice(i, i + CONFIG.batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1} (${batch.length} files)`);

        for (const fileConfig of batch) {
            try {
                // Read HTML file
                const filePath = path.join(__dirname, '..', fileConfig.path);

                if (!fs.existsSync(filePath)) {
                    console.log(`⚠️  File not found: ${fileConfig.path}`);
                    results.skipped.push({ file: fileConfig.path, reason: 'File not found' });
                    continue;
                }

                const htmlContent = fs.readFileSync(filePath, 'utf8');

                // Extract metadata
                const metadata = extractMetadata(htmlContent, fileConfig);

                if (dryRun) {
                    console.log(`  ✅ [DRY RUN] ${metadata.title} (${metadata.slug})`);
                    results.success.push({ ...metadata, status: 'dry-run' });
                    continue;
                }

                // Import to Directus
                console.log(`  📤 Importing: ${metadata.title}...`);

                const response = await directusRequest('POST', `/items/${CONFIG.collection}`, metadata);

                console.log(`  ✅ Success: ${metadata.title} (ID: ${response.data?.id || response.id || 'unknown'})`);
                results.success.push({ ...metadata, id: response.data?.id || response.id });

                // Rate limiting
                await sleep(CONFIG.delayBetweenBatches);

            } catch (error) {
                console.error(`  ❌ Failed: ${fileConfig.path} - ${error.message}`);
                results.failed.push({ file: fileConfig.path, error: error.message });
            }
        }
    }

    // Print summary
    console.log('');
    console.log('📊 Migration Summary');
    console.log('===================');
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Skipped: ${results.skipped.length}`);
    console.log('');

    if (results.failed.length > 0) {
        console.log('Failed Files:');
        results.failed.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
        console.log('');
    }

    if (results.skipped.length > 0) {
        console.log('Skipped Files:');
        results.skipped.forEach(f => console.log(`  - ${f.file}: ${f.reason}`));
        console.log('');
    }

    return results;
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--file':
                options.singleFile = args[++i];
                break;
            case '--category':
                options.categoryFilter = args[++i];
                break;
            case '--help':
                showHelp();
                process.exit(0);
                break;
            default:
                console.error(`Unknown option: ${args[i]}`);
                showHelp();
                process.exit(1);
        }
    }

    return options;
}

function showHelp() {
    console.log(`
VidiSmart HTML to Directus Migration Script

Usage: node migrate-to-directus.js [options]

Options:
  --dry-run          Preview migration without importing
  --file <path>      Migrate a single file (relative to workspace root)
  --category <cat>   Filter by category (books, landing_pages, tools, documentation)
  --help             Show this help message

Environment Variables:
  DIRECTUS_ACCESS_TOKEN  Required. Your Directus API access token.

Examples:
  # Preview migration
  node migrate-to-directus.js --dry-run

  # Migrate all files
  DIRECTUS_ACCESS_TOKEN="your-token" node migrate-to-directus.js

  # Migrate single file
  DIRECTUS_ACCESS_TOKEN="your-token" node migrate-to-directus.js --file smart-book/index.html

  # Migrate only book category
  DIRECTUS_ACCESS_TOKEN="your-token" node migrate-to-directus.js --category books
  `);
}

// Run migration
if (require.main === module) {
    const options = parseArgs();
    migrateFiles(options)
        .then(results => {
            if (results.failed.length > 0) {
                process.exit(1);
            }
        })
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}

module.exports = { migrateFiles, extractMetadata, HTML_FILES };
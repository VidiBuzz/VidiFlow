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
    // Smart Book pages
    { path: 'smart-book/index.html', category: 'books', title: 'Smart Book - Landing Page' },
    { path: 'smart-book/print-book.html', category: 'books', title: 'Smart Book - Reader' },
    // VidiSmart landing pages
    { path: 'vidismart.masterlist.html', category: 'landing_pages', title: 'VidiSmart Master List' },
    { path: 'vidismart.masterlist.FINAL.html', category: 'landing_pages', title: 'VidiSmart Master List (Final)' },
    { path: 'vidismart.consultants.html', category: 'landing_pages', title: 'VidiSmart Consultants' },
    { path: 'vidismart.directory.html', category: 'landing_pages', title: 'VidiSmart Directory' },
    { path: 'vidismart.sectors.html', category: 'landing_pages', title: 'VidiSmart Sectors' },
    { path: 'vidismart.deck.html', category: 'landing_pages', title: 'VidiSmart Deck' },
    { path: 'vidismart.deck.agent.html', category: 'landing_pages', title: 'VidiSmart Agent Deck' },
    { path: 'vidismart.smartsearch.presentation.html', category: 'landing_pages', title: 'VidiSmart Smart Search' },
    { path: 'vidismart.streamstack.html', category: 'landing_pages', title: 'VidiSmart StreamStack' },
    // SmartGen tools
    { path: 'smartgen.html', category: 'tools', title: 'SmartGen' },
    { path: 'smartgen.tools.html', category: 'tools', title: 'SmartGen Tools' },
    { path: 'smartgen.vlm.html', category: 'tools', title: 'SmartGen VLM' },
    { path: 'smartgen.vlm2.html', category: 'tools', title: 'SmartGen VLM v2' },
    { path: 'smartgenvlm3.html', category: 'tools', title: 'SmartGen VLM v3' },
    { path: 'smartgen.flow.html', category: 'tools', title: 'SmartGen Flow' },
    { path: 'SmartGenUi.html', category: 'tools', title: 'SmartGen UI' },
    // Smart Stack
    { path: 'smart_stack_builder.html', category: 'tools', title: 'Smart Stack Builder' },
    { path: 'smart-stack-preview.html', category: 'tools', title: 'Smart Stack Preview' },
    { path: 'smart.stack.2026.html', category: 'tools', title: 'Smart Stack 2026' },
    { path: 'Ai_SmartStack_1.0.html', category: 'tools', title: 'AI SmartStack 1.0' },
    // SmartChannel CX
    { path: 'smartchannelcx.html', category: 'landing_pages', title: 'SmartChannel CX' },
    { path: 'smartchannelcx-tech.html', category: 'landing_pages', title: 'SmartChannel CX Tech' },
    { path: 'smartchannelcx.tech.html', category: 'landing_pages', title: 'SmartChannel CX Tech v2' },
    { path: 'SMART_CHANNEL_CX.html', category: 'landing_pages', title: 'Smart Channel CX' },
    // VidiSmart core pages
    { path: 'VidiSmart-1.html', category: 'landing_pages', title: 'VidiSmart v1' },
    { path: 'vidismart-2.html', category: 'landing_pages', title: 'VidiSmart v2' },
    { path: 'vidismartgen.html', category: 'landing_pages', title: 'VidiSmart Gen' },
    { path: 'vidismart.2026stream.html', category: 'landing_pages', title: 'VidiSmart 2026 Stream' },
    { path: 'vidismart.flowmap.html', category: 'landing_pages', title: 'VidiSmart Flow Map' },
    { path: 'vidismart.vvlogic.html', category: 'landing_pages', title: 'VidiSmart VV Logic' },
    { path: 'VidiSmart.VisualVectorKnowledgeGraph.html', category: 'landing_pages', title: 'VidiSmart Visual Vector KG' },
    { path: 'VidiSmart.VisualVectorSearch.html', category: 'landing_pages', title: 'VidiSmart Visual Vector Search' },
    { path: 'VidiSmart.VVTruth.html', category: 'landing_pages', title: 'VidiSmart VV Truth' },
    { path: 'VidiSmart.MarketDynamics.html', category: 'landing_pages', title: 'VidiSmart Market Dynamics' },
    // Agent & AI pages
    { path: 'vidismart.agentforce.presentation.html', category: 'landing_pages', title: 'VidiSmart Agentforce' },
    { path: 'Agent_Army_Orchestration_2026.html', category: 'documentation', title: 'Agent Army Orchestration 2026' },
    { path: 'Ai.Experts_Deploying_RAG_&_VRAG.html', category: 'documentation', title: 'AI Experts RAG & VRAG' },
    { path: 'AI_Models_2026.html', category: 'documentation', title: 'AI Models 2026' },
    { path: 'Ai_Models_OpenCode.2026.html', category: 'documentation', title: 'AI Models OpenCode 2026' },
    { path: 'VLM_Model_Comparison_2026.html', category: 'documentation', title: 'VLM Model Comparison 2026' },
    // Visual AI tools
    { path: 'visualai-tools.html', category: 'tools', title: 'Visual AI Tools' },
    { path: 'smartmedia.visualai.html', category: 'tools', title: 'SmartMedia Visual AI' },
    { path: 'visualvector.unified.html', category: 'tools', title: 'Visual Vector Unified' },
    { path: 'visualvector2.html', category: 'tools', title: 'Visual Vector v2' },
    { path: 'vidismart-visual-vector-knowledge-graph.html', category: 'tools', title: 'Visual Vector Knowledge Graph' },
    // Video pages
    { path: 'agentic.smartvideo.html', category: 'tools', title: 'Agentic Smart Video' },
    { path: 'smart.video2.html', category: 'tools', title: 'Smart Video v2' },
    { path: 'video.page.html', category: 'landing_pages', title: 'Video Page' },
    // Additional tools
    { path: 'gemini-chat.html', category: 'tools', title: 'Gemini Chat' },
    { path: 'gemini.dash.html', category: 'tools', title: 'Gemini Dashboard' },
    { path: 'gemini.vidismart.html', category: 'tools', title: 'Gemini VidiSmart' },
    { path: 'qwen3.5.hardware.html', category: 'tools', title: 'Qwen 3.5 Hardware' },
    { path: 'ImageSmash.html', category: 'tools', title: 'ImageSmash' },
    { path: 'imagesmash-v2.html', category: 'tools', title: 'ImageSmash v2' },
    { path: 'imagesmash-simple.html', category: 'tools', title: 'ImageSmash Simple' },
    { path: 'OmniSearch-1.html', category: 'tools', title: 'OmniSearch' },
    { path: 'vectorveo.html', category: 'tools', title: 'Vector Veo' },
    { path: 'AnthingLLM.Flow.html', category: 'tools', title: 'AnythingLLM Flow' },
    { path: 'AnythingLLM-Setup-Guide.html', category: 'documentation', title: 'AnythingLLM Setup Guide' },
    // Directories
    { path: 'ai-consultants-directory.html', category: 'directories', title: 'AI Consultants Directory' },
    { path: 'ai_consultants_directory_v4.html', category: 'directories', title: 'AI Consultants Directory v4' },
    { path: 'ai_visual_directory.html', category: 'directories', title: 'AI Visual Directory' },
    { path: 'ai_visual_rag_directory.html', category: 'directories', title: 'AI Visual RAG Directory' },
    // Comparison pages
    { path: 'ai-image-generation-comparison-2026.html', category: 'documentation', title: 'AI Image Gen Comparison 2026' },
    { path: 'ai-video-generation-comparison-2026.html', category: 'documentation', title: 'AI Video Gen Comparison 2026' },
    { path: 'competitive-analysis-2026.html', category: 'documentation', title: 'Competitive Analysis 2026' },
    { path: 'vidismart-competitive-analysis-2026.html', category: 'documentation', title: 'VidiSmart Competitive Analysis 2026' },
    // VidiMail / VidiShop
    { path: 'VIDIMAIL_COMPETITIVE_ANALYSIS_REPORT.html', category: 'documentation', title: 'VidiMail Competitive Analysis' },
    { path: 'VIDIMAIL_VIDIBLAST_SHOWCASE.html', category: 'documentation', title: 'VidiMail VidiBlast Showcase' },
    { path: 'vidishop.html', category: 'tools', title: 'VidiShop' },
    { path: 'VidiShop.Gen2.UI.html', category: 'tools', title: 'VidiShop Gen2 UI' },
    { path: 'VidiShop.SmartGenUi.html', category: 'tools', title: 'VidiShop SmartGen UI' },
    // Other
    { path: 'viditwin.html', category: 'tools', title: 'VidiTwin' },
    { path: 'viditwin2.html', category: 'tools', title: 'VidiTwin v2' },
    { path: 'vidiflow-case-studies-report.html', category: 'documentation', title: 'VidiFlow Case Studies' },
    { path: 'vidismart-launch-dashboard.html', category: 'tools', title: 'VidiSmart Launch Dashboard' },
    { path: 'FRAMEIO_UI_REFERENCE.html', category: 'documentation', title: 'Frame.io UI Reference' },
    { path: 'SENDSPARK_UI_REFERENCE.html', category: 'documentation', title: 'SendSpark UI Reference' },
    { path: 'SMART_CHANNEL_CX_ARCHITECTURE_PLAN.html', category: 'documentation', title: 'Smart Channel CX Architecture' },
    { path: 'VidiAi.Server.html', category: 'documentation', title: 'VidiAI Server' },
    { path: 'vidicrm.smartchannel.html', category: 'landing_pages', title: 'VidiCRM Smart Channel' },
    { path: 'AltText.vsSmartVectorAi.html', category: 'documentation', title: 'AltText vs Smart Vector AI' },
    { path: 'ai.power.html', category: 'landing_pages', title: 'AI Power' },
    { path: 'ai.edit.code.html', category: 'tools', title: 'AI Edit Code' },
    { path: 'pioneer.intelligence.html', category: 'landing_pages', title: 'Pioneer Intelligence' },
    { path: 'moderntechguidelines.html', category: 'documentation', title: 'Modern Tech Guidelines' },
    { path: '2026.ai.leaders.html', category: 'documentation', title: '2026 AI Leaders' },
    { path: 'topmodels.html', category: 'documentation', title: 'Top Models' },
    { path: 'xai.html', category: 'documentation', title: 'xAI' },
    { path: 'solar.html', category: 'documentation', title: 'Solar' },
    { path: 'collaboration-platforms.html', category: 'documentation', title: 'Collaboration Platforms' },
    { path: 'video-platforms.html', category: 'documentation', title: 'Video Platforms' },
    { path: 'tech-guide.html', category: 'documentation', title: 'Tech Guide' },
    { path: 'techstack1.html', category: 'documentation', title: 'Tech Stack' },
    { path: 'seoschemadata.html', category: 'documentation', title: 'SEO Schema Data' },
    { path: 'master-index.html', category: 'landing_pages', title: 'Master Index' },
    { path: 'master-menu.html', category: 'landing_pages', title: 'Master Menu' },
    { path: 'dashboard.html', category: 'tools', title: 'Dashboard' },
    { path: 'collab.html', category: 'tools', title: 'Collab' },
    { path: 'network.html', category: 'tools', title: 'Network' },
    { path: 'brand-swap.html', category: 'tools', title: 'Brand Swap' },
    { path: 'file-manager.html', category: 'tools', title: 'File Manager' },
    { path: 'flow_gallery.html', category: 'tools', title: 'Flow Gallery' },
    { path: 'logo-preview.html', category: 'tools', title: 'Logo Preview' },
    { path: 'logo_replacer_ui.html', category: 'tools', title: 'Logo Replacer UI' },
    { path: 'animation-showcase.html', category: 'tools', title: 'Animation Showcase' },
    { path: 'animation-showcase-lottie.html', category: 'tools', title: 'Animation Showcase Lottie' },
    { path: 'pdf_reader.html', category: 'tools', title: 'PDF Reader' },
    { path: 'photo101.html', category: 'documentation', title: 'Photo 101' },
    { path: 'pipethis.html', category: 'tools', title: 'Pipe This' },
    { path: 'pitch_deck_images.html', category: 'tools', title: 'Pitch Deck Images' },
    { path: 'resources-section-new.html', category: 'landing_pages', title: 'Resources Section' },
    { path: 'superbowl-nav.html', category: 'landing_pages', title: 'Superbowl Nav' },
    { path: 'team-profiles.html', category: 'landing_pages', title: 'Team Profiles' },
    { path: 'test-input.html', category: 'tools', title: 'Test Input' },
    { path: 'test-video.html', category: 'tools', title: 'Test Video' },
    { path: 'trading-dashboard.html', category: 'tools', title: 'Trading Dashboard' },
    { path: 'truefi.html', category: 'tools', title: 'TrueFi' },
    { path: 'truefi.index.html', category: 'tools', title: 'TrueFi Index' },
    { path: 'truefi2.html', category: 'tools', title: 'TrueFi v2' },
    { path: 'unified-nav.html', category: 'landing_pages', title: 'Unified Nav' },
    { path: 'waitlist.html', category: 'landing_pages', title: 'Waitlist' },
    { path: 'Ai Team Project Collab.html', category: 'tools', title: 'AI Team Project Collab' },
    { path: 'airpmd.html', category: 'tools', title: 'AIR PMD' },
    { path: 'api-registration-app.html', category: 'tools', title: 'API Registration App' },
    { path: 'directus-extensions.html', category: 'documentation', title: 'Directus Extensions' },
    { path: 'dream.team.open.html', category: 'landing_pages', title: 'Dream Team Open' },
    { path: 'FortunaTrade.html', category: 'tools', title: 'FortunaTrade' },
    { path: 'FortunaTrade-unified.html', category: 'tools', title: 'FortunaTrade Unified' },
    { path: 'glm_features_showcase.html', category: 'tools', title: 'GLM Features Showcase' },
    { path: 'joe.accting.html', category: 'tools', title: 'Joe Accounting' },
    { path: 'kc.html', category: 'landing_pages', title: 'KC' },
    { path: 'keto.html', category: 'landing_pages', title: 'Keto' },
    { path: 'kratom_kava_directory.html', category: 'directories', title: 'Kratom Kava Directory' },
    { path: 'kratom_kava_complete_directory.html', category: 'directories', title: 'Kratom Kava Complete Directory' },
    { path: 'menu.html', category: 'landing_pages', title: 'Menu' },
    { path: 'mm-nav-test.html', category: 'tools', title: 'MM Nav Test' },
    { path: 'new.html', category: 'landing_pages', title: 'New' },
    { path: 'nextnet_design.html', category: 'tools', title: 'NextNet Design' },
    { path: 'open-apps.html', category: 'tools', title: 'Open Apps' },
    { path: 'PMax.Google.Vidi.SmartChannel1.html', category: 'documentation', title: 'PMax Google Vidi SmartChannel' },
    { path: 'PMD.SiteUp.html', category: 'tools', title: 'PMD SiteUp' },
    { path: 'SERVER_CLEANUP_CHECKLIST.html', category: 'documentation', title: 'Server Cleanup Checklist' },
    { path: 'smart.accounting.html', category: 'tools', title: 'Smart Accounting' },
    { path: 'smart.accounting2.html', category: 'tools', title: 'Smart Accounting v2' },
    { path: 'smartchannel-cx-files.html', category: 'landing_pages', title: 'SmartChannel CX Files' },
    { path: 'vidifund.acct.html', category: 'tools', title: 'VidiFund Accounting' },
    { path: 'vidismart_deck.html', category: 'landing_pages', title: 'VidiSmart Deck v2' },
    { path: 'vidi_llc_index.html', category: 'landing_pages', title: 'Vidi LLC Index' },
    { path: 'agent-dashboard.html', category: 'tools', title: 'Agent Dashboard' },
    { path: 'agent-login.html', category: 'tools', title: 'Agent Login' },
    { path: 'agent-profile.html', category: 'tools', title: 'Agent Profile' },
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

    // Check for access token (skip for dry-run)
    if (!dryRun && !CONFIG.accessToken) {
        console.error('❌ Error: DIRECTUS_ACCESS_TOKEN environment variable is required');
        console.error('   Set it with: export DIRECTUS_ACCESS_TOKEN="your-token-here"');
        console.error('   Or use --dry-run to preview without a token');
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
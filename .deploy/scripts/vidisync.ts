import { createDirectus, rest, readItems } from "@directus/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local");
    console.log("Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.");
    process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL).with(rest());
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * SYNC COMPANIES
 */
async function syncCompanies() {
    console.log("🔍 Fetching companies from local Directus...");
    try {
        const companies = await directus.request(readItems("companies", { limit: -1 }));
        console.log(`✅ Found ${companies.length} companies.`);

        for (const company of companies) {
            const { error } = await supabase.from("companies").upsert({
                slug: company.slug || `company-${company.id}`,
                name: company.name,
                industry: company.industry,
                logo_url: company.logo,
                video_profile_url: company.video_profile,
                website_url: company.website,
                city: company.city,
                state: company.state,
                country: company.country,
                revenue_range: company.revenue,
                employee_count: company.employees,
                description: company.description,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'slug' });

            if (error) console.error(`❌ Error syncing company ${company.name}:`, error.message);
        }
    } catch (err) {
        console.error("❌ Failed to fetch companies:", err);
    }
}

/**
 * SYNC TECH TOOLS
 */
async function syncTools() {
    console.log("🔍 Fetching tech tools from local Directus...");
    try {
        const tools = await directus.request(readItems("tools", { limit: -1 }));
        console.log(`✅ Found ${tools.length} tools.`);

        for (const tool of tools) {
            const { error } = await supabase.from("tech_items").upsert({
                slug: tool.slug || tool.id.toString(),
                name: tool.name,
                category: tool.category,
                description: tool.description,
                website_url: tool.url,
                icon_url: tool.logo,
                ranking: tool.ranking || 0,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'slug' });

            if (error) console.error(`❌ Error syncing tool ${tool.name}:`, error.message);
        }
    } catch (err) {
        console.error("❌ Failed to fetch tools:", err);
    }
}

/**
 * SYNC CASE STUDIES / NEWS
 */
async function syncCaseStudies() {
    console.log("🔍 Fetching news/case studies from local Directus...");
    try {
        const news = await directus.request(readItems("ai_news", { limit: -1 }));
        console.log(`✅ Found ${news.length} news/case studies.`);

        for (const item of news) {
            const { error } = await supabase.from("case_studies").upsert({
                slug: item.slug || item.id.toString(),
                title: item.title,
                company_name: item.company_name,
                industry: item.category || item.industry,
                roi_percentage: item.roi,
                timeline: item.timeline,
                problem_description: item.problem,
                solution_description: item.solution,
                results_description: item.results,
                video_url: item.video_content,
                source_url: item.source_url,
                thumbnail_url: item.thumbnail,
                published: true,
                created_at: item.published_date || new Date().toISOString(),
            }, { onConflict: 'slug' });

            if (error) console.error(`❌ Error syncing case study ${item.title}:`, error.message);
        }
    } catch (err) {
        console.error("❌ Failed to fetch news:", err);
    }
}

async function runSync() {
    console.log("🚀 STARTING VIDIFLOW MASTER SYNC...");
    console.log(`📡 Directus: ${DIRECTUS_URL}`);
    console.log(`☁️ Supabase: ${SUPABASE_URL}`);

    await syncCompanies();
    await syncTools();
    await syncCaseStudies();

    console.log("🏁 MASTER SYNC COMPLETE.");
}

runSync();

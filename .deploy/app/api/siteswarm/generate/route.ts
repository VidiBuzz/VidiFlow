import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  
  if (!supabase) {
    return NextResponse.json({ 
      success: false, 
      error: "Database not configured" 
    }, { status: 500 });
  }
  
  try {
    console.log("[SiteSwarm] Initializing generation sequence via Supabase...");

    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*');

    if (companyError) throw companyError;
    if (!companies || companies.length === 0) {
      return NextResponse.json({ success: false, error: "No companies found in CRM." }, { status: 404 });
    }

    console.log(`[SiteSwarm] Found ${companies.length} companies.`);

    const facets = [
      { name: "Executive Leadership", slug: "exec", category: "Role" },
      { name: "Technical Implementation", slug: "tech", category: "Role" },
      { name: "Procurement & Finance", slug: "finance", category: "Role" },
      { name: "End User Training", slug: "training", category: "Role" }
    ];

    const batchId = crypto.randomUUID();
    const swarmEntries = [];

    for (const company of companies) {
      for (const facet of facets) {
        const slug = `${company.slug}-${facet.slug}`;
        const title = `${company.name} for ${facet.name}`;

        swarmEntries.push({
          company_id: company.id,
          slug: slug,
          title: title,
          status: 'draft',
          generation_batch_id: batchId,
          visual_assets: [],
          content_html: `<p>Generated content for ${company.name} targeting ${facet.name}...</p>`
        });
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from('site_swarm_pages')
      .upsert(swarmEntries, { onConflict: 'slug' })
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      totalCreated: inserted?.length || 0,
      batchId: batchId,
      message: `Successfully generated ${inserted?.length} faceted content pages.`
    });

  } catch (error: any) {
    console.error("[SiteSwarm] Generation failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

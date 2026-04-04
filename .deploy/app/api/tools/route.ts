import { NextRequest, NextResponse } from "next/server";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const sort = searchParams.get("sort") || "ranking";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {
      limit,
      offset,
      sort: [`-${sort}`],
    };

    // Category filter
    if (category && category !== "All Tools") {
      query.filter = {
        category: { _eq: category },
      };
    }

    // Search filter
    if (search) {
      query.search = search;
    }

    const tools = await directus.request(
      readItems('tools', query)
    );

    return NextResponse.json({
      success: true,
      data: tools,
      meta: { total: tools?.length || 0 },
    });
  } catch (error) {
    console.error("Tools API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}

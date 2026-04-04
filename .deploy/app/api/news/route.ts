import { NextRequest, NextResponse } from "next/server";
import { fetchNews } from "@/lib/directus";
import { searchNews, indexNews } from "@/lib/vespa";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");

    if (query) {
      // Search mode - use Vespa
      const results = await searchNews(query, { 
        limit, 
        filter: category ? `category = "${category}"` : undefined 
      });
      return NextResponse.json({ 
        success: true, 
        data: results,
        source: "vespa-search" 
      });
    }

    // Fetch from Directus/PostgreSQL
    const news = await fetchNews();
    
    return NextResponse.json({ 
      success: true, 
      data: news.data,
      source: "database" 
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, newsItem } = body;

    if (action === "index" && newsItem) {
      // Index news item in Vespa
      const success = await indexNews(newsItem);
      return NextResponse.json({ 
        success, 
        message: success ? "Indexed successfully" : "Indexing failed" 
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("News POST error:", error);
    return NextResponse.json(
      { success: false, error: "Operation failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getVespaClient } from "@/lib/vespa";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type = "hybrid", limit = 20 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const client = getVespaClient();
    
    // Determine search type
    let yql: string;
    let ranking = "default";
    
    switch (type) {
      case "vector":
        yql = `SELECT * FROM vidismart WHERE {targetHits:${limit}}nearestNeighbor(embedding, query_embedding)`;
        ranking = "semantic";
        break;
      case "text":
        yql = `SELECT * FROM vidismart WHERE userQuery()`;
        ranking = "bm25";
        break;
      default:
        // hybrid - combines vector and text search
        yql = `SELECT * FROM vidismart WHERE 
               ({targetHits:${limit}}nearestNeighbor(embedding, query_embedding)) 
               OR userQuery()`;
        ranking = "hybrid";
    }

    const results = await client.query({
      yql,
      input: { query_embedding: await embedQuery(query) },
      ranking,
      hits: limit,
    });

    return NextResponse.json({
      success: true,
      data: results.hits,
      query,
      type,
      totalCount: results.hits?.length || 0,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}

// Placeholder embedding function
// In production, use mxbai-embed-large or similar
async function embedQuery(text: string): Promise<number[]> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const embedding = new Array(1024).fill(0);
  
  for (let i = 0; i < Math.min(data.length, 1024); i++) {
    embedding[i] = data[i] / 255;
  }
  
  return embedding;
}

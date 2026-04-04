import { NextRequest, NextResponse } from "next/server";

// GROK_API_KEY for news aggregation
// Sign up at https://openrouter.ai/ for free access

const GROK_API_KEY = process.env.OPENROUTER_API_KEY;
const GROK_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  published_date: string;
  summary: string;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics = ["visual AI", "creator economy", "AI video generation"], limit = 10 } = body;

    if (!GROK_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use Grok 4.1 Fast for web research and news aggregation
    const prompt = `You are a news aggregator for VidiFlow. Research and find the latest ${limit} news articles about: ${topics.join(", ")}.

For each article, provide:
1. Title (exact headline)
2. URL (direct link to article)
3. Source (website name)
4. Published date (YYYY-MM-DD format)
5. One-sentence summary
6. Category (visual-ai, creator-economy, video-gen, or general)

Format as JSON array with this structure:
[
  {
    "title": "Article Headline",
    "url": "https://...",
    "source": "Website Name",
    "published_date": "2026-01-20",
    "summary": "Brief summary",
    "category": "visual-ai"
  }
]

Only return valid JSON, no additional text.`;

    const response = await fetch(GROK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROK_API_KEY}`,
        "HTTP-Referer": "https://vidiflow.ai",
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful news research assistant for VidiFlow's SmartChannel CX."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response
    const articles: NewsArticle[] = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));

    return NextResponse.json({
      success: true,
      data: articles,
      model: "grok-4.1-fast",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News aggregation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to aggregate news" },
      { status: 500 }
    );
  }
}

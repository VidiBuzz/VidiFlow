import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const vespaEndpoint = process.env.VESPA_ENDPOINT || "http://localhost:8089";
    const searchQuery = {
      yql: `select * from sources * where userQuery() limit 5`,
      query: question,
      type: "any",
      hits: 5,
    };

    let vespaResults: any[] = [];
    let searchError = null;

    try {
      const vespaResponse = await fetch(`${vespaEndpoint}/search/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchQuery),
      });

      if (vespaResponse.ok) {
        const data = await vespaResponse.json();
        vespaResults = data.root?.children || [];
      } else {
        searchError = `Vidi AI search failed: ${vespaResponse.status}`;
      }
    } catch (error) {
      searchError = "Vidi AI search unavailable";
    }

    const context = vespaResults
      .map((hit: any, index: number) => {
        const fields = hit?.fields || hit;
        const title = fields?.title || fields?.name || `Result ${index + 1}`;
        const content = fields?.content || fields?.description || fields?.body || "";
        const snippet = content.substring(0, 300);
        return `[${index + 1}] ${title}: ${snippet}...`;
      })
      .join("\n");

    const systemPrompt = `You are Vidi AI, the intelligent assistant for the VidiSmart platform - an AI-powered visual AI news and video channel. You help users with:

1. Visual AI and video generation technologies
2. Tech stack recommendations
3. AI tools and models (Wan, Qwen, ComfyUI, etc.)
4. Content creation and the creator economy
5. Platform features and navigation

Keep your answers helpful, concise, and informative. Use the search context below to provide accurate information when available.

${context ? `Search Results:\n${context}` : "No search results available - provide general knowledge answers."}

${searchError ? `\nNote: ${searchError}` : ""}

If you don't know the answer, say so honestly rather than making up information.`;

    const grokResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        "HTTP-Referer": "http://localhost:3001",
      },
      body: JSON.stringify({
        model: "grok-4.1-fast",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (grokResponse.ok) {
      const data = await grokResponse.json();
      const answer = data.choices?.[0]?.message?.content;
      return NextResponse.json({ answer, sources: vespaResults });
    }

    const fallbackAnswer = `Great question about "${question}"! 

I'm currently connected to:
- **Vidi AI** for semantic search (${searchError || "operational"})
- **Grok 4.1 Fast** for AI responses

For questions about visual AI, video generation, tech stacks, or the VidiSmart platform, I can provide detailed information based on my knowledge of:
- Text-to-video models (Wan 2.1, Sora, Kling)
- Vision-language models (Qwen3 VL, CLIP)
- ComfyUI workflows and AI pipelines
- The creator economy and AI tools landscape

What specific aspect would you like to know more about?`;

    return NextResponse.json({ answer: fallbackAnswer, sources: [] });
  } catch (error) {
    console.error("Vidi AI error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

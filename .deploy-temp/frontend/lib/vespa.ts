// Vidi Ai client using fetch API
// Use this for server components and API routes

const VESPA_ENDPOINT = process.env.VESPA_ENDPOINT || "http://localhost:8089";
const VESPA_CONTAINER_ENDPOINT = process.env.VESPA_CONTAINER_ENDPOINT || "http://localhost:8089";
export const VIDI_AI_DISPLAY_NAME = "Vidi Ai";
export const VIDI_AI_DESCRIPTION = "Visual Vector Smart search";

export interface VespaSearchResult {
  id: string;
  fields: Record<string, any>;
  relevance: number;
}

export interface VespaHit {
  id: string;
  relevance: number;
  fields: Record<string, any>;
}

export interface VespaQueryResponse {
  root: {
    children: VespaHit[];
  };
}

export async function searchNews(
  query: string,
  options?: { limit?: number; filter?: string }
): Promise<VespaSearchResult[]> {
  try {
    const limit = options?.limit || 20;
    
    // Build YQL query
    let yql = `SELECT * FROM vidismart WHERE `;
    
    if (query && query.trim()) {
      yql += `userQuery()`;
    } else {
      yql += `TRUE`;
    }
    
    // Build URL with query parameters
    const params = new URLSearchParams({
      yql,
      hits: limit.toString(),
      ranking: 'hybrid',
      format: 'json',
    });
    
    if (options?.filter) {
      params.append('filter', options.filter);
    }
    
    // For text search, add the query parameter
    if (query && query.trim()) {
      params.append('query', query);
    }
    
    const response = await fetch(`${VESPA_CONTAINER_ENDPOINT}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Vidi Ai search failed: ${response.statusText}`);
    }
    
    const data: VespaQueryResponse = await response.json();
    
    return data.root.children.map((hit) => ({
      id: hit.id,
      fields: hit.fields || {},
      relevance: hit.relevance,
    }));
  } catch (error) {
    console.error("Vidi Ai search error:", error);
    return [];
  }
}

export async function searchTools(
  query: string,
  options?: { limit?: number; category?: string; pricing?: string }
): Promise<VespaSearchResult[]> {
  try {
    const limit = options?.limit || 20;
    
    let yql = `SELECT * FROM vidismart WHERE TRUE`;
    
    if (query && query.trim()) {
      yql += ` AND (userQuery() OR name CONTAINS "${query}" OR description CONTAINS "${query}")`;
    }
    
    if (options?.category) {
      yql += ` AND category = "${options.category}"`;
    }
    
    if (options?.pricing) {
      yql += ` AND pricing = "${options.pricing}"`;
    }
    
    const params = new URLSearchParams({
      yql,
      hits: limit.toString(),
      ranking: 'hybrid',
      format: 'json',
    });
    
    if (query && query.trim()) {
      params.append('query', query);
    }
    
    const response = await fetch(`${VESPA_CONTAINER_ENDPOINT}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Vidi Ai search failed: ${response.statusText}`);
    }
    
    const data: VespaQueryResponse = await response.json();
    
    return data.root.children.map((hit) => ({
      id: hit.id,
      fields: hit.fields || {},
      relevance: hit.relevance,
    }));
  } catch (error) {
    console.error("Vidi Ai tools search error:", error);
    return [];
  }
}

export async function indexNews(newsItem: {
  id: string;
  title: string;
  content: string;
  published_date: string;
  embedding?: number[];
}): Promise<boolean> {
  try {
    const document = {
      id: `id:content:content::${newsItem.id}`,
      fields: {
        id: newsItem.id,
        title: newsItem.title,
        body: newsItem.content,
        content_type: "news",
        published_date: newsItem.published_date,
        url: `https://vidismart.com/news/${newsItem.id}`,
        created_at: Date.now(),
      },
    };
    
    const response = await fetch(`${VESPA_ENDPOINT}/document/v1/vidismart/content/docid/${newsItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(document),
    });
    
    if (!response.ok) {
      throw new Error(`Vidi Ai index failed: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Vidi Ai index error:", error);
    return false;
  }
}

export async function indexTool(toolItem: {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  website: string;
  embedding?: number[];
}): Promise<boolean> {
  try {
    const document = {
      id: `id:content:content::tool_${toolItem.id}`,
      fields: {
        id: `tool_${toolItem.id}`,
        title: toolItem.name,
        body: toolItem.description,
        content_type: "tool",
        url: toolItem.website,
        tags: [toolItem.category, toolItem.pricing],
        metadata: JSON.stringify({
          category: toolItem.category,
          pricing: toolItem.pricing,
        }),
      },
    };
    
    const response = await fetch(`${VESPA_ENDPOINT}/document/v1/vidismart/content/docid/tool_${toolItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(document),
    });
    
    if (!response.ok) {
      throw new Error(`Vidi Ai tool index failed: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Vidi Ai tool index error:", error);
    return false;
  }
}

export async function getVespaStatus(): Promise<{ healthy: boolean; endpoint: string }> {
  try {
    const response = await fetch(`${VESPA_ENDPOINT}/status.html`);
    return {
      healthy: response.ok,
      endpoint: VESPA_ENDPOINT,
    };
  } catch (error) {
    return {
      healthy: false,
      endpoint: VESPA_ENDPOINT,
    };
  }
}

export function getVespaClient() {
  return {
    query: async (params: { yql: string; input?: { query_embedding: number[] }; ranking: string; hits: number }) => {
      const queryParams = new URLSearchParams({
        yql: params.yql,
        hits: params.hits.toString(),
        ranking: params.ranking,
        format: "json",
      });

      if (params.input?.query_embedding) {
        queryParams.append("input.query_embedding", JSON.stringify(params.input.query_embedding));
      }

      const response = await fetch(`${VESPA_CONTAINER_ENDPOINT}/search?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Vidi Ai query failed: ${response.statusText}`);
      }

      return response.json();
    },
  };
}

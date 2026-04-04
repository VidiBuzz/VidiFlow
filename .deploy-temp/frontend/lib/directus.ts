import { createDirectus, rest, readItems } from "@directus/sdk";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

export const directus = createDirectus(DIRECTUS_URL)
  .with(rest());

export type Schema = {
  companies: {
    id: string;
    slug: string | null;
    name: string;
    industry: string | null;
    logo: string | null;
    video_profile: string | null;
    website: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    revenue: string | null;
    employees: string | null;
    description: string | null;
    location: any;
    created_at: string;
  };
  people: {
    id: string;
    full_name: string;
    role: string;
    vidi_bio_url: string | null;
    is_c_suite: boolean;
    location: any;
    company_id: string | null;
  };
  ai_news: {
    id: string;
    slug: string | null;
    title: string;
    company_name: string | null;
    category: string | null;
    industry: string | null;
    roi: string | null;
    timeline: string | null;
    problem: string | null;
    solution: string | null;
    results: string | null;
    video_content: string | null;
    source_url: string | null;
    thumbnail: string | null;
    published_date: string;
    embedding: number[];
  };
  tools: {
    id: string;
    slug: string | null;
    name: string;
    category: string;
    description: string | null;
    url: string | null;
    logo: string | null;
    ranking: number;
  };
  audience_facets: {
    id: string;
    name: string;
    criteria_json: Record<string, any>;
  };
  campaigns: {
    id: string;
    title: string;
    status: string;
    target_audience: string;
    created_at: string;
  };
};

export async function fetchCompanies() {
  try {
    const result = await directus.request(
      readItems('companies', {
        limit: 100,
        sort: ['-created_at'],
      })
    );
    return { data: result || [] };
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { data: [] };
  }
}

export async function fetchNews() {
  try {
    const result = await directus.request(
      readItems('ai_news', {
        limit: 50,
        sort: ['-published_date'],
      })
    );
    return { data: result || [] };
  } catch (error) {
    console.error("Error fetching news:", error);
    return { data: [] };
  }
}

export async function fetchTools() {
  try {
    const result = await directus.request(
      readItems('tools', {
        limit: 100,
        sort: ['-ranking'],
      })
    );
    return { data: result || [] };
  } catch (error) {
    console.error("Error fetching tools:", error);
    return { data: [] };
  }
}

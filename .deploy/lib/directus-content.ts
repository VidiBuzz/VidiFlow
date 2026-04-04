// Directus Content Management for VidiFlow
// Use this to fetch all CMS content from Directus

import { directus } from "./directus";
import { readItems, readSingleton } from "@directus/sdk";

// ============================================================
// NEWS ARTICLES
// ============================================================
export async function getNewsArticles(options?: {
  limit?: number;
  category?: string;
  featured?: boolean;
}) {
  const filters: any = {
    status: { _eq: "published" },
  };
  
  if (options?.category) {
    filters.category = { _eq: options.category };
  }
  
  if (options?.featured) {
    filters.is_featured = { _eq: true };
  }

  try {
    const articles = await directus.request(
      readItems("news_articles", {
        limit: options?.limit || 50,
        sort: ["-published_at"],
        filter: filters,
        fields: [
          "*",
          "featured_image.id",
          "featured_image.filename_disk",
          "author_avatar.id",
          "author_avatar.filename_disk",
        ],
      })
    );
    return articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function getNewsArticleBySlug(slug: string) {
  try {
    const articles = await directus.request(
      readItems("news_articles", {
        filter: {
          slug: { _eq: slug },
          status: { _eq: "published" },
        },
        limit: 1,
        fields: [
          "*",
          "featured_image.id",
          "featured_image.filename_disk",
          "author_avatar.id",
          "author_avatar.filename_disk",
        ],
      })
    );
    return articles[0] || null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// ============================================================
// PAGES
// ============================================================
export async function getPageBySlug(slug: string) {
  try {
    const pages = await directus.request(
      readItems("pages", {
        filter: {
          slug: { _eq: slug },
          status: { _eq: "published" },
        },
        limit: 1,
        fields: [
          "*",
          "hero_image.id",
          "hero_image.filename_disk",
        ],
      })
    );
    return pages[0] || null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function getHomepage() {
  try {
    const pages = await directus.request(
      readItems("pages", {
        filter: {
          is_homepage: { _eq: true },
          status: { _eq: "published" },
        },
        limit: 1,
        fields: [
          "*",
          "hero_image.id",
          "hero_image.filename_disk",
          "hero_video.id",
          "hero_video.filename_disk",
        ],
      })
    );
    return pages[0] || null;
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

// ============================================================
// SECTIONS (Reusable Content Blocks)
// ============================================================
export async function getSectionByKey(key: string) {
  try {
    const sections = await directus.request(
      readItems("sections", {
        filter: {
          key: { _eq: key },
          status: { _eq: "published" },
        },
        limit: 1,
        fields: [
          "*",
          "image.id",
          "image.filename_disk",
          "video.id",
          "video.filename_disk",
        ],
      })
    );
    return sections[0] || null;
  } catch (error) {
    console.error("Error fetching section:", error);
    return null;
  }
}

export async function getSectionsByType(type: string) {
  try {
    const sections = await directus.request(
      readItems("sections", {
        filter: {
          type: { _eq: type },
          status: { _eq: "published" },
        },
        sort: ["sort"],
        fields: [
          "*",
          "image.id",
          "image.filename_disk",
        ],
      })
    );
    return sections;
  } catch (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
}

// ============================================================
// NAVIGATION
// ============================================================
export async function getNavigation(location: "header" | "footer") {
  try {
    const nav = await directus.request(
      readItems("navigation", {
        filter: {
          location: { _eq: location },
          status: { _eq: "published" },
        },
        limit: 1,
      })
    );
    return nav[0]?.items || [];
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return [];
  }
}

// ============================================================
// TESTIMONIALS
// ============================================================
export async function getTestimonials(limit?: number) {
  try {
    const testimonials = await directus.request(
      readItems("testimonials", {
        filter: { status: { _eq: "published" } },
        sort: ["-date_created"],
        limit: limit || 10,
        fields: [
          "*",
          "avatar.id",
          "avatar.filename_disk",
          "video_testimonial.id",
          "video_testimonial.filename_disk",
        ],
      })
    );
    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

// ============================================================
// FAQs
// ============================================================
export async function getFAQs(category?: string) {
  const filters: any = {
    status: { _eq: "published" },
  };
  
  if (category) {
    filters.category = { _eq: category };
  }

  try {
    const faqs = await directus.request(
      readItems("faqs", {
        filter: filters,
        sort: ["sort", "category"],
      })
    );
    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

// ============================================================
// TEAM MEMBERS
// ============================================================
export async function getTeamMembers(options?: {
  featured?: boolean;
  limit?: number;
}) {
  const filters: any = {
    status: { _eq: "published" },
  };
  
  if (options?.featured) {
    filters.is_featured = { _eq: true };
  }

  try {
    const members = await directus.request(
      readItems("team_members", {
        filter: filters,
        sort: ["sort", "name"],
        limit: options?.limit || 100,
        fields: [
          "*",
          "photo.id",
          "photo.filename_disk",
        ],
      })
    );
    return members;
  } catch (error) {
    console.error("Error fetching team:", error);
    return [];
  }
}

export async function getTeamMemberBySlug(slug: string) {
  try {
    const members = await directus.request(
      readItems("team_members", {
        filter: {
          slug: { _eq: slug },
          status: { _eq: "published" },
        },
        limit: 1,
        fields: [
          "*",
          "photo.id",
          "photo.filename_disk",
        ],
      })
    );
    return members[0] || null;
  } catch (error) {
    console.error("Error fetching team member:", error);
    return null;
  }
}

// ============================================================
// CTAs (Calls to Action)
// ============================================================
export async function getCTA(key: string) {
  try {
    const ctas = await directus.request(
      readItems("ctas", {
        filter: {
          key: { _eq: key },
          status: { _eq: "published" },
        },
        limit: 1,
      })
    );
    return ctas[0] || null;
  } catch (error) {
    console.error("Error fetching CTA:", error);
    return null;
  }
}

// ============================================================
// FILE URL HELPERS
// ============================================================
export function getFileUrl(fileId: string | null, options?: {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "inside" | "outside";
  quality?: number;
}) {
  if (!fileId) return null;
  
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";
  let url = `${baseUrl}/assets/${fileId}`;
  
  if (options) {
    const params = new URLSearchParams();
    if (options.width) params.append("width", options.width.toString());
    if (options.height) params.append("height", options.height.toString());
    if (options.fit) params.append("fit", options.fit);
    if (options.quality) params.append("quality", options.quality.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
}
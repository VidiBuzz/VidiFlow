import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export const supabase = createSupabaseClient();

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  industry: string;
  company_size?: string;
  annual_revenue?: string;
  investment_amount?: string;
  roi_percentage?: string;
  timeline?: string;
  problem_description?: string;
  solution_description?: string;
  results_description?: string;
  key_metrics?: any;
  video_url?: string;
  video_thumbnail?: string;
  source_url: string;
  thumbnail_url?: string;
  hero_image_url?: string;
  logo_url?: string;
  owner_name?: string;
  owner_email?: string;
  created_by?: string;
  updated_by?: string;
  published_at?: string;
  status?: string;
  category?: string;
  tags?: string[];
  views: number;
  featured: boolean;
  created_at: string;
  published: boolean;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  industry?: string;
  logo_url?: string;
  video_profile_url?: string;
  website_url?: string;
  city?: string;
  state?: string;
  country?: string;
  revenue_range?: string;
  employee_count?: string;
  description?: string;
  social_links?: any;
  created_at: string;
  updated_at: string;
};

export type TechItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
  website_url?: string;
  video_url?: string;
  icon_url?: string;
  ranking: number;
  is_featured: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
};

export type Consultant = {
  id: string;
  slug: string;
  name: string;
  business_type: string;
  description?: string;
  region?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  rating?: number;
  review_count: number;
  logo_url?: string;
  video_url?: string;
  featured: boolean;
  specialties?: string[];
  industries?: string[];
  status: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsultantCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at: string;
};

export type Region = {
  id: string;
  name: string;
  slug: string;
  country: string;
  latitude?: number;
  longitude?: number;
  sort_order: number;
  created_at: string;
};

export async function getCaseStudies(industry?: string, limit: number = 50) {
  if (!supabase) return [];
  
  let query = supabase
    .from('case_studies')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (industry && industry !== 'all') {
    query = query.eq('industry', industry);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }

  return data as CaseStudy[];
}

export async function getCaseStudyById(id: string) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching case study:', error);
    return null;
  }

  return data as CaseStudy;
}

export async function getConsultants(
  options?: {
    businessType?: string;
    region?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  if (!supabase) return [];
  
  let query = supabase
    .from('consultants')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (options?.businessType) {
    query = query.eq('business_type', options.businessType);
  }
  if (options?.region) {
    query = query.eq('region', options.region);
  }
  if (options?.city) {
    query = query.eq('city', options.city);
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching consultants:', error);
    return [];
  }

  return data as Consultant[];
}

export async function getConsultantBySlug(slug: string) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching consultant:', error);
    return null;
  }

  return data as Consultant;
}

export async function getConsultantCategories() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('consultant_categories')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching consultant categories:', error);
    return [];
  }

  return data as ConsultantCategory[];
}

export async function getConsultantRegions() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching regions:', error);
    return [];
  }

  return data as Region[];
}

export async function getConsultantStats() {
  if (!supabase) return { total_consultants: 0, total_categories: 0, total_regions: 0, total_cities: 0 };
  
  const { data, error } = await supabase
    .from('consultant_directory_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching consultant stats:', error);
    return { total_consultants: 0, total_categories: 0, total_regions: 0, total_cities: 0 };
  }

  return data;
}

export async function searchConsultants(query: string) {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching consultants:', error);
    return [];
  }

  return data as Consultant[];
}

export type LandingSection = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  content: any;
  display_order: number;
  is_active: boolean;
};

export type LandingStat = {
  id: string;
  value: string;
  label: string;
  description: string;
  display_order: number;
};

export async function getLandingSections() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('landing_sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching landing sections:', error);
    return [];
  }

  return data as LandingSection[];
}

export async function getLandingStats() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('landing_stats')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching landing stats:', error);
    return [];
  }

  return data as LandingStat[];
}

export async function getNewsArticles(limit: number = 10, category?: string) {
  if (!supabase) return [];
  
  let query = supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }

  return data;
}

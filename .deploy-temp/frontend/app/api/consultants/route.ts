import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface Consultant {
    id: string;
    name: string;
    business_type: string;
    rating: number | null;
    description: string | null;
    region: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    logo_url: string | null;
    is_verified: boolean;
    is_featured: boolean;
    created_at: string;
}

/**
 * GET /api/consultants
 * 
 * Query Parameters:
 * - type: string - Filter by business type
 * - region: string - Filter by region
 * - search: string - Search by name or description
 * - featured: boolean - Only return featured consultants
 * - limit: number - Limit results (default: 50)
 * - offset: number - Pagination offset
 * 
 * Returns: List of AI consultants
 */
export async function GET(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);

        const businessType = searchParams.get('type');
        const region = searchParams.get('region');
        const searchQuery = searchParams.get('search');
        const featured = searchParams.get('featured') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build the query
        let query = supabase
            .from('ai_consultants')
            .select('*', { count: 'exact' });

        // Apply filters
        if (businessType) {
            query = query.eq('business_type', businessType);
        }

        if (region) {
            query = query.eq('region', region);
        }

        if (featured) {
            query = query.eq('is_featured', true);
        }

        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // Apply pagination
        query = query
            .order('is_featured', { ascending: false })
            .order('rating', { ascending: false })
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);

        const { data: consultants, error, count } = await query;

        if (error) {
            console.error('Consultants fetch error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch consultants', details: error.message },
                { status: 500 }
            );
        }

        // Get unique business types and regions for filters
        const { data: metadata } = await supabase
            .from('ai_consultants')
            .select('business_type, region');

        const businessTypes = [...new Set(metadata?.map(m => m.business_type).filter(Boolean))].sort();
        const regions = [...new Set(metadata?.map(m => m.region).filter(Boolean))].sort();

        return NextResponse.json({
            consultants: consultants || [],
            total: count || 0,
            limit,
            offset,
            filters: {
                business_types: businessTypes,
                regions: regions
            }
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

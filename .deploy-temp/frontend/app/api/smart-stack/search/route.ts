import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/smart-stack/search?q=query
 * 
 * Query Parameters:
 * - q: string (required) - Search query
 * 
 * Returns: Search results with relevance ranking
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
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        // Use the PostgreSQL full-text search function
        const { data: results, error } = await supabase
            .rpc('search_technologies', { search_query: query.trim() });

        if (error) {
            console.error('Search error:', error);
            return NextResponse.json(
                { error: 'Failed to search technologies' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            query: query.trim(),
            count: results?.length || 0,
            results
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

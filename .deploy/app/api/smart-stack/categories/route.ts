import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/smart-stack/categories
 * 
 * Returns: List of all active categories
 */
export async function GET() {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        const { data: categories, error } = await supabase
            .from('tech_categories')
            .select('id, slug, name, display_name, description, icon, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch categories' },
                { status: 500 }
            );
        }

        return NextResponse.json({ categories });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

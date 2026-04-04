import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * GET /api/smart-stack/:slug
 * 
 * Returns: Detailed information about a specific technology
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Technology slug is required' },
                { status: 400 }
            );
        }

        // Get technology details from the view
        const { data: technology, error } = await supabase
            .from('technology_details')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Technology not found' },
                    { status: 404 }
                );
            }

            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch technology' },
                { status: 500 }
            );
        }

        return NextResponse.json({ technology });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/smart-stack/:slug
 * 
 * Updates a technology entry (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        const { slug } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('technologies')
            .update(body)
            .eq('slug', slug)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json(
                { error: 'Failed to update technology' },
                { status: 500 }
            );
        }

        return NextResponse.json({ technology: data });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/smart-stack/:slug
 * 
 * Soft deletes a technology by setting is_active to false (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        const { slug } = await params;

        const { data, error } = await supabase
            .from('technologies')
            .update({ is_active: false })
            .eq('slug', slug)
            .select()
            .single();

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete technology' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Technology deleted successfully', technology: data }
        );

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

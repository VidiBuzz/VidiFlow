import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SmartCategory {
    category_id: string;
    category_slug: string;
    category_name: string;
    category_display_name: string;
    category_icon: string;
    sort_order: number;
    technology_count: number;
    technologies: Technology[];
}

interface Technology {
    id: string;
    slug: string;
    name: string;
    display_name: string;
    description: string;
    website_url: string;
    logo_url: string | null;
    tags: string[];
    is_featured: boolean;
    popularity_score: number;
}

// Load static data from JSON file
let allCategories: SmartCategory[] = [];
try {
    const dataPath = join(process.cwd(), 'app', 'api', 'smart-stack', 'data.json');
    const fileContents = readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContents);
    allCategories = data.categories;
} catch (error) {
    console.error('Failed to load smart stack data:', error);
}

/**
 * GET /api/smart-stack
 * 
 * Query Parameters:
 * - featured: boolean - Only return featured technologies
 * - category: string - Filter by category slug
 * - search: string - Search technologies by name or description
 * 
 * Returns: List of categories with their technologies
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const featured = searchParams.get('featured') === 'true';
        const categorySlug = searchParams.get('category');
        const searchQuery = searchParams.get('search');

        // Start with all categories
        let result: SmartCategory[] = JSON.parse(JSON.stringify(allCategories));

        // Filter by category if provided
        if (categorySlug) {
            result = result.filter((cat: SmartCategory) => cat.category_slug === categorySlug);
        }

        // Filter featured technologies if requested
        if (featured) {
            result = result.map((category: SmartCategory) => ({
                ...category,
                technologies: category.technologies.filter(
                    (tech: Technology) => tech.is_featured
                )
            })).filter((category: SmartCategory) => category.technologies.length > 0);
        }

        // Search technologies if query provided
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const searchResults: Technology[] = [];
            
            result.forEach((category: SmartCategory) => {
                category.technologies.forEach((tech: Technology) => {
                    if (
                        tech.name.toLowerCase().includes(query) ||
                        tech.description.toLowerCase().includes(query) ||
                        tech.tags.some(tag => tag.toLowerCase().includes(query))
                    ) {
                        searchResults.push(tech);
                    }
                });
            });

            return NextResponse.json({ technologies: searchResults });
        }

        return NextResponse.json({ categories: result });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/smart-stack
 * 
 * Creates a new technology entry (admin only)
 * Note: In static mode, this returns a success but doesn't persist
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // In static mode, just return the data as if it was created
        // In production with Supabase, this would actually insert
        return NextResponse.json({ 
            technology: { 
                id: `temp-${Date.now()}`,
                ...body 
            } 
        }, { status: 201 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

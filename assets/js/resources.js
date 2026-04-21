/**
 * Resources Page — AI Articles & Tutorials
 * 
 * Uses the shared DirectusService to fetch data from VidiCRM.
 * Falls back to mock data if Directus is unavailable.
 */
document.addEventListener('DOMContentLoaded', function() {
    const resourceTypeFilter = document.getElementById('resourceTypeFilter');
    const resourceSearch = document.getElementById('resourceSearch');
    const resourcesGrid = document.getElementById('resourcesGrid');
    
    // Mock data for fallback when Directus is unavailable
    const mockResources = [
        {
            id: 1, title: "The State of AI in 2026", type: "article",
            description: "A comprehensive overview of the latest AI trends, breakthroughs, and industry adoption rates in 2026.",
            link: "https://example.com/state-of-ai-2026", publish_date: "2026-02-15T00:00:00Z"
        },
        {
            id: 2, title: "Machine Learning Tutorial: Neural Networks from Scratch", type: "tutorial",
            description: "Learn how to build neural networks from scratch using Python and NumPy.",
            link: "https://example.com/nn-tutorial", publish_date: "2026-02-10T00:00:00Z"
        },
        {
            id: 3, title: "Recent Advances in Large Language Models", type: "research",
            description: "A research paper detailing the latest developments in LLM architecture and training techniques.",
            link: "https://example.com/llm-research", publish_date: "2026-02-05T00:00:00Z"
        },
        {
            id: 4, title: "AI Ethics Guidelines Released by Major Tech Companies", type: "news",
            description: "Leading technology companies have released new guidelines for responsible AI development and deployment.",
            link: "https://example.com/ai-ethics-news", publish_date: "2026-02-01T00:00:00Z"
        }
    ];

    // Use shared directusService (from directus-service.js)
    const ds = window.directusService || null;
    
    async function fetchData() {
        let resourcesData = [];
        
        try {
            if (ds) {
                const resourcesResponse = await ds.getItems('articles', { sort: '-publish_date' });
                resourcesData = resourcesResponse.data || [];
            } else {
                throw new Error('DirectusService not available');
            }
        } catch (error) {
            console.warn('Directus unavailable for resources, using mock data:', error.message);
            resourcesData = mockResources;
        }
        
        displayResults(resourcesData);
    }
    
    function displayResults(resources) {
        if (!resourcesGrid) return;
        resourcesGrid.innerHTML = '';
        
        const typeFilterValue = resourceTypeFilter ? resourceTypeFilter.value : 'all';
        const searchTerm = resourceSearch ? resourceSearch.value.toLowerCase() : '';
        
        let filteredResources = [...resources];
        
        // Apply type filter
        if (typeFilterValue !== 'all') {
            filteredResources = filteredResources.filter(resource => 
                resource.type === typeFilterValue
            );
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredResources = filteredResources.filter(resource => 
                (resource.title || '').toLowerCase().includes(searchTerm) || 
                (resource.description || '').toLowerCase().includes(searchTerm) ||
                (resource.type || '').toLowerCase().includes(searchTerm)
            );
        }
        
        if (filteredResources.length === 0) {
            resourcesGrid.innerHTML = '<p>No resources found matching your criteria.</p>';
            return;
        }
        
        // Display resources
        filteredResources.forEach(resource => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            const typeLabel = (resource.type || 'article').charAt(0).toUpperCase() + (resource.type || 'article').slice(1);
            const pubDate = resource.publish_date ? new Date(resource.publish_date).toLocaleDateString() : 'Unknown date';
            
            item.innerHTML = `
                <h3>${resource.title || 'Untitled'}</h3>
                <span class="resource-type ${resource.type || 'article'}">${typeLabel}</span>
                <p>${resource.description || ''}</p>
                <p><small>Published: ${pubDate}</small></p>
                ${resource.link ? `<a href="${resource.link}" target="_blank" rel="noopener" class="resource-link">Read More</a>` : ''}
            `;
            resourcesGrid.appendChild(item);
        });
    }
    
    // Event listeners
    if (resourceTypeFilter) resourceTypeFilter.addEventListener('change', () => fetchData());
    if (resourceSearch) {
        resourceSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') fetchData();
        });
        resourceSearch.addEventListener('input', () => fetchData());
    }
    
    // Initial load
    fetchData();
});
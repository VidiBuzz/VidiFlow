// Resources page JavaScript for displaying AI resources and articles
document.addEventListener('DOMContentLoaded', function() {
    const resourceTypeFilter = document.getElementById('resourceTypeFilter');
    const resourceSearch = document.getElementById('resourceSearch');
    const resourcesGrid = document.getElementById('resourcesGrid');
    
    // Import Directus service (in a real implementation, this would be imported)
    // For now, we'll simulate the service
    class DirectusService {
        async getItems(collection, params = {}) {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return mock data based on collection
            if (collection === 'articles') {
                return {
                    data: [
                        {
                            id: 1,
                            title: "The State of AI in 2026",
                            type: "article",
                            description: "A comprehensive overview of the latest AI trends, breakthroughs, and industry adoption rates in 2026.",
                            link: "https://example.com/state-of-ai-2026",
                            publish_date: "2026-02-15T00:00:00Z"
                        },
                        {
                            id: 2,
                            title: "Machine Learning Tutorial: Neural Networks from Scratch",
                            type: "tutorial",
                            description: "Learn how to build neural networks from scratch using Python and NumPy.",
                            link: "https://example.com/nn-tutorial",
                            publish_date: "2026-02-10T00:00:00Z"
                        },
                        {
                            id: 3,
                            title: "Recent Advances in Large Language Models",
                            type: "research",
                            description: "A research paper detailing the latest developments in LLM architecture and training techniques.",
                            link: "https://example.com/llm-research",
                            publish_date: "2026-02-05T00:00:00Z"
                        },
                        {
                            id: 4,
                            title: "AI Ethics Guidelines Released by Major Tech Companies",
                            type: "news",
                            description: "Leading technology companies have released new guidelines for responsible AI development and deployment.",
                            link: "https://example.com/ai-ethics-news",
                            publish_date: "2026-02-01T00:00:00Z"
                        }
                    ]
                };
            }
            return { data: [] };
        }
    }
    
    const directusService = new DirectusService();
    
    async function fetchData() {
        try {
            // Fetch data from Directus API
            const resourcesResponse = await directusService.getItems('articles');
            const resourcesData = resourcesResponse.data || [];
            
            displayResults(resourcesData);
        } catch (error) {
            console.error('Error fetching resources data:', error);
            resourcesGrid.innerHTML = '<p>Error loading resources. Please try again later.</p>';
        }
    }
    
    function displayResults(resources) {
        resourcesGrid.innerHTML = '';
        
        const typeFilterValue = resourceTypeFilter.value;
        const searchTerm = resourceSearch.value.toLowerCase();
        
        let filteredResources = resources;
        
        // Apply type filter
        if (typeFilterValue !== 'all') {
            filteredResources = filteredResources.filter(resource => 
                resource.type === typeFilterValue
            );
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) || 
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.type.toLowerCase().includes(searchTerm)
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
            item.innerHTML = `
                <h3>${resource.title}</h3>
                <span class="resource-type ${resource.type}">${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
                <p>${resource.description}</p>
                <p><small>Published: ${new Date(resource.publish_date).toLocaleDateString()}</small></p>
                <a href="${resource.link}" target="_blank" class="resource-link">Read More</a>
            `;
            resourcesGrid.appendChild(item);
        });
    }
    
    // Event listeners
    resourceTypeFilter.addEventListener('change', displayResults);
    resourceSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            displayResults();
        }
    });
    resourceSearch.addEventListener('input', displayResults);
    
    // Initial load
    fetchData();
});
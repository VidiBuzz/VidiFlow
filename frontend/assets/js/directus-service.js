// Directus service for interacting with the Directus API
class DirectusService {
    constructor() {
        // In a real implementation, this would be your Directus instance URL
        this.baseUrl = 'http://localhost:8055'; // Directus default port
        this.token = null; // Would be set after authentication
    }

    // Set authentication token (for authenticated requests)
    setToken(token) {
        this.token = token;
    }

    // Make a request to the Directus API
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Directus API error:', error);
            throw error;
        }
    }

    // Get items from a collection
    async getItems(collection, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/items/${collection}${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    // Get a single item by ID
    async getItem(collection, id, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/items/${collection}/${id}${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    // Search items in a collection
    async searchItems(collection, searchTerm, params = {}) {
        // In Directus, you can use filter query parameters for search
        const searchParams = {
            ...params,
            filter: JSON.stringify({
                _or: [
                    { name: { _contains: searchTerm } },
                    { business_type: { _contains: searchTerm } },
                    { description: { _contains: searchTerm } },
                    { location: { _contains: searchTerm } }
                ]
            })
        };
        return this.getItems(collection, searchParams);
    }

    // Get items with filters
    async getFilteredItems(collection, filters, params = {}) {
        const searchParams = {
            ...params,
            filter: JSON.stringify(filters)
        };
        return this.getItems(collection, searchParams);
    }
}

// Export a singleton instance
const directusService = new DirectusService();
export default directusService;
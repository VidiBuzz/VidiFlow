/**
 * Directus Service — VidiSmart CMS API Client
 * 
 * Connects frontend pages to the Directus (VidiCRM) instance.
 * Automatically detects environment and uses the correct URL:
 *   - Local dev:  http://localhost:8055
 *   - Production: https://vidicrm.com
 * 
 * Usage (ES module):
 *   import directusService from './directus-service.js';
 *   const items = await directusService.getItems('ai_companies');
 * 
 * Usage (script tag — global):
 *   <script src="assets/js/directus-service.js"></script>
 *   const items = await directusService.getItems('ai_companies');
 */

class DirectusService {
    constructor() {
        // Auto-detect environment: use vidicrm.com in production, localhost in dev
        const isProduction = window.location.hostname !== 'localhost' && 
                             window.location.hostname !== '127.0.0.1' &&
                             !window.location.hostname.includes('.local');
        
        this.baseUrl = isProduction 
            ? 'https://vidicrm.com'    // Production: Directus on vidicrm.com
            : 'http://localhost:8055'; // Local dev: Directus on Docker
        
        this.token = null;
        this.refreshToken = null;
        
        // Try to restore token from localStorage
        const savedToken = localStorage.getItem('directus_token');
        if (savedToken) {
            this.token = savedToken;
        }
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('directus_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('directus_token');
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

            if (response.status === 401) {
                // Token expired — clear it
                this.clearToken();
                throw new Error('Authentication expired. Please log in again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `API request failed: ${response.status} — ${errorData.errors?.[0]?.message || response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(
                    `Cannot connect to Directus at ${this.baseUrl}. ` +
                    `Ensure the server is running and CORS is configured.`
                );
            }
            throw error;
        }
    }

    // Authenticate with Directus
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        this.setToken(response.data.access_token);
        this.refreshToken = response.data.refresh_token;
        return response.data;
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

    // Create an item in a collection
    async createItem(collection, data) {
        return this.request(`/items/${collection}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Update an item in a collection
    async updateItem(collection, id, data) {
        return this.request(`/items/${collection}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // Delete an item from a collection
    async deleteItem(collection, id) {
        return this.request(`/items/${collection}/${id}`, {
            method: 'DELETE'
        });
    }

    // Search items in a collection
    async searchItems(collection, searchTerm, fields = ['name', 'description'], params = {}) {
        const filterConditions = fields.map(field => ({
            [field]: { _contains: searchTerm }
        }));
        
        const searchParams = {
            ...params,
            filter: JSON.stringify({ _or: filterConditions })
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

    // Get collections list
    async getCollections() {
        return this.request('/collections');
    }

    // Get collection schema
    async getCollectionSchema(collection) {
        return this.request(`/collections/${collection}`);
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.request('/server/health');
            return { status: 'ok', data: response };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// Create singleton instance
const directusService = new DirectusService();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = directusService;
}

// Make globally available for script tag usage
if (typeof window !== 'undefined') {
    window.directusService = directusService;
}
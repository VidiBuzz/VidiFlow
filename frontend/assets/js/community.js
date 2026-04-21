/**
 * Community Page — Events & Forums
 * 
 * Uses the shared DirectusService to fetch data from VidiCRM.
 * Falls back to mock data if Directus is unavailable.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mock data for fallback when Directus is unavailable
    const mockEvents = [
        {
            id: 1, title: "AI Conference 2026",
            description: "Join us for the premier AI conference of the year.",
            start_date: "2026-03-15T09:00:00Z", end_date: "2026-03-17T17:00:00Z",
            location: "Virtual", url: "https://example.com/ai-conference-2026",
            is_virtual: true
        },
        {
            id: 2, title: "Machine Learning Workshop",
            description: "Hands-on workshop for building ML models.",
            start_date: "2026-04-01T10:00:00Z", end_date: "2026-04-01T16:00:00Z",
            location: "Miami, FL", url: "https://example.com/ml-workshop",
            is_virtual: false
        },
        {
            id: 3, title: "AI Ethics Panel",
            description: "Discussion on the ethical implications of AI.",
            start_date: "2026-04-15T14:00:00Z", end_date: "2026-04-15T16:00:00Z",
            location: "Online", url: "https://example.com/ai-ethics-panel",
            is_virtual: true
        }
    ];
    
    const mockForums = [
        {
            id: 1, title: "Latest Developments in GPT-5",
            content: "What are your thoughts on the recent GPT-5 release?",
            author: "AI Enthusiast", category: "news",
            tags: ["GPT-5", "language models"], sticky: false, locked: false
        },
        {
            id: 2, title: "Looking for AI Co-founder",
            content: "Seeking a technical co-founder for an AI startup focused on healthcare.",
            author: "Entrepreneur", category: "projects",
            tags: ["co-founder", "startup", "healthcare"], sticky: false, locked: false
        }
    ];

    // Use shared directusService (from directus-service.js)
    const ds = window.directusService || null;
    
    async function loadEvents() {
        let eventsData = [];
        
        try {
            if (ds) {
                const eventsResponse = await ds.getItems('events', { sort: '-start_date' });
                eventsData = eventsResponse.data || [];
            } else {
                throw new Error('DirectusService not available');
            }
        } catch (error) {
            console.warn('Directus unavailable for events, using mock data:', error.message);
            eventsData = mockEvents;
        }
        
        displayEvents(eventsData);
    }
    
    async function loadForums() {
        let forumsData = [];
        
        try {
            if (ds) {
                const forumsResponse = await ds.getItems('forum_posts', { sort: '-created_at', limit: 6 });
                forumsData = forumsResponse.data || [];
            } else {
                throw new Error('DirectusService not available');
            }
        } catch (error) {
            console.warn('Directus unavailable for forums, using mock data:', error.message);
            forumsData = mockForums;
        }
        
        displayForums(forumsData);
    }
    
    function displayEvents(events) {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;
        eventsGrid.innerHTML = '';
        
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p>No upcoming events found.</p>';
            return;
        }
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD';
            const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString() : '';
            const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;
            
            eventElement.innerHTML = `
                <h3>${event.title || 'Untitled Event'}</h3>
                <p>${event.description || ''}</p>
                <p><strong>Date:</strong> ${dateRange}</p>
                <p><strong>Location:</strong> ${event.location || 'TBD'}${event.is_virtual ? ' (Virtual)' : ''}</p>
                ${event.url ? `<a href="${event.url}" target="_blank" rel="noopener" class="btn-primary">Learn More</a>` : ''}
            `;
            eventsGrid.appendChild(eventElement);
        });
    }
    
    function displayForums(forums) {
        const forumGrid = document.querySelector('.forum-grid');
        if (!forumGrid) return;
        forumGrid.innerHTML = '';
        
        if (forums.length === 0) {
            forumGrid.innerHTML = '<p>No forum discussions found.</p>';
            return;
        }
        
        forums.forEach(forum => {
            const forumElement = document.createElement('div');
            forumElement.className = 'forum';
            const excerpt = (forum.content || '').substring(0, 100);
            
            forumElement.innerHTML = `
                <h3>${forum.title || 'Untitled Discussion'}</h3>
                <p>${excerpt}${forum.content && forum.content.length > 100 ? '...' : ''}</p>
                <p><small>By: ${forum.author || 'Anonymous'} | Category: ${forum.category || 'General'}</small></p>
                <a href="#" class="btn-secondary">Join Discussion</a>
            `;
            forumGrid.appendChild(forumElement);
        });
    }
    
    // Initial load
    loadEvents();
    loadForums();
});
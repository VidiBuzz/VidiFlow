// Community page JavaScript for handling forums and events
document.addEventListener('DOMContentLoaded', function() {
    // Import Directus service (in a real implementation, this would be imported)
    // For now, we'll simulate the service
    class DirectusService {
        async getItems(collection, params = {}) {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return mock data based on collection
            if (collection === 'events') {
                return {
                    data: [
                        {
                            id: 1,
                            title: "AI Conference 2026",
                            description: "Join us for the premier AI conference of the year.",
                            start_date: "2026-03-15T09:00:00Z",
                            end_date: "2026-03-17T17:00:00Z",
                            location: "Virtual",
                            url: "https://example.com/ai-conference-2026",
                            is_virtual: true
                        },
                        {
                            id: 2,
                            title: "Machine Learning Workshop",
                            description: "Hands-on workshop for building ML models.",
                            start_date: "2026-04-01T10:00:00Z",
                            end_date: "2026-04-01T16:00:00Z",
                            location: "Miami, FL",
                            url: "https://example.com/ml-workshop",
                            is_virtual: false
                        },
                        {
                            id: 3,
                            title: "AI Ethics Panel",
                            description: "Discussion on the ethical implications of AI.",
                            start_date: "2026-04-15T14:00:00Z",
                            end_date: "2026-04-15T16:00:00Z",
                            location: "Online",
                            url: "https://example.com/ai-ethics-panel",
                            is_virtual: true
                        }
                    ]
                };
            } else if (collection === 'forum_posts') {
                return {
                    data: [
                        {
                            id: 1,
                            title: "Latest Developments in GPT-5",
                            content: "What are your thoughts on the recent GPT-5 release?",
                            author: "AI Enthusiast",
                            category: "news",
                            tags: ["GPT-5", "language models"],
                            sticky: false,
                            locked: false
                        },
                        {
                            id: 2,
                            title: "Looking for AI Co-founder",
                            content: "Seeking a technical co-founder for an AI startup focused on healthcare.",
                            author: "Entrepreneur",
                            category: "projects",
                            tags: ["co-founder", "startup", "healthcare"],
                            sticky: false,
                            locked: false
                        }
                    ]
                };
            }
            return { data: [] };
        }
    }
    
    const directusService = new DirectusService();
    
    async function loadEvents() {
        try {
            const eventsResponse = await directusService.getItems('events', {
                sort: '-start_date'
            });
            const eventsData = eventsResponse.data || [];
            displayEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
            document.getElementById('eventsGrid').innerHTML = '<p>Error loading events. Please try again later.</p>';
        }
    }
    
    async function loadForums() {
        try {
            const forumsResponse = await directusService.getItems('forum_posts', {
                sort: '-created_at',
                limit: 6
            });
            const forumsData = forumsResponse.data || [];
            displayForums(forumsData);
        } catch (error) {
            console.error('Error fetching forums:', error);
            document.querySelector('.forum-grid').innerHTML = '<p>Error loading forums. Please try again later.</p>';
        }
    }
    
    function displayEvents(events) {
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = '';
        
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p>No upcoming events found.</p>';
            return;
        }
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()} - ${new Date(event.end_date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <a href="${event.url}" target="_blank" class="btn-primary">Learn More</a>
            `;
            eventsGrid.appendChild(eventElement);
        });
    }
    
    function displayForums(forums) {
        const forumGrid = document.querySelector('.forum-grid');
        forumGrid.innerHTML = '';
        
        if (forums.length === 0) {
            forumGrid.innerHTML = '<p>No forum discussions found.</p>';
            return;
        }
        
        forums.forEach(forum => {
            const forumElement = document.createElement('div');
            forumElement.className = 'forum';
            forumElement.innerHTML = `
                <h3>${forum.title}</h3>
                <p>${forum.content.substring(0, 100)}...</p>
                <p><small>By: ${forum.author} | Category: ${forum.category}</small></p>
                <a href="#" class="btn-secondary">Join Discussion</a>
            `;
            forumGrid.appendChild(forumElement);
        });
    }
    
    // Initial load
    loadEvents();
    loadForums();
});
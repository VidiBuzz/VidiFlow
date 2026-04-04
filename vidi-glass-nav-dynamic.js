/**
 * VidiSmart Dynamic Glass Navigation
 * Fetches navigation items from Directus or falls back to static defaults.
 */

(function () {
    // Configuration
    const DIRECTUS_URL = window.DIRECTUS_URL || 'http://localhost:8055';
    const FALLBACK_NAV_ITEMS = [
        { label: 'Create My Smart Stack', url: 'vidismart.masterlist.html' },
        { label: 'VidiMail', url: 'VIDIMAIL_VIDIBLAST_SHOWCASE.html' },
        { label: 'SmartChannel', url: 'smartchannelcx.html' },
        { label: 'SmartChannel Tech', url: 'smartchannelcx-tech.html' },
        { label: 'VidiTwin', url: 'viditwin.html' },
        { label: 'VidiShop', url: 'vidishop.html' },
        { label: 'AI Gen', url: 'SmartGenUi.html' }
    ];

    // CSS Dependencies
    function ensureStyles() {
        if (!document.querySelector('link[href*="vidi-glass-nav.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'vidi-glass-nav.css';
            document.head.appendChild(link);
        }
        // Ensure Font Awesome for icons if needed, though mostly using text/emojis
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
    }

    // Fetch from Directus
    async function fetchNavItems() {
        try {
            const response = await fetch(`${DIRECTUS_URL}/items/navigation?sort=sort&filter[status][_eq]=published`);
            if (!response.ok) throw new Error('Directus API unavailable');
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.warn('⚡ VidiNav: Falling back to static menu (Directus unreachable)', error);
            return FALLBACK_NAV_ITEMS;
        }
    }

    // Render Logic
    function renderNav(items) {
        // Remove existing nav if present
        const existing = document.querySelector('.vidi-glass-nav');
        if (existing) existing.remove();

        // Create Container
        const header = document.createElement('header');
        header.className = 'vidi-glass-nav';

        // Build HTML
        const navHtml = `
        <div class="glass-nav-container">
            <a href="master-menu.html" class="nav-logo-premium">
                <span style="font-size: 1.5rem;">⚡</span> VIDISMART
            </a>

            <nav class="glass-nav-links">
                ${items.map(item => `
                    <a href="${item.url}" class="nav-link-premium">${item.label}</a>
                `).join('')}
            </nav>

            <div class="glass-nav-profile">
                <div class="glass-admin-text">
                    <div class="glass-admin-label">Admin Session</div>
                    <div class="glass-admin-name">James May</div>
                </div>
                <div class="glass-profile-orb"></div>
            </div>
        </div>
        `;

        header.innerHTML = navHtml;

        // Inject
        const target = document.getElementById('vidi-glass-nav-root') || document.body;
        if (target.id === 'vidi-glass-nav-root') {
            target.appendChild(header);
        } else {
            document.body.prepend(header);
        }

        // Add Spacer if not present
        if (!document.querySelector('.nav-spacer')) {
            const spacer = document.createElement('div');
            spacer.className = 'nav-spacer';
            header.after(spacer);
        }

        // Highlight Active
        highlightActive();
    }

    function highlightActive() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-link-premium');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            }
        });
    }

    // Initialize
    async function init() {
        ensureStyles();
        const items = await fetchNavItems();
        renderNav(items);
    }

    // Run when DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

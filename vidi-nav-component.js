/**
 * VidiSmart Universal Navigation Component
 * Injects consistent navigation across all VidiSmart pages
 */

(function () {
    'use strict';

    // Calculate relative path prefix based on current location
    const isSubfolder = window.location.pathname.includes('/tariff/');
    const pathPrefix = isSubfolder ? '../' : '';

    // Navigation HTML template
    const navTemplate = `
    <nav class="vidi-nav">
        <div class="vidi-nav-container">
            <a href="${pathPrefix}vidismart.masterlist.html" class="vidi-nav-logo">
                <span class="vidi-logo-vidi">Vidi</span><span class="vidi-logo-smart">Smart</span>
            </a>
            
            <button class="vidi-nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="vidi-nav-menu">
                <div class="vidi-nav-links">
                    <a href="${pathPrefix}vidismart.masterlist.html" class="vidi-nav-link" data-page="masterlist">Master Stack</a>
                    <a href="${pathPrefix}open-apps.html" class="vidi-nav-link" data-page="open-apps">Open Apps</a>
                    <a href="${pathPrefix}visualai-tools.html" class="vidi-nav-link" data-page="visualai-tools">AI Tools</a>
                    <a href="${pathPrefix}topmodels.html" class="vidi-nav-link" data-page="topmodels">Top Models</a>
                    <a href="${pathPrefix}directus-extensions.html" class="vidi-nav-link" data-page="directus-extensions">Extensions</a>
                    <a href="${pathPrefix}tariff/tariff-timeline.html" class="vidi-nav-link" data-page="tariff-timeline">Tariff Map</a>
                    <a href="${pathPrefix}ClaudeNoMore.html" class="vidi-nav-link" data-page="claudenomore">Pricing</a>
                </div>
                
                <div class="vidi-nav-actions">
                    <a href="${pathPrefix}waitlist.html" class="vidi-nav-btn vidi-nav-btn-primary">
                        <i class="fas fa-envelope"></i> Contact
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <div class="vidi-nav-spacer"></div>
    `;

    // Inject navigation when DOM is ready
    function injectNavigation() {
        if (document.querySelector('.vidi-nav')) return;

        const navContainer = document.createElement('div');
        navContainer.innerHTML = navTemplate;
        document.body.insertBefore(navContainer, document.body.firstChild);

        initMobileToggle();
        highlightCurrentPage();
    }

    function initMobileToggle() {
        const toggle = document.querySelector('.vidi-nav-toggle');
        const menu = document.querySelector('.vidi-nav-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                menu.classList.toggle('active');
            });
        }
    }

    function highlightCurrentPage() {
        const path = window.location.pathname;
        const links = document.querySelectorAll('.vidi-nav-link');

        links.forEach(link => {
            const page = link.getAttribute('data-page');
            if (
                (page === 'tariff-timeline' && path.includes('tariff-timeline')) ||
                (page === 'masterlist' && path.includes('vidismart.masterlist')) ||
                (page === 'open-apps' && path.includes('open-apps')) ||
                (page === 'visualai-tools' && path.includes('visualai-tools')) ||
                (page === 'topmodels' && path.includes('topmodels')) ||
                (page === 'directus-extensions' && path.includes('directus-extensions')) ||
                (page === 'claudenomore' && path.includes('ClaudeNoMore'))
            ) {
                link.classList.add('active');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavigation);
    } else {
        injectNavigation();
    }
})();

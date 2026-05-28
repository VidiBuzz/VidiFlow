/**
 * VidiSmart Universal Navigation Component
 * Injects consistent navigation across all VidiSmart pages
 */

(function () {
    'use strict';

    // Calculate relative path prefix based on current location
    const pathPrefix = '';

    // Navigation HTML template
    const navTemplate = `
    <nav class="vidi-nav">
        <div class="vidi-nav-container">
            <a href="${pathPrefix}index.html" class="vidi-nav-logo">
                <span class="vidi-logo-text">VidiSmart</span>
            </a>
            
            <button class="vidi-nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="vidi-nav-menu">
                <div class="vidi-nav-links">
                    <a href="${pathPrefix}index.html" class="vidi-nav-link" data-page="home">Home</a>
                    <a href="${pathPrefix}tariff-timeline.html" class="vidi-nav-link" data-page="timeline">Timeline</a>
                    <a href="${pathPrefix}get-started.html" class="vidi-nav-link" data-page="get-started">Get Started</a>
                    <a href="${pathPrefix}ace-setup.html" class="vidi-nav-link" data-page="ace-setup">ACE Setup</a>
                    <a href="${pathPrefix}cape-process.html" class="vidi-nav-link" data-page="cape-process">CAPE Process</a>
                    <a href="${pathPrefix}legal.html" class="vidi-nav-link" data-page="legal">Legal</a>
                </div>
                
                <div class="vidi-nav-actions">
                    <a href="${pathPrefix}get-started.html" class="vidi-nav-btn vidi-nav-btn-primary">
                        Start Your Claim
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
        const currentPage = document.body.getAttribute('data-page');
        if (!currentPage) return;

        const links = document.querySelectorAll('.vidi-nav-link');
        links.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
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

/**
 * VidiSmart Universal Navigation Component
 * Injects consistent navigation across all VidiSmart pages
 */

(function() {
    'use strict';

    // Navigation HTML template
    const navTemplate = `
    <nav class="vidi-nav">
        <div class="vidi-nav-container">
            <a href="index.html" class="vidi-nav-logo">
                <span class="vidi-logo-vidi">Vidi</span><span class="vidi-logo-smart">Smart</span>
            </a>
            
            <button class="vidi-nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div class="vidi-nav-menu">
                <div class="vidi-nav-links">
                    <a href="vidismart.masterlist.html" class="vidi-nav-link">Master Stack</a>
                    <a href="vidishop.html" class="vidi-nav-link">VidiShop</a>
                    <a href="VIDIMAIL_VIDIBLAST_SHOWCASE.html" class="vidi-nav-link">VidiMail</a>
                    <a href="ai_consultants_directory_v3.html" class="vidi-nav-link">AI Consultants</a>
                    <a href="dashboard.html" class="vidi-nav-link">Dashboard</a>
                </div>
                
                <div class="vidi-nav-actions">
                    <a href="waitlist.html" class="vidi-nav-btn vidi-nav-btn-primary">
                        <i class="fas fa-rocket"></i> Join Waitlist
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <div class="vidi-nav-spacer"></div>
    `;

    // Inject navigation when DOM is ready
    function injectNavigation() {
        // Check if nav already exists
        if (document.querySelector('.vidi-nav')) {
            return;
        }

        // Create container
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navTemplate;

        // Insert at the beginning of body
        const firstElement = document.body.firstChild;
        document.body.insertBefore(navContainer, firstElement);

        // Initialize mobile toggle
        initMobileToggle();

        // Highlight current page
        highlightCurrentPage();
    }

    // Mobile menu toggle
    function initMobileToggle() {
        const toggle = document.querySelector('.vidi-nav-toggle');
        const menu = document.querySelector('.vidi-nav-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', function() {
                toggle.classList.toggle('active');
                menu.classList.toggle('active');
            });
        }
    }

    // Highlight current page in nav
    function highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.vidi-nav-link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavigation);
    } else {
        injectNavigation();
    }
})();

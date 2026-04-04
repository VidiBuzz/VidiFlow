/**
 * VidiSmart Navigation Loader (Alternative)
 * Loads the universal navigation for pages using this system
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    function init() {
        // Check if navigation already exists
        if (document.querySelector('.vidi-universal-nav')) {
            return;
        }

        // Create navigation HTML
        const navHTML = `
        <nav class="vidi-universal-nav">
            <div class="vidi-nav-inner">
                <a href="index.html" class="vidi-nav-brand">
                    <span class="brand-vidi">Vidi</span><span class="brand-smart">Smart</span>
                </a>
                
                <div class="vidi-nav-menu">
                    <a href="vidismart.masterlist.html">Master Stack</a>
                    <a href="vidishop.html">VidiShop</a>
                    <a href="VIDIMAIL_VIDIBLAST_SHOWCASE.html">VidiMail</a>
                    <a href="ai_consultants_directory_v3.html">Consultants</a>
                    <a href="dashboard.html">Dashboard</a>
                </div>
                
                <a href="waitlist.html" class="vidi-nav-cta">Join Waitlist</a>
            </div>
        </nav>
        <div class="vidi-nav-spacer"></div>
        `;

        // Insert navigation
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navHTML;
        document.body.insertBefore(navContainer, document.body.firstChild);

        // Highlight current page
        highlightCurrentPage();
    }

    function highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.vidi-nav-menu a');
        
        links.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

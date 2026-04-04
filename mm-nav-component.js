/**
 * MM-Nav Component
 * Reusable navigation component for VidiTwin multipage apps
 */

(function() {
    'use strict';

    // Default configuration
    const defaultConfig = {
        brandLabel: "Twin Context",
        menuItems: [
            { id: "platform", label: "Platform", url: "#platform" },
            { id: "models", label: "SOTA Models", url: "#models" },
            { id: "visual", label: "Visual AI", url: "#visual", specialClass: "visual-ai" },
            { id: "infra", label: "Hardware", url: "#infra" },
            { id: "examples", label: "Market Proof", url: "#examples" }
        ],
        badgeText: "MAMBA-MOE READY",
        deployButtonText: "Deploy Agent",
        topOffset: 64, // Distance from top of viewport
        spacerHeight: 120 // Height of spacer to prevent content from hiding behind nav
    };

    // Merge user config with defaults
    function mergeConfig(userConfig) {
        return Object.assign({}, defaultConfig, userConfig);
    }

    // CSS styles to inject
    const cssStyles = `
        /* Reset any existing nav styles */
        .mm-nav,
        .mm-nav * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Main Navigation Container */
        .mm-nav {
            position: fixed;
            left: 0;
            right: 0;
            z-index: 9998;
            background: rgba(15, 17, 26, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-family: 'Inter', 'Kumbh Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .mm-nav-inner {
            max-width: 1800px;
            margin: 0 auto;
            padding: 0 1.5rem;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Brand Section */
        .nav-brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .nav-brand-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(96, 165, 250, 0.8);
            padding-left: 8px;
            border-left: 2px solid rgba(59, 130, 246, 0.5);
        }

        /* Navigation Links */
        .nav-links {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        @media (max-width: 767px) {
            .nav-links {
                display: none;
            }
        }

        /* Navigation Buttons */
        .nav-twin-btn {
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: rgba(255, 255, 255, 0.7);
            border: none;
            background: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            text-decoration: none;
        }

        .nav-twin-btn:hover {
            color: rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.05);
        }

        .nav-twin-btn.active {
            color: #fff !important;
            border-bottom: 2px solid #3b82f6;
        }

        /* Visual AI Special Styling */
        .nav-twin-btn.visual-ai {
            color: #f59e0b;
        }

        .nav-twin-btn.visual-ai:hover {
            color: #fbbf24;
        }

        .nav-twin-btn.visual-ai.active {
            color: #fff !important;
            border-bottom: 2px solid #3b82f6;
        }

        /* Actions Section */
        .nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .nav-badge {
            font-size: 9px;
            font-weight: 900;
            background: rgba(16, 185, 129, 0.1);
            color: #34d399;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .nav-deploy-btn {
            background: #2563eb;
            color: #fff;
            padding: 8px 20px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.05em;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            transition: all 0.2s ease;
        }

        .nav-deploy-btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }

        /* Mobile Responsiveness */
        @media (max-width: 767px) {
            .mm-nav-inner {
                padding: 0 1rem;
            }
            
            .nav-brand-label {
                display: none;
            }
            
            .nav-badge {
                display: none;
            }
        }

        /* Spacer element */
        .mm-nav-spacer {
            width: 100%;
        }

        /* Page transitions (optional) */
        .page-content {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .page-content.entering {
            opacity: 0;
            transform: translateY(20px);
        }

        .page-content.entered {
            opacity: 1;
            transform: translateY(0);
        }
    `;

    // Generate HTML template based on config
    function generateNavHTML(config) {
        const menuItemsHTML = config.menuItems.map(item => {
            const specialClass = item.specialClass ? ` ${item.specialClass}` : '';
            const hrefAttr = item.url ? `href="${item.url}"` : '';
            const dataPageAttr = item.id ? `data-page="${item.id}"` : '';
            return `<a ${hrefAttr} class="nav-twin-btn${specialClass}" ${dataPageAttr}>${item.label}</a>`;
        }).join('');

        return `
            <nav class="mm-nav">
                <div class="mm-nav-inner">
                    <div class="nav-brand">
                        <span class="nav-brand-label">${config.brandLabel}</span>
                        <div class="nav-links">
                            ${menuItemsHTML}
                        </div>
                    </div>
                    <div class="nav-actions">
                        <span class="nav-badge">${config.badgeText}</span>
                        <button class="nav-deploy-btn">${config.deployButtonText}</button>
                    </div>
                </div>
            </nav>
            <div class="mm-nav-spacer" style="height: ${config.spacerHeight}px;"></div>
        `;
    }

    // Inject CSS into page
    function injectCSS() {
        if (document.querySelector('style[data-mm-nav]')) {
            return; // Already injected
        }
        
        const style = document.createElement('style');
        style.setAttribute('data-mm-nav', 'true');
        style.textContent = cssStyles;
        document.head.appendChild(style);
    }

    // Inject HTML into page
    function injectHTML(config) {
        // Remove existing mm-nav if present
        const existingNav = document.querySelector('.mm-nav');
        if (existingNav) {
            existingNav.remove();
        }
        
        const existingSpacer = document.querySelector('.mm-nav-spacer');
        if (existingSpacer) {
            existingSpacer.remove();
        }

        // Generate and inject new HTML
        const navHTML = generateNavHTML(config);
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navHTML;

        // Insert at beginning of body
        const firstElement = document.body.firstChild;
        document.body.insertBefore(navContainer, firstElement);
    }

    // Highlight active page based on URL hash
    function highlightActivePage() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        const buttons = document.querySelectorAll('.nav-twin-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === hash || btn.getAttribute('href') === `#${hash}`) {
                btn.classList.add('active');
            }
        });
    }

    // Handle click events for single-page apps
    function setupClickHandlers(config) {
        const buttons = document.querySelectorAll('.nav-twin-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const page = this.dataset.page;
                const href = this.getAttribute('href');
                
                // If it's a hash link, prevent default and handle navigation
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const pageId = href.slice(1);
                    
                    // Update active state
                    buttons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update URL hash
                    if (window.location.hash !== href) {
                        history.pushState(null, null, href);
                    }
                    
                    // Call custom handler if provided
                    if (config.onNavigate && typeof config.onNavigate === 'function') {
                        config.onNavigate(pageId, this);
                    }
                    
                    // Dispatch custom event
                    const event = new CustomEvent('mm-nav:navigate', {
                        detail: { page: pageId, element: this }
                    });
                    document.dispatchEvent(event);
                }
            });
        });
    }

    // Handle browser back/forward
    function setupPopstateHandler() {
        window.addEventListener('popstate', highlightActivePage);
    }

    // Main initialization function
    function initMMNav(userConfig = {}) {
        const config = mergeConfig(userConfig);
        
        // Inject CSS
        injectCSS();
        
        // Inject HTML
        injectHTML(config);
        
        // Setup functionality
        highlightActivePage();
        setupClickHandlers(config);
        setupPopstateHandler();
        
        // Listen for hash changes
        window.addEventListener('hashchange', highlightActivePage);
        
        // Return API for external control
        return {
            navigateTo: function(pageId) {
                const btn = document.querySelector(`.nav-twin-btn[data-page="${pageId}"]`) ||
                           document.querySelector(`.nav-twin-btn[href="#${pageId}"]`);
                if (btn) {
                    btn.click();
                }
            },
            updateConfig: function(newConfig) {
                const mergedConfig = mergeConfig(newConfig);
                injectHTML(mergedConfig);
                highlightActivePage();
                setupClickHandlers(mergedConfig);
            },
            getActivePage: function() {
                return window.location.hash.slice(1) || null;
            }
        };
    }

    // Auto-initialize if config is provided via window.MMNavConfig
    if (window.MMNavConfig) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => initMMNav(window.MMNavConfig));
        } else {
            initMMNav(window.MMNavConfig);
        }
    }

    // Expose to global scope
    window.MMNav = initMMNav;
})();
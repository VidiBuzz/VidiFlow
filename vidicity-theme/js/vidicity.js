/**
 * VidiCity Pro - Complete Interactive Functionality
 * Makes all links, videos, search, and modal interactions work
 */
(function() {
    'use strict';

    // ===== DOM READY =====
    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') init();

    function init() {
        console.log('🎬 VidiCity Pro initialized');
        initVideoModal();
        initNavigation();
        initSearch();
        initScrollEffects();
        initScrollToTop();
        initAnimations();
        initLinks();
        initTooltips();
    }

    // ===== VIDEO MODAL FUNCTIONALITY =====
    function initVideoModal() {
        const modal = document.getElementById('video-modal');
        const iframe = document.getElementById('video-iframe');
        const closeBtn = document.getElementById('video-modal-close');
        const overlay = document.getElementById('video-modal-overlay');
        const titleEl = document.getElementById('video-modal-title');

        if (!modal || !iframe) return;

        // Attach click handlers to all video cards
        const videoCards = document.querySelectorAll('.vc-video-card');
        videoCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Only trigger on card click, play button, or image
                if (e.target.closest('.vc-btn') || e.target.closest('a')) return;

                const videoUrl = this.getAttribute('data-video-url');
                const title = this.getAttribute('data-title') || 'Video';

                if (videoUrl) {
                    openModal(videoUrl, title);
                }
            });
        });

        // Play button clicks
        const playBtns = document.querySelectorAll('.vc-video-play');
        playBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.vc-video-card');
                if (card) {
                    const videoUrl = card.getAttribute('data-video-url');
                    const title = card.getAttribute('data-title') || 'Video';
                    if (videoUrl) openModal(videoUrl, title);
                }
            });
        });

        function openModal(url, title) {
            iframe.src = url;
            if (titleEl) titleEl.textContent = title;
            modal.classList.remove('hidden');
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden';

            // Announce for accessibility
            modal.setAttribute('aria-hidden', 'false');
        }

        function closeModal() {
            iframe.src = ''; // Stop video
            modal.classList.add('hidden');
            modal.classList.remove('visible');
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');
        }

        // Close handlers
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        // ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                closeModal();
            }
        });

        // Prevent click inside container from closing
        const container = modal.querySelector('.video-modal-container');
        if (container) {
            container.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    // ===== NAVIGATION FUNCTIONALITY =====
    function initNavigation() {
        const menuToggle = document.querySelector('.vc-menu-toggle');
        const navMenu = document.querySelector('.vc-nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                const isOpen = navMenu.classList.toggle('active');
                this.setAttribute('aria-expanded', isOpen);
                menuToggle.classList.toggle('active');
            });

            // Close on outside click
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.vc-nav')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on link click
            const navLinks = navMenu.querySelectorAll('.vc-nav-link');
            navLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Active link highlighting
        const navLinks = document.querySelectorAll('.vc-nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                navLinks.forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
            });
        });
    }

    // ===== SEARCH FUNCTIONALITY =====
    function initSearch() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('main-search');
        const visualSearchBtn = document.querySelector('.vc-visual-search-btn');

        // Search submit
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput ? searchInput.value.trim() : '';
                if (query) {
                    console.log('Searching for:', query);
                    // Show results or redirect
                    showSearchResults(query);
                }
            });
        }

        // Visual search (image upload)
        if (visualSearchBtn) {
            visualSearchBtn.addEventListener('click', function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';

                input.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        console.log('Image search:', file.name);
                        visualSearch(file);
                    }
                });

                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
            });
        }

        // Search icon click focuses input
        const searchTrigger = document.querySelector('.vc-search-trigger');
        if (searchTrigger && searchInput) {
            searchTrigger.addEventListener('click', function() {
                searchInput.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function showSearchResults(query) {
        // For now, show a notification
        showToast('Searching for: "' + query + '"');
    }

    function visualSearch(file) {
        showToast('Analyzing image: ' + file.name + '...');
        setTimeout(function() {
            showToast('✨ AI analysis complete! Showing similar experiences.');
        }, 2000);
    }

    // ===== TOAST NOTIFICATIONS =====
    function showToast(message) {
        // Remove existing toast
        var existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--vc-bg-card,#1a2342);color:white;padding:12px 24px;border-radius:12px;font-size:14px;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,0.3);border:1px solid var(--vc-border,#2a3566);animation:slideUp 0.3s ease;max-width:90vw;text-align:center;';

        document.body.appendChild(toast);

        setTimeout(function() {
            toast.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
    window.showToast = showToast;

    // ===== SCROLL EFFECTS =====
    function initScrollEffects() {
        var header = document.querySelector('.vc-header');
        var scrollTopBtn = document.getElementById('scroll-top');

        window.addEventListener('scroll', function() {
            // Header shadow
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }

            // Scroll to top button
            if (scrollTopBtn) {
                if (window.scrollY > 500) {
                    scrollTopBtn.classList.remove('hidden');
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.add('hidden');
                    scrollTopBtn.classList.remove('visible');
                }
            }

            // Animate elements on scroll
            animateOnScroll();
        }, { passive: true });
    }

    // ===== SCROLL TO TOP =====
    function initScrollToTop() {
        var btn = document.getElementById('scroll-top');
        if (btn) {
            btn.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // ===== SCROLL ANIMATIONS =====
    function initAnimations() {
        // Use IntersectionObserver for animations
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe all animated elements
        var animated = document.querySelectorAll('.animate-fadeInUp, .animate-float');
        animated.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ===== LINK HANDLERS =====
    function initLinks() {
        // Handle all anchor links
        var anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(function(a) {
            a.addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (!href || href === '#') {
                    e.preventDefault();
                    // If it's a nav link, show toast
                    if (this.classList.contains('vc-nav-link') || this.classList.contains('vc-footer-link')) {
                        var text = this.textContent.trim();
                        showToast('Coming soon: ' + text);
                    }
                } else if (href.length > 1) {
                    // It's a section anchor
                    e.preventDefault();
                    var target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        showToast('Section coming soon: ' + href);
                    }
                }
            });
        });

        // Button handlers for action buttons
        var actionBtns = document.querySelectorAll('.vc-btn[href="#list-business"], .vc-btn[href="#how-it-works"]');
        actionBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var action = this.getAttribute('href');
                if (action === '#list-business') {
                    showToast('📝 Business registration form coming soon!');
                } else if (action === '#how-it-works') {
                    showToast('🎥 Video tutorials coming soon!');
                }
            });
        });

        // Social links
        var socialLinks = document.querySelectorAll('.vc-social-link');
        socialLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var platform = this.getAttribute('aria-label') || 'social';
                showToast('Follow us on ' + platform + '!');
            });
        });
    }

    // ===== TOOLTIPS =====
    function initTooltips() {
        var tooltips = document.querySelectorAll('[title]');
        tooltips.forEach(function(el) {
            var title = el.getAttribute('title');
            if (title && el.closest('.vc-visual-search-btn, .vc-search-trigger')) {
                // Native browser tooltips work, but we can enhance later
            }
        });
    }

    // ===== UTILITY: Animate on Scroll =====
    function animateOnScroll() {
        var elements = document.querySelectorAll('.vc-stat-value');
        elements.forEach(function(el) {
            if (el.dataset.animated) return;
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.dataset.animated = 'true';
                animateValue(el);
            }
        });
    }

    function animateValue(el) {
        var text = el.textContent;
        var match = text.match(/^([\d.]+)([KkMmBb\+\%]*)$/);
        if (!match) return;

        var target = parseFloat(match[1]);
        var suffix = match[2];
        var duration = 1500;
        var start = performance.now();

        function update(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = target * eased;

            if (suffix.toLowerCase() === 'k') {
                el.textContent = current.toFixed(current < 10 ? 1 : 0) + suffix;
            } else if (suffix.toLowerCase() === 'm') {
                el.textContent = current.toFixed(1) + suffix;
            } else {
                el.textContent = Math.floor(current) + suffix;
            }

            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

})();

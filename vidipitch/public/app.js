// ============================================
// VidiPitch - Smart Stack Upgrade Landing Page
// Interactive JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initFAQ();
    initOrderForm();
    initSmoothScroll();
});

/**
 * FAQ Accordion Functionality
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

/**
 * Order Form Handling
 */
function initOrderForm() {
    const form = document.getElementById('order-form');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get the submit button
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const orderData = Object.fromEntries(formData.entries());
            
            // Add metadata
            orderData.timestamp = new Date().toISOString();
            orderData.orderType = 'Smart Stack Upgrade';
            orderData.amount = 3000;
            
            console.log('Order submitted:', orderData);
            
            // Simulate API call (replace with actual endpoint)
            await simulateOrderProcessing(orderData);
            
            // Show success message
            showSuccessMessage(form);
            
        } catch (error) {
            console.error('Order processing failed:', error);
            showError('Something went wrong. Please try again or contact support.');
            
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Simulate order processing (replace with actual API call)
 */
async function simulateOrderProcessing(orderData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // In production, this would be an actual API call:
            // const response = await fetch('/api/orders', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(orderData)
            // });
            // if (!response.ok) throw new Error('API error');
            
            resolve({ success: true, orderId: generateOrderId() });
        }, 1500);
    });
}

/**
 * Generate a unique order ID
 */
function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + 
           Math.random().toString(36).substr(2, 4).toUpperCase();
}

/**
 * Show success message after form submission
 */
function showSuccessMessage(form) {
    // Hide the form and show success message
    const formContainer = document.querySelector('.form-container');
    
    if (formContainer) {
        form.style.display = 'none';
        
        const successHTML = `
            <div class="success-message show">
                <div class="success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h3>Order Received!</h3>
                <p>Thank you for your order. We'll be in touch within 24 hours to confirm payment and begin your Smart Stack Upgrade.</p>
                <p style="margin-top: 1rem; font-size: 0.875rem;">A confirmation email has been sent to your inbox.</p>
            </div>
        `;
        
        formContainer.innerHTML = successHTML;
        
        // Scroll to the success message
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show error message
 */
function showError(message) {
    const form = document.getElementById('order-form');
    
    if (form) {
        // Remove any existing error messages
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and show new error message
        const errorHTML = `
            <div class="error-message" style="background: #fee; border: 1px solid #fcc; color: #c00; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center;">
                ${message}
            </div>
        `;
        
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.insertAdjacentHTML('beforebegin', errorHTML);
        }
    }
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or a non-anchor link
            if (href === '#' || !href.startsWith('#')) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Account for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Add scroll effect to navigation
 */
let lastScroll = 0;

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    const nav = document.querySelector('nav');
    
    if (!nav) return;
    
    // Add shadow on scroll
    if (currentScroll > 10) {
        nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

/**
 * Form validation helper functions
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Allow various phone formats
    const re = /^[\d\s\-\(\)\+]{10,}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Add input validation feedback (optional enhancement)
 */
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('.order-form input, .order-form select');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e53e3e';
            } else {
                this.style.borderColor = '';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '';
        });
    });
});

/**
 * Analytics tracking (placeholder for Google Analytics or similar)
 */
const trackEvent = (category, action, label) => {
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // If using Google Analytics:
    // if (typeof gtag === 'function') {
    //     gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
};

// Track page view
trackEvent('PageView', 'landing_page_view', 'smart-stack-upgrade');

// Track button clicks
document.querySelectorAll('.btn-primary, .nav-cta').forEach(button => {
    button.addEventListener('click', function() {
        trackEvent('CTA', 'button_click', this.textContent.trim());
    });
});

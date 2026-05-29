/**
 * CrimsonSync - Blood Donation Network
 * Main JavaScript File
 * Handles animations, interactions, and dynamic functionality
 */

// ==================== DOCUMENT READY ====================
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Initialize all features
    setupNavigation();
    setupScrollAnimations();
    setupCounterAnimation();
    setupThemeToggle();
    setupScrollToTop();
    setupHoverEffects();
    setupSmoothScroll();
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky navbar on scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when link is clicked
    navLinks.forEach((link) => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.nav-container')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ==================== SCROLL ANIMATIONS ====================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Trigger animation
                const delay = entry.target.getAttribute('data-delay');
                if (delay) {
                    setTimeout(() => {
                        entry.target.style.animationDelay = delay + 's';
                        entry.target.style.opacity = '1';
                    }, 0);
                } else {
                    entry.target.style.opacity = '1';
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in-up elements
    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach((el) => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Observe section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header) => {
        observer.observe(header);
    });
}

// ==================== COUNTER ANIMATION ====================
function setupCounterAnimation() {
    const observerOptions = {
        threshold: 0.5,
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe the stats section
    const statsSection = document.querySelector('.live-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const targets = {
        0: 50000,  // Registered Donors
        1: 150000, // Lives Saved
        2: 250,    // Hospitals Connected
        3: 10000,  // Emergency Requests
    };

    function updateCounters() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        counters.forEach((counter, index) => {
            const target = targets[index];
            const current = Math.floor(target * progress);
            counter.textContent = formatNumber(current);
        });

        if (progress < 1) {
            requestAnimationFrame(updateCounters);
        } else {
            // Ensure final values are set
            counters.forEach((counter, index) => {
                counter.textContent = formatNumber(targets[index]) + '+';
            });
        }
    }

    updateCounters();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// ==================== THEME TOGGLE ====================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', function () {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==================== SCROLL TO TOP BUTTON ====================
function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

// ==================== SMOOTH SCROLL ====================
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                // Account for navbar height
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });
}

// ==================== HOVER EFFECTS ====================
function setupHoverEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll(
        '.benefit-card, .feature-card, .testimonial-card, .floating-card'
    );

    cards.forEach((card) => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn) => {
        btn.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ==================== PARALLAX EFFECT (Optional) ====================
function setupParallaxEffect() {
    const heroSection = document.querySelector('.hero');

    if (heroSection) {
        window.addEventListener('scroll', function () {
            const scrollPosition = window.scrollY;
            const parallaxElements = heroSection.querySelectorAll('.hero-content, .hero-cards');

            parallaxElements.forEach((el) => {
                el.style.transform = `translateY(${scrollPosition * 0.5}px)`;
            });
        });
    }
}

// ==================== LAZY LOADING ====================
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach((img) => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach((img) => {
            img.src = img.dataset.src;
        });
    }
}

// ==================== KEYBOARD ACCESSIBILITY ====================
function setupKeyboardAccessibility() {
    // Handle Escape key to close mobile menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.getElementById('navMenu');
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Handle Tab key for focus management
    const focusableElements = document.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            focusableElements.forEach((el) => {
                el.addEventListener('focus', function () {
                    this.style.outline = '2px solid #DC2626';
                    this.style.outlineOffset = '2px';
                });

                el.addEventListener('blur', function () {
                    this.style.outline = '';
                });
            });
        }
    });
}

// ==================== PERFORMANCE OPTIMIZATION ====================
function setupPerformanceOptimization() {
    // Debounce resize events
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Handle resize
        }, 250);
    });

    // Throttle scroll events
    let scrollTimer;
    window.addEventListener('scroll', function () {
        if (!scrollTimer) {
            scrollTimer = setTimeout(function () {
                // Handle scroll
                scrollTimer = null;
            }, 100);
        }
    });
}

// ==================== ANALYTICS & TRACKING ====================
function trackEvent(category, action, label) {
    // Placeholder for analytics integration
    if (typeof gtag === 'function') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
        });
    }
}

// Track button clicks
document.addEventListener('click', function (e) {
    if (e.target.matches('.btn')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('button', 'click', buttonText);
    }

    if (e.target.matches('.nav-link')) {
        const linkText = e.target.textContent.trim();
        trackEvent('navigation', 'click', linkText);
    }
});

// ==================== FORM VALIDATION ====================
function setupFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', function (e) {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach((input) => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if element is in viewport
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get scroll percentage
 */
function getScrollPercentage() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return (scrollTop / docHeight) * 100;
}

/**
 * Add class when element enters viewport
 */
function addClassOnScroll(selector, className) {
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
}

/**
 * Create toast notification
 */
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: #DC2626;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showToast('Copied to clipboard!');
        })
        .catch(() => {
            showToast('Failed to copy');
        });
}

// ==================== FEATURE DETECTION ====================
function checkBrowserSupport() {
    const features = {
        css: {
            grid: CSS.supports('display', 'grid'),
            flex: CSS.supports('display', 'flex'),
            backdrop: CSS.supports('backdrop-filter', 'blur(1px)'),
        },
        js: {
            fetch: typeof fetch !== 'undefined',
            intersectionObserver: 'IntersectionObserver' in window,
            localStorage: typeof localStorage !== 'undefined',
        },
    };

    return features;
}

// ==================== INITIALIZATION ====================

// Call additional setup functions when needed
// setupParallaxEffect();
// setupLazyLoading();
setupKeyboardAccessibility();
setupPerformanceOptimization();

// Initialize form validation if forms exist
if (document.querySelectorAll('form').length > 0) {
    setupFormValidation();
}

// Log browser support (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Browser Support:', checkBrowserSupport());
    console.log('CrimsonSync app initialized successfully');
}

// Export functions for external use
window.CrimsonSync = {
    trackEvent,
    showToast,
    copyToClipboard,
    isElementInViewport,
    getScrollPercentage,
    addClassOnScroll,
    checkBrowserSupport,
};

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
    setupNavigation();
    setupAuthState();
    setupThemeToggle();
    setupScrollAnimations();
    setupCounterAnimation();
    setupScrollToTop();
    setupHoverEffects();
    setupSmoothScroll();
}

// ==================== AUTH & ROLE-BASED HOME ====================
const SESSION_KEY = window.CRIMSONSYNC_ENV?.SESSION_KEY || 'crimsonsync_session';
const REQUESTS_KEY = window.CRIMSONSYNC_ENV?.REQUESTS_STORAGE_KEY || 'crimsonsync_requests';

const ROLE_DASHBOARDS = {
    donor: '/src/pages/DonorDashboard/index.html',
    hospital: '/src/pages/HospitalDashboard/index.html',
    recipient: '/src/pages/RecipientDashboard/index.html',
    blood_bank: '/src/pages/BloodBankDashboard/index.html',
};

const ROLE_LABELS = {
    donor: 'Donor',
    hospital: 'Hospital',
    recipient: 'Recipient',
    blood_bank: 'Blood Bank',
};

const ROLE_BENEFITS = {
    donor: [
        { icon: '❤️', title: 'Track Donations', desc: 'View your donation history and reward points.' },
        { icon: '📋', title: 'Respond to Requests', desc: 'Accept emergency blood requests near you.' },
        { icon: '🏆', title: 'Climb the Leaderboard', desc: 'Earn badges and compete with fellow donors.' },
    ],
    hospital: [
        { icon: '📋', title: 'Manage Requests', desc: 'Create and track blood requests in real time.' },
        { icon: '🩸', title: 'Inventory Overview', desc: 'Monitor blood stock levels across types.' },
        { icon: '👥', title: 'Match Donors', desc: 'Find compatible donors instantly.' },
    ],
    recipient: [
        { icon: '🆘', title: 'Request Blood', desc: 'Submit urgent blood requests with one click.' },
        { icon: '✅', title: 'Track Matches', desc: 'Monitor donor matches and fulfillment status.' },
        { icon: '💬', title: 'Direct Chat', desc: 'Communicate with hospitals and donors.' },
    ],
    blood_bank: [
        { icon: '🩸', title: 'Stock Management', desc: 'Track inventory and emergency queue.' },
        { icon: '📄', title: 'Verify Partners', desc: 'Review hospital and donor verifications.' },
        { icon: '⚡', title: 'Emergency Queue', desc: 'Prioritize critical fulfillment requests.' },
    ],
};

function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getCurrentUser() {
    return getSession()?.user || null;
}

function isAuthenticated() {
    const session = getSession();
    return Boolean(session?.user?.id && session?.token);
}

function getStoredRequests() {
    try {
        const raw = localStorage.getItem(REQUESTS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setupAuthState() {
    const user = getCurrentUser();
    const navActions = document.getElementById('navActions');
    const roleNavLinks = document.getElementById('roleNavLinks');
    const loggedInPanel = document.getElementById('loggedInPanel');
    const requestAlerts = document.getElementById('requestAlerts');

    if (isAuthenticated() && user) {
        const dashboard = ROLE_DASHBOARDS[user.role] || ROLE_DASHBOARDS.donor;
        const roleLabel = ROLE_LABELS[user.role] || 'User';

        if (navActions) {
            navActions.innerHTML = `
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                    <span class="theme-icon">${document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}</span>
                </button>
                <a href="${dashboard}" class="nav-btn login-btn">Dashboard</a>
                <a href="/src/pages/Profile/index.html" class="nav-btn cta-btn">Profile</a>`;
        }

        if (roleNavLinks) {
            roleNavLinks.innerHTML = `
                <a href="${dashboard}" class="nav-link">Dashboard</a>
                <a href="/src/pages/Requests/index.html" class="nav-link">Requests</a>
                <a href="/src/pages/Chat/index.html" class="nav-link">Chat</a>`;
        }

        if (loggedInPanel) {
            loggedInPanel.hidden = false;
            loggedInPanel.innerHTML = `
                <div class="container">
                    <div class="welcome-card fade-in-up">
                        <div class="welcome-info">
                            <p class="welcome-greeting">Welcome back, <strong>${user.name || 'User'}</strong></p>
                            <p class="welcome-role">${roleLabel} · ${user.bloodType || 'Blood type not set'} · ${user.verified ? 'Verified' : 'Pending verification'}</p>
                        </div>
                        <div class="welcome-actions">
                            <a href="${dashboard}" class="btn btn-primary btn-sm">Go to Dashboard</a>
                            <a href="/src/pages/Requests/index.html" class="btn btn-secondary btn-sm">View Requests</a>
                            <a href="/src/pages/Profile/index.html" class="btn btn-secondary btn-sm">Edit Profile</a>
                        </div>
                    </div>
                </div>`;
        }

        renderRequestAlerts(requestAlerts, user);
        updateDynamicStats(user);
        updateRoleBenefits(user.role);
        setupHeroCTA(user);
    } else {
        setupHeroCTA(null);
    }
}

function renderRequestAlerts(container, user) {
    if (!container) return;
    const requests = getStoredRequests() || [];
    const urgent = requests.filter((r) => r.status === 'open' && ['critical', 'high'].includes(r.urgency));

    if (!urgent.length) {
        container.hidden = true;
        return;
    }

    container.hidden = false;
    container.innerHTML = `
        <div class="container">
            <div class="alert-banner" role="alert">
                <span class="alert-icon">🚨</span>
                <div class="alert-content">
                    <strong>${urgent.length} urgent blood request${urgent.length > 1 ? 's' : ''} need attention</strong>
                    <p>${user.role === 'donor' ? 'Compatible donors needed nearby.' : 'Review and manage open requests.'}</p>
                </div>
                <a href="/src/pages/Requests/index.html" class="btn btn-primary btn-sm">View Requests</a>
            </div>
        </div>`;
}

function updateDynamicStats(user) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const roleStats = {
        donor: [
            { target: user.points || 1250, label: 'Your Points', suffix: '' },
            { target: 8, label: 'Your Donations', suffix: '' },
            { target: 42, label: 'Leaderboard Rank', suffix: '' },
            { target: 3, label: 'Open Requests Nearby', suffix: '' },
        ],
        hospital: [
            { target: 6, label: 'Active Requests', suffix: '' },
            { target: 14, label: 'Matched Donors', suffix: '' },
            { target: 128, label: 'Inventory Units', suffix: '' },
            { target: 250, label: 'Hospitals Connected', suffix: '+' },
        ],
        recipient: [
            { target: 1, label: 'Active Requests', suffix: '' },
            { target: 1, label: 'Matched Donors', suffix: '' },
            { target: 3, label: 'Saved Centers', suffix: '' },
            { target: 10000, label: 'Emergency Requests', suffix: '+' },
        ],
        blood_bank: [
            { target: 342, label: 'Total Stock', suffix: '' },
            { target: 7, label: 'Pending Verifications', suffix: '' },
            { target: 3, label: 'Emergency Queue', suffix: '' },
            { target: 94, label: 'Fulfillment Rate', suffix: '%' },
        ],
    };

    const stats = roleStats[user.role] || roleStats.donor;
    statsGrid.innerHTML = stats.map((s) => `
        <div class="stat-card">
            <h3 class="stat-number" data-target="${s.target}" data-suffix="${s.suffix}">0</h3>
            <p class="stat-label">${s.label}</p>
        </div>`).join('');
}

function updateRoleBenefits(role) {
    const grid = document.getElementById('benefitsGrid');
    if (!grid) return;
    const benefits = ROLE_BENEFITS[role] || ROLE_BENEFITS.donor;
    grid.innerHTML = benefits.map((b, i) => `
        <div class="benefit-card fade-in-up" data-delay="${i * 0.1}">
            <div class="card-icon-lg">${b.icon}</div>
            <h3>${b.title}</h3>
            <p>${b.desc}</p>
        </div>`).join('');
}

function setupHeroCTA(user) {
    const donorBtn = document.getElementById('heroDonorBtn');
    const requestBtn = document.getElementById('heroRequestBtn');
    if (!donorBtn || !requestBtn) return;

    if (user) {
        const dashboard = ROLE_DASHBOARDS[user.role] || ROLE_DASHBOARDS.donor;
        if (user.role === 'donor') {
            donorBtn.textContent = 'Go to Dashboard';
            donorBtn.onclick = () => { window.location.href = dashboard; };
            requestBtn.textContent = 'View Requests';
            requestBtn.onclick = () => { window.location.href = '/src/pages/Requests/index.html'; };
        } else if (user.role === 'recipient' || user.role === 'hospital') {
            donorBtn.textContent = 'Create Request';
            donorBtn.onclick = () => { window.location.href = '/src/pages/Requests/index.html'; };
            requestBtn.textContent = 'Go to Dashboard';
            requestBtn.onclick = () => { window.location.href = dashboard; };
        } else {
            donorBtn.textContent = 'Go to Dashboard';
            donorBtn.onclick = () => { window.location.href = dashboard; };
            requestBtn.textContent = 'Manage Requests';
            requestBtn.onclick = () => { window.location.href = '/src/pages/Requests/index.html'; };
        }
    } else {
        donorBtn.onclick = () => { window.location.href = '/src/pages/Signup/signup.html'; };
        requestBtn.onclick = () => { window.location.href = '/src/pages/Login/login.html'; };
    }
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
    const duration = 2000;
    const startTime = Date.now();

    const targets = Array.from(counters).map((counter) => ({
        target: parseInt(counter.getAttribute('data-target'), 10) || 0,
        suffix: counter.getAttribute('data-suffix') || '+',
    }));

    function updateCounters() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        counters.forEach((counter, index) => {
            const { target, suffix } = targets[index];
            const current = Math.floor(target * progress);
            counter.textContent = suffix === '%'
                ? current + suffix
                : suffix === ''
                    ? formatNumber(current)
                    : formatNumber(current) + suffix;
        });

        if (progress < 1) {
            requestAnimationFrame(updateCounters);
        } else {
            counters.forEach((counter, index) => {
                const { target, suffix } = targets[index];
                counter.textContent = suffix === '%'
                    ? target + suffix
                    : suffix === ''
                        ? formatNumber(target)
                        : formatNumber(target) + suffix;
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
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle || themeToggle.dataset.bound) return;
    themeToggle.dataset.bound = 'true';

    themeToggle.addEventListener('click', function () {
        const activeTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
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

// ==================== PAGE TRANSITION ====================
(function () {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    // Fade in = page arriving (start opaque, fade to transparent)
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        });
    });

    // Intercept nav links that go to other pages
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || anchor.target === '_blank') return;
        e.preventDefault();
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
        setTimeout(() => { window.location.href = href; }, 350);
    });
})();

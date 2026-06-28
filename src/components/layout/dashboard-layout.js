/**
 * Dashboard layout component — reusable shell for all role dashboards.
 */
import { ROLE_LABELS, ROLE_DASHBOARD_PATHS } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import { getCurrentUser, logout } from '../../utils/auth.js';
import { initTheme, bindThemeToggle } from '../../hooks/useTheme.js';

const LOGO_SVG = `<svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

function getNavItems() {
    const user = getCurrentUser();
    const dashboardHref = ROLE_DASHBOARD_PATHS[user?.role] || ROUTES.HOME;
    return [
        { icon: '🏠', label: 'Dashboard', href: dashboardHref },
        { icon: '📋', label: 'Requests', href: ROUTES.REQUESTS },
        { icon: '💬', label: 'Chat', href: ROUTES.CHAT },
        { icon: '🏆', label: 'Leaderboard', href: ROUTES.LEADERBOARD },
        { icon: '👤', label: 'Profile', href: ROUTES.PROFILE },
    ];
}

export function renderDashboardLayout(options = {}) {
    const { title = 'Dashboard', activeNav = 'Dashboard', navItems = getNavItems(), content = '' } = options;
    const user = getCurrentUser();
    const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CS';
    const roleLabel = ROLE_LABELS[user?.role] || 'User';

    const navHtml = navItems.map((item) => {
        const isActive = item.label === activeNav;
        const href = item.href || '#';
        return `<a href="${href}" class="nav-item${isActive ? ' active' : ''}" data-nav="${item.label}">
            <span class="nav-icon">${item.icon}</span>${item.label}
        </a>`;
    }).join('');

    return `
    <div class="dashboard-app">
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <aside class="dashboard-sidebar" id="dashboardSidebar">
            <a href="/index.html" class="sidebar-logo">${LOGO_SVG}<span>CrimsonSync</span></a>
            <nav class="sidebar-nav">${navHtml}</nav>
            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <div class="avatar">${initials}</div>
                    <div>
                        <div class="user-name">${user?.name || 'User'}</div>
                        <div class="user-role">${roleLabel}</div>
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm btn-block" id="logoutBtn" style="margin-top:0.75rem">Logout</button>
            </div>
        </aside>
        <main class="dashboard-main">
            <header class="dashboard-header">
                <div style="display:flex;align-items:center;gap:1rem">
                    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
                    <h1>${title}</h1>
                </div>
                <div class="header-actions">
                    <button class="theme-toggle" data-theme-toggle aria-label="Toggle theme">
                        <span data-theme-icon>🌙</span>
                    </button>
                </div>
            </header>
            <div class="dashboard-content" id="dashboardContent">${content}</div>
        </main>
    </div>`;
}

export function mountDashboardLayout(container, options) {
    container.innerHTML = renderDashboardLayout(options);
    initTheme();
    bindThemeToggle();

    document.getElementById('logoutBtn')?.addEventListener('click', () => logout());
    document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
}

function toggleSidebar() {
    document.getElementById('dashboardSidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('dashboardSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
}

export function renderStatCards(stats = []) {
    return `<div class="dashboard-grid">${stats.map((s) => `
        <div class="stat-card${s.status ? ' ' + s.status : ''}">
            <div class="stat-icon">${s.icon}</div>
            <div class="stat-value">${s.value}</div>
            <div class="stat-label">${s.label}</div>
        </div>`).join('')}</div>`;
}

export function renderListCard(title, items, renderItem) {
    const listHtml = items.map(renderItem).join('');
    return `<div class="card"><div class="card-header"><h3 class="card-title">${title}</h3></div>${listHtml}</div>`;
}

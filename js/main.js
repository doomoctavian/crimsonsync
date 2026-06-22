import { config, protectedRoutes, roleMeta, storageKeys } from './config/appConfig.js';
import { createRealtimePlaceholder } from './api/client.js';
import { addRequest, currentUser, getState, login, logout, markNotificationsRead, resetDemoData, sendMessage, setActiveChat, signup, updateCurrentUser, updateRequestStatus } from './services/store.js';
import { assertEmail, escapeHtml, formatDate, formatShortDate, getCompatibilityHint, initials, normalizeRole, statusClass } from './utils/helpers.js';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modalRoot');
const toastRegion = document.getElementById('toastRegion');

const icons = {
  home: '⌂', dashboard: '▦', requests: '◇', messages: '✉', leaderboard: '☆', profile: '◉', verify: '✓', logout: '↗', theme: '◐', menu: '☰', bell: '•', plus: '+', attach: '⌁', search: '⌕', close: '×', shield: '▣', heart: '♥', drop: '●', chart: '▤', clock: '◷', users: '◎', alert: '!', check: '✓', calendar: '□', settings: '⚙', sos: 'SOS'
};

const dashboardNav = [
  { route: 'dashboard', label: 'Overview', icon: icons.dashboard },
  { route: 'requests', label: 'Requests', icon: icons.requests },
  { route: 'messages', label: 'Messages', icon: icons.messages },
  { route: 'leaderboard', label: 'Leaderboard', icon: icons.leaderboard },
  { route: 'profile', label: 'Profile', icon: icons.profile },
  { route: 'verify', label: 'Verification', icon: icons.verify },
];

function init() {
  applyTheme(getSavedTheme());
  window.addEventListener('hashchange', renderApp);
  window.addEventListener('crimsonsync:state-change', renderApp);
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  renderApp();
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash || 'home';
}

function navigate(route) {
  window.location.hash = `#/${route}`;
}

function renderApp() {
  const route = getRoute();
  const user = currentUser();

  if (protectedRoutes.has(route) && !user) {
    navigate('login');
    return;
  }

  if (route === 'dashboard' && user) {
    navigate(roleMeta[user.role].dashboardRoute);
    return;
  }

  if (['login', 'signup'].includes(route) && user) {
    navigate(roleMeta[user.role].dashboardRoute);
    return;
  }

  app.innerHTML = `${renderNav(route, user)}${renderRoute(route, user)}${user ? renderMobileBottomNav(route) : ''}`;
  hydrateRoute(route);
}

function renderRoute(route, user) {
  switch (route) {
    case 'home': return renderHome(user);
    case 'login': return renderLogin();
    case 'signup': return renderSignup();
    case 'forgot-password': return renderForgotPassword();
    case 'reset-password': return renderResetPassword();
    case 'verify': return renderVerify(user);
    case 'donor-dashboard': return renderDashboard(user, 'donor');
    case 'hospital-dashboard': return renderDashboard(user, 'hospital');
    case 'recipient-dashboard': return renderDashboard(user, 'recipient');
    case 'blood-bank-dashboard': return renderDashboard(user, 'bloodBank');
    case 'requests': return renderRequestsPage(user);
    case 'messages': return renderMessagesPage(user);
    case 'leaderboard': return renderLeaderboardPage(user);
    case 'profile': return renderProfilePage(user);
    case 'logout':
      navigate('home');
      logout();
      return '';
    default: return renderNotFound();
  }
}

function renderNav(route, user) {
  const unread = getState().notifications.filter((item) => !item.read).length;
  const publicLinks = [
    { route: 'home', label: 'Home' },
    { anchor: 'benefits', label: 'Benefits' },
    { anchor: 'alerts', label: 'Alerts' },
    { anchor: 'how-it-works', label: 'How It Works' },
  ];
  const authedLinks = [
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'requests', label: 'Requests' },
    { route: 'messages', label: 'Messages' },
    { route: 'leaderboard', label: 'Leaderboard' },
  ];
  const links = user ? authedLinks : publicLinks;

  return `
    <header class="navbar">
      <div class="nav-container">
        <button class="logo-lockup" data-route="home" aria-label="CrimsonSync home">
          <span class="brand-mark">C</span><span>CrimsonSync</span>
        </button>
        <nav class="nav-menu" id="navMenu" aria-label="Primary navigation">
          ${links.map((link) => link.route ? `<button class="nav-link" data-route="${link.route}" ${isRouteCurrent(route, link.route, user) ? 'aria-current="page"' : ''}>${link.label}</button>` : `<a class="nav-link" href="#${link.anchor}">${link.label}</a>`).join('')}
        </nav>
        <div class="nav-actions">
          ${user ? renderNotifications(unread) : ''}
          <button class="icon-btn" data-action="toggle-theme" aria-label="Toggle light and dark mode">${icons.theme}</button>
          ${user ? `
            <button class="btn btn-secondary desktop-only" data-route="profile">${escapeHtml(user.name.split(' ')[0])}</button>
            <button class="btn btn-primary desktop-only" data-action="logout">Logout</button>
          ` : `
            <button class="btn btn-ghost desktop-only" data-route="login">Login</button>
            <button class="btn btn-primary desktop-only" data-route="signup">Get Started</button>
          `}
          <button class="icon-btn mobile-toggle" data-action="toggle-menu" aria-label="Open menu">${icons.menu}</button>
        </div>
      </div>
    </header>`;
}

function renderNotifications(unread) {
  const items = getState().notifications.slice(0, 4);
  return `
    <div class="notification-wrap">
      <button class="icon-btn" data-action="toggle-notifications" aria-label="Open notifications">${icons.bell}${unread ? `<span class="notification-dot">${unread}</span>` : ''}</button>
      <div id="notificationsPanel" class="notifications-panel card" role="dialog" aria-label="Notifications">
        <div class="between"><strong>Notifications</strong><button class="btn btn-ghost" data-action="mark-notifications-read">Mark read</button></div>
        ${items.map((item) => `<div class="card card-pad ${item.read ? '' : 'alert-card'}"><strong>${escapeHtml(item.title)}</strong><p class="text-muted">${escapeHtml(item.body)}</p></div>`).join('')}
      </div>
    </div>`;
}

function isRouteCurrent(current, link, user) {
  if (link === 'dashboard' && user) {
    return current === roleMeta[user.role].dashboardRoute;
  }
  return current === link;
}

function renderHome(user) {
  const state = getState();
  const criticalAlerts = state.requests.filter((request) => ['critical', 'urgent'].includes(request.urgency)).slice(0, 3);
  return `
    <main>
      <section class="hero" id="home">
        <div class="container hero-grid">
          <div>
            <span class="eyebrow">${icons.heart} Next-gen blood donation network</span>
            <h1 class="hero-title">Connecting Donors.<br><span class="highlight">Saving Lives.</span></h1>
            <p class="hero-copy">CrimsonSync bridges donors, recipients, hospitals, and blood banks in real time. The interface now supports role-specific workflows, secure messaging readiness, verification, request tracking, and API-ready data boundaries.</p>
            <div class="cluster hero-actions">
              ${user ? `<button class="btn btn-primary" data-route="dashboard">Open ${roleMeta[user.role].label} Dashboard</button>` : `<button class="btn btn-primary" data-route="signup" data-prefill-role="donor">Become a Donor</button><button class="btn btn-secondary" data-route="signup" data-prefill-role="recipient">Request Blood</button>`}
            </div>
            <div class="role-entry-grid" aria-label="Role entry points">
              ${Object.entries(roleMeta).map(([role, meta]) => `<button class="role-entry" data-route="${user?.role === role ? meta.dashboardRoute : 'signup'}" data-prefill-role="${role}"><strong>${meta.label}</strong><span>${meta.entryCopy}</span></button>`).join('')}
            </div>
          </div>
          <div class="hero-panel" aria-label="CrimsonSync platform highlights">
            <div class="floating-card"><div class="cluster"><span class="card-icon">${icons.heart}</span><div><strong>1 Donation</strong><p class="text-muted">Can support up to 3 lives with verified routing.</p></div></div></div>
            <div class="floating-card"><div class="cluster"><span class="card-icon">${icons.shield}</span><div><strong>Verified Match Found</strong><p class="text-muted">Role-specific approvals unlock secure chat.</p></div></div></div>
            <div class="floating-card"><div class="cluster"><span class="card-icon">${icons.alert}</span><div><strong>Emergency Queue</strong><p class="text-muted">Urgency tags, timelines, and inventory signals.</p></div></div></div>
          </div>
        </div>
      </section>
      <section class="container stats-strip" aria-label="Live platform stats">
        ${renderStat('50K+', 'Registered donors')}
        ${renderStat('150K+', 'Lives supported')}
        ${renderStat('250+', 'Hospitals connected')}
        ${renderStat('10K+', 'Emergency requests')}
      </section>
      <section class="section" id="benefits">
        <div class="container">
          <div class="section-header"><span class="eyebrow">Built for every role</span><h2>One elegant CrimsonSync experience, adapted to each workflow.</h2><p>Dashboards, cards, alerts, and actions stay within the original premium healthcare design language while becoming interactive and extensible.</p></div>
          <div class="grid grid-4">
            ${renderFeature('Donor experience', 'Eligibility status, nearby centers, donation history, badges, leaderboard position, and approved chat.', icons.heart)}
            ${renderFeature('Hospital operations', 'Request creation, inventory views, donor matching, urgent alerts, and analytics cards.', icons.chart)}
            ${renderFeature('Recipient support', 'Blood requests, tracking timelines, matched donor/hospital cards, history, and saved care locations.', icons.users)}
            ${renderFeature('Blood bank controls', 'Verification queues, approval decisions, emergency stock analytics, and request triage.', icons.shield)}
          </div>
        </div>
      </section>
      <section class="section-tight" id="alerts">
        <div class="container">
          <div class="between"><div><span class="eyebrow">Active request alerts</span><h2>Request signals without visual clutter.</h2></div><button class="btn btn-secondary" data-route="requests">View all requests</button></div>
          <div class="grid grid-3">
            ${criticalAlerts.map(renderRequestCard).join('') || renderEmpty('No urgent alerts right now.', 'Critical and urgent requests will appear here.')}
          </div>
        </div>
      </section>
      <section class="section" id="how-it-works">
        <div class="container">
          <div class="cta-band between">
            <div><span class="eyebrow" style="color:white">Secure coordination</span><h2>Signup, verify, match, chat, and fulfill.</h2><p>Frontend route protection, local mock state, and API placeholders are ready for Django, FastAPI, MongoDB, uploads, and websocket chat.</p></div>
            <div class="cluster"><button class="btn btn-secondary" data-route="signup">Create account</button><button class="btn btn-ghost" style="color:white;border-color:rgba(255,255,255,.55)" data-route="leaderboard">See leaderboard</button></div>
          </div>
        </div>
      </section>
    </main>`;
}

function renderStat(value, label) {
  return `<article class="card stat-card"><div class="stat-number">${value}</div><p class="text-muted">${label}</p></article>`;
}

function renderFeature(title, body, icon) {
  return `<article class="card card-pad card-hover"><span class="feature-icon">${icon}</span><h3>${title}</h3><p class="text-muted">${body}</p></article>`;
}

function renderLogin() {
  return `
    <main class="auth-page"><div class="container auth-grid">
      ${renderAuthBrand('Welcome back to CrimsonSync', 'Access role-specific dashboards, request tracking, verification, leaderboard progress, and approved secure messaging from one clean frontend.')}
      <section class="card auth-card" aria-labelledby="loginTitle">
        <span class="eyebrow">Secure login</span><h1 id="loginTitle" style="font-size:2.4rem">Sign in</h1>
        <form class="form-grid" data-form="login" novalidate>
          <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" placeholder="donor@crimsonsync.test" required></label>
          <label class="field"><span>Password</span><input class="input" name="password" type="password" autocomplete="current-password" placeholder="demo123" required></label>
          <label class="cluster"><input type="checkbox" name="remember"> <span class="text-muted">Remember this session</span></label>
          <button class="btn btn-primary" type="submit">Sign in</button>
          <div class="between"><button class="nav-link" type="button" data-route="forgot-password">Forgot password?</button><button class="nav-link" type="button" data-route="signup">Create account</button></div>
          <p class="help-text">Demo users: donor, hospital, recipient, or bloodbank @crimsonsync.test with password demo123.</p>
        </form>
      </section>
    </div></main>`;
}

function renderSignup() {
  const prefill = normalizeRole(sessionStorage.getItem('crimsonsync_prefill_role') || 'donor');
  return `
    <main class="auth-page"><div class="container auth-grid">
      ${renderAuthBrand('Choose your CrimsonSync role', 'Signup collects only the essential fields first. Phone numbers are intentionally deferred; verification is a separate post-signup step.')}
      <section class="card auth-card" aria-labelledby="signupTitle">
        <span class="eyebrow">Create account</span><h1 id="signupTitle" style="font-size:2.4rem">Start safely</h1>
        <form class="form-grid" data-form="signup" novalidate>
          <div class="role-picker">
            ${Object.entries(roleMeta).map(([role, meta]) => `<label class="role-option"><input type="radio" name="role" value="${role}" ${role === prefill ? 'checked' : ''}><span><strong>${meta.label}</strong><small>${meta.entryCopy}</small></span></label>`).join('')}
          </div>
          <label class="field"><span>Name or organization</span><input class="input" name="name" autocomplete="name" placeholder="Your full name or institution" required></label>
          <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
          <div class="form-grid two">
            <label class="field"><span>Password</span><input class="input" name="password" type="password" autocomplete="new-password" minlength="6" placeholder="Minimum 6 characters" required></label>
            <label class="field"><span>Blood group</span><select class="select" name="bloodGroup"><option>O-</option><option>O+</option><option>A-</option><option>A+</option><option>B-</option><option>B+</option><option>AB-</option><option>AB+</option><option>N/A</option></select></label>
          </div>
          <label class="field"><span>Location</span><input class="input" name="location" placeholder="City, neighborhood, or care region" required></label>
          <button class="btn btn-primary" type="submit">Create account and verify</button>
          <button class="nav-link" type="button" data-route="login">Already have an account?</button>
        </form>
      </section>
    </div></main>`;
}

function renderAuthBrand(title, body) {
  return `<aside class="auth-brand"><span class="brand-mark" style="width:4rem;height:4rem;font-size:1.7rem;margin:auto auto 1rem">C</span><h2>${title}</h2><p class="text-muted">${body}</p><div class="grid grid-3" style="margin-top:1.5rem">${renderMiniProof('Protected routes', 'Frontend guardrails')}${renderMiniProof('API-ready', 'Django/FastAPI/MongoDB')}${renderMiniProof('Theme-safe', 'Light and dark persistence')}</div></aside>`;
}

function renderMiniProof(title, body) {
  return `<div class="card card-pad"><strong>${title}</strong><p class="text-muted">${body}</p></div>`;
}

function renderForgotPassword() {
  return `
    <main class="auth-page"><div class="container auth-grid">
      ${renderAuthBrand('Recover access', 'Password reset is mocked in the frontend and ready to connect to an email/OTP backend endpoint later.')}
      <section class="card auth-card"><span class="eyebrow">Password help</span><h1 style="font-size:2.4rem">Forgot password</h1>
        <form class="form-grid" data-form="forgot" novalidate>
          <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="you@example.com" required></label>
          <button class="btn btn-primary" type="submit">Send reset link</button>
          <button class="nav-link" type="button" data-route="login">Back to login</button>
        </form>
      </section>
    </div></main>`;
}

function renderResetPassword() {
  return `
    <main class="auth-page"><div class="container auth-grid">
      ${renderAuthBrand('Set a new password', 'This screen represents the final token-backed reset step for future backend integration.')}
      <section class="card auth-card"><span class="eyebrow">Reset password</span><h1 style="font-size:2.4rem">Create new password</h1>
        <form class="form-grid" data-form="reset" novalidate>
          <label class="field"><span>New password</span><input class="input" name="password" type="password" minlength="6" required></label>
          <label class="field"><span>Confirm password</span><input class="input" name="confirmPassword" type="password" minlength="6" required></label>
          <button class="btn btn-primary" type="submit">Update password</button>
        </form>
      </section>
    </div></main>`;
}

function renderVerify(user) {
  if (!user) return '';
  const requiredDocs = {
    donor: ['Government ID', 'Donor card or previous donation record'],
    hospital: ['Hospital operating license', 'Official request authorization', 'Facility contact letter'],
    recipient: ['Identity document if requested', 'Care provider note placeholder'],
    bloodBank: ['Blood bank operating license', 'Compliance certificate', 'Facility authorization letter'],
  }[user.role];
  return renderDashboardShell(user, 'verify', `
    <section class="card card-pad">
      <div class="between"><div><span class="eyebrow">Verification</span><h2>${roleMeta[user.role].label} verification</h2><p class="text-muted">${roleMeta[user.role].verificationCopy}</p></div>${renderStatus(user.verificationStatus)}</div>
      <div class="grid grid-3" style="margin-top:1rem">${requiredDocs.map((doc) => `<div class="card card-pad"><strong>${doc}</strong><p class="text-muted">Upload placeholder ready for ${config.uploadEndpoint}.</p><button class="btn btn-secondary" data-action="mock-upload">Choose file</button></div>`).join('')}</div>
    </section>
    <section class="card card-pad">
      <h3>Email / OTP placeholder</h3><p class="text-muted">Use this staged step for email OTP or identity review flows before backend services exist.</p>
      <form class="form-grid two" data-form="verify"><label class="field"><span>Verification code</span><input class="input" name="code" placeholder="123456" required></label><div class="field"><span>&nbsp;</span><button class="btn btn-primary" type="submit">Submit verification</button></div></form>
    </section>`);
}

function renderDashboard(user, expectedRole) {
  if (!user) return '';
  if (user.role !== expectedRole) {
    return renderDashboard(user, user.role);
  }
  const content = {
    donor: renderDonorDashboard,
    hospital: renderHospitalDashboard,
    recipient: renderRecipientDashboard,
    bloodBank: renderBloodBankDashboard,
  }[user.role](user);
  return renderDashboardShell(user, 'dashboard', content);
}

function renderDashboardShell(user, active, content) {
  return `
    <main class="dashboard-shell">
      <section class="dashboard-hero"><div class="container between"><div><span class="eyebrow" style="color:white">${roleMeta[user.role].label} workspace</span><h1 style="font-size:clamp(2rem,5vw,3.4rem);margin-bottom:.5rem">${dashboardGreeting(user)}</h1><p class="text-muted">${dashboardSubcopy(user)}</p></div><div class="cluster">${renderStatus(user.verificationStatus)}<button class="btn btn-secondary" data-route="profile">Edit profile</button></div></div></section>
      <div class="container dashboard-grid">
        ${renderSidebar(active)}
        <div class="dashboard-content">${content}</div>
      </div>
    </main>`;
}

function dashboardGreeting(user) {
  const names = { donor: 'Your donor impact dashboard', hospital: 'Hospital command center', recipient: 'Your request tracking home', bloodBank: 'Blood bank verification hub' };
  return names[user.role] || `Welcome, ${user.name}`;
}

function dashboardSubcopy(user) {
  const copy = {
    donor: 'Eligibility, appointments, badges, nearby centers, accepted requests, and secure chats in one place.',
    hospital: 'Create blood requests, monitor inventory, match donors, send urgent alerts, and coordinate approved chats.',
    recipient: 'Submit requests, view timeline progress, track matched donors and hospitals, and manage history.',
    bloodBank: 'Approve verifications, manage stock, triage emergency queues, and coordinate verified request flows.',
  };
  return copy[user.role];
}

function renderSidebar(active) {
  return `<aside class="card sidebar"><nav aria-label="Dashboard navigation">${dashboardNav.map((item) => `<button class="sidebar-link ${active === item.route || (active === 'dashboard' && item.route === 'dashboard') ? 'active' : ''}" data-route="${item.route}"><span class="sidebar-icon">${item.icon}</span><span>${item.label}</span></button>`).join('')}</nav></aside>`;
}

function renderDonorDashboard(user) {
  const state = getState();
  const accepted = state.requests.filter((request) => request.status === 'accepted');
  return `
    ${renderMetrics([{ label: 'Eligibility', value: 'Eligible' }, { label: 'Reward points', value: user.points.toLocaleString() }, { label: 'Donations', value: user.donations }, { label: 'Leaderboard', value: '#1' }])}
    <div class="workspace-grid">
      <section class="stack">
        <article class="card card-pad"><div class="between"><div><h3>Upcoming appointment</h3><p class="text-muted">Central Donation Center · Jun 24 · 2:30 PM</p></div><button class="btn btn-secondary" data-action="show-toast" data-message="Appointment booking placeholder ready.">${icons.calendar} Manage</button></div></article>
        <article class="card card-pad"><h3>Donation requests</h3><div class="stack">${accepted.map(renderRequestCard).join('') || renderEmpty('No accepted requests.', 'Approved requests will unlock chat here.')}</div></article>
        <article class="card card-pad"><h3>Nearby donation centers</h3><div class="grid grid-3">${state.centers.map((center) => `<div class="card card-pad"><strong>${center.name}</strong><p class="text-muted">${center.distance} · ${center.availability}</p>${center.verified ? renderStatus('verified') : ''}</div>`).join('')}</div></article>
      </section>
      <aside class="stack"><article class="card card-pad"><h3>Profile summary</h3>${renderProfileSummary(user)}</article>${renderBadgeProgress(user)}</aside>
    </div>`;
}

function renderHospitalDashboard(user) {
  const state = getState();
  return `
    ${renderMetrics([{ label: 'Open requests', value: state.requests.filter((r) => ['pending', 'review', 'accepted'].includes(r.status)).length }, { label: 'O- units', value: state.inventory.find((i) => i.type === 'O-')?.units || 0 }, { label: 'Matched donors', value: 12 }, { label: 'Urgent alerts', value: state.requests.filter((r) => ['urgent', 'critical'].includes(r.urgency)).length }])}
    <div class="workspace-grid">
      <section class="stack"><article class="card card-pad"><div class="between"><div><h3>Create blood request</h3><p class="text-muted">Fast request form with compatibility hints and future API payload mapping.</p></div><button class="btn btn-primary" data-route="requests">Create request</button></div></article><article class="card card-pad"><h3>Request tracking</h3><div class="stack">${state.requests.filter((request) => request.requesterRole === 'hospital').map(renderRequestCard).join('')}</div></article></section>
      <aside class="stack"><article class="card card-pad"><h3>Inventory view</h3>${renderInventoryTable()}</article><article class="card card-pad"><h3>Donor matching panel</h3>${state.donors.slice(0, 3).map((donor) => `<div class="between"><span>${donor.name} · ${donor.bloodGroup}</span><button class="btn btn-secondary" data-action="show-toast" data-message="Donor match queued.">Match</button></div>`).join('<div class="divider"></div>')}</article></aside>
    </div>`;
}

function renderRecipientDashboard(user) {
  const state = getState();
  return `
    ${renderMetrics([{ label: 'Active requests', value: state.requests.filter((r) => r.requesterRole === 'recipient' && r.status !== 'fulfilled').length }, { label: 'Verification', value: user.verificationStatus }, { label: 'Saved care sites', value: 3 }, { label: 'Chats open', value: state.chatThreads.filter((thread) => thread.approved).length }])}
    <div class="workspace-grid">
      <section class="stack"><article class="card card-pad"><div class="between"><div><h3>Submit blood request</h3><p class="text-muted">Use the request system for urgency, units, status timeline, and compatibility hints.</p></div><button class="btn btn-primary" data-route="requests">Start request</button></div></article><article class="card card-pad"><h3>Request history</h3><div class="stack">${state.requests.filter((request) => request.requesterRole === 'recipient').map(renderRequestCard).join('') || renderEmpty('No recipient requests yet.', 'Submitted requests will appear here.')}</div></article></section>
      <aside class="stack"><article class="card card-pad"><h3>Matched donor / hospital</h3><p><strong>Avery Donor</strong> · O- · Verified donor</p><p class="text-muted">CityCare Hospital is coordinating the accepted request workflow.</p><button class="btn btn-secondary" data-route="messages">Open chat when accepted</button></article><article class="card card-pad"><h3>Saved hospitals and banks</h3>${getState().centers.map((center) => `<p><strong>${center.name}</strong><br><span class="text-muted">${center.distance} · ${center.availability}</span></p>`).join('')}</article></aside>
    </div>`;
}

function renderBloodBankDashboard() {
  const state = getState();
  return `
    ${renderMetrics([{ label: 'Verification queue', value: state.verificationQueue.length }, { label: 'Critical stock types', value: state.inventory.filter((item) => item.status === 'critical').length }, { label: 'Emergency requests', value: state.requests.filter((r) => ['urgent', 'critical'].includes(r.urgency)).length }, { label: 'Open chats', value: state.chatThreads.length }])}
    <div class="workspace-grid">
      <section class="stack"><article class="card card-pad"><h3>Verification queue</h3>${state.verificationQueue.map((item) => `<div class="request-card"><div class="between"><div><strong>${item.entity}</strong><p class="text-muted">${item.role} · ${item.document}</p></div>${renderStatus(item.status)}</div><div class="cluster"><button class="btn btn-primary" data-action="show-toast" data-message="Verification approved in mock queue.">Approve</button><button class="btn btn-danger" data-action="show-toast" data-message="Verification denied in mock queue.">Deny</button></div></div>`).join('')}</article><article class="card card-pad"><h3>Emergency request queue</h3><div class="stack">${state.requests.filter((request) => ['urgent', 'critical'].includes(request.urgency)).map(renderRequestCard).join('')}</div></article></section>
      <aside class="stack"><article class="card card-pad"><h3>Stock analytics</h3>${renderInventoryTable()}</article><article class="card card-pad"><h3>Chat management</h3><p class="text-muted">Approved threads can be supervised or connected to websocket services later.</p><button class="btn btn-secondary" data-route="messages">Open messaging</button></article></aside>
    </div>`;
}

function renderMetrics(items) {
  return `<section class="metric-grid">${items.map((item) => `<article class="card metric-card"><small>${item.label}</small><strong>${item.value}</strong></article>`).join('')}</section>`;
}

function renderProfileSummary(user) {
  return `<div class="profile-header"><div class="avatar">${initials(user.name)}</div><div><strong>${escapeHtml(user.name)}</strong><p class="text-muted">${roleMeta[user.role].label} · ${escapeHtml(user.bloodGroup)}</p>${renderStatus(user.verificationStatus)}</div></div><div class="divider"></div><p><strong>Location:</strong> ${escapeHtml(user.location)}</p><p><strong>Availability:</strong> ${escapeHtml(user.availability)}</p>`;
}

function renderBadgeProgress(user) {
  const nextBadge = getState().badgeCatalog.find((badge) => !user.badges.includes(badge.name)) || getState().badgeCatalog[2];
  return `<article class="card card-pad"><h3>Badges</h3><div class="cluster">${user.badges.map((badge) => `<span class="badge badge-red">${badge}</span>`).join('')}</div><div class="divider"></div><strong>Progress toward ${nextBadge.name}</strong><p class="text-muted">${nextBadge.description}</p><div class="progress-bar"><span style="width:${nextBadge.progress}%"></span></div></article>`;
}

function renderInventoryTable() {
  return `<div class="table-wrap"><table><thead><tr><th>Type</th><th>Units</th><th>Status</th></tr></thead><tbody>${getState().inventory.map((item) => `<tr><td><strong>${item.type}</strong></td><td>${item.units}</td><td>${renderStatus(item.status)}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderRequestsPage(user) {
  if (!user) return '';
  const state = getState();
  return renderDashboardShell(user, 'requests', `
    <section class="card card-pad"><div class="between"><div><span class="eyebrow">Request system</span><h2>Create and track requests</h2><p class="text-muted">Accept, decline, fulfill, cancel, view details, and expose status timelines with mock data.</p></div><button class="btn btn-danger" data-action="show-toast" data-message="Emergency SOS request placeholder triggered.">${icons.sos}</button></div>
      <form class="form-grid" data-form="request" style="margin-top:1rem" novalidate>
        <div class="form-grid two"><label class="field"><span>Request title</span><input class="input" name="title" placeholder="O- units for trauma intake" required></label><label class="field"><span>Blood group</span><select class="select" name="bloodGroup"><option>O-</option><option>O+</option><option>A-</option><option>A+</option><option>B-</option><option>B+</option><option>AB-</option><option>AB+</option></select></label></div>
        <div class="form-grid two"><label class="field"><span>Units</span><input class="input" name="units" type="number" min="1" value="1" required></label><label class="field"><span>Urgency</span><select class="select" name="urgency"><option value="low">Low</option><option value="medium">Medium</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></label></div>
        <div class="form-grid two"><label class="field"><span>Location</span><input class="input" name="location" value="${escapeHtml(user.location)}" required></label><label class="field"><span>Needed by</span><input class="input" name="dueAt" type="datetime-local" required></label></div>
        <label class="field"><span>Details</span><textarea class="textarea" name="details" placeholder="Clinical context, pickup notes, or donor preferences" required></textarea><span class="help-text" id="compatibilityHint">Select a blood group to see compatibility guidance.</span></label>
        <button class="btn btn-primary" type="submit">Submit request</button>
      </form>
    </section>
    <section class="card card-pad"><div class="between"><h3>Request history</h3><div class="cluster"><button class="btn btn-ghost" data-action="filter-requests" data-filter="all">All</button><button class="btn btn-ghost" data-action="filter-requests" data-filter="accepted">Accepted</button><button class="btn btn-ghost" data-action="filter-requests" data-filter="pending">Pending</button></div></div><div id="requestList" class="stack" style="margin-top:1rem">${state.requests.map(renderRequestCard).join('')}</div></section>`);
}

function renderRequestCard(request) {
  return `<article class="request-card" data-request-status="${request.status}">
    <div class="between"><div><strong>${escapeHtml(request.title)}</strong><p class="text-muted">${escapeHtml(request.requester)} · ${escapeHtml(request.location)} · ${formatShortDate(request.dueAt)}</p></div><div class="cluster">${renderStatus(request.urgency)}${renderStatus(request.status)}</div></div>
    <p class="text-muted">${escapeHtml(request.details)}</p>
    <div class="cluster"><span class="badge badge-red">${request.bloodGroup}</span><span class="badge badge-blue">${request.units} unit${request.units === 1 ? '' : 's'}</span><span class="text-muted">${getCompatibilityHint(request.bloodGroup)}</span></div>
    <div class="cluster"><button class="btn btn-secondary" data-action="request-details" data-request-id="${request.id}">Details</button><button class="btn btn-primary" data-action="request-status" data-request-id="${request.id}" data-status="accepted">Accept</button><button class="btn btn-ghost" data-action="request-status" data-request-id="${request.id}" data-status="fulfilled">Mark fulfilled</button><button class="btn btn-danger" data-action="request-status" data-request-id="${request.id}" data-status="declined">Decline</button><button class="btn btn-ghost" data-action="request-status" data-request-id="${request.id}" data-status="cancelled">Cancel</button>${request.status === 'accepted' ? `<button class="btn btn-secondary" data-route="messages">Open chat</button>` : ''}</div>
  </article>`;
}

function renderMessagesPage(user) {
  if (!user) return '';
  const state = getState();
  const threads = state.chatThreads.filter((thread) => thread.approved && (thread.participants.includes(user.id) || ['bloodBank', 'hospital'].includes(user.role)));
  const active = threads.find((thread) => thread.id === state.activeChatId) || threads[0];
  const realtime = active ? createRealtimePlaceholder(active.id) : null;
  return renderDashboardShell(user, 'messages', `
    <section class="card chat-layout">
      <aside class="chat-list"><div class="card-pad"><span class="eyebrow">Secure messages</span><h3>Approved chats</h3><p class="text-muted">Chat appears only after request acceptance.</p></div>${threads.map((thread) => `<button class="chat-thread-button ${active?.id === thread.id ? 'active' : ''}" data-action="set-chat" data-chat-id="${thread.id}"><strong>${escapeHtml(thread.title)}</strong><p class="text-muted">Request ${thread.requestId}${thread.unread ? ` · ${thread.unread} unread` : ''}</p></button>`).join('') || renderEmpty('No approved chats.', 'Accepted requests will create secure chat threads.')}</aside>
      ${active ? `<div class="chat-window"><header class="card-pad between"><div><h3>${escapeHtml(active.title)}</h3><p class="text-muted">Realtime placeholder: ${escapeHtml(realtime.url)}</p></div><span class="badge badge-green">Encrypted-ready UI</span></header><div class="message-list">${active.messages.map((message) => renderMessage(message, user)).join('')}<div class="typing"><span>Care team typing</span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div><form class="chat-compose" data-form="chat"><button type="button" class="btn btn-ghost" data-action="show-toast" data-message="Attachment upload placeholder ready.">${icons.attach}</button><input class="input" name="message" placeholder="Write a secure message..." autocomplete="off" required><button class="btn btn-primary" type="submit" data-chat-id="${active.id}">Send</button></form></div>` : `<div class="empty-state">No chat selected.</div>`}
    </section>`);
}

function renderMessage(message, user) {
  const mine = message.senderId === user.id;
  return `<div class="message ${mine ? 'mine' : ''}"><div>${escapeHtml(message.text)}</div><div class="message-meta">${escapeHtml(message.time)} · ${message.read ? 'Read' : 'Unread'}</div></div>`;
}

function renderLeaderboardPage(user) {
  if (!user) return '';
  const state = getState();
  const sorted = [...state.donors].sort((a, b) => b.points - a.points);
  return renderDashboardShell(user, 'leaderboard', `
    <section class="card card-pad"><div class="between"><div><span class="eyebrow">Leaderboard and badges</span><h2>Professional impact ranking</h2><p class="text-muted">Ranks use points, donations, frequency, impact, and helped hours without making the experience chaotic.</p></div><button class="btn btn-secondary" data-action="sort-leaderboard">Sort by impact</button></div></section>
    <div class="workspace-grid"><section class="stack">${sorted.map((donor, index) => `<article class="leaderboard-row"><span class="rank">${index + 1}</span><div><strong>${donor.name}</strong><p class="text-muted">${donor.bloodGroup} · ${donor.donations} donations · ${donor.hoursHelped} hours helped</p><div class="cluster">${donor.badges.map((badge) => `<span class="badge badge-red">${badge}</span>`).join('')}</div></div><strong>${donor.points.toLocaleString()} pts</strong><span class="badge badge-blue">${donor.streak} streak</span></article>`).join('')}</section><aside class="stack"><article class="card card-pad"><h3>Badge catalog</h3>${state.badgeCatalog.map((badge) => `<div><div class="between"><strong>${badge.name}</strong><span>${badge.progress}%</span></div><p class="text-muted">${badge.description}</p><div class="progress-bar"><span style="width:${badge.progress}%"></span></div></div><div class="divider"></div>`).join('')}</article></aside></div>`);
}

function renderProfilePage(user) {
  if (!user) return '';
  return renderDashboardShell(user, 'profile', `
    <section class="card card-pad"><div class="profile-header"><div class="profile-avatar">${initials(user.name)}</div><div><span class="eyebrow">Profile management</span><h2>${escapeHtml(user.name)}</h2><p class="text-muted">Profile picture and document upload placeholders are ready for backend upload services.</p>${renderStatus(user.verificationStatus)}</div></div></section>
    <section class="card card-pad"><form class="form-grid" data-form="profile" novalidate>
      <div class="form-grid two"><label class="field"><span>Name</span><input class="input" name="name" value="${escapeHtml(user.name)}" required></label><label class="field"><span>Blood group</span><select class="select" name="bloodGroup">${['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+', 'N/A'].map((type) => `<option ${type === user.bloodGroup ? 'selected' : ''}>${type}</option>`).join('')}</select></label></div>
      <div class="form-grid two"><label class="field"><span>Location</span><input class="input" name="location" value="${escapeHtml(user.location)}" required></label><label class="field"><span>Emergency contact</span><input class="input" name="emergencyContact" value="${escapeHtml(user.emergencyContact)}"></label></div>
      <label class="field"><span>Availability</span><input class="input" name="availability" value="${escapeHtml(user.availability)}"></label>
      <label class="field"><span>Donation preferences</span><textarea class="textarea" name="preferences">${escapeHtml(user.preferences)}</textarea></label>
      <div class="form-grid two"><label class="field"><span>Notification settings</span><select class="select" name="notifications"><option value="true" ${user.notifications ? 'selected' : ''}>Enable request and chat notifications</option><option value="false" ${!user.notifications ? 'selected' : ''}>Disable non-critical notifications</option></select></label><label class="field"><span>Privacy settings</span><input class="input" name="privacy" value="${escapeHtml(user.privacy)}"></label></div>
      <div class="grid grid-2"><div class="card card-pad"><strong>Profile picture</strong><p class="text-muted">Avatar upload placeholder.</p><button class="btn btn-secondary" type="button" data-action="mock-upload">Upload photo</button></div><div class="card card-pad"><strong>Documents / ID</strong><p class="text-muted">Document upload placeholder.</p><button class="btn btn-secondary" type="button" data-route="verify">Manage verification</button></div></div>
      <button class="btn btn-primary" type="submit">Save profile</button>
    </form></section>`);
}

function renderStatus(status) {
  return `<span class="status-pill ${statusClass(status)}">${escapeHtml(String(status).replace(/\b\w/g, (letter) => letter.toUpperCase()))}</span>`;
}

function renderEmpty(title, body) {
  return `<div class="empty-state"><strong>${title}</strong><p>${body}</p></div>`;
}

function renderNotFound() {
  return `<main class="section"><div class="container empty-state"><h1>Page not found</h1><p>Return to a CrimsonSync workspace.</p><button class="btn btn-primary" data-route="home">Go home</button></div></main>`;
}

function renderMobileBottomNav(route) {
  return `<nav class="mobile-bottom-nav" aria-label="Mobile dashboard navigation">${dashboardNav.slice(0, 4).map((item) => `<button class="${route === item.route ? 'active' : ''}" data-route="${item.route}"><span>${item.icon}</span><span>${item.label}</span></button>`).join('')}</nav>`;
}

function hydrateRoute(route) {
  if (route === 'requests') {
    const bloodSelect = document.querySelector('select[name="bloodGroup"]');
    const hint = document.getElementById('compatibilityHint');
    if (bloodSelect && hint) {
      hint.textContent = getCompatibilityHint(bloodSelect.value);
    }
  }
}

function handleClick(event) {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) {
    const prefillRole = routeButton.dataset.prefillRole;
    if (prefillRole) {
      sessionStorage.setItem('crimsonsync_prefill_role', normalizeRole(prefillRole));
    }
    navigate(routeButton.dataset.route);
    closeMobileMenu();
    return;
  }

  const actionElement = event.target.closest('[data-action]');
  if (!actionElement) return;
  const action = actionElement.dataset.action;

  if (action === 'toggle-theme') toggleTheme();
  if (action === 'toggle-menu') document.getElementById('navMenu')?.classList.toggle('open');
  if (action === 'toggle-notifications') document.getElementById('notificationsPanel')?.classList.toggle('open');
  if (action === 'mark-notifications-read') { markNotificationsRead(); toast('Notifications marked read.'); }
  if (action === 'logout') { logout(); navigate('home'); toast('Signed out.'); }
  if (action === 'show-toast') toast(actionElement.dataset.message || 'Action is ready for backend integration.');
  if (action === 'mock-upload') toast(`Upload placeholder ready for ${config.uploadEndpoint}.`);
  if (action === 'request-status') {
    updateRequestStatus(actionElement.dataset.requestId, actionElement.dataset.status);
    toast(`Request marked ${actionElement.dataset.status}.`);
  }
  if (action === 'request-details') showRequestDetails(actionElement.dataset.requestId);
  if (action === 'set-chat') setActiveChat(actionElement.dataset.chatId);
  if (action === 'filter-requests') filterRequests(actionElement.dataset.filter);
  if (action === 'sort-leaderboard') toast('Leaderboard sorted by points and impact in the current mock layer.');
  if (action === 'reset-demo') { resetDemoData(); navigate('home'); toast('Demo data reset.'); }
  if (action === 'close-modal') closeModal();
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const formType = form.dataset.form;

  if (formType === 'login') submitLogin(data);
  if (formType === 'signup') submitSignup(data);
  if (formType === 'forgot') { toast('Password reset link placeholder sent.'); navigate('reset-password'); }
  if (formType === 'reset') submitReset(data);
  if (formType === 'verify') { updateCurrentUser({ verificationStatus: 'review' }); toast('Verification submitted for review.'); navigate('dashboard'); }
  if (formType === 'request') submitRequest(data, form);
  if (formType === 'chat') submitChat(data, form);
  if (formType === 'profile') submitProfile(data);
}

function handleChange(event) {
  if (event.target.matches('select[name="bloodGroup"]')) {
    const hint = document.getElementById('compatibilityHint');
    if (hint) hint.textContent = getCompatibilityHint(event.target.value);
  }
}

function submitLogin(data) {
  if (!assertEmail(data.email) || !data.password) {
    toast('Enter a valid email and password.');
    return;
  }
  const user = login(data.email.trim(), data.password, Boolean(data.remember));
  if (!user) {
    toast('No mock account matched those credentials. Try demo123.');
    return;
  }
  toast(`Welcome back, ${user.name}.`);
  navigate(roleMeta[user.role].dashboardRoute);
}

function submitSignup(data) {
  if (!data.name || !assertEmail(data.email) || !data.password || data.password.length < 6 || !data.location) {
    toast('Complete required signup fields with a valid email and 6+ character password.');
    return;
  }
  const user = signup({ ...data, role: normalizeRole(data.role) });
  toast('Account created. Complete verification next.');
  navigate('verify');
  return user;
}

function submitReset(data) {
  if (!data.password || data.password !== data.confirmPassword) {
    toast('Passwords must match.');
    return;
  }
  toast('Password reset placeholder completed.');
  navigate('login');
}

function submitRequest(data, form) {
  if (!data.title || !data.location || !data.details || !data.dueAt) {
    toast('Complete all request fields before submitting.');
    return;
  }
  addRequest(data);
  form.reset();
  toast('Request submitted and added to tracking history.');
}

function submitChat(data, form) {
  const button = form.querySelector('[data-chat-id]');
  sendMessage(button.dataset.chatId, data.message || '');
  form.reset();
  toast('Message added to secure chat mock thread.');
}

function submitProfile(data) {
  updateCurrentUser({
    name: data.name,
    bloodGroup: data.bloodGroup,
    location: data.location,
    emergencyContact: data.emergencyContact,
    availability: data.availability,
    preferences: data.preferences,
    notifications: data.notifications === 'true',
    privacy: data.privacy,
  });
  toast('Profile saved locally and ready for API sync.');
}

function showRequestDetails(id) {
  const request = getState().requests.find((candidate) => candidate.id === id);
  if (!request) return;
  modalRoot.innerHTML = `<div class="modal-backdrop" role="presentation"><article class="modal-card card card-pad" role="dialog" aria-modal="true" aria-labelledby="requestModalTitle"><div class="between"><div><span class="eyebrow">Request details</span><h2 id="requestModalTitle">${escapeHtml(request.title)}</h2></div><button class="icon-btn" data-action="close-modal" aria-label="Close modal">${icons.close}</button></div><p class="text-muted">${escapeHtml(request.details)}</p><div class="grid grid-3"><div class="card card-pad"><strong>Blood type</strong><p>${request.bloodGroup}</p></div><div class="card card-pad"><strong>Units</strong><p>${request.units}</p></div><div class="card card-pad"><strong>Due</strong><p>${formatDate(request.dueAt)}</p></div></div><div class="divider"></div><h3>Status timeline</h3><div class="timeline">${request.timeline.map((item) => `<div class="timeline-item"><span class="timeline-dot"></span><div><strong>${escapeHtml(item)}</strong><p class="text-muted">${escapeHtml(request.requester)} · ${renderStatus(request.status)}</p></div></div>`).join('')}</div><div class="divider"></div><p class="text-muted"><strong>Compatibility:</strong> ${getCompatibilityHint(request.bloodGroup)}</p></article></div>`;
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function filterRequests(filter) {
  document.querySelectorAll('[data-request-status]').forEach((card) => {
    card.classList.toggle('hidden', filter !== 'all' && card.dataset.requestStatus !== filter);
  });
}

function closeMobileMenu() {
  document.getElementById('navMenu')?.classList.remove('open');
}

function getSavedTheme() {
  return localStorage.getItem(storageKeys.theme) || config.defaultTheme;
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(storageKeys.theme, resolved);
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  toast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled.`);
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  toastRegion.append(node);
  setTimeout(() => node.remove(), 3400);
}

init();

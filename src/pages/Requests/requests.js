import { mountDashboardLayout } from '../../components/layout/dashboard-layout.js';
import { fetchRequests, createRequest, updateRequestStatus } from '../../api/dashboard.api.js';
import { getCurrentUser, getUserRole } from '../../utils/auth.js';
import { guardRoute } from '../../utils/router.js';
import { showToast } from '../../components/common/toast.js';
import { confirmAction } from '../../components/common/confirm.js';
import { openModal, openDrawer, closeOverlay } from '../../components/common/modal.js';
import { getCompatibilityHint, canDonorMatch } from '../../utils/blood-compatibility.js';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const URGENCY_LEVELS = [
    { value: 'critical', label: 'Critical', badge: 'danger' },
    { value: 'high', label: 'High', badge: 'danger' },
    { value: 'medium', label: 'Medium', badge: 'warning' },
    { value: 'low', label: 'Low', badge: 'info' },
];
const STATUS_FILTERS = ['all', 'open', 'accepted', 'fulfilled', 'cancelled', 'declined'];

function urgencyBadge(urgency) {
    const level = URGENCY_LEVELS.find((u) => u.value === urgency) || { label: urgency, badge: 'info' };
    return `<span class="badge badge-${level.badge}">${level.label}</span>`;
}

function statusBadge(status) {
    const map = { open: 'info', accepted: 'primary', fulfilled: 'success', cancelled: 'warning', declined: 'danger' };
    return `<span class="badge badge-${map[status] || 'info'}">${status}</span>`;
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function renderTimeline(timeline = []) {
    if (!timeline.length) return '<p class="empty-state">No timeline events yet.</p>';
    return `<div class="status-timeline">${timeline.map((item, i) => {
        const cls = i === timeline.length - 1 ? 'active' : 'done';
        return `<div class="timeline-item ${cls}">
            <div class="timeline-dot"></div>
            <h4>${item.label}</h4>
            <p>${item.note || ''}${item.actor ? ` — ${item.actor}` : ''}</p>
            <time datetime="${item.timestamp}">${formatDate(item.timestamp)}</time>
        </div>`;
    }).join('')}</div>`;
}

function renderSkeleton() {
    return `<div class="card">${[1, 2, 3].map(() => '<div class="skeleton skeleton-card"></div>').join('')}</div>`;
}

function renderEmpty(filter) {
    return `<div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No ${filter === 'all' ? '' : filter + ' '}requests</h3>
        <p>${filter === 'all' ? 'Create a new blood request to get started.' : 'Try a different filter or create a new request.'}</p>
    </div>`;
}

function renderRequestCard(request, role, user) {
    const canAccept = role === 'donor' && request.status === 'open' && canDonorMatch(user?.bloodType, request.bloodType);
    const canDecline = role === 'donor' && request.status === 'open';
    const canCancel = ['recipient', 'hospital', 'blood_bank'].includes(role) && ['open', 'accepted'].includes(request.status);
    const canFulfill = ['recipient', 'hospital', 'blood_bank'].includes(role) && request.status === 'accepted';
    const isDonorMismatch = role === 'donor' && request.status === 'open' && !canDonorMatch(user?.bloodType, request.bloodType);

    return `<article class="request-card" data-id="${request.id}" tabindex="0" role="button" aria-label="View request ${request.id}">
        <div class="request-card-header">
            <div>
                <div class="request-card-meta">
                    <strong style="font-size:1.125rem">${request.bloodType}</strong>
                    ${urgencyBadge(request.urgency)}
                    ${statusBadge(request.status)}
                </div>
                <p style="font-size:0.875rem;color:var(--text-light);margin-top:0.35rem">${request.hospital || request.createdBy} · ${request.location || '—'}</p>
            </div>
            <span style="font-size:0.8rem;color:var(--text-light)">${formatDate(request.createdAt)}</span>
        </div>
        <p style="font-size:0.9rem">${request.notes || ''}</p>
        <p class="compat-hint">${getCompatibilityHint(request.bloodType)}</p>
        ${isDonorMismatch ? '<p class="form-error" style="margin-top:0.5rem">Your blood type is not compatible with this request.</p>' : ''}
        <div class="request-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" data-action="view" data-id="${request.id}">Details</button>
            ${canAccept ? `<button class="btn btn-primary btn-sm" data-action="accept" data-id="${request.id}">Accept</button>` : ''}
            ${canDecline ? `<button class="btn btn-secondary btn-sm" data-action="decline" data-id="${request.id}">Decline</button>` : ''}
            ${canFulfill ? `<button class="btn btn-primary btn-sm" data-action="fulfill" data-id="${request.id}">Mark Fulfilled</button>` : ''}
            ${canCancel ? `<button class="btn btn-ghost btn-sm" data-action="cancel" data-id="${request.id}">Cancel</button>` : ''}
        </div>
    </article>`;
}

function renderCreateForm() {
    return `<form id="createRequestForm" novalidate>
        <div class="form-row">
            <div class="form-group">
                <label for="reqBloodType">Blood Type</label>
                <select class="form-select" id="reqBloodType" required>
                    ${BLOOD_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="reqUnits">Units Needed</label>
                <input class="form-input" id="reqUnits" type="number" min="1" max="10" value="1" required>
            </div>
        </div>
        <div class="form-group">
            <label for="reqUrgency">Urgency Level</label>
            <select class="form-select" id="reqUrgency" required>
                ${URGENCY_LEVELS.map((u) => `<option value="${u.value}">${u.label}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label for="reqHospital">Hospital / Facility</label>
            <input class="form-input" id="reqHospital" required placeholder="Hospital name">
        </div>
        <div class="form-group">
            <label for="reqLocation">Location</label>
            <input class="form-input" id="reqLocation" placeholder="City or address">
        </div>
        <div class="form-group">
            <label for="reqNotes">Notes</label>
            <textarea class="form-textarea" id="reqNotes" rows="3" placeholder="Additional details"></textarea>
        </div>
        <p class="compat-hint" id="createCompatHint">${getCompatibilityHint('O+')}</p>
    </form>`;
}

function renderRequestDetails(request) {
    return `
        <div style="margin-bottom:1.25rem">
            <div class="request-card-meta" style="margin-bottom:0.75rem">
                <strong style="font-size:1.25rem">${request.bloodType}</strong>
                ${urgencyBadge(request.urgency)}
                ${statusBadge(request.status)}
            </div>
            <p><strong>Units:</strong> ${request.units || 1}</p>
            <p><strong>Hospital:</strong> ${request.hospital || '—'}</p>
            <p><strong>Location:</strong> ${request.location || '—'}</p>
            <p><strong>Patient:</strong> ${request.patientName || '—'}</p>
            <p><strong>Notes:</strong> ${request.notes || '—'}</p>
            <p class="compat-hint">${getCompatibilityHint(request.bloodType)}</p>
        </div>
        <h4 style="margin-bottom:0.75rem;font-weight:600">Status Timeline</h4>
        ${renderTimeline(request.timeline)}`;
}

let allRequests = [];
let activeFilter = 'all';
let role = '';
let user = null;

async function loadAndRender() {
    const container = document.getElementById('requestsContainer');
    if (container) container.innerHTML = renderSkeleton();

    try {
        allRequests = await fetchRequests(role);
        renderList();
    } catch {
        if (container) container.innerHTML = '<div class="empty-state"><h3>Failed to load requests</h3><p>Please try again.</p><button class="btn btn-primary btn-sm" id="retryBtn">Retry</button></div>';
        document.getElementById('retryBtn')?.addEventListener('click', loadAndRender);
    }
}

function renderList() {
    const filtered = activeFilter === 'all' ? allRequests : allRequests.filter((r) => r.status === activeFilter);
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    container.innerHTML = filtered.length
        ? filtered.map((r) => renderRequestCard(r, role, user)).join('')
        : renderEmpty(activeFilter);

    bindRequestEvents();
}

function bindRequestEvents() {
    document.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.id));
    });
    document.querySelectorAll('.request-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) return;
            handleAction('view', card.dataset.id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAction('view', card.dataset.id); }
        });
    });
}

async function handleAction(action, id) {
    const request = allRequests.find((r) => r.id === id);
    if (!request) return;

    if (action === 'view') {
        openDrawer({
            title: `Request ${id}`,
            content: renderRequestDetails(request),
            footer: getDrawerActions(request),
        });
        bindDrawerActions(request);
        return;
    }

    const actions = {
        accept: { title: 'Accept Request', message: 'Confirm you are available to donate for this request?', status: 'accepted', extra: { acceptedBy: user?.name, timelineNote: `${user?.name} confirmed availability` } },
        decline: { title: 'Decline Request', message: 'Are you sure you want to decline this request?', status: 'declined', danger: true, extra: { timelineNote: 'Donor declined the request' } },
        fulfill: { title: 'Mark as Fulfilled', message: 'Confirm that this request has been fully completed?', status: 'fulfilled', extra: { timelineNote: 'All units delivered successfully' } },
        cancel: { title: 'Cancel Request', message: 'This will cancel the blood request. Continue?', status: 'cancelled', danger: true, extra: { timelineNote: 'Request cancelled' } },
    };

    const cfg = actions[action];
    if (!cfg) return;

    const ok = await confirmAction({ title: cfg.title, message: cfg.message, confirmLabel: 'Confirm', danger: cfg.danger });
    if (!ok) return;

    try {
        await updateRequestStatus(id, cfg.status, cfg.extra);
        showToast(`Request ${cfg.status}`);
        closeOverlay();
        await loadAndRender();
    } catch (err) {
        showToast(err.message || 'Action failed');
    }
}

function getDrawerActions(request) {
    const canAccept = role === 'donor' && request.status === 'open' && canDonorMatch(user?.bloodType, request.bloodType);
    const canDecline = role === 'donor' && request.status === 'open';
    const canCancel = ['recipient', 'hospital', 'blood_bank'].includes(role) && ['open', 'accepted'].includes(request.status);
    const canFulfill = ['recipient', 'hospital', 'blood_bank'].includes(role) && request.status === 'accepted';
    const buttons = [];
    if (canAccept) buttons.push(`<button class="btn btn-primary btn-sm" data-drawer-action="accept" data-id="${request.id}">Accept</button>`);
    if (canDecline) buttons.push(`<button class="btn btn-secondary btn-sm" data-drawer-action="decline" data-id="${request.id}">Decline</button>`);
    if (canFulfill) buttons.push(`<button class="btn btn-primary btn-sm" data-drawer-action="fulfill" data-id="${request.id}">Mark Fulfilled</button>`);
    if (canCancel) buttons.push(`<button class="btn btn-ghost btn-sm" data-drawer-action="cancel" data-id="${request.id}">Cancel</button>`);
    return buttons.join('');
}

function bindDrawerActions(request) {
    document.querySelectorAll('[data-drawer-action]').forEach((btn) => {
        btn.addEventListener('click', () => handleAction(btn.dataset.drawerAction, btn.dataset.id));
    });
}

function openCreateModal() {
    openModal({
        title: 'Create Blood Request',
        content: renderCreateForm(),
        footer: `
            <button type="button" class="btn btn-ghost" id="cancelCreate">Cancel</button>
            <button type="button" class="btn btn-primary" id="submitCreate">Submit Request</button>`,
        size: 'lg',
    });

    document.getElementById('reqBloodType')?.addEventListener('change', (e) => {
        const hint = document.getElementById('createCompatHint');
        if (hint) hint.textContent = getCompatibilityHint(e.target.value);
    });
    document.getElementById('cancelCreate')?.addEventListener('click', closeOverlay);
    document.getElementById('submitCreate')?.addEventListener('click', submitCreateRequest);
}

async function submitCreateRequest() {
    const form = document.getElementById('createRequestForm');
    const hospital = document.getElementById('reqHospital');
    let valid = true;

    document.querySelectorAll('#createRequestForm .form-error').forEach((el) => el.remove());
    document.querySelectorAll('#createRequestForm .error').forEach((el) => el.classList.remove('error'));

    if (!hospital.value.trim()) {
        hospital.classList.add('error');
        valid = false;
    }
    if (!valid) { showToast('Please fill in required fields'); return; }

    const payload = {
        bloodType: document.getElementById('reqBloodType').value,
        units: parseInt(document.getElementById('reqUnits').value, 10) || 1,
        urgency: document.getElementById('reqUrgency').value,
        hospital: hospital.value.trim(),
        location: document.getElementById('reqLocation').value.trim(),
        notes: document.getElementById('reqNotes').value.trim(),
        patientName: user?.name,
    };

    try {
        await createRequest(payload);
        closeOverlay();
        showToast('Request created successfully');
        await loadAndRender();
    } catch {
        showToast('Failed to create request');
    }
}

function bindPageEvents() {
    document.getElementById('newRequestBtn')?.addEventListener('click', openCreateModal);
    document.querySelectorAll('.filter-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            activeFilter = tab.dataset.filter;
            document.querySelectorAll('.filter-tab').forEach((t) => t.classList.toggle('active', t.dataset.filter === activeFilter));
            renderList();
        });
    });
}

if (guardRoute({ requireAuth: true })) {
    role = getUserRole();
    user = getCurrentUser();

    const canCreate = ['recipient', 'hospital', 'blood_bank'].includes(role);
    const content = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3 class="card-title">Request History</h3>
                    <p class="card-subtitle">Track, manage, and respond to blood requests</p>
                </div>
                ${canCreate ? '<button class="btn btn-primary btn-sm" id="newRequestBtn">+ New Request</button>' : ''}
            </div>
            <div class="filter-tabs">
                ${STATUS_FILTERS.map((f) => `<button class="filter-tab${f === 'all' ? ' active' : ''}" data-filter="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('')}
            </div>
            <div id="requestsContainer">${renderSkeleton()}</div>
        </div>`;

    mountDashboardLayout(document.getElementById('app'), { title: 'Requests', activeNav: 'Requests', content });
    bindPageEvents();
    loadAndRender();
}

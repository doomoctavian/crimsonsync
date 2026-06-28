/**
 * Shared dashboard initialization and content renderers.
 */
import { fetchDashboard } from '../../api/dashboard.api.js';
import { mountDashboardLayout, renderStatCards } from '../../components/layout/dashboard-layout.js';
import { ROLE_DASHBOARD_PATHS } from '../../constants/roles.js';
import { guardRoute } from '../../utils/router.js';

export function initDashboard(role, title, renderContent) {
    if (!guardRoute({ requireAuth: true })) return;

    const app = document.getElementById('app');
    fetchDashboard(role).then((data) => {
        const content = renderContent(data);
        mountDashboardLayout(app, { title, activeNav: 'Dashboard', content });
    });
}

export function renderAppointments(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Upcoming Appointments</h3></div>
        ${items.map((a) => `<div class="list-item"><div class="list-item-info"><h4>${a.center}</h4><p>${a.date} at ${a.time}</p></div>
        <span class="badge badge-${a.status === 'confirmed' ? 'success' : 'warning'}">${a.status}</span></div>`).join('')}</div>`;
}

export function renderHistory(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Donation History</h3></div>
        ${items.map((h) => `<div class="list-item"><div class="list-item-info"><h4>${h.center}</h4><p>${h.date} · ${h.bloodType}</p></div>
        <span class="badge badge-primary">${h.units} unit</span></div>`).join('')}</div>`;
}

export function renderNearbyCenters(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Nearby Donation Centers</h3></div>
        ${items.map((c) => `<div class="list-item"><div class="list-item-info"><h4>${c.name}</h4><p>${c.distance} away</p></div>
        <span class="badge badge-info">${c.slots} slots</span></div>`).join('')}</div>`;
}

export function renderRequests(items, actions = false) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Blood Requests</h3>
        ${actions ? '<button class="btn btn-primary btn-sm" id="createRequestBtn">+ New Request</button>' : ''}</div>
        ${items.map((r) => `<div class="list-item"><div class="list-item-info"><h4>${r.bloodType} · ${r.hospital || r.urgency || ''}</h4>
        <p>Urgency: ${r.urgency || 'standard'}</p></div>
        <span class="badge badge-${r.status === 'open' ? 'danger' : r.status === 'matched' ? 'success' : 'warning'}">${r.status}</span></div>`).join('')}</div>`;
}

export function renderBadges(badges) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Badges</h3></div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">${badges.map((b) => `<span class="badge badge-primary">${b}</span>`).join('')}</div></div>`;
}

export function renderInventory(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Blood Inventory</h3></div>
        <table class="data-table"><thead><tr><th>Type</th><th>Units</th><th>Status</th></tr></thead><tbody>
        ${items.map((i) => `<tr><td><strong>${i.type}</strong></td><td>${i.units}</td>
        <td><span class="badge badge-${i.status === 'adequate' ? 'success' : i.status === 'low' ? 'warning' : 'danger'}">${i.status}</span></td></tr>`).join('')}
        </tbody></table></div>`;
}

export function renderMatchedDonors(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Donor Matching Panel</h3></div>
        ${items.map((d) => `<div class="list-item"><div class="list-item-info"><h4>${d.name} · ${d.bloodType}</h4><p>${d.distance} · ${d.match}% match</p></div>
        <button class="btn btn-secondary btn-sm">Contact</button></div>`).join('')}</div>`;
}

export function renderVerifications(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Pending Verifications</h3></div>
        ${items.map((v) => `<div class="list-item"><div class="list-item-info"><h4>${v.name}</h4><p>${v.role}</p></div>
        <div style="display:flex;gap:0.5rem"><button class="btn btn-primary btn-sm" data-approve="${v.id}">Approve</button>
        <button class="btn btn-ghost btn-sm" data-deny="${v.id}">Deny</button></div></div>`).join('')}</div>`;
}

export function renderEmergencyQueue(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Emergency Request Queue</h3></div>
        ${items.map((e) => `<div class="list-item"><div class="list-item-info"><h4>${e.bloodType} · ${e.units} units</h4><p>${e.hospital}</p></div>
        <span class="badge badge-danger">P${e.priority}</span></div>`).join('')}</div>`;
}

export function renderSavedCenters(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Saved Hospitals & Banks</h3></div>
        ${items.map((s) => `<div class="list-item"><div class="list-item-info"><h4>${s}</h4></div><button class="btn btn-ghost btn-sm">View</button></div>`).join('')}</div>`;
}

export function renderMatches(items) {
    return `<div class="card"><div class="card-header"><h3 class="card-title">Matched Donor / Hospital</h3></div>
        ${items.map((m) => `<div class="list-item"><div class="list-item-info"><h4>${m.name}</h4><p>${m.type} · ${m.bloodType}</p></div>
        <span class="badge badge-success">${m.status}</span></div>`).join('')}</div>`;
}

export function getDashboardHref(role) {
    return ROLE_DASHBOARD_PATHS[role];
}

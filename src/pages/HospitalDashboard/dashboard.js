/**
 * Hospital Dashboard — shows verification status prominently.
 * Pending hospitals see limited access. Approved hospitals get full functionality.
 *
 * TODO: Replace fetchDashboard mock with GET /api/dashboard/hospital
 */

import { ROLES } from '../../constants/roles.js';
import { renderInventory, renderRequests, renderMatchedDonors } from '../../components/dashboard/dashboard-widgets.js';
import { mountDashboardLayout, renderStatCards } from '../../components/layout/dashboard-layout.js';
import { fetchDashboard } from '../../api/dashboard.api.js';
import { guardRoute } from '../../utils/router.js';
import { getCurrentUser } from '../../utils/auth.js';
import { showToast } from '../../components/common/toast.js';

if (guardRoute({ requireAuth: true })) {
    const user = getCurrentUser();
    const verificationStatus = user?.verificationStatus || 'pending';

    const STATUS_CONFIG = {
        pending:  { icon: '⏳', label: 'Pending Review',   color: 'warning', bg: 'rgba(245,158,11,0.1)',    border: 'rgba(245,158,11,0.3)',    msg: 'Your documents are under review. Full platform access will be granted once approved (typically 1–3 business days).' },
        approved: { icon: '✅', label: 'Approved',         color: 'success', bg: 'rgba(16,185,129,0.1)',    border: 'rgba(16,185,129,0.3)',    msg: 'Your organization is verified and has full platform access.' },
        rejected: { icon: '❌', label: 'Rejected',         color: 'danger',  bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.25)',    msg: 'Your verification was rejected. Please re-upload your documents or contact support.' },
    };

    const sc = STATUS_CONFIG[verificationStatus] || STATUS_CONFIG.pending;
    const isApproved = verificationStatus === 'approved';

    function renderVerificationCard() {
        return `<div style="display:flex;align-items:flex-start;gap:1rem;background:${sc.bg};border:1px solid ${sc.border};border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem">
            <span style="font-size:2rem;flex-shrink:0">${sc.icon}</span>
            <div style="flex:1">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem">
                    <strong>Verification Status</strong>
                    <span class="badge badge-${sc.color}">${sc.label}</span>
                </div>
                <p style="font-size:0.875rem;color:var(--text-light);margin:0">${sc.msg}</p>
                ${verificationStatus === 'rejected'
                    ? `<a href="/src/pages/Profile/index.html" class="btn btn-secondary btn-sm" style="margin-top:0.75rem">Re-upload Documents</a>`
                    : ''}
            </div>
        </div>`;
    }

    function renderLockedSection(title, icon) {
        return `<div class="card" style="opacity:0.55;pointer-events:none">
            <div class="card-header">
                <h3 class="card-title">${icon} ${title}</h3>
                <span class="badge badge-warning">Pending Approval</span>
            </div>
            <p style="font-size:0.875rem;color:var(--text-light)">This section is available after your organization is verified.</p>
        </div>`;
    }

    fetchDashboard(ROLES.HOSPITAL).then((data) => {
        const content = isApproved ? `
            ${renderVerificationCard()}
            ${renderStatCards(data.stats)}
            <div class="dashboard-row">
                ${renderInventory(data.inventory)}
                ${renderMatchedDonors(data.matchedDonors)}
            </div>
            ${renderRequests(data.requests, true)}
            <div class="card" style="margin-top:1.25rem">
                <div class="card-header"><h3 class="card-title">🚨 Urgent Alert</h3></div>
                <p style="font-size:0.9rem;color:var(--text-light);margin-bottom:1rem">Broadcast an emergency SOS to nearby verified donors.</p>
                <button class="btn btn-primary" id="urgentAlertBtn">Create Urgent Alert</button>
            </div>
        ` : `
            ${renderVerificationCard()}
            <div class="dashboard-row">
                ${renderLockedSection('Blood Inventory', '🩸')}
                ${renderLockedSection('Matched Donors', '👤')}
            </div>
            ${renderLockedSection('Request Management', '📋')}
        `;

        mountDashboardLayout(document.getElementById('app'), {
            title: user?.name || 'Hospital Dashboard',
            content,
        });

        document.getElementById('urgentAlertBtn')?.addEventListener('click', () => {
            // TODO: POST /api/alerts/urgent
            showToast('Urgent alert sent to nearby donors (mock)');
        });
    }).catch(() => {
        showToast('Could not load dashboard data.');
    });
}

/**
 * Blood Bank Dashboard — mirrors hospital dashboard with blood bank context.
 * Shows verification status. Full access only when approved.
 *
 * TODO: Replace fetchDashboard mock with GET /api/dashboard/blood-bank
 */

import { ROLES } from '../../constants/roles.js';
import { renderInventory, renderRequests } from '../../components/dashboard/dashboard-widgets.js';
import { mountDashboardLayout, renderStatCards } from '../../components/layout/dashboard-layout.js';
import { fetchDashboard } from '../../api/dashboard.api.js';
import { guardRoute } from '../../utils/router.js';
import { getCurrentUser } from '../../utils/auth.js';
import { showToast } from '../../components/common/toast.js';

if (guardRoute({ requireAuth: true })) {
    const user = getCurrentUser();
    const verificationStatus = user?.verificationStatus || 'pending';

    const STATUS_CONFIG = {
        pending:  { icon: '⏳', label: 'Pending Review', color: 'warning', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', msg: 'Your documents are under review. Full access granted once approved (1–3 business days).' },
        approved: { icon: '✅', label: 'Approved',       color: 'success', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', msg: 'Your blood bank is verified with full platform access.' },
        rejected: { icon: '❌', label: 'Rejected',       color: 'danger',  bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Verification rejected. Please re-upload documents or contact support.' },
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
            <p style="font-size:0.875rem;color:var(--text-light)">Available after verification is approved.</p>
        </div>`;
    }

    fetchDashboard(ROLES.BLOOD_BANK).then((data) => {
        const content = isApproved ? `
            ${renderVerificationCard()}
            ${renderStatCards(data.stats)}
            <div class="dashboard-row">
                ${renderInventory(data.inventory)}
                ${renderRequests(data.requests, true)}
            </div>
        ` : `
            ${renderVerificationCard()}
            <div class="dashboard-row">
                ${renderLockedSection('Blood Inventory', '🩸')}
                ${renderLockedSection('Request Management', '📋')}
            </div>
        `;

        mountDashboardLayout(document.getElementById('app'), {
            title: user?.name || 'Blood Bank Dashboard',
            content,
        });
    }).catch(() => {
        showToast('Could not load dashboard data.');
    });
}

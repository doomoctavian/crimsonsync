/**
 * Recipient Dashboard — role-specific dashboard.
 * Verification is optional and never blocks access.
 *
 * TODO: Replace fetchDashboard mock with GET /api/dashboard/recipient
 */

import { ROLES } from '../../constants/roles.js';
import { renderRequests, renderMatches, renderSavedCenters } from '../../components/dashboard/dashboard-widgets.js';
import { mountDashboardLayout, renderStatCards } from '../../components/layout/dashboard-layout.js';
import { fetchDashboard } from '../../api/dashboard.api.js';
import { guardRoute } from '../../utils/router.js';
import { getCurrentUser } from '../../utils/auth.js';
import { ROUTES } from '../../constants/routes.js';
import { showToast } from '../../components/common/toast.js';

if (guardRoute({ requireAuth: true })) {
    const user = getCurrentUser();
    const isVerified = user?.verified || user?.verificationStatus === 'verified';

    function renderVerificationBanner() {
        if (isVerified) {
            return `<div style="display:flex;align-items:center;gap:0.75rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem">
                <span style="font-size:1.5rem">✅</span>
                <div>
                    <strong style="color:var(--success)">Identity Verified</strong>
                    <p style="font-size:0.85rem;color:var(--text-light);margin:0">Your account is verified. Blood requests are prioritized.</p>
                </div>
                <span class="badge badge-success" style="margin-left:auto">Verified</span>
            </div>`;
        }
        return `<div style="display:flex;align-items:center;gap:0.75rem;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem">
            <span style="font-size:1.5rem">🪪</span>
            <div>
                <strong style="color:var(--info)">Optional: Verify Your Identity</strong>
                <p style="font-size:0.85rem;color:var(--text-light);margin:0.2rem 0 0">Verified recipients get prioritized matching with donors.</p>
            </div>
            <a href="${ROUTES.PROFILE}" class="btn btn-secondary btn-sm" style="margin-left:auto;white-space:nowrap">Verify Now</a>
        </div>`;
    }

    function renderRequestBloodCard() {
        return `<div class="card" style="background:var(--gradient-primary);color:white;border:none">
            <div class="card-header" style="color:white">
                <h3 class="card-title" style="color:white">🩸 Need Blood?</h3>
            </div>
            <p style="opacity:0.9;margin-bottom:1.25rem;font-size:0.95rem">Submit a blood request and we'll match you with verified donors nearby.</p>
            <button class="btn" id="createRequestBtn" style="background:white;color:var(--primary);font-weight:700">
                + Request Blood Now
            </button>
        </div>`;
    }

    fetchDashboard(ROLES.RECIPIENT).then((data) => {
        const content = `
            ${renderVerificationBanner()}
            ${renderRequestBloodCard()}
            ${renderStatCards(data.stats)}
            <div class="dashboard-row">
                ${renderRequests(data.requests, true)}
                ${renderMatches(data.matches)}
            </div>
            ${renderSavedCenters(data.saved)}
        `;
        mountDashboardLayout(document.getElementById('app'), { title: `Welcome, ${user?.name?.split(' ')[0] || 'Recipient'}`, content });

        // TODO: Connect to POST /api/requests/blood-request
        document.getElementById('createRequestBtn')?.addEventListener('click', () => {
            showToast('Blood request form — connect to API');
        });
    }).catch(() => {
        showToast('Could not load dashboard data.');
    });
}

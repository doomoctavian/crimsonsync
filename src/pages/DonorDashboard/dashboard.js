/**
 * Donor Dashboard — role-specific dashboard for verified and unverified donors.
 * Verification status is shown as a badge but never blocks access.
 *
 * TODO: Replace fetchDashboard mock with GET /api/dashboard/donor
 */

import { ROLES } from '../../constants/roles.js';
import { renderAppointments, renderHistory, renderNearbyCenters, renderBadges } from '../../components/dashboard/dashboard-widgets.js';
import { mountDashboardLayout, renderStatCards } from '../../components/layout/dashboard-layout.js';
import { fetchDashboard } from '../../api/dashboard.api.js';
import { guardRoute } from '../../utils/router.js';
import { getCurrentUser } from '../../utils/auth.js';
import { ROUTES } from '../../constants/routes.js';
import { showToast } from '../../components/common/toast.js';

if (guardRoute({ requireAuth: true })) {
    const user = getCurrentUser();
    const isVerified = user?.verified || user?.verificationStatus === 'verified';

    // Verification status banner (non-blocking, informational only)
    function renderVerificationBanner() {
        if (isVerified) {
            return `<div style="display:flex;align-items:center;gap:0.75rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem">
                <span style="font-size:1.5rem">✅</span>
                <div>
                    <strong style="color:var(--success)">Identity Verified</strong>
                    <p style="font-size:0.85rem;color:var(--text-light);margin:0">Your account is fully verified. You have priority in donor matching.</p>
                </div>
                <span class="badge badge-success" style="margin-left:auto">Verified</span>
            </div>`;
        }
        return `<div style="display:flex;align-items:center;gap:0.75rem;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:0.75rem;padding:1rem 1.25rem;margin-bottom:1.25rem">
            <span style="font-size:1.5rem">🪪</span>
            <div>
                <strong style="color:var(--info)">Optional: Verify Your Identity</strong>
                <p style="font-size:0.85rem;color:var(--text-light);margin:0.2rem 0 0">Get a Verified Badge, higher trust score, and priority matching.</p>
            </div>
            <a href="${ROUTES.PROFILE}" class="btn btn-secondary btn-sm" style="margin-left:auto;white-space:nowrap">Verify Now</a>
        </div>`;
    }

    // Badge section for donor gamification
    function renderBadgeSection(badges = []) {
        const defaultBadges = badges.length ? badges : [];
        const earned = defaultBadges.map(b => `<span class="badge badge-primary" style="padding:0.4rem 0.9rem;font-size:0.82rem">${b}</span>`).join('');
        const verifiedBadge = isVerified
            ? `<span class="badge badge-success" style="padding:0.4rem 0.9rem;font-size:0.82rem">✅ Verified Donor</span>`
            : '';
        return `<div class="card">
            <div class="card-header"><h3 class="card-title">🏆 Your Badges</h3></div>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
                ${verifiedBadge}
                ${earned || '<span style="color:var(--text-muted);font-size:0.9rem">Complete your first donation to earn badges!</span>'}
            </div>
        </div>`;
    }

    fetchDashboard(ROLES.DONOR).then((data) => {
        const content = `
            ${renderVerificationBanner()}
            ${renderStatCards(data.stats)}
            <div class="dashboard-row">
                ${renderAppointments(data.appointments)}
                ${renderBadgeSection(data.badges)}
            </div>
            <div class="dashboard-row">
                ${renderHistory(data.history)}
                ${renderNearbyCenters(data.nearbyCenters)}
            </div>
        `;
        mountDashboardLayout(document.getElementById('app'), { title: `Welcome, ${user?.name?.split(' ')[0] || 'Donor'}`, content });
    }).catch(() => {
        showToast('Could not load dashboard data.');
    });
}

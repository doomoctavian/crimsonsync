import { mountDashboardLayout } from '../../components/layout/dashboard-layout.js';
import { mockLeaderboard, mockBadges } from '../../data/mock-data.js';
import { guardRoute } from '../../utils/router.js';

if (guardRoute({ requireAuth: true })) {
    const leaderboardHtml = mockLeaderboard.map((entry) => `
        <div class="list-item" style="${entry.isCurrentUser ? 'background:rgba(220,38,38,0.06);border-radius:0.5rem;padding:0.75rem 1rem' : ''}">
            <div style="display:flex;align-items:center;gap:1rem">
                <span style="font-size:1.25rem;width:2rem;text-align:center">${entry.badge}</span>
                <div class="list-item-info"><h4>#${entry.rank} ${entry.name}</h4><p>${entry.donations} donations</p></div>
            </div>
            <strong style="color:var(--primary)">${entry.points.toLocaleString()} pts</strong>
        </div>`).join('');

    const badgesHtml = mockBadges.map((b) => `
        <div class="card" style="text-align:center;opacity:${b.earned ? 1 : 0.5}">
            <div style="font-size:2rem;margin-bottom:0.5rem">${b.icon}</div>
            <h4 style="font-size:0.95rem;margin-bottom:0.25rem">${b.name}</h4>
            <p style="font-size:0.8rem;color:var(--text-light)">${b.description}</p>
            ${b.earned ? '<span class="badge badge-success" style="margin-top:0.5rem">Earned</span>' : '<span class="badge badge-info" style="margin-top:0.5rem">Locked</span>'}
        </div>`).join('');

    const content = `
        <div class="dashboard-row">
            <div class="card"><div class="card-header"><h3 class="card-title">Donor Leaderboard</h3></div>${leaderboardHtml}</div>
            <div><h3 class="card-title" style="margin-bottom:1rem">Badges & Achievements</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem">${badgesHtml}</div></div>
        </div>`;

    mountDashboardLayout(document.getElementById('app'), { title: 'Leaderboard', activeNav: 'Leaderboard', content });
}

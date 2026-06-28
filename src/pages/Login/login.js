/**
 * Login page — role-based redirection after authentication.
 *
 * After login:
 *   Donor      → /src/pages/DonorDashboard/index.html
 *   Recipient  → /src/pages/RecipientDashboard/index.html
 *   Hospital   → /src/pages/HospitalDashboard/index.html
 *   Blood Bank → /src/pages/BloodBankDashboard/index.html
 *
 * Hospitals/Blood Banks with pending verification are shown their
 * dashboard with a prominent pending status card.
 *
 * TODO: Connect to authService.login() → POST /api/auth/login
 */

import { login } from '../../api/auth.api.js';
import { getDashboardPath, getUserRole } from '../../utils/auth.js';
import { guardRoute, getRedirectParam } from '../../utils/router.js';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { initTheme } from '../../hooks/useTheme.js';
import { showToast } from '../../components/common/toast.js';
import { SessionContext } from '../../context/session.js';

initTheme();

if (!guardRoute({ requireAuth: false })) {
    // Already authenticated — guardRoute handles redirect
} else {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const btn = e.submitter;
        if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

        try {
            // TODO: Replace with authService.login() → POST /api/auth/login
            await login({ email, password });
            SessionContext.notify();

            const role = getUserRole();
            showToast('Welcome back!');

            const redirect = getRedirectParam();
            if (redirect) {
                window.location.href = redirect;
            } else {
                // Role-based redirection — no forced verification for donor/recipient
                window.location.href = getDashboardPath(role);
            }
        } catch (err) {
            showToast(err.message || 'Login failed. Please check your credentials.');
            if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
        }
    });
}

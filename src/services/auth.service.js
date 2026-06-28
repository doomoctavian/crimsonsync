/**
 * Auth service — business logic layer between UI and Auth API.
 *
 * This is the single entry point for all auth operations.
 * All functions are designed for future FastAPI/Django integration.
 *
 * TODO: Replace mock API calls with real endpoints once backend is ready.
 *       See src/api/auth.api.js for endpoint mapping.
 */

import * as authApi from '../api/auth.api.js';
import { clearSession } from '../utils/storage.js';
import { SessionContext } from '../context/session.js';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';

/**
 * Login a user and establish a session.
 * TODO: Connect to POST /api/auth/login
 */
export async function login(credentials) {
    const session = await authApi.login(credentials);
    SessionContext.notify();
    return session;
}

/**
 * Register a new Donor or Recipient — no verification required.
 * Account is created and session is started immediately.
 * TODO: Connect to POST /api/auth/register
 */
export async function register(userData) {
    return authApi.signup(userData);
}

/**
 * Register a Hospital or Blood Bank — verification required.
 * Account is created with status = 'pending'.
 * TODO: Connect to POST /api/auth/register/organization
 */
export async function registerOrganization(orgData) {
    return authApi.signup({ ...orgData, requiresOrgVerification: true });
}

/**
 * Optional: Verify individual identity (donor/recipient).
 * Users can call this from Profile Settings at any time.
 * TODO: Connect to POST /api/auth/verify-identity (multipart/form-data)
 */
export async function verifyUser(documents) {
    const result = await authApi.verifyIdentity(documents);
    SessionContext.notify();
    return result;
}

/**
 * Required: Verify organization (hospital/blood bank).
 * Called after document submission during registration.
 * TODO: Connect to POST /api/auth/verify-org (multipart/form-data)
 */
export async function verifyOrganization(documents) {
    const result = await authApi.verifyOrganization(documents);
    SessionContext.notify();
    return result;
}

export async function verifyEmail(otp) {
    return authApi.verifyEmail(otp);
}

export async function forgotPassword(email) {
    return authApi.forgotPassword(email);
}

export async function resetPassword(token, password) {
    return authApi.resetPassword(token, password);
}

/**
 * Logout and clear session.
 * TODO: Connect to POST /api/auth/logout (to invalidate server-side token)
 */
export async function logout(options = {}) {
    try {
        await authApi.logoutApi();
    } finally {
        clearSession();
        SessionContext.notify();
        if (options.redirect !== false) {
            window.location.href = options.redirect || ROUTES.LOGIN;
        }
    }
}

export async function getCurrentUserFromApi() {
    const user = await authApi.fetchCurrentUser();
    if (user) {
        const { createSession } = await import('../utils/auth.js');
        createSession(user);
    }
    return user;
}

/**
 * Get the dashboard path for a given role.
 * Used after login to redirect correctly.
 */
export function getDashboardByRole(role) {
    const map = {
        [ROLES.DONOR]:      ROUTES.DASHBOARDS?.[ROLES.DONOR]      || '/src/pages/DonorDashboard/index.html',
        [ROLES.RECIPIENT]:  ROUTES.DASHBOARDS?.[ROLES.RECIPIENT]  || '/src/pages/RecipientDashboard/index.html',
        [ROLES.HOSPITAL]:   ROUTES.DASHBOARDS?.[ROLES.HOSPITAL]   || '/src/pages/HospitalDashboard/index.html',
        [ROLES.BLOOD_BANK]: ROUTES.DASHBOARDS?.[ROLES.BLOOD_BANK] || '/src/pages/BloodBankDashboard/index.html',
    };
    return map[role] || ROUTES.HOME;
}

/**
 * Frontend route guard — protected route behavior without a framework.
 *
 * Verification redirect logic:
 * - Donors and Recipients: NEVER forced to verify. Verification is optional.
 * - Hospitals and Blood Banks: redirected to pending screen if status is 'pending'.
 *   They can still access their dashboard (with limited functionality shown).
 */

import { AUTH_ROUTES, PUBLIC_ROUTES, ROUTES } from '../constants/routes.js';
import { getDashboardPath, hasPendingSignup, isAuthenticated, getCurrentUser } from './auth.js';
import { ROLES } from '../constants/roles.js';

function normalizePath(path) {
    try {
        const url = new URL(path, window.location.origin);
        return url.pathname;
    } catch {
        return path;
    }
}

export function getCurrentPath() {
    return normalizePath(window.location.pathname);
}

export function isPublicRoute(path = getCurrentPath()) {
    const normalized = normalizePath(path);
    return PUBLIC_ROUTES.some((route) => normalized.endsWith(route.replace(/^\//, '')));
}

export function isAuthRoute(path = getCurrentPath()) {
    const normalized = normalizePath(path);
    return AUTH_ROUTES.some((route) => normalized.endsWith(route.replace(/^\//, '')));
}

/**
 * Returns true if the current user is an organization (hospital/blood bank)
 * with a pending verification status.
 */
function isOrgPendingVerification(user) {
    const isOrg = user?.role === ROLES.HOSPITAL || user?.role === ROLES.BLOOD_BANK;
    return isOrg && user?.verificationStatus === 'pending';
}

export function guardRoute(options = {}) {
    const { requireAuth = true, redirectTo } = options;
    const path = getCurrentPath();

    if (requireAuth && !isAuthenticated()) {
        const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`;
        window.location.replace(loginUrl);
        return false;
    }

    if (!requireAuth && isAuthenticated() && isAuthRoute(path)) {
        window.location.replace(redirectTo || getDashboardPath());
        return false;
    }

    // NOTE: Donors and Recipients are NEVER forced to verify.
    // Only legacy/explicit verify page redirects are left here for
    // backwards compatibility with the verify flow if users navigate to it.

    return true;
}

export function navigateTo(path) {
    window.location.href = path;
}

export function guardVerifyPage() {
    if (!isAuthenticated() && !hasPendingSignup()) {
        window.location.replace(ROUTES.LOGIN);
        return false;
    }
    return true;
}

export function getRedirectParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}

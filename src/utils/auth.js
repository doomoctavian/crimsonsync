/**
 * Authentication helpers — frontend session logic.
 */
import { ROLES, ROLE_DASHBOARD_PATHS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { getSession, setSession, clearSession, setToken } from './storage.js';
import { SessionContext } from '../context/session.js';

export function isAuthenticated() {
    const session = getSession();
    return Boolean(session?.user?.id && session?.token);
}

export function hasPendingSignup() {
    const session = getSession();
    return Boolean(session?.pendingUser?.email);
}

export function getCurrentUser() {
    return getSession()?.user || null;
}

export function getUserRole() {
    return getCurrentUser()?.role || null;
}

export function getDashboardPath(role = getUserRole()) {
    return ROLE_DASHBOARD_PATHS[role] || ROUTES.HOME;
}

export function createSession(user, token = 'mock-jwt-token') {
    const session = {
        user,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSession(session);
    setToken(token);
    return session;
}

export function logout(redirect = ROUTES.LOGIN) {
    clearSession();
    window.location.href = redirect;
}

export function requiresVerification(user = getCurrentUser()) {
    return user && !user.verified;
}

export function updateCurrentUser(updates) {
    const session = getSession();
    if (!session?.user) return null;
    session.user = { ...session.user, ...updates };
    setSession(session);
    SessionContext.notify();
    return session.user;
}

export function normalizeRole(value) {
    const map = {
        donor: ROLES.DONOR,
        hospital: ROLES.HOSPITAL,
        recipient: ROLES.RECIPIENT,
        'blood bank': ROLES.BLOOD_BANK,
        blood_bank: ROLES.BLOOD_BANK,
        bloodbank: ROLES.BLOOD_BANK,
    };
    return map[String(value).toLowerCase()] || value;
}

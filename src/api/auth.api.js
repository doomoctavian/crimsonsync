/**
 * Auth API — Django/FastAPI JWT authentication endpoints.
 *
 * TODO: Replace config.USE_MOCK_API blocks with real fetch calls to:
 *   POST /api/auth/login            → login()
 *   POST /api/auth/register         → signup()
 *   POST /api/auth/register/org     → signup() for hospital/blood_bank
 *   POST /api/auth/verify-email     → verifyEmail()
 *   POST /api/auth/verify-identity  → verifyIdentity()
 *   POST /api/auth/verify-org       → verifyOrganization()
 *   POST /api/auth/forgot-password  → forgotPassword()
 *   POST /api/auth/reset-password   → resetPassword()
 *   POST /api/auth/logout           → logoutApi()
 *   POST /api/auth/token/refresh    → refreshToken()
 *   GET  /api/auth/me               → fetchCurrentUser()
 */

import { api } from './client.js';
import { config, ENDPOINTS } from '../config/index.js';
import { createSession } from '../utils/auth.js';
import { getSession, setSession } from '../utils/storage.js';

export async function login(credentials) {
    if (config.USE_MOCK_API) {
        const session = getSession();
        const pending = session?.pendingUser;

        // If there's a pending user from a recent signup, log them in directly
        const mockUser = (pending?.email === credentials.email)
            ? { ...pending }
            : {
                id: 'user_' + Date.now(),
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: 'donor',
                verified: true,
                bloodType: 'O+',
                points: 1250,
                badges: ['First Donation', 'Hero Donor'],
                verificationStatus: 'verified',
            };

        return createSession(mockUser);
    }
    // TODO: POST /api/auth/login → returns { user, access, refresh }
    const data = await api.post(ENDPOINTS.auth.login, credentials, { auth: false });
    return createSession(data.user, data.access || data.token);
}

export async function signup(userData) {
    if (config.USE_MOCK_API) {
        const user = {
            id: 'user_' + Date.now(),
            ...userData,
            emailVerified: true, // skip email verification in mock
            createdAt: new Date().toISOString(),
        };

        // For individual roles (donor/recipient): create full session immediately
        if (user.role === 'donor' || user.role === 'recipient') {
            // TODO: POST /api/auth/register → returns { user, access }
            createSession(user);
            return { user, requiresVerification: false };
        }

        // For org roles (hospital/blood_bank): store as pending, no session yet
        // TODO: POST /api/auth/register/organization → returns { user, status: 'pending' }
        setSession({ pendingUser: user });
        return { user, requiresVerification: true, status: 'pending' };
    }
    return api.post(ENDPOINTS.auth.signup, userData, { auth: false });
}

export async function verifyEmail(otp) {
    if (config.USE_MOCK_API) {
        const session = getSession();
        if (session?.pendingUser) {
            session.pendingUser.emailVerified = true;
            setSession(session);
        }
        return { success: true, otp };
    }
    // TODO: POST /api/auth/verify-email
    return api.post(ENDPOINTS.auth.verifyEmail, { otp });
}

export async function verifyIdentity(documents) {
    if (config.USE_MOCK_API) {
        const session = getSession();
        const user = { ...(session?.pendingUser || session?.user) };
        user.verified = true;
        user.verificationStatus = 'verified';
        user.documents = documents;
        createSession(user);
        return { success: true };
    }
    // TODO: POST /api/auth/verify-identity (multipart/form-data)
    return api.post(ENDPOINTS.auth.verifyIdentity, documents);
}

export async function verifyOrganization(documents) {
    if (config.USE_MOCK_API) {
        const session = getSession();
        const user = { ...(session?.pendingUser || session?.user) };
        user.verificationStatus = 'pending';
        setSession({ pendingUser: user });
        return { success: true, status: 'pending' };
    }
    // TODO: POST /api/auth/verify-org (multipart/form-data)
    return api.post('/auth/verify-org', documents);
}

export async function forgotPassword(email) {
    if (config.USE_MOCK_API) return { success: true, message: 'Reset link sent (mock)' };
    // TODO: POST /api/auth/forgot-password
    return api.post(ENDPOINTS.auth.forgotPassword, { email }, { auth: false });
}

export async function resetPassword(token, password) {
    if (config.USE_MOCK_API) return { success: true };
    // TODO: POST /api/auth/reset-password
    return api.post(ENDPOINTS.auth.resetPassword, { token, password }, { auth: false });
}

export async function logoutApi() {
    if (config.USE_MOCK_API) return { success: true };
    // TODO: POST /api/auth/logout
    return api.post(ENDPOINTS.auth.logout);
}

export async function refreshToken(refresh) {
    if (config.USE_MOCK_API) return { access: 'mock-refreshed-token' };
    // TODO: POST /api/auth/token/refresh
    return api.post(ENDPOINTS.auth.refresh, { refresh }, { auth: false });
}

export async function fetchCurrentUser() {
    if (config.USE_MOCK_API) return getSession()?.user || null;
    // TODO: GET /api/auth/me
    return api.get(ENDPOINTS.auth.me);
}

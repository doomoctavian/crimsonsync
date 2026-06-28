/**
 * Profile API — user profile CRUD for Django/FastAPI backends.
 */
import { api } from './client.js';
import { config, ENDPOINTS } from '../config/index.js';
import { getCurrentUser, updateCurrentUser } from '../utils/auth.js';

export async function fetchProfile() {
    if (config.USE_MOCK_API) {
        return getCurrentUser();
    }
    return api.get(ENDPOINTS.users.profile);
}

export async function updateProfile(payload) {
    if (config.USE_MOCK_API) {
        return updateCurrentUser(payload);
    }
    const data = await api.patch(ENDPOINTS.users.updateProfile, payload);
    updateCurrentUser(data.user || data);
    return data;
}

export async function changePassword(currentPassword, newPassword) {
    if (config.USE_MOCK_API) {
        return { success: true, message: 'Password changed (mock)' };
    }
    return api.post(ENDPOINTS.users.changePassword, { currentPassword, newPassword });
}

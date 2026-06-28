/**
 * Profile service — profile read/update and password management.
 */
import * as profileApi from '../api/profile.api.js';
import { SessionContext } from '../context/session.js';

export async function getProfile() {
    return profileApi.fetchProfile();
}

export async function saveProfile(payload) {
    const result = await profileApi.updateProfile(payload);
    SessionContext.notify();
    return result;
}

export async function changePassword(currentPassword, newPassword) {
    return profileApi.changePassword(currentPassword, newPassword);
}

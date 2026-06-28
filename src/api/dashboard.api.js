/**
 * Dashboard & requests API — MongoDB-backed resources via Django/FastAPI.
 */
import { api } from './client.js';
import { config, ENDPOINTS } from '../config/index.js';
import { mockDashboardData } from '../data/mock-data.js';
import { getCurrentUser } from '../utils/auth.js';
import { getItem, setItem } from '../utils/storage.js';

function getStoredRequests() {
    return getItem(config.REQUESTS_STORAGE_KEY, null);
}

function saveRequests(requests) {
    setItem(config.REQUESTS_STORAGE_KEY, requests);
    return requests;
}

function seedRequests() {
    const stored = getStoredRequests();
    if (stored) return stored;
    return saveRequests([...mockDashboardData.requests]);
}

export async function fetchDashboard(role) {
    if (config.USE_MOCK_API) return mockDashboardData[role] || mockDashboardData.donor;
    return api.get(ENDPOINTS.dashboard.byRole(role));
}

export async function fetchInventory() {
    if (config.USE_MOCK_API) return mockDashboardData.blood_bank.inventory;
    return api.get(ENDPOINTS.inventory.list);
}

export async function fetchRequests(role) {
    if (config.USE_MOCK_API) {
        await delay(400);
        const all = seedRequests();
        if (role === 'donor') return all.filter((r) => ['open', 'accepted'].includes(r.status));
        return all;
    }
    return api.get(`${ENDPOINTS.requests.list}?role=${role}`);
}

export async function fetchRequestHistory(role) {
    if (config.USE_MOCK_API) return seedRequests();
    return api.get(`${ENDPOINTS.requests.history}?role=${role}`);
}

export async function getRequestById(id) {
    if (config.USE_MOCK_API) {
        return seedRequests().find((r) => r.id === id) || null;
    }
    return api.get(ENDPOINTS.requests.detail(id));
}

export async function createRequest(payload) {
    if (config.USE_MOCK_API) {
        await delay(300);
        const user = getCurrentUser();
        const request = {
            id: 'req_' + Date.now(),
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user?.name || 'User',
            role: user?.role || 'recipient',
            timeline: [{ status: 'open', label: 'Request Created', timestamp: new Date().toISOString(), note: 'Blood request submitted' }],
            ...payload,
        };
        const requests = seedRequests();
        requests.unshift(request);
        saveRequests(requests);
        return request;
    }
    return api.post(ENDPOINTS.requests.create, payload);
}

export async function updateRequestStatus(id, status, extra = {}) {
    if (config.USE_MOCK_API) {
        await delay(300);
        const requests = seedRequests();
        const idx = requests.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error('Request not found');

        const labels = {
            accepted: 'Donor Accepted',
            declined: 'Request Declined',
            fulfilled: 'Fulfilled',
            cancelled: 'Cancelled',
        };
        const now = new Date().toISOString();
        const user = getCurrentUser();

        requests[idx] = {
            ...requests[idx],
            status,
            updatedAt: now,
            ...extra,
            timeline: [
                ...(requests[idx].timeline || []),
                {
                    status,
                    label: labels[status] || status,
                    timestamp: now,
                    note: extra.timelineNote || `Status updated to ${status}`,
                    actor: user?.name,
                },
            ],
        };
        saveRequests(requests);
        return requests[idx];
    }
    return api.patch(ENDPOINTS.requests.updateStatus(id), { status, ...extra });
}

function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

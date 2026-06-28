/**
 * Requests service — blood request lifecycle management.
 */
import * as dashboardApi from '../api/dashboard.api.js';

export const getRequests = dashboardApi.fetchRequests;
export const getRequestHistory = dashboardApi.fetchRequestHistory;
export const getRequestById = dashboardApi.getRequestById;
export const createBloodRequest = dashboardApi.createRequest;

export async function acceptRequest(id, extra = {}) {
    return dashboardApi.updateRequestStatus(id, 'accepted', {
        timelineNote: 'Donor confirmed availability',
        ...extra,
    });
}

export async function declineRequest(id, extra = {}) {
    return dashboardApi.updateRequestStatus(id, 'declined', {
        timelineNote: 'Request declined',
        ...extra,
    });
}

export async function fulfillRequest(id, extra = {}) {
    return dashboardApi.updateRequestStatus(id, 'fulfilled', {
        timelineNote: 'All units delivered successfully',
        ...extra,
    });
}

export async function cancelRequest(id, extra = {}) {
    return dashboardApi.updateRequestStatus(id, 'cancelled', {
        timelineNote: 'Request cancelled',
        ...extra,
    });
}

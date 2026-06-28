/**
 * Dashboard service — role-specific dashboard data.
 */
import * as dashboardApi from '../api/dashboard.api.js';

export async function getDashboardData(role) {
    return dashboardApi.fetchDashboard(role);
}

export async function getInventory() {
    return dashboardApi.fetchInventory();
}

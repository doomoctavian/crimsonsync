/**
 * Route registry — central export for future React Router migration.
 */
export { ROUTES, PUBLIC_ROUTES, AUTH_ROUTES, PROTECTED_ROUTES } from '../constants/routes.js';
export { ROLE_DASHBOARD_PATHS, ROLES, ROLE_LABELS } from '../constants/roles.js';
export { guardRoute, navigateTo, getRedirectParam } from '../utils/router.js';

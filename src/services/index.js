/**
 * Service layer — business logic between UI and API.
 * Import from here in pages; services call api/ modules internally.
 */
export * from './auth.service.js';
export * from './profile.service.js';
export * from './requests.service.js';
export * from './dashboard.service.js';
export * from './chat.service.js';
export * from './upload.service.js';

/** @deprecated Use named service imports instead */
export { login, signup, verifyEmail, verifyIdentity, forgotPassword, resetPassword } from './auth.service.js';
export { getRequests, createBloodRequest as createRequest, acceptRequest, declineRequest, fulfillRequest, cancelRequest } from './requests.service.js';
export { getConversations as fetchConversations, getMessages as fetchMessages, sendChatMessage as sendMessage } from './chat.service.js';
export { getDashboardData as fetchDashboard, getInventory as fetchInventory } from './dashboard.service.js';

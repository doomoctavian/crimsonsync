/**
 * API layer barrel export — import endpoints from here when wiring UI.
 */
export { api, apiClient, uploadClient, ApiError } from './client.js';
export { WebSocketClient, chatSocket } from './websocket.js';
export * from './auth.api.js';
export * from './profile.api.js';
export * from './upload.api.js';
export * from './dashboard.api.js';
export * from './chat.api.js';

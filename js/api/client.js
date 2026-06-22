import { config } from '../config/appConfig.js';

export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    verify: '/auth/verify',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    profile: '/users/me',
    uploadDocument: config.uploadEndpoint,
  },
  requests: '/requests',
  leaderboard: '/leaderboard',
  chat: '/chat/threads',
  inventory: '/inventory',
  verifications: '/verifications',
};

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(config.authTokenKey);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function createRealtimePlaceholder(threadId) {
  return {
    url: `${config.websocketUrl}?thread=${encodeURIComponent(threadId)}`,
    connect() {
      return 'Realtime chat connection placeholder ready for backend wiring.';
    },
  };
}

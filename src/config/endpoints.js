/**
 * REST API endpoint map — compatible with Django REST Framework and FastAPI.
 * MongoDB-backed services expose the same resource paths; only the base URL changes.
 *
 * Django example:  path('api/v1/', include(router.urls))
 * FastAPI example: app.include_router(api_router, prefix='/api/v1')
 */
export const ENDPOINTS = {
    auth: {
        login: '/auth/login/',
        signup: '/auth/signup/',
        logout: '/auth/logout/',
        refresh: '/auth/refresh/',
        verifyEmail: '/auth/verify-email/',
        verifyIdentity: '/auth/verify-identity/',
        forgotPassword: '/auth/forgot-password/',
        resetPassword: '/auth/reset-password/',
        me: '/auth/me/',
    },
    users: {
        profile: '/users/me/profile/',
        updateProfile: '/users/me/profile/',
        changePassword: '/users/me/change-password/',
    },
    uploads: {
        documents: '/uploads/documents/',
        avatar: '/uploads/avatar/',
    },
    dashboard: {
        byRole: (role) => `/dashboard/${role}/`,
    },
    inventory: {
        list: '/inventory/',
        byType: (type) => `/inventory/${type}/`,
    },
    requests: {
        list: '/requests/',
        detail: (id) => `/requests/${id}/`,
        create: '/requests/',
        updateStatus: (id) => `/requests/${id}/status/`,
        history: '/requests/history/',
    },
    chat: {
        conversations: '/chat/conversations/',
        messages: (conversationId) => `/chat/conversations/${conversationId}/messages/`,
        send: (conversationId) => `/chat/conversations/${conversationId}/messages/`,
        ws: '/chat/ws/',
    },
    leaderboard: {
        list: '/leaderboard/',
    },
};

/** WebSocket path appended to WS_URL for real-time chat */
export const WS_PATHS = {
    chat: '/chat/ws/',
    notifications: '/notifications/ws/',
};

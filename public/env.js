/**
 * Runtime environment configuration.
 *
 * For vanilla JS (no bundler): edit values here before deployment.
 * With Vite/React: copy from .env.example — import.meta.env overrides these.
 *
 * Must load before any src/ module:
 *   <script src="/public/env.js"></script>
 */
window.CRIMSONSYNC_ENV = {
    // API
    API_BASE_URL: 'http://localhost:8000/api/v1',
    API_TIMEOUT_MS: 30000,
    BACKEND_TYPE: 'fastapi',
    USE_MOCK_API: true,

    // Auth storage keys
    SESSION_KEY: 'crimsonsync_session',
    TOKEN_KEY: 'crimsonsync_token',

    // Uploads
    UPLOAD_URL: 'http://localhost:8000/api/v1/uploads',

    // WebSocket / chat
    WS_URL: 'ws://localhost:8000/ws',

    // App
    APP_NAME: 'CrimsonSync',
    THEME_DEFAULT: 'light',
    THEME_KEY: 'theme',
    REQUESTS_STORAGE_KEY: 'crimsonsync_requests',
};

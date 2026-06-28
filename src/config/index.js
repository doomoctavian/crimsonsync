/**
 * Central application configuration.
 * Single source of truth for env vars and API settings.
 */
import { env } from './env.js';
import { ENDPOINTS, WS_PATHS } from './endpoints.js';

export { env, getRuntimeEnv } from './env.js';
export { ENDPOINTS, WS_PATHS } from './endpoints.js';

export const config = {
    API_BASE_URL: env.API_BASE_URL,
    WS_URL: env.WS_URL,
    UPLOAD_URL: env.UPLOAD_URL,
    APP_NAME: env.APP_NAME,
    SESSION_KEY: env.SESSION_KEY,
    TOKEN_KEY: env.TOKEN_KEY,
    THEME_DEFAULT: env.THEME_DEFAULT,
    THEME_KEY: env.THEME_KEY,
    USE_MOCK_API: env.USE_MOCK_API,
    API_TIMEOUT_MS: env.API_TIMEOUT_MS,
    BACKEND_TYPE: env.BACKEND_TYPE,
    REQUESTS_STORAGE_KEY: env.REQUESTS_STORAGE_KEY,
    ENDPOINTS,
    WS_PATHS,
};

export default config;

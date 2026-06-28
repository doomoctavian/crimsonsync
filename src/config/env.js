/**
 * Environment variable reader.
 * Vanilla JS reads from window.CRIMSONSYNC_ENV (public/env.js).
 * With Vite/React, import.meta.env.VITE_* overrides are supported.
 */

function readVite(key) {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env?.[key] !== undefined) {
            return import.meta.env[key];
        }
    } catch {
        /* not a bundler context */
    }
    return undefined;
}

function readEnv(key, fallback = '') {
    const vite = readVite(`VITE_${key}`);
    if (vite !== undefined && vite !== '') return vite;

    const runtime = typeof window !== 'undefined' ? window.CRIMSONSYNC_ENV?.[key] : undefined;
    if (runtime !== undefined && runtime !== '') return runtime;

    return fallback;
}

function readBool(key, fallback = false) {
    const raw = readEnv(key, String(fallback));
    return raw === true || raw === 'true' || raw === '1';
}

function readNumber(key, fallback) {
    const raw = readEnv(key, String(fallback));
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
}

export const env = {
    get API_BASE_URL() {
        return readEnv('API_BASE_URL', 'http://localhost:8000/api/v1');
    },
    get WS_URL() {
        return readEnv('WS_URL', 'ws://localhost:8000/ws');
    },
    get UPLOAD_URL() {
        return readEnv('UPLOAD_URL', `${this.API_BASE_URL}/uploads`);
    },
    get APP_NAME() {
        return readEnv('APP_NAME', 'CrimsonSync');
    },
    get SESSION_KEY() {
        return readEnv('SESSION_KEY', 'crimsonsync_session');
    },
    get TOKEN_KEY() {
        return readEnv('TOKEN_KEY', 'crimsonsync_token');
    },
    get THEME_DEFAULT() {
        return readEnv('THEME_DEFAULT', 'light');
    },
    get THEME_KEY() {
        return readEnv('THEME_KEY', 'theme');
    },
    get USE_MOCK_API() {
        return readBool('USE_MOCK_API', true);
    },
    get API_TIMEOUT_MS() {
        return readNumber('API_TIMEOUT_MS', 30000);
    },
    get BACKEND_TYPE() {
        return readEnv('BACKEND_TYPE', 'fastapi');
    },
    get REQUESTS_STORAGE_KEY() {
        return readEnv('REQUESTS_STORAGE_KEY', 'crimsonsync_requests');
    },
};

export function getRuntimeEnv() {
    return { ...env };
}

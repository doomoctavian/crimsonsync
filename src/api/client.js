/**
 * HTTP client — ready for Django REST Framework / FastAPI backends.
 * Supports JSON requests, JWT auth, file uploads, and timeout handling.
 */
import { config } from '../config/index.js';
import { getToken } from '../utils/storage.js';

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

function buildUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
    }
    const base = config.API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
}

function createTimeoutSignal(ms) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return { signal: controller.signal, clear: () => clearTimeout(id) };
}

export async function apiClient(endpoint, options = {}) {
    const {
        method = 'GET',
        body,
        headers = {},
        auth = true,
        timeout = config.API_TIMEOUT_MS,
        isFormData = false,
    } = options;

    const url = buildUrl(endpoint);
    const requestHeaders = { ...headers };

    if (!isFormData) {
        requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    }

    if (auth) {
        const token = getToken();
        if (token) requestHeaders.Authorization = `Bearer ${token}`;
    }

    const { signal, clear } = createTimeoutSignal(timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            signal,
        });

        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else if (contentType?.includes('text/')) {
            data = await response.text();
        }

        if (!response.ok) {
            const message = data?.detail || data?.message || data?.error || 'Request failed';
            throw new ApiError(
                Array.isArray(message) ? message.map((m) => m.msg || m).join(', ') : message,
                response.status,
                data,
            );
        }

        return data;
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new ApiError('Request timed out', 408, null);
        }
        throw err;
    } finally {
        clear();
    }
}

/** Upload files via multipart/form-data (Django/FastAPI FileUpload handlers) */
export async function uploadClient(endpoint, formData, options = {}) {
    return apiClient(endpoint, {
        ...options,
        method: options.method || 'POST',
        body: formData,
        isFormData: true,
        auth: options.auth !== false,
    });
}

export const api = {
    get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PUT', body }),
    patch: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body }),
    delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
    upload: (endpoint, formData, options) => uploadClient(endpoint, formData, options),
};

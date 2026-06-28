/**
 * Local storage utilities with namespacing.
 */
import { config } from '../constants/config.js';

export function getItem(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
    localStorage.removeItem(key);
}

export function getSession() {
    return getItem(config.SESSION_KEY);
}

export function setSession(session) {
    setItem(config.SESSION_KEY, session);
}

export function clearSession() {
    removeItem(config.SESSION_KEY);
    removeItem(config.TOKEN_KEY);
}

export function getToken() {
    return localStorage.getItem(config.TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(config.TOKEN_KEY, token);
}

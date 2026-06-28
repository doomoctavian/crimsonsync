/**
 * Theme hook — uses config-driven defaults and storage key.
 */
import { config } from '../config/index.js';

export function getTheme() {
    return localStorage.getItem(config.THEME_KEY) || config.THEME_DEFAULT;
}

export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(config.THEME_KEY, theme);
    updateThemeIcons(theme);
}

export function toggleTheme() {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(next);
    return next;
}

export function initTheme() {
    setTheme(getTheme());
}

function updateThemeIcons(theme) {
    document.querySelectorAll('[data-theme-icon]').forEach((el) => {
        el.textContent = theme === 'light' ? '🌙' : '☀️';
    });
}

export function bindThemeToggle(selector = '[data-theme-toggle]') {
    document.querySelectorAll(selector).forEach((btn) => {
        btn.addEventListener('click', () => toggleTheme());
    });
}

/**
 * Application store — global config and UI state (React-ready).
 */
import { config, getRuntimeEnv } from '../config/index.js';
import { SessionContext } from '../context/session.js';

const listeners = new Set();

export const AppStore = {
    subscribe(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },

    notify() {
        const state = this.getState();
        listeners.forEach((cb) => cb(state));
    },

    getState() {
        return {
            appName: config.APP_NAME,
            useMockApi: config.USE_MOCK_API,
            backendType: config.BACKEND_TYPE,
            apiBaseUrl: config.API_BASE_URL,
            wsUrl: config.WS_URL,
            uploadUrl: config.UPLOAD_URL,
            themeDefault: config.THEME_DEFAULT,
            env: getRuntimeEnv(),
            session: SessionContext.getState(),
        };
    },

    isBackendConnected() {
        return !config.USE_MOCK_API;
    },
};

SessionContext.subscribe(() => AppStore.notify());

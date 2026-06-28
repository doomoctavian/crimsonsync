/**
 * Session context — mirrors future React Context pattern.
 */
import { getSession, setSession } from '../utils/storage.js';
import { getCurrentUser, isAuthenticated, logout } from '../utils/auth.js';

const listeners = new Set();

export const SessionContext = {
    subscribe(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },

    notify() {
        listeners.forEach((cb) => cb(this.getState()));
    },

    getState() {
        return {
            session: getSession(),
            user: getCurrentUser(),
            isAuthenticated: isAuthenticated(),
        };
    },

    update(partial) {
        const current = getSession() || {};
        setSession({ ...current, ...partial });
        this.notify();
    },

    signOut() {
        logout();
        this.notify();
    },
};

export function useSessionState() {
    return SessionContext.getState();
}

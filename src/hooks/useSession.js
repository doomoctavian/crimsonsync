/**
 * Session hook — subscribe to auth state changes.
 */
import { SessionContext } from '../context/session.js';

export function useSession(callback) {
    callback(SessionContext.getState());
    return SessionContext.subscribe(callback);
}

export function getSessionSnapshot() {
    return SessionContext.getState();
}

/**
 * WebSocket hook — subscribe to real-time chat/notifications.
 */
import { WebSocketClient, chatSocket } from '../api/websocket.js';
import { config } from '../config/index.js';

export function useWebSocket(path, { autoConnect = true } = {}) {
    const socket = path ? new WebSocketClient(path) : chatSocket;
    const unsubscribers = [];

    if (autoConnect && !config.USE_MOCK_API) {
        socket.connect();
    }

    function on(event, callback) {
        const unsub = socket.on(event, callback);
        unsubscribers.push(unsub);
        return unsub;
    }

    function send(payload) {
        socket.send(payload);
    }

    function disconnect() {
        unsubscribers.forEach((unsub) => unsub());
        socket.disconnect();
    }

    return { socket, on, send, disconnect, isMock: config.USE_MOCK_API };
}

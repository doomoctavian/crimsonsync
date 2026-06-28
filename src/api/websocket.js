/**
 * WebSocket client placeholder — real-time chat and notifications.
 * Connect when backend (Django Channels / FastAPI WebSocket) is ready.
 */
import { config } from '../config/index.js';
import { getToken } from '../utils/storage.js';

export class WebSocketClient {
    constructor(path = config.WS_PATHS.chat) {
        this.path = path;
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    getUrl() {
        const base = config.WS_URL.replace(/\/$/, '');
        const path = this.path.startsWith('/') ? this.path : `/${this.path}`;
        const token = getToken();
        const sep = path.includes('?') ? '&' : '?';
        return token ? `${base}${path}${sep}token=${encodeURIComponent(token)}` : `${base}${path}`;
    }

    connect() {
        if (config.USE_MOCK_API) {
            console.info('[WebSocket] Mock mode — connection skipped');
            return null;
        }

        if (this.ws?.readyState === WebSocket.OPEN) return this.ws;

        this.ws = new WebSocket(this.getUrl());

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this._emit('open', null);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this._emit('message', data);
                if (data.type) this._emit(data.type, data);
            } catch {
                this._emit('message', event.data);
            }
        };

        this.ws.onerror = (err) => this._emit('error', err);

        this.ws.onclose = () => {
            this._emit('close', null);
            this._attemptReconnect();
        };

        return this.ws;
    }

    _attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        this.reconnectAttempts += 1;
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }

    send(payload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(callback);
        return () => this.listeners.get(event)?.delete(callback);
    }

    _emit(event, data) {
        this.listeners.get(event)?.forEach((cb) => cb(data));
    }

    disconnect() {
        this.reconnectAttempts = this.maxReconnectAttempts;
        this.ws?.close();
        this.ws = null;
    }
}

export const chatSocket = new WebSocketClient(config.WS_PATHS.chat);

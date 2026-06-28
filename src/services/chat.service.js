/**
 * Chat service — conversations with optional WebSocket bridge.
 */
import * as chatApi from '../api/chat.api.js';
import { chatSocket } from '../api/websocket.js';
import { config } from '../config/index.js';

export async function getConversations() {
    return chatApi.fetchConversations();
}

export async function getMessages(conversationId) {
    return chatApi.fetchMessages(conversationId);
}

export async function sendChatMessage(conversationId, content) {
    const message = await chatApi.sendMessage(conversationId, content);

    if (!config.USE_MOCK_API) {
        chatSocket.send({ type: 'message', conversationId, content });
    }

    return message;
}

export function connectChatSocket(onMessage) {
    if (config.USE_MOCK_API) return () => {};
    chatSocket.connect();
    return chatSocket.on('message', onMessage);
}

export function disconnectChatSocket() {
    chatSocket.disconnect();
}

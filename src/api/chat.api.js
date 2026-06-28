/**
 * Chat API — REST + WebSocket ready for real-time messaging.
 */
import { api } from './client.js';
import { config, ENDPOINTS } from '../config/index.js';
import { mockChats } from '../data/mock-data.js';

export async function fetchConversations() {
    if (config.USE_MOCK_API) return mockChats.conversations;
    return api.get(ENDPOINTS.chat.conversations);
}

export async function fetchMessages(conversationId) {
    if (config.USE_MOCK_API) return mockChats.messages[conversationId] || [];
    return api.get(ENDPOINTS.chat.messages(conversationId));
}

export async function sendMessage(conversationId, content) {
    if (config.USE_MOCK_API) {
        return {
            id: 'msg_' + Date.now(),
            conversationId,
            content,
            sender: 'me',
            timestamp: new Date().toISOString(),
        };
    }
    return api.post(ENDPOINTS.chat.send(conversationId), { content });
}

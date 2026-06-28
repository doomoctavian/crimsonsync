import { mountDashboardLayout } from '../../components/layout/dashboard-layout.js';
import { fetchConversations, fetchMessages, sendMessage } from '../../api/chat.api.js';
import { guardRoute } from '../../utils/router.js';

let activeConversationId = null;

if (guardRoute({ requireAuth: true })) {
    fetchConversations().then((conversations) => {
        activeConversationId = conversations[0]?.id;
        renderChat(conversations, []);
    });
}

async function renderChat(conversations, messages) {
    const convHtml = conversations.map((c) => `
        <div class="chat-conversation${c.id === activeConversationId ? ' active' : ''}" data-conv="${c.id}">
            <div class="chat-avatar">${c.name.charAt(0)}</div>
            <div class="chat-preview"><h4>${c.name}</h4><p>${c.lastMessage}</p></div>
            ${c.unread ? '<span class="badge badge-danger">' + c.unread + '</span>' : ''}
        </div>`).join('');

    const msgHtml = messages.map((m) => `
        <div class="chat-bubble ${m.sender === 'me' ? 'sent' : 'received'}">${m.content}</div>`).join('');

    const content = `
        <div class="chat-layout">
            <div class="chat-sidebar">${convHtml}</div>
            <div class="chat-main">
                <div class="chat-messages" id="chatMessages">${msgHtml || '<p style="color:var(--text-light);text-align:center">Select a conversation</p>'}</div>
                <div class="chat-input-bar">
                    <input type="text" id="messageInput" placeholder="Type a message..." ${!activeConversationId ? 'disabled' : ''}>
                    <button class="btn btn-primary" id="sendBtn" ${!activeConversationId ? 'disabled' : ''}>Send</button>
                </div>
            </div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-light);margin-top:0.75rem">Chat is available after request approval. Connect WebSocket via <code>VITE_WS_URL</code> for real-time messaging.</p>`;

    mountDashboardLayout(document.getElementById('app'), { title: 'Messages', activeNav: 'Chat', content });

    if (activeConversationId) {
        const msgs = await fetchMessages(activeConversationId);
        document.getElementById('chatMessages').innerHTML = msgs.map((m) =>
            `<div class="chat-bubble ${m.sender === 'me' ? 'sent' : 'received'}">${m.content}</div>`).join('');
    }

    document.querySelectorAll('.chat-conversation').forEach((el) => {
        el.addEventListener('click', async () => {
            activeConversationId = el.dataset.conv;
            document.querySelectorAll('.chat-conversation').forEach((c) => c.classList.remove('active'));
            el.classList.add('active');
            const msgs = await fetchMessages(activeConversationId);
            document.getElementById('chatMessages').innerHTML = msgs.map((m) =>
                `<div class="chat-bubble ${m.sender === 'me' ? 'sent' : 'received'}">${m.content}</div>`).join('');
            document.getElementById('messageInput').disabled = false;
            document.getElementById('sendBtn').disabled = false;
        });
    });

    document.getElementById('sendBtn')?.addEventListener('click', sendCurrentMessage);
    document.getElementById('messageInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendCurrentMessage();
    });
}

async function sendCurrentMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content || !activeConversationId) return;

    const msg = await sendMessage(activeConversationId, content);
    const container = document.getElementById('chatMessages');
    container.insertAdjacentHTML('beforeend', `<div class="chat-bubble sent">${msg.content}</div>`);
    input.value = '';
    container.scrollTop = container.scrollHeight;
}

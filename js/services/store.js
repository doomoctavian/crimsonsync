import { config, storageKeys } from '../config/appConfig.js';
import { badgeCatalog, centers, chatThreads, donors, inventory, mockUsers, notifications, requests, verificationQueue } from '../data/mockData.js';

function defaultState() {
  return {
    currentUserId: null,
    users: mockUsers,
    requests,
    donors,
    inventory,
    centers,
    verificationQueue,
    chatThreads,
    badgeCatalog,
    notifications,
    activeChatId: chatThreads[0]?.id || null,
  };
}

let state = loadState();
let stateNotificationQueued = false;

function loadState() {
  const saved = localStorage.getItem(storageKeys.state);
  if (!saved) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(saved);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function getState() {
  return state;
}

export function setState(updater) {
  state = typeof updater === 'function' ? updater(structuredClone(state)) : updater;
  localStorage.setItem(storageKeys.state, JSON.stringify(state));
  if (stateNotificationQueued) {
    return;
  }
  stateNotificationQueued = true;
  queueMicrotask(() => {
    stateNotificationQueued = false;
    window.dispatchEvent(new CustomEvent('crimsonsync:state-change'));
  });
}

export function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

export function login(email, password, remember) {
  const user = state.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password);
  if (!user) {
    return null;
  }
  const token = `mock-token-${user.id}-${Date.now()}`;
  localStorage.setItem(config.authTokenKey, token);
  setState((draft) => ({ ...draft, currentUserId: user.id }));
  if (remember) {
    localStorage.setItem(`${config.authTokenKey}_remember`, 'true');
  }
  return user;
}

export function signup(payload) {
  const id = `user-${payload.role}-${Date.now()}`;
  const user = {
    id,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    bloodGroup: payload.bloodGroup || 'N/A',
    location: payload.location,
    availability: 'Not set yet',
    emergencyContact: 'Not set yet',
    preferences: 'No preferences configured yet',
    verificationStatus: 'pending',
    notifications: true,
    privacy: 'Share only after approval',
    points: 0,
    donations: 0,
    streak: 0,
    badges: payload.role === 'donor' ? ['First Donation Progress'] : [],
  };
  setState((draft) => ({ ...draft, currentUserId: id, users: [...draft.users, user] }));
  localStorage.setItem(config.authTokenKey, `mock-token-${id}-${Date.now()}`);
  return user;
}

export function logout() {
  localStorage.removeItem(config.authTokenKey);
  setState((draft) => ({ ...draft, currentUserId: null }));
}

export function updateCurrentUser(patch) {
  const user = currentUser();
  if (!user) {
    return null;
  }
  setState((draft) => ({
    ...draft,
    users: draft.users.map((candidate) => (candidate.id === user.id ? { ...candidate, ...patch } : candidate)),
  }));
  return currentUser();
}

export function addRequest(payload) {
  const user = currentUser();
  const request = {
    id: `req-${Date.now()}`,
    title: payload.title,
    requester: user?.name || 'Guest Requester',
    requesterRole: user?.role || 'recipient',
    bloodGroup: payload.bloodGroup,
    units: Number(payload.units),
    urgency: payload.urgency,
    location: payload.location,
    status: 'pending',
    matchedWith: 'Awaiting match',
    createdAt: new Date().toISOString(),
    dueAt: payload.dueAt,
    details: payload.details,
    timeline: ['Submitted', 'Verification pending'],
  };
  setState((draft) => ({ ...draft, requests: [request, ...draft.requests] }));
  return request;
}

export function updateRequestStatus(id, status) {
  setState((draft) => ({
    ...draft,
    requests: draft.requests.map((request) => request.id === id ? { ...request, status, timeline: [...request.timeline, labelForStatus(status)] } : request),
  }));
}

function labelForStatus(status) {
  const labels = {
    accepted: 'Request accepted',
    declined: 'Request declined',
    fulfilled: 'Marked fulfilled',
    cancelled: 'Cancelled by requester',
    review: 'Moved to review',
  };
  return labels[status] || status;
}

export function sendMessage(threadId, text) {
  const user = currentUser();
  if (!user || !text.trim()) {
    return;
  }
  setState((draft) => ({
    ...draft,
    chatThreads: draft.chatThreads.map((thread) => thread.id === threadId ? {
      ...thread,
      messages: [...thread.messages, { id: `m-${Date.now()}`, senderId: user.id, text: text.trim(), time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()), read: false }],
      unread: 0,
    } : thread),
  }));
}

export function setActiveChat(threadId) {
  setState((draft) => ({
    ...draft,
    activeChatId: threadId,
    chatThreads: draft.chatThreads.map((thread) => thread.id === threadId ? { ...thread, unread: 0 } : thread),
  }));
}

export function markNotificationsRead() {
  setState((draft) => ({ ...draft, notifications: draft.notifications.map((item) => ({ ...item, read: true })) }));
}

export function resetDemoData() {
  state = defaultState();
  localStorage.setItem(storageKeys.state, JSON.stringify(state));
  localStorage.removeItem(config.authTokenKey);
  window.dispatchEvent(new CustomEvent('crimsonsync:state-change'));
}

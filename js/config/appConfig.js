export const config = {
  appName: window.CRIMSONSYNC_ENV?.APP_NAME || 'CrimsonSync',
  apiBaseUrl: window.CRIMSONSYNC_ENV?.API_BASE_URL || 'https://api.example.com/v1',
  authTokenKey: window.CRIMSONSYNC_ENV?.AUTH_TOKEN_KEY || 'crimsonsync_auth_token',
  uploadEndpoint: window.CRIMSONSYNC_ENV?.UPLOAD_ENDPOINT || '/uploads',
  websocketUrl: window.CRIMSONSYNC_ENV?.WEBSOCKET_URL || 'wss://api.example.com/chat',
  defaultTheme: window.CRIMSONSYNC_ENV?.DEFAULT_THEME || 'light',
};

export const storageKeys = {
  state: 'crimsonsync_state_v2',
  theme: 'crimsonsync_theme',
};

export const roleMeta = {
  donor: {
    label: 'Donor',
    dashboardRoute: 'donor-dashboard',
    entryCopy: 'Donate safely, track impact, and respond to approved requests.',
    verificationCopy: 'Upload a government ID or donor card to unlock approved request chat.',
  },
  hospital: {
    label: 'Hospital',
    dashboardRoute: 'hospital-dashboard',
    entryCopy: 'Create requests, manage inventory, and coordinate verified donors.',
    verificationCopy: 'Upload hospital license and official authorization documents.',
  },
  recipient: {
    label: 'Recipient',
    dashboardRoute: 'recipient-dashboard',
    entryCopy: 'Submit blood requests, follow status, and chat after approval.',
    verificationCopy: 'Verify identity when required for sensitive request coordination.',
  },
  bloodBank: {
    label: 'Blood Bank',
    dashboardRoute: 'blood-bank-dashboard',
    entryCopy: 'Verify documents, manage stock, and triage emergency queues.',
    verificationCopy: 'Upload blood bank license and official compliance documents.',
  },
};

export const protectedRoutes = new Set([
  'dashboard',
  'donor-dashboard',
  'hospital-dashboard',
  'recipient-dashboard',
  'blood-bank-dashboard',
  'profile',
  'requests',
  'leaderboard',
  'messages',
  'verify',
]);

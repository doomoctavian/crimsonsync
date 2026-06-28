/**
 * Route definitions — maps cleanly to future React Router config.
 */
import { ROLE_DASHBOARD_PATHS } from './roles.js';

export const ROUTES = {
    HOME: '/index.html',
    LOGIN: '/src/pages/Login/login.html',
    SIGNUP: '/src/pages/Signup/signup.html',
    VERIFY: '/src/pages/Verify/verify.html',
    FORGOT_PASSWORD: '/src/pages/ForgotPassword/forgotpassword.html',
    RESET_PASSWORD: '/src/pages/ResetPassword/resetpassword.html',
    PROFILE: '/src/pages/Profile/index.html',
    REQUESTS: '/src/pages/Requests/index.html',
    LEADERBOARD: '/src/pages/Leaderboard/index.html',
    CHAT: '/src/pages/Chat/index.html',
    NOT_FOUND: '/src/pages/NotFound/index.html',
    DASHBOARDS: ROLE_DASHBOARD_PATHS,
};

export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.NOT_FOUND,
];

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

export const PROTECTED_ROUTES = [
    ...Object.values(ROLE_DASHBOARD_PATHS),
    ROUTES.PROFILE,
    ROUTES.REQUESTS,
    ROUTES.LEADERBOARD,
    ROUTES.CHAT,
    ROUTES.VERIFY,
];

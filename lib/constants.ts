export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_LOGIN: '/auth/google-login',
    REFRESH: '/auth/refresh',
    PROFILE: '/user/profile',
  },
  PROJECTS: {
    LIST: '/user/projects',
    TRANSLATE: '/projects/translate',
    DETAIL: (id: string) => `/projects/${id}`,
    STATUS: (id: string) => `/projects/${id}/status`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  SUBSCRIPTION: {
    PLANS: '/user/subscription_plans',
    SUBSCRIBE: '/user/subscribe',
    CANCEL: '/user/subscription/cancel',
  },
  CREDITS: {
    ESTIMATE: '/credits/estimate',
    RECHARGE: '/credits/recharge',
  },
} as const;

export const PLANS = {
  FREE: 'free',
  PAID: 'paid',
} as const;

export const PROJECT_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  QUEUED: 'queued',
} as const;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.curify-ai.com';
export const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || 'https://cdn.curify-ai.com';
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
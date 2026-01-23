// API 기본 설정
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.roomie.app/api/v1';

export const API_TIMEOUT = 10000;

// API 엔드포인트
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH: '/auth/refresh',
  },

  // Users
  USERS: {
    ME: '/users/me',
    PROFILE: '/users/me/profile',
    LIFESTYLE: '/users/me/lifestyle',
    PREFERENCES: '/users/me/preferences',
    WEIGHTS: '/users/me/weights',
    GET: (id: number) => `/users/${id}`,
  },

  // Matching
  MATCHING: {
    RECOMMENDATIONS: '/matching/recommendations',
    REQUEST: (id: number) => `/matching/request/${id}`,
    ACCEPT: (id: number) => `/matching/accept/${id}`,
    REJECT: (id: number) => `/matching/reject/${id}`,
    HISTORY: '/matching/history',
  },

  // Dormitories
  DORMITORIES: {
    LIST: '/dormitories',
    GET: (id: number) => `/dormitories/${id}`,
  },
} as const;

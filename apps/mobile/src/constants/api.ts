// API 기본 설정
export const API_BASE_URL = 'http://hjxarchive.cloud:8000/api/v1';
export const WS_BASE_URL = 'ws://hjxarchive.cloud:8000/api/v1';

export const API_TIMEOUT = 10000;

// API 엔드포인트
export const ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_CODE: '/auth/send-code',
    VERIFY_CODE: '/auth/verify-code',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    ME: '/users/me',
    LIFESTYLE: '/users/me/lifestyle',
    PREFERENCES: '/users/me/preference',
    PREFERENCE_FILTERS: '/users/me/preference/filters',
    PREFERENCE_WEIGHTS: '/users/me/preference/weights',
    REVIEWS_WRITTEN: '/users/me/reviews/written',
    REVIEWS_RECEIVED: '/users/me/reviews/received',
    REVIEWS: (id: string) => `/users/${id}/reviews`,
  },

  // Matching
  MATCHING: {
    RECOMMENDATIONS: '/matching',
    CONNECTIONS: '/matching/connections',
    DETAIL: (userId: string | number) => `/matching/${userId}`,
    ROOMMATE: '/matching/roommate',
    END_SEMESTER: '/matching/end-semester',
    FINALIZE_SEMESTER: '/matching/finalize-semester',
  },

  // Chats
  CHATS: {
    CREATE: '/chats',
    LIST: '/chats',
    MESSAGES: (chatRoomId: string) => `/chats/${chatRoomId}/messages`,
  },

  // Contracts
  CONTRACTS: {
    BY_CHAT_ROOM: (chatRoomId: string) => `/contracts?chatRoomId=${chatRoomId}`,
    INIT: '/contracts/init',
    GET: (contractId: string) => `/contracts/${contractId}`,
    UPDATE: (contractId: string) => `/contracts/${contractId}`,
    SIGN: (contractId: string) => `/contracts/${contractId}/sign`,
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
  },

  // Schools
  SCHOOLS: {
    LIST: '/schools',
    GET: (id: number) => `/schools/${id}`,
    DORMS: (id: number) => `/schools/${id}/dorms`,
    BY_DOMAIN: (domain: string) => `/schools/by-domain/${domain}`,
  },

  // Dormitories
  DORMITORIES: {
    LIST: '/dormitories',
  },

  // Room-BTI
  ROOM_BTI: {
    QUESTIONS: '/room-bti/questions',
    TEST: '/room-bti/test',
    ME: '/room-bti/me',
  },

  // Help Center
  HELP: {
    LIST: '/help',
    CREATE: '/help',
    GET: (id: string) => `/help/${id}`,
    UPDATE_STATUS: (id: string) => `/help/${id}/status`,
  },

  // Delivery
  DELIVERY: {
    LIST: '/delivery',
    CREATE: '/delivery',
    GET: (id: string) => `/delivery/${id}`,
    JOIN: (id: string) => `/delivery/${id}/join`,
    LEAVE: (id: string) => `/delivery/${id}/leave`,
    CLOSE: (id: string) => `/delivery/${id}/close`,
  },
} as const;

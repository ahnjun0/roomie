import { Platform } from 'react-native';

// API 기본 설정
// Android 에뮬레이터에서는 10.0.2.2가 호스트 머신의 localhost를 가리킴
const getDevBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = __DEV__
  ? getDevBaseUrl()
  : 'https://api.roomie.app/api/v1';

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
  },

  // Users
  USERS: {
    ME: '/users/me',
    PROFILE: '/users/me/profile',
    LIFESTYLE: '/users/me/lifestyle',
    PREFERENCES: '/users/me/preference',
    REVIEWS_WRITTEN: '/users/me/reviews/written',
    REVIEWS_RECEIVED: '/users/me/reviews/received',
    GET: (id: number) => `/users/${id}`,
    REVIEWS: (id: number) => `/users/${id}/reviews`,
  },

  // Matching
  MATCHING: {
    RECOMMENDATIONS: '/matching',
    DETAIL: (userId: number) => `/matching/${userId}`,
  },

  // Chats
  CHATS: {
    CREATE: '/chats',
    LIST: '/chats',
    MESSAGES: (chatRoomId: string) => `/chats/${chatRoomId}/messages`,
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
  },

  // Dormitories
  DORMITORIES: {
    LIST: '/dormitories',
    GET: (id: number) => `/dormitories/${id}`,
  },
} as const;

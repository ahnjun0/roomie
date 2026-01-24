// 앱 테마 상수
export const colors = {
  primary: '#13b6ec',
  primaryDark: '#0a9fd4',
  primaryLight: '#40c6f0',

  // Background
  background: {
    light: '#FFFFFF',
    dark: '#121212',
  },

  // Surface
  surface: {
    light: '#F5F5F5',
    dark: '#1E1E1E',
  },

  // Card
  card: {
    light: '#FFFFFF',
    dark: '#2A2A2A',
  },

  // Text
  text: {
    primary: {
      light: '#1A1A1A',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#666666',
      dark: '#A0A0A0',
    },
    tertiary: {
      light: '#999999',
      dark: '#707070',
    },
  },

  // Border
  border: {
    light: '#E0E0E0',
    dark: '#3A3A3A',
  },

  // Status
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Match score colors
  matchHigh: '#4CAF50',
  matchMedium: '#FFC107',
  matchLow: '#F44336',

  // Tags
  tag: {
    background: {
      light: '#E3F2FD',
      dark: '#1E3A5F',
    },
    text: {
      light: '#1976D2',
      dark: '#64B5F6',
    },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// 스크린 단계 상수
export const ONBOARDING_STEPS = {
  BASIC_INFO: { current: 1, total: 11 },
  DORMITORY_SELECT: { current: 2, total: 11 },
  CORE_HABITS: { current: 3, total: 11 },
  LIFESTYLE_SCALE: { current: 4, total: 11 },
  ROOMMATE_PREFERENCES: { current: 6, total: 11 },
  SLEEP_PATTERNS: { current: 5, total: 5 },
  WEIGHT_GAME: { current: 8, total: 11 },
} as const;

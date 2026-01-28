// 앱 테마 상수
export const colors = {
  primary: '#0f9f8f',
  primaryDark: '#0b7f73',
  primaryLight: '#4cc5b6',

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
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5a4',

  // Match score colors
  matchHigh: '#16a34a',
  matchMedium: '#f59e0b',
  matchLow: '#ef4444',

  // Tags
  tag: {
    background: {
      light: '#e6f6f4',
      dark: '#123c39',
    },
    text: {
      light: '#0f766e',
      dark: '#5eead4',
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

// ONBOARDING_STEPS는 data.ts에서 관리됩니다.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  tag: {
    background: string;
    text: string;
  };
}

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors & typeof colors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@roomie_theme_mode';

function getThemeColors(isDark: boolean): ThemeColors {
  return {
    background: isDark ? colors.background.dark : colors.background.light,
    surface: isDark ? colors.surface.dark : colors.surface.light,
    card: isDark ? colors.card.dark : colors.card.light,
    text: {
      primary: isDark ? colors.text.primary.dark : colors.text.primary.light,
      secondary: isDark
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
      tertiary: isDark ? colors.text.tertiary.dark : colors.text.tertiary.light,
    },
    border: isDark ? colors.border.dark : colors.border.light,
    tag: {
      background: isDark ? colors.tag.background.dark : colors.tag.background.light,
      text: isDark ? colors.tag.text.dark : colors.tag.text.light,
    },
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
        setThemeModeState(storedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const themeColors = getThemeColors(isDark);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        colors: { ...colors, ...themeColors },
        setThemeMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

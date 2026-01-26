import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<string>;
  refreshUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  tempToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@roomie_access_token',
  REFRESH_TOKEN: '@roomie_refresh_token',
  USER: '@roomie_user',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
    isOnboardingComplete: false,
  });

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson) as User;
        api.setAccessToken(accessToken);

        setState({
          user,
          accessToken,
          refreshToken,
          isLoading: false,
          isAuthenticated: true,
          isOnboardingComplete: user.isProfileComplete,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      api.setAccessToken(accessToken);
      // 토큰이 설정되면 인증된 상태로 간주
      setState(prev => ({ ...prev, accessToken, refreshToken, isAuthenticated: true }));
    },
    [],
  );

  const sendVerificationCode = useCallback(async (email: string) => {
    await api.post(ENDPOINTS.AUTH.SEND_CODE, { email });
  }, []);

  const verifyCode = useCallback(
    async (email: string, code: string): Promise<string> => {
      const response = await api.post<{ verified: boolean; tempToken: string }>(
        ENDPOINTS.AUTH.VERIFY_CODE,
        { email, code },
      );
      return response.tempToken;
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await api.post<{
        id: number;
        email: string;
        nickname: string | null;
        accessToken: string;
        refreshToken: string;
      }>(ENDPOINTS.AUTH.REGISTER, {
        email: data.email,
        password: data.password,
        tempToken: data.tempToken,
      });

      // 백엔드 응답으로부터 User 객체 구성 (nickname -> name 매핑)
      const user: User = {
        id: response.id,
        email: response.email,
        name: response.nickname,
        gender: null,
        nationality: null,
        birthYear: null,
        studentId: null,
        persona: null,
        isEmailVerified: true,
        isProfileComplete: false, // 회원가입 직후이므로 프로필 미완성
      };

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);

      api.setAccessToken(response.accessToken);

      setState({
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
        isAuthenticated: true,
        isOnboardingComplete: false,
      });
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{
      id: number;
      email: string;
      nickname: string | null;
      accessToken: string;
      refreshToken: string;
    }>(ENDPOINTS.AUTH.LOGIN, { email, password });

    // 로그인 후 사용자 상세 정보 가져오기
    api.setAccessToken(response.accessToken);

    let user: User;
    let isOnboardingComplete = false;

    try {
      // 전체 사용자 정보 가져오기
      user = await api.get<User>(ENDPOINTS.USERS.ME);
      isOnboardingComplete = user.isProfileComplete;
    } catch {
      // 실패 시 기본 정보 사용 (nickname -> name 매핑)
      user = {
        id: response.id,
        email: response.email,
        name: response.nickname,
        gender: null,
        nationality: null,
        birthYear: null,
        studentId: null,
        persona: null,
        isEmailVerified: true,
        isProfileComplete: false,
      };
    }

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
    ]);

    setState({
      user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isLoading: false,
      isAuthenticated: true,
      isOnboardingComplete,
    });
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);

    api.setAccessToken(null);

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      isOnboardingComplete: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.get<User>(ENDPOINTS.USERS.ME);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setState(prev => ({
        ...prev,
        user,
        isOnboardingComplete: user.isProfileComplete,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const setUser = useCallback(async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
      isOnboardingComplete: user.isProfileComplete,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        sendVerificationCode,
        verifyCode,
        refreshUser,
        setTokens,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { UserLifestyle, UserPreference } from '../types';

// 온보딩 데이터 타입
interface OnboardingData {
  // Registration (이메일 인증 후 저장)
  email: string | null;
  password: string | null;
  tempToken: string | null;

  // Basic Info
  gender: 'male' | 'female' | null;
  nationality: string | null;
  age: number | null;
  studentId: string | null;

  // Dormitory
  selectedDormitories: number[];

  // Core Habits
  isSmoker: boolean | null;
  sleepHabits: string[];

  // Lifestyle Scales (1-5)
  noiseLevel: number;
  cleanliness: number;
  indoorEating: number;
  lightsOut: number;
  temperature: number;

  // Roommate Preferences
  preferredNationality: string;
  preferredStudentYear: string;

  // Sleep Patterns
  sleepStart: number; // 0-30 (0 = 오후 6시)
  sleepEnd: number;
  homeVisitFrequency: string | null;
  sensitivity: number; // 1-5

  // Weight Game (0.0 ~ 3.0)
  weightSmoking: number;
  weightSleep: number;
  weightCleanliness: number;
  weightNoise: number;
}

// 회원가입 응답 타입
interface RegisterResponse {
  id: number;
  email: string;
  nickname: string | null;
  accessToken: string;
  refreshToken: string;
  isProfileComplete: boolean;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  submitRegistration: () => Promise<RegisterResponse>;
  submitBasicInfo: () => Promise<void>;
  submitLifestyle: () => Promise<void>;
  submitPreferences: () => Promise<void>;
  resetData: () => void;
}

const initialData: OnboardingData = {
  // [DEV] 개발 및 UI 테스트를 위해 초기값을 설정합니다.
  // 이렇게 하면 앱을 새로고침해도 이메일 인증 단계를 건너뛰고 가입/온보딩 화면을 테스트할 수 있습니다.
  email: 'test@univ.ac.kr',
  password: 'password123',
  tempToken: 'mock-temp-token-dev', 

  gender: 'male',
  nationality: 'korean',
  age: 24,
  studentId: '2020',
  
  selectedDormitories: [],
  isSmoker: null,
  sleepHabits: [],
  noiseLevel: 3,
  cleanliness: 3,
  indoorEating: 3,
  lightsOut: 3,
  temperature: 3,
  preferredNationality: 'ANY',
  preferredStudentYear: 'ANY',
  sleepStart: 12, // 오전 12시 기본값
  sleepEnd: 18, // 오전 6시 기본값
  homeVisitFrequency: null,
  sensitivity: 3,
  weightSmoking: 1.0,
  weightSleep: 1.0,
  weightCleanliness: 1.0,
  weightNoise: 1.0,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
  }, []);

  const submitRegistration = useCallback(async (): Promise<RegisterResponse> => {
    // 필수 데이터 확인
    if (!data.email || !data.password || !data.tempToken) {
      throw new Error('이메일, 비밀번호, 인증 토큰이 필요합니다.');
    }
    if (!data.gender || !data.nationality || !data.age || !data.studentId) {
      throw new Error('기본 정보를 모두 입력해주세요.');
    }

    const response = await api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
      email: data.email,
      password: data.password,
      tempToken: data.tempToken,
      gender: data.gender.toUpperCase(),
      
      // API 요구사항에 맞게 데이터 변환
      // nationality: 'korean' -> 'KOREAN', 그 외 -> 'FOREIGNER'
      nationality: data.nationality === 'korean' ? 'KOREAN' : 'FOREIGNER',
      
      age: data.age,
      
      // studentId: '2024' -> 24 (입학년도 뒤 2자리)
      studentId: parseInt(data.studentId, 10) % 100,
    });

    return response;
  }, [data]);

  const submitBasicInfo = useCallback(async () => {
    await api.patch(ENDPOINTS.USERS.ME, {
      gender: data.gender?.toUpperCase(),
      nationality: data.nationality,
      age: data.age,
      student_id: data.studentId,
    });
  }, [data]);

  const submitLifestyle = useCallback(async () => {
    // 선택된 기숙사 ID를 이름으로 변환
    const selectedDormNames = data.selectedDormitories
      .map(id => {
        const dorm = [1, 2, 3, 4].find(d => d === id);
        if (id === 1) return '성실관';
        if (id === 2) return '봉사관';
        if (id === 3) return '진리관';
        if (id === 4) return '화원관';
        return '';
      })
      .filter(Boolean)
      .join(',');

    await api.put(ENDPOINTS.USERS.LIFESTYLE, {
      dormNames: selectedDormNames,
      isSmoker: data.isSmoker ?? false,
      sleepStart: data.sleepStart,
      sleepEnd: data.sleepEnd,
      sleepHabits: data.sleepHabits.join(',') || null,
      noiseLevel: data.noiseLevel,
      cleanLevel: data.cleanliness,
      foodLevel: data.indoorEating,
      lightLevel: data.lightsOut,
      tempLevel: data.temperature,
      homeVisit: data.homeVisitFrequency || null,
    });
  }, [data]);

  const submitPreferences = useCallback(async () => {
    await api.put(ENDPOINTS.USERS.PREFERENCES, {
      pref_nationality: data.preferredNationality,
      pref_student_id: data.preferredStudentYear,
      weight_cleanliness: data.weightCleanliness,
      weight_noise: data.weightNoise,
      weight_smoking: data.weightSmoking,
      weight_sleep: data.weightSleep,
    });
  }, [data]);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        submitRegistration,
        submitBasicInfo,
        submitLifestyle,
        submitPreferences,
        resetData,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

function getCleaningHabit(level: number): string {
  if (level <= 1) return 'DAILY';
  if (level <= 2) return 'WEEKLY';
  if (level <= 4) return 'WHEN_DIRTY';
  return 'NEVER';
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
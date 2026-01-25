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
  email: null,
  password: null,
  tempToken: null,
  gender: null,
  nationality: null,
  age: null,
  studentId: null,
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
      nationality: data.nationality,
      age: data.age,
      studentId: parseInt(data.studentId, 10),
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
    await api.put(ENDPOINTS.USERS.LIFESTYLE, {
      dorm_name: data.selectedDormitories[0], // 첫 번째 선택된 기숙사
      is_smoker: data.isSmoker,
      sleep_start: data.sleepStart,
      sleep_end: data.sleepEnd,
      sensitivity: data.sensitivity,
      sleep_habits: data.sleepHabits,
      cleaning_habit: getCleaningHabit(data.cleanliness),
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

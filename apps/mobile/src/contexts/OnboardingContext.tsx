import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { ENDPOINTS } from '../constants/api';

// 온보딩 데이터 타입
interface OnboardingData {
  // Registration (이메일 인증 후 저장)
  email: string | null;
  password: string | null;
  tempToken: string | null;
  nickname: string | null;

  // Basic Info
  gender: 'MALE' | 'FEMALE' | null;
  nationality: string | null;
  age: number | null;
  studentId: string | null;

  // Dormitory
  selectedDormitories: number[];
  selectedDormitoryNames: string; // 쉼표로 구분된 기숙사 이름들

  // Core Habits
  isSmoker: boolean | null;
  sleepHabits: string[];

  // Lifestyle Scales (1-5)
  noiseLevel: number;
  cleanliness: number;
  indoorEating: number;
  temperature: number;

  // Roommate Preferences
  preferredNationality: string;
  preferredStudentYear: string;

  // Preferred Lifestyle (원하는 룸메이트의 생활 방식)
  prefNoiseLevel: number;
  prefCleanliness: number;
  prefIndoorEating: number;
  prefTemperature: number;

  // Sleep Patterns
  sleepStart: number; // 0-30 (0 = 오후 6시)
  sleepEnd: number;
  homeVisitFrequency: string | null;
  sensitivity: number; // 1-5
}

// 회원가입 응답 타입
interface RegisterResponse {
  id: string;
  email: string;
  nickname: string | null;
  accessToken: string;
  refreshToken: string;
  isProfileComplete: boolean;
}

interface WeightData {
  weightNoise: number;
  weightClean: number;
  weightFood: number;
  weightHabit: number;
  weightTime: number;
  weightTemp: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  submitRegistration: (overrides?: Partial<OnboardingData>) => Promise<RegisterResponse>;
  submitBasicInfo: () => Promise<void>;
  submitLifestyle: () => Promise<void>;
  submitPreferences: (weights: WeightData) => Promise<void>;
  resetData: () => void;
}

// ... (initialData definition)

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

  const submitRegistration = useCallback(async (overrides?: Partial<OnboardingData>): Promise<RegisterResponse> => {
    const finalData = { ...data, ...overrides };

    // 필수 데이터 확인
    if (!finalData.email || !finalData.password || !finalData.tempToken || !finalData.nickname) {
      throw new Error('이메일, 비밀번호, 인증 토큰, 닉네임이 필요합니다.');
    }
    if (!finalData.gender || !finalData.nationality || !finalData.age || !finalData.studentId) {
      throw new Error('기본 정보를 모두 입력해주세요.');
    }

    const response = await api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
      email: finalData.email,
      password: finalData.password,
      tempToken: finalData.tempToken,
      nickname: finalData.nickname,
      gender: finalData.gender,
      nationality: finalData.nationality,
      age: finalData.age,
      studentId: typeof finalData.studentId === 'string'
        ? parseInt(finalData.studentId, 10) % 100
        : finalData.studentId,
    });

    return response;
  }, [data]);

  const submitBasicInfo = useCallback(async () => {
    await api.patch(ENDPOINTS.USERS.ME, {
      gender: data.gender,
      nationality: data.nationality,
      age: data.age,
      studentId: typeof data.studentId === 'string'
        ? parseInt(data.studentId, 10) % 100
        : data.studentId,
    });
  }, [data]);

  const submitLifestyle = useCallback(async () => {
    await api.put(ENDPOINTS.USERS.LIFESTYLE, {
      dormNames: data.selectedDormitoryNames || '',
      isSmoker: data.isSmoker ?? false,
      sleepStart: data.sleepStart,
      sleepEnd: data.sleepEnd,
      sleepHabits: data.sleepHabits.join(',') || null,
      noiseLevel: data.noiseLevel,
      cleanLevel: data.cleanliness,
      foodLevel: data.indoorEating,
      tempLevel: data.temperature,
      homeVisit: data.homeVisitFrequency || null,
    });
  }, [data]);

  const submitPreferences = useCallback(async (weights: WeightData) => {
    // prefNationality 값 변환:
    // - 'ANY' (상관없음) → null
    // - 'SAME' (동일 국적) → 사용자 본인의 nationality (KOREAN 또는 FOREIGNER)
    let prefNationality: string | null = null;
    if (data.preferredNationality === 'SAME') {
      prefNationality = data.nationality;
    }
    // 'ANY'인 경우 null 유지

    await api.put(ENDPOINTS.USERS.PREFERENCES, {
      prefNationality,
      prefStudentId: data.preferredStudentYear,
      weightNoise: weights.weightNoise,
      weightClean: weights.weightClean,
      weightFood: weights.weightFood,
      weightHabit: weights.weightHabit,
      weightTime: weights.weightTime,
      weightTemp: weights.weightTemp,
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

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

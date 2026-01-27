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

  // Weight Game (0.0 ~ 3.0)
  weightSmoking: number;
  weightSleep: number;
  weightCleanliness: number;
  weightNoise: number;
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
  submitRegistration: () => Promise<RegisterResponse>;
  submitBasicInfo: () => Promise<void>;
  submitLifestyle: () => Promise<void>;
  submitPreferences: (weights: WeightData) => Promise<void>;
  resetData: () => void;
}

const initialData: OnboardingData = {
  // [DEV] 개발 및 UI 테스트를 위해 초기값을 설정합니다.
  // 이렇게 하면 앱을 새로고침해도 이메일 인증 단계를 건너뛰고 가입/온보딩 화면을 테스트할 수 있습니다.
  email: 'test@univ.ac.kr',
  password: 'password123',
  tempToken: 'mock-temp-token-dev', 
  nickname: 'RoomieUser',

  gender: 'MALE',
  nationality: 'KOREAN',
  age: 24,
  studentId: '2020',

  selectedDormitories: [],
  selectedDormitoryNames: '',
  isSmoker: null,
  sleepHabits: [],
  noiseLevel: 3,
  cleanliness: 3,
  indoorEating: 3,
  temperature: 3,
  preferredNationality: 'ANY',
  preferredStudentYear: 'ANY',
  prefNoiseLevel: 3,
  prefCleanliness: 3,
  prefIndoorEating: 3,
  prefTemperature: 3,
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
    if (!data.email || !data.password || !data.tempToken || !data.nickname) {
      throw new Error('이메일, 비밀번호, 인증 토큰, 닉네임이 필요합니다.');
    }
    if (!data.gender || !data.nationality || !data.age || !data.studentId) {
      throw new Error('기본 정보를 모두 입력해주세요.');
    }

    const response = await api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
      email: data.email,
      password: data.password,
      tempToken: data.tempToken,
      nickname: data.nickname,
      gender: data.gender,
      nationality: data.nationality,
      age: data.age,
      studentId: typeof data.studentId === 'string'
        ? parseInt(data.studentId, 10) % 100
        : data.studentId,
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

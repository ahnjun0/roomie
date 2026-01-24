import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import { User, UserLifestyle, UserPreference } from '../types';

export interface UpdateProfileRequest {
  nickname?: string;
  gender?: 'MALE' | 'FEMALE';
  nationality?: string;
  age?: number;
  studentId?: string;
}

export interface UpdateLifestyleRequest {
  dormName?: string;
  isSmoker?: boolean;
  sleepStart?: number;
  sleepEnd?: number;
  sensitivity?: number;
  sleepHabits?: string[];
  cleaningHabit?: string;
}

export interface UpdatePreferenceRequest {
  prefNationality?: string;
  prefStudentId?: string;
  weightCleanliness?: number;
  weightNoise?: number;
  weightSmoking?: number;
  weightSleep?: number;
}

export async function getProfile(): Promise<User> {
  return api.get<User>(ENDPOINTS.USERS.ME);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return api.patch<User>(ENDPOINTS.USERS.ME, data);
}

export async function getLifestyle(): Promise<UserLifestyle> {
  return api.get<UserLifestyle>(ENDPOINTS.USERS.LIFESTYLE);
}

export async function updateLifestyle(data: UpdateLifestyleRequest): Promise<UserLifestyle> {
  return api.put<UserLifestyle>(ENDPOINTS.USERS.LIFESTYLE, {
    dorm_name: data.dormName,
    is_smoker: data.isSmoker,
    sleep_start: data.sleepStart,
    sleep_end: data.sleepEnd,
    sensitivity: data.sensitivity,
    sleep_habits: data.sleepHabits,
    cleaning_habit: data.cleaningHabit,
  });
}

export async function getPreference(): Promise<UserPreference> {
  return api.get<UserPreference>(ENDPOINTS.USERS.PREFERENCES);
}

export async function updatePreference(data: UpdatePreferenceRequest): Promise<UserPreference> {
  return api.put<UserPreference>(ENDPOINTS.USERS.PREFERENCES, {
    pref_nationality: data.prefNationality,
    pref_student_id: data.prefStudentId,
    weight_cleanliness: data.weightCleanliness,
    weight_noise: data.weightNoise,
    weight_smoking: data.weightSmoking,
    weight_sleep: data.weightSleep,
  });
}

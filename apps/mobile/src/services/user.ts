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
  dormNames?: string;
  isSmoker?: boolean;
  sleepStart?: number;
  sleepEnd?: number;
  sleepHabits?: string;
  noiseLevel?: number;
  cleanLevel?: number;
  foodLevel?: number;
  lightLevel?: number;
  tempLevel?: number;
  homeVisit?: string;
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
    dormNames: data.dormNames,
    isSmoker: data.isSmoker,
    sleepStart: data.sleepStart,
    sleepEnd: data.sleepEnd,
    sleepHabits: data.sleepHabits,
    noiseLevel: data.noiseLevel,
    cleanLevel: data.cleanLevel,
    foodLevel: data.foodLevel,
    lightLevel: data.lightLevel,
    tempLevel: data.tempLevel,
    homeVisit: data.homeVisit,
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

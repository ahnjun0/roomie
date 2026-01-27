import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import { User, UserLifestyle, UserPreference } from '../types';

export interface UpdateProfileRequest {
  nickname?: string;
  age?: number;
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
  tempLevel?: number;
  homeVisit?: string;
}

export interface UpdatePreferenceFiltersRequest {
  prefNationality?: string | null;
  prefStudentId?: string | null;
}

export interface UpdatePreferenceWeightsRequest {
  weightNoise: number;
  weightClean: number;
  weightFood: number;
  weightHabit: number;
  weightTime: number;
  weightTemp: number;
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
  return api.put<UserLifestyle>(ENDPOINTS.USERS.LIFESTYLE, data);
}

export async function getPreference(): Promise<UserPreference> {
  return api.get<UserPreference>(ENDPOINTS.USERS.PREFERENCES);
}

export async function updatePreferenceFilters(data: UpdatePreferenceFiltersRequest): Promise<UserPreference> {
  return api.put<UserPreference>(ENDPOINTS.USERS.PREFERENCE_FILTERS, data);
}

export async function updatePreferenceWeights(data: UpdatePreferenceWeightsRequest): Promise<UserPreference> {
  return api.put<UserPreference>(ENDPOINTS.USERS.PREFERENCE_WEIGHTS, data);
}

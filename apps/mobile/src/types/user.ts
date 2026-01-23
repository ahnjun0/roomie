export type Gender = 'male' | 'female';

export interface User {
  id: number;
  email: string;
  name: string | null;
  gender: Gender | null;
  nationality: string | null;
  birthYear: number | null;
  studentId: string | null;
  persona: string | null;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
}

export interface UserLifestyle {
  isSmoker: boolean | null;
  snores: boolean | null;
  grindsTeeth: boolean | null;
  sleepTime: string | null;
  wakeTime: string | null;
  homeVisitFrequency: number | null;
  lightSensitivity: number | null;
  noiseSensitivity: number | null;
  cleanliness: number | null;
  indoorEating: boolean | null;
  preferredTemperature: number | null;
}

export interface UserPreference {
  preferredNationality: string | null;
  preferredStudentYear: string | null;
  maxNoiseLevel: number | null;
  minCleanliness: number | null;
  allowsIndoorEating: boolean | null;
  allowsSmoking: boolean | null;
  weights: Record<string, number>;
  preferredDormitoryIds: number[];
}

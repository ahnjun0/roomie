export type Gender = 'male' | 'female';

export interface User {
  id: number;
  email: string;
  name: string | null;
  gender: Gender | null;
  nationality: string | null;
  birthYear: number | null;
  studentId: string | null;
  schoolId: number | null;
  persona: string | null;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
}

export interface UserLifestyle {
  id: number;
  userId: number;
  dormNames: string;
  isSmoker: boolean;
  sleepStart: number;
  sleepEnd: number;
  sleepHabits: string | null;
  noiseLevel: number;
  cleanLevel: number;
  foodLevel: number;
  lightLevel: number;
  tempLevel: number;
  homeVisit: string | null;
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

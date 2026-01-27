export type Gender = 'MALE' | 'FEMALE';
export type Nationality = 'KOREAN' | 'FOREIGNER';
export type MatchingStatus = 'SEARCHING' | 'MATCHED';

export interface User {
  id: string;
  email: string;
  nickname: string | null;
  gender: Gender;
  nationality: Nationality;
  age: number;
  studentId: number;
  schoolId: number | null;
  matchingStatus: MatchingStatus;
  createdAt: string;
  lifestyle?: UserLifestyle | null;
  preference?: UserPreference | null;
  isProfileComplete: boolean;
}

export interface UserLifestyle {
  id: number;
  userId: string;
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
  id: number;
  userId: string;
  prefNationality: Nationality | null;
  prefStudentId: string | null;
  weightNoise: number;
  weightClean: number;
  weightFood: number;
  weightHabit: number;
  weightTime: number;
  weightLight: number;
  weightTemp: number;
}

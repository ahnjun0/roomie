import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface MatchingUser {
  id: string;
  nickname: string | null;
  studentId: number;
  nationality: string;
  dormNames: string;
  matchRate: number;
  keywords: string[];
  isSmoker: boolean;
  sleepStart: number;
}

export interface MatchingListResponse {
  data: MatchingUser[];
  total: number;
  page: number;
  limit: number;
}

export interface ComparisonItem {
  me: boolean | number | string;
  target: boolean | number | string;
  match: boolean;
}

export interface ScoreBreakdownItem {
  score: number;
  weight: number;
  status: string;
}

export interface RadarChartData {
  noise: number;
  clean: number;
  food: number;
  temp: number;
  time: number;
  habit: number;
}

export interface MatchingUserDetail {
  id: string;
  nickname: string | null;
  gender: string;
  nationality: string;
  studentId: number;
  age: number;
}

export interface MatchingLifestyleDetail {
  dormNames: string;
  isSmoker: boolean;
  sleepStart: number;
  sleepEnd: number;
  sleepHabits: string | null;
  noiseLevel: number;
  cleanLevel: number;
  foodLevel: number;
  tempLevel: number;
  homeVisit: string | null;
}

export interface ReviewSummary {
  id: number;
  content: string;
  score: number;
  createdAt: string;
}

export interface MatchingDetailResponse {
  user: MatchingUserDetail;
  lifestyle: MatchingLifestyleDetail | null;
  matchRate: number;
  comparison: Record<string, ComparisonItem>;
  radarChart: Record<string, RadarChartData>;
  scoreBreakdown: Record<string, ScoreBreakdownItem>;
  reviews: ReviewSummary[];
  reviewCount: number;
  averageReviewScore: number;
}

interface GetMatchingListParams {
  page?: number;
  limit?: number;
  sortBy?: 'matchRate' | 'createdAt';
  dormName?: string;
}

export async function getMatchingList(params: GetMatchingListParams = {}): Promise<MatchingListResponse> {
  const { page = 1, limit = 10, sortBy = 'matchRate', dormName } = params;

  let url = `${ENDPOINTS.MATCHING.RECOMMENDATIONS}?page=${page}&limit=${limit}&sortBy=${sortBy}`;
  if (dormName) {
    url += `&dormName=${encodeURIComponent(dormName)}`;
  }

  return api.get<MatchingListResponse>(url);
}

export async function getMatchingDetail(userId: string): Promise<MatchingDetailResponse> {
  return api.get<MatchingDetailResponse>(ENDPOINTS.MATCHING.DETAIL(userId));
}

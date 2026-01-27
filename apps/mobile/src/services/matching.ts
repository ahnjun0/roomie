import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface MatchingUser {
  id: string;
  nickname: string;
  studentId: string;
  dormName: string;
  matchRate: number;
  tags: string[];
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

export interface MatchingDetailResponse {
  id: string;
  nickname: string;
  studentId: string;
  dormName: string;
  gender: string;
  nationality: string;
  matchRate: number;
  comparison: Record<string, ComparisonItem>;
  reviews: {
    id: number;
    reviewerName: string;
    content: string;
    score: number;
    createdAt: string;
  }[];
  averageReviewScore: number;
  reviewCount: number;
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

import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface MatchingUser {
  id: number;
  nickname: string;
  studentId: string;
  dormName: string;
  matchScore: number;
  tags: string[];
}

export interface MatchingListResponse {
  items: MatchingUser[];
  total: number;
  page: number;
  limit: number;
}

export interface MatchingDetailResponse {
  id: number;
  nickname: string;
  studentId: string;
  dormName: string;
  gender: string;
  nationality: string;
  matchScore: number;
  comparison: {
    label: string;
    myValue: number;
    otherValue: number;
  }[];
  reviews: {
    id: number;
    reviewerName: string;
    content: string;
    score: number;
    createdAt: string;
  }[];
  avgScore: number;
  reviewCount: number;
}

interface GetMatchingListParams {
  page?: number;
  limit?: number;
  sortBy?: 'match_score' | 'created_at';
  dormName?: string;
}

export async function getMatchingList(params: GetMatchingListParams = {}): Promise<MatchingListResponse> {
  const { page = 1, limit = 10, sortBy = 'match_score', dormName } = params;

  let url = `${ENDPOINTS.MATCHING.RECOMMENDATIONS}?page=${page}&limit=${limit}&sort_by=${sortBy}`;
  if (dormName) {
    url += `&dorm_name=${encodeURIComponent(dormName)}`;
  }

  return api.get<MatchingListResponse>(url);
}

export async function getMatchingDetail(userId: number): Promise<MatchingDetailResponse> {
  return api.get<MatchingDetailResponse>(ENDPOINTS.MATCHING.DETAIL(userId));
}

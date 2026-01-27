import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface MatchingUser {
  id: number;
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

export interface MatchingDetailResponse {
  id: number;
  nickname: string;
  studentId: string;
  dormName: string;
  gender: string;
  nationality: string;
  matchRate: number;
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

export async function getMatchingDetail(userId: number): Promise<MatchingDetailResponse> {
  return api.get<MatchingDetailResponse>(ENDPOINTS.MATCHING.DETAIL(userId));
}

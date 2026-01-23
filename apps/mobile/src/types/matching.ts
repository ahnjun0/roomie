import {User} from './user';

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface MatchRecommendation {
  user: User;
  matchScore: number;
  compatibilityDetails: {
    cleanliness: number;
    sleepSchedule: number;
    noise: number;
    overall: number;
  };
}

export interface MatchRequest {
  id: number;
  requesterId: number;
  targetId: number;
  matchScore: number;
  status: MatchStatus;
  createdAt: string;
  respondedAt: string | null;
}

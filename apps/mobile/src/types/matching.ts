export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface MatchRequest {
  id: number;
  requesterId: string;
  targetId: string;
  matchRate: number;
  status: MatchStatus;
  createdAt: string;
  respondedAt: string | null;
}

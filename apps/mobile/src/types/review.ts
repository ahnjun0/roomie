export interface Review {
  id: number;
  reviewerId: string;
  targetId: string;
  content: string;
  score: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  targetId: string;
  content: string;
  score: number;
}

export interface ReviewSummary {
  total: number;
  averageScore: number;
  data: Review[];
}

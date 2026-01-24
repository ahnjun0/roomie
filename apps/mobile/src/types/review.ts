export interface Review {
  id: number;
  reviewerId: number;
  reviewerName: string;
  targetId: number;
  content: string;
  score: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  targetId: number;
  content: string;
  score: number;
}

export interface ReviewSummary {
  avgScore: number;
  reviewCount: number;
  reviews: Review[];
}

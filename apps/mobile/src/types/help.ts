export type HelpCategory = 'BUG' | 'REPAIR';
export type HelpStatus = 'OPEN' | 'SOLVED';

export interface HelpPostAuthor {
  id: string;
  nickname: string;
}

export interface HelpPost {
  id: string;
  authorId: string;
  author: HelpPostAuthor;
  category: HelpCategory;
  title: string;
  content: string;
  images: string[];
  status: HelpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HelpPostListResponse {
  total: number;
  page: number;
  limit: number;
  data: HelpPost[];
}

export interface CreateHelpPostRequest {
  category: HelpCategory;
  title: string;
  content: string;
  images?: string[];
}

export interface UpdateHelpPostStatusRequest {
  status: HelpStatus;
}

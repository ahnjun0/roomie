import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import {
  HelpCategory,
  HelpPost,
  HelpPostListResponse,
  CreateHelpPostRequest,
  HelpStatus,
  UpdateHelpPostStatusRequest,
} from '../types';

export async function getHelpPosts(
  page: number = 1,
  limit: number = 20,
  category?: HelpCategory,
  status?: HelpStatus,
): Promise<HelpPostListResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (category) params.append('category', category);
  if (status) params.append('status', status);

  return api.get<HelpPostListResponse>(`${ENDPOINTS.HELP.LIST}?${params.toString()}`);
}

export async function createHelpPost(data: CreateHelpPostRequest): Promise<HelpPost> {
  return api.post<HelpPost>(ENDPOINTS.HELP.CREATE, data);
}

export async function getHelpPost(id: string): Promise<HelpPost> {
  return api.get<HelpPost>(ENDPOINTS.HELP.GET(id));
}

export async function updateHelpPostStatus(id: string, status: HelpStatus): Promise<HelpPost> {
  const data: UpdateHelpPostStatusRequest = { status };
  return api.patch<HelpPost>(ENDPOINTS.HELP.UPDATE_STATUS(id), data);
}

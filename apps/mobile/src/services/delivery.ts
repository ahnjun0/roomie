import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import {
  DeliveryPost,
  DeliveryPostListResponse,
  CreateDeliveryPostRequest,
} from '../types';

export async function getDeliveryPosts(): Promise<DeliveryPostListResponse> {
  return api.get<DeliveryPostListResponse>(ENDPOINTS.DELIVERY.LIST);
}

export async function createDeliveryPost(
  data: CreateDeliveryPostRequest,
): Promise<DeliveryPost> {
  return api.post<DeliveryPost>(ENDPOINTS.DELIVERY.CREATE, data);
}

export async function getDeliveryPost(id: string): Promise<DeliveryPost> {
  return api.get<DeliveryPost>(ENDPOINTS.DELIVERY.GET(id));
}

export async function joinDeliveryPost(
  id: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>(ENDPOINTS.DELIVERY.JOIN(id));
}

export async function leaveDeliveryPost(
  id: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>(ENDPOINTS.DELIVERY.LEAVE(id));
}

export async function closeDeliveryPost(
  id: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>(ENDPOINTS.DELIVERY.CLOSE(id));
}

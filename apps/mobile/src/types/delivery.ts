export type FoodCategory =
  | 'KOREAN'
  | 'CHINESE'
  | 'JAPANESE'
  | 'WESTERN'
  | 'FASTFOOD'
  | 'CHICKEN'
  | 'PIZZA'
  | 'DESSERT'
  | 'OTHER';

export interface DeliveryAuthor {
  id: string;
  nickname: string | null;
}

export interface DeliveryParticipant {
  id: string;
  nickname: string | null;
}

export interface DeliveryPostListItem {
  id: string;
  title: string;
  foodCategory: string;
  maxParticipants: number;
  isClosed: boolean;
  createdAt: string;
  author: DeliveryAuthor;
  participantCount: number;
}

export interface DeliveryPost {
  id: string;
  title: string;
  content: string;
  foodCategory: string;
  orderLink: string | null;
  bankAccount: string | null;
  maxParticipants: number;
  isClosed: boolean;
  createdAt: string;
  author: DeliveryAuthor;
  participants: DeliveryParticipant[];
}

export interface DeliveryPostListResponse {
  data: DeliveryPostListItem[];
}

export interface CreateDeliveryPostRequest {
  title: string;
  content: string;
  foodCategory: string;
  orderLink?: string;
  bankAccount?: string;
  maxParticipants: number;
}

export interface DeliveryMessage {
  id: string;
  senderId: string;
  senderNickname: string | null;
  content: string;
  createdAt: string;
}

export interface DeliverySystemMessage {
  message: string;
  userId?: string;
}

export type DeliveryWebSocketMessage =
  | { type: 'message'; data: DeliveryMessage }
  | { type: 'system'; data: DeliverySystemMessage };

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import { ChatRoom, ChatMessage } from '../types';

export interface ChatRoomListResponse {
  items: ChatRoom[];
  total: number;
}

export interface MessageListResponse {
  items: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateChatRoomResponse {
  chat_room_id: string;
  is_new: boolean;
}

export async function getChatRooms(): Promise<ChatRoomListResponse> {
  return api.get<ChatRoomListResponse>(ENDPOINTS.CHATS.LIST);
}

export async function createChatRoom(targetUserId: number): Promise<CreateChatRoomResponse> {
  return api.post<CreateChatRoomResponse>(ENDPOINTS.CHATS.CREATE, {
    target_user_id: targetUserId,
  });
}

export async function getMessages(
  chatRoomId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessageListResponse> {
  return api.get<MessageListResponse>(
    `${ENDPOINTS.CHATS.MESSAGES(chatRoomId)}?page=${page}&limit=${limit}`
  );
}

export async function sendMessage(chatRoomId: string, content: string): Promise<ChatMessage> {
  return api.post<ChatMessage>(ENDPOINTS.CHATS.MESSAGES(chatRoomId), { content });
}

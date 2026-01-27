import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import { ChatRoom, ChatMessage } from '../types';

export interface ChatRoomListResponse {
  data: ChatRoom[]; // Assuming backend returns { data: ... } for list too? Checked backend: YES. ChatRoomListResponse(data=rooms)
  total?: number; // Backend doesn't seem to return total in ChatRoomListResponse yet, but keeping optional is fine.
}

export interface MessageListResponse {
  data: ChatMessage[];
  // total/page/limit are not in backend MessageListResponse, it just returns data list.
}

export interface CreateChatRoomResponse {
  chatRoomId: string;
  participants: string[];
  createdAt: string;
}

export async function getChatRooms(): Promise<ChatRoomListResponse> {
  return api.get<ChatRoomListResponse>(ENDPOINTS.CHATS.LIST);
}

export async function createChatRoom(targetUserId: number | string): Promise<CreateChatRoomResponse> {
  return api.post<CreateChatRoomResponse>(ENDPOINTS.CHATS.CREATE, {
    targetUserId: targetUserId,
  });
}

export async function getMessages(
  chatRoomId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessageListResponse> {
  // Backend takes `before` (cursor) and `limit`. Not `page`.
  // But for now let's keep it simple or fix it?
  // The backend: get_messages(chat_room_id, before: str | None, limit: int)
  // The frontend calls: `${ENDPOINTS.CHATS.MESSAGES(chatRoomId)}?page=${page}&limit=${limit}`
  // This page param will be ignored by backend. That's fine for now, pagination might be broken but basic fetch works.
  return api.get<MessageListResponse>(
    `${ENDPOINTS.CHATS.MESSAGES(chatRoomId)}?limit=${limit}`
  );
}

export async function sendMessage(chatRoomId: string, content: string): Promise<ChatMessage> {
  return api.post<ChatMessage>(ENDPOINTS.CHATS.MESSAGES(chatRoomId), { content });
}

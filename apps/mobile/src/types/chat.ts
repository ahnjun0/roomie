export interface ChatRoom {
  id: string;
  otherUserId: number;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: number;
  content: string;
  createdAt: string;
}

export interface CreateChatRoomRequest {
  targetUserId: number;
}

export interface SendMessageRequest {
  content: string;
}

from datetime import datetime

from pydantic import BaseModel


class ChatRoomCreate(BaseModel):
    targetUserId: str


class ChatRoomResponse(BaseModel):
    chatRoomId: str
    participants: list[str]
    createdAt: datetime


class ChatParticipantInfo(BaseModel):
    id: str
    nickname: str | None


class LastMessage(BaseModel):
    content: str
    createdAt: datetime


class ChatRoomListItem(BaseModel):
    chatRoomId: str
    participant: ChatParticipantInfo
    lastMessage: LastMessage | None
    unreadCount: int


class ChatRoomListResponse(BaseModel):
    data: list[ChatRoomListItem]


class MessageResponse(BaseModel):
    id: str
    senderId: str
    content: str
    createdAt: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    data: list[MessageResponse]


class MessageCreate(BaseModel):
    content: str


# WebSocket Message Types
class WSMessage(BaseModel):
    type: str
    data: dict | None = None
    chatRoomId: str | None = None
    content: str | None = None

from datetime import datetime

from pydantic import BaseModel, Field


class DeliveryPostCreate(BaseModel):
    title: str
    content: str
    foodCategory: str
    orderLink: str | None = None
    bankAccount: str | None = None
    maxParticipants: int = Field(..., ge=1)


class DeliveryAuthor(BaseModel):
    id: str
    nickname: str | None


class DeliveryParticipantInfo(BaseModel):
    id: str
    nickname: str | None


class DeliveryPostResponse(BaseModel):
    id: str
    title: str
    content: str
    foodCategory: str
    orderLink: str | None
    bankAccount: str | None
    maxParticipants: int
    isClosed: bool
    createdAt: datetime
    author: DeliveryAuthor
    participants: list[DeliveryParticipantInfo]


class DeliveryPostListItem(BaseModel):
    id: str
    title: str
    foodCategory: str
    maxParticipants: int
    isClosed: bool
    createdAt: datetime
    author: DeliveryAuthor
    participantCount: int


class DeliveryPostListResponse(BaseModel):
    data: list[DeliveryPostListItem]

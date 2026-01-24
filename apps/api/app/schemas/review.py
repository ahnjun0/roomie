from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    targetId: int
    content: str
    score: int = Field(..., ge=1, le=5)


class ReviewResponse(BaseModel):
    id: int
    reviewerId: int
    targetId: int
    content: str
    score: int
    createdAt: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    total: int
    averageScore: float
    data: list[ReviewResponse]

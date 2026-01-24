from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import Nationality


class MatchingUserResponse(BaseModel):
    id: int
    nickname: str | None
    studentId: int
    nationality: Nationality
    matchRate: int
    keywords: list[str]
    isSmoker: bool
    sleepStart: int


class MatchingListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: list[MatchingUserResponse]


class ComparisonItem(BaseModel):
    me: bool | int | str
    target: bool | int | str
    match: bool


class RadarChartData(BaseModel):
    cleanliness: int
    noise: int
    sleep: int
    smoking: int
    temperature: int


class ReviewSummary(BaseModel):
    id: int
    content: str
    score: int
    createdAt: datetime


class MatchingUserDetail(BaseModel):
    id: int
    nickname: str | None
    gender: str
    nationality: Nationality
    studentId: int
    age: int


class MatchingLifestyleDetail(BaseModel):
    dormName: str
    isSmoker: bool
    sleepStart: int
    sleepEnd: int
    sensitivity: int
    sleepHabits: str | None
    cleaningHabit: str | None


class MatchingDetailResponse(BaseModel):
    user: MatchingUserDetail
    lifestyle: MatchingLifestyleDetail | None
    matchRate: int
    comparison: dict[str, ComparisonItem]
    radarChart: dict[str, RadarChartData]
    reviews: list[ReviewSummary]
    averageReviewScore: float

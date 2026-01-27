from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import Nationality


class MatchingUserResponse(BaseModel):
    id: str
    nickname: str | None
    studentId: int
    nationality: Nationality
    dormNames: str  # Added field
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


# 항목별 점수 상세 (5만원 게임 결과)
class ScoreBreakdownItem(BaseModel):
    score: int        # 유사도 점수 (0-100)
    weight: float     # 적용된 가중치
    status: str       # "Perfect", "Good", "Bad" 등


class RadarChartData(BaseModel):
    noise: int       # 소음
    clean: int       # 청결
    food: int        # 실내취식
    light: int       # 소등
    temp: int        # 온도
    time: int        # 취침시간
    habit: int       # 잠버릇


class ReviewSummary(BaseModel):
    id: int
    content: str
    score: int
    createdAt: datetime


class MatchingUserDetail(BaseModel):
    id: str
    nickname: str | None
    gender: str
    nationality: Nationality
    studentId: int
    age: int


class MatchingLifestyleDetail(BaseModel):
    dormNames: str
    isSmoker: bool
    sleepStart: int
    sleepEnd: int
    sleepHabits: str | None
    noiseLevel: int
    cleanLevel: int
    foodLevel: int
    lightLevel: int
    tempLevel: int
    homeVisit: str | None


class MatchingDetailResponse(BaseModel):
    user: MatchingUserDetail
    lifestyle: MatchingLifestyleDetail | None
    matchRate: int
    comparison: dict[str, ComparisonItem]
    radarChart: dict[str, RadarChartData]
    scoreBreakdown: dict[str, ScoreBreakdownItem]  # 항목별 점수 상세
    reviews: list[ReviewSummary]
    reviewCount: int  # Added field
    averageReviewScore: float

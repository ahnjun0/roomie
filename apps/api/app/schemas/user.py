from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class Nationality(str, Enum):
    KOREAN = "KOREAN"
    FOREIGNER = "FOREIGNER"


# ============== Auth ==============

class EmailSendRequest(BaseModel):
    email: EmailStr


class EmailSendResponse(BaseModel):
    message: str
    expiresIn: int = 300


class EmailVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class EmailVerifyResponse(BaseModel):
    verified: bool
    tempToken: str


class RegisterRequest(BaseModel):
    tempToken: str
    email: EmailStr
    password: str
    nickname: str | None = None
    gender: Gender
    nationality: Nationality
    age: int = Field(..., ge=1, le=100)
    studentId: int = Field(..., ge=20, le=30)  # 학번 20~30


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    id: str
    email: str
    nickname: str | None
    accessToken: str
    refreshToken: str


class TokenRefreshRequest(BaseModel):
    refreshToken: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str


# ============== User ==============

class UserBase(BaseModel):
    id: str
    email: str
    nickname: str | None
    gender: Gender
    nationality: Nationality
    age: int
    studentId: int
    createdAt: datetime

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    lifestyle: "LifestyleResponse | None" = None
    preference: "PreferenceResponse | None" = None


class UserProfileUpdate(BaseModel):
    nickname: str | None = None
    age: int | None = Field(None, ge=1, le=100)


# ============== Lifestyle ==============

class LifestyleUpdate(BaseModel):
    # 기숙사 (복수 선택 가능)
    dormNames: str  # "성실관,봉사관" 쉼표 구분

    isSmoker: bool

    # 수면 관련
    sleepStart: int = Field(..., ge=0, le=30)
    sleepEnd: int = Field(..., ge=0, le=30)
    sleepHabits: str | None = None  # "SNORING,GRINDING,TALKING,TOSSING,NONE"

    # 생활 스타일 (1~5점)
    noiseLevel: int = Field(3, ge=1, le=5)   # 소음 민감도
    cleanLevel: int = Field(3, ge=1, le=5)   # 청결도
    foodLevel: int = Field(3, ge=1, le=5)    # 실내취식
    lightLevel: int = Field(3, ge=1, le=5)   # 소등
    tempLevel: int = Field(3, ge=1, le=5)    # 온도

    # 기타
    homeVisit: str | None = None  # "WEEKLY", "BI_WEEKLY", "MONTHLY", "RARELY"


class LifestyleResponse(BaseModel):
    id: int
    userId: str
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

    class Config:
        from_attributes = True


# ============== Preference ==============

class PreferenceUpdate(BaseModel):
    # 기본 선호 (Screen 6)
    prefNationality: Nationality | None = None
    prefStudentId: str | None = None  # "SAME", "SENIOR", "JUNIOR", "ANY"

    # 5만원 게임 가중치 (Screen 8)
    # 값 = 베팅액 / 1000 (예: 10000원 → 10, 50000원 → 50, 0원 → 0)
    weightNoise: int = Field(0, ge=0, le=50)   # 소음
    weightClean: int = Field(0, ge=0, le=50)   # 청결
    weightFood: int = Field(0, ge=0, le=50)    # 실내취식
    weightHabit: int = Field(0, ge=0, le=50)   # 잠버릇
    weightTime: int = Field(0, ge=0, le=50)    # 취침시간
    weightLight: int = Field(0, ge=0, le=50)   # 소등
    weightTemp: int = Field(0, ge=0, le=50)    # 온도


class PreferenceResponse(BaseModel):
    id: int
    userId: str
    prefNationality: Nationality | None
    prefStudentId: str | None
    weightNoise: int
    weightClean: int
    weightFood: int
    weightHabit: int
    weightTime: int
    weightLight: int
    weightTemp: int

    class Config:
        from_attributes = True


# Forward reference 해결
UserResponse.model_rebuild()

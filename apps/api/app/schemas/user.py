from datetime import datetime
from enum import Enum
from typing import Self

from pydantic import BaseModel, EmailStr, Field, computed_field, model_validator


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class Nationality(str, Enum):
    KOREAN = "KOREAN"
    FOREIGNER = "FOREIGNER"


class MatchingStatus(str, Enum):
    SEARCHING = "SEARCHING"
    MATCHED = "MATCHED"


# ============== Auth ==============

class EmailSendRequest(BaseModel):
    email: EmailStr


class EmailSendResponse(BaseModel):
    message: str
    expiresIn: int = 300
    userExists: bool = False


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


class ResetPasswordRequest(BaseModel):
    tempToken: str
    email: EmailStr
    newPassword: str


class ResetPasswordResponse(BaseModel):
    message: str


# ============== User ==============

class UserBase(BaseModel):
    id: str
    email: str
    nickname: str | None
    gender: Gender
    nationality: Nationality
    age: int
    studentId: int
    schoolId: int | None = None
    matchingStatus: MatchingStatus
    createdAt: datetime

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    lifestyle: "LifestyleResponse | None" = None
    preference: "PreferenceResponse | None" = None

    @computed_field
    @property
    def isProfileComplete(self) -> bool:
        """lifestyle과 preference가 모두 존재하면 프로필 완성"""
        return self.lifestyle is not None and self.preference is not None


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
    tempLevel: int
    homeVisit: str | None

    class Config:
        from_attributes = True


# ============== Preference ==============

# Step 2: 상대방 선호 조건 (필터링용)
class PreferenceFiltersUpdate(BaseModel):
    """
    상대방에게 바라는 조건 (Step 2: 상대 조건 입력)

    - prefNationality: 선호하는 국적 (null이면 무관)
    - prefStudentId: 선호하는 학번 관계
    """
    prefNationality: Nationality | None = None  # 선호 국적 (null이면 무관)
    prefStudentId: str | None = None  # "SAME", "SENIOR", "JUNIOR", "ANY"


# Step 3: 7만원 게임 가중치 (매칭 알고리즘용)
class PreferenceWeightsUpdate(BaseModel):
    """
    7만원 게임 가중치 (Step 3: 중요도 베팅)

    각 항목에 베팅할 금액을 입력합니다.
    값 = 베팅액 / 1000 (예: 10000원 → 10)
    총합은 반드시 60이어야 합니다. (6만원 = 60)
    """
    weightNoise: int = Field(0, ge=0, le=60, description="소음 민감도")
    weightClean: int = Field(0, ge=0, le=60, description="청결도")
    weightFood: int = Field(0, ge=0, le=60, description="실내취식")
    weightHabit: int = Field(0, ge=0, le=60, description="잠버릇")
    weightTime: int = Field(0, ge=0, le=60, description="취침시간")
    weightTemp: int = Field(0, ge=0, le=60, description="온도")

    @model_validator(mode="after")
    def validate_total_weight(self) -> Self:
        """가중치 총합이 60인지 검증"""
        total = (
            self.weightNoise
            + self.weightClean
            + self.weightFood
            + self.weightHabit
            + self.weightTime
            + self.weightTemp
        )
        if total != 60:
            raise ValueError(f"가중치 총합은 60이어야 합니다. (현재: {total})")
        return self


# 기존 통합 스키마 (하위 호환성 유지, deprecated)
class PreferenceUpdate(BaseModel):
    """
    [Deprecated] 기존 통합 스키마

    새로운 API는 PreferenceFiltersUpdate와 PreferenceWeightsUpdate를 사용해주세요.
    """
    # 기본 선호 (Screen 6)
    prefNationality: Nationality | None = None
    prefStudentId: str | None = None  # "SAME", "SENIOR", "JUNIOR", "ANY"

    # 7만원 게임 가중치 (Screen 8)
    # 값 = 베팅액 / 1000 (예: 10000원 → 10, 60000원 → 60, 0원 → 0)
    weightNoise: int = Field(0, ge=0, le=60)   # 소음
    weightClean: int = Field(0, ge=0, le=60)   # 청결
    weightFood: int = Field(0, ge=0, le=60)    # 실내취식
    weightHabit: int = Field(0, ge=0, le=60)   # 잠버릇
    weightTime: int = Field(0, ge=0, le=60)    # 취침시간
    weightTemp: int = Field(0, ge=0, le=60)    # 온도


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
    weightTemp: int

    class Config:
        from_attributes = True


# Forward reference 해결
UserResponse.model_rebuild()

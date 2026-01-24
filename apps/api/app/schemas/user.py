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
    id: int
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
    id: int
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
    dormName: str
    isSmoker: bool
    sleepStart: int = Field(..., ge=0, le=30)
    sleepEnd: int = Field(..., ge=0, le=30)
    sensitivity: int = Field(..., ge=1, le=5)
    sleepHabits: str | None = None  # "SNORING,GRINDING,TALKING,TOSSING,NONE"
    cleaningHabit: str | None = None  # "DAILY,WEEKLY,WHEN_DIRTY,NEVER"


class LifestyleResponse(BaseModel):
    id: int
    userId: int
    dormName: str
    isSmoker: bool
    sleepStart: int
    sleepEnd: int
    sensitivity: int
    sleepHabits: str | None
    cleaningHabit: str | None

    class Config:
        from_attributes = True


# ============== Preference ==============

class PreferenceUpdate(BaseModel):
    prefNationality: Nationality | None = None
    prefStudentId: str | None = None  # "SAME", "SENIOR", "JUNIOR", "ANY"
    weightCleanliness: float = Field(1.0, ge=0.0, le=3.0)
    weightNoise: float = Field(1.0, ge=0.0, le=3.0)
    weightSmoking: float = Field(1.0, ge=0.0, le=3.0)
    weightSleep: float = Field(1.0, ge=0.0, le=3.0)


class PreferenceResponse(BaseModel):
    id: int
    userId: int
    prefNationality: Nationality | None
    prefStudentId: str | None
    weightCleanliness: float
    weightNoise: float
    weightSmoking: float
    weightSleep: float

    class Config:
        from_attributes = True


# Forward reference 해결
UserResponse.model_rebuild()

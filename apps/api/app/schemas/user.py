from pydantic import BaseModel, EmailStr

from app.models.user import Gender


class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    name: str | None = None
    gender: Gender | None = None
    nationality: str | None = None
    birth_year: int | None = None
    student_id: str | None = None
    persona: str | None = None


class UserResponse(UserBase):
    id: int
    gender: Gender | None = None
    nationality: str | None = None
    birth_year: int | None = None
    student_id: str | None = None
    persona: str | None = None
    is_email_verified: bool
    is_profile_complete: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

from datetime import datetime
from enum import Enum

from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class User(Base):
    """사용자 모델"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    # 기본 정보
    name: Mapped[str | None] = mapped_column(String(100))
    gender: Mapped[Gender | None] = mapped_column(SQLEnum(Gender))
    nationality: Mapped[str | None] = mapped_column(String(100))
    birth_year: Mapped[int | None] = mapped_column(Integer)
    student_id: Mapped[str | None] = mapped_column(String(20))  # 학번

    # 페르소나
    persona: Mapped[str | None] = mapped_column(String(50))  # 동물 페르소나

    # 인증 상태
    is_email_verified: Mapped[bool] = mapped_column(default=False)
    is_profile_complete: Mapped[bool] = mapped_column(default=False)

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    lifestyle: Mapped["UserLifestyle"] = relationship(back_populates="user")
    preference: Mapped["UserPreference"] = relationship(back_populates="user")

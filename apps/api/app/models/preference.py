from sqlalchemy import Integer, Boolean, String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserPreference(Base):
    """상대방 희망 조건 및 가중치"""

    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # 희망 상대 조건
    preferred_nationality: Mapped[str | None] = mapped_column(String(100))
    preferred_student_year: Mapped[str | None] = mapped_column(String(20))  # 학년대

    # 희망 생활 패턴
    max_noise_level: Mapped[int | None] = mapped_column(Integer)  # 1-5
    min_cleanliness: Mapped[int | None] = mapped_column(Integer)  # 1-5
    allows_indoor_eating: Mapped[bool | None] = mapped_column(Boolean)
    allows_smoking: Mapped[bool | None] = mapped_column(Boolean)

    # 가중치 설정 (5만원 게임) - JSON으로 저장
    # {"cleanliness": 30000, "noise": 10000, "sleep_time": 10000}
    weights: Mapped[dict | None] = mapped_column(JSON, default=dict)

    # 선택한 기숙사 목록
    preferred_dormitory_ids: Mapped[list | None] = mapped_column(JSON, default=list)

    # Relationship
    user: Mapped["User"] = relationship(back_populates="preference")

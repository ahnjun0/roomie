from sqlalchemy import Integer, Boolean, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserLifestyle(Base):
    """사용자 생활 패턴 (체크리스트)"""

    __tablename__ = "user_lifestyles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # T/F 항목
    is_smoker: Mapped[bool | None] = mapped_column(Boolean)
    snores: Mapped[bool | None] = mapped_column(Boolean)
    grinds_teeth: Mapped[bool | None] = mapped_column(Boolean)  # 이갈이

    # 범위/선택 항목 (1-5 스케일 또는 특정 값)
    sleep_time: Mapped[str | None] = mapped_column(String(20))  # "22-24", "00-02" 등
    wake_time: Mapped[str | None] = mapped_column(String(20))
    home_visit_frequency: Mapped[int | None] = mapped_column(Integer)  # 월 n회
    light_sensitivity: Mapped[int | None] = mapped_column(Integer)  # 1-5 잠귀 예민도
    noise_sensitivity: Mapped[int | None] = mapped_column(Integer)  # 1-5

    # 생활 습관
    cleanliness: Mapped[int | None] = mapped_column(Integer)  # 1-5 청결도
    indoor_eating: Mapped[bool | None] = mapped_column(Boolean)  # 실내 음식 섭취
    preferred_temperature: Mapped[int | None] = mapped_column(Integer)  # 선호 온도

    # Relationship
    user: Mapped["User"] = relationship(back_populates="lifestyle")

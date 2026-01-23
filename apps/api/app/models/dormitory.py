from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Dormitory(Base):
    """기숙사 모델"""

    __tablename__ = "dormitories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    location: Mapped[str | None] = mapped_column(String(200))

    # 성별 제한
    allows_male: Mapped[bool] = mapped_column(Boolean, default=True)
    allows_female: Mapped[bool] = mapped_column(Boolean, default=True)

    # 수용 정보
    capacity: Mapped[int | None] = mapped_column(Integer)
    room_type: Mapped[str | None] = mapped_column(String(50))  # 2인실, 4인실 등

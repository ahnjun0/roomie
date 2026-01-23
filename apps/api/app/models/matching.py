from datetime import datetime
from enum import Enum

from sqlalchemy import Integer, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MatchStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class MatchRequest(Base):
    """매칭 요청"""

    __tablename__ = "match_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    target_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # 매칭 점수
    match_score: Mapped[float | None] = mapped_column(Float)

    # 상태
    status: Mapped[MatchStatus] = mapped_column(
        SQLEnum(MatchStatus), default=MatchStatus.PENDING
    )

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime)

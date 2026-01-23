from pydantic import BaseModel, Field, field_validator


class PreferenceUpdate(BaseModel):
    """희망 조건 업데이트 스키마"""

    preferred_nationality: str | None = None
    preferred_student_year: str | None = None

    max_noise_level: int | None = Field(None, ge=1, le=5)
    min_cleanliness: int | None = Field(None, ge=1, le=5)
    allows_indoor_eating: bool | None = None
    allows_smoking: bool | None = None

    preferred_dormitory_ids: list[int] | None = None


class WeightsUpdate(BaseModel):
    """가중치 설정 (5만원 게임) 스키마"""

    weights: dict[str, int]

    @field_validator("weights")
    @classmethod
    def validate_total(cls, v: dict[str, int]) -> dict[str, int]:
        total = sum(v.values())
        if total != 50000:
            raise ValueError(f"가중치 총합은 50000원이어야 합니다. 현재: {total}원")
        if any(value < 0 for value in v.values()):
            raise ValueError("가중치는 0 이상이어야 합니다.")
        return v


class PreferenceResponse(PreferenceUpdate):
    id: int
    user_id: int
    weights: dict[str, int] | None = None

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field


class LifestyleUpdate(BaseModel):
    """생활 패턴 업데이트 스키마"""

    # T/F 항목
    is_smoker: bool | None = None
    snores: bool | None = None
    grinds_teeth: bool | None = None

    # 범위/선택 항목
    sleep_time: str | None = None
    wake_time: str | None = None
    home_visit_frequency: int | None = Field(None, ge=0, le=30)
    light_sensitivity: int | None = Field(None, ge=1, le=5)
    noise_sensitivity: int | None = Field(None, ge=1, le=5)

    # 생활 습관
    cleanliness: int | None = Field(None, ge=1, le=5)
    indoor_eating: bool | None = None
    preferred_temperature: int | None = Field(None, ge=16, le=30)


class LifestyleResponse(LifestyleUpdate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

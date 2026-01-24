from pydantic import BaseModel

from app.schemas.user import Gender


class DormitoryResponse(BaseModel):
    id: int
    name: str
    gender: Gender
    capacity: int | None

    class Config:
        from_attributes = True


class DormitoryListResponse(BaseModel):
    data: list[DormitoryResponse]

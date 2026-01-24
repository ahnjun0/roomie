from fastapi import APIRouter, Depends
from prisma import Prisma

from app.core.database import get_db
from app.schemas.dormitory import DormitoryListResponse, DormitoryResponse

router = APIRouter()


@router.get("", response_model=DormitoryListResponse)
async def get_dormitories(
    gender: str | None = None,
    db: Prisma = Depends(get_db),
):
    """기숙사 목록 조회"""
    where_clause = {}
    if gender:
        where_clause["gender"] = gender

    dormitories = await db.dormitory.find_many(where=where_clause if where_clause else None)

    return DormitoryListResponse(
        data=[
            DormitoryResponse(
                id=d.id,
                name=d.name,
                gender=d.gender,
                capacity=d.capacity,
            )
            for d in dormitories
        ]
    )

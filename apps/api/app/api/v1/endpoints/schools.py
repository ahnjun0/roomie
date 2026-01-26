"""
학교 및 기숙사 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter()


# ============== Schemas ==============

class SchoolResponse(BaseModel):
    id: int
    name: str
    domain: str | None

    class Config:
        from_attributes = True


class DormResponse(BaseModel):
    id: int
    name: str
    gender: str
    roomType: str | None
    capacity: int | None

    class Config:
        from_attributes = True


class SchoolWithDormsResponse(BaseModel):
    id: int
    name: str
    domain: str | None
    dorms: list[DormResponse]


# ============== Endpoints ==============

@router.get("", response_model=list[SchoolResponse])
async def get_schools(
    db: Prisma = Depends(get_db),
):
    """
    모든 학교 목록 조회
    """
    schools = await db.school.find_many(
        order={"name": "asc"}
    )
    return schools


@router.get("/{school_id}", response_model=SchoolWithDormsResponse)
async def get_school(
    school_id: int,
    db: Prisma = Depends(get_db),
):
    """
    특정 학교 상세 정보 (기숙사 포함)
    """
    school = await db.school.find_unique(
        where={"id": school_id},
        include={"dorms": True}
    )

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "SCHOOL_NOT_FOUND", "message": "학교를 찾을 수 없습니다."}
        )

    return school


@router.get("/{school_id}/dorms", response_model=list[DormResponse])
async def get_school_dorms(
    school_id: int,
    gender: str | None = None,
    db: Prisma = Depends(get_db),
):
    """
    특정 학교의 기숙사 목록 조회

    - gender: 성별 필터 (MALE, FEMALE)
    """
    # 학교 존재 확인
    school = await db.school.find_unique(where={"id": school_id})
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "SCHOOL_NOT_FOUND", "message": "학교를 찾을 수 없습니다."}
        )

    # 기숙사 조회
    where_clause = {"schoolId": school_id}
    if gender:
        where_clause["gender"] = gender

    dorms = await db.dorm.find_many(
        where=where_clause,
        order={"name": "asc"}
    )

    return dorms


@router.get("/by-domain/{domain}")
async def get_school_by_domain(
    domain: str,
    db: Prisma = Depends(get_db),
):
    """
    이메일 도메인으로 학교 조회

    예: kaist.ac.kr → KAIST
    """
    school = await db.school.find_first(
        where={"domain": domain}
    )

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "SCHOOL_NOT_FOUND", "message": "해당 도메인의 학교를 찾을 수 없습니다."}
        )

    return SchoolResponse(
        id=school.id,
        name=school.name,
        domain=school.domain
    )

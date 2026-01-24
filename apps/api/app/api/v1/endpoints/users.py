from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import (
    LifestyleResponse,
    LifestyleUpdate,
    PreferenceResponse,
    PreferenceUpdate,
    UserProfileUpdate,
    UserResponse,
)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """내 프로필 조회"""
    user = await db.user.find_unique(
        where={"id": current_user.id},
        include={"lifestyle": True, "preference": True},
    )
    return user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    request: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """프로필 수정"""
    update_data = request.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "VALIDATION_ERROR", "message": "수정할 데이터가 없습니다."},
        )

    user = await db.user.update(
        where={"id": current_user.id},
        data=update_data,
        include={"lifestyle": True, "preference": True},
    )
    return user


@router.get("/me/lifestyle", response_model=LifestyleResponse)
async def get_lifestyle(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """생활 패턴 조회"""
    lifestyle = await db.userlifestyle.find_unique(where={"userId": current_user.id})

    if not lifestyle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "생활 패턴 정보가 없습니다."},
        )

    return lifestyle


@router.put("/me/lifestyle", response_model=LifestyleResponse)
async def update_lifestyle(
    request: LifestyleUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """생활 패턴 등록/수정"""
    data = request.model_dump()

    # upsert: 있으면 update, 없으면 create
    lifestyle = await db.userlifestyle.upsert(
        where={"userId": current_user.id},
        data={
            "create": {"userId": current_user.id, **data},
            "update": data,
        },
    )

    return lifestyle


@router.get("/me/preference", response_model=PreferenceResponse)
async def get_preference(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """선호 조건 조회"""
    preference = await db.userpreference.find_unique(where={"userId": current_user.id})

    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "선호 조건 정보가 없습니다."},
        )

    return preference


@router.put("/me/preference", response_model=PreferenceResponse)
async def update_preference(
    request: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """선호 조건 등록/수정"""
    data = request.model_dump(exclude_unset=True)

    # Enum을 문자열로 변환
    if "prefNationality" in data and data["prefNationality"]:
        data["prefNationality"] = data["prefNationality"].value

    # upsert: 있으면 update, 없으면 create
    preference = await db.userpreference.upsert(
        where={"userId": current_user.id},
        data={
            "create": {"userId": current_user.id, **data},
            "update": data,
        },
    )

    return preference


@router.get("/me/reviews/written")
async def get_written_reviews(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """내가 작성한 리뷰 조회"""
    reviews = await db.review.find_many(
        where={"reviewerId": current_user.id},
        order={"createdAt": "desc"},
    )
    return {"data": reviews}


@router.get("/me/reviews/received")
async def get_received_reviews(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """내가 받은 리뷰 조회"""
    reviews = await db.review.find_many(
        where={"targetId": current_user.id},
        order={"createdAt": "desc"},
    )

    # 평균 점수 계산
    avg_score = 0.0
    if reviews:
        avg_score = sum(r.score for r in reviews) / len(reviews)

    return {"total": len(reviews), "averageScore": round(avg_score, 1), "data": reviews}


@router.get("/{user_id}/reviews")
async def get_user_reviews(
    user_id: int,
    page: int = 1,
    limit: int = 20,
    db: Prisma = Depends(get_db),
):
    """특정 사용자의 리뷰 조회"""
    # 사용자 존재 확인
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "사용자를 찾을 수 없습니다."},
        )

    # 리뷰 조회
    skip = (page - 1) * limit
    reviews = await db.review.find_many(
        where={"targetId": user_id},
        order={"createdAt": "desc"},
        skip=skip,
        take=limit,
    )

    # 전체 개수
    total = await db.review.count(where={"targetId": user_id})

    # 평균 점수
    all_reviews = await db.review.find_many(where={"targetId": user_id})
    avg_score = 0.0
    if all_reviews:
        avg_score = sum(r.score for r in all_reviews) / len(all_reviews)

    return {
        "total": total,
        "averageScore": round(avg_score, 1),
        "data": reviews,
    }

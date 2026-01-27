from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    request: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """리뷰 작성"""
    # 자기 자신에게 리뷰 작성 불가
    if request.targetId == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_TARGET", "message": "자신에게 리뷰를 작성할 수 없습니다."},
        )

    # 대상 사용자 존재 확인
    target_user = await db.user.find_unique(where={"id": request.targetId})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "대상 사용자를 찾을 수 없습니다."},
        )

    user_ids = sorted([current_user.id, request.targetId])
    signed_contract = await db.roommatecontract.find_first(
        where={
            "status": "SIGNED",
            "OR": [
                {"userAId": user_ids[0], "userBId": user_ids[1]},
                {"userAId": user_ids[1], "userBId": user_ids[0]},
            ],
        }
    )
    match_history = await db.matchhistory.find_first(
        where={"userAId": user_ids[0], "userBId": user_ids[1]}
    )

    if not signed_contract and not match_history:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "NOT_ELIGIBLE",
                "message": "이전 룸메이트만 리뷰를 작성할 수 있습니다.",
            },
        )

    # 리뷰 생성
    review = await db.review.create(
        data={
            "reviewerId": current_user.id,
            "targetId": request.targetId,
            "content": request.content,
            "score": request.score,
        }
    )

    return review

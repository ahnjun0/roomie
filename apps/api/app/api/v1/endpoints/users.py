from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import (
    LifestyleResponse,
    LifestyleUpdate,
    PreferenceFiltersUpdate,
    PreferenceWeightsUpdate,
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

    # 기숙사 성별 검증 (사용자 성별과 일치하는 기숙사만 선택 가능)
    if data.get("dormNames"):
        dorm_names = [d.strip() for d in data["dormNames"].split(",")]

        for dorm_name in dorm_names:
            # DB에서 기숙사 조회
            dorm = await db.dorm.find_first(where={"name": dorm_name})

            if dorm and dorm.gender != current_user.gender:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": "INVALID_DORM_GENDER",
                        "message": f"'{dorm_name}'은(는) {dorm.gender} 전용 기숙사입니다. 본인 성별에 맞는 기숙사를 선택해주세요."
                    },
                )

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
    """선호 조건 조회 (필터 + 가중치 전체)"""
    preference = await db.userpreference.find_unique(where={"userId": current_user.id})

    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "선호 조건 정보가 없습니다."},
        )

    return preference


@router.put("/me/preference/filters", response_model=PreferenceResponse)
async def update_preference_filters(
    request: PreferenceFiltersUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    [Step 2] 상대방 선호 조건 등록/수정

    상대방에게 바라는 조건을 설정합니다.
    - prefNationality: 선호하는 국적 (null이면 무관)
    - prefStudentId: 선호하는 학번 관계 (SAME, SENIOR, JUNIOR, ANY)
    """
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


@router.put("/me/preference/weights", response_model=PreferenceResponse)
async def update_preference_weights(
    request: PreferenceWeightsUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    [Step 3] 5만원 게임 가중치 등록/수정

    각 항목의 중요도를 베팅합니다.
    가중치 총합은 반드시 50이어야 합니다. (5만원 = 50)

    - weightNoise: 소음 민감도
    - weightClean: 청결도
    - weightFood: 실내취식
    - weightHabit: 잠버릇
    - weightTime: 취침시간
    - weightTemp: 온도
    """
    data = request.model_dump()

    # upsert: 있으면 update, 없으면 create
    preference = await db.userpreference.upsert(
        where={"userId": current_user.id},
        data={
            "create": {"userId": current_user.id, **data},
            "update": data,
        },
    )

    return preference


@router.put("/me/preference", response_model=PreferenceResponse, deprecated=True)
async def update_preference(
    request: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    [Deprecated] 선호 조건 통합 등록/수정

    이 API는 하위 호환성을 위해 유지됩니다.
    새로운 클라이언트는 아래 API를 사용해주세요:
    - PUT /users/me/preference/filters (Step 2: 상대 조건)
    - PUT /users/me/preference/weights (Step 3: 중요도 베팅)
    """
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
    """
    내가 받은 리뷰 통계 조회 (내용은 비공개)

    본인은 자신에 대한 리뷰 내용을 볼 수 없습니다.
    총 개수와 평균 점수만 확인 가능합니다.
    """
    reviews = await db.review.find_many(
        where={"targetId": current_user.id},
    )

    # 평균 점수 계산
    avg_score = 0.0
    if reviews:
        avg_score = sum(r.score for r in reviews) / len(reviews)

    # 리뷰 내용은 공개하지 않음 (본인 보호)
    return {
        "total": len(reviews),
        "averageScore": round(avg_score, 1),
        "message": "본인에 대한 리뷰 내용은 열람할 수 없습니다."
    }


@router.get("/{user_id}/reviews")
async def get_user_reviews(
    user_id: str,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    특정 사용자의 리뷰 조회

    본인에 대한 리뷰는 조회할 수 없습니다.
    다른 사용자의 리뷰만 열람 가능합니다.
    """
    # 본인 리뷰 조회 차단
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "FORBIDDEN",
                "message": "본인에 대한 리뷰는 열람할 수 없습니다."
            },
        )

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
        include={"reviewer": True},  # 리뷰 작성자 정보 포함
    )

    # 전체 개수
    total = await db.review.count(where={"targetId": user_id})

    # 평균 점수
    all_reviews = await db.review.find_many(where={"targetId": user_id})
    avg_score = 0.0
    if all_reviews:
        avg_score = sum(r.score for r in all_reviews) / len(all_reviews)

    # 리뷰 데이터 가공 (작성자 익명 처리 옵션)
    review_data = []
    for r in reviews:
        review_data.append({
            "id": r.id,
            "content": r.content,
            "score": r.score,
            "createdAt": r.createdAt,
            "reviewer": {
                "id": r.reviewer.id if r.reviewer else None,
                "nickname": r.reviewer.nickname if r.reviewer else "익명",
            } if r.reviewer else None
        })

    return {
        "total": total,
        "averageScore": round(avg_score, 1),
        "page": page,
        "limit": limit,
        "data": review_data,
    }


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    회원 탈퇴 (계정 삭제)

    사용자의 모든 데이터(프로필, 생활패턴, 선호조건, 리뷰, 채팅, 매칭 등)를 삭제합니다.
    """
    # 트랜잭션으로 모든 연관 데이터 삭제
    async with db.tx() as tx:
        # 1. 1:1 관계 데이터 삭제 (Lifestyle, Preference)
        await tx.userlifestyle.delete_many(where={"userId": current_user.id})
        await tx.userpreference.delete_many(where={"userId": current_user.id})

        # 2. 매칭 결과 삭제 (나와 관련된 모든 매칭)
        await tx.matchresult.delete_many(
            where={
                "OR": [
                    {"userId": current_user.id},
                    {"targetUserId": current_user.id},
                ]
            }
        )

        # 3. 리뷰 삭제 (내가 쓴 것, 내가 받은 것)
        await tx.review.delete_many(
            where={
                "OR": [
                    {"reviewerId": current_user.id},
                    {"targetId": current_user.id},
                ]
            }
        )

        # 4. 헬프 게시글 삭제
        await tx.helppost.delete_many(where={"authorId": current_user.id})

        # 5. 룸메이트 계약서 삭제
        await tx.roommatecontract.delete_many(
            where={
                "OR": [
                    {"userAId": current_user.id},
                    {"userBId": current_user.id},
                ]
            }
        )

        # 6. 채팅 메시지 삭제 (내가 보낸 메시지)
        await tx.chatmessage.delete_many(where={"senderId": current_user.id})

        # 7. 채팅 참여 내역 삭제
        await tx.chatparticipant.delete_many(where={"userId": current_user.id})

        # 8. 사용자 본체 삭제
        await tx.user.delete(where={"id": current_user.id})

    return None

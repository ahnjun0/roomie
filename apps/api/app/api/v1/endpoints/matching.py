from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.matching import (
    ComparisonItem,
    MatchingDetailResponse,
    MatchingLifestyleDetail,
    MatchingListResponse,
    MatchingUserDetail,
    MatchingUserResponse,
    RadarChartData,
    ReviewSummary,
)
from app.services.matching import calculate_match_score, generate_keywords

router = APIRouter()


@router.get("", response_model=MatchingListResponse)
async def get_matching_list(
    dormName: str,
    page: int = 1,
    limit: int = 20,
    sortBy: str = "matchRate",
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """매칭 리스트 조회"""
    # 내 정보 조회
    my_lifestyle = await db.userlifestyle.find_unique(where={"userId": current_user.id})
    my_preference = await db.userpreference.find_unique(where={"userId": current_user.id})

    # 같은 기숙사, 같은 성별의 후보자 조회 (자신 제외)
    candidates = await db.user.find_many(
        where={
            "id": {"not": current_user.id},
            "gender": current_user.gender,
            "lifestyle": {"dormName": dormName},
        },
        include={"lifestyle": True},
    )

    # 매칭 점수 계산
    results = []
    my_lifestyle_dict = my_lifestyle.model_dump() if my_lifestyle else None
    my_preference_dict = my_preference.model_dump() if my_preference else None

    for candidate in candidates:
        if not candidate.lifestyle:
            continue

        target_lifestyle_dict = candidate.lifestyle.model_dump()
        target_user_dict = {
            "nationality": candidate.nationality,
            "studentId": candidate.studentId,
        }

        match_rate = calculate_match_score(
            my_lifestyle_dict,
            my_preference_dict,
            target_lifestyle_dict,
            target_user_dict,
        )

        keywords = generate_keywords(target_lifestyle_dict, target_user_dict)

        results.append(
            MatchingUserResponse(
                id=candidate.id,
                nickname=candidate.nickname,
                studentId=candidate.studentId,
                nationality=candidate.nationality,
                matchRate=match_rate,
                keywords=keywords,
                isSmoker=candidate.lifestyle.isSmoker,
                sleepStart=candidate.lifestyle.sleepStart,
            )
        )

    # 정렬
    if sortBy == "matchRate":
        results.sort(key=lambda x: x.matchRate, reverse=True)
    elif sortBy == "createdAt":
        pass  # 기본 순서 유지

    # 페이지네이션
    total = len(results)
    start = (page - 1) * limit
    end = start + limit
    paginated = results[start:end]

    return MatchingListResponse(
        total=total,
        page=page,
        limit=limit,
        data=paginated,
    )


@router.get("/{user_id}", response_model=MatchingDetailResponse)
async def get_matching_detail(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """매칭 상세 조회"""
    # 대상 사용자 조회
    target_user = await db.user.find_unique(
        where={"id": user_id},
        include={"lifestyle": True, "receivedReviews": True},
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "사용자를 찾을 수 없습니다."},
        )

    # 내 정보 조회
    my_lifestyle = await db.userlifestyle.find_unique(where={"userId": current_user.id})
    my_preference = await db.userpreference.find_unique(where={"userId": current_user.id})

    # 매칭 점수 계산
    my_lifestyle_dict = my_lifestyle.model_dump() if my_lifestyle else {}
    my_preference_dict = my_preference.model_dump() if my_preference else {}
    target_lifestyle_dict = target_user.lifestyle.model_dump() if target_user.lifestyle else {}

    match_rate = calculate_match_score(
        my_lifestyle_dict,
        my_preference_dict,
        target_lifestyle_dict,
        {"nationality": target_user.nationality, "studentId": target_user.studentId},
    )

    # 비교 데이터 생성
    comparison = {}
    if my_lifestyle and target_user.lifestyle:
        comparison["smoking"] = ComparisonItem(
            me=my_lifestyle.isSmoker,
            target=target_user.lifestyle.isSmoker,
            match=my_lifestyle.isSmoker == target_user.lifestyle.isSmoker,
        )
        comparison["sleepTime"] = ComparisonItem(
            me=my_lifestyle.sleepStart,
            target=target_user.lifestyle.sleepStart,
            match=abs(my_lifestyle.sleepStart - target_user.lifestyle.sleepStart) <= 1,
        )
        comparison["sensitivity"] = ComparisonItem(
            me=my_lifestyle.sensitivity,
            target=target_user.lifestyle.sensitivity,
            match=abs(my_lifestyle.sensitivity - target_user.lifestyle.sensitivity) <= 1,
        )
        comparison["cleaning"] = ComparisonItem(
            me=my_lifestyle.cleaningHabit or "WEEKLY",
            target=target_user.lifestyle.cleaningHabit or "WEEKLY",
            match=my_lifestyle.cleaningHabit == target_user.lifestyle.cleaningHabit,
        )

    # 레이더 차트 데이터 생성
    def lifestyle_to_radar(lifestyle) -> RadarChartData:
        if not lifestyle:
            return RadarChartData(cleanliness=3, noise=3, sleep=3, smoking=3, temperature=3)

        cleaning_score = {"DAILY": 5, "WEEKLY": 4, "WHEN_DIRTY": 2, "NEVER": 1}.get(
            lifestyle.cleaningHabit, 3
        )

        return RadarChartData(
            cleanliness=cleaning_score,
            noise=lifestyle.sensitivity,
            sleep=5 if lifestyle.sleepStart <= 24 else (3 if lifestyle.sleepStart <= 26 else 1),
            smoking=5 if not lifestyle.isSmoker else 1,
            temperature=3,  # 온도 정보가 없으므로 기본값
        )

    radar_chart = {
        "me": lifestyle_to_radar(my_lifestyle),
        "target": lifestyle_to_radar(target_user.lifestyle),
    }

    # 리뷰 정보
    reviews = []
    if target_user.receivedReviews:
        for review in target_user.receivedReviews[:5]:  # 최근 5개만
            reviews.append(
                ReviewSummary(
                    id=review.id,
                    content=review.content,
                    score=review.score,
                    createdAt=review.createdAt,
                )
            )

    # 평균 리뷰 점수
    avg_score = 0.0
    if target_user.receivedReviews:
        avg_score = sum(r.score for r in target_user.receivedReviews) / len(
            target_user.receivedReviews
        )

    # 응답 구성
    user_detail = MatchingUserDetail(
        id=target_user.id,
        nickname=target_user.nickname,
        gender=target_user.gender,
        nationality=target_user.nationality,
        studentId=target_user.studentId,
        age=target_user.age,
    )

    lifestyle_detail = None
    if target_user.lifestyle:
        lifestyle_detail = MatchingLifestyleDetail(
            dormName=target_user.lifestyle.dormName,
            isSmoker=target_user.lifestyle.isSmoker,
            sleepStart=target_user.lifestyle.sleepStart,
            sleepEnd=target_user.lifestyle.sleepEnd,
            sensitivity=target_user.lifestyle.sensitivity,
            sleepHabits=target_user.lifestyle.sleepHabits,
            cleaningHabit=target_user.lifestyle.cleaningHabit,
        )

    return MatchingDetailResponse(
        user=user_detail,
        lifestyle=lifestyle_detail,
        matchRate=match_rate,
        comparison=comparison,
        radarChart=radar_chart,
        reviews=reviews,
        averageReviewScore=round(avg_score, 1),
    )

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    ScoreBreakdownItem,
)
from app.services.matching import (
    calculate_match_score,
    check_dormitory_overlap,
    generate_keywords,
    generate_radar_chart_data,
)

router = APIRouter()


@router.get("", response_model=MatchingListResponse)
async def get_matching_list(
    dormName: str | None = Query(None, description="특정 기숙사로 필터링 (없으면 공통 기숙사 전체)"),
    page: int = 1,
    limit: int = 20,
    sortBy: str = "matchRate",
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    매칭 리스트 조회

    필터링 조건:
    1. 같은 성별
    2. 같은 흡연 상태 (흡연자↔흡연자, 비흡연자↔비흡연자)
    3. 기숙사 교집합 (복수 기숙사 지원)
    """
    # 내 정보 조회
    my_lifestyle = await db.userlifestyle.find_unique(where={"userId": current_user.id})
    my_preference = await db.userpreference.find_unique(where={"userId": current_user.id})

    if not my_lifestyle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "LIFESTYLE_NOT_FOUND", "message": "프로필 설정을 먼저 완료해주세요."},
        )

    # 후보자 조회: 같은 성별 + 같은 흡연 상태
    candidates = await db.user.find_many(
        where={
            "id": {"not": current_user.id},
            "gender": current_user.gender,
            "lifestyle": {
                "isSmoker": my_lifestyle.isSmoker,  # 흡연자끼리, 비흡연자끼리
            },
        },
        include={"lifestyle": True},
    )

    # 매칭 점수 계산
    results = []
    my_lifestyle_dict = my_lifestyle.model_dump() if my_lifestyle else None
    my_preference_dict = my_preference.model_dump() if my_preference else None
    my_dorms = my_lifestyle.dormNames if my_lifestyle else ""

    for candidate in candidates:
        if not candidate.lifestyle:
            continue

        # 기숙사 교집합 확인
        target_dorms = candidate.lifestyle.dormNames
        if not check_dormitory_overlap(my_dorms, target_dorms):
            continue

        # 특정 기숙사 필터가 있으면 추가 체크
        if dormName:
            target_dorm_list = [d.strip() for d in target_dorms.split(",")]
            my_dorm_list = [d.strip() for d in my_dorms.split(",")]
            if dormName not in target_dorm_list or dormName not in my_dorm_list:
                continue

        target_lifestyle_dict = candidate.lifestyle.model_dump()
        target_user_dict = {
            "nationality": candidate.nationality,
            "studentId": candidate.studentId,
        }

        # 새 알고리즘 사용 (딕셔너리 반환)
        match_result = calculate_match_score(
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
                matchRate=round(match_result["total_match_rate"]),
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
    user_id: str,
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

    match_result = calculate_match_score(
        my_lifestyle_dict,
        my_preference_dict,
        target_lifestyle_dict,
        {"nationality": target_user.nationality, "studentId": target_user.studentId},
    )

    # 비교 데이터 생성 (7개 항목)
    comparison = {}
    if my_lifestyle and target_user.lifestyle:
        # 흡연
        comparison["smoking"] = ComparisonItem(
            me=my_lifestyle.isSmoker,
            target=target_user.lifestyle.isSmoker,
            match=my_lifestyle.isSmoker == target_user.lifestyle.isSmoker,
        )
        # 취침시간
        comparison["sleepTime"] = ComparisonItem(
            me=my_lifestyle.sleepStart,
            target=target_user.lifestyle.sleepStart,
            match=abs(my_lifestyle.sleepStart - target_user.lifestyle.sleepStart) <= 1,
        )
        # 소음 (noiseLevel)
        comparison["noise"] = ComparisonItem(
            me=my_lifestyle.noiseLevel,
            target=target_user.lifestyle.noiseLevel,
            match=abs(my_lifestyle.noiseLevel - target_user.lifestyle.noiseLevel) <= 1,
        )
        # 청결 (cleanLevel)
        comparison["clean"] = ComparisonItem(
            me=my_lifestyle.cleanLevel,
            target=target_user.lifestyle.cleanLevel,
            match=abs(my_lifestyle.cleanLevel - target_user.lifestyle.cleanLevel) <= 1,
        )
        # 실내취식 (foodLevel)
        comparison["food"] = ComparisonItem(
            me=my_lifestyle.foodLevel,
            target=target_user.lifestyle.foodLevel,
            match=abs(my_lifestyle.foodLevel - target_user.lifestyle.foodLevel) <= 1,
        )
        # 소등 (lightLevel)
        comparison["light"] = ComparisonItem(
            me=my_lifestyle.lightLevel,
            target=target_user.lifestyle.lightLevel,
            match=abs(my_lifestyle.lightLevel - target_user.lifestyle.lightLevel) <= 1,
        )
        # 온도 (tempLevel)
        comparison["temp"] = ComparisonItem(
            me=my_lifestyle.tempLevel,
            target=target_user.lifestyle.tempLevel,
            match=abs(my_lifestyle.tempLevel - target_user.lifestyle.tempLevel) <= 1,
        )
        # 잠버릇
        comparison["sleepHabits"] = ComparisonItem(
            me=my_lifestyle.sleepHabits or "NONE",
            target=target_user.lifestyle.sleepHabits or "NONE",
            match=target_user.lifestyle.sleepHabits in [None, "", "NONE"],
        )

    # 레이더 차트 데이터 생성 (새 함수 사용)
    radar_chart = {
        "me": RadarChartData(**generate_radar_chart_data(my_lifestyle_dict)),
        "target": RadarChartData(**generate_radar_chart_data(target_lifestyle_dict)),
    }

    # 점수 상세 breakdown
    score_breakdown = {}
    for key, item in match_result.get("breakdown", {}).items():
        score_breakdown[key] = ScoreBreakdownItem(
            score=item["score"],
            weight=item["weight"],
            status=item["status"],
        )

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
            dormNames=target_user.lifestyle.dormNames,
            isSmoker=target_user.lifestyle.isSmoker,
            sleepStart=target_user.lifestyle.sleepStart,
            sleepEnd=target_user.lifestyle.sleepEnd,
            sleepHabits=target_user.lifestyle.sleepHabits,
            noiseLevel=target_user.lifestyle.noiseLevel,
            cleanLevel=target_user.lifestyle.cleanLevel,
            foodLevel=target_user.lifestyle.foodLevel,
            lightLevel=target_user.lifestyle.lightLevel,
            tempLevel=target_user.lifestyle.tempLevel,
            homeVisit=target_user.lifestyle.homeVisit,
        )

    return MatchingDetailResponse(
        user=user_detail,
        lifestyle=lifestyle_detail,
        matchRate=round(match_result["total_match_rate"]),
        comparison=comparison,
        radarChart=radar_chart,
        scoreBreakdown=score_breakdown,
        reviews=reviews,
        averageReviewScore=round(avg_score, 1),
    )

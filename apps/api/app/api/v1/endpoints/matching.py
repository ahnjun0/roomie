import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.matching import (
    ComparisonItem,
    ConnectionUser,
    ConnectionsResponse,
    EndSemesterResponse,
    MatchingDetailResponse,
    MatchingLifestyleDetail,
    MatchingListResponse,
    MatchingUserDetail,
    MatchingUserResponse,
    PastRoommateUser,
    RadarChartData,
    ReviewSummary,
    RoommateResponse,
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

    # 후보자 조회: 같은 학교 + 같은 성별 + 같은 흡연 상태
    # schoolId가 없는 경우 (기존 사용자) 필터링 없이 진행
    school_filter = {"schoolId": current_user.schoolId} if current_user.schoolId else {}

    candidates = await db.user.find_many(
        where={
            "id": {"not": current_user.id},
            "gender": current_user.gender,
            "matchingStatus": "SEARCHING",
            "lifestyle": {
                "isSmoker": my_lifestyle.isSmoker,  # 흡연자끼리, 비흡연자끼리
            },
            **school_filter,  # 같은 학교 필터 (Hard Filter)
        },
        include={"lifestyle": True, "preference": True},
    )

    # 매칭 점수 계산
    results = []
    my_lifestyle_dict = my_lifestyle.model_dump() if my_lifestyle else None
    my_preference_dict = my_preference.model_dump() if my_preference else None
    my_dorms = my_lifestyle.dormNames if my_lifestyle else ""

    # 현재 사용자 정보 (학번/국적 비교용)
    current_user_dict = {
        "nationality": current_user.nationality,
        "studentId": current_user.studentId,
    }

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

        # 정방향 매칭 점수: 나 → 상대
        forward_result = calculate_match_score(
            my_lifestyle_dict,
            my_preference_dict,
            target_lifestyle_dict,
            target_user_dict,
            current_user_dict,
        )

        # 역방향 매칭 점수: 상대 → 나
        target_preference_dict = candidate.preference.model_dump() if candidate.preference else {}
        reverse_result = calculate_match_score(
            target_lifestyle_dict,
            target_preference_dict,
            my_lifestyle_dict,
            current_user_dict,
            target_user_dict,
        )

        # 기하평균으로 양방향 매칭 점수 산출
        forward_score = forward_result["total_match_rate"]
        reverse_score = reverse_result["total_match_rate"]
        mutual_score = math.sqrt(max(0, forward_score) * max(0, reverse_score))

        keywords = generate_keywords(target_lifestyle_dict, target_user_dict)

        results.append(
            MatchingUserResponse(
                id=candidate.id,
                nickname=candidate.nickname,
                studentId=candidate.studentId,
                nationality=candidate.nationality,
                dormNames=candidate.lifestyle.dormNames,
                matchRate=round(mutual_score),
                keywords=keywords,
                isSmoker=candidate.lifestyle.isSmoker,
                sleepStart=candidate.lifestyle.sleepStart,
                roomBtiAnimal=candidate.roomBtiAnimal,
                roomBtiResult=candidate.roomBtiResult,
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


@router.get("/roommate", response_model=RoommateResponse)
async def get_roommate(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """현재 룸메이트 정보 조회"""
    if current_user.matchingStatus != "MATCHED":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_MATCHED", "message": "현재 매칭된 룸메이트가 없습니다."},
        )

    # 서명 완료된 계약에서 상대방 찾기
    contract = await db.roommatecontract.find_first(
        where={
            "status": "SIGNED",
            "OR": [
                {"userAId": current_user.id},
                {"userBId": current_user.id},
            ],
        },
        order={"signedAt": "desc"},
    )

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CONTRACT_NOT_FOUND", "message": "서명된 계약서를 찾을 수 없습니다."},
        )

    target_user_id = contract.userBId if contract.userAId == current_user.id else contract.userAId
    target_user = await db.user.find_unique(
        where={"id": target_user_id},
        include={"lifestyle": True},
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "룸메이트 정보를 찾을 수 없습니다."},
        )

    is_user_a = contract.userAId == current_user.id
    return RoommateResponse(
        userId=target_user.id,
        nickname=target_user.nickname,
        studentId=target_user.studentId,
        nationality=target_user.nationality,
        dormNames=target_user.lifestyle.dormNames if target_user.lifestyle else "",
        chatRoomId=contract.chatRoomId,
        endSemesterMe=contract.endSemesterA if is_user_a else contract.endSemesterB,
        endSemesterPartner=contract.endSemesterB if is_user_a else contract.endSemesterA,
    )


@router.post("/end-semester", response_model=EndSemesterResponse)
async def end_semester(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """학기 끝내기 (서명처럼 양쪽 모두 확인해야 관계 종료)"""
    if current_user.matchingStatus != "MATCHED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "NOT_MATCHED", "message": "현재 매칭 상태가 아닙니다."},
        )

    # 서명 완료된 계약에서 상대방 찾기
    contract = await db.roommatecontract.find_first(
        where={
            "status": "SIGNED",
            "OR": [
                {"userAId": current_user.id},
                {"userBId": current_user.id},
            ],
        },
        order={"signedAt": "desc"},
    )

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "CONTRACT_NOT_FOUND", "message": "서명된 계약서를 찾을 수 없습니다."},
        )

    is_user_a = contract.userAId == current_user.id
    target_user_id = contract.userBId if is_user_a else contract.userAId
    target_user = await db.user.find_unique(where={"id": target_user_id})

    # 현재 유저의 endSemester 플래그만 설정
    update_data: dict[str, bool] = {}
    if is_user_a and not contract.endSemesterA:
        update_data["endSemesterA"] = True
    elif not is_user_a and not contract.endSemesterB:
        update_data["endSemesterB"] = True

    if update_data:
        contract = await db.roommatecontract.update(
            where={"id": contract.id},
            data=update_data,
        )

    # 양쪽 모두 endSemester이면 관계 종료
    both_ended = contract.endSemesterA and contract.endSemesterB
    if both_ended:
        await db.user.update_many(
            where={"id": {"in": [current_user.id, target_user_id]}},
            data={"matchingStatus": "SEARCHING"},
        )

    return EndSemesterResponse(
        targetUserId=target_user_id,
        targetNickname=target_user.nickname if target_user else None,
        bothEnded=both_ended,
    )


@router.get("/connections", response_model=ConnectionsResponse)
async def get_connections(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """현재 대화 중인 상대 및 지난 룸메이트 조회"""
    try:
        # 1. Active chats: 내가 참여한 채팅방에서 SIGNED 계약이 없는 상대 조회
        participations = await db.chatparticipant.find_many(
            where={"userId": current_user.id},
            include={
                "chatRoom": {
                    "include": {
                        "participants": {
                            "include": {"user": True},
                        },
                        "contract": True,
                        "messages": {
                            "order": {"createdAt": "desc"},
                            "take": 1,
                        },
                    }
                }
            },
        )

        active_chats = []
        for p in participations:
            chat_room = p.chatRoom
            # SIGNED 계약이 있으면 이미 룸메이트이므로 스킵
            if chat_room.contract and chat_room.contract.status == "SIGNED":
                continue

            # 상대방 찾기
            other_user = None
            for participant in chat_room.participants:
                if participant.userId != current_user.id:
                    other_user = participant.user
                    break

            if other_user:
                last_msg = chat_room.messages[0] if chat_room.messages else None
                active_chats.append(
                    ConnectionUser(
                        userId=other_user.id,
                        nickname=other_user.nickname,
                        chatRoomId=chat_room.id,
                        lastMessage=last_msg.content if last_msg else None,
                        lastMessageAt=last_msg.createdAt if last_msg else None,
                    )
                )

        # 2. Past roommates: MatchHistory에서 조회
        histories = await db.matchhistory.find_many(
            where={
                "OR": [
                    {"userAId": current_user.id},
                    {"userBId": current_user.id},
                ]
            },
            order={"matchedAt": "desc"},
        )

        past_roommate_ids = []
        for h in histories:
            other_id = h.userBId if h.userAId == current_user.id else h.userAId
            if other_id not in past_roommate_ids:
                past_roommate_ids.append(other_id)

        past_roommates = []
        if past_roommate_ids:
            users = await db.user.find_many(where={"id": {"in": past_roommate_ids}})
            user_map = {u.id: u for u in users}
            for uid in past_roommate_ids:
                u = user_map.get(uid)
                if u:
                    past_roommates.append(
                        PastRoommateUser(
                            userId=u.id,
                            nickname=u.nickname,
                            studentId=u.studentId,
                        )
                    )

        return ConnectionsResponse(
            activeChats=active_chats,
            pastRoommates=past_roommates,
        )
    except Exception as e:
        print(f"Error fetching connections: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch connections: {str(e)}",
        )


def _format_sleep_time(value: int) -> str:
    """0-24 값을 HH:00 형식으로 변환 (16시 기준)"""
    hour = (16 + value) % 24
    return f"{hour:02d}:00"


@router.get("/{user_id}", response_model=MatchingDetailResponse)
async def get_matching_detail(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """매칭 상세 조회"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "FORBIDDEN",
                "message": "본인에 대한 리뷰는 열람할 수 없습니다.",
            },
        )
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

    # 같은 학교인지 확인 (schoolId가 있는 경우에만)
    if current_user.schoolId and target_user.schoolId:
        if current_user.schoolId != target_user.schoolId:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "DIFFERENT_SCHOOL", "message": "같은 학교 사용자만 조회할 수 있습니다."},
            )

    # 내 정보 조회
    my_lifestyle = await db.userlifestyle.find_unique(where={"userId": current_user.id})
    my_preference = await db.userpreference.find_unique(where={"userId": current_user.id})
    target_preference = await db.userpreference.find_unique(where={"userId": target_user.id})

    # 매칭 점수 계산
    my_lifestyle_dict = my_lifestyle.model_dump() if my_lifestyle else {}
    my_preference_dict = my_preference.model_dump() if my_preference else {}
    target_lifestyle_dict = target_user.lifestyle.model_dump() if target_user.lifestyle else {}
    target_preference_dict = target_preference.model_dump() if target_preference else {}

    # 현재 사용자 정보 (학번/국적 비교용)
    current_user_dict = {
        "nationality": current_user.nationality,
        "studentId": current_user.studentId,
    }
    target_user_dict = {
        "nationality": target_user.nationality,
        "studentId": target_user.studentId,
    }

    # 정방향: 나 → 상대
    match_result = calculate_match_score(
        my_lifestyle_dict,
        my_preference_dict,
        target_lifestyle_dict,
        target_user_dict,
        current_user_dict,
    )

    # 역방향: 상대 → 나
    reverse_result = calculate_match_score(
        target_lifestyle_dict,
        target_preference_dict,
        my_lifestyle_dict,
        current_user_dict,
        target_user_dict,
    )

    # 기하평균
    forward_score = match_result["total_match_rate"]
    reverse_score = reverse_result["total_match_rate"]
    mutual_score = math.sqrt(max(0, forward_score) * max(0, reverse_score))

    # 비교 데이터 생성 (7개 항목)
    comparison = {}
    if my_lifestyle and target_user.lifestyle:
        # 흡연
        comparison["smoking"] = ComparisonItem(
            me=my_lifestyle.isSmoker,
            target=target_user.lifestyle.isSmoker,
            match=my_lifestyle.isSmoker == target_user.lifestyle.isSmoker,
        )
        # 수면 일정 (취침 -> 기상)
        my_schedule = f"{_format_sleep_time(my_lifestyle.sleepStart)} → {_format_sleep_time(my_lifestyle.sleepEnd)}"
        target_schedule = f"{_format_sleep_time(target_user.lifestyle.sleepStart)} → {_format_sleep_time(target_user.lifestyle.sleepEnd)}"
        comparison["sleepSchedule"] = ComparisonItem(
            me=my_schedule,
            target=target_schedule,
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
        roomBtiAnimal=target_user.roomBtiAnimal,
        roomBtiResult=target_user.roomBtiResult,
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
            tempLevel=target_user.lifestyle.tempLevel,
            homeVisit=target_user.lifestyle.homeVisit,
        )

    return MatchingDetailResponse(
        user=user_detail,
        lifestyle=lifestyle_detail,
        matchRate=round(mutual_score),
        comparison=comparison,
        radarChart=radar_chart,
        scoreBreakdown=score_breakdown,
        reviews=reviews,
        reviewCount=len(target_user.receivedReviews) if target_user.receivedReviews else 0,
        averageReviewScore=round(avg_score, 1),
    )

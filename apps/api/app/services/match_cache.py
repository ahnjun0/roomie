"""
매칭 점수 캐싱 서비스

사용자가 프로필을 수정하거나 회원가입할 때
다른 모든 사용자와의 매칭 점수를 미리 계산하여 저장합니다.
"""

import json
from prisma import Prisma

from app.services.matching import calculate_match_score


async def update_match_scores_for_user(db: Prisma, user_id: int):
    """
    특정 사용자와 다른 모든 사용자 간의 매칭 점수를 계산하여 저장

    - 회원가입 시 호출
    - 프로필(lifestyle/preference) 수정 시 호출
    """
    # 현재 사용자 정보 조회
    current_user = await db.user.find_unique(
        where={"id": user_id},
        include={"lifestyle": True, "preference": True}
    )

    if not current_user or not current_user.lifestyle:
        return

    my_lifestyle = current_user.lifestyle.__dict__ if current_user.lifestyle else {}
    my_preference = current_user.preference.__dict__ if current_user.preference else {}

    # 같은 성별, 같은 흡연 상태의 모든 사용자 조회
    candidates = await db.user.find_many(
        where={
            "id": {"not": user_id},
            "gender": current_user.gender,
            "lifestyle": {
                "isSmoker": current_user.lifestyle.isSmoker
            }
        },
        include={"lifestyle": True, "preference": True}
    )

    # 각 후보와의 매칭 점수 계산 및 저장
    for candidate in candidates:
        if not candidate.lifestyle:
            continue

        target_lifestyle = candidate.lifestyle.__dict__
        target_user_dict = {
            "nationality": candidate.nationality,
            "studentId": candidate.studentId
        }

        # 나 → 상대 매칭 점수
        result = calculate_match_score(
            my_lifestyle,
            my_preference,
            target_lifestyle,
            target_user_dict
        )

        # MatchResult 저장/업데이트 (나 → 상대)
        await db.matchresult.upsert(
            where={
                "userId_targetUserId": {
                    "userId": user_id,
                    "targetUserId": candidate.id
                }
            },
            data={
                "create": {
                    "userId": user_id,
                    "targetUserId": candidate.id,
                    "score": result["total_match_rate"],
                    "breakdown": json.dumps(result.get("breakdown", {}))
                },
                "update": {
                    "score": result["total_match_rate"],
                    "breakdown": json.dumps(result.get("breakdown", {}))
                }
            }
        )

        # 상대 → 나 매칭 점수도 계산 (상대방의 preference 기준)
        candidate_preference = candidate.preference.__dict__ if candidate.preference else {}
        my_user_dict = {
            "nationality": current_user.nationality,
            "studentId": current_user.studentId
        }

        reverse_result = calculate_match_score(
            target_lifestyle,
            candidate_preference,
            my_lifestyle,
            my_user_dict
        )

        # MatchResult 저장/업데이트 (상대 → 나)
        await db.matchresult.upsert(
            where={
                "userId_targetUserId": {
                    "userId": candidate.id,
                    "targetUserId": user_id
                }
            },
            data={
                "create": {
                    "userId": candidate.id,
                    "targetUserId": user_id,
                    "score": reverse_result["total_match_rate"],
                    "breakdown": json.dumps(reverse_result.get("breakdown", {}))
                },
                "update": {
                    "score": reverse_result["total_match_rate"],
                    "breakdown": json.dumps(reverse_result.get("breakdown", {}))
                }
            }
        )


async def get_cached_matches(
    db: Prisma,
    user_id: int,
    dorm_name: str | None = None,
    page: int = 1,
    limit: int = 20
) -> dict:
    """
    캐시된 매칭 결과 조회 (점수 높은 순)
    """
    # 현재 사용자 정보
    current_user = await db.user.find_unique(
        where={"id": user_id},
        include={"lifestyle": True}
    )

    if not current_user or not current_user.lifestyle:
        return {"total": 0, "data": []}

    my_dorms = set(d.strip() for d in current_user.lifestyle.dormNames.split(","))

    # 캐시된 매칭 결과 조회
    match_results = await db.matchresult.find_many(
        where={"userId": user_id},
        order={"score": "desc"},
        include={
            "targetUser": {
                "include": {"lifestyle": True}
            }
        }
    )

    # 기숙사 필터링
    filtered_results = []
    for result in match_results:
        target = result.targetUser
        if not target or not target.lifestyle:
            continue

        target_dorms = set(d.strip() for d in target.lifestyle.dormNames.split(","))

        # 기숙사 교집합 확인
        if not (my_dorms & target_dorms):
            continue

        # 특정 기숙사 필터
        if dorm_name and dorm_name not in target_dorms:
            continue

        filtered_results.append(result)

    # 페이지네이션
    total = len(filtered_results)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered_results[start:end]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": paginated
    }


async def recalculate_all_matches(db: Prisma):
    """
    모든 사용자의 매칭 점수 재계산 (배치 작업용)
    """
    users = await db.user.find_many(
        where={"lifestyle": {"isNot": None}},
        include={"lifestyle": True}
    )

    for user in users:
        await update_match_scores_for_user(db, user.id)

    return {"processed": len(users)}

"""
매칭 알고리즘 서비스

핵심 로직:
1. 가중치 시스템 (5만원 게임): 사용자가 중요하게 생각하는 항목에 더 높은 점수 반영
2. 희소성 우선 매칭: 소수 성향 사용자를 우선 그룹화
3. 생활권 최적화: 비슷한 패턴의 사용자끼리 같은 구역 배치 권장
"""

from app.models.user import User
from app.models.lifestyle import UserLifestyle
from app.models.preference import UserPreference


def calculate_match_score(
    user: User,
    candidate: User,
    user_lifestyle: UserLifestyle,
    candidate_lifestyle: UserLifestyle,
    user_preference: UserPreference,
) -> float:
    """
    두 사용자 간의 매칭 점수를 계산합니다.

    Args:
        user: 현재 사용자
        candidate: 매칭 후보
        user_lifestyle: 현재 사용자의 생활 패턴
        candidate_lifestyle: 후보의 생활 패턴
        user_preference: 현재 사용자의 희망 조건 및 가중치

    Returns:
        0-100 사이의 매칭 점수
    """
    score = 0.0
    max_score = 0.0
    weights = user_preference.weights or {}

    # 기본 가중치 (설정하지 않은 항목)
    default_weight = 5000

    # 청결도 매칭
    weight = weights.get("cleanliness", default_weight)
    max_score += weight
    if candidate_lifestyle.cleanliness:
        if user_preference.min_cleanliness:
            if candidate_lifestyle.cleanliness >= user_preference.min_cleanliness:
                score += weight
        else:
            score += weight * 0.5  # 기본 50% 점수

    # 소음 민감도 매칭
    weight = weights.get("noise", default_weight)
    max_score += weight
    if candidate_lifestyle.noise_sensitivity and user_lifestyle.noise_sensitivity:
        diff = abs(candidate_lifestyle.noise_sensitivity - user_lifestyle.noise_sensitivity)
        score += weight * (1 - diff / 4)  # 차이가 적을수록 높은 점수

    # 취침 시간 매칭
    weight = weights.get("sleep_time", default_weight)
    max_score += weight
    if candidate_lifestyle.sleep_time == user_lifestyle.sleep_time:
        score += weight

    # 흡연 여부
    weight = weights.get("smoking", default_weight)
    max_score += weight
    if user_preference.allows_smoking is not None:
        if user_preference.allows_smoking == candidate_lifestyle.is_smoker:
            score += weight
        elif user_preference.allows_smoking and not candidate_lifestyle.is_smoker:
            score += weight  # 흡연 허용인데 비흡연자면 OK
    else:
        score += weight * 0.5

    # 실내 음식 섭취
    weight = weights.get("indoor_eating", default_weight)
    max_score += weight
    if user_preference.allows_indoor_eating == candidate_lifestyle.indoor_eating:
        score += weight

    # 최종 점수 계산 (0-100 스케일)
    if max_score > 0:
        return round((score / max_score) * 100, 2)
    return 50.0  # 데이터 부족 시 기본 점수

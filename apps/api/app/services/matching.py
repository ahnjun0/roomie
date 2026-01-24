"""
매칭 알고리즘 서비스

핵심 로직:
1. 가중치 시스템 (5만원 게임): 사용자가 중요하게 생각하는 항목에 더 높은 점수 반영
2. 기본 일치도와 가중치를 곱해서 최종 점수 계산
"""


def calculate_match_score(
    my_lifestyle: dict,
    my_preference: dict,
    target_lifestyle: dict,
    target_user: dict,
) -> int:
    """
    두 사용자 간의 매칭 점수를 계산합니다.

    Args:
        my_lifestyle: 현재 사용자의 생활 패턴
        my_preference: 현재 사용자의 희망 조건 및 가중치
        target_lifestyle: 후보의 생활 패턴
        target_user: 후보의 기본 정보

    Returns:
        0-100 사이의 매칭 점수
    """
    if not my_lifestyle or not target_lifestyle:
        return 50  # 데이터 부족 시 기본 점수

    score = 0.0
    max_score = 0.0

    # 가중치 가져오기 (기본값 1.0)
    weight_smoking = my_preference.get("weightSmoking", 1.0) if my_preference else 1.0
    weight_sleep = my_preference.get("weightSleep", 1.0) if my_preference else 1.0
    weight_cleanliness = my_preference.get("weightCleanliness", 1.0) if my_preference else 1.0
    weight_noise = my_preference.get("weightNoise", 1.0) if my_preference else 1.0

    # 1. 흡연 여부 매칭
    max_score += weight_smoking
    if my_lifestyle.get("isSmoker") == target_lifestyle.get("isSmoker"):
        score += weight_smoking
    elif not my_lifestyle.get("isSmoker") and not target_lifestyle.get("isSmoker"):
        # 둘 다 비흡연자면 만점
        score += weight_smoking

    # 2. 수면 시간 매칭
    max_score += weight_sleep
    my_sleep = my_lifestyle.get("sleepStart", 24)
    target_sleep = target_lifestyle.get("sleepStart", 24)
    sleep_diff = abs(my_sleep - target_sleep)
    if sleep_diff <= 1:
        score += weight_sleep
    elif sleep_diff <= 2:
        score += weight_sleep * 0.7
    elif sleep_diff <= 3:
        score += weight_sleep * 0.4
    # 3시간 이상 차이나면 0점

    # 3. 청소 습관 매칭
    max_score += weight_cleanliness
    my_cleaning = my_lifestyle.get("cleaningHabit", "WEEKLY")
    target_cleaning = target_lifestyle.get("cleaningHabit", "WEEKLY")
    if my_cleaning == target_cleaning:
        score += weight_cleanliness
    else:
        # 비슷한 습관이면 부분 점수
        cleaning_order = ["DAILY", "WEEKLY", "WHEN_DIRTY", "NEVER"]
        try:
            my_idx = cleaning_order.index(my_cleaning) if my_cleaning else 1
            target_idx = cleaning_order.index(target_cleaning) if target_cleaning else 1
            diff = abs(my_idx - target_idx)
            if diff == 1:
                score += weight_cleanliness * 0.6
            elif diff == 2:
                score += weight_cleanliness * 0.3
        except ValueError:
            score += weight_cleanliness * 0.5

    # 4. 잠귀 민감도 매칭
    max_score += weight_noise
    my_sensitivity = my_lifestyle.get("sensitivity", 3)
    target_sensitivity = target_lifestyle.get("sensitivity", 3)
    sensitivity_diff = abs(my_sensitivity - target_sensitivity)
    if sensitivity_diff <= 1:
        score += weight_noise
    elif sensitivity_diff <= 2:
        score += weight_noise * 0.6
    else:
        score += weight_noise * 0.2

    # 5. 국적/학번 선호 (보너스 점수)
    bonus = 0.0
    if my_preference:
        pref_nationality = my_preference.get("prefNationality")
        if pref_nationality and pref_nationality == target_user.get("nationality"):
            bonus += 5

        pref_student_id = my_preference.get("prefStudentId")
        my_student_id = my_lifestyle.get("userId")  # 실제로는 user에서 가져와야 함
        target_student_id = target_user.get("studentId")
        if pref_student_id == "SAME" and my_student_id == target_student_id:
            bonus += 3
        elif pref_student_id == "ANY":
            bonus += 1

    # 최종 점수 계산 (0-100 스케일)
    if max_score > 0:
        base_score = (score / max_score) * 100
        final_score = min(100, base_score + bonus)
        return round(final_score)

    return 50


def generate_keywords(lifestyle: dict, user: dict) -> list[str]:
    """사용자의 키워드 태그 생성"""
    keywords = []

    if lifestyle:
        # 흡연 여부
        if not lifestyle.get("isSmoker"):
            keywords.append("비흡연")
        else:
            keywords.append("흡연")

        # 취침 시간
        sleep_start = lifestyle.get("sleepStart", 24)
        if sleep_start <= 23:
            keywords.append(f"{sleep_start}시취침")
        elif sleep_start == 24:
            keywords.append("12시취침")
        elif sleep_start <= 26:
            keywords.append("새벽취침")
        else:
            keywords.append("늦은취침")

        # 청소 습관
        cleaning = lifestyle.get("cleaningHabit")
        if cleaning == "DAILY":
            keywords.append("매일청소")
        elif cleaning == "WEEKLY":
            keywords.append("주1회청소")
        elif cleaning == "WHEN_DIRTY":
            keywords.append("필요시청소")

        # 잠버릇
        sleep_habits = lifestyle.get("sleepHabits", "")
        if sleep_habits:
            if "NONE" in sleep_habits:
                keywords.append("조용한수면")
            if "SNORING" in sleep_habits:
                keywords.append("코골이")

    return keywords[:4]  # 최대 4개

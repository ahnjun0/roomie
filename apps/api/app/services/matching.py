"""
매칭 알고리즘 서비스 (v3)

핵심 로직:
1. 5만원 게임 가중치 시스템: BASE_WEIGHT + 베팅액으로 가중치 결정
2. 7개 카테고리별 유사도 계산
3. 가중 평균으로 최종 점수 산출

공식: Total Score = (Σ(유사도 × 가중치) / Σ가중치) × 100
"""

# ============== 상수 정의 ==============
BASE_WEIGHT = 10.0      # 0원 베팅해도 기본 가중치 10
MAX_SCALE_DIFF = 4.0    # 1~5점 척도의 최대 차이
MAX_TIME_DIFF = 240.0   # 취침시간 최대 허용 차이 (분, 4시간)


# ============== 변환 함수 ==============

def get_habit_severity(sleep_habits: str | None) -> int:
    """
    잠버릇 태그를 심각도 점수(1~5)로 변환

    1: 없음(조용함)
    2: 뒤척임
    3: 잠꼬대
    4: 이갈이
    5: 코골이
    """
    if not sleep_habits or sleep_habits == "NONE":
        return 1

    severity = 1
    if "TOSSING" in sleep_habits:
        severity = max(severity, 2)
    if "TALKING" in sleep_habits:
        severity = max(severity, 3)
    if "GRINDING" in sleep_habits:
        severity = max(severity, 4)
    if "SNORING" in sleep_habits:
        severity = max(severity, 5)

    return severity


def convert_sleep_to_minutes(sleep_hour: int) -> int:
    """
    sleepStart (0~30) → 분 단위 (0~1439)로 변환

    예시:
    - 23 = 밤 11시 = 23*60 = 1380분
    - 24 = 자정 = 0분
    - 26 = 새벽 2시 = 120분
    """
    if sleep_hour >= 24:
        return (sleep_hour - 24) * 60
    return sleep_hour * 60


# ============== 유사도 계산 함수 ==============

def calc_scale_similarity(my_val: int, target_val: int) -> float:
    """
    1~5 척도 항목의 유사도 계산 (궁합형)

    차이 0 → 유사도 1.0 (100점)
    차이 1 → 유사도 0.75 (75점)
    차이 2 → 유사도 0.5 (50점)
    차이 4 → 유사도 0.0 (0점)
    """
    diff = abs(my_val - target_val)
    return max(0.0, 1.0 - (diff / MAX_SCALE_DIFF))


def calc_time_similarity(my_sleep: int, target_sleep: int) -> float:
    """
    취침시간 유사도 계산 (분 단위)

    24시간 순환을 고려 (23시와 01시는 2시간 차이)
    4시간(240분) 이상 차이나면 유사도 0
    """
    my_min = convert_sleep_to_minutes(my_sleep)
    target_min = convert_sleep_to_minutes(target_sleep)

    diff = abs(my_min - target_min)

    # 24시간 순환 처리 (23시-01시 = 2시간)
    if diff > 720:
        diff = 1440 - diff

    return max(0.0, 1.0 - (diff / MAX_TIME_DIFF))


def calc_habit_similarity(target_severity: int) -> float:
    """
    잠버릇 유사도 계산 (절대평가)

    상대방이 조용할수록 높은 점수
    - 심각도 1 (조용함) → 유사도 1.0
    - 심각도 5 (코골이) → 유사도 0.0

    ※ 내 잠버릇은 고려하지 않음 (상대가 나를 평가할 때 사용됨)
    """
    return max(0.0, 1.0 - ((target_severity - 1) / MAX_SCALE_DIFF))


def get_status_text(similarity: float) -> str:
    """유사도에 따른 상태 텍스트 반환"""
    if similarity >= 1.0:
        return "Perfect"
    elif similarity >= 0.75:
        return "Good"
    elif similarity >= 0.5:
        return "Okay"
    else:
        return "Bad"


# ============== 메인 매칭 알고리즘 ==============

def calculate_match_score(
    my_lifestyle: dict,
    my_preference: dict,
    target_lifestyle: dict,
    target_user: dict,
    current_user: dict | None = None,
) -> dict:
    """
    두 사용자 간의 매칭 점수를 계산합니다.

    Args:
        my_lifestyle: 현재 사용자의 생활 패턴
        my_preference: 현재 사용자의 희망 조건 및 가중치
        target_lifestyle: 후보의 생활 패턴
        target_user: 후보의 기본 정보 (nationality, studentId)
        current_user: 현재 사용자의 기본 정보 (nationality, studentId) - 학번 비교용

    Returns:
        {
            "total_match_rate": 87.5,  # 0-100 사이 점수
            "breakdown": {
                "noise": {"score": 100, "weight": 40.0, "status": "Perfect"},
                ...
            },
            "preferenceBonus": {
                "nationality": {"matched": True, "bonus": 3},
                "studentId": {"matched": True, "bonus": 5}
            }
        }
    """
    if not my_lifestyle or not target_lifestyle:
        return {
            "total_match_rate": 50,
            "breakdown": {}
        }

    total_weighted_score = 0.0
    total_weight_sum = 0.0
    breakdown = {}

    # 가중치 가져오기 (preference에서)
    pref = my_preference or {}

    # ============== 7개 카테고리 처리 ==============

    categories = [
        {
            "key": "noise",
            "weight_key": "weightNoise",
            "my_val": my_lifestyle.get("noiseLevel", 3),
            "target_val": target_lifestyle.get("noiseLevel", 3),
            "calc_type": "scale"
        },
        {
            "key": "clean",
            "weight_key": "weightClean",
            "my_val": my_lifestyle.get("cleanLevel", 3),
            "target_val": target_lifestyle.get("cleanLevel", 3),
            "calc_type": "scale"
        },
        {
            "key": "food",
            "weight_key": "weightFood",
            "my_val": my_lifestyle.get("foodLevel", 3),
            "target_val": target_lifestyle.get("foodLevel", 3),
            "calc_type": "scale"
        },
        {
            "key": "light",
            "weight_key": "weightLight",
            "my_val": my_lifestyle.get("lightLevel", 3),
            "target_val": target_lifestyle.get("lightLevel", 3),
            "calc_type": "scale"
        },
        {
            "key": "temp",
            "weight_key": "weightTemp",
            "my_val": my_lifestyle.get("tempLevel", 3),
            "target_val": target_lifestyle.get("tempLevel", 3),
            "calc_type": "scale"
        },
        {
            "key": "time",
            "weight_key": "weightTime",
            "my_val": my_lifestyle.get("sleepStart", 24),
            "target_val": target_lifestyle.get("sleepStart", 24),
            "calc_type": "time"
        },
        {
            "key": "habit",
            "weight_key": "weightHabit",
            "my_val": get_habit_severity(my_lifestyle.get("sleepHabits")),
            "target_val": get_habit_severity(target_lifestyle.get("sleepHabits")),
            "calc_type": "habit"
        },
    ]

    for cat in categories:
        # 가중치 계산: BASE_WEIGHT + 베팅액
        bet_amount = pref.get(cat["weight_key"], 0)
        weight = BASE_WEIGHT + bet_amount

        # 유사도 계산
        if cat["calc_type"] == "time":
            similarity = calc_time_similarity(cat["my_val"], cat["target_val"])
        elif cat["calc_type"] == "habit":
            # 잠버릇은 상대방의 심각도만 고려 (절대평가)
            similarity = calc_habit_similarity(cat["target_val"])
        else:
            # scale 타입: 나와 상대의 차이 (상대평가)
            similarity = calc_scale_similarity(cat["my_val"], cat["target_val"])

        # 점수 합산
        total_weighted_score += similarity * weight
        total_weight_sum += weight

        # breakdown 저장
        breakdown[cat["key"]] = {
            "score": round(similarity * 100),
            "weight": weight,
            "status": get_status_text(similarity)
        }

    # ============== 보너스 점수 (국적/학번 선호) ==============
    # 선호 조건은 Hard Filter가 아닌 Soft Score로 처리
    # 조건이 맞으면 가산점, 안 맞아도 감점 없음 (0점)
    bonus = 0.0
    preference_bonus = {}

    # 국적 선호 보너스 (최대 +3점)
    pref_nationality = pref.get("prefNationality")
    target_nationality = target_user.get("nationality")
    nationality_matched = False

    if pref_nationality:
        # 선호 국적이 설정된 경우
        if pref_nationality == target_nationality:
            bonus += 3
            nationality_matched = True
    else:
        # 국적 무관 (null) - 보너스 없음, 감점도 없음
        nationality_matched = True  # 무관이므로 "매칭됨"으로 처리

    preference_bonus["nationality"] = {
        "preference": pref_nationality,
        "target": target_nationality,
        "matched": nationality_matched,
        "bonus": 3 if nationality_matched and pref_nationality else 0
    }

    # 학번 선호 보너스 (최대 +5점)
    pref_student_id = pref.get("prefStudentId")  # "SAME", "SENIOR", "JUNIOR", "ANY", None
    target_student_id = target_user.get("studentId")
    my_student_id = current_user.get("studentId") if current_user else None
    student_matched = False

    if pref_student_id == "ANY" or pref_student_id is None:
        # 학번 무관 - 가산점 부여
        bonus += 2
        student_matched = True
    elif pref_student_id == "SAME" and my_student_id is not None:
        # 동기 선호: 나와 같은 학번이면 가산점
        if target_student_id == my_student_id:
            bonus += 5
            student_matched = True
    elif pref_student_id == "SENIOR" and my_student_id is not None:
        # 선배 선호: 나보다 낮은 학번 (더 오래된 = 선배)
        if target_student_id is not None and target_student_id < my_student_id:
            bonus += 5
            student_matched = True
    elif pref_student_id == "JUNIOR" and my_student_id is not None:
        # 후배 선호: 나보다 높은 학번 (더 최근 = 후배)
        if target_student_id is not None and target_student_id > my_student_id:
            bonus += 5
            student_matched = True

    preference_bonus["studentId"] = {
        "preference": pref_student_id,
        "myStudentId": my_student_id,
        "targetStudentId": target_student_id,
        "matched": student_matched,
        "bonus": bonus - preference_bonus["nationality"]["bonus"]  # 학번 보너스만 추출
    }

    # ============== 최종 점수 계산 ==============
    if total_weight_sum == 0:
        return {
            "total_match_rate": 50,
            "breakdown": breakdown
        }

    base_score = (total_weighted_score / total_weight_sum) * 100
    final_score = min(100, base_score + bonus)

    return {
        "total_match_rate": round(final_score, 1),
        "breakdown": breakdown,
        "preferenceBonus": preference_bonus,
        "baseScore": round(base_score, 1),
        "totalBonus": round(bonus, 1),
    }


def generate_keywords(lifestyle: dict, user: dict) -> list[str]:
    """사용자의 키워드 태그 생성 (최대 4개)"""
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

        # 청결도
        clean_level = lifestyle.get("cleanLevel", 3)
        if clean_level >= 4:
            keywords.append("깔끔선호")
        elif clean_level <= 2:
            keywords.append("청소여유")

        # 잠버릇
        sleep_habits = lifestyle.get("sleepHabits", "")
        if sleep_habits:
            if "NONE" in sleep_habits or not sleep_habits:
                keywords.append("조용한수면")
            elif "SNORING" in sleep_habits:
                keywords.append("코골이")

    return keywords[:4]


def generate_radar_chart_data(lifestyle: dict) -> dict:
    """
    레이더 차트용 데이터 생성

    각 항목을 0-100 스케일로 변환
    """
    if not lifestyle:
        return {
            "noise": 50,
            "clean": 50,
            "food": 50,
            "light": 50,
            "temp": 50,
            "time": 50,
            "habit": 50,
        }

    # 1-5 스케일 → 0-100 스케일
    def scale_to_100(val: int) -> int:
        return round((val - 1) / 4 * 100)

    # 취침시간 → 0-100 (23시=0, 새벽3시=100)
    sleep_start = lifestyle.get("sleepStart", 24)
    if sleep_start <= 23:
        time_score = 0
    elif sleep_start >= 27:
        time_score = 100
    else:
        time_score = round((sleep_start - 23) / 4 * 100)

    # 잠버릇 심각도 → 0-100 (반전: 조용할수록 높은 점수)
    habit_severity = get_habit_severity(lifestyle.get("sleepHabits"))
    habit_score = 100 - scale_to_100(habit_severity)

    return {
        "noise": scale_to_100(lifestyle.get("noiseLevel", 3)),
        "clean": scale_to_100(lifestyle.get("cleanLevel", 3)),
        "food": scale_to_100(lifestyle.get("foodLevel", 3)),
        "light": scale_to_100(lifestyle.get("lightLevel", 3)),
        "temp": scale_to_100(lifestyle.get("tempLevel", 3)),
        "time": time_score,
        "habit": habit_score,
    }


def check_dormitory_overlap(my_dorms: str, target_dorms: str) -> bool:
    """
    두 사용자의 기숙사 지원 목록에 교집합이 있는지 확인

    Args:
        my_dorms: "성실관,봉사관"
        target_dorms: "봉사관,진리관"

    Returns:
        True if 교집합 존재
    """
    if not my_dorms or not target_dorms:
        return False

    my_set = set(d.strip() for d in my_dorms.split(","))
    target_set = set(d.strip() for d in target_dorms.split(","))

    return bool(my_set & target_set)


def get_common_dormitories(my_dorms: str, target_dorms: str) -> list[str]:
    """
    두 사용자의 공통 기숙사 목록 반환
    """
    if not my_dorms or not target_dorms:
        return []

    my_set = set(d.strip() for d in my_dorms.split(","))
    target_set = set(d.strip() for d in target_dorms.split(","))

    return list(my_set & target_set)

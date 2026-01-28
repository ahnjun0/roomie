"""
매칭 알고리즘 서비스 (v3.1)

핵심 로직:
1. 6만원 게임 가중치 시스템: BASE_WEIGHT + 베팅액으로 가중치 결정
2. 6개 카테고리별 유사도 계산
   - 수면 시간: 단순 시작시간 비교 -> 겹치는 수면 시간 비율(Overlap)로 변경
   - 수면 습관: 심각도 점수 -> 태그 기반 페널티 방식으로 변경
3. 가중 평균으로 최종 점수 산출

공식: Total Score = (Σ(유사도 × 가중치) / Σ가중치) × 100
"""

# ============== 상수 정의 ==============
BASE_WEIGHT = 10.0      # 0원 베팅해도 기본 가중치 10
MAX_SCALE_DIFF = 4.0    # 1~5점 척도의 최대 차이


# ============== 변환 함수 ==============

def convert_sleep_to_minutes(sleep_hour: int) -> int:
    """
    sleepStart (0~30) → 분 단위 (0~1439)로 변환
    기준: 16:00 (value=0) ~ 16:00 다음날 (value=24)
    """
    # 0 -> 16:00 -> 16*60 = 960분
    # 8 -> 24:00 (00:00) -> 24*60 = 1440분 (다음날 0시)
    
    # 계산의 편의를 위해 절대 분(Absolute Minutes)으로 변환
    # 0(16:00)을 0분으로 잡고 계산하는 것이 overlap 계산에 유리함
    return sleep_hour * 60


# ============== 유사도 계산 함수 ==============

def calc_scale_similarity(my_val: int, target_val: int) -> float:
    """
    1~5 척도 항목의 유사도 계산 (궁합형)
    차이 0 → 1.0, 차이 1 → 0.75, ...
    """
    diff = abs(my_val - target_val)
    return max(0.0, 1.0 - (diff / MAX_SCALE_DIFF))


def calc_time_overlap(my_start: int, my_end: int, target_start: int, target_end: int) -> float:
    """
    수면 시간 겹침 비율 계산 (Overlap Ratio)
    
    두 사용자의 수면 구간이 얼마나 겹치는지 계산합니다.
    점수 = (겹치는 시간) / (더 긴 수면 시간)
    
    예:
    나: 23:00~07:00 (8시간)
    상대: 01:00~09:00 (8시간)
    겹침: 01:00~07:00 (6시간)
    점수: 6 / 8 = 0.75
    """
    # 값 보정 (end가 start보다 작으면 다음날로 처리되어야 함. 
    # 입력값(0~30) 자체가 이미 다음날을 포함하므로(24 이상 가능), 
    # start < end 가 보장된다고 가정하거나 보정 필요)
    
    # 입력값은 0~30 범위. 
    # 만약 23~7 이면 입력값은 start=7(23시), end=15(07시) -> 7 < 15 정상
    # 만약 새벽형이라 start=26(02시), end=34(10시) -> 26 < 34 정상
    
    # 겹치는 구간 계산
    overlap_start = max(my_start, target_start)
    overlap_end = min(my_end, target_end)
    
    overlap_duration = max(0, overlap_end - overlap_start)
    
    my_duration = my_end - my_start
    target_duration = target_end - target_start
    
    # 기준 시간: 둘 중 더 긴 수면 시간 (합집합 아님, 기준 분모)
    # 또는 합집합(Union)을 쓸 수도 있으나, 일반적으로 Max Duration 기준이 직관적
    base_duration = max(my_duration, target_duration)
    
    if base_duration == 0:
        return 0.0
        
    return min(1.0, overlap_duration / base_duration)


def calc_habit_similarity(target_habits_str: str | None) -> float:
    """
    잠버릇 태그 기반 유사도 계산 (Penalty System)
    
    상대방의 잠버릇에 따라 점수를 차감합니다.
    - 없음(NONE) 또는 비어있음: 100점 (1.0)
    - 코골이(SNORING), 이갈이(GRINDING): 큰 감점 (-0.4)
    - 잠꼬대(TALKING): 중간 감점 (-0.2)
    - 뒤척임(TOSSING): 작은 감점 (-0.1)
    
    최소 점수는 0점.
    """
    if not target_habits_str or "NONE" in target_habits_str:
        return 1.0
        
    habits = target_habits_str.split(",")
    score = 1.0
    
    for habit in habits:
        habit = habit.strip()
        if habit == "SNORING":
            score -= 0.4
        elif habit == "GRINDING":
            score -= 0.4
        elif habit == "TALKING":
            score -= 0.2
        elif habit == "TOSSING":
            score -= 0.1
            
    return max(0.0, score)


def get_status_text(similarity: float) -> str:
    """유사도에 따른 상태 텍스트 반환"""
    if similarity >= 0.9:
        return "Perfect"
    elif similarity >= 0.7:
        return "Good"
    elif similarity >= 0.4:
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

    # ============== 6개 카테고리 처리 ==============

    categories = [
        # 1. 척도형 항목 (Noise, Clean, Food, Temp)
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
            "key": "temp",
            "weight_key": "weightTemp",
            "my_val": my_lifestyle.get("tempLevel", 3),
            "target_val": target_lifestyle.get("tempLevel", 3),
            "calc_type": "scale"
        },
        # 2. 수면 시간 (Overlap)
        {
            "key": "time",
            "weight_key": "weightTime",
            # dict 전체를 전달하여 start/end 모두 사용
            "my_val": my_lifestyle, 
            "target_val": target_lifestyle,
            "calc_type": "time"
        },
        # 3. 잠버릇 (Penalty)
        {
            "key": "habit",
            "weight_key": "weightHabit",
            "my_val": None, # 내 잠버릇은 매칭 점수에 영향 X (상대가 나를 볼 때 반영됨)
            "target_val": target_lifestyle.get("sleepHabits"),
            "calc_type": "habit"
        },
    ]

    for cat in categories:
        # 가중치 계산: BASE_WEIGHT + 베팅액
        bet_amount = pref.get(cat["weight_key"], 0)
        weight = BASE_WEIGHT + bet_amount

        # 유사도 계산
        similarity = 0.0
        
        if cat["calc_type"] == "time":
            my_ls = cat["my_val"]
            target_ls = cat["target_val"]
            similarity = calc_time_overlap(
                my_ls.get("sleepStart", 24), my_ls.get("sleepEnd", 32),
                target_ls.get("sleepStart", 24), target_ls.get("sleepEnd", 32)
            )
        elif cat["calc_type"] == "habit":
            similarity = calc_habit_similarity(cat["target_val"])
        else:
            # scale 타입
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
    bonus = 0.0
    preference_bonus = {}

    # 국적 선호
    pref_nationality = pref.get("prefNationality")
    target_nationality = target_user.get("nationality")
    nationality_matched = False

    if pref_nationality:
        if pref_nationality == target_nationality:
            bonus += 3
            nationality_matched = True
    else:
        nationality_matched = True # 무관

    preference_bonus["nationality"] = {
        "preference": pref_nationality,
        "target": target_nationality,
        "matched": nationality_matched,
        "bonus": 3 if nationality_matched and pref_nationality else 0
    }

    # 학번 선호
    pref_student_id = pref.get("prefStudentId")
    target_student_id = target_user.get("studentId")
    my_student_id = current_user.get("studentId") if current_user else None
    student_matched = False

    if pref_student_id == "ANY" or pref_student_id is None:
        bonus += 2
        student_matched = True
    elif pref_student_id == "SAME" and my_student_id is not None:
        if target_student_id == my_student_id:
            bonus += 5
            student_matched = True
    elif pref_student_id == "SENIOR" and my_student_id is not None:
        if target_student_id is not None and target_student_id < my_student_id:
            bonus += 5
            student_matched = True
    elif pref_student_id == "JUNIOR" and my_student_id is not None:
        if target_student_id is not None and target_student_id > my_student_id:
            bonus += 5
            student_matched = True

    preference_bonus["studentId"] = {
        "preference": pref_student_id,
        "myStudentId": my_student_id,
        "targetStudentId": target_student_id,
        "matched": student_matched,
        "bonus": bonus - preference_bonus["nationality"]["bonus"]
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
        # 0=16시, 8=24시(자정), 12=04시
        if sleep_start <= 7: # ~23시
            keywords.append("일찍취침")
        elif sleep_start <= 10: # ~02시
            keywords.append("평범취침")
        else:
            keywords.append("새벽취침")

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
            "temp": 50,
            "time": 50,
            "habit": 50,
        }

    # 1-5 스케일 → 0-100 스케일
    def scale_to_100(val: int) -> int:
        return round((val - 1) / 4 * 100)

    # 취침시간 → 0-100 (일찍 잘수록 낮음? 아니면 늦게 잘수록 높음?)
    # 시각적 표현을 위해 늦게 잘수록 높은 값으로 매핑
    # 0(16시) ~ 24(16시)
    sleep_start = lifestyle.get("sleepStart", 24)
    # 20시(4) ~ 04시(12) 사이를 0~100으로 정규화 예시
    # 너무 일찍 자거나 너무 늦게 자는 경우도 있으므로 전체 범위 매핑
    time_score = round((sleep_start / 24) * 100)

    # 잠버릇 심각도 (Penalty 방식과 유사하게 역산)
    # 조용함(100) ~ 시끄러움(0)
    habit_score = int(calc_habit_similarity(lifestyle.get("sleepHabits")) * 100)

    return {
        "noise": scale_to_100(lifestyle.get("noiseLevel", 3)),
        "clean": scale_to_100(lifestyle.get("cleanLevel", 3)),
        "food": scale_to_100(lifestyle.get("foodLevel", 3)),
        "temp": scale_to_100(lifestyle.get("tempLevel", 3)),
        "time": time_score,
        "habit": habit_score,
    }


def check_dormitory_overlap(my_dorms: str, target_dorms: str) -> bool:
    """
    두 사용자의 기숙사 지원 목록에 교집합이 있는지 확인
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
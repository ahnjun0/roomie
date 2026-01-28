import random


def generate_character_nickname(lifestyle: dict, used_nicknames: set) -> str:
    """생활 패턴 기반 캐릭터 닉네임 생성"""
    traits = []

    sleep_start = lifestyle.get("sleepStart", 8)
    sleep_end = lifestyle.get("sleepEnd", 16)
    duration = sleep_end - sleep_start
    if duration < 0:
        duration += 24

    # 취침 시간 특성
    if sleep_start >= 10:  # 새벽 2시 이후
        traits.append(random.choice(["올빼미", "야행성", "새벽감성", "밤의요정", "달빛산책"]))
    elif sleep_start <= 6:  # 밤 10시 이전
        traits.append(random.choice(["아침형인간", "새벽지기", "일찍자요", "얼리버드", "해뜨는맨"]))

    # 수면 시간 특성
    if duration >= 9:
        traits.append(random.choice(["잠만보", "수면왕", "꿀잠러", "잠꾸러기", "동면곰"]))
    elif duration <= 5:
        traits.append(random.choice(["숏슬리퍼", "잠이적은", "에너자이저"]))

    # 청결도
    clean = lifestyle.get("cleanLevel", 3)
    if clean >= 4:
        traits.append(random.choice(["깔끔대장", "청소요정", "정리왕", "반짝이"]))
    elif clean <= 2:
        traits.append(random.choice(["자유영혼", "여유파", "편한게좋아"]))

    # 소음
    noise = lifestyle.get("noiseLevel", 3)
    if noise >= 4:
        traits.append(random.choice(["소음전사", "시끌벅적", "에너지볼"]))
    elif noise <= 2:
        traits.append(random.choice(["고요한숲", "조용이", "차분이"]))

    # 잠버릇
    habits = lifestyle.get("sleepHabits", "NONE")
    if "SNORING" in habits:
        traits.append(random.choice(["우렁코골이", "코골이킹"]))
    elif "GRINDING" in habits:
        traits.append("이갈이장인")
    elif "TALKING" in habits:
        traits.append("잠꼬대러")

    # 흡연
    if lifestyle.get("isSmoker"):
        traits.append(random.choice(["연기달인", "스모키"]))

    # 실내취식
    food = lifestyle.get("foodLevel", 3)
    if food >= 4:
        traits.append(random.choice(["야식러버", "먹보", "배달왕", "야식요정"]))
    elif food <= 2:
        traits.append(random.choice(["절제의달인", "식사는밖에서"]))

    # 온도
    temp = lifestyle.get("tempLevel", 3)
    if temp >= 4:
        traits.append(random.choice(["추위대마왕", "한파전사", "이불밖위험"]))
    elif temp <= 2:
        traits.append(random.choice(["북극곰", "에어컨러버", "시원한게좋아"]))

    # 특성이 없으면 기본 닉네임 사용
    if not traits:
        traits = ["룸메이트", "기숙사생", "동기"]

    # 1~2개 특성 선택 후 조합
    num_traits = min(2, len(traits))
    selected = random.sample(traits, num_traits)
    base_nickname = "".join(selected)

    # 중복 방지: suffix 추가
    nickname = base_nickname
    suffix = random.randint(1, 99)
    nickname = f"{base_nickname}{suffix}"
    attempts = 0
    while nickname in used_nicknames and attempts < 50:
        suffix = random.randint(1, 999)
        nickname = f"{base_nickname}{suffix}"
        attempts += 1

    used_nicknames.add(nickname)
    return nickname


def generate_random_personas(count=200, email_domain="kaist.ac.kr", dorm_list=None):
    if dorm_list is None:
        dorm_list = ["성실관", "봉사관", "진리관", "화원관", "희망관", "사랑관", "소망관", "지혜관", "아름관", "신뢰관", "여울관"]

    personas = []
    used_nicknames: set[str] = set()

    # Constants for randomization
    SLEEP_HABITS_OPTIONS = ["NONE", "SNORING", "GRINDING", "TALKING", "TOSSING"]
    HOME_VISIT_OPTIONS = ["WEEKLY", "BI_WEEKLY", "MONTHLY", "RARELY"]

    # Domain specific prefix to avoid email collision if multiple schools generated in same run
    domain_prefix = email_domain.split('.')[0]

    for i in range(count):
        gender = "MALE" if random.random() < 0.5 else "FEMALE"

        # Filter dorms by gender if names indicate gender, otherwise use all
        gender_dorms = []
        for d in dorm_list:
            if "(남)" in d and gender == "FEMALE": continue
            if "(여)" in d and gender == "MALE": continue
            gender_dorms.append(d)

        if not gender_dorms:
            gender_dorms = dorm_list

        # Basic Info
        email = f"{domain_prefix}_{i+1:03d}@{email_domain}"
        age = random.randint(19, 28)
        student_id = random.randint(18, 25) # 18학번 ~ 25학번
        nationality = "KOREAN" if random.random() < 0.9 else "FOREIGNER"

        # Lifestyle
        # Sleep Start: 0(16:00) ~ 24(16:00 next day)
        # Typical range: 21:00 (5) ~ 04:00 (12)
        sleep_start = random.randint(5, 12)

        # Duration: 5 ~ 10 hours
        duration = random.randint(5, 10)
        sleep_end = sleep_start + duration
        if sleep_end > 24:
             sleep_end = sleep_end % 24

        # Pick 1-2 dorms
        num_dorms = random.randint(1, min(2, len(gender_dorms)))
        my_dorms = ",".join(random.sample(gender_dorms, num_dorms))

        # Habits
        # 70% NONE, 30% others
        if random.random() < 0.7:
            sleep_habits = "NONE"
        else:
            # Pick 1-2 bad habits
            nbh = random.randint(1, 2)
            # Filter out NONE for selection
            bad_habits = [h for h in SLEEP_HABITS_OPTIONS if h != "NONE"]
            sleep_habits = ",".join(random.sample(bad_habits, nbh))

        lifestyle = {
            "dormNames": my_dorms,
            "isSmoker": random.random() < 0.1, # 10% smokers
            "sleepStart": sleep_start,
            "sleepEnd": sleep_end,
            "sleepHabits": sleep_habits,
            "noiseLevel": random.randint(1, 5),
            "cleanLevel": random.randint(1, 5),
            "foodLevel": random.randint(1, 5),
            "tempLevel": random.randint(1, 5),
            "homeVisit": random.choice(HOME_VISIT_OPTIONS)
        }

        # 라이프스타일 기반 캐릭터 닉네임 생성
        nickname = generate_character_nickname(lifestyle, used_nicknames)

        # Preference Weights (Total 60)
        raw_weights = [random.random() for _ in range(6)]
        sum_raw = sum(raw_weights)
        normalized_weights = [int(w / sum_raw * 60) for w in raw_weights]
        diff = 60 - sum(normalized_weights)
        for k in range(diff):
            normalized_weights[k % 6] += 1

        preference = {
            "weightNoise": normalized_weights[0],
            "weightClean": normalized_weights[1],
            "weightFood": normalized_weights[2],
            "weightHabit": normalized_weights[3],
            "weightTime": normalized_weights[4],
            "weightTemp": normalized_weights[5],
            "prefNationality": "KOREAN" if random.random() < 0.8 else None,
            "prefStudentId": random.choice(["SAME", "SENIOR", "JUNIOR", "ANY"])
        }

        persona = {
            "nickname": nickname,
            "email": email,
            "gender": gender,
            "nationality": nationality,
            "age": age,
            "studentId": student_id,
            "lifestyle": lifestyle,
            "preference": preference
        }
        personas.append(persona)

    return personas

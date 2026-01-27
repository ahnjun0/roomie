import random

def generate_random_personas(count=200, email_domain="kaist.ac.kr", dorm_list=None):
    if dorm_list is None:
        dorm_list = ["성실관", "봉사관", "진리관", "화원관", "희망관", "사랑관", "소망관", "지혜관", "아름관", "신뢰관", "여울관"]
    
    personas = []
    
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
        nickname = f"User_{domain_prefix}_{i+1}"
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
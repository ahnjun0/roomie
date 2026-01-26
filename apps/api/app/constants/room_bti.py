"""Room-BTI Constants - 질문 및 동물 매핑 데이터"""

# 12개 질문 (축당 3문항) - 기숙사 생활 밸런스 게임
ROOM_BTI_QUESTIONS = [
    # Axis 1: S vs P (Social vs Private) - Questions 0-2
    {
        "id": 1,
        "axis": "SP",
        "question": "기숙사에서 새 학기가 시작됐을 때",
        "choiceA": "층 사람들과 인사하고 친해지고 싶다",
        "choiceB": "조용히 내 생활을 유지하고 싶다",
    },
    {
        "id": 2,
        "axis": "SP",
        "question": "룸메이트가 방에서 치킨을 먹자고 한다면?",
        "choiceA": "좋아! 같이 먹으면 더 맛있지",
        "choiceB": "냄새 배니까 휴게실 가서 먹자",
    },
    {
        "id": 3,
        "axis": "SP",
        "question": "주말 저녁, 룸메이트와의 시간",
        "choiceA": "함께 영화 보거나 수다 떨기",
        "choiceB": "각자 이어폰 끼고 자기 할 일",
    },

    # Axis 2: C vs F (Clean vs Free) - Questions 3-5
    {
        "id": 4,
        "axis": "CF",
        "question": "책상 위 상태는 어떤 편인가요?",
        "choiceA": "항상 정돈되어 있어야 마음이 편하다",
        "choiceB": "어느 정도 어질러져도 괜찮다",
    },
    {
        "id": 5,
        "axis": "CF",
        "question": "청소는 언제 하나요?",
        "choiceA": "정해진 날에 규칙적으로 한다",
        "choiceB": "더러워지면 그때 한다",
    },
    {
        "id": 6,
        "axis": "CF",
        "question": "룸메이트가 바닥에 옷을 놓아뒀을 때",
        "choiceA": "신경이 많이 쓰인다",
        "choiceB": "크게 신경 쓰이지 않는다",
    },

    # Axis 3: D vs N (Day vs Night) - Questions 6-8
    {
        "id": 7,
        "axis": "DN",
        "question": "가장 집중이 잘 되는 시간은?",
        "choiceA": "아침/오전 시간",
        "choiceB": "밤/새벽 시간",
    },
    {
        "id": 8,
        "axis": "DN",
        "question": "주말 아침, 당신의 모습은?",
        "choiceA": "평소와 비슷하게 일찍 일어난다",
        "choiceB": "늦잠 자는 게 최고다",
    },
    {
        "id": 9,
        "axis": "DN",
        "question": "밤 11시, 룸메이트가 불 끄자고 하면?",
        "choiceA": "좋아! 나도 잘 시간이다",
        "choiceB": "아직 할 게 많은데...",
    },

    # Axis 4: S vs I (Sensitive vs Insensitive) - Questions 9-11
    {
        "id": 10,
        "axis": "SI",
        "question": "룸메이트가 작은 소리로 영상을 볼 때",
        "choiceA": "소리가 신경 쓰인다",
        "choiceB": "별로 신경 안 쓰인다",
    },
    {
        "id": 11,
        "axis": "SI",
        "question": "에어컨/히터 온도 설정에 대해",
        "choiceA": "1도 차이도 민감하게 느낀다",
        "choiceB": "웬만하면 다 괜찮다",
    },
    {
        "id": 12,
        "axis": "SI",
        "question": "룸메이트 알람 소리에",
        "choiceA": "나도 같이 잠에서 깬다",
        "choiceB": "모르고 계속 잔다",
    },
]

# 16가지 동물 유형 매핑
ROOM_BTI_ANIMALS = {
    # S (Social) + C (Clean) 조합
    "SCDS": {
        "animal": "부지런한 미어캣",
        "imageKey": "meerkat",
        "description": "사교적이고 깔끔하며 아침형인 당신! 규칙적인 생활을 하면서 작은 것에도 세심하게 신경 써요. 함께 생활하면 방이 항상 정돈되어 있을 거예요.",
    },
    "SCDI": {
        "animal": "활발한 비버",
        "imageKey": "beaver",
        "description": "사교적이고 깔끔하며 아침형이지만 여유로운 당신! 부지런하면서도 웬만한 건 다 괜찮아서 함께 지내기 편해요.",
    },
    "SCNS": {
        "animal": "꼼꼼한 올빼미",
        "imageKey": "owl",
        "description": "사교적이고 깔끔한 밤형인 당신! 밤에 활동적이지만 청결함을 중시하고 민감한 편이에요. 밤샘 작업도 깔끔하게!",
    },
    "SCNI": {
        "animal": "사교적인 고양이",
        "imageKey": "cat",
        "description": "사교적이고 깔끔한 밤형이면서 둔감한 당신! 깔끔하지만 여유로운 성격으로 자유로운 밤 생활을 즐겨요.",
    },

    # S (Social) + F (Free) 조합
    "SFDS": {
        "animal": "자유로운 강아지",
        "imageKey": "dog",
        "description": "사교적이고 자유분방하며 아침형인 당신! 활발하고 적응력이 좋아서 누구와도 잘 어울려요. 에너지 넘치는 아침형!",
    },
    "SFDI": {
        "animal": "느긋한 카피바라",
        "imageKey": "capybara",
        "description": "사교적이고 자유분방하며 아침형이면서 둔감한 당신! 어디서든 잘 적응하고 스트레스 없이 지내는 타입이에요.",
    },
    "SFNS": {
        "animal": "파티피플 앵무새",
        "imageKey": "parrot",
        "description": "사교적이고 자유분방한 밤형인 당신! 밤에 활발하고 함께 놀기 좋아하지만 주변 환경엔 민감해요.",
    },
    "SFNI": {
        "animal": "마이페이스 하마",
        "imageKey": "hippo",
        "description": "사교적이고 자유분방한 밤형이면서 둔감한 당신! 여유롭고 편안한 분위기 메이커예요. 뭐든 OK!",
    },

    # P (Private) + C (Clean) 조합
    "PCDS": {
        "animal": "깔끔쟁이 다람쥐",
        "imageKey": "squirrel",
        "description": "조용하고 깔끔하며 아침형인 당신! 자기만의 시간을 중시하면서도 깨끗한 환경을 유지해요. 알차게 하루를 시작해요.",
    },
    "PCDI": {
        "animal": "독립적인 고슴도치",
        "imageKey": "hedgehog",
        "description": "조용하고 깔끔하며 아침형이면서 둔감한 당신! 자기 공간을 깔끔하게 유지하며 평화롭게 지내요.",
    },
    "PCNS": {
        "animal": "예민한 여우",
        "imageKey": "fox",
        "description": "조용하고 깔끔한 밤형인 당신! 밤에 혼자 집중하는 걸 좋아하고 환경 변화에 민감해요. 조용한 밤의 사색가!",
    },
    "PCNI": {
        "animal": "신비로운 판다",
        "imageKey": "panda",
        "description": "조용하고 깔끔한 밤형이면서 둔감한 당신! 자기만의 페이스를 유지하며 평화롭게 살아요. 힐링 그 자체!",
    },

    # P (Private) + F (Free) 조합
    "PFDS": {
        "animal": "순한 양",
        "imageKey": "sheep",
        "description": "조용하고 자유분방하며 아침형인 당신! 자기 공간에서 편안하게 지내면서도 규칙적인 생활을 해요.",
    },
    "PFDI": {
        "animal": "평화로운 코알라",
        "imageKey": "koala",
        "description": "조용하고 자유분방하며 아침형이면서 둔감한 당신! 어떤 환경에서도 편안하게 지내는 타입이에요.",
    },
    "PFNS": {
        "animal": "감성적인 토끼",
        "imageKey": "rabbit",
        "description": "조용하고 자유분방한 밤형인 당신! 밤에 자기만의 시간을 즐기고 주변에 민감해요. 감성 충만한 밤의 예술가!",
    },
    "PFNI": {
        "animal": "느긋한 나무늘보",
        "imageKey": "sloth",
        "description": "조용하고 자유분방한 밤형이면서 둔감한 당신! 자기만의 페이스로 여유롭게 살아요. 스트레스? 그게 뭐예요?",
    },
}

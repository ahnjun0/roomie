"""Room-BTI 스키마 정의"""

from pydantic import BaseModel, Field


class RoomBtiQuestion(BaseModel):
    """Room-BTI 질문"""

    id: int
    axis: str
    question: str
    choiceA: str
    choiceB: str


class RoomBtiQuestionsResponse(BaseModel):
    """Room-BTI 질문 목록 응답"""

    questions: list[RoomBtiQuestion]
    total: int


class RoomBtiTestRequest(BaseModel):
    """Room-BTI 테스트 제출 요청

    answers: 12개의 답변 배열 (0=A선택, 1=B선택)
    - answers[0-2]: S vs P 축 (Social vs Private)
    - answers[3-5]: C vs F 축 (Clean vs Free)
    - answers[6-8]: D vs N 축 (Day vs Night)
    - answers[9-11]: S vs I 축 (Sensitive vs Insensitive)
    """

    answers: list[int] = Field(..., min_length=12, max_length=12)


class RoomBtiResultResponse(BaseModel):
    """Room-BTI 테스트 결과 응답"""

    result: str  # "SCDS", "PFNI" 등 4글자 코드
    animal: str  # "부지런한 미어캣"
    description: str  # 설명 텍스트
    imageKey: str  # 프론트엔드 이미지 매핑용 키

    class Config:
        from_attributes = True


class RoomBtiProfileResponse(BaseModel):
    """프로필에 표시할 Room-BTI 정보"""

    roomBtiResult: str | None
    roomBtiAnimal: str | None
    roomBtiDescription: str | None

    class Config:
        from_attributes = True

"""Room-BTI 테스트 API 엔드포인트"""

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.room_bti import (
    RoomBtiQuestionsResponse,
    RoomBtiTestRequest,
    RoomBtiResultResponse,
    RoomBtiProfileResponse,
)
from app.constants.room_bti import ROOM_BTI_QUESTIONS, ROOM_BTI_ANIMALS

router = APIRouter()


def calculate_room_bti(answers: list[int]) -> str:
    """
    Room-BTI 유형 계산

    A 선택 (0) = +1, B 선택 (1) = -1
    양수면 왼쪽 유형, 음수면 오른쪽 유형
    """
    # 각 축별 점수 계산
    sp_score = sum(1 if a == 0 else -1 for a in answers[0:3])  # S vs P
    cf_score = sum(1 if a == 0 else -1 for a in answers[3:6])  # C vs F
    dn_score = sum(1 if a == 0 else -1 for a in answers[6:9])  # D vs N
    si_score = sum(1 if a == 0 else -1 for a in answers[9:12])  # S vs I

    # 유형 결정
    result = ""
    result += "S" if sp_score >= 0 else "P"
    result += "C" if cf_score >= 0 else "F"
    result += "D" if dn_score >= 0 else "N"
    result += "S" if si_score >= 0 else "I"

    return result


@router.get("/questions", response_model=RoomBtiQuestionsResponse)
async def get_room_bti_questions(
    current_user: User = Depends(get_current_user),
):
    """Room-BTI 질문 목록 조회"""
    return RoomBtiQuestionsResponse(
        questions=ROOM_BTI_QUESTIONS,
        total=len(ROOM_BTI_QUESTIONS),
    )


@router.post("/test", response_model=RoomBtiResultResponse)
async def submit_room_bti_test(
    request: RoomBtiTestRequest,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    Room-BTI 테스트 제출 및 결과 저장

    - 12개의 답변을 받아 Room-BTI 유형 계산
    - 결과를 User 테이블에 저장
    - 동물 캐릭터와 설명 반환
    """
    # 답변 유효성 검사 (0 또는 1만 허용)
    for i, answer in enumerate(request.answers):
        if answer not in [0, 1]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "INVALID_ANSWER",
                    "message": f"답변 {i+1}번이 유효하지 않습니다. (0 또는 1만 가능)",
                },
            )

    # Room-BTI 유형 계산
    result = calculate_room_bti(request.answers)

    # 동물 매핑 조회
    animal_data = ROOM_BTI_ANIMALS.get(result)
    if not animal_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "MAPPING_ERROR",
                "message": "유형 매핑 오류가 발생했습니다.",
            },
        )

    # 사용자 Room-BTI 결과 업데이트
    await db.user.update(
        where={"id": current_user.id},
        data={
            "roomBtiResult": result,
            "roomBtiAnimal": animal_data["animal"],
            "roomBtiDescription": animal_data["description"],
        },
    )

    return RoomBtiResultResponse(
        result=result,
        animal=animal_data["animal"],
        description=animal_data["description"],
        imageKey=animal_data["imageKey"],
    )


@router.get("/me", response_model=RoomBtiProfileResponse)
async def get_my_room_bti(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """내 Room-BTI 결과 조회"""
    user = await db.user.find_unique(where={"id": current_user.id})

    return RoomBtiProfileResponse(
        roomBtiResult=user.roomBtiResult if user else None,
        roomBtiAnimal=user.roomBtiAnimal if user else None,
        roomBtiDescription=user.roomBtiDescription if user else None,
    )

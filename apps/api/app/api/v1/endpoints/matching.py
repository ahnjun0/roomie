from fastapi import APIRouter

router = APIRouter()


@router.get("/recommendations")
async def get_recommendations():
    """매칭 추천 목록 조회 (점수순 정렬)"""
    # TODO: 구현 예정
    return {"message": "매칭 추천 API"}


@router.post("/request/{target_user_id}")
async def send_match_request(target_user_id: int):
    """매칭 요청 보내기"""
    # TODO: 구현 예정
    return {"message": f"사용자 {target_user_id}에게 매칭 요청"}


@router.post("/accept/{request_id}")
async def accept_match(request_id: int):
    """매칭 요청 수락"""
    # TODO: 구현 예정
    return {"message": f"매칭 요청 {request_id} 수락"}


@router.post("/reject/{request_id}")
async def reject_match(request_id: int):
    """매칭 요청 거절"""
    # TODO: 구현 예정
    return {"message": f"매칭 요청 {request_id} 거절"}


@router.get("/history")
async def get_match_history():
    """매칭 히스토리 조회"""
    # TODO: 구현 예정
    return {"message": "매칭 히스토리 API"}

from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """현재 사용자 정보 조회"""
    # TODO: 구현 예정
    return {"message": "현재 사용자 정보 API"}


@router.put("/me/profile")
async def update_profile():
    """프로필 업데이트 (기본 정보)"""
    # TODO: 구현 예정
    return {"message": "프로필 업데이트 API"}


@router.put("/me/lifestyle")
async def update_lifestyle():
    """생활 패턴 체크리스트 업데이트"""
    # TODO: 구현 예정
    return {"message": "생활 패턴 업데이트 API"}


@router.put("/me/preferences")
async def update_preferences():
    """상대방 희망 조건 업데이트"""
    # TODO: 구현 예정
    return {"message": "희망 조건 업데이트 API"}


@router.put("/me/weights")
async def update_weights():
    """가중치 설정 (5만원 게임)"""
    # TODO: 구현 예정
    return {"message": "가중치 설정 API"}


@router.get("/{user_id}")
async def get_user(user_id: int):
    """특정 사용자 프로필 조회"""
    # TODO: 구현 예정
    return {"message": f"사용자 {user_id} 정보 API"}

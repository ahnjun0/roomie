from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_dormitories():
    """기숙사 목록 조회"""
    # TODO: 구현 예정
    return {"message": "기숙사 목록 API"}


@router.get("/{dormitory_id}")
async def get_dormitory(dormitory_id: int):
    """기숙사 상세 정보 조회"""
    # TODO: 구현 예정
    return {"message": f"기숙사 {dormitory_id} 정보 API"}

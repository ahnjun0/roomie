from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.post("/register")
async def register():
    """회원가입 (학교 메일 인증)"""
    # TODO: 구현 예정
    return {"message": "회원가입 API"}


@router.post("/login")
async def login():
    """로그인"""
    # TODO: 구현 예정
    return {"message": "로그인 API"}


@router.post("/verify-email")
async def verify_email():
    """이메일 인증 코드 확인"""
    # TODO: 구현 예정
    return {"message": "이메일 인증 API"}


@router.post("/refresh")
async def refresh_token():
    """토큰 갱신"""
    # TODO: 구현 예정
    return {"message": "토큰 갱신 API"}

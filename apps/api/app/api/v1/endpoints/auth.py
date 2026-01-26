from datetime import datetime, timedelta

from cuid2 import cuid_wrapper
from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma

from app.constants.school import get_school_from_email
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_temp_token,
    generate_verification_code,
    get_password_hash,
    temp_tokens,
    verification_codes,
    verify_password,
)
from app.schemas.user import (
    AuthResponse,
    EmailSendRequest,
    EmailSendResponse,
    EmailVerifyRequest,
    EmailVerifyResponse,
    LoginRequest,
    RegisterRequest,
    TokenRefreshRequest,
    TokenResponse,
)
from app.services.email import send_verification_email

router = APIRouter()

# CUID2 생성기
cuid_generator = cuid_wrapper()


@router.post("/send-code", response_model=EmailSendResponse)
async def send_verification_code(request: EmailSendRequest):
    """인증번호 발송"""
    email = request.email

    # 학교 이메일 검증 (예: @univ.ac.kr)
    # 실제 환경에서는 학교 도메인을 설정에서 관리
    # if not email.endswith("@univ.ac.kr"):
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail={"error": "INVALID_EMAIL_DOMAIN", "message": "학교 이메일만 사용 가능합니다."},
    #     )

    # 인증 코드 생성 및 저장
    code = generate_verification_code()
    verification_codes[email] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(seconds=300),
    }

    # 이메일 발송
    email_sent = await send_verification_email(email, code)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "EMAIL_SEND_FAILED", "message": "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요."},
        )

    return EmailSendResponse(message="인증번호가 발송되었습니다.", expiresIn=300)


@router.post("/verify-code", response_model=EmailVerifyResponse)
async def verify_code(request: EmailVerifyRequest):
    """인증번호 확인"""
    email = request.email
    code = request.code

    stored = verification_codes.get(email)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_CODE", "message": "인증번호가 없거나 만료되었습니다."},
        )

    if datetime.utcnow() > stored["expires_at"]:
        del verification_codes[email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "CODE_EXPIRED", "message": "인증번호가 만료되었습니다."},
        )

    if stored["code"] != code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_CODE", "message": "인증번호가 일치하지 않습니다."},
        )

    # 인증 성공 - 임시 토큰 발급
    del verification_codes[email]
    temp_token = generate_temp_token()
    temp_tokens[temp_token] = email

    return EmailVerifyResponse(verified=True, tempToken=temp_token)


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: Prisma = Depends(get_db)):
    """회원가입"""
    # 임시 토큰 검증
    email = temp_tokens.get(request.tempToken)
    if not email or email != request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_TEMP_TOKEN", "message": "유효하지 않은 인증입니다. 이메일 인증을 다시 진행해주세요."},
        )

    # 이메일 도메인에서 학교 식별
    school_name = get_school_from_email(request.email)
    if not school_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "UNSUPPORTED_SCHOOL",
                "message": "지원되지 않는 학교 이메일입니다. 학교 이메일(@xxx.ac.kr)로 가입해주세요.",
            },
        )

    # 이미 가입된 이메일 확인
    try:
        existing_user = await db.user.find_unique(where={"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "DUPLICATE_EMAIL", "message": "이미 가입된 이메일입니다."},
            )

        # 학교 조회 또는 생성
        school = await db.school.find_first(where={"name": school_name})
        if not school:
            # 학교가 DB에 없으면 자동 생성
            email_domain = request.email.split("@")[-1].lower()
            school = await db.school.create(
                data={
                    "name": school_name,
                    "domain": email_domain,
                }
            )

        # 비밀번호 해싱
        hashed_password = get_password_hash(request.password)

        # 사용자 생성 (학교 연결 포함)
        # 주의: Enum 값은 문자열로 전달 (Prisma Client Python이 처리)
        user = await db.user.create(
            data={
                "id": cuid_generator(),  # CUID2로 ID 생성
                "email": request.email,
                "password": hashed_password,
                "nickname": request.nickname,
                "gender": request.gender.value,
                "nationality": request.nationality.value,
                "age": request.age,
                "studentId": request.studentId,
                "schoolId": school.id,  # 학교 연결
            }
        )
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        # HTTPException을 다시 발생시키거나 500 에러로 변환
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "REGISTRATION_FAILED", "message": f"회원가입 처리 중 오류가 발생했습니다: {str(e)}"},
        )

    # 임시 토큰 삭제
    del temp_tokens[request.tempToken]

    # JWT 토큰 생성
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return AuthResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        accessToken=access_token,
        refreshToken=refresh_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Prisma = Depends(get_db)):
    """로그인"""
    user = await db.user.find_unique(where={"email": request.email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 일치하지 않습니다."},
        )

    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 일치하지 않습니다."},
        )

    # JWT 토큰 생성
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return AuthResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        accessToken=access_token,
        refreshToken=refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: TokenRefreshRequest, db: Prisma = Depends(get_db)):
    """토큰 갱신"""
    payload = decode_token(request.refreshToken)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN_TYPE", "message": "리프레시 토큰이 아닙니다."},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN", "message": "유효하지 않은 토큰입니다."},
        )

    # 사용자 존재 확인
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "사용자를 찾을 수 없습니다."},
        )

    # 새 토큰 발급
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(accessToken=access_token, refreshToken=new_refresh_token)

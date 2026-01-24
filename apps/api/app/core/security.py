from datetime import datetime, timedelta
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from prisma import Prisma

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# 인증 코드 저장소 (실제 환경에서는 Redis 사용 권장)
verification_codes: dict[str, dict] = {}
temp_tokens: dict[str, str] = {}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """비밀번호 해싱"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """JWT 리프레시 토큰 생성"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def generate_verification_code() -> str:
    """6자리 인증 코드 생성"""
    return "".join([str(secrets.randbelow(10)) for _ in range(6)])


def generate_temp_token() -> str:
    """임시 토큰 생성"""
    return secrets.token_urlsafe(32)


def decode_token(token: str) -> dict:
    """JWT 토큰 디코딩"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "TOKEN_EXPIRED", "message": "토큰이 만료되었거나 유효하지 않습니다."},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Prisma = Depends(get_db),
):
    """현재 인증된 사용자 조회"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN_TYPE", "message": "액세스 토큰이 아닙니다."},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_TOKEN", "message": "유효하지 않은 토큰입니다."},
        )

    user = await db.user.find_unique(where={"id": int(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "사용자를 찾을 수 없습니다."},
        )

    return user

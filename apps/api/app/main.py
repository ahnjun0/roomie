from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 생명주기 관리 - Prisma 연결/해제"""
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title="Roomie API",
    description="룸메이트 매칭 플랫폼 API",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "version": "0.1.0"}


# API 라우터 등록
app.include_router(api_router, prefix="/api/v1")

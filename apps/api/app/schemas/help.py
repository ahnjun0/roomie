"""
헬프 요청 게시판 (Help Center) 스키마

카테고리:
- BUG: 벌레 퇴치 요청 (학생 간 1:1 채팅 연결)
- REPAIR: 고장 신고 (관리실 소통 위주)
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class HelpCategory(str, Enum):
    """헬프 요청 카테고리"""
    BUG = "BUG"        # 벌레 퇴치
    REPAIR = "REPAIR"  # 고장 신고


class HelpStatus(str, Enum):
    """헬프 요청 상태"""
    OPEN = "OPEN"      # 진행 중
    SOLVED = "SOLVED"  # 해결 완료


# ============== 작성자 정보 (채팅 연동용) ==============

class HelpPostAuthor(BaseModel):
    """
    게시글 작성자 정보

    중요: 프론트엔드에서 '채팅하기' 버튼 작동을 위해
    작성자의 id가 반드시 포함되어야 함
    """
    id: str
    nickname: str | None

    class Config:
        from_attributes = True


# ============== Request Models ==============

class HelpPostCreate(BaseModel):
    """헬프 요청 게시글 생성"""
    category: HelpCategory
    title: str = Field(..., min_length=1, max_length=100, description="제목")
    content: str = Field(..., min_length=1, max_length=2000, description="내용")
    images: list[str] = Field(default=[], max_length=5, description="이미지 URL 리스트 (최대 5개)")


class HelpPostStatusUpdate(BaseModel):
    """게시글 상태 변경"""
    status: HelpStatus


# ============== Response Models ==============

class HelpPostResponse(BaseModel):
    """
    헬프 요청 게시글 응답

    중요: author 필드에 작성자 정보가 포함됨
    - author.id: 채팅방 생성 시 상대방 ID로 사용
    - author.nickname: UI 표시용
    """
    id: str
    authorId: str                    # 작성자 ID (채팅 연동용)
    author: HelpPostAuthor           # 작성자 상세 정보
    category: HelpCategory
    title: str
    content: str
    images: list[str]
    status: HelpStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class HelpPostListResponse(BaseModel):
    """헬프 요청 목록 응답 (페이지네이션 포함)"""
    total: int
    page: int
    limit: int
    data: list[HelpPostResponse]

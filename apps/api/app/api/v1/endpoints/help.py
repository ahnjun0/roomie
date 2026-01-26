"""
헬프 요청 게시판 (Help Center) API

엔드포인트:
- POST /help: 게시글 작성
- GET /help: 게시글 목록 조회 (필터링, 페이지네이션)
- GET /help/{post_id}: 게시글 상세 조회
- PATCH /help/{post_id}/status: 상태 변경 (작성자 본인만)
"""

from cuid2 import cuid_wrapper
from fastapi import APIRouter, Depends, HTTPException, Query, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.help import (
    HelpCategory,
    HelpPostAuthor,
    HelpPostCreate,
    HelpPostListResponse,
    HelpPostResponse,
    HelpPostStatusUpdate,
    HelpStatus,
)

router = APIRouter()

# CUID2 생성기
cuid_generator = cuid_wrapper()


def _build_help_post_response(post) -> HelpPostResponse:
    """DB 모델을 Response 모델로 변환"""
    return HelpPostResponse(
        id=post.id,
        authorId=post.authorId,
        author=HelpPostAuthor(
            id=post.author.id,
            nickname=post.author.nickname,
        ),
        category=HelpCategory(post.category),
        title=post.title,
        content=post.content,
        images=post.images or [],
        status=HelpStatus(post.status),
        createdAt=post.createdAt,
        updatedAt=post.updatedAt,
    )


@router.post("", response_model=HelpPostResponse, status_code=status.HTTP_201_CREATED)
async def create_help_post(
    request: HelpPostCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    헬프 요청 게시글 작성

    - BUG: 벌레 퇴치 요청 (다른 학생이 '도와줄게요' 클릭 → 채팅 연결)
    - REPAIR: 고장 신고 (관리실 확인용)
    """
    post = await db.helppost.create(
        data={
            "id": cuid_generator(),
            "authorId": current_user.id,
            "category": request.category.value,
            "title": request.title,
            "content": request.content,
            "images": request.images,
        },
        include={"author": True},
    )

    return _build_help_post_response(post)


@router.get("", response_model=HelpPostListResponse)
async def get_help_posts(
    category: HelpCategory | None = Query(None, description="카테고리 필터 (BUG/REPAIR)"),
    post_status: HelpStatus | None = Query(None, alias="status", description="상태 필터 (OPEN/SOLVED)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 개수"),
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    헬프 요청 게시글 목록 조회

    필터링:
    - category: BUG(벌레퇴치) / REPAIR(고장신고)
    - status: OPEN(진행중) / SOLVED(해결됨)

    정렬: 최신순
    """
    # 필터 조건 구성
    where = {}

    # 같은 학교만 조회 (schoolId가 있는 경우)
    if current_user.schoolId:
        where["author"] = {"schoolId": current_user.schoolId}

    if category:
        where["category"] = category.value

    if post_status:
        where["status"] = post_status.value

    # 전체 개수 조회
    total = await db.helppost.count(where=where)

    # 페이지네이션 적용하여 목록 조회
    skip = (page - 1) * limit
    posts = await db.helppost.find_many(
        where=where,
        include={"author": True},
        order={"createdAt": "desc"},
        skip=skip,
        take=limit,
    )

    # Response 변환
    data = [_build_help_post_response(post) for post in posts]

    return HelpPostListResponse(
        total=total,
        page=page,
        limit=limit,
        data=data,
    )


@router.get("/{post_id}", response_model=HelpPostResponse)
async def get_help_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """헬프 요청 게시글 상세 조회"""
    post = await db.helppost.find_unique(
        where={"id": post_id},
        include={"author": True},
    )

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "POST_NOT_FOUND", "message": "게시글을 찾을 수 없습니다."},
        )

    # 같은 학교인지 확인 (schoolId가 있는 경우에만)
    if current_user.schoolId and post.author.schoolId:
        if current_user.schoolId != post.author.schoolId:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "DIFFERENT_SCHOOL", "message": "같은 학교의 게시글만 조회할 수 있습니다."},
            )

    return _build_help_post_response(post)


@router.patch("/{post_id}/status", response_model=HelpPostResponse)
async def update_help_post_status(
    post_id: str,
    request: HelpPostStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """
    게시글 상태 변경 (작성자 본인만 가능)

    - OPEN → SOLVED: 해결 완료 처리
    """
    # 게시글 조회
    post = await db.helppost.find_unique(
        where={"id": post_id},
        include={"author": True},
    )

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "POST_NOT_FOUND", "message": "게시글을 찾을 수 없습니다."},
        )

    # 작성자 본인 확인
    if post.authorId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "NOT_AUTHOR", "message": "게시글 작성자만 상태를 변경할 수 있습니다."},
        )

    # 상태 업데이트
    updated_post = await db.helppost.update(
        where={"id": post_id},
        data={"status": request.status.value},
        include={"author": True},
    )

    return _build_help_post_response(updated_post)

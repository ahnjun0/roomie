from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.delivery import (
    DeliveryPostCreate,
    DeliveryPostListItem,
    DeliveryPostListResponse,
    DeliveryPostResponse,
    DeliveryAuthor,
    DeliveryParticipantInfo,
)

router = APIRouter()


@router.post("", response_model=DeliveryPostResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery_post(
    request: DeliveryPostCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 모집글 생성"""
    post = await db.deliverypost.create(
        data={
            "title": request.title,
            "content": request.content,
            "foodCategory": request.foodCategory,
            "orderLink": request.orderLink,
            "bankAccount": request.bankAccount,
            "maxParticipants": request.maxParticipants,
            "authorId": current_user.id,
            "participants": {"create": [{"userId": current_user.id}]},
        },
        include={"author": True, "participants": {"include": {"user": True}}},
    )

    return DeliveryPostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        foodCategory=post.foodCategory,
        orderLink=post.orderLink,
        bankAccount=post.bankAccount,
        maxParticipants=post.maxParticipants,
        isClosed=post.isClosed,
        createdAt=post.createdAt,
        author=DeliveryAuthor(id=post.author.id, nickname=post.author.nickname),
        participants=[
            DeliveryParticipantInfo(id=p.user.id, nickname=p.user.nickname)
            for p in post.participants
            if p.user
        ],
    )


@router.get("", response_model=DeliveryPostListResponse)
async def list_delivery_posts(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 모집글 목록"""
    try:
        posts = await db.deliverypost.find_many(
            order={"createdAt": "desc"},
            include={"author": True, "participants": True},
        )
    except Exception:
        # 테이블이 아직 마이그레이션되지 않은 경우 빈 목록 반환
        return DeliveryPostListResponse(data=[])

    return DeliveryPostListResponse(
        data=[
            DeliveryPostListItem(
                id=post.id,
                title=post.title,
                foodCategory=post.foodCategory,
                maxParticipants=post.maxParticipants,
                isClosed=post.isClosed,
                createdAt=post.createdAt,
                author=DeliveryAuthor(
                    id=post.author.id, nickname=post.author.nickname
                ),
                participantCount=len(post.participants),
            )
            for post in posts
        ]
    )


@router.get("/{delivery_post_id}", response_model=DeliveryPostResponse)
async def get_delivery_post(
    delivery_post_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 모집글 상세"""
    post = await db.deliverypost.find_unique(
        where={"id": delivery_post_id},
        include={
            "author": True,
            "participants": {"include": {"user": True}},
        },
    )

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "모집글을 찾을 수 없습니다."},
        )

    return DeliveryPostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        foodCategory=post.foodCategory,
        orderLink=post.orderLink,
        bankAccount=post.bankAccount,
        maxParticipants=post.maxParticipants,
        isClosed=post.isClosed,
        createdAt=post.createdAt,
        author=DeliveryAuthor(id=post.author.id, nickname=post.author.nickname),
        participants=[
            DeliveryParticipantInfo(id=p.user.id, nickname=p.user.nickname)
            for p in post.participants
            if p.user
        ],
    )


@router.post("/{delivery_post_id}/join", status_code=status.HTTP_200_OK)
async def join_delivery_post(
    delivery_post_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 참여"""
    post = await db.deliverypost.find_unique(
        where={"id": delivery_post_id},
        include={"participants": True},
    )
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "모집글을 찾을 수 없습니다."},
        )
    if post.isClosed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "CLOSED", "message": "이미 마감된 모집글입니다."},
        )

    if any(p.userId == current_user.id for p in post.participants):
        return {"message": "이미 참여 중입니다."}

    if len(post.participants) >= post.maxParticipants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "FULL", "message": "참여 인원이 가득 찼습니다."},
        )

    await db.deliveryparticipant.create(
        data={"deliveryPostId": delivery_post_id, "userId": current_user.id}
    )

    return {"message": "참여가 완료되었습니다."}


@router.post("/{delivery_post_id}/leave", status_code=status.HTTP_200_OK)
async def leave_delivery_post(
    delivery_post_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 나가기"""
    post = await db.deliverypost.find_unique(where={"id": delivery_post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "모집글을 찾을 수 없습니다."},
        )

    if post.authorId == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "AUTHOR_CANNOT_LEAVE", "message": "방장은 나갈 수 없습니다."},
        )

    participation = await db.deliveryparticipant.find_first(
        where={"deliveryPostId": delivery_post_id, "userId": current_user.id}
    )
    if not participation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_PARTICIPANT", "message": "참여 중이 아닙니다."},
        )

    await db.deliveryparticipant.delete(where={"id": participation.id})

    return {"message": "나가기가 완료되었습니다."}


@router.post("/{delivery_post_id}/close", status_code=status.HTTP_200_OK)
async def close_delivery_post(
    delivery_post_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """배달 파티 마감"""
    post = await db.deliverypost.find_unique(where={"id": delivery_post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": "모집글을 찾을 수 없습니다."},
        )

    if post.authorId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "방장만 마감할 수 있습니다."},
        )

    if post.isClosed:
        return {"message": "이미 마감되었습니다."}

    await db.deliverypost.update(
        where={"id": delivery_post_id},
        data={"isClosed": True},
    )

    return {"message": "모집이 마감되었습니다."}

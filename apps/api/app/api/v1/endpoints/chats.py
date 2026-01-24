from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.chat import (
    ChatParticipantInfo,
    ChatRoomCreate,
    ChatRoomListItem,
    ChatRoomListResponse,
    ChatRoomResponse,
    LastMessage,
    MessageCreate,
    MessageListResponse,
    MessageResponse,
)

router = APIRouter()


@router.post("", response_model=ChatRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_room(
    request: ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """채팅방 생성"""
    # 자기 자신과 채팅 불가
    if request.targetUserId == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_TARGET", "message": "자신과 채팅할 수 없습니다."},
        )

    # 대상 사용자 존재 확인
    target_user = await db.user.find_unique(where={"id": request.targetUserId})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "USER_NOT_FOUND", "message": "대상 사용자를 찾을 수 없습니다."},
        )

    # 기존 채팅방 확인 (이미 두 사용자 간 채팅방이 있는지)
    existing_room = await db.chatroom.find_first(
        where={
            "participants": {
                "every": {"userId": {"in": [current_user.id, request.targetUserId]}}
            }
        },
        include={"participants": True},
    )

    # 기존 채팅방이 있고, 참가자가 정확히 2명이면 해당 채팅방 반환
    if existing_room and len(existing_room.participants) == 2:
        participant_ids = {p.userId for p in existing_room.participants}
        if participant_ids == {current_user.id, request.targetUserId}:
            return ChatRoomResponse(
                chatRoomId=existing_room.id,
                participants=[current_user.id, request.targetUserId],
                createdAt=existing_room.createdAt,
            )

    # 새 채팅방 생성
    chat_room = await db.chatroom.create(
        data={
            "participants": {
                "create": [
                    {"userId": current_user.id},
                    {"userId": request.targetUserId},
                ]
            }
        }
    )

    return ChatRoomResponse(
        chatRoomId=chat_room.id,
        participants=[current_user.id, request.targetUserId],
        createdAt=chat_room.createdAt,
    )


@router.get("", response_model=ChatRoomListResponse)
async def get_chat_rooms(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """채팅방 목록 조회"""
    # 내가 참여한 채팅방 조회
    participations = await db.chatparticipant.find_many(
        where={"userId": current_user.id},
        include={
            "chatRoom": {
                "include": {
                    "participants": {"include": {"user": True}},
                    "messages": {"orderBy": {"createdAt": "desc"}, "take": 1},
                }
            }
        },
    )

    rooms = []
    for participation in participations:
        chat_room = participation.chatRoom

        # 상대방 정보 찾기
        other_participant = None
        for p in chat_room.participants:
            if p.userId != current_user.id:
                other_participant = p.user
                break

        if not other_participant:
            continue

        # 마지막 메시지
        last_message = None
        if chat_room.messages:
            msg = chat_room.messages[0]
            last_message = LastMessage(content=msg.content, createdAt=msg.createdAt)

        # TODO: 읽지 않은 메시지 수 계산 (현재는 0으로 고정)
        unread_count = 0

        rooms.append(
            ChatRoomListItem(
                chatRoomId=chat_room.id,
                participant=ChatParticipantInfo(
                    id=other_participant.id, nickname=other_participant.nickname
                ),
                lastMessage=last_message,
                unreadCount=unread_count,
            )
        )

    return ChatRoomListResponse(data=rooms)


@router.get("/{chat_room_id}/messages", response_model=MessageListResponse)
async def get_messages(
    chat_room_id: str,
    before: str | None = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """채팅 메시지 조회"""
    # 채팅방 존재 및 권한 확인
    participation = await db.chatparticipant.find_first(
        where={"chatRoomId": chat_room_id, "userId": current_user.id}
    )

    if not participation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "이 채팅방에 접근할 수 없습니다."},
        )

    # 메시지 조회
    where_clause = {"chatRoomId": chat_room_id}
    if before:
        where_clause["createdAt"] = {"lt": before}

    messages = await db.chatmessage.find_many(
        where=where_clause,
        order={"createdAt": "desc"},
        take=limit,
    )

    # 오래된 순으로 정렬
    messages.reverse()

    return MessageListResponse(
        data=[
            MessageResponse(
                id=msg.id,
                senderId=msg.senderId,
                content=msg.content,
                createdAt=msg.createdAt,
            )
            for msg in messages
        ]
    )


@router.post(
    "/{chat_room_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    chat_room_id: str,
    request: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db),
):
    """메시지 전송"""
    # 채팅방 존재 및 권한 확인
    participation = await db.chatparticipant.find_first(
        where={"chatRoomId": chat_room_id, "userId": current_user.id}
    )

    if not participation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "FORBIDDEN", "message": "이 채팅방에 접근할 수 없습니다."},
        )

    # 메시지 생성
    message = await db.chatmessage.create(
        data={
            "chatRoomId": chat_room_id,
            "senderId": current_user.id,
            "content": request.content,
        }
    )

    return MessageResponse(
        id=message.id,
        senderId=message.senderId,
        content=message.content,
        createdAt=message.createdAt,
    )

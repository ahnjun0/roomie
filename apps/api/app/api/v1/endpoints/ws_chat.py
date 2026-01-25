"""
WebSocket 실시간 채팅 엔드포인트

메시지 타입:
- join: 채팅방 참가
- leave: 채팅방 퇴장
- message: 메시지 전송
- typing: 타이핑 중 알림
- read: 메시지 읽음 처리
"""

import json
from datetime import datetime

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from prisma import Prisma

from app.core.config import settings
from app.core.database import get_db
from app.core.websocket import manager

router = APIRouter()


async def get_user_from_token(token: str, db: Prisma) -> int | None:
    """JWT 토큰에서 사용자 ID 추출"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        return None


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket 채팅 엔드포인트

    연결: ws://localhost:8000/api/v1/ws/chat?token={accessToken}

    메시지 형식 (JSON):
    - 채팅방 참가: {"type": "join", "chatRoomId": "room-uuid"}
    - 메시지 전송: {"type": "message", "chatRoomId": "room-uuid", "content": "안녕하세요"}
    - 타이핑 알림: {"type": "typing", "chatRoomId": "room-uuid"}
    - 채팅방 퇴장: {"type": "leave", "chatRoomId": "room-uuid"}
    """
    # DB 연결
    db = Prisma()
    await db.connect()

    try:
        # 토큰 검증
        user_id = await get_user_from_token(token, db)
        if user_id is None:
            await websocket.close(code=4001, reason="Invalid token")
            return

        # 사용자 존재 확인
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return

        # WebSocket 연결 수락
        await manager.connect(websocket, user_id)

        # 연결 성공 메시지
        await websocket.send_json({
            "type": "connected",
            "data": {"userId": user_id, "message": "WebSocket 연결 성공"}
        })

        # 메시지 수신 루프
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            chat_room_id = data.get("chatRoomId")

            # ========== 채팅방 참가 ==========
            if msg_type == "join":
                if not chat_room_id:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "chatRoomId가 필요합니다."}
                    })
                    continue

                # 채팅방 권한 확인
                participation = await db.chatparticipant.find_first(
                    where={"chatRoomId": chat_room_id, "userId": user_id}
                )
                if not participation:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "이 채팅방에 접근 권한이 없습니다."}
                    })
                    continue

                # 채팅방 참가
                manager.join_room(chat_room_id, user_id)

                # 참가 알림 브로드캐스트
                await manager.broadcast_to_room(
                    chat_room_id,
                    {
                        "type": "user_joined",
                        "data": {
                            "userId": user_id,
                            "nickname": user.nickname,
                            "chatRoomId": chat_room_id,
                        }
                    }
                )

                # 본인에게 참가 확인
                await websocket.send_json({
                    "type": "joined",
                    "data": {
                        "chatRoomId": chat_room_id,
                        "onlineUsers": manager.get_room_online_users(chat_room_id)
                    }
                })

            # ========== 메시지 전송 ==========
            elif msg_type == "message":
                content = data.get("content", "").strip()

                if not chat_room_id or not content:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "chatRoomId와 content가 필요합니다."}
                    })
                    continue

                # 채팅방 권한 확인
                participation = await db.chatparticipant.find_first(
                    where={"chatRoomId": chat_room_id, "userId": user_id}
                )
                if not participation:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "메시지를 보낼 권한이 없습니다."}
                    })
                    continue

                # DB에 메시지 저장
                message = await db.chatmessage.create(
                    data={
                        "chatRoomId": chat_room_id,
                        "senderId": user_id,
                        "content": content,
                    }
                )

                # 메시지 브로드캐스트 (본인 포함)
                message_data = {
                    "type": "new_message",
                    "data": {
                        "id": message.id,
                        "chatRoomId": chat_room_id,
                        "senderId": user_id,
                        "senderNickname": user.nickname,
                        "content": content,
                        "createdAt": message.createdAt.isoformat(),
                    }
                }
                await manager.broadcast_to_room(chat_room_id, message_data)

            # ========== 타이핑 알림 ==========
            elif msg_type == "typing":
                if not chat_room_id:
                    continue

                # 타이핑 알림 브로드캐스트 (본인 제외)
                await manager.broadcast_to_room(
                    chat_room_id,
                    {
                        "type": "typing",
                        "data": {
                            "userId": user_id,
                            "nickname": user.nickname,
                            "chatRoomId": chat_room_id,
                        }
                    },
                    exclude_user=user_id
                )

            # ========== 채팅방 퇴장 ==========
            elif msg_type == "leave":
                if chat_room_id:
                    manager.leave_room(chat_room_id, user_id)

                    # 퇴장 알림 브로드캐스트
                    await manager.broadcast_to_room(
                        chat_room_id,
                        {
                            "type": "user_left",
                            "data": {
                                "userId": user_id,
                                "chatRoomId": chat_room_id,
                            }
                        }
                    )

            # ========== 알 수 없는 타입 ==========
            else:
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": f"알 수 없는 메시지 타입: {msg_type}"}
                })

    except WebSocketDisconnect:
        # 연결 해제 처리
        manager.disconnect(user_id)

    except Exception as e:
        # 예외 처리
        manager.disconnect(user_id)
        print(f"WebSocket error: {e}")

    finally:
        await db.disconnect()

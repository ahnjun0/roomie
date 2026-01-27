import json
from datetime import datetime
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from prisma import Prisma

from app.core.config import settings
from app.core.websocket import manager

# 중요: API Router 설정
router = APIRouter()

async def get_user_from_token(token: str) -> str | None:
    """JWT 토큰에서 사용자 ID 추출 (DB 연결 없이 처리)"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        return None

def _extract_token_from_headers(websocket: WebSocket) -> str | None:
    auth_header = websocket.headers.get("authorization")
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return auth_header

# 👇 [수정됨] URL 경로에 {chat_room_id}를 포함시켰습니다.
@router.websocket("/ws/chats/{chat_room_id}")
async def websocket_chat(
    websocket: WebSocket,
    chat_room_id: str,
    token: str | None = Query(None),  # Postman의 Params에서 token을 받음
):
    """
    WebSocket 채팅 엔드포인트 (방 전용)
    연결 URL: ws://도메인/ws/chats/{방UUID}?token={액세스토큰}
    """
    
    # 1. DB 연결
    db = Prisma()
    await db.connect()

    try:
        # 2. 토큰 검증
        resolved_token = token or _extract_token_from_headers(websocket)
        user_id = await get_user_from_token(resolved_token) if resolved_token else None
        if user_id is None:
            await websocket.close(code=4003, reason="Invalid token") # 4003: Forbidden
            return

        # 3. 사용자 및 채팅방 권한 확인 (접속 단계에서 바로 체크)
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            await websocket.close(code=4003, reason="User not found")
            return

        # 이 유저가 진짜 이 방 멤버인지 확인
        participation = await db.chatparticipant.find_first(
            where={"chatRoomId": chat_room_id, "userId": user_id}
        )
        
        if not participation:
            # 멤버가 아니면 연결 거부
            print(f"User {user_id} is not a member of room {chat_room_id}")
            await websocket.close(code=4003, reason="Not a member")
            return

        # 4. 연결 수락 및 방 입장 (자동 Join)
        await manager.connect(websocket, user_id)
        manager.join_room(chat_room_id, user_id) # 여기서 바로 방에 넣음

        # 입장 알림 브로드캐스트
        await manager.broadcast_to_room(
            chat_room_id,
            {
                "type": "user_joined",
                "data": {
                    "userId": user_id,
                    "nickname": user.nickname,
                    "message": "님이 입장하셨습니다."
                }
            }
        )

        # 5. 메시지 수신 루프
        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")
                
                # [메시지 전송]
                if msg_type == "message":
                    content = data.get("content", "").strip()
                    if not content:
                        continue

                    # DB 저장
                    message = await db.chatmessage.create(
                        data={
                            "chatRoomId": chat_room_id,
                            "senderId": user_id,
                            "content": content,
                        }
                    )

                    # 같은 방 사람들에게 전송
                    await manager.broadcast_to_room(
                        chat_room_id,
                        {
                            "type": "new_message",
                            "data": {
                                "id": message.id,
                                "senderId": user_id,
                                "senderNickname": user.nickname,
                                "content": content,
                                "createdAt": message.createdAt.isoformat(),
                            }
                        }
                    )

                # [타이핑 중]
                elif msg_type == "typing":
                    await manager.broadcast_to_room(
                        chat_room_id,
                        {"type": "typing", "data": {"userId": user_id, "nickname": user.nickname}},
                        exclude_user=user_id
                    )

        except WebSocketDisconnect:
            # 연결 끊김 처리
            manager.leave_room(chat_room_id, user_id)
            manager.disconnect(user_id)
            # 퇴장 알림 필요하면 여기서 브로드캐스트

    except Exception as e:
        print(f"WebSocket Error: {e}")
        await websocket.close(code=1011) # Internal Error
    
    finally:
        if db.is_connected():
            await db.disconnect()

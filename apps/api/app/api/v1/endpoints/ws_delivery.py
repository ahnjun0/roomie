from datetime import datetime

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from prisma import Prisma

from app.core.config import settings

router = APIRouter()


class DeliveryConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.room_members: dict[str, set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

        for room_id in list(self.room_members.keys()):
            self.room_members[room_id].discard(user_id)
            if not self.room_members[room_id]:
                del self.room_members[room_id]

    def join_room(self, room_id: str, user_id: str):
        if room_id not in self.room_members:
            self.room_members[room_id] = set()
        self.room_members[room_id].add(user_id)

    def leave_room(self, room_id: str, user_id: str):
        if room_id in self.room_members:
            self.room_members[room_id].discard(user_id)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str | None = None):
        if room_id not in self.room_members:
            return

        for user_id in self.room_members[room_id]:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal_message(message, user_id)


manager = DeliveryConnectionManager()


async def get_user_from_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
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


@router.websocket("/ws/delivery/{delivery_post_id}")
async def websocket_delivery(
    websocket: WebSocket,
    delivery_post_id: str,
    token: str | None = Query(None),
):
    """배달 파티 전용 WebSocket"""
    db = Prisma()
    await db.connect()

    try:
        resolved_token = token or _extract_token_from_headers(websocket)
        user_id = await get_user_from_token(resolved_token) if resolved_token else None
        if user_id is None:
            await websocket.close(code=4003, reason="Invalid token")
            return

        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            await websocket.close(code=4003, reason="User not found")
            return

        post = await db.deliverypost.find_unique(where={"id": delivery_post_id})
        if not post:
            await websocket.close(code=4004, reason="Post not found")
            return

        participation = await db.deliveryparticipant.find_first(
            where={"deliveryPostId": delivery_post_id, "userId": user_id}
        )
        if not participation:
            await websocket.close(code=4003, reason="Not a participant")
            return

        await manager.connect(websocket, user_id)
        manager.join_room(delivery_post_id, user_id)

        await manager.broadcast_to_room(
            delivery_post_id,
            {
                "type": "system",
                "data": {
                    "message": f"{user.nickname or '익명'}님이 배달 파티에 참여했습니다.",
                    "userId": user_id,
                },
            },
        )

        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "message":
                    content = data.get("content", "").strip()
                    if not content:
                        continue

                    message = await db.deliverymessage.create(
                        data={
                            "deliveryPostId": delivery_post_id,
                            "senderId": user_id,
                            "content": content,
                        }
                    )

                    await manager.broadcast_to_room(
                        delivery_post_id,
                        {
                            "type": "message",
                            "data": {
                                "id": message.id,
                                "senderId": user_id,
                                "senderNickname": user.nickname,
                                "content": content,
                                "createdAt": message.createdAt.isoformat(),
                            },
                        },
                    )

        except WebSocketDisconnect:
            manager.leave_room(delivery_post_id, user_id)
            manager.disconnect(user_id)

    except Exception:
        await websocket.close(code=1011)

    finally:
        if db.is_connected():
            await db.disconnect()

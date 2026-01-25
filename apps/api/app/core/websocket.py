"""
WebSocket 연결 관리자

실시간 채팅을 위한 WebSocket 연결 관리
- 사용자별 연결 관리
- 채팅방별 브로드캐스트
- 연결/해제 처리
"""

import json
from datetime import datetime
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """WebSocket 연결 관리 클래스"""

    def __init__(self):
        # user_id -> WebSocket 연결
        self.active_connections: dict[int, WebSocket] = {}
        # chat_room_id -> set of user_ids
        self.room_members: dict[str, set[int]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """새 WebSocket 연결 수락"""
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        """WebSocket 연결 해제"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]

        # 모든 채팅방에서 사용자 제거
        for room_id in list(self.room_members.keys()):
            self.room_members[room_id].discard(user_id)
            # 빈 방 정리
            if not self.room_members[room_id]:
                del self.room_members[room_id]

    def join_room(self, room_id: str, user_id: int):
        """채팅방 참가"""
        if room_id not in self.room_members:
            self.room_members[room_id] = set()
        self.room_members[room_id].add(user_id)

    def leave_room(self, room_id: str, user_id: int):
        """채팅방 퇴장"""
        if room_id in self.room_members:
            self.room_members[room_id].discard(user_id)

    async def send_personal_message(self, message: dict, user_id: int):
        """특정 사용자에게 메시지 전송"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

    async def broadcast_to_room(
        self, room_id: str, message: dict, exclude_user: int | None = None
    ):
        """채팅방의 모든 참가자에게 메시지 브로드캐스트"""
        if room_id not in self.room_members:
            return

        for user_id in self.room_members[room_id]:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal_message(message, user_id)

    def is_user_online(self, user_id: int) -> bool:
        """사용자 온라인 상태 확인"""
        return user_id in self.active_connections

    def get_room_online_users(self, room_id: str) -> list[int]:
        """채팅방의 온라인 사용자 목록"""
        if room_id not in self.room_members:
            return []
        return [
            uid
            for uid in self.room_members[room_id]
            if uid in self.active_connections
        ]


# 전역 인스턴스
manager = ConnectionManager()


def serialize_datetime(obj: Any) -> Any:
    """datetime 객체를 ISO 형식 문자열로 변환"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

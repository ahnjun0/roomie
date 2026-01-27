from fastapi import APIRouter

from app.api.v1.endpoints import auth, chats, contract, delivery, dormitories, help, matching, reviews, room_bti, schools, users, ws_chat, ws_delivery, admin


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(matching.router, prefix="/matching", tags=["매칭"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["리뷰"])
api_router.include_router(chats.router, prefix="/chats", tags=["채팅"])
api_router.include_router(contract.router, prefix="/contracts", tags=["룸메이트 계약서"])
api_router.include_router(delivery.router, prefix="/delivery", tags=["배달 파티"])
api_router.include_router(help.router, prefix="/help", tags=["헬프 요청"])
api_router.include_router(schools.router, prefix="/schools", tags=["학교"])
api_router.include_router(dormitories.router, prefix="/dormitories", tags=["기숙사 (레거시)"])
api_router.include_router(ws_chat.router, tags=["WebSocket 채팅"])
api_router.include_router(ws_delivery.router, tags=["WebSocket 배달 파티"])
api_router.include_router(room_bti.router, prefix="/room-bti", tags=["Room-BTI"])
api_router.include_router(admin.router, prefix="/admin", tags=["관리자 (개발용)"])

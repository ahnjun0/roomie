from fastapi import APIRouter

from app.api.v1.endpoints import auth, chats, dormitories, matching, reviews, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["인증"])
api_router.include_router(users.router, prefix="/users", tags=["사용자"])
api_router.include_router(matching.router, prefix="/matching", tags=["매칭"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["리뷰"])
api_router.include_router(chats.router, prefix="/chats", tags=["채팅"])
api_router.include_router(dormitories.router, prefix="/dormitories", tags=["기숙사"])

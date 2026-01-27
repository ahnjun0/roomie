"""
관리자용 API 엔드포인트

주의: 이 엔드포인트들은 개발/테스트 환경에서만 사용해야 합니다.
운영 환경에서는 비활성화하거나 인증을 추가하세요.
"""

import bcrypt
from cuid2 import cuid_wrapper
from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter()

# CUID2 생성기
cuid_generator = cuid_wrapper()


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


class DummyUserRequest(BaseModel):
    personas: list[dict]
    password: str = "test1234"


class DummyUserResponse(BaseModel):
    created: int
    skipped: int
    message: str


@router.post("/dummy-users", response_model=DummyUserResponse)
async def create_dummy_users(
    request: DummyUserRequest,
    db: Prisma = Depends(get_db),
):
    """
    더미 유저 일괄 생성 (개발/테스트용)

    personas 형식:
    ```json
    {
      "personas": [
        {
          "nickname": "테스트유저",
          "email": "test@kaist.ac.kr",
          "gender": "MALE",
          "nationality": "KOREAN",
          "age": 21,
          "studentId": 24,
          "lifestyle": { ... },
          "preference": { ... }
        }
      ],
      "password": "test1234"
    }
    ```
    """
    created_count = 0
    skipped_count = 0
    hashed_password = hash_password(request.password)

    # 학교 정보 캐싱 (domain -> school_id)
    schools = await db.school.find_many()
    school_map = {s.domain: s.id for s in schools if s.domain}

    for persona in request.personas:
        email = persona["email"]
        domain = email.split("@")[-1]
        school_id = school_map.get(domain)

        if not school_id:
            print(f"⚠️ 학교를 찾을 수 없음: {domain} (Skipping {email})")
            skipped_count += 1
            continue

        # 이미 존재하는 유저 확인
        existing = await db.user.find_unique(where={"email": email})
        if existing:
            skipped_count += 1
            continue

        try:
            # 유저 생성
            user = await db.user.create(
                data={
                    "id": cuid_generator(),
                    "email": email,
                    "nickname": persona.get("nickname"),
                    "password": hashed_password,
                    "gender": persona["gender"],
                    "nationality": persona["nationality"],
                    "age": persona["age"],
                    "studentId": persona["studentId"],
                    "schoolId": school_id
                }
            )

            # Lifestyle 생성
            if "lifestyle" in persona:
                await db.userlifestyle.create(
                    data={
                        "userId": user.id,
                        **persona["lifestyle"]
                    }
                )

            # Preference 생성
            if "preference" in persona:
                await db.userpreference.create(
                    data={
                        "userId": user.id,
                        **persona["preference"]
                    }
                )

            created_count += 1

        except Exception as e:
            print(f"유저 생성 실패 ({email}): {e}")
            skipped_count += 1
            continue

    return DummyUserResponse(
        created=created_count,
        skipped=skipped_count,
        message=f"{created_count}명 생성 완료, {skipped_count}명 스킵"
    )


@router.delete("/dummy-users")
async def delete_dummy_users(
    emails: list[str],
    db: Prisma = Depends(get_db),
):
    """더미 유저 삭제 (개발/테스트용)"""
    deleted_count = 0

    for email in emails:
        user = await db.user.find_unique(where={"email": email})
        if not user:
            continue

        # 관련 데이터 삭제
        await db.userlifestyle.delete_many(where={"userId": user.id})
        await db.userpreference.delete_many(where={"userId": user.id})
        await db.review.delete_many(where={"reviewerId": user.id})
        await db.review.delete_many(where={"targetId": user.id})
        await db.chatparticipant.delete_many(where={"userId": user.id})
        await db.chatmessage.delete_many(where={"senderId": user.id})
        await db.matchresult.delete_many(where={"userId": user.id})
        await db.matchresult.delete_many(where={"targetUserId": user.id})
        await db.user.delete(where={"id": user.id})
        deleted_count += 1

    return {"deleted": deleted_count, "message": f"{deleted_count}명 삭제 완료"}

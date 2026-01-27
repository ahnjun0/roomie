"""
더미 유저 데이터 생성 스크립트

사용법:
    # 로컬 DB에 직접 생성 (기본)
    python -m scripts.generate_dummy_users

    # 원격 서버 API를 통해 생성
    python -m scripts.generate_dummy_users --api http://hjxarchive.cloud:8000

    # 원격 DB에 직접 연결 (DATABASE_URL 환경변수 사용)
    DATABASE_URL="postgresql://..." python -m scripts.generate_dummy_users

    # 기존 더미 유저 삭제 후 재생성
    python -m scripts.generate_dummy_users --reset

    # 특정 개수만 생성
    python -m scripts.generate_dummy_users --limit 50

기능:
    - 학교별(KAIST, 부산대 등) 200명의 랜덤 페르소나 기반 더미 유저 생성
    - 각 유저별 lifestyle, preference 자동 생성
    - API 모드 / DB 직접 연결 모드 지원
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

import bcrypt
import httpx
from cuid2 import cuid_wrapper

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from prisma import Prisma
from scripts.dummy_personas import generate_random_personas

# CUID2 생성기
cuid_generator = cuid_wrapper()

# 기본 설정
DEFAULT_PASSWORD = "test1234"
WEIGHT_TOTAL = 60
WEIGHT_KEYS = [
    "weightNoise",
    "weightClean",
    "weightFood",
    "weightHabit",
    "weightTime",
    "weightTemp",
]


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def normalize_weights(preference: dict) -> dict:
    """Normalize weight sum to current game total."""
    weights = {key: int(preference.get(key, 0)) for key in WEIGHT_KEYS}
    total = sum(weights.values())
    if total == WEIGHT_TOTAL:
        return {**preference, **weights}
    if total == 0:
        weights["weightTime"] = WEIGHT_TOTAL
        return {**preference, **weights}

    scaled = {
        key: round(value * WEIGHT_TOTAL / total) for key, value in weights.items()
    }
    diff = WEIGHT_TOTAL - sum(scaled.values())
    if diff != 0:
        target_key = max(scaled, key=scaled.get)
        scaled[target_key] += diff
    return {**preference, **scaled}


async def create_dummy_users_db(db: Prisma, personas: list, school_id: int, reset: bool = False):
    """DB 직접 연결 모드로 특정 학교의 더미 유저 생성"""
    
    # reset 모드: 기존 더미 유저 삭제 (전체 대상)
    if reset:
        print("🗑️  기존 더미 유저 삭제 중...")
        # 닉네임이 'User_'로 시작하는 모든 유저 삭제
        dummy_users = await db.user.find_many(where={"nickname": {"startsWith": "User_"}})
        
        for user in dummy_users:
            await db.userlifestyle.delete_many(where={"userId": user.id})
            await db.userpreference.delete_many(where={"userId": user.id})
            await db.review.delete_many(where={"reviewerId": user.id})
            await db.review.delete_many(where={"targetId": user.id})
            await db.chatparticipant.delete_many(where={"userId": user.id})
            await db.chatmessage.delete_many(where={"senderId": user.id})
            await db.matchhistory.delete_many(where={"OR": [{"userAId": user.id}, {"userBId": user.id}]})
            await db.roommatecontract.delete_many(where={"OR": [{"userAId": user.id}, {"userBId": user.id}]})
            await db.matchresult.delete_many(where={"userId": user.id})
            await db.matchresult.delete_many(where={"targetUserId": user.id})
            await db.user.delete(where={"id": user.id})
        print("  ✓ 삭제 완료")

    created_count = 0
    skipped_count = 0

    for persona in personas:
        existing = await db.user.find_unique(where={"email": persona["email"]})
        if existing:
            skipped_count += 1
            continue

        user = await db.user.create(
            data={
                "id": cuid_generator(),
                "email": persona["email"],
                "nickname": persona["nickname"],
                "password": hash_password(DEFAULT_PASSWORD),
                "gender": persona["gender"],
                "nationality": persona["nationality"],
                "age": persona["age"],
                "studentId": persona["studentId"],
                "schoolId": school_id
            }
        )

        lifestyle_data = persona["lifestyle"]
        await db.userlifestyle.create(
            data={
                "userId": user.id,
                **lifestyle_data
            }
        )

        preference_data = normalize_weights(persona["preference"])
        await db.userpreference.create(
            data={
                "userId": user.id,
                **preference_data
            }
        )
        created_count += 1

    return created_count, skipped_count


async def create_dummy_users_api(base_url: str, personas: list):
    """HTTP API 모드로 더미 유저 생성 (admin 엔드포인트 사용)"""
    admin_url = f"{base_url.rstrip('/')}/api/v1/admin/dummy-users"

    async with httpx.AsyncClient(timeout=30.0) as client:
        print(f"🌐 서버에 연결 중: {base_url}")

        try:
            normalized = []
            for persona in personas:
                normalized.append(
                    {
                        **persona,
                        "preference": normalize_weights(persona["preference"]),
                    }
                )
            batch_size = 50
            total_created = 0
            
            for i in range(0, len(normalized), batch_size):
                batch = normalized[i:i+batch_size]
                response = await client.post(
                    admin_url,
                    json={"personas": batch, "password": DEFAULT_PASSWORD},
                    timeout=60.0
                )

                if response.status_code == 200:
                    result = response.json()
                    total_created += result.get('created', 0)
                    print(f"  Batch {i//batch_size + 1}: {result.get('created', 0)} created")
                else:
                    print(f"❌ 배치 전송 실패: {response.status_code} - {response.text}")

            print(f"\n✅ 완료: 총 {total_created}명 생성")
            
        except Exception as e:
            print(f"❌ API 호출 실패: {e}")


def parse_args():
    """CLI 인자 파싱"""
    parser = argparse.ArgumentParser(
        description="더미 유저 데이터 생성 스크립트"
    )
    parser.add_argument("--api", type=str, metavar="URL")
    parser.add_argument("--reset", action="store_true")
    parser.add_argument("--limit", type=int, metavar="N", default=200)
    return parser.parse_args()


async def main():
    """메인 실행 함수"""
    args = parse_args()

    db = Prisma()
    await db.connect()

    try:
        # 학교 목록 조회
        schools = await db.school.find_many(
            where={"name": {"in": ["KAIST", "부산대학교"]}},
            include={"dorms": True}
        )
        
        if not schools:
            print("❌ 대학교 데이터가 없습니다. 먼저 seeds.py를 실행하세요.")
            return

        print(f"👥 더미 유저 생성 시작... (학교: {[s.name for s in schools]})
")

        for school in schools:
            print(f"🏫 {school.name} ({school.domain}) 처리 중...")
            
            # 기숙사 목록 추출
            dorms = [d.name for d in school.dorms]
            
            # 페르소나 생성
            personas = generate_random_personas(
                count=args.limit, 
                email_domain=school.domain, 
                dorm_list=dorms
            )

            if args.api:
                # API 모드
                await create_dummy_users_api(args.api, personas)
            else:
                # DB 직접 연결
                c, s = await create_dummy_users_db(db, personas, school.id, reset=args.reset)
                print(f"  ✓ {school.name}: {c}명 생성, {s}명 스킵")
                # reset은 첫 번째 학교에서만 수행하도록 (아니면 매번 하면 이전 학교 거 지워짐)
                args.reset = False 

        print("\n✅ 모든 작업 완료")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
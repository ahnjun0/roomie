"""
초기 데이터 시드 스크립트
기숙사 정보 등 초기 데이터를 생성합니다.

Usage:
    cd apps/api
    python -m scripts.seed
"""

import asyncio

from prisma import Prisma


async def seed():
    db = Prisma()
    await db.connect()

    print("Seeding dormitories...")

    # 기숙사 데이터
    dormitories = [
        {"name": "성실관", "gender": "MALE", "capacity": 200},
        {"name": "진리관", "gender": "MALE", "capacity": 150},
        {"name": "봉사관", "gender": "MALE", "capacity": 180},
        {"name": "창조관", "gender": "FEMALE", "capacity": 200},
        {"name": "자유관", "gender": "FEMALE", "capacity": 150},
        {"name": "평화관", "gender": "FEMALE", "capacity": 180},
    ]

    for dorm in dormitories:
        existing = await db.dormitory.find_unique(where={"name": dorm["name"]})
        if not existing:
            await db.dormitory.create(data=dorm)
            print(f"  Created: {dorm['name']}")
        else:
            print(f"  Skipped (exists): {dorm['name']}")

    print("Seeding complete!")

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())

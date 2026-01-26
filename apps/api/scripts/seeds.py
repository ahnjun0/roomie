"""
데이터 시딩 스크립트

사용법:
    cd apps/api
    python -m scripts.seeds

기능:
    - initial_data.json에서 학교/기숙사 데이터 읽기
    - DB에 존재하지 않는 데이터만 INSERT
"""

import asyncio
import json
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from prisma import Prisma


async def load_initial_data() -> dict:
    """initial_data.json 파일 로드"""
    data_path = Path(__file__).parent.parent / "data" / "initial_data.json"

    if not data_path.exists():
        print(f"❌ 데이터 파일을 찾을 수 없습니다: {data_path}")
        return {}

    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


async def seed_schools_and_dorms(db: Prisma):
    """학교 및 기숙사 데이터 시딩"""
    data = await load_initial_data()

    if not data.get("schools"):
        print("❌ 시딩할 학교 데이터가 없습니다.")
        return

    schools_created = 0
    dorms_created = 0

    for school_data in data["schools"]:
        # 학교 존재 확인
        existing_school = await db.school.find_unique(
            where={"name": school_data["name"]}
        )

        if existing_school:
            school = existing_school
            print(f"  ✓ 학교 이미 존재: {school_data['name']}")
        else:
            # 학교 생성
            school = await db.school.create(
                data={
                    "name": school_data["name"],
                    "domain": school_data.get("domain")
                }
            )
            schools_created += 1
            print(f"  + 학교 생성: {school_data['name']}")

        # 기숙사 시딩
        for dorm_data in school_data.get("dorms", []):
            existing_dorm = await db.dorm.find_first(
                where={
                    "schoolId": school.id,
                    "name": dorm_data["name"]
                }
            )

            if existing_dorm:
                print(f"    ✓ 기숙사 이미 존재: {dorm_data['name']}")
            else:
                await db.dorm.create(
                    data={
                        "schoolId": school.id,
                        "name": dorm_data["name"],
                        "gender": dorm_data["gender"],
                        "roomType": dorm_data.get("roomType"),
                        "capacity": dorm_data.get("capacity")
                    }
                )
                dorms_created += 1
                print(f"    + 기숙사 생성: {dorm_data['name']} ({dorm_data['gender']})")

    print(f"\n✅ 시딩 완료: 학교 {schools_created}개, 기숙사 {dorms_created}개 생성")


async def main():
    """메인 실행 함수"""
    print("🌱 데이터 시딩 시작...\n")

    db = Prisma()
    await db.connect()

    try:
        await seed_schools_and_dorms(db)
    except Exception as e:
        print(f"❌ 시딩 중 오류 발생: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())

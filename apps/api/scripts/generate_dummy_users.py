"""
더미 유저 데이터 생성 스크립트

사용법:
    cd apps/api
    python -m scripts.generate_dummy_users

기능:
    - 20명의 페르소나 기반 더미 유저 생성
    - 각 유저별 lifestyle, preference 자동 생성
    - 매칭 점수 자동 계산
"""

import asyncio
import sys
from pathlib import Path

import bcrypt

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from prisma import Prisma


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# 20명의 페르소나 정의
PERSONAS = [
    # ========== 남성 (10명) ==========
    {
        "nickname": "조용한모범생",
        "email": "quiet_student@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 21,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "사랑관,소망관",
            "isSmoker": False,
            "sleepStart": 23,
            "sleepEnd": 7,
            "sleepHabits": "NONE",
            "noiseLevel": 1,  # 매우 예민
            "cleanLevel": 5,  # 결벽
            "foodLevel": 2,   # 취식 비선호
            "lightLevel": 1,  # 칼소등
            "tempLevel": 3,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 20,
            "weightClean": 15,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 0
        }
    },
    {
        "nickname": "새벽게이머",
        "email": "night_gamer@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "성실관,진리관",
            "isSmoker": False,
            "sleepStart": 28,  # 새벽 4시
            "sleepEnd": 12,
            "sleepHabits": "NONE",
            "noiseLevel": 5,   # 소음 OK
            "cleanLevel": 2,   # 청소 여유
            "foodLevel": 5,    # 야식 환영
            "lightLevel": 5,   # 불 켜도 OK
            "tempLevel": 2,    # 추위 탐
            "homeVisit": "RARELY"
        },
        "preference": {
            "weightNoise": 0,
            "weightClean": 5,
            "weightTime": 25,  # 취침 시간 중요
            "weightHabit": 0,
            "weightFood": 10,
            "weightLight": 10,
            "weightTemp": 0
        }
    },
    {
        "nickname": "운동광",
        "email": "fitness_lover@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 23,
        "studentId": 22,
        "lifestyle": {
            "dormNames": "사랑관,성실관",
            "isSmoker": False,
            "sleepStart": 22,  # 밤 10시
            "sleepEnd": 6,
            "sleepHabits": "NONE",
            "noiseLevel": 3,
            "cleanLevel": 4,
            "foodLevel": 3,
            "lightLevel": 2,
            "tempLevel": 4,    # 더위 탐
            "homeVisit": "BI_WEEKLY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 15,
            "weightTime": 15,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 5,
            "weightTemp": 0
        }
    },
    {
        "nickname": "외국인친구",
        "email": "foreign_friend@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "FOREIGNER",
        "age": 24,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "희망관,사랑관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "TALKING",  # 잠꼬대
            "noiseLevel": 3,
            "cleanLevel": 3,
            "foodLevel": 4,
            "lightLevel": 3,
            "tempLevel": 3,
            "homeVisit": "RARELY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 10,
            "weightFood": 5,
            "weightLight": 5,
            "weightTemp": 0,
            "prefNationality": "FOREIGNER"
        }
    },
    {
        "nickname": "코골이대장",
        "email": "snoring_king@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "진리관,성실관",
            "isSmoker": False,
            "sleepStart": 25,
            "sleepEnd": 9,
            "sleepHabits": "SNORING,TOSSING",
            "noiseLevel": 5,
            "cleanLevel": 3,
            "foodLevel": 4,
            "lightLevel": 4,
            "tempLevel": 3,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 0,
            "weightClean": 10,
            "weightTime": 15,
            "weightHabit": 0,  # 잠버릇 상관없음
            "weightFood": 10,
            "weightLight": 10,
            "weightTemp": 5
        }
    },
    {
        "nickname": "깔끔쟁이",
        "email": "clean_freak@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 21,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "소망관,사랑관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "NONE",
            "noiseLevel": 2,
            "cleanLevel": 5,  # 결벽
            "foodLevel": 1,   # 취식 절대 불가
            "lightLevel": 2,
            "tempLevel": 3,
            "homeVisit": "WEEKLY"
        },
        "preference": {
            "weightNoise": 5,
            "weightClean": 25,  # 청결 매우 중요
            "weightTime": 5,
            "weightHabit": 5,
            "weightFood": 10,
            "weightLight": 0,
            "weightTemp": 0
        }
    },
    {
        "nickname": "자취러",
        "email": "independence@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 25,
        "studentId": 21,
        "lifestyle": {
            "dormNames": "희망관",
            "isSmoker": True,  # 흡연자
            "sleepStart": 26,
            "sleepEnd": 10,
            "sleepHabits": "NONE",
            "noiseLevel": 4,
            "cleanLevel": 2,
            "foodLevel": 5,
            "lightLevel": 4,
            "tempLevel": 4,
            "homeVisit": "RARELY"
        },
        "preference": {
            "weightNoise": 0,
            "weightClean": 0,
            "weightTime": 20,
            "weightHabit": 0,
            "weightFood": 15,
            "weightLight": 10,
            "weightTemp": 5
        }
    },
    {
        "nickname": "동기사랑",
        "email": "same_year@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 20,
        "studentId": 25,
        "lifestyle": {
            "dormNames": "사랑관,소망관,성실관",
            "isSmoker": False,
            "sleepStart": 25,
            "sleepEnd": 9,
            "sleepHabits": "TOSSING",
            "noiseLevel": 3,
            "cleanLevel": 3,
            "foodLevel": 4,
            "lightLevel": 3,
            "tempLevel": 3,
            "homeVisit": "WEEKLY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 10,
            "weightFood": 5,
            "weightLight": 5,
            "weightTemp": 0,
            "prefStudentId": "SAME"
        }
    },
    {
        "nickname": "추위왕",
        "email": "cold_lover@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "진리관,사랑관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "NONE",
            "noiseLevel": 2,
            "cleanLevel": 4,
            "foodLevel": 3,
            "lightLevel": 2,
            "tempLevel": 1,  # 매우 추위 탐
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 10,
            "weightTime": 5,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 20  # 온도 매우 중요
        }
    },
    {
        "nickname": "더위왕",
        "email": "heat_lover@kaist.ac.kr",
        "gender": "MALE",
        "nationality": "KOREAN",
        "age": 23,
        "studentId": 22,
        "lifestyle": {
            "dormNames": "성실관,진리관",
            "isSmoker": False,
            "sleepStart": 25,
            "sleepEnd": 9,
            "sleepHabits": "GRINDING",  # 이갈이
            "noiseLevel": 3,
            "cleanLevel": 3,
            "foodLevel": 3,
            "lightLevel": 3,
            "tempLevel": 5,  # 매우 더위 탐
            "homeVisit": "BI_WEEKLY"
        },
        "preference": {
            "weightNoise": 5,
            "weightClean": 5,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 5,
            "weightLight": 0,
            "weightTemp": 20  # 온도 매우 중요
        }
    },

    # ========== 여성 (10명) ==========
    {
        "nickname": "새벽공부벌레",
        "email": "study_worm@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 21,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "지혜관,신뢰관",
            "isSmoker": False,
            "sleepStart": 27,  # 새벽 3시
            "sleepEnd": 10,
            "sleepHabits": "NONE",
            "noiseLevel": 1,   # 매우 예민
            "cleanLevel": 4,
            "foodLevel": 2,
            "lightLevel": 3,   # 스탠드 OK
            "tempLevel": 3,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 25,  # 소음 매우 중요
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 0
        }
    },
    {
        "nickname": "아침형인간",
        "email": "morning_person@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "아름관,지혜관",
            "isSmoker": False,
            "sleepStart": 22,  # 밤 10시
            "sleepEnd": 6,
            "sleepHabits": "NONE",
            "noiseLevel": 2,
            "cleanLevel": 5,
            "foodLevel": 2,
            "lightLevel": 1,
            "tempLevel": 3,
            "homeVisit": "WEEKLY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 15,
            "weightTime": 20,  # 취침 시간 중요
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 0
        }
    },
    {
        "nickname": "깔끔유학생",
        "email": "clean_intl@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "FOREIGNER",
        "age": 23,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "여울관,신뢰관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "NONE",
            "noiseLevel": 2,
            "cleanLevel": 5,
            "foodLevel": 3,
            "lightLevel": 2,
            "tempLevel": 3,
            "homeVisit": "RARELY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 20,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 5,
            "weightLight": 0,
            "weightTemp": 0
        }
    },
    {
        "nickname": "파티걸",
        "email": "party_girl@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 21,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "지혜관,아름관",
            "isSmoker": False,
            "sleepStart": 27,
            "sleepEnd": 11,
            "sleepHabits": "TALKING",
            "noiseLevel": 5,
            "cleanLevel": 2,
            "foodLevel": 5,
            "lightLevel": 5,
            "tempLevel": 4,
            "homeVisit": "BI_WEEKLY"
        },
        "preference": {
            "weightNoise": 0,
            "weightClean": 5,
            "weightTime": 20,
            "weightHabit": 0,
            "weightFood": 15,
            "weightLight": 10,
            "weightTemp": 0
        }
    },
    {
        "nickname": "조용한선배",
        "email": "quiet_senior@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 25,
        "studentId": 21,
        "lifestyle": {
            "dormNames": "여울관",
            "isSmoker": False,
            "sleepStart": 23,
            "sleepEnd": 7,
            "sleepHabits": "NONE",
            "noiseLevel": 1,
            "cleanLevel": 4,
            "foodLevel": 2,
            "lightLevel": 1,
            "tempLevel": 3,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 25,
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 0,
            "prefStudentId": "JUNIOR"
        }
    },
    {
        "nickname": "집순이",
        "email": "homebody@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "신뢰관,지혜관",
            "isSmoker": False,
            "sleepStart": 25,
            "sleepEnd": 9,
            "sleepHabits": "TOSSING",
            "noiseLevel": 2,
            "cleanLevel": 3,
            "foodLevel": 4,
            "lightLevel": 3,
            "tempLevel": 2,
            "homeVisit": "RARELY"
        },
        "preference": {
            "weightNoise": 15,
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 5,
            "weightLight": 5,
            "weightTemp": 0
        }
    },
    {
        "nickname": "본가러버",
        "email": "home_lover@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 20,
        "studentId": 25,
        "lifestyle": {
            "dormNames": "아름관,지혜관,신뢰관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "NONE",
            "noiseLevel": 3,
            "cleanLevel": 4,
            "foodLevel": 3,
            "lightLevel": 3,
            "tempLevel": 3,
            "homeVisit": "WEEKLY"
        },
        "preference": {
            "weightNoise": 10,
            "weightClean": 10,
            "weightTime": 10,
            "weightHabit": 10,
            "weightFood": 5,
            "weightLight": 5,
            "weightTemp": 0
        }
    },
    {
        "nickname": "알람무시녀",
        "email": "alarm_ignore@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 22,
        "studentId": 23,
        "lifestyle": {
            "dormNames": "지혜관,신뢰관",
            "isSmoker": False,
            "sleepStart": 26,
            "sleepEnd": 10,
            "sleepHabits": "SNORING",
            "noiseLevel": 5,
            "cleanLevel": 2,
            "foodLevel": 4,
            "lightLevel": 5,
            "tempLevel": 4,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 0,
            "weightClean": 5,
            "weightTime": 20,
            "weightHabit": 0,
            "weightFood": 10,
            "weightLight": 10,
            "weightTemp": 5
        }
    },
    {
        "nickname": "온도민감녀",
        "email": "temp_sensitive@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 21,
        "studentId": 24,
        "lifestyle": {
            "dormNames": "아름관,여울관",
            "isSmoker": False,
            "sleepStart": 24,
            "sleepEnd": 8,
            "sleepHabits": "NONE",
            "noiseLevel": 2,
            "cleanLevel": 4,
            "foodLevel": 3,
            "lightLevel": 2,
            "tempLevel": 1,  # 매우 추위 탐
            "homeVisit": "BI_WEEKLY"
        },
        "preference": {
            "weightNoise": 5,
            "weightClean": 5,
            "weightTime": 10,
            "weightHabit": 5,
            "weightFood": 0,
            "weightLight": 0,
            "weightTemp": 25  # 온도 매우 중요
        }
    },
    {
        "nickname": "흡연여성",
        "email": "smoking_woman@kaist.ac.kr",
        "gender": "FEMALE",
        "nationality": "KOREAN",
        "age": 24,
        "studentId": 22,
        "lifestyle": {
            "dormNames": "여울관",
            "isSmoker": True,  # 흡연자
            "sleepStart": 26,
            "sleepEnd": 10,
            "sleepHabits": "TALKING",
            "noiseLevel": 4,
            "cleanLevel": 3,
            "foodLevel": 4,
            "lightLevel": 4,
            "tempLevel": 3,
            "homeVisit": "MONTHLY"
        },
        "preference": {
            "weightNoise": 5,
            "weightClean": 10,
            "weightTime": 15,
            "weightHabit": 5,
            "weightFood": 10,
            "weightLight": 5,
            "weightTemp": 0
        }
    }
]


async def create_dummy_users(db: Prisma):
    """더미 유저 생성"""
    # KAIST 학교 조회
    school = await db.school.find_unique(where={"name": "KAIST"})
    if not school:
        print("❌ KAIST 학교 데이터가 없습니다. 먼저 seeds.py를 실행하세요.")
        return

    created_count = 0
    skipped_count = 0

    for persona in PERSONAS:
        # 이미 존재하는 유저 확인
        existing = await db.user.find_unique(where={"email": persona["email"]})
        if existing:
            print(f"  ✓ 이미 존재: {persona['nickname']}")
            skipped_count += 1
            continue

        # 유저 생성
        user = await db.user.create(
            data={
                "email": persona["email"],
                "nickname": persona["nickname"],
                "password": hash_password("test1234"),  # 공통 비밀번호
                "gender": persona["gender"],
                "nationality": persona["nationality"],
                "age": persona["age"],
                "studentId": persona["studentId"],
                "schoolId": school.id
            }
        )

        # Lifestyle 생성
        lifestyle_data = persona["lifestyle"]
        await db.userlifestyle.create(
            data={
                "userId": user.id,
                **lifestyle_data
            }
        )

        # Preference 생성
        preference_data = persona["preference"]
        await db.userpreference.create(
            data={
                "userId": user.id,
                **preference_data
            }
        )

        print(f"  + 생성: {persona['nickname']} ({persona['gender']})")
        created_count += 1

    print(f"\n✅ 완료: {created_count}명 생성, {skipped_count}명 스킵")


async def main():
    """메인 실행 함수"""
    print("👥 더미 유저 생성 시작...\n")

    db = Prisma()
    await db.connect()

    try:
        await create_dummy_users(db)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())

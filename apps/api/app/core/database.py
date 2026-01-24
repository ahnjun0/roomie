from prisma import Prisma

db = Prisma()


async def get_db() -> Prisma:
    """Prisma 클라이언트 의존성"""
    if not db.is_connected():
        await db.connect()
    return db

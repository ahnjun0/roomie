from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (Prisma uses DATABASE_URL from .env directly)
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/roomie"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8081"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

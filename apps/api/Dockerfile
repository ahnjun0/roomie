# 1. 베이스 이미지 설정 (2026년 기준 안정적인 파이썬 3.12 slim 버전 사용)
FROM python:3.12-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 필수 시스템 패키지 설치 (PostgreSQL 연결 등을 위해 필요한 경우)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# [추가] 5. Prisma 스키마 복사 및 클라이언트 생성
# 보통 prisma 폴더가 apps/api/prisma 에 있다고 가정합니다.
COPY prisma ./prisma
RUN prisma generate

# 5. 소스 코드 복사
COPY . .

# 6. FastAPI 실행 (8000 포트)
# --host 0.0.0.0은 외부 접속을 허용하기 위해 필수입니다.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

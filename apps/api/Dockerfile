# 1. 베이스 이미지 설정
FROM python:3.12-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 필수 시스템 패키지 설치
# Prisma 엔진 실행을 위해 openssl과 ca-certificates가 필요할 수 있습니다.
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 4. 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. [중요] Prisma 스키마 복사 및 클라이언트 생성
# npx 대신 python 모듈을 직접 호출하여 Python 환경에 클라이언트를 고정시킵니다.
COPY prisma ./prisma
RUN python -m prisma generate

# 6. 소스 코드 복사
COPY . .

# 7. 실행 명령
# 1) migrate deploy로 DB 구조를 먼저 맞추고
# 2) 성공할 경우에만 uvicorn을 실행합니다.
CMD ["sh", "-c", "python -m prisma migrate deploy && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

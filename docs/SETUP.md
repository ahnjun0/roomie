# 개발 환경 설정 가이드

## 사전 요구사항

### 공통
- Git

### 모바일 (React Native)
- Node.js 18+
- npm 또는 yarn
- Xcode 15+ (iOS 개발 시)
- Android Studio (Android 개발 시)
- CocoaPods (iOS)

### 백엔드 (FastAPI)
- Python 3.11+
- PostgreSQL 15+

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd roomie
```

### 2. 백엔드 설정

```bash
cd apps/api

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DATABASE_URL 등 설정

# Prisma 클라이언트 생성
prisma generate

# 데이터베이스 마이그레이션 (테이블 생성)
prisma db push

# 초기 데이터 시드 (기숙사 정보)
python -m scripts.seed

# 개발 서버 실행
uvicorn app.main:app --reload
```

API 서버가 `http://localhost:8000`에서 실행됩니다.

### 3. 모바일 설정

```bash
cd apps/mobile

# 의존성 설치
npm install

# iOS 의존성 설치 (macOS only)
cd ios
bundle install
bundle exec pod install
cd ..
```

### 4. 앱 실행

**iOS:**
```bash
npm run ios
# 또는
npx react-native run-ios
```

**Android:**
```bash
npm run android
# 또는
npx react-native run-android
```

## 개발 도구

### API 문서
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Prisma 관리

```bash
cd apps/api

# Prisma Studio (데이터 GUI 관리)
prisma studio

# 스키마 변경 후 마이그레이션
prisma db push

# 클라이언트 재생성
prisma generate
```

### 코드 품질

**백엔드:**
```bash
cd apps/api
ruff check .      # 린트 검사
ruff format .     # 코드 포맷팅
pytest            # 테스트 실행
```

**모바일:**
```bash
cd apps/mobile
npm run lint      # 린트 검사
npm test          # 테스트 실행
```

## 트러블슈팅

### iOS 빌드 오류
```bash
cd apps/mobile/ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
```

### Android 빌드 오류
```bash
cd apps/mobile/android
./gradlew clean
```

### Python 패키지 충돌
```bash
cd apps/api
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Prisma 연결 오류
```bash
# DATABASE_URL이 올바른지 확인
# PostgreSQL 서버가 실행 중인지 확인
# 데이터베이스가 생성되어 있는지 확인

# Windows에서 PostgreSQL 서비스 시작
net start postgresql-x64-15

# 또는 Docker 사용
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
```

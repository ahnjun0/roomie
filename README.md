# Roomie

> 나와 가장 잘 맞는 생활 동반자를 찾는 여정

단순한 정보 나열을 넘어, 사용자간의 우선순위와 가치관을 반영한 **데이터 기반 룸메이트 매칭 플랫폼**입니다.

## 프로젝트 구조

```
roomie/
├── apps/
│   ├── mobile/          # React Native 앱 (iOS/Android)
│   └── api/             # FastAPI 백엔드
├── docs/                # 프로젝트 문서
├── scripts/             # 공유 스크립트
├── .github/workflows/   # CI/CD 설정
└── Makefile             # 공통 명령어
```

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React Native (CLI) |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL |
| Auth | JWT + 학교 메일 인증 |

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Xcode (iOS 개발 시)
- Android Studio (Android 개발 시)

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd roomie

# 전체 의존성 설치
make install

# 개발 서버 실행
make dev
```

### 개별 실행

```bash
# 모바일 앱 실행
cd apps/mobile
npm install
npm run ios     # iOS
npm run android # Android

# API 서버 실행
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 팀 개발 가이드

### 브랜치 전략

- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드, 설정 변경
```

## 라이선스

Private - All Rights Reserved
